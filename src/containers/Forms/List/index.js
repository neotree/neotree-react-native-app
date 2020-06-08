import React from 'react';
import Divider from '@/ui/Divider';
import { useFormsContext } from '@/contexts/forms';
import { View, FlatList } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import PageTitle from '@/components/PageTitle';
import Checkbox from '@/ui/Checkbox';
import Typography from '@/ui/Typography';
import { LayoutCard } from '@/components/Layout';
import ListItem from './ListItem';
import ExportLink from './ExportLink';
import DeleteBtn from './DeleteBtn';
import ToggleSelect from './ToggleSelect';

const useStyles = makeStyles(theme => ({
  root: {
    flex: 1
  },
  header: {
    margin: theme.spacing()
  },
  selectAll: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  selectAllItem: {
    marginLeft: theme.spacing(),
  }
}));

const List = () => {
  const styles = useStyles();

  const { state: { data, loadingData, selectedItems, canSelectItems }, selectItems, getData } = useFormsContext();

  return (
    <>
      <PageTitle title="Session history">
        <ExportLink />
        <ToggleSelect />
      </PageTitle>

      <Divider border={false} />

      {canSelectItems && (
        <>
          <LayoutCard>
            <View style={[styles.selectAll]}>
              <View>
                <Checkbox
                  value=""
                  checked={selectedItems.length === data.length}
                  onChange={() => selectItems(selectedItems.length ? selectedItems : data.map(item => item.id))}
                />
              </View>

              <Typography style={[styles.selectAllItem]}>
                Select
              </Typography>

              <DeleteBtn style={[styles.selectAllItem]} />
            </View>
          </LayoutCard>
          <Divider border={false} />
        </>
      )}

      <View style={[styles.root]}>
        <FlatList
          data={data}
          onRefresh={getData}
          refreshing={loadingData}
          renderItem={({ item }) => (
            <ListItem
              selectItems={selectItems}
              canSelectItems={canSelectItems}
              item={item}
              selectedItems={selectedItems}
            />
          )}
          keyExtractor={item => `${item.id}`}
        />
      </View>
    </>
  );
};

export default List;
