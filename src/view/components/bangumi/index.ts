import * as BgmInterface from '~/query/bgm/interface';
import { formatNumber } from '~/utils/string';

export const renderSubjectList = (data: BgmInterface.CollectionItem[]) => {
  return `
    <div class="vn-block-wrap">
      ${data.map((item) => renderSubjectListItem(item)).join('\n')}
    </div>
  `;
};

export const renderSubjectListItem = (data: BgmInterface.CollectionItem) => {
  const { subject } = data;
  return `
  <div class="vn-block">
    <div class="vn-title-block">
      <div class="vn-title-block-title" title="${subject.name}">
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
        onclick="fetchDetails(${subject.id})"
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
