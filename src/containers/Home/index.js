import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useHistory } from 'react-router-native';
import { Drawer } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import Scripts from '@/components/Scripts';
import { useAppContext } from '@/AppContext';
import Sidebar from './Sidebar';

const Home = () => {
  const { state: { application } } = useAppContext();

  const drawerRef = React.useRef(null);

  const history = useHistory();

  React.useEffect(() => {
    history.entries = [];
    history.push('/');
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
            title={`Scripts v${application.webeditor_info.version}`}
            leftActions={(
              <>
                <TouchableOpacity
                  style={{ paddingHorizontal: 5 }}
                  onPress={() => drawerRef.current._root.open()}
                >
                  <MaterialIcons size={24} color="black" style={[colorStyles.primaryColor]} name="menu" />
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
