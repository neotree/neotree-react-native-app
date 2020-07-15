import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, Left, Right, Switch } from 'native-base';
import { useConfigKeysContext } from '@/contexts/config_keys';
import Content from '@/components/Content';
import Text from '@/components/Text';

const ListItemComponent = ({ item }) => {
  const data = { ...item, ...item.data };

  const { state: { configuration }, saveConfiguration } = useConfigKeysContext();

  const selected = !!configuration[data.configKey];

  const onPress = () => saveConfiguration({ [data.configKey]: !selected });

  return (
    <>
      <Content padder>
        <ListItem
          selected={false}
        >
          <Left>
            <Text>{data.label}</Text>
          </Left>
          <Right>
            <Switch
              value={selected}
              onValueChange={() => onPress()}
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
