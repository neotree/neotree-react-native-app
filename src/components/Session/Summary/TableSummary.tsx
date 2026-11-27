import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Box, Text } from '../../Theme';
import { getEntryTable, layoutTableForDisplay } from '../../../utils/screen-table';

type TableSummaryProps = {
    table: NonNullable<ReturnType<typeof getEntryTable>>;
    title?: string;
    isVisible?: (value: any) => boolean;
};

const COLUMN_WIDTH = 140;

/** A stored table shown read-only in a session summary: headings, row names and cell values. */
export function TableSummary({ table, title, isVisible }: TableSummaryProps) {
    const layout = layoutTableForDisplay({ ...table, isVisible });
    if (!layout.rows.length) return null;

    return (
        <Box mb="m">
            {!!title && <Text color="textSecondary" mb="s">{title}</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator>
                <View style={styles.table}>
                    <View style={[styles.row, styles.headingRow]}>
                        {layout.headings.map((heading, i) => (
                            <View key={`h${i}`} style={styles.cell}>
                                <Text style={{ fontWeight: 'bold' }}>{heading}</Text>
                            </View>
                        ))}
                    </View>
                    {layout.rows.map((row, r) => (
                        <View key={`r${r}`} style={styles.row}>
                            {row.map((text, c) => (
                                <View key={`c${c}`} style={styles.cell}>
                                    <Text color={text ? undefined : 'textDisabled'}>{text || '—'}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Box>
    );
}

const styles = StyleSheet.create({
    table: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ccc',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    headingRow: {
        backgroundColor: '#f2f2f2',
    },
    cell: {
        width: COLUMN_WIDTH,
        paddingVertical: 8,
        paddingHorizontal: 6,
    },
});
