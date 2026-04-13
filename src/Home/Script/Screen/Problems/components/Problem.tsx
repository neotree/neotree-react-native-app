import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';

import { Box, useTheme } from '../../../../../components';
import * as types from '../../../../../types';


type ProblemProps = {
    problem: types.Problem,
    setProblem: (d: types.Problem) => void;
};

export function Problem({ problem, setProblem }: ProblemProps) {
    const theme = useTheme();

    return (
        <>
            <Box
                flexDirection="row"
                columnGap="m"
                alignItems="center"
            >
                <TouchableOpacity
                    onPress={() => setProblem({
                        ...problem,
                        how_agree: 'Yes',
                        hcw_reason_given: null,
                    })}
                >
                    <Icon
                        size={24}
                        name="check-circle"
                        color={problem.how_agree !== 'Yes' ? theme.colors.textDisabled : theme.colors.primary}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setProblem({
                        ...problem,
                        how_agree: 'No',
                        hcw_reason_given: null,
                    })}
                >
                    <Icon
                        size={24}
                        name="cancel"
                        color={problem.how_agree !== 'No' ? theme.colors.textDisabled : theme.colors.error}
                    />
                </TouchableOpacity>
            </Box>
        </>
    );
}
