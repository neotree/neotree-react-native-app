import React from 'react';
import { View } from 'react-native';
import { provideHomeContext } from '@/contexts/home';
import { useHistory } from 'react-router-native';
import AppHeader from '@/components/AppHeader';
import Scripts from '../Scripts';

const Home = () => {
  const history = useHistory();

  React.useEffect(() => {
    history.entries = [];
    history.push('/');
  }, []);

  return (
    <>
      <View
        style={{
          flex: 1,
        }}
      >
        <AppHeader />
        <Scripts />
      </View>
    </>
  );
};

export default provideHomeContext(Home);
