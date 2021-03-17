import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Text from '@/components/Text';
import { Icon } from 'native-base';
import theme from '~/native-base-theme/variables/commonColor';

const TypeProgress = ({ screen, setEntry: onChange }) => {
  const metadata = screen.data.metadata || {};

  React.useEffect(() => {
    onChange({ values: [] });
  }, []);

  const items = metadata.items || [];

  return (
    <>
      <View>
        {items.map((item, i) => {
          const key = i;
          return (
            <View
              key={key}
              style={{
                flexDirection: 'row',
              }}
            >
              <View
                style={{
                  marginRight: 10,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderWidth: 2,
                    borderColor: item.checked ? 'green' : '#999',
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    style={{
                      fontSize: 30,
                      color: item.checked ? 'green' : '#ccc'
                    }}
                    name="checkmark"
                  />
                </View>

                {i < (items.length - 1) && (
                  <View
                    style={{
                      width: 2,
                      minHeight: 20,
                      backgroundColor: '#ccc',
                      flex: 1,
                    }}
                  />
                )}
              </View>

              <View style={{ flex: 1, marginTop: 2 }}>
                <Text style={{ fontSize: 22 }}>{item.label}</Text>
              </View>
            </View>
          );
        })}
        <Text />
      </View>
    </>
  );
};

TypeProgress.propTypes = {
  screen: PropTypes.object,
  setEntry: PropTypes.func.isRequired,
};

export default TypeProgress;
