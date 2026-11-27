/**
 * Which session ID a script uses: "nuid" (FB8E-1230042) or "muid" (M0K7Q-000001R). Set per script in
 * the editor and delivered in the script's data. A script has exactly one; anything else (older data
 * from before the setting existed) is a NUID script.
 */
export type ScriptIdType = 'nuid' | 'muid';

export function getScriptIdType(script?: { data?: { idType?: unknown } } | null): ScriptIdType {
    return script?.data?.idType === 'muid' ? 'muid' : 'nuid';
}
