import React from 'react';
import PropTypes from 'prop-types';
import * as NativeBase from 'native-base';

function NativeBaseContent({
  contentContainerStyle,
  ...props
}) {
  return (
    <>
      <NativeBase.Content
        {...props}
        contentContainerStyle={{
          width: '90%',
          marginLeft: 'auto',
          marginRight: 'auto',
          ...contentContainerStyle
        }}
      />
    </>
  );
}

NativeBaseContent.propTypes = {
  contentContainerStyle: PropTypes.object,
};

export default NativeBaseContent;
