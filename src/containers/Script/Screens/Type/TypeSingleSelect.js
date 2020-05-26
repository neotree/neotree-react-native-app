import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Radio from '@/ui/Radio';
import RadioGroup from '@/ui/RadioGroup';

const SingleSelect = ({ screen, context }) => {
  const { metadata } = screen.data;

  const _value = context.state.form[screen.id] ? context.state.form[screen.id].form.value : '';

  const [selected, setSelected] = React.useState(_value || null);

  React.useEffect(() => {
    context.setForm({
      [screen.id]: !selected ? undefined : {
        key: metadata ? metadata.key : undefined,
        form: { key: metadata.key, value: selected }
      }
    });
  }, [selected]);

  return (
    <>
      <View>
        <RadioGroup
          value={selected}
          onChange={e => setSelected(e.value)}
        >
          {(metadata.items || []).map((item) => {
            return (
              <React.Fragment key={item.label}>
                <Radio
                  label={item.label}
                  value={item.id}
                />
              </React.Fragment>
            );
          })}
        </RadioGroup>
      </View>
    </>
  );
};

SingleSelect.propTypes = {
  screen: PropTypes.object,
  context: PropTypes.object.isRequired,
};

export default SingleSelect;
