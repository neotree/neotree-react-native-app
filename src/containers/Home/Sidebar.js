import React from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { useHistory } from 'react-router-native';
import Logo from '@/components/Logo';
import theme from '~/native-base-theme/variables/commonColor';
import { Icon, List, ListItem, Left, Body } from 'native-base';
import SignOutBtn from '@/components/SignOutBtn';
import Text from '@/components/Text';
import { useAppContext } from '@/AppContext';
import * as api from '@/api';
import { saveApplication } from '../../api';

const Sidebar = () => {
  const { setState: setAppState, state: { application } } = useAppContext();
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

            <ListItem
              avatar
              style={{ padding: 10 }}
              onPress={() => {
                const mode = application.mode === 'development' ? 'production' : 'development';
                Alert.alert(
                  'Switch mode',
                  `Are you sure you want to ${application.mode === 'development' ? 'leave' : 'enter'} development mode?`,
                  [
                    {
                      text: 'Cancel',
                      onPress: () => {},
                      style: 'cancel'
                    },
                    {
                      text: 'Ok',
                      onPress: () => {
                        (async () => {
                          setAppState({ displaySplash: true, });
                          try {
                            const application = await saveApplication({ mode });
                            await api.sync({ force: true });
                            setAppState({ application });
                          } catch (e) { alert(e.message); } // eslint-disable-line
                          setAppState({ displaySplash: false });
                        })();
                      }
                    }
                  ],
                  { cancelable: false }
                );
              }}
            >
              <Left>
                <Icon style={{ color: '#999' }} name="laptop" />
              </Left>
              <Body style={{ borderColor: 'transparent' }}>
                <Text>{application.mode === 'development' ? 'Live' : 'Development'}</Text>
              </Body>
            </ListItem>
          </List>
        </View>
      </ScrollView>
    </>
  );
};

export default Sidebar;