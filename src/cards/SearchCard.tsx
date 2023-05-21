import { AudioOutlined } from '@ant-design/icons';
import { Input, Select, Space } from 'antd';

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

const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
  },
];

function handleSearch(text: string) {}

export default function SearchCard() {
  return (
    <div className="workhome-card-search">
      <Space.Compact>
        <Select defaultValue="Zhejiang" options={options} />
        <Search
          placeholder="搜索网页"
          allowClear
          suffix={suffix}
          onSearch={handleSearch}
        />
      </Space.Compact>
    </div>
  );
}
