import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import OverlayLoader from '@/components/OverlayLoader';
import { Icon, ActionSheet } from 'native-base';
import colorStyles from '@/styles/colorStyles';
import { TouchableOpacity, Platform } from 'react-native';

const DeleteBtn = () => {
  const { state: { sessions, deletingSessions }, deleteSessions } = useSessionsContext();

  return (
    <>
      <TouchableOpacity
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
