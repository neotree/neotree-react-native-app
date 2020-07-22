import React from 'react';
import PropTypes from 'prop-types';
import { fieldsTypes } from '@/constants/screen';
import moment from 'moment';
import Entry from './Entry';

const FormPreview = ({ form }) => {
  return (
    <>
      {form.filter(({ values }) => values.length)
        .map(({ screen, values }) => {
          const metadata = screen.metadata;

          let entries = null;

          switch (screen.type) {
            case 'form':
              entries = values.map(entry => ({
                label: entry.label,
                values: [entry]
              }));
              break;
            default:
              entries = [{
                label: metadata.label,
                values,
              }];
          }

          return !entries ? null : entries.map((e, i) => {
            const key = `${screen.id}${i}`;
            return <Entry key={key} {...e} />;
          });
        })}
    </>
  );
};

FormPreview.propTypes = {
  form: PropTypes.array.isRequired,
};

export default FormPreview;
