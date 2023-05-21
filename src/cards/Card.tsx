import {
  DownOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Modal,
  message,
  Form,
  Input,
  Radio,
  Dropdown,
  Space,
  MenuProps,
  Tooltip,
  Checkbox,
} from 'antd';
import { useContext, useEffect, useState } from 'react';
import WorkSpaceContext from '../WorkSpaceContext';
import { Card, db } from '../Data';
import { metadata } from '.';

export function CardHeader(props: {
  card: Card;
  isInCardAction: () => boolean;
}) {
  const context = useContext(WorkSpaceContext);
  function handleAddCard() {
    if (props.isInCardAction()) {
      return;
    }
    context?.showCardDesignerModal(props.card);
  }
  return (
    <Button
      type="text"
      title="设置"
      icon={<SettingOutlined />}
      onClick={handleAddCard}
    ></Button>
  );
}

export function CardDesignerModal(props: {
  card?: Card;
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
}) {
  const [form] = Form.useForm();
  const [selectType, setSelectType] = useState('text');

  const cardTypes = Object.keys(metadata);
  const propsMeta = metadata[selectType || 'text'].props!;
  const propNames = Object.keys(propsMeta || {});

  const onFinish = (values: any) => {
    const { type, ...config } = values;
    const { w, h } = metadata[selectType || 'text'].defaultProps || {};
    db.upsertCard(
      props.card?.id,
      config,
      type,
      undefined,
      undefined,
      undefined,
      w,
      h
    )
      .then(props.onOk)
      .catch((e) => message.error(e.message));
  };

  function handleOk() {
    form.submit();
  }

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(
      propNames.reduce((obj, name) => ({ ...obj, [name]: null }), {
        type: selectType,
      })
    );
  }, [selectType]);

  return (
    <Modal
      title={props.card ? '修改卡片' : '新增卡片'}
      {...props}
      okText="确定"
      cancelText="取消"
      onOk={handleOk}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={propNames.reduce(
          (obj, name) => ({ ...obj, [name]: null }),
          { type: selectType }
        )}
        onValuesChange={({ type }) => setSelectType(type)}
        requiredMark={'optional'}
      >
        <Form.Item label="卡片类型" name="type" required>
          <Radio.Group>
            {cardTypes.map((type) => (
              <Radio.Button key={type} value={type}>
                <Space>
                  {metadata[type].icon || metadata[type].title || type}
                </Space>
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
        {propNames.map((name) => (
          <Form.Item
            key={name}
            label={propsMeta[name].title || name}
            required={propsMeta[name].required}
            tooltip={propsMeta[name].tooltip}
          >
            {propsMeta[name].type === 'text' ? (
              <Input placeholder={'输入文本'} />
            ) : propsMeta[name].type === 'textarea' ? (
              <Input.TextArea placeholder={'输入文本'} />
            ) : propsMeta[name].type === 'radio' ? (
              <Radio.Group>
                {propsMeta[name].options?.map((it) => (
                  <Radio.Button key={it.value} value={it.value}>
                    {it.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            ) : propsMeta[name].type === 'checkbox' ? (
              <Checkbox.Group options={propsMeta[name].options} />
            ) : null}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}

export function useCard(): [() => boolean, object] {
  let isPressed = false;
  let isMoved = false;

  function isInCardAction() {
    if (isMoved) {
      isMoved = false;
      return true;
    }
    return false;
  }

  const cardProps = {
    onMouseDown: () => {
      isPressed = true;
    },
    onTouchStart: () => {
      isPressed = true;
    },
    onMouseMove: () => {
      if (isPressed) {
        isMoved = true;
      }
    },
    onTouchMove: () => {
      if (isPressed) {
        isMoved = true;
      }
    },
    onMouseUp: () => {
      isPressed = false;
    },
    onTouchEnd: () => {
      isPressed = false;
    },
    onTouchCancel: () => {
      isPressed = false;
    },
  };

  return [isInCardAction, cardProps];
}
