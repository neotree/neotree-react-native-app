import React from 'react';
import { View } from 'react-native';
import { provideHomeContext } from '@/contexts/home';
import { useHistory } from 'react-router-native';
import { Content, Header, Left, Body, Button, Icon, Title, Drawer } from 'native-base';
import Sidebar from './Sidebar';
import Scripts from '../Scripts';

const Home = () => {
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
        // onClose={() => drawerRef.current._root.close()}
        content={<Sidebar />}
      >
        <View style={{ flex: 1, }}>
          <Header>
            <Left>
              <Button
                transparent
                onPress={() => drawerRef.current._root.open()}
              >
                <Icon name="menu" />
              </Button>
            </Left>
            <Body>
              <Title>Scripts</Title>
            </Body>
          </Header>

          <Scripts />
        </View>
      </Drawer>
    </>
  );
};

export default provideHomeContext(Home);
