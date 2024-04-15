export type ChatType = 'video' | 'audio' | 'screen';
export interface loginParams {
  name: string;
  limit: number;
  type: string;
  token: string;
  chat: boolean;
  userToken: string;
}
