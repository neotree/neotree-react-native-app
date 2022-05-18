import React from 'react';
import PropTypes from 'prop-types';
import SortableList from '@/components/SortableList';
import { Button } from 'native-base';
import { Alert, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colorStyles from '@/styles/colorStyles';
import Text from '@/components/Text';
import Diagnosis from './Diagnosis';
import { useDiagnosisContext } from '../Context';

function DiagnosesList({ 
  filter, 
  title, 
  subtitle, 
  sortable, 
  divider, 
  canAgreeDisagree, 
  canDelete, 
  setRefresh, 
  instructions, 
  emptyListMessage,
  itemWrapper, 
}) {
  const { diagnoses, setDiagnoses, _setHcwDiagnoses, } = useDiagnosisContext();

  const displayedDiagnoses = diagnoses.filter((d, i) => filter ? filter(d, i) : true);

  if (!displayedDiagnoses.length) {
    if (emptyListMessage) {
      return (
        <View style={{ marginBottom: 30, marginTop: 20 }}>
          <Text style={{ textAlign: 'center', color: '#999' }} variant="caption">{emptyListMessage}</Text>
        </View>
      );
    }
    return null;
  }

  return (
    <>
    {!!instructions && (
      <View style={{ marginBottom: 30, marginTop: 20 }}>
        <Text style={[colorStyles.primaryColor]}>Instructions</Text>
        <Text variant="caption">{instructions}</Text>
      </View>
    )}

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

      {diagnoses.map((item, index) => {
        if (filter && !filter(item, index)) return null;

        // const sortable = true;
        //
        // const moveDiagnoses = (from, to) => setDiagnoses(arrayMove([...diagnoses], from, to).map((d, i) => ({
        //   ...d,
        //   priority: i + 1,
        // })));

        const card = (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View>
              <Text>{item.customValue || item.name}</Text>
              {!!item.expressionMeaning && <Text variant="caption" style={{ color: '#999' }}>{item.expressionMeaning}</Text>}
            </View>

            <View style={{ marginLeft: 'auto' }} />

            {canAgreeDisagree !== false && (
              <Diagnosis
                setDiagnosis={s => {
                  setDiagnoses(diagnoses.map((d, i) => {
                    if (i !== index) return d;
                    return { ...d, ...s };
                  }));
                  setRefresh(true);
                }}
                diagnosis={item}
              />
            )}

            <View style={{ marginHorizontal: 5 }} />

            {canDelete !== false && (
              <Button
                transparent
                onPress={() => {
                  const deleteDiagnosis = () => {
                    setDiagnoses(diagnoses.filter((d, i) => i !== index));
                    _setHcwDiagnoses(hcwDiagnoses => hcwDiagnoses.filter((d, i) => d.diagnosis.name !== item.name));
                    if (setRefresh) setRefresh(true);
                  };
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
                <MaterialIcons 
                  size={30} // {24} 
                  color="#999" 
                  name="delete" 
                />
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
        );

        return (
          <View style={{ marginVertical: 10, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, }}>
            {itemWrapper ? itemWrapper(card, { item, index }) : card}
          </View>
        );
      })}
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
  setRefresh: PropTypes.func,
  instructions: PropTypes.string,
  emptyListMessage: PropTypes.string,
  itemWrapper: PropTypes.func
};

export default DiagnosesList;
