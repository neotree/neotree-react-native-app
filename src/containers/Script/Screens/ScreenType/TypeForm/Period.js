import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';
import moment from 'moment';

const Period = ({ form, field, value, onChange, conditionMet, }) => {
  const [calcFrom, setCalcFrom] = React.useState(null);
  const [date, setDate] = React.useState(value);

  React.useEffect(() => {
    const calcFrom = form.values.filter(v => `$${v.key}` === field.calculation)[0];
    setCalcFrom(calcFrom);
    if (calcFrom) setDate(calcFrom.value);
  }, [form]);

  const onDateChange = (e, date) => {
    if (calcFrom) return;
    setDate(date);
    onChange(date);
  };

  React.useEffect(() => {
    const v = value ? new Date(value).toString() : null;
    const d = date ? new Date(date).toString() : null;
    if (!calcFrom && (v !== d)) onChange(date);
  });

  return (
    <>
      <DatePicker
        enabled={conditionMet}
        editable={!calcFrom}
        value={date}
        placeholder={formCopy.SELECT_DATE}
        onChange={onDateChange}
        formatDate={d => {
          const now = moment();
          const days = now.diff(new Date(d), 'days');
          const hrs = now.diff(new Date(d), 'hours') - (days * 24);
          const v = [];
          if (days) v.push(`${days} day(s)`);
          v.push(hrs ? `${hrs} hour(s)` : days ? '' : 'Less than an hour');
          return v.filter(s => s).join(', ');
        }}
      >
        {field.label}{field.optional ? '' : ' *'}
      </DatePicker>
    </>
  );
};

Period.propTypes = {
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  conditionMet: PropTypes.bool,
  value: PropTypes.any,
};

export default Period;
