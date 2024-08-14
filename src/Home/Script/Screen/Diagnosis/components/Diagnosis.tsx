import React from 'react';
import { TouchableOpacity, Modal, Platform, ScrollView, Dimensions } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, Br, Button, Content, Fab, Header, Text, TextInput, useTheme, Image } from '../../../../../components';
import * as types from '../../../../../types';

const { height: winH } = Dimensions.get('window');


type DiagnosisProps = {
    diagnosis: types.Diagnosis,
    setDiagnosis: (d: types.Diagnosis) => void;
};

export function Diagnosis({ diagnosis, setDiagnosis }: DiagnosisProps) {
    const theme = useTheme();

    const [openModal, setOpenModal] = React.useState(false);
    const [form, _setForm] = React.useState<types.Diagnosis>(diagnosis);
    const setForm = (s: Partial<types.Diagnosis>) => _setForm((prev: types.Diagnosis) => ({ ...prev, ...(typeof s === 'function' ? s(prev) : s) }));

    const instrunctions = [
        { text: diagnosis.text1, image: diagnosis.image1 },
        { text: diagnosis.text2, image: diagnosis.image2 },
        { text: diagnosis.text3, image: diagnosis.image3 }
    ].filter(item => item.text || item.image);

    const onClose = () => {
        setDiagnosis({ ...diagnosis, ...form });
        setOpenModal(false);
    };

    const symptoms: any[] = diagnosis.symptoms || [];

    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    setForm(diagnosis);
                    setOpenModal(true);
                }}
            >
                <Icon
                    size={30}
                    name="thumb-up"
                    color={diagnosis.how_agree !== 'Yes' ? theme.colors.textDisabled : theme.colors.primary}
                />
            </TouchableOpacity>

            <Modal
                visible={openModal}
                transparent={true}
                statusBarTranslucent
                animationType="slide"
                onRequestClose={() => onClose()}
            >
                <Box backgroundColor="white" flex={1} height={winH}>
                    <Header
                        left={(
                            <TouchableOpacity onPress={() => onClose()}>
                                <Icon
                                    size={28}
                                    color={theme.colors.primary}
                                    name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}  
                                />
                            </TouchableOpacity>
                        )}
                        title={(
                            <>
                                <Text
                                    color="primary"
                                    variant="title3"
                                    numberOfLines={1}
                                >Suggested diagnoses</Text>
                                <Text variant="caption">{diagnosis?.customValue || diagnosis?.name}</Text>
                            </>
                        )}
                    />

                    <Box height={winH - 100}>
                        <ScrollView>
                            <Content>
                                {!!symptoms.length && (
                                    <>
                                        <Text textTransform="uppercase" variant="title3">Symptoms</Text>
                                        {symptoms.map((s, i) => (
                                            <Text key={i}>{i + 1}. {s.name}</Text>
                                        ))}
                                        <Br spacing="m" />
                                    </>
                                )}

                                <Br spacing='s'/>

                                <Text variant="title3">Do you agree with this diagnosis?</Text>

                                <Br spacing='s'/>

                                <Box flexDirection="row">
                                    {[
                                        {
                                            label: 'Yes',
                                        },
                                        {
                                            label: 'No',
                                        },
                                        ].map(({ label, ...btnProps }) => {
                                            const selected = form.how_agree === label;
                                            return (
                                                <Box 
                                                    key={`follow_${label}`} 
                                                    marginRight="m"
                                                >
                                                    <Button
                                                        {...btnProps}
                                                        onPress={() => setForm({
                                                            how_agree: label,
                                                            hcw_reason_given: label === 'No' ? form.hcw_reason_given : null,
                                                        })}
                                                        style={selected ? {} : { backgroundColor: '#fff' }}
                                                        textStyle={selected ? {} : { color: theme.colors.textPrimary }}
                                                    >
                                                        {label}
                                                    </Button>
                                                </Box>
                                            );
                                    })}
                                </Box>

                                {form.how_agree === 'No' && (
                                    <>
                                        <Br spacing='s'/>
                                        <TextInput
                                            label="Can you explain why not?"
                                            value={form.hcw_reason_given}
                                            onChangeText={v => setForm({ hcw_reason_given: v })}
                                        />
                                        <Br spacing='s'/>
                                    </>
                                )}

                                <Br spacing='s'/>                                

                                {instrunctions.map(({ image, text }, i) => {
                                    const key = `${i}`;
                                    return (
                                        <React.Fragment key={key}>
                                            <Box key={key} style={{ marginVertical: 10 }}>
                                                {!!text && <Text>{text}</Text>}

                                                {!!image && (
                                                    <Image
                                                        fullWidth
                                                        resizeMode="contain"
                                                        source={{ uri: image.data }}
                                                    />
                                                )}
                                            </Box>
                                        </React.Fragment>
                                    );
                                })}

                                <Br spacing='s'/>

                                <Text variant="title3">Did you folow the above instructions?</Text>

                                <Br spacing='s'/>

                                <Box flexDirection="row">
                                    {[
                                        {
                                            label: 'Yes',
                                        },
                                        {
                                            label: 'No',
                                        },
                                        ].map(({ label, ...btnProps }) => {
                                            const selected = form.hcw_follow_instructions === label;
                                            return (
                                                <Box 
                                                    key={`follow_${label}`} 
                                                    marginRight="m"
                                                >
                                                    <Button
                                                        {...btnProps}
                                                        onPress={() => setForm({ hcw_follow_instructions: label })}
                                                        style={selected ? {} : { backgroundColor: '#fff' }}
                                                        textStyle={selected ? {} : { color: theme.colors.textPrimary }}
                                                    >
                                                        {label}
                                                    </Button>
                                                </Box>
                                            );
                                    })}
                                </Box>
                            </Content>
                        </ScrollView>

                        <Box 
                            position="absolute"
                            bottom={10}
                            right={20}
                        >
                            <Fab 
                                onPress={() => {
									onClose();
                                }} 
                            />
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}
