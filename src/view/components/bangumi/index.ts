import * as BgmInterface from '~/query/bgm/interface';
import { formatNumber } from '~/utils/string';

export const renderSubjectList = (data: BgmInterface.CollectionItem[]) => {
  return `
    <div class="vn-block-wrap">
      ${data.map((item) => renderSubjectListItem(item)).join('\n')}
    </div>
  `;
};

export const renderList = (data: any[], fn: (item: any) => string) => `
  <div class="vn-block-wrap">
    ${data.map((item) => fn(item)).join('\n')}
  </div>
`;

export const renderSubjectListItem = (data: BgmInterface.CollectionItem) => {
  const { subject } = data;
  return `
  <div class="vn-block bgm-vn-block">
    <div class="vn-title-block">
      <div class="vn-title-block-title" title="${subject.name}">
        ${
          data.type &&
          `<div class="bgm-status-tag">${statusRender(data.type)}</div>`
        }
        ${subject.name} 
      </div>
      <div class="vn-title-block-original" title="${subject.name_cn || ''}">
        ${subject.name_cn || '-'}
      </div>
    </div>
    <div class="vn-list-details">
    <div class="vn-list-details-popularity">
      Score: ${subject.score}
    </div>
    <div class="vn-list-details-rating">
      Rank: ${subject.rank}
    </div>
    <div class="vn-list-details-votecount">
      Vote count: ${formatNumber(subject.collection_total)}
    </div>
    <div class="vn-list-details-bottom">
      <div class="vn-list-details-released">
        Released at ${subject.date || '-'}
      </div>
      <vscode-button 
        class="btn" 
        appearance="icon" 
        disabled
        onclick="fetchDetails(${subject.id})"
      >details</vscode-button>
    </div>
  </div>
  </div>
  `;
};

export const renderSmallSubjectItem = (data: BgmInterface.SubjectSmall) => {
  return `
    <div class="vn-block bgm-vn-block">
      <div class="vn-title-block">
        <div class="vn-title-block-title" title="${data.name}">
          ${data.name}
        </div>
        <div class="vn-title-block-original" title="${data.name_cn || ''}">
          ${data.name_cn || '-'}
        </div>
      </div>
      <div class="vn-list-details">
        <div class="vn-list-details-popularity">
          Score: ${data?.rating?.score}
        </div>
        <div class="vn-list-details-rating">
          Rank: ${data.rank}
        </div>
        <div class="vn-list-details-votecount">
          Vote count: ${formatNumber(data?.rating?.count)}
        </div>
        <div class="vn-list-details-bottom">
          <div class="vn-list-details-released">
            Released at ${data.date || '-'}
          </div>
          <vscode-button 
            class="btn" 
            appearance="icon" 
            disabled
            onclick="fetchDetails(${data.id})"
          >details</vscode-button>
        </div>
      </div>
    </div>
  `;
};

export const pagination = `
<div class="search-bar">
  <vscode-button onClick="previousPage()">PreviousPage</vscode-button>
  <vscode-button onclick="nextPage()">NextPage</vscode-button>
</div>
`;

export const statusRender = (status: BgmInterface.CollectionType): string => {
  switch (status) {
    case BgmInterface.CollectionType.wish:
      return 'wish';
    case BgmInterface.CollectionType.collect:
      return 'done';
    case BgmInterface.CollectionType.do:
      return 'doing';
    case BgmInterface.CollectionType.on_hold:
      return 'on hold';
    case BgmInterface.CollectionType.dropped:
      return 'dropped';
  }
};

export const searchBar = (keyword: string) => `
<div class="search-bar">
  <vscode-text-field id="searchInput" value="${keyword}"></vscode-text-field>
  <vscode-dropdown id="sortTypeSelector">
    <vscode-option>released</vscode-option>
    <vscode-option>rating</vscode-option>
    <vscode-option>votecount</vscode-option>
    <vscode-option>popularity</vscode-option>
  </vscode-dropdown>
  <vscode-checkbox checked id="isReversed" value="true">reverse</vscode-checkbox>
  <vscode-button onclick="searchVns()">Search</vscode-button>
</div>
`;
