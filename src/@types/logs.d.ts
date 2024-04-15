interface Window {
  openLog: () => void;
  flvjs: any;
}

interface config {
  key: string;
  label: string;
  filter: string[];
  origin: boolean;
}

type write = (
  data: string,
  from: 'client' | 'server',
  stringKey?: string[],
  format?: boolean,
) => void;

interface logsmodal {
  show: boolean;
  selectedItem: number | string;
}

interface logsItem {
  _showLabel: string;
  _showKey: string | number;
  _show?: string;
  _time: string;
  _from: 'client' | 'server';
  _key: string;
  [key: string]: any;
}
