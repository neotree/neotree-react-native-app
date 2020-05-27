import React from 'react';
import { useScreensContext } from '@/contexts/screens';

import YesNo from './TypeYesNo';
import MultiSelect from './TypeMultiSelect';
import Form from './TypeForm';
import Management from './TypeManagement';
import Progress from './TypeProgress';
import SingleSelect from './TypeSingleSelect';
import Timer from './TypeTimer';

const Type = () => {
  const context = useScreensContext();

  const { state: { activeScreen } } = context;

  const [screenId, setScreenId] = React.useState(null);

  React.useEffect(() => { setScreenId(activeScreen.id); }, [activeScreen]);

  const shouldDisplay = activeScreen.id === screenId;

  return (
    <>
      {(() => {
        let Component = null;

        switch (activeScreen.type) {
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

        if (!shouldDisplay) Component = null;

        return !Component ? null : (
          <Component
            screen={activeScreen}
            context={context}
          />
        );
      })()}
    </>
  );
};

export default Type;
