// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { regisrtyCommand } from './utils/command';
import { setContext, setConfig, getConfig } from './utils/context';
import { StatusBar } from './view/statusBar';
import { SortType } from './query/query';
import { VnListViewPanel } from './view/webview';

let isInit = false;

const initialize = (context: vscode.ExtensionContext) => {
  if (isInit) {
    return;
  }
  isInit = true;
  setContext(context);
  const vnListViewPanel = new VnListViewPanel();
  const statusBar = new StatusBar();
  setConfig('statusBar', statusBar);
  setConfig('vnListViewPanel', vnListViewPanel);
};

export function activate(context: vscode.ExtensionContext) {
  initialize(context);

  const showDailyHotListPanel = () => {
    const panel: VnListViewPanel = getConfig('vnListViewPanel');
    panel.renderDailyVns();
  };

  const showMonthlyHotListPanel = () => {
    const panel: VnListViewPanel = getConfig('vnListViewPanel');
    panel.renderMonthlyVns();
  };

  const showYearlyHotListPannel = () => {
    const panel: VnListViewPanel = getConfig('vnListViewPanel');
    panel.renderYearlyVns();
  };

  const getDetailsById = (id: string) => {
    const panel: VnListViewPanel = getConfig('vnListViewPanel');
    panel.renderDetails(id);
  };

  const searchVns = (
    keyword: string,
    sort: keyof typeof SortType,
    reverse: boolean
  ) => {
    const panel: VnListViewPanel = getConfig('vnListViewPanel');
    panel.renderSearchVns(keyword, {
      sort,
      reverse,
    });
  };

  /** vndb part */
  regisrtyCommand('showDailyHotListPanel', showDailyHotListPanel);
  regisrtyCommand('showMonthlyHotListPanel', showMonthlyHotListPanel);
  regisrtyCommand('showYearlyHotListPannel', showYearlyHotListPannel);
  regisrtyCommand('getDetailsById', getDetailsById);
  regisrtyCommand('searchVnsByQuery', searchVns);
}

// this method is called when your extension is deactivated
export function deactivate() {}
