import { Input } from 'antd';
import { TextAreaProps } from 'antd/es/input'; 

export default function TextCard(props: TextAreaProps) {
  return (
    <div className="workhome-card-text">
      <Input.TextArea 
        bordered={false} 
        placeholder='写点什么...'
        style={{  resize: 'none' }}
        {...props}
      />
    </div>
  );
}
