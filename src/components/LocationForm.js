import React from 'react';
import PropTypes from 'prop-types';
import Constants from 'expo-constants';
import { H1, Form, Spinner, Button, Text } from 'native-base';
import { ActivityIndicator, View, Picker } from 'react-native';
import ucFirst from '@/utils/ucFirst';
import * as api from '@/api';
import config from '@/constants/config';

const { countries } = config;

function LocationForm({ onSetLocation }) {
  const [hospitals, setHospitals] = React.useState({});
  const [country, setCountry] = React.useState('');
  const [hospital, setHospital] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [loadingHospitals, setLoadingHospitals] = React.useState(false);
  const [loadHospitalsError, setLoadHospitalsError] = React.useState(null);
  const [saveError, setSaveError] = React.useState(null);

  const _hospitals = country ? (hospitals[country] || []) : [];

  const saveLocation = React.useCallback(() => {
    (async () => {
      setSaving(true);
      try {
        const location = await api.saveLocation({ country, hospital });
        if (onSetLocation) onSetLocation(location);
      } catch (e) { setSaveError(e.message); }
      setSaving(false);
    })();
  }, [country, hospital]);

  const getHospitals = React.useCallback(country => {
    (async () => {
      if (country) {
        setLoadingHospitals(true);
        setLoadHospitalsError(null);
        try {
          const { hospitals } = await api.getHospitals({ country });
          setHospitals(prev => ({ ...prev, [country]: hospitals }));
        } catch (e) { setLoadHospitalsError(e.message); }
        setLoadingHospitals(false);
      }
    })();
  }, []);

  return (
    <>
      <H1 style={{ textAlign: 'center' }}>Set location</H1>

      <View style={{ marginVertical: 25 }} />

      <Form>
        <Picker
          note
          mode="dropdown"
          selectedValue={country}
          onValueChange={country => {
            setCountry(country);
            setHospital('');
            getHospitals(country);
          }}
        >
          <Picker.Item value="" label="Select country" />
          {countries.map(c => (
            <Picker.Item key={c} label={ucFirst(c)} value={c} />
          ))}
        </Picker>

        <View>
          <Picker
            note
            enabled={_hospitals.length > 0}
            mode="dropdown"
            selectedValue={hospital}
            onValueChange={value => setHospital(value)}
          >
            <Picker.Item value="" label="Select hospital" />
            {_hospitals.map(h => (
              <Picker.Item key={h.id} label={ucFirst(h.name)} value={h.id} />
            ))}
          </Picker>

          {!_hospitals.length && loadingHospitals && (
            <View style={{ marginLef: 10, position: 'absolute', right: 35, top: -15 }}>
              <Spinner size={20} color="#999" />
            </View>
          )}
        </View>

        {!!loadHospitalsError && (
          <Text style={{ fontSize: 10, color: '#b20008', textAlign: 'center' }}>Failed to load hospitals: {loadHospitalsError}</Text>
        )}

        {!!saveError && (
          <Text style={{ fontSize: 10, color: '#b20008', textAlign: 'center' }}>Failed to save: {saveError}</Text>
        )}

        <View style={{ marginVertical: 10 }} />

        <Button
          block
          disabled={loadingHospitals || saving || !(country && hospital)}
          onPress={() => saveLocation()}
        >
          <Text>Save</Text>
          {saving && <ActivityIndicator size="small" color="blue" />}
        </Button>
      </Form>
    </>
  );
}

LocationForm.propTypes = {
  onSetLocation: PropTypes.func
};

export default LocationForm;
