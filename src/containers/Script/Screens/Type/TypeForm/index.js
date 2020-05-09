import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Divider from '@/ui/Divider';
import { fieldsTypes } from '@/constants/screen';

import Number from './Number';
import Date from './Date';
import DateTime from './DateTime';
import Text from './Text';
import DropDown from './DropDown';
import Period from './Period';
import Time from './Time';

const Form = ({ screen }) => {
  const { metadata } = screen.data;

  return (
    <>
      <View>
        {metadata.fields.map(f => {
          return (
            <React.Fragment key={f.key}>
              {(() => {
                let Component = null;
                switch (f.dataType) {
                  case fieldsTypes.NUMBER:
                    Component = Number;
                    break;
                  case fieldsTypes.DATE:
                    Component = Date;
                    break;
                  case fieldsTypes.DATETIME:
                    Component = DateTime;
                    break;
                  case fieldsTypes.DROPDOWN:
                    Component = DropDown;
                    break;
                  case fieldsTypes.PERIOD:
                    Component = Period;
                    break;
                  case fieldsTypes.TEXT:
                    Component = Text;
                    break;
                  case fieldsTypes.TIME:
                    Component = Time;
                    break;
                  default:
                    // do nothing
                }
                return !Component ? null : <Component field={f} />;
              })()}

              <Divider border={false} spacing={2} />
            </React.Fragment>
          );
        })}
      </View>
    </>
  );
};

Form.propTypes = {
  screen: PropTypes.object
};

export default Form;
