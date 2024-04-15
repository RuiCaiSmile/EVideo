import { useHistory } from 'react-router';

const useUrlParams = (props: string[]) => {
  const history = useHistory();
  const res: any = {};
  if (props?.length > 0) {
    props.forEach((item) => {
      // @ts-ignore
      res[item] = history.location?.query[item];
    });
  }
  return res;
};
export default useUrlParams;
