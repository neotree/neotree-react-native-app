import React from 'react';
import { LayoutNavigation } from '@/components/Layout';
import Typography from '@/ui/Typography';
import { useScriptContext } from '@/contexts/script';
import { useHistory } from 'react-router-native';
import { Ionicons } from '@expo/vector-icons';
import makeStyles from '@/ui/styles/makeStyles';
import { TouchableOpacity } from 'react-native';

const useStyles = makeStyles((theme) => ({
  title: {
    padding: theme.spacing(),
  },
  goBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goBackBtnIcon: {
    fontSize: 20,
    marginRight: theme.spacing(),
    color: theme.palette.secondary.main
  },
  goBackBtnCaption: {
    color: theme.palette.secondary.main
  },
}));

const Header = () => {
  const styles = useStyles();
  const history = useHistory();
  const { state: { script } } = useScriptContext();

  return (
    <>
      <LayoutNavigation
        placement="top"
      >
        <TouchableOpacity
          style={[styles.goBackBtn]}
          onPress={() => history.push('/')}
        >
          <Ionicons
            name="md-arrow-back"
            style={[styles.goBackBtnIcon]}
          />
          <Typography
            variant="caption"
            style={[styles.goBackBtnCaption]}
          >Home</Typography>
        </TouchableOpacity>

        <Typography variant="h3" style={[styles.title]}>
          {script.data.title}
        </Typography>
      </LayoutNavigation>
    </>
  );
};

export default Header;
