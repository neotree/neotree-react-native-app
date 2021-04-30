import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button, Input, H3 } from 'native-base';
import { TouchableOpacity, View, FlatList, Alert } from 'react-native';
import arrayMove from 'array-move';
import Header from '@/components/Header';
import Content from '@/components/Content';
import Text from '@/components/Text';
import colorStyles from '@/styles/colorStyles';
import bgColorStyles from '@/styles/bgColorStyles';
import { MaterialIcons } from '@expo/vector-icons';
import useBackButton from '@/utils/useBackButton';
import Diagnosis from './Diagnosis';
import FloatingButton from './FloatingButton';

const defaultForm = {
  name: '',
  suggested: false,
  priority: null,
  how_agree: null,
  hcw_follow_instructions: null,
  hcw_reason_given: null,
};

const Diagnoses = props => {
  const { summary, clearSummary } = props;

  const [diagnoses, setDiagnoses] = React.useState([]);
  const [showDiagnosisInput, setShowDiagnosisInput] = React.useState(false);
  const [form, setForm] = React.useState(defaultForm);

  React.useEffect(() => {
    setDiagnoses(summary.data.diagnoses.map((d, i) => ({
      ...defaultForm,
      ...d,
      suggested: true,
      priority: i + 1,
    })));
  }, []);

  const goBack = () => {
    Alert.alert(
      'Discard changes',
      'You will lose diagoses changes made. Are you sure?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Ok',
          onPress: () => clearSummary()
        }
      ],
      { cancelable: false }
    );
  };

  useBackButton(() => { goBack(); });

  const renderDiagnoses = (diagnoses, opts = {}) => (
    <FlatList
      data={diagnoses}
      renderItem={({ item, index }) => {
        const renderCard = d => {
          const moveDiagnoses = (from, to) => setDiagnoses(diagnoses => arrayMove(diagnoses, from, to).map((d, i) => ({
            ...d,
            priority: i + 1,
          })));

          const card = (
            <View style={{ marginVertical: 15, flexDirection: 'row' }}>
              <Text style={[{ flex: 1 }, opts.color ? { color: opts.color } : {}]}>{item.name}</Text>
              {opts.sortable !== false && (
                <>
                  {index !== 0 && (
                    <Button
                      transparent
                      onPress={() => moveDiagnoses(index, index - 1)}
                    >
                      <MaterialIcons size={24} color="black" name="arrow-upward" />
                    </Button>
                  )}

                  {index < (diagnoses.length - 1) && (
                    <Button
                      transparent
                      onPress={() => moveDiagnoses(index, index + 1)}
                    >
                      <MaterialIcons size={24} color="black" name="arrow-downward" />
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
      }}
      keyExtractor={(item, i) => `${item.id || item.name}${i}`}
    />
  );

  const rejectedDiagnoses = diagnoses.filter(d => d.how_agree === 'No');

  return (
    <>
      <Header
        title="Suggested diagnoses"
        leftActions={(
          <>
            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => goBack()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
      />

      <Content
        style={{
          alignItems: 'center',
          flexDirection: 'row',
        }}
        containerProps={bgColorStyles.primaryBg}
      >
        <View style={{ flex: 1 }}>
          <Text variant="caption" style={[colorStyles.primaryColorContrastText, { textTransform: 'uppercase' }]}>
            Please consider the following diagnoses
          </Text>
        </View>
      </Content>

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

        <View style={{ marginVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
          {showDiagnosisInput ? (
            <>
              <View style={{ flex: 1 }}>
                <Input
                  autoFocus
                  value={form.name || ''}
                  placeholder="Enter additional diagnosis"
                  onChangeText={name => setForm({ name })}
                />
              </View>
              <Button
                block={false}
                transparent
                onPress={() => {
                  if (form.name) setDiagnoses(d => [...d, { ...form, priority: diagnoses.length }]);
                  setForm(defaultForm);
                  setShowDiagnosisInput(false);
                }}
              >
                <MaterialIcons
                  name="check"
                  size={24}
                  color="black"
                  style={[colorStyles.primaryColor]}
                />
              </Button>
            </>
          ) : (
            <Button
              block={false}
              onPress={() => {
                setShowDiagnosisInput(true);
              }}
            >
              <Text>Add diagnosis</Text>
            </Button>
          )}
        </View>

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

      {showDiagnosisInput ? null : <FloatingButton {...props} diagnoses={diagnoses} />}
    </>
  );
};

Diagnoses.propTypes = {
  summary: PropTypes.object.isRequired,
  clearSummary: PropTypes.func.isRequired
};

export default Diagnoses;
