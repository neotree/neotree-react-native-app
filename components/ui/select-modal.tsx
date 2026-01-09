import { Fragment, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import THEME from '@/constants/theme';
import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "./dialog";

export type SelectModalOption = {
	value: string | number;
	label: string | number;
};

export type SelectModalProps = {
	multi?: boolean;
	disabled?: boolean;
	placeholder?: string;
	value?: SelectModalOption['value'] | SelectModalOption['value'][];
	options: SelectModalOption[];
	labelRenderer?: (label: SelectModalOption['label']) => React.ReactNode;
	onChange?: (value: SelectModalOption['value'], values: SelectModalOption['value'][]) => void;
};

export function SelectModal({
	disabled,
	placeholder = '',
	value,
	multi,
	options: optionsProp,
	labelRenderer,
	onChange,
}: SelectModalProps) {
	const [open, setOpen] = useState(false);

	const {
		selected,
		selectedCount,
		triggerLabel,
		options,
	} = useMemo(() => {
		const valArr: SelectModalOption['value'][] = [];

		if (value) {
			if (typeof value === 'string' || typeof value === 'number') {
				valArr.push(value);
			} else {
				value.forEach(v => valArr.push(v));
			}
		}

		const selected = valArr.reduce((acc, v) => {
			const option = optionsProp.find(o => `${o.value}` === `${v}`);
			if (!option) return acc;
			return {
				...acc,
				[v]: option,
			};
		}, {} as Record<SelectModalOption['value'], SelectModalOption>);

		const selectedCount = Object.values(selected).length;

		let triggerLabel: SelectModalOption['value'] = placeholder || '';

		if (selectedCount) {
			triggerLabel = Object.values(selected)[0].label;
			if (selectedCount > 1) triggerLabel = `${selectedCount} selected`;
		}

		return {
			selected,
			selectedCount,
			triggerLabel,
			options: optionsProp.map((o, i) => {
				return {
					...o,
					__key: `${i}`,
				};
			}),
		};
	}, [value, optionsProp]);

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={open => setOpen(open)}
			>
				<DialogTrigger asChild>
					<TouchableOpacity
						disabled={disabled}
						className={cn(
							'flex-row gap-x-2 px-3 py-2 border border-border rounded-lg',
							disabled && 'opacity-50',
						)}
					>
						<View className="flex-1">
							<Typography>{triggerLabel}</Typography>
						</View>
						<Icon name="arrow-drop-down" color={THEME.colors.muted.foreground} />
					</TouchableOpacity>
				</DialogTrigger>

				<DialogContent
					classes={{ cardContent: 'p-0', }}
				>
					<ScrollView>
						<View className="gap-y-2 p-4">
							{options.map(o => {
								const isSelected = selected[o.value];

								return (
									<Fragment key={o.__key}>
										<TouchableOpacity
											onPress={() => {
												const selectedVals = Object.values(selected).map(o => o.value);
												const values = isSelected ?
													selectedVals.filter(v => `${v}` !== `${o.value}`)
													:
													[...selectedVals, o.value];
												onChange?.(o.value, values);
												if (!multi) setOpen(false);
											}}
										>
											<Card
												className={cn(
													isSelected && 'border-primary bg-primary',
												)}
											>
												<CardContent>
													<Typography
														className={cn(
															isSelected && 'text-primary-foreground',
														)}
													>
														{o.label}
													</Typography>
												</CardContent>
											</Card>
										</TouchableOpacity>
									</Fragment>
								);
							})}
						</View>
					</ScrollView>

					<DialogFooter className="p-4">
						<DialogClose asChild>
							<Button variant="outline">
								<Typography>Close</Typography>
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
