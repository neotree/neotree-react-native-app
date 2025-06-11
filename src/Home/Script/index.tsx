import React, { useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

import * as types from '@/src/types';
import { Text, Box, Modal, OverlayLoader } from '@/src/components';
import { useBackButton } from '@/src/hooks/useBackButton';
import { ScriptContextProvider, useScriptContext } from '@/src/contexts/script';
import { Start } from './Start';
import { Screen } from './Screen';
import { Summary } from './Summary';
import { ReviewScreen } from './Screen/ReviewScreen';

export function Script(props: types.StackNavigationProps<types.HomeRoutes, 'Script'>) {
	const isFocused = useIsFocused();
	return !isFocused ? null : (
		<ScriptContextProvider {...props}>
			<ScriptComponent {...props} />
		</ScriptContextProvider>
	);
}

function ScriptComponent({ navigation }: types.StackNavigationProps<types.HomeRoutes, 'Script'>) {
	const {
		script, 
		activeScreen, 
		moreNavOptions,
		refresh,
		loadingConfiguration,
		loadingScript,
		isReady,
		loadScriptError,
		application,
		summary,
		reviewConfigurations,
		review,
		shouldReview,
		lastPage,
		lastPageIndex,
		shouldConfirmExit,
		displayLoader,
		setShoultConfirmExit,
		createSummaryAndSaveSession,
		handleReviewNoPress,
		handleReviewChange,
		init,
		setNavOptions,
		goBack,
		loadScript,
	} = useScriptContext();

	useEffect(() => { init(); }, [init]);

	React.useEffect(() => { setNavOptions(); }, [script, activeScreen, moreNavOptions]);

	useBackButton(() => {
		if (moreNavOptions?.goBack) {
			moreNavOptions.goBack();
		} else {
			goBack();
		}
	});

	if (refresh) return null;

	if (loadingConfiguration || loadingScript || !isReady) return <OverlayLoader transparent={false} />;

	if (loadScriptError) {
		return (
			<Modal
				open
				onClose={() => { }}
				title="Error"
				actions={[
					{
						label: 'Exit',
						onPress: () => navigation.navigate('Home'),
					},
					{
						label: 'Try again',
						onPress: () => loadScript,
					},
				]}
			>
				<Text>{loadScriptError}</Text>
			</Modal>
		)
	}

	if (!(script && application)) return null;

	return (
		<>
			{(() => {
				if (summary) return <Summary />;

				return (
					<>
						<Box flex={1} paddingBottom="m" backgroundColor="white">
							{!activeScreen ? (
								<Start />
							) : (
								<Screen />
							)}
						</Box>
						{reviewConfigurations?.length > 0 && review && shouldReview && (
							<Box
								position="absolute"
								top={0}
								bottom={0}
								left={0}
								right={0}
								zIndex={10}
								justifyContent="center" 
								style={{
									backgroundColor: 'rgba(0,0,0,0.8)',
									}}
							>
								<Box
									width="90%"  
									borderRadius="l" 
									padding="m"
								>
									<ReviewScreen
										screens={reviewConfigurations}
										onChange={handleReviewChange}
										lastPage={lastPage}
										lastPageIndex={lastPageIndex}
										onSkip={handleReviewNoPress}
									/>
								</Box>
							</Box>
						)}

						<Modal
							open={shouldConfirmExit}
							onClose={() => setShoultConfirmExit(false)}
							title="Cancel Script?"
							actions={[
								{
									label: 'Cancel',
									onPress: () => setShoultConfirmExit(false),
								},
								{
									label: 'Yes',
									onPress: () => {
										(async () => {
											await createSummaryAndSaveSession({ cancelled: true, });
											navigation.navigate('Home');
											setShoultConfirmExit(false);
										})();
									}
								},
							]}
						>
							<Text>Are you sure you want to cancel script?</Text>
						</Modal>


					</>
				);
			})()}

			{displayLoader && <OverlayLoader />}
		</>
	);
}
