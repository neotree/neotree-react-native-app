import React from 'react';
import { 
    Modal as RNModal, 
    ModalProps as RNModalProps, 
    ScrollView, 
    TouchableOpacity, 
    TouchableOpacityProps 
} from 'react-native';
import { Br } from './Br';
import { Content } from './Content';
import { Box, Text, useTheme } from './Theme';

type ModalAction = {
    label: React.ReactNode;
    onPress?: TouchableOpacityProps['onPress'];
};

type ModalProps = React.PropsWithChildren<RNModalProps & {
    open: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    actions?: ModalAction[];
}>;

export function Modal({ 
    children, 
    open, 
    onClose, 
    title,
    actions,
    ...props 
}: ModalProps) {
    const theme = useTheme();

    return (
        <RNModal
            transparent={true}
            statusBarTranslucent={true}
            {...props}
            visible={open}
        >
            <Box
                flex={1}
                justifyContent="center"
                paddingVertical="xl"
                style={{ backgroundColor: 'rgba(0,0,0,.3)' }}
            >
                <Box
                    maxHeight="90%"
                    overflow="hidden"
                >
                    <Content>
                        <Box 
                            backgroundColor="white"
                            elevation={24}
                            shadowColor="grey-400"
                            shadowOffset={{ width: -2, height: 4 }}
                            shadowOpacity={0.2}
                            shadowRadius={3}
                            borderRadius="s"
                        >
                            {!!title && (
                                <Box padding="m">
                                    {typeof title === 'string' ? (
                                        <Text variant="title2">{title}</Text>
                                    ) : title}
                                </Box>
                            )}

                            <Box maxHeight={500}>
                                <ScrollView>
                                    <Box padding="l">
                                        {children}
                                    </Box>
                                    <Br spacing="l" />
                                </ScrollView>
                            </Box>

                            {!actions ? null : (
                                <Box 
                                    flexDirection="row"
                                    justifyContent="flex-end" 
                                    padding="m"
                                >
                                    {actions.map((action, i) => {
                                        return (
                                            <TouchableOpacity 
                                                key={i}
                                                onPress={action.onPress}
                                                style={{ paddingHorizontal: theme.spacing.m }}
                                            >
                                                {typeof action.label !== 'string' ? action.label : (
                                                    <Text
                                                        color="primary"
                                                        textTransform="uppercase"
                                                        fontWeight="bold"
                                                    >{action.label}</Text>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    </Content>
                </Box>
            </Box>
        </RNModal>
    )
}
