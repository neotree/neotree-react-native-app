import React from "react";
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, Text, useTheme } from "../Theme";
import { Button } from "../Button";
import { Modal } from "../Modal";

type PrintBlockedDialogProps = {
    open: boolean;
    message: string;
    onClose: () => void;
};

export function PrintBlockedDialog({ open, message, onClose }: PrintBlockedDialogProps) {
    const theme = useTheme();

    return (
        <Modal open={open} onClose={onClose}>
            <Box alignItems="center">
                <Box
                    width={64}
                    height={64}
                    borderRadius="xl"
                    alignItems="center"
                    justifyContent="center"
                    marginBottom="m"
                    style={{ backgroundColor: `${theme.colors.error}18` }}
                >
                    <Icon name="report-problem" size={30} color={theme.colors.error} />
                </Box>

                <Text variant="title2" color="primary" textAlign="center">
                    Unable to print
                </Text>

                <Box marginTop="m" marginBottom="l">
                    <Text color="textSecondary" textAlign="center">
                        {message}
                    </Text>
                </Box>

                <Box
                    width="100%"
                    padding="m"
                    borderRadius="s"
                    marginBottom="l"
                    style={{ backgroundColor: `${theme.colors.warning}14` }}
                >
                    <Text color="textSecondary" textAlign="center">
                        Admission paper notes and QR labels are only available after the session is completed.
                    </Text>
                </Box>

                <Button color="primary" onPress={onClose}>
                    OK
                </Button>
            </Box>
        </Modal>
    );
}
