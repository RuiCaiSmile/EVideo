export interface loginData {
  name: string;
  password?: string;
}

export interface resData {
  code: number;
  des: string;
  result: 'success' | 'error';
}

export interface websocketData {
  event: string;
  data?: comObject | string;
}

export interface comObject {
  [key: string]: any;
}

export interface action {
  id: string;
  data?: any;
  handle?: any;
  target?: string;
}
