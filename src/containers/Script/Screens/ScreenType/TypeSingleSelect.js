import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { ListItem, Right, Left, Radio } from 'native-base';
import Text from '@/components/Text';

const SingleSelect = ({ screen, value, onChange }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || { values: [] });

  const _value = entry.values[0] ? entry.values[0].value : null;

  React.useEffect(() => {
    onChange(!entry.values.length ? undefined : entry);
  }, [entry]);

  return (
    <>
      <View>
        {(metadata.items || []).map(item => {
          const onChange = setEntry({ values: [{ value: item.id, label: item.label, key: item.id, type: item.dataType || item.type, }] });
          return (
            <ListItem
              key={item.id}
              selected={_value === item.id}
              onPress={() => onChange()}
            >
              <Left>
                <Text>{item.label}</Text>
              </Left>
              <Right>
                <Radio
                  selected={entry.value === item.id}
                  onPress={() => onChange()}
                />
              </Right>
            </ListItem>
          );
        })}
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
