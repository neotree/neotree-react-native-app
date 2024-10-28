import { Chevron } from "@/components/svgs/chevron";
import { FAB } from "@/components/ui/fab";
import { useScreenContext } from "@/contexts/screen";

export function ScreenFAB() {
    const { onFAB } = useScreenContext();

    return (
        <>
            <FAB
                className="absolute bottom-5 right-5"
                onPress={onFAB}
            >
                <Chevron
                    direction="right"
                    svgClassName="stroke-primary-foreground w-6 h-6"
                />
            </FAB>
        </>
    );
}