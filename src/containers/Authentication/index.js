import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import { View } from 'react-native';
import styles from './styles';
import Form from './Form';

const useStyles = makeStyles(styles);

const Authentication = () => {
  const styles = useStyles();

  return (
    <>
      <View style={[styles.root]}>
        <Form />
      </View>
    </>
  );
};

Authentication.propTypes = {};

export default Authentication;
