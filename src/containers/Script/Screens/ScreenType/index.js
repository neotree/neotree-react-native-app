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
import List from './TypeList';

const ScreenType = () => {
  const context = useScreensContext();

  const { state: { activeScreen, form, cachedForm, }, setState } = context;

  const [screenId, setScreenId] = React.useState(null);

  const shouldDisplay = activeScreen.id === screenId;

  const onEntry = entry => setState(prevState => {
    const form = prevState.form;
    const formEntry = form.filter(item => item.screen.id === activeScreen.id)[0];
    return {
      ...prevState,
      form: entry ?
        formEntry ?
          form.map(item => item.screen.id === activeScreen.id ? entry : item)
          :
          [...form, entry]
        :
        form.filter(item => item.screen.id !== activeScreen.id)
    };
  });

  React.useEffect(() => {
    setScreenId(activeScreen.id);

    // get cached entry
    const entry = cachedForm.filter(e => e.screen.id === activeScreen.id)[0];
    if (entry) onEntry(entry);
  }, [activeScreen]);

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
          case 'list':
            Component = List;
            break;
          default:
            // do nothing
        }

        if (!shouldDisplay) Component = null;

        const value = form.filter(item => item.screen.id === activeScreen.id)[0];
        const { label, dataType } = (activeScreen.data.metadata || {});
        const screen = {
          title: activeScreen.data.title,
          sectionTitle: activeScreen.data.sectionTitle,
          id: activeScreen.id,
          type: activeScreen.type,
          metadata: { label, dataType },
        };

        return !Component ? null : (
          <Component
            screen={activeScreen}
            context={context}
            value={value || null}
            onChange={entry => onEntry(entry ? { ...entry, screen } : undefined)}
          />
        );
      })()}
    </>
  );
};

export default ScreenType;
