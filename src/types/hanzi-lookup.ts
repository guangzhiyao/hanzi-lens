// Type for handwriting recognition matches
export interface HanziMatch {
  hanzi: string;
  score?: number;
}

// Stroke data format: array of strokes, each stroke is an array of [x, y] points
export type StrokeData = [number, number][][];

// Worker message types
export type WorkerMessage =
  | { type: 'init'; wasmJsUri: string; wasmUri: string }
  | { type: 'lookup'; strokes: StrokeData; limit?: number };

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'result'; matches: HanziMatch[] }
  | { type: 'error'; message: string };
