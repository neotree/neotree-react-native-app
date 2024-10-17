import React, { useState } from 'react';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { FlatList, TouchableOpacity, View } from 'react-native';
import * as types from '../../../../types';
import { Br, CONTENT_STYLES, Fab, useTheme, Box, Content, Card, Text } from '../../../../components';
import { useContext } from '../../Context';

type DiagnosisListItemProps = {
	diagnosis: types.Diagnosis,
	index: number;
}

function DiagnosisListItem({ diagnosis }: DiagnosisListItemProps) {
	const theme = useTheme();

	return (
		<>
			<Card>
				<View
					style={{ flexDirection: 'row' }}
				>
					<Text style={{ flex: 1, }}>{diagnosis.label}</Text>
					<Text>{diagnosis.position}</Text>
				</View>
			</Card>

			<Br spacing='s'/>
		</>
	);
}

type DiagnosisProps = types.ScreenTypeProps & {
	hcwDiagnoses: any[];
	suggestedDiagnoses: any[];
	onNext: () => void;
};

export function SortPriority(props: DiagnosisProps) {
	const { onNext } = props;
	const { activeScreenEntry } = useContext()||{};

	const [data] = useState([]);

	console.log(activeScreenEntry)

	return (
		<>
			<FlatList
				data={data}
				keyExtractor={(_, index) => `${index}`}
				centerContent
				contentContainerStyle={{
					...CONTENT_STYLES,
					marginLeft: 'auto',
					marginRight: 'auto',
					paddingBottom: 200,
				}}
				ListHeaderComponent={(
					<>
						<Content>
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
								>Compiled Diagnoses</Text>

								<Text
									color="textDisabled"
									textTransform="uppercase"
									fontWeight="bold"
								>Please order the diagnoses by priority</Text>
							</Box>
						</Content>

						<Br spacing="xl" />
					</>
				)}
				renderItem={({ item, index, }) => {
					return (
						<DiagnosisListItem 
							diagnosis={item}
							index={index}
						/>
					)
				}}
			/>

			<Animated.View
				style={[
					{
						position: 'absolute',
						bottom: 10,
						right: 20,
					}
				]}
			>
				<Fab 
					onPress={() => {
						onNext();
					}}
				/>
			</Animated.View>
		</>
	);
}
