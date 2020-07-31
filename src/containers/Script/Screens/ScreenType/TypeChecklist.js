import React from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/Select';

const Checklist = ({ screen, value, onChange }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || { values: [] });

  React.useEffect(() => {
    onChange(!entry.values.length ? undefined : entry);
  }, [entry]);

  return (
    <>
      <Select
        variant="checkbox"
        options={(metadata.items || []).map(item => ({
          label: item.label,
          value: item.key,
          confidential: item.confidential,
          disabled: (() => {
            const exclusive = entry.values.reduce((acc, item) => {
              if (item.exclusive) acc = item.value;
              return acc;
            }, null);
            return exclusive ? exclusive !== item.key : false;
          })(),
        }))}
        value={entry.values.map(e => e.value)}
        onChange={(item, i) => {
          item = (metadata.items || [])[i];

          const checked = entry.values.map(s => s.value).indexOf(item.key) > -1;

          const value = item.key;
          const _checked = !checked;
          const exclusives = metadata.items
            .filter(item => item.exclusive)
            .map(item => item.key);

          const _entry = {
            value,
            valueText: item.label,
            label: item.label,
            key: metadata.key || item.key,
            type: item.type,
            dataType: item.dataType,
            exclusive: item.exclusive,
          };

          if (item.exclusive) {
            setEntry(entry => {
              return {
                ...entry,
                values: _checked ? [_entry] : []
              };
            });
          } else {
            setEntry(entry => {
              return {
                ...entry,
                values: (
                  _checked ?
                    [...entry.values, _entry]
                    :
                    entry.values.filter(s => s.value !== value)
                ).filter(s => exclusives.indexOf(s.value) < 0)
              };
            });
          }
        }}
      />
    </>
  );
};

Checklist.propTypes = {
  screen: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default Checklist;
