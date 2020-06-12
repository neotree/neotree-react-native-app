import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Radio from '@/ui/Radio';
import RadioGroup from '@/ui/RadioGroup';

const SingleSelect = ({ screen, value, onChange }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || {});

  React.useEffect(() => {
    onChange(!entry.value ? null : entry);
  }, [entry]);

  return (
    <>
      <View>
        <RadioGroup
          value={entry.value}
          onChange={e => setEntry({
            value: e.value,
            item: (metadata.items || []).filter(item => item.id === e.value)[0]
          })}
        >
          {(metadata.items || []).map((item) => {
            return (
              <React.Fragment key={item.label}>
                <Radio
                  variant="outlined"
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
