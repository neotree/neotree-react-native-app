import React from 'react';
import { ActivityIndicator } from "react-native";
import Constants from 'expo-constants';
import { useTheme  } from "./Theme";
import { Br } from './Br';
import { Button } from './Button';
import { Dropdown } from './Form';
import { COUNTRY } from '../types';
import { useIsFocused } from '@react-navigation/native';
import { api } from '../data';

const countries = (Constants.manifest?.extra?.countries || []) as COUNTRY[];

type LocationFormProps = { 
    onSetLocation: () => void; 
    buttonLabel?: string;
};

export function LocationForm({ onSetLocation, buttonLabel }: LocationFormProps) {
	const focused = useIsFocused();

	const theme = useTheme();

	const [country, setCountry] = React.useState<any>(countries[0]?.iso || '');

	const [hospitals, setHospitals] = React.useState([]);
	const [hospital, setHospital] = React.useState<any>('');

	const [errors, setErrors] = React.useState<({ field?: string; message: string })[]>([]);

	const [submitting, setSubmitting] = React.useState(false);

	const submit = React.useCallback(async () => {
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
	}, [country, hospital, submitting]);

	React.useEffect(() => {
		setSubmitting(false);
        if (focused) {
            api.getLocation()
                .then(loc => setCountry((prev: any) => loc?.country || prev))
                .catch(() => {});
        }
	}, [focused]);

	return (
		<>
			<Dropdown
				value={country}
				onChange={country => setCountry(country)}
				label="Country"
				title="Select country"
				options={countries.map(c => ({
					label: c.name,
					value: c.iso,
				}))}
			/>

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
