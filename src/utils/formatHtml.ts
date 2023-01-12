import { Vn, Character } from 'vndb-api-kana';
import Logger from './logger';
import * as Icon from './icons';

const formatDescription = (desc: string | null) => {
  if (!desc) {
    return '';
  }

  // replace url
  const [...matchedArray] = desc.matchAll(/\[url=(.+?)\](.+?)\[\/url\]/gi);
  Logger.log('vndb match', matchedArray);
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
    ? desc
        .replace(
          /\[spoiler](.+?)\[\/spoiler\]/gi,
          '<span class="vndb-spoiler">$1</span>'
        )
        .replace(/\[b](.+?)\[\/b\]/gi, '<b>$1</b>')
        .replace(/\[i](.+?)\[\/i\]/gi, '<i>$1</i>')
        .replace(/\[u](.+?)\[\/u\]/gi, '<u>$1</u>')
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
  const originalTitle = vn.titles.find(({ official }) => official)?.title;
  const titleBlock = `<div class="details-title">${vn.title}</div>`;
  const originalBlock = `<div class="details-original">
    ${originalTitle ?? ''}</div>`;
  const releasedBlock = `<div class="details-released">
    ${lv('released', vn.released)}</div>`;
  const aliasBlock = `<div>
    ${lv('alias', vn.aliases?.join(', '))}</div>`;
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
  Logger.log('vndb c', c);
  const characterMeansBlock =
    ((c.bust &&
      c.waist &&
      c.hips &&
      `<div class="character-means">
        ${lv('Means', `B${c.bust}/W${c.waist}/H${c.hips}`)}
      </div>`) ||
      '') +
    (c.cup
      ? `<div class="character-cup-size">
        ${lv('Cup Size', c.cup)}</div>`
      : '') +
    (c.height
      ? `<div class="character-height">
        ${lv('Height', c.height)}</div>`
      : '') +
    (c.weight
      ? `<div class="character-weight">
        ${lv('Weight', c.weight)}</div>`
      : '');

  const characterBirthdayBlock = c.birthday?.[0]
    ? `<div class="character-birthday">
    ${lv('Birthday', `${c.birthday?.[0]}-${c.birthday?.[1]}`)}
  </div>`
    : '';
  return `<div class="details-character">
    <div class="character-name">
      ${c.original ?? c.name}
      ${
        c.sex
          ? `<span class="character-gender-icon">${
              genderIcon[typeof c.sex === 'string' ? c.sex : c.sex[0]]
            }</span>`
          : ''
      }
      ${
        c?.vns[0]?.role &&
        `<span class="character-role-tag">${c.vns[0]?.role.toUpperCase()}</span>`
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
