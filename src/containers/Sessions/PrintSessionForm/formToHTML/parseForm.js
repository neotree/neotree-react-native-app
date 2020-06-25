import { fieldsTypes } from '@/constants/screen';
import moment from 'moment';

export default form => {
  const entries = form
    .filter(({ values }) => values.length)
    .map(({ screen, values }) => {
      const metadata = screen.metadata;

      let entries = null;

      switch (screen.type) {
        case 'yesno':
          entries = [{
            label: metadata.label,
            values,
          }];
          break;
        case 'checklist':
          entries = [{
            label: metadata.label,
            values,
          }];
          break;
        case 'multi_select':
          entries = [{
            label: metadata.label,
            values,
          }];
          break;
        case 'single_select':
          entries = [{
            label: metadata.label,
            values: [{
              key: screen.id,
              values,
            }]
          }];
          break;
        case 'timer':
          entries = [{
            label: metadata.label,
            values,
          }];
          break;
        case 'progress':
          entries = null;
          break;
        case 'management':
          entries = null;
          break;
        case 'form':
          entries = values.map(entry => {
            const { value, type, label, valueText, } = entry;

            let text = value;

            switch (type) {
              case fieldsTypes.NUMBER:
                // do nothing
                break;
              case fieldsTypes.DATE:
                text = value ? moment(value).format('DD MMM, YYYY') : 'N/A';
                break;
              case fieldsTypes.DATETIME:
                text = value ? moment(value).format('DD MMM, YYYY HH:MM') : 'N/A';
                break;
              case fieldsTypes.DROPDOWN:
                text = valueText || value;
                break;
              case fieldsTypes.PERIOD:
                // do nothing
                break;
              case fieldsTypes.TEXT:
                // do nothing
                break;
              case fieldsTypes.TIME:
                text = value ? moment(value).format('HH:MM') : 'N/A';
                break;
              default:
                // do nothing
            }

            return {
              label,
              values: [{ ...entry, text }]
            };
          });
          break;
        default:
          // do nothing
      }

      return !entries ? null : { screen, data: entries };
    });
  return entries.filter(e => e);
};
