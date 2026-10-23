/**
 * Test-only resolver hook.
 *
 * App source imports are extensionless ("./membership"), which is what Metro
 * expects. Node's ESM resolver requires an explicit extension, so this maps a
 * relative, extensionless specifier onto the matching .ts file when one exists.
 *
 * It exists so tests can import the real modules unchanged — no .ts suffixes
 * leaking into production imports, and no second copy of anything.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !path.extname(specifier)) {
        const parent = context.parentURL
            ? path.dirname(fileURLToPath(context.parentURL))
            : process.cwd();

        for (const ext of ['.ts', '.tsx']) {
            const candidate = path.resolve(parent, specifier + ext);
            if (existsSync(candidate)) {
                return { url: pathToFileURL(candidate).href, shortCircuit: true };
            }
        }
    }

    return nextResolve(specifier, context);
}
