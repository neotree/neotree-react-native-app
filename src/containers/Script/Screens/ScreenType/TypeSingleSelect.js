import React from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/Select';

const SingleSelect = ({ screen, value, onChange }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || { values: [] });

  React.useEffect(() => {
    onChange(!entry.values.length ? undefined : entry);
  }, [entry]);

  return (
    <>
      <Select
        variant="radio"
        value={entry.values.map(e => e.value)}
        options={(metadata.items || []).map(item => ({
          label: item.label,
          value: item.id,
        }))}
        onChange={(item, i) => {
          item = (metadata.items || [])[i];
          setEntry({
            values: [{
              value: item.id,
              valueText: item.label,
              label: item.label,
              key: metadata.key,
              type: item.type,
              dataType: item.dataType,
              confidential: item.confidential,
            }]
          });
        }}
      />
    </>
  );
};

SingleSelect.propTypes = {
  screen: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default SingleSelect;
