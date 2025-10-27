import React from 'react';
import { TouchableOpacity, View, FlatList } from 'react-native';

import { useScriptContext } from '@/src/contexts/script';
import { Box, Text, Modal, Card, Br, TextInput, CONTENT_STYLES } from '../../../../components';
import * as types from '../../../../types';

type SelectDiagnosesProps = types.DiagnosisSectionProps & {
    
};

export function SelectDiagnoses({ 
    hcwDiagnoses, 
    searchVal, 
    diagnoses,
    getDefaultDiagnosis, 
    setHcwDiagnoses, 
    setDiagnoses, 
}: SelectDiagnosesProps) {
    const {activeScreen,diagnoses:allDiagnoses,getFieldPreferences } = useScriptContext();

    const metadata = activeScreen?.data?.metadata;

    const [customValue, setCustomValue] = React.useState('');
    const [customValueModal, setCustomValueModal] = React.useState<null | { onClose: (opts: { customValue: any; }) => void; }>(null);
    const closeCustomValueModal = () => {
        if (customValueModal?.onClose) customValueModal.onClose({ customValue });
        setCustomValueModal(null);
        setCustomValue('');
    };

    const _items: any[] = metadata.items.map((item: any) => {
        const d = allDiagnoses.map(d => d.data).find(d => (d.key === item?.id) || (d.name === item?.name));

        let sevOrder = d?.severity_order || (d?.severity_order === 0) ? Number(d.severity_order) : null;
        if (isNaN(Number(sevOrder))) sevOrder = null;

        let itemSevOrder = item.severity_order || (item.severity_order === 0) ? Number(item.severity_order) : null;
        if (isNaN(Number(itemSevOrder))) itemSevOrder = null;

        return {
            ...item,
            key: item.key || item.id,
            severity_order: itemSevOrder,
            ...(!d ? null : {
                text1: d.text1,
                image1: d.image1,
                text2: d.text2,
                image2: d.image2,
                text3: d.text3,
                image3: d.image3,
                symptoms: d.symptoms || [],
                severity_order: itemSevOrder || sevOrder,
            }),
        };
    });
    const items = [
        ..._items.filter(d => (d.severity_order !== null) || (d.severity_order !== undefined) || (d.severity_order !== ''))
            .sort((a, b) => a.severity_order - b.severity_order),
        ..._items.filter(d => (d.severity_order === null) || (d.severity_order === undefined) || (d.severity_order === '')),
    ];

    const exclusiveIsSelected = items
        .filter(item => item.exclusive)
        .filter(item => hcwDiagnoses.map(d => d.name).includes(item.label))[0];

    return (
        <>
            <Box>
				<FlatList 
					data={items}
					keyExtractor={(_, index) => `${index}`}
					ListHeaderComponent={(
						<>
							{!!activeScreen?.data?.instructions && (
								<>
									<Box>
										<Text color="primary">Instructions</Text>
										<Text 
                                            variant="caption"
                                            style={getFieldPreferences('instructions')?.style}
                                        >{activeScreen?.data?.instructions}</Text>
									</Box>
								</>
							)}

							<Br spacing="xl" />
						</>
					)}
					centerContent
					contentContainerStyle={{
						...CONTENT_STYLES,
						marginLeft: 'auto',
						marginRight: 'auto',
						paddingBottom: 200,
					}}
					renderItem={({ item }) => {
						const hide = searchVal ? !`${item.label}`.match(new RegExp(searchVal, 'gi')) : false;
                    
						const isExclusive = item.exclusive;
						const diagnosis = hcwDiagnoses.filter(d => d.name === item.label)[0];
						const isSelected = !!diagnosis;
						const disabled = exclusiveIsSelected && !isExclusive;
			
						const setValue = (val?: Partial<types.Diagnosis>) => {
							setHcwDiagnoses([
                                ...hcwDiagnoses.filter(d => !isExclusive ? true : !items.map(item => item.label).includes(d.name)), 
                                {
                                    ...getDefaultDiagnosis({
                                        key: item.key,
                                        name: item.label,
                                        how_agree: 'Yes',
                                        priority: null, // hcwDiagnoses.length,
                                        text1: item.text1,
                                        image1: item.image1,
                                        text2: item.text2,
                                        image2: item.image2,
                                        text3: item.text3,
                                        image3: item.image3,
                                        suggested: false,
                                        isHcwDiagnosis: true,
                                        severity_order: item.severity_order,
                                        ...val,
                                    }),
                                },
                            ]);
						};

						return (
							<View
								style={hide ? { display: 'none' } : {}}
							>
								<TouchableOpacity                                
									onPress={() => {
										if (exclusiveIsSelected && !isExclusive) return;
										if (isSelected) {
											setHcwDiagnoses(hcwDiagnoses.filter(d => d.name !== item.label));
											setDiagnoses(diagnoses.filter((d) => d.name !== item.label));
										} else {
											if (item.enterValueManually) {
												setCustomValueModal({ onClose: setValue });
											} else {
												setValue();
											}
										}
									}}
								>  
									<Card
										backgroundColor={(() => {
											if (isSelected) return 'primary';
											if (disabled) return 'disabledBackground';
											return;
										})()}
									>
										<Text
											variant="title3"
											color={(() => {
												if (isSelected) return 'primaryContrastText';
												if (disabled) return 'textDisabled';
												return;
											})()}
										>{item.label}</Text>

										{!!(diagnosis && diagnosis.customValue) && (
											<Text
												variant="caption"
												color={(() => {
													if (isSelected) return 'primaryContrastText';
													if (disabled) return 'textDisabled';
													return;
												})()}
											>{diagnosis.customValue}</Text>
										)}
									</Card>
								</TouchableOpacity>

								{diagnosis && diagnosis.customValue && (
									<TouchableOpacity 
										onPress={() => {
											setCustomValue(diagnosis.customValue);
											setCustomValueModal({ onClose: setValue });
										}}
									>
										<Text variant="caption">Edit value</Text>
									</TouchableOpacity>
								)}

								<Br spacing="m" />
							</View>
						);
					}}
				/>

                {/* {items.map((item, i) => {
                    const hide = searchVal ? !`${item.label}`.match(new RegExp(searchVal, 'gi')) : false;
                    
                    const key = `${i}`;
                    const isExclusive = item.exclusive;
                    const diagnosis = hcwDiagnoses.filter(d => d.name === item.label)[0];
                    const isSelected = !!diagnosis;
                    const disabled = exclusiveIsSelected && !isExclusive;
        
                    const setValue = (val?: Partial<types.Diagnosis>) => {
                        setHcwDiagnoses([...hcwDiagnoses.filter(d => !isExclusive ? true : !items.map(item => item.label).includes(d.name)), {
                            ...getDefaultDiagnosis({
                                name: item.label,
                                how_agree: 'Yes',
                                priority: hcwDiagnoses.length,
                                text1: item.text1,
                                image1: item.image1,
                                text2: item.text2,
                                image2: item.image2,
                                text3: item.text3,
                                image3: item.image3,
                                suggested: true,
                                isHcwDiagnosis: true,
                                ...val,
                            }),
                        }]);
                    };

                    return (
                        <View 
                            key={key}
                            style={hide ? { display: 'none' } : {}}
                        >
                            <TouchableOpacity                                
                                onPress={() => {
                                    if (exclusiveIsSelected && !isExclusive) return;
                                    if (isSelected) {
                                        setHcwDiagnoses(hcwDiagnoses.filter(d => d.name !== item.label));
                                        setDiagnoses(diagnoses.filter((d) => d.name !== item.label));
                                    } else {
                                        if (item.enterValueManually) {
                                            setCustomValueModal({ onClose: setValue });
                                        } else {
                                            setValue();
                                        }
                                    }
                                }}
                            >  
                                <Card
                                    backgroundColor={(() => {
                                        if (isSelected) return 'primary';
                                        if (disabled) return 'disabledBackground';
                                        return;
                                    })()}
                                >
                                    <Text
                                        variant="title3"
                                        color={(() => {
                                            if (isSelected) return 'primaryContrastText';
                                            if (disabled) return 'textDisabled';
                                            return;
                                        })()}
                                    >{item.label}</Text>

                                    {!!(diagnosis && diagnosis.customValue) && (
                                        <Text
                                            variant="caption"
                                            color={(() => {
                                                if (isSelected) return 'primaryContrastText';
                                                if (disabled) return 'textDisabled';
                                                return;
                                            })()}
                                        >{diagnosis.customValue}</Text>
                                    )}
                                </Card>
                            </TouchableOpacity>

                            {diagnosis && diagnosis.customValue && (
                                <TouchableOpacity 
                                    onPress={() => {
                                        setCustomValue(diagnosis.customValue);
                                        setCustomValueModal({ onClose: setValue });
                                    }}
                                >
                                    <Text variant="caption">Edit value</Text>
                                </TouchableOpacity>
                            )}

                            <Br spacing="m" />
                        </View>
                    );
                })} */}
            </Box>

            <Modal
                open={!!customValueModal}
                onClose={closeCustomValueModal}
                actions={[
                    {
                        label: 'Cancel',
                        onPress: () => closeCustomValueModal(),
                    },
                    ...(!customValue ? [] : [{
                        label: 'Save',
                        onPress: () => closeCustomValueModal(),
                    }])
                ]}
            >
                <Box>
                    <TextInput
                        value={customValue}
                        onChangeText={val => setCustomValue(val)}
                        placeholder="Custom value"
                    />
                </Box>
            </Modal>
        </>
    );
}
