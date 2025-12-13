import { createErrorResponse } from '@sequentialos/error-handling';
import { nowISO } from '@sequentialos/timestamp-utilities';

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function registerTerminalHandler(app, kit) {
  app.post('/api/sequential-os/terminal/execute', asyncHandler(async (req, res) => {
    const { instruction, sessionId = 'default' } = req.body;
    if (!instruction) {
      return res.status(400).json(createErrorResponse('INVALID_INPUT', 'instruction is required'));
    }
    const result = await kit.run(instruction);
    res.json({
      success: true,
      output: result.output || '',
      exitCode: result.exitCode || 0,
      instruction,
      sessionId,
      timestamp: nowISO()
    });
  }));
}
