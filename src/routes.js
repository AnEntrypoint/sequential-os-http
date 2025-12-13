import { registerKitHandlers } from './kit-handlers.js';
import { registerLayerHandlers } from './layer-handlers.js';
import { registerTerminalHandler } from './terminal-handler.js';
import { registerPackageHandlers } from './package-handlers.js';

export function registerSequentialOsRoutes(app, kit, STATEKIT_DIR) {
  if (!STATEKIT_DIR) {
    console.warn('[SequentialOS] STATEKIT_DIR is null/undefined - run records will NOT be created');
  }
  registerKitHandlers(app, kit, STATEKIT_DIR);
  registerLayerHandlers(app, kit, STATEKIT_DIR);
  registerTerminalHandler(app, kit);
  registerPackageHandlers(app, kit);
}
