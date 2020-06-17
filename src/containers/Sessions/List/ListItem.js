import React from 'react';
import PropTypes from 'prop-types';
import Divider from '@/components/Divider';
import { Link } from 'react-router-native';
import { View } from 'react-native';
import moment from 'moment';
import { Card, CardItem, Body, Content, Text, CheckBox } from 'native-base';

const ListItem = ({ item, selectedItems, canSelectItems, selectItems }) => {
  return (
    <>
      <View style={{ flex: 1 }}>
        <Content padder>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {canSelectItems && (
              <View style={{ marginRight: 20 }}>
                <CheckBox
                  checked={selectedItems.indexOf(item.id) > -1}
                  onPress={() => selectItems(item.id)}
                />
              </View>
            )}

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
                        <Text style={[{ fontSize: 15 }]}>
                          {moment(item.data.started_at).format('DD MMM, YYYY HH:MM')}
                        </Text>
                      </View>

                      <View style={[{ flex: 1 }]}>
                        <Text style={{ color: '#999' }}>Completion date</Text>
                        <Text style={[{ fontSize: 15 }]}>
                          {item.data.completed_at ?
                            moment(item.data.completed_at).format('DD MMM, YYYY HH:MM')
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
          </View>
        </Content>
      </View>
    </>
  );
};

ListItem.propTypes = {
  item: PropTypes.object.isRequired,
  selectedItems: PropTypes.array.isRequired,
  selectItems: PropTypes.func.isRequired,
  canSelectItems: PropTypes.bool,
};

export default ListItem;
