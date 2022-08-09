import * as vscode from 'vscode';

let _context: vscode.ExtensionContext;
const _config: {
  [key: string]: any;
} = {};

export const setContext = (c: vscode.ExtensionContext) => {
  _context = c;
};

export const getContext = () => {
  return _context;
};

export const setConfig = (k: string, v: any) => {
  _config[k] = v;
};

export const getConfig = (k: string) => {
  return _config[k];
};

export const saveState = (k: string, v: any) => {
  _context.globalState.update(k, v);
};

export const loadState: <T = any>(k: string) => T = (k: string) =>
  _context.globalState.get(k);
