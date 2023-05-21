import { Button, Dropdown, MenuProps } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import WorkSpaceContext from '../WorkSpaceContext';
import { useContext } from 'react';

const items: MenuProps['items'] = [
  {
    label: <a href="https://note.jianguoke.cn" target='note'>工作空间</a>,
    key: 'note',
  },
  {
    label: <a href="https://calendar.jianguoke.cn" target='calendar'>日历</a>,
    key: 'calendar',
  },
  {
    label: <a href="https://code.jianguoke.cn" target='code'>编程</a>,
    key: 'code',
  },
];

export default function AppsCard() {
  const context = useContext(WorkSpaceContext);
  return (
    <Dropdown
      className="workhome-card-apps"
      menu={{ items }}
      trigger={['click']}
    >
      <Button icon={<AppstoreOutlined />} title='应用列表' type="text">JIANGUOKE</Button> 
    </Dropdown>
  );
}
