/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
const vscode = acquireVsCodeApi();
// console.log('vndb script init');

function getDailyVns() {
  vscode.postMessage({
    command: 'getDay',
  });
}

function getYearlyVns() {
  vscode.postMessage({
    command: 'getYear',
  });
}

function getMonthlyVns() {
  vscode.postMessage({
    command: 'getMonth',
  });
}

function loadMoreVns() {
  vscode.postMessage({
    command: 'loadMore',
  });
}

function fetchDetails(id) {
  vscode.postMessage({
    command: 'details',
    id,
  });
}

function searchVns() {
  const keyword = document.getElementById('searchInput')?.value || '';
  const sort = document.getElementById('sortTypeSelector')?.value;
  const reverse = document.getElementById('isReversed')?.checked;

  const isVaild = /^[^:]*$/.test(keyword);
  if (!isVaild) {
    vscode.postMessage({
      command: 'showError',
      error: 'Invalid keyword, cloud not include ":"',
    });
    return;
  }
  vscode.postMessage({
    command: 'search',
    keyword,
    sort,
    reverse: !!reverse,
  });
}

function previousPage() {
  vscode.postMessage({
    command: 'previousPage',
  });
}

function nextPage() {
  vscode.postMessage({
    command: 'nextPage',
  });
}
