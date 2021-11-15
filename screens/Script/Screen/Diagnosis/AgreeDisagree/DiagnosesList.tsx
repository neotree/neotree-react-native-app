import React from 'react';
import SortableList from '@/components/SortableList';
import { Alert, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import arrayMove from 'array-move';
import { Text, View } from '@/components/ui';
import { EntryValueDiagnosis } from '@/screens/Script/types';
import { Diagnosis } from './Diagnosis';

type Props = {
    filter?: (item: EntryValueDiagnosis, index: number) => boolean;
    canDelete?: boolean;
    canAgreeDisagree?: boolean;
    title?: string;
    subtitle?: string;
    sortable?: boolean;
    divider?: boolean;
    diagnoses: EntryValueDiagnosis[],
};

export function DiagnosesList({ 
    filter, 
    title, 
    subtitle, 
    sortable, 
    divider, 
    canAgreeDisagree, 
    canDelete, 
    diagnoses 
}: Props) {
  if (!diagnoses.length) return null;

  return (
    <>
      <View
        style={{
          padding: 10,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: '#999',
        }}
      >
        <Text
          style={{
            color: '#999',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontSize: 15,
          }}
        >{title}</Text>

        {!!subtitle && <Text variant="caption" style={{ color: '#999' }}>{subtitle}</Text>}
      </View>

      <SortableList
onReleaseRow={(rowIndex, sortedIndexes) => {
//   setDiagnoses(sortedIndexes.map(i => diagnoses[i]));
}}
sortingEnabled={(diagnoses.length > 1) && (sortable !== false)}
data={diagnoses}
renderItem={({ index, data: item }) => {
if (filter && !filter(item, index)) return null;

return (
<View>
    <View style={{ marginVertical: 15, flexDirection: 'row', alignItems: 'center' }}>
    <View>
        <Text>{item.name}</Text>
        {!!item.expressionMeaning && <Text variant="caption" style={{ color: '#999' }}>{item.expressionMeaning}</Text>}
    </View>

    <View style={{ marginLeft: 'auto' }} />

    {canAgreeDisagree !== false && (
        <Diagnosis
        // setDiagnosis={s => {
        //     // setDiagnoses(diagnoses.map((d, i) => {
        //     //     if (i !== index) return d;
        //     //     return { ...d, ...s };
        //     // }));
        // }}
        diagnosis={item}
        />
    )}

    <View style={{ marginHorizontal: 5 }} />

    {canDelete !== false && (
        <TouchableOpacity
        onPress={() => {
        //   const deleteDiagnosis = () => setDiagnoses(diagnoses.filter((d, i) => i !== index));
        //   Alert.alert(
        //     'Delete diagnosis',
        //     'Are you sure?',
        //     [
        //       {
        //         text: 'Cancel',
        //         onPress: () => {},
        //         style: 'cancel'
        //       },
        //       {
        //         text: 'Yes',
        //         onPress: () => deleteDiagnosis()
        //       }
        //     ],
        //     { cancelable: false }
        //   );
        }}
        >
        <MaterialIcons size={24} color="#999" name="delete" />
        </TouchableOpacity>
    )}
    </View>
</View>
);
}}
// keyExtractor={(item, i) => `${item.id || item.name}${i}`}
      />
      {!!divider && <View style={{ marginVertical: 25 }} />}
    </>
  );
}
