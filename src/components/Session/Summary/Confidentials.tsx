import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Box, Text } from "../../Theme";
import { TextInput } from "../../Form";
import { Modal } from "../../Modal";
import { Content } from "../../Content";
import {Br} from "../../../components/Br"


type ConfidentialsProps = {
    onShowConfidential?: (show: boolean) => void;
};

export function Confidentials({ onShowConfidential }: ConfidentialsProps) {
    const adminpassword = '1234';

    const [openModal, setOpenModal] = React.useState(false);
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
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
        setError('');
    }, [openModal]);

    if (showConfidentials) return null;

    return (
        <>
            <Box backgroundColor="highlight">
                <Content>
                    <Box
                        flexDirection="row"
                        alignItems="center"
                    >
                        <Text variant="caption" color="primary">Confidential data is hidden</Text>

                        <View style={{ marginLeft: 'auto' }} />

                        <TouchableOpacity
                            onPress={() => setOpenModal(true)}
                        ><Text variant="caption" color="primary" fontWeight="bold">SHOW</Text></TouchableOpacity>
                    </Box>
                </Content>
            </Box>

            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                actions={[
                    {
                        label: 'Cancel',
                        onPress: () => setOpenModal(false),
                    },
                    {
                        label: 'Submit',
                        onPress: () => onSubmitForm(),
                    }
                ]}
            >
                <TextInput
                    autoCapitalize="none"
                    secureTextEntry
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={onSubmitForm}
                    value={password}
                    onChangeText={v => setPassword(v)}
                    label="Enter password"
                    errors={error ? [error] : []}
                />
            </Modal>
        </>
    );
}
