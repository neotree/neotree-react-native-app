import React from 'react';
import PropTypes from 'prop-types';
import { useHomeContext } from '@/contexts/home';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';
import { Link } from 'react-router-native';
import { LayoutCard } from '@/components/Layout';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(),
    padding: theme.spacing(),
    borderColor: '#ddd',
    borderWidth: 1,
  }
}));

const ListItem = ({ item }) => {
  const data = { ...item, ...item.data };

  const styles = useStyles();

  const linkWrapper = children => (
    <Link to={`/script/${data.id}`}>{children}</Link>
  );

  return (
    <>
      {linkWrapper(
        <LayoutCard style={[styles.root]}>
          <Typography>{data.title}</Typography>
          <Typography variant="caption" color="textSecondary">{data.description}</Typography>
        </LayoutCard>
      )}
    </>
  );
};

ListItem.propTypes = {
  item: PropTypes.object.isRequired
};

export default ListItem;
