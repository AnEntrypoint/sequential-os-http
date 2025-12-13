import { createErrorResponse } from '@sequentialos/error-handling';
import { AptOperations } from './apt-operations.js';
import { AptStatus } from './apt-status.js';

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function validatePackagesInput(packages) {
  if (!packages || !Array.isArray(packages) || packages.length === 0) {
    return { valid: false, error: createErrorResponse('INVALID_INPUT', 'packages array is required') };
  }
  return { valid: true };
}

function validatePackageNameInput(packageName) {
  if (!packageName) {
    return { valid: false, error: createErrorResponse('INVALID_INPUT', 'packageName is required') };
  }
  return { valid: true };
}

export function registerPackageHandlers(app, kit) {
  app.post('/api/sequential-os/apt/install', asyncHandler(async (req, res) => {
    const validate = validatePackagesInput(req.body.packages);
    if (!validate.valid) return res.status(400).json(validate.error);

    const validation = AptOperations.getValidationResult(req.body.packages);
    if (!validation.canProceed) {
      return res.status(400).json({
        success: false,
        errors: validation.invalid,
        message: 'Some packages failed validation'
      });
    }

    const result = await AptOperations.install(kit, req.body.packages);
    res.json(result);
  }));

  app.post('/api/sequential-os/apt/remove', asyncHandler(async (req, res) => {
    const validate = validatePackagesInput(req.body.packages);
    if (!validate.valid) return res.status(400).json(validate.error);

    const validation = AptOperations.getValidationResult(req.body.packages);
    if (!validation.canProceed) {
      return res.status(400).json({
        success: false,
        errors: validation.invalid,
        message: 'Some packages failed validation'
      });
    }

    const result = await AptOperations.remove(kit, req.body.packages, req.body.purge || false);
    res.json(result);
  }));

  app.post('/api/sequential-os/apt/update', asyncHandler(async (req, res) => {
    const result = await AptOperations.update(kit);
    res.json(result);
  }));

  app.post('/api/sequential-os/apt/upgrade', asyncHandler(async (req, res) => {
    const result = await AptOperations.upgrade(kit, req.body.distUpgrade || false);
    res.json(result);
  }));

  app.post('/api/sequential-os/apt/search', asyncHandler(async (req, res) => {
    const validate = validatePackageNameInput(req.body.packageName);
    if (!validate.valid) return res.status(400).json(validate.error);

    const result = await AptOperations.search(kit, req.body.packageName);
    res.json(result);
  }));

  app.post('/api/sequential-os/apt/info', asyncHandler(async (req, res) => {
    const validate = validatePackageNameInput(req.body.packageName);
    if (!validate.valid) return res.status(400).json(validate.error);

    const result = await AptOperations.info(kit, req.body.packageName);
    res.json(result);
  }));

  app.get('/api/sequential-os/apt/list', asyncHandler(async (req, res) => {
    const result = await AptOperations.listInstalled(kit, req.query.filter);
    res.json(result);
  }));

  app.post('/api/sequential-os/apt/autoremove', asyncHandler(async (req, res) => {
    const result = await AptOperations.autoremove(kit);
    res.json(result);
  }));

  app.get('/api/sequential-os/apt/status', asyncHandler(async (req, res) => {
    const result = AptStatus.getStatus();
    res.json(result);
  }));
}
