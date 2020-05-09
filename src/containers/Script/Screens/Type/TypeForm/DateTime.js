import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';

const useStyles = makeStyles(theme => ({
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  gridItem: {
    flex: 1,
    padding: 5,
  },
}));

const DateTime = ({ field }) => {
  const styles = useStyles();

  const [date, setDate] = React.useState(null);
  const [time, setTime] = React.useState(null);

  return (
    <>
      {!field.label ? null : <Typography>{field.label}</Typography>}

      <View style={[styles.gridContainer]}>
        <View style={[styles.gridItem]}>
          <DatePicker
            value={date}
            placeholder={formCopy.SELECT_DATE}
            onChange={(e, date) => setDate(date)}
          />
        </View>

        <View style={[styles.gridItem]}>
          <DatePicker
            mode="time"
            value={time}
            placeholder={formCopy.SELECT_TIME}
            onChange={(e, time) => setTime(time)}
          />
        </View>
      </View>
    </>
  );
};

DateTime.propTypes = {
  field: PropTypes.object.isRequired
};

export default DateTime;
