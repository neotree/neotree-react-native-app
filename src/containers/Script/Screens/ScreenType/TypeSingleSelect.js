import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { ListItem, Right, Left, Radio } from 'native-base';
import Text from '@/components/Text';

const SingleSelect = ({ screen, value, onChange }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || {});

  React.useEffect(() => {
    onChange(!entry.value ? null : entry);
  }, [entry]);

  return (
    <>
      <View>
        {(metadata.items || []).map(item => (
          <ListItem
            key={item.id}
            selected={entry.value === item.id}
            onPress={() => setEntry({ value: item.id, item })}
          >
            <Left>
              <Text>{item.label}</Text>
            </Left>
            <Right>
              <Radio
                selected={entry.value === item.id}
                onPress={() => setEntry({ value: item.id })}
              />
            </Right>
          </ListItem>
        ))}
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
