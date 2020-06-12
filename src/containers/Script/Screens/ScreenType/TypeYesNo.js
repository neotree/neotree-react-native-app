import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Radio from '@/ui/Radio';
import Divider from '@/ui/Divider';
import RadioGroup from '@/ui/RadioGroup';
import Typography from '@/ui/Typography';

const YesNo = ({ screen, onChange, value }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || {});

  React.useEffect(() => {
    onChange(!entry.value ? null : entry);
  }, [entry]);

  return (
    <>
      <View>
        <Typography>{metadata.label}</Typography>
        <Divider border={false} />
        <RadioGroup
          name={metadata.key}
          value={entry.value}
          onChange={e => setEntry({ value: e.value })}
        >
          <Radio
            variant="outlined"
            label={metadata.positiveLabel}
            value="Yes"
          />
          <Radio
            variant="outlined"
            label={metadata.negativeLabel}
            value="No"
          />
        </RadioGroup>
      </View>
    </>
  );
};

YesNo.propTypes = {
  screen: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default YesNo;
