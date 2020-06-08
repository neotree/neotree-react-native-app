import { fieldsTypes } from '@/constants/screen';
import moment from 'moment';

export default ({ data }) => {
  const tables = data.form.map(({
    screen: { data: { metadata, ...screen } },
    entry: { form },
  }) => {
    metadata = metadata || {};

    if (!form) return '';

    return `
      <div class="form-table-wrapper">
        <table className="form-table">
          <tr>
            <th>${(screen.sectionTitle || screen.title || '').trim()}</th>
            <th></th>
          </tr>
${(() => {
    let values = [];

    switch (screen.type) {
      case 'yesno':
        values = [{ text: form || 'N/A', key: metadata.label }];
        break;
      case 'checklist':
        values = (form || []).map(v => v.value)
          .map(id => (metadata.items || []).filter(item => item.id === id)[0])
          .filter(v => v)
          .map(v => ({ key: v.label, text: v.label }));
        break;
      case 'multi_select':
        values = (form || []).map(v => v.value)
          .map(id => (metadata.items || []).filter(item => item.id === id)[0])
          .filter(v => v)
          .map((v, i) => {
            return { key: i === 0 ? metadata.label : '', text: v.label };
          });
        break;
      case 'single_select':
        values = (metadata.items || []).filter(item => `${item.id}` === `${form}`)
          .map(item => ({ text: item ? item.label : 'N/A', key: metadata.label }));
        break;
      case 'timer':
        values = [{ text: form || 'N/A', key: metadata.label }];
        break;
      case 'progress':
        values = [];
        break;
      case 'management':
        values = [];
        break;
      case 'form':
        values = (metadata.fields || []).map(f => {
          let text = null;
          const value = (form || []).filter(v => v && v.key === f.key)[0];

          switch (f.type) {
            case fieldsTypes.NUMBER:
              text = value.value;
              break;
            case fieldsTypes.DATE:
              text = value.value ? moment(value.value).format('DD MMM, YYYY') : 'N/A';
              break;
            case fieldsTypes.DATETIME:
              text = value.value ? moment(value.value).format('DD MMM, YYYY HH:MM') : 'N/A';
              break;
            case fieldsTypes.DROPDOWN:
              text = value.value;
              break;
            case fieldsTypes.PERIOD:
              text = 'PERIOD ***';
              break;
            case fieldsTypes.TEXT:
              text = value.value;
              break;
            case fieldsTypes.TIME:
              text = value.value ? moment(value.value).format('HH:MM') : 'N/A';
              break;
            default:
              // do nothing
          }
          return value ? { key: f.label, text } : null;
        });
        break;
      default:
        // do nothing
    }

    console.log(values);

    return (values || []).filter(v => v).map(v => {
      return `
        <tr>
          <td>
            ${v.key}
          </td>
          <td>
            ${v.text}
          </td>
        </tr>
      `;
    }).join('\n');
  })()}
        </table>
      </div>
    `;
  });

  return `
    <div className="form-tables">
      ${tables.join('\n')}
    </div>
  `;
};
