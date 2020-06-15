import React from 'react';
import { ScrollView, View } from 'react-native';
import { Link } from 'react-router-native';
import Logo from '@/components/Logo';
import theme from '@/native-base-theme/variables/material';
import { Text, Icon } from 'native-base';
import SignOutBtn from '@/components/SignOutBtn';

const styles = {
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  linkIcon: {
    marginRight: 10,
  }
};

const Sidebar = () => {
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

          <Link style={[styles.link]} to="/configuration">
            <>
              <Icon style={[styles.linkIcon]} disabled active name="settings" />
              <Text>Configuration</Text>
            </>
          </Link>

          <Link style={[styles.link]} to="/sessions">
            <>
              <Icon style={[styles.linkIcon]} disabled active name="folder-open" />
              <Text>History</Text>
            </>
          </Link>

          <SignOutBtn
            icon={<Icon disabled active name="log-out" />}
          />
        </View>
      </ScrollView>
    </>
  );
};

export default Sidebar;
