import React from 'react';
import PropTypes from 'prop-types';
import SortableList from '@/components/SortableList';
import { Button } from 'native-base';
import { Alert, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import arrayMove from 'array-move';
import Text from '@/components/Text';
import Diagnosis from './Diagnosis';
import { useDiagnosisContext } from '../Context';

function DiagnosesList({ filter, title, subtitle, sortable, divider, canAgreeDisagree, canDelete }) {
  const { diagnoses, setDiagnoses } = useDiagnosisContext();

  const displayedDiagnoses = diagnoses.filter((d, i) => filter ? filter(d, i) : true);

  if (!displayedDiagnoses.length) return null;

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
          setDiagnoses(sortedIndexes.map(i => diagnoses[i]));
        }}
        sortingEnabled={(displayedDiagnoses.length > 1) && (sortable !== false)}
        data={diagnoses}
        renderItem={({ index, data: item }) => {
          if (filter && !filter(item, index)) return null;

          // const sortable = true;
          //
          // const moveDiagnoses = (from, to) => setDiagnoses(arrayMove([...diagnoses], from, to).map((d, i) => ({
          //   ...d,
          //   priority: i + 1,
          // })));

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
                    setDiagnosis={s => setDiagnoses(diagnoses.map((d, i) => {
                      if (i !== index) return d;
                      return { ...d, ...s };
                    }))}
                    diagnosis={item}
                  />
                )}

                <View style={{ marginHorizontal: 5 }} />

                {canDelete !== false && (
                  <Button
                    transparent
                    onPress={() => {
                      const deleteDiagnosis = () => setDiagnoses(diagnoses.filter((d, i) => i !== index));
                      Alert.alert(
                        'Delete diagnosis',
                        'Are you sure?',
                        [
                          {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel'
                          },
                          {
                            text: 'Yes',
                            onPress: () => deleteDiagnosis()
                          }
                        ],
                        { cancelable: false }
                      );
                    }}
                  >
                    <MaterialIcons size={24} color="#999" name="delete" />
                  </Button>
                )}

                {/*{sortable && (*/}
                {/*  <>*/}
                {/*    {index !== 0 && (*/}
                {/*      <Button*/}
                {/*        transparent*/}
                {/*        onPress={() => moveDiagnoses(index, index - 1)}*/}
                {/*      >*/}
                {/*        <MaterialIcons size={24} color="#999" name="arrow-upward" />*/}
                {/*      </Button>*/}
                {/*    )}*/}

                {/*    {index < (diagnoses.length - 1) && (*/}
                {/*      <Button*/}
                {/*        transparent*/}
                {/*        onPress={() => moveDiagnoses(index, index + 1)}*/}
                {/*      >*/}
                {/*        <MaterialIcons size={24} color="#999" name="arrow-downward" />*/}
                {/*      </Button>*/}
                {/*    )}*/}
                {/*  </>*/}
                {/*)}*/}
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

DiagnosesList.propTypes = {
  filter: PropTypes.func,
  canDelete: PropTypes.bool,
  canAgreeDisagree: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  sortable: PropTypes.bool,
  divider: PropTypes.bool,
  diagnoses: PropTypes.array,
};

export default DiagnosesList;
