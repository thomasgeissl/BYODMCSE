import { default as core } from "@elemaudio/node-renderer";
import { WebMidi } from "webmidi";
import mqtt from "mqtt";

import Orchestra from "./src/audio/Orchestra.js";
import config from "../assets/config";

const client = mqtt.connect("mqtt://localhost:1883");

WebMidi.enable()
  .then(onEnabled)
  .catch((err) => alert(err));

function onEnabled() {
  // Inputs
  // WebMidi.inputs.forEach((input) =>
  //   console.log(input.manufacturer, input.name)
  // );
  // Outputs
  // WebMidi.outputs.forEach((output) =>
  //   console.log(output.manufacturer, output.name)
  // );
}

// TODO: get sessionPrefix from command line arguments
const sessionPrefix = "";

const orchestra = new Orchestra(config);

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
    console.log("connected to broker");
    if (err) {
      console.log("error", err);
    }
  });
});
client.on("error", function (error) {
  console.log("error", error);
});

core.on("load", function () {
  client.on("message", function (topic, message) {
    // message is Buffer
    try {
      const payload = JSON.parse(message.toString());
      console.log("got message", topic, payload);
      switch (topic) {
        case `${sessionPrefix}ofMIDI2MQTT`: {
          if (payload.status === 144) {
            orchestra.noteOn(payload.channel, payload.note, payload.velocity);
          } else if (payload.status === 128) {
            orchestra.noteOff(payload.channel, payload.note);
          } else if (payload.status === 176) {
            console.log(
              "got cc, TODO: pass to instruments and effects parameters"
            );
          }
          break;
        }
        case "test/noteOn": {
          orchestra.noteOn(payload.channel, payload.note, payload.velocity);
          break;
        }
        case "test/noteOff": {
          orchestra.noteOff(payload.channel, payload.note);
          break;
        }
      }
    } catch (error) {
      console.log("error", error);
    }
    const mainOut = orchestra.render();
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
