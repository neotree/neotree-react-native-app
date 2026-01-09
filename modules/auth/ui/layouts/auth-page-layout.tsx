import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KeyboardPadding } from '@/components/keyboard-padding';
import { Logo } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { WINDOW_HEIGHT } from '@/constants';

type AuthPageLayoutProps = {
    children: React.ReactNode;
};

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
    return (
        <ScrollView
            contentContainerStyle={styles.scrollViewContentContainer}
            contentContainerClassName="bg-background"
        >
			<KeyboardPadding>
				<Card
					className="w-[90%] max-w-[700px]"
					as={SafeAreaView}
				>
					<CardContent className="gap-y-8">
						<View className="items-center">
							<Logo />
						</View>

						<View>
							{children}
						</View>
					</CardContent>
				</Card>
			</KeyboardPadding>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContentContainer: {
        minHeight: WINDOW_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
