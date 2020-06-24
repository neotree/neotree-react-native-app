import React from 'react';
import { ScrollView, View } from 'react-native';
import { useHistory } from 'react-router-native';
import Logo from '@/components/Logo';
import theme from '@/native-base-theme/variables/material';
import { Icon, List, ListItem, Left, Body } from 'native-base';
import SignOutBtn from '@/components/SignOutBtn';
import Text from '@/components/Text';

const Sidebar = () => {
  const history = useHistory();

  return (
    <>
      <ScrollView
        style={[
          {
            flex: 1,
            backgroundColor: '#fff'
          }
        ]}
      >
        <View>
          <View
            style={[
              {
                height: 200,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.buttonPrimaryBg
              }
            ]}
          >
            <Logo color="white" />
          </View>

          <List>
            {[
              { icon: 'settings', label: 'Configuration', link: '/configuration' },
              { icon: 'folder-open', label: 'History', link: '/sessions' },
            ].map(opt => {
              return (
                <ListItem
                  avatar
                  key={opt.label}
                  onPress={() => history.push(opt.link)}
                  style={{ padding: 10 }}
                >
                  <Left>
                    <Icon style={{ color: '#999' }} name={opt.icon} />
                  </Left>
                  <Body style={{ borderColor: 'transparent' }}>
                    <Text>{opt.label}</Text>
                  </Body>
                </ListItem>
              );
            })}
            <ListItem avatar style={{ padding: 10 }}>
              <Left>
                <Icon style={{ color: '#999' }} name="log-out" />
              </Left>
              <Body style={{ borderColor: 'transparent' }}>
                <SignOutBtn />
              </Body>
            </ListItem>
          </List>
        </View>
      </ScrollView>
    </>
  );
};

export default Sidebar;
