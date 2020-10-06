import React from 'react';
import PreviewSessionForm from '@/containers/Sessions/PreviewSessionForm';
import { useScreensContext } from '@/contexts/screens';
import Content from '@/components/Content';
import OverlayLoader from '@/components/OverlayLoader';
import { Icon } from 'native-base';
import { TouchableOpacity, Alert, } from 'react-native';
import { useHistory } from 'react-router-native';
import theme from '@/native-base-theme/variables/commonColor';
import Header from './Header';

const Wrapper = props => <Content {...props} />;

const Summary = () => {
  const history = useHistory();
  const { saveForm, createSessionSummary, } = useScreensContext();
  const [saving, setSaving] = React.useState(false);

  const session = createSessionSummary({ completed: true, });

  if (!session) return null;

  return (
    <>
      <Header session={session} />
      
      <PreviewSessionForm
        session={session}
        diagnoses={session.data.diagnoses}
        Wrapper={Wrapper}
        showConfidential
      />

      <TouchableOpacity
        onPress={() => {
          setSaving(true);
          setTimeout(() => {
            const save = saveForm({ completed: true, }, session)
              .then(() => history.push('/'))
              .catch(() => {
                setSaving(false);
                Alert.alert(
                  '',
                  'Failed to save session',
                  [
                    {
                      text: 'Try again',
                      onPress: () => save(),
                    },
                    {
                      text: 'Cancel',
                      onPress: () => {},
                    }
                  ],
                  { cancelable: true }
                );
              });
            
            save();
          }, 0);
        }}
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

      <OverlayLoader display={saving} />
    </>
  );
};

export default Summary;
