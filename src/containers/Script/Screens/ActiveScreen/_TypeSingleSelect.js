import React from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/Select';
import { useContext } from '../../Context';

const TypeSingleSelect = ({ canAutoFill, screen, entry: value, setEntry: onChange }) => {
  const { state: { autoFill } } = useContext();
  const metadata = screen.data.metadata || {};

  const [entry, _setEntry] = React.useState(value || { values: [] });
  const setEntry = item => _setEntry({
    values: [{
      value: item.id,
      valueText: item.label,
      label: item.label,
      key: metadata.key,
      type: item.type,
      dataType: metadata.dataType,
      confidential: item.confidential,
    }]
  });

  React.useEffect(() => {
    onChange(!entry.values.length ? undefined : entry);
  }, [entry]);

  const opts = (metadata.items || []).map(item => ({
    label: item.label,
    value: item.id,
  }));

  const autoFillFields = React.useCallback(() => {
    if (autoFill.session && canAutoFill) {
      const autoFillObj = autoFill.session.data.entries[metadata.key];
      let autoFillVal = null;
      if (autoFillObj) {
        autoFillVal = autoFillObj.values.value[0];
        const opt = (metadata.items || []).filter(o => o.id === autoFillVal)[0];
        if (opt) setEntry(opt);
      }
    }
  }, [metadata, canAutoFill, autoFill, metadata, entry]);

  React.useEffect(() => { autoFillFields(); }, [autoFill]);

  return (
    <>
      <Select
        variant="radio"
        value={entry.values.map(e => e.value)}
        options={opts}
        onChange={(item, i) => {
          item = (metadata.items || [])[i];
          setEntry(item);
        }}
      />
    </>
  );
};

TypeSingleSelect.propTypes = {
  entry: PropTypes.object,
  screen: PropTypes.object.isRequired,
  setEntry: PropTypes.func.isRequired,
  canAutoFill: PropTypes.bool,
};

export default TypeSingleSelect;
