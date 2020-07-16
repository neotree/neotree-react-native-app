import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Text from '@/components/Text';
import { List, ListItem, Body } from 'native-base';

const TypeList = ({ screen, onChange }) => {
  const metadata = screen.data.metadata || {};

  React.useEffect(() => {
    onChange({ values: [] });
  }, []);

  return (
    <>
      <List>
        {metadata.items.map((item, i) => {
          const key = i;
          return (
            <ListItem 
              key={key}
              noIndent
            >
              <Body style={{ flex: 1, }}>
                <Text>{item.label}</Text>
                <Text note>{item.summary}</Text>
              </Body>
            </ListItem>
          );
        })}
        <Text />
      </List>
    </>
  );
};

TypeList.propTypes = {
  screen: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default TypeList;
