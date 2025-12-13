// APT status and capability checking
import { packageManager } from './package-manager.js';
import { nowISO } from '@sequentialos/timestamp-utilities';

export class AptStatus {
  static getStatus() {
    const hasApt = packageManager.hasApt;
    const isLinux = packageManager.isLinux;

    return {
      supported: hasApt && isLinux,
      platform: process.platform,
      hasApt,
      isLinux,
      timestamp: nowISO()
    };
  }

  static isSupported() {
    return packageManager.hasApt && packageManager.isLinux;
  }

  static getPlatform() {
    return process.platform;
  }

  static hasAPT() {
    return packageManager.hasApt;
  }

  static isLinuxPlatform() {
    return packageManager.isLinux;
  }
}
