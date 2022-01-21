import React from 'react';
import { ScrollView, View } from 'react-native';
import Content from '@/components/Content';
import Text from '@/components/Text';
import colorStyles from '@/styles/colorStyles';
import { useDiagnosisContext } from '../Context';
import Header from '../../Header';
import DiagnosesList from '../components/DiagnosesList';

export default function AgreeDisagree() {
  const { props, goBack, hcwDiagnoses, diagnosesEntry, } = useDiagnosisContext();
  const [refresh, setRefresh] = React.useState(false);

  React.useEffect(() => {
    if (refresh) {
      setTimeout(() => setRefresh(false), 0);
    }
  }, [refresh]);

  return (
    <>
      <Header 
        {...props} 
        goBack={() => goBack()}
        title={`${props.screen.data.title2 || ''}`}
        // instructions={`${props.screen.data.instructions2 || ''}`}
      />

      <ScrollView>
        <Content>
          {refresh ? null : (
            <>
              <DiagnosesList
                divider={false}
                sortable={false}
                canAgreeDisagree={false}
                canDelete
                title="HCW Diagnoses"
                // subtitle="Please order the diagnoses by priority"
                filter={d => hcwDiagnoses.map(d => d.name).includes(d.name)}
                setRefresh={setRefresh}
              />

              {!!props.screen.data.instructions2 && (
                <View style={{ marginBottom: 30, marginTop: 20 }}>
                  <Text style={[colorStyles.primaryColor, { fontSize: 25 }]}>Instructions</Text>
                  <Text variant="caption">{props.screen.data.instructions2}</Text>
                </View>
              )}

              <DiagnosesList
                divider
                sortable={false}
                title="Suggested Diagnoses"
                canDelete={false}
                // subtitle="Please order the diagnoses by priority"
                filter={d => !hcwDiagnoses.map(d => d.name).includes(d.name) && (d.how_agree !== 'No')}
                setRefresh={setRefresh}
              />

              <DiagnosesList
                divider
                sortable={false}
                canDelete={false}
                title="Diagnoses rejected"
                filter={d => !hcwDiagnoses.map(d => d.name).includes(d.name) && (d.how_agree === 'No')}
                setRefresh={setRefresh}
              />
            </>
          )}
        </Content>
      </ScrollView>
    </>
  );
}
