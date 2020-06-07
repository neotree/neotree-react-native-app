import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';
import { Link } from 'react-router-native';
import { LayoutCard } from '@/components/Layout';
import { View } from 'react-native';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
  root: {},
  content: {
    margin: theme.spacing(),
    padding: theme.spacing(),
    borderColor: '#ddd',
    borderWidth: 1,
  },
  grid: {
    flexDirection: 'row'
  },
  gridItem: {
    flex: 1
  }
}));

const ListItem = ({ item }) => {
  const styles = useStyles();

  return (
    <>
      <LayoutCard style={[styles.root]}>
        <Link
          to={`/export/form/${item.id}`}
          style={[styles.content]}
        >
          <>
            <View style={[styles.grid]}>
              <View style={[styles.gridItem]}>
                <Typography variant="caption" color="textSecondary">Creation date</Typography>
                <Typography style={[{ fontSize: 15 }]}>
                  {moment(item.data.started_at).format('DD MMM, YYYY HH:MM')}
                </Typography>
              </View>

              <View style={[styles.gridItem]}>
                <Typography variant="caption" color="textSecondary">Completion date</Typography>
                <Typography style={[{ fontSize: 15 }]}>
                  {!item.completed_at ?
                    moment(item.data.completed_at).format('DD MMM, YYYY HH:MM')
                    :
                    'N/A'}
                </Typography>
              </View>
            </View>

            <Divider border={false} />

            <Typography variant="caption" color="textSecondary">Script</Typography>
            <Typography>{item.data.script.title}</Typography>
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
