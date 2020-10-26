import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-native';
import { Card, CardItem, Body } from 'native-base';
import Text from '@/components/Text';
import Content from '@/components/Content';

const ListItem = ({ item }) => {
  return (
    <>
      <Content>
        <Link
          to={`/script/${item.script_id}`}
        >
          <Card>
            <CardItem>
              <Body>
                <Text>{item.data.title}</Text>
                <Text style={{ color: '#999', marginTop: 8 }}>{item.data.description}</Text>
              </Body>
            </CardItem>
          </Card>
        </Link>
      </Content>
    </>
  );
};

ListItem.propTypes = {
  item: PropTypes.object.isRequired
};

export default ListItem;
