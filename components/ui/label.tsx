import { Typography, type TypographyProps } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type LabelProps = TypographyProps;

export function Label({
	className,
	...props
}: LabelProps) {
	return (
		<Typography
			{...props}
			className={cn(
				'text-sm font-medium',
				className,
			)}
		/>
	);
}
