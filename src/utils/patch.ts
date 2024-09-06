import { saveSession } from "../data/saveSession";
import { getSessions, getScreens } from "../data/queries";

export async function patch() {
    try {
        const res = await getSessions();
        const sessions = res as unknown as any[];

        for(const s of sessions) {
            const screens = await getScreens({ script_id: s.script_id });
            const mgmt = screens.filter(s => s.data.printable).filter(s => s.type === 'management').map(s => s.screen_id);
            await saveSession({
                ...s,
                data: {
                    ...s.data,
                    management: s.data.management.map((s: any) => s.screen_id).filter((id: any) => mgmt.includes(id)),
                },
            });
        }
    } catch(e: any) {}
}
