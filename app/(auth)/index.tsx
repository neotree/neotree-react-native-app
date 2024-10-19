import { useState } from "react";

import { Poster } from "@/components/poster";
import { Content } from "@/components/content";
import { OnboardingForm } from "./components/onboarding-form";

export default function OnboardingScreen() {
    return (
        <Poster>
            <Content className="py-10">
                <OnboardingForm />
            </Content>
        </Poster>
    );
}
