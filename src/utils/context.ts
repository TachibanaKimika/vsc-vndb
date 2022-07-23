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
