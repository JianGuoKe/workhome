import { Button } from 'antd';
import './Card.less';
import { SettingOutlined } from '@ant-design/icons';
import WorkSpaceContext from '../WorkSpaceContext';
import { useContext } from 'react';

export default function SettingCard() {
  const context = useContext(WorkSpaceContext)
  return ( 
      <Button
        className="workhome-card workhome-card-settings"
         type="text"
        title="桌面设置"
        icon={<SettingOutlined />}
        onClick={context?.showSettingsDrawer}
      ></Button> 
  );
}
