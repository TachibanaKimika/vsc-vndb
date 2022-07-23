import { Vn, Character } from '../query/interface';

import * as Icon from './icons';

const formatDescription = (desc: string | null) => {
  if (!desc) {
    return '';
  }

  // replace url
  const [...matchedArray] = desc?.matchAll(/\[url=(.+?)\](.+?)\[\/url\]/gi);
  console.log('vndb match', matchedArray);
  if (matchedArray) {
    for (const [replace, url, text] of matchedArray) {
      let url2Replace = url;
      if (url[0] === '/') {
        url2Replace = `https://vndb.org${url}`;
      }
      desc = desc.replace(
        replace,
        `<a class="vn-link" href="${url2Replace}" target="_blank">${text}</a>`
      );
    }
  }

  return desc
    ? desc.replace(
        /\[spoiler](.+?)\[\/spoiler\]/gi,
        '<span class="vndb-spoiler">$1</span>'
      )
    : 'no description';
};

const formatAliases = (alias: string | null) => {
  if (!alias) {
    return '';
  }
  alias.replace(/\n/g, ' / ');
};

const lv = (k: string, v: string | number | null): string => {
  if (k === 'description') {
    v = formatDescription(v?.toString());
  }
  return `<span class="label">${k}: </span><span class="value">${
    v || '-'
  }</span>`;
};

export const formatDetails = (vn: Vn & { characters: Character[] }): string => {
  const titleBlock = `<div class="details-title">${vn.title}</div>`;
  const originalBlock = `<div class="details-original">
    ${vn.original ?? ''}</div>`;
  const releasedBlock = `<div class="details-released">
    ${lv('released', vn.released)}</div>`;
  const aliasBlock = `<div>
    ${lv('alias', formatAliases(vn.aliases))}</div>`;
  const descriptionBlock = `<div class="details-description">
    ${lv(`description`, vn.description)}
    </div>`;
  const lengthBlock = `<div class="details-length">
    ${lv('length', vn.length)}
    </div>`;
  const statsBlock = `
    <div class="details-stats">
      <div>${lv('popularity', vn.popularity)}</div>
      <div>${lv('rating', vn.rating)}</div>
      <div>${lv('votecount', vn.votecount)}</div>
    </div>
  `;
  const characterBlock = `<div class="details-characters">
    ${vn.characters.map(formatCharacter).join('\n')}
  </div>`;
  return `
  <div class="details-main">${
    titleBlock +
    originalBlock +
    aliasBlock +
    releasedBlock +
    lengthBlock +
    statsBlock +
    descriptionBlock +
    characterBlock
  }</div>
  `;
};

const genderIcon = {
  m: Icon.maleIcon,
  f: Icon.femaleIcon,
  b: Icon.bothGenderIcon,
};

export const formatCharacter = (c: Character): string => {
  console.log('vndb c', c);
  const characterMeansBlock =
    ((c.bust &&
      c.waist &&
      c.hip &&
      `<div class="character-means">
        ${lv('Means', `B${c.bust}/W${c.waist}/H${c.hip}`)}
      </div>`) ||
      '') +
    (c.cup_size
      ? `<div class="character-cup-size">
        ${lv('Cup Size', c.cup_size)}</div>`
      : '') +
    (c.height
      ? `<div class="character-height">
        ${lv('Height', c.height)}</div>`
      : '') +
    (c.weight
      ? `<div class="character-weight">
        ${lv('Weight', c.weight)}</div>`
      : '');

  const characterBirthdayBlock = c.birthday[0]
    ? `<div class="character-birthday">
    ${lv('Birthday', `${c.birthday[1]}-${c.birthday[0]}`)}
  </div>`
    : '';
  return `<div class="details-character">
    <div class="character-name">
      ${c.original || c.name}
      ${
        c.gender &&
        `<span class="character-gender-icon">${genderIcon[c.gender]}</span>`
      }
      ${
        c?.vns[0]?.[3] &&
        `<span class="character-role-tag">${c.vns[0]?.[3]?.toUpperCase()}</span>`
      }
    </div>
    <vscode-divider></vscode-divider>
    <div class="character-details">
      <div class="character-basic">
        ${characterMeansBlock}
        ${characterBirthdayBlock}
      </div>
      <div class="character-description">
        ${lv('Description', formatDescription(c.description))}
      </div>
    </div>
  </div>`;
};

export const searchBar = `
<div class="search-bar">
  <vscode-text-field id="searchInput"></vscode-text-field>
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
