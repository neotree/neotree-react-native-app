import React from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/Select';

const TypeYesNo = ({ screen, entry: value, setEntry: onChange }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || { values: [] });

  React.useEffect(() => {
    onChange(!entry.values.length ? undefined : entry);
  }, [entry]);

  const opts = [
    { value: 'true', label: metadata.positiveLabel || 'Yes' },
    { value: 'false', label: metadata.negativeLabel || 'No' },
  ];

  return (
    <>
      <Select
        variant="radio"
        options={opts}
        value={entry.values.map(e => e.value)}
        onChange={opt => {
          setEntry({
            values: [{
              value: opt.value,
              confidential: metadata.confidential,
              valueText: opt.value === 'false' ? 'No' : 'Yes',
              key: metadata.key || opt.key,
              label: opt.label,
              type: metadata.dataType || opt.type,
              dataType: metadata.dataType,
            }],
          });
        }}
      />
    </>
  );
};

TypeYesNo.propTypes = {
  entry: PropTypes.object,
  screen: PropTypes.object.isRequired,
  setEntry: PropTypes.func.isRequired,
};

export default TypeYesNo;
