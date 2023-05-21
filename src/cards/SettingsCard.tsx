import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import WorkSpaceContext from '../WorkSpaceContext';
import { useContext } from 'react';

export default function SettingsCard() {
  const context = useContext(WorkSpaceContext);
  return (
    <div className="workhome-card-settings">
      <Button
        type="text"
        title="桌面设置" 
        icon={<SettingOutlined />}
        onClick={context?.showSettingsDrawer}
      ></Button>
    </div>
  );
}
