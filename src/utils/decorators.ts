import * as vscode from 'vscode';

export const logger = (
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) => {
  console.log('vndb start logger');
  const original = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    console.log(
      `VNDB LOGGER Calling ${key} with`,
      args,
      descriptor,
      target,
      this
    );
    const result = await original.apply(this, args);
    console.log('vndb end Loading');
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
      const result = await original.apply(this, args);
      this._isInQuery = false;
      return result;
    }
  };
  return descriptor;
};
