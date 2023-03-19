import { el } from "@elemaudio/core";
import { default as core } from "@elemaudio/node-renderer";
import { WebMidi } from "webmidi";
import mqtt from "mqtt";

import Sampler from "./src/instruments/Sampler.js";
import Synth from "./src/instruments/Synth.js";
import grainTrain from "./src/instruments/grain.js";

const client = mqtt.connect("mqtt://localhost:1883");


WebMidi.enable()
  .then(onEnabled)
  .catch((err) => alert(err));

function onEnabled() {
  // Inputs
  WebMidi.inputs.forEach((input) =>
    console.log(input.manufacturer, input.name)
  );

  // Outputs
  WebMidi.outputs.forEach((output) =>
    console.log(output.manufacturer, output.name)
  );
}

// TODO: get sessionPrefix from command line arguments
const sessionPrefix = ""

// TODO: get orchestra config from cms
const config = {
  1: "synth",
  2: "sampler",
};
const orchestra = {};
Object.entries(config).forEach(([key, value]) => {
  switch (value) {
    case "synth": {
      orchestra[key] = { instrument: new Synth() };
      break;
    }
    case "sampler": {
      orchestra[key] = { instrument: new Sampler() };
      break;
    }
  }
});

client.on("connect", function () {
  client.subscribe("test/noteOn", function (err) {
    if (err) {
      console.log(err);
    }
  });
  client.subscribe("test/noteOff", function (err) {
    if (err) {
      console.log(err);
    }
  });
  client.subscribe(`${sessionPrefix}ofMIDI2MQTT`, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

core.on("load", function () {
  client.on("message", function (topic, message) {
    // message is Buffer
    try {
      const payload = JSON.parse(message.toString());
      console.log(orchestra[payload.channel]);
      switch (topic) {
        case `${sessionPrefix}ofMIDI2MQTT`: {
          if (payload.status === 144) {
            orchestra[payload.channel].instrument.noteOn(
              payload.note,
              payload.velocity
            );
          } else if (payload.status === 128) {
            orchestra[payload.channel].instrument.noteOff(payload.note);
          }
          break;
        }
        case "test/noteOn": {
          orchestra[payload.channel].instrument.noteOn(
            payload.note,
            payload.velocity
          );
          break;
        }
        case "test/noteOff": {
          orchestra[payload.channel].instrument.noteOff(payload.note);
          break;
        }
      }
    } catch (error) {
      console.log("error", error);
    }
    const signals = Object.values(orchestra).map((instrument) => {
      return instrument.instrument.render();
    });
    const mainOut = el.add(...signals);
    core.render(mainOut, mainOut);
  });
  // core.on("midi", function (e) {
  //   console.log(e);
  //   console.log(parseInt(e.bytes.substring(0, 2), 16));
  //   console.log("note", parseInt(e.bytes.substring(2, 4), 16));
  //   console.log("velocity", parseInt(e.bytes.substring(4, 6), 16));
  //   switch (e.type) {
  //     case "noteOn": {
  //       const velocity = parseInt(e.bytes.substring(4, 6), 16);
  //       synth.noteOn(e.noteNumber, velocity);
  //       break;
  //     }
  //     case "noteOff": {
  //       synth.noteOff(e.noteNumber);
  //       break;
  //     }
  //   }
  //   let train = grainTrain();
  //   const synthOut = synth.render();
  //   core.render(synthOut, synthOut);
  // });
});
core.on("error", function (error) {
  console.error(error);
});

core.initialize();
