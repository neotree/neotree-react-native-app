import React from 'react';
import Checkbox from '@/ui/Checkbox';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';
import makeStyles from '@/ui/styles/makeStyles';
import { useAppContext } from '@/contexts/app';
import Container from './Container';

const useStyles = makeStyles({
  root: {}
});

const Screen = () => {
  const { setState } = useAppContext();

  const styles = useStyles();

  return (
    <>
      <Container>
        <Typography style={styles.title} variant="h1">Debug</Typography>

        <Divider border={false} />
        
        <Typography color="error" variant="caption">This will be displayed when in dev mode only</Typography>

        <Divider border={false} />

        <Checkbox
          value=""
          label="I don't want to debug"
          checked={false}
          onChange={() => setState({ hideDebugButton: true })}
        />
      </Container>
    </>
  );
};

export default Screen;
