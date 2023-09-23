# renderer

## Description

## usage
* start a local (or remote) mqtt broker, e.g. ragazzi will do the job.
* start ofMIDI2MQTT
* use any DAW to send midi messages to the midi port specified in ofMIDI2MQTT

There is currently no CMS set up to configure the renderer and host the files. But thats on the roadmap.
For now the config must be hosted somewhere else, e.g. in a github repo and it can be passed via a url search parameter.

```
js console: encodeURIComponent("https://test.com/config.json") 
"https%3A%2F%2Ftest.com%2Fconfig.json"
http://localhost:3000/#/?config=https%3A%2F%2Ftest.com%2Fconfig.json
```

### node renderer
`yarn node-dev`

### web renderer
`yarn dev`


##
` ofMIDI2MQTT -h public.cloud.shiftr.io -p 1883 -u public -r public -t byod/roomId`