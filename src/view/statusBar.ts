import { VnItem } from '../query/interface';
import * as vscode from 'vscode';
import { vnQuery } from '../query/query';

export class StatusBar {
  private _dailyVn: VnItem | null = null;
  private _statusBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  constructor() {
    if (!this._statusBar) {
      this._statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right
      );
    }
    this._statusBar.command = 'vsc-vndb.showMonthlyHotListPanel';
    this._statusBar.text = 'Loading...';
    this._statusBar.show();
    this.getDailyVn();
  }

  public getDailyVn() {
    vnQuery.getDailyVn().then((vn) => {
      if (vn) {
        this._dailyVn = vn;
        this._statusBar.text = `${vn.title}`;
        this._statusBar.show();
      } else {
        this._statusBar.text = `No any VN today`;
        this._statusBar.show();
      }
    });
  }

  public getDailyVnDetails() {
    return this._dailyVn;
  }
}
