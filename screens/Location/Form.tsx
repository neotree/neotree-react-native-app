import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Text, Loader, Button, Br } from '@/components/ui';
import { Picker } from '@react-native-picker/picker';
import ucFirst from '@/utils/ucFirst';
import * as api from '@/api';
import { ENV } from '@/constants';
import * as copy from '@/constants/copy/locationScreen';

const { countries } = ENV;

function LocationForm({ onSetLocation, location }) {
  const [hospitals, setHospitals] = React.useState({});
  const [country, setCountry] = React.useState('');
  const [hospital, setHospital] = React.useState<number | string>('');
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

  React.useEffect(() => {
    if (location) {
      setCountry(location.country || '');
      setHospital(location.hospital ? Number(location.hospital) : '');
      getHospitals(location.country);
    }
  }, [location]);

  return (
    <>
        <View
            style={{ flexDirection: 'row' }}
        >
            <View
                style={{ flex: 1 }}
            >
                <Picker
                    mode="dropdown"
                    selectedValue={country}
                    onValueChange={country => {
                        setCountry(country);
                        setHospital('');
                        getHospitals(country);
                    }}
                >
                    <Picker.Item value="" label={copy.SELECT_COUNTRY} />
                    {countries.map(c => (
                        <Picker.Item 
                            key={c.country_code} 
                            label={ucFirst(c.country_name)} 
                            value={c.country_code} 
                        />
                    ))}
                </Picker>
            </View>

            <View
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
            >
                <View style={{ flex: 1 }}>
                    <Picker
                        enabled={_hospitals.length > 0}
                        mode="dropdown"
                        selectedValue={hospital}
                        onValueChange={value => setHospital(value)}
                    >
                        <Picker.Item value="" label={copy.SELECT_HOSPITAL} />
                        {_hospitals.map(h => (
                        <Picker.Item key={h.hospital_id} label={ucFirst(h.name)} value={h.hospital_id} />
                        ))}
                    </Picker>
                </View>

                {!_hospitals.length && loadingHospitals && (
                    <View>
                        <Loader color="primary" />
                    </View>
                )}
            </View>
        </View>

        {!!loadHospitalsError && (
          <>
            <Br />
            <Text color="error" style={{ textAlign: 'center' }}>{`${copy.LOAD_HOSPITALS_ERR}: ${loadHospitalsError}`}</Text>
          </>
        )}

        {!!saveError && (
          <>
            <Br />
            <Text color="error" style={{ textAlign: 'center' }}>{`${copy.SAVE_ERROR}: ${saveError}`}</Text>
          </>
        )}

        <Br /><Br /><Br />

        <View
            style={{ alignItems: 'flex-end' }}
        >
            <Button
                disabled={loadingHospitals || saving || !(country && hospital)}
                onPress={() => saveLocation()}
                variant="contained"
                color="primary"
            >
                <Text>Save</Text>
                {saving && <Loader color="primary" />}
            </Button>
        </View>
    </>
  );
}

LocationForm.propTypes = {
  onSetLocation: PropTypes.func,
  location: PropTypes.object,
};

export default LocationForm;
