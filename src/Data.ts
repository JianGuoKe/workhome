import Dexie, { IndexableType, Table } from 'dexie';
import shortid from 'shortid';
import { loadPem } from './utils';
import { Layout } from 'react-grid-layout';

export interface WorkSpace {
  id?: number;
  title?: string;
  name: string;   // name 存储MFS文件名称
  layout: Layout[];
  cols: number;
  rowHeight: number;
  width: number;
  enabled: boolean;
  reason?: string;
  createAt: Date;
  updateAt: Date;
  deleteAt?: Date;
  syncAt?: Date;    // hash刷新时间
  checkAt?: Date,
  isActived: boolean;
  activedAt?: Date;
  hash?: string,  // 同步hash 
  root?: string
}


export interface Card {
  id?: number;
  props: string;
  wsId?: number;
  name?: string;        // name 存储MFS文件名称
  enabled: boolean,
  createAt: Date;
  updateAt?: Date;
  deleteAt?: Date;
  syncAt?: Date;
  hash?: string,  // 同步hash 
  force?: boolean,  // 本地为主更新 
  reason?: 'nokey' | 'cidconflict' | 'noworkspace' | 'success',
  checkAt?: Date;  // 同步检查时间 
}

export interface Key {
  id?: number;
  name: string;
  pubKey: string;
  priKey: string;
  enabled: boolean;
  createAt: Date;
  deleteAt?: Date;
}

export interface Node {
  url: string;
  createAt: Date
}

export interface Option {
  id?: number;
  workSpaceVisible?: string;
  syncMin?: number  // 同步时间间隔
}

export function getDateNow() {
  // TODO 时间服务器
  return new Date();
}

export class WorkHomeDexie extends Dexie {
  // 'workspaces' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  workspacs!: Table<WorkSpace>;
  cards!: Table<Card>;
  keys!: Table<Key>;
  options!: Table<Option>;
  nodes!: Table<Node>;

  getActaiveNode() {
    return this.nodes.toCollection().first();
  }

  getActiveWorkSpace() {
    return this.workspacs.filter(it => it.isActived).first();
  }

  getOptions() {
    return this.options.toCollection().first();
  }



  getActiveKey() {
    return this.keys.filter(key => key.enabled).first();
  }

  constructor() {
    super('jianguoke.workhome');
    this.version(20).stores({
      workspacs: '++id, name, checkAt',// Primary key and indexed props
      cards: '++id, name, wsId, content,  updateAt, syncAt, checkAt',
      keys: '++id, name',
      options: '++id',
      nodes: 'url',
    });
  }

  async init() {
    if (await this.nodes.count() <= 0) {
      await this.nodes.add({
        url: 'https://jianguoke.cn/ipfs',
        createAt: getDateNow()
      })
    }
    if (await this.options.count() <= 0) {
      await this.options.add({
        syncMin: 10
      })
    }
    if (await this.workspacs.count() <= 0) {
      await this.createWorkSpace('默认桌面');
    }
  }


  async setWorkSpacEWidth(workSpaceWidth: number) {
    const opt = await this.getOptions();
    if (!opt) {
      return;
    }
    await this.options.update(opt.id!, {
      workSpaceWidth
    });
  }

  async setWorkSpacEVisible(workSpaceVisible: boolean) {
    const opt = await this.getOptions();
    await this.options.update(opt!.id!, {
      workSpaceVisible
    });
  }

  async setMenuWidth(menuWidth: number) {
    const opt = await this.getOptions();
    await this.options.update(opt!.id!, {
      menuWidth
    });
  }

  async createWorkSpace(title: string) {
    const currentNode = await this.getActaiveNode();
    if (!currentNode?.url) {
      throw new Error('IPFS接入节点未知,需要再设置中添加')
    }
    const id = await this.workspacs.add({
      ...currentNode,
      name: shortid.generate(),
      enabled: true,
      createAt: getDateNow(),
      updateAt: getDateNow(),
      checkAt: new Date(0),
      isActived: false,
      title,
      layout: [],
      cols: 12,
      rowHeight: 30,
      width: 1200,
    });
    await this.changeWorkSpace(id);
  }

  async addWorkSpace(name: string) {
    const currentNode = await this.getActaiveNode();
    if (!currentNode?.url) {
      throw new Error('IPFS接入节点未知,需要再设置中添加')
    }
    const id = await this.workspacs.add({
      ...currentNode,
      name,
      enabled: true,
      createAt: getDateNow(),
      updateAt: getDateNow(),
      checkAt: new Date(0),
      isActived: false,
      layout: [],
      cols: 12,
      rowHeight: 30,
      width: 1200,
    });
    await this.changeWorkSpace(id);
  }

