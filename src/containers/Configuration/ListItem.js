import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, Left, Right, Switch, Content, Text } from 'native-base';
import { useConfigKeysContext } from '@/contexts/config_keys';

const ListItemComponent = ({ item }) => {
  const data = { ...item, ...item.data };

  const { state: { configuration }, saveConfiguration } = useConfigKeysContext();

  const selected = configuration[item.id] ? true : false;

  const onPress = () => saveConfiguration({ [item.id]: !selected });

  return (
    <>
      <Content padder>
        <ListItem
          selected={false}
          onPress={() => onPress()}
        >
          <Left>
            <Text>{data.label}</Text>
          </Left>
          <Right>
            <Switch
              value={selected}
              onPress={() => onPress()}
            />
          </Right>
        </ListItem>
      </Content>
    </>
  );
};

ListItemComponent.propTypes = {
  item: PropTypes.object.isRequired
};

export default ListItemComponent;
