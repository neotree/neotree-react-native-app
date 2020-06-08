import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { fieldsTypes } from '@/constants/screen';
import moment from 'moment';

import DisplayField from './_DisplayField';

const Form = ({ screen, form }) => {
  const metadata = screen.data.metadata || {};

  return (
    <>
      <View>
        {metadata.fields.map(f => {
          let text = null;

          return (
            <React.Fragment key={f.key}>
              {(() => {
                const value = (form.form || []).filter(v => v && v.key === f.key)[0];

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

                return !text ? null : (
                  <DisplayField
                    label={f.label}
                    values={[{ key: value.key, text }]}
                  />
                );
              })()}
            </React.Fragment>
          );
        })}
      </View>
    </>
  );
};

Form.propTypes = {
  screen: PropTypes.object,
  form: PropTypes.object.isRequired
};

export default Form;
