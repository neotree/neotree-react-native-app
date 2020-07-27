/* eslint-disable indent */
import ucFirst from '@/utils/ucFirst';
import baseHTML from './baseHTML';

export default form => {
  const sections = [];
  form.forEach(entry => {
    const { screen: { sectionTitle } } = entry;
    const _sectionTitle = ucFirst(`${sectionTitle}`.toLowerCase());
    let sectionIndex = sections.map(([section]) => section).indexOf(_sectionTitle);
    if (sectionIndex < 0) {
      sections.push([sectionTitle ? _sectionTitle : '', []]);
      sectionIndex = sections.length - 1;
    }
    sections[sectionIndex][1].push(entry);
  });

  const tables = sections.map(([sectionTitle, entries]) => {
    entries = entries.filter(e => e.values.length);

    return `
      ${!sectionTitle ? '' : (`
        <div class="title row">
          <strong>${sectionTitle}</strong>
        </div>
      `)}

      ${entries.filter(e => e.values.length)
        .map(({ values, screen: { metadata: { label } } }) =>
          values.map(v => `
            <div  class="row">
              <span>${label || v.label}</span>
              <span>${v.valueText || 'N/A'}</span>
            </div>
          `).join('')
        ).join('')}
    `;
  }).join('');

  return baseHTML(tables);
};
