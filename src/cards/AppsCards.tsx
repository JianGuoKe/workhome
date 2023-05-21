import { Button, Dropdown, MenuProps, Space, message } from 'antd';
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons';
import WorkSpaceContext from '../WorkSpaceContext';
import { useContext } from 'react';
import { db } from '../Data';

const items: MenuProps['items'] = [
  {
    label: (
      <a href="https://note.jianguoke.cn" target="note">
        记事本
      </a>
    ),
    key: 'note',
  },
  {
    label: (
      <a href="https://calendar.jianguoke.cn" target="calendar">
        日历
      </a>
    ),
    key: 'calendar',
  },
  {
    label: (
      <a href="https://code.jianguoke.cn" target="code">
        编程
      </a>
    ),
    key: 'code',
  },
];

export default function AppsCard() {
  let isPressed = false;
  let isMoved = false;

  function handleAddCard() {
    if (isMoved) {
      isMoved = false;
      return;
    }
    db.addCard().catch((e) => message.error(e.message));
  }
  return (
    <Space
      className="workhome-card-apps"
      size={2}
      onMouseDown={() => {
        isPressed = true;
      }}
      onTouchStart={() => {
        isPressed = true;
      }}
      onMouseMove={(e) => {
        if (isPressed) {
          isMoved = true;
        }
      }}
      onTouchMove={() => {
        if (isPressed) {
          isMoved = true;
        }
      }}
      onMouseUp={() => {
        isPressed = false;
      }}
      onTouchEnd={() => {
        isPressed = false;
      }}
      onTouchCancel={() => {
        isPressed = false;
      }}
    >
      <Dropdown menu={{ items }} trigger={['click']}>
        <Button icon={<AppstoreOutlined />} title="坚果壳桌面" type="text">
          JIANGUOKE
        </Button>
      </Dropdown>
      <Button
        className="workhome-card-apps-add"
        icon={<PlusOutlined />}
        title="添加卡片"
        type="text"
        onClick={handleAddCard}
      ></Button>
    </Space>
  );
}
