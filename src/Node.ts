import { create, IPFSHTTPClient } from 'ipfs-http-client'
import { WorkSpace, db, getDateNow, Key } from './Data';
import { liveQuery } from 'dexie';
import dayjs from 'dayjs';
import { MFSEntry } from 'ipfs-core-types/dist/src/files';
import crypto from 'crypto';
import shortid from 'shortid';
import { Buffer } from 'buffer';
import { formatStringLen } from './utils';
window.Buffer = Buffer;

let ipfs: IPFSHTTPClient | undefined;
export function start() {
  liveQuery(() => db.nodes.toCollection().first()).subscribe(node => {
    if (node && node.url) {
      ipfs = create({ url: node.url });
      startEnabled = true;
      startSync();
    } else {
      ipfs = undefined;
      startEnabled = false;
    }
  });
  liveQuery(async () => { 
    return await db.cards.filter(card => card.checkAt?.toString() === new Date(0).toString()  ).count();
  }).subscribe(async count => {
    if (count > 0) {
      startSync();
    }
  })
}

async function findKey(name: string) {
  return await db.keys.get({ name });
}

async function checkSync() {
  console.log('check sync...');
  const key = await db.getActiveKey();
  const options = await db.getOptions();
  // 30分钟内同步一次
  const lastAt = dayjs(getDateNow()).subtract(options?.syncMin || 10, 'minute').toDate();
  // 从小到大时间顺序同步数据
  const upnotes = await db.cards.orderBy('checkAt').filter(card =>
    !!card.wsId &&
    (!card.syncAt || card.syncAt < card.updateAt!) &&
    (!card.checkAt || card.checkAt < lastAt)
  ).toArray();
  console.debug('check notes...', upnotes.length);
  const changedworkspaces: WorkSpace[] = [];
  for (const card of upnotes) {
    console.debug('check card id...', card.id)
    await db.checkCard(card);
    const workspace = await db.workspacs.get(card.wsId!);
    if (workspace) {
      if (key) {
        card.name = card.name || shortid.generate();
        try {
          if (!card.enabled) {
            console.debug('delete file...', '/' + workspace.name + '/' + card.name);
            await deleteFile('/' + workspace.name + '/' + card.name, card.hash);
          } else {
            console.debug('write file...', '/' + workspace.name + '/' + card.name);
            card.hash = await uploadFileEncrypted(card.props, '/' + workspace.name + '/' + card.name, key, card.hash, card.force);
          }
          card.reason = 'success';
          changedworkspaces.push(workspace);
        } catch (err: any) {
          card.reason = err.message;
        }
      } else {
        card.reason = 'nokey';
      }
    } else {
      card.wsId = undefined;
      card.reason = 'noworkspace';
    }
    await db.syncCard(card);
  }
  // 更新workspace的hash
  for (const workspace of changedworkspaces) {
    const stat = await ipfs!.files.stat('/' + workspace.name);
    workspace.hash = stat.cid.toString();
    await db.syncWorkSpace(workspace);
  }
  // 拉取服务器文件
  const upworkspaces = await db.workspacs.orderBy('checkAt').filter(workspace => (!workspace.checkAt || workspace.checkAt < lastAt)).toArray();
  console.debug('check workspaces...', upworkspaces.length)
  for (const workspace of upworkspaces) {
    console.debug('check workspace id...', workspace.id)
    await db.checkWorkSpace(workspace);
    try {
      let reason;
      if (!workspace.enabled) {
        console.debug('delete folder...', '/' + workspace.name);
        await deleteFile('/' + workspace.name, workspace.hash);
      } else {
        const stat = await ipfs!.files.stat('/' + workspace.name);
        if (stat.cid.toString() !== workspace.hash) {
          const files = await getUploadedFiles('/' + workspace.name);
          // 删除本地
          const removes = await db.cards.where('wsId').equals(workspace.id!).filter(card =>
            files.every(file => file.path !== ('/' + workspace.name + '/' + card.name) &&
              (card.syncAt && card.syncAt > card.updateAt!)));
          const pks = await removes.primaryKeys();
          console.debug('delete card...', pks);
          await db.cards.bulkDelete(pks);
          // 新增更新本地
          for (const file of files) {
            let card;
            try {
              card = await db.cards.get({ name: file.path.split('/')[2], wsId: workspace.id! });
              if (!card) {
                // 新增
                console.debug('add card...', file.path);
                await db.addCard(await downloadFileEncrypted(file.path, findKey), file.path.split('/')[2], workspace.id!, file.cid.toString());
              } else {
                if (card.updateAt) {
                  if (card.syncAt && card.syncAt >= card.updateAt && card.hash !== file.cid.toString()) {
                    // 本地没有修改以服务器为主
                    console.debug('update card...', card.id, file.path);
                    await db.upsertCard(await downloadFileEncrypted(file.path, findKey), card.id);
                  }
                } else {
                  // 走note的保存机制
                }
              }
            } catch (err: any) {
              if (card) {
                await db.syncCard(card);
              }
              reason = err.message;
            }
          }
          workspace.hash = stat.cid.toString();
        }
        // 更新本地hash
        const statRoot = await ipfs!.files.stat('/');
        workspace.root = statRoot.cid.toString();
        console.debug('update workspace...', workspace.id, statRoot.cid.toString());
      }
      workspace.reason = reason || 'success';
    } catch (err: any) {
      let reason;
      if (err.message === 'file does not exist') {
        if (!workspace.enabled) {
          reason = 'success';
        } else if (workspace.syncAt) {
          reason = err.message;
        }
      } else {
        reason = err.message;
      }
      workspace.reason = reason;
    }
    await db.syncWorkSpace(workspace);
  }
  console.log('check sync end.');
}

