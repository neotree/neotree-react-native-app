import React from 'react';
import PropTypes from 'prop-types';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const NavStack = ({ stack, ...props }) => {
  return (
    <>
      <Stack.Navigator
        {...props}
      >
        {stack.map((route, i) => {
          return (
            <Stack.Screen
              key={i}
              {...route}
            />
          );
        })}
      </Stack.Navigator>
    </>
  );
};

NavStack.propTypes = {
  stack: PropTypes.array.isRequired
};

export default NavStack;
