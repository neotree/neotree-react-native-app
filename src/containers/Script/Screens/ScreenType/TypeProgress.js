import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Text from '@/components/Text';
import { Icon } from 'native-base';

const Progress = ({ screen, onChange }) => {
  const metadata = screen.data.metadata || {};

  React.useEffect(() => {
    onChange({ values: [] });
  }, []);

  return (
    <>
      <View>
        {metadata.items.map((item, i) => {
          const key = i;
          return (
            <View
              key={key}
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                padding: 10,
              }}
            >
              <View style={{ marginRight: 10 }}>
                <Icon
                  style={{
                    fontSize: 40,
                    color: item.checked ? 'green' : '#ccc'
                  }}
                  name="checkmark-circle-outline"
                />
              </View>

              <View style={{ flex: 1, }}>
                <Text>{item.label}</Text>
              </View>
            </View>
          );
        })}
        <Text />
      </View>
    </>
  );
};

Progress.propTypes = {
  screen: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default Progress;
