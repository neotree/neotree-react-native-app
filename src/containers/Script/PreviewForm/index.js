import React from 'react';
import PreviewSessionForm from '@/containers/Sessions/PreviewSessionForm';
import { useScreensContext } from '@/contexts/screens';
import Content from '@/components/Content';
import { Icon } from 'native-base';
import { TouchableOpacity } from 'react-native';
import { useOverlayLoaderState } from '@/contexts/app';
import theme from '@/native-base-theme/variables/commonColor';
import Header from './Header';

const Wrapper = props => <Content {...props} />;

const PreviewForm = () => {
  const { 
    getDiagnoses, 
    saveForm,
    state: { sessionSummary: session, savingForm } 
  } = useScreensContext();

  useOverlayLoaderState('savingForm', savingForm);

  if (!session) return null;

  return (
    <>
      <Header session={session} />
      
      <PreviewSessionForm
        session={session}
        diagnoses={getDiagnoses()}
        Wrapper={Wrapper}
        showConfidential
      />

      <TouchableOpacity
        onPress={() => saveForm({ completed: true, })}
        style={[
          {
            backgroundColor: theme.brandInfo,
            height: 50,
            width: 50,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            right: 20,
            bottom: 20,
            elevation: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
          }
        ]}
      ><Icon style={{ color: '#fff' }} name="save" /></TouchableOpacity>
    </>
  );
};

export default PreviewForm;
