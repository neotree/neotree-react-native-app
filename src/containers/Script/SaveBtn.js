import React from 'react';
import IconButton from '@/ui/IconButton';
import { useScreensContext } from '@/contexts/screens';
import makeStyles from '@/ui/styles/makeStyles';
import { useOverlayLoaderState } from '@/contexts/app';

const useStyles = makeStyles(theme => {
  return {
    root: {
      margin: theme.spacing(2),
      position: 'absolute',
      bottom: 0,
      right: 0,
    }
  };
});

const SaveBtn = () => {
  const styles = useStyles();

  const { canSave, saveForm, state: { savingForm } } = useScreensContext();

  useOverlayLoaderState('savingForm', savingForm);

  return (
    <>
      {canSave() && (
        <IconButton
          variant="contained"
          color="primary"
          onPress={() => saveForm({ completed: true })}
          style={[styles.root]}
          icon="md-save"
        />
      )}
    </>
  );
};

export default SaveBtn;
