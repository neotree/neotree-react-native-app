import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Radio from '@/ui/Radio';
import RadioGroup from '@/ui/RadioGroup';

const YesNo = ({ screen, context }) => {
  const { metadata } = screen.data;

  const _value = context.state.form[screen.id] ? context.state.form[screen.id].form : '';

  const [selected, setSelected] = React.useState(_value || null);

  React.useEffect(() => {
    context.setForm({
      [screen.id]: !selected ? undefined : {
        key: metadata ? metadata.key : undefined,
        form: selected
      }
    });
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
  context: PropTypes.object.isRequired,
};

export default YesNo;
