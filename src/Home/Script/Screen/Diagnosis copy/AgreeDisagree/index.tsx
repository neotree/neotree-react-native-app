import React from 'react';
import Animated from 'react-native-reanimated';
import * as types from '../../../../../types';
import { DiagnosesList } from './DiagnosesList';
import { Fab, Br } from '../../../../../components';
import { useContext } from '../../../Context';

type DiagnosisProps = types.ScreenTypeProps & {
	hcwDiagnoses: any[];
	suggestedDiagnoses: any[];
	onNext: () => void;
};

export function AgreeDisagree(props: DiagnosisProps) {
	const { onNext } = props;
    const ctx = useContext();
	const { activeScreen } = ctx;

	return (
		<>
			<DiagnosesList 
				{...props}
				variant="hcw"
				instructions={activeScreen.data.hcwDiagnosesInstructions}
                instructionsStyle={ctx.getFieldPreferences('hcwDiagnosesInstructions')?.style}
			/>

			<Br spacing='s'/>

			<DiagnosesList 
				{...props}
				variant="suggested"
				instructions={activeScreen.data.suggestedDiagnosesInstructions}
                instructionsStyle={ctx.getFieldPreferences('suggestedDiagnosesInstructions')?.style}
			/>

			<Br spacing='s'/>

			<DiagnosesList 
				{...props}
				variant="rejected"
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
