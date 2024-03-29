import * as vscode from 'vscode';
import * as path from 'path';
import { getContext } from '../utils/context';
import { VnListItem } from '../query/interface';
import { executeCommand } from '../utils/command';
import { vnQuery, SearchOption } from '../query/query';
import { formatDetails, searchBar } from '../utils/formatHtml';
import { NodeModulesAccessor, NodeModulesKeys } from '../NodeModulesAccessor';
import { formatNumber } from '../utils/string';
import { Vn } from 'vndb-api-kana';
import Logger from '../utils/logger';

export class ViewPanel {
  protected _extensionUri: vscode.Uri;
  protected _content: string;
  protected _stylesUri: vscode.Uri;
  protected _scriptUri: vscode.Uri;
  protected _uiToolkitUri: vscode.Uri;
  protected _panel: vscode.WebviewPanel | undefined;
  protected _extensionPath: string;
  protected _hasInit = false;

  constructor() {
    this._extensionUri = getContext().extensionUri;
    this._extensionPath = getContext().extensionPath;
    this._stylesUri = vscode.Uri.file(
      path.join(
        this._extensionPath,
        ...NodeModulesAccessor.getPathToOutputFile(NodeModulesKeys.css)
      )
    );
    this._scriptUri = vscode.Uri.file(
      path.join(
        this._extensionPath,
        ...NodeModulesAccessor.getPathToOutputFile(NodeModulesKeys.js)
      )
    );
    this._uiToolkitUri = vscode.Uri.file(
      path.join(
        this._extensionPath,
        ...NodeModulesAccessor.getPathToOutputFile(NodeModulesKeys.uiToolkit)
      )
    );
    this._content = '';
  }

  protected createResourcePath(uri: vscode.Uri, webview: vscode.Webview) {
    if (!this._hasInit) {
      return webview.asWebviewUri(uri);
    } else {
      return uri;
    }
  }

  protected _loadMore() {}

