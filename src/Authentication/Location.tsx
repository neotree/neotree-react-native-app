import React from 'react';
import { ActivityIndicator } from "react-native";
import { Picker, Br, Button, useTheme  } from "../components";
import { Container } from './Container';
import Constants from 'expo-constants';
import { COUNTRY, AuthenticationRoutes, StackNavigationProps } from '../types';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NEOTREE_DATA_COUNTRY_KEY } from '../constants';

const countries = (Constants.manifest?.extra?.countries || []) as COUNTRY[];

export function Location({ navigation }: StackNavigationProps<AuthenticationRoutes, 'Location'>) {
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
				await AsyncStorage.setItem(NEOTREE_DATA_COUNTRY_KEY, country);
				navigation.navigate('Login');
			} else {
				// if (!hospital) setErrors(prev => [...prev, { field: 'hospital', message: 'Hospital is required.' }]);
				if (!country) setErrors(prev => [...prev, { field: 'country', message: 'Country is required.' }]);
			}
		}
	}, [country, hospital, submitting]);

	return (
		<Container>
			<Picker 
				enabled={!submitting}
				size="l"
				label="Country Address"
				selectedValue={country}
				onValueChange={country => setCountry(country)}
				errors={errors.filter(e => e.field === 'country').map(e => e.message)}
				options={countries.map(c => ({
					label: c.name,
					value: c.iso,
				}))}
			/>

			<Br spacing='l' />

			{/* <Picker 
				enabled={!submitting}
				size="l"
				label="Hospital"
				selectedValue={hospital}
				onValueChange={hospital => setHospital(hospital)}
				errors={errors.filter(e => e.field === 'hospital').map(e => e.message)}
				options={hospitals}
			/> */}

			<Br spacing='l' />

			<Button
				onPress={submit}
				size="l"
				disabled={submitting}
				textStyle={{ textTransform: 'uppercase', }}
				style={{ alignItems: 'center' }}
			>
				{!submitting ? 'Next' : (
					<ActivityIndicator 
						color={theme.colors.primary}
						size={theme.textVariants.title1.fontSize}
					/>
				)}
			</Button>
		</Container>
	);
}
