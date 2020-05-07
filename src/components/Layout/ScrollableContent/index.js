import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import { ScrollView } from 'react-native';
import LayoutCard from '../LayoutCard';

const useStyles = makeStyles(() => ({
  root: {}
}));

const LayoutScrollableContent = ({ children, style }) => {
  const styles = useStyles();

  return (
    <>
      <ScrollView>
        <LayoutCard
          style={[
            styles.root,
            ...(style ? style.map ? style : [style] : [])
          ]}
        >
          {children}
        </LayoutCard>
      </ScrollView>
    </>
  );
};

LayoutScrollableContent.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default LayoutScrollableContent;
