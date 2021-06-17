import React from 'react';
import PropTypes from 'prop-types';
import { TouchableWithoutFeedback, View } from 'react-native';
import { Card, CardItem, Body, Text } from 'native-base';
import theme from '~/native-base-theme/variables/commonColor';

const Select = ({ options, value, variant, onChange, }) => {
  variant = variant || 'checkbox';
  value = value ? value.map ? value : [value] : [];
 
  return (
    <>
      {options.map((o, i) => {
        const key = i;
        const isSelected = value.indexOf(o.value) > -1;
        return (
          <View key={key} style={{ marginBottom: 10 }}>
            <TouchableWithoutFeedback          
              onPress={() => !o.disabled && onChange(o, i)}
            >
              <Card transparent={o.disabled}>
                <CardItem style={[
                  !isSelected ? null : { backgroundColor: theme.brandPrimary },
                  !o.disabled ? null : { backgroundColor: '#f5f5f5' },
                ]}
                >
                  <Body style={{ alignItems: 'center', }}>
                    <Text
                      style={[
                        { fontSize: 20, padding: 5 },
                        !isSelected ? null : { color: '#fff' },
                        !o.disabled ? null : { color: '#999' },
                      ]}
                    >{o.label}</Text>
                  </Body>
                </CardItem>
              </Card>
            </TouchableWithoutFeedback>
          </View>
        );
      })}
    </>
  );
};

Select.propTypes = {
  variant: PropTypes.oneOf(['checkbox', 'radio']),
  options: PropTypes.arrayOf(PropTypes.shape({
    disabled: PropTypes.bool,
    exclusive: PropTypes.bool,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
    label: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
  })),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ])),
  ]),
  onChange: PropTypes.func.isRequired,
};

export default Select;
