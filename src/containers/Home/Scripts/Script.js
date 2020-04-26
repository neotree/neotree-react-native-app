import React from 'react';
import PropTypes from 'prop-types';
import { useHomeContext } from '@/contexts/home';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';
import { Link } from 'react-router-native';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(),
    padding: theme.spacing(),
    borderColor: '#ddd',
    borderWidth: 1,
  }
}));

const Script = ({ item }) => {
  const data = { ...item, ...item.data };

  const { state: { scripts } } = useHomeContext();

  const styles = useStyles();

  const linkWrapper = children => (
    <Link to={`/script/${data.id}`}>{children}</Link>
  );

  return (
    <>
      <View style={[styles.root]}>
        {linkWrapper(<Typography>{data.title}</Typography>)}
        <Typography variant="caption" color="textSecondary">{data.description}</Typography>
      </View>
    </>
  );
};

Script.propTypes = {
  item: PropTypes.object.isRequired
};

export default Script;
