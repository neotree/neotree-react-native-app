import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { ListItem, Right, Left, Radio } from 'native-base';
import Text from '@/components/Text';

const YesNo = ({ screen, onChange, value }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || { values: [] });

  React.useEffect(() => {
    onChange(!entry.values.length ? undefined : entry);
  }, [entry]);

  const opts = [
    { value: 'Yes', label: metadata.positiveLabel || 'Yes' },
    { value: 'No', label: metadata.negativeLabel || 'No' },
  ];

  const _value = entry.values[0] ? entry.values[0].value : null;

  return (
    <>
      <View>
        {/*<Text>{metadata.label}</Text>*/}

        {opts.map(opt => {
          return (
            <ListItem
              key={opt.value}
              selected={_value === opt.value}
              onPress={() => setEntry({ value: opt.value })}
            >
              <Left>
                <Text>{opt.label}</Text>
              </Left>
              <Right>
                <Radio
                  selected={_value === opt.value}
                  onPress={() => setEntry({ values: [{ value: opt.value, key: opt.key || metadata.key, label: opt.label, type: opt.dataType || opt.type, }], })}
                />
              </Right>
            </ListItem>
          );
        })}
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
