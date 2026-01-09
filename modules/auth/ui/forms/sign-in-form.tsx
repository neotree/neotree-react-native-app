import { router } from 'expo-router';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { useAppContext } from '@/contexts/app';
import { EMAIL_REGEX, isValidEmailAddress } from '@/lib/email';

export function SignInForm() {
    const passwordInputRef = useRef<TextInput>(null);

    const {
        control,
        formState,
        handleSubmit,
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const { signIn } = useAppContext();

    const submit = handleSubmit(
        async data => {
            signIn();
            router.replace('/(main)/(drawer)');
        },
    );

    return (
		<View className="gap-y-4">
			<Controller
				control={control}
				name="email"
				rules={{
					required: {
						value: true,
						message: 'Email address is required',
					},
					pattern: {
						value: EMAIL_REGEX,
						message: 'Invalid email address format',
					},
				}}
				render={({ field: { value, onChange, ref, }, formState, }) => {
					const error = !value ? false : !isValidEmailAddress(value);
					return (
						<View>
							<Label>Email address</Label>
							<Input
								ref={ref}
								value={value}
								placeholder="Email address"
								keyboardType="email-address"
								textContentType="username"
								autoCapitalize="none"
								returnKeyType={value && !error ? 'next' : undefined}
								numberOfLines={1}
								error={error}
								onChangeText={email => onChange(email)}
								onSubmitEditing={() => value && !error && passwordInputRef.current?.focus()}
							/>
							{!!formState.errors.email && (
								<Typography className="text-xs text-destructive">
									{formState.errors.email?.message}
								</Typography>
							)}
						</View>
					);
				}}
			/>

			<Controller
				control={control}
				name="password"
				rules={{
					required: {
						value: true,
						message: 'Password is required',
					},
				}}
				render={({ field: { value, onChange, ref, } }) => {
					return (
						<View>
							<Label>Password</Label>
							<Input
								ref={e => {
									ref(e);
									passwordInputRef.current = e;
								}}
								value={value}
								placeholder="Password"
								secureTextEntry
								textContentType="password"
								autoCapitalize="none"
								returnKeyType="go"
								onChangeText={password => onChange(password)}
								onSubmitEditing={() => submit()}
							/>
							{!!formState.errors.password && (
								<Typography className="text-xs text-destructive">
									{formState.errors.password?.message}
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
					<Typography>Sign in</Typography>
				</Button>
			</View>
		</View>
    );
}
