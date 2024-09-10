import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { TouchableOpacity, Modal, Platform, ScrollView, Dimensions } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, Br, Button, Content, Fab, Header, Text, TextInput, useTheme, Image } from '../../../../../components';
import * as types from '../../../../../types';

const { height: winH } = Dimensions.get('window');


type AgreeDisagreeProps = {
    diagnosis: types.Diagnosis,
};

export function AgreeDisagree({ diagnosis }: AgreeDisagreeProps) {
    const theme = useTheme();

    const [openModal, setOpenModal] = React.useState(false);
	const [how_agree, setHowAgree] = React.useState('');
	const [hcw_reason_given, setHcwReasonGiven] = React.useState('');
	const [hcw_follow_instructions, setHcwFollowInstructions] = React.useState('');

    const instrunctions = [
        { text: diagnosis.text1, image: diagnosis.image1 },
        { text: diagnosis.text2, image: diagnosis.image2 },
        { text: diagnosis.text3, image: diagnosis.image3 }
    ].filter(item => item.text || item.image);

    const onClose = () => {
		diagnosis.how_agree.value = how_agree || null;
		diagnosis.hcw_reason_given.value = hcw_reason_given || null;
		diagnosis.hcw_follow_instructions.value = hcw_follow_instructions || null;
		setOpenModal(false);
    };

    const symptoms: any[] = diagnosis.symptoms || [];

	const primaryAnimatedViewStyle = useAnimatedStyle(() => {
		return {
			display: (diagnosis.how_agree.value === 'Yes') ? undefined : 'none',
		};
	});

	const defaultAnimatedViewStyle = useAnimatedStyle(() => {
		return {
			display: (diagnosis.how_agree.value === 'Yes') ? 'none' : undefined,
		};
	});

    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    setOpenModal(true);
					setHowAgree(diagnosis.how_agree.value || '');
					setHcwReasonGiven(diagnosis.hcw_reason_given.value || '');
					setHcwFollowInstructions(diagnosis.hcw_follow_instructions.value || '');
                }}
            >
				<Animated.View 
					style={[primaryAnimatedViewStyle]}
				>
					<Icon
						size={30}
						name="thumb-up"
						color={theme.colors.primary}
					/>
				</Animated.View>

				<Animated.View style={[defaultAnimatedViewStyle]}>
					<Icon
						size={30}
						name="thumb-up"
						color={theme.colors.textDisabled}
					/>
				</Animated.View>
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
                                            const selected = how_agree === label;
                                            return (
                                                <Box 
                                                    key={`follow_${label}`} 
                                                    marginRight="m"
                                                >
                                                    <Button
                                                        {...btnProps}
                                                        onPress={() => {
															setHowAgree(label);
															setHcwReasonGiven(label === 'No' ? hcw_reason_given : '')
														}}
                                                        style={selected ? {} : { backgroundColor: '#fff' }}
                                                        textStyle={selected ? {} : { color: theme.colors.textPrimary }}
                                                    >
                                                        {label}
                                                    </Button>
                                                </Box>
                                            );
                                    })}
                                </Box>

                                {how_agree === 'No' && (
                                    <>
                                        <Br spacing='s'/>
                                        <TextInput
                                            label="Can you explain why not?"
                                            value={hcw_reason_given}
                                            onChangeText={v => setHcwReasonGiven(v)}
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
                                            const selected = hcw_follow_instructions === label;
                                            return (
                                                <Box 
                                                    key={`follow_${label}`} 
                                                    marginRight="m"
                                                >
                                                    <Button
                                                        {...btnProps}
                                                        onPress={() => setHcwFollowInstructions(label)}
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
