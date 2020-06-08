import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';
import { Link } from 'react-router-native';
import { LayoutCard } from '@/components/Layout';
import { View } from 'react-native';
import moment from 'moment';
import Checkbox from '@/ui/Checkbox';

const useStyles = makeStyles((theme, { canSelectItems }) => ({
  root: {
    flexDirection: 'row',
  },
  content: {
    marginVertical: theme.spacing(),
    marginLeft: canSelectItems ? theme.spacing() : 0,
    padding: theme.spacing(),
    borderColor: '#ddd',
    borderWidth: 1,
    flex: 1,
  },
  grid: {
    flexDirection: 'row'
  },
  gridItem: {
    flex: 1
  }
}));

const ListItem = ({ item, selectedItems, canSelectItems, selectItems }) => {
  const styles = useStyles({ canSelectItems });

  return (
    <>
      <LayoutCard style={[styles.root]}>
        {canSelectItems && (
          <Checkbox
            value=""
            checked={selectedItems.indexOf(item.id) > -1}
            onChange={() => selectItems(item.id)}
          />
        )}

        <Link
          to={`/forms/form/${item.id}`}
          style={[styles.content]}
        >
          <>
            <View style={[styles.grid]}>
              <View style={[styles.gridItem]}>
                <Typography variant="caption" color="secondary">Creation date</Typography>
                <Typography style={[{ fontSize: 15 }]}>
                  {moment(item.data.started_at).format('DD MMM, YYYY HH:MM')}
                </Typography>
              </View>

              <View style={[styles.gridItem]}>
                <Typography variant="caption" color="secondary">Completion date</Typography>
                <Typography style={[{ fontSize: 15 }]}>
                  {!item.completed_at ?
                    moment(item.data.completed_at).format('DD MMM, YYYY HH:MM')
                    :
                    'N/A'}
                </Typography>
              </View>
            </View>

            <Divider border={false} />

            <Typography variant="caption" color="secondary">Script</Typography>
            <Typography>{item.data.script.data.title}</Typography>
          </>
        </Link>
      </LayoutCard>
    </>
  );
};

ListItem.propTypes = {
  item: PropTypes.object.isRequired,
  selectedItems: PropTypes.array.isRequired,
  selectItems: PropTypes.func.isRequired,
  canSelectItems: PropTypes.bool,
};

export default ListItem;
