export const convertTimeRangesToSeconds = (buffered: TimeRanges) => {
  return Array.from({ length: buffered.length }, (_, index) => [
    Math.round(buffered.start(index)),
    Math.round(buffered.end(index))
  ]);
};
