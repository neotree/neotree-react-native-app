import React from 'react';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as types from '../../../../../types';
import { Br, useTheme, Box } from '../../../../../components';
import { Delete } from './Delete';
import { AgreeDisagree } from './AgreeDisagree';

type DiagnosisListItemProps = {
	diagnosis: types.Diagnosis,
	selected: SharedValue<boolean>;
	index: number;
	hidden?: boolean;
	variant: 'hcw' | 'suggested' | 'rejected';
}

export function DiagnosisListItem({ diagnosis, hidden, selected, variant }: DiagnosisListItemProps) {
	const theme = useTheme();

	const viewStyle = useAnimatedStyle(() => {
		let show = false;
		if (variant === 'hcw') show = diagnosis.selected.value;
		if (variant === 'suggested') show = diagnosis.how_agree.value !== 'No';
		if (variant === 'rejected') show = diagnosis.how_agree.value === 'No';
		return {
			display: show ? undefined : 'none',
		};
	});

	return (
		<>
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
						backgroundColor: theme.colors.white,
						flexDirection: 'row', 
						alignItems: 'center'
					},
					viewStyle
				]}
			>
				<Animated.Text
					style={[
						{
							fontSize: 20,
						},
					]}
				>{diagnosis.label}</Animated.Text>

				<Box flex={1} />

				{variant === 'hcw' ? (
					<Delete
						onDelete={() => {
							selected.value = !selected.value;
						}}
					/>
				) : (
					<AgreeDisagree
						diagnosis={diagnosis}
					/>
				)}
			</Animated.View>

			<Br />
		</>
	);
}
