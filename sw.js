if(!self.define){let e,s={};const a=(a,i)=>(a=new URL(a+".js",i).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(i,r)=>{const d=e||("document"in self?document.currentScript.src:"")||location.href;if(s[d])return;let l={};const f=e=>a(e,d),c={module:{uri:d},exports:l,require:f};s[d]=Promise.all(i.map((e=>c[e]||f(e)))).then((e=>(r(...e),l)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"apple-touch-icon.png",revision:"0d2a5f8cd93fe3d905d43d8a13e3d2e5"},{url:"assets/index-CqZC01qg.js",revision:null},{url:"assets/index-DreYWP9u.css",revision:null},{url:"favicon.ico",revision:"6e1fcf8b29fea276b5b5f870d570c3b9"},{url:"favicon.svg",revision:"b2ccb5abcea3281906bbf4efad2b593a"},{url:"index.html",revision:"9cd08b547479f4da6377fd6c0b51de36"},{url:"LDI2apCSOBg7S-QT7pasEfOleefkkbIxyyg.woff2",revision:"2febcb5316fc25875feb85b31f0d6b7e"},{url:"LDI2apCSOBg7S-QT7pasEfOqeefkkbIxyyg.woff2",revision:"73fdd06119950d13d8746d07ed8727ad"},{url:"LDI2apCSOBg7S-QT7pasEfOreefkkbIx.woff2",revision:"372bdf8586aabc2dc831f688ce38637b"},{url:"manifest.webmanifest",revision:"fc01d324d62a1e6c9077dff763ce65fe"},{url:"pwa-192x192.png",revision:"a8ae00b8164e04a08645e939df8491d1"},{url:"pwa-512x512.png",revision:"0d2a5f8cd93fe3d905d43d8a13e3d2e5"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"samples/220910__hard3eat__strange-texture.mp3",revision:"f021fe0b3aec9b60e81d726473aad90e"},{url:"samples/258075__sarah_orio__trash-can-top.mp3",revision:"c50e8469c2690b043a8a117496787659"},{url:"samples/337908__deleted_user_5997821__80vibraphone.mp3",revision:"d86c352f10039758367e362e52ea2d95"},{url:"samples/383461__deleted_user_7146007__dumping-trash-in-a-trash-can.mp3",revision:"3a0811c4c4c9b359010eb556072d873e"},{url:"samples/424994__gregorquendel__fire-effects-textures-glitch-01.mp3",revision:"79bd4301cdf2fd26ba5253675f106268"},{url:"samples/444589__tatiana229__trash.mp3",revision:"b8e9346acdfdfb34b9d3c9badbae648c"},{url:"samples/500853__phonosupf__vibraphone-sequence.mp3",revision:"d72e1cb2091962fc79d46f7646853fb2"},{url:"samples/517304__newlocknew__click-snap-glitch-txtr-hrnlzrflt-frk4.mp3",revision:"e4d5f81a0bb5f647bd670281a348a087"},{url:"samples/540877__dullbananas__trash.mp3",revision:"ca5d177a9b88ee6eac180e3d3df166dc"},{url:"samples/660566__cfedorek16__trash-can-lid-openclose.mp3",revision:"0641b4b65c3dc3e706b567be9798ef41"},{url:"samples/683468__twigy233__dirt-walker-foley-sfx-textured.mp3",revision:"d56d6a2f973fbd6dd98611f3836c1d51"},{url:"samples/685596__dflee4__rain-on-tarp-texture.mp3",revision:"dc727b462b28e83e3c4c06a4f235d4dd"},{url:"samples/999WavFiles/1.mp3",revision:"c249a227b0dc4903deff2da6c314d121"},{url:"samples/999WavFiles/10.mp3",revision:"35ee46116627b84b329b0d6a9f9194ee"},{url:"samples/999WavFiles/2.mp3",revision:"99ac18e7e175b8763f6ea969ce48600c"},{url:"samples/999WavFiles/3.mp3",revision:"11257758adf2da8171555ab3e15796c1"},{url:"samples/999WavFiles/4.mp3",revision:"8b83f7db0e8ca679194b92e564e59da4"},{url:"samples/999WavFiles/5.mp3",revision:"57199681ae475c94b23f129c9d40cef7"},{url:"samples/999WavFiles/6.mp3",revision:"ee925cabcad7039f18e6935afbde359e"},{url:"samples/999WavFiles/7.mp3",revision:"be84346a9cbeaf694fe3e42e37563bb2"},{url:"samples/999WavFiles/8.mp3",revision:"1440c1046c24cb648a0a109844c94536"},{url:"samples/999WavFiles/9.mp3",revision:"f919f179dc762fd7bfd2b80951e5538c"},{url:"samples/999WavFiles/AERATOR.mp3",revision:"bb651f7bdbecc69954f5efc784c5edb5"},{url:"samples/999WavFiles/ATMEN.mp3",revision:"e614734d9032530fef3d12ca4874f64e"},{url:"pwa-192x192.png",revision:"a8ae00b8164e04a08645e939df8491d1"},{url:"LDI2apCSOBg7S-QT7pasEfOleefkkbIxyyg.woff2",revision:"2febcb5316fc25875feb85b31f0d6b7e"},{url:"LDI2apCSOBg7S-QT7pasEfOqeefkkbIxyyg.woff2",revision:"73fdd06119950d13d8746d07ed8727ad"},{url:"LDI2apCSOBg7S-QT7pasEfOreefkkbIx.woff2",revision:"372bdf8586aabc2dc831f688ce38637b"},{url:"apple-touch-icon.png",revision:"0d2a5f8cd93fe3d905d43d8a13e3d2e5"},{url:"favicon.ico",revision:"6e1fcf8b29fea276b5b5f870d570c3b9"},{url:"favicon.svg",revision:"b2ccb5abcea3281906bbf4efad2b593a"},{url:"pwa-512x512.png",revision:"0d2a5f8cd93fe3d905d43d8a13e3d2e5"},{url:"samples/220910__hard3eat__strange-texture.mp3",revision:"f021fe0b3aec9b60e81d726473aad90e"},{url:"samples/258075__sarah_orio__trash-can-top.mp3",revision:"c50e8469c2690b043a8a117496787659"},{url:"samples/337908__deleted_user_5997821__80vibraphone.mp3",revision:"d86c352f10039758367e362e52ea2d95"},{url:"samples/383461__deleted_user_7146007__dumping-trash-in-a-trash-can.mp3",revision:"3a0811c4c4c9b359010eb556072d873e"},{url:"samples/424994__gregorquendel__fire-effects-textures-glitch-01.mp3",revision:"79bd4301cdf2fd26ba5253675f106268"},{url:"samples/444589__tatiana229__trash.mp3",revision:"b8e9346acdfdfb34b9d3c9badbae648c"},{url:"samples/500853__phonosupf__vibraphone-sequence.mp3",revision:"d72e1cb2091962fc79d46f7646853fb2"},{url:"samples/509846__joltin_joe_castaldo__sailing-the-styx-texture_trimmed.mp3",revision:"33b0622f544dd9d659dfc0e32bd20564"},{url:"samples/517304__newlocknew__click-snap-glitch-txtr-hrnlzrflt-frk4.mp3",revision:"e4d5f81a0bb5f647bd670281a348a087"},{url:"samples/540877__dullbananas__trash.mp3",revision:"ca5d177a9b88ee6eac180e3d3df166dc"},{url:"samples/660566__cfedorek16__trash-can-lid-openclose.mp3",revision:"0641b4b65c3dc3e706b567be9798ef41"},{url:"samples/683468__twigy233__dirt-walker-foley-sfx-textured.mp3",revision:"d56d6a2f973fbd6dd98611f3836c1d51"},{url:"samples/685596__dflee4__rain-on-tarp-texture.mp3",revision:"dc727b462b28e83e3c4c06a4f235d4dd"},{url:"samples/999WavFiles/1.mp3",revision:"c249a227b0dc4903deff2da6c314d121"},{url:"samples/999WavFiles/10.mp3",revision:"35ee46116627b84b329b0d6a9f9194ee"},{url:"samples/999WavFiles/2.mp3",revision:"99ac18e7e175b8763f6ea969ce48600c"},{url:"samples/999WavFiles/3.mp3",revision:"11257758adf2da8171555ab3e15796c1"},{url:"samples/999WavFiles/4.mp3",revision:"8b83f7db0e8ca679194b92e564e59da4"},{url:"samples/999WavFiles/5.mp3",revision:"57199681ae475c94b23f129c9d40cef7"},{url:"samples/999WavFiles/6.mp3",revision:"ee925cabcad7039f18e6935afbde359e"},{url:"samples/999WavFiles/7.mp3",revision:"be84346a9cbeaf694fe3e42e37563bb2"},{url:"samples/999WavFiles/8.mp3",revision:"1440c1046c24cb648a0a109844c94536"},{url:"samples/999WavFiles/9.mp3",revision:"f919f179dc762fd7bfd2b80951e5538c"},{url:"samples/999WavFiles/AERATOR.mp3",revision:"bb651f7bdbecc69954f5efc784c5edb5"},{url:"samples/999WavFiles/ATMEN.mp3",revision:"e614734d9032530fef3d12ca4874f64e"},{url:"manifest.webmanifest",revision:"fc01d324d62a1e6c9077dff763ce65fe"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
