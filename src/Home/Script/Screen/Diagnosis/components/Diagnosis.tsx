import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';

import { Box, useTheme } from '../../../../../components';
import * as types from '../../../../../types';


type DiagnosisProps = {
    diagnosis: types.Diagnosis,
    setDiagnosis: (d: types.Diagnosis) => void;
};

export function Diagnosis({ diagnosis, setDiagnosis }: DiagnosisProps) {
    const theme = useTheme();

    return (
        <>
            <Box
                flexDirection="row"
                columnGap="m"
                alignItems="center"
            >
                <TouchableOpacity
                    onPress={() => setDiagnosis({
                        ...diagnosis,
                        how_agree: 'Yes',
                        hcw_reason_given: null,
                    })}
                >
                    <Icon
                        size={24}
                        name="check-circle"
                        color={diagnosis.how_agree !== 'Yes' ? theme.colors.textDisabled : theme.colors.primary}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setDiagnosis({
                        ...diagnosis,
                        how_agree: 'No',
                        hcw_reason_given: null,
                    })}
                >
                    <Icon
                        size={24}
                        name="cancel"
                        color={diagnosis.how_agree !== 'No' ? theme.colors.textDisabled : theme.colors.error}
                    />
                </TouchableOpacity>
            </Box>
        </>
    );
}
