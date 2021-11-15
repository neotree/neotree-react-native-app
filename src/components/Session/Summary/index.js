import React from 'react';
import PropTypes from 'prop-types';
import Entry from './Entry';
import Confidentials from './Confidentials';

export { default as Header } from './Confidentials';

const SessionSummary = ({
  showConfidential, 
  onShowConfidential,
  Wrapper, 
  session: { data: { form }, ...s } 
}) => {
  Wrapper = Wrapper || React.Fragment;

  return (
    <>
      {!showConfidential && <Confidentials onShowConfidential={onShowConfidential} />}

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
              case 'diagnosis':
                const accepted = values.filter(v => v.diagnosis.how_agree !== 'No');
                entries = [
                  {
                    label: `${screen.sectionTitle} - Primary Provisional Diagnosis`,
                    values: accepted.filter(v => v.diagnosis.isPrimaryProvisionalDiagnosis),
                  },
                  {
                    label: `${screen.sectionTitle} - Other problems`,
                    values: accepted.filter(v => !v.diagnosis.isPrimaryProvisionalDiagnosis),
                  }
                ]; // .filter(v => v.values.length);
                break;
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
                  label: screen.sectionTitle || metadata.label,
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

SessionSummary.propTypes = {
  session: PropTypes.object.isRequired,
  showConfidentials: PropTypes.bool,
  showConfidential: PropTypes.bool,
  onShowConfidential: PropTypes.func,
  Wrapper: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]),
};

export default SessionSummary;
