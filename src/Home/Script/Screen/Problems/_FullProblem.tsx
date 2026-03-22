import React from 'react';
import { ScrollView } from 'react-native';
import { Box, Text, Card, Image, Br, Content } from '../../../../components';
import * as types from '../../../../types';

type FullProblemProps = types.ProblemSectionProps & {
    
};

function ManagementCard({ text, image, }: { text?: any; image?: any; }) {
    if (!(text || image)) return null;

    return (
        <>
            <Card>
                {!!text && <Text variant="title3">{text}</Text>}
                {!!image && (
                <Image
                    fullWidth
                    resizeMode="contain"
                    source={{ uri: image.data }}
                />
                )}
            </Card>
            {!!(text || image) && <Br spacing="m" />}
        </>
    );
}

export function FullProblem({ acceptedProblems, activeProblemIndex }: FullProblemProps) {
    const problem = acceptedProblems[activeProblemIndex as number];

    if (!problem) return null;

    const data = [
        { text: problem.text1, image: problem.image1 },
        { text: problem.text2, image: problem.image2 },
        { text: problem.text3, image: problem.image3 },
    ];

    const noData = data.reduce((acc, item) => {
        if (item.text || item.image) acc = false;
        return acc;
    }, true);

    return (
		<ScrollView>
			<Content>
				<Box>
					{!!problem.expressionMeaning && <Text style={{ marginBottom: 20 }}>{problem.expressionMeaning}</Text>}
					{data.map((item, i) => {
						const key = `${i}`;
						return <ManagementCard key={key} {...item} />;
					})}
					{!noData ? null : (
						<Box marginVertical="xl">
							<Text color="textDisabled" variant="title3" textAlign="center">Problem does not have management details</Text>
						</Box>
					)}
				</Box>
			</Content>
		</ScrollView>
    );
}
