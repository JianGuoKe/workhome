import { Button, Dropdown, MenuProps, Space, message } from 'antd';
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons';
import WorkSpaceContext from '../WorkSpaceContext';
import { useContext } from 'react';
import { db } from '../Data';
import { useCard } from './Card';

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
  const [isInCardAction, cardProps] = useCard();
  const context = useContext(WorkSpaceContext);

  function handleAddCard() {
    if (isInCardAction()) {
      return;
    }
    context?.showCardDesignerModal();
  }
  return (
    <Space className="workhome-card-apps" size={2} {...cardProps}>
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
