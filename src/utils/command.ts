import * as vscode from 'vscode';
import { getContext } from './context';

export const regisrtyCommand = (
  name: string,
  fun: (...args: any[]) => void,
  thisArg?: any
) => {
  const context = getContext();
  context.subscriptions.push(
    vscode.commands.registerCommand(`vsc-vndb.${name}`, fun, thisArg)
  );
};

export const executeCommand = (name: string, ...args: any[]) => {
  return vscode.commands.executeCommand<unknown>(`vsc-vndb.${name}`, ...args);
};
