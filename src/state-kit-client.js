import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class StateKitHttpClient {
  constructor(kit, statekitDir) {
    this.kit = kit;
    this.statekitDir = statekitDir || path.resolve(process.cwd(), '.statekit');
  }

  static async create(statekitDir) {
    try {
      const { default: SequentialMachine } = await import('@sequentialos/sequential-machine');
      const kit = new SequentialMachine();
      await kit.init(statekitDir || path.resolve(process.cwd(), '.statekit'));
      return new StateKitHttpClient(kit, statekitDir);
    } catch (error) {
      throw new Error(`Failed to initialize StateKit: ${error.message}`);
    }
  }

  async status() {
    return this.kit.status();
  }

  async run(instruction) {
    return this.kit.run(instruction);
  }

  async exec(instruction) {
    return this.kit.exec(instruction);
  }

  async history() {
    return this.kit.history();
  }

  async checkout(ref) {
    return this.kit.checkout(ref);
  }

  tags() {
    return this.kit.tags();
  }

  tag(name, ref) {
    return this.kit.tag(name, ref);
  }
}

export default StateKitHttpClient;