  protected createWebviewPanel(onDidDispose: () => void) {
    const context = getContext();
    const panel = vscode.window.createWebviewPanel(
      'vsc-vndb-view-panel',
      'VNDB View Panel',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,

        localResourceRoots: [
          vscode.Uri.file(
            path.join(
              context.extensionPath,
              NodeModulesAccessor.outputPath,
              'assets'
            )
          ),
        ],
      }
    );
    this._scriptUri = this.createResourcePath(this._scriptUri, panel.webview);
    this._stylesUri = this.createResourcePath(this._stylesUri, panel.webview);
    this._uiToolkitUri = this.createResourcePath(
      this._uiToolkitUri,
      panel.webview
    );
    this._hasInit = true;
    Logger.success(
      'ACCESS',
      vscode.Uri.file(
        path.join(
          context.extensionPath,
          NodeModulesAccessor.outputPath,
          'assets'
        )
      )
    );
    Logger.success('success', this._uiToolkitUri);
    panel.onDidDispose(onDidDispose, null, context.subscriptions);
    return panel;
  }

  protected openWebViewPanel(cb: (pv: vscode.WebviewPanel) => void) {
    if (this._panel) {
      this._panel.reveal(this._panel.viewColumn);
      cb(this._panel);
    } else {
      this._panel = this.createWebviewPanel(() => {
        this._panel = undefined;
      });
      cb(this._panel);
    }
  }

  protected _htmlWrap = (content: string) => {
    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="${this._stylesUri}">
          <script src="${this._scriptUri}"></script>
          <script src="${this._uiToolkitUri}"></script>
          <title>VNDB View Panel</title>
        </head>
        <body>
          <div id="vsc-vndb-view-panel">
            ${searchBar}
            ${content}
          </div>
        </body>
      </html>`;
  };

  private _renderByHtml = (html: string) => {
    this.openWebViewPanel((pv) => {
      pv.webview.html = html;
    });
  };

  public showLoadingPanel() {
    this._renderByHtml(
      this._htmlWrap(`
      <div class="loading-full-height">
        <vscode-progress-ring></vscode-progress-ring>
      </div>`)
    );
  }

  public async updateContent(content: string) {
    this._content = content;
    this.render();
  }

  public render() {
    this._renderByHtml(this._htmlWrap(this._content));
  }
}

export class VnListViewPanel extends ViewPanel {
  private _vns: Vn[] = [];
  private _query: any;
  private _hasMore: string | null = null;
  // private scence: string;

  protected createWebviewPanel(onDidDispose: () => void) {
    const context = getContext();
    const panel = super.createWebviewPanel(onDidDispose);
    panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case 'getYear': {
            executeCommand('showYearlyHotListPannel');
            break;
          }
          case 'getMonth': {
            executeCommand('showMonthlyHotListPanel');
            break;
          }
          case 'getDay': {
            executeCommand('showDailyHotListPanel');
            break;
          }
          case 'loadMore': {
            this._loadMore();
            break;
          }
          case 'details': {
            Logger.error('details', message);
            executeCommand('getDetailsById', message.id);
            break;
          }
          case 'search': {
            executeCommand(
              'searchVnsByQuery',
              message.keyword,
              message.sort,
              message.reverse
            );
            break;
          }
          case 'showError': {
            vscode.window.showErrorMessage(message.error);
            break;
          }
        }
      },
      undefined,
      context.subscriptions
    );
    return panel;
  }

  protected _htmlWrap = (content: string) => {
    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="${this._stylesUri}">
          <script src="${this._scriptUri}" type="text/javascript"></script>
          <script src="${this._uiToolkitUri}" type="module"></script>
          <title>VNDB View Panel</title>
        </head>
        <body>
          <div id="vsc-vndb-view-panel">
            <div class="vn-header-btns">
              <vscode-button onclick="getDailyVns()">Daily View</vscode-button>
              <vscode-button onclick="getMonthlyVns()">Monthly View</vscode-button>
              <vscode-button onclick="getYearlyVns()">Yearly View</vscode-button>
            </div>
            ${searchBar}
            ${content}
          </div>
        </body>
      </html>`;
  };

  private async _renderVns(vns: Vn[], more = false) {
    this._vns = vns;
    const vnBlock = this.formatVnList(this._vns);
    this.updateContent(this.vnBlockWrap(vnBlock, more));
  }

  private vnBlockWrap(vnHtml: string, more = false) {
    return `
    <div class="vn-body">
      <div class="vn-block-wrap">${vnHtml}</div>
      <div class="vn-loadmore-btn">
      ${
        more
          ? '<vscode-button class="btn" onclick="loadMoreVns()">' +
            'Load More</vscode-button>'
          : ''
      }
      </div>
    </div>
    `;
  }

  private vnDetailsWrap = (vnHtml: string) => `
    <div class="vn-body">
      ${vnHtml}
    </div>
  `;

  private formatVnList(vns: Vn[]) {
    const vnBlock = vns.map((vn) => {
      const originalTitle = vn.titles.find(({ official }) => {
        if (official) {
          return true;
        }
      })?.title;
      return `
      <div class="vn-block">
        <div class="vn-title-block">
          <div class="vn-title-block-title" title="${vn.title}">
            ${vn.title}
          </div>
          <div class="vn-title-block-original" title="${originalTitle || ''}">
            ${originalTitle || 'no original'}
          </div>
        </div>
        <div class="vn-list-details">
          <div class="vn-list-details-popularity">
            Popular: ${vn.popularity.toFixed?.(2) ?? vn.popularity}
          </div>
          <div class="vn-list-details-rating">
            Rating: ${vn.rating}
          </div>
          <div class="vn-list-details-votecount">
            Vote count: ${formatNumber(vn.votecount)}
          </div>
          <div class="vn-list-details-bottom">
            <div class="vn-list-details-released">
              Released at ${vn.released}
            </div>
            <vscode-button 
              class="btn" 
              appearance="icon" 
              onclick='fetchDetails("${vn.id}")'
            >details</vscode-button>
          </div>
        </div>
      </div>`;
    });
    return vnBlock.join('\n');
  }

  public renderDailyVns() {
    this.showLoadingPanel();
    vnQuery
      .getDailyVns()
      .then(({ results, more }) => {
        if (results) {
          this._renderVns(results, more);
        }
      })
      .catch((err) => {
        Logger.error('vndb get hot vns error', err);
        this.updateContent('Fetch Data Error');
      });
  }

  public renderMonthlyVns() {
    this.showLoadingPanel();
    vnQuery
      .getMonthlyVns()
      .then(({ results, more }) => {
        if (results) {
          this._renderVns(results, more);
        }
      })
      .catch((err) => {
        Logger.error('vndb get hot vns error', err);
        this.updateContent('Fetch Data Error');
      });
  }

  public renderYearlyVns() {
    this.showLoadingPanel();
    vnQuery
      .getYearlyVns()
      .then(({ results, more }) => {
        if (results) {
          this._renderVns(results, more);
        }
      })
      .catch((err) => {
        Logger.error('vndb get hot vns error', err);
        this.updateContent('Fetch Data Error');
      });
  }

  // override loadmore
  protected _loadMore() {
    this.loadMoreVns();
  }

  public loadMoreVns() {
    vnQuery.loadMore().then((res) => {
      Logger.log(res);
      if (!res) {
        return;
      }
      const { results, more } = res;
      this._renderVns(results, more);
    });
  }

  public renderSearchVns(keyword: string, option: SearchOption) {
    this.showLoadingPanel();
    vnQuery
      .searchVns(keyword, option)
      .then(({ results, more }) => {
        if (results) {
          this._renderVns(results, more);
        }
      })
      .catch((err) => {
        Logger.error('vndb query vns error', err);
        this.updateContent('Fetch Data Error');
      });
  }

  public renderDetails(id: string) {
    if (!id) {
      return;
    }
    // this.showLoadingPanel();
    vnQuery.getVnDetails(id).then((vn) => {
      if (vn) {
        const contentHtml = formatDetails(vn);
        this.updateContent(this.vnDetailsWrap(contentHtml));
      }
    });
  }
}
