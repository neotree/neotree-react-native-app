import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Radio from '@/ui/Radio';
import RadioGroup from '@/ui/RadioGroup';

const YesNo = ({ screen, onChange, value }) => {
  const metadata = screen.data.metadata || {};

  const [selected, setSelected] = React.useState(value ? value.value : null);

  React.useEffect(() => {
    onChange(!selected ? null : { value: selected });
  }, [selected]);

  return (
    <>
      <View>
        <RadioGroup
          name={metadata.key}
          value={selected}
          onChange={e => setSelected(e.value)}
        >
          <Radio
            label={metadata.positiveLabel}
            value="yes"
          />
          <Radio
            label={metadata.negativeLabel}
            value="no"
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
