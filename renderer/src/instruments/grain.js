import { el } from "@elemaudio/core";
import { default as core } from "@elemaudio/node-renderer";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// https://github.com/zya/granular/blob/gh-pages/js/main.js

// This example shows another approach to sample playback and manipulation.
//
// Here, instead of using `el.sample` for sample playback, we'll use `el.table`,
// which acts much like a lookup table: we load our sample into a buffer, and
// can read from that buffer with a normalized lookup position between [0, 1].
//
// To make things interesting, this example runs two phasors in parallel, each
// reading tiny slices of the sample buffer– a very basic granulator. To smooth
// things out, we apply a hann window to each grain, and offset the phasors to
// create a continuous soundbed.
//
// For interesting results, try updating the SAMPLE_PATH here to a longer file,
// maybe several seconds long or more, to hear the grain readers slowly sweeping
// across the file.
const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_PATH = resolve(__dirname, "./84bpm_DMaj_PluckingAbout.wav");

function grainTrain() {
  // Our phasors. The second, `t2`, is derived from `t` and offset by exactly
  // half a cycle.
  let t = el.phasor(1, 0);
  let t2 = el.sub(el.add(t, 0.5), el.floor(el.add(t, 0.5)));

  // Next we derive our "reader" signals, `r` and `r2`, by swinging a slow sine
  // shaped LFO within [0, 1] and summing our phasors into it, multiplying each
  // phasor by 0.01 to ensure that it only sweeps through a tiny portion of the buffer (a grain).
  let o = el.mod(
    el.add(el.phasor(0.01, 0), el.latch(el.train(4), el.rand())),
    1
  ); // el.mul(0.2, el.add(1, el.cycle(0.01)));
  let r = el.add(o, el.mul(0.001, t));
  let r2 = el.add(o, el.mul(0.001, t2));

  // Then here we put it together: a lowpass filter with cutoff modulation running
  // over the sum of the two grain readers: each grain reader is a hann window multiplied
  // by the result of the `el.table` read.
  return el.lowpass(
    el.add(1200, el.mul(800, el.cycle(0.1))),
    0.717,
    el.add(
      el.mul(el.hann(t), el.table({ path: SAMPLE_PATH }, r)),
      el.mul(el.hann(t2), el.table({ path: SAMPLE_PATH }, r2))
    )
  );
}

export default grainTrain
