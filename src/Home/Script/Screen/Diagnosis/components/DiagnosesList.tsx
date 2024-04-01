import React, { Fragment } from 'react';
import { View, Alert, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, Br, Content, Text, useTheme } from '../../../../../components';
import * as types from '../../../../../types';
import { Diagnosis } from './Diagnosis';

type DiagnosesListProps = types.DiagnosisSectionProps & {
    scrollable?: boolean;
    filter?: (d: types.Diagnosis, index: number) => boolean; 
    title?: any; 
    sortable?: boolean;
    subtitle?: any; 
    divider?: any; 
    canAgreeDisagree?: any; 
    canDelete?: any;
    instructions?: any; 
    emptyListMessage?: any;
    itemWrapper?: (card: any, params: { item: types.Diagnosis; index: number; }) => React.ReactNode;
};

export function DiagnosesList({
    filter, 
    scrollable,
    title, 
    subtitle, 
    divider, 
    canAgreeDisagree, 
    canDelete,
    instructions, 
    emptyListMessage,
    itemWrapper,
    _setHcwDiagnoses,
    diagnoses,
    setDiagnoses,
}: DiagnosesListProps) {
    const theme = useTheme();

    const displayedDiagnoses = diagnoses.filter((d, i) => filter ? filter(d, i) : true);

    if (!displayedDiagnoses.length) {
        if (emptyListMessage) {
            return (
            <Box style={{ marginBottom: 30, marginTop: 20 }}>
                <Text color="textDisabled" textAlign="center" variant="caption">{emptyListMessage}</Text>
            </Box>
            );
        }
        return null;
    }

    const Container = scrollable ? ScrollView : Fragment;

    return (
		<Container>
			<Content>
				<Box>
					{!!instructions && (
						<Box style={{ marginBottom: 30, marginTop: 20 }}>
							<Text color="primary">Instructions</Text>
							<Text variant="caption">{instructions}</Text>
						</Box>
					)}

					<Box
						style={{
							padding: 10,
							borderTopWidth: 1,
							borderBottomWidth: 1,
							borderColor: '#999',
						}}
					>
						<Text
							color="textDisabled"
							textTransform="uppercase"
							fontWeight="bold"
						>{title}</Text>

						{!!subtitle && <Text variant="caption" color="textDisabled">{subtitle}</Text>}
					</Box>

					{diagnoses.map((item, index) => {
						if (filter && !filter(item, index)) return null;
						const key = item.id || index;

						const card = (
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<View>
									<Text>{item.customValue || item.name}</Text>
									{!!item.expressionMeaning && <Text variant="caption" style={{ color: '#999' }}>{item.expressionMeaning}</Text>}
								</View>

								<View style={{ marginLeft: 'auto' }} />

								{canAgreeDisagree !== false && (
									<Diagnosis
										setDiagnosis={s => {
											setDiagnoses(diagnoses.map((d, i) => {
												if (i !== index) return d;
												return { ...d, ...s };
											}));
										}}
										diagnosis={item}
									/>
								)}

								<View style={{ marginHorizontal: 5 }} />

								{canDelete !== false && (
									<TouchableOpacity
										onPress={() => {
											const deleteDiagnosis = () => {
												setDiagnoses(diagnoses.filter((_, i) => i !== index));
												_setHcwDiagnoses(hcwDiagnoses => hcwDiagnoses.filter((d: any) => d.name !== item.name));
											};
											Alert.alert(
												'Delete diagnosis',
												'Are you sure?',
												[
													{
														text: 'Cancel',
														onPress: () => {},
														style: 'cancel'
													},
													{
														text: 'Yes',
														onPress: () => deleteDiagnosis()
													}
												],
												{ cancelable: false }
											);
										}}
									>
										<Icon 
											size={30} 
											color={theme.colors.textDisabled} 
											name="delete" 
										/>
									</TouchableOpacity>
								)}
							</View>
						);

						return (
							<Box 
								key={key} 
								borderColor="divider"
								borderRadius="m"
								marginVertical="m"
								borderWidth={1}
								padding="m"
							>
								{itemWrapper ? itemWrapper(card, { item, index }) : card}
							</Box>
						);
					})}

					{!!divider && <Br spacing="l" />}
				</Box>
			</Content>
		</Container>
    );
}
