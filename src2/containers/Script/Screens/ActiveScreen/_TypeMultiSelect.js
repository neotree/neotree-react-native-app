import React from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/Select';

const TypeMultiSelect = ({ entry: _entry, screen, setEntry: onChange }) => {
  const value = _entry ? _entry.values.reduce((acc, { value }) => ({ values: [...acc, ...value] }), []) : null;
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || { values: [] });

  React.useEffect(() => {
    onChange(!entry.values.length ? undefined : {
      values: [{
        key: metadata.key,
        type: metadata.dataType,
        value: entry.values,
      }],
    });
  }, [entry]);

  return (
    <>
      <Select
        variant="checkbox"
        value={entry.values.map(e => e.value)}
        options={(metadata.items || []).map(item => ({
          label: item.label,
          value: item.id,
          disabled: (() => {
            const exclusive = entry.values.reduce((acc, item) => {
              if (item.exclusive) acc = item.value;
              return acc;
            }, null);
            return exclusive ? exclusive !== item.id : false;
          })(),
        }))}
        onChange={(opt, i) => {
          const item = (metadata.items || [])[i];
          const checked = entry.values.map(s => s.value).indexOf(item.id) > -1;
          const value = item.id;
          const _checked = !checked;
          const exclusives = metadata.items
            .filter(item => item.exclusive)
            .map(item => item.id);

          const _entry = {
            value,
            valueText: item.label,
            label: item.label,
            key: metadata.key,
            type: metadata.dataType,
            dataType: item.dataType,
            exclusive: item.exclusive,
            confidential: item.confidential,
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

TypeMultiSelect.propTypes = {
  entry: PropTypes.object,
  screen: PropTypes.object.isRequired,
  setEntry: PropTypes.func.isRequired,
};

export default TypeMultiSelect;