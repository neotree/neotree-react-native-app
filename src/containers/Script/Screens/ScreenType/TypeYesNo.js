import React from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/Select';

const YesNo = ({ screen, onChange, value }) => {
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

YesNo.propTypes = {
  screen: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default YesNo;
