import { PlusOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import WorkSpaceContext from '../WorkSpaceContext';
import { useContext } from 'react';
import { db } from '../Data';

export default function AddCard() { 

  function handleAddCard(){
    db.addCard().catch(message.error)
  }

  return (
    <div className="workhome-card-add"> 
        <Button
          type="text"
          title="添加卡片"
          icon={<PlusOutlined />}
          onClick={handleAddCard}
        ></Button> 
    </div>
  );
}
