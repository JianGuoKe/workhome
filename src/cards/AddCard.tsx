import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import WorkSpaceContext from '../WorkSpaceContext';
import { useContext } from 'react';

export default function AddCard() {
  const context = useContext(WorkSpaceContext);
  return (
    <div className="workhome-card-add"> 
        <Button
          type="text"
          title="添加卡片"
          icon={<PlusOutlined />}
          onClick={context?.showCardModal}
        ></Button> 
    </div>
  );
}
