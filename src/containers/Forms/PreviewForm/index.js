import React from 'react';
import PropTypes from 'prop-types';
import { LayoutScrollableContent } from '@/components/Layout';
import { fieldsTypes } from '@/constants/screen';
import moment from 'moment';
import Entry from './Entry';

const PreviewForm = ({ form, scrollable, Wrapper }) => {
  scrollable = scrollable !== false;
  Wrapper = Wrapper || React.Fragment;
  const RootComponent = scrollable ? LayoutScrollableContent : React.Fragment;

  return (
    <>
      <RootComponent>
        <Wrapper>
          {form
            .filter(({ entry }) => !entry.not_required)
            .map(({ screen, entry: { value } }) => {
              const metadata = screen.data.metadata || {};

              let entries = null;

              switch (screen.type) {
                case 'yesno':
                  entries = [{
                    label: metadata.label,
                    values: [{ text: value, key: screen.id }]
                  }];
                  break;
                case 'checklist':
                  entries = [{
                    label: metadata.label,
                    values: value.map(({ item }) => ({
                      key: item.key,
                      text: item.label,
                    }))
                  }];
                  break;
                case 'multi_select':
                  entries = [{
                    label: metadata.label,
                    values: value.map(({ item }) => ({
                      key: item.id,
                      text: item.label,
                    }))
                  }];
                  break;
                case 'single_select':
                  entries = [{
                    label: metadata.label,
                    values: [{
                      text: (metadata.items || []).filter(item => item.id === value)
                        .map(item => item.label)[0],
                      key: screen.id
                    }]
                  }];
                  break;
                case 'timer':
                  entries = [{
                    label: metadata.label,
                    values: [{ text: value, key: screen.id }]
                  }];
                  break;
                case 'progress':
                  entries = null;
                  break;
                case 'management':
                  entries = null;
                  break;
                case 'form':
                  entries = value.map(({ value, field }) => {
                    let text = value;

                    switch (field.type) {
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
                        text = (field.values || '').split('\n')
                          .map((v = '') => v.trim())
                          .filter(v => v)
                          .map(v => {
                            v = v.split(',');
                            return { value: v[0], label: v[1] };
                          })
                          .filter(v => v.value === value)
                          .map(v => v.label)[0];
                        // do nothing
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
                      label: field.label,
                      values: [{
                        key: field.key,
                        text,
                      }]
                    };
                  });

                  break;
                default:
                  // do nothing
              }

              return !entries ? null : entries.map((e, i) => {
                const key = `${screen.id}${i}`;
                return <Entry key={key} {...e} />;
              });
            })}
        </Wrapper>
      </RootComponent>
    </>
  );
};

PreviewForm.propTypes = {
  scrollable: PropTypes.bool,
  form: PropTypes.object.isRequired,
  Wrapper: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]),
};

export default PreviewForm;
