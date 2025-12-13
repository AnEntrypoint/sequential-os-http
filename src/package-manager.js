import { execSync } from 'child_process';

export class PackageManager {
  constructor() {
    this.isLinux = process.platform === 'linux';
    this.hasApt = this.checkAptAvailable();
  }

  checkAptAvailable() {
    if (!this.isLinux) return false;
    try {
      execSync('which apt-get', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  async validatePackageForInstall(packageName) {
    const errors = [];
    const warnings = [];

    if (!this.isLinux) {
      errors.push('Package installation only supported on Linux');
      return { valid: false, errors, warnings };
    }

    if (!this.hasApt) {
      errors.push('apt-get not found on system');
      return { valid: false, errors, warnings };
    }

    if (!packageName || typeof packageName !== 'string') {
      errors.push('Invalid package name');
      return { valid: false, errors, warnings };
    }

    const cleaned = packageName.trim();
    if (!/^[a-z0-9][a-z0-9.\-]*$/.test(cleaned)) {
      errors.push(`Invalid package name format: ${packageName}`);
      return { valid: false, errors, warnings };
    }

    return { valid: true, errors, warnings, packageName: cleaned };
  }

  async validatePackagesForInstall(packageNames) {
    const valid = [];
    const invalid = [];

    for (const pkg of packageNames) {
      const result = await this.validatePackageForInstall(pkg);
      if (result.valid) {
        valid.push(result.packageName);
      } else {
        invalid.push({ package: pkg, errors: result.errors });
      }
    }

    return { valid, invalid, canProceed: invalid.length === 0 };
  }

  getInstallCommand(packages) {
    if (!Array.isArray(packages)) {
      packages = [packages];
    }
    const pkgStr = packages.join(' ');
    return `DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y ${pkgStr}`;
  }

  getUpdateCommand() {
    return 'DEBIAN_FRONTEND=noninteractive apt-get update';
  }

  getSearchCommand(packageName) {
    return `apt-cache search ${packageName}`;
  }

  getInfoCommand(packageName) {
    return `apt-cache show ${packageName}`;
  }

  getListInstalledCommand(filter = '') {
    if (filter) {
      return `dpkg -l | grep ${filter}`;
    }
    return 'dpkg -l';
  }

  getRemoveCommand(packages) {
    if (!Array.isArray(packages)) {
      packages = [packages];
    }
    const pkgStr = packages.join(' ');
    return `apt-get remove -y ${pkgStr}`;
  }

  getPurgeCommand(packages) {
    if (!Array.isArray(packages)) {
      packages = [packages];
    }
    const pkgStr = packages.join(' ');
    return `apt-get purge -y ${pkgStr}`;
  }

  getAutoremoveCommand() {
    return 'apt-get autoremove -y';
  }

  getUpgradeCommand() {
    return 'DEBIAN_FRONTEND=noninteractive apt-get upgrade -y';
  }

  getDistUpgradeCommand() {
    return 'DEBIAN_FRONTEND=noninteractive apt-get dist-upgrade -y';
  }
}

export const packageManager = new PackageManager();
