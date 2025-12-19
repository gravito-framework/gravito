#!/usr/bin/env bun

/**
 * 發布所有套件到 NPM
 * 
 * 使用方式：
 *   bun run scripts/publish-all.ts [--dry-run] [--skip-build] [--skip-test]
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const PACKAGES_DIR = join(process.cwd(), 'packages');
const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_BUILD = process.argv.includes('--skip-build');
const SKIP_TEST = process.argv.includes('--skip-test');

// 從環境變數或參數獲取 OTP
const OTP = process.env.NPM_OTP || (() => {
    const otpIndex = process.argv.indexOf('--otp');
    return otpIndex !== -1 && process.argv[otpIndex + 1] ? process.argv[otpIndex + 1] : undefined;
})();

interface PackageInfo {
    name: string;
    path: string;
    version: string;
    private: boolean;
}

async function getPackages(): Promise<PackageInfo[]> {
    const packages: PackageInfo[] = [];
    const dirs = await readdir(PACKAGES_DIR);

    for (const dir of dirs) {
        const pkgPath = join(PACKAGES_DIR, dir, 'package.json');
        try {
            const content = await readFile(pkgPath, 'utf-8');
            const json = JSON.parse(content);

            packages.push({
                name: json.name,
                path: join(PACKAGES_DIR, dir),
                version: json.version,
                private: json.private === true,
            });
        } catch (e: any) {
            console.warn(`⚠️  無法讀取 ${dir}/package.json:`, e.message);
        }
    }

    return packages.filter((pkg) => !pkg.private);
}

async function checkNpmAuth(): Promise<boolean> {
    try {
        const { stdout } = await execAsync('npm whoami');
        const username = stdout.trim();
        console.log(`✅ 已登入 NPM 為: ${username}`);
        return true;
    } catch {
        console.error('❌ 未登入 NPM，請先執行: npm login');
        return false;
    }
}

async function checkNpmRegistry(): Promise<boolean> {
    try {
        const { stdout } = await execAsync('npm config get registry');
        const registry = stdout.trim();
        if (registry !== 'https://registry.npmjs.org/') {
            console.warn(`⚠️  當前 registry 為: ${registry}`);
            console.warn('   建議使用: npm config set registry https://registry.npmjs.org/');
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

async function buildPackage(pkg: PackageInfo): Promise<boolean> {
    console.log(`\n📦 構建 ${pkg.name}...`);
    try {
        await execAsync('bun run build', { cwd: pkg.path });
        console.log(`  ✅ ${pkg.name} 構建成功`);
        return true;
    } catch (e: any) {
        console.error(`  ❌ ${pkg.name} 構建失敗:`, e.message);
        return false;
    }
}

async function testPackage(pkg: PackageInfo): Promise<boolean> {
    console.log(`\n🧪 測試 ${pkg.name}...`);
    try {
        await execAsync('bun test', { cwd: pkg.path });
        console.log(`  ✅ ${pkg.name} 測試通過`);
        return true;
    } catch (e: any) {
        console.error(`  ❌ ${pkg.name} 測試失敗:`, e.message);
        return false;
    }
}

async function checkPackageExists(pkg: PackageInfo): Promise<boolean> {
    try {
        // 檢查特定版本是否存在
        const { stdout } = await execAsync(`npm view ${pkg.name}@${pkg.version} version 2>/dev/null || echo ""`);
        const publishedVersion = stdout.trim();
        if (publishedVersion === pkg.version) {
            console.log(`  ⏭️  ${pkg.name}@${pkg.version} 已存在於 NPM，跳過發布`);
            return true;
        }
        return false;
    } catch {
        // 套件或版本不存在，可以發布
        return false;
    }
}

async function verifyNpmAuth(): Promise<boolean> {
    console.log('\n🔐 檢查 NPM 認證狀態...');
    
    try {
        // 檢查是否已登入
        const { stdout } = await execAsync('npm whoami');
        const username = stdout.trim();
        console.log(`✅ 已登入為: ${username}`);
        
        console.log('\n🌐 準備進行瀏覽器驗證...');
        console.log('   注意：發布第一個套件時，NPM 會自動打開瀏覽器進行驗證');
        console.log('   請在瀏覽器中完成驗證（指紋、Face ID 等）');
        console.log('   驗證成功後，後續套件會自動發布\n');
        
        return true;
    } catch (e: any) {
        console.error('❌ 未登入 NPM，請先執行: npm login');
        return false;
    }
}

async function publishPackage(pkg: PackageInfo, retryCount = 0): Promise<boolean> {
    const isBeta = pkg.version.includes('beta');
    const isAlpha = pkg.version.includes('alpha');
    const versionTag = isBeta ? 'beta' : isAlpha ? 'alpha' : 'latest';
    
    console.log(`\n🚀 發布 ${pkg.name}@${pkg.version}${isBeta || isAlpha ? ` (tag: ${versionTag})` : ''}...`);

    // 檢查是否已存在
    const exists = await checkPackageExists(pkg);
    if (exists) {
        return true; // 已存在，視為成功
    }

    if (DRY_RUN) {
        console.log(`  🔍 [DRY RUN] 將發布 ${pkg.name}@${pkg.version}${isBeta || isAlpha ? ` (tag: ${versionTag})` : ''}`);
        return true;
    }

    try {
        // 對於 alpha/beta 版本，使用對應的 tag
        let publishCmd = isBeta || isAlpha 
            ? `npm publish --access public --tag ${versionTag}`
            : 'npm publish --access public';
        
        // 如果有 OTP，添加到命令中（但通常瀏覽器驗證不需要）
        if (OTP) {
            publishCmd += ` --otp=${OTP}`;
        }
        
        // 設置較長的超時時間，因為瀏覽器驗證可能需要時間
        await execAsync(publishCmd, { 
            cwd: pkg.path,
            timeout: 120000, // 2分鐘超時
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });
        console.log(`  ✅ ${pkg.name}@${pkg.version} 發布成功${isBeta || isAlpha ? ` (tag: ${versionTag})` : ''}`);
        return true;
    } catch (e: any) {
        const errorMsg = e.message || e.stderr || '';
        
        // 如果是版本已存在的錯誤，視為成功
        if (errorMsg.includes('You cannot publish over the previously published versions') ||
            errorMsg.includes('version already exists') ||
            errorMsg.includes('EPUBLISHCONFLICT')) {
            console.log(`  ⏭️  ${pkg.name}@${pkg.version} 已存在，跳過`);
            return true;
        }
        
        // 如果是認證問題，且還沒重試過，提示用戶
        if ((errorMsg.includes('E401') || errorMsg.includes('unauthorized') || errorMsg.includes('Access token expired')) && retryCount === 0) {
            console.error(`  ❌ ${pkg.name} 發布失敗: 認證問題`);
            console.error(`  💡 請在瀏覽器中完成驗證，然後重新執行發布`);
            return false;
        }
        
        // 如果是 EOTP 錯誤
        if (errorMsg.includes('EOTP') || errorMsg.includes('one-time password')) {
            console.error(`  ❌ ${pkg.name} 發布失敗: 需要 OTP 驗證`);
            console.error(`  💡 提示: 請使用 --otp=<code> 或設定 NPM_OTP 環境變數`);
            return false;
        }
        
        // 如果是 tag 問題
        if (errorMsg.includes('specify a tag') || errorMsg.includes('prerelease version')) {
            console.error(`  ❌ ${pkg.name} 發布失敗: 預發布版本必須指定 tag`);
            console.error(`  💡 提示: 腳本應該已自動處理，請檢查版本號格式`);
            return false;
        }
        
        console.error(`  ❌ ${pkg.name} 發布失敗:`, errorMsg.split('\n').slice(0, 3).join(' '));
        return false;
    }
}

async function main() {
    console.log('🚀 Gravito 套件批次發布工具\n');

    // 檢查 NPM 登入狀態
    if (!DRY_RUN && !(await checkNpmAuth())) {
        process.exit(1);
    }

    // 檢查 registry
    await checkNpmRegistry();

    // 獲取所有需要發布的套件
    const packages = await getPackages();
    console.log(`\n📋 找到 ${packages.length} 個套件:`);
    packages.forEach((pkg) => {
        console.log(`  - ${pkg.name}@${pkg.version}`);
    });

    // 檢查哪些套件已存在
    console.log('\n🔍 檢查已發布的版本...');
    const packagesToPublish: PackageInfo[] = [];
    const packagesSkipped: PackageInfo[] = [];
    
    for (const pkg of packages) {
        const exists = await checkPackageExists(pkg);
        if (exists) {
            packagesSkipped.push(pkg);
        } else {
            packagesToPublish.push(pkg);
        }
    }

    console.log(`\n📊 發布計劃:`);
    console.log(`  ✅ 已存在（跳過）: ${packagesSkipped.length} 個`);
    console.log(`  🚀 需要發布: ${packagesToPublish.length} 個`);

    if (packagesToPublish.length === 0) {
        console.log('\n✨ 所有套件都已發布，無需操作！');
        return;
    }

    if (DRY_RUN) {
        console.log('\n🔍 [DRY RUN 模式] 不會實際發布');
    }

    // 驗證認證（準備瀏覽器驗證）
    if (!DRY_RUN) {
        console.log('\n⚠️  即將發布套件到 NPM');
        const authVerified = await verifyNpmAuth();
        if (!authVerified) {
            console.error('\n❌ 認證檢查失敗，請重新登入後再試');
            process.exit(1);
        }
        
        console.log('⏳ 等待 3 秒後開始發布...');
        console.log('   第一個套件發布時會觸發瀏覽器驗證\n');
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    const results: Array<{ pkg: PackageInfo; success: boolean; skipped?: boolean }> = [];

    // 先記錄跳過的套件
    packagesSkipped.forEach((pkg) => {
        results.push({ pkg, success: true, skipped: true });
    });

    // 處理需要發布的套件
    for (const pkg of packagesToPublish) {
        let success = true;

        // 構建
        if (!SKIP_BUILD) {
            success = await buildPackage(pkg);
            if (!success) {
                results.push({ pkg, success: false });
                continue;
            }
        }

        // 測試
        if (!SKIP_TEST) {
            success = await testPackage(pkg);
            if (!success) {
                results.push({ pkg, success: false });
                continue;
            }
        }

        // 發布
        success = await publishPackage(pkg);
        results.push({ pkg, success });
        
        // 發布間隔，避免過於頻繁
        if (success && !DRY_RUN) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    // 總結
    console.log('\n\n📊 發布結果總結:');
    const successful = results.filter((r) => r.success && !r.skipped);
    const skipped = results.filter((r) => r.skipped);
    const failed = results.filter((r) => !r.success);

    if (skipped.length > 0) {
        console.log(`  ⏭️  已存在（跳過）: ${skipped.length}`);
        skipped.forEach((r) => {
            console.log(`     - ${r.pkg.name}@${r.pkg.version}`);
        });
    }

    console.log(`  ✅ 成功發布: ${successful.length}`);
    successful.forEach((r) => {
        console.log(`     - ${r.pkg.name}@${r.pkg.version}`);
    });

    if (failed.length > 0) {
        console.log(`  ❌ 失敗: ${failed.length}`);
        failed.forEach((r) => {
            console.log(`     - ${r.pkg.name}@${r.pkg.version}`);
        });
        console.log('\n💡 提示: 失敗的套件可能是認證問題，請手動發布或重新執行腳本');
        process.exit(1);
    }

    console.log('\n✨ 所有套件處理完成！');
}

main().catch((error) => {
    console.error('❌ 發生錯誤:', error);
    process.exit(1);
});

