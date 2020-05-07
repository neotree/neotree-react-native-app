import React from 'react';
import { useScreensContext } from '@/contexts/screens';

import YesNo from './YesNo';
import MultiSelect from './MultiSelect';
import Form from './Form';
import Management from './Management';
import Progress from './Progress';
import SingleSelect from './SingleSelect';
import Timer from './Timer';

const Type = () => {
  const { state: { activeScreen } } = useScreensContext();

  return (
    <>
      {(() => {
        let Component = null;

        switch (activeScreen.type) {
          case 'yesno':
            Component = YesNo;
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

        return !Component ? null : <Component screen={activeScreen} />;
      })()}
    </>
  );
};

export default Type;
