import { resData } from './common.interface';
import { v4 as uuid } from 'uuid';

const _ = require('lodash');

// 成功
export const SuRes = (des: string, data?: any): Promise<resData> => {
  const response = Object.assign(
    {
      code: 200,
      des,
      result: 'success',
    },
    data,
  );
  return Promise.resolve(response);
};

// 失败
export const ErrRes = (des): Promise<resData> => {
  return Promise.resolve({
    code: 500,
    des,
    result: 'error',
  });
};

// 生成token
export const makeToken = () => {
  return `${uuid()}`;
};

// 格式化websocket回复
export const msgRep = (type: string, data: any, success?: boolean) => {
  const res = {
    event: type,
    data,
  };
  if (success || success === false) {
    return Object.assign(res, {
      code: success ? 200 : 500,
    });
  }
  return res;
};

export const getSameKeyValue = (array, value, key) => {
  if (!value[key]) {
    throw 'value格式不对';
    return;
  }
  const cloneArray = _.cloneDeep(array);
  const data = _.find(cloneArray, (item) => {
    return item[key] === value[key];
  });
  return data;
};

export const getSameKeyIndex = (array, value, key) => {
  if (!value[key]) {
    throw 'value格式不对';
    return;
  }
  const cloneArray = _.cloneDeep(array);
  const data = _.findIndex(cloneArray, (item) => {
    return item[key] === value[key];
  });
  return data;
};

export const removeSameKey = (array, value, key) => {
  if (!value[key]) {
    throw 'value格式不对';
    return;
  }
  const cloneArray = _.cloneDeep(array);
  const data = _.remove(cloneArray, (item) => {
    return item[key] === value[key];
  });
  return cloneArray;
};

export const removeSameKeyArray = (array, value, key) => {
  const cloneArray = _.cloneDeep(array);
  const data = _.pullAllBy(cloneArray, value, key);
  return cloneArray;
};

export const setNewArray = (array, value) => {
  array.length = 0;
  array.push(...value);
};
