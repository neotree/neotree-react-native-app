import { SafeAreaView, View } from "react-native";

import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Content } from "@/components/content";
import { Exclamation } from "@/components/svgs/exclamation";
import { useScreenContext } from "@/contexts/screen";
import { YesNo } from "./components/yesno";
import { Checklist } from "./components/checklist";
import { Management } from "./components/management";
import { MultiSelect } from "./components/multi-select";
import { Progress } from "./components/progress";
import { SingleSelect } from "./components/single-select";
import { Timer } from "./components/timer";
import { Diagnosis } from "./components/diagnosis";
import { EdlizSummary } from "./components/edliz-summary";
import { Form } from "./components/form";

export default function ScreenIndex() {
    const { screen } = useScreenContext();

    return (
        <SafeAreaView className="flex-1 bg-background">
            {(() => {
                switch(screen.type) {
                    case 'checklist':
                        return <Checklist />;
            
                    case 'diagnosis': 
                        return <Diagnosis />;
            
                    case 'form':
                        return <Form />;
            
                    case 'management':
                        return <Management />;
            
                    case 'multi_select':
                        return <MultiSelect />;
            
                    case 'mwi_edliz_summary_table':
                        return <EdlizSummary />;
            
                    case 'zw_edliz_summary_table':
                        return <EdlizSummary />;
            
                    case 'progress':
                        return <Progress />;
            
                    case 'single_select':
                        return <SingleSelect />;
            
                    case 'timer':
                        return <Timer />;
            
                    case 'yesno':
                        return <YesNo />;
            
                    default:
                        return (
                            <Content className="mt-5">
                                <Card>
                                    <CardContent className="items-center justify-center">
                                        <Exclamation 
                                            svgClassName="w-20 h-20 mb-2 stroke-danger"
                                        />
                                        <Text className="text-center text-danger">
                                            Invalid screen type: {screen.type}
                                        </Text>
                                    </CardContent>
                                </Card>
                            </Content>
                        );
                }
            })()}
        </SafeAreaView>
    )
}