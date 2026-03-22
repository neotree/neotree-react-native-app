import React, { Fragment } from 'react';
import { View, Alert, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, Br, Content, Text, useTheme } from '../../../../../components';
import * as types from '../../../../../types';
import { Problem } from './Problem';

type ProblemsListProps = types.ProblemSectionProps & {
    scrollable?: boolean;
    filter?: (d: types.Problem, index: number) => boolean; 
    title?: any; 
    sortable?: boolean;
    subtitle?: any; 
    divider?: any; 
    canAgreeDisagree?: any; 
    canDelete?: any;
    instructions?: any; 
    emptyListMessage?: any;
    itemWrapper?: (card: any, params: { item: types.Problem; index: number; }) => React.ReactNode;
};

export function ProblemsList({
    filter, 
    scrollable,
    title, 
    subtitle, 
    divider, 
    canAgreeDisagree, 
    canDelete,
    instructions, 
    emptyListMessage,
    itemWrapper,
    _setHcwProblems,
    problems,
    setProblems,
}: ProblemsListProps) {
    const theme = useTheme();

    const displayedProblems = problems.filter((d, i) => filter ? filter(d, i) : true);

    if (!displayedProblems.length) {
        if (emptyListMessage) {
            return (
            <Box style={{ marginBottom: 30, marginTop: 20 }}>
                <Text color="textDisabled" textAlign="center" variant="caption">{emptyListMessage}</Text>
            </Box>
            );
        }
        return null;
    }

    const Container = scrollable ? ScrollView : Fragment;

    return (
		<Container>
			<Content>
				<Box>
					{!!instructions && (
						<Box style={{ marginBottom: 30, marginTop: 20 }}>
							<Text color="primary">Instructions</Text>
							<Text variant="caption">{instructions}</Text>
						</Box>
					)}

					<Box
						style={{
							padding: 10,
							borderTopWidth: 1,
							borderBottomWidth: 1,
							borderColor: '#999',
						}}
					>
						<Text
							color="textDisabled"
							textTransform="uppercase"
							fontWeight="bold"
						>{title}</Text>

						{!!subtitle && <Text variant="caption" color="textDisabled">{subtitle}</Text>}
					</Box>

					{problems.map((item, index) => {
						if (filter && !filter(item, index)) return null;
						const key = item.id || index;

						const card = (
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<View style={{ flex: 1, }}>
									<Text>{item.customValue || item.name}</Text>
									{!!item.expressionMeaning && <Text variant="caption" style={{ color: '#999' }}>{item.expressionMeaning}</Text>}
								</View>

								{canAgreeDisagree !== false && (
									<Problem
										setProblem={s => {
											setProblems(problems.map((d, i) => {
												if (i !== index) return d;
												return { ...d, ...s };
											}));
										}}
										problem={item}
									/>
								)}

								<View style={{ marginHorizontal: 5 }} />

								{canDelete !== false && (
									<TouchableOpacity
										onPress={() => {
											const deleteProblem = () => {
												setProblems(problems.filter((_, i) => i !== index));
												_setHcwProblems(hcwProblems => hcwProblems.filter((d: any) => d.name !== item.name));
											};
											Alert.alert(
												'Delete problem',
												'Are you sure?',
												[
													{
														text: 'Cancel',
														onPress: () => {},
														style: 'cancel'
													},
													{
														text: 'Yes',
														onPress: () => deleteProblem()
													}
												],
												{ cancelable: false }
											);
										}}
									>
										<Icon 
											size={30} 
											color={theme.colors.textDisabled} 
											name="delete" 
										/>
									</TouchableOpacity>
								)}
							</View>
						);

						return (
							<Box 
								key={key} 
								borderColor="divider"
								borderRadius="m"
								marginVertical="m"
								borderWidth={1}
								padding="m"
							>
								{itemWrapper ? itemWrapper(card, { item, index }) : card}
							</Box>
						);
					})}

					{!!divider && <Br spacing="l" />}
				</Box>
			</Content>
		</Container>
    );
}
