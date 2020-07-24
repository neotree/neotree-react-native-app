import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { useOverlayLoaderState } from '@/contexts/app';
import { Button, Icon, ActionSheet } from 'native-base';
import colorStyles from '@/styles/colorStyles';

const DeleteBtn = () => {
  const { state: { sessions, deletingSessions }, deleteSessions } = useSessionsContext();

  useOverlayLoaderState('delete_sessions', deletingSessions);

  return (
    <>
      <Button
        transparent
        onPress={() => {
          ActionSheet.show(
            {
              options: ['Incomplete sessions', 'ALL sessions', 'Cancel'],
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
      </Button>
    </>
  );
};

export default DeleteBtn;
