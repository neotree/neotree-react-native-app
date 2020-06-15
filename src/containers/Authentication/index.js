import React from 'react';
import makeStyles from '@/ui/styles/makeStyles';
import { ScrollView } from 'react-native';
import Logo from '@/components/Logo';
import { provideAuthenticationContext } from './Context';
import styles from './styles';
import Form from './Form';

const useStyles = makeStyles(styles);

const Authentication = () => {
  const styles = useStyles();

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.root]}
        keyboardShouldPersistTaps="never"
      >
        <>
          <Logo color="primary" />
          <Form />
        </>
      </ScrollView>
    </>
  );
};

export default provideAuthenticationContext(Authentication);
