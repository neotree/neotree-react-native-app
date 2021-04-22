import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button, Input, H3 } from 'native-base';
import { TouchableOpacity, View, FlatList } from 'react-native';
import Header from '@/components/Header';
import Content from '@/components/Content';
import Text from '@/components/Text';
import colorStyles from '@/styles/colorStyles';
import bgColorStyles from '@/styles/bgColorStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { useContext as useScriptContext } from '../../../Context';
import Diagnosis from './Diagnosis';
import FloatingButton from './FloatingButton';

const defaultForm = { name: '', suggested: false, priority: 1, };

const Diagnoses = props => {
  const { summary } = props;
  const scriptContext = useScriptContext();

  const [diagnoses, setDiagnoses] = React.useState([]);
  const [showDiagnosisInput, setShowDiagnosisInput] = React.useState(false);
  const [form, setForm] = React.useState(defaultForm);

  React.useEffect(() => {
    setDiagnoses(summary.data.diagnoses.map(d => ({
      id: d.id,
      ...d.data,
      suggested: true,
    })));
  }, []);

  React.useEffect(() => { scriptContext.setState({ hideFloatingButton: false, }); }, []);

  return (
    <>
      <Header
        title="Suggested diagnoses"
        leftActions={(
          <>
            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => {}}
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
            <FlatList
              data={diagnoses}
              renderItem={({ item }) => {
                const renderCard = d => {
                  const card = (
                    <View style={{ marginVertical: 15 }}>
                      <H3>{item.name}</H3>
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
                  if (form.name) setDiagnoses(d => [...d, form]);
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
      </Content>

      <FloatingButton {...props} />
    </>
  );
};

Diagnoses.propTypes = {
  summary: PropTypes.object.isRequired,
  // clearSummary: PropTypes.func.isRequired
};

export default Diagnoses;
