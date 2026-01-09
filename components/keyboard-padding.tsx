import { View } from 'react-native';

import { useKeyboard } from '@/hooks/use-keyboard';

export function KeyboardPadding({ children, }: {
	children: React.ReactNode;
}) {
	const keyboard = useKeyboard();

    return (
		<>
			{children}
			{!!keyboard?.height && <View style={{ height: keyboard.height, opacity: 0, }} />}
		</>
    );
}
