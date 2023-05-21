import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd'; 
import { useCard } from './Card';
import { useContext } from 'react';
import WorkSpaceContext from '../WorkSpaceContext';

export default function AddCard() {
  const [isInCardAction, cardProps] = useCard();
  const context = useContext(WorkSpaceContext);

  function handleAddCard() {
    if (isInCardAction()) {
      return;
    }
    context?.showCardDesignerModal() 
  }

  return (
    <div
      className="workhome-card-add"
      {...cardProps}
    >
      <Button
        type="text"
        title="添加卡片"
        icon={<PlusOutlined />}
        onClick={handleAddCard}
      ></Button>
    </div>
  );
}
