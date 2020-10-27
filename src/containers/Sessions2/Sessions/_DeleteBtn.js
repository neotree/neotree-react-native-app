import React from 'react';
import OverlayLoader from '@/components/OverlayLoader';
import { Icon, ActionSheet } from 'native-base';
import colorStyles from '@/styles/colorStyles';
import { TouchableOpacity, Platform } from 'react-native';
import PropTypes from 'prop-types';

const DeleteBtn = ({ sessions, setSessions }) => {
  const [deletingSessions, setDeletingSessions] = React.useState(false);

  const deleteSessions = async (sessions) => new Promise((resolve, reject) => {
    console.log(sessions);
    (async () => {
      setDeletingSessions(true);
      setTimeout(() => setDeletingSessions(false), 50);
    })();
  });

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

DeleteBtn.propTypes = {
  sessions: PropTypes.array.isRequired,
  setSessions: PropTypes.func.isRequired,
};

export default DeleteBtn;
