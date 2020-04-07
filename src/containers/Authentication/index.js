import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import copy from '@/constants/copy/auth';
import { provideAuthenticationContext } from '@/contexts/authentication/Provider';

import { ScrollView } from 'react-native';
import Logo from '@/components/Logo';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';

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
          <Divider border={false} spacing={2} />
          <Form />
        </>
      </ScrollView>
    </>
  );
};

Authentication.propTypes = {};

export default provideAuthenticationContext(Authentication);
