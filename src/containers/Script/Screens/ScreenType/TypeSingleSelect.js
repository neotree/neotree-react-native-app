import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Radio from '@/ui/Radio';
import RadioGroup from '@/ui/RadioGroup';

const SingleSelect = ({ screen, value, onChange }) => {
  const metadata = screen.data.metadata || {};

  const [selected, setSelected] = React.useState(value || null);

  // React.useEffect(() => {
  //   context.setForm({
  //     [screen.id]: !selected ? undefined : {
  //       key: metadata ? metadata.key : undefined,
  //       form: selected
  //     }
  //   });
  // }, [selected]);

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
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default SingleSelect;
