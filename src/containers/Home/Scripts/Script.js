import React from 'react';
import PropTypes from 'prop-types';
import { useHomeContext } from '@/contexts/home';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';

const useStyles = makeStyles(() => ({
  root: {}
}));

const Script = ({ item }) => {
  const { state: { scripts } } = useHomeContext();

  const styles = useStyles();

  return (
    <>
      <View style={[styles.root]}>
        <Typography variant="h4">{item.title}</Typography>
        <Typography variant="caption" color="textSecondary">{item.description}</Typography>
      </View>

      <Divider />
    </>
  );
};

Script.propTypes = {
  item: PropTypes.object.isRequired
};

export default Script;
