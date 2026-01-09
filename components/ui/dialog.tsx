import { cloneElement, createContext, useCallback, useContext, useEffect, useState } from "react";
import { Modal, TouchableOpacity, View } from "react-native";

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { WINDOW_HEIGHT } from '@/constants';
import { cn } from "@/lib/utils";

export type DialogProps = {
	children?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

const DialogContext = createContext<{
	open: boolean;
	props: Omit<DialogProps, 'children'>
	onOpenChange: (open: boolean) => void;
}>(null!);

function useDialogContext(component: string) {
	const ctx = useContext(DialogContext);
	if (!ctx) throw new Error(`<${component} /> must be used inside <Dialog />`);
	return ctx;
};

export function Dialog({ children, ...props }: DialogProps) {
	const [open, setOpen] = useState(!!props.open);

	const onOpenChange = useCallback((open: boolean) => {
		setOpen(open);
		props.onOpenChange?.(open);
	}, [props.onOpenChange]);

	useEffect(() => {
		onOpenChange(!!props.open);
	}, [props.open, onOpenChange]);

	return (
		<DialogContext.Provider
			value={{
				props,
				open,
				onOpenChange,
			}}
		>
			{children}
		</DialogContext.Provider>
	);
}

export type DialogContentProps = {
	children?: React.ReactNode;
	classes?: {
		card?: string;
		cardContent?: string;
	};
};

export function DialogContent({ children, classes, }: DialogContentProps) {
	const { open, onOpenChange, } = useDialogContext('DialogContent');

	return (
		<Modal
			visible={open}
			transparent={true}
			statusBarTranslucent={true}
			onDismiss={() => onOpenChange(false)}
			onRequestClose={() => onOpenChange(false)}
		>
			<View className={cn('flex-1 justify-center items-center bg-primary/50')}>
				<Card
					className={cn(
						"w-[90%] max-w-[700px] bg-background",
						classes?.card,
					)}
				>
					<CardContent
						className={cn(
							classes?.cardContent,
						)}
						style={{ maxHeight: (WINDOW_HEIGHT * 80)/100 }}
					>
						{children}
					</CardContent>
				</Card>
			</View>
		</Modal>
	);
}

export type DialogTriggerProps = React.ComponentProps<typeof TouchableOpacity> & {
	asChild?: boolean;
	children: React.ReactElement<{
		className?: string;
		onPress: (...args: any[]) => void;
	}>;
};

export function DialogTrigger({ children, asChild, ...props }: DialogTriggerProps) {
	const { onOpenChange, } = useDialogContext('DialogTrigger');

	if (!children) return null;

	if (asChild) {
		return cloneElement(children, {
			...props,
			className: cn(
				children.props.className,
			),
			onPress: (...args) => {
				onOpenChange(true);
				children.props.onPress?.(...args);
			},
		});
	}

	return (
		<TouchableOpacity
			{...props}
			onPress={(...args) => {
				onOpenChange(true);
				props.onPress?.(...args);
			}}
		>
			{children}
		</TouchableOpacity>
	);
}

export type DialogCloseProps = React.ComponentProps<typeof TouchableOpacity> & {
	asChild?: boolean;
	children: React.ReactElement<{
		className?: string;
		onPress: (...args: any[]) => void;
	}>;
};

export function DialogClose({ children, asChild, ...props }: DialogCloseProps) {
	const { onOpenChange, } = useDialogContext('DialogClose');

	if (!children) return null;

	if (asChild) {
		return cloneElement(children, {
			...props,
			className: cn(
				children.props.className,
			),
			onPress: (...args) => {
				onOpenChange(false);
				children.props.onPress?.(...args);
			},
		});
	}

	return (
		<TouchableOpacity
			{...props}
			onPress={(...args) => {
				onOpenChange(false);
				props.onPress?.(...args);
			}}
		>
			{children}
		</TouchableOpacity>
	);
}

export type DialogFooterProps = React.ComponentProps<typeof CardFooter>;

export function DialogFooter(props: DialogFooterProps) {
	useDialogContext('DialogFooter');

	return (
		<CardFooter
			{...props}
			className={cn(
				'justify-end',
				props.className,
			)}
		/>
	);
}
