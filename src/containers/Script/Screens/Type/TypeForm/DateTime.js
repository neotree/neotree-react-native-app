import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';

const useStyles = makeStyles(() => ({
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  gridItem: {
    flex: 1,
    padding: 5,
  },
}));

const DateTime = ({ field, onChange, value, conditionMet, }) => {
  const styles = useStyles();

  const [date, setDate] = React.useState(null);
  const [time, setTime] = React.useState(null);

  const onDateChange = (e, date) => {
    const time = `${date.getHours()}:${date.getMinutes()}`;
    setDate(date);
    if (date) setTime(time);
    onChange({ time, date });
  };

  React.useEffect(() => {
    if (value) {
      if (value.date !== date) setDate(value.date);
      if (value.time !== time) setTime(value.time);
    }
    if (field.defaultValue && !date) onDateChange(null, new Date());
  }, [value]);

  return (
    <>
      {!field.label ? null : <Typography>{field.label}</Typography>}

      <View style={[styles.gridContainer]}>
        <View style={[styles.gridItem]}>
          <DatePicker
            enabled={conditionMet}
            value={date || null}
            placeholder={formCopy.SELECT_DATE}
            onChange={onDateChange}
          />
        </View>

        <View style={[styles.gridItem]}>
          <DatePicker
            enabled={date ? conditionMet : false}
            mode="time"
            value={date || null}
            placeholder={formCopy.SELECT_TIME}
            onChange={onDateChange}
          />
        </View>
      </View>
    </>
  );
};

DateTime.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default DateTime;
