import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { ListItem, Text, Right, Left, Radio } from 'native-base';

const YesNo = ({ screen, onChange, value }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || {});

  React.useEffect(() => {
    onChange(!entry.value ? null : entry);
  }, [entry]);

  const opts = [
    { value: 'Yes', label: metadata.positiveLabel || 'Yes' },
    { value: 'No', label: metadata.negativeLabel || 'No' },
  ];

  return (
    <>
      <View>
        {/*<Text>{metadata.label}</Text>*/}

        {opts.map(opt => (
          <ListItem
            key={opt.value}
            selected={entry.value === opt.value}
            onPress={() => setEntry({ value: opt.value })}
          >
            <Left>
              <Text>{opt.label}</Text>
            </Left>
            <Right>
              <Radio
                selected={entry.value === opt.value}
                onPress={() => setEntry({ value: opt.value })}
              />
            </Right>
          </ListItem>
        ))}
      </View>
    </>
  );
};

YesNo.propTypes = {
  screen: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default YesNo;
