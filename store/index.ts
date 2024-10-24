import { useScripts } from "@/hooks/use-scripts";
import { useScript } from "@/hooks/script/use-script";
import { useConfiguration } from "@/hooks/use-configuration";
import { useConfigKeys } from "@/hooks/use-config-keys";
import { useSocket } from "@/hooks/use-socket";
import { useSession } from "@/hooks/session/use-session";
import { useAsyncStorage } from "@/hooks/use-async-storage";

export async function resetStore() {
    const { WEBEDITOR_URL } = await useAsyncStorage.getState().getAllItems();

    useSocket.getState().init(WEBEDITOR_URL);

    useScripts.getState().reset();
    useScript.getState().reset();
    useConfiguration.getState().reset();
    useConfigKeys.getState().reset();
    useSession.getState().reset();
}