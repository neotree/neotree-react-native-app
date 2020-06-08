import React from 'react';
import PropTypes from 'prop-types';

import YesNo from './TypeYesNo';
import MultiSelect from './TypeMultiSelect';
import Form from './TypeForm';
import Management from './TypeManagement';
import Progress from './TypeProgress';
import SingleSelect from './TypeSingleSelect';
import Timer from './TypeTimer';

const ScreenType = ({ screen, form }) => {
  return (
    <>
      {(() => {
        let Component = null;

        switch (screen.type) {
          case 'yesno':
            Component = YesNo;
            break;
          case 'checklist':
            Component = MultiSelect;
            break;
          case 'multi_select':
            Component = MultiSelect;
            break;
          case 'single_select':
            Component = SingleSelect;
            break;
          case 'form':
            Component = Form;
            break;
          case 'timer':
            Component = Timer;
            break;
          case 'progress':
            Component = Progress;
            break;
          case 'management':
            Component = Management;
            break;
          default:
            // do nothing
        }

        return !Component ? null : (
          <Component
            screen={screen}
            form={form}
          />
        );
      })()}
    </>
  );
};

ScreenType.propTypes = {
  form: PropTypes.object.isRequired,
  screen: PropTypes.object.isRequired
};

export default ScreenType;
