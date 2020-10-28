import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useHistory } from 'react-router-native';
import { Icon, Drawer } from 'native-base';
import * as Permissions from 'expo-permissions';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import Scripts from '@/components/Scripts';
import Sidebar from './Sidebar';

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
                <TouchableOpacity
                  style={{ paddingHorizontal: 5 }}
                  onPress={() => drawerRef.current._root.open()}
                >
                  <Icon style={[colorStyles.primaryColor]} name="menu" />
                </TouchableOpacity>
              </>
            )}
          />
          <Scripts />
        </View>
      </Drawer>
    </>
  );
};

export default Home;
