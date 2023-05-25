function extractBaseFrequenciesEnergy(
  fftOutput,
  sampleRate,
  baseFrequencyRange
) {
  const binSize = sampleRate / fftOutput.length;
  const baseFrequencyIndices = baseFrequencyRange.map((freq) =>
    Math.round(freq / binSize)
  );

  let energy = 0;
  for (let i = 0; i < baseFrequencyIndices.length; i++) {
    const binIndex = baseFrequencyIndices[i];
    const binValue = fftOutput[binIndex];
    energy += Math.abs(binValue) ** 2; // Square magnitude of the complex value
  }

  return energy;
}

const constrain = function(n, low, high) {
    return Math.max(Math.min(n, high), low);
  };
const map = function (n, start1, stop1, start2, stop2, withinBounds) {
  const newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  if (start2 < stop2) {
    return constrain(newval, start2, stop2);
  } else {
    return constrain(newval, stop2, start2);
  }
};

export { extractBaseFrequenciesEnergy, map };
