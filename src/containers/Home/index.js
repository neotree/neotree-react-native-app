import React from 'react';
import { View } from 'react-native';
import Typography from '@/ui/Typography';
import { useHomeContext, provideHomeContext } from '@/contexts/home';
import Scripts from './Scripts';

const Home = () => {
  const { getScripts } = useHomeContext();

  React.useEffect(() => {
    getScripts();
  }, []);

  return (
    <>
      <View style={{ flex: 1 }}>
        <Typography variant="h1">Home</Typography>
        <Scripts />
      </View>
    </>
  );
};

export default provideHomeContext(Home);
