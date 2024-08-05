import React from 'react';
import { ActivityIndicator } from "react-native";
import { countries, SDK_VERSION } from '@/src/constants';

import { useTheme, Text  } from "./Theme";
import { Br } from './Br';
import { Button } from './Button';
import { Dropdown } from './Form';
import * as types from '../types';
import { useIsFocused } from '@react-navigation/native';
import * as api from '../data';

type LocationFormProps = { 
    onSetLocation: () => void; 
    buttonLabel?: string;
};

export function LocationForm({ onSetLocation, buttonLabel }: LocationFormProps) {
	const focused = useIsFocused();

	const theme = useTheme();

	const [country, setCountry] = React.useState<any>(countries[0]?.iso || '');

	const [hospitals, setHospitals] = React.useState<types.Hospital[]>([]);
	const [hospital, setHospital] = React.useState<string>('');
	const [loadingHospitals, setLoadingHospitals] = React.useState(false);
  	const [loadHospitalsError, setLoadHospitalsError] = React.useState(null);

	const [errors, setErrors] = React.useState<({ field?: string; message: string })[]>([]);
	const [saveError, setSaveError] = React.useState(null);

	const [submitting, setSubmitting] = React.useState(false);

	const submit = React.useCallback(async () => {
		try {
			if (!submitting) {
				setErrors([]);
				if (country) {
					setSubmitting(true);
					const location = { id: 1, hospital, country, };
					await api.dbTransaction(
						`insert or replace into location (${Object.keys(location).join(',')}) values (${Object.keys(location).map(() => '?').join(',')});`,
						Object.values(location),
					);
					onSetLocation();
					setSubmitting(false);
				} else {
					// if (!hospital) setErrors(prev => [...prev, { field: 'hospital', message: 'Hospital is required.' }]);
					if (!country) setErrors(prev => [...prev, { field: 'country', message: 'Country is required.' }]);
				}
			}
		} catch(e: any) {
			setSaveError(e.message);
		}
	}, [country, hospital, submitting]);

	const getHospitals = React.useCallback((country: string) => {
		(async () => {
			if (country) {
				setLoadingHospitals(true);
				setLoadHospitalsError(null);
				try {
					const hospitals = await api.getHospitals(undefined, { country });
					setHospitals(hospitals);
				} catch (e: any) { setLoadHospitalsError(e.message); }
				setLoadingHospitals(false);
			}
		})();
	}, [country]);

	React.useEffect(() => {
		(async () => {
			try {
				setSubmitting(false);
				setLoadingHospitals(true);
				if (focused) {
					const loc = await api.getLocation()
					setCountry((prev: any) => loc?.country || prev);
					setHospital((prev: any) => loc?.hospital || prev)
					await getHospitals(loc?.country || countries[0]?.iso);
				}
			} catch(e) {
				//
			} finally {
				setLoadingHospitals(false);
			}
		})();
	}, [focused]);

	return (
		<>
			<Dropdown
				value={country}
				onChange={country => {
					setCountry(country);
					setHospital('');
					setHospitals([]);
                    if (country) getHospitals(country as string);
				}}
				label="Country"
				title="Select country"
				options={countries.map(c => ({
					label: c.name,
					value: c.iso,
				}))}
			/>

			<Br spacing='l' />

			<Dropdown
				disabled={!country || loadingHospitals}
				value={hospital}
				onChange={hospital => setHospital(hospital as string)}
				label="Hospital"
				placeholder={loadingHospitals ? 'Loading hospitals...' : ''}
				title="Select hospital"
				options={hospitals.map(c => ({
					label: c.name,
					value: c.hospital_id,
				}))}
			/>

			{!!loadHospitalsError && (
				<Text textAlign="center" color="error" variant="caption">Failed to load hospitals: {loadHospitalsError}</Text>
			)}

			{!!saveError && (
				<Text textAlign="center" color="error" variant="caption">Failed to save: {saveError}</Text>
			)}

			<Br spacing='l' />

			<Button
				onPress={submit}
				disabled={submitting}
				textStyle={{ textTransform: 'uppercase', }}
				style={{ alignItems: 'center' }}
			>
				{!submitting ? (buttonLabel || 'Save') : (
					<ActivityIndicator 
						color={theme.colors.primary}
						size={theme.textVariants.title1.fontSize}
					/>
				)}
			</Button>
		</>
	);
}
