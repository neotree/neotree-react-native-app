import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SelectModal } from '@/components/ui/select-modal';
import { Typography } from '@/components/ui/typography';
import { COUNTRIES } from '@/constants';
import { useAppContext } from '@/contexts/app';
import Api from '@/lib/Api';

type LocationFormProps = {
	redirectTo?: Parameters<typeof router.replace>[0];
	buttonText: string;
	onSaveSuccess?: (location: {
		hospital: string;
		country: string;
	}) => Promise<void>;
};

export function LocationForm(props: LocationFormProps) {
	const { initialised } = useAppContext();
	if (!initialised) return null;
	return <LocationFormComponent {...props} />;
}

function LocationFormComponent({
	redirectTo,
	buttonText,
	onSaveSuccess,
}: LocationFormProps) {
	const { hospital, country, setHospital, setCountry, } = useAppContext();

    const {
        control,
        formState,
        handleSubmit,
    } = useForm({
        defaultValues: {
            country: country || '',
            hospital: hospital || '',
        },
    });

    const submit = handleSubmit(
        async data => {
			await onSaveSuccess?.(data);
            if (redirectTo) {
				router.push(redirectTo);
			}
        },
    );

    return (
		<View className="gap-y-4">
			<Controller
				control={control}
				name="country"
				rules={{
					required: {
						value: true,
						message: 'Country is required',
					},
				}}
				render={({ field: { value, onChange, ref, }, formState, }) => {
					return (
						<View>
							<Label>Country</Label>
							<SelectModal
								placeholder="Select country"
								value={value}
								options={COUNTRIES}
								onChange={value => {
									onChange(value);
									if (value) {
										if (!country) setCountry(`${value}`);
										Api.webeditor.hospitals();
									}
								}}
							/>
							{!!formState.errors.country && (
								<Typography className="text-xs text-destructive">
									{formState.errors.country?.message}
								</Typography>
							)}
						</View>
					);
				}}
			/>

			<Controller
				control={control}
				name="hospital"
				rules={{
					required: {
						value: true,
						message: 'Hospital is required',
					},
				}}
				render={({ field: { value, onChange, ref, } }) => {
					return (
						<View>
							<Label>Hospital</Label>
							<SelectModal
								placeholder="Select hospital"
								value={value}
								options={[
									{
										value: 'one',
										label: 'One',
									},
									{
										value: 'two',
										label: 'Two',
									},
									{
										value: 'three',
										label: 'Three',
									},
								]}
								onChange={value => {
									onChange(value);
									if (!hospital) setHospital(`${value}`);
								}}
							/>
							{!!formState.errors.hospital && (
								<Typography className="text-xs text-destructive">
									{formState.errors.hospital?.message}
								</Typography>
							)}
						</View>
					);
				}}
			/>

			<View>
				<Button
					color="secondary"
					onPress={() => submit()}
				>
					<Typography>{buttonText}</Typography>
				</Button>
			</View>
		</View>
    );
}
