import React from 'react';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { FlatList, TouchableOpacity } from 'react-native';
import * as types from '../../../../types';
import { Br, CONTENT_STYLES, Fab, useTheme, Box, Text } from '../../../../components';
import { useContext } from '../../Context';

type DiagnosisListItemProps = {
	diagnosis: types.Diagnosis,
	selected: SharedValue<boolean>;
	index: number;
	hidden: boolean;
}

function DiagnosisListItem({ diagnosis, selected, hidden }: DiagnosisListItemProps) {
	const theme = useTheme();

	const viewStyle = useAnimatedStyle(() => ({
		backgroundColor: selected.value ? theme.colors.primary : 'white',
	}));

	const textStyle = useAnimatedStyle(() => ({
		color: selected.value ? theme.colors.primaryContrastText : theme.colors.textPrimary,
	}));

	return (
		<>
			<TouchableOpacity
				onPress={() => {
					selected.value = !selected.value;
				}}
			>
				<Animated.View
					style={[
						{
							padding: theme.spacing.m,
							elevation: 24,
							shadowColor: theme.colors['grey-400'],
							shadowOffset: { width: -2, height: 4 },
							shadowOpacity: 0.2,
							shadowRadius: 3,
							borderRadius: theme.spacing.s,
							display: hidden ? 'none' : undefined,
						},
						viewStyle,
					]}
				>
					<Animated.Text
						style={[
							{
								fontSize: 20,
							},
							textStyle
						]}
					>{diagnosis.label}</Animated.Text>
				</Animated.View>
			</TouchableOpacity>

			<Br />
		</>
	);
}

type DiagnosisProps = types.ScreenTypeProps & {
	hcwDiagnoses: any[];
	suggestedDiagnoses: any[];
	onNext: () => void;
};

export function SelectHcwDiagnoses(props: DiagnosisProps) {
	const { searchVal, hcwDiagnoses, onNext } = props;
	const { activeScreen } = useContext();

	return (
		<>
			<FlatList
				data={hcwDiagnoses}
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
						{!!activeScreen.data.instructions && (
							<>
								<Box>
									<Text color="primary">Instructions</Text>
									<Text variant="caption">{activeScreen.data.instructions}</Text>
								</Box>
							</>
						)}

						<Br spacing="xl" />
					</>
				)}
				renderItem={({ item, index, }) => {
					const hide = searchVal ? !`${item.label}`.match(new RegExp(searchVal, 'gi')) : false;
					return (
						<DiagnosisListItem 
							diagnosis={item}
							index={index}
							selected={item.selected}
							hidden={hide}
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
