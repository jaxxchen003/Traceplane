import { TraceplaneClient } from './client';
import type { OrchestratorContext, TraceplaneConfig } from './types';

export async function getOrchestratorContext(
  config: TraceplaneConfig,
  episodeId: string
): Promise<OrchestratorContext> {
  const client = new TraceplaneClient(config);
  return client.getOrchestratorContext(episodeId);
}

export const traceplaneTools = {
  get_orchestrator_context: {
    name: 'get_orchestrator_context',
    description: 'Fetch machine-readable episode context for a Symphony orchestrator.',
    execute: getOrchestratorContext
  }
};
