# renderer

## Description

## usage
* start a local (or remote) mqtt broker, e.g. ragazzi will do the job.
* start ofMIDI2MQTT
* use any DAW to send midi messages to the midi port specified in ofMIDI2MQTT

There is currently no CMS set up to configure the renderer and host the files. But thats on the roadmap.
For now the config must be hosted somewhere else, e.g. in a github repo and it can be passed via a url search parameter.

```
js console: encodeURIComponent("https://raw.githubusercontent.com/thomasgeissl/BYODMCSE/master/src/assets/config.json") 
"https%3A%2F%2Ftest.com%2Fconfig.json"
http://localhost:3000/#/?config=https%3A%2F%2Fraw.githubusercontent.com%2Fthomasgeissl%2FBYODMCSE%2Fmaster%2Fsrc%2Fassets%2Fconfig.json
```


./bin/ofMIDI2MQTT -d -h byodmcse.cloud.shiftr.io -p 1883 -u byodmcse -r aFyYJo7b6rKnORki -t byod/demo


