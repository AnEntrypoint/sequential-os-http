import { createErrorResponse } from '@sequentialos/error-handling';
import fsx from 'fs-extra';
import { join } from 'path';

const { writeFileSync, ensureDirSync } = fsx;

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function createTaskRunRecord(instruction, result, machineDir) {
  try {
    if (!machineDir) {
      console.warn('[TaskRunRecord] machineDir is null/undefined - cannot create run record');
      return null;
    }

    const runDir = join(machineDir, 'work', '.state', 'runs');
    ensureDirSync(runDir);

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const pid = process.pid;
    const runId = `${timestamp}-${randomId}-${pid}`;

    const record = {
      runId,
      taskName: 'sequential-os-task',
      status: result.stderr ? 'error' : 'completed',
      input: { instruction },
      output: result,
      error: result.stderr || null,
      duration: 0,
      timestamp: new Date().toISOString()
    };

    const filePath = join(runDir, `${runId}.json`);
    writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8');
    console.log('[TaskRunRecord] Created:', runId);

    return record;
  } catch (err) {
    console.error('[TaskRunRecord] Error:', err.message, 'machineDir:', machineDir);
    return null;
  }
}

export function registerKitHandlers(app, kit, machineDir) {
  const recordDir = machineDir || process.env.SEQUENTIAL_MACHINE_DIR;
  if (!recordDir) {
    console.warn('[registerKitHandlers] No recordDir available - task records will not be created');
  }

  app.get('/api/sequential-os/status', asyncHandler(async (req, res) => {
    const status = await kit.status();
    res.json(status);
  }));

  app.post('/api/sequential-os/run', asyncHandler(async (req, res) => {
    const { instruction } = req.body;
    if (!instruction) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));
    }
    const result = await kit.run(instruction);

    if (recordDir) {
      try {
        createTaskRunRecord(instruction, result, recordDir);
      } catch (err) {
        console.error('[OS Run] Failed to create run record:', err.message);
      }
    }

    res.json(result);
  }));

  app.post('/api/sequential-os/exec', asyncHandler(async (req, res) => {
    const { instruction } = req.body;
    if (!instruction) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));
    }
    const result = await kit.exec(instruction);
    res.json({ output: result, success: true });
  }));

  app.get('/api/sequential-os/history', asyncHandler(async (req, res) => {
    const history = await kit.history();
    res.json(history);
  }));

  app.post('/api/sequential-os/checkout', asyncHandler(async (req, res) => {
    const { ref } = req.body;
    if (!ref) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'ref is required'));
    }
    await kit.checkout(ref);
    res.json({ success: true, ref });
  }));

  app.get('/api/sequential-os/tags', asyncHandler(async (req, res) => {
    const tags = kit.tags();
    res.json(tags);
  }));

  app.post('/api/sequential-os/tag', asyncHandler(async (req, res) => {
    const { name, ref } = req.body;
    if (!name) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'name is required'));
    }
    kit.tag(name, ref);
    res.json({ success: true, name, ref });
  }));
}
