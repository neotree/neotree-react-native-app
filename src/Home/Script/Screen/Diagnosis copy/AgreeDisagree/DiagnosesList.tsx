import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { FlatList, TextProps } from 'react-native';
import * as types from '../../../../../types';
import { CONTENT_STYLES, Box, Text, Content } from '../../../../../components';
import { DiagnosisListItem } from './DiagnossListItem';

type DiagnosisProps = types.ScreenTypeProps & {
	hcwDiagnoses: any[];
	suggestedDiagnoses: any[];
	variant: 'hcw' | 'suggested' | 'rejected';
	instructions?: string;
    instructionsStyle?: TextProps['style'];
};

export function DiagnosesList(props: DiagnosisProps) {
	const { hcwDiagnoses, suggestedDiagnoses, variant, instructions, instructionsStyle } = props;

	let diagnoses: any[] = [];
	if (variant === 'hcw') diagnoses = hcwDiagnoses;
	if ((variant === 'suggested') || (variant === 'rejected')) diagnoses = suggestedDiagnoses;

	const viewStyle = useAnimatedStyle(() => {
		let hidden = true;
		if (variant === 'hcw') hidden = !diagnoses.filter(d => d.selected.value).length;
		if (variant === 'suggested') hidden = !diagnoses.filter(d => d.suggested && (d.how_agree.value !== 'No')).length;
		if (variant === 'rejected') hidden = !diagnoses.filter(d => d.how_agree.value === 'No').length
 
		return {
			display: hidden ? 'none' : undefined,
		};
	});

	return (
		<Animated.View style={[viewStyle]}>
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
					>{(() => {
						switch (variant) {
							case 'hcw':
								return 'HCW Diagnoses';
							case 'suggested':
								return 'Suggested Diagnoses';
							case 'rejected':
								return 'Rejected Diagnoses';
							default:
								return ''
						}
					})()}</Text>
				</Box>
			</Content>


			<FlatList
				data={diagnoses}
				keyExtractor={(_, index) => `${index}`}
				centerContent
				contentContainerStyle={{
					...CONTENT_STYLES,
					marginLeft: 'auto',
					marginRight: 'auto',
				}}
				ListHeaderComponent={() => (
					<>
						{!!instructions && (
							<Box style={{ marginBottom: 10 }}>
								<Text color="primary">Instructions</Text>
								<Text 
                                    variant="caption"
                                    style={instructionsStyle}
                                >{instructions}</Text>
							</Box>
						)}
					</>
				)}
				renderItem={({ item, index, }) => {
					if (!item.selected.value) return null;

					return (
						<DiagnosisListItem 
							diagnosis={item}
							index={index}
							selected={item.selected}
							variant={variant}
						/>
					)
				}}
			/>
		</Animated.View>
	);
}
