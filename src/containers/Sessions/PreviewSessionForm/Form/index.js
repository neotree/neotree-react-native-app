import React from 'react';
import PropTypes from 'prop-types';
import Entry from './Entry';
import Confidentials from './Confidentials';

export { default as Header } from './Confidentials';

const FormPreview = ({ displayEverything, Wrapper, session: { data: { form }, ...s } }) => {
  Wrapper = Wrapper || React.Fragment;
  const [showConfidential, setShowConfidential] = React.useState(displayEverything === true);

  return (
    <>
      {!showConfidential && <Confidentials onShowConfidential={setShowConfidential} />}

      <Wrapper>
        {form.filter(({ values }) => values.length)
          .map(({ screen, values }) => {
            values = values.reduce((acc, e) => [
              ...acc,
              ...(e.value && e.value.map ? e.value : [e]),
            ], []);
            
            const metadata = screen.metadata;

            let entries = null;

            switch (screen.type) {
              case 'form':
                entries = values
                  .filter(e => e.confidential ? showConfidential : true)
                  .map(entry => ({
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
      </Wrapper>
    </>
  );
};

FormPreview.propTypes = {
  session: PropTypes.object.isRequired,
  showConfidentials: PropTypes.bool,
  Wrapper: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]),
};

export default FormPreview;
