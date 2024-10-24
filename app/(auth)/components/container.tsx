import { View } from 'react-native';

import { ScrollView } from '@/components/scroll-view';
import { Text } from '@/components/ui/text';
import { Poster } from "@/components/poster";
import { Content } from "@/components/content";
import { useNetInfo } from "@/hooks/use-netinfo";
import { WifiOff } from '@/components/svgs/wifi-off';
import { NO_INTERNET_CONNECTION } from '@/constants/copy';

export function AuthContainer({ children }: {
    children: React.ReactNode;
}) {
    const { hasInternet } = useNetInfo();

    return (
        <ScrollView minHeight="full">
            <Poster>
                <Content className="py-10">
                    {!hasInternet ? (
                        <View className="justify-center items-center gap-y-3">
                            <WifiOff 
                                size={36}
                                svgClassName="w-36 h-36 opacity-40"
                            />

                            <Text className='opacity-40 text-sm'>{NO_INTERNET_CONNECTION}</Text>
                        </View>
                    ): children}
                </Content>
            </Poster>
        </ScrollView>
    );
}
