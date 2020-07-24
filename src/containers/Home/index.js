import React from 'react';
import { View } from 'react-native';
import { provideHomeContext } from '@/contexts/home';
import { useHistory } from 'react-router-native';
import { Button, Icon, Drawer } from 'native-base';
import * as Permissions from 'expo-permissions';
import Header from '@/components/Header';
import Sidebar from './Sidebar';
import Scripts from '../Scripts';

const Home = () => {
  const drawerRef = React.useRef(null);

  const history = useHistory();

  React.useEffect(() => {
    history.entries = [];
    history.push('/');
  }, []);

  React.useEffect(() => {
    Promise.all([
      Permissions.askAsync(Permissions.NOTIFICATIONS),
    ]);
  }, []);

  return (
    <>
      <Drawer
        ref={drawerRef}
        openDrawerOffset={0.3}
        panCloseMask={0.3}
        // onClose={() => drawerRef.current._root.close()}
        content={<Sidebar />}
      >
        <View style={{ flex: 1, backgroundColor: '#f6f7f9', }}>
          <Header
            title="Scripts"
            leftActions={(
              <>
                <Button
                  transparent
                  onPress={() => drawerRef.current._root.open()}
                >
                  <Icon name="menu" />
                </Button>
              </>
            )}
          />

          <Scripts />
        </View>
      </Drawer>
    </>
  );
};

export default provideHomeContext(Home);
