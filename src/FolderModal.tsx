import { Button, InputRef, Modal, Input, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { db } from './Data';

export default function ({
  open,
  mode,
  onClose,
}: {
  mode: string; //  'add' | 'create'
  open: boolean;
  onClose: () => void;
}) {
  const inputPriRef = useRef<InputRef>(null);
  const [newMode, setMode] = useState(mode);
  const [hash, setHash] = useState('');

  useEffect(() => {
    setMode(mode);
  }, [mode]);

  async function addNewHash() {
    try {
      await db.createWorkSpace('');
      onClose();
    } catch (err) {
      message.error((err as Error).message);
    }
  }

  async function addHash() {
    try {
      await db.addWorkSpace(hash);
      onClose();
    } catch (err) {
      message.error((err as Error).message);
    }
  }

  const footer = [];
  if (newMode === 'add') {
    footer.push(
      <Button key="new" onClick={addNewHash}>
        创建新桌面
      </Button>,
      <Button key="back" onClick={onClose}>
        取消
      </Button>,
      <Button key="submit" type="primary" onClick={addHash}>
        确定添加
      </Button>
    );
  }
  if (newMode === 'create') {
    footer.push(
      <Button key="submit" onClick={() => setMode('add')}>
        添加桌面
      </Button>,
      <Button key="back" onClick={onClose}>
        取消
      </Button>,
      <Button key="new" type={'primary'} onClick={addNewHash}>
        创建新桌面
      </Button>
    );
  }
  return (
    <Modal
      open={open}
      title="添加工作空间"
      onOk={addNewHash}
      onCancel={onClose}
      footer={footer}
    >
      <p>添加一个去中心化网络(IPFS)上的桌面作为当前工作空间</p>
      {newMode === 'add' && (
        <Input
          ref={inputPriRef}
          placeholder="桌面名称"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          onFocus={() =>
            inputPriRef.current!.focus({
              cursor: 'all',
            })
          }
        />
      )}
    </Modal>
  );
}
