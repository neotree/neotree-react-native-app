import React from 'react';
import Divider from '@/ui/Divider';
import { useSessionsContext } from '@/contexts/sessions';
import { View, FlatList } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import PageTitle from '@/components/PageTitle';
import Checkbox from '@/ui/Checkbox';
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

  const { state: { sessions, loadingSessions, selectedItems, canSelectItems }, selectItems, getSessions } = useSessionsContext();

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
                  label="Select"
                  checked={selectedItems.length === sessions.length}
                  onChange={() => selectItems(selectedItems.length ? selectedItems : sessions.map(item => item.id))}
                />
              </View>

              <DeleteBtn style={[styles.selectAllItem]} />
            </View>
          </LayoutCard>
          <Divider border={false} />
        </>
      )}

      <View style={[styles.root]}>
        <FlatList
          data={sessions}
          onRefresh={getSessions}
          refreshing={loadingSessions}
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
