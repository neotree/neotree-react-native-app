import React from 'react';
import PropTypes from 'prop-types';
import Divider from '@/components/Divider';
import { ScrollView, View, } from 'react-native';
import bgColorStyles from '@/styles/bgColorStyles';
import colorStyles from '@/styles/colorStyles';
import Text from '@/components/Text';
import Content from '@/components/Content';
import Header from './Header';
import FloatingButton from './FloatingButton';

import TypeForm from './TypeForm';
import TypeChecklist from './_TypeChecklist';
import TypeList from './_TypeList';
import TypeMultiSelect from './_TypeMultiSelect';
import TypeProgress from './_TypeProgress';
import TypeSingleSelect from './_TypeSingleSelect';
import TypeTimer from './_TypeTimer';
import TypeYesNo from './_TypeYesNo';
import TypeManagement from './TypeManagement';

const ActiveScreen = props => {
  const { screen, setEntry, removeEntry, hidden, } = props;

  return (
    <>
      <Header {...props} />

      {!!screen.data.actionText && (
        <Content
          style={{
            alignItems: 'center',
            flexDirection: 'row',
          }}
          containerProps={bgColorStyles.primaryBg}
        >
          <View style={{ flex: 1 }}>
            <Text variant="caption" style={[colorStyles.primaryColorContrastText, { textTransform: 'uppercase' }]}>
              {screen.data.actionText.replace(/^\s+|\s+$/g, '')}
            </Text>
          </View>
          <View>
            {!!screen.data.step && (
              <Text variant="caption" style={[colorStyles.primaryColorContrastText]}>
                {screen.data.step.replace(/^\s+|\s+$/g, '')}
              </Text>
            )}
          </View>
        </Content>
      )}

      <ScrollView>
        {!!screen.data.contentText && (
          <>
            <Content
              containerProps={{
                style: {
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 0,.2)'
                },
              }}
            >
              <Text style={[colorStyles.primaryColor]}>
                {screen.data.contentText.replace(/^\s+|\s+$/g, '')}
              </Text>
            </Content>

            <Divider border={false} />
          </>
        )}

        {(() => {
          let Component = null;

          switch (screen.type) {
            case 'yesno':
              Component = TypeYesNo;
              break;
            case 'checklist':
              Component = TypeChecklist;
              break;
            case 'multi_select':
              Component = TypeMultiSelect;
              break;
            case 'single_select':
              Component = TypeSingleSelect;
              break;
            case 'form':
              Component = TypeForm;
              break;
            case 'timer':
              Component = TypeTimer;
              break;
            case 'progress':
              Component = TypeProgress;
              break;
            case 'management':
              Component = TypeManagement;
              break;
            case 'list':
              Component = TypeList;
              break;
            default:
            // do nothing
          }

          Component = hidden ? null : Component;

          return !Component ? null : (
            <Content>
              <Component
                {...props}
                setEntry={e => {
                  const { label, dataType } = (screen.data.metadata || {});
                  if (!e) return removeEntry(screen.screen_id);
                  setEntry({
                    screen: {
                      title: screen.data.title,
                      sectionTitle: screen.data.sectionTitle,
                      id: screen.screen_id,
                      type: screen.type,
                      metadata: { label, dataType },
                    },
                    ...e,
                  })
                }}
              />
            </Content>
          );
        })()}
      </ScrollView>

      <FloatingButton {...props} />
    </>
  );
};

ActiveScreen.propTypes = {
  entries: PropTypes.array.isRequired,
  screen: PropTypes.object.isRequired,
  setEntry: PropTypes.func.isRequired,
  removeEntry: PropTypes.func.isRequired,
  hidden: PropTypes.bool,
};

export default ActiveScreen;
