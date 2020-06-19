import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { useOverlayLoaderState } from '@/contexts/app';
import { Button, Icon, ActionSheet } from 'native-base';

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
              options: ['Incomplete sessions', 'ALL sessions'],
              title: 'Permanantly delete'
            },
            i => {
              const incompleted = sessions.filter(s => !s.data.completed_at)
                .map(s => s.id);
              const completed = sessions.filter(s => s.data.completed_at)
                .map(s => s.id);
              deleteSessions(i === 0 ? incompleted : completed);
            }
          );
        }}
      >
        <Icon name="trash" />
      </Button>
    </>
  );
};

export default DeleteBtn;
