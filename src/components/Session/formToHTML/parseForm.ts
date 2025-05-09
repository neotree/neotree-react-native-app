import { fieldsTypes } from '../../../constants';
import moment from 'moment';

export default (form: any) => {

  console.log("---MWI..FORM...",JSON.stringify(form))
  const entries = form
    .filter(({ values }: any) => values.length)
    .map(({ screen, values }: any) => {
      values = values.reduce((acc: any, e: any) => [
        ...acc,
        ...(e.value && e.value.map ? e.value : [e]),
      ], []);
      
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
        case 'diagnosis':
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
          entries = values.map((entry: any) => {
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
                text = value ? moment(value).format('DD MMM, YYYY HH:mm') : 'N/A';
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
                text = value ? moment(value).format('HH:mm') : 'N/A';
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
  return entries.filter((e: any) => e);
};
