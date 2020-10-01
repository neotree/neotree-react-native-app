import React from 'react';
import PropTypes from 'prop-types';
import { useScreensContext } from '@/contexts/screens';
import { View } from 'react-native';
import Content from '@/components/Content';

import YesNo from './TypeYesNo';
import MultiSelect from './TypeMultiSelect';
import Form from './TypeForm';
import Management from './TypeManagement';
import Progress from './TypeProgress';
import SingleSelect from './TypeSingleSelect';
import Timer from './TypeTimer';
import Checklist from './TypeChecklist';
import List from './TypeList';

import ScreenContainer from './_Container';
import NextBtn from './_NextBtn';

const ScreenType = ({ children }) => {
  const context = useScreensContext();

  const { canSave, state: { activeScreen, form, }, setState } = context;

  const [screenId, setScreenId] = React.useState(null);
  const [value, setValue] = React.useState(null);

  const shouldDisplay = activeScreen.id === screenId;

  const onEntry = entry => {
    setValue(entry);
    setState(prevState => {
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
  };

  React.useEffect(() => { 
    setScreenId(activeScreen.id); 
    setValue(form.filter(item => item.screen.id === activeScreen.id)[0]);
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

        const { label, dataType } = (activeScreen.data.metadata || {});
        const screen = {
          title: activeScreen.data.title,
          sectionTitle: activeScreen.data.sectionTitle,
          id: activeScreen.id,
          type: activeScreen.type,
          metadata: { label, dataType },
        };

        return !Component ? null : (
          <View style={{ flex: 1, }}>
            <ScreenContainer>
              {children}
              
              <Content>
                <Component
                  screen={activeScreen}
                  context={context}
                  value={value || null}
                  onChange={entry => onEntry(entry ? { ...entry, screen } : undefined)}
                />
              </Content>
            </ScreenContainer>

            {!!(value || canSave()) && <NextBtn />}
          </View>
        );
      })()}
    </>
  );
};

ScreenType.propTypes = {
  children: PropTypes.node,
};

export default ScreenType;
