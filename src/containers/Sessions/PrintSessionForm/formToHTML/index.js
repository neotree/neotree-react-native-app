import parseForm from './parseForm';
import baseHTML from './baseHTML';

export default form => {
  const entries = parseForm(form);
  const tables = entries.map(({ data, screen }) => {
    return `
      <div class="form-table-wrapper">
        <div class="form-table-title">
          <strong>${screen.title}</strong>
        </div>
        <table class="form-table">
          ${data.map(entry => `
            <tr>
              <td>${entry.label}</td>
              <td>${entry.values.map(v => `<p>${v.text || v.valueText || v.label || v.value}</p>`).join('')}</td>
            </tr>
          `)}
        </table>
      </div>
    `;
  }).join('');

  return baseHTML(tables);
};
