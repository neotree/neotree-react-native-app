import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';
import moment from 'moment';

const formatDate = d => {
  if (!d) return '';
  const now = moment();
  const days = now.diff(new Date(d), 'days');
  const hrs = now.diff(new Date(d), 'hours') - (days * 24);
  const v = [];
  if (days) v.push(`${days} day(s)`);
  v.push(hrs ? `${hrs} hour(s)` : days ? '' : moment(d).fromNow().replace(' ago', ''));
  return v.filter(s => s).join(', ');
};

const _Period = ({ form, field, value, onChange: _onChange, conditionMet, }) => {
  const onChange = (d, error) => _onChange(d, {
    error,
    valueText: d ? formatDate(d) : null,
    exportValue: d ? formatDate(d) : null,
  });
  const calcFrom = form.values.filter(v => `$${v.key}` === field.calculation)[0];
  const [date, setDate] = React.useState(field.defaultValue ? value || new Date() : value);

  React.useEffect(() => {
    if (calcFrom) onChange(calcFrom.value);
  }, [calcFrom, value]);

  const onDateChange = (e, date) => {
    setDate(date);
    onChange(date.toISOString());
  };

  React.useEffect(() => {
    if (!calcFrom) {
      const v = value ? new Date(value).toISOString() : null;
      const d = date ? new Date(date).toISOString() : null;
      if (v !== d) onChange(date);
    }
  });

  return (
    <>
      <DatePicker
        enabled={conditionMet}
        editable={!calcFrom}
        value={calcFrom ? value : date}
        placeholder="Select" // {field.calculation || formCopy.SELECT_DATE}
        onChange={calcFrom ? (() => {}) : onDateChange}
        formatDate={formatDate}
      >
        {field.label}{field.optional ? '' : ' *'}
      </DatePicker>
    </>
  );
};

_Period.propTypes = {
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  conditionMet: PropTypes.bool,
  value: PropTypes.any,
};

export default _Period;
