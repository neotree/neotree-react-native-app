import React from 'react';
import { useScreensContext } from '@/contexts/screens';

import YesNo from './TypeYesNo';
import MultiSelect from './TypeMultiSelect';
import Form from './TypeForm';
import Management from './TypeManagement';
import Progress from './TypeProgress';
import SingleSelect from './TypeSingleSelect';
import Timer from './TypeTimer';
import Checklist from './TypeChecklist';

const ScreenType = () => {
  const context = useScreensContext();

  const { state: { activeScreen, form }, setState } = context;

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
            Component = Checklist;
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

        const value = form.filter(item => item.screen.id === activeScreen.id)[0];

        return !Component ? null : (
          <Component
            screen={activeScreen}
            context={context}
            value={value ? value.entry : null}
            onChange={entry => setState(prevState => {
              const form = prevState.form;
              const formEntry = form.filter(item => item.screen.id === activeScreen.id)[0];
              return {
                ...prevState,
                form: entry ?
                  formEntry ?
                    form.map(item => item.screen.id === activeScreen.id ? { ...item, entry } : item)
                    :
                    [...form, { screen: activeScreen, entry }]
                  :
                  form.filter(item => item.screen.id !== activeScreen.id)
              };
            })}
          />
        );
      })()}
    </>
  );
};

export default ScreenType;
