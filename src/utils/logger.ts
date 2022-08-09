export default class Logger {
  static log(...args: any[]) {
    console.log(
      '%cvsc-vndb',
      'color: orange; border: 1px solid lightblue; padding: 0 3px;',
      ...args
    );
  }

  static success(...args: any[]) {
    console.log(
      '%cvsc-vndb',
      'color: green; border: 1px solid lightblue; padding: 0 3px;',
      ...args
    );
  }

  static error(...args: any[]) {
    console.log(
      '%cvsc-vndb',
      'color: #fff; background-color: red; border: 1px solid lightblue; padding: 0 3px;',
      ...args
    );
  }
}
