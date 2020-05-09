import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import { ScrollView } from 'react-native';
import LayoutCard from '../LayoutCard';

const useStyles = makeStyles((theme, { layout }) => ({
  root: {},
  card: {
    minHeight: layout.height || 0,
  }
}));

const LayoutScrollableContent = React.forwardRef(({
  children,
  style,
  scrollViewProps,
  ...props
}, ref) => {
  const scrollViewRef = React.useRef(null);
  const cardRef = React.useRef(null);

  const [layout, setLayout] = React.useState({});

  React.useImperativeHandle(ref, () => ({
    layout,
    scrollViewRef: scrollViewRef.current,
    cardRef: cardRef.current,
  }));

  scrollViewProps = scrollViewProps || {};

  const styles = useStyles({ layout });

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        {...scrollViewProps}
        onLayout={layout => {
          setLayout(layout.nativeEvent.layout);
          if (scrollViewProps.onLayout) scrollViewProps.onLayout(layout);
        }}
        style={[
          styles.root,
          ...(scrollViewProps.style ? scrollViewProps.style.map ? scrollViewProps.style : [scrollViewProps.style] : [])
        ]}
      >
        <LayoutCard
          ref={cardRef}
          {...props}
          style={[
            styles.card,
            ...(style ? style.map ? style : [style] : [])
          ]}
        >
          {children}
        </LayoutCard>
      </ScrollView>
    </>
  );
});

LayoutScrollableContent.propTypes = {
  children: PropTypes.node,
  scrollViewProps: PropTypes.object,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default LayoutScrollableContent;
