import React from 'react';
import PropTypes from 'prop-types';
import { LayoutNavigation } from '@/components/Layout';
import Typography from '@/ui/Typography';
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

const PageTitle = ({ title, onBackPress }) => {
  const styles = useStyles();
  const history = useHistory();

  return (
    <>
      <LayoutNavigation
        placement="top"
      >
        <TouchableOpacity
          style={[styles.goBackBtn]}
          onPress={() => onBackPress ? onBackPress() : history.goBack()}
        >
          <Ionicons
            name="md-arrow-back"
            style={[styles.goBackBtnIcon]}
          />
        </TouchableOpacity>

        <Typography variant="h3" style={[styles.title]}>
          {title}
        </Typography>
      </LayoutNavigation>
    </>
  );
};

PageTitle.propTypes = {
  title: PropTypes.string,
  onBackPress: PropTypes.func,
};

export default PageTitle;
