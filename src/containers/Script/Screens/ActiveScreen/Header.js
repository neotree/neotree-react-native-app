import React from 'react';
import PropTypes from 'prop-types';
import { Platform, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ActionSheet } from 'native-base';
import useBackButton from '@/utils/useBackButton';
import Modal from '@/components/Modal';
import Text from '@/components/Text';
import Divider from '@/components/Divider';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import bgColorStyles from '@/styles/bgColorStyles';
import Content from '@/components/Content';
import { useContext } from '../../Context';

const ScreenHeader = ({
  screen,
  script,
  goBack,
  cancelScript,
  headerProps,
  hideActionText,
  title,
  subtitle,
}) => {
  const { state: { pageOptions } } = useContext();

  useBackButton(() => { goBack(); });

  const [openInfoModal, setOpenInfoModal] = React.useState(false);

  return (
    <>
      <Header
        title={title || (pageOptions && pageOptions.title) || screen.data.title}
        subtitle={subtitle || (pageOptions && pageOptions.subtitle) || script.data.title}
        leftActions={(
          <>
            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => goBack()}
            >
              <MaterialIcons size={24} color="black" style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
        rightActions={(
          <>
            {!!screen.data.infoText && (
              <>
                <TouchableOpacity
                  onPress={() => setOpenInfoModal(true)}
                  style={{ padding: 10 }}
                >
                  <MaterialIcons color="black" size={24} style={[colorStyles.primaryColor]} name="info-outline" />
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => {
                ActionSheet.show(
                  {
                    options: [
                      'Cancel Script?',
                      Platform.OS === 'ios' ? 'Close' : null
                    ].filter(o => o),
                    title: 'Action',
                    cancelButtonIndex: 1,
                  },
                  i => {
                    if (i === 0) cancelScript();
                    if (i === 1) setOpenInfoModal(false);
                  }
                );
              }}
            >
              <MaterialIcons size={24} color="black" style={[colorStyles.primaryColor]} name="more-vert" />
            </TouchableOpacity>
          </>
        )}
        {...headerProps}
      />

      {hideActionText || (pageOptions && pageOptions.hideActionText) ? null : (
        <>
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
        </>
      )}

      {!!screen && (
        <Modal
          open={openInfoModal}
          onClose={() => setOpenInfoModal(false)}
          style={{
            width: '100%',
            height: '100%',
            // alignItems: 'center',
            // justifyContent: 'center'
          }}
        >
          <Text>Screen info</Text>
          <Divider border={false} />
          <Text note>{screen.data.infoText}</Text>
        </Modal>
      )}
    </>
  );
};

ScreenHeader.propTypes = {
  screen: PropTypes.object.isRequired,
  script: PropTypes.object.isRequired,
  goBack: PropTypes.func.isRequired,
  cancelScript: PropTypes.func.isRequired,
  hideActionText: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  headerProps: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    leftActions: PropTypes.node,
    rightActions: PropTypes.node,
  }),
};

export default ScreenHeader;
