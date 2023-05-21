import AppsCard from './AppsCards';
import SettingsCard from './SettingsCard';
import TextCard from './TextCard';
import './Card.less';
import AddCard from './AddCard';

export const components: { [key: string]: any } = {
  text: TextCard,
  settings: SettingsCard,
  apps: AppsCard,
  add: AddCard
};

export const metadata: { [key: string]: any } = {
  text: {
    title: '文本卡片',
  },
  settings: {
    title: '设置按钮',
  },
  apps: {
    title: '应用列表',
  },
  add: {
    title: '添加卡片',
  },
};
