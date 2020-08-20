import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Text from '@/components/Text';
import Modal from '@/components/Modal';
import { Button, Input, Item, Label } from 'native-base';
import { useAppContext } from '@/contexts/app';

const Confidentials = ({ onShowConfidential }) => {
  const { state: { adminpassword } } = useAppContext();

  const [openModal, setOpenModal] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);
  const [showConfidentials, setShowConfidentials] = React.useState(false);

  const onSubmitForm = () => {
    const passwordIsCorrect = password === adminpassword;
    if (!passwordIsCorrect) {
      setError('Incorrect password');
    } else if (onShowConfidential) {
      onShowConfidential(true);
    }
    setShowConfidentials(passwordIsCorrect);
  };

  React.useEffect(() => {
    setPassword('');
    setError(null);
  }, [openModal]);

  if (showConfidentials) return null;

  return (
    <>
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'yellow',
            paddingHorizontal: 10,
          }
        ]}
      >
        <Text variant="caption">Confidential data is hidden</Text>
        <View style={{ marginLeft: 'auto' }} />
        <Button
          transparent
          onPress={() => setOpenModal(true)}
        ><Text variant="caption">SHOW</Text></Button>
      </View>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        style={{
          width: '100%',
        }}
      >
        <Item floatingLabel>
          <Label>Enter password</Label>
          <Input
            autoCapitalize="none"
            secureTextEntry
            autoCompleteType="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={onSubmitForm}
            value={password}
            onChangeText={v => setPassword(v)}
          />
        </Item>

        {error && <Text variant="caption" style={{ color: '#b20008', margin: 3, textAlign: 'center' }}>{error}</Text>}

        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: '100%',
            }
          ]}
        >
          <Button
            transparent
            onPress={() => setOpenModal(false)}
          ><Text variant="caption">Cancel</Text></Button>

          <Button
            transparent
            disabled={!password}
            onPress={() => onSubmitForm()}
          ><Text variant="caption">Unlock</Text></Button>
        </View>
      </Modal>
    </>
  );
};

Confidentials.propTypes = {
  onShowConfidential: PropTypes.func,
};

export default Confidentials;
