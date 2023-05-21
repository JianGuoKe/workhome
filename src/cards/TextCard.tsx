import { Input } from 'antd';
import { InputRef, TextAreaProps } from 'antd/es/input'; 
import { useRef } from 'react';

export default function TextCard(props: TextAreaProps) {
  const inputRef = useRef<InputRef>(null);

  return (
    <div className="workhome-card-text">
      <Input.TextArea 
        bordered={false} 
        placeholder='写点什么...'
        style={{  resize: 'none' }}
        ref={inputRef}
        onDoubleClick={()=>{
          inputRef.current!.focus({
            cursor: 'all',
          });
        }}
        {...props}
      />
    </div>
  );
}
