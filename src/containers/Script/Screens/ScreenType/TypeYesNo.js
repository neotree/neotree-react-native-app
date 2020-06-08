import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Radio from '@/ui/Radio';
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
        <RadioGroup
          name={metadata.key}
          value={entry.value}
          onChange={e => setEntry({ value: e.value })}
        >
          <Radio
            label={metadata.positiveLabel}
            value="Yes"
          />
          <Radio
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
