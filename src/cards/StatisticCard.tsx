import { ArrowUpOutlined } from '@ant-design/icons';
import { Card, Statistic } from 'antd';

export default function StatisticCard() {
  return (
    <Card bordered={false}>
      <Statistic
        title="Active"
        className="workhome-card-statistic"
        value={11.28}
        precision={2}
        valueStyle={{ color: '#3f8600' }}
        prefix={<ArrowUpOutlined />}
        suffix="%"
      />
    </Card>
  );
}
