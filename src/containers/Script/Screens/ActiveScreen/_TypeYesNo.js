import React from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/Select';
import { useContext } from '../../Context';

const TypeYesNo = ({ canAutoFill, screen, entry: value, setEntry: onChange }) => {
  const { state: { autoFill } } = useContext();
  const metadata = screen.data.metadata || {};

  const [entry, _setEntry] = React.useState(value || { values: [] });
  const setEntry = data => _setEntry({
    values: [{
      value: data.value,
      confidential: metadata.confidential,
      valueText: data.value === 'false' ? 'No' : 'Yes',
      key: metadata.key || data.key,
      label: data.label,
      type: metadata.dataType || data.type,
      dataType: metadata.dataType,
    }],
  });

  React.useEffect(() => {
    onChange(!entry.values.length ? undefined : entry);
  }, [entry]);

  const opts = [
    { value: 'true', label: metadata.positiveLabel || 'Yes' },
    { value: 'false', label: metadata.negativeLabel || 'No' },
  ];

  const autoFillFields = React.useCallback(() => {
    if (autoFill.session && canAutoFill) {
      const autoFillObj = autoFill.session.data.entries[metadata.key];
      let autoFillVal = null;
      if (autoFillObj) {
        autoFillVal = autoFillObj.values.value[0];
        if ((autoFillVal !== null) || (autoFillVal !== undefined)) autoFillVal = autoFillVal.toString();
        const opt = opts.filter(o => o.value === autoFillVal)[0];
        if (opt) setEntry({ ...opt, value: autoFillVal, });
      }
    }
  }, [opts, canAutoFill, autoFill, metadata, entry]);

  React.useEffect(() => { autoFillFields(); }, [autoFill]);

  return (
    <>
      <Select
        variant="radio"
        options={opts}
        value={entry.values.map(e => e.value)}
        onChange={opt => { setEntry(opt); }}
      />
    </>
  );
};

TypeYesNo.propTypes = {
  entry: PropTypes.object,
  screen: PropTypes.object.isRequired,
  setEntry: PropTypes.func.isRequired,
  canAutoFill: PropTypes.bool,
};

export default TypeYesNo;
