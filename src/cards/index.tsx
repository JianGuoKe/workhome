import AppsCard from './AppsCards';
import SettingsCard from './SettingsCard';
import TextCard from './TextCard';
import './style.less';
import AddCard from './AddCard';
import {
  AppstoreOutlined,
  CalendarOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import CalendarCard from './CalendarCard';
import EmptyCard from './EmptyCard';
import SearchCard from './SearchCard';
import StatisticCard from './StatisticCard';

export const components: { [key: string]: any } = {
  text: TextCard,
  settings: SettingsCard,
  apps: AppsCard,
  add: AddCard,
  statistic: StatisticCard,
  empty: EmptyCard,
  search: SearchCard,
  calendar: CalendarCard,
};

export const metadata: {
  [key: string]: {
    title: string;
    icon?: any;
    props?: {
      [key: string]: {
        type: 'text' | 'textarea' | 'number' | 'radio' | 'checkbox';
        title?: string;
        tooltip?: string;
        required?: boolean;
        options?: { value: string; label: string }[];
      };
    };
    defaultProps?: any;
  };
} = {
  text: {
    title: '文本卡片',
    icon: <EditOutlined />,
    props: {
      value: {
        title: '文本',
        type: 'textarea',
      },
    },
  },
  settings: {
    title: '设置按钮',
    icon: <SettingOutlined />,
  },
  apps: {
    title: '应用列表',
    icon: <AppstoreOutlined />,
  },
  add: {
    title: '添加卡片',
    icon: <PlusOutlined />,
  },
  search: {
    title: '搜索网页',
    icon: <SearchOutlined />,
    props: {
      options: {
        title: '搜索引擎',
        tooltip: '选择经常使用的搜索引擎',
        type: 'checkbox',
        options: [
          {
            value: 'baidu',
            label: '百度',
          },
          {
            value: 'google',
            label: 'Google',
          } 
        ],
      },
    },
    defaultProps: {
      w: 4,
      h: 1,
    },
  },
  calendar: {
    title: '日历卡片',
    icon: <CalendarOutlined />,
    defaultProps: {
      w: 4,
      h: 8,
    },
  },
  statistic: {
    title: '统计卡片',
    defaultProps: {
      w: 2,
      h: 3,
    },
  },
  empty: {
    title: '空卡片',
    props: {
      text: {
        title: '占位文本',
        type: 'text',
      },
    },
  },
};
