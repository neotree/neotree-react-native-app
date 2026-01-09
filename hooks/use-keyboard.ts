import { useEffect, useState } from "react";
import { Keyboard, type KeyboardMetrics } from "react-native";

export function useKeyboard() {
	const [visible, isVisible] = useState(false);
	const [metrics, setMetrics] = useState<KeyboardMetrics>();

	useEffect(() => {
		const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
			isVisible(true);
			setMetrics(e.endCoordinates);
		});
		const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
			isVisible(false);
			setMetrics(undefined);
		});

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, []);

	return {
		...metrics,
		visible,
	};
}
