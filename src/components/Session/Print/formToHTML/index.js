/* eslint-disable indent */
import ucFirst from '@/utils/ucFirst';
import baseHTML from './baseHTML';

export default (session, showConfidential) => {
  const { form } = session.data;
  const sections = [];
  form.forEach(entry => {
    const { screen } = entry;
    const { sectionTitle } = screen;
    if (entry.values.length) {
      [
        ...(screen.type === 'diagnosis' ? [
          'Primary Problems',
          'Other problems',
          // `${sectionTitle} - Primary Provisional Diagnosis`,
          // `${sectionTitle} - Other problems`,
        ] : [sectionTitle])
      ].forEach((sectionTitle, i) => {
        const _sectionTitle = ucFirst(`${sectionTitle}`.toLowerCase());
        let sectionIndex = sections.map(([section]) => section).indexOf(_sectionTitle);
        if (sectionIndex < 0) {
          sections.push([sectionTitle ? _sectionTitle : '', []]);
          sectionIndex = sections.length - 1;
        }
        sections[sectionIndex][1].push({
          ...entry,
          values: entry.values.filter(v => {
            if (screen.type === 'diagnosis') {
              let accepted = v.diagnosis.how_agree !== 'No';
              if (!accepted) return false;
              return i === 1 ? !v.diagnosis.isPrimaryProvisionalDiagnosis : v.diagnosis.isPrimaryProvisionalDiagnosis;
            }
            return true;
          })
        });
      });
      // const _sectionTitle = ucFirst(`${sectionTitle}`.toLowerCase());
      // let sectionIndex = sections.map(([section]) => section).indexOf(_sectionTitle);
      // if (sectionIndex < 0) {
      //   sections.push([sectionTitle ? _sectionTitle : '', []]);
      //   sectionIndex = sections.length - 1;
      // }
      // sections[sectionIndex][1].push(entry);
    }
  });

  const tables = sections
    .filter(([, entries]) => entries.length)
    .map(([sectionTitle, entries]) => {
      entries = entries.filter(e => e.values.length);

      return `
        ${!sectionTitle ? '' : (`
          <div class="title row">
            <strong>${sectionTitle}</strong>
          </div>
        `)}

        ${entries.filter(e => e.values.length)
          .map(({ values, screen: { metadata: { label } } }) => {
            return values.filter(e => e.confidential ? showConfidential : true).map(v => {
              return `
                <div  class="row">
                  <span>${label || v.label}</span>
                  <div>
                    ${v.value && v.value.map ? 
                      v.value.map(v => `<span>${v.valueText || v.value || 'N/A'}</span>`).join('<br />') 
                      : 
                      `<span>${v.valueText || v.value || 'N/A'}</span>`
                    }
                  </div>                  
                </div>
              `;
            }).join('')
          }).join('')}
      `;
    }).join('');

  return baseHTML(tables, session);
};