  async changeWorkSpace(id: IndexableType) {
    const workSpaces: WorkSpace[] = [];
    await this.workspacs.each(workspace => {
      workspace.isActived = workspace.id === id;
      workSpaces.push(workspace);
    });
    await this.workspacs.bulkPut(workSpaces);
  }

  async updateWorkSpaceTitle(workspace: WorkSpace) {
    await this.workspacs.update(workspace, {
      title: workspace.title
    })
  }

  async updateWorkSpaceLayout(workspace: WorkSpace, layout: Layout[]) {
    await this.workspacs.update(workspace, {
      layout
    })
  }

  async deleteWorkSpace(id: IndexableType) {
    const activeWorkSpacE = await this.getActiveWorkSpace();
    const needChange = activeWorkSpacE?.id === id;
    // 逻辑删除，需要同步ipfs后彻底删除
    await this.workspacs.update(id, {
      enabled: false,
      updateAt: getDateNow(),
      deleteAt: getDateNow(),
      checkAt: new Date(0),
    });
    const workSpaces = this.workspacs.filter(workspace => workspace.enabled);
    if (needChange && await workSpaces.count() > 0) {
      await this.workspacs.update((await workSpaces.first())!.id!, {
        isActived: true
      });
    }
  }



  async addCard(props: string, name: string, wsId: number, hash?: string) {
    await this.cards.add({
      props,
      name,
      hash,
      wsId,
      enabled: true,
      createAt: getDateNow(),
      updateAt: getDateNow(),
      syncAt: hash ? getDateNow() : undefined,
    })
  }

  async upsertCard(props: string, id?: IndexableType, hash?: string) {
    let note = await this.cards.filter(it => it.id === id).first();
    if (!note) {
      const activeWorkSpacE = await this.getActiveWorkSpace();
      if (!activeWorkSpacE) {
        throw new Error('桌面不存在, 请先创建一个桌面');
      }
      note = {
        props,
        enabled: true,
        wsId: activeWorkSpacE?.id!,
        createAt: getDateNow(),
        updateAt: getDateNow(),
        hash,
        checkAt: new Date(0),
        syncAt: hash ? getDateNow() : undefined
      };
      const id = await this.cards.add(note);
    } else {
      await this.cards.update(note, {
        props,
        updateAt: getDateNow(),
        hash: hash || note.hash,
        checkAt: new Date(0),
        syncAt: hash ? getDateNow() : note.syncAt
      });
    }
  }

  async deleteCard(id: IndexableType) {
    const note = await this.cards.get(id);
    if (!note) {
      return;
    }
    if (note.hash) {
      // 逻辑删除，需要同步ipfs后彻底删除
      await this.cards.update(id, {
        enabled: false,
        updateAt: getDateNow(),
        deleteAt: getDateNow(),
        checkAt: new Date(0),
      });
    } else {
      await this.cards.delete(id);
    }
  }

  async addKey(priKey: string, pubKey: string) {
    const exists = await this.keys.filter(key => loadPem(key.priKey, false).private === loadPem(priKey, false).private).first();
    if (exists) {
      throw new Error('秘钥已经存在');
    }
    await this.keys.add({
      name: shortid.generate(),
      priKey,
      pubKey,
      enabled: true,
      createAt: getDateNow()
    })
  }

  async deleteKey(id: IndexableType) {
    await this.keys.delete(id);
  }

  async resyncNote(note: Card | IndexableType) {
    await this.cards.update(note, {
      reason: '',
      checkAt: new Date(0)
    });
  }

  async checkCard(note: Card) {
    await this.cards.update(note, {
      checkAt: getDateNow()
    });
  }

  async syncCard(note: Card) {
    if (!note.enabled && note.reason === 'success') {
      return await this.cards.delete(note.id!);
    }
    await this.cards.update(note, {
      name: note.name,
      hash: note.hash,
      wsId: note.wsId,
      reason: note.reason,
      syncAt: note.reason === 'success' ? getDateNow() : note.syncAt
    });
  }

  async resyncWorkSpace(workspace: WorkSpace) {
    await this.workspacs.update(workspace, {
      reason: '',
      checkAt: new Date(0)
    });
  }

  async checkWorkSpace(workspace: WorkSpace) {
    await this.workspacs.update(workspace, {
      checkAt: getDateNow()
    });
  }

  async syncWorkSpace(workspace: WorkSpace) {
    if (!workspace.enabled && workspace.reason === 'success') {
      await this.workspacs.delete(workspace.id!);
      const ids = await this.cards.where('wsId').equals(workspace.id!).primaryKeys();
      console.log('remove notes...', ids)
      await this.cards.bulkDelete(ids);
      return
    }
    await this.workspacs.update(workspace, {
      hash: workspace.hash,
      reason: workspace.reason,
      root: workspace.root,
      syncAt: workspace.reason === 'success' ? getDateNow() : workspace.syncAt
    });
  }
}

export const db = new WorkHomeDexie(); 