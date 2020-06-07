import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';
import { Link } from 'react-router-native';
import { LayoutCard } from '@/components/Layout';

const useStyles = makeStyles(theme => ({
  root: {},
  content: {
    margin: theme.spacing(),
    padding: theme.spacing(),
    borderColor: '#ddd',
    borderWidth: 1,
  }
}));

const ListItem = ({ item }) => {
  const data = { ...item, ...item.data };

  const styles = useStyles();

  return (
    <>
      <LayoutCard style={[styles.root]}>
        <Link
          to={`/script/${data.id}`}
          style={[styles.content]}
        >
          <>
            <Typography>{data.title}</Typography>
            <Typography variant="caption" color="textSecondary">{data.description}</Typography>
          </>
        </Link>
      </LayoutCard>
    </>
  );
};

ListItem.propTypes = {
  item: PropTypes.object.isRequired
};

export default ListItem;
