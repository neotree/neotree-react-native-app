import React from 'react';
import PropTypes from 'prop-types';
import {
  Header as HeaderComponent,
  Body,
  Left,
  Right,
  Title,
} from 'native-base';
import Text from '@/components/Text';
import theme from '@/native-base-theme/variables/material';

const Header = ({
  title,
  subtitle,
  children,
  leftActions,
  rightActions,
  ...props
}) => {
  return (
    <>
      <HeaderComponent
        style={{ backgroundColor: '#fff' }}
        androidStatusBarColor={theme.brandPrimary}
        {...props}
      >
        {!!leftActions && (
          <Left style={{ maxWidth: 50 }}>
            {leftActions}
          </Left>
        )}

        <Body>
          {!!title && <Title style={{ color: theme.brandPrimary }}>{title}</Title>}
          {!!subtitle && <Text style={{ fontSize: 10, color: '#999' }}>{subtitle}</Text>}
          {children}
        </Body>

        {!!rightActions && (
          <Right style={{ maxWidth: 80 }}>
            {rightActions}
          </Right>
        )}
      </HeaderComponent>
    </>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  rightActions: PropTypes.node,
  leftActions: PropTypes.node,
};

export default Header;
