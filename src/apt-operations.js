// APT package management operations
import { packageManager } from './package-manager.js';
import { nowISO } from '@sequentialos/timestamp-utilities';

export class AptOperations {
  static async install(kit, packages) {
    const validation = await packageManager.validatePackagesForInstall(packages);
    const installCmd = packageManager.getInstallCommand(validation.valid);
    const result = await kit.run(installCmd);
    return {
      success: true,
      packages: validation.valid,
      instruction: installCmd,
      hash: result.hash,
      short: result.short,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timestamp: nowISO()
    };
  }

  static async remove(kit, packages, purge = false) {
    const validation = await packageManager.validatePackagesForInstall(packages);
    const removeCmd = purge
      ? packageManager.getPurgeCommand(validation.valid)
      : packageManager.getRemoveCommand(validation.valid);
    const result = await kit.run(removeCmd);
    return {
      success: true,
      packages: validation.valid,
      instruction: removeCmd,
      hash: result.hash,
      short: result.short,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timestamp: nowISO()
    };
  }

  static async update(kit) {
    const updateCmd = packageManager.getUpdateCommand();
    const result = await kit.run(updateCmd);
    return {
      success: true,
      instruction: updateCmd,
      hash: result.hash,
      short: result.short,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timestamp: nowISO()
    };
  }

  static async upgrade(kit, distUpgrade = false) {
    const upgradeCmd = distUpgrade
      ? packageManager.getDistUpgradeCommand()
      : packageManager.getUpgradeCommand();
    const result = await kit.run(upgradeCmd);
    return {
      success: true,
      instruction: upgradeCmd,
      hash: result.hash,
      short: result.short,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timestamp: nowISO()
    };
  }

  static async search(kit, packageName) {
    const searchCmd = packageManager.getSearchCommand(packageName);
    const result = await kit.exec(searchCmd);
    return {
      success: true,
      packageName,
      instruction: searchCmd,
      results: result || '',
      timestamp: nowISO()
    };
  }

  static async info(kit, packageName) {
    const infoCmd = packageManager.getInfoCommand(packageName);
    const result = await kit.exec(infoCmd);
    return {
      success: true,
      packageName,
      instruction: infoCmd,
      info: result || '',
      timestamp: nowISO()
    };
  }

  static async listInstalled(kit, filter) {
    const listCmd = packageManager.getListInstalledCommand(filter);
    const result = await kit.exec(listCmd);
    return {
      success: true,
      instruction: listCmd,
      filter: filter || null,
      packages: result || '',
      timestamp: nowISO()
    };
  }

  static async autoremove(kit) {
    const autoremoveCmd = packageManager.getAutoremoveCommand();
    const result = await kit.run(autoremoveCmd);
    return {
      success: true,
      instruction: autoremoveCmd,
      hash: result.hash,
      short: result.short,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      timestamp: nowISO()
    };
  }

  static getValidationResult(packages) {
    return packageManager.validatePackagesForInstall(packages);
  }
}
