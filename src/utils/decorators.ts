import * as vscode from 'vscode';
import Logger from './logger';
export const logger = (
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) => {
  Logger.log('vndb start logger');
  const original = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    Logger.log(
      `VNDB LOGGER Calling ${key} with`,
      args,
      descriptor,
      target,
      this
    );
    const result = await original.apply(this, args);
    Logger.log('vndb end Loading');
    return result;
  };
  return descriptor;
};

// only for query class
export const loading = (
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) => {
  const original = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    if (this._isInQuery === true) {
      vscode.window.showErrorMessage('Already in querying...');
      return null;
    } else {
      this._isInQuery = true;
      let result;
      try {
        result = await original.apply(this, args);
      } catch (e) {
        vscode.window.showErrorMessage('Query Error');
      } finally {
        this._isInQuery = false;
        return result;
      }
    }
  };
  return descriptor;
};

export const reconnect = (
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) => {
  const original = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    if (this._vndb) {
      this._vndb.destroy();
    }
    return await original.apply(this, args);
  };
  return descriptor;
};
