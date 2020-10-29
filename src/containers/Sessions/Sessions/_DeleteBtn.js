import React from 'react';
import OverlayLoader from '@/components/OverlayLoader';
import { Icon, ActionSheet } from 'native-base';
import colorStyles from '@/styles/colorStyles';
import { TouchableOpacity, Platform, Alert } from 'react-native';
import * as api from '@/api';
import { useSessionsContext } from '../SessionsContext';

const DeleteBtn = () => {
  const {
    sessions,
    getSessions,
  } = useSessionsContext();

  const [deletingSessions, setDeletingSessions] = React.useState(false);

  const deleteSessions = async (ids = []) => new Promise((resolve, reject) => {
    if (ids.length) {
      (async () => {
        setDeletingSessions(true);
        try {
          await api.deleteSessions(ids);
          await getSessions();
          resolve();
        } catch (e) {
          Alert.alert(
            'ERROR',
            e.message || e.msg || JSON.stringify(e),
            [
              {
                text: 'Try again',
                type: 'cancel',
                onPress: () => deleteSessions(ids),
              },
              {
                text: 'Cancel',
                type: 'cancel',
                onPress: () => {},
              }
            ]
          );
          reject(e);
        }
        setDeletingSessions(false);
      })();
    }
  });

  return (
    <>
      <TouchableOpacity
        style={{ paddingHorizontal: 10 }}
        onPress={() => {
          ActionSheet.show(
            {
              options: [
                'Incomplete sessions', 
                'ALL sessions', 
                Platform.OS === 'ios' ? 'Cancel' : null
              ].filter(o => o),
              title: 'Permanantly delete',
              cancelButtonIndex: 2,
            },
            i => {
              const incompleted = sessions.filter(s => !s.data.completed_at)
                .map(s => s.id);
              const all = sessions.map(s => s.id);
              if (i < 2) deleteSessions(i === 0 ? incompleted : all);
            }
          );
        }}
      >
        <Icon style={[colorStyles.primaryColor]} name="trash" />
      </TouchableOpacity>

      <OverlayLoader display={deletingSessions} />
    </>
  );
};

export default DeleteBtn;
