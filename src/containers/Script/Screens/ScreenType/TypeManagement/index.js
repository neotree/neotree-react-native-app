import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Section from './Section';

const Management = ({ screen, onChange }) => {
  const metadata = screen.data.metadata || {};

  React.useEffect(() => {
    onChange({ not_required: true });
  }, []);

  return (
    <>
      <View>
        <Section
          title={metadata.title1}
          text={metadata.text1}
          image={metadata.image1}
        />

        <Section
          title={metadata.title2}
          text={metadata.text2}
          image={metadata.image2}
        />

        <Section
          title={metadata.title3}
          text={metadata.text3}
          image={metadata.image3}
        />
      </View>
    </>
  );
};

Management.propTypes = {
  screen: PropTypes.object,
  // value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default Management;
