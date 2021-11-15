import React from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Easing,
  Platform,
} from 'react-native';
import RNSortableList from 'react-native-sortable-list';

class Row extends React.Component {
  constructor(props) {
    super(props);

    this._active = new Animated.Value(0);

    this._style = {
      ...Platform.select({
        ios: {
          // transform: [{
          //   scale: this._active.interpolate({
          //     inputRange: [0, 1],
          //     outputRange: [1, 1.1],
          //   }),
          // }],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          // transform: [{
          //   scale: this._active.interpolate({
          //     inputRange: [0, 1],
          //     outputRange: [1, 1.07],
          //   }),
          // }],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      })
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
        useNativeDriver: true,
      }).start();
    }
  }

  render() {
    const { children } = this.props;

    return (
      <Animated.View
        style={[this._style]}
      >
        {children}
      </Animated.View>
    );
  }
}

Row.propTypes = {
  active: PropTypes.any,
  children: PropTypes.node,
};

export default function SortableList({ data, renderItem, ...props }) {
  return (
    <RNSortableList
      {...props}
      data={data}
      renderRow={rowProps => {
        const children = renderItem(rowProps);
        return (
          <Row {...rowProps}>
            {children}
          </Row>
        )
      }}
    />
  );
}

SortableList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderItem: PropTypes.func.isRequired,
};
