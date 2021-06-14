import React from 'react';
import moment from 'moment';
import { useHistory, useLocation } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import { ListItem, Right, Left, Radio, Button, } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { View, TouchableOpacity, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import OverlayLoader from '@/components/OverlayLoader';
import Text from '@/components/Text';
import Content from '@/components/Content';
import Divider from '@/components/Divider';
import queryString from 'query-string';
import { useSessionsContext } from '../SessionsContext';
import { useAppContext } from '@/AppContext';
import exportData from './export';

const opts = [
  { label: 'Excel Spreadsheet', value: 'excel' },
  { label: 'JSON', value: 'json' },
  { label: 'JSONAPI', value: 'jsonapi' },
];

const ExportPage = () => {
  const history = useHistory();
  const location = useLocation();
  const { state: { application } } = useAppContext();
  const { dbSessions, getSessions, loadingSessions, scriptsFields } = useSessionsContext();
  const [format, setFormat] = React.useState('excel');
  const [exporting, setExporting] = React.useState(false);
  const [pageInitialised, setPageInitialised] = React.useState(false);

  const { exportType, minDate, maxDate } = queryString.parse(location.search);

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
          Alert.alert(
            'Permission denied',
            'Permission to write files to disk is not granted, you will not be able to export files.',
            [
              {
                text: 'Ok',
                type: 'cancel',
              }
            ]
          );
        }
      } catch (e) {
        Alert.alert(
          'Error',
          e.message,
          [
            {
              text: 'Ok',
              type: 'cancel',
            }
          ]
        );
      }
      setPageInitialised(true);
    })();
  }, []);

  const goBack = () => {
    history.entries = [];
    history.push('/sessions');
  };

  useBackButton(() => { goBack(); }, []);

  const _export = async () => {
    let sessions = dbSessions;
    const getParsedDate = d => {
      d = moment(d).format('YYYY-MM-DD');
      return new Date(d).getTime();
    };
    switch (exportType) {
      case 'completed':
        sessions = dbSessions.filter(s => s.data.completed_at);
        break;
      case 'incomplete':
        sessions = dbSessions.filter(s => !s.data.completed_at);
        break;
      case 'date_range':
        if (minDate || maxDate) {
          sessions = dbSessions
            .filter(s => !minDate ? true : getParsedDate(s.data.started_at) >= getParsedDate(minDate))
            .filter(s => !maxDate ? true : getParsedDate(s.data.started_at) <= getParsedDate(maxDate));
        }
        break;
      default:
      // do nothing
    }
    setExporting(true);
    try {
      await exportData({ format, sessions, scriptsFields, application, });
      if (format === 'jsonapi') await getSessions();
      Alert.alert(
        '',
        'Export success',
        [
          {
            text: 'Ok',
            type: 'cancel',
          }
        ]
      );
      setExporting(false);
    } catch (e) {
      setExporting(false);
      Alert.alert(
        'Failed to export data',
        e.message || e.msg || JSON.stringify(e),
        [
          {
            text: 'Try again',
            type: 'cancel',
            onPress: () => _export()
          },
          {
            text: 'Cancel',
            type: 'cancel',
          }
        ]
      );
    }
  };

  if (!pageInitialised) return <OverlayLoader display transparent />;

  return (
    <>
      <Header
        title="Export"
        leftActions={(
          <>
            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={() => goBack()}
            >
              <MaterialIcons size={24} color="black" style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
      />

      <Content containerProps={{ style: { flex: 1 } }}>
        <View 
          style={{ 
            padding: 20,
          }}
        >
          {opts.map(opt => (
            <ListItem
              key={opt.value}
              selected={format === opt.value}
              onPress={() => setFormat(opt.value)}
            >
              <Left>
                <Text>{opt.label}</Text>
              </Left>
              <Right>
                <Radio
                  selected={format === opt.value}
                  onPress={() => setFormat(opt.value)}
                />
              </Right>
            </ListItem>
          ))}

          <Divider border={false} spacing={2} />

          <View style={{ alignItems: 'flex-end' }}>
            <Button
              disabled={!format}
              onPress={() => _export()}
            >
              <Text>Export</Text>
            </Button>
          </View>
        </View>
      </Content>

      <OverlayLoader display={exporting || loadingSessions} />
    </>
  );
};

export default ExportPage;
