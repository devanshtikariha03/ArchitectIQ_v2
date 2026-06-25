// Generation pipeline entry points. The full implementation lives in
// legacy.js; this module re-exports the public surface.
export {
  generate,
  runMockRecommendation,
  showOutput,
  getPipelineStages,
  getPipelineActive,
} from './legacy.js';