let startEnabled = true;
let startTimer: any;
let isRunning = false;
export function startSync(timeout = 0) {
  if (!startEnabled) {
    return;
  }
  if (isRunning) {
    return;
  }
  if (startTimer) {
    clearTimeout(startTimer);
    startTimer = null;
  }
  startTimer = setTimeout(() => {
    isRunning = true;
    checkSync().then(() => {
      isRunning = false;
      startSync(60 * 1000)
    }).catch(e => {
      console.error(e);
      isRunning = false;
      startSync(5 * 60 * 1000);
    })
  }, timeout);
}


////////////////////////////////
//////////// IPFS //////////////
////////////////////////////////

export async function deleteFile(ipfspath: string, cid?: string, force = false) {
  let stat = await ipfs!.files.stat(ipfspath);
  if (!force && cid && stat.cid.toString() !== cid) {
    throw new Error('cidconflict')
  }
  await ipfs!.files.rm(
    ipfspath,
    { recursive: true }
  );
}

export async function uploadFileEncrypted(buff: string, ipfspath: string, keyPair: Key, cid?: string, force = false) {
  try {
    const key = crypto.randomBytes(16).toString('hex'); // 16 bytes -> 32 chars
    const iv = crypto.randomBytes(8).toString('hex');   // 8 bytes -> 16 chars
    const ekey = encryptRSA(key, keyPair.pubKey); // 32 chars -> 684 chars
    const ebuff = encryptAES(Buffer.from(buff), key, iv);

    const content = Buffer.concat([ // headers: encrypted key and IV (len: 700=684+16)
      Buffer.from(formatStringLen(keyPair.name, 10), 'utf8'),
      Buffer.from(ekey, 'utf8'),   // char length: 684
      Buffer.from(iv, 'utf8'),     // char length: 16
      Buffer.from(ebuff, 'utf8')
    ])
    let stat;
    try {
      stat = await ipfs!.files.stat(ipfspath);
    } catch (err: any) {
      if (err.message !== 'file does not exist') {
        throw err;
      }
    }
    if (!force && cid && stat?.cid.toString() !== cid) {
      throw new Error('cidconflict')
    }
    await ipfs!.files.write(
      ipfspath,
      content,
      { create: true, parents: true }
    );
    stat = await ipfs!.files.stat(ipfspath);

    console.log('ENCRYPTION --------')
    console.log('key:', key, 'iv:', iv, 'ekey:', ekey.length)
    console.log('contents:', buff.length, 'encrypted:', ebuff.length)
    console.log('cid:', stat.cid.toString())
    console.log(' ')

    return stat.cid.toString();

  } catch (err) {
    console.log(err)
    throw err;
  }
}

async function toArray(asyncIterator: AsyncIterable<MFSEntry>) {
  const arr = [];
  for await (const i of asyncIterator) {
    arr.push(i);
  }
  return arr;
}

export async function downloadFileEncrypted(ipfspath: string, findKey: (keyName: string) => Promise<Key | undefined>) {
  try {
    let file_data = await ipfs!.files.read(ipfspath)

    let edata = []
    for await (const chunk of file_data)
      edata.push(chunk)
    const buff = Buffer.concat(edata)

    const keyPair = await findKey(buff.slice(0, 10).toString('utf8').trim());
    if (!keyPair) {
      throw new Error('nokey');
    }
    const key = decryptRSA(buff.slice(10, 694).toString('utf8'), keyPair.priKey)
    const iv = buff.slice(694, 710).toString('utf8')
    const econtent = buff.slice(710).toString('utf8')
    const ebuf = Buffer.from(econtent, 'hex')
    const content = decryptAES(ebuf, key, iv)

    console.log(' ')
    console.log('DECRYPTION --------')
    console.log('key:', key, 'iv:', iv)
    console.log('contents:', content.length, 'encrypted:', econtent.length)
    console.log('downloaded:', edata.length)

    return content

  } catch (err) {
    console.log(err)
    throw err;
  }
}

export async function getUploadedFiles(ipfspath: string) {
  let files: { path: string; size: number; cid: string; }[] = []
  const arr = await toArray(ipfs!.files.ls(ipfspath))
  for (let file of arr) {
    if (file.type === 'directory') {
      const inner = await getUploadedFiles(ipfspath + '/' + file.name + '/')
      files = files.concat(inner)
    } else {
      files.push({
        path: ipfspath + '/' + file.name,
        size: file.size,
        cid: file.cid.toString()
      })
    }
  }
  return files
}

function encryptAES(buffer: Buffer, secretKey: string, iv: string) {
  const cipher = crypto.createCipheriv('aes-256-ctr', secretKey, iv);
  const data = cipher.update(buffer);
  const encrypted = Buffer.concat([data, cipher.final()]);
  return encrypted.toString('hex')
}

function decryptAES(buffer: Buffer, secretKey: string, iv: string) {
  const decipher = crypto.createDecipheriv('aes-256-ctr', secretKey, iv);
  const data = decipher.update(buffer)
  const decrpyted = Buffer.concat([data, decipher.final()]);
  return decrpyted.toString('utf8');
}

function encryptRSA(toEncrypt: string, publicKey: string) {
  const buffer = Buffer.from(toEncrypt, 'utf8')
  const encrypted = crypto.publicEncrypt(publicKey, buffer)
  return encrypted.toString('base64')
}

function decryptRSA(toDecrypt: string, privateKey: string) {
  const buffer = Buffer.from(toDecrypt, 'base64')
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey.toString(),
      passphrase: '',
    },
    buffer,
  )
  return decrypted.toString('utf8')
}
