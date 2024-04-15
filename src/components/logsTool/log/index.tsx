import defaultConfig from './defaultConfig';
import { proxy } from 'valtio';
import _ from 'lodash';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
// 配置
// 1.消息体的label 、key
// 2.消息的筛选项
// 3.是否带上原消息

export const config: config = proxy(defaultConfig);
export const logs: logsItem[] = proxy([]);

export const logConfig = (config: config) => {
  config = {
    ...defaultConfig,
    ...config,
  };
};

// 写日志
// 1.消息体
// 2.消息来源方
// 2.string to dom 特殊文本展示
// 3.主体内容的key格式化配置，默认true 'item.key.id'

export const writeLogs: write = (data, from, stringKey, format) => {
  if (!data || typeof data !== 'string') return;
  const item = JSON.parse(data);
  if (stringKey && stringKey.length > 0) {
    let _show;
    stringKey.forEach((key) => {
      const res = _.get(item, key);
      if (res) _show = res;
    });
    if (_show) item._show = _show;
  }
  item._showLabel = item[config.label];
  item._showKey = item[config.key];
  item._key = uuid();
  item._from = from;
  item._time = moment().format('YYYY-MM-DD HH:mm:ss');
  logs.unshift(item);
};
