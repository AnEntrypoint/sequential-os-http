import path from 'path';
import fs from 'fs-extra';
import { createErrorResponse } from '@sequentialos/error-handling';

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function registerLayerHandlers(app, kit, STATEKIT_DIR) {
  app.get('/api/sequential-os/inspect/:hash', asyncHandler(async (req, res) => {
    const { hash } = req.params;
    const layerPath = path.join(STATEKIT_DIR, 'layers', hash);
    const resolvedPath = fs.realpathSync(STATEKIT_DIR);
    const resolvedLayerPath = fs.realpathSync(layerPath);
    if (!resolvedLayerPath.startsWith(resolvedPath)) {
      return res.status(403).json(createErrorResponse('PATH_TRAVERSAL', 'Access denied'));
    }
    if (!fs.existsSync(layerPath)) {
      return res.status(404).json(createErrorResponse('LAYER_NOT_FOUND', 'Layer not found'));
    }
    const files = [];
    const getAllFiles = (dir, base = '') => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          getAllFiles(fullPath, path.join(base, item));
        } else {
          files.push(path.join(base, item));
        }
      });
    };
    getAllFiles(layerPath);
    const stats = fs.statSync(layerPath);
    res.json({ hash, files, size: stats.size || 0 });
  }));

  app.post('/api/sequential-os/diff', asyncHandler(async (req, res) => {
    const { file, hash1, hash2 } = req.body;
    if (!file || !hash1 || !hash2) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'file, hash1, and hash2 are required'));
    }
    const layerPath1 = path.join(STATEKIT_DIR, 'layers', hash1, file);
    const layerPath2 = path.join(STATEKIT_DIR, 'layers', hash2, file);
    const resolvedPath = fs.realpathSync(STATEKIT_DIR);
    const resolvedLayerPath1 = fs.realpathSync(layerPath1);
    const resolvedLayerPath2 = fs.realpathSync(layerPath2);
    if (!resolvedLayerPath1.startsWith(resolvedPath) || !resolvedLayerPath2.startsWith(resolvedPath)) {
      return res.status(403).json(createErrorResponse('PATH_TRAVERSAL', 'Access denied'));
    }
    if (!fs.existsSync(layerPath1) || !fs.existsSync(layerPath2)) {
      return res.status(404).json(createErrorResponse('FILE_NOT_FOUND', 'File not found in one or both layers'));
    }
    const content1 = fs.readFileSync(layerPath1, 'utf-8');
    const content2 = fs.readFileSync(layerPath2, 'utf-8');
    res.json({
      file,
      hash1,
      hash2,
      content1,
      content2,
      identical: content1 === content2
    });
  }));
}
