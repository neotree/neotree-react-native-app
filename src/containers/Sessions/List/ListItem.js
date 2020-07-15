import React from 'react';
import PropTypes from 'prop-types';
import Divider from '@/components/Divider';
import { Link } from 'react-router-native';
import { View } from 'react-native';
import moment from 'moment';
import { Card, CardItem, Body } from 'native-base';
import Content from '@/components/Content';
import Text from '@/components/Text';

const ListItem = ({ item }) => {
  return (
    <>
      <View style={{ flex: 1 }}>
        <Content>
          <Link
            to={`/sessions/session/${item.id}`}
            style={[{ flex: 1 }]}
          >
            <Card>
              <CardItem>
                <Body>
                  <View style={[{ flexDirection: 'row' }]}>
                    <View style={[{ flex: 1 }]}>
                      <Text style={{ color: '#999' }}>Creation date</Text>
                      <Text>
                        {moment(new Date(item.data.started_at)).format('DD MMM, YYYY HH:MM')}
                      </Text>
                    </View>

                    <View style={[{ flex: 1 }]}>
                      <Text style={{ color: '#999' }}>Completion date</Text>
                      <Text>
                        {item.data.completed_at ?
                          moment(new Date(item.data.completed_at)).format('DD MMM, YYYY HH:MM')
                          :
                          'N/A'}
                      </Text>
                    </View>
                  </View>

                  <Divider border={false} />

                  <Text style={{ color: '#999' }}>Script</Text>
                  <Text>{item.data.script.data.title}</Text>
                </Body>
              </CardItem>
            </Card>
          </Link>
        </Content>
      </View>
    </>
  );
};

ListItem.propTypes = {
  item: PropTypes.object.isRequired,
};

export default ListItem;
