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

  const [date, setDate] = React.useState(field.defaultValue ? value || new Date() : value);

  const onDateChange = (e, date) => {
    setDate(date);
    onChange(date);
  };

  React.useEffect(() => {
    const v = value ? new Date(value).toString() : null;
    const d = date ? new Date(date).toString() : null;
    if (v !== d) onChange(date);
  });

  return (
    <>
      {!field.label ? null : (
        <Typography
          {...conditionMet ? null : { style: { color: '#ccc' } }}
        >
          {field.label}
        </Typography>
      )}

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
