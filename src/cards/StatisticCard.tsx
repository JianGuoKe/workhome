import { ArrowUpOutlined } from '@ant-design/icons';
import { Card, Statistic } from 'antd';
import { valueType } from 'antd/es/statistic/utils';

export default function StatisticCard(props: {
  up: boolean; value: valueType | undefined; precision: number | undefined; suffix: any; 
}) {
  return (
    <Card bordered={false}>
      <Statistic
        title="Active"
        className="workhome-card-statistic"
        value={props.value}
        precision={props.precision}
        valueStyle={{ color: props.up ? '#3f8600' : '#cf1322' }}
        prefix={<ArrowUpOutlined />}
        suffix={props.suffix || "%"}
      />
    </Card>
  );
}
