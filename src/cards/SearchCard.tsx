import { AudioOutlined } from '@ant-design/icons';
import { Input, Select, Space, message } from 'antd';
import { useState } from 'react';

const { Search } = Input;

const suffix = (
  <AudioOutlined
    style={{
      fontSize: 16,
      color: '#1890ff',
    }}
  />
);

// https://www.google.com/search?q=1222
// https://www.baidu.com/s?wd=4444

const DefaultOptions = [
  {
    value: 'google',
    label: 'Google',
    url: 'https://www.google.com/search?q=$query',
  },
  {
    value: 'baidu',
    label: '百度',
    url: 'https://www.baidu.com/s?wd=$query',
  },
];

export default function SearchCard(props: {
  options:
    | {
        value: string;
        label: string;
        url: string;
      }[]
    | string[];
}) {
  const opts = (props.options || []).map((opt) => {
    if (typeof opt === 'string') {
      return DefaultOptions.find((it) => it.value === opt) || ({} as any);
    } else {
      return opt;
    }
  });
  const [target, setTarget] = useState(opts[0]?.value);

  function handleSearch(text: string) {
    const opt = opts.find((it) => it.value === target);
    if (!opt) {
      return message.warning('未找到搜索引擎');
    }
    window.open(opt.url.replace('$query', text), target);
  }

  return (
    <div className="workhome-card-search">
      <Space.Compact>
        {opts.length > 1 && (
          <Select
            defaultValue={opts[0]?.value}
            onChange={(value) => setTarget(value)}
            options={opts}
          />
        )}
        <Search
          placeholder={'搜索' + (opts[0]?.title || '网页')}
          allowClear
          suffix={suffix}
          onSearch={handleSearch}
        />
      </Space.Compact>
    </div>
  );
}
