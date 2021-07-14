import React from 'react';
import PropTypes from 'prop-types';
import Fab from '@/components/Fab';
import { MaterialIcons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { useHistory } from 'react-router-native';
import OverlayLoader from '@/components/OverlayLoader';

export default function FinalActionButton({ saveSession, diagnoses }) {
  const history = useHistory();
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await saveSession({
        completed: true,
        diagnoses,
      });
      setSaving(false);
    } catch (e) {
      setSaving(false);
      Alert.alert(
        'Error',
        'Failed to save session',
        [
          {
            text: 'Exit without saving',
            onPress: () => history.push('/'),
            style: 'cancel'
          },
          {
            text: 'Try again',
            onPress: () => save()
          }
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <>
      <Fab
        onPress={() => save()}
      >
        <MaterialIcons size={24} color="black" style={{ color: '#fff' }} name="check" />
      </Fab>

      <OverlayLoader display={saving} />
    </>
  );
}

FinalActionButton.propTypes = {
  saveSession: PropTypes.func.isRequired,
  diagnoses: PropTypes.array.isRequired,
};
