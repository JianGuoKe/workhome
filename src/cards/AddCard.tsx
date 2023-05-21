import { PlusOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { db } from '../Data';

export default function AddCard() {
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
    <div className="workhome-card-add">
      <Button
        type="text"
        title="添加卡片"
        icon={<PlusOutlined />}
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
        onClick={handleAddCard}
      ></Button>
    </div>
  );
}
