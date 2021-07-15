import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, H3 } from 'native-base';
import { View, Alert } from 'react-native';
import arrayMove from 'array-move';
import Content from '@/components/Content';
import Text from '@/components/Text';
import colorStyles from '@/styles/colorStyles';
import { MaterialIcons } from '@expo/vector-icons';
import SortableList from '@/components/SortableList';
import Diagnosis from './Diagnosis';
import AddDiagnosis from './AddDiagnosis';
import setPageOptions from '../../../../setPageOptions';

const Row = ({ data: item, setDiagnoses, options, index, diagnoses }) => {
  const renderCard = d => {
    const moveDiagnoses = (from, to) => setDiagnoses(diagnoses => arrayMove(diagnoses, from, to).map((d, i) => ({
      ...d,
      priority: i + 1,
    })));

    const card = (
      <View style={{ marginVertical: 15, flexDirection: 'row' }}>
        <Text style={[{ flex: 1 }, options.color ? { color: options.color } : {}]}>{item.name}</Text>
        <Button
          transparent
          onPress={() => {
            const deleteDiagnosis = () => setDiagnoses(diagnoses => diagnoses.filter((d, i) => i !== index));
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

        {options.sortable !== false && (
          <>
            {index !== 0 && (
              <Button
                transparent
                onPress={() => moveDiagnoses(index, index - 1)}
              >
                <MaterialIcons size={24} color="#999" name="arrow-upward" />
              </Button>
            )}

            {index < (diagnoses.length - 1) && (
              <Button
                transparent
                onPress={() => moveDiagnoses(index, index + 1)}
              >
                <MaterialIcons size={24} color="#999" name="arrow-downward" />
              </Button>
            )}
          </>
        )}
      </View>
    );

    if (!d.suggested) return card;

    return (
      <Diagnosis
        setDiagnosis={s => setDiagnoses(diagnoses => diagnoses.map(d => {
          if (d.id !== item.id) return d;
          return { ...d, ...s };
        }))}
        diagnosis={d}
      >{card}</Diagnosis>
    );
  };

  return renderCard(item);
};

const SelectDiagnoses = props => {
  const { diagnoses, setDiagnoses, defaultDiagnosis, setSection } = props;

  const [showDiagnosisInput, setShowDiagnosisInput] = React.useState(false);
  const [form, setForm] = React.useState(defaultDiagnosis);

  setPageOptions({
    onNext: next => diagnoses.length ? setSection('manage_selected') : next(),
  }, [diagnoses]);

  const renderDiagnoses = (diagnoses, opts = {}) => {
    return (
      <SortableList
        onReleaseRow={(rowIndex, sortedIndexes) => {
          setDiagnoses(diagnoses => sortedIndexes.map(i => diagnoses[i]));
        }}
        data={diagnoses}
        renderItem={rowProps => {
          return (
            <Row
              {...rowProps}
              diagnoses={diagnoses}
              setDiagnoses={setDiagnoses}
              options={opts}
            />
          );
        }}
        // keyExtractor={(item, i) => `${item.id || item.name}${i}`}
      />
    );
  }

  const rejectedDiagnoses = diagnoses.filter(d => d.how_agree === 'No');

  return (
    <>
      <Content>
        {!diagnoses.length ? (
          <>
            <View style={{ margin: 50 }}>
              <Text style={{ textAlign: 'center', color: '#999' }}>No diagnoses</Text>
            </View>
          </>
        ) : (
          <>
            {renderDiagnoses(diagnoses.filter(d => d.how_agree !== 'No'))}
          </>
        )}

        <AddDiagnosis {...props} />

        {!!rejectedDiagnoses.length && (
          <>
            <H3
              style={{
                marginTop: 25,
                marginBottom: 10,
                paddingVertical: 10,
                borderTopColor: '#ccc',
                borderTopWidth: 1,
                borderBottomColor: '#ccc',
                borderBottomWidth: 1,
                textTransform: 'uppercase',
                color: '#ccc',
              }}
            >Rejected diagnoses</H3>

            {renderDiagnoses(diagnoses.filter(d => d.how_agree === 'No'), { color: '#999', sortable: false, })}
          </>
        )}
      </Content>
    </>
  );
};

SelectDiagnoses.propTypes = {
  diagnoses: PropTypes.array.isRequired,
  setDiagnoses: PropTypes.func.isRequired,
  defaultDiagnosis: PropTypes.object.isRequired,
  setSection: PropTypes.func.isRequired,
};

export default SelectDiagnoses;
