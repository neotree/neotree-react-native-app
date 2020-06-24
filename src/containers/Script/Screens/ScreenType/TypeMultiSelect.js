import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { ListItem, Body } from 'native-base';
import CheckBox from '@/components/CheckBox';
import Text from '@/components/Text';

const MultiSelect = ({ screen, value, onChange }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || { values: [] });

  React.useEffect(() => {
    onChange(!entry.values.length ? undefined : entry);
  }, [entry]);

  return (
    <>
      <View>
        {(metadata.items || [])
          .map((item) => {
            const checked = entry.values.map(s => s.value).indexOf(item.id) > -1;

            const onPress = () => {
              const value = item.id;
              const _checked = !checked;
              const exclusives = metadata.items
                .filter(item => item.exclusive)
                .map(item => item.id);
              if (item.exclusive) {
                setEntry(entry => {
                  return {
                    ...entry,
                    values: _checked ? [{ value, label: item.label, key: item.id, type: item.dataType || item.type, }] : []
                  };
                });
              } else {
                setEntry(entry => {
                  return {
                    ...entry,
                    values: (
                      _checked ?
                        [...entry.values, { value, label: item.label, key: item.id, }]
                        :
                        entry.values.filter(s => s.value !== value)
                    ).filter(s => exclusives.indexOf(s.value) < 0)
                  };
                });
              }
            };

            return (
              <React.Fragment key={item.id}>
                <ListItem onPress={onPress}>
                  <CheckBox
                    checked={checked}
                    onPress={onPress}
                  />
                  <Body>
                    <Text>{item.label}</Text>
                  </Body>
                </ListItem>
              </React.Fragment>
            );
          })}
      </View>
    </>
  );
};

MultiSelect.propTypes = {
  screen: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default MultiSelect;
