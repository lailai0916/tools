import { computeTextDiff } from './textDiff';

self.onmessage = (event: MessageEvent<{ original: string; modified: string }>) => {
  const { original, modified } = event.data;
  self.postMessage(computeTextDiff(original, modified));
};
