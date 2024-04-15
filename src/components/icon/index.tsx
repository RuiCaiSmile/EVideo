import AntIcon from '@ant-design/icons';
import { exchange } from './icon';

const Icon = (props: any) => {
  const { mtype, ...restProps } = props;
  return <AntIcon component={exchange} {...restProps} />;
};

export default Icon;
