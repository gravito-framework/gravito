import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const PACKAGES_DIR = join(process.cwd(), 'packages');

async function main() {
    const dirs = await readdir(PACKAGES_DIR);

    for (const dir of dirs) {
        const pkgPath = join(PACKAGES_DIR, dir, 'package.json');
        try {
            const content = await readFile(pkgPath, 'utf-8');
            const json = JSON.parse(content);

            if (json.repository && json.repository.directory !== `packages/${dir}`) {
                console.log(`Updating ${json.name}: ${json.repository.directory} -> packages/${dir}`);
                json.repository.directory = `packages/${dir}`;
                await writeFile(pkgPath, JSON.stringify(json, null, 2) + '\n');
            }
        } catch (e) {
            // Skip non-package directories
        }
    }
}

main();
