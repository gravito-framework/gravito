import fs from 'node:fs/promises'
import path from 'node:path'
import pc from 'picocolors'

export class MakeCommand {
    private stubsPath: string

    constructor() {
        // Resolve stubs relative to the compiled CLI executable or source
        // When running from source (ts), it's ../../stubs
        // When distributed, we might need adjustments, but for now assuming flattened structure or standard path
        this.stubsPath = path.resolve(__dirname, '../../stubs')
    }

    /**
     * Run the generator
     * @param type - The type of artifact (controller, model, etc)
     * @param name - The user input name
     */
    async run(type: string, name: string) {
        try {
            const stubName = `${type}.stub`
            const stubContent = await this.readStub(stubName)

            if (!stubContent) {
                throw new Error(`Stub not found: ${stubName}`)
            }

            const content = this.replaceVariables(stubContent, name)
            const targetPath = this.resolveTargetPath(type, name)

            await this.ensureDirectory(path.dirname(targetPath))
            await this.writeFile(targetPath, content)

            console.log(pc.green(`✅ Created ${type}: ${this.getRelativePath(targetPath)}`))
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            console.error(pc.red(`❌ Failed to create ${type}: ${message}`))
            process.exit(1)
        }
    }

    private async readStub(filename: string): Promise<string | null> {
        try {
            const filePath = path.join(this.stubsPath, filename)
            return await fs.readFile(filePath, 'utf-8')
        } catch (e) {
            return null
        }
    }

    private replaceVariables(content: string, name: string): string {
        const pascal = this.toPascalCase(name)
        const camel = this.toCamelCase(name)

        return content
            .replace(/\{\{ Name \}\}/g, pascal)
            .replace(/\{\{ name \}\}/g, camel)
    }

    private resolveTargetPath(type: string, name: string): string {
        const cwd = process.cwd()
        const pascal = this.toPascalCase(name)

        // Define conventions
        const map: Record<string, string> = {
            controller: `src/controllers/${pascal}Controller.ts`,
            model: `src/models/${pascal}.ts`,
            middleware: `src/middleware/${this.toCamelCase(name)}.ts`,
        }

        if (!map[type]) {
            throw new Error(`Unknown type: ${type}`)
        }

        return path.join(cwd, map[type])
    }

    private async ensureDirectory(dir: string) {
        await fs.mkdir(dir, { recursive: true })
    }

    private async writeFile(filepath: string, content: string) {
        // Check if exists
        try {
            await fs.access(filepath)
            // If no error, file exists
            throw new Error(`File already exists: ${filepath}`)
        } catch (e: any) {
            if (e.code !== 'ENOENT') {
                throw e
            }
        }

        await fs.writeFile(filepath, content, 'utf-8')
    }

    private toPascalCase(str: string): string {
        // Remove special chars, split by space/hyphen/underscore
        return str
            .split(/[\s-_]+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('')
    }

    private toCamelCase(str: string): string {
        const pascal = this.toPascalCase(str)
        return pascal.charAt(0).toLowerCase() + pascal.slice(1)
    }

    private getRelativePath(fullpath: string): string {
        return path.relative(process.cwd(), fullpath)
    }
}
