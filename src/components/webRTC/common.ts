import { v4 as uuid } from 'uuid';

export const wbFormat = (type: string, func: any) => {
  return {
    event: type,
    handleFunction: func,
    id: uuid(),
  };
};
