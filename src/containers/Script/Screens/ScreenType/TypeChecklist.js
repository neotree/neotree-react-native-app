import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { ListItem, Body } from 'native-base';
import CheckBox from '@/components/CheckBox';
import Text from '@/components/Text';

const Checklist = ({ screen, value, onChange }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || { value: [] });

  React.useEffect(() => {
    onChange(!entry.value.length ? undefined : entry);
  }, [entry]);

  return (
    <>
      <View>
        {(metadata.items || [])
          .map((item) => {
            const checked = entry.value.map(s => s.value).indexOf(item.key) > -1;

            const onPress = () => {
              const value = item.key;
              const _checked = !checked;
              const exclusives = metadata.items
                .filter(item => item.exclusive)
                .map(item => item.key);
              if (item.exclusive) {
                setEntry(entry => {
                  return {
                    ...entry,
                    value: _checked ? [{ value, item }] : []
                  };
                });
              } else {
                setEntry(entry => {
                  return {
                    ...entry,
                    value: (
                      _checked ?
                        [...entry.value, { value, item }]
                        :
                        entry.value.filter(s => s.value !== value)
                    ).filter(s => exclusives.indexOf(s.value) < 0)
                  };
                });
              }
            };

            return (
              <React.Fragment key={item.key}>
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

Checklist.propTypes = {
  screen: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default Checklist;
