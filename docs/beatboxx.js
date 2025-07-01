// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(moduleArg) => Promise<Module>
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = globalThis.Module || (typeof Module != "undefined" ? Module : {});

// The way we signal to a worker that it is hosting a pthread is to construct
// it with a specific name.
var ENVIRONMENT_IS_WASM_WORKER = globalThis.name == "em-ww";

var ENVIRONMENT_IS_AUDIO_WORKLET = typeof AudioWorkletGlobalScope !== "undefined";

// Audio worklets behave as wasm workers.
if (ENVIRONMENT_IS_AUDIO_WORKLET) ENVIRONMENT_IS_WASM_WORKER = true;

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).
// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == "object";

var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != "undefined";

// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == "object" && process.versions?.node && process.type != "renderer";

var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_AUDIO_WORKLET;

if (ENVIRONMENT_IS_NODE) {
  var worker_threads = require("worker_threads");
  global.Worker = worker_threads.Worker;
  ENVIRONMENT_IS_WORKER = !worker_threads.isMainThread;
  ENVIRONMENT_IS_WASM_WORKER = ENVIRONMENT_IS_WORKER && worker_threads["workerData"] == "em-ww";
}

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// include: /var/folders/v8/kv5tdb4s5d57h2swgmltjd580000gn/T/tmpj384pfpn.js
Module["expectedDataFileDownloads"] ??= 0;

Module["expectedDataFileDownloads"]++;

(() => {
  // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
  var isPthread = typeof ENVIRONMENT_IS_PTHREAD != "undefined" && ENVIRONMENT_IS_PTHREAD;
  var isWasmWorker = typeof ENVIRONMENT_IS_WASM_WORKER != "undefined" && ENVIRONMENT_IS_WASM_WORKER;
  if (isPthread || isWasmWorker) return;
  var isNode = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
  function loadPackage(metadata) {
    var PACKAGE_PATH = "";
    if (typeof window === "object") {
      PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) + "/");
    } else if (typeof process === "undefined" && typeof location !== "undefined") {
      // web worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.substring(0, location.pathname.lastIndexOf("/")) + "/");
    }
    var PACKAGE_NAME = "beatboxx.data";
    var REMOTE_PACKAGE_BASE = "beatboxx.data";
    var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
    var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      if (isNode) {
        require("fs").readFile(packageName, (err, contents) => {
          if (err) {
            errback(err);
          } else {
            callback(contents.buffer);
          }
        });
        return;
      }
      Module["dataFileDownloads"] ??= {};
      fetch(packageName).catch(cause => Promise.reject(new Error(`Network Error: ${packageName}`, {
        cause
      }))).then(response => {
        if (!response.ok) {
          return Promise.reject(new Error(`${response.status}: ${response.url}`));
        }
        if (!response.body && response.arrayBuffer) {
          // If we're using the polyfill, readers won't be available...
          return response.arrayBuffer().then(callback);
        }
        const reader = response.body.getReader();
        const iterate = () => reader.read().then(handleChunk).catch(cause => Promise.reject(new Error(`Unexpected error while handling : ${response.url} ${cause}`, {
          cause
        })));
        const chunks = [];
        const headers = response.headers;
        const total = Number(headers.get("Content-Length") ?? packageSize);
        let loaded = 0;
        const handleChunk = ({done, value}) => {
          if (!done) {
            chunks.push(value);
            loaded += value.length;
            Module["dataFileDownloads"][packageName] = {
              loaded,
              total
            };
            let totalLoaded = 0;
            let totalSize = 0;
            for (const download of Object.values(Module["dataFileDownloads"])) {
              totalLoaded += download.loaded;
              totalSize += download.total;
            }
            Module["setStatus"]?.(`Downloading data... (${totalLoaded}/${totalSize})`);
            return iterate();
          } else {
            const packageData = new Uint8Array(chunks.map(c => c.length).reduce((a, b) => a + b, 0));
            let offset = 0;
            for (const chunk of chunks) {
              packageData.set(chunk, offset);
              offset += chunk.length;
            }
            callback(packageData.buffer);
          }
        };
        Module["setStatus"]?.("Downloading data...");
        return iterate();
      });
    }
    function handleError(error) {
      console.error("package error:", error);
    }
    var fetchedCallback = null;
    var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
    if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, data => {
      if (fetchedCallback) {
        fetchedCallback(data);
        fetchedCallback = null;
      } else {
        fetched = data;
      }
    }, handleError);
    function runWithFS(Module) {
      function assert(check, msg) {
        if (!check) throw msg + (new Error).stack;
      }
      Module["FS_createPath"]("/", "assets", true, true);
      Module["FS_createPath"]("/assets", "fonts", true, true);
      Module["FS_createPath"]("/assets/fonts", "DotGothic16", true, true);
      Module["FS_createPath"]("/assets/fonts", "Doto", true, true);
      Module["FS_createPath"]("/assets/fonts/Doto", "static", true, true);
      Module["FS_createPath"]("/assets/fonts", "Exile", true, true);
      Module["FS_createPath"]("/assets/fonts", "JetBrains_Mono", true, true);
      Module["FS_createPath"]("/assets/fonts/JetBrains_Mono", "static", true, true);
      Module["FS_createPath"]("/assets/fonts", "Nabla", true, true);
      Module["FS_createPath"]("/assets/fonts", "Noto_Color_Emoji", true, true);
      Module["FS_createPath"]("/assets/fonts", "splatoon3", true, true);
      Module["FS_createPath"]("/assets", "out", true, true);
      Module["FS_createPath"]("/assets/out", "diva_assets", true, true);
      Module["FS_createPath"]("/assets/out/diva_assets", "spr_ps4_cmn", true, true);
      Module["FS_createPath"]("/assets", "sfx", true, true);
      Module["FS_createPath"]("/assets", "shaders", true, true);
      Module["FS_createPath"]("/assets", "textures", true, true);
      Module["FS_createPath"]("/assets", "tracks", true, true);
      Module["FS_createPath"]("/", "vendored", true, true);
      Module["FS_createPath"]("/vendored", "lygia", true, true);
      Module["FS_createPath"]("/vendored/lygia", ".github", true, true);
      Module["FS_createPath"]("/vendored/lygia", "animation", true, true);
      Module["FS_createPath"]("/vendored/lygia/animation", "easing", true, true);
      Module["FS_createPath"]("/vendored/lygia", "color", true, true);
      Module["FS_createPath"]("/vendored/lygia/color", "blend", true, true);
      Module["FS_createPath"]("/vendored/lygia/color", "composite", true, true);
      Module["FS_createPath"]("/vendored/lygia/color", "dither", true, true);
      Module["FS_createPath"]("/vendored/lygia/color", "layer", true, true);
      Module["FS_createPath"]("/vendored/lygia/color", "levels", true, true);
      Module["FS_createPath"]("/vendored/lygia/color", "palette", true, true);
      Module["FS_createPath"]("/vendored/lygia/color/palette", "pigments", true, true);
      Module["FS_createPath"]("/vendored/lygia/color/palette", "spectral", true, true);
      Module["FS_createPath"]("/vendored/lygia/color/palette", "wada", true, true);
      Module["FS_createPath"]("/vendored/lygia/color", "space", true, true);
      Module["FS_createPath"]("/vendored/lygia/color", "tonemap", true, true);
      Module["FS_createPath"]("/vendored/lygia", "distort", true, true);
      Module["FS_createPath"]("/vendored/lygia", "draw", true, true);
      Module["FS_createPath"]("/vendored/lygia", "filter", true, true);
      Module["FS_createPath"]("/vendored/lygia/filter", "boxBlur", true, true);
      Module["FS_createPath"]("/vendored/lygia/filter", "edge", true, true);
      Module["FS_createPath"]("/vendored/lygia/filter", "gaussianBlur", true, true);
      Module["FS_createPath"]("/vendored/lygia/filter", "median", true, true);
      Module["FS_createPath"]("/vendored/lygia/filter", "sharpen", true, true);
      Module["FS_createPath"]("/vendored/lygia", "generative", true, true);
      Module["FS_createPath"]("/vendored/lygia", "geometry", true, true);
      Module["FS_createPath"]("/vendored/lygia/geometry", "aabb", true, true);
      Module["FS_createPath"]("/vendored/lygia/geometry", "triangle", true, true);
      Module["FS_createPath"]("/vendored/lygia", "lighting", true, true);
      Module["FS_createPath"]("/vendored/lygia/lighting", "common", true, true);
      Module["FS_createPath"]("/vendored/lygia/lighting", "diffuse", true, true);
      Module["FS_createPath"]("/vendored/lygia/lighting", "ior", true, true);
      Module["FS_createPath"]("/vendored/lygia/lighting", "light", true, true);
      Module["FS_createPath"]("/vendored/lygia/lighting", "material", true, true);
      Module["FS_createPath"]("/vendored/lygia/lighting", "medium", true, true);
      Module["FS_createPath"]("/vendored/lygia/lighting", "ray", true, true);
      Module["FS_createPath"]("/vendored/lygia/lighting", "raymarch", true, true);
      Module["FS_createPath"]("/vendored/lygia/lighting", "shadingData", true, true);
      Module["FS_createPath"]("/vendored/lygia/lighting", "specular", true, true);
      Module["FS_createPath"]("/vendored/lygia", "math", true, true);
      Module["FS_createPath"]("/vendored/lygia/math", "quat", true, true);
      Module["FS_createPath"]("/vendored/lygia", "morphological", true, true);
      Module["FS_createPath"]("/vendored/lygia/morphological", "pyramid", true, true);
      Module["FS_createPath"]("/vendored/lygia", "sample", true, true);
      Module["FS_createPath"]("/vendored/lygia", "sdf", true, true);
      Module["FS_createPath"]("/vendored/lygia", "simulate", true, true);
      Module["FS_createPath"]("/vendored/lygia", "space", true, true);
      /** @constructor */ function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module["addRunDependency"](`fp ${this.name}`);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: function(byteArray) {
          var that = this;
          // canOwn this data in the filesystem, it is a slide into the heap that will never change
          Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
          Module["removeRunDependency"](`fp ${that.name}`);
          this.requests[this.name] = null;
        }
      };
      var files = metadata["files"];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]["start"], files[i]["end"], files[i]["audio"] || 0).open("GET", files[i]["filename"]);
      }
      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, "Loading data file failed.");
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, "bad input to processPackageData");
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
        DataRequest.prototype.byteArray = byteArray;
        var files = metadata["files"];
        for (var i = 0; i < files.length; ++i) {
          DataRequest.prototype.requests[files[i].filename].onload();
        }
        Module["removeRunDependency"]("datafile_beatboxx.data");
      }
      Module["addRunDependency"]("datafile_beatboxx.data");
      Module["preloadResults"] ??= {};
      Module["preloadResults"][PACKAGE_NAME] = {
        fromCache: false
      };
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    }
    if (Module["calledRun"]) {
      runWithFS(Module);
    } else {
      (Module["preRun"] ??= []).push(runWithFS);
    }
  }
  loadPackage({
    "files": [ {
      "filename": "/assets/.DS_Store",
      "start": 0,
      "end": 6148
    }, {
      "filename": "/assets/fonts/.DS_Store",
      "start": 6148,
      "end": 14344
    }, {
      "filename": "/assets/fonts/DotGothic16/DotGothic16-Regular.ttf",
      "start": 14344,
      "end": 2041392
    }, {
      "filename": "/assets/fonts/DotGothic16/OFL.txt",
      "start": 2041392,
      "end": 2045885
    }, {
      "filename": "/assets/fonts/Doto/Doto-VariableFont_ROND,wght.ttf",
      "start": 2045885,
      "end": 2502605
    }, {
      "filename": "/assets/fonts/Doto/OFL.txt",
      "start": 2502605,
      "end": 2507080
    }, {
      "filename": "/assets/fonts/Doto/README.txt",
      "start": 2507080,
      "end": 2509715
    }, {
      "filename": "/assets/fonts/Doto/static/Doto-Black.ttf",
      "start": 2509715,
      "end": 2650759
    }, {
      "filename": "/assets/fonts/Doto/static/Doto-Bold.ttf",
      "start": 2650759,
      "end": 2791771
    }, {
      "filename": "/assets/fonts/Doto/static/Doto-ExtraBold.ttf",
      "start": 2791771,
      "end": 2932839
    }, {
      "filename": "/assets/fonts/Doto/static/Doto-ExtraLight.ttf",
      "start": 2932839,
      "end": 3073883
    }, {
      "filename": "/assets/fonts/Doto/static/Doto-Light.ttf",
      "start": 3073883,
      "end": 3214899
    }, {
      "filename": "/assets/fonts/Doto/static/Doto-Medium.ttf",
      "start": 3214899,
      "end": 3355947
    }, {
      "filename": "/assets/fonts/Doto/static/Doto-Regular.ttf",
      "start": 3355947,
      "end": 3496803
    }, {
      "filename": "/assets/fonts/Doto/static/Doto-SemiBold.ttf",
      "start": 3496803,
      "end": 3637863
    }, {
      "filename": "/assets/fonts/Doto/static/Doto-Thin.ttf",
      "start": 3637863,
      "end": 3778871
    }, {
      "filename": "/assets/fonts/Doto/static/Doto_Rounded-Black.ttf",
      "start": 3778871,
      "end": 3952831
    }, {
      "filename": "/assets/fonts/Doto/static/Doto_Rounded-Bold.ttf",
      "start": 3952831,
      "end": 4126783
    }, {
      "filename": "/assets/fonts/Doto/static/Doto_Rounded-ExtraBold.ttf",
      "start": 4126783,
      "end": 4300767
    }, {
      "filename": "/assets/fonts/Doto/static/Doto_Rounded-ExtraLight.ttf",
      "start": 4300767,
      "end": 4474755
    }, {
      "filename": "/assets/fonts/Doto/static/Doto_Rounded-Light.ttf",
      "start": 4474755,
      "end": 4648715
    }, {
      "filename": "/assets/fonts/Doto/static/Doto_Rounded-Medium.ttf",
      "start": 4648715,
      "end": 4822679
    }, {
      "filename": "/assets/fonts/Doto/static/Doto_Rounded-Regular.ttf",
      "start": 4822679,
      "end": 4996655
    }, {
      "filename": "/assets/fonts/Doto/static/Doto_Rounded-SemiBold.ttf",
      "start": 4996655,
      "end": 5170631
    }, {
      "filename": "/assets/fonts/Doto/static/Doto_Rounded-Thin.ttf",
      "start": 5170631,
      "end": 5344583
    }, {
      "filename": "/assets/fonts/Exile/Exile-Regular.ttf",
      "start": 5344583,
      "end": 5441811
    }, {
      "filename": "/assets/fonts/Exile/OFL.txt",
      "start": 5441811,
      "end": 5446286
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/JetBrainsMono-Italic-VariableFont_wght.ttf",
      "start": 5446286,
      "end": 5641782
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/JetBrainsMono-VariableFont_wght.ttf",
      "start": 5641782,
      "end": 5833150
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/OFL.txt",
      "start": 5833150,
      "end": 5837642
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/README.txt",
      "start": 5837642,
      "end": 5840605
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-Bold.ttf",
      "start": 5840605,
      "end": 5955433
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-BoldItalic.ttf",
      "start": 5955433,
      "end": 6073353
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-ExtraBold.ttf",
      "start": 6073353,
      "end": 6188153
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-ExtraBoldItalic.ttf",
      "start": 6188153,
      "end": 6306105
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-ExtraLight.ttf",
      "start": 6306105,
      "end": 6421177
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-ExtraLightItalic.ttf",
      "start": 6421177,
      "end": 6539405
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-Italic.ttf",
      "start": 6539405,
      "end": 6657345
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-Light.ttf",
      "start": 6657345,
      "end": 6772365
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-LightItalic.ttf",
      "start": 6772365,
      "end": 6890489
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-Medium.ttf",
      "start": 6890489,
      "end": 7005409
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-MediumItalic.ttf",
      "start": 7005409,
      "end": 7123453
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-Regular.ttf",
      "start": 7123453,
      "end": 7238357
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-SemiBold.ttf",
      "start": 7238357,
      "end": 7353257
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-SemiBoldItalic.ttf",
      "start": 7353257,
      "end": 7471289
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-Thin.ttf",
      "start": 7471289,
      "end": 7586285
    }, {
      "filename": "/assets/fonts/JetBrains_Mono/static/JetBrainsMono-ThinItalic.ttf",
      "start": 7586285,
      "end": 7704441
    }, {
      "filename": "/assets/fonts/Nabla/Nabla-Regular-VariableFont_EDPT,EHLT.ttf",
      "start": 7704441,
      "end": 9347805
    }, {
      "filename": "/assets/fonts/Nabla/OFL.txt",
      "start": 9347805,
      "end": 9352284
    }, {
      "filename": "/assets/fonts/Nabla/README.txt",
      "start": 9352284,
      "end": 9354314
    }, {
      "filename": "/assets/fonts/Noto_Color_Emoji/NotoColorEmoji-Regular.ttf",
      "start": 9354314,
      "end": 33628394
    }, {
      "filename": "/assets/fonts/Noto_Color_Emoji/OFL.txt",
      "start": 33628394,
      "end": 33632839
    }, {
      "filename": "/assets/fonts/splatoon3/AsiaKCUBE-R.ttf",
      "start": 33632839,
      "end": 34494539
    }, {
      "filename": "/assets/fonts/splatoon3/AsiaKERIN-M.ttf",
      "start": 34494539,
      "end": 35508591
    }, {
      "filename": "/assets/fonts/splatoon3/BlitzBold.otf",
      "start": 35508591,
      "end": 35790659
    }, {
      "filename": "/assets/fonts/splatoon3/BlitzMain.otf",
      "start": 35790659,
      "end": 36070795
    }, {
      "filename": "/assets/fonts/splatoon3/DFPT_AZ5.ttf",
      "start": 36070795,
      "end": 40217735
    }, {
      "filename": "/assets/fonts/splatoon3/DFPT_ZY9.ttf",
      "start": 40217735,
      "end": 43916083
    }, {
      "filename": "/assets/fonts/splatoon3/DFP_GBZY7.ttf",
      "start": 43916083,
      "end": 45525663
    }, {
      "filename": "/assets/fonts/splatoon3/DFP_GBZY9.ttf",
      "start": 45525663,
      "end": 47129923
    }, {
      "filename": "/assets/fonts/splatoon3/FOT-KurokaneStd-EB.otf",
      "start": 47129923,
      "end": 49259815
    }, {
      "filename": "/assets/fonts/splatoon3/FOT-RowdyStd-EB.otf",
      "start": 49259815,
      "end": 51651275
    }, {
      "filename": "/assets/fonts/splatoon3/NinSplatoonSdodrNumber-Reg.otf",
      "start": 51651275,
      "end": 51659075
    }, {
      "filename": "/assets/fonts/splatoon3/NinSplatoonSdodrNumber-Reg.ttf",
      "start": 51659075,
      "end": 51666875
    }, {
      "filename": "/assets/fonts/splatoon3/SpAlterna-Regular.otf",
      "start": 51666875,
      "end": 51677607
    }, {
      "filename": "/assets/fonts/splatoon3/nintendoP_DotGothic12-M.otf",
      "start": 51677607,
      "end": 53400719
    }, {
      "filename": "/assets/out/Masayoshi Takanaka - DISCO “B”.mp3",
      "start": 53400719,
      "end": 59917634,
      "audio": 1
    }, {
      "filename": "/assets/out/diva_assets/Arcade - Hatsune Miku Project DIVA Arcade - Results Screen Version B.png",
      "start": 59917634,
      "end": 65242075
    }, {
      "filename": "/assets/out/diva_assets/PlayStation 3 - Hatsune Miku Project DIVA Dreamy Theater - Project DIVA Arcade Leftovers.png",
      "start": 65242075,
      "end": 65333651
    }, {
      "filename": "/assets/out/diva_assets/PlayStation 3 - Hatsune Miku Project DIVA Dreamy Theater - Rhythm Game.png",
      "start": 65333651,
      "end": 66142588
    }, {
      "filename": "/assets/out/diva_assets/PlayStation 3 - Hatsune Miku Project DIVA F - Notes.png",
      "start": 66142588,
      "end": 66365019
    }, {
      "filename": "/assets/out/diva_assets/PlayStation 3 - Hatsune Miku Project DIVA F - Timing Indicators.png",
      "start": 66365019,
      "end": 66453126
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/BG_F.png",
      "start": 66453126,
      "end": 66775416
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/BG_FT.png",
      "start": 66775416,
      "end": 67138064
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/BG_T.png",
      "start": 67138064,
      "end": 67457770
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/COL_BLACK.png",
      "start": 67457770,
      "end": 67457918
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/DOWNLOAD.png",
      "start": 67457918,
      "end": 67462423
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/FT_WIN_L_SIDE.png",
      "start": 67462423,
      "end": 67489456
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/FT_WIN_L_TOP.png",
      "start": 67489456,
      "end": 67500708
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/FT_WIN_M.png",
      "start": 67500708,
      "end": 67520634
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/FT_WIN_S.png",
      "start": 67520634,
      "end": 67524479
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/F_WIN_L_SIDE.png",
      "start": 67524479,
      "end": 67548656
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/F_WIN_L_TOP.png",
      "start": 67548656,
      "end": 67560270
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/F_WIN_M.png",
      "start": 67560270,
      "end": 67578251
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/F_WIN_S.png",
      "start": 67578251,
      "end": 67582296
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/HEADER_LITE.png",
      "start": 67582296,
      "end": 67591929
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/HELP_01_FOOTER.png",
      "start": 67591929,
      "end": 67598334
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/HELP_02_FOOTER.png",
      "start": 67598334,
      "end": 67602877
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/HELP_M01_FOOTER.png",
      "start": 67602877,
      "end": 67608128
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/HELP_M02_FOOTER.png",
      "start": 67608128,
      "end": 67611003
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/HELP_NUM36X36.png",
      "start": 67611003,
      "end": 67613569
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/NUM_ARROW_L.png",
      "start": 67613569,
      "end": 67614478
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/NUM_ARROW_M.png",
      "start": 67614478,
      "end": 67615049
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/NUM_L_SLASH.png",
      "start": 67615049,
      "end": 67615599
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/NUM_M_SLASH.png",
      "start": 67615599,
      "end": 67615994
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/RIGHTS_ARR.png",
      "start": 67615994,
      "end": 67616722
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/RIGHTS_BG00.png",
      "start": 67616722,
      "end": 67617025
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/RIGHTS_BG01.png",
      "start": 67617025,
      "end": 67618479
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/RIGHTS_BG02.png",
      "start": 67618479,
      "end": 67619794
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/RIGHTS_GUI.png",
      "start": 67619794,
      "end": 67620872
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/RIGHTS_LYR.png",
      "start": 67620872,
      "end": 67621490
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/RIGHTS_MAN.png",
      "start": 67621490,
      "end": 67622513
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/RIGHTS_MUS.png",
      "start": 67622513,
      "end": 67623160
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/RIGHTS_PV.png",
      "start": 67623160,
      "end": 67623631
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/SAVE_ARW.png",
      "start": 67623631,
      "end": 67624151
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/SAVE_BASE.png",
      "start": 67624151,
      "end": 67624654
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/SAVE_TXT.png",
      "start": 67624654,
      "end": 67626814
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/SONG_JK_DUMMY.png",
      "start": 67626814,
      "end": 67633866
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/START_BASE.png",
      "start": 67633866,
      "end": 67639930
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/START_BASE_EFF.png",
      "start": 67639930,
      "end": 67644991
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/START_CTRL_TXT.png",
      "start": 67644991,
      "end": 67658943
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/START_GAME_TXT.png",
      "start": 67658943,
      "end": 67668207
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/START_PRAC_TXT.png",
      "start": 67668207,
      "end": 67677248
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/START_PV_TXT.png",
      "start": 67677248,
      "end": 67685836
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/START_SUR_TXT.png",
      "start": 67685836,
      "end": 67695414
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/TXT_A.png",
      "start": 67695414,
      "end": 67698162
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/TXT_D.png",
      "start": 67698162,
      "end": 67699481
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/TXT_DOT.png",
      "start": 67699481,
      "end": 67699931
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/TXT_G.png",
      "start": 67699931,
      "end": 67701133
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/TXT_I.png",
      "start": 67701133,
      "end": 67701978
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/TXT_L.png",
      "start": 67701978,
      "end": 67702963
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/TXT_N.png",
      "start": 67702963,
      "end": 67704787
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/TXT_O.png",
      "start": 67704787,
      "end": 67705825
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/TXT_W.png",
      "start": 67705825,
      "end": 67707203
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/T_WIN_L_SIDE.png",
      "start": 67707203,
      "end": 67731674
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/T_WIN_L_TOP.png",
      "start": 67731674,
      "end": 67743174
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/T_WIN_M.png",
      "start": 67743174,
      "end": 67762e3
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/T_WIN_S.png",
      "start": 67762e3,
      "end": 67765987
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_GAME01.png",
      "start": 67765987,
      "end": 67983856
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_GAME02.png",
      "start": 67983856,
      "end": 68061146
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_GAME03.png",
      "start": 68061146,
      "end": 68083160
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_ITEM01.png",
      "start": 68083160,
      "end": 68577902
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_ITEM02.png",
      "start": 68577902,
      "end": 68884544
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_ITEM03.png",
      "start": 68884544,
      "end": 69133626
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_MENU01.png",
      "start": 69133626,
      "end": 69582530
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_MENU02.png",
      "start": 69582530,
      "end": 69603594
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_RHYTHM01.png",
      "start": 69603594,
      "end": 69853964
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_RHYTHM02.png",
      "start": 69853964,
      "end": 70028228
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_RHYTHM03.png",
      "start": 70028228,
      "end": 70058610
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_CUSTOM_RHYTHM04.png",
      "start": 70058610,
      "end": 70082644
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_GALLERY_MENU01.png",
      "start": 70082644,
      "end": 70101197
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_GALLERY_MENU02.png",
      "start": 70101197,
      "end": 70120069
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_GALLERY_RANKING01.png",
      "start": 70120069,
      "end": 70342832
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_GALLERY_RANKING02.png",
      "start": 70342832,
      "end": 70362156
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_GALLERY_RANKING03.png",
      "start": 70362156,
      "end": 70381502
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_GALLERY_RECORD01.png",
      "start": 70381502,
      "end": 70531347
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_GALLERY_RECORD02.png",
      "start": 70531347,
      "end": 70734870
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_GALLERY_RECORD03.png",
      "start": 70734870,
      "end": 70861127
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_GALLERY_THEATER01.png",
      "start": 70861127,
      "end": 70883154
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_MENU_GAME01.png",
      "start": 70883154,
      "end": 71223283
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_MENU_GAME02.png",
      "start": 71223283,
      "end": 71442044
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_MENU_GAME03.png",
      "start": 71442044,
      "end": 71650304
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_MENU_START01.png",
      "start": 71650304,
      "end": 72096531
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_MENU_START02.png",
      "start": 72096531,
      "end": 72549164
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_MENU_START03.png",
      "start": 72549164,
      "end": 72569373
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_MENU_SURVIVAL01.png",
      "start": 72569373,
      "end": 72738452
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_MENU_SURVIVAL02.png",
      "start": 72738452,
      "end": 72754800
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_MENU_SURVIVAL03.png",
      "start": 72754800,
      "end": 72772579
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_OPTION_MENU01.png",
      "start": 72772579,
      "end": 72931502
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_OPTION_MENU02.png",
      "start": 72931502,
      "end": 73249127
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_OPTION_MENU03.png",
      "start": 73249127,
      "end": 73268914
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_PLAYLIST_MENU01.png",
      "start": 73268914,
      "end": 73491344
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_PLAYLIST_MENU02.png",
      "start": 73491344,
      "end": 73728602
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_IMG_PLAYLIST_MENU03.png",
      "start": 73728602,
      "end": 73747099
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_CUSTOM_GAME.png",
      "start": 73747099,
      "end": 73751152
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_CUSTOM_ITEM.png",
      "start": 73751152,
      "end": 73759426
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_CUSTOM_MENU.png",
      "start": 73759426,
      "end": 73762957
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_CUSTOM_RHYTHM.png",
      "start": 73762957,
      "end": 73765999
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_CUSTOM_SOUND.png",
      "start": 73765999,
      "end": 73769769
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_GALLERY_MENU.png",
      "start": 73769769,
      "end": 73772293
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_GALLERY_RANKING.png",
      "start": 73772293,
      "end": 73775049
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_GALLERY_RECORD.png",
      "start": 73775049,
      "end": 73777054
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_GALLERY_THEATER.png",
      "start": 73777054,
      "end": 73781153
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_MENU_GAME.png",
      "start": 73781153,
      "end": 73784833
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_MENU_MENU.png",
      "start": 73784833,
      "end": 73787606
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_MENU_START.png",
      "start": 73787606,
      "end": 73791089
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_MENU_SURVIVAL.png",
      "start": 73791089,
      "end": 73794473
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_OPTION_MENU.png",
      "start": 73794473,
      "end": 73797358
    }, {
      "filename": "/assets/out/diva_assets/spr_ps4_cmn/WIN_TIT_PLAYLIST_MENU.png",
      "start": 73797358,
      "end": 73801533
    }, {
      "filename": "/assets/out/megamixnotes.txt",
      "start": 73801533,
      "end": 73801893
    }, {
      "filename": "/assets/out/summerinternship.txt",
      "start": 73801893,
      "end": 73802716
    }, {
      "filename": "/assets/out/terms.txt",
      "start": 73802716,
      "end": 73803122
    }, {
      "filename": "/assets/sfx/click.wav",
      "start": 73803122,
      "end": 73825254,
      "audio": 1
    }, {
      "filename": "/assets/sfx/note.wav",
      "start": 73825254,
      "end": 73847386,
      "audio": 1
    }, {
      "filename": "/assets/shaders/chess.frag",
      "start": 73847386,
      "end": 73847895
    }, {
      "filename": "/assets/shaders/cube.frag",
      "start": 73847895,
      "end": 73847992
    }, {
      "filename": "/assets/shaders/cube.vert",
      "start": 73847992,
      "end": 73848141
    }, {
      "filename": "/assets/shaders/lygiatest.frag",
      "start": 73848141,
      "end": 73849194
    }, {
      "filename": "/assets/shaders/march.frag",
      "start": 73849194,
      "end": 73853731
    }, {
      "filename": "/assets/shaders/march.vert",
      "start": 73853731,
      "end": 73853999
    }, {
      "filename": "/assets/shaders/msdf.frag",
      "start": 73853999,
      "end": 73854492
    }, {
      "filename": "/assets/shaders/msdf.vert",
      "start": 73854492,
      "end": 73854784
    }, {
      "filename": "/assets/shaders/shaderprogram.vert",
      "start": 73854784,
      "end": 73855170
    }, {
      "filename": "/assets/shaders/shaderprogram_texture.frag",
      "start": 73855170,
      "end": 73855370
    }, {
      "filename": "/assets/shaders/solidcolor.frag",
      "start": 73855370,
      "end": 73855475
    }, {
      "filename": "/assets/shaders/triangle.frag",
      "start": 73855475,
      "end": 73856325
    }, {
      "filename": "/assets/shaders/triangle.vert",
      "start": 73856325,
      "end": 73856710
    }, {
      "filename": "/assets/shaders/triangle_christmas.frag",
      "start": 73856710,
      "end": 73857302
    }, {
      "filename": "/assets/shaders/triangle_hexagon.frag",
      "start": 73857302,
      "end": 73858378
    }, {
      "filename": "/assets/textures/pkmn_font.png",
      "start": 73858378,
      "end": 73924321
    }, {
      "filename": "/assets/tracks/hi-posi.json",
      "start": 73924321,
      "end": 73933516
    }, {
      "filename": "/assets/tracks/hi-posi.mp3",
      "start": 73933516,
      "end": 79185087,
      "audio": 1
    }, {
      "filename": "/assets/tracks/kaede.json",
      "start": 79185087,
      "end": 79187521
    }, {
      "filename": "/assets/tracks/kaede.mp3",
      "start": 79187521,
      "end": 83291853,
      "audio": 1
    }, {
      "filename": "/assets/tracks/lamp.json",
      "start": 83291853,
      "end": 83305782
    }, {
      "filename": "/assets/tracks/lamp.mp3",
      "start": 83305782,
      "end": 86599070,
      "audio": 1
    }, {
      "filename": "/assets/tracks/mid-air thief.json",
      "start": 86599070,
      "end": 86610964
    }, {
      "filename": "/assets/tracks/mid-air thief.mp3",
      "start": 86610964,
      "end": 91609596,
      "audio": 1
    }, {
      "filename": "/vendored/lygia/.git",
      "start": 91609596,
      "end": 91609638
    }, {
      "filename": "/vendored/lygia/.github/FUNDING.yml",
      "start": 91609638,
      "end": 91610294
    }, {
      "filename": "/vendored/lygia/.gitignore",
      "start": 91610294,
      "end": 91610349
    }, {
      "filename": "/vendored/lygia/CONTRIBUTE.md",
      "start": 91610349,
      "end": 91611241
    }, {
      "filename": "/vendored/lygia/DESIGN.md",
      "start": 91611241,
      "end": 91615343
    }, {
      "filename": "/vendored/lygia/EXAMPLES.md",
      "start": 91615343,
      "end": 91617730
    }, {
      "filename": "/vendored/lygia/LICENSE.md",
      "start": 91617730,
      "end": 91620826
    }, {
      "filename": "/vendored/lygia/README.md",
      "start": 91620826,
      "end": 91636054
    }, {
      "filename": "/vendored/lygia/README_GLSL.md",
      "start": 91636054,
      "end": 91638062
    }, {
      "filename": "/vendored/lygia/README_METAL.md",
      "start": 91638062,
      "end": 91640259
    }, {
      "filename": "/vendored/lygia/animation/easing.glsl",
      "start": 91640259,
      "end": 91640657
    }, {
      "filename": "/vendored/lygia/animation/easing.hlsl",
      "start": 91640657,
      "end": 91641055
    }, {
      "filename": "/vendored/lygia/animation/easing.wgsl",
      "start": 91641055,
      "end": 91641453
    }, {
      "filename": "/vendored/lygia/animation/easing/back.glsl",
      "start": 91641453,
      "end": 91641806
    }, {
      "filename": "/vendored/lygia/animation/easing/back.hlsl",
      "start": 91641806,
      "end": 91642480
    }, {
      "filename": "/vendored/lygia/animation/easing/back.wgsl",
      "start": 91642480,
      "end": 91642834
    }, {
      "filename": "/vendored/lygia/animation/easing/backIn.glsl",
      "start": 91642834,
      "end": 91643250
    }, {
      "filename": "/vendored/lygia/animation/easing/backIn.wgsl",
      "start": 91643250,
      "end": 91643621
    }, {
      "filename": "/vendored/lygia/animation/easing/backInOut.glsl",
      "start": 91643621,
      "end": 91644176
    }, {
      "filename": "/vendored/lygia/animation/easing/backInOut.wgsl",
      "start": 91644176,
      "end": 91644634
    }, {
      "filename": "/vendored/lygia/animation/easing/backOut.glsl",
      "start": 91644634,
      "end": 91645036
    }, {
      "filename": "/vendored/lygia/animation/easing/backOut.wgsl",
      "start": 91645036,
      "end": 91645392
    }, {
      "filename": "/vendored/lygia/animation/easing/bounce.glsl",
      "start": 91645392,
      "end": 91645870
    }, {
      "filename": "/vendored/lygia/animation/easing/bounce.hlsl",
      "start": 91645870,
      "end": 91646927
    }, {
      "filename": "/vendored/lygia/animation/easing/bounce.wgsl",
      "start": 91646927,
      "end": 91647360
    }, {
      "filename": "/vendored/lygia/animation/easing/bounceIn.glsl",
      "start": 91647360,
      "end": 91647790
    }, {
      "filename": "/vendored/lygia/animation/easing/bounceIn.wgsl",
      "start": 91647790,
      "end": 91648167
    }, {
      "filename": "/vendored/lygia/animation/easing/bounceInOut.glsl",
      "start": 91648167,
      "end": 91648695
    }, {
      "filename": "/vendored/lygia/animation/easing/bounceInOut.wgsl",
      "start": 91648695,
      "end": 91649169
    }, {
      "filename": "/vendored/lygia/animation/easing/bounceOut.glsl",
      "start": 91649169,
      "end": 91650021
    }, {
      "filename": "/vendored/lygia/animation/easing/bounceOut.wgsl",
      "start": 91650021,
      "end": 91650777
    }, {
      "filename": "/vendored/lygia/animation/easing/circular.glsl",
      "start": 91650777,
      "end": 91651150
    }, {
      "filename": "/vendored/lygia/animation/easing/circular.hlsl",
      "start": 91651150,
      "end": 91651794
    }, {
      "filename": "/vendored/lygia/animation/easing/circular.wgsl",
      "start": 91651794,
      "end": 91652166
    }, {
      "filename": "/vendored/lygia/animation/easing/circularIn.glsl",
      "start": 91652166,
      "end": 91652563
    }, {
      "filename": "/vendored/lygia/animation/easing/circularIn.wgsl",
      "start": 91652563,
      "end": 91652906
    }, {
      "filename": "/vendored/lygia/animation/easing/circularInOut.glsl",
      "start": 91652906,
      "end": 91653420
    }, {
      "filename": "/vendored/lygia/animation/easing/circularInOut.wgsl",
      "start": 91653420,
      "end": 91653877
    }, {
      "filename": "/vendored/lygia/animation/easing/circularOut.glsl",
      "start": 91653877,
      "end": 91654275
    }, {
      "filename": "/vendored/lygia/animation/easing/circularOut.wgsl",
      "start": 91654275,
      "end": 91654617
    }, {
      "filename": "/vendored/lygia/animation/easing/cubic.glsl",
      "start": 91654617,
      "end": 91654975
    }, {
      "filename": "/vendored/lygia/animation/easing/cubic.hlsl",
      "start": 91654975,
      "end": 91655555
    }, {
      "filename": "/vendored/lygia/animation/easing/cubic.wgsl",
      "start": 91655555,
      "end": 91655912
    }, {
      "filename": "/vendored/lygia/animation/easing/cubicIn.glsl",
      "start": 91655912,
      "end": 91656280
    }, {
      "filename": "/vendored/lygia/animation/easing/cubicIn.wgsl",
      "start": 91656280,
      "end": 91656600
    }, {
      "filename": "/vendored/lygia/animation/easing/cubicInOut.glsl",
      "start": 91656600,
      "end": 91657055
    }, {
      "filename": "/vendored/lygia/animation/easing/cubicInOut.wgsl",
      "start": 91657055,
      "end": 91657463
    }, {
      "filename": "/vendored/lygia/animation/easing/cubicOut.glsl",
      "start": 91657463,
      "end": 91657871
    }, {
      "filename": "/vendored/lygia/animation/easing/cubicOut.wgsl",
      "start": 91657871,
      "end": 91658225
    }, {
      "filename": "/vendored/lygia/animation/easing/elastic.glsl",
      "start": 91658225,
      "end": 91658593
    }, {
      "filename": "/vendored/lygia/animation/easing/elastic.hlsl",
      "start": 91658593,
      "end": 91659410
    }, {
      "filename": "/vendored/lygia/animation/easing/elastic.wgsl",
      "start": 91659410,
      "end": 91659777
    }, {
      "filename": "/vendored/lygia/animation/easing/elasticIn.glsl",
      "start": 91659777,
      "end": 91660232
    }, {
      "filename": "/vendored/lygia/animation/easing/elasticIn.wgsl",
      "start": 91660232,
      "end": 91660635
    }, {
      "filename": "/vendored/lygia/animation/easing/elasticInOut.glsl",
      "start": 91660635,
      "end": 91661253
    }, {
      "filename": "/vendored/lygia/animation/easing/elasticInOut.wgsl",
      "start": 91661253,
      "end": 91661815
    }, {
      "filename": "/vendored/lygia/animation/easing/elasticOut.glsl",
      "start": 91661815,
      "end": 91662284
    }, {
      "filename": "/vendored/lygia/animation/easing/elasticOut.wgsl",
      "start": 91662284,
      "end": 91662698
    }, {
      "filename": "/vendored/lygia/animation/easing/exponential.glsl",
      "start": 91662698,
      "end": 91663086
    }, {
      "filename": "/vendored/lygia/animation/easing/exponential.hlsl",
      "start": 91663086,
      "end": 91663840
    }, {
      "filename": "/vendored/lygia/animation/easing/exponential.wgsl",
      "start": 91663840,
      "end": 91664227
    }, {
      "filename": "/vendored/lygia/animation/easing/exponentialIn.glsl",
      "start": 91664227,
      "end": 91664657
    }, {
      "filename": "/vendored/lygia/animation/easing/exponentialIn.wgsl",
      "start": 91664657,
      "end": 91665051
    }, {
      "filename": "/vendored/lygia/animation/easing/exponentialInOut.glsl",
      "start": 91665051,
      "end": 91665614
    }, {
      "filename": "/vendored/lygia/animation/easing/exponentialInOut.wgsl",
      "start": 91665614,
      "end": 91666120
    }, {
      "filename": "/vendored/lygia/animation/easing/exponentialOut.glsl",
      "start": 91666120,
      "end": 91666554
    }, {
      "filename": "/vendored/lygia/animation/easing/exponentialOut.wgsl",
      "start": 91666554,
      "end": 91666950
    }, {
      "filename": "/vendored/lygia/animation/easing/linear.glsl",
      "start": 91666950,
      "end": 91667299
    }, {
      "filename": "/vendored/lygia/animation/easing/linear.hlsl",
      "start": 91667299,
      "end": 91667643
    }, {
      "filename": "/vendored/lygia/animation/easing/linear.wgsl",
      "start": 91667643,
      "end": 91667991
    }, {
      "filename": "/vendored/lygia/animation/easing/linearIn.glsl",
      "start": 91667991,
      "end": 91668354
    }, {
      "filename": "/vendored/lygia/animation/easing/linearIn.wgsl",
      "start": 91668354,
      "end": 91668666
    }, {
      "filename": "/vendored/lygia/animation/easing/linearInOut.glsl",
      "start": 91668666,
      "end": 91669041
    }, {
      "filename": "/vendored/lygia/animation/easing/linearInOut.wgsl",
      "start": 91669041,
      "end": 91669359
    }, {
      "filename": "/vendored/lygia/animation/easing/linearOut.glsl",
      "start": 91669359,
      "end": 91669726
    }, {
      "filename": "/vendored/lygia/animation/easing/linearOut.wgsl",
      "start": 91669726,
      "end": 91670042
    }, {
      "filename": "/vendored/lygia/animation/easing/quadratic.glsl",
      "start": 91670042,
      "end": 91670419
    }, {
      "filename": "/vendored/lygia/animation/easing/quadratic.hlsl",
      "start": 91670419,
      "end": 91670996
    }, {
      "filename": "/vendored/lygia/animation/easing/quadratic.wgsl",
      "start": 91670996,
      "end": 91671372
    }, {
      "filename": "/vendored/lygia/animation/easing/quadraticIn.glsl",
      "start": 91671372,
      "end": 91671756
    }, {
      "filename": "/vendored/lygia/animation/easing/quadraticIn.wgsl",
      "start": 91671756,
      "end": 91672083
    }, {
      "filename": "/vendored/lygia/animation/easing/quadraticInOut.glsl",
      "start": 91672083,
      "end": 91672543
    }, {
      "filename": "/vendored/lygia/animation/easing/quadraticInOut.wgsl",
      "start": 91672543,
      "end": 91672940
    }, {
      "filename": "/vendored/lygia/animation/easing/quadraticOut.glsl",
      "start": 91672940,
      "end": 91673337
    }, {
      "filename": "/vendored/lygia/animation/easing/quadraticOut.wgsl",
      "start": 91673337,
      "end": 91673676
    }, {
      "filename": "/vendored/lygia/animation/easing/quartic.glsl",
      "start": 91673676,
      "end": 91674044
    }, {
      "filename": "/vendored/lygia/animation/easing/quartic.hlsl",
      "start": 91674044,
      "end": 91674639
    }, {
      "filename": "/vendored/lygia/animation/easing/quartic.wgsl",
      "start": 91674639,
      "end": 91675006
    }, {
      "filename": "/vendored/lygia/animation/easing/quarticIn.glsl",
      "start": 91675006,
      "end": 91675386
    }, {
      "filename": "/vendored/lygia/animation/easing/quarticIn.wgsl",
      "start": 91675386,
      "end": 91675714
    }, {
      "filename": "/vendored/lygia/animation/easing/quarticInOut.glsl",
      "start": 91675714,
      "end": 91676176
    }, {
      "filename": "/vendored/lygia/animation/easing/quarticInOut.wgsl",
      "start": 91676176,
      "end": 91676587
    }, {
      "filename": "/vendored/lygia/animation/easing/quarticOut.glsl",
      "start": 91676587,
      "end": 91677020
    }, {
      "filename": "/vendored/lygia/animation/easing/quarticOut.wgsl",
      "start": 91677020,
      "end": 91677393
    }, {
      "filename": "/vendored/lygia/animation/easing/quintic.glsl",
      "start": 91677393,
      "end": 91677762
    }, {
      "filename": "/vendored/lygia/animation/easing/quintic.hlsl",
      "start": 91677762,
      "end": 91678358
    }, {
      "filename": "/vendored/lygia/animation/easing/quintic.wgsl",
      "start": 91678358,
      "end": 91678725
    }, {
      "filename": "/vendored/lygia/animation/easing/quinticIn.glsl",
      "start": 91678725,
      "end": 91679106
    }, {
      "filename": "/vendored/lygia/animation/easing/quinticIn.wgsl",
      "start": 91679106,
      "end": 91679434
    }, {
      "filename": "/vendored/lygia/animation/easing/quinticInOut.glsl",
      "start": 91679434,
      "end": 91679908
    }, {
      "filename": "/vendored/lygia/animation/easing/quinticInOut.wgsl",
      "start": 91679908,
      "end": 91680326
    }, {
      "filename": "/vendored/lygia/animation/easing/quinticOut.glsl",
      "start": 91680326,
      "end": 91680725
    }, {
      "filename": "/vendored/lygia/animation/easing/quinticOut.wgsl",
      "start": 91680725,
      "end": 91681070
    }, {
      "filename": "/vendored/lygia/animation/easing/sine.glsl",
      "start": 91681070,
      "end": 91681458
    }, {
      "filename": "/vendored/lygia/animation/easing/sine.hlsl",
      "start": 91681458,
      "end": 91682007
    }, {
      "filename": "/vendored/lygia/animation/easing/sine.wgsl",
      "start": 91682007,
      "end": 91682359
    }, {
      "filename": "/vendored/lygia/animation/easing/sineIn.glsl",
      "start": 91682359,
      "end": 91682777
    }, {
      "filename": "/vendored/lygia/animation/easing/sineIn.wgsl",
      "start": 91682777,
      "end": 91683149
    }, {
      "filename": "/vendored/lygia/animation/easing/sineInOut.glsl",
      "start": 91683149,
      "end": 91683580
    }, {
      "filename": "/vendored/lygia/animation/easing/sineInOut.wgsl",
      "start": 91683580,
      "end": 91683958
    }, {
      "filename": "/vendored/lygia/animation/easing/sineOut.glsl",
      "start": 91683958,
      "end": 91684367
    }, {
      "filename": "/vendored/lygia/animation/easing/sineOut.wgsl",
      "start": 91684367,
      "end": 91684728
    }, {
      "filename": "/vendored/lygia/animation/spriteLoop.glsl",
      "start": 91684728,
      "end": 91685605
    }, {
      "filename": "/vendored/lygia/animation/spriteLoop.hlsl",
      "start": 91685605,
      "end": 91686473
    }, {
      "filename": "/vendored/lygia/animation/spriteLoop.wgsl",
      "start": 91686473,
      "end": 91687222
    }, {
      "filename": "/vendored/lygia/color/blend.glsl",
      "start": 91687222,
      "end": 91688085
    }, {
      "filename": "/vendored/lygia/color/blend.hlsl",
      "start": 91688085,
      "end": 91688948
    }, {
      "filename": "/vendored/lygia/color/blend.msl",
      "start": 91688948,
      "end": 91689783
    }, {
      "filename": "/vendored/lygia/color/blend.wgsl",
      "start": 91689783,
      "end": 91690646
    }, {
      "filename": "/vendored/lygia/color/blend/add.glsl",
      "start": 91690646,
      "end": 91691306
    }, {
      "filename": "/vendored/lygia/color/blend/add.hlsl",
      "start": 91691306,
      "end": 91692004
    }, {
      "filename": "/vendored/lygia/color/blend/add.msl",
      "start": 91692004,
      "end": 91692664
    }, {
      "filename": "/vendored/lygia/color/blend/add.wesl",
      "start": 91692664,
      "end": 91693296
    }, {
      "filename": "/vendored/lygia/color/blend/add.wgsl",
      "start": 91693296,
      "end": 91693928
    }, {
      "filename": "/vendored/lygia/color/blend/average.glsl",
      "start": 91693928,
      "end": 91694610
    }, {
      "filename": "/vendored/lygia/color/blend/average.hlsl",
      "start": 91694610,
      "end": 91695320
    }, {
      "filename": "/vendored/lygia/color/blend/average.msl",
      "start": 91695320,
      "end": 91696e3
    }, {
      "filename": "/vendored/lygia/color/blend/average.wesl",
      "start": 91696e3,
      "end": 91696648
    }, {
      "filename": "/vendored/lygia/color/blend/average.wgsl",
      "start": 91696648,
      "end": 91697296
    }, {
      "filename": "/vendored/lygia/color/blend/color.glsl",
      "start": 91697296,
      "end": 91698043
    }, {
      "filename": "/vendored/lygia/color/blend/color.hlsl",
      "start": 91698043,
      "end": 91698807
    }, {
      "filename": "/vendored/lygia/color/blend/color.msl",
      "start": 91698807,
      "end": 91699566
    }, {
      "filename": "/vendored/lygia/color/blend/color.wesl",
      "start": 91699566,
      "end": 91700270
    }, {
      "filename": "/vendored/lygia/color/blend/color.wgsl",
      "start": 91700270,
      "end": 91700981
    }, {
      "filename": "/vendored/lygia/color/blend/colorBurn.glsl",
      "start": 91700981,
      "end": 91701843
    }, {
      "filename": "/vendored/lygia/color/blend/colorBurn.hlsl",
      "start": 91701843,
      "end": 91702742
    }, {
      "filename": "/vendored/lygia/color/blend/colorBurn.msl",
      "start": 91702742,
      "end": 91703601
    }, {
      "filename": "/vendored/lygia/color/blend/colorBurn.wesl",
      "start": 91703601,
      "end": 91704410
    }, {
      "filename": "/vendored/lygia/color/blend/colorBurn.wgsl",
      "start": 91704410,
      "end": 91705219
    }, {
      "filename": "/vendored/lygia/color/blend/colorDodge.glsl",
      "start": 91705219,
      "end": 91706084
    }, {
      "filename": "/vendored/lygia/color/blend/colorDodge.hlsl",
      "start": 91706084,
      "end": 91706988
    }, {
      "filename": "/vendored/lygia/color/blend/colorDodge.msl",
      "start": 91706988,
      "end": 91707850
    }, {
      "filename": "/vendored/lygia/color/blend/colorDodge.wesl",
      "start": 91707850,
      "end": 91708658
    }, {
      "filename": "/vendored/lygia/color/blend/colorDodge.wgsl",
      "start": 91708658,
      "end": 91709466
    }, {
      "filename": "/vendored/lygia/color/blend/darken.glsl",
      "start": 91709466,
      "end": 91710250
    }, {
      "filename": "/vendored/lygia/color/blend/darken.hlsl",
      "start": 91710250,
      "end": 91711071
    }, {
      "filename": "/vendored/lygia/color/blend/darken.msl",
      "start": 91711071,
      "end": 91711852
    }, {
      "filename": "/vendored/lygia/color/blend/darken.wesl",
      "start": 91711852,
      "end": 91712580
    }, {
      "filename": "/vendored/lygia/color/blend/darken.wgsl",
      "start": 91712580,
      "end": 91713308
    }, {
      "filename": "/vendored/lygia/color/blend/difference.glsl",
      "start": 91713308,
      "end": 91714009
    }, {
      "filename": "/vendored/lygia/color/blend/difference.hlsl",
      "start": 91714009,
      "end": 91714738
    }, {
      "filename": "/vendored/lygia/color/blend/difference.msl",
      "start": 91714738,
      "end": 91715434
    }, {
      "filename": "/vendored/lygia/color/blend/difference.wesl",
      "start": 91715434,
      "end": 91716093
    }, {
      "filename": "/vendored/lygia/color/blend/difference.wgsl",
      "start": 91716093,
      "end": 91716752
    }, {
      "filename": "/vendored/lygia/color/blend/exclusion.glsl",
      "start": 91716752,
      "end": 91717479
    }, {
      "filename": "/vendored/lygia/color/blend/exclusion.hlsl",
      "start": 91717479,
      "end": 91718234
    }, {
      "filename": "/vendored/lygia/color/blend/exclusion.msl",
      "start": 91718234,
      "end": 91718956
    }, {
      "filename": "/vendored/lygia/color/blend/exclusion.wesl",
      "start": 91718956,
      "end": 91719641
    }, {
      "filename": "/vendored/lygia/color/blend/exclusion.wgsl",
      "start": 91719641,
      "end": 91720326
    }, {
      "filename": "/vendored/lygia/color/blend/glow.glsl",
      "start": 91720326,
      "end": 91721036
    }, {
      "filename": "/vendored/lygia/color/blend/glow.hlsl",
      "start": 91721036,
      "end": 91721762
    }, {
      "filename": "/vendored/lygia/color/blend/glow.msl",
      "start": 91721762,
      "end": 91722466
    }, {
      "filename": "/vendored/lygia/color/blend/glow.wesl",
      "start": 91722466,
      "end": 91723175
    }, {
      "filename": "/vendored/lygia/color/blend/glow.wgsl",
      "start": 91723175,
      "end": 91723840
    }, {
      "filename": "/vendored/lygia/color/blend/hardLight.glsl",
      "start": 91723840,
      "end": 91724590
    }, {
      "filename": "/vendored/lygia/color/blend/hardLight.hlsl",
      "start": 91724590,
      "end": 91725356
    }, {
      "filename": "/vendored/lygia/color/blend/hardLight.msl",
      "start": 91725356,
      "end": 91726100
    }, {
      "filename": "/vendored/lygia/color/blend/hardLight.wesl",
      "start": 91726100,
      "end": 91726821
    }, {
      "filename": "/vendored/lygia/color/blend/hardLight.wgsl",
      "start": 91726821,
      "end": 91727515
    }, {
      "filename": "/vendored/lygia/color/blend/hardMix.glsl",
      "start": 91727515,
      "end": 91728375
    }, {
      "filename": "/vendored/lygia/color/blend/hardMix.hlsl",
      "start": 91728375,
      "end": 91729264
    }, {
      "filename": "/vendored/lygia/color/blend/hardMix.msl",
      "start": 91729264,
      "end": 91730120
    }, {
      "filename": "/vendored/lygia/color/blend/hardMix.wesl",
      "start": 91730120,
      "end": 91730953
    }, {
      "filename": "/vendored/lygia/color/blend/hardMix.wgsl",
      "start": 91730953,
      "end": 91731755
    }, {
      "filename": "/vendored/lygia/color/blend/hue.glsl",
      "start": 91731755,
      "end": 91732487
    }, {
      "filename": "/vendored/lygia/color/blend/hue.hlsl",
      "start": 91732487,
      "end": 91733236
    }, {
      "filename": "/vendored/lygia/color/blend/hue.msl",
      "start": 91733236,
      "end": 91733979
    }, {
      "filename": "/vendored/lygia/color/blend/hue.wesl",
      "start": 91733979,
      "end": 91734671
    }, {
      "filename": "/vendored/lygia/color/blend/hue.wgsl",
      "start": 91734671,
      "end": 91735363
    }, {
      "filename": "/vendored/lygia/color/blend/lighten.glsl",
      "start": 91735363,
      "end": 91736167
    }, {
      "filename": "/vendored/lygia/color/blend/lighten.hlsl",
      "start": 91736167,
      "end": 91737e3
    }, {
      "filename": "/vendored/lygia/color/blend/lighten.msl",
      "start": 91737e3,
      "end": 91737801
    }, {
      "filename": "/vendored/lygia/color/blend/lighten.wesl",
      "start": 91737801,
      "end": 91738538
    }, {
      "filename": "/vendored/lygia/color/blend/lighten.wgsl",
      "start": 91738538,
      "end": 91739275
    }, {
      "filename": "/vendored/lygia/color/blend/linearBurn.glsl",
      "start": 91739275,
      "end": 91740122
    }, {
      "filename": "/vendored/lygia/color/blend/linearBurn.hlsl",
      "start": 91740122,
      "end": 91741005
    }, {
      "filename": "/vendored/lygia/color/blend/linearBurn.msl",
      "start": 91741005,
      "end": 91741851
    }, {
      "filename": "/vendored/lygia/color/blend/linearBurn.wesl",
      "start": 91741851,
      "end": 91742644
    }, {
      "filename": "/vendored/lygia/color/blend/linearBurn.wgsl",
      "start": 91742644,
      "end": 91743437
    }, {
      "filename": "/vendored/lygia/color/blend/linearDodge.glsl",
      "start": 91743437,
      "end": 91744266
    }, {
      "filename": "/vendored/lygia/color/blend/linearDodge.hlsl",
      "start": 91744266,
      "end": 91745121
    }, {
      "filename": "/vendored/lygia/color/blend/linearDodge.msl",
      "start": 91745121,
      "end": 91745947
    }, {
      "filename": "/vendored/lygia/color/blend/linearDodge.wesl",
      "start": 91745947,
      "end": 91746717
    }, {
      "filename": "/vendored/lygia/color/blend/linearDodge.wgsl",
      "start": 91746717,
      "end": 91747487
    }, {
      "filename": "/vendored/lygia/color/blend/linearLight.glsl",
      "start": 91747487,
      "end": 91748459
    }, {
      "filename": "/vendored/lygia/color/blend/linearLight.hlsl",
      "start": 91748459,
      "end": 91749449
    }, {
      "filename": "/vendored/lygia/color/blend/linearLight.msl",
      "start": 91749449,
      "end": 91750416
    }, {
      "filename": "/vendored/lygia/color/blend/linearLight.wesl",
      "start": 91750416,
      "end": 91751392
    }, {
      "filename": "/vendored/lygia/color/blend/linearLight.wgsl",
      "start": 91751392,
      "end": 91752306
    }, {
      "filename": "/vendored/lygia/color/blend/luminosity.glsl",
      "start": 91752306,
      "end": 91753087
    }, {
      "filename": "/vendored/lygia/color/blend/luminosity.hlsl",
      "start": 91753087,
      "end": 91753885
    }, {
      "filename": "/vendored/lygia/color/blend/luminosity.msl",
      "start": 91753885,
      "end": 91754677
    }, {
      "filename": "/vendored/lygia/color/blend/luminosity.wesl",
      "start": 91754677,
      "end": 91755404
    }, {
      "filename": "/vendored/lygia/color/blend/luminosity.wgsl",
      "start": 91755404,
      "end": 91756131
    }, {
      "filename": "/vendored/lygia/color/blend/multiply.glsl",
      "start": 91756131,
      "end": 91756819
    }, {
      "filename": "/vendored/lygia/color/blend/multiply.hlsl",
      "start": 91756819,
      "end": 91757523
    }, {
      "filename": "/vendored/lygia/color/blend/multiply.msl",
      "start": 91757523,
      "end": 91758209
    }, {
      "filename": "/vendored/lygia/color/blend/multiply.wesl",
      "start": 91758209,
      "end": 91758852
    }, {
      "filename": "/vendored/lygia/color/blend/multiply.wgsl",
      "start": 91758852,
      "end": 91759495
    }, {
      "filename": "/vendored/lygia/color/blend/negation.glsl",
      "start": 91759495,
      "end": 91760228
    }, {
      "filename": "/vendored/lygia/color/blend/negation.hlsl",
      "start": 91760228,
      "end": 91760997
    }, {
      "filename": "/vendored/lygia/color/blend/negation.msl",
      "start": 91760997,
      "end": 91761729
    }, {
      "filename": "/vendored/lygia/color/blend/negation.wesl",
      "start": 91761729,
      "end": 91762414
    }, {
      "filename": "/vendored/lygia/color/blend/negation.wgsl",
      "start": 91762414,
      "end": 91763099
    }, {
      "filename": "/vendored/lygia/color/blend/overlay.glsl",
      "start": 91763099,
      "end": 91763955
    }, {
      "filename": "/vendored/lygia/color/blend/overlay.hlsl",
      "start": 91763955,
      "end": 91764840
    }, {
      "filename": "/vendored/lygia/color/blend/overlay.msl",
      "start": 91764840,
      "end": 91765693
    }, {
      "filename": "/vendored/lygia/color/blend/overlay.wesl",
      "start": 91765693,
      "end": 91766550
    }, {
      "filename": "/vendored/lygia/color/blend/overlay.wgsl",
      "start": 91766550,
      "end": 91767407
    }, {
      "filename": "/vendored/lygia/color/blend/phoenix.glsl",
      "start": 91767407,
      "end": 91768152
    }, {
      "filename": "/vendored/lygia/color/blend/phoenix.hlsl",
      "start": 91768152,
      "end": 91768923
    }, {
      "filename": "/vendored/lygia/color/blend/phoenix.msl",
      "start": 91768923,
      "end": 91769665
    }, {
      "filename": "/vendored/lygia/color/blend/phoenix.wesl",
      "start": 91769665,
      "end": 91770360
    }, {
      "filename": "/vendored/lygia/color/blend/phoenix.wgsl",
      "start": 91770360,
      "end": 91771058
    }, {
      "filename": "/vendored/lygia/color/blend/pinLight.glsl",
      "start": 91771058,
      "end": 91771990
    }, {
      "filename": "/vendored/lygia/color/blend/pinLight.hlsl",
      "start": 91771990,
      "end": 91772957
    }, {
      "filename": "/vendored/lygia/color/blend/pinLight.msl",
      "start": 91772957,
      "end": 91773881
    }, {
      "filename": "/vendored/lygia/color/blend/pinLight.wesl",
      "start": 91773881,
      "end": 91774805
    }, {
      "filename": "/vendored/lygia/color/blend/pinLight.wgsl",
      "start": 91774805,
      "end": 91775676
    }, {
      "filename": "/vendored/lygia/color/blend/reflect.glsl",
      "start": 91775676,
      "end": 91776522
    }, {
      "filename": "/vendored/lygia/color/blend/reflect.hlsl",
      "start": 91776522,
      "end": 91777397
    }, {
      "filename": "/vendored/lygia/color/blend/reflect.msl",
      "start": 91777397,
      "end": 91778240
    }, {
      "filename": "/vendored/lygia/color/blend/reflect.wesl",
      "start": 91778240,
      "end": 91779027
    }, {
      "filename": "/vendored/lygia/color/blend/reflect.wgsl",
      "start": 91779027,
      "end": 91779814
    }, {
      "filename": "/vendored/lygia/color/blend/saturation.glsl",
      "start": 91779814,
      "end": 91780595
    }, {
      "filename": "/vendored/lygia/color/blend/saturation.hlsl",
      "start": 91780595,
      "end": 91781393
    }, {
      "filename": "/vendored/lygia/color/blend/saturation.msl",
      "start": 91781393,
      "end": 91782185
    }, {
      "filename": "/vendored/lygia/color/blend/saturation.wesl",
      "start": 91782185,
      "end": 91782912
    }, {
      "filename": "/vendored/lygia/color/blend/saturation.wgsl",
      "start": 91782912,
      "end": 91783639
    }, {
      "filename": "/vendored/lygia/color/blend/screen.glsl",
      "start": 91783639,
      "end": 91784446
    }, {
      "filename": "/vendored/lygia/color/blend/screen.hlsl",
      "start": 91784446,
      "end": 91785225
    }, {
      "filename": "/vendored/lygia/color/blend/screen.msl",
      "start": 91785225,
      "end": 91786032
    }, {
      "filename": "/vendored/lygia/color/blend/screen.wesl",
      "start": 91786032,
      "end": 91786803
    }, {
      "filename": "/vendored/lygia/color/blend/screen.wgsl",
      "start": 91786803,
      "end": 91787574
    }, {
      "filename": "/vendored/lygia/color/blend/softLight.glsl",
      "start": 91787574,
      "end": 91788718
    }, {
      "filename": "/vendored/lygia/color/blend/softLight.hlsl",
      "start": 91788718,
      "end": 91789984
    }, {
      "filename": "/vendored/lygia/color/blend/softLight.msl",
      "start": 91789984,
      "end": 91791127
    }, {
      "filename": "/vendored/lygia/color/blend/softLight.wesl",
      "start": 91791127,
      "end": 91792274
    }, {
      "filename": "/vendored/lygia/color/blend/softLight.wgsl",
      "start": 91792274,
      "end": 91793421
    }, {
      "filename": "/vendored/lygia/color/blend/subtract.glsl",
      "start": 91793421,
      "end": 91794154
    }, {
      "filename": "/vendored/lygia/color/blend/subtract.hlsl",
      "start": 91794154,
      "end": 91794923
    }, {
      "filename": "/vendored/lygia/color/blend/subtract.msl",
      "start": 91794923,
      "end": 91795655
    }, {
      "filename": "/vendored/lygia/color/blend/subtract.wesl",
      "start": 91795655,
      "end": 91796340
    }, {
      "filename": "/vendored/lygia/color/blend/subtract.wgsl",
      "start": 91796340,
      "end": 91797025
    }, {
      "filename": "/vendored/lygia/color/blend/vividLight.glsl",
      "start": 91797025,
      "end": 91798015
    }, {
      "filename": "/vendored/lygia/color/blend/vividLight.hlsl",
      "start": 91798015,
      "end": 91799010
    }, {
      "filename": "/vendored/lygia/color/blend/vividLight.msl",
      "start": 91799010,
      "end": 91799995
    }, {
      "filename": "/vendored/lygia/color/blend/vividLight.wesl",
      "start": 91799995,
      "end": 91800956
    }, {
      "filename": "/vendored/lygia/color/blend/vividLight.wgsl",
      "start": 91800956,
      "end": 91801857
    }, {
      "filename": "/vendored/lygia/color/brightnessContrast.glsl",
      "start": 91801857,
      "end": 91802740
    }, {
      "filename": "/vendored/lygia/color/brightnessContrast.hlsl",
      "start": 91802740,
      "end": 91803777
    }, {
      "filename": "/vendored/lygia/color/brightnessContrast.msl",
      "start": 91803777,
      "end": 91804323
    }, {
      "filename": "/vendored/lygia/color/brightnessContrast.wesl",
      "start": 91804323,
      "end": 91805153
    }, {
      "filename": "/vendored/lygia/color/brightnessContrast.wgsl",
      "start": 91805153,
      "end": 91805983
    }, {
      "filename": "/vendored/lygia/color/brightnessMatrix.glsl",
      "start": 91805983,
      "end": 91806727
    }, {
      "filename": "/vendored/lygia/color/brightnessMatrix.hlsl",
      "start": 91806727,
      "end": 91807511
    }, {
      "filename": "/vendored/lygia/color/brightnessMatrix.msl",
      "start": 91807511,
      "end": 91808125
    }, {
      "filename": "/vendored/lygia/color/composite.glsl",
      "start": 91808125,
      "end": 91808473
    }, {
      "filename": "/vendored/lygia/color/composite.hlsl",
      "start": 91808473,
      "end": 91808821
    }, {
      "filename": "/vendored/lygia/color/composite.msl",
      "start": 91808821,
      "end": 91809160
    }, {
      "filename": "/vendored/lygia/color/composite/compositeXor.glsl",
      "start": 91809160,
      "end": 91810081
    }, {
      "filename": "/vendored/lygia/color/composite/compositeXor.hlsl",
      "start": 91810081,
      "end": 91811015
    }, {
      "filename": "/vendored/lygia/color/composite/compositeXor.msl",
      "start": 91811015,
      "end": 91811950
    }, {
      "filename": "/vendored/lygia/color/composite/destinationAtop.glsl",
      "start": 91811950,
      "end": 91812955
    }, {
      "filename": "/vendored/lygia/color/composite/destinationAtop.hlsl",
      "start": 91812955,
      "end": 91813968
    }, {
      "filename": "/vendored/lygia/color/composite/destinationAtop.msl",
      "start": 91813968,
      "end": 91814982
    }, {
      "filename": "/vendored/lygia/color/composite/destinationIn.glsl",
      "start": 91814982,
      "end": 91815919
    }, {
      "filename": "/vendored/lygia/color/composite/destinationIn.hlsl",
      "start": 91815919,
      "end": 91816865
    }, {
      "filename": "/vendored/lygia/color/composite/destinationIn.msl",
      "start": 91816865,
      "end": 91817811
    }, {
      "filename": "/vendored/lygia/color/composite/destinationOut.glsl",
      "start": 91817811,
      "end": 91818774
    }, {
      "filename": "/vendored/lygia/color/composite/destinationOut.hlsl",
      "start": 91818774,
      "end": 91819745
    }, {
      "filename": "/vendored/lygia/color/composite/destinationOut.msl",
      "start": 91819745,
      "end": 91820716
    }, {
      "filename": "/vendored/lygia/color/composite/destinationOver.glsl",
      "start": 91820716,
      "end": 91821701
    }, {
      "filename": "/vendored/lygia/color/composite/destinationOver.hlsl",
      "start": 91821701,
      "end": 91822694
    }, {
      "filename": "/vendored/lygia/color/composite/destinationOver.msl",
      "start": 91822694,
      "end": 91823688
    }, {
      "filename": "/vendored/lygia/color/composite/sourceAtop.glsl",
      "start": 91823688,
      "end": 91824655
    }, {
      "filename": "/vendored/lygia/color/composite/sourceAtop.hlsl",
      "start": 91824655,
      "end": 91825630
    }, {
      "filename": "/vendored/lygia/color/composite/sourceAtop.msl",
      "start": 91825630,
      "end": 91826606
    }, {
      "filename": "/vendored/lygia/color/composite/sourceIn.glsl",
      "start": 91826606,
      "end": 91827506
    }, {
      "filename": "/vendored/lygia/color/composite/sourceIn.hlsl",
      "start": 91827506,
      "end": 91828414
    }, {
      "filename": "/vendored/lygia/color/composite/sourceIn.msl",
      "start": 91828414,
      "end": 91829323
    }, {
      "filename": "/vendored/lygia/color/composite/sourceOut.glsl",
      "start": 91829323,
      "end": 91830247
    }, {
      "filename": "/vendored/lygia/color/composite/sourceOut.hlsl",
      "start": 91830247,
      "end": 91831179
    }, {
      "filename": "/vendored/lygia/color/composite/sourceOut.msl",
      "start": 91831179,
      "end": 91832112
    }, {
      "filename": "/vendored/lygia/color/composite/sourceOver.glsl",
      "start": 91832112,
      "end": 91833090
    }, {
      "filename": "/vendored/lygia/color/composite/sourceOver.hlsl",
      "start": 91833090,
      "end": 91834076
    }, {
      "filename": "/vendored/lygia/color/composite/sourceOver.msl",
      "start": 91834076,
      "end": 91835062
    }, {
      "filename": "/vendored/lygia/color/contrast.glsl",
      "start": 91835062,
      "end": 91835709
    }, {
      "filename": "/vendored/lygia/color/contrast.hlsl",
      "start": 91835709,
      "end": 91836440
    }, {
      "filename": "/vendored/lygia/color/contrast.msl",
      "start": 91836440,
      "end": 91837087
    }, {
      "filename": "/vendored/lygia/color/contrastMatrix.glsl",
      "start": 91837087,
      "end": 91837844
    }, {
      "filename": "/vendored/lygia/color/contrastMatrix.hlsl",
      "start": 91837844,
      "end": 91838655
    }, {
      "filename": "/vendored/lygia/color/contrastMatrix.msl",
      "start": 91838655,
      "end": 91839282
    }, {
      "filename": "/vendored/lygia/color/daltonize.glsl",
      "start": 91839282,
      "end": 91845307
    }, {
      "filename": "/vendored/lygia/color/daltonize.hlsl",
      "start": 91845307,
      "end": 91851502
    }, {
      "filename": "/vendored/lygia/color/daltonize.msl",
      "start": 91851502,
      "end": 91857575
    }, {
      "filename": "/vendored/lygia/color/desaturate.glsl",
      "start": 91857575,
      "end": 91858184
    }, {
      "filename": "/vendored/lygia/color/desaturate.hlsl",
      "start": 91858184,
      "end": 91858879
    }, {
      "filename": "/vendored/lygia/color/desaturate.msl",
      "start": 91858879,
      "end": 91859494
    }, {
      "filename": "/vendored/lygia/color/distance.glsl",
      "start": 91859494,
      "end": 91861890
    }, {
      "filename": "/vendored/lygia/color/distance.hlsl",
      "start": 91861890,
      "end": 91864333
    }, {
      "filename": "/vendored/lygia/color/distance.msl",
      "start": 91864333,
      "end": 91866722
    }, {
      "filename": "/vendored/lygia/color/distance.wesl",
      "start": 91866722,
      "end": 91868830
    }, {
      "filename": "/vendored/lygia/color/distance.wgsl",
      "start": 91868830,
      "end": 91870937
    }, {
      "filename": "/vendored/lygia/color/dither.glsl",
      "start": 91870937,
      "end": 91872142
    }, {
      "filename": "/vendored/lygia/color/dither.hlsl",
      "start": 91872142,
      "end": 91873960
    }, {
      "filename": "/vendored/lygia/color/dither.msl",
      "start": 91873960,
      "end": 91875175
    }, {
      "filename": "/vendored/lygia/color/dither/bayer.glsl",
      "start": 91875175,
      "end": 91880433
    }, {
      "filename": "/vendored/lygia/color/dither/bayer.msl",
      "start": 91880433,
      "end": 91883517
    }, {
      "filename": "/vendored/lygia/color/dither/bayer.wesl",
      "start": 91883517,
      "end": 91885243
    }, {
      "filename": "/vendored/lygia/color/dither/bayer.wgsl",
      "start": 91885243,
      "end": 91886964
    }, {
      "filename": "/vendored/lygia/color/dither/blueNoise.glsl",
      "start": 91886964,
      "end": 91892290
    }, {
      "filename": "/vendored/lygia/color/dither/blueNoise.hlsl",
      "start": 91892290,
      "end": 91895200
    }, {
      "filename": "/vendored/lygia/color/dither/blueNoise.msl",
      "start": 91895200,
      "end": 91899776
    }, {
      "filename": "/vendored/lygia/color/dither/blueNoise.wesl",
      "start": 91899776,
      "end": 91901360
    }, {
      "filename": "/vendored/lygia/color/dither/blueNoise.wgsl",
      "start": 91901360,
      "end": 91902939
    }, {
      "filename": "/vendored/lygia/color/dither/interleavedGradientNoise.glsl",
      "start": 91902939,
      "end": 91906865
    }, {
      "filename": "/vendored/lygia/color/dither/interleavedGradientNoise.hlsl",
      "start": 91906865,
      "end": 91908600
    }, {
      "filename": "/vendored/lygia/color/dither/interleavedGradientNoise.msl",
      "start": 91908600,
      "end": 91911409
    }, {
      "filename": "/vendored/lygia/color/dither/shift.glsl",
      "start": 91911409,
      "end": 91915344
    }, {
      "filename": "/vendored/lygia/color/dither/shift.hlsl",
      "start": 91915344,
      "end": 91918062
    }, {
      "filename": "/vendored/lygia/color/dither/shift.msl",
      "start": 91918062,
      "end": 91921276
    }, {
      "filename": "/vendored/lygia/color/dither/triangleNoise.glsl",
      "start": 91921276,
      "end": 91924478
    }, {
      "filename": "/vendored/lygia/color/dither/triangleNoise.hlsl",
      "start": 91924478,
      "end": 91926880
    }, {
      "filename": "/vendored/lygia/color/dither/triangleNoise.msl",
      "start": 91926880,
      "end": 91930113
    }, {
      "filename": "/vendored/lygia/color/dither/vlachos.glsl",
      "start": 91930113,
      "end": 91932479
    }, {
      "filename": "/vendored/lygia/color/dither/vlachos.hlsl",
      "start": 91932479,
      "end": 91933991
    }, {
      "filename": "/vendored/lygia/color/dither/vlachos.msl",
      "start": 91933991,
      "end": 91936058
    }, {
      "filename": "/vendored/lygia/color/dither/vlachos.wesl",
      "start": 91936058,
      "end": 91937077
    }, {
      "filename": "/vendored/lygia/color/dither/vlachos.wgsl",
      "start": 91937077,
      "end": 91938091
    }, {
      "filename": "/vendored/lygia/color/exposure.glsl",
      "start": 91938091,
      "end": 91938697
    }, {
      "filename": "/vendored/lygia/color/exposure.hlsl",
      "start": 91938697,
      "end": 91939391
    }, {
      "filename": "/vendored/lygia/color/exposure.msl",
      "start": 91939391,
      "end": 91940011
    }, {
      "filename": "/vendored/lygia/color/exposure.wesl",
      "start": 91940011,
      "end": 91940519
    }, {
      "filename": "/vendored/lygia/color/exposure.wgsl",
      "start": 91940519,
      "end": 91941027
    }, {
      "filename": "/vendored/lygia/color/hueShift.glsl",
      "start": 91941027,
      "end": 91941894
    }, {
      "filename": "/vendored/lygia/color/hueShift.hlsl",
      "start": 91941894,
      "end": 91942771
    }, {
      "filename": "/vendored/lygia/color/hueShift.msl",
      "start": 91942771,
      "end": 91943646
    }, {
      "filename": "/vendored/lygia/color/hueShift.wesl",
      "start": 91943646,
      "end": 91944344
    }, {
      "filename": "/vendored/lygia/color/hueShift.wgsl",
      "start": 91944344,
      "end": 91945036
    }, {
      "filename": "/vendored/lygia/color/hueShiftRYB.glsl",
      "start": 91945036,
      "end": 91945987
    }, {
      "filename": "/vendored/lygia/color/hueShiftRYB.hlsl",
      "start": 91945987,
      "end": 91946954
    }, {
      "filename": "/vendored/lygia/color/hueShiftRYB.msl",
      "start": 91946954,
      "end": 91947909
    }, {
      "filename": "/vendored/lygia/color/hueShiftRYB.wesl",
      "start": 91947909,
      "end": 91948735
    }, {
      "filename": "/vendored/lygia/color/hueShiftRYB.wgsl",
      "start": 91948735,
      "end": 91949549
    }, {
      "filename": "/vendored/lygia/color/layer.glsl",
      "start": 91949549,
      "end": 91950692
    }, {
      "filename": "/vendored/lygia/color/layer.hlsl",
      "start": 91950692,
      "end": 91951835
    }, {
      "filename": "/vendored/lygia/color/layer.msl",
      "start": 91951835,
      "end": 91952950
    }, {
      "filename": "/vendored/lygia/color/layer/addSourceOver.glsl",
      "start": 91952950,
      "end": 91953922
    }, {
      "filename": "/vendored/lygia/color/layer/addSourceOver.hlsl",
      "start": 91953922,
      "end": 91954912
    }, {
      "filename": "/vendored/lygia/color/layer/addSourceOver.msl",
      "start": 91954912,
      "end": 91955872
    }, {
      "filename": "/vendored/lygia/color/layer/averageSourceOver.glsl",
      "start": 91955872,
      "end": 91956864
    }, {
      "filename": "/vendored/lygia/color/layer/averageSourceOver.hlsl",
      "start": 91956864,
      "end": 91957874
    }, {
      "filename": "/vendored/lygia/color/layer/averageSourceOver.msl",
      "start": 91957874,
      "end": 91958855
    }, {
      "filename": "/vendored/lygia/color/layer/colorBurnSourceOver.glsl",
      "start": 91958855,
      "end": 91959869
    }, {
      "filename": "/vendored/lygia/color/layer/colorBurnSourceOver.hlsl",
      "start": 91959869,
      "end": 91960902
    }, {
      "filename": "/vendored/lygia/color/layer/colorBurnSourceOver.msl",
      "start": 91960902,
      "end": 91961908
    }, {
      "filename": "/vendored/lygia/color/layer/colorDodgeSourceOver.glsl",
      "start": 91961908,
      "end": 91962929
    }, {
      "filename": "/vendored/lygia/color/layer/colorDodgeSourceOver.hlsl",
      "start": 91962929,
      "end": 91963968
    }, {
      "filename": "/vendored/lygia/color/layer/colorDodgeSourceOver.msl",
      "start": 91963968,
      "end": 91964980
    }, {
      "filename": "/vendored/lygia/color/layer/colorSourceOver.glsl",
      "start": 91964980,
      "end": 91965963
    }, {
      "filename": "/vendored/lygia/color/layer/colorSourceOver.hlsl",
      "start": 91965963,
      "end": 91966964
    }, {
      "filename": "/vendored/lygia/color/layer/colorSourceOver.msl",
      "start": 91966964,
      "end": 91967939
    }, {
      "filename": "/vendored/lygia/color/layer/darkenSourceOver.glsl",
      "start": 91967939,
      "end": 91968928
    }, {
      "filename": "/vendored/lygia/color/layer/darkenSourceOver.hlsl",
      "start": 91968928,
      "end": 91969935
    }, {
      "filename": "/vendored/lygia/color/layer/darkenSourceOver.msl",
      "start": 91969935,
      "end": 91970916
    }, {
      "filename": "/vendored/lygia/color/layer/differenceSourceOver.glsl",
      "start": 91970916,
      "end": 91971934
    }, {
      "filename": "/vendored/lygia/color/layer/differenceSourceOver.hlsl",
      "start": 91971934,
      "end": 91972970
    }, {
      "filename": "/vendored/lygia/color/layer/differenceSourceOver.msl",
      "start": 91972970,
      "end": 91973979
    }, {
      "filename": "/vendored/lygia/color/layer/exclusionSourceOver.glsl",
      "start": 91973979,
      "end": 91974989
    }, {
      "filename": "/vendored/lygia/color/layer/exclusionSourceOver.hlsl",
      "start": 91974989,
      "end": 91976018
    }, {
      "filename": "/vendored/lygia/color/layer/exclusionSourceOver.msl",
      "start": 91976018,
      "end": 91977020
    }, {
      "filename": "/vendored/lygia/color/layer/glowSourceOver.glsl",
      "start": 91977020,
      "end": 91977980
    }, {
      "filename": "/vendored/lygia/color/layer/glowSourceOver.hlsl",
      "start": 91977980,
      "end": 91978944
    }, {
      "filename": "/vendored/lygia/color/layer/glowSourceOver.msl",
      "start": 91978944,
      "end": 91979911
    }, {
      "filename": "/vendored/lygia/color/layer/hardLightSourceOver.glsl",
      "start": 91979911,
      "end": 91980928
    }, {
      "filename": "/vendored/lygia/color/layer/hardLightSourceOver.hlsl",
      "start": 91980928,
      "end": 91981961
    }, {
      "filename": "/vendored/lygia/color/layer/hardLightSourceOver.msl",
      "start": 91981961,
      "end": 91982967
    }, {
      "filename": "/vendored/lygia/color/layer/hardMixSourceOver.glsl",
      "start": 91982967,
      "end": 91983968
    }, {
      "filename": "/vendored/lygia/color/layer/hardMixSourceOver.hlsl",
      "start": 91983968,
      "end": 91984987
    }, {
      "filename": "/vendored/lygia/color/layer/hardMixSourceOver.msl",
      "start": 91984987,
      "end": 91985979
    }, {
      "filename": "/vendored/lygia/color/layer/hueSourceOver.glsl",
      "start": 91985979,
      "end": 91986952
    }, {
      "filename": "/vendored/lygia/color/layer/hueSourceOver.hlsl",
      "start": 91986952,
      "end": 91987943
    }, {
      "filename": "/vendored/lygia/color/layer/hueSourceOver.msl",
      "start": 91987943,
      "end": 91988907
    }, {
      "filename": "/vendored/lygia/color/layer/lightenSourceOver.glsl",
      "start": 91988907,
      "end": 91989903
    }, {
      "filename": "/vendored/lygia/color/layer/lightenSourceOver.hlsl",
      "start": 91989903,
      "end": 91990918
    }, {
      "filename": "/vendored/lygia/color/layer/lightenSourceOver.msl",
      "start": 91990918,
      "end": 91991906
    }, {
      "filename": "/vendored/lygia/color/layer/linearBurnSourceOver.glsl",
      "start": 91991906,
      "end": 91992927
    }, {
      "filename": "/vendored/lygia/color/layer/linearBurnSourceOver.hlsl",
      "start": 91992927,
      "end": 91993966
    }, {
      "filename": "/vendored/lygia/color/layer/linearBurnSourceOver.msl",
      "start": 91993966,
      "end": 91994979
    }, {
      "filename": "/vendored/lygia/color/layer/linearDodgeSourceOver.glsl",
      "start": 91994979,
      "end": 91996007
    }, {
      "filename": "/vendored/lygia/color/layer/linearDodgeSourceOver.hlsl",
      "start": 91996007,
      "end": 91997053
    }, {
      "filename": "/vendored/lygia/color/layer/linearDodgeSourceOver.msl",
      "start": 91997053,
      "end": 91998073
    }, {
      "filename": "/vendored/lygia/color/layer/linearLightSourceOver.glsl",
      "start": 91998073,
      "end": 91999101
    }, {
      "filename": "/vendored/lygia/color/layer/linearLightSourceOver.hlsl",
      "start": 91999101,
      "end": 92000147
    }, {
      "filename": "/vendored/lygia/color/layer/linearLightSourceOver.msl",
      "start": 92000147,
      "end": 92001167
    }, {
      "filename": "/vendored/lygia/color/layer/luminositySourceOver.glsl",
      "start": 92001167,
      "end": 92002184
    }, {
      "filename": "/vendored/lygia/color/layer/luminositySourceOver.hlsl",
      "start": 92002184,
      "end": 92003219
    }, {
      "filename": "/vendored/lygia/color/layer/luminositySourceOver.msl",
      "start": 92003219,
      "end": 92004224
    }, {
      "filename": "/vendored/lygia/color/layer/multiplySourceOver.glsl",
      "start": 92004224,
      "end": 92005226
    }, {
      "filename": "/vendored/lygia/color/layer/multiplySourceOver.hlsl",
      "start": 92005226,
      "end": 92006246
    }, {
      "filename": "/vendored/lygia/color/layer/multiplySourceOver.msl",
      "start": 92006246,
      "end": 92007240
    }, {
      "filename": "/vendored/lygia/color/layer/negationSourceOver.glsl",
      "start": 92007240,
      "end": 92008243
    }, {
      "filename": "/vendored/lygia/color/layer/negationSourceOver.hlsl",
      "start": 92008243,
      "end": 92009264
    }, {
      "filename": "/vendored/lygia/color/layer/negationSourceOver.msl",
      "start": 92009264,
      "end": 92010258
    }, {
      "filename": "/vendored/lygia/color/layer/overlaySourceOver.glsl",
      "start": 92010258,
      "end": 92011254
    }, {
      "filename": "/vendored/lygia/color/layer/overlaySourceOver.hlsl",
      "start": 92011254,
      "end": 92012268
    }, {
      "filename": "/vendored/lygia/color/layer/overlaySourceOver.msl",
      "start": 92012268,
      "end": 92013255
    }, {
      "filename": "/vendored/lygia/color/layer/phoenixSourceOver.glsl",
      "start": 92013255,
      "end": 92014251
    }, {
      "filename": "/vendored/lygia/color/layer/phoenixSourceOver.hlsl",
      "start": 92014251,
      "end": 92015265
    }, {
      "filename": "/vendored/lygia/color/layer/phoenixSourceOver.msl",
      "start": 92015265,
      "end": 92016252
    }, {
      "filename": "/vendored/lygia/color/layer/pinLightSourceOver.glsl",
      "start": 92016252,
      "end": 92017259
    }, {
      "filename": "/vendored/lygia/color/layer/pinLightSourceOver.hlsl",
      "start": 92017259,
      "end": 92018284
    }, {
      "filename": "/vendored/lygia/color/layer/pinLightSourceOver.msl",
      "start": 92018284,
      "end": 92019282
    }, {
      "filename": "/vendored/lygia/color/layer/reflectSourceOver.glsl",
      "start": 92019282,
      "end": 92020280
    }, {
      "filename": "/vendored/lygia/color/layer/reflectSourceOver.hlsl",
      "start": 92020280,
      "end": 92021294
    }, {
      "filename": "/vendored/lygia/color/layer/reflectSourceOver.msl",
      "start": 92021294,
      "end": 92022281
    }, {
      "filename": "/vendored/lygia/color/layer/saturationSourceOver.glsl",
      "start": 92022281,
      "end": 92023298
    }, {
      "filename": "/vendored/lygia/color/layer/saturationSourceOver.hlsl",
      "start": 92023298,
      "end": 92024333
    }, {
      "filename": "/vendored/lygia/color/layer/saturationSourceOver.msl",
      "start": 92024333,
      "end": 92025341
    }, {
      "filename": "/vendored/lygia/color/layer/screenSourceOver.glsl",
      "start": 92025341,
      "end": 92026330
    }, {
      "filename": "/vendored/lygia/color/layer/screenSourceOver.hlsl",
      "start": 92026330,
      "end": 92027337
    }, {
      "filename": "/vendored/lygia/color/layer/screenSourceOver.msl",
      "start": 92027337,
      "end": 92028317
    }, {
      "filename": "/vendored/lygia/color/layer/softLightSourceOver.glsl",
      "start": 92028317,
      "end": 92029331
    }, {
      "filename": "/vendored/lygia/color/layer/softLightSourceOver.hlsl",
      "start": 92029331,
      "end": 92030363
    }, {
      "filename": "/vendored/lygia/color/layer/softLightSourceOver.msl",
      "start": 92030363,
      "end": 92031368
    }, {
      "filename": "/vendored/lygia/color/layer/subtractSourceOver.glsl",
      "start": 92031368,
      "end": 92032371
    }, {
      "filename": "/vendored/lygia/color/layer/subtractSourceOver.hlsl",
      "start": 92032371,
      "end": 92033392
    }, {
      "filename": "/vendored/lygia/color/layer/subtractSourceOver.msl",
      "start": 92033392,
      "end": 92034386
    }, {
      "filename": "/vendored/lygia/color/layer/vividLightSourceOver.glsl",
      "start": 92034386,
      "end": 92035407
    }, {
      "filename": "/vendored/lygia/color/layer/vividLightSourceOver.hlsl",
      "start": 92035407,
      "end": 92036446
    }, {
      "filename": "/vendored/lygia/color/layer/vividLightSourceOver.msl",
      "start": 92036446,
      "end": 92037458
    }, {
      "filename": "/vendored/lygia/color/levels.glsl",
      "start": 92037458,
      "end": 92038838
    }, {
      "filename": "/vendored/lygia/color/levels.hlsl",
      "start": 92038838,
      "end": 92040657
    }, {
      "filename": "/vendored/lygia/color/levels.msl",
      "start": 92040657,
      "end": 92042023
    }, {
      "filename": "/vendored/lygia/color/levels/gamma.glsl",
      "start": 92042023,
      "end": 92042843
    }, {
      "filename": "/vendored/lygia/color/levels/gamma.hlsl",
      "start": 92042843,
      "end": 92043851
    }, {
      "filename": "/vendored/lygia/color/levels/gamma.msl",
      "start": 92043851,
      "end": 92044673
    }, {
      "filename": "/vendored/lygia/color/levels/inputRange.glsl",
      "start": 92044673,
      "end": 92045733
    }, {
      "filename": "/vendored/lygia/color/levels/inputRange.hlsl",
      "start": 92045733,
      "end": 92047012
    }, {
      "filename": "/vendored/lygia/color/levels/inputRange.msl",
      "start": 92047012,
      "end": 92048074
    }, {
      "filename": "/vendored/lygia/color/levels/outputRange.glsl",
      "start": 92048074,
      "end": 92049092
    }, {
      "filename": "/vendored/lygia/color/levels/outputRange.hlsl",
      "start": 92049092,
      "end": 92050322
    }, {
      "filename": "/vendored/lygia/color/levels/outputRange.msl",
      "start": 92050322,
      "end": 92051334
    }, {
      "filename": "/vendored/lygia/color/luma.glsl",
      "start": 92051334,
      "end": 92051736
    }, {
      "filename": "/vendored/lygia/color/luma.hlsl",
      "start": 92051736,
      "end": 92052194
    }, {
      "filename": "/vendored/lygia/color/luma.msl",
      "start": 92052194,
      "end": 92052596
    }, {
      "filename": "/vendored/lygia/color/luma.wesl",
      "start": 92052596,
      "end": 92052866
    }, {
      "filename": "/vendored/lygia/color/luma.wgsl",
      "start": 92052866,
      "end": 92053129
    }, {
      "filename": "/vendored/lygia/color/luminance.glsl",
      "start": 92053129,
      "end": 92053842
    }, {
      "filename": "/vendored/lygia/color/luminance.hlsl",
      "start": 92053842,
      "end": 92054445
    }, {
      "filename": "/vendored/lygia/color/luminance.msl",
      "start": 92054445,
      "end": 92055068
    }, {
      "filename": "/vendored/lygia/color/lut.glsl",
      "start": 92055068,
      "end": 92058141
    }, {
      "filename": "/vendored/lygia/color/lut.hlsl",
      "start": 92058141,
      "end": 92061015
    }, {
      "filename": "/vendored/lygia/color/lut.msl",
      "start": 92061015,
      "end": 92064092
    }, {
      "filename": "/vendored/lygia/color/mixOklab.glsl",
      "start": 92064092,
      "end": 92065488
    }, {
      "filename": "/vendored/lygia/color/mixOklab.hlsl",
      "start": 92065488,
      "end": 92066989
    }, {
      "filename": "/vendored/lygia/color/mixOklab.msl",
      "start": 92066989,
      "end": 92068416
    }, {
      "filename": "/vendored/lygia/color/mixOklab.wesl",
      "start": 92068416,
      "end": 92069438
    }, {
      "filename": "/vendored/lygia/color/mixOklab.wgsl",
      "start": 92069438,
      "end": 92070485
    }, {
      "filename": "/vendored/lygia/color/mixRYB.glsl",
      "start": 92070485,
      "end": 92072263
    }, {
      "filename": "/vendored/lygia/color/mixRYB.hlsl",
      "start": 92072263,
      "end": 92074155
    }, {
      "filename": "/vendored/lygia/color/mixRYB.msl",
      "start": 92074155,
      "end": 92076039
    }, {
      "filename": "/vendored/lygia/color/mixSpectral.glsl",
      "start": 92076039,
      "end": 92093647
    }, {
      "filename": "/vendored/lygia/color/mixSpectral.hlsl",
      "start": 92093647,
      "end": 92104173
    }, {
      "filename": "/vendored/lygia/color/mixSpectral.msl",
      "start": 92104173,
      "end": 92114833
    }, {
      "filename": "/vendored/lygia/color/mixSpectral.wesl",
      "start": 92114833,
      "end": 92131131
    }, {
      "filename": "/vendored/lygia/color/mixSpectral.wgsl",
      "start": 92131131,
      "end": 92147413
    }, {
      "filename": "/vendored/lygia/color/palette.glsl",
      "start": 92147413,
      "end": 92147990
    }, {
      "filename": "/vendored/lygia/color/palette.hlsl",
      "start": 92147990,
      "end": 92148600
    }, {
      "filename": "/vendored/lygia/color/palette.msl",
      "start": 92148600,
      "end": 92149170
    }, {
      "filename": "/vendored/lygia/color/palette/fire.cuh",
      "start": 92149170,
      "end": 92149707
    }, {
      "filename": "/vendored/lygia/color/palette/fire.glsl",
      "start": 92149707,
      "end": 92150275
    }, {
      "filename": "/vendored/lygia/color/palette/fire.hlsl",
      "start": 92150275,
      "end": 92150736
    }, {
      "filename": "/vendored/lygia/color/palette/flexoki.glsl",
      "start": 92150736,
      "end": 92161337
    }, {
      "filename": "/vendored/lygia/color/palette/flexoki.hlsl",
      "start": 92161337,
      "end": 92172176
    }, {
      "filename": "/vendored/lygia/color/palette/heatmap.cuh",
      "start": 92172176,
      "end": 92172734
    }, {
      "filename": "/vendored/lygia/color/palette/heatmap.glsl",
      "start": 92172734,
      "end": 92173325
    }, {
      "filename": "/vendored/lygia/color/palette/heatmap.hlsl",
      "start": 92173325,
      "end": 92173808
    }, {
      "filename": "/vendored/lygia/color/palette/heatmap.wesl",
      "start": 92173808,
      "end": 92174322
    }, {
      "filename": "/vendored/lygia/color/palette/heatmap.wgsl",
      "start": 92174322,
      "end": 92174836
    }, {
      "filename": "/vendored/lygia/color/palette/hue.cuh",
      "start": 92174836,
      "end": 92175716
    }, {
      "filename": "/vendored/lygia/color/palette/hue.glsl",
      "start": 92175716,
      "end": 92176489
    }, {
      "filename": "/vendored/lygia/color/palette/hue.hlsl",
      "start": 92176489,
      "end": 92177139
    }, {
      "filename": "/vendored/lygia/color/palette/hue.wesl",
      "start": 92177139,
      "end": 92177807
    }, {
      "filename": "/vendored/lygia/color/palette/hue.wgsl",
      "start": 92177807,
      "end": 92178475
    }, {
      "filename": "/vendored/lygia/color/palette/lerp.glsl",
      "start": 92178475,
      "end": 92180231
    }, {
      "filename": "/vendored/lygia/color/palette/macbeth.glsl",
      "start": 92180231,
      "end": 92200730
    }, {
      "filename": "/vendored/lygia/color/palette/macbeth.hlsl",
      "start": 92200730,
      "end": 92220227
    }, {
      "filename": "/vendored/lygia/color/palette/pigments.glsl",
      "start": 92220227,
      "end": 92222161
    }, {
      "filename": "/vendored/lygia/color/palette/pigments.hlsl",
      "start": 92222161,
      "end": 92224125
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/gamblin_oil.glsl",
      "start": 92224125,
      "end": 92232944
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/gamblin_oil.hlsl",
      "start": 92232944,
      "end": 92241853
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/golden_acrylic.glsl",
      "start": 92241853,
      "end": 92248937
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/golden_acrylic.hlsl",
      "start": 92248937,
      "end": 92256089
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/liquitex_acrylic.glsl",
      "start": 92256089,
      "end": 92261051
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/liquitex_acrylic.hlsl",
      "start": 92261051,
      "end": 92266057
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/rembrandt_oil.glsl",
      "start": 92266057,
      "end": 92273948
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/rembrandt_oil.hlsl",
      "start": 92273948,
      "end": 92281917
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/winsor_acrylic.glsl",
      "start": 92281917,
      "end": 92294593
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/winsor_acrylic.hlsl",
      "start": 92294593,
      "end": 92307389
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/winsor_gouache.glsl",
      "start": 92307389,
      "end": 92317148
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/winsor_gouache.hlsl",
      "start": 92317148,
      "end": 92327003
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/winsor_oil.glsl",
      "start": 92327003,
      "end": 92340874
    }, {
      "filename": "/vendored/lygia/color/palette/pigments/winsor_oil.hlsl",
      "start": 92340874,
      "end": 92354887
    }, {
      "filename": "/vendored/lygia/color/palette/ridgway.glsl",
      "start": 92354887,
      "end": 92551717
    }, {
      "filename": "/vendored/lygia/color/palette/ridgway.hlsl",
      "start": 92551717,
      "end": 92750781
    }, {
      "filename": "/vendored/lygia/color/palette/spectral.glsl",
      "start": 92750781,
      "end": 92752509
    }, {
      "filename": "/vendored/lygia/color/palette/spectral.hlsl",
      "start": 92752509,
      "end": 92754223
    }, {
      "filename": "/vendored/lygia/color/palette/spectral/gems.glsl",
      "start": 92754223,
      "end": 92754901
    }, {
      "filename": "/vendored/lygia/color/palette/spectral/gems.hlsl",
      "start": 92754901,
      "end": 92755555
    }, {
      "filename": "/vendored/lygia/color/palette/spectral/geoffrey.glsl",
      "start": 92755555,
      "end": 92755939
    }, {
      "filename": "/vendored/lygia/color/palette/spectral/geoffrey.hlsl",
      "start": 92755939,
      "end": 92756218
    }, {
      "filename": "/vendored/lygia/color/palette/spectral/soft.glsl",
      "start": 92756218,
      "end": 92756991
    }, {
      "filename": "/vendored/lygia/color/palette/spectral/soft.hlsl",
      "start": 92756991,
      "end": 92757699
    }, {
      "filename": "/vendored/lygia/color/palette/spectral/zucconi.glsl",
      "start": 92757699,
      "end": 92758891
    }, {
      "filename": "/vendored/lygia/color/palette/spectral/zucconi.hlsl",
      "start": 92758891,
      "end": 92759986
    }, {
      "filename": "/vendored/lygia/color/palette/spectral/zucconi6.glsl",
      "start": 92759986,
      "end": 92761304
    }, {
      "filename": "/vendored/lygia/color/palette/spectral/zucconi6.hlsl",
      "start": 92761304,
      "end": 92762537
    }, {
      "filename": "/vendored/lygia/color/palette/spyder.glsl",
      "start": 92762537,
      "end": 92776585
    }, {
      "filename": "/vendored/lygia/color/palette/spyder.hlsl",
      "start": 92776585,
      "end": 92790597
    }, {
      "filename": "/vendored/lygia/color/palette/wada.glsl",
      "start": 92790597,
      "end": 92790704
    }, {
      "filename": "/vendored/lygia/color/palette/wada.hlsl",
      "start": 92790704,
      "end": 92790811
    }, {
      "filename": "/vendored/lygia/color/palette/wada/dyad.glsl",
      "start": 92790811,
      "end": 92795073
    }, {
      "filename": "/vendored/lygia/color/palette/wada/dyad.hlsl",
      "start": 92795073,
      "end": 92799067
    }, {
      "filename": "/vendored/lygia/color/palette/wada/tetrad.glsl",
      "start": 92799067,
      "end": 92803349
    }, {
      "filename": "/vendored/lygia/color/palette/wada/tetrad.hlsl",
      "start": 92803349,
      "end": 92807371
    }, {
      "filename": "/vendored/lygia/color/palette/wada/triad.glsl",
      "start": 92807371,
      "end": 92811669
    }, {
      "filename": "/vendored/lygia/color/palette/wada/triad.hlsl",
      "start": 92811669,
      "end": 92815714
    }, {
      "filename": "/vendored/lygia/color/palette/wada/value.glsl",
      "start": 92815714,
      "end": 92882789
    }, {
      "filename": "/vendored/lygia/color/palette/wada/value.hlsl",
      "start": 92882789,
      "end": 92950228
    }, {
      "filename": "/vendored/lygia/color/palette/water.cuh",
      "start": 92950228,
      "end": 92950833
    }, {
      "filename": "/vendored/lygia/color/palette/water.glsl",
      "start": 92950833,
      "end": 92951455
    }, {
      "filename": "/vendored/lygia/color/palette/water.hlsl",
      "start": 92951455,
      "end": 92951950
    }, {
      "filename": "/vendored/lygia/color/palette/zorn.glsl",
      "start": 92951950,
      "end": 92953040
    }, {
      "filename": "/vendored/lygia/color/saturationMatrix.glsl",
      "start": 92953040,
      "end": 92953834
    }, {
      "filename": "/vendored/lygia/color/saturationMatrix.hlsl",
      "start": 92953834,
      "end": 92954883
    }, {
      "filename": "/vendored/lygia/color/saturationMatrix.msl",
      "start": 92954883,
      "end": 92955696
    }, {
      "filename": "/vendored/lygia/color/saturationMatrix.wesl",
      "start": 92955696,
      "end": 92956395
    }, {
      "filename": "/vendored/lygia/color/saturationMatrix.wgsl",
      "start": 92956395,
      "end": 92957094
    }, {
      "filename": "/vendored/lygia/color/space.glsl",
      "start": 92957094,
      "end": 92958094
    }, {
      "filename": "/vendored/lygia/color/space.hlsl",
      "start": 92958094,
      "end": 92958663
    }, {
      "filename": "/vendored/lygia/color/space.msl",
      "start": 92958663,
      "end": 92959639
    }, {
      "filename": "/vendored/lygia/color/space/YCbCr2rgb.glsl",
      "start": 92959639,
      "end": 92960407
    }, {
      "filename": "/vendored/lygia/color/space/YCbCr2rgb.hlsl",
      "start": 92960407,
      "end": 92961179
    }, {
      "filename": "/vendored/lygia/color/space/YCbCr2rgb.msl",
      "start": 92961179,
      "end": 92961947
    }, {
      "filename": "/vendored/lygia/color/space/YCbCr2rgb.wesl",
      "start": 92961947,
      "end": 92962535
    }, {
      "filename": "/vendored/lygia/color/space/YCbCr2rgb.wgsl",
      "start": 92962535,
      "end": 92963123
    }, {
      "filename": "/vendored/lygia/color/space/YPbPr2rgb.glsl",
      "start": 92963123,
      "end": 92964042
    }, {
      "filename": "/vendored/lygia/color/space/YPbPr2rgb.hlsl",
      "start": 92964042,
      "end": 92964997
    }, {
      "filename": "/vendored/lygia/color/space/YPbPr2rgb.msl",
      "start": 92964997,
      "end": 92965974
    }, {
      "filename": "/vendored/lygia/color/space/YPbPr2rgb.wesl",
      "start": 92965974,
      "end": 92966719
    }, {
      "filename": "/vendored/lygia/color/space/YPbPr2rgb.wgsl",
      "start": 92966719,
      "end": 92967464
    }, {
      "filename": "/vendored/lygia/color/space/cmyk2rgb.glsl",
      "start": 92967464,
      "end": 92968015
    }, {
      "filename": "/vendored/lygia/color/space/cmyk2rgb.hlsl",
      "start": 92968015,
      "end": 92968539
    }, {
      "filename": "/vendored/lygia/color/space/cmyk2rgb.msl",
      "start": 92968539,
      "end": 92969088
    }, {
      "filename": "/vendored/lygia/color/space/cmyk2rgb.wesl",
      "start": 92969088,
      "end": 92969533
    }, {
      "filename": "/vendored/lygia/color/space/cmyk2rgb.wgsl",
      "start": 92969533,
      "end": 92969978
    }, {
      "filename": "/vendored/lygia/color/space/gamma2linear.glsl",
      "start": 92969978,
      "end": 92970888
    }, {
      "filename": "/vendored/lygia/color/space/gamma2linear.hlsl",
      "start": 92970888,
      "end": 92971810
    }, {
      "filename": "/vendored/lygia/color/space/gamma2linear.msl",
      "start": 92971810,
      "end": 92972712
    }, {
      "filename": "/vendored/lygia/color/space/gamma2linear.wesl",
      "start": 92972712,
      "end": 92973114
    }, {
      "filename": "/vendored/lygia/color/space/gamma2linear.wgsl",
      "start": 92973114,
      "end": 92973516
    }, {
      "filename": "/vendored/lygia/color/space/hcy2rgb.glsl",
      "start": 92973516,
      "end": 92974318
    }, {
      "filename": "/vendored/lygia/color/space/hcy2rgb.hlsl",
      "start": 92974318,
      "end": 92975144
    }, {
      "filename": "/vendored/lygia/color/space/hcy2rgb.msl",
      "start": 92975144,
      "end": 92975972
    }, {
      "filename": "/vendored/lygia/color/space/hcy2rgb.wesl",
      "start": 92975972,
      "end": 92976652
    }, {
      "filename": "/vendored/lygia/color/space/hcy2rgb.wgsl",
      "start": 92976652,
      "end": 92977319
    }, {
      "filename": "/vendored/lygia/color/space/hsl2rgb.glsl",
      "start": 92977319,
      "end": 92977983
    }, {
      "filename": "/vendored/lygia/color/space/hsl2rgb.hlsl",
      "start": 92977983,
      "end": 92978667
    }, {
      "filename": "/vendored/lygia/color/space/hsl2rgb.msl",
      "start": 92978667,
      "end": 92979334
    }, {
      "filename": "/vendored/lygia/color/space/hsl2rgb.wesl",
      "start": 92979334,
      "end": 92979844
    }, {
      "filename": "/vendored/lygia/color/space/hsl2rgb.wgsl",
      "start": 92979844,
      "end": 92980341
    }, {
      "filename": "/vendored/lygia/color/space/hsv2rgb.glsl",
      "start": 92980341,
      "end": 92980738
    }, {
      "filename": "/vendored/lygia/color/space/hsv2rgb.hlsl",
      "start": 92980738,
      "end": 92981106
    }, {
      "filename": "/vendored/lygia/color/space/hsv2rgb.msl",
      "start": 92981106,
      "end": 92981503
    }, {
      "filename": "/vendored/lygia/color/space/hsv2rgb.wesl",
      "start": 92981503,
      "end": 92981728
    }, {
      "filename": "/vendored/lygia/color/space/hsv2rgb.wgsl",
      "start": 92981728,
      "end": 92981931
    }, {
      "filename": "/vendored/lygia/color/space/hsv2ryb.glsl",
      "start": 92981931,
      "end": 92983057
    }, {
      "filename": "/vendored/lygia/color/space/hsv2ryb.hlsl",
      "start": 92983057,
      "end": 92984201
    }, {
      "filename": "/vendored/lygia/color/space/hsv2ryb.msl",
      "start": 92984201,
      "end": 92985349
    }, {
      "filename": "/vendored/lygia/color/space/hsv2ryb.wesl",
      "start": 92985349,
      "end": 92985976
    }, {
      "filename": "/vendored/lygia/color/space/hsv2ryb.wgsl",
      "start": 92985976,
      "end": 92986610
    }, {
      "filename": "/vendored/lygia/color/space/hue2rgb.glsl",
      "start": 92986610,
      "end": 92987250
    }, {
      "filename": "/vendored/lygia/color/space/hue2rgb.hlsl",
      "start": 92987250,
      "end": 92987852
    }, {
      "filename": "/vendored/lygia/color/space/hue2rgb.msl",
      "start": 92987852,
      "end": 92988491
    }, {
      "filename": "/vendored/lygia/color/space/hue2rgb.wesl",
      "start": 92988491,
      "end": 92989005
    }, {
      "filename": "/vendored/lygia/color/space/hue2rgb.wgsl",
      "start": 92989005,
      "end": 92989519
    }, {
      "filename": "/vendored/lygia/color/space/k2rgb.glsl",
      "start": 92989519,
      "end": 92991646
    }, {
      "filename": "/vendored/lygia/color/space/k2rgb.hlsl",
      "start": 92991646,
      "end": 92993779
    }, {
      "filename": "/vendored/lygia/color/space/k2rgb.msl",
      "start": 92993779,
      "end": 92995923
    }, {
      "filename": "/vendored/lygia/color/space/k2rgb.wesl",
      "start": 92995923,
      "end": 92996638
    }, {
      "filename": "/vendored/lygia/color/space/k2rgb.wgsl",
      "start": 92996638,
      "end": 92997339
    }, {
      "filename": "/vendored/lygia/color/space/lab2lch.glsl",
      "start": 92997339,
      "end": 92998035
    }, {
      "filename": "/vendored/lygia/color/space/lab2lch.hlsl",
      "start": 92998035,
      "end": 92998751
    }, {
      "filename": "/vendored/lygia/color/space/lab2lch.msl",
      "start": 92998751,
      "end": 92999458
    }, {
      "filename": "/vendored/lygia/color/space/lab2lch.wesl",
      "start": 92999458,
      "end": 93000008
    }, {
      "filename": "/vendored/lygia/color/space/lab2lch.wgsl",
      "start": 93000008,
      "end": 93000558
    }, {
      "filename": "/vendored/lygia/color/space/lab2rgb.glsl",
      "start": 93000558,
      "end": 93001208
    }, {
      "filename": "/vendored/lygia/color/space/lab2rgb.hlsl",
      "start": 93001208,
      "end": 93001805
    }, {
      "filename": "/vendored/lygia/color/space/lab2rgb.msl",
      "start": 93001805,
      "end": 93002451
    }, {
      "filename": "/vendored/lygia/color/space/lab2rgb.wesl",
      "start": 93002451,
      "end": 93002967
    }, {
      "filename": "/vendored/lygia/color/space/lab2rgb.wgsl",
      "start": 93002967,
      "end": 93003467
    }, {
      "filename": "/vendored/lygia/color/space/lab2srgb.glsl",
      "start": 93003467,
      "end": 93004137
    }, {
      "filename": "/vendored/lygia/color/space/lab2srgb.hlsl",
      "start": 93004137,
      "end": 93005026
    }, {
      "filename": "/vendored/lygia/color/space/lab2srgb.msl",
      "start": 93005026,
      "end": 93005696
    }, {
      "filename": "/vendored/lygia/color/space/lab2srgb.wesl",
      "start": 93005696,
      "end": 93006238
    }, {
      "filename": "/vendored/lygia/color/space/lab2srgb.wgsl",
      "start": 93006238,
      "end": 93006736
    }, {
      "filename": "/vendored/lygia/color/space/lab2xyz.glsl",
      "start": 93006736,
      "end": 93007833
    }, {
      "filename": "/vendored/lygia/color/space/lab2xyz.hlsl",
      "start": 93007833,
      "end": 93008940
    }, {
      "filename": "/vendored/lygia/color/space/lab2xyz.msl",
      "start": 93008940,
      "end": 93010046
    }, {
      "filename": "/vendored/lygia/color/space/lab2xyz.wesl",
      "start": 93010046,
      "end": 93010719
    }, {
      "filename": "/vendored/lygia/color/space/lab2xyz.wgsl",
      "start": 93010719,
      "end": 93011392
    }, {
      "filename": "/vendored/lygia/color/space/lch2lab.glsl",
      "start": 93011392,
      "end": 93012095
    }, {
      "filename": "/vendored/lygia/color/space/lch2lab.hlsl",
      "start": 93012095,
      "end": 93012818
    }, {
      "filename": "/vendored/lygia/color/space/lch2lab.msl",
      "start": 93012818,
      "end": 93013538
    }, {
      "filename": "/vendored/lygia/color/space/lch2lab.wesl",
      "start": 93013538,
      "end": 93014097
    }, {
      "filename": "/vendored/lygia/color/space/lch2lab.wgsl",
      "start": 93014097,
      "end": 93014656
    }, {
      "filename": "/vendored/lygia/color/space/lch2rgb.glsl",
      "start": 93014656,
      "end": 93015320
    }, {
      "filename": "/vendored/lygia/color/space/lch2rgb.hlsl",
      "start": 93015320,
      "end": 93016003
    }, {
      "filename": "/vendored/lygia/color/space/lch2rgb.msl",
      "start": 93016003,
      "end": 93016680
    }, {
      "filename": "/vendored/lygia/color/space/lch2rgb.wesl",
      "start": 93016680,
      "end": 93017220
    }, {
      "filename": "/vendored/lygia/color/space/lch2rgb.wgsl",
      "start": 93017220,
      "end": 93017742
    }, {
      "filename": "/vendored/lygia/color/space/lch2srgb.glsl",
      "start": 93017742,
      "end": 93018396
    }, {
      "filename": "/vendored/lygia/color/space/lch2srgb.msl",
      "start": 93018396,
      "end": 93019059
    }, {
      "filename": "/vendored/lygia/color/space/linear2gamma.glsl",
      "start": 93019059,
      "end": 93019981
    }, {
      "filename": "/vendored/lygia/color/space/linear2gamma.hlsl",
      "start": 93019981,
      "end": 93020925
    }, {
      "filename": "/vendored/lygia/color/space/linear2gamma.msl",
      "start": 93020925,
      "end": 93021839
    }, {
      "filename": "/vendored/lygia/color/space/linear2gamma.wesl",
      "start": 93021839,
      "end": 93022240
    }, {
      "filename": "/vendored/lygia/color/space/linear2gamma.wgsl",
      "start": 93022240,
      "end": 93022641
    }, {
      "filename": "/vendored/lygia/color/space/lms2rgb.glsl",
      "start": 93022641,
      "end": 93023888
    }, {
      "filename": "/vendored/lygia/color/space/lms2rgb.hlsl",
      "start": 93023888,
      "end": 93025178
    }, {
      "filename": "/vendored/lygia/color/space/lms2rgb.msl",
      "start": 93025178,
      "end": 93026493
    }, {
      "filename": "/vendored/lygia/color/space/lms2rgb.wesl",
      "start": 93026493,
      "end": 93027579
    }, {
      "filename": "/vendored/lygia/color/space/lms2rgb.wgsl",
      "start": 93027579,
      "end": 93028665
    }, {
      "filename": "/vendored/lygia/color/space/oklab2rgb.glsl",
      "start": 93028665,
      "end": 93029555
    }, {
      "filename": "/vendored/lygia/color/space/oklab2rgb.hlsl",
      "start": 93029555,
      "end": 93030485
    }, {
      "filename": "/vendored/lygia/color/space/oklab2rgb.msl",
      "start": 93030485,
      "end": 93031445
    }, {
      "filename": "/vendored/lygia/color/space/oklab2rgb.wesl",
      "start": 93031445,
      "end": 93032159
    }, {
      "filename": "/vendored/lygia/color/space/oklab2rgb.wgsl",
      "start": 93032159,
      "end": 93032873
    }, {
      "filename": "/vendored/lygia/color/space/oklab2srgb.glsl",
      "start": 93032873,
      "end": 93033375
    }, {
      "filename": "/vendored/lygia/color/space/oklab2srgb.hlsl",
      "start": 93033375,
      "end": 93033894
    }, {
      "filename": "/vendored/lygia/color/space/oklab2srgb.msl",
      "start": 93033894,
      "end": 93034396
    }, {
      "filename": "/vendored/lygia/color/space/oklab2srgb.wesl",
      "start": 93034396,
      "end": 93034779
    }, {
      "filename": "/vendored/lygia/color/space/oklab2srgb.wgsl",
      "start": 93034779,
      "end": 93035141
    }, {
      "filename": "/vendored/lygia/color/space/rgb2YCbCr.glsl",
      "start": 93035141,
      "end": 93035902
    }, {
      "filename": "/vendored/lygia/color/space/rgb2YCbCr.hlsl",
      "start": 93035902,
      "end": 93036664
    }, {
      "filename": "/vendored/lygia/color/space/rgb2YCbCr.msl",
      "start": 93036664,
      "end": 93037431
    }, {
      "filename": "/vendored/lygia/color/space/rgb2YCbCr.wesl",
      "start": 93037431,
      "end": 93038027
    }, {
      "filename": "/vendored/lygia/color/space/rgb2YCbCr.wgsl",
      "start": 93038027,
      "end": 93038623
    }, {
      "filename": "/vendored/lygia/color/space/rgb2YPbPr.glsl",
      "start": 93038623,
      "end": 93039601
    }, {
      "filename": "/vendored/lygia/color/space/rgb2YPbPr.hlsl",
      "start": 93039601,
      "end": 93040610
    }, {
      "filename": "/vendored/lygia/color/space/rgb2YPbPr.msl",
      "start": 93040610,
      "end": 93041650
    }, {
      "filename": "/vendored/lygia/color/space/rgb2YPbPr.wesl",
      "start": 93041650,
      "end": 93042478
    }, {
      "filename": "/vendored/lygia/color/space/rgb2YPbPr.wgsl",
      "start": 93042478,
      "end": 93043306
    }, {
      "filename": "/vendored/lygia/color/space/rgb2cmyk.glsl",
      "start": 93043306,
      "end": 93043954
    }, {
      "filename": "/vendored/lygia/color/space/rgb2cmyk.hlsl",
      "start": 93043954,
      "end": 93044569
    }, {
      "filename": "/vendored/lygia/color/space/rgb2cmyk.msl",
      "start": 93044569,
      "end": 93045219
    }, {
      "filename": "/vendored/lygia/color/space/rgb2cmyk.wesl",
      "start": 93045219,
      "end": 93045745
    }, {
      "filename": "/vendored/lygia/color/space/rgb2cmyk.wgsl",
      "start": 93045745,
      "end": 93046271
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hcv.glsl",
      "start": 93046271,
      "end": 93047166
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hcv.hlsl",
      "start": 93047166,
      "end": 93048101
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hcv.msl",
      "start": 93048101,
      "end": 93049016
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hcv.wesl",
      "start": 93049016,
      "end": 93049818
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hcv.wgsl",
      "start": 93049818,
      "end": 93050510
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hcy.glsl",
      "start": 93050510,
      "end": 93051475
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hcy.hlsl",
      "start": 93051475,
      "end": 93052456
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hcy.msl",
      "start": 93052456,
      "end": 93053439
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hcy.wesl",
      "start": 93053439,
      "end": 93054237
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hcy.wgsl",
      "start": 93054237,
      "end": 93054990
    }, {
      "filename": "/vendored/lygia/color/space/rgb2heat.glsl",
      "start": 93054990,
      "end": 93055584
    }, {
      "filename": "/vendored/lygia/color/space/rgb2heat.hlsl",
      "start": 93055584,
      "end": 93056168
    }, {
      "filename": "/vendored/lygia/color/space/rgb2heat.msl",
      "start": 93056168,
      "end": 93056753
    }, {
      "filename": "/vendored/lygia/color/space/rgb2heat.wesl",
      "start": 93056753,
      "end": 93057218
    }, {
      "filename": "/vendored/lygia/color/space/rgb2heat.wgsl",
      "start": 93057218,
      "end": 93057661
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hsl.glsl",
      "start": 93057661,
      "end": 93058457
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hsl.hlsl",
      "start": 93058457,
      "end": 93059257
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hsl.msl",
      "start": 93059257,
      "end": 93060058
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hsl.wesl",
      "start": 93060058,
      "end": 93060652
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hsl.wgsl",
      "start": 93060652,
      "end": 93061224
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hsv.glsl",
      "start": 93061224,
      "end": 93061970
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hsv.hlsl",
      "start": 93061970,
      "end": 93062697
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hsv.msl",
      "start": 93062697,
      "end": 93063456
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hsv.wesl",
      "start": 93063456,
      "end": 93063987
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hsv.wgsl",
      "start": 93063987,
      "end": 93064518
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hue.glsl",
      "start": 93064518,
      "end": 93065403
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hue.hlsl",
      "start": 93065403,
      "end": 93066129
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hue.msl",
      "start": 93066129,
      "end": 93067022
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hue.wesl",
      "start": 93067022,
      "end": 93067827
    }, {
      "filename": "/vendored/lygia/color/space/rgb2hue.wgsl",
      "start": 93067827,
      "end": 93068518
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lab.glsl",
      "start": 93068518,
      "end": 93069120
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lab.hlsl",
      "start": 93069120,
      "end": 93069732
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lab.msl",
      "start": 93069732,
      "end": 93070334
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lab.wesl",
      "start": 93070334,
      "end": 93070793
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lab.wgsl",
      "start": 93070793,
      "end": 93071234
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lch.glsl",
      "start": 93071234,
      "end": 93071836
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lch.hlsl",
      "start": 93071836,
      "end": 93072456
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lch.msl",
      "start": 93072456,
      "end": 93073058
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lch.wesl",
      "start": 93073058,
      "end": 93073540
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lch.wgsl",
      "start": 93073540,
      "end": 93073980
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lms.glsl",
      "start": 93073980,
      "end": 93075155
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lms.hlsl",
      "start": 93075155,
      "end": 93076377
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lms.msl",
      "start": 93076377,
      "end": 93077620
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lms.wesl",
      "start": 93077620,
      "end": 93078644
    }, {
      "filename": "/vendored/lygia/color/space/rgb2lms.wgsl",
      "start": 93078644,
      "end": 93079668
    }, {
      "filename": "/vendored/lygia/color/space/rgb2luma.glsl",
      "start": 93079668,
      "end": 93080301
    }, {
      "filename": "/vendored/lygia/color/space/rgb2luma.hlsl",
      "start": 93080301,
      "end": 93080944
    }, {
      "filename": "/vendored/lygia/color/space/rgb2luma.msl",
      "start": 93080944,
      "end": 93081571
    }, {
      "filename": "/vendored/lygia/color/space/rgb2luma.wesl",
      "start": 93081571,
      "end": 93082044
    }, {
      "filename": "/vendored/lygia/color/space/rgb2luma.wgsl",
      "start": 93082044,
      "end": 93082517
    }, {
      "filename": "/vendored/lygia/color/space/rgb2oklab.glsl",
      "start": 93082517,
      "end": 93083432
    }, {
      "filename": "/vendored/lygia/color/space/rgb2oklab.hlsl",
      "start": 93083432,
      "end": 93084425
    }, {
      "filename": "/vendored/lygia/color/space/rgb2oklab.msl",
      "start": 93084425,
      "end": 93085414
    }, {
      "filename": "/vendored/lygia/color/space/rgb2oklab.wesl",
      "start": 93085414,
      "end": 93086396
    }, {
      "filename": "/vendored/lygia/color/space/rgb2oklab.wgsl",
      "start": 93086396,
      "end": 93087378
    }, {
      "filename": "/vendored/lygia/color/space/rgb2ryb.glsl",
      "start": 93087378,
      "end": 93089950
    }, {
      "filename": "/vendored/lygia/color/space/rgb2ryb.hlsl",
      "start": 93089950,
      "end": 93092580
    }, {
      "filename": "/vendored/lygia/color/space/rgb2ryb.msl",
      "start": 93092580,
      "end": 93095228
    }, {
      "filename": "/vendored/lygia/color/space/rgb2ryb.wesl",
      "start": 93095228,
      "end": 93096524
    }, {
      "filename": "/vendored/lygia/color/space/rgb2ryb.wgsl",
      "start": 93096524,
      "end": 93097868
    }, {
      "filename": "/vendored/lygia/color/space/rgb2srgb.glsl",
      "start": 93097868,
      "end": 93098866
    }, {
      "filename": "/vendored/lygia/color/space/rgb2srgb.hlsl",
      "start": 93098866,
      "end": 93099888
    }, {
      "filename": "/vendored/lygia/color/space/rgb2srgb.msl",
      "start": 93099888,
      "end": 93100881
    }, {
      "filename": "/vendored/lygia/color/space/rgb2srgb.wesl",
      "start": 93100881,
      "end": 93101520
    }, {
      "filename": "/vendored/lygia/color/space/rgb2srgb.wgsl",
      "start": 93101520,
      "end": 93102159
    }, {
      "filename": "/vendored/lygia/color/space/rgb2xyY.glsl",
      "start": 93102159,
      "end": 93102749
    }, {
      "filename": "/vendored/lygia/color/space/rgb2xyY.hlsl",
      "start": 93102749,
      "end": 93103357
    }, {
      "filename": "/vendored/lygia/color/space/rgb2xyY.msl",
      "start": 93103357,
      "end": 93103963
    }, {
      "filename": "/vendored/lygia/color/space/rgb2xyY.wesl",
      "start": 93103963,
      "end": 93104452
    }, {
      "filename": "/vendored/lygia/color/space/rgb2xyY.wgsl",
      "start": 93104452,
      "end": 93104897
    }, {
      "filename": "/vendored/lygia/color/space/rgb2xyz.glsl",
      "start": 93104897,
      "end": 93105880
    }, {
      "filename": "/vendored/lygia/color/space/rgb2xyz.hlsl",
      "start": 93105880,
      "end": 93106917
    }, {
      "filename": "/vendored/lygia/color/space/rgb2xyz.msl",
      "start": 93106917,
      "end": 93107981
    }, {
      "filename": "/vendored/lygia/color/space/rgb2xyz.wesl",
      "start": 93107981,
      "end": 93108786
    }, {
      "filename": "/vendored/lygia/color/space/rgb2xyz.wgsl",
      "start": 93108786,
      "end": 93109591
    }, {
      "filename": "/vendored/lygia/color/space/rgb2yiq.glsl",
      "start": 93109591,
      "end": 93110411
    }, {
      "filename": "/vendored/lygia/color/space/rgb2yiq.hlsl",
      "start": 93110411,
      "end": 93111268
    }, {
      "filename": "/vendored/lygia/color/space/rgb2yiq.msl",
      "start": 93111268,
      "end": 93112115
    }, {
      "filename": "/vendored/lygia/color/space/rgb2yiq.wesl",
      "start": 93112115,
      "end": 93112772
    }, {
      "filename": "/vendored/lygia/color/space/rgb2yiq.wgsl",
      "start": 93112772,
      "end": 93113429
    }, {
      "filename": "/vendored/lygia/color/space/rgb2yuv.glsl",
      "start": 93113429,
      "end": 93114280
    }, {
      "filename": "/vendored/lygia/color/space/rgb2yuv.hlsl",
      "start": 93114280,
      "end": 93115167
    }, {
      "filename": "/vendored/lygia/color/space/rgb2yuv.msl",
      "start": 93115167,
      "end": 93116076
    }, {
      "filename": "/vendored/lygia/color/space/rgb2yuv.wesl",
      "start": 93116076,
      "end": 93116796
    }, {
      "filename": "/vendored/lygia/color/space/rgb2yuv.wgsl",
      "start": 93116796,
      "end": 93117516
    }, {
      "filename": "/vendored/lygia/color/space/ryb2rgb.glsl",
      "start": 93117516,
      "end": 93119867
    }, {
      "filename": "/vendored/lygia/color/space/ryb2rgb.hlsl",
      "start": 93119867,
      "end": 93122276
    }, {
      "filename": "/vendored/lygia/color/space/ryb2rgb.msl",
      "start": 93122276,
      "end": 93124706
    }, {
      "filename": "/vendored/lygia/color/space/ryb2rgb.wesl",
      "start": 93124706,
      "end": 93126073
    }, {
      "filename": "/vendored/lygia/color/space/ryb2rgb.wgsl",
      "start": 93126073,
      "end": 93127402
    }, {
      "filename": "/vendored/lygia/color/space/srgb2lab.glsl",
      "start": 93127402,
      "end": 93128002
    }, {
      "filename": "/vendored/lygia/color/space/srgb2lab.hlsl",
      "start": 93128002,
      "end": 93128620
    }, {
      "filename": "/vendored/lygia/color/space/srgb2lab.msl",
      "start": 93128620,
      "end": 93129220
    }, {
      "filename": "/vendored/lygia/color/space/srgb2lab.wesl",
      "start": 93129220,
      "end": 93129672
    }, {
      "filename": "/vendored/lygia/color/space/srgb2lab.wgsl",
      "start": 93129672,
      "end": 93130105
    }, {
      "filename": "/vendored/lygia/color/space/srgb2lch.glsl",
      "start": 93130105,
      "end": 93130706
    }, {
      "filename": "/vendored/lygia/color/space/srgb2lch.hlsl",
      "start": 93130706,
      "end": 93131325
    }, {
      "filename": "/vendored/lygia/color/space/srgb2lch.msl",
      "start": 93131325,
      "end": 93131926
    }, {
      "filename": "/vendored/lygia/color/space/srgb2lch.wesl",
      "start": 93131926,
      "end": 93132377
    }, {
      "filename": "/vendored/lygia/color/space/srgb2lch.wgsl",
      "start": 93132377,
      "end": 93132810
    }, {
      "filename": "/vendored/lygia/color/space/srgb2luma.glsl",
      "start": 93132810,
      "end": 93133443
    }, {
      "filename": "/vendored/lygia/color/space/srgb2luma.hlsl",
      "start": 93133443,
      "end": 93134068
    }, {
      "filename": "/vendored/lygia/color/space/srgb2luma.msl",
      "start": 93134068,
      "end": 93134695
    }, {
      "filename": "/vendored/lygia/color/space/srgb2luma.wesl",
      "start": 93134695,
      "end": 93135164
    }, {
      "filename": "/vendored/lygia/color/space/srgb2luma.wgsl",
      "start": 93135164,
      "end": 93135633
    }, {
      "filename": "/vendored/lygia/color/space/srgb2oklab.glsl",
      "start": 93135633,
      "end": 93136137
    }, {
      "filename": "/vendored/lygia/color/space/srgb2oklab.hlsl",
      "start": 93136137,
      "end": 93136653
    }, {
      "filename": "/vendored/lygia/color/space/srgb2oklab.msl",
      "start": 93136653,
      "end": 93137157
    }, {
      "filename": "/vendored/lygia/color/space/srgb2oklab.wesl",
      "start": 93137157,
      "end": 93137523
    }, {
      "filename": "/vendored/lygia/color/space/srgb2oklab.wgsl",
      "start": 93137523,
      "end": 93137842
    }, {
      "filename": "/vendored/lygia/color/space/srgb2rgb.glsl",
      "start": 93137842,
      "end": 93138858
    }, {
      "filename": "/vendored/lygia/color/space/srgb2rgb.hlsl",
      "start": 93138858,
      "end": 93139880
    }, {
      "filename": "/vendored/lygia/color/space/srgb2rgb.msl",
      "start": 93139880,
      "end": 93140892
    }, {
      "filename": "/vendored/lygia/color/space/srgb2rgb.wesl",
      "start": 93140892,
      "end": 93141607
    }, {
      "filename": "/vendored/lygia/color/space/srgb2rgb.wgsl",
      "start": 93141607,
      "end": 93142322
    }, {
      "filename": "/vendored/lygia/color/space/srgb2xyz.glsl",
      "start": 93142322,
      "end": 93142924
    }, {
      "filename": "/vendored/lygia/color/space/srgb2xyz.hlsl",
      "start": 93142924,
      "end": 93143527
    }, {
      "filename": "/vendored/lygia/color/space/srgb2xyz.msl",
      "start": 93143527,
      "end": 93144129
    }, {
      "filename": "/vendored/lygia/color/space/srgb2xyz.wesl",
      "start": 93144129,
      "end": 93144581
    }, {
      "filename": "/vendored/lygia/color/space/srgb2xyz.wgsl",
      "start": 93144581,
      "end": 93145014
    }, {
      "filename": "/vendored/lygia/color/space/w2rgb.glsl",
      "start": 93145014,
      "end": 93147005
    }, {
      "filename": "/vendored/lygia/color/space/w2rgb.hlsl",
      "start": 93147005,
      "end": 93149008
    }, {
      "filename": "/vendored/lygia/color/space/w2rgb.msl",
      "start": 93149008,
      "end": 93151002
    }, {
      "filename": "/vendored/lygia/color/space/xyY2rgb.glsl",
      "start": 93151002,
      "end": 93151604
    }, {
      "filename": "/vendored/lygia/color/space/xyY2rgb.hlsl",
      "start": 93151604,
      "end": 93152206
    }, {
      "filename": "/vendored/lygia/color/space/xyY2rgb.msl",
      "start": 93152206,
      "end": 93152808
    }, {
      "filename": "/vendored/lygia/color/space/xyY2rgb.wesl",
      "start": 93152808,
      "end": 93153256
    }, {
      "filename": "/vendored/lygia/color/space/xyY2rgb.wgsl",
      "start": 93153256,
      "end": 93153686
    }, {
      "filename": "/vendored/lygia/color/space/xyY2srgb.glsl",
      "start": 93153686,
      "end": 93154281
    }, {
      "filename": "/vendored/lygia/color/space/xyY2srgb.hlsl",
      "start": 93154281,
      "end": 93154894
    }, {
      "filename": "/vendored/lygia/color/space/xyY2srgb.msl",
      "start": 93154894,
      "end": 93155489
    }, {
      "filename": "/vendored/lygia/color/space/xyY2srgb.wesl",
      "start": 93155489,
      "end": 93155934
    }, {
      "filename": "/vendored/lygia/color/space/xyY2srgb.wgsl",
      "start": 93155934,
      "end": 93156361
    }, {
      "filename": "/vendored/lygia/color/space/xyY2xyz.glsl",
      "start": 93156361,
      "end": 93157017
    }, {
      "filename": "/vendored/lygia/color/space/xyY2xyz.hlsl",
      "start": 93157017,
      "end": 93157675
    }, {
      "filename": "/vendored/lygia/color/space/xyY2xyz.msl",
      "start": 93157675,
      "end": 93158335
    }, {
      "filename": "/vendored/lygia/color/space/xyY2xyz.wesl",
      "start": 93158335,
      "end": 93158817
    }, {
      "filename": "/vendored/lygia/color/space/xyY2xyz.wgsl",
      "start": 93158817,
      "end": 93159299
    }, {
      "filename": "/vendored/lygia/color/space/xyz2lab.glsl",
      "start": 93159299,
      "end": 93160098
    }, {
      "filename": "/vendored/lygia/color/space/xyz2lab.hlsl",
      "start": 93160098,
      "end": 93160916
    }, {
      "filename": "/vendored/lygia/color/space/xyz2lab.msl",
      "start": 93160916,
      "end": 93161729
    }, {
      "filename": "/vendored/lygia/color/space/xyz2lab.wesl",
      "start": 93161729,
      "end": 93162399
    }, {
      "filename": "/vendored/lygia/color/space/xyz2lab.wgsl",
      "start": 93162399,
      "end": 93163069
    }, {
      "filename": "/vendored/lygia/color/space/xyz2rgb.glsl",
      "start": 93163069,
      "end": 93164052
    }, {
      "filename": "/vendored/lygia/color/space/xyz2rgb.hlsl",
      "start": 93164052,
      "end": 93165063
    }, {
      "filename": "/vendored/lygia/color/space/xyz2rgb.msl",
      "start": 93165063,
      "end": 93166123
    }, {
      "filename": "/vendored/lygia/color/space/xyz2rgb.wesl",
      "start": 93166123,
      "end": 93166808
    }, {
      "filename": "/vendored/lygia/color/space/xyz2rgb.wgsl",
      "start": 93166808,
      "end": 93167493
    }, {
      "filename": "/vendored/lygia/color/space/xyz2srgb.glsl",
      "start": 93167493,
      "end": 93168153
    }, {
      "filename": "/vendored/lygia/color/space/xyz2srgb.hlsl",
      "start": 93168153,
      "end": 93168843
    }, {
      "filename": "/vendored/lygia/color/space/xyz2srgb.msl",
      "start": 93168843,
      "end": 93169512
    }, {
      "filename": "/vendored/lygia/color/space/xyz2srgb.wesl",
      "start": 93169512,
      "end": 93170034
    }, {
      "filename": "/vendored/lygia/color/space/xyz2srgb.wgsl",
      "start": 93170034,
      "end": 93170537
    }, {
      "filename": "/vendored/lygia/color/space/xyz2xyY.glsl",
      "start": 93170537,
      "end": 93171214
    }, {
      "filename": "/vendored/lygia/color/space/xyz2xyY.hlsl",
      "start": 93171214,
      "end": 93171894
    }, {
      "filename": "/vendored/lygia/color/space/xyz2xyY.msl",
      "start": 93171894,
      "end": 93172575
    }, {
      "filename": "/vendored/lygia/color/space/xyz2xyY.wesl",
      "start": 93172575,
      "end": 93173080
    }, {
      "filename": "/vendored/lygia/color/space/xyz2xyY.wgsl",
      "start": 93173080,
      "end": 93173585
    }, {
      "filename": "/vendored/lygia/color/space/yiq2rgb.glsl",
      "start": 93173585,
      "end": 93174386
    }, {
      "filename": "/vendored/lygia/color/space/yiq2rgb.hlsl",
      "start": 93174386,
      "end": 93175229
    }, {
      "filename": "/vendored/lygia/color/space/yiq2rgb.msl",
      "start": 93175229,
      "end": 93176062
    }, {
      "filename": "/vendored/lygia/color/space/yiq2rgb.wesl",
      "start": 93176062,
      "end": 93176644
    }, {
      "filename": "/vendored/lygia/color/space/yiq2rgb.wgsl",
      "start": 93176644,
      "end": 93177226
    }, {
      "filename": "/vendored/lygia/color/space/yuv2rgb.glsl",
      "start": 93177226,
      "end": 93178081
    }, {
      "filename": "/vendored/lygia/color/space/yuv2rgb.hlsl",
      "start": 93178081,
      "end": 93178972
    }, {
      "filename": "/vendored/lygia/color/space/yuv2rgb.msl",
      "start": 93178972,
      "end": 93179888
    }, {
      "filename": "/vendored/lygia/color/space/yuv2rgb.wesl",
      "start": 93179888,
      "end": 93180614
    }, {
      "filename": "/vendored/lygia/color/space/yuv2rgb.wgsl",
      "start": 93180614,
      "end": 93181340
    }, {
      "filename": "/vendored/lygia/color/tonemap.glsl",
      "start": 93181340,
      "end": 93182938
    }, {
      "filename": "/vendored/lygia/color/tonemap.hlsl",
      "start": 93182938,
      "end": 93184780
    }, {
      "filename": "/vendored/lygia/color/tonemap.msl",
      "start": 93184780,
      "end": 93186378
    }, {
      "filename": "/vendored/lygia/color/tonemap/aces.glsl",
      "start": 93186378,
      "end": 93186952
    }, {
      "filename": "/vendored/lygia/color/tonemap/aces.hlsl",
      "start": 93186952,
      "end": 93187504
    }, {
      "filename": "/vendored/lygia/color/tonemap/aces.wesl",
      "start": 93187504,
      "end": 93188023
    }, {
      "filename": "/vendored/lygia/color/tonemap/aces.wgsl",
      "start": 93188023,
      "end": 93188542
    }, {
      "filename": "/vendored/lygia/color/tonemap/debug.glsl",
      "start": 93188542,
      "end": 93191016
    }, {
      "filename": "/vendored/lygia/color/tonemap/debug.hlsl",
      "start": 93191016,
      "end": 93193522
    }, {
      "filename": "/vendored/lygia/color/tonemap/filmic.glsl",
      "start": 93193522,
      "end": 93194075
    }, {
      "filename": "/vendored/lygia/color/tonemap/filmic.hlsl",
      "start": 93194075,
      "end": 93194726
    }, {
      "filename": "/vendored/lygia/color/tonemap/filmic.wesl",
      "start": 93194726,
      "end": 93195307
    }, {
      "filename": "/vendored/lygia/color/tonemap/filmic.wgsl",
      "start": 93195307,
      "end": 93195888
    }, {
      "filename": "/vendored/lygia/color/tonemap/linear.glsl",
      "start": 93195888,
      "end": 93196170
    }, {
      "filename": "/vendored/lygia/color/tonemap/linear.hlsl",
      "start": 93196170,
      "end": 93196469
    }, {
      "filename": "/vendored/lygia/color/tonemap/reinhard.glsl",
      "start": 93196469,
      "end": 93196996
    }, {
      "filename": "/vendored/lygia/color/tonemap/reinhard.hlsl",
      "start": 93196996,
      "end": 93197535
    }, {
      "filename": "/vendored/lygia/color/tonemap/reinhardJodie.glsl",
      "start": 93197535,
      "end": 93198157
    }, {
      "filename": "/vendored/lygia/color/tonemap/reinhardJodie.hlsl",
      "start": 93198157,
      "end": 93198795
    }, {
      "filename": "/vendored/lygia/color/tonemap/uncharted.glsl",
      "start": 93198795,
      "end": 93199584
    }, {
      "filename": "/vendored/lygia/color/tonemap/uncharted.hlsl",
      "start": 93199584,
      "end": 93200400
    }, {
      "filename": "/vendored/lygia/color/tonemap/uncharted.wesl",
      "start": 93200400,
      "end": 93201085
    }, {
      "filename": "/vendored/lygia/color/tonemap/uncharted.wgsl",
      "start": 93201085,
      "end": 93201770
    }, {
      "filename": "/vendored/lygia/color/tonemap/uncharted2.glsl",
      "start": 93201770,
      "end": 93202396
    }, {
      "filename": "/vendored/lygia/color/tonemap/uncharted2.hlsl",
      "start": 93202396,
      "end": 93203052
    }, {
      "filename": "/vendored/lygia/color/tonemap/uncharted2.wesl",
      "start": 93203052,
      "end": 93203640
    }, {
      "filename": "/vendored/lygia/color/tonemap/uncharted2.wgsl",
      "start": 93203640,
      "end": 93204228
    }, {
      "filename": "/vendored/lygia/color/tonemap/unreal.glsl",
      "start": 93204228,
      "end": 93204748
    }, {
      "filename": "/vendored/lygia/color/tonemap/unreal.hlsl",
      "start": 93204748,
      "end": 93205285
    }, {
      "filename": "/vendored/lygia/color/vibrance.glsl",
      "start": 93205285,
      "end": 93206205
    }, {
      "filename": "/vendored/lygia/color/vibrance.hlsl",
      "start": 93206205,
      "end": 93207201
    }, {
      "filename": "/vendored/lygia/color/vibrance.msl",
      "start": 93207201,
      "end": 93208123
    }, {
      "filename": "/vendored/lygia/color/vibrance.wesl",
      "start": 93208123,
      "end": 93209028
    }, {
      "filename": "/vendored/lygia/color/vibrance.wgsl",
      "start": 93209028,
      "end": 93209916
    }, {
      "filename": "/vendored/lygia/color/whiteBalance.glsl",
      "start": 93209916,
      "end": 93212915
    }, {
      "filename": "/vendored/lygia/color/whiteBalance.hlsl",
      "start": 93212915,
      "end": 93216130
    }, {
      "filename": "/vendored/lygia/color/whiteBalance.msl",
      "start": 93216130,
      "end": 93219204
    }, {
      "filename": "/vendored/lygia/color/whiteBalance.wesl",
      "start": 93219204,
      "end": 93221514
    }, {
      "filename": "/vendored/lygia/color/whiteBalance.wgsl",
      "start": 93221514,
      "end": 93223885
    }, {
      "filename": "/vendored/lygia/distort/barrel.glsl",
      "start": 93223885,
      "end": 93226662
    }, {
      "filename": "/vendored/lygia/distort/barrel.hlsl",
      "start": 93226662,
      "end": 93229395
    }, {
      "filename": "/vendored/lygia/distort/barrel.msl",
      "start": 93229395,
      "end": 93232175
    }, {
      "filename": "/vendored/lygia/distort/chromaAB.glsl",
      "start": 93232175,
      "end": 93234710
    }, {
      "filename": "/vendored/lygia/distort/chromaAB.hlsl",
      "start": 93234710,
      "end": 93237258
    }, {
      "filename": "/vendored/lygia/distort/chromaAB.msl",
      "start": 93237258,
      "end": 93239767
    }, {
      "filename": "/vendored/lygia/distort/displace.glsl",
      "start": 93239767,
      "end": 93242452
    }, {
      "filename": "/vendored/lygia/distort/grain.glsl",
      "start": 93242452,
      "end": 93245224
    }, {
      "filename": "/vendored/lygia/distort/grain.hlsl",
      "start": 93245224,
      "end": 93247666
    }, {
      "filename": "/vendored/lygia/distort/grain.msl",
      "start": 93247666,
      "end": 93250479
    }, {
      "filename": "/vendored/lygia/distort/pincushion.glsl",
      "start": 93250479,
      "end": 93252481
    }, {
      "filename": "/vendored/lygia/distort/pincushion.msl",
      "start": 93252481,
      "end": 93254511
    }, {
      "filename": "/vendored/lygia/distort/stretch.glsl",
      "start": 93254511,
      "end": 93256713
    }, {
      "filename": "/vendored/lygia/distort/stretch.hlsl",
      "start": 93256713,
      "end": 93258942
    }, {
      "filename": "/vendored/lygia/distort/stretch.msl",
      "start": 93258942,
      "end": 93261138
    }, {
      "filename": "/vendored/lygia/draw/arrows.glsl",
      "start": 93261138,
      "end": 93264602
    }, {
      "filename": "/vendored/lygia/draw/arrows.msl",
      "start": 93264602,
      "end": 93268091
    }, {
      "filename": "/vendored/lygia/draw/axis.glsl",
      "start": 93268091,
      "end": 93269303
    }, {
      "filename": "/vendored/lygia/draw/axis.hlsl",
      "start": 93269303,
      "end": 93270564
    }, {
      "filename": "/vendored/lygia/draw/bridge.glsl",
      "start": 93270564,
      "end": 93271566
    }, {
      "filename": "/vendored/lygia/draw/bridge.hlsl",
      "start": 93271566,
      "end": 93272586
    }, {
      "filename": "/vendored/lygia/draw/bridge.msl",
      "start": 93272586,
      "end": 93273605
    }, {
      "filename": "/vendored/lygia/draw/char.glsl",
      "start": 93273605,
      "end": 93282409
    }, {
      "filename": "/vendored/lygia/draw/circle.glsl",
      "start": 93282409,
      "end": 93283095
    }, {
      "filename": "/vendored/lygia/draw/circle.hlsl",
      "start": 93283095,
      "end": 93283779
    }, {
      "filename": "/vendored/lygia/draw/circle.msl",
      "start": 93283779,
      "end": 93284460
    }, {
      "filename": "/vendored/lygia/draw/colorChecker.glsl",
      "start": 93284460,
      "end": 93288950
    }, {
      "filename": "/vendored/lygia/draw/colorChecker.msl",
      "start": 93288950,
      "end": 93293600
    }, {
      "filename": "/vendored/lygia/draw/colorPicker.glsl",
      "start": 93293600,
      "end": 93295901
    }, {
      "filename": "/vendored/lygia/draw/colorPicker.hlsl",
      "start": 93295901,
      "end": 93298276
    }, {
      "filename": "/vendored/lygia/draw/colorPicker.msl",
      "start": 93298276,
      "end": 93300651
    }, {
      "filename": "/vendored/lygia/draw/digits.glsl",
      "start": 93300651,
      "end": 93307008
    }, {
      "filename": "/vendored/lygia/draw/digits.hlsl",
      "start": 93307008,
      "end": 93313482
    }, {
      "filename": "/vendored/lygia/draw/digits.msl",
      "start": 93313482,
      "end": 93319893
    }, {
      "filename": "/vendored/lygia/draw/fill.glsl",
      "start": 93319893,
      "end": 93320677
    }, {
      "filename": "/vendored/lygia/draw/fill.hlsl",
      "start": 93320677,
      "end": 93321353
    }, {
      "filename": "/vendored/lygia/draw/fill.msl",
      "start": 93321353,
      "end": 93322136
    }, {
      "filename": "/vendored/lygia/draw/flip.glsl",
      "start": 93322136,
      "end": 93322769
    }, {
      "filename": "/vendored/lygia/draw/flip.hlsl",
      "start": 93322769,
      "end": 93323256
    }, {
      "filename": "/vendored/lygia/draw/flip.msl",
      "start": 93323256,
      "end": 93323879
    }, {
      "filename": "/vendored/lygia/draw/hex.glsl",
      "start": 93323879,
      "end": 93324534
    }, {
      "filename": "/vendored/lygia/draw/hex.hlsl",
      "start": 93324534,
      "end": 93325195
    }, {
      "filename": "/vendored/lygia/draw/hex.msl",
      "start": 93325195,
      "end": 93325853
    }, {
      "filename": "/vendored/lygia/draw/line.glsl",
      "start": 93325853,
      "end": 93326484
    }, {
      "filename": "/vendored/lygia/draw/line.hlsl",
      "start": 93326484,
      "end": 93327127
    }, {
      "filename": "/vendored/lygia/draw/matrix.glsl",
      "start": 93327127,
      "end": 93328600
    }, {
      "filename": "/vendored/lygia/draw/matrix.hlsl",
      "start": 93328600,
      "end": 93330178
    }, {
      "filename": "/vendored/lygia/draw/matrix.msl",
      "start": 93330178,
      "end": 93331755
    }, {
      "filename": "/vendored/lygia/draw/point.glsl",
      "start": 93331755,
      "end": 93333738
    }, {
      "filename": "/vendored/lygia/draw/point.hlsl",
      "start": 93333738,
      "end": 93335897
    }, {
      "filename": "/vendored/lygia/draw/point.msl",
      "start": 93335897,
      "end": 93338056
    }, {
      "filename": "/vendored/lygia/draw/rect.glsl",
      "start": 93338056,
      "end": 93338932
    }, {
      "filename": "/vendored/lygia/draw/rect.hlsl",
      "start": 93338932,
      "end": 93339616
    }, {
      "filename": "/vendored/lygia/draw/rect.msl",
      "start": 93339616,
      "end": 93340509
    }, {
      "filename": "/vendored/lygia/draw/stroke.glsl",
      "start": 93340509,
      "end": 93341417
    }, {
      "filename": "/vendored/lygia/draw/stroke.hlsl",
      "start": 93341417,
      "end": 93342292
    }, {
      "filename": "/vendored/lygia/draw/stroke.msl",
      "start": 93342292,
      "end": 93343195
    }, {
      "filename": "/vendored/lygia/draw/stroke.wesl",
      "start": 93343195,
      "end": 93343832
    }, {
      "filename": "/vendored/lygia/draw/stroke.wgsl",
      "start": 93343832,
      "end": 93344469
    }, {
      "filename": "/vendored/lygia/draw/tri.glsl",
      "start": 93344469,
      "end": 93345125
    }, {
      "filename": "/vendored/lygia/draw/tri.hlsl",
      "start": 93345125,
      "end": 93345787
    }, {
      "filename": "/vendored/lygia/draw/tri.msl",
      "start": 93345787,
      "end": 93346446
    }, {
      "filename": "/vendored/lygia/filter/bilateral.glsl",
      "start": 93346446,
      "end": 93349734
    }, {
      "filename": "/vendored/lygia/filter/bilateral.hlsl",
      "start": 93349734,
      "end": 93352522
    }, {
      "filename": "/vendored/lygia/filter/bilinear.glsl",
      "start": 93352522,
      "end": 93354288
    }, {
      "filename": "/vendored/lygia/filter/boxBlur.glsl",
      "start": 93354288,
      "end": 93356478
    }, {
      "filename": "/vendored/lygia/filter/boxBlur.hlsl",
      "start": 93356478,
      "end": 93358476
    }, {
      "filename": "/vendored/lygia/filter/boxBlur.msl",
      "start": 93358476,
      "end": 93360648
    }, {
      "filename": "/vendored/lygia/filter/boxBlur/1D.glsl",
      "start": 93360648,
      "end": 93362709
    }, {
      "filename": "/vendored/lygia/filter/boxBlur/1D.hlsl",
      "start": 93362709,
      "end": 93364489
    }, {
      "filename": "/vendored/lygia/filter/boxBlur/1D.msl",
      "start": 93364489,
      "end": 93366551
    }, {
      "filename": "/vendored/lygia/filter/boxBlur/2D.glsl",
      "start": 93366551,
      "end": 93368991
    }, {
      "filename": "/vendored/lygia/filter/boxBlur/2D.hlsl",
      "start": 93368991,
      "end": 93371109
    }, {
      "filename": "/vendored/lygia/filter/boxBlur/2D.msl",
      "start": 93371109,
      "end": 93373553
    }, {
      "filename": "/vendored/lygia/filter/boxBlur/2D_fast9.glsl",
      "start": 93373553,
      "end": 93375670
    }, {
      "filename": "/vendored/lygia/filter/boxBlur/2D_fast9.hlsl",
      "start": 93375670,
      "end": 93377767
    }, {
      "filename": "/vendored/lygia/filter/boxBlur/2D_fast9.msl",
      "start": 93377767,
      "end": 93379913
    }, {
      "filename": "/vendored/lygia/filter/edge.glsl",
      "start": 93379913,
      "end": 93381268
    }, {
      "filename": "/vendored/lygia/filter/edge.hlsl",
      "start": 93381268,
      "end": 93382565
    }, {
      "filename": "/vendored/lygia/filter/edge/prewitt.glsl",
      "start": 93382565,
      "end": 93384510
    }, {
      "filename": "/vendored/lygia/filter/edge/prewitt.hlsl",
      "start": 93384510,
      "end": 93386418
    }, {
      "filename": "/vendored/lygia/filter/edge/prewitt.wesl",
      "start": 93386418,
      "end": 93387767
    }, {
      "filename": "/vendored/lygia/filter/edge/prewitt.wgsl",
      "start": 93387767,
      "end": 93389120
    }, {
      "filename": "/vendored/lygia/filter/edge/sobel.glsl",
      "start": 93389120,
      "end": 93391034
    }, {
      "filename": "/vendored/lygia/filter/edge/sobel.hlsl",
      "start": 93391034,
      "end": 93392911
    }, {
      "filename": "/vendored/lygia/filter/edge/sobelDirectional.glsl",
      "start": 93392911,
      "end": 93395213
    }, {
      "filename": "/vendored/lygia/filter/edge/sobelDirectional.hlsl",
      "start": 93395213,
      "end": 93397492
    }, {
      "filename": "/vendored/lygia/filter/fibonacciBokeh.glsl",
      "start": 93397492,
      "end": 93399317
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur.glsl",
      "start": 93399317,
      "end": 93401672
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur.hlsl",
      "start": 93401672,
      "end": 93404001
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur.msl",
      "start": 93404001,
      "end": 93406331
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D.glsl",
      "start": 93406331,
      "end": 93408889
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D.hlsl",
      "start": 93408889,
      "end": 93410859
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D.msl",
      "start": 93410859,
      "end": 93413404
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D_fast13.glsl",
      "start": 93413404,
      "end": 93415354
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D_fast13.hlsl",
      "start": 93415354,
      "end": 93417323
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D_fast13.msl",
      "start": 93417323,
      "end": 93419285
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D_fast5.glsl",
      "start": 93419285,
      "end": 93420738
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D_fast5.hlsl",
      "start": 93420738,
      "end": 93422165
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D_fast5.msl",
      "start": 93422165,
      "end": 93423622
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D_fast9.glsl",
      "start": 93423622,
      "end": 93425251
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D_fast9.hlsl",
      "start": 93425251,
      "end": 93426867
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/1D_fast9.msl",
      "start": 93426867,
      "end": 93428504
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/2D.glsl",
      "start": 93428504,
      "end": 93431305
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/2D.hlsl",
      "start": 93431305,
      "end": 93433713
    }, {
      "filename": "/vendored/lygia/filter/gaussianBlur/2D.msl",
      "start": 93433713,
      "end": 93436516
    }, {
      "filename": "/vendored/lygia/filter/jointBilateral.glsl",
      "start": 93436516,
      "end": 93439993
    }, {
      "filename": "/vendored/lygia/filter/kuwahara.glsl",
      "start": 93439993,
      "end": 93446330
    }, {
      "filename": "/vendored/lygia/filter/kuwahara.hlsl",
      "start": 93446330,
      "end": 93450154
    }, {
      "filename": "/vendored/lygia/filter/laplacian.glsl",
      "start": 93450154,
      "end": 93456828
    }, {
      "filename": "/vendored/lygia/filter/laplacian.hlsl",
      "start": 93456828,
      "end": 93463639
    }, {
      "filename": "/vendored/lygia/filter/mean.glsl",
      "start": 93463639,
      "end": 93464876
    }, {
      "filename": "/vendored/lygia/filter/mean.hlsl",
      "start": 93464876,
      "end": 93466133
    }, {
      "filename": "/vendored/lygia/filter/median.glsl",
      "start": 93466133,
      "end": 93468770
    }, {
      "filename": "/vendored/lygia/filter/median.hlsl",
      "start": 93468770,
      "end": 93471382
    }, {
      "filename": "/vendored/lygia/filter/median/2D_fast3.glsl",
      "start": 93471382,
      "end": 93474152
    }, {
      "filename": "/vendored/lygia/filter/median/2D_fast3.hlsl",
      "start": 93474152,
      "end": 93476895
    }, {
      "filename": "/vendored/lygia/filter/median/2D_fast5.glsl",
      "start": 93476895,
      "end": 93480194
    }, {
      "filename": "/vendored/lygia/filter/median/2D_fast5.hlsl",
      "start": 93480194,
      "end": 93483472
    }, {
      "filename": "/vendored/lygia/filter/noiseBlur.glsl",
      "start": 93483472,
      "end": 93486759
    }, {
      "filename": "/vendored/lygia/filter/noiseBlur.hlsl",
      "start": 93486759,
      "end": 93489860
    }, {
      "filename": "/vendored/lygia/filter/radialBlur.glsl",
      "start": 93489860,
      "end": 93491694
    }, {
      "filename": "/vendored/lygia/filter/radialBlur.hlsl",
      "start": 93491694,
      "end": 93493464
    }, {
      "filename": "/vendored/lygia/filter/sharpen.glsl",
      "start": 93493464,
      "end": 93494905
    }, {
      "filename": "/vendored/lygia/filter/sharpen.hlsl",
      "start": 93494905,
      "end": 93496360
    }, {
      "filename": "/vendored/lygia/filter/sharpen/adaptive.glsl",
      "start": 93496360,
      "end": 93508687
    }, {
      "filename": "/vendored/lygia/filter/sharpen/adaptive.hlsl",
      "start": 93508687,
      "end": 93521045
    }, {
      "filename": "/vendored/lygia/filter/sharpen/adaptive.wesl",
      "start": 93521045,
      "end": 93535433
    }, {
      "filename": "/vendored/lygia/filter/sharpen/adaptive.wgsl",
      "start": 93535433,
      "end": 93549821
    }, {
      "filename": "/vendored/lygia/filter/sharpen/contrastAdaptive.glsl",
      "start": 93549821,
      "end": 93553473
    }, {
      "filename": "/vendored/lygia/filter/sharpen/contrastAdaptive.hlsl",
      "start": 93553473,
      "end": 93557087
    }, {
      "filename": "/vendored/lygia/filter/sharpen/fast.glsl",
      "start": 93557087,
      "end": 93559636
    }, {
      "filename": "/vendored/lygia/filter/sharpen/fast.hlsl",
      "start": 93559636,
      "end": 93562227
    }, {
      "filename": "/vendored/lygia/filter/sharpen/fast.wesl",
      "start": 93562227,
      "end": 93563644
    }, {
      "filename": "/vendored/lygia/filter/sharpen/fast.wgsl",
      "start": 93563644,
      "end": 93565061
    }, {
      "filename": "/vendored/lygia/filter/smartDeNoise.glsl",
      "start": 93565061,
      "end": 93567408
    }, {
      "filename": "/vendored/lygia/generative/cnoise.glsl",
      "start": 93567408,
      "end": 93576842
    }, {
      "filename": "/vendored/lygia/generative/cnoise.hlsl",
      "start": 93576842,
      "end": 93586846
    }, {
      "filename": "/vendored/lygia/generative/cnoise.msl",
      "start": 93586846,
      "end": 93596677
    }, {
      "filename": "/vendored/lygia/generative/cnoise.wesl",
      "start": 93596677,
      "end": 93605902
    }, {
      "filename": "/vendored/lygia/generative/cnoise.wgsl",
      "start": 93605902,
      "end": 93615057
    }, {
      "filename": "/vendored/lygia/generative/curl.glsl",
      "start": 93615057,
      "end": 93617646
    }, {
      "filename": "/vendored/lygia/generative/curl.hlsl",
      "start": 93617646,
      "end": 93619611
    }, {
      "filename": "/vendored/lygia/generative/curl.msl",
      "start": 93619611,
      "end": 93622306
    }, {
      "filename": "/vendored/lygia/generative/fbm.glsl",
      "start": 93622306,
      "end": 93625246
    }, {
      "filename": "/vendored/lygia/generative/fbm.hlsl",
      "start": 93625246,
      "end": 93627376
    }, {
      "filename": "/vendored/lygia/generative/fbm.msl",
      "start": 93627376,
      "end": 93630316
    }, {
      "filename": "/vendored/lygia/generative/gerstnerWave.glsl",
      "start": 93630316,
      "end": 93632429
    }, {
      "filename": "/vendored/lygia/generative/gerstnerWave.hlsl",
      "start": 93632429,
      "end": 93634650
    }, {
      "filename": "/vendored/lygia/generative/gerstnerWave.msl",
      "start": 93634650,
      "end": 93636785
    }, {
      "filename": "/vendored/lygia/generative/gnoise.glsl",
      "start": 93636785,
      "end": 93639641
    }, {
      "filename": "/vendored/lygia/generative/gnoise.msl",
      "start": 93639641,
      "end": 93642581
    }, {
      "filename": "/vendored/lygia/generative/noised.glsl",
      "start": 93642581,
      "end": 93645770
    }, {
      "filename": "/vendored/lygia/generative/noised.hlsl",
      "start": 93645770,
      "end": 93648990
    }, {
      "filename": "/vendored/lygia/generative/noised.msl",
      "start": 93648990,
      "end": 93652272
    }, {
      "filename": "/vendored/lygia/generative/noised.wesl",
      "start": 93652272,
      "end": 93655122
    }, {
      "filename": "/vendored/lygia/generative/noised.wgsl",
      "start": 93655122,
      "end": 93657937
    }, {
      "filename": "/vendored/lygia/generative/pnoise.glsl",
      "start": 93657937,
      "end": 93667635
    }, {
      "filename": "/vendored/lygia/generative/pnoise.hlsl",
      "start": 93667635,
      "end": 93677899
    }, {
      "filename": "/vendored/lygia/generative/pnoise.msl",
      "start": 93677899,
      "end": 93688021
    }, {
      "filename": "/vendored/lygia/generative/pnoise.wesl",
      "start": 93688021,
      "end": 93697453
    }, {
      "filename": "/vendored/lygia/generative/pnoise.wgsl",
      "start": 93697453,
      "end": 93706805
    }, {
      "filename": "/vendored/lygia/generative/psrdnoise.glsl",
      "start": 93706805,
      "end": 93728473
    }, {
      "filename": "/vendored/lygia/generative/psrdnoise.hlsl",
      "start": 93728473,
      "end": 93751497
    }, {
      "filename": "/vendored/lygia/generative/psrdnoise.msl",
      "start": 93751497,
      "end": 93774047
    }, {
      "filename": "/vendored/lygia/generative/random.glsl",
      "start": 93774047,
      "end": 93777505
    }, {
      "filename": "/vendored/lygia/generative/random.hlsl",
      "start": 93777505,
      "end": 93781344
    }, {
      "filename": "/vendored/lygia/generative/random.msl",
      "start": 93781344,
      "end": 93784868
    }, {
      "filename": "/vendored/lygia/generative/random.wesl",
      "start": 93784868,
      "end": 93788531
    }, {
      "filename": "/vendored/lygia/generative/random.wgsl",
      "start": 93788531,
      "end": 93792194
    }, {
      "filename": "/vendored/lygia/generative/snoise.glsl",
      "start": 93792194,
      "end": 93799940
    }, {
      "filename": "/vendored/lygia/generative/snoise.hlsl",
      "start": 93799940,
      "end": 93807609
    }, {
      "filename": "/vendored/lygia/generative/snoise.msl",
      "start": 93807609,
      "end": 93815621
    }, {
      "filename": "/vendored/lygia/generative/snoise.wesl",
      "start": 93815621,
      "end": 93823365
    }, {
      "filename": "/vendored/lygia/generative/snoise.wgsl",
      "start": 93823365,
      "end": 93831018
    }, {
      "filename": "/vendored/lygia/generative/srandom.glsl",
      "start": 93831018,
      "end": 93832500
    }, {
      "filename": "/vendored/lygia/generative/srandom.hlsl",
      "start": 93832500,
      "end": 93833295
    }, {
      "filename": "/vendored/lygia/generative/srandom.msl",
      "start": 93833295,
      "end": 93834823
    }, {
      "filename": "/vendored/lygia/generative/srandom.wesl",
      "start": 93834823,
      "end": 93836637
    }, {
      "filename": "/vendored/lygia/generative/srandom.wgsl",
      "start": 93836637,
      "end": 93838440
    }, {
      "filename": "/vendored/lygia/generative/voronoi.glsl",
      "start": 93838440,
      "end": 93839820
    }, {
      "filename": "/vendored/lygia/generative/voronoi.hlsl",
      "start": 93839820,
      "end": 93841163
    }, {
      "filename": "/vendored/lygia/generative/voronoi.msl",
      "start": 93841163,
      "end": 93842572
    }, {
      "filename": "/vendored/lygia/generative/voronoise.glsl",
      "start": 93842572,
      "end": 93844508
    }, {
      "filename": "/vendored/lygia/generative/voronoise.hlsl",
      "start": 93844508,
      "end": 93846028
    }, {
      "filename": "/vendored/lygia/generative/voronoise.msl",
      "start": 93846028,
      "end": 93848012
    }, {
      "filename": "/vendored/lygia/generative/wavelet.glsl",
      "start": 93848012,
      "end": 93849307
    }, {
      "filename": "/vendored/lygia/generative/wavelet.msl",
      "start": 93849307,
      "end": 93850494
    }, {
      "filename": "/vendored/lygia/generative/wavelet.wesl",
      "start": 93850494,
      "end": 93851866
    }, {
      "filename": "/vendored/lygia/generative/wavelet.wgsl",
      "start": 93851866,
      "end": 93853221
    }, {
      "filename": "/vendored/lygia/generative/worley.glsl",
      "start": 93853221,
      "end": 93856157
    }, {
      "filename": "/vendored/lygia/generative/worley.hlsl",
      "start": 93856157,
      "end": 93859022
    }, {
      "filename": "/vendored/lygia/generative/worley.msl",
      "start": 93859022,
      "end": 93860336
    }, {
      "filename": "/vendored/lygia/generative/worley.wesl",
      "start": 93860336,
      "end": 93863274
    }, {
      "filename": "/vendored/lygia/generative/worley.wgsl",
      "start": 93863274,
      "end": 93866156
    }, {
      "filename": "/vendored/lygia/geometry/aabb.cuh",
      "start": 93866156,
      "end": 93866325
    }, {
      "filename": "/vendored/lygia/geometry/aabb.glsl",
      "start": 93866325,
      "end": 93866500
    }, {
      "filename": "/vendored/lygia/geometry/aabb.hlsl",
      "start": 93866500,
      "end": 93866675
    }, {
      "filename": "/vendored/lygia/geometry/aabb/aabb.cuh",
      "start": 93866675,
      "end": 93867100
    }, {
      "filename": "/vendored/lygia/geometry/aabb/aabb.glsl",
      "start": 93867100,
      "end": 93867521
    }, {
      "filename": "/vendored/lygia/geometry/aabb/aabb.hlsl",
      "start": 93867521,
      "end": 93867973
    }, {
      "filename": "/vendored/lygia/geometry/aabb/centroid.cuh",
      "start": 93867973,
      "end": 93868533
    }, {
      "filename": "/vendored/lygia/geometry/aabb/centroid.glsl",
      "start": 93868533,
      "end": 93869027
    }, {
      "filename": "/vendored/lygia/geometry/aabb/centroid.hlsl",
      "start": 93869027,
      "end": 93869515
    }, {
      "filename": "/vendored/lygia/geometry/aabb/contain.cuh",
      "start": 93869515,
      "end": 93870238
    }, {
      "filename": "/vendored/lygia/geometry/aabb/contain.glsl",
      "start": 93870238,
      "end": 93870838
    }, {
      "filename": "/vendored/lygia/geometry/aabb/contain.hlsl",
      "start": 93870838,
      "end": 93871541
    }, {
      "filename": "/vendored/lygia/geometry/aabb/diagonal.cuh",
      "start": 93871541,
      "end": 93872141
    }, {
      "filename": "/vendored/lygia/geometry/aabb/diagonal.glsl",
      "start": 93872141,
      "end": 93872648
    }, {
      "filename": "/vendored/lygia/geometry/aabb/diagonal.hlsl",
      "start": 93872648,
      "end": 93873154
    }, {
      "filename": "/vendored/lygia/geometry/aabb/expand.cuh",
      "start": 93873154,
      "end": 93874219
    }, {
      "filename": "/vendored/lygia/geometry/aabb/expand.glsl",
      "start": 93874219,
      "end": 93875006
    }, {
      "filename": "/vendored/lygia/geometry/aabb/expand.hlsl",
      "start": 93875006,
      "end": 93875788
    }, {
      "filename": "/vendored/lygia/geometry/aabb/intersect.cuh",
      "start": 93875788,
      "end": 93876935
    }, {
      "filename": "/vendored/lygia/geometry/aabb/intersect.glsl",
      "start": 93876935,
      "end": 93878118
    }, {
      "filename": "/vendored/lygia/geometry/aabb/intersect.hlsl",
      "start": 93878118,
      "end": 93879331
    }, {
      "filename": "/vendored/lygia/geometry/aabb/intersection.cuh",
      "start": 93879331,
      "end": 93880056
    }, {
      "filename": "/vendored/lygia/geometry/aabb/square.cuh",
      "start": 93880056,
      "end": 93880775
    }, {
      "filename": "/vendored/lygia/geometry/aabb/square.glsl",
      "start": 93880775,
      "end": 93881445
    }, {
      "filename": "/vendored/lygia/geometry/aabb/square.hlsl",
      "start": 93881445,
      "end": 93882142
    }, {
      "filename": "/vendored/lygia/geometry/triangle.cuh",
      "start": 93882142,
      "end": 93882447
    }, {
      "filename": "/vendored/lygia/geometry/triangle.glsl",
      "start": 93882447,
      "end": 93882762
    }, {
      "filename": "/vendored/lygia/geometry/triangle.hlsl",
      "start": 93882762,
      "end": 93883076
    }, {
      "filename": "/vendored/lygia/geometry/triangle/area.cuh",
      "start": 93883076,
      "end": 93883742
    }, {
      "filename": "/vendored/lygia/geometry/triangle/area.glsl",
      "start": 93883742,
      "end": 93884272
    }, {
      "filename": "/vendored/lygia/geometry/triangle/area.hlsl",
      "start": 93884272,
      "end": 93884803
    }, {
      "filename": "/vendored/lygia/geometry/triangle/barycentric.cuh",
      "start": 93884803,
      "end": 93886511
    }, {
      "filename": "/vendored/lygia/geometry/triangle/barycentric.glsl",
      "start": 93886511,
      "end": 93887976
    }, {
      "filename": "/vendored/lygia/geometry/triangle/barycentric.hlsl",
      "start": 93887976,
      "end": 93889476
    }, {
      "filename": "/vendored/lygia/geometry/triangle/centroid.cuh",
      "start": 93889476,
      "end": 93890086
    }, {
      "filename": "/vendored/lygia/geometry/triangle/centroid.glsl",
      "start": 93890086,
      "end": 93890621
    }, {
      "filename": "/vendored/lygia/geometry/triangle/centroid.hlsl",
      "start": 93890621,
      "end": 93891161
    }, {
      "filename": "/vendored/lygia/geometry/triangle/closestPoint.cuh",
      "start": 93891161,
      "end": 93893636
    }, {
      "filename": "/vendored/lygia/geometry/triangle/closestPoint.glsl",
      "start": 93893636,
      "end": 93895905
    }, {
      "filename": "/vendored/lygia/geometry/triangle/closestPoint.hlsl",
      "start": 93895905,
      "end": 93898220
    }, {
      "filename": "/vendored/lygia/geometry/triangle/contain.cuh",
      "start": 93898220,
      "end": 93899396
    }, {
      "filename": "/vendored/lygia/geometry/triangle/contain.glsl",
      "start": 93899396,
      "end": 93900443
    }, {
      "filename": "/vendored/lygia/geometry/triangle/contain.hlsl",
      "start": 93900443,
      "end": 93901510
    }, {
      "filename": "/vendored/lygia/geometry/triangle/distanceSq.cuh",
      "start": 93901510,
      "end": 93903001
    }, {
      "filename": "/vendored/lygia/geometry/triangle/distanceSq.glsl",
      "start": 93903001,
      "end": 93904284
    }, {
      "filename": "/vendored/lygia/geometry/triangle/distanceSq.hlsl",
      "start": 93904284,
      "end": 93905551
    }, {
      "filename": "/vendored/lygia/geometry/triangle/intersect.cuh",
      "start": 93905551,
      "end": 93906940
    }, {
      "filename": "/vendored/lygia/geometry/triangle/intersect.glsl",
      "start": 93906940,
      "end": 93908052
    }, {
      "filename": "/vendored/lygia/geometry/triangle/intersect.hlsl",
      "start": 93908052,
      "end": 93909187
    }, {
      "filename": "/vendored/lygia/geometry/triangle/normal.cuh",
      "start": 93909187,
      "end": 93909866
    }, {
      "filename": "/vendored/lygia/geometry/triangle/normal.glsl",
      "start": 93909866,
      "end": 93910404
    }, {
      "filename": "/vendored/lygia/geometry/triangle/normal.hlsl",
      "start": 93910404,
      "end": 93910944
    }, {
      "filename": "/vendored/lygia/geometry/triangle/signedDistance.cuh",
      "start": 93910944,
      "end": 93911831
    }, {
      "filename": "/vendored/lygia/geometry/triangle/signedDistance.glsl",
      "start": 93911831,
      "end": 93912517
    }, {
      "filename": "/vendored/lygia/geometry/triangle/signedDistance.hlsl",
      "start": 93912517,
      "end": 93913217
    }, {
      "filename": "/vendored/lygia/geometry/triangle/triangle.cuh",
      "start": 93913217,
      "end": 93913646
    }, {
      "filename": "/vendored/lygia/geometry/triangle/triangle.glsl",
      "start": 93913646,
      "end": 93914073
    }, {
      "filename": "/vendored/lygia/geometry/triangle/triangle.hlsl",
      "start": 93914073,
      "end": 93914502
    }, {
      "filename": "/vendored/lygia/lighting/atmosphere.glsl",
      "start": 93914502,
      "end": 93920602
    }, {
      "filename": "/vendored/lygia/lighting/atmosphere.hlsl",
      "start": 93920602,
      "end": 93926930
    }, {
      "filename": "/vendored/lygia/lighting/blackbody.glsl",
      "start": 93926930,
      "end": 93927462
    }, {
      "filename": "/vendored/lygia/lighting/blackbody.hlsl",
      "start": 93927462,
      "end": 93927998
    }, {
      "filename": "/vendored/lygia/lighting/camera.cuh",
      "start": 93927998,
      "end": 93928484
    }, {
      "filename": "/vendored/lygia/lighting/camera.glsl",
      "start": 93928484,
      "end": 93928954
    }, {
      "filename": "/vendored/lygia/lighting/camera.hlsl",
      "start": 93928954,
      "end": 93929432
    }, {
      "filename": "/vendored/lygia/lighting/common/ashikhmin.glsl",
      "start": 93929432,
      "end": 93929934
    }, {
      "filename": "/vendored/lygia/lighting/common/ashikhmin.hlsl",
      "start": 93929934,
      "end": 93930418
    }, {
      "filename": "/vendored/lygia/lighting/common/beckmann.glsl",
      "start": 93930418,
      "end": 93930894
    }, {
      "filename": "/vendored/lygia/lighting/common/beckmann.hlsl",
      "start": 93930894,
      "end": 93931279
    }, {
      "filename": "/vendored/lygia/lighting/common/charlie.glsl",
      "start": 93931279,
      "end": 93931714
    }, {
      "filename": "/vendored/lygia/lighting/common/charlie.hlsl",
      "start": 93931714,
      "end": 93932131
    }, {
      "filename": "/vendored/lygia/lighting/common/clampNoV.glsl",
      "start": 93932131,
      "end": 93932395
    }, {
      "filename": "/vendored/lygia/lighting/common/clampNoV.hlsl",
      "start": 93932395,
      "end": 93932650
    }, {
      "filename": "/vendored/lygia/lighting/common/envBRDFApprox.glsl",
      "start": 93932650,
      "end": 93933479
    }, {
      "filename": "/vendored/lygia/lighting/common/envBRDFApprox.hlsl",
      "start": 93933479,
      "end": 93934323
    }, {
      "filename": "/vendored/lygia/lighting/common/ggx.glsl",
      "start": 93934323,
      "end": 93936317
    }, {
      "filename": "/vendored/lygia/lighting/common/ggx.hlsl",
      "start": 93936317,
      "end": 93938093
    }, {
      "filename": "/vendored/lygia/lighting/common/ggx.wesl",
      "start": 93938093,
      "end": 93938455
    }, {
      "filename": "/vendored/lygia/lighting/common/ggx.wgsl",
      "start": 93938455,
      "end": 93938817
    }, {
      "filename": "/vendored/lygia/lighting/common/gtaoMultiBounce.glsl",
      "start": 93938817,
      "end": 93939550
    }, {
      "filename": "/vendored/lygia/lighting/common/gtaoMultiBounce.hlsl",
      "start": 93939550,
      "end": 93940311
    }, {
      "filename": "/vendored/lygia/lighting/common/henyeyGreenstein.glsl",
      "start": 93940311,
      "end": 93941251
    }, {
      "filename": "/vendored/lygia/lighting/common/henyeyGreenstein.hlsl",
      "start": 93941251,
      "end": 93942184
    }, {
      "filename": "/vendored/lygia/lighting/common/kelemen.glsl",
      "start": 93942184,
      "end": 93942460
    }, {
      "filename": "/vendored/lygia/lighting/common/kelemen.hlsl",
      "start": 93942460,
      "end": 93942727
    }, {
      "filename": "/vendored/lygia/lighting/common/penner.glsl",
      "start": 93942727,
      "end": 93943550
    }, {
      "filename": "/vendored/lygia/lighting/common/perceptual2linearRoughness.glsl",
      "start": 93943550,
      "end": 93944313
    }, {
      "filename": "/vendored/lygia/lighting/common/perceptual2linearRoughness.hlsl",
      "start": 93944313,
      "end": 93945076
    }, {
      "filename": "/vendored/lygia/lighting/common/preFilteredImportanceSampling.glsl",
      "start": 93945076,
      "end": 93945409
    }, {
      "filename": "/vendored/lygia/lighting/common/preFilteredImportanceSampling.hlsl",
      "start": 93945409,
      "end": 93945742
    }, {
      "filename": "/vendored/lygia/lighting/common/rayleigh.glsl",
      "start": 93945742,
      "end": 93945925
    }, {
      "filename": "/vendored/lygia/lighting/common/rayleigh.hlsl",
      "start": 93945925,
      "end": 93946099
    }, {
      "filename": "/vendored/lygia/lighting/common/schlick.glsl",
      "start": 93946099,
      "end": 93946638
    }, {
      "filename": "/vendored/lygia/lighting/common/schlick.hlsl",
      "start": 93946638,
      "end": 93947112
    }, {
      "filename": "/vendored/lygia/lighting/common/schlick.wesl",
      "start": 93947112,
      "end": 93947220
    }, {
      "filename": "/vendored/lygia/lighting/common/schlick.wgsl",
      "start": 93947220,
      "end": 93947328
    }, {
      "filename": "/vendored/lygia/lighting/common/smithGGXCorrelated.glsl",
      "start": 93947328,
      "end": 93948405
    }, {
      "filename": "/vendored/lygia/lighting/common/smithGGXCorrelated.hlsl",
      "start": 93948405,
      "end": 93949429
    }, {
      "filename": "/vendored/lygia/lighting/common/specularAO.glsl",
      "start": 93949429,
      "end": 93950128
    }, {
      "filename": "/vendored/lygia/lighting/common/specularAO.hlsl",
      "start": 93950128,
      "end": 93950790
    }, {
      "filename": "/vendored/lygia/lighting/debugCube.glsl",
      "start": 93950790,
      "end": 93951352
    }, {
      "filename": "/vendored/lygia/lighting/debugCube.hlsl",
      "start": 93951352,
      "end": 93951895
    }, {
      "filename": "/vendored/lygia/lighting/diffuse.glsl",
      "start": 93951895,
      "end": 93952894
    }, {
      "filename": "/vendored/lygia/lighting/diffuse.hlsl",
      "start": 93952894,
      "end": 93953873
    }, {
      "filename": "/vendored/lygia/lighting/diffuse/burley.glsl",
      "start": 93953873,
      "end": 93955068
    }, {
      "filename": "/vendored/lygia/lighting/diffuse/burley.hlsl",
      "start": 93955068,
      "end": 93956240
    }, {
      "filename": "/vendored/lygia/lighting/diffuse/lambert.glsl",
      "start": 93956240,
      "end": 93957231
    }, {
      "filename": "/vendored/lygia/lighting/diffuse/lambert.hlsl",
      "start": 93957231,
      "end": 93958239
    }, {
      "filename": "/vendored/lygia/lighting/diffuse/orenNayar.glsl",
      "start": 93958239,
      "end": 93959578
    }, {
      "filename": "/vendored/lygia/lighting/diffuse/orenNayar.hlsl",
      "start": 93959578,
      "end": 93960883
    }, {
      "filename": "/vendored/lygia/lighting/diffuse/orenNayar.wesl",
      "start": 93960883,
      "end": 93961706
    }, {
      "filename": "/vendored/lygia/lighting/diffuse/orenNayar.wgsl",
      "start": 93961706,
      "end": 93962529
    }, {
      "filename": "/vendored/lygia/lighting/envMap.glsl",
      "start": 93962529,
      "end": 93965081
    }, {
      "filename": "/vendored/lygia/lighting/envMap.hlsl",
      "start": 93965081,
      "end": 93967344
    }, {
      "filename": "/vendored/lygia/lighting/exposure.glsl",
      "start": 93967344,
      "end": 93967804
    }, {
      "filename": "/vendored/lygia/lighting/exposure.hlsl",
      "start": 93967804,
      "end": 93968264
    }, {
      "filename": "/vendored/lygia/lighting/fakeCube.glsl",
      "start": 93968264,
      "end": 93970871
    }, {
      "filename": "/vendored/lygia/lighting/fakeCube.hlsl",
      "start": 93970871,
      "end": 93971685
    }, {
      "filename": "/vendored/lygia/lighting/fresnel.glsl",
      "start": 93971685,
      "end": 93973092
    }, {
      "filename": "/vendored/lygia/lighting/fresnel.hlsl",
      "start": 93973092,
      "end": 93974430
    }, {
      "filename": "/vendored/lygia/lighting/fresnel.wesl",
      "start": 93974430,
      "end": 93974867
    }, {
      "filename": "/vendored/lygia/lighting/fresnel.wgsl",
      "start": 93974867,
      "end": 93975285
    }, {
      "filename": "/vendored/lygia/lighting/fresnelReflection.glsl",
      "start": 93975285,
      "end": 93979582
    }, {
      "filename": "/vendored/lygia/lighting/fresnelReflection.hlsl",
      "start": 93979582,
      "end": 93984032
    }, {
      "filename": "/vendored/lygia/lighting/fresnelReflection.wesl",
      "start": 93984032,
      "end": 93985110
    }, {
      "filename": "/vendored/lygia/lighting/fresnelReflection.wgsl",
      "start": 93985110,
      "end": 93986186
    }, {
      "filename": "/vendored/lygia/lighting/gooch.glsl",
      "start": 93986186,
      "end": 93989660
    }, {
      "filename": "/vendored/lygia/lighting/gooch.hlsl",
      "start": 93989660,
      "end": 93993508
    }, {
      "filename": "/vendored/lygia/lighting/ior.glsl",
      "start": 93993508,
      "end": 93994674
    }, {
      "filename": "/vendored/lygia/lighting/ior.hlsl",
      "start": 93994674,
      "end": 93995850
    }, {
      "filename": "/vendored/lygia/lighting/ior/2eta.glsl",
      "start": 93995850,
      "end": 93996466
    }, {
      "filename": "/vendored/lygia/lighting/ior/2eta.hlsl",
      "start": 93996466,
      "end": 93997091
    }, {
      "filename": "/vendored/lygia/lighting/ior/2f0.glsl",
      "start": 93997091,
      "end": 93997861
    }, {
      "filename": "/vendored/lygia/lighting/ior/2f0.hlsl",
      "start": 93997861,
      "end": 93998640
    }, {
      "filename": "/vendored/lygia/lighting/ior/reflectance2f0.glsl",
      "start": 93998640,
      "end": 93999056
    }, {
      "filename": "/vendored/lygia/lighting/ior/reflectance2f0.hlsl",
      "start": 93999056,
      "end": 93999472
    }, {
      "filename": "/vendored/lygia/lighting/iridescence.glsl",
      "start": 93999472,
      "end": 94001127
    }, {
      "filename": "/vendored/lygia/lighting/iridescence.hlsl",
      "start": 94001127,
      "end": 94002733
    }, {
      "filename": "/vendored/lygia/lighting/light/attenuation.glsl",
      "start": 94002733,
      "end": 94003489
    }, {
      "filename": "/vendored/lygia/lighting/light/attenuation.hlsl",
      "start": 94003489,
      "end": 94004245
    }, {
      "filename": "/vendored/lygia/lighting/light/directional.glsl",
      "start": 94004245,
      "end": 94004717
    }, {
      "filename": "/vendored/lygia/lighting/light/directional.hlsl",
      "start": 94004717,
      "end": 94005193
    }, {
      "filename": "/vendored/lygia/lighting/light/directionalEvaluate.glsl",
      "start": 94005193,
      "end": 94007461
    }, {
      "filename": "/vendored/lygia/lighting/light/directionalEvaluate.hlsl",
      "start": 94007461,
      "end": 94009738
    }, {
      "filename": "/vendored/lygia/lighting/light/falloff.glsl",
      "start": 94009738,
      "end": 94010277
    }, {
      "filename": "/vendored/lygia/lighting/light/falloff.hlsl",
      "start": 94010277,
      "end": 94010815
    }, {
      "filename": "/vendored/lygia/lighting/light/iblEvaluate.glsl",
      "start": 94010815,
      "end": 94013042
    }, {
      "filename": "/vendored/lygia/lighting/light/iblEvaluate.hlsl",
      "start": 94013042,
      "end": 94015236
    }, {
      "filename": "/vendored/lygia/lighting/light/new.glsl",
      "start": 94015236,
      "end": 94017074
    }, {
      "filename": "/vendored/lygia/lighting/light/new.hlsl",
      "start": 94017074,
      "end": 94018942
    }, {
      "filename": "/vendored/lygia/lighting/light/point.glsl",
      "start": 94018942,
      "end": 94019410
    }, {
      "filename": "/vendored/lygia/lighting/light/point.hlsl",
      "start": 94019410,
      "end": 94019882
    }, {
      "filename": "/vendored/lygia/lighting/light/pointEvaluate.glsl",
      "start": 94019882,
      "end": 94022382
    }, {
      "filename": "/vendored/lygia/lighting/light/pointEvaluate.hlsl",
      "start": 94022382,
      "end": 94024893
    }, {
      "filename": "/vendored/lygia/lighting/light/resolve.glsl",
      "start": 94024893,
      "end": 94025364
    }, {
      "filename": "/vendored/lygia/lighting/light/resolve.hlsl",
      "start": 94025364,
      "end": 94025835
    }, {
      "filename": "/vendored/lygia/lighting/light/spot.glsl",
      "start": 94025835,
      "end": 94028137
    }, {
      "filename": "/vendored/lygia/lighting/light/spot.hlsl",
      "start": 94028137,
      "end": 94030667
    }, {
      "filename": "/vendored/lygia/lighting/material.glsl",
      "start": 94030667,
      "end": 94032706
    }, {
      "filename": "/vendored/lygia/lighting/material.hlsl",
      "start": 94032706,
      "end": 94034714
    }, {
      "filename": "/vendored/lygia/lighting/material/add.glsl",
      "start": 94034714,
      "end": 94036158
    }, {
      "filename": "/vendored/lygia/lighting/material/add.hlsl",
      "start": 94036158,
      "end": 94037607
    }, {
      "filename": "/vendored/lygia/lighting/material/albedo.glsl",
      "start": 94037607,
      "end": 94039491
    }, {
      "filename": "/vendored/lygia/lighting/material/albedo.hlsl",
      "start": 94039491,
      "end": 94041373
    }, {
      "filename": "/vendored/lygia/lighting/material/emissive.glsl",
      "start": 94041373,
      "end": 94042701
    }, {
      "filename": "/vendored/lygia/lighting/material/emissive.hlsl",
      "start": 94042701,
      "end": 94044054
    }, {
      "filename": "/vendored/lygia/lighting/material/metallic.glsl",
      "start": 94044054,
      "end": 94046331
    }, {
      "filename": "/vendored/lygia/lighting/material/metallic.hlsl",
      "start": 94046331,
      "end": 94048621
    }, {
      "filename": "/vendored/lygia/lighting/material/multiply.glsl",
      "start": 94048621,
      "end": 94049903
    }, {
      "filename": "/vendored/lygia/lighting/material/multiply.hlsl",
      "start": 94049903,
      "end": 94051185
    }, {
      "filename": "/vendored/lygia/lighting/material/new.glsl",
      "start": 94051185,
      "end": 94055539
    }, {
      "filename": "/vendored/lygia/lighting/material/new.hlsl",
      "start": 94055539,
      "end": 94059804
    }, {
      "filename": "/vendored/lygia/lighting/material/normal.glsl",
      "start": 94059804,
      "end": 94061686
    }, {
      "filename": "/vendored/lygia/lighting/material/normal.hlsl",
      "start": 94061686,
      "end": 94063571
    }, {
      "filename": "/vendored/lygia/lighting/material/occlusion.glsl",
      "start": 94063571,
      "end": 94065102
    }, {
      "filename": "/vendored/lygia/lighting/material/occlusion.hlsl",
      "start": 94065102,
      "end": 94066639
    }, {
      "filename": "/vendored/lygia/lighting/material/roughness.glsl",
      "start": 94066639,
      "end": 94068771
    }, {
      "filename": "/vendored/lygia/lighting/material/roughness.hlsl",
      "start": 94068771,
      "end": 94070911
    }, {
      "filename": "/vendored/lygia/lighting/material/shininess.glsl",
      "start": 94070911,
      "end": 94071895
    }, {
      "filename": "/vendored/lygia/lighting/material/shininess.hlsl",
      "start": 94071895,
      "end": 94072863
    }, {
      "filename": "/vendored/lygia/lighting/material/specular.glsl",
      "start": 94072863,
      "end": 94074137
    }, {
      "filename": "/vendored/lygia/lighting/material/specular.hlsl",
      "start": 94074137,
      "end": 94075433
    }, {
      "filename": "/vendored/lygia/lighting/material/zero.glsl",
      "start": 94075433,
      "end": 94077159
    }, {
      "filename": "/vendored/lygia/lighting/material/zero.hlsl",
      "start": 94077159,
      "end": 94078986
    }, {
      "filename": "/vendored/lygia/lighting/medium.glsl",
      "start": 94078986,
      "end": 94079242
    }, {
      "filename": "/vendored/lygia/lighting/medium.hlsl",
      "start": 94079242,
      "end": 94079498
    }, {
      "filename": "/vendored/lygia/lighting/medium/new.glsl",
      "start": 94079498,
      "end": 94080335
    }, {
      "filename": "/vendored/lygia/lighting/medium/new.hlsl",
      "start": 94080335,
      "end": 94081183
    }, {
      "filename": "/vendored/lygia/lighting/pbr.glsl",
      "start": 94081183,
      "end": 94083858
    }, {
      "filename": "/vendored/lygia/lighting/pbr.hlsl",
      "start": 94083858,
      "end": 94086508
    }, {
      "filename": "/vendored/lygia/lighting/pbrClearCoat.glsl",
      "start": 94086508,
      "end": 94092572
    }, {
      "filename": "/vendored/lygia/lighting/pbrClearCoat.hlsl",
      "start": 94092572,
      "end": 94098661
    }, {
      "filename": "/vendored/lygia/lighting/pbrGlass.glsl",
      "start": 94098661,
      "end": 94102311
    }, {
      "filename": "/vendored/lygia/lighting/pbrGlass.hlsl",
      "start": 94102311,
      "end": 94105999
    }, {
      "filename": "/vendored/lygia/lighting/pbrLittle.glsl",
      "start": 94105999,
      "end": 94109496
    }, {
      "filename": "/vendored/lygia/lighting/pbrLittle.hlsl",
      "start": 94109496,
      "end": 94113022
    }, {
      "filename": "/vendored/lygia/lighting/ray.cuh",
      "start": 94113022,
      "end": 94113422
    }, {
      "filename": "/vendored/lygia/lighting/ray.glsl",
      "start": 94113422,
      "end": 94113818
    }, {
      "filename": "/vendored/lygia/lighting/ray.hlsl",
      "start": 94113818,
      "end": 94114218
    }, {
      "filename": "/vendored/lygia/lighting/ray/cast.glsl",
      "start": 94114218,
      "end": 94114732
    }, {
      "filename": "/vendored/lygia/lighting/ray/direction.glsl",
      "start": 94114732,
      "end": 94116358
    }, {
      "filename": "/vendored/lygia/lighting/ray/new.glsl",
      "start": 94116358,
      "end": 94117676
    }, {
      "filename": "/vendored/lygia/lighting/raymarch.glsl",
      "start": 94117676,
      "end": 94122823
    }, {
      "filename": "/vendored/lygia/lighting/raymarch.hlsl",
      "start": 94122823,
      "end": 94128185
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/ao.cuh",
      "start": 94128185,
      "end": 94129106
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/ao.glsl",
      "start": 94129106,
      "end": 94130287
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/ao.hlsl",
      "start": 94130287,
      "end": 94131440
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/cast.cuh",
      "start": 94131440,
      "end": 94132863
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/cast.glsl",
      "start": 94132863,
      "end": 94134037
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/cast.hlsl",
      "start": 94134037,
      "end": 94135206
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/cast.wesl",
      "start": 94135206,
      "end": 94135589
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/cast.wgsl",
      "start": 94135589,
      "end": 94135972
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/fog.glsl",
      "start": 94135972,
      "end": 94138058
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/fog.hlsl",
      "start": 94138058,
      "end": 94140145
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/glass.glsl",
      "start": 94140145,
      "end": 94150362
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/glass.hlsl",
      "start": 94150362,
      "end": 94160510
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/map.cuh",
      "start": 94160510,
      "end": 94160965
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/map.glsl",
      "start": 94160965,
      "end": 94161503
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/map.hlsl",
      "start": 94161503,
      "end": 94161996
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/normal.cuh",
      "start": 94161996,
      "end": 94164163
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/normal.glsl",
      "start": 94164163,
      "end": 94165432
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/normal.hlsl",
      "start": 94165432,
      "end": 94166662
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/normal.wesl",
      "start": 94166662,
      "end": 94167281
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/normal.wgsl",
      "start": 94167281,
      "end": 94167900
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/render.glsl",
      "start": 94167900,
      "end": 94170019
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/render.hlsl",
      "start": 94170019,
      "end": 94172155
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/shading.glsl",
      "start": 94172155,
      "end": 94174767
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/shading.hlsl",
      "start": 94174767,
      "end": 94177330
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/softShadow.cuh",
      "start": 94177330,
      "end": 94178831
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/softShadow.glsl",
      "start": 94178831,
      "end": 94180450
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/softShadow.hlsl",
      "start": 94180450,
      "end": 94182009
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/volume.glsl",
      "start": 94182009,
      "end": 94187128
    }, {
      "filename": "/vendored/lygia/lighting/raymarch/volume.hlsl",
      "start": 94187128,
      "end": 94192318
    }, {
      "filename": "/vendored/lygia/lighting/reflection.glsl",
      "start": 94192318,
      "end": 94194043
    }, {
      "filename": "/vendored/lygia/lighting/reflection.hlsl",
      "start": 94194043,
      "end": 94195725
    }, {
      "filename": "/vendored/lygia/lighting/shadingData/new.glsl",
      "start": 94195725,
      "end": 94197546
    }, {
      "filename": "/vendored/lygia/lighting/shadingData/new.hlsl",
      "start": 94197546,
      "end": 94199394
    }, {
      "filename": "/vendored/lygia/lighting/shadingData/shadingData.glsl",
      "start": 94199394,
      "end": 94199939
    }, {
      "filename": "/vendored/lygia/lighting/shadingData/shadingData.hlsl",
      "start": 94199939,
      "end": 94200508
    }, {
      "filename": "/vendored/lygia/lighting/shadow.glsl",
      "start": 94200508,
      "end": 94201636
    }, {
      "filename": "/vendored/lygia/lighting/shadow.hlsl",
      "start": 94201636,
      "end": 94202557
    }, {
      "filename": "/vendored/lygia/lighting/specular.glsl",
      "start": 94202557,
      "end": 94203803
    }, {
      "filename": "/vendored/lygia/lighting/specular.hlsl",
      "start": 94203803,
      "end": 94205033
    }, {
      "filename": "/vendored/lygia/lighting/specular/beckmann.glsl",
      "start": 94205033,
      "end": 94205250
    }, {
      "filename": "/vendored/lygia/lighting/specular/beckmann.hlsl",
      "start": 94205250,
      "end": 94205467
    }, {
      "filename": "/vendored/lygia/lighting/specular/blinnPhong.glsl",
      "start": 94205467,
      "end": 94206253
    }, {
      "filename": "/vendored/lygia/lighting/specular/blinnPhong.hlsl",
      "start": 94206253,
      "end": 94207039
    }, {
      "filename": "/vendored/lygia/lighting/specular/cookTorrance.glsl",
      "start": 94207039,
      "end": 94208064
    }, {
      "filename": "/vendored/lygia/lighting/specular/cookTorrance.hlsl",
      "start": 94208064,
      "end": 94209012
    }, {
      "filename": "/vendored/lygia/lighting/specular/cookTorrance.wesl",
      "start": 94209012,
      "end": 94209619
    }, {
      "filename": "/vendored/lygia/lighting/specular/cookTorrance.wgsl",
      "start": 94209619,
      "end": 94210214
    }, {
      "filename": "/vendored/lygia/lighting/specular/gaussian.glsl",
      "start": 94210214,
      "end": 94210614
    }, {
      "filename": "/vendored/lygia/lighting/specular/gaussian.hlsl",
      "start": 94210614,
      "end": 94211014
    }, {
      "filename": "/vendored/lygia/lighting/specular/importanceSampling.glsl",
      "start": 94211014,
      "end": 94213439
    }, {
      "filename": "/vendored/lygia/lighting/specular/importanceSampling.hlsl",
      "start": 94213439,
      "end": 94215974
    }, {
      "filename": "/vendored/lygia/lighting/specular/phong.glsl",
      "start": 94215974,
      "end": 94216879
    }, {
      "filename": "/vendored/lygia/lighting/specular/phong.hlsl",
      "start": 94216879,
      "end": 94217792
    }, {
      "filename": "/vendored/lygia/lighting/specular/ward.glsl",
      "start": 94217792,
      "end": 94218663
    }, {
      "filename": "/vendored/lygia/lighting/specular/ward.hlsl",
      "start": 94218663,
      "end": 94219494
    }, {
      "filename": "/vendored/lygia/lighting/sphereMap.glsl",
      "start": 94219494,
      "end": 94220530
    }, {
      "filename": "/vendored/lygia/lighting/sphereMap.hlsl",
      "start": 94220530,
      "end": 94221492
    }, {
      "filename": "/vendored/lygia/lighting/sphericalHarmonics.glsl",
      "start": 94221492,
      "end": 94223224
    }, {
      "filename": "/vendored/lygia/lighting/sphericalHarmonics.hlsl",
      "start": 94223224,
      "end": 94224924
    }, {
      "filename": "/vendored/lygia/lighting/ssao.glsl",
      "start": 94224924,
      "end": 94229920
    }, {
      "filename": "/vendored/lygia/lighting/ssr.glsl",
      "start": 94229920,
      "end": 94234462
    }, {
      "filename": "/vendored/lygia/lighting/toMetallic.glsl",
      "start": 94234462,
      "end": 94236044
    }, {
      "filename": "/vendored/lygia/lighting/toMetallic.hlsl",
      "start": 94236044,
      "end": 94237560
    }, {
      "filename": "/vendored/lygia/lighting/toShininess.glsl",
      "start": 94237560,
      "end": 94238249
    }, {
      "filename": "/vendored/lygia/lighting/toShininess.hlsl",
      "start": 94238249,
      "end": 94238922
    }, {
      "filename": "/vendored/lygia/lighting/toShininess.wesl",
      "start": 94238922,
      "end": 94239536
    }, {
      "filename": "/vendored/lygia/lighting/toShininess.wgsl",
      "start": 94239536,
      "end": 94240150
    }, {
      "filename": "/vendored/lygia/lighting/transparent.glsl",
      "start": 94240150,
      "end": 94244066
    }, {
      "filename": "/vendored/lygia/lighting/transparent.hlsl",
      "start": 94244066,
      "end": 94248089
    }, {
      "filename": "/vendored/lygia/lighting/volumetricLightScattering.glsl",
      "start": 94248089,
      "end": 94253230
    }, {
      "filename": "/vendored/lygia/lighting/wavelength.glsl",
      "start": 94253230,
      "end": 94253713
    }, {
      "filename": "/vendored/lygia/lighting/wavelength.hlsl",
      "start": 94253713,
      "end": 94254198
    }, {
      "filename": "/vendored/lygia/math.cuh",
      "start": 94254198,
      "end": 94255917
    }, {
      "filename": "/vendored/lygia/math.glsl",
      "start": 94255917,
      "end": 94257706
    }, {
      "filename": "/vendored/lygia/math.hlsl",
      "start": 94257706,
      "end": 94259356
    }, {
      "filename": "/vendored/lygia/math.msl",
      "start": 94259356,
      "end": 94261155
    }, {
      "filename": "/vendored/lygia/math.wgsl",
      "start": 94261155,
      "end": 94262519
    }, {
      "filename": "/vendored/lygia/math/aafloor.glsl",
      "start": 94262519,
      "end": 94263664
    }, {
      "filename": "/vendored/lygia/math/aafloor.hlsl",
      "start": 94263664,
      "end": 94264474
    }, {
      "filename": "/vendored/lygia/math/aafloor.msl",
      "start": 94264474,
      "end": 94265419
    }, {
      "filename": "/vendored/lygia/math/aafloor.wesl",
      "start": 94265419,
      "end": 94266007
    }, {
      "filename": "/vendored/lygia/math/aafloor.wgsl",
      "start": 94266007,
      "end": 94266590
    }, {
      "filename": "/vendored/lygia/math/aafract.glsl",
      "start": 94266590,
      "end": 94267726
    }, {
      "filename": "/vendored/lygia/math/aafract.hlsl",
      "start": 94267726,
      "end": 94268524
    }, {
      "filename": "/vendored/lygia/math/aafract.msl",
      "start": 94268524,
      "end": 94269397
    }, {
      "filename": "/vendored/lygia/math/aafract.wesl",
      "start": 94269397,
      "end": 94269916
    }, {
      "filename": "/vendored/lygia/math/aafract.wgsl",
      "start": 94269916,
      "end": 94270430
    }, {
      "filename": "/vendored/lygia/math/aamirror.glsl",
      "start": 94270430,
      "end": 94270906
    }, {
      "filename": "/vendored/lygia/math/aamirror.hlsl",
      "start": 94270906,
      "end": 94271382
    }, {
      "filename": "/vendored/lygia/math/aastep.glsl",
      "start": 94271382,
      "end": 94272397
    }, {
      "filename": "/vendored/lygia/math/aastep.hlsl",
      "start": 94272397,
      "end": 94273128
    }, {
      "filename": "/vendored/lygia/math/aastep.msl",
      "start": 94273128,
      "end": 94273826
    }, {
      "filename": "/vendored/lygia/math/aastep.wesl",
      "start": 94273826,
      "end": 94274183
    }, {
      "filename": "/vendored/lygia/math/aastep.wgsl",
      "start": 94274183,
      "end": 94274540
    }, {
      "filename": "/vendored/lygia/math/abs.cuh",
      "start": 94274540,
      "end": 94275790
    }, {
      "filename": "/vendored/lygia/math/absi.glsl",
      "start": 94275790,
      "end": 94276200
    }, {
      "filename": "/vendored/lygia/math/absi.msl",
      "start": 94276200,
      "end": 94276610
    }, {
      "filename": "/vendored/lygia/math/adaptiveThreshold.cuh",
      "start": 94276610,
      "end": 94277326
    }, {
      "filename": "/vendored/lygia/math/adaptiveThreshold.glsl",
      "start": 94277326,
      "end": 94277946
    }, {
      "filename": "/vendored/lygia/math/adaptiveThreshold.hlsl",
      "start": 94277946,
      "end": 94278604
    }, {
      "filename": "/vendored/lygia/math/adaptiveThreshold.msl",
      "start": 94278604,
      "end": 94279209
    }, {
      "filename": "/vendored/lygia/math/adaptiveThreshold.wesl",
      "start": 94279209,
      "end": 94279583
    }, {
      "filename": "/vendored/lygia/math/adaptiveThreshold.wgsl",
      "start": 94279583,
      "end": 94279957
    }, {
      "filename": "/vendored/lygia/math/asin.cuh",
      "start": 94279957,
      "end": 94280822
    }, {
      "filename": "/vendored/lygia/math/atan2.glsl",
      "start": 94280822,
      "end": 94281203
    }, {
      "filename": "/vendored/lygia/math/atan2.msl",
      "start": 94281203,
      "end": 94281599
    }, {
      "filename": "/vendored/lygia/math/bump.cuh",
      "start": 94281599,
      "end": 94282499
    }, {
      "filename": "/vendored/lygia/math/bump.glsl",
      "start": 94282499,
      "end": 94283315
    }, {
      "filename": "/vendored/lygia/math/bump.hlsl",
      "start": 94283315,
      "end": 94284014
    }, {
      "filename": "/vendored/lygia/math/bump.msl",
      "start": 94284014,
      "end": 94284846
    }, {
      "filename": "/vendored/lygia/math/bump.wesl",
      "start": 94284846,
      "end": 94285471
    }, {
      "filename": "/vendored/lygia/math/bump.wgsl",
      "start": 94285471,
      "end": 94286096
    }, {
      "filename": "/vendored/lygia/math/clamp.cuh",
      "start": 94286096,
      "end": 94290107
    }, {
      "filename": "/vendored/lygia/math/const.cuh",
      "start": 94290107,
      "end": 94291016
    }, {
      "filename": "/vendored/lygia/math/const.glsl",
      "start": 94291016,
      "end": 94292390
    }, {
      "filename": "/vendored/lygia/math/const.hlsl",
      "start": 94292390,
      "end": 94293763
    }, {
      "filename": "/vendored/lygia/math/const.msl",
      "start": 94293763,
      "end": 94295135
    }, {
      "filename": "/vendored/lygia/math/const.wgsl",
      "start": 94295135,
      "end": 94296166
    }, {
      "filename": "/vendored/lygia/math/consts.wesl",
      "start": 94296166,
      "end": 94297197
    }, {
      "filename": "/vendored/lygia/math/cross.cuh",
      "start": 94297197,
      "end": 94297845
    }, {
      "filename": "/vendored/lygia/math/cubic.cuh",
      "start": 94297845,
      "end": 94299733
    }, {
      "filename": "/vendored/lygia/math/cubic.glsl",
      "start": 94299733,
      "end": 94301308
    }, {
      "filename": "/vendored/lygia/math/cubic.hlsl",
      "start": 94301308,
      "end": 94302985
    }, {
      "filename": "/vendored/lygia/math/cubic.msl",
      "start": 94302985,
      "end": 94304560
    }, {
      "filename": "/vendored/lygia/math/cubic.wesl",
      "start": 94304560,
      "end": 94304891
    }, {
      "filename": "/vendored/lygia/math/cubic.wgsl",
      "start": 94304891,
      "end": 94305222
    }, {
      "filename": "/vendored/lygia/math/cubicMix.glsl",
      "start": 94305222,
      "end": 94306127
    }, {
      "filename": "/vendored/lygia/math/cubicMix.hlsl",
      "start": 94306127,
      "end": 94307092
    }, {
      "filename": "/vendored/lygia/math/cubicMix.msl",
      "start": 94307092,
      "end": 94308056
    }, {
      "filename": "/vendored/lygia/math/cubicMix.wesl",
      "start": 94308056,
      "end": 94308774
    }, {
      "filename": "/vendored/lygia/math/cubicMix.wgsl",
      "start": 94308774,
      "end": 94309423
    }, {
      "filename": "/vendored/lygia/math/decimate.cuh",
      "start": 94309423,
      "end": 94310037
    }, {
      "filename": "/vendored/lygia/math/decimate.glsl",
      "start": 94310037,
      "end": 94311008
    }, {
      "filename": "/vendored/lygia/math/decimate.hlsl",
      "start": 94311008,
      "end": 94311916
    }, {
      "filename": "/vendored/lygia/math/decimate.msl",
      "start": 94311916,
      "end": 94312935
    }, {
      "filename": "/vendored/lygia/math/decimate.wesl",
      "start": 94312935,
      "end": 94313534
    }, {
      "filename": "/vendored/lygia/math/decimate.wgsl",
      "start": 94313534,
      "end": 94314133
    }, {
      "filename": "/vendored/lygia/math/dist.glsl",
      "start": 94314133,
      "end": 94316445
    }, {
      "filename": "/vendored/lygia/math/dist.hlsl",
      "start": 94316445,
      "end": 94318303
    }, {
      "filename": "/vendored/lygia/math/dist.wesl",
      "start": 94318303,
      "end": 94320738
    }, {
      "filename": "/vendored/lygia/math/dist.wgsl",
      "start": 94320738,
      "end": 94323173
    }, {
      "filename": "/vendored/lygia/math/dot.cuh",
      "start": 94323173,
      "end": 94324680
    }, {
      "filename": "/vendored/lygia/math/equal.msl",
      "start": 94324680,
      "end": 94325292
    }, {
      "filename": "/vendored/lygia/math/fcos.glsl",
      "start": 94325292,
      "end": 94325658
    }, {
      "filename": "/vendored/lygia/math/fcos.hlsl",
      "start": 94325658,
      "end": 94326024
    }, {
      "filename": "/vendored/lygia/math/floor.cuh",
      "start": 94326024,
      "end": 94326915
    }, {
      "filename": "/vendored/lygia/math/frac.cuh",
      "start": 94326915,
      "end": 94327835
    }, {
      "filename": "/vendored/lygia/math/frac.glsl",
      "start": 94327835,
      "end": 94328366
    }, {
      "filename": "/vendored/lygia/math/frac.msl",
      "start": 94328366,
      "end": 94328913
    }, {
      "filename": "/vendored/lygia/math/fract.cuh",
      "start": 94328913,
      "end": 94329870
    }, {
      "filename": "/vendored/lygia/math/fract.hlsl",
      "start": 94329870,
      "end": 94330405
    }, {
      "filename": "/vendored/lygia/math/gain.cuh",
      "start": 94330405,
      "end": 94330950
    }, {
      "filename": "/vendored/lygia/math/gain.glsl",
      "start": 94330950,
      "end": 94331539
    }, {
      "filename": "/vendored/lygia/math/gain.hlsl",
      "start": 94331539,
      "end": 94332013
    }, {
      "filename": "/vendored/lygia/math/gain.msl",
      "start": 94332013,
      "end": 94332602
    }, {
      "filename": "/vendored/lygia/math/gain.wesl",
      "start": 94332602,
      "end": 94333006
    }, {
      "filename": "/vendored/lygia/math/gain.wgsl",
      "start": 94333006,
      "end": 94333410
    }, {
      "filename": "/vendored/lygia/math/gaussian.cuh",
      "start": 94333410,
      "end": 94334432
    }, {
      "filename": "/vendored/lygia/math/gaussian.glsl",
      "start": 94334432,
      "end": 94335333
    }, {
      "filename": "/vendored/lygia/math/gaussian.hlsl",
      "start": 94335333,
      "end": 94336243
    }, {
      "filename": "/vendored/lygia/math/gaussian.msl",
      "start": 94336243,
      "end": 94337162
    }, {
      "filename": "/vendored/lygia/math/gaussian.msl 2",
      "start": 94337162,
      "end": 94338081
    }, {
      "filename": "/vendored/lygia/math/gaussian.wesl",
      "start": 94338081,
      "end": 94338814
    }, {
      "filename": "/vendored/lygia/math/gaussian.wgsl",
      "start": 94338814,
      "end": 94339547
    }, {
      "filename": "/vendored/lygia/math/grad4.cuh",
      "start": 94339547,
      "end": 94340441
    }, {
      "filename": "/vendored/lygia/math/grad4.glsl",
      "start": 94340441,
      "end": 94340916
    }, {
      "filename": "/vendored/lygia/math/grad4.hlsl",
      "start": 94340916,
      "end": 94341490
    }, {
      "filename": "/vendored/lygia/math/grad4.msl",
      "start": 94341490,
      "end": 94342010
    }, {
      "filename": "/vendored/lygia/math/grad4.wesl",
      "start": 94342010,
      "end": 94342436
    }, {
      "filename": "/vendored/lygia/math/grad4.wgsl",
      "start": 94342436,
      "end": 94342862
    }, {
      "filename": "/vendored/lygia/math/greaterThan.cuh",
      "start": 94342862,
      "end": 94343496
    }, {
      "filename": "/vendored/lygia/math/greaterThan.hlsl",
      "start": 94343496,
      "end": 94343958
    }, {
      "filename": "/vendored/lygia/math/greaterThan.msl",
      "start": 94343958,
      "end": 94344607
    }, {
      "filename": "/vendored/lygia/math/greaterThanEqual.msl",
      "start": 94344607,
      "end": 94345294
    }, {
      "filename": "/vendored/lygia/math/hammersley.glsl",
      "start": 94345294,
      "end": 94346331
    }, {
      "filename": "/vendored/lygia/math/hammersley.hlsl",
      "start": 94346331,
      "end": 94347343
    }, {
      "filename": "/vendored/lygia/math/highPass.cuh",
      "start": 94347343,
      "end": 94347860
    }, {
      "filename": "/vendored/lygia/math/highPass.glsl",
      "start": 94347860,
      "end": 94348337
    }, {
      "filename": "/vendored/lygia/math/highPass.hlsl",
      "start": 94348337,
      "end": 94348831
    }, {
      "filename": "/vendored/lygia/math/highPass.msl",
      "start": 94348831,
      "end": 94349302
    }, {
      "filename": "/vendored/lygia/math/highPass.wesl",
      "start": 94349302,
      "end": 94349674
    }, {
      "filename": "/vendored/lygia/math/highPass.wgsl",
      "start": 94349674,
      "end": 94350046
    }, {
      "filename": "/vendored/lygia/math/inside.glsl",
      "start": 94350046,
      "end": 94351171
    }, {
      "filename": "/vendored/lygia/math/inside.hlsl",
      "start": 94351171,
      "end": 94352332
    }, {
      "filename": "/vendored/lygia/math/inside.msl",
      "start": 94352332,
      "end": 94353492
    }, {
      "filename": "/vendored/lygia/math/inside.wesl",
      "start": 94353492,
      "end": 94354351
    }, {
      "filename": "/vendored/lygia/math/inside.wgsl",
      "start": 94354351,
      "end": 94355210
    }, {
      "filename": "/vendored/lygia/math/invCubic.cuh",
      "start": 94355210,
      "end": 94355959
    }, {
      "filename": "/vendored/lygia/math/invCubic.glsl",
      "start": 94355959,
      "end": 94356600
    }, {
      "filename": "/vendored/lygia/math/invCubic.hlsl",
      "start": 94356600,
      "end": 94357154
    }, {
      "filename": "/vendored/lygia/math/invCubic.msl",
      "start": 94357154,
      "end": 94357807
    }, {
      "filename": "/vendored/lygia/math/invCubic.wesl",
      "start": 94357807,
      "end": 94358212
    }, {
      "filename": "/vendored/lygia/math/invCubic.wgsl",
      "start": 94358212,
      "end": 94358617
    }, {
      "filename": "/vendored/lygia/math/invQuartic.cuh",
      "start": 94358617,
      "end": 94359332
    }, {
      "filename": "/vendored/lygia/math/invQuartic.glsl",
      "start": 94359332,
      "end": 94359961
    }, {
      "filename": "/vendored/lygia/math/invQuartic.hlsl",
      "start": 94359961,
      "end": 94360511
    }, {
      "filename": "/vendored/lygia/math/invQuartic.msl",
      "start": 94360511,
      "end": 94361152
    }, {
      "filename": "/vendored/lygia/math/invQuartic.wesl",
      "start": 94361152,
      "end": 94361538
    }, {
      "filename": "/vendored/lygia/math/invQuartic.wgsl",
      "start": 94361538,
      "end": 94361924
    }, {
      "filename": "/vendored/lygia/math/inverse.glsl",
      "start": 94361924,
      "end": 94364646
    }, {
      "filename": "/vendored/lygia/math/inverse.msl",
      "start": 94364646,
      "end": 94367557
    }, {
      "filename": "/vendored/lygia/math/inverse.wesl",
      "start": 94367557,
      "end": 94368319
    }, {
      "filename": "/vendored/lygia/math/inverse.wgsl",
      "start": 94368319,
      "end": 94369081
    }, {
      "filename": "/vendored/lygia/math/length.cuh",
      "start": 94369081,
      "end": 94369860
    }, {
      "filename": "/vendored/lygia/math/lengthSq.cuh",
      "start": 94369860,
      "end": 94370535
    }, {
      "filename": "/vendored/lygia/math/lengthSq.glsl",
      "start": 94370535,
      "end": 94371079
    }, {
      "filename": "/vendored/lygia/math/lengthSq.hlsl",
      "start": 94371079,
      "end": 94371641
    }, {
      "filename": "/vendored/lygia/math/lengthSq.msl",
      "start": 94371641,
      "end": 94372194
    }, {
      "filename": "/vendored/lygia/math/lengthSq.wesl",
      "start": 94372194,
      "end": 94372648
    }, {
      "filename": "/vendored/lygia/math/lengthSq.wgsl",
      "start": 94372648,
      "end": 94373102
    }, {
      "filename": "/vendored/lygia/math/lerp.cuh",
      "start": 94373102,
      "end": 94374422
    }, {
      "filename": "/vendored/lygia/math/lerp.glsl",
      "start": 94374422,
      "end": 94375017
    }, {
      "filename": "/vendored/lygia/math/lerp.msl",
      "start": 94375017,
      "end": 94375612
    }, {
      "filename": "/vendored/lygia/math/lessThan.msl",
      "start": 94375612,
      "end": 94376240
    }, {
      "filename": "/vendored/lygia/math/lessThanEqual.msl",
      "start": 94376240,
      "end": 94376906
    }, {
      "filename": "/vendored/lygia/math/make.cuh",
      "start": 94376906,
      "end": 94383601
    }, {
      "filename": "/vendored/lygia/math/map.cuh",
      "start": 94383601,
      "end": 94385458
    }, {
      "filename": "/vendored/lygia/math/map.glsl",
      "start": 94385458,
      "end": 94386954
    }, {
      "filename": "/vendored/lygia/math/map.hlsl",
      "start": 94386954,
      "end": 94388612
    }, {
      "filename": "/vendored/lygia/math/map.msl",
      "start": 94388612,
      "end": 94390140
    }, {
      "filename": "/vendored/lygia/math/map.wesl",
      "start": 94390140,
      "end": 94391003
    }, {
      "filename": "/vendored/lygia/math/map.wgsl",
      "start": 94391003,
      "end": 94391866
    }, {
      "filename": "/vendored/lygia/math/max.cuh",
      "start": 94391866,
      "end": 94393683
    }, {
      "filename": "/vendored/lygia/math/min.cuh",
      "start": 94393683,
      "end": 94395493
    }, {
      "filename": "/vendored/lygia/math/mirror.cuh",
      "start": 94395493,
      "end": 94396197
    }, {
      "filename": "/vendored/lygia/math/mirror.glsl",
      "start": 94396197,
      "end": 94396877
    }, {
      "filename": "/vendored/lygia/math/mirror.hlsl",
      "start": 94396877,
      "end": 94397482
    }, {
      "filename": "/vendored/lygia/math/mirror.msl",
      "start": 94397482,
      "end": 94398187
    }, {
      "filename": "/vendored/lygia/math/mirror.wesl",
      "start": 94398187,
      "end": 94398666
    }, {
      "filename": "/vendored/lygia/math/mirror.wgsl",
      "start": 94398666,
      "end": 94399145
    }, {
      "filename": "/vendored/lygia/math/mix.cuh",
      "start": 94399145,
      "end": 94400484
    }, {
      "filename": "/vendored/lygia/math/mix.hlsl",
      "start": 94400484,
      "end": 94402854
    }, {
      "filename": "/vendored/lygia/math/mmax.cuh",
      "start": 94402854,
      "end": 94403918
    }, {
      "filename": "/vendored/lygia/math/mmax.glsl",
      "start": 94403918,
      "end": 94404810
    }, {
      "filename": "/vendored/lygia/math/mmax.hlsl",
      "start": 94404810,
      "end": 94405721
    }, {
      "filename": "/vendored/lygia/math/mmax.msl",
      "start": 94405721,
      "end": 94406604
    }, {
      "filename": "/vendored/lygia/math/mmax.wesl",
      "start": 94406604,
      "end": 94407107
    }, {
      "filename": "/vendored/lygia/math/mmax.wgsl",
      "start": 94407107,
      "end": 94407610
    }, {
      "filename": "/vendored/lygia/math/mmin.cuh",
      "start": 94407610,
      "end": 94408640
    }, {
      "filename": "/vendored/lygia/math/mmin.glsl",
      "start": 94408640,
      "end": 94409545
    }, {
      "filename": "/vendored/lygia/math/mmin.hlsl",
      "start": 94409545,
      "end": 94410455
    }, {
      "filename": "/vendored/lygia/math/mmin.msl",
      "start": 94410455,
      "end": 94411342
    }, {
      "filename": "/vendored/lygia/math/mmin.wesl",
      "start": 94411342,
      "end": 94411845
    }, {
      "filename": "/vendored/lygia/math/mmin.wgsl",
      "start": 94411845,
      "end": 94412348
    }, {
      "filename": "/vendored/lygia/math/mmix.glsl",
      "start": 94412348,
      "end": 94416852
    }, {
      "filename": "/vendored/lygia/math/mmix.msl",
      "start": 94416852,
      "end": 94421368
    }, {
      "filename": "/vendored/lygia/math/mod.cuh",
      "start": 94421368,
      "end": 94422949
    }, {
      "filename": "/vendored/lygia/math/mod.hlsl",
      "start": 94422949,
      "end": 94423749
    }, {
      "filename": "/vendored/lygia/math/mod.msl",
      "start": 94423749,
      "end": 94424894
    }, {
      "filename": "/vendored/lygia/math/mod.wesl",
      "start": 94424894,
      "end": 94425438
    }, {
      "filename": "/vendored/lygia/math/mod.wgsl",
      "start": 94425438,
      "end": 94425982
    }, {
      "filename": "/vendored/lygia/math/mod2.glsl",
      "start": 94425982,
      "end": 94426491
    }, {
      "filename": "/vendored/lygia/math/mod2.hlsl",
      "start": 94426491,
      "end": 94427049
    }, {
      "filename": "/vendored/lygia/math/mod2.msl",
      "start": 94427049,
      "end": 94427599
    }, {
      "filename": "/vendored/lygia/math/mod289.cuh",
      "start": 94427599,
      "end": 94428278
    }, {
      "filename": "/vendored/lygia/math/mod289.glsl",
      "start": 94428278,
      "end": 94428768
    }, {
      "filename": "/vendored/lygia/math/mod289.hlsl",
      "start": 94428768,
      "end": 94429258
    }, {
      "filename": "/vendored/lygia/math/mod289.msl",
      "start": 94429258,
      "end": 94429760
    }, {
      "filename": "/vendored/lygia/math/mod289.wesl",
      "start": 94429760,
      "end": 94430142
    }, {
      "filename": "/vendored/lygia/math/mod289.wgsl",
      "start": 94430142,
      "end": 94430524
    }, {
      "filename": "/vendored/lygia/math/modi.glsl",
      "start": 94430524,
      "end": 94430864
    }, {
      "filename": "/vendored/lygia/math/normalize.cuh",
      "start": 94430864,
      "end": 94431881
    }, {
      "filename": "/vendored/lygia/math/notEqual.msl",
      "start": 94431881,
      "end": 94432512
    }, {
      "filename": "/vendored/lygia/math/nyquist.glsl",
      "start": 94432512,
      "end": 94433238
    }, {
      "filename": "/vendored/lygia/math/nyquist.hlsl",
      "start": 94433238,
      "end": 94433965
    }, {
      "filename": "/vendored/lygia/math/operations.cuh",
      "start": 94433965,
      "end": 94457450
    }, {
      "filename": "/vendored/lygia/math/pack.glsl",
      "start": 94457450,
      "end": 94458278
    }, {
      "filename": "/vendored/lygia/math/pack.hlsl",
      "start": 94458278,
      "end": 94459156
    }, {
      "filename": "/vendored/lygia/math/pack.msl",
      "start": 94459156,
      "end": 94460011
    }, {
      "filename": "/vendored/lygia/math/pack.wesl",
      "start": 94460011,
      "end": 94460701
    }, {
      "filename": "/vendored/lygia/math/pack.wgsl",
      "start": 94460701,
      "end": 94461391
    }, {
      "filename": "/vendored/lygia/math/parabola.cuh",
      "start": 94461391,
      "end": 94461890
    }, {
      "filename": "/vendored/lygia/math/parabola.glsl",
      "start": 94461890,
      "end": 94462460
    }, {
      "filename": "/vendored/lygia/math/parabola.hlsl",
      "start": 94462460,
      "end": 94462902
    }, {
      "filename": "/vendored/lygia/math/parabola.msl",
      "start": 94462902,
      "end": 94463466
    }, {
      "filename": "/vendored/lygia/math/parabola.wesl",
      "start": 94463466,
      "end": 94463815
    }, {
      "filename": "/vendored/lygia/math/parabola.wgsl",
      "start": 94463815,
      "end": 94464164
    }, {
      "filename": "/vendored/lygia/math/permute.cuh",
      "start": 94464164,
      "end": 94464790
    }, {
      "filename": "/vendored/lygia/math/permute.glsl",
      "start": 94464790,
      "end": 94465403
    }, {
      "filename": "/vendored/lygia/math/permute.hlsl",
      "start": 94465403,
      "end": 94465905
    }, {
      "filename": "/vendored/lygia/math/permute.msl",
      "start": 94465905,
      "end": 94466529
    }, {
      "filename": "/vendored/lygia/math/permute.wesl",
      "start": 94466529,
      "end": 94466968
    }, {
      "filename": "/vendored/lygia/math/permute.wgsl",
      "start": 94466968,
      "end": 94467362
    }, {
      "filename": "/vendored/lygia/math/pow.cuh",
      "start": 94467362,
      "end": 94468633
    }, {
      "filename": "/vendored/lygia/math/pow2.cuh",
      "start": 94468633,
      "end": 94469356
    }, {
      "filename": "/vendored/lygia/math/pow2.glsl",
      "start": 94469356,
      "end": 94469934
    }, {
      "filename": "/vendored/lygia/math/pow2.hlsl",
      "start": 94469934,
      "end": 94470513
    }, {
      "filename": "/vendored/lygia/math/pow2.msl",
      "start": 94470513,
      "end": 94471103
    }, {
      "filename": "/vendored/lygia/math/pow3.cuh",
      "start": 94471103,
      "end": 94471841
    }, {
      "filename": "/vendored/lygia/math/pow3.glsl",
      "start": 94471841,
      "end": 94472435
    }, {
      "filename": "/vendored/lygia/math/pow3.hlsl",
      "start": 94472435,
      "end": 94473029
    }, {
      "filename": "/vendored/lygia/math/pow3.msl",
      "start": 94473029,
      "end": 94473635
    }, {
      "filename": "/vendored/lygia/math/pow5.cuh",
      "start": 94473635,
      "end": 94474491
    }, {
      "filename": "/vendored/lygia/math/pow5.glsl",
      "start": 94474491,
      "end": 94475197
    }, {
      "filename": "/vendored/lygia/math/pow5.hlsl",
      "start": 94475197,
      "end": 94475909
    }, {
      "filename": "/vendored/lygia/math/pow5.msl",
      "start": 94475909,
      "end": 94476633
    }, {
      "filename": "/vendored/lygia/math/pow7.cuh",
      "start": 94476633,
      "end": 94477435
    }, {
      "filename": "/vendored/lygia/math/pow7.glsl",
      "start": 94477435,
      "end": 94478093
    }, {
      "filename": "/vendored/lygia/math/pow7.hlsl",
      "start": 94478093,
      "end": 94478751
    }, {
      "filename": "/vendored/lygia/math/pow7.msl",
      "start": 94478751,
      "end": 94479421
    }, {
      "filename": "/vendored/lygia/math/powFast.cuh",
      "start": 94479421,
      "end": 94479948
    }, {
      "filename": "/vendored/lygia/math/powFast.glsl",
      "start": 94479948,
      "end": 94480437
    }, {
      "filename": "/vendored/lygia/math/powFast.hlsl",
      "start": 94480437,
      "end": 94480926
    }, {
      "filename": "/vendored/lygia/math/powFast.msl",
      "start": 94480926,
      "end": 94481409
    }, {
      "filename": "/vendored/lygia/math/powFast.wesl",
      "start": 94481409,
      "end": 94482020
    }, {
      "filename": "/vendored/lygia/math/powFast.wgsl",
      "start": 94482020,
      "end": 94482631
    }, {
      "filename": "/vendored/lygia/math/quartic.cuh",
      "start": 94482631,
      "end": 94483241
    }, {
      "filename": "/vendored/lygia/math/quartic.glsl",
      "start": 94483241,
      "end": 94483811
    }, {
      "filename": "/vendored/lygia/math/quartic.hlsl",
      "start": 94483811,
      "end": 94484297
    }, {
      "filename": "/vendored/lygia/math/quartic.msl",
      "start": 94484297,
      "end": 94484879
    }, {
      "filename": "/vendored/lygia/math/quartic.wesl",
      "start": 94484879,
      "end": 94485212
    }, {
      "filename": "/vendored/lygia/math/quartic.wgsl",
      "start": 94485212,
      "end": 94485545
    }, {
      "filename": "/vendored/lygia/math/quat.glsl",
      "start": 94485545,
      "end": 94487741
    }, {
      "filename": "/vendored/lygia/math/quat.hlsl",
      "start": 94487741,
      "end": 94489955
    }, {
      "filename": "/vendored/lygia/math/quat.msl",
      "start": 94489955,
      "end": 94492167
    }, {
      "filename": "/vendored/lygia/math/quat.wesl",
      "start": 94492167,
      "end": 94494116
    }, {
      "filename": "/vendored/lygia/math/quat.wgsl",
      "start": 94494116,
      "end": 94496121
    }, {
      "filename": "/vendored/lygia/math/quat/2mat3.glsl",
      "start": 94496121,
      "end": 94497084
    }, {
      "filename": "/vendored/lygia/math/quat/2mat3.hlsl",
      "start": 94497084,
      "end": 94498061
    }, {
      "filename": "/vendored/lygia/math/quat/2mat3.msl",
      "start": 94498061,
      "end": 94499029
    }, {
      "filename": "/vendored/lygia/math/quat/2mat3.wgsl",
      "start": 94499029,
      "end": 94499925
    }, {
      "filename": "/vendored/lygia/math/quat/2mat4.glsl",
      "start": 94499925,
      "end": 94500467
    }, {
      "filename": "/vendored/lygia/math/quat/2mat4.hlsl",
      "start": 94500467,
      "end": 94501013
    }, {
      "filename": "/vendored/lygia/math/quat/2mat4.msl",
      "start": 94501013,
      "end": 94501552
    }, {
      "filename": "/vendored/lygia/math/quat/2mat4.wgsl",
      "start": 94501552,
      "end": 94502039
    }, {
      "filename": "/vendored/lygia/math/quat/add.glsl",
      "start": 94502039,
      "end": 94502527
    }, {
      "filename": "/vendored/lygia/math/quat/add.hlsl",
      "start": 94502527,
      "end": 94503015
    }, {
      "filename": "/vendored/lygia/math/quat/add.msl",
      "start": 94503015,
      "end": 94503502
    }, {
      "filename": "/vendored/lygia/math/quat/add.wgsl",
      "start": 94503502,
      "end": 94503934
    }, {
      "filename": "/vendored/lygia/math/quat/conj.glsl",
      "start": 94503934,
      "end": 94504412
    }, {
      "filename": "/vendored/lygia/math/quat/conj.hlsl",
      "start": 94504412,
      "end": 94504890
    }, {
      "filename": "/vendored/lygia/math/quat/conj.msl",
      "start": 94504890,
      "end": 94505367
    }, {
      "filename": "/vendored/lygia/math/quat/conj.wgsl",
      "start": 94505367,
      "end": 94505784
    }, {
      "filename": "/vendored/lygia/math/quat/div.glsl",
      "start": 94505784,
      "end": 94506267
    }, {
      "filename": "/vendored/lygia/math/quat/div.hlsl",
      "start": 94506267,
      "end": 94506750
    }, {
      "filename": "/vendored/lygia/math/quat/div.msl",
      "start": 94506750,
      "end": 94507232
    }, {
      "filename": "/vendored/lygia/math/quat/div.wgsl",
      "start": 94507232,
      "end": 94507656
    }, {
      "filename": "/vendored/lygia/math/quat/identity.glsl",
      "start": 94507656,
      "end": 94508094
    }, {
      "filename": "/vendored/lygia/math/quat/identity.hlsl",
      "start": 94508094,
      "end": 94508532
    }, {
      "filename": "/vendored/lygia/math/quat/identity.msl",
      "start": 94508532,
      "end": 94508969
    }, {
      "filename": "/vendored/lygia/math/quat/identity.wgsl",
      "start": 94508969,
      "end": 94509358
    }, {
      "filename": "/vendored/lygia/math/quat/inverse.glsl",
      "start": 94509358,
      "end": 94509901
    }, {
      "filename": "/vendored/lygia/math/quat/inverse.hlsl",
      "start": 94509901,
      "end": 94510444
    }, {
      "filename": "/vendored/lygia/math/quat/inverse.msl",
      "start": 94510444,
      "end": 94510984
    }, {
      "filename": "/vendored/lygia/math/quat/inverse.wgsl",
      "start": 94510984,
      "end": 94511481
    }, {
      "filename": "/vendored/lygia/math/quat/length.glsl",
      "start": 94511481,
      "end": 94511971
    }, {
      "filename": "/vendored/lygia/math/quat/length.hlsl",
      "start": 94511971,
      "end": 94512461
    }, {
      "filename": "/vendored/lygia/math/quat/length.msl",
      "start": 94512461,
      "end": 94512950
    }, {
      "filename": "/vendored/lygia/math/quat/length.wgsl",
      "start": 94512950,
      "end": 94513393
    }, {
      "filename": "/vendored/lygia/math/quat/lengthSq.glsl",
      "start": 94513393,
      "end": 94513904
    }, {
      "filename": "/vendored/lygia/math/quat/lengthSq.hlsl",
      "start": 94513904,
      "end": 94514415
    }, {
      "filename": "/vendored/lygia/math/quat/lengthSq.msl",
      "start": 94514415,
      "end": 94514925
    }, {
      "filename": "/vendored/lygia/math/quat/lengthSq.wgsl",
      "start": 94514925,
      "end": 94515363
    }, {
      "filename": "/vendored/lygia/math/quat/lerp.glsl",
      "start": 94515363,
      "end": 94517201
    }, {
      "filename": "/vendored/lygia/math/quat/lerp.hlsl",
      "start": 94517201,
      "end": 94519039
    }, {
      "filename": "/vendored/lygia/math/quat/lerp.msl",
      "start": 94519039,
      "end": 94520877
    }, {
      "filename": "/vendored/lygia/math/quat/lerp.wgsl",
      "start": 94520877,
      "end": 94522639
    }, {
      "filename": "/vendored/lygia/math/quat/mul.glsl",
      "start": 94522639,
      "end": 94523345
    }, {
      "filename": "/vendored/lygia/math/quat/mul.hlsl",
      "start": 94523345,
      "end": 94524051
    }, {
      "filename": "/vendored/lygia/math/quat/mul.msl",
      "start": 94524051,
      "end": 94524756
    }, {
      "filename": "/vendored/lygia/math/quat/mul.wgsl",
      "start": 94524756,
      "end": 94525331
    }, {
      "filename": "/vendored/lygia/math/quat/neg.glsl",
      "start": 94525331,
      "end": 94525790
    }, {
      "filename": "/vendored/lygia/math/quat/neg.hlsl",
      "start": 94525790,
      "end": 94526249
    }, {
      "filename": "/vendored/lygia/math/quat/neg.msl",
      "start": 94526249,
      "end": 94526707
    }, {
      "filename": "/vendored/lygia/math/quat/neg.wgsl",
      "start": 94526707,
      "end": 94527107
    }, {
      "filename": "/vendored/lygia/math/quat/norm.glsl",
      "start": 94527107,
      "end": 94527605
    }, {
      "filename": "/vendored/lygia/math/quat/norm.hlsl",
      "start": 94527605,
      "end": 94528103
    }, {
      "filename": "/vendored/lygia/math/quat/norm.msl",
      "start": 94528103,
      "end": 94528599
    }, {
      "filename": "/vendored/lygia/math/quat/norm.wgsl",
      "start": 94528599,
      "end": 94529058
    }, {
      "filename": "/vendored/lygia/math/quat/sub.glsl",
      "start": 94529058,
      "end": 94529550
    }, {
      "filename": "/vendored/lygia/math/quat/sub.hlsl",
      "start": 94529550,
      "end": 94530042
    }, {
      "filename": "/vendored/lygia/math/quat/sub.msl",
      "start": 94530042,
      "end": 94530533
    }, {
      "filename": "/vendored/lygia/math/quat/sub.wgsl",
      "start": 94530533,
      "end": 94530969
    }, {
      "filename": "/vendored/lygia/math/quat/type.glsl",
      "start": 94530969,
      "end": 94531305
    }, {
      "filename": "/vendored/lygia/math/quat/type.hlsl",
      "start": 94531305,
      "end": 94531643
    }, {
      "filename": "/vendored/lygia/math/quat/type.msl",
      "start": 94531643,
      "end": 94531982
    }, {
      "filename": "/vendored/lygia/math/quintic.cuh",
      "start": 94531982,
      "end": 94532657
    }, {
      "filename": "/vendored/lygia/math/quintic.glsl",
      "start": 94532657,
      "end": 94533283
    }, {
      "filename": "/vendored/lygia/math/quintic.hlsl",
      "start": 94533283,
      "end": 94533826
    }, {
      "filename": "/vendored/lygia/math/quintic.msl",
      "start": 94533826,
      "end": 94534464
    }, {
      "filename": "/vendored/lygia/math/quintic.wesl",
      "start": 94534464,
      "end": 94534854
    }, {
      "filename": "/vendored/lygia/math/quintic.wgsl",
      "start": 94534854,
      "end": 94535244
    }, {
      "filename": "/vendored/lygia/math/radians.msl",
      "start": 94535244,
      "end": 94535720
    }, {
      "filename": "/vendored/lygia/math/reflect.cuh",
      "start": 94535720,
      "end": 94536357
    }, {
      "filename": "/vendored/lygia/math/rotate2d.glsl",
      "start": 94536357,
      "end": 94536866
    }, {
      "filename": "/vendored/lygia/math/rotate2d.hlsl",
      "start": 94536866,
      "end": 94537387
    }, {
      "filename": "/vendored/lygia/math/rotate2d.msl",
      "start": 94537387,
      "end": 94537938
    }, {
      "filename": "/vendored/lygia/math/rotate2d.wesl",
      "start": 94537938,
      "end": 94538385
    }, {
      "filename": "/vendored/lygia/math/rotate2d.wgsl",
      "start": 94538385,
      "end": 94538832
    }, {
      "filename": "/vendored/lygia/math/rotate3d.glsl",
      "start": 94538832,
      "end": 94539699
    }, {
      "filename": "/vendored/lygia/math/rotate3d.hlsl",
      "start": 94539699,
      "end": 94540657
    }, {
      "filename": "/vendored/lygia/math/rotate3d.msl",
      "start": 94540657,
      "end": 94541540
    }, {
      "filename": "/vendored/lygia/math/rotate3d.wesl",
      "start": 94541540,
      "end": 94542278
    }, {
      "filename": "/vendored/lygia/math/rotate3d.wgsl",
      "start": 94542278,
      "end": 94543015
    }, {
      "filename": "/vendored/lygia/math/rotate3dX.glsl",
      "start": 94543015,
      "end": 94543597
    }, {
      "filename": "/vendored/lygia/math/rotate3dX.hlsl",
      "start": 94543597,
      "end": 94544205
    }, {
      "filename": "/vendored/lygia/math/rotate3dX.msl",
      "start": 94544205,
      "end": 94544811
    }, {
      "filename": "/vendored/lygia/math/rotate3dX.wesl",
      "start": 94544811,
      "end": 94545316
    }, {
      "filename": "/vendored/lygia/math/rotate3dX.wgsl",
      "start": 94545316,
      "end": 94545821
    }, {
      "filename": "/vendored/lygia/math/rotate3dY.glsl",
      "start": 94545821,
      "end": 94546398
    }, {
      "filename": "/vendored/lygia/math/rotate3dY.hlsl",
      "start": 94546398,
      "end": 94547001
    }, {
      "filename": "/vendored/lygia/math/rotate3dY.msl",
      "start": 94547001,
      "end": 94547622
    }, {
      "filename": "/vendored/lygia/math/rotate3dY.wesl",
      "start": 94547622,
      "end": 94548129
    }, {
      "filename": "/vendored/lygia/math/rotate3dY.wgsl",
      "start": 94548129,
      "end": 94548636
    }, {
      "filename": "/vendored/lygia/math/rotate3dZ.glsl",
      "start": 94548636,
      "end": 94549213
    }, {
      "filename": "/vendored/lygia/math/rotate3dZ.hlsl",
      "start": 94549213,
      "end": 94549816
    }, {
      "filename": "/vendored/lygia/math/rotate3dZ.msl",
      "start": 94549816,
      "end": 94550417
    }, {
      "filename": "/vendored/lygia/math/rotate3dZ.wesl",
      "start": 94550417,
      "end": 94550922
    }, {
      "filename": "/vendored/lygia/math/rotate3dZ.wgsl",
      "start": 94550922,
      "end": 94551427
    }, {
      "filename": "/vendored/lygia/math/rotate4d.glsl",
      "start": 94551427,
      "end": 94552357
    }, {
      "filename": "/vendored/lygia/math/rotate4d.hlsl",
      "start": 94552357,
      "end": 94553479
    }, {
      "filename": "/vendored/lygia/math/rotate4d.msl",
      "start": 94553479,
      "end": 94554493
    }, {
      "filename": "/vendored/lygia/math/rotate4d.wesl",
      "start": 94554493,
      "end": 94555370
    }, {
      "filename": "/vendored/lygia/math/rotate4d.wgsl",
      "start": 94555370,
      "end": 94556247
    }, {
      "filename": "/vendored/lygia/math/rotate4dX.glsl",
      "start": 94556247,
      "end": 94556867
    }, {
      "filename": "/vendored/lygia/math/rotate4dX.hlsl",
      "start": 94556867,
      "end": 94557519
    }, {
      "filename": "/vendored/lygia/math/rotate4dX.msl",
      "start": 94557519,
      "end": 94558165
    }, {
      "filename": "/vendored/lygia/math/rotate4dX.wesl",
      "start": 94558165,
      "end": 94558711
    }, {
      "filename": "/vendored/lygia/math/rotate4dX.wgsl",
      "start": 94558711,
      "end": 94559257
    }, {
      "filename": "/vendored/lygia/math/rotate4dY.glsl",
      "start": 94559257,
      "end": 94559871
    }, {
      "filename": "/vendored/lygia/math/rotate4dY.hlsl",
      "start": 94559871,
      "end": 94560517
    }, {
      "filename": "/vendored/lygia/math/rotate4dY.msl",
      "start": 94560517,
      "end": 94561157
    }, {
      "filename": "/vendored/lygia/math/rotate4dY.wesl",
      "start": 94561157,
      "end": 94561702
    }, {
      "filename": "/vendored/lygia/math/rotate4dY.wgsl",
      "start": 94561702,
      "end": 94562247
    }, {
      "filename": "/vendored/lygia/math/rotate4dZ.glsl",
      "start": 94562247,
      "end": 94562881
    }, {
      "filename": "/vendored/lygia/math/rotate4dZ.hlsl",
      "start": 94562881,
      "end": 94563527
    }, {
      "filename": "/vendored/lygia/math/rotate4dZ.msl",
      "start": 94563527,
      "end": 94564167
    }, {
      "filename": "/vendored/lygia/math/rotate4dZ.wesl",
      "start": 94564167,
      "end": 94564713
    }, {
      "filename": "/vendored/lygia/math/rotate4dZ.wgsl",
      "start": 94564713,
      "end": 94565259
    }, {
      "filename": "/vendored/lygia/math/round.glsl",
      "start": 94565259,
      "end": 94565915
    }, {
      "filename": "/vendored/lygia/math/round.msl",
      "start": 94565915,
      "end": 94566595
    }, {
      "filename": "/vendored/lygia/math/round.wesl",
      "start": 94566595,
      "end": 94567178
    }, {
      "filename": "/vendored/lygia/math/round.wgsl",
      "start": 94567178,
      "end": 94567761
    }, {
      "filename": "/vendored/lygia/math/saturate.cuh",
      "start": 94567761,
      "end": 94568587
    }, {
      "filename": "/vendored/lygia/math/saturate.glsl",
      "start": 94568587,
      "end": 94569195
    }, {
      "filename": "/vendored/lygia/math/saturate.msl",
      "start": 94569195,
      "end": 94569589
    }, {
      "filename": "/vendored/lygia/math/saturate.msl 2",
      "start": 94569589,
      "end": 94570209
    }, {
      "filename": "/vendored/lygia/math/saturateMediump.cuh",
      "start": 94570209,
      "end": 94570971
    }, {
      "filename": "/vendored/lygia/math/saturateMediump.glsl",
      "start": 94570971,
      "end": 94571714
    }, {
      "filename": "/vendored/lygia/math/saturateMediump.hlsl",
      "start": 94571714,
      "end": 94572469
    }, {
      "filename": "/vendored/lygia/math/saturateMediump.msl",
      "start": 94572469,
      "end": 94573224
    }, {
      "filename": "/vendored/lygia/math/scale2d.glsl",
      "start": 94573224,
      "end": 94573829
    }, {
      "filename": "/vendored/lygia/math/scale2d.hlsl",
      "start": 94573829,
      "end": 94574470
    }, {
      "filename": "/vendored/lygia/math/scale2d.msl",
      "start": 94574470,
      "end": 94575199
    }, {
      "filename": "/vendored/lygia/math/scale2d.wesl",
      "start": 94575199,
      "end": 94575589
    }, {
      "filename": "/vendored/lygia/math/scale2d.wgsl",
      "start": 94575589,
      "end": 94575979
    }, {
      "filename": "/vendored/lygia/math/scale3d.glsl",
      "start": 94575979,
      "end": 94576792
    }, {
      "filename": "/vendored/lygia/math/scale3d.hlsl",
      "start": 94576792,
      "end": 94577665
    }, {
      "filename": "/vendored/lygia/math/scale3d.msl",
      "start": 94577665,
      "end": 94578602
    }, {
      "filename": "/vendored/lygia/math/scale3d.wesl",
      "start": 94578602,
      "end": 94579071
    }, {
      "filename": "/vendored/lygia/math/scale3d.wgsl",
      "start": 94579071,
      "end": 94579540
    }, {
      "filename": "/vendored/lygia/math/scale4d.glsl",
      "start": 94579540,
      "end": 94580891
    }, {
      "filename": "/vendored/lygia/math/scale4d.hlsl",
      "start": 94580891,
      "end": 94582298
    }, {
      "filename": "/vendored/lygia/math/scale4d.msl",
      "start": 94582298,
      "end": 94583837
    }, {
      "filename": "/vendored/lygia/math/scale4d.wesl",
      "start": 94583837,
      "end": 94584364
    }, {
      "filename": "/vendored/lygia/math/scale4d.wgsl",
      "start": 94584364,
      "end": 94584891
    }, {
      "filename": "/vendored/lygia/math/select.glsl",
      "start": 94584891,
      "end": 94585746
    }, {
      "filename": "/vendored/lygia/math/select.hlsl",
      "start": 94585746,
      "end": 94586637
    }, {
      "filename": "/vendored/lygia/math/select.msl",
      "start": 94586637,
      "end": 94587525
    }, {
      "filename": "/vendored/lygia/math/sign.cuh",
      "start": 94587525,
      "end": 94588091
    }, {
      "filename": "/vendored/lygia/math/sin.cuh",
      "start": 94588091,
      "end": 94588919
    }, {
      "filename": "/vendored/lygia/math/smootherstep.cuh",
      "start": 94588919,
      "end": 94590144
    }, {
      "filename": "/vendored/lygia/math/smootherstep.glsl",
      "start": 94590144,
      "end": 94591074
    }, {
      "filename": "/vendored/lygia/math/smootherstep.hlsl",
      "start": 94591074,
      "end": 94592095
    }, {
      "filename": "/vendored/lygia/math/smootherstep.msl",
      "start": 94592095,
      "end": 94593071
    }, {
      "filename": "/vendored/lygia/math/smootherstep.wesl",
      "start": 94593071,
      "end": 94593875
    }, {
      "filename": "/vendored/lygia/math/smootherstep.wgsl",
      "start": 94593875,
      "end": 94594655
    }, {
      "filename": "/vendored/lygia/math/smoothstep.cuh",
      "start": 94594655,
      "end": 94596151
    }, {
      "filename": "/vendored/lygia/math/sqrt.cuh",
      "start": 94596151,
      "end": 94597020
    }, {
      "filename": "/vendored/lygia/math/step.cuh",
      "start": 94597020,
      "end": 94598663
    }, {
      "filename": "/vendored/lygia/math/sum.cuh",
      "start": 94598663,
      "end": 94599921
    }, {
      "filename": "/vendored/lygia/math/sum.glsl",
      "start": 94599921,
      "end": 94600476
    }, {
      "filename": "/vendored/lygia/math/sum.hlsl",
      "start": 94600476,
      "end": 94601043
    }, {
      "filename": "/vendored/lygia/math/sum.msl",
      "start": 94601043,
      "end": 94601610
    }, {
      "filename": "/vendored/lygia/math/sum.wesl",
      "start": 94601610,
      "end": 94602106
    }, {
      "filename": "/vendored/lygia/math/sum.wgsl",
      "start": 94602106,
      "end": 94602602
    }, {
      "filename": "/vendored/lygia/math/taylorInvSqrt.cuh",
      "start": 94602602,
      "end": 94603336
    }, {
      "filename": "/vendored/lygia/math/taylorInvSqrt.glsl",
      "start": 94603336,
      "end": 94603894
    }, {
      "filename": "/vendored/lygia/math/taylorInvSqrt.hlsl",
      "start": 94603894,
      "end": 94604476
    }, {
      "filename": "/vendored/lygia/math/taylorInvSqrt.msl",
      "start": 94604476,
      "end": 94605046
    }, {
      "filename": "/vendored/lygia/math/taylorInvSqrt.wesl",
      "start": 94605046,
      "end": 94605499
    }, {
      "filename": "/vendored/lygia/math/taylorInvSqrt.wgsl",
      "start": 94605499,
      "end": 94605952
    }, {
      "filename": "/vendored/lygia/math/toMat3.glsl",
      "start": 94605952,
      "end": 94606473
    }, {
      "filename": "/vendored/lygia/math/toMat4.glsl",
      "start": 94606473,
      "end": 94607025
    }, {
      "filename": "/vendored/lygia/math/toMat4.hlsl",
      "start": 94607025,
      "end": 94607617
    }, {
      "filename": "/vendored/lygia/math/toMat4.msl",
      "start": 94607617,
      "end": 94608267
    }, {
      "filename": "/vendored/lygia/math/toMat4.wesl",
      "start": 94608267,
      "end": 94608802
    }, {
      "filename": "/vendored/lygia/math/toMat4.wgsl",
      "start": 94608802,
      "end": 94609337
    }, {
      "filename": "/vendored/lygia/math/translate4d.glsl",
      "start": 94609337,
      "end": 94610150
    }, {
      "filename": "/vendored/lygia/math/translate4d.hlsl",
      "start": 94610150,
      "end": 94611014
    }, {
      "filename": "/vendored/lygia/math/translate4d.msl",
      "start": 94611014,
      "end": 94611921
    }, {
      "filename": "/vendored/lygia/math/translate4d.wesl",
      "start": 94611921,
      "end": 94612457
    }, {
      "filename": "/vendored/lygia/math/translate4d.wgsl",
      "start": 94612457,
      "end": 94612993
    }, {
      "filename": "/vendored/lygia/math/transpose.glsl",
      "start": 94612993,
      "end": 94613642
    }, {
      "filename": "/vendored/lygia/math/unpack.cuh",
      "start": 94613642,
      "end": 94615635
    }, {
      "filename": "/vendored/lygia/math/unpack.glsl",
      "start": 94615635,
      "end": 94617771
    }, {
      "filename": "/vendored/lygia/math/unpack.hlsl",
      "start": 94617771,
      "end": 94620001
    }, {
      "filename": "/vendored/lygia/math/unpack.msl",
      "start": 94620001,
      "end": 94622188
    }, {
      "filename": "/vendored/lygia/math/unpack.wesl",
      "start": 94622188,
      "end": 94624136
    }, {
      "filename": "/vendored/lygia/math/unpack.wgsl",
      "start": 94624136,
      "end": 94626078
    }, {
      "filename": "/vendored/lygia/math/within.cuh",
      "start": 94626078,
      "end": 94627400
    }, {
      "filename": "/vendored/lygia/math/within.glsl",
      "start": 94627400,
      "end": 94628462
    }, {
      "filename": "/vendored/lygia/math/within.hlsl",
      "start": 94628462,
      "end": 94629595
    }, {
      "filename": "/vendored/lygia/math/within.msl",
      "start": 94629595,
      "end": 94630657
    }, {
      "filename": "/vendored/lygia/math/within.wesl",
      "start": 94630657,
      "end": 94631578
    }, {
      "filename": "/vendored/lygia/math/within.wgsl",
      "start": 94631578,
      "end": 94632499
    }, {
      "filename": "/vendored/lygia/morphological/alphaFill.glsl",
      "start": 94632499,
      "end": 94634155
    }, {
      "filename": "/vendored/lygia/morphological/alphaFill.hlsl",
      "start": 94634155,
      "end": 94635458
    }, {
      "filename": "/vendored/lygia/morphological/alphaHashing.glsl",
      "start": 94635458,
      "end": 94637350
    }, {
      "filename": "/vendored/lygia/morphological/dilation.glsl",
      "start": 94637350,
      "end": 94639016
    }, {
      "filename": "/vendored/lygia/morphological/dilation.hlsl",
      "start": 94639016,
      "end": 94640337
    }, {
      "filename": "/vendored/lygia/morphological/erosion.glsl",
      "start": 94640337,
      "end": 94641739
    }, {
      "filename": "/vendored/lygia/morphological/erosion.hlsl",
      "start": 94641739,
      "end": 94643048
    }, {
      "filename": "/vendored/lygia/morphological/jumpFlood.glsl",
      "start": 94643048,
      "end": 94646288
    }, {
      "filename": "/vendored/lygia/morphological/marchingSquares.glsl",
      "start": 94646288,
      "end": 94655173
    }, {
      "filename": "/vendored/lygia/morphological/pyramid.glsl",
      "start": 94655173,
      "end": 94656507
    }, {
      "filename": "/vendored/lygia/morphological/pyramid/downscale.glsl",
      "start": 94656507,
      "end": 94658356
    }, {
      "filename": "/vendored/lygia/morphological/pyramid/upscale.glsl",
      "start": 94658356,
      "end": 94660970
    }, {
      "filename": "/vendored/lygia/package.json",
      "start": 94660970,
      "end": 94663045
    }, {
      "filename": "/vendored/lygia/pnpm-lock.yaml",
      "start": 94663045,
      "end": 94728220
    }, {
      "filename": "/vendored/lygia/prune.py",
      "start": 94728220,
      "end": 94729771
    }, {
      "filename": "/vendored/lygia/sample.glsl",
      "start": 94729771,
      "end": 94730763
    }, {
      "filename": "/vendored/lygia/sample.hlsl",
      "start": 94730763,
      "end": 94731755
    }, {
      "filename": "/vendored/lygia/sample/2DCube.glsl",
      "start": 94731755,
      "end": 94733982
    }, {
      "filename": "/vendored/lygia/sample/2DCube.hlsl",
      "start": 94733982,
      "end": 94736137
    }, {
      "filename": "/vendored/lygia/sample/3DSdf.glsl",
      "start": 94736137,
      "end": 94737514
    }, {
      "filename": "/vendored/lygia/sample/3DSdf.hlsl",
      "start": 94737514,
      "end": 94738907
    }, {
      "filename": "/vendored/lygia/sample/bicubic.glsl",
      "start": 94738907,
      "end": 94740543
    }, {
      "filename": "/vendored/lygia/sample/bicubic.hlsl",
      "start": 94740543,
      "end": 94742189
    }, {
      "filename": "/vendored/lygia/sample/bracketing.glsl",
      "start": 94742189,
      "end": 94744327
    }, {
      "filename": "/vendored/lygia/sample/bracketing.hlsl",
      "start": 94744327,
      "end": 94746465
    }, {
      "filename": "/vendored/lygia/sample/bumpMap.glsl",
      "start": 94746465,
      "end": 94747261
    }, {
      "filename": "/vendored/lygia/sample/bumpMap.hlsl",
      "start": 94747261,
      "end": 94748082
    }, {
      "filename": "/vendored/lygia/sample/clamp2edge.glsl",
      "start": 94748082,
      "end": 94749042
    }, {
      "filename": "/vendored/lygia/sample/clamp2edge.hlsl",
      "start": 94749042,
      "end": 94749894
    }, {
      "filename": "/vendored/lygia/sample/clamp2edge.msl",
      "start": 94749894,
      "end": 94750883
    }, {
      "filename": "/vendored/lygia/sample/derivative.glsl",
      "start": 94750883,
      "end": 94752846
    }, {
      "filename": "/vendored/lygia/sample/derivative.hlsl",
      "start": 94752846,
      "end": 94754837
    }, {
      "filename": "/vendored/lygia/sample/dither.glsl",
      "start": 94754837,
      "end": 94755935
    }, {
      "filename": "/vendored/lygia/sample/dof.glsl",
      "start": 94755935,
      "end": 94759925
    }, {
      "filename": "/vendored/lygia/sample/dof.hlsl",
      "start": 94759925,
      "end": 94764049
    }, {
      "filename": "/vendored/lygia/sample/equirect.glsl",
      "start": 94764049,
      "end": 94766189
    }, {
      "filename": "/vendored/lygia/sample/equirect.hlsl",
      "start": 94766189,
      "end": 94768006
    }, {
      "filename": "/vendored/lygia/sample/flow.glsl",
      "start": 94768006,
      "end": 94769174
    }, {
      "filename": "/vendored/lygia/sample/flow.hlsl",
      "start": 94769174,
      "end": 94770385
    }, {
      "filename": "/vendored/lygia/sample/fxaa.glsl",
      "start": 94770385,
      "end": 94773460
    }, {
      "filename": "/vendored/lygia/sample/fxaa.hlsl",
      "start": 94773460,
      "end": 94776520
    }, {
      "filename": "/vendored/lygia/sample/heatmap.glsl",
      "start": 94776520,
      "end": 94777471
    }, {
      "filename": "/vendored/lygia/sample/heatmap.hlsl",
      "start": 94777471,
      "end": 94778422
    }, {
      "filename": "/vendored/lygia/sample/hue.glsl",
      "start": 94778422,
      "end": 94779176
    }, {
      "filename": "/vendored/lygia/sample/hue.hlsl",
      "start": 94779176,
      "end": 94779934
    }, {
      "filename": "/vendored/lygia/sample/mirror.glsl",
      "start": 94779934,
      "end": 94780600
    }, {
      "filename": "/vendored/lygia/sample/mirror.hlsl",
      "start": 94780600,
      "end": 94781225
    }, {
      "filename": "/vendored/lygia/sample/nearest.glsl",
      "start": 94781225,
      "end": 94781947
    }, {
      "filename": "/vendored/lygia/sample/nearest.hlsl",
      "start": 94781947,
      "end": 94782629
    }, {
      "filename": "/vendored/lygia/sample/normalFromHeightMap.glsl",
      "start": 94782629,
      "end": 94783704
    }, {
      "filename": "/vendored/lygia/sample/normalFromHeightMap.hlsl",
      "start": 94783704,
      "end": 94784801
    }, {
      "filename": "/vendored/lygia/sample/normalMap.glsl",
      "start": 94784801,
      "end": 94785489
    }, {
      "filename": "/vendored/lygia/sample/normalMap.hlsl",
      "start": 94785489,
      "end": 94786183
    }, {
      "filename": "/vendored/lygia/sample/opticalFlow.glsl",
      "start": 94786183,
      "end": 94787392
    }, {
      "filename": "/vendored/lygia/sample/opticalFlow.hlsl",
      "start": 94787392,
      "end": 94788619
    }, {
      "filename": "/vendored/lygia/sample/quilt.glsl",
      "start": 94788619,
      "end": 94790770
    }, {
      "filename": "/vendored/lygia/sample/quilt.hlsl",
      "start": 94790770,
      "end": 94792928
    }, {
      "filename": "/vendored/lygia/sample/repeat.glsl",
      "start": 94792928,
      "end": 94793513
    }, {
      "filename": "/vendored/lygia/sample/repeat.hlsl",
      "start": 94793513,
      "end": 94794105
    }, {
      "filename": "/vendored/lygia/sample/shadow.glsl",
      "start": 94794105,
      "end": 94795408
    }, {
      "filename": "/vendored/lygia/sample/shadow.hlsl",
      "start": 94795408,
      "end": 94796635
    }, {
      "filename": "/vendored/lygia/sample/shadowLerp.glsl",
      "start": 94796635,
      "end": 94797770
    }, {
      "filename": "/vendored/lygia/sample/shadowLerp.hlsl",
      "start": 94797770,
      "end": 94798923
    }, {
      "filename": "/vendored/lygia/sample/shadowPCF.glsl",
      "start": 94798923,
      "end": 94799979
    }, {
      "filename": "/vendored/lygia/sample/shadowPCF.hlsl",
      "start": 94799979,
      "end": 94801049
    }, {
      "filename": "/vendored/lygia/sample/smooth.glsl",
      "start": 94801049,
      "end": 94801932
    }, {
      "filename": "/vendored/lygia/sample/smooth.hlsl",
      "start": 94801932,
      "end": 94802775
    }, {
      "filename": "/vendored/lygia/sample/sprite.glsl",
      "start": 94802775,
      "end": 94803736
    }, {
      "filename": "/vendored/lygia/sample/sprite.hlsl",
      "start": 94803736,
      "end": 94804709
    }, {
      "filename": "/vendored/lygia/sample/sprite.wgsl",
      "start": 94804709,
      "end": 94805323
    }, {
      "filename": "/vendored/lygia/sample/triplanar.glsl",
      "start": 94805323,
      "end": 94807024
    }, {
      "filename": "/vendored/lygia/sample/triplanar.hlsl",
      "start": 94807024,
      "end": 94808744
    }, {
      "filename": "/vendored/lygia/sample/untile.glsl",
      "start": 94808744,
      "end": 94811722
    }, {
      "filename": "/vendored/lygia/sample/untile.hlsl",
      "start": 94811722,
      "end": 94813650
    }, {
      "filename": "/vendored/lygia/sample/viewPosition.glsl",
      "start": 94813650,
      "end": 94815367
    }, {
      "filename": "/vendored/lygia/sample/viewPosition.hlsl",
      "start": 94815367,
      "end": 94817107
    }, {
      "filename": "/vendored/lygia/sample/yuv.glsl",
      "start": 94817107,
      "end": 94817950
    }, {
      "filename": "/vendored/lygia/sample/yuv.hlsl",
      "start": 94817950,
      "end": 94818819
    }, {
      "filename": "/vendored/lygia/sample/zero.glsl",
      "start": 94818819,
      "end": 94820347
    }, {
      "filename": "/vendored/lygia/sample/zero.hlsl",
      "start": 94820347,
      "end": 94821056
    }, {
      "filename": "/vendored/lygia/sampler.glsl",
      "start": 94821056,
      "end": 94821648
    }, {
      "filename": "/vendored/lygia/sampler.hlsl",
      "start": 94821648,
      "end": 94822983
    }, {
      "filename": "/vendored/lygia/sampler.msl",
      "start": 94822983,
      "end": 94823610
    }, {
      "filename": "/vendored/lygia/sdf.glsl",
      "start": 94823610,
      "end": 94824890
    }, {
      "filename": "/vendored/lygia/sdf.hlsl",
      "start": 94824890,
      "end": 94826141
    }, {
      "filename": "/vendored/lygia/sdf.msl",
      "start": 94826141,
      "end": 94827380
    }, {
      "filename": "/vendored/lygia/sdf/arrowSDF.glsl",
      "start": 94827380,
      "end": 94829134
    }, {
      "filename": "/vendored/lygia/sdf/arrowSDF.msl",
      "start": 94829134,
      "end": 94830936
    }, {
      "filename": "/vendored/lygia/sdf/boxFrameSDF.glsl",
      "start": 94830936,
      "end": 94831479
    }, {
      "filename": "/vendored/lygia/sdf/boxFrameSDF.hlsl",
      "start": 94831479,
      "end": 94832038
    }, {
      "filename": "/vendored/lygia/sdf/boxFrameSDF.msl",
      "start": 94832038,
      "end": 94832597
    }, {
      "filename": "/vendored/lygia/sdf/boxSDF.glsl",
      "start": 94832597,
      "end": 94833015
    }, {
      "filename": "/vendored/lygia/sdf/boxSDF.hlsl",
      "start": 94833015,
      "end": 94833447
    }, {
      "filename": "/vendored/lygia/sdf/boxSDF.msl",
      "start": 94833447,
      "end": 94833873
    }, {
      "filename": "/vendored/lygia/sdf/boxSDF.wesl",
      "start": 94833873,
      "end": 94834118
    }, {
      "filename": "/vendored/lygia/sdf/boxSDF.wgsl",
      "start": 94834118,
      "end": 94834363
    }, {
      "filename": "/vendored/lygia/sdf/capsuleSDF.glsl",
      "start": 94834363,
      "end": 94834772
    }, {
      "filename": "/vendored/lygia/sdf/capsuleSDF.hlsl",
      "start": 94834772,
      "end": 94835162
    }, {
      "filename": "/vendored/lygia/sdf/capsuleSDF.msl",
      "start": 94835162,
      "end": 94835578
    }, {
      "filename": "/vendored/lygia/sdf/circleSDF.glsl",
      "start": 94835578,
      "end": 94836481
    }, {
      "filename": "/vendored/lygia/sdf/circleSDF.hlsl",
      "start": 94836481,
      "end": 94837250
    }, {
      "filename": "/vendored/lygia/sdf/circleSDF.msl",
      "start": 94837250,
      "end": 94838160
    }, {
      "filename": "/vendored/lygia/sdf/coneSDF.glsl",
      "start": 94838160,
      "end": 94839300
    }, {
      "filename": "/vendored/lygia/sdf/coneSDF.hlsl",
      "start": 94839300,
      "end": 94840484
    }, {
      "filename": "/vendored/lygia/sdf/coneSDF.msl",
      "start": 94840484,
      "end": 94841644
    }, {
      "filename": "/vendored/lygia/sdf/crossSDF.glsl",
      "start": 94841644,
      "end": 94842376
    }, {
      "filename": "/vendored/lygia/sdf/crossSDF.hlsl",
      "start": 94842376,
      "end": 94842955
    }, {
      "filename": "/vendored/lygia/sdf/crossSDF.msl",
      "start": 94842955,
      "end": 94843692
    }, {
      "filename": "/vendored/lygia/sdf/cubeSDF.glsl",
      "start": 94843692,
      "end": 94843928
    }, {
      "filename": "/vendored/lygia/sdf/cubeSDF.hlsl",
      "start": 94843928,
      "end": 94844176
    }, {
      "filename": "/vendored/lygia/sdf/cubeSDF.msl",
      "start": 94844176,
      "end": 94844411
    }, {
      "filename": "/vendored/lygia/sdf/cylinderSDF.glsl",
      "start": 94844411,
      "end": 94845525
    }, {
      "filename": "/vendored/lygia/sdf/cylinderSDF.hlsl",
      "start": 94845525,
      "end": 94846682
    }, {
      "filename": "/vendored/lygia/sdf/cylinderSDF.msl",
      "start": 94846682,
      "end": 94847830
    }, {
      "filename": "/vendored/lygia/sdf/cylinderSDF.wesl",
      "start": 94847830,
      "end": 94848080
    }, {
      "filename": "/vendored/lygia/sdf/cylinderSDF.wgsl",
      "start": 94848080,
      "end": 94848330
    }, {
      "filename": "/vendored/lygia/sdf/dodecahedronSDF.glsl",
      "start": 94848330,
      "end": 94849045
    }, {
      "filename": "/vendored/lygia/sdf/dodecahedronSDF.hlsl",
      "start": 94849045,
      "end": 94849774
    }, {
      "filename": "/vendored/lygia/sdf/dodecahedronSDF.msl",
      "start": 94849774,
      "end": 94850496
    }, {
      "filename": "/vendored/lygia/sdf/ellipsoidSDF.glsl",
      "start": 94850496,
      "end": 94850836
    }, {
      "filename": "/vendored/lygia/sdf/ellipsoidSDF.hlsl",
      "start": 94850836,
      "end": 94851184
    }, {
      "filename": "/vendored/lygia/sdf/ellipsoidSDF.msl",
      "start": 94851184,
      "end": 94851520
    }, {
      "filename": "/vendored/lygia/sdf/flowerSDF.glsl",
      "start": 94851520,
      "end": 94852347
    }, {
      "filename": "/vendored/lygia/sdf/flowerSDF.hlsl",
      "start": 94852347,
      "end": 94853018
    }, {
      "filename": "/vendored/lygia/sdf/flowerSDF.msl",
      "start": 94853018,
      "end": 94853853
    }, {
      "filename": "/vendored/lygia/sdf/gearSDF.glsl",
      "start": 94853853,
      "end": 94855013
    }, {
      "filename": "/vendored/lygia/sdf/gearSDF.hlsl",
      "start": 94855013,
      "end": 94856088
    }, {
      "filename": "/vendored/lygia/sdf/gearSDF.msl",
      "start": 94856088,
      "end": 94857257
    }, {
      "filename": "/vendored/lygia/sdf/heartSDF.glsl",
      "start": 94857257,
      "end": 94858021
    }, {
      "filename": "/vendored/lygia/sdf/heartSDF.hlsl",
      "start": 94858021,
      "end": 94858683
    }, {
      "filename": "/vendored/lygia/sdf/heartSDF.msl",
      "start": 94858683,
      "end": 94859453
    }, {
      "filename": "/vendored/lygia/sdf/hexPrismSDF.glsl",
      "start": 94859453,
      "end": 94859851
    }, {
      "filename": "/vendored/lygia/sdf/hexPrismSDF.hlsl",
      "start": 94859851,
      "end": 94860261
    }, {
      "filename": "/vendored/lygia/sdf/hexPrismSDF.msl",
      "start": 94860261,
      "end": 94860665
    }, {
      "filename": "/vendored/lygia/sdf/hexSDF.glsl",
      "start": 94860665,
      "end": 94861399
    }, {
      "filename": "/vendored/lygia/sdf/hexSDF.hlsl",
      "start": 94861399,
      "end": 94861976
    }, {
      "filename": "/vendored/lygia/sdf/hexSDF.msl",
      "start": 94861976,
      "end": 94862715
    }, {
      "filename": "/vendored/lygia/sdf/icosahedronSDF.glsl",
      "start": 94862715,
      "end": 94863328
    }, {
      "filename": "/vendored/lygia/sdf/icosahedronSDF.hlsl",
      "start": 94863328,
      "end": 94863983
    }, {
      "filename": "/vendored/lygia/sdf/icosahedronSDF.msl",
      "start": 94863983,
      "end": 94864601
    }, {
      "filename": "/vendored/lygia/sdf/juliaSDF.glsl",
      "start": 94864601,
      "end": 94865819
    }, {
      "filename": "/vendored/lygia/sdf/juliaSDF.hlsl",
      "start": 94865819,
      "end": 94866822
    }, {
      "filename": "/vendored/lygia/sdf/juliaSDF.msl",
      "start": 94866822,
      "end": 94868071
    }, {
      "filename": "/vendored/lygia/sdf/kochSDF.glsl",
      "start": 94868071,
      "end": 94868998
    }, {
      "filename": "/vendored/lygia/sdf/kochSDF.hlsl",
      "start": 94868998,
      "end": 94869857
    }, {
      "filename": "/vendored/lygia/sdf/kochSDF.msl",
      "start": 94869857,
      "end": 94870803
    }, {
      "filename": "/vendored/lygia/sdf/lineSDF.glsl",
      "start": 94870803,
      "end": 94871362
    }, {
      "filename": "/vendored/lygia/sdf/lineSDF.hlsl",
      "start": 94871362,
      "end": 94871733
    }, {
      "filename": "/vendored/lygia/sdf/lineSDF.msl",
      "start": 94871733,
      "end": 94872304
    }, {
      "filename": "/vendored/lygia/sdf/linkSDF.glsl",
      "start": 94872304,
      "end": 94872657
    }, {
      "filename": "/vendored/lygia/sdf/linkSDF.hlsl",
      "start": 94872657,
      "end": 94873020
    }, {
      "filename": "/vendored/lygia/sdf/linkSDF.msl",
      "start": 94873020,
      "end": 94873383
    }, {
      "filename": "/vendored/lygia/sdf/mandelbulbSDF.glsl",
      "start": 94873383,
      "end": 94874733
    }, {
      "filename": "/vendored/lygia/sdf/mandelbulbSDF.hlsl",
      "start": 94874733,
      "end": 94876090
    }, {
      "filename": "/vendored/lygia/sdf/mandelbulbSDF.msl",
      "start": 94876090,
      "end": 94877448
    }, {
      "filename": "/vendored/lygia/sdf/octahedronSDF.glsl",
      "start": 94877448,
      "end": 94878370
    }, {
      "filename": "/vendored/lygia/sdf/octahedronSDF.hlsl",
      "start": 94878370,
      "end": 94879304
    }, {
      "filename": "/vendored/lygia/sdf/octahedronSDF.msl",
      "start": 94879304,
      "end": 94880238
    }, {
      "filename": "/vendored/lygia/sdf/octogonPrismSDF.glsl",
      "start": 94880238,
      "end": 94881009
    }, {
      "filename": "/vendored/lygia/sdf/octogonPrismSDF.hlsl",
      "start": 94881009,
      "end": 94881808
    }, {
      "filename": "/vendored/lygia/sdf/octogonPrismSDF.msl",
      "start": 94881808,
      "end": 94882589
    }, {
      "filename": "/vendored/lygia/sdf/opElongate.glsl",
      "start": 94882589,
      "end": 94883055
    }, {
      "filename": "/vendored/lygia/sdf/opElongate.hlsl",
      "start": 94883055,
      "end": 94883549
    }, {
      "filename": "/vendored/lygia/sdf/opElongate.msl",
      "start": 94883549,
      "end": 94884019
    }, {
      "filename": "/vendored/lygia/sdf/opExtrude.glsl",
      "start": 94884019,
      "end": 94884387
    }, {
      "filename": "/vendored/lygia/sdf/opExtrude.hlsl",
      "start": 94884387,
      "end": 94884763
    }, {
      "filename": "/vendored/lygia/sdf/opExtrude.msl",
      "start": 94884763,
      "end": 94885121
    }, {
      "filename": "/vendored/lygia/sdf/opIntersection.glsl",
      "start": 94885121,
      "end": 94885778
    }, {
      "filename": "/vendored/lygia/sdf/opIntersection.hlsl",
      "start": 94885778,
      "end": 94886403
    }, {
      "filename": "/vendored/lygia/sdf/opIntersection.msl",
      "start": 94886403,
      "end": 94886877
    }, {
      "filename": "/vendored/lygia/sdf/opOnion.glsl",
      "start": 94886877,
      "end": 94887120
    }, {
      "filename": "/vendored/lygia/sdf/opOnion.hlsl",
      "start": 94887120,
      "end": 94887363
    }, {
      "filename": "/vendored/lygia/sdf/opOnion.msl",
      "start": 94887363,
      "end": 94887594
    }, {
      "filename": "/vendored/lygia/sdf/opRepeat.glsl",
      "start": 94887594,
      "end": 94888162
    }, {
      "filename": "/vendored/lygia/sdf/opRepeat.hlsl",
      "start": 94888162,
      "end": 94888795
    }, {
      "filename": "/vendored/lygia/sdf/opRepeat.msl",
      "start": 94888795,
      "end": 94889381
    }, {
      "filename": "/vendored/lygia/sdf/opRevolve.glsl",
      "start": 94889381,
      "end": 94889660
    }, {
      "filename": "/vendored/lygia/sdf/opRevolve.hlsl",
      "start": 94889660,
      "end": 94889949
    }, {
      "filename": "/vendored/lygia/sdf/opRevolve.msl",
      "start": 94889949,
      "end": 94890232
    }, {
      "filename": "/vendored/lygia/sdf/opRound.glsl",
      "start": 94890232,
      "end": 94890453
    }, {
      "filename": "/vendored/lygia/sdf/opRound.hlsl",
      "start": 94890453,
      "end": 94890678
    }, {
      "filename": "/vendored/lygia/sdf/opRound.msl",
      "start": 94890678,
      "end": 94890890
    }, {
      "filename": "/vendored/lygia/sdf/opSubtraction.glsl",
      "start": 94890890,
      "end": 94891651
    }, {
      "filename": "/vendored/lygia/sdf/opSubtraction.hlsl",
      "start": 94891651,
      "end": 94892096
    }, {
      "filename": "/vendored/lygia/sdf/opSubtraction.msl",
      "start": 94892096,
      "end": 94892821
    }, {
      "filename": "/vendored/lygia/sdf/opSubtraction.wesl",
      "start": 94892821,
      "end": 94892970
    }, {
      "filename": "/vendored/lygia/sdf/opSubtraction.wgsl",
      "start": 94892970,
      "end": 94893119
    }, {
      "filename": "/vendored/lygia/sdf/opUnion.cuh",
      "start": 94893119,
      "end": 94894057
    }, {
      "filename": "/vendored/lygia/sdf/opUnion.glsl",
      "start": 94894057,
      "end": 94894881
    }, {
      "filename": "/vendored/lygia/sdf/opUnion.hlsl",
      "start": 94894881,
      "end": 94895683
    }, {
      "filename": "/vendored/lygia/sdf/opUnion.msl",
      "start": 94895683,
      "end": 94896370
    }, {
      "filename": "/vendored/lygia/sdf/opUnion.wesl",
      "start": 94896370,
      "end": 94896506
    }, {
      "filename": "/vendored/lygia/sdf/opUnion.wgsl",
      "start": 94896506,
      "end": 94896642
    }, {
      "filename": "/vendored/lygia/sdf/planeSDF.cuh",
      "start": 94896642,
      "end": 94897130
    }, {
      "filename": "/vendored/lygia/sdf/planeSDF.glsl",
      "start": 94897130,
      "end": 94897503
    }, {
      "filename": "/vendored/lygia/sdf/planeSDF.hlsl",
      "start": 94897503,
      "end": 94897888
    }, {
      "filename": "/vendored/lygia/sdf/planeSDF.msl",
      "start": 94897888,
      "end": 94898267
    }, {
      "filename": "/vendored/lygia/sdf/polySDF.glsl",
      "start": 94898267,
      "end": 94899142
    }, {
      "filename": "/vendored/lygia/sdf/polySDF.hlsl",
      "start": 94899142,
      "end": 94899861
    }, {
      "filename": "/vendored/lygia/sdf/polySDF.msl",
      "start": 94899861,
      "end": 94900737
    }, {
      "filename": "/vendored/lygia/sdf/pyramidSDF.glsl",
      "start": 94900737,
      "end": 94901569
    }, {
      "filename": "/vendored/lygia/sdf/pyramidSDF.hlsl",
      "start": 94901569,
      "end": 94902375
    }, {
      "filename": "/vendored/lygia/sdf/pyramidSDF.msl",
      "start": 94902375,
      "end": 94903208
    }, {
      "filename": "/vendored/lygia/sdf/raysSDF.glsl",
      "start": 94903208,
      "end": 94903961
    }, {
      "filename": "/vendored/lygia/sdf/raysSDF.hlsl",
      "start": 94903961,
      "end": 94904557
    }, {
      "filename": "/vendored/lygia/sdf/raysSDF.msl",
      "start": 94904557,
      "end": 94905311
    }, {
      "filename": "/vendored/lygia/sdf/rectSDF.glsl",
      "start": 94905311,
      "end": 94906546
    }, {
      "filename": "/vendored/lygia/sdf/rectSDF.hlsl",
      "start": 94906546,
      "end": 94907584
    }, {
      "filename": "/vendored/lygia/sdf/rectSDF.msl",
      "start": 94907584,
      "end": 94908840
    }, {
      "filename": "/vendored/lygia/sdf/rectSDF.wesl",
      "start": 94908840,
      "end": 94909638
    }, {
      "filename": "/vendored/lygia/sdf/rectSDF.wgsl",
      "start": 94909638,
      "end": 94910436
    }, {
      "filename": "/vendored/lygia/sdf/rhombSDF.glsl",
      "start": 94910436,
      "end": 94911180
    }, {
      "filename": "/vendored/lygia/sdf/rhombSDF.hlsl",
      "start": 94911180,
      "end": 94911791
    }, {
      "filename": "/vendored/lygia/sdf/rhombSDF.msl",
      "start": 94911791,
      "end": 94912536
    }, {
      "filename": "/vendored/lygia/sdf/sphereSDF.cuh",
      "start": 94912536,
      "end": 94912925
    }, {
      "filename": "/vendored/lygia/sdf/sphereSDF.glsl",
      "start": 94912925,
      "end": 94913221
    }, {
      "filename": "/vendored/lygia/sdf/sphereSDF.hlsl",
      "start": 94913221,
      "end": 94913523
    }, {
      "filename": "/vendored/lygia/sdf/sphereSDF.msl",
      "start": 94913523,
      "end": 94913819
    }, {
      "filename": "/vendored/lygia/sdf/sphereSDF.wesl",
      "start": 94913819,
      "end": 94913965
    }, {
      "filename": "/vendored/lygia/sdf/sphereSDF.wgsl",
      "start": 94913965,
      "end": 94914111
    }, {
      "filename": "/vendored/lygia/sdf/spiralSDF.glsl",
      "start": 94914111,
      "end": 94914882
    }, {
      "filename": "/vendored/lygia/sdf/spiralSDF.hlsl",
      "start": 94914882,
      "end": 94915496
    }, {
      "filename": "/vendored/lygia/sdf/spiralSDF.msl",
      "start": 94915496,
      "end": 94916275
    }, {
      "filename": "/vendored/lygia/sdf/starSDF.glsl",
      "start": 94916275,
      "end": 94917327
    }, {
      "filename": "/vendored/lygia/sdf/starSDF.hlsl",
      "start": 94917327,
      "end": 94918279
    }, {
      "filename": "/vendored/lygia/sdf/starSDF.msl",
      "start": 94918279,
      "end": 94919322
    }, {
      "filename": "/vendored/lygia/sdf/superShapeSDF.glsl",
      "start": 94919322,
      "end": 94921478
    }, {
      "filename": "/vendored/lygia/sdf/superShapeSDF.hlsl",
      "start": 94921478,
      "end": 94923087
    }, {
      "filename": "/vendored/lygia/sdf/superShapeSDF.msl",
      "start": 94923087,
      "end": 94925208
    }, {
      "filename": "/vendored/lygia/sdf/tetrahedronSDF.glsl",
      "start": 94925208,
      "end": 94925645
    }, {
      "filename": "/vendored/lygia/sdf/tetrahedronSDF.hlsl",
      "start": 94925645,
      "end": 94926090
    }, {
      "filename": "/vendored/lygia/sdf/tetrahedronSDF.msl",
      "start": 94926090,
      "end": 94926529
    }, {
      "filename": "/vendored/lygia/sdf/torusSDF.glsl",
      "start": 94926529,
      "end": 94927032
    }, {
      "filename": "/vendored/lygia/sdf/torusSDF.hlsl",
      "start": 94927032,
      "end": 94927549
    }, {
      "filename": "/vendored/lygia/sdf/torusSDF.msl",
      "start": 94927549,
      "end": 94928042
    }, {
      "filename": "/vendored/lygia/sdf/torusSDF.wesl",
      "start": 94928042,
      "end": 94928221
    }, {
      "filename": "/vendored/lygia/sdf/torusSDF.wgsl",
      "start": 94928221,
      "end": 94928400
    }, {
      "filename": "/vendored/lygia/sdf/triPrismSDF.glsl",
      "start": 94928400,
      "end": 94930790
    }, {
      "filename": "/vendored/lygia/sdf/triPrismSDF.hlsl",
      "start": 94930790,
      "end": 94933198
    }, {
      "filename": "/vendored/lygia/sdf/triPrismSDF.msl",
      "start": 94933198,
      "end": 94935582
    }, {
      "filename": "/vendored/lygia/sdf/triSDF.glsl",
      "start": 94935582,
      "end": 94936311
    }, {
      "filename": "/vendored/lygia/sdf/triSDF.hlsl",
      "start": 94936311,
      "end": 94936883
    }, {
      "filename": "/vendored/lygia/sdf/triSDF.msl",
      "start": 94936883,
      "end": 94937617
    }, {
      "filename": "/vendored/lygia/sdf/vesicaSDF.glsl",
      "start": 94937617,
      "end": 94938379
    }, {
      "filename": "/vendored/lygia/sdf/vesicaSDF.hlsl",
      "start": 94938379,
      "end": 94939035
    }, {
      "filename": "/vendored/lygia/sdf/vesicaSDF.msl",
      "start": 94939035,
      "end": 94939797
    }, {
      "filename": "/vendored/lygia/simulate/grayscott.glsl",
      "start": 94939797,
      "end": 94941827
    }, {
      "filename": "/vendored/lygia/simulate/latticeBoltzmann.glsl",
      "start": 94941827,
      "end": 94944690
    }, {
      "filename": "/vendored/lygia/simulate/ripple.glsl",
      "start": 94944690,
      "end": 94945737
    }, {
      "filename": "/vendored/lygia/simulate/simpleAndFastFluid.glsl",
      "start": 94945737,
      "end": 94951672
    }, {
      "filename": "/vendored/lygia/space/aspect.glsl",
      "start": 94951672,
      "end": 94952298
    }, {
      "filename": "/vendored/lygia/space/aspect.hlsl",
      "start": 94952298,
      "end": 94952938
    }, {
      "filename": "/vendored/lygia/space/aspect.msl",
      "start": 94952938,
      "end": 94953576
    }, {
      "filename": "/vendored/lygia/space/bracketing.glsl",
      "start": 94953576,
      "end": 94955701
    }, {
      "filename": "/vendored/lygia/space/bracketing.hlsl",
      "start": 94955701,
      "end": 94957851
    }, {
      "filename": "/vendored/lygia/space/bracketing.msl",
      "start": 94957851,
      "end": 9496e4
    }, {
      "filename": "/vendored/lygia/space/brickTile.glsl",
      "start": 9496e4,
      "end": 94960899
    }, {
      "filename": "/vendored/lygia/space/brickTile.hlsl",
      "start": 94960899,
      "end": 94961726
    }, {
      "filename": "/vendored/lygia/space/brickTile.msl",
      "start": 94961726,
      "end": 94962677
    }, {
      "filename": "/vendored/lygia/space/cart2polar.glsl",
      "start": 94962677,
      "end": 94963172
    }, {
      "filename": "/vendored/lygia/space/cart2polar.hlsl",
      "start": 94963172,
      "end": 94963689
    }, {
      "filename": "/vendored/lygia/space/cart2polar.msl",
      "start": 94963689,
      "end": 94964141
    }, {
      "filename": "/vendored/lygia/space/center.glsl",
      "start": 94964141,
      "end": 94964870
    }, {
      "filename": "/vendored/lygia/space/center.hlsl",
      "start": 94964870,
      "end": 94965620
    }, {
      "filename": "/vendored/lygia/space/center.msl",
      "start": 94965620,
      "end": 94966365
    }, {
      "filename": "/vendored/lygia/space/checkerTile.glsl",
      "start": 94966365,
      "end": 94967271
    }, {
      "filename": "/vendored/lygia/space/checkerTile.hlsl",
      "start": 94967271,
      "end": 94968122
    }, {
      "filename": "/vendored/lygia/space/checkerTile.msl",
      "start": 94968122,
      "end": 94969073
    }, {
      "filename": "/vendored/lygia/space/depth2viewZ.glsl",
      "start": 94969073,
      "end": 94970252
    }, {
      "filename": "/vendored/lygia/space/depth2viewZ.hlsl",
      "start": 94970252,
      "end": 94971431
    }, {
      "filename": "/vendored/lygia/space/depth2viewZ.msl",
      "start": 94971431,
      "end": 94972610
    }, {
      "filename": "/vendored/lygia/space/displace.glsl",
      "start": 94972610,
      "end": 94974829
    }, {
      "filename": "/vendored/lygia/space/displace.hlsl",
      "start": 94974829,
      "end": 94976863
    }, {
      "filename": "/vendored/lygia/space/displace.msl",
      "start": 94976863,
      "end": 94979114
    }, {
      "filename": "/vendored/lygia/space/equirect2xyz.glsl",
      "start": 94979114,
      "end": 94979814
    }, {
      "filename": "/vendored/lygia/space/equirect2xyz.hlsl",
      "start": 94979814,
      "end": 94980526
    }, {
      "filename": "/vendored/lygia/space/equirect2xyz.msl",
      "start": 94980526,
      "end": 94981237
    }, {
      "filename": "/vendored/lygia/space/eulerView.glsl",
      "start": 94981237,
      "end": 94981942
    }, {
      "filename": "/vendored/lygia/space/eulerView.hlsl",
      "start": 94981942,
      "end": 94982740
    }, {
      "filename": "/vendored/lygia/space/fisheye2xyz.glsl",
      "start": 94982740,
      "end": 94983475
    }, {
      "filename": "/vendored/lygia/space/fisheye2xyz.hlsl",
      "start": 94983475,
      "end": 94984224
    }, {
      "filename": "/vendored/lygia/space/fisheye2xyz.msl",
      "start": 94984224,
      "end": 94984972
    }, {
      "filename": "/vendored/lygia/space/fisheye2xyz.wesl",
      "start": 94984972,
      "end": 94985630
    }, {
      "filename": "/vendored/lygia/space/fisheye2xyz.wgsl",
      "start": 94985630,
      "end": 94986286
    }, {
      "filename": "/vendored/lygia/space/flipY.glsl",
      "start": 94986286,
      "end": 94986850
    }, {
      "filename": "/vendored/lygia/space/flipY.hlsl",
      "start": 94986850,
      "end": 94987453
    }, {
      "filename": "/vendored/lygia/space/flipY.msl",
      "start": 94987453,
      "end": 94988038
    }, {
      "filename": "/vendored/lygia/space/hexTile.glsl",
      "start": 94988038,
      "end": 94988943
    }, {
      "filename": "/vendored/lygia/space/hexTile.hlsl",
      "start": 94988943,
      "end": 94989770
    }, {
      "filename": "/vendored/lygia/space/hexTile.msl",
      "start": 94989770,
      "end": 94990703
    }, {
      "filename": "/vendored/lygia/space/kaleidoscope.glsl",
      "start": 94990703,
      "end": 94992009
    }, {
      "filename": "/vendored/lygia/space/kaleidoscope.hlsl",
      "start": 94992009,
      "end": 94993312
    }, {
      "filename": "/vendored/lygia/space/kaleidoscope.msl",
      "start": 94993312,
      "end": 94994617
    }, {
      "filename": "/vendored/lygia/space/linearizeDepth.glsl",
      "start": 94994617,
      "end": 94995429
    }, {
      "filename": "/vendored/lygia/space/linearizeDepth.hlsl",
      "start": 94995429,
      "end": 94996241
    }, {
      "filename": "/vendored/lygia/space/linearizeDepth.msl",
      "start": 94996241,
      "end": 94997053
    }, {
      "filename": "/vendored/lygia/space/lookAt.glsl",
      "start": 94997053,
      "end": 94998451
    }, {
      "filename": "/vendored/lygia/space/lookAt.hlsl",
      "start": 94998451,
      "end": 94999982
    }, {
      "filename": "/vendored/lygia/space/lookAt.msl",
      "start": 94999982,
      "end": 95001642
    }, {
      "filename": "/vendored/lygia/space/lookAtView.glsl",
      "start": 95001642,
      "end": 95002376
    }, {
      "filename": "/vendored/lygia/space/lookAtView.hlsl",
      "start": 95002376,
      "end": 95003156
    }, {
      "filename": "/vendored/lygia/space/mirrorTile.glsl",
      "start": 95003156,
      "end": 95004762
    }, {
      "filename": "/vendored/lygia/space/mirrorTile.hlsl",
      "start": 95004762,
      "end": 95006467
    }, {
      "filename": "/vendored/lygia/space/mirrorTile.msl",
      "start": 95006467,
      "end": 95008161
    }, {
      "filename": "/vendored/lygia/space/nearest.glsl",
      "start": 95008161,
      "end": 95008789
    }, {
      "filename": "/vendored/lygia/space/nearest.hlsl",
      "start": 95008789,
      "end": 95009378
    }, {
      "filename": "/vendored/lygia/space/nearest.msl",
      "start": 95009378,
      "end": 95010012
    }, {
      "filename": "/vendored/lygia/space/nearest.wesl",
      "start": 95010012,
      "end": 95010477
    }, {
      "filename": "/vendored/lygia/space/nearest.wgsl",
      "start": 95010477,
      "end": 95010942
    }, {
      "filename": "/vendored/lygia/space/orthographic.glsl",
      "start": 95010942,
      "end": 95011761
    }, {
      "filename": "/vendored/lygia/space/orthographic.msl",
      "start": 95011761,
      "end": 95012588
    }, {
      "filename": "/vendored/lygia/space/parallaxMapping.glsl",
      "start": 95012588,
      "end": 95020669
    }, {
      "filename": "/vendored/lygia/space/parallaxMapping.hlsl",
      "start": 95020669,
      "end": 95028823
    }, {
      "filename": "/vendored/lygia/space/parallaxMapping.msl",
      "start": 95028823,
      "end": 95036919
    }, {
      "filename": "/vendored/lygia/space/perspective.glsl",
      "start": 95036919,
      "end": 95037682
    }, {
      "filename": "/vendored/lygia/space/perspective.msl",
      "start": 95037682,
      "end": 95038445
    }, {
      "filename": "/vendored/lygia/space/polar2cart.glsl",
      "start": 95038445,
      "end": 95038972
    }, {
      "filename": "/vendored/lygia/space/polar2cart.hlsl",
      "start": 95038972,
      "end": 95039511
    }, {
      "filename": "/vendored/lygia/space/polar2cart.msl",
      "start": 95039511,
      "end": 95039761
    }, {
      "filename": "/vendored/lygia/space/ratio.cuh",
      "start": 95039761,
      "end": 95040527
    }, {
      "filename": "/vendored/lygia/space/ratio.glsl",
      "start": 95040527,
      "end": 95041402
    }, {
      "filename": "/vendored/lygia/space/ratio.hlsl",
      "start": 95041402,
      "end": 95042203
    }, {
      "filename": "/vendored/lygia/space/ratio.msl",
      "start": 95042203,
      "end": 95043087
    }, {
      "filename": "/vendored/lygia/space/ratio.wesl",
      "start": 95043087,
      "end": 95043885
    }, {
      "filename": "/vendored/lygia/space/ratio.wgsl",
      "start": 95043885,
      "end": 95044683
    }, {
      "filename": "/vendored/lygia/space/rotate.glsl",
      "start": 95044683,
      "end": 95046645
    }, {
      "filename": "/vendored/lygia/space/rotate.hlsl",
      "start": 95046645,
      "end": 95048535
    }, {
      "filename": "/vendored/lygia/space/rotate.msl",
      "start": 95048535,
      "end": 95050516
    }, {
      "filename": "/vendored/lygia/space/rotate.wesl",
      "start": 95050516,
      "end": 95051125
    }, {
      "filename": "/vendored/lygia/space/rotate.wgsl",
      "start": 95051125,
      "end": 95051737
    }, {
      "filename": "/vendored/lygia/space/rotateX.glsl",
      "start": 95051737,
      "end": 95052783
    }, {
      "filename": "/vendored/lygia/space/rotateX.hlsl",
      "start": 95052783,
      "end": 95053612
    }, {
      "filename": "/vendored/lygia/space/rotateX.msl",
      "start": 95053612,
      "end": 95054659
    }, {
      "filename": "/vendored/lygia/space/rotateY.glsl",
      "start": 95054659,
      "end": 95055699
    }, {
      "filename": "/vendored/lygia/space/rotateY.hlsl",
      "start": 95055699,
      "end": 95056523
    }, {
      "filename": "/vendored/lygia/space/rotateY.msl",
      "start": 95056523,
      "end": 95057562
    }, {
      "filename": "/vendored/lygia/space/rotateZ.glsl",
      "start": 95057562,
      "end": 95058611
    }, {
      "filename": "/vendored/lygia/space/rotateZ.hlsl",
      "start": 95058611,
      "end": 95059441
    }, {
      "filename": "/vendored/lygia/space/rotateZ.msl",
      "start": 95059441,
      "end": 95060491
    }, {
      "filename": "/vendored/lygia/space/scale.glsl",
      "start": 95060491,
      "end": 95062293
    }, {
      "filename": "/vendored/lygia/space/scale.hlsl",
      "start": 95062293,
      "end": 95063992
    }, {
      "filename": "/vendored/lygia/space/scale.msl",
      "start": 95063992,
      "end": 95065791
    }, {
      "filename": "/vendored/lygia/space/scale.wesl",
      "start": 95065791,
      "end": 95066216
    }, {
      "filename": "/vendored/lygia/space/scale.wgsl",
      "start": 95066216,
      "end": 95066641
    }, {
      "filename": "/vendored/lygia/space/screen2viewPosition.glsl",
      "start": 95066641,
      "end": 95068003
    }, {
      "filename": "/vendored/lygia/space/screen2viewPosition.hlsl",
      "start": 95068003,
      "end": 95069387
    }, {
      "filename": "/vendored/lygia/space/screen2viewPosition.msl",
      "start": 95069387,
      "end": 95070744
    }, {
      "filename": "/vendored/lygia/space/sprite.glsl",
      "start": 95070744,
      "end": 95071395
    }, {
      "filename": "/vendored/lygia/space/sprite.hlsl",
      "start": 95071395,
      "end": 95072029
    }, {
      "filename": "/vendored/lygia/space/sprite.msl",
      "start": 95072029,
      "end": 95072698
    }, {
      "filename": "/vendored/lygia/space/sprite.wgsl",
      "start": 95072698,
      "end": 95073315
    }, {
      "filename": "/vendored/lygia/space/sqTile.glsl",
      "start": 95073315,
      "end": 95073902
    }, {
      "filename": "/vendored/lygia/space/sqTile.hlsl",
      "start": 95073902,
      "end": 95074502
    }, {
      "filename": "/vendored/lygia/space/sqTile.msl",
      "start": 95074502,
      "end": 95075103
    }, {
      "filename": "/vendored/lygia/space/tbn.glsl",
      "start": 95075103,
      "end": 95075505
    }, {
      "filename": "/vendored/lygia/space/tbn.hlsl",
      "start": 95075505,
      "end": 95076015
    }, {
      "filename": "/vendored/lygia/space/translate.glsl",
      "start": 95076015,
      "end": 95076467
    }, {
      "filename": "/vendored/lygia/space/translate.hlsl",
      "start": 95076467,
      "end": 95077008
    }, {
      "filename": "/vendored/lygia/space/triTile.glsl",
      "start": 95077008,
      "end": 95077732
    }, {
      "filename": "/vendored/lygia/space/triTile.hlsl",
      "start": 95077732,
      "end": 95078417
    }, {
      "filename": "/vendored/lygia/space/triTile.msl",
      "start": 95078417,
      "end": 95079167
    }, {
      "filename": "/vendored/lygia/space/uncenter.glsl",
      "start": 95079167,
      "end": 95079845
    }, {
      "filename": "/vendored/lygia/space/uncenter.hlsl",
      "start": 95079845,
      "end": 95080544
    }, {
      "filename": "/vendored/lygia/space/uncenter.msl",
      "start": 95080544,
      "end": 95081238
    }, {
      "filename": "/vendored/lygia/space/unratio.glsl",
      "start": 95081238,
      "end": 95081720
    }, {
      "filename": "/vendored/lygia/space/unratio.hlsl",
      "start": 95081720,
      "end": 95082236
    }, {
      "filename": "/vendored/lygia/space/unratio.msl",
      "start": 95082236,
      "end": 95082724
    }, {
      "filename": "/vendored/lygia/space/view2screenPosition.glsl",
      "start": 95082724,
      "end": 95083500
    }, {
      "filename": "/vendored/lygia/space/view2screenPosition.hlsl",
      "start": 95083500,
      "end": 95084296
    }, {
      "filename": "/vendored/lygia/space/view2screenPosition.msl",
      "start": 95084296,
      "end": 95085084
    }, {
      "filename": "/vendored/lygia/space/viewZ2depth.glsl",
      "start": 95085084,
      "end": 95086232
    }, {
      "filename": "/vendored/lygia/space/viewZ2depth.hlsl",
      "start": 95086232,
      "end": 95087380
    }, {
      "filename": "/vendored/lygia/space/viewZ2depth.msl",
      "start": 95087380,
      "end": 95088515
    }, {
      "filename": "/vendored/lygia/space/windmillTile.glsl",
      "start": 95088515,
      "end": 95089720
    }, {
      "filename": "/vendored/lygia/space/windmillTile.hlsl",
      "start": 95089720,
      "end": 95090898
    }, {
      "filename": "/vendored/lygia/space/windmillTile.msl",
      "start": 95090898,
      "end": 95092158
    }, {
      "filename": "/vendored/lygia/space/xyz2equirect.glsl",
      "start": 95092158,
      "end": 95092700
    }, {
      "filename": "/vendored/lygia/space/xyz2equirect.hlsl",
      "start": 95092700,
      "end": 95093249
    }, {
      "filename": "/vendored/lygia/space/xyz2equirect.msl",
      "start": 95093249,
      "end": 95093802
    }, {
      "filename": "/vendored/lygia/version.glsl",
      "start": 95093802,
      "end": 95094301
    }, {
      "filename": "/vendored/lygia/version.hlsl",
      "start": 95094301,
      "end": 95094800
    }, {
      "filename": "/vendored/lygia/version.wesl",
      "start": 95094800,
      "end": 95095213
    }, {
      "filename": "/vendored/lygia/version.wgsl",
      "start": 95095213,
      "end": 95095626
    }, {
      "filename": "/vendored/lygia/webpack.config.js",
      "start": 95095626,
      "end": 95096805
    } ],
    "remote_package_size": 95096805
  });
})();

// end include: /var/folders/v8/kv5tdb4s5d57h2swgmltjd580000gn/T/tmpj384pfpn.js
// include: /var/folders/v8/kv5tdb4s5d57h2swgmltjd580000gn/T/tmphjkk8gd6.js
// All the pre-js content up to here must remain later on, we need to run
// it.
if ((typeof ENVIRONMENT_IS_WASM_WORKER != "undefined" && ENVIRONMENT_IS_WASM_WORKER) || (typeof ENVIRONMENT_IS_PTHREAD != "undefined" && ENVIRONMENT_IS_PTHREAD) || (typeof ENVIRONMENT_IS_AUDIO_WORKLET != "undefined" && ENVIRONMENT_IS_AUDIO_WORKLET)) Module["preRun"] = [];

var necessaryPreJSTasks = Module["preRun"].slice();

// end include: /var/folders/v8/kv5tdb4s5d57h2swgmltjd580000gn/T/tmphjkk8gd6.js
// include: /var/folders/v8/kv5tdb4s5d57h2swgmltjd580000gn/T/tmp6__ua1yn.js
if (!Module["preRun"]) throw "Module.preRun should exist because file support used it; did a pre-js delete it?";

necessaryPreJSTasks.forEach(task => {
  if (Module["preRun"].indexOf(task) < 0) throw "All preRun tasks that exist before user pre-js code should remain after; did you replace Module or modify Module.preRun?";
});

// end include: /var/folders/v8/kv5tdb4s5d57h2swgmltjd580000gn/T/tmp6__ua1yn.js
var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
  throw toThrow;
};

// In MODULARIZE mode _scriptName needs to be captured already at the very top of the page immediately when the page is parsed, so it is generated there
// before the page load. In non-MODULARIZE modes generate it here.
var _scriptName = typeof document != "undefined" ? document.currentScript?.src : undefined;

if (typeof __filename != "undefined") {
  // Node
  _scriptName = __filename;
} else if (ENVIRONMENT_IS_WORKER) {
  _scriptName = self.location.href;
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = "";

function locateFile(path) {
  if (Module["locateFile"]) {
    return Module["locateFile"](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var readAsync, readBinary;

if (ENVIRONMENT_IS_NODE) {
  const isNode = typeof process == "object" && process.versions?.node && process.type != "renderer";
  if (!isNode) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
  var nodeVersion = process.versions.node;
  var numericVersion = nodeVersion.split(".").slice(0, 3);
  numericVersion = (numericVersion[0] * 1e4) + (numericVersion[1] * 100) + (numericVersion[2].split("-")[0] * 1);
  if (numericVersion < 16e4) {
    throw new Error("This emscripten-generated code requires node v16.0.0 (detected v" + nodeVersion + ")");
  }
  // These modules will usually be used on Node.js. Load them eagerly to avoid
  // the complexity of lazy-loading.
  var fs = require("fs");
  scriptDirectory = __dirname + "/";
  // include: node_shell_read.js
  readBinary = filename => {
    // We need to re-wrap `file://` strings to URLs.
    filename = isFileURI(filename) ? new URL(filename) : filename;
    var ret = fs.readFileSync(filename);
    assert(Buffer.isBuffer(ret));
    return ret;
  };
  readAsync = async (filename, binary = true) => {
    // See the comment in the `readBinary` function.
    filename = isFileURI(filename) ? new URL(filename) : filename;
    var ret = fs.readFileSync(filename, binary ? undefined : "utf8");
    assert(binary ? Buffer.isBuffer(ret) : typeof ret == "string");
    return ret;
  };
  // end include: node_shell_read.js
  if (process.argv.length > 1) {
    thisProgram = process.argv[1].replace(/\\/g, "/");
  }
  arguments_ = process.argv.slice(2);
  // MODULARIZE will export the module in the proper place outside, we don't need to export here
  if (typeof module != "undefined") {
    module["exports"] = Module;
  }
  quit_ = (status, toThrow) => {
    process.exitCode = status;
    throw toThrow;
  };
} else if (ENVIRONMENT_IS_SHELL) {
  const isNode = typeof process == "object" && process.versions?.node && process.type != "renderer";
  if (isNode || typeof window == "object" || typeof WorkerGlobalScope != "undefined") throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
} else // Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  try {
    scriptDirectory = new URL(".", _scriptName).href;
  } catch {}
  if (!(typeof window == "object" || typeof WorkerGlobalScope != "undefined")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
  {
    // include: web_or_worker_shell_read.js
    if (ENVIRONMENT_IS_WORKER) {
      readBinary = url => {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, false);
        xhr.responseType = "arraybuffer";
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
      };
    }
    readAsync = async url => {
      // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
      // See https://github.com/github/fetch/pull/92#issuecomment-140665932
      // Cordova or Electron apps are typically loaded from a file:// url.
      // So use XHR on webview if URL is a file URL.
      if (isFileURI(url)) {
        return new Promise((resolve, reject) => {
          var xhr = new XMLHttpRequest;
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = () => {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              // file URLs can return 0
              resolve(xhr.response);
              return;
            }
            reject(xhr.status);
          };
          xhr.onerror = reject;
          xhr.send(null);
        });
      }
      var response = await fetch(url, {
        credentials: "same-origin"
      });
      if (response.ok) {
        return response.arrayBuffer();
      }
      throw new Error(response.status + " : " + response.url);
    };
  }
} else if (!ENVIRONMENT_IS_AUDIO_WORKLET) {
  throw new Error("environment detection error");
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
// Normally just binding console.log/console.error here works fine, but
// under node (with workers) we see missing/out-of-order messages so route
// directly to stdout and stderr.
// See https://github.com/emscripten-core/emscripten/issues/14804
var defaultPrint = console.log.bind(console);

var defaultPrintErr = console.error.bind(console);

if (ENVIRONMENT_IS_NODE) {
  var utils = require("util");
  var stringify = a => typeof a == "object" ? utils.inspect(a) : a;
  defaultPrint = (...args) => fs.writeSync(1, args.map(stringify).join(" ") + "\n");
  defaultPrintErr = (...args) => fs.writeSync(2, args.map(stringify).join(" ") + "\n");
}

var out = defaultPrint;

var err = defaultPrintErr;

var IDBFS = "IDBFS is no longer included by default; build with -lidbfs.js";

var PROXYFS = "PROXYFS is no longer included by default; build with -lproxyfs.js";

var WORKERFS = "WORKERFS is no longer included by default; build with -lworkerfs.js";

var FETCHFS = "FETCHFS is no longer included by default; build with -lfetchfs.js";

var ICASEFS = "ICASEFS is no longer included by default; build with -licasefs.js";

var JSFILEFS = "JSFILEFS is no longer included by default; build with -ljsfilefs.js";

var OPFS = "OPFS is no longer included by default; build with -lopfs.js";

var NODEFS = "NODEFS is no longer included by default; build with -lnodefs.js";

// perform assertions in shell.js after we set up out() and err(), as otherwise
// if an assertion fails it cannot print the message
assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");

// end include: shell.js
// include: preamble.js
// === Preamble library stuff ===
// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html
var wasmBinary;

if (typeof WebAssembly != "object") {
  err("no native wasm support detected");
}

// Wasm globals
// For sending to workers.
var wasmModule;

//========================================
// Runtime essentials
//========================================
// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */ function assert(condition, text) {
  if (!condition) {
    abort("Assertion failed" + (text ? ": " + text : ""));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.
/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = filename => filename.startsWith("file://");

// include: runtime_common.js
// include: runtime_stack_check.js
// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // If the stack ends at address zero we write our cookies 4 bytes into the
  // stack.  This prevents interference with SAFE_HEAP and ASAN which also
  // monitor writes to address zero.
  if (max == 0) {
    max += 4;
  }
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  (growMemViews(), HEAPU32)[((max) >> 2)] = 34821223;
  (growMemViews(), HEAPU32)[(((max) + (4)) >> 2)] = 2310721022;
  // Also test the global address 0 for integrity.
  (growMemViews(), HEAPU32)[((0) >> 2)] = 1668509029;
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  // See writeStackCookie().
  if (max == 0) {
    max += 4;
  }
  var cookie1 = (growMemViews(), HEAPU32)[((max) >> 2)];
  var cookie2 = (growMemViews(), HEAPU32)[(((max) + (4)) >> 2)];
  if (cookie1 != 34821223 || cookie2 != 2310721022) {
    abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
  }
  // Also test the global address 0 for integrity.
  if ((growMemViews(), HEAPU32)[((0) >> 2)] != 1668509029) {
    abort("Runtime error: The application has corrupted its heap memory area (address zero)!");
  }
}

// end include: runtime_stack_check.js
// include: runtime_exceptions.js
// end include: runtime_exceptions.js
// include: runtime_debug.js
var runtimeDebug = true;

// Switch to false at runtime to disable logging at the right times
// Used by XXXXX_DEBUG settings to output debug messages.
function dbg(...args) {
  if (!runtimeDebug && typeof runtimeDebug != "undefined") return;
  // Avoid using the console for debugging in multi-threaded node applications
  // See https://github.com/emscripten-core/emscripten/issues/14804
  if (ENVIRONMENT_IS_NODE) {
    // TODO(sbc): Unify with err/out implementation in shell.sh.
    var fs = require("fs");
    var utils = require("util");
    var stringify = a => typeof a == "object" ? utils.inspect(a) : a;
    fs.writeSync(2, args.map(stringify).join(" ") + "\n");
  } else // TODO(sbc): Make this configurable somehow.  Its not always convenient for
  // logging to show up as warnings.
  console.warn(...args);
}

// Endianness check
(() => {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 25459;
  if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
})();

function consumedModuleProp(prop) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      set() {
        abort(`Attempt to set \`Module.${prop}\` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'`);
      }
    });
  }
}

function makeInvalidEarlyAccess(name) {
  return () => assert(false, `call to '${name}' via reference taken before Wasm module initialization`);
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === "FS_createPath" || name === "FS_createDataFile" || name === "FS_createPreloadedFile" || name === "FS_unlink" || name === "addRunDependency" || // The old FS has some functionality that WasmFS lacks.
  name === "FS_createLazyFile" || name === "FS_createDevice" || name === "removeRunDependency";
}

/**
 * Intercept access to a global symbol.  This enables us to give informative
 * warnings/errors when folks attempt to use symbols they did not include in
 * their build, or no symbols that no longer exist.
 */ function hookGlobalSymbolAccess(sym, func) {
  if (typeof globalThis != "undefined" && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get() {
        func();
        return undefined;
      }
    });
  }
}

function missingGlobal(sym, msg) {
  hookGlobalSymbolAccess(sym, () => {
    warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
  });
}

missingGlobal("buffer", "Please use HEAP8.buffer or wasmMemory.buffer");

missingGlobal("asm", "Please use wasmExports instead");

function missingLibrarySymbol(sym) {
  hookGlobalSymbolAccess(sym, () => {
    // Can't `abort()` here because it would break code that does runtime
    // checks.  e.g. `if (typeof SDL === 'undefined')`.
    var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
    // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
    // library.js, which means $name for a JS name with no prefix, or name
    // for a JS name like _name.
    var librarySymbol = sym;
    if (!librarySymbol.startsWith("_")) {
      librarySymbol = "$" + sym;
    }
    msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
    if (isExportedByForceFilesystem(sym)) {
      msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
    }
    warnOnce(msg);
  });
  // Any symbol that is not included from the JS library is also (by definition)
  // not exported on the Module object.
  unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get() {
        var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
        if (isExportedByForceFilesystem(sym)) {
          msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
        }
        abort(msg);
      }
    });
  }
}

/**
 * Override `err`/`out`/`dbg` to report thread / worker information
 */ function initWorkerLogging() {
  function getLogPrefix() {
    if (wwParams?.wwID) {
      return `ww:${wwParams?.wwID}:`;
    }
    return `ww:0:`;
  }
  // Prefix all dbg() messages with the calling thread info.
  var origDbg = dbg;
  dbg = (...args) => origDbg(getLogPrefix(), ...args);
}

initWorkerLogging();

// end include: runtime_debug.js
// include: growableHeap.js
// Support for growable heap + pthreads, where the buffer may change, so JS views
// must be updated.
function growMemViews() {
  // `updateMemoryViews` updates all the views simultaneously, so it's enough to check any of them.
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
}

// end include: growableHeap.js
var wasmModuleReceived;

if (ENVIRONMENT_IS_NODE && (ENVIRONMENT_IS_WASM_WORKER)) {
  // Create as web-worker-like an environment as we can.
  var parentPort = worker_threads["parentPort"];
  parentPort.on("message", msg => global.onmessage?.({
    data: msg
  }));
  Object.assign(globalThis, {
    self: global,
    postMessage: msg => parentPort["postMessage"](msg)
  });
}

// include: wasm_worker.js
var wwParams;

/**
 * Called once the intiial message has been recieved from the creating thread.
 * The `props` object is property bag sent via postMessage to create the worker.
 *
 * This function is called both in normal wasm workers and in audio worklets.
 */ function startWasmWorker(props) {
  wwParams = props;
  wasmMemory = props.wasmMemory;
  updateMemoryViews();
  wasmModuleReceived(props.wasm);
  // Drop now unneeded references to from the Module object in this Worker,
  // these are not needed anymore.
  props.wasm = props.memMemory = 0;
}

if (ENVIRONMENT_IS_WASM_WORKER && !ENVIRONMENT_IS_AUDIO_WORKLET) {
  // Node.js support
  if (ENVIRONMENT_IS_NODE) {
    // Weak map of handle functions to their wrapper. Used to implement
    // addEventListener/removeEventListener.
    var wrappedHandlers = new WeakMap;
    /** @suppress {checkTypes} */ globalThis.onmessage = null;
    function wrapMsgHandler(h) {
      var f = wrappedHandlers.get(h);
      if (!f) {
        f = msg => h({
          data: msg
        });
        wrappedHandlers.set(h, f);
      }
      return f;
    }
    Object.assign(globalThis, {
      addEventListener: (name, handler) => parentPort["on"](name, wrapMsgHandler(handler)),
      removeEventListener: (name, handler) => parentPort["off"](name, wrapMsgHandler(handler))
    });
  }
  onmessage = d => {
    // The first message sent to the Worker is always the bootstrap message.
    // Drop this message listener, it served its purpose of bootstrapping
    // the Wasm Module load, and is no longer needed. Let user code register
    // any desired message handlers from now on.
    /** @suppress {checkTypes} */ onmessage = null;
    startWasmWorker(d.data);
  };
}

// end include: wasm_worker.js
// include: audio_worklet.js
// This file is the main bootstrap script for Wasm Audio Worklets loaded in an
// Emscripten application.  Build with -sAUDIO_WORKLET linker flag to enable
// targeting Audio Worklets.
// AudioWorkletGlobalScope does not have a onmessage/postMessage() functionality
// at the global scope, which means that after creating an
// AudioWorkletGlobalScope and loading this script into it, we cannot
// postMessage() information into it like one would do with Web Workers.
// Instead, we must create an AudioWorkletProcessor class, then instantiate a
// Web Audio graph node from it on the main thread. Using its message port and
// the node constructor's "processorOptions" field, we can share the necessary
// bootstrap information from the main thread to the AudioWorkletGlobalScope.
if (ENVIRONMENT_IS_AUDIO_WORKLET) {
  function createWasmAudioWorkletProcessor(audioParams) {
    class WasmAudioWorkletProcessor extends AudioWorkletProcessor {
      constructor(args) {
        super();
        // Capture the Wasm function callback to invoke.
        let opts = args.processorOptions;
        assert(opts.callback);
        assert(opts.samplesPerChannel);
        this.callback = getWasmTableEntry(opts.callback);
        this.userData = opts.userData;
        // Then the samples per channel to process, fixed for the lifetime of the
        // context that created this processor. Note for when moving to Web Audio
        // 1.1: the typed array passed to process() should be the same size as this
        // 'render quantum size', and this exercise of passing in the value
        // shouldn't be required (to be verified)
        this.samplesPerChannel = opts.samplesPerChannel;
      }
      static get parameterDescriptors() {
        return audioParams;
      }
      /**
     * @param {Object} parameters
     */ process(inputList, outputList, parameters) {
        // Marshal all inputs and parameters to the Wasm memory on the thread stack,
        // then perform the wasm audio worklet call,
        // and finally marshal audio output data back.
        let numInputs = inputList.length, numOutputs = outputList.length, numParams = 0, i, j, k, dataPtr, bytesPerChannel = this.samplesPerChannel * 4, stackMemoryNeeded = (numInputs + numOutputs) * 12, oldStackPtr = stackSave(), inputsPtr, outputsPtr, outputDataPtr, paramsPtr, didProduceAudio, paramArray;
        // Calculate how much stack space is needed.
        for (i of inputList) stackMemoryNeeded += i.length * bytesPerChannel;
        for (i of outputList) stackMemoryNeeded += i.length * bytesPerChannel;
        for (i in parameters) stackMemoryNeeded += parameters[i].byteLength + 8, ++numParams;
        // Allocate the necessary stack space.
        inputsPtr = stackAlloc(stackMemoryNeeded);
        // Copy input audio descriptor structs and data to Wasm
        k = inputsPtr >> 2;
        dataPtr = inputsPtr + numInputs * 12;
        for (i of inputList) {
          // Write the AudioSampleFrame struct instance
          (growMemViews(), HEAPU32)[k + 0] = i.length;
          (growMemViews(), HEAPU32)[k + 1] = this.samplesPerChannel;
          (growMemViews(), HEAPU32)[k + 2] = dataPtr;
          k += 3;
          // Marshal the input audio sample data for each audio channel of this input
          for (j of i) {
            (growMemViews(), HEAPF32).set(j, dataPtr >> 2);
            dataPtr += bytesPerChannel;
          }
        }
        // Copy output audio descriptor structs to Wasm
        outputsPtr = dataPtr;
        k = outputsPtr >> 2;
        outputDataPtr = (dataPtr += numOutputs * 12) >> 2;
        for (i of outputList) {
          // Write the AudioSampleFrame struct instance
          (growMemViews(), HEAPU32)[k + 0] = i.length;
          (growMemViews(), HEAPU32)[k + 1] = this.samplesPerChannel;
          (growMemViews(), HEAPU32)[k + 2] = dataPtr;
          k += 3;
          // Reserve space for the output data
          dataPtr += bytesPerChannel * i.length;
        }
        // Copy parameters descriptor structs and data to Wasm
        paramsPtr = dataPtr;
        k = paramsPtr >> 2;
        dataPtr += numParams * 8;
        for (i = 0; paramArray = parameters[i++]; ) {
          // Write the AudioParamFrame struct instance
          (growMemViews(), HEAPU32)[k + 0] = paramArray.length;
          (growMemViews(), HEAPU32)[k + 1] = dataPtr;
          k += 2;
          // Marshal the audio parameters array
          (growMemViews(), HEAPF32).set(paramArray, dataPtr >> 2);
          dataPtr += paramArray.length * 4;
        }
        // Call out to Wasm callback to perform audio processing
        if (didProduceAudio = this.callback(numInputs, inputsPtr, numOutputs, outputsPtr, numParams, paramsPtr, this.userData)) {
          // Read back the produced audio data to all outputs and their channels.
          // (A garbage-free function TypedArray.copy(dstTypedArray, dstOffset,
          // srcTypedArray, srcOffset, count) would sure be handy..  but web does
          // not have one, so manually copy all bytes in)
          for (i of outputList) {
            for (j of i) {
              for (k = 0; k < this.samplesPerChannel; ++k) {
                j[k] = (growMemViews(), HEAPF32)[outputDataPtr++];
              }
            }
          }
        }
        stackRestore(oldStackPtr);
        // Return 'true' to tell the browser to continue running this processor.
        // (Returning 1 or any other truthy value won't work in Chrome)
        return !!didProduceAudio;
      }
    }
    return WasmAudioWorkletProcessor;
  }
  var messagePort;
  // Specify a worklet processor that will be used to receive messages to this
  // AudioWorkletGlobalScope.  We never connect this initial AudioWorkletProcessor
  // to the audio graph to do any audio processing.
  class BootstrapMessages extends AudioWorkletProcessor {
    constructor(arg) {
      super();
      startWasmWorker(arg.processorOptions);
      // Listen to messages from the main thread. These messages will ask this
      // scope to create the real AudioWorkletProcessors that call out to Wasm to
      // do audio processing.
      messagePort = this.port;
      /** @suppress {checkTypes} */ messagePort.onmessage = async msg => {
        let d = msg.data;
        if (d["_wpn"]) {
          // '_wpn' is short for 'Worklet Processor Node', using an identifier
          // that will never conflict with user messages
          // Register a real AudioWorkletProcessor that will actually do audio processing.
          registerProcessor(d["_wpn"], createWasmAudioWorkletProcessor(d.audioParams));
          // Post a Wasm Call message back telling that we have now registered the
          // AudioWorkletProcessor, and should trigger the user onSuccess callback
          // of the emscripten_create_wasm_audio_worklet_processor_async() call.
          // '_wsc' is short for 'wasm call', using an identifier that will never
          // conflict with user messages
          messagePort.postMessage({
            "_wsc": d.callback,
            args: [ d.contextHandle, 1, d.userData ]
          });
        } else if (d["_wsc"]) {
          getWasmTableEntry(d["_wsc"])(...d.args);
        }
      };
    }
    // No-op, not doing audio processing in this processor. It is just for
    // receiving bootstrap messages.  However browsers require it to still be
    // present. It should never be called because we never add a node to the graph
    // with this processor, although it does look like Chrome does still call this
    // function.
    process() {}
  }
  // Register the dummy processor that will just receive messages.
  registerProcessor("em-bootstrap", BootstrapMessages);
}

// ENVIRONMENT_IS_AUDIO_WORKLET
// end include: audio_worklet.js
// Memory management
var wasmMemory;

var /** @type {!Int8Array} */ HEAP8, /** @type {!Uint8Array} */ HEAPU8, /** @type {!Int16Array} */ HEAP16, /** @type {!Uint16Array} */ HEAPU16, /** @type {!Int32Array} */ HEAP32, /** @type {!Uint32Array} */ HEAPU32, /** @type {!Float32Array} */ HEAPF32, /** @type {!Float64Array} */ HEAPF64;

// BigInt64Array type is not correctly defined in closure
var /** not-@type {!BigInt64Array} */ HEAP64, /* BigUint64Array type is not correctly defined in closure
/** not-@type {!BigUint64Array} */ HEAPU64;

var runtimeInitialized = false;

function updateMemoryViews() {
  var b = wasmMemory.buffer;
  HEAP8 = new Int8Array(b);
  HEAP16 = new Int16Array(b);
  HEAPU8 = new Uint8Array(b);
  HEAPU16 = new Uint16Array(b);
  HEAP32 = new Int32Array(b);
  HEAPU32 = new Uint32Array(b);
  HEAPF32 = new Float32Array(b);
  HEAPF64 = new Float64Array(b);
  HEAP64 = new BigInt64Array(b);
  HEAPU64 = new BigUint64Array(b);
}

// In non-standalone/normal mode, we create the memory here.
// include: runtime_init_memory.js
// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
function initMemory() {
  if ((ENVIRONMENT_IS_WASM_WORKER)) {
    return;
  }
  if (Module["wasmMemory"]) {
    wasmMemory = Module["wasmMemory"];
  } else {
    var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
    assert(INITIAL_MEMORY >= 65536, "INITIAL_MEMORY should be larger than STACK_SIZE, was " + INITIAL_MEMORY + "! (STACK_SIZE=" + 65536 + ")");
    /** @suppress {checkTypes} */ wasmMemory = new WebAssembly.Memory({
      "initial": INITIAL_MEMORY / 65536,
      // In theory we should not need to emit the maximum if we want "unlimited"
      // or 4GB of memory, but VMs error on that atm, see
      // https://github.com/emscripten-core/emscripten/issues/14130
      // And in the pthreads case we definitely need to emit a maximum. So
      // always emit one.
      "maximum": 32768,
      "shared": true
    });
  }
  updateMemoryViews();
}

// end include: runtime_init_memory.js
// include: memoryprofiler.js
// end include: memoryprofiler.js
// end include: runtime_common.js
assert(typeof Int32Array != "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined, "JS engine does not provide full typed array support");

function preRun() {
  if (Module["preRun"]) {
    if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
    while (Module["preRun"].length) {
      addOnPreRun(Module["preRun"].shift());
    }
  }
  consumedModuleProp("preRun");
  // Begin ATPRERUNS hooks
  callRuntimeCallbacks(onPreRuns);
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;
  if (ENVIRONMENT_IS_WASM_WORKER) return _wasmWorkerInitializeRuntime();
  checkStackCookie();
  // Begin ATINITS hooks
  if (!Module["noFSInit"] && !FS.initialized) FS.init();
  TTY.init();
  // End ATINITS hooks
  wasmExports["__wasm_call_ctors"]();
  // Begin ATPOSTCTORS hooks
  FS.ignorePermissions = false;
}

function preMain() {
  checkStackCookie();
}

function postRun() {
  checkStackCookie();
  if ((ENVIRONMENT_IS_WASM_WORKER)) {
    return;
  }
  // PThreads reuse the runtime from the main thread.
  if (Module["postRun"]) {
    if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
    while (Module["postRun"].length) {
      addOnPostRun(Module["postRun"].shift());
    }
  }
  consumedModuleProp("postRun");
  // Begin ATPOSTRUNS hooks
  callRuntimeCallbacks(onPostRuns);
}

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;

var dependenciesFulfilled = null;

// overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

var runDependencyWatcher = null;

function addRunDependency(id) {
  runDependencies++;
  Module["monitorRunDependencies"]?.(runDependencies);
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != "undefined") {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(() => {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err("still waiting on run dependencies:");
          }
          err(`dependency: ${dep}`);
        }
        if (shown) {
          err("(end of list)");
        }
      }, 1e4);
    }
  } else {
    err("warning: run dependency added without ID");
  }
}

function removeRunDependency(id) {
  runDependencies--;
  Module["monitorRunDependencies"]?.(runDependencies);
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err("warning: run dependency removed without ID");
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}

/** @param {string|number=} what */ function abort(what) {
  Module["onAbort"]?.(what);
  what = "Aborted(" + what + ")";
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);
  ABORT = true;
  if (what.indexOf("RuntimeError: unreachable") >= 0) {
    what += '. "unreachable" may be due to ASYNCIFY_STACK_SIZE not being large enough (try increasing it)';
  }
  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.
  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // definition for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

function createExportWrapper(name, nargs) {
  return (...args) => {
    assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
    var f = wasmExports[name];
    assert(f, `exported native function \`${name}\` not found`);
    // Only assert for too many arguments. Too few can be valid since the missing arguments will be zero filled.
    assert(args.length <= nargs, `native function \`${name}\` called with ${args.length} args but expects ${nargs}`);
    return f(...args);
  };
}

var wasmBinaryFile;

function findWasmBinary() {
  return locateFile("beatboxx.wasm");
}

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw "both async and sync fetching of the wasm failed";
}

async function getWasmBinary(binaryFile) {
  // If we don't have the binary yet, load it asynchronously using readAsync.
  if (!wasmBinary) {
    // Fetch the binary using readAsync
    try {
      var response = await readAsync(binaryFile);
      return new Uint8Array(response);
    } catch {}
  }
  // Otherwise, getBinarySync should be able to get it synchronously
  return getBinarySync(binaryFile);
}

async function instantiateArrayBuffer(binaryFile, imports) {
  try {
    var binary = await getWasmBinary(binaryFile);
    var instance = await WebAssembly.instantiate(binary, imports);
    return instance;
  } catch (reason) {
    err(`failed to asynchronously prepare wasm: ${reason}`);
    // Warn on some common problems.
    if (isFileURI(wasmBinaryFile)) {
      err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
    }
    abort(reason);
  }
}

async function instantiateAsync(binary, binaryFile, imports) {
  if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE) {
    try {
      var response = fetch(binaryFile, {
        credentials: "same-origin"
      });
      var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
      return instantiationResult;
    } catch (reason) {
      // We expect the most common failure cause to be a bad MIME type for the binary,
      // in which case falling back to ArrayBuffer instantiation should work.
      err(`wasm streaming compile failed: ${reason}`);
      err("falling back to ArrayBuffer instantiation");
    }
  }
  return instantiateArrayBuffer(binaryFile, imports);
}

function getWasmImports() {
  assignWasmImports();
  // instrumenting imports is used in asyncify in two ways: to add assertions
  // that check for proper import use, and for ASYNCIFY=2 we use them to set up
  // the Promise API on the import side.
  Asyncify.instrumentWasmImports(wasmImports);
  // prepare imports
  return {
    "env": wasmImports,
    "wasi_snapshot_preview1": wasmImports
  };
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
async function createWasm() {
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/ function receiveInstance(instance, module) {
    wasmExports = instance.exports;
    wasmExports = Asyncify.instrumentWasmExports(wasmExports);
    wasmTable = wasmExports["__indirect_function_table"];
    assert(wasmTable, "table not found in wasm exports");
    // We now have the Wasm module loaded up, keep a reference to the compiled module so we can post it to the workers.
    wasmModule = module;
    assignWasmExports(wasmExports);
    removeRunDependency("wasm-instantiate");
    return wasmExports;
  }
  // wait for the pthread pool (if any)
  addRunDependency("wasm-instantiate");
  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
    trueModule = null;
    return receiveInstance(result["instance"], result["module"]);
  }
  var info = getWasmImports();
  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module["instantiateWasm"]) {
    return new Promise((resolve, reject) => {
      try {
        Module["instantiateWasm"](info, (mod, inst) => {
          resolve(receiveInstance(mod, inst));
        });
      } catch (e) {
        err(`Module.instantiateWasm callback failed with error: ${e}`);
        reject(e);
      }
    });
  }
  if ((ENVIRONMENT_IS_WASM_WORKER)) {
    return new Promise(resolve => {
      wasmModuleReceived = module => {
        // Instantiate from the module posted from the main thread.
        // We can just use sync instantiation in the worker.
        var instance = new WebAssembly.Instance(module, getWasmImports());
        resolve(receiveInstance(instance, module));
      };
    });
  }
  wasmBinaryFile ??= findWasmBinary();
  var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
  var exports = receiveInstantiationResult(result);
  return exports;
}

// end include: preamble.js
// Begin JS library code
class ExitStatus {
  name="ExitStatus";
  constructor(status) {
    this.message = `Program terminated with exit(${status})`;
    this.status = status;
  }
}

var _wasmWorkerDelayedMessageQueue = [];

var handleException = e => {
  // Certain exception types we do not treat as errors since they are used for
  // internal control flow.
  // 1. ExitStatus, which is thrown by exit()
  // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
  //    that wish to return to JS event loop.
  if (e instanceof ExitStatus || e == "unwind") {
    return EXITSTATUS;
  }
  checkStackCookie();
  if (e instanceof WebAssembly.RuntimeError) {
    if (_emscripten_stack_get_current() <= 0) {
      err("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)");
    }
  }
  quit_(1, e);
};

var runtimeKeepaliveCounter = 0;

var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;

var _proc_exit = code => {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    Module["onExit"]?.(code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
};

/** @suppress {duplicate } */ /** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
  EXITSTATUS = status;
  checkUnflushedContent();
  // if exit() was called explicitly, warn the user if the runtime isn't actually being shut down
  if (keepRuntimeAlive() && !implicit) {
    var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
    err(msg);
  }
  _proc_exit(status);
};

var _exit = exitJS;

var maybeExit = () => {
  if (!keepRuntimeAlive()) {
    try {
      _exit(EXITSTATUS);
    } catch (e) {
      handleException(e);
    }
  }
};

var callUserCallback = func => {
  if (ABORT) {
    err("user callback triggered after runtime exited or application aborted.  Ignoring.");
    return;
  }
  try {
    func();
    maybeExit();
  } catch (e) {
    handleException(e);
  }
};

var wasmTableMirror = [];

/** @type {WebAssembly.Table} */ var wasmTable;

var getWasmTableEntry = funcPtr => {
  var func = wasmTableMirror[funcPtr];
  if (!func) {
    /** @suppress {checkTypes} */ wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
  }
  /** @suppress {checkTypes} */ assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
  return func;
};

var _wasmWorkerRunPostMessage = e => {
  // '_wsc' is short for 'wasm call', trying to use an identifier name that
  // will never conflict with user code
  let data = e.data;
  let wasmCall = data["_wsc"];
  wasmCall && callUserCallback(() => getWasmTableEntry(wasmCall)(...data["x"]));
};

var _wasmWorkerAppendToQueue = e => {
  _wasmWorkerDelayedMessageQueue.push(e);
};

var _wasmWorkerInitializeRuntime = () => {
  assert(wwParams);
  assert(wwParams.wwID);
  assert(wwParams.stackLowestAddress % 16 == 0);
  assert(wwParams.stackSize % 16 == 0);
  // Wasm workers basically never exit their runtime
  noExitRuntime = 1;
  // Run the C side Worker initialization for stack and TLS.
  __emscripten_wasm_worker_initialize(wwParams.stackLowestAddress, wwParams.stackSize);
  // Write the stack cookie last, after we have set up the proper bounds and
  // current position of the stack.
  writeStackCookie();
  // Audio Worklets do not have postMessage()ing capabilities.
  if (typeof AudioWorkletGlobalScope === "undefined") {
    // The Wasm Worker runtime is now up, so we can start processing
    // any postMessage function calls that have been received. Drop the temp
    // message handler that queued any pending incoming postMessage function calls ...
    removeEventListener("message", _wasmWorkerAppendToQueue);
    // ... then flush whatever messages we may have already gotten in the queue,
    //     and clear _wasmWorkerDelayedMessageQueue to undefined ...
    _wasmWorkerDelayedMessageQueue = _wasmWorkerDelayedMessageQueue.forEach(_wasmWorkerRunPostMessage);
    // ... and finally register the proper postMessage handler that immediately
    // dispatches incoming function calls without queueing them.
    addEventListener("message", _wasmWorkerRunPostMessage);
  }
};

var callRuntimeCallbacks = callbacks => {
  while (callbacks.length > 0) {
    // Pass the module as the first argument.
    callbacks.shift()(Module);
  }
};

var onPostRuns = [];

var addOnPostRun = cb => onPostRuns.push(cb);

var onPreRuns = [];

var addOnPreRun = cb => onPreRuns.push(cb);

var dynCalls = {};

var dynCallLegacy = (sig, ptr, args) => {
  sig = sig.replace(/p/g, "i");
  assert(sig in dynCalls, `bad function pointer type - sig is not in dynCalls: '${sig}'`);
  if (args?.length) {
    // j (64-bit integer) is fine, and is implemented as a BigInt. Without
    // legalization, the number of parameters should match (j is not expanded
    // into two i's).
    assert(args.length === sig.length - 1);
  } else {
    assert(sig.length == 1);
  }
  var f = dynCalls[sig];
  return f(ptr, ...args);
};

var dynCall = (sig, ptr, args = [], promising = false) => {
  assert(!promising, "async dynCall is not supported in this mode");
  var rtn = dynCallLegacy(sig, ptr, args);
  function convert(rtn) {
    return rtn;
  }
  return convert(rtn);
};

/**
     * @param {number} ptr
     * @param {string} type
     */ function getValue(ptr, type = "i8") {
  if (type.endsWith("*")) type = "*";
  switch (type) {
   case "i1":
    return (growMemViews(), HEAP8)[ptr];

   case "i8":
    return (growMemViews(), HEAP8)[ptr];

   case "i16":
    return (growMemViews(), HEAP16)[((ptr) >> 1)];

   case "i32":
    return (growMemViews(), HEAP32)[((ptr) >> 2)];

   case "i64":
    return (growMemViews(), HEAP64)[((ptr) >> 3)];

   case "float":
    return (growMemViews(), HEAPF32)[((ptr) >> 2)];

   case "double":
    return (growMemViews(), HEAPF64)[((ptr) >> 3)];

   case "*":
    return (growMemViews(), HEAPU32)[((ptr) >> 2)];

   default:
    abort(`invalid type for getValue: ${type}`);
  }
}

var noExitRuntime = true;

var ptrToString = ptr => {
  assert(typeof ptr === "number");
  // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
  ptr >>>= 0;
  return "0x" + ptr.toString(16).padStart(8, "0");
};

/**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */ function setValue(ptr, value, type = "i8") {
  if (type.endsWith("*")) type = "*";
  switch (type) {
   case "i1":
    (growMemViews(), HEAP8)[ptr] = value;
    break;

   case "i8":
    (growMemViews(), HEAP8)[ptr] = value;
    break;

   case "i16":
    (growMemViews(), HEAP16)[((ptr) >> 1)] = value;
    break;

   case "i32":
    (growMemViews(), HEAP32)[((ptr) >> 2)] = value;
    break;

   case "i64":
    (growMemViews(), HEAP64)[((ptr) >> 3)] = BigInt(value);
    break;

   case "float":
    (growMemViews(), HEAPF32)[((ptr) >> 2)] = value;
    break;

   case "double":
    (growMemViews(), HEAPF64)[((ptr) >> 3)] = value;
    break;

   case "*":
    (growMemViews(), HEAPU32)[((ptr) >> 2)] = value;
    break;

   default:
    abort(`invalid type for setValue: ${type}`);
  }
}

var stackRestore = val => __emscripten_stack_restore(val);

var stackSave = () => _emscripten_stack_get_current();

var warnOnce = text => {
  warnOnce.shown ||= {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    if (ENVIRONMENT_IS_NODE) text = "warning: " + text;
    err(text);
  }
};

var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder : undefined;

/**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number=} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */ var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on
  // null terminator by itself.  Also, use the length info to avoid running tiny
  // strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation,
  // so that undefined/NaN means Infinity)
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  // When using conditional TextDecoder, skip it for short strings as the overhead of the native call is not worth it.
  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.buffer instanceof ArrayBuffer ? heapOrArray.subarray(idx, endPtr) : heapOrArray.slice(idx, endPtr));
  }
  var str = "";
  // If building with TextDecoder, we have already computed the string length
  // above, so test loop end condition against that
  while (idx < endPtr) {
    // For UTF8 byte structure, see:
    // http://en.wikipedia.org/wiki/UTF-8#Description
    // https://www.ietf.org/rfc/rfc2279.txt
    // https://tools.ietf.org/html/rfc3629
    var u0 = heapOrArray[idx++];
    if (!(u0 & 128)) {
      str += String.fromCharCode(u0);
      continue;
    }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 224) == 192) {
      str += String.fromCharCode(((u0 & 31) << 6) | u1);
      continue;
    }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 240) == 224) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte " + ptrToString(u0) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!");
      u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
    }
    if (u0 < 65536) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 65536;
      str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
    }
  }
  return str;
};

/**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */ var UTF8ToString = (ptr, maxBytesToRead) => {
  assert(typeof ptr == "number", `UTF8ToString expects a number (got ${typeof ptr})`);
  return ptr ? UTF8ArrayToString((growMemViews(), HEAPU8), ptr, maxBytesToRead) : "";
};

var ___assert_fail = (condition, filename, line, func) => abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);

class ExceptionInfo {
  // excPtr - Thrown object pointer to wrap. Metadata pointer is calculated from it.
  constructor(excPtr) {
    this.excPtr = excPtr;
    this.ptr = excPtr - 24;
  }
  set_type(type) {
    (growMemViews(), HEAPU32)[(((this.ptr) + (4)) >> 2)] = type;
  }
  get_type() {
    return (growMemViews(), HEAPU32)[(((this.ptr) + (4)) >> 2)];
  }
  set_destructor(destructor) {
    (growMemViews(), HEAPU32)[(((this.ptr) + (8)) >> 2)] = destructor;
  }
  get_destructor() {
    return (growMemViews(), HEAPU32)[(((this.ptr) + (8)) >> 2)];
  }
  set_caught(caught) {
    caught = caught ? 1 : 0;
    (growMemViews(), HEAP8)[(this.ptr) + (12)] = caught;
  }
  get_caught() {
    return (growMemViews(), HEAP8)[(this.ptr) + (12)] != 0;
  }
  set_rethrown(rethrown) {
    rethrown = rethrown ? 1 : 0;
    (growMemViews(), HEAP8)[(this.ptr) + (13)] = rethrown;
  }
  get_rethrown() {
    return (growMemViews(), HEAP8)[(this.ptr) + (13)] != 0;
  }
  // Initialize native structure fields. Should be called once after allocated.
  init(type, destructor) {
    this.set_adjusted_ptr(0);
    this.set_type(type);
    this.set_destructor(destructor);
  }
  set_adjusted_ptr(adjustedPtr) {
    (growMemViews(), HEAPU32)[(((this.ptr) + (16)) >> 2)] = adjustedPtr;
  }
  get_adjusted_ptr() {
    return (growMemViews(), HEAPU32)[(((this.ptr) + (16)) >> 2)];
  }
}

var exceptionLast = 0;

var uncaughtExceptionCount = 0;

var ___cxa_throw = (ptr, type, destructor) => {
  var info = new ExceptionInfo(ptr);
  // Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
  info.init(type, destructor);
  exceptionLast = ptr;
  uncaughtExceptionCount++;
  assert(false, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.");
};

/** @suppress {duplicate } */ var syscallGetVarargI = () => {
  assert(SYSCALLS.varargs != undefined);
  // the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
  var ret = (growMemViews(), HEAP32)[((+SYSCALLS.varargs) >> 2)];
  SYSCALLS.varargs += 4;
  return ret;
};

var syscallGetVarargP = syscallGetVarargI;

var PATH = {
  isAbs: path => path.charAt(0) === "/",
  splitPath: filename => {
    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    return splitPathRe.exec(filename).slice(1);
  },
  normalizeArray: (parts, allowAboveRoot) => {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === ".") {
        parts.splice(i, 1);
      } else if (last === "..") {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }
    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (;up; up--) {
        parts.unshift("..");
      }
    }
    return parts;
  },
  normalize: path => {
    var isAbsolute = PATH.isAbs(path), trailingSlash = path.slice(-1) === "/";
    // Normalize the path
    path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
    if (!path && !isAbsolute) {
      path = ".";
    }
    if (path && trailingSlash) {
      path += "/";
    }
    return (isAbsolute ? "/" : "") + path;
  },
  dirname: path => {
    var result = PATH.splitPath(path), root = result[0], dir = result[1];
    if (!root && !dir) {
      // No dirname whatsoever
      return ".";
    }
    if (dir) {
      // It has a dirname, strip trailing slash
      dir = dir.slice(0, -1);
    }
    return root + dir;
  },
  basename: path => path && path.match(/([^\/]+|\/)\/*$/)[1],
  join: (...paths) => PATH.normalize(paths.join("/")),
  join2: (l, r) => PATH.normalize(l + "/" + r)
};

var initRandomFill = () => {
  // This block is not needed on v19+ since crypto.getRandomValues is builtin
  if (ENVIRONMENT_IS_NODE) {
    var nodeCrypto = require("crypto");
    return view => nodeCrypto.randomFillSync(view);
  }
  // like with most Web APIs, we can't use Web Crypto API directly on shared memory,
  // so we need to create an intermediate buffer and copy it to the destination
  return view => view.set(crypto.getRandomValues(new Uint8Array(view.byteLength)));
};

var randomFill = view => {
  // Lazily init on the first invocation.
  (randomFill = initRandomFill())(view);
};

var PATH_FS = {
  resolve: (...args) => {
    var resolvedPath = "", resolvedAbsolute = false;
    for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = (i >= 0) ? args[i] : FS.cwd();
      // Skip empty and invalid entries
      if (typeof path != "string") {
        throw new TypeError("Arguments to path.resolve must be strings");
      } else if (!path) {
        return "";
      }
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = PATH.isAbs(path);
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
    return ((resolvedAbsolute ? "/" : "") + resolvedPath) || ".";
  },
  relative: (from, to) => {
    from = PATH_FS.resolve(from).slice(1);
    to = PATH_FS.resolve(to).slice(1);
    function trim(arr) {
      var start = 0;
      for (;start < arr.length; start++) {
        if (arr[start] !== "") break;
      }
      var end = arr.length - 1;
      for (;end >= 0; end--) {
        if (arr[end] !== "") break;
      }
      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }
    var fromParts = trim(from.split("/"));
    var toParts = trim(to.split("/"));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push("..");
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join("/");
  }
};

var FS_stdin_getChar_buffer = [];

var lengthBytesUTF8 = str => {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
    // unit, not a Unicode code point of the character! So decode
    // UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var c = str.charCodeAt(i);
    // possibly a lead surrogate
    if (c <= 127) {
      len++;
    } else if (c <= 2047) {
      len += 2;
    } else if (c >= 55296 && c <= 57343) {
      len += 4;
      ++i;
    } else {
      len += 3;
    }
  }
  return len;
};

var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
  assert(typeof str === "string", `stringToUTF8Array expects a string (got ${typeof str})`);
  // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
  // undefined and false each don't write out any bytes.
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
    // and https://www.ietf.org/rfc/rfc2279.txt
    // and https://tools.ietf.org/html/rfc3629
    var u = str.codePointAt(i);
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 192 | (u >> 6);
      heap[outIdx++] = 128 | (u & 63);
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 224 | (u >> 12);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u > 1114111) warnOnce("Invalid Unicode code point " + ptrToString(u) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
      heap[outIdx++] = 240 | (u >> 18);
      heap[outIdx++] = 128 | ((u >> 12) & 63);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
      // Gotcha: if codePoint is over 0xFFFF, it is represented as a surrogate pair in UTF-16.
      // We need to manually skip over the second code unit for correct iteration.
      i++;
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
};

/** @type {function(string, boolean=, number=)} */ var intArrayFromString = (stringy, dontAddNull, length) => {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
};

var FS_stdin_getChar = () => {
  if (!FS_stdin_getChar_buffer.length) {
    var result = null;
    if (ENVIRONMENT_IS_NODE) {
      // we will read data by chunks of BUFSIZE
      var BUFSIZE = 256;
      var buf = Buffer.alloc(BUFSIZE);
      var bytesRead = 0;
      // For some reason we must suppress a closure warning here, even though
      // fd definitely exists on process.stdin, and is even the proper way to
      // get the fd of stdin,
      // https://github.com/nodejs/help/issues/2136#issuecomment-523649904
      // This started to happen after moving this logic out of library_tty.js,
      // so it is related to the surrounding code in some unclear manner.
      /** @suppress {missingProperties} */ var fd = process.stdin.fd;
      try {
        bytesRead = fs.readSync(fd, buf, 0, BUFSIZE);
      } catch (e) {
        // Cross-platform differences: on Windows, reading EOF throws an
        // exception, but on other OSes, reading EOF returns 0. Uniformize
        // behavior by treating the EOF exception to return 0.
        if (e.toString().includes("EOF")) bytesRead = 0; else throw e;
      }
      if (bytesRead > 0) {
        result = buf.slice(0, bytesRead).toString("utf-8");
      }
    } else if (typeof window != "undefined" && typeof window.prompt == "function") {
      // Browser.
      result = window.prompt("Input: ");
      // returns null on cancel
      if (result !== null) {
        result += "\n";
      }
    } else {}
    if (!result) {
      return null;
    }
    FS_stdin_getChar_buffer = intArrayFromString(result, true);
  }
  return FS_stdin_getChar_buffer.shift();
};

var TTY = {
  ttys: [],
  init() {},
  shutdown() {},
  register(dev, ops) {
    TTY.ttys[dev] = {
      input: [],
      output: [],
      ops
    };
    FS.registerDevice(dev, TTY.stream_ops);
  },
  stream_ops: {
    open(stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    },
    close(stream) {
      // flush any pending line data
      stream.tty.ops.fsync(stream.tty);
    },
    fsync(stream) {
      stream.tty.ops.fsync(stream.tty);
    },
    read(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === undefined) break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.atime = Date.now();
      }
      return bytesRead;
    },
    write(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.mtime = stream.node.ctime = Date.now();
      }
      return i;
    }
  },
  default_tty_ops: {
    get_char(tty) {
      return FS_stdin_getChar();
    },
    put_char(tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    fsync(tty) {
      if (tty.output?.length > 0) {
        out(UTF8ArrayToString(tty.output));
        tty.output = [];
      }
    },
    ioctl_tcgets(tty) {
      // typical setting
      return {
        c_iflag: 25856,
        c_oflag: 5,
        c_cflag: 191,
        c_lflag: 35387,
        c_cc: [ 3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
      };
    },
    ioctl_tcsets(tty, optional_actions, data) {
      // currently just ignore
      return 0;
    },
    ioctl_tiocgwinsz(tty) {
      return [ 24, 80 ];
    }
  },
  default_tty1_ops: {
    put_char(tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    fsync(tty) {
      if (tty.output?.length > 0) {
        err(UTF8ArrayToString(tty.output));
        tty.output = [];
      }
    }
  }
};

var mmapAlloc = size => {
  abort("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported");
};

var MEMFS = {
  ops_table: null,
  mount(mount) {
    return MEMFS.createNode(null, "/", 16895, 0);
  },
  createNode(parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
      // no supported
      throw new FS.ErrnoError(63);
    }
    MEMFS.ops_table ||= {
      dir: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr,
          lookup: MEMFS.node_ops.lookup,
          mknod: MEMFS.node_ops.mknod,
          rename: MEMFS.node_ops.rename,
          unlink: MEMFS.node_ops.unlink,
          rmdir: MEMFS.node_ops.rmdir,
          readdir: MEMFS.node_ops.readdir,
          symlink: MEMFS.node_ops.symlink
        },
        stream: {
          llseek: MEMFS.stream_ops.llseek
        }
      },
      file: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr
        },
        stream: {
          llseek: MEMFS.stream_ops.llseek,
          read: MEMFS.stream_ops.read,
          write: MEMFS.stream_ops.write,
          mmap: MEMFS.stream_ops.mmap,
          msync: MEMFS.stream_ops.msync
        }
      },
      link: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr,
          readlink: MEMFS.node_ops.readlink
        },
        stream: {}
      },
      chrdev: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr
        },
        stream: FS.chrdev_stream_ops
      }
    };
    var node = FS.createNode(parent, name, mode, dev);
    if (FS.isDir(node.mode)) {
      node.node_ops = MEMFS.ops_table.dir.node;
      node.stream_ops = MEMFS.ops_table.dir.stream;
      node.contents = {};
    } else if (FS.isFile(node.mode)) {
      node.node_ops = MEMFS.ops_table.file.node;
      node.stream_ops = MEMFS.ops_table.file.stream;
      node.usedBytes = 0;
      // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
      // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
      // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
      // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
      node.contents = null;
    } else if (FS.isLink(node.mode)) {
      node.node_ops = MEMFS.ops_table.link.node;
      node.stream_ops = MEMFS.ops_table.link.stream;
    } else if (FS.isChrdev(node.mode)) {
      node.node_ops = MEMFS.ops_table.chrdev.node;
      node.stream_ops = MEMFS.ops_table.chrdev.stream;
    }
    node.atime = node.mtime = node.ctime = Date.now();
    // add the new node to the parent
    if (parent) {
      parent.contents[name] = node;
      parent.atime = parent.mtime = parent.ctime = node.atime;
    }
    return node;
  },
  getFileDataAsTypedArray(node) {
    if (!node.contents) return new Uint8Array(0);
    if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
    // Make sure to not return excess unused bytes.
    return new Uint8Array(node.contents);
  },
  expandFileStorage(node, newCapacity) {
    var prevCapacity = node.contents ? node.contents.length : 0;
    if (prevCapacity >= newCapacity) return;
    // No need to expand, the storage was already large enough.
    // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
    // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
    // avoid overshooting the allocation cap by a very large margin.
    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
    newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
    // At minimum allocate 256b for each file when expanding.
    var oldContents = node.contents;
    node.contents = new Uint8Array(newCapacity);
    // Allocate new storage.
    if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
  },
  resizeFileStorage(node, newSize) {
    if (node.usedBytes == newSize) return;
    if (newSize == 0) {
      node.contents = null;
      // Fully decommit when requesting a resize to zero.
      node.usedBytes = 0;
    } else {
      var oldContents = node.contents;
      node.contents = new Uint8Array(newSize);
      // Allocate new storage.
      if (oldContents) {
        node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
      }
      node.usedBytes = newSize;
    }
  },
  node_ops: {
    getattr(node) {
      var attr = {};
      // device numbers reuse inode numbers.
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.atime);
      attr.mtime = new Date(node.mtime);
      attr.ctime = new Date(node.ctime);
      // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
      //       but this is not required by the standard.
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    },
    setattr(node, attr) {
      for (const key of [ "mode", "atime", "mtime", "ctime" ]) {
        if (attr[key] != null) {
          node[key] = attr[key];
        }
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    },
    lookup(parent, name) {
      throw new FS.ErrnoError(44);
    },
    mknod(parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    },
    rename(old_node, new_dir, new_name) {
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {}
      if (new_node) {
        if (FS.isDir(old_node.mode)) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
        FS.hashRemoveNode(new_node);
      }
      // do the internal rewiring
      delete old_node.parent.contents[old_node.name];
      new_dir.contents[new_name] = old_node;
      old_node.name = new_name;
      new_dir.ctime = new_dir.mtime = old_node.parent.ctime = old_node.parent.mtime = Date.now();
    },
    unlink(parent, name) {
      delete parent.contents[name];
      parent.ctime = parent.mtime = Date.now();
    },
    rmdir(parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.ctime = parent.mtime = Date.now();
    },
    readdir(node) {
      return [ ".", "..", ...Object.keys(node.contents) ];
    },
    symlink(parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    },
    readlink(node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    }
  },
  stream_ops: {
    read(stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      assert(size >= 0);
      if (size > 8 && contents.subarray) {
        // non-trivial, and typed array
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
      }
      return size;
    },
    write(stream, buffer, offset, length, position, canOwn) {
      // The data buffer should be a typed array view
      assert(!(buffer instanceof ArrayBuffer));
      // If the buffer is located in main memory (HEAP), and if
      // memory can grow, we can't hold on to references of the
      // memory buffer, as they may get invalidated. That means we
      // need to do copy its contents.
      if (buffer.buffer === (growMemViews(), HEAP8).buffer) {
        canOwn = false;
      }
      if (!length) return 0;
      var node = stream.node;
      node.mtime = node.ctime = Date.now();
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        // This write is from a typed array to a typed array?
        if (canOwn) {
          assert(position === 0, "canOwn must imply no weird position inside the file");
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
          node.contents = buffer.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          // Writing to an already allocated and used subrange of the file?
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }
      // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray) {
        // Use typed array write which is available.
        node.contents.set(buffer.subarray(offset, offset + length), position);
      } else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    },
    llseek(stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    },
    mmap(stream, length, position, prot, flags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      // Only make a new copy when MAP_PRIVATE is specified.
      if (!(flags & 2) && contents && contents.buffer === (growMemViews(), HEAP8).buffer) {
        // We can't emulate MAP_SHARED when the file is not backed by the
        // buffer we're mapping to (e.g. the HEAP buffer).
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        if (contents) {
          // Try to avoid unnecessary slices.
          if (position > 0 || position + length < contents.length) {
            if (contents.subarray) {
              contents = contents.subarray(position, position + length);
            } else {
              contents = Array.prototype.slice.call(contents, position, position + length);
            }
          }
          (growMemViews(), HEAP8).set(contents, ptr);
        }
      }
      return {
        ptr,
        allocated
      };
    },
    msync(stream, buffer, offset, length, mmapFlags) {
      MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
      // should we check if bytesWritten and length are the same?
      return 0;
    }
  }
};

var asyncLoad = async url => {
  var arrayBuffer = await readAsync(url);
  assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
  return new Uint8Array(arrayBuffer);
};

asyncLoad.isAsync = true;

var FS_createDataFile = (...args) => FS.createDataFile(...args);

var getUniqueRunDependency = id => {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
};

var preloadPlugins = [];

var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
  // Ensure plugins are ready.
  if (typeof Browser != "undefined") Browser.init();
  var handled = false;
  preloadPlugins.forEach(plugin => {
    if (handled) return;
    if (plugin["canHandle"](fullname)) {
      plugin["handle"](byteArray, fullname, finish, onerror);
      handled = true;
    }
  });
  return handled;
};

var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
  // TODO we should allow people to just pass in a complete filename instead
  // of parent and name being that we just join them anyways
  var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
  var dep = getUniqueRunDependency(`cp ${fullname}`);
  // might have several active requests for the same fullname
  function processData(byteArray) {
    function finish(byteArray) {
      preFinish?.();
      if (!dontCreateFile) {
        FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
      }
      onload?.();
      removeRunDependency(dep);
    }
    if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
      onerror?.();
      removeRunDependency(dep);
    })) {
      return;
    }
    finish(byteArray);
  }
  addRunDependency(dep);
  if (typeof url == "string") {
    asyncLoad(url).then(processData, onerror);
  } else {
    processData(url);
  }
};

var FS_modeStringToFlags = str => {
  var flagModes = {
    "r": 0,
    "r+": 2,
    "w": 512 | 64 | 1,
    "w+": 512 | 64 | 2,
    "a": 1024 | 64 | 1,
    "a+": 1024 | 64 | 2
  };
  var flags = flagModes[str];
  if (typeof flags == "undefined") {
    throw new Error(`Unknown file open mode: ${str}`);
  }
  return flags;
};

var FS_getMode = (canRead, canWrite) => {
  var mode = 0;
  if (canRead) mode |= 292 | 73;
  if (canWrite) mode |= 146;
  return mode;
};

var strError = errno => UTF8ToString(_strerror(errno));

var ERRNO_CODES = {
  "EPERM": 63,
  "ENOENT": 44,
  "ESRCH": 71,
  "EINTR": 27,
  "EIO": 29,
  "ENXIO": 60,
  "E2BIG": 1,
  "ENOEXEC": 45,
  "EBADF": 8,
  "ECHILD": 12,
  "EAGAIN": 6,
  "EWOULDBLOCK": 6,
  "ENOMEM": 48,
  "EACCES": 2,
  "EFAULT": 21,
  "ENOTBLK": 105,
  "EBUSY": 10,
  "EEXIST": 20,
  "EXDEV": 75,
  "ENODEV": 43,
  "ENOTDIR": 54,
  "EISDIR": 31,
  "EINVAL": 28,
  "ENFILE": 41,
  "EMFILE": 33,
  "ENOTTY": 59,
  "ETXTBSY": 74,
  "EFBIG": 22,
  "ENOSPC": 51,
  "ESPIPE": 70,
  "EROFS": 69,
  "EMLINK": 34,
  "EPIPE": 64,
  "EDOM": 18,
  "ERANGE": 68,
  "ENOMSG": 49,
  "EIDRM": 24,
  "ECHRNG": 106,
  "EL2NSYNC": 156,
  "EL3HLT": 107,
  "EL3RST": 108,
  "ELNRNG": 109,
  "EUNATCH": 110,
  "ENOCSI": 111,
  "EL2HLT": 112,
  "EDEADLK": 16,
  "ENOLCK": 46,
  "EBADE": 113,
  "EBADR": 114,
  "EXFULL": 115,
  "ENOANO": 104,
  "EBADRQC": 103,
  "EBADSLT": 102,
  "EDEADLOCK": 16,
  "EBFONT": 101,
  "ENOSTR": 100,
  "ENODATA": 116,
  "ETIME": 117,
  "ENOSR": 118,
  "ENONET": 119,
  "ENOPKG": 120,
  "EREMOTE": 121,
  "ENOLINK": 47,
  "EADV": 122,
  "ESRMNT": 123,
  "ECOMM": 124,
  "EPROTO": 65,
  "EMULTIHOP": 36,
  "EDOTDOT": 125,
  "EBADMSG": 9,
  "ENOTUNIQ": 126,
  "EBADFD": 127,
  "EREMCHG": 128,
  "ELIBACC": 129,
  "ELIBBAD": 130,
  "ELIBSCN": 131,
  "ELIBMAX": 132,
  "ELIBEXEC": 133,
  "ENOSYS": 52,
  "ENOTEMPTY": 55,
  "ENAMETOOLONG": 37,
  "ELOOP": 32,
  "EOPNOTSUPP": 138,
  "EPFNOSUPPORT": 139,
  "ECONNRESET": 15,
  "ENOBUFS": 42,
  "EAFNOSUPPORT": 5,
  "EPROTOTYPE": 67,
  "ENOTSOCK": 57,
  "ENOPROTOOPT": 50,
  "ESHUTDOWN": 140,
  "ECONNREFUSED": 14,
  "EADDRINUSE": 3,
  "ECONNABORTED": 13,
  "ENETUNREACH": 40,
  "ENETDOWN": 38,
  "ETIMEDOUT": 73,
  "EHOSTDOWN": 142,
  "EHOSTUNREACH": 23,
  "EINPROGRESS": 26,
  "EALREADY": 7,
  "EDESTADDRREQ": 17,
  "EMSGSIZE": 35,
  "EPROTONOSUPPORT": 66,
  "ESOCKTNOSUPPORT": 137,
  "EADDRNOTAVAIL": 4,
  "ENETRESET": 39,
  "EISCONN": 30,
  "ENOTCONN": 53,
  "ETOOMANYREFS": 141,
  "EUSERS": 136,
  "EDQUOT": 19,
  "ESTALE": 72,
  "ENOTSUP": 138,
  "ENOMEDIUM": 148,
  "EILSEQ": 25,
  "EOVERFLOW": 61,
  "ECANCELED": 11,
  "ENOTRECOVERABLE": 56,
  "EOWNERDEAD": 62,
  "ESTRPIPE": 135
};

var FS = {
  root: null,
  mounts: [],
  devices: {},
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: "/",
  initialized: false,
  ignorePermissions: true,
  filesystems: null,
  syncFSRequests: 0,
  readFiles: {},
  ErrnoError: class extends Error {
    name="ErrnoError";
    // We set the `name` property to be able to identify `FS.ErrnoError`
    // - the `name` is a standard ECMA-262 property of error objects. Kind of good to have it anyway.
    // - when using PROXYFS, an error can come from an underlying FS
    // as different FS objects have their own FS.ErrnoError each,
    // the test `err instanceof FS.ErrnoError` won't detect an error coming from another filesystem, causing bugs.
    // we'll use the reliable test `err.name == "ErrnoError"` instead
    constructor(errno) {
      super(runtimeInitialized ? strError(errno) : "");
      this.errno = errno;
      for (var key in ERRNO_CODES) {
        if (ERRNO_CODES[key] === errno) {
          this.code = key;
          break;
        }
      }
    }
  },
  FSStream: class {
    shared={};
    get object() {
      return this.node;
    }
    set object(val) {
      this.node = val;
    }
    get isRead() {
      return (this.flags & 2097155) !== 1;
    }
    get isWrite() {
      return (this.flags & 2097155) !== 0;
    }
    get isAppend() {
      return (this.flags & 1024);
    }
    get flags() {
      return this.shared.flags;
    }
    set flags(val) {
      this.shared.flags = val;
    }
    get position() {
      return this.shared.position;
    }
    set position(val) {
      this.shared.position = val;
    }
  },
  FSNode: class {
    node_ops={};
    stream_ops={};
    readMode=292 | 73;
    writeMode=146;
    mounted=null;
    constructor(parent, name, mode, rdev) {
      if (!parent) {
        parent = this;
      }
      this.parent = parent;
      this.mount = parent.mount;
      this.id = FS.nextInode++;
      this.name = name;
      this.mode = mode;
      this.rdev = rdev;
      this.atime = this.mtime = this.ctime = Date.now();
    }
    get read() {
      return (this.mode & this.readMode) === this.readMode;
    }
    set read(val) {
      val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
    }
    get write() {
      return (this.mode & this.writeMode) === this.writeMode;
    }
    set write(val) {
      val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
    }
    get isFolder() {
      return FS.isDir(this.mode);
    }
    get isDevice() {
      return FS.isChrdev(this.mode);
    }
  },
  lookupPath(path, opts = {}) {
    if (!path) {
      throw new FS.ErrnoError(44);
    }
    opts.follow_mount ??= true;
    if (!PATH.isAbs(path)) {
      path = FS.cwd() + "/" + path;
    }
    // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
    linkloop: for (var nlinks = 0; nlinks < 40; nlinks++) {
      // split the absolute path
      var parts = path.split("/").filter(p => !!p);
      // start at the root
      var current = FS.root;
      var current_path = "/";
      for (var i = 0; i < parts.length; i++) {
        var islast = (i === parts.length - 1);
        if (islast && opts.parent) {
          // stop resolving
          break;
        }
        if (parts[i] === ".") {
          continue;
        }
        if (parts[i] === "..") {
          current_path = PATH.dirname(current_path);
          if (FS.isRoot(current)) {
            path = current_path + "/" + parts.slice(i + 1).join("/");
            continue linkloop;
          } else {
            current = current.parent;
          }
          continue;
        }
        current_path = PATH.join2(current_path, parts[i]);
        try {
          current = FS.lookupNode(current, parts[i]);
        } catch (e) {
          // if noent_okay is true, suppress a ENOENT in the last component
          // and return an object with an undefined node. This is needed for
          // resolving symlinks in the path when creating a file.
          if ((e?.errno === 44) && islast && opts.noent_okay) {
            return {
              path: current_path
            };
          }
          throw e;
        }
        // jump to the mount's root node if this is a mountpoint
        if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
          current = current.mounted.root;
        }
        // by default, lookupPath will not follow a symlink if it is the final path component.
        // setting opts.follow = true will override this behavior.
        if (FS.isLink(current.mode) && (!islast || opts.follow)) {
          if (!current.node_ops.readlink) {
            throw new FS.ErrnoError(52);
          }
          var link = current.node_ops.readlink(current);
          if (!PATH.isAbs(link)) {
            link = PATH.dirname(current_path) + "/" + link;
          }
          path = link + "/" + parts.slice(i + 1).join("/");
          continue linkloop;
        }
      }
      return {
        path: current_path,
        node: current
      };
    }
    throw new FS.ErrnoError(32);
  },
  getPath(node) {
    var path;
    while (true) {
      if (FS.isRoot(node)) {
        var mount = node.mount.mountpoint;
        if (!path) return mount;
        return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path;
      }
      path = path ? `${node.name}/${path}` : node.name;
      node = node.parent;
    }
  },
  hashName(parentid, name) {
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    }
    return ((parentid + hash) >>> 0) % FS.nameTable.length;
  },
  hashAddNode(node) {
    var hash = FS.hashName(node.parent.id, node.name);
    node.name_next = FS.nameTable[hash];
    FS.nameTable[hash] = node;
  },
  hashRemoveNode(node) {
    var hash = FS.hashName(node.parent.id, node.name);
    if (FS.nameTable[hash] === node) {
      FS.nameTable[hash] = node.name_next;
    } else {
      var current = FS.nameTable[hash];
      while (current) {
        if (current.name_next === node) {
          current.name_next = node.name_next;
          break;
        }
        current = current.name_next;
      }
    }
  },
  lookupNode(parent, name) {
    var errCode = FS.mayLookup(parent);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    var hash = FS.hashName(parent.id, name);
    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
      var nodeName = node.name;
      if (node.parent.id === parent.id && nodeName === name) {
        return node;
      }
    }
    // if we failed to find it in the cache, call into the VFS
    return FS.lookup(parent, name);
  },
  createNode(parent, name, mode, rdev) {
    assert(typeof parent == "object");
    var node = new FS.FSNode(parent, name, mode, rdev);
    FS.hashAddNode(node);
    return node;
  },
  destroyNode(node) {
    FS.hashRemoveNode(node);
  },
  isRoot(node) {
    return node === node.parent;
  },
  isMountpoint(node) {
    return !!node.mounted;
  },
  isFile(mode) {
    return (mode & 61440) === 32768;
  },
  isDir(mode) {
    return (mode & 61440) === 16384;
  },
  isLink(mode) {
    return (mode & 61440) === 40960;
  },
  isChrdev(mode) {
    return (mode & 61440) === 8192;
  },
  isBlkdev(mode) {
    return (mode & 61440) === 24576;
  },
  isFIFO(mode) {
    return (mode & 61440) === 4096;
  },
  isSocket(mode) {
    return (mode & 49152) === 49152;
  },
  flagsToPermissionString(flag) {
    var perms = [ "r", "w", "rw" ][flag & 3];
    if ((flag & 512)) {
      perms += "w";
    }
    return perms;
  },
  nodePermissions(node, perms) {
    if (FS.ignorePermissions) {
      return 0;
    }
    // return 0 if any user, group or owner bits are set.
    if (perms.includes("r") && !(node.mode & 292)) {
      return 2;
    } else if (perms.includes("w") && !(node.mode & 146)) {
      return 2;
    } else if (perms.includes("x") && !(node.mode & 73)) {
      return 2;
    }
    return 0;
  },
  mayLookup(dir) {
    if (!FS.isDir(dir.mode)) return 54;
    var errCode = FS.nodePermissions(dir, "x");
    if (errCode) return errCode;
    if (!dir.node_ops.lookup) return 2;
    return 0;
  },
  mayCreate(dir, name) {
    if (!FS.isDir(dir.mode)) {
      return 54;
    }
    try {
      var node = FS.lookupNode(dir, name);
      return 20;
    } catch (e) {}
    return FS.nodePermissions(dir, "wx");
  },
  mayDelete(dir, name, isdir) {
    var node;
    try {
      node = FS.lookupNode(dir, name);
    } catch (e) {
      return e.errno;
    }
    var errCode = FS.nodePermissions(dir, "wx");
    if (errCode) {
      return errCode;
    }
    if (isdir) {
      if (!FS.isDir(node.mode)) {
        return 54;
      }
      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
        return 10;
      }
    } else {
      if (FS.isDir(node.mode)) {
        return 31;
      }
    }
    return 0;
  },
  mayOpen(node, flags) {
    if (!node) {
      return 44;
    }
    if (FS.isLink(node.mode)) {
      return 32;
    } else if (FS.isDir(node.mode)) {
      if (FS.flagsToPermissionString(flags) !== "r" || (flags & (512 | 64))) {
        // TODO: check for O_SEARCH? (== search for dir only)
        return 31;
      }
    }
    return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
  },
  checkOpExists(op, err) {
    if (!op) {
      throw new FS.ErrnoError(err);
    }
    return op;
  },
  MAX_OPEN_FDS: 4096,
  nextfd() {
    for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
      if (!FS.streams[fd]) {
        return fd;
      }
    }
    throw new FS.ErrnoError(33);
  },
  getStreamChecked(fd) {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    return stream;
  },
  getStream: fd => FS.streams[fd],
  createStream(stream, fd = -1) {
    assert(fd >= -1);
    // clone it, so we can return an instance of FSStream
    stream = Object.assign(new FS.FSStream, stream);
    if (fd == -1) {
      fd = FS.nextfd();
    }
    stream.fd = fd;
    FS.streams[fd] = stream;
    return stream;
  },
  closeStream(fd) {
    FS.streams[fd] = null;
  },
  dupStream(origStream, fd = -1) {
    var stream = FS.createStream(origStream, fd);
    stream.stream_ops?.dup?.(stream);
    return stream;
  },
  doSetAttr(stream, node, attr) {
    var setattr = stream?.stream_ops.setattr;
    var arg = setattr ? stream : node;
    setattr ??= node.node_ops.setattr;
    FS.checkOpExists(setattr, 63);
    setattr(arg, attr);
  },
  chrdev_stream_ops: {
    open(stream) {
      var device = FS.getDevice(stream.node.rdev);
      // override node's stream ops with the device's
      stream.stream_ops = device.stream_ops;
      // forward the open call
      stream.stream_ops.open?.(stream);
    },
    llseek() {
      throw new FS.ErrnoError(70);
    }
  },
  major: dev => ((dev) >> 8),
  minor: dev => ((dev) & 255),
  makedev: (ma, mi) => ((ma) << 8 | (mi)),
  registerDevice(dev, ops) {
    FS.devices[dev] = {
      stream_ops: ops
    };
  },
  getDevice: dev => FS.devices[dev],
  getMounts(mount) {
    var mounts = [];
    var check = [ mount ];
    while (check.length) {
      var m = check.pop();
      mounts.push(m);
      check.push(...m.mounts);
    }
    return mounts;
  },
  syncfs(populate, callback) {
    if (typeof populate == "function") {
      callback = populate;
      populate = false;
    }
    FS.syncFSRequests++;
    if (FS.syncFSRequests > 1) {
      err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
    }
    var mounts = FS.getMounts(FS.root.mount);
    var completed = 0;
    function doCallback(errCode) {
      assert(FS.syncFSRequests > 0);
      FS.syncFSRequests--;
      return callback(errCode);
    }
    function done(errCode) {
      if (errCode) {
        if (!done.errored) {
          done.errored = true;
          return doCallback(errCode);
        }
        return;
      }
      if (++completed >= mounts.length) {
        doCallback(null);
      }
    }
    // sync all mounts
    mounts.forEach(mount => {
      if (!mount.type.syncfs) {
        return done(null);
      }
      mount.type.syncfs(mount, populate, done);
    });
  },
  mount(type, opts, mountpoint) {
    if (typeof type == "string") {
      // The filesystem was not included, and instead we have an error
      // message stored in the variable.
      throw type;
    }
    var root = mountpoint === "/";
    var pseudo = !mountpoint;
    var node;
    if (root && FS.root) {
      throw new FS.ErrnoError(10);
    } else if (!root && !pseudo) {
      var lookup = FS.lookupPath(mountpoint, {
        follow_mount: false
      });
      mountpoint = lookup.path;
      // use the absolute path
      node = lookup.node;
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      if (!FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
    }
    var mount = {
      type,
      opts,
      mountpoint,
      mounts: []
    };
    // create a root node for the fs
    var mountRoot = type.mount(mount);
    mountRoot.mount = mount;
    mount.root = mountRoot;
    if (root) {
      FS.root = mountRoot;
    } else if (node) {
      // set as a mountpoint
      node.mounted = mount;
      // add the new mount to the current mount's children
      if (node.mount) {
        node.mount.mounts.push(mount);
      }
    }
    return mountRoot;
  },
  unmount(mountpoint) {
    var lookup = FS.lookupPath(mountpoint, {
      follow_mount: false
    });
    if (!FS.isMountpoint(lookup.node)) {
      throw new FS.ErrnoError(28);
    }
    // destroy the nodes for this mount, and all its child mounts
    var node = lookup.node;
    var mount = node.mounted;
    var mounts = FS.getMounts(mount);
    Object.keys(FS.nameTable).forEach(hash => {
      var current = FS.nameTable[hash];
      while (current) {
        var next = current.name_next;
        if (mounts.includes(current.mount)) {
          FS.destroyNode(current);
        }
        current = next;
      }
    });
    // no longer a mountpoint
    node.mounted = null;
    // remove this mount from the child mounts
    var idx = node.mount.mounts.indexOf(mount);
    assert(idx !== -1);
    node.mount.mounts.splice(idx, 1);
  },
  lookup(parent, name) {
    return parent.node_ops.lookup(parent, name);
  },
  mknod(path, mode, dev) {
    var lookup = FS.lookupPath(path, {
      parent: true
    });
    var parent = lookup.node;
    var name = PATH.basename(path);
    if (!name) {
      throw new FS.ErrnoError(28);
    }
    if (name === "." || name === "..") {
      throw new FS.ErrnoError(20);
    }
    var errCode = FS.mayCreate(parent, name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.mknod) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.mknod(parent, name, mode, dev);
  },
  statfs(path) {
    return FS.statfsNode(FS.lookupPath(path, {
      follow: true
    }).node);
  },
  statfsStream(stream) {
    // We keep a separate statfsStream function because noderawfs overrides
    // it. In noderawfs, stream.node is sometimes null. Instead, we need to
    // look at stream.path.
    return FS.statfsNode(stream.node);
  },
  statfsNode(node) {
    // NOTE: None of the defaults here are true. We're just returning safe and
    //       sane values. Currently nodefs and rawfs replace these defaults,
    //       other file systems leave them alone.
    var rtn = {
      bsize: 4096,
      frsize: 4096,
      blocks: 1e6,
      bfree: 5e5,
      bavail: 5e5,
      files: FS.nextInode,
      ffree: FS.nextInode - 1,
      fsid: 42,
      flags: 2,
      namelen: 255
    };
    if (node.node_ops.statfs) {
      Object.assign(rtn, node.node_ops.statfs(node.mount.opts.root));
    }
    return rtn;
  },
  create(path, mode = 438) {
    mode &= 4095;
    mode |= 32768;
    return FS.mknod(path, mode, 0);
  },
  mkdir(path, mode = 511) {
    mode &= 511 | 512;
    mode |= 16384;
    return FS.mknod(path, mode, 0);
  },
  mkdirTree(path, mode) {
    var dirs = path.split("/");
    var d = "";
    for (var dir of dirs) {
      if (!dir) continue;
      if (d || PATH.isAbs(path)) d += "/";
      d += dir;
      try {
        FS.mkdir(d, mode);
      } catch (e) {
        if (e.errno != 20) throw e;
      }
    }
  },
  mkdev(path, mode, dev) {
    if (typeof dev == "undefined") {
      dev = mode;
      mode = 438;
    }
    mode |= 8192;
    return FS.mknod(path, mode, dev);
  },
  symlink(oldpath, newpath) {
    if (!PATH_FS.resolve(oldpath)) {
      throw new FS.ErrnoError(44);
    }
    var lookup = FS.lookupPath(newpath, {
      parent: true
    });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var newname = PATH.basename(newpath);
    var errCode = FS.mayCreate(parent, newname);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.symlink) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.symlink(parent, newname, oldpath);
  },
  rename(old_path, new_path) {
    var old_dirname = PATH.dirname(old_path);
    var new_dirname = PATH.dirname(new_path);
    var old_name = PATH.basename(old_path);
    var new_name = PATH.basename(new_path);
    // parents must exist
    var lookup, old_dir, new_dir;
    // let the errors from non existent directories percolate up
    lookup = FS.lookupPath(old_path, {
      parent: true
    });
    old_dir = lookup.node;
    lookup = FS.lookupPath(new_path, {
      parent: true
    });
    new_dir = lookup.node;
    if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
    // need to be part of the same mount
    if (old_dir.mount !== new_dir.mount) {
      throw new FS.ErrnoError(75);
    }
    // source must exist
    var old_node = FS.lookupNode(old_dir, old_name);
    // old path should not be an ancestor of the new path
    var relative = PATH_FS.relative(old_path, new_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(28);
    }
    // new path should not be an ancestor of the old path
    relative = PATH_FS.relative(new_path, old_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(55);
    }
    // see if the new path already exists
    var new_node;
    try {
      new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    // early out if nothing needs to change
    if (old_node === new_node) {
      return;
    }
    // we'll need to delete the old entry
    var isdir = FS.isDir(old_node.mode);
    var errCode = FS.mayDelete(old_dir, old_name, isdir);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    // need delete permissions if we'll be overwriting.
    // need create permissions if new doesn't already exist.
    errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!old_dir.node_ops.rename) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
      throw new FS.ErrnoError(10);
    }
    // if we are going to change the parent, check write permissions
    if (new_dir !== old_dir) {
      errCode = FS.nodePermissions(old_dir, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    // remove the node from the lookup hash
    FS.hashRemoveNode(old_node);
    // do the underlying fs rename
    try {
      old_dir.node_ops.rename(old_node, new_dir, new_name);
      // update old node (we do this here to avoid each backend
      // needing to)
      old_node.parent = new_dir;
    } catch (e) {
      throw e;
    } finally {
      // add the node back to the hash (in case node_ops.rename
      // changed its name)
      FS.hashAddNode(old_node);
    }
  },
  rmdir(path) {
    var lookup = FS.lookupPath(path, {
      parent: true
    });
    var parent = lookup.node;
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, true);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.rmdir) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.rmdir(parent, name);
    FS.destroyNode(node);
  },
  readdir(path) {
    var lookup = FS.lookupPath(path, {
      follow: true
    });
    var node = lookup.node;
    var readdir = FS.checkOpExists(node.node_ops.readdir, 54);
    return readdir(node);
  },
  unlink(path) {
    var lookup = FS.lookupPath(path, {
      parent: true
    });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, false);
    if (errCode) {
      // According to POSIX, we should map EISDIR to EPERM, but
      // we instead do what Linux does (and we must, as we use
      // the musl linux libc).
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.unlink) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.unlink(parent, name);
    FS.destroyNode(node);
  },
  readlink(path) {
    var lookup = FS.lookupPath(path);
    var link = lookup.node;
    if (!link) {
      throw new FS.ErrnoError(44);
    }
    if (!link.node_ops.readlink) {
      throw new FS.ErrnoError(28);
    }
    return link.node_ops.readlink(link);
  },
  stat(path, dontFollow) {
    var lookup = FS.lookupPath(path, {
      follow: !dontFollow
    });
    var node = lookup.node;
    var getattr = FS.checkOpExists(node.node_ops.getattr, 63);
    return getattr(node);
  },
  fstat(fd) {
    var stream = FS.getStreamChecked(fd);
    var node = stream.node;
    var getattr = stream.stream_ops.getattr;
    var arg = getattr ? stream : node;
    getattr ??= node.node_ops.getattr;
    FS.checkOpExists(getattr, 63);
    return getattr(arg);
  },
  lstat(path) {
    return FS.stat(path, true);
  },
  doChmod(stream, node, mode, dontFollow) {
    FS.doSetAttr(stream, node, {
      mode: (mode & 4095) | (node.mode & ~4095),
      ctime: Date.now(),
      dontFollow
    });
  },
  chmod(path, mode, dontFollow) {
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, {
        follow: !dontFollow
      });
      node = lookup.node;
    } else {
      node = path;
    }
    FS.doChmod(null, node, mode, dontFollow);
  },
  lchmod(path, mode) {
    FS.chmod(path, mode, true);
  },
  fchmod(fd, mode) {
    var stream = FS.getStreamChecked(fd);
    FS.doChmod(stream, stream.node, mode, false);
  },
  doChown(stream, node, dontFollow) {
    FS.doSetAttr(stream, node, {
      timestamp: Date.now(),
      dontFollow
    });
  },
  chown(path, uid, gid, dontFollow) {
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, {
        follow: !dontFollow
      });
      node = lookup.node;
    } else {
      node = path;
    }
    FS.doChown(null, node, dontFollow);
  },
  lchown(path, uid, gid) {
    FS.chown(path, uid, gid, true);
  },
  fchown(fd, uid, gid) {
    var stream = FS.getStreamChecked(fd);
    FS.doChown(stream, stream.node, false);
  },
  doTruncate(stream, node, len) {
    if (FS.isDir(node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!FS.isFile(node.mode)) {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.nodePermissions(node, "w");
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    FS.doSetAttr(stream, node, {
      size: len,
      timestamp: Date.now()
    });
  },
  truncate(path, len) {
    if (len < 0) {
      throw new FS.ErrnoError(28);
    }
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, {
        follow: true
      });
      node = lookup.node;
    } else {
      node = path;
    }
    FS.doTruncate(null, node, len);
  },
  ftruncate(fd, len) {
    var stream = FS.getStreamChecked(fd);
    if (len < 0 || (stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(28);
    }
    FS.doTruncate(stream, stream.node, len);
  },
  utime(path, atime, mtime) {
    var lookup = FS.lookupPath(path, {
      follow: true
    });
    var node = lookup.node;
    var setattr = FS.checkOpExists(node.node_ops.setattr, 63);
    setattr(node, {
      atime,
      mtime
    });
  },
  open(path, flags, mode = 438) {
    if (path === "") {
      throw new FS.ErrnoError(44);
    }
    flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
    if ((flags & 64)) {
      mode = (mode & 4095) | 32768;
    } else {
      mode = 0;
    }
    var node;
    var isDirPath;
    if (typeof path == "object") {
      node = path;
    } else {
      isDirPath = path.endsWith("/");
      // noent_okay makes it so that if the final component of the path
      // doesn't exist, lookupPath returns `node: undefined`. `path` will be
      // updated to point to the target of all symlinks.
      var lookup = FS.lookupPath(path, {
        follow: !(flags & 131072),
        noent_okay: true
      });
      node = lookup.node;
      path = lookup.path;
    }
    // perhaps we need to create the node
    var created = false;
    if ((flags & 64)) {
      if (node) {
        // if O_CREAT and O_EXCL are set, error out if the node already exists
        if ((flags & 128)) {
          throw new FS.ErrnoError(20);
        }
      } else if (isDirPath) {
        throw new FS.ErrnoError(31);
      } else {
        // node doesn't exist, try to create it
        // Ignore the permission bits here to ensure we can `open` this new
        // file below. We use chmod below the apply the permissions once the
        // file is open.
        node = FS.mknod(path, mode | 511, 0);
        created = true;
      }
    }
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    // can't truncate a device
    if (FS.isChrdev(node.mode)) {
      flags &= ~512;
    }
    // if asked only for a directory, then this must be one
    if ((flags & 65536) && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(54);
    }
    // check permissions, if this is not a file we just created now (it is ok to
    // create and write to a file with read-only permissions; it is read-only
    // for later use)
    if (!created) {
      var errCode = FS.mayOpen(node, flags);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    // do truncation if necessary
    if ((flags & 512) && !created) {
      FS.truncate(node, 0);
    }
    // we've already handled these, don't pass down to the underlying vfs
    flags &= ~(128 | 512 | 131072);
    // register the stream with the filesystem
    var stream = FS.createStream({
      node,
      path: FS.getPath(node),
      // we want the absolute path to the node
      flags,
      seekable: true,
      position: 0,
      stream_ops: node.stream_ops,
      // used by the file family libc calls (fopen, fwrite, ferror, etc.)
      ungotten: [],
      error: false
    });
    // call the new stream's open function
    if (stream.stream_ops.open) {
      stream.stream_ops.open(stream);
    }
    if (created) {
      FS.chmod(node, mode & 511);
    }
    if (Module["logReadFiles"] && !(flags & 1)) {
      if (!(path in FS.readFiles)) {
        FS.readFiles[path] = 1;
      }
    }
    return stream;
  },
  close(stream) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (stream.getdents) stream.getdents = null;
    // free readdir state
    try {
      if (stream.stream_ops.close) {
        stream.stream_ops.close(stream);
      }
    } catch (e) {
      throw e;
    } finally {
      FS.closeStream(stream.fd);
    }
    stream.fd = null;
  },
  isClosed(stream) {
    return stream.fd === null;
  },
  llseek(stream, offset, whence) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (!stream.seekable || !stream.stream_ops.llseek) {
      throw new FS.ErrnoError(70);
    }
    if (whence != 0 && whence != 1 && whence != 2) {
      throw new FS.ErrnoError(28);
    }
    stream.position = stream.stream_ops.llseek(stream, offset, whence);
    stream.ungotten = [];
    return stream.position;
  },
  read(stream, buffer, offset, length, position) {
    assert(offset >= 0);
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.read) {
      throw new FS.ErrnoError(28);
    }
    var seeking = typeof position != "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
    if (!seeking) stream.position += bytesRead;
    return bytesRead;
  },
  write(stream, buffer, offset, length, position, canOwn) {
    assert(offset >= 0);
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.write) {
      throw new FS.ErrnoError(28);
    }
    if (stream.seekable && stream.flags & 1024) {
      // seek to the end before writing in append mode
      FS.llseek(stream, 0, 2);
    }
    var seeking = typeof position != "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
    if (!seeking) stream.position += bytesWritten;
    return bytesWritten;
  },
  mmap(stream, length, position, prot, flags) {
    // User requests writing to file (prot & PROT_WRITE != 0).
    // Checking if we have permissions to write to the file unless
    // MAP_PRIVATE flag is set. According to POSIX spec it is possible
    // to write to file opened in read-only mode with MAP_PRIVATE flag,
    // as all modifications will be visible only in the memory of
    // the current process.
    if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
      throw new FS.ErrnoError(2);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(2);
    }
    if (!stream.stream_ops.mmap) {
      throw new FS.ErrnoError(43);
    }
    if (!length) {
      throw new FS.ErrnoError(28);
    }
    return stream.stream_ops.mmap(stream, length, position, prot, flags);
  },
  msync(stream, buffer, offset, length, mmapFlags) {
    assert(offset >= 0);
    if (!stream.stream_ops.msync) {
      return 0;
    }
    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
  },
  ioctl(stream, cmd, arg) {
    if (!stream.stream_ops.ioctl) {
      throw new FS.ErrnoError(59);
    }
    return stream.stream_ops.ioctl(stream, cmd, arg);
  },
  readFile(path, opts = {}) {
    opts.flags = opts.flags || 0;
    opts.encoding = opts.encoding || "binary";
    if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
      throw new Error(`Invalid encoding type "${opts.encoding}"`);
    }
    var stream = FS.open(path, opts.flags);
    var stat = FS.stat(path);
    var length = stat.size;
    var buf = new Uint8Array(length);
    FS.read(stream, buf, 0, length, 0);
    if (opts.encoding === "utf8") {
      buf = UTF8ArrayToString(buf);
    }
    FS.close(stream);
    return buf;
  },
  writeFile(path, data, opts = {}) {
    opts.flags = opts.flags || 577;
    var stream = FS.open(path, opts.flags, opts.mode);
    if (typeof data == "string") {
      data = new Uint8Array(intArrayFromString(data, true));
    }
    if (ArrayBuffer.isView(data)) {
      FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
    } else {
      throw new Error("Unsupported data type");
    }
    FS.close(stream);
  },
  cwd: () => FS.currentPath,
  chdir(path) {
    var lookup = FS.lookupPath(path, {
      follow: true
    });
    if (lookup.node === null) {
      throw new FS.ErrnoError(44);
    }
    if (!FS.isDir(lookup.node.mode)) {
      throw new FS.ErrnoError(54);
    }
    var errCode = FS.nodePermissions(lookup.node, "x");
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    FS.currentPath = lookup.path;
  },
  createDefaultDirectories() {
    FS.mkdir("/tmp");
    FS.mkdir("/home");
    FS.mkdir("/home/web_user");
  },
  createDefaultDevices() {
    // create /dev
    FS.mkdir("/dev");
    // setup /dev/null
    FS.registerDevice(FS.makedev(1, 3), {
      read: () => 0,
      write: (stream, buffer, offset, length, pos) => length,
      llseek: () => 0
    });
    FS.mkdev("/dev/null", FS.makedev(1, 3));
    // setup /dev/tty and /dev/tty1
    // stderr needs to print output using err() rather than out()
    // so we register a second tty just for it.
    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
    FS.mkdev("/dev/tty", FS.makedev(5, 0));
    FS.mkdev("/dev/tty1", FS.makedev(6, 0));
    // setup /dev/[u]random
    // use a buffer to avoid overhead of individual crypto calls per byte
    var randomBuffer = new Uint8Array(1024), randomLeft = 0;
    var randomByte = () => {
      if (randomLeft === 0) {
        randomFill(randomBuffer);
        randomLeft = randomBuffer.byteLength;
      }
      return randomBuffer[--randomLeft];
    };
    FS.createDevice("/dev", "random", randomByte);
    FS.createDevice("/dev", "urandom", randomByte);
    // we're not going to emulate the actual shm device,
    // just create the tmp dirs that reside in it commonly
    FS.mkdir("/dev/shm");
    FS.mkdir("/dev/shm/tmp");
  },
  createSpecialDirectories() {
    // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
    // name of the stream for fd 6 (see test_unistd_ttyname)
    FS.mkdir("/proc");
    var proc_self = FS.mkdir("/proc/self");
    FS.mkdir("/proc/self/fd");
    FS.mount({
      mount() {
        var node = FS.createNode(proc_self, "fd", 16895, 73);
        node.stream_ops = {
          llseek: MEMFS.stream_ops.llseek
        };
        node.node_ops = {
          lookup(parent, name) {
            var fd = +name;
            var stream = FS.getStreamChecked(fd);
            var ret = {
              parent: null,
              mount: {
                mountpoint: "fake"
              },
              node_ops: {
                readlink: () => stream.path
              },
              id: fd + 1
            };
            ret.parent = ret;
            // make it look like a simple root node
            return ret;
          },
          readdir() {
            return Array.from(FS.streams.entries()).filter(([k, v]) => v).map(([k, v]) => k.toString());
          }
        };
        return node;
      }
    }, {}, "/proc/self/fd");
  },
  createStandardStreams(input, output, error) {
    // TODO deprecate the old functionality of a single
    // input / output callback and that utilizes FS.createDevice
    // and instead require a unique set of stream ops
    // by default, we symlink the standard streams to the
    // default tty devices. however, if the standard streams
    // have been overwritten we create a unique device for
    // them instead.
    if (input) {
      FS.createDevice("/dev", "stdin", input);
    } else {
      FS.symlink("/dev/tty", "/dev/stdin");
    }
    if (output) {
      FS.createDevice("/dev", "stdout", null, output);
    } else {
      FS.symlink("/dev/tty", "/dev/stdout");
    }
    if (error) {
      FS.createDevice("/dev", "stderr", null, error);
    } else {
      FS.symlink("/dev/tty1", "/dev/stderr");
    }
    // open default streams for the stdin, stdout and stderr devices
    var stdin = FS.open("/dev/stdin", 0);
    var stdout = FS.open("/dev/stdout", 1);
    var stderr = FS.open("/dev/stderr", 1);
    assert(stdin.fd === 0, `invalid handle for stdin (${stdin.fd})`);
    assert(stdout.fd === 1, `invalid handle for stdout (${stdout.fd})`);
    assert(stderr.fd === 2, `invalid handle for stderr (${stderr.fd})`);
  },
  staticInit() {
    FS.nameTable = new Array(4096);
    FS.mount(MEMFS, {}, "/");
    FS.createDefaultDirectories();
    FS.createDefaultDevices();
    FS.createSpecialDirectories();
    FS.filesystems = {
      "MEMFS": MEMFS
    };
  },
  init(input, output, error) {
    assert(!FS.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
    FS.initialized = true;
    // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
    input ??= Module["stdin"];
    output ??= Module["stdout"];
    error ??= Module["stderr"];
    FS.createStandardStreams(input, output, error);
  },
  quit() {
    FS.initialized = false;
    // force-flush all streams, so we get musl std streams printed out
    _fflush(0);
    // close all of our streams
    for (var stream of FS.streams) {
      if (stream) {
        FS.close(stream);
      }
    }
  },
  findObject(path, dontResolveLastLink) {
    var ret = FS.analyzePath(path, dontResolveLastLink);
    if (!ret.exists) {
      return null;
    }
    return ret.object;
  },
  analyzePath(path, dontResolveLastLink) {
    // operate from within the context of the symlink's target
    try {
      var lookup = FS.lookupPath(path, {
        follow: !dontResolveLastLink
      });
      path = lookup.path;
    } catch (e) {}
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null
    };
    try {
      var lookup = FS.lookupPath(path, {
        parent: true
      });
      ret.parentExists = true;
      ret.parentPath = lookup.path;
      ret.parentObject = lookup.node;
      ret.name = PATH.basename(path);
      lookup = FS.lookupPath(path, {
        follow: !dontResolveLastLink
      });
      ret.exists = true;
      ret.path = lookup.path;
      ret.object = lookup.node;
      ret.name = lookup.node.name;
      ret.isRoot = lookup.path === "/";
    } catch (e) {
      ret.error = e.errno;
    }
    return ret;
  },
  createPath(parent, path, canRead, canWrite) {
    parent = typeof parent == "string" ? parent : FS.getPath(parent);
    var parts = path.split("/").reverse();
    while (parts.length) {
      var part = parts.pop();
      if (!part) continue;
      var current = PATH.join2(parent, part);
      try {
        FS.mkdir(current);
      } catch (e) {
        if (e.errno != 20) throw e;
      }
      parent = current;
    }
    return current;
  },
  createFile(parent, name, properties, canRead, canWrite) {
    var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
    var mode = FS_getMode(canRead, canWrite);
    return FS.create(path, mode);
  },
  createDataFile(parent, name, data, canRead, canWrite, canOwn) {
    var path = name;
    if (parent) {
      parent = typeof parent == "string" ? parent : FS.getPath(parent);
      path = name ? PATH.join2(parent, name) : parent;
    }
    var mode = FS_getMode(canRead, canWrite);
    var node = FS.create(path, mode);
    if (data) {
      if (typeof data == "string") {
        var arr = new Array(data.length);
        for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
        data = arr;
      }
      // make sure we can write to the file
      FS.chmod(node, mode | 146);
      var stream = FS.open(node, 577);
      FS.write(stream, data, 0, data.length, 0, canOwn);
      FS.close(stream);
      FS.chmod(node, mode);
    }
  },
  createDevice(parent, name, input, output) {
    var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
    var mode = FS_getMode(!!input, !!output);
    FS.createDevice.major ??= 64;
    var dev = FS.makedev(FS.createDevice.major++, 0);
    // Create a fake device that a set of stream ops to emulate
    // the old behavior.
    FS.registerDevice(dev, {
      open(stream) {
        stream.seekable = false;
      },
      close(stream) {
        // flush any pending line data
        if (output?.buffer?.length) {
          output(10);
        }
      },
      read(stream, buffer, offset, length, pos) {
        var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === undefined) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.atime = Date.now();
        }
        return bytesRead;
      },
      write(stream, buffer, offset, length, pos) {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.mtime = stream.node.ctime = Date.now();
        }
        return i;
      }
    });
    return FS.mkdev(path, mode, dev);
  },
  forceLoadFile(obj) {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
    if (typeof XMLHttpRequest != "undefined") {
      throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
    } else {
      // Command-line.
      try {
        obj.contents = readBinary(obj.url);
        obj.usedBytes = obj.contents.length;
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
    }
  },
  createLazyFile(parent, name, url, canRead, canWrite) {
    // Lazy chunked Uint8Array (implements get and length from Uint8Array).
    // Actual getting is abstracted away for eventual reuse.
    class LazyUint8Array {
      lengthKnown=false;
      chunks=[];
      // Loaded chunks. Index is the chunk number
      get(idx) {
        if (idx > this.length - 1 || idx < 0) {
          return undefined;
        }
        var chunkOffset = idx % this.chunkSize;
        var chunkNum = (idx / this.chunkSize) | 0;
        return this.getter(chunkNum)[chunkOffset];
      }
      setDataGetter(getter) {
        this.getter = getter;
      }
      cacheLength() {
        // Find length
        var xhr = new XMLHttpRequest;
        xhr.open("HEAD", url, false);
        xhr.send(null);
        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
        var datalength = Number(xhr.getResponseHeader("Content-length"));
        var header;
        var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
        var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
        var chunkSize = 1024 * 1024;
        // Chunk size in bytes
        if (!hasByteServing) chunkSize = datalength;
        // Function to get a range from the remote URL.
        var doXHR = (from, to) => {
          if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
          if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
          // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
          var xhr = new XMLHttpRequest;
          xhr.open("GET", url, false);
          if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
          // Some hints to the browser that we want binary data.
          xhr.responseType = "arraybuffer";
          if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
          }
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          if (xhr.response !== undefined) {
            return new Uint8Array(/** @type{Array<number>} */ (xhr.response || []));
          }
          return intArrayFromString(xhr.responseText || "", true);
        };
        var lazyArray = this;
        lazyArray.setDataGetter(chunkNum => {
          var start = chunkNum * chunkSize;
          var end = (chunkNum + 1) * chunkSize - 1;
          // including this byte
          end = Math.min(end, datalength - 1);
          // if datalength-1 is selected, this is the last block
          if (typeof lazyArray.chunks[chunkNum] == "undefined") {
            lazyArray.chunks[chunkNum] = doXHR(start, end);
          }
          if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
          return lazyArray.chunks[chunkNum];
        });
        if (usesGzip || !datalength) {
          // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
          chunkSize = datalength = 1;
          // this will force getter(0)/doXHR do download the whole file
          datalength = this.getter(0).length;
          chunkSize = datalength;
          out("LazyFiles on gzip forces download of the whole file when length is accessed");
        }
        this._length = datalength;
        this._chunkSize = chunkSize;
        this.lengthKnown = true;
      }
      get length() {
        if (!this.lengthKnown) {
          this.cacheLength();
        }
        return this._length;
      }
      get chunkSize() {
        if (!this.lengthKnown) {
          this.cacheLength();
        }
        return this._chunkSize;
      }
    }
    if (typeof XMLHttpRequest != "undefined") {
      if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
      var lazyArray = new LazyUint8Array;
      var properties = {
        isDevice: false,
        contents: lazyArray
      };
    } else {
      var properties = {
        isDevice: false,
        url
      };
    }
    var node = FS.createFile(parent, name, properties, canRead, canWrite);
    // This is a total hack, but I want to get this lazy file code out of the
    // core of MEMFS. If we want to keep this lazy file concept I feel it should
    // be its own thin LAZYFS proxying calls to MEMFS.
    if (properties.contents) {
      node.contents = properties.contents;
    } else if (properties.url) {
      node.contents = null;
      node.url = properties.url;
    }
    // Add a function that defers querying the file size until it is asked the first time.
    Object.defineProperties(node, {
      usedBytes: {
        get: function() {
          return this.contents.length;
        }
      }
    });
    // override each stream op with one that tries to force load the lazy file first
    var stream_ops = {};
    var keys = Object.keys(node.stream_ops);
    keys.forEach(key => {
      var fn = node.stream_ops[key];
      stream_ops[key] = (...args) => {
        FS.forceLoadFile(node);
        return fn(...args);
      };
    });
    function writeChunks(stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= contents.length) return 0;
      var size = Math.min(contents.length - position, length);
      assert(size >= 0);
      if (contents.slice) {
        // normal array
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents[position + i];
        }
      } else {
        for (var i = 0; i < size; i++) {
          // LazyUint8Array from sync binary XHR
          buffer[offset + i] = contents.get(position + i);
        }
      }
      return size;
    }
    // use a custom read function
    stream_ops.read = (stream, buffer, offset, length, position) => {
      FS.forceLoadFile(node);
      return writeChunks(stream, buffer, offset, length, position);
    };
    // use a custom mmap function
    stream_ops.mmap = (stream, length, position, prot, flags) => {
      FS.forceLoadFile(node);
      var ptr = mmapAlloc(length);
      if (!ptr) {
        throw new FS.ErrnoError(48);
      }
      writeChunks(stream, (growMemViews(), HEAP8), ptr, length, position);
      return {
        ptr,
        allocated: true
      };
    };
    node.stream_ops = stream_ops;
    return node;
  },
  absolutePath() {
    abort("FS.absolutePath has been removed; use PATH_FS.resolve instead");
  },
  createFolder() {
    abort("FS.createFolder has been removed; use FS.mkdir instead");
  },
  createLink() {
    abort("FS.createLink has been removed; use FS.symlink instead");
  },
  joinPath() {
    abort("FS.joinPath has been removed; use PATH.join instead");
  },
  mmapAlloc() {
    abort("FS.mmapAlloc has been replaced by the top level function mmapAlloc");
  },
  standardizePath() {
    abort("FS.standardizePath has been removed; use PATH.normalize instead");
  }
};

var SYSCALLS = {
  DEFAULT_POLLMASK: 5,
  calculateAt(dirfd, path, allowEmpty) {
    if (PATH.isAbs(path)) {
      return path;
    }
    // relative path
    var dir;
    if (dirfd === -100) {
      dir = FS.cwd();
    } else {
      var dirstream = SYSCALLS.getStreamFromFD(dirfd);
      dir = dirstream.path;
    }
    if (path.length == 0) {
      if (!allowEmpty) {
        throw new FS.ErrnoError(44);
      }
      return dir;
    }
    return dir + "/" + path;
  },
  writeStat(buf, stat) {
    (growMemViews(), HEAP32)[((buf) >> 2)] = stat.dev;
    (growMemViews(), HEAP32)[(((buf) + (4)) >> 2)] = stat.mode;
    (growMemViews(), HEAPU32)[(((buf) + (8)) >> 2)] = stat.nlink;
    (growMemViews(), HEAP32)[(((buf) + (12)) >> 2)] = stat.uid;
    (growMemViews(), HEAP32)[(((buf) + (16)) >> 2)] = stat.gid;
    (growMemViews(), HEAP32)[(((buf) + (20)) >> 2)] = stat.rdev;
    (growMemViews(), HEAP64)[(((buf) + (24)) >> 3)] = BigInt(stat.size);
    (growMemViews(), HEAP32)[(((buf) + (32)) >> 2)] = 4096;
    (growMemViews(), HEAP32)[(((buf) + (36)) >> 2)] = stat.blocks;
    var atime = stat.atime.getTime();
    var mtime = stat.mtime.getTime();
    var ctime = stat.ctime.getTime();
    (growMemViews(), HEAP64)[(((buf) + (40)) >> 3)] = BigInt(Math.floor(atime / 1e3));
    (growMemViews(), HEAPU32)[(((buf) + (48)) >> 2)] = (atime % 1e3) * 1e3 * 1e3;
    (growMemViews(), HEAP64)[(((buf) + (56)) >> 3)] = BigInt(Math.floor(mtime / 1e3));
    (growMemViews(), HEAPU32)[(((buf) + (64)) >> 2)] = (mtime % 1e3) * 1e3 * 1e3;
    (growMemViews(), HEAP64)[(((buf) + (72)) >> 3)] = BigInt(Math.floor(ctime / 1e3));
    (growMemViews(), HEAPU32)[(((buf) + (80)) >> 2)] = (ctime % 1e3) * 1e3 * 1e3;
    (growMemViews(), HEAP64)[(((buf) + (88)) >> 3)] = BigInt(stat.ino);
    return 0;
  },
  writeStatFs(buf, stats) {
    (growMemViews(), HEAP32)[(((buf) + (4)) >> 2)] = stats.bsize;
    (growMemViews(), HEAP32)[(((buf) + (40)) >> 2)] = stats.bsize;
    (growMemViews(), HEAP32)[(((buf) + (8)) >> 2)] = stats.blocks;
    (growMemViews(), HEAP32)[(((buf) + (12)) >> 2)] = stats.bfree;
    (growMemViews(), HEAP32)[(((buf) + (16)) >> 2)] = stats.bavail;
    (growMemViews(), HEAP32)[(((buf) + (20)) >> 2)] = stats.files;
    (growMemViews(), HEAP32)[(((buf) + (24)) >> 2)] = stats.ffree;
    (growMemViews(), HEAP32)[(((buf) + (28)) >> 2)] = stats.fsid;
    (growMemViews(), HEAP32)[(((buf) + (44)) >> 2)] = stats.flags;
    // ST_NOSUID
    (growMemViews(), HEAP32)[(((buf) + (36)) >> 2)] = stats.namelen;
  },
  doMsync(addr, stream, len, flags, offset) {
    if (!FS.isFile(stream.node.mode)) {
      throw new FS.ErrnoError(43);
    }
    if (flags & 2) {
      // MAP_PRIVATE calls need not to be synced back to underlying fs
      return 0;
    }
    var buffer = (growMemViews(), HEAPU8).slice(addr, addr + len);
    FS.msync(stream, buffer, offset, len, flags);
  },
  getStreamFromFD(fd) {
    var stream = FS.getStreamChecked(fd);
    return stream;
  },
  varargs: undefined,
  getStr(ptr) {
    var ret = UTF8ToString(ptr);
    return ret;
  }
};

function ___syscall_fcntl64(fd, cmd, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (cmd) {
     case 0:
      {
        var arg = syscallGetVarargI();
        if (arg < 0) {
          return -28;
        }
        while (FS.streams[arg]) {
          arg++;
        }
        var newStream;
        newStream = FS.dupStream(stream, arg);
        return newStream.fd;
      }

     case 1:
     case 2:
      return 0;

     // FD_CLOEXEC makes no sense for a single process.
      case 3:
      return stream.flags;

     case 4:
      {
        var arg = syscallGetVarargI();
        stream.flags |= arg;
        return 0;
      }

     case 12:
      {
        var arg = syscallGetVarargP();
        var offset = 0;
        // We're always unlocked.
        (growMemViews(), HEAP16)[(((arg) + (offset)) >> 1)] = 2;
        return 0;
      }

     case 13:
     case 14:
      // Pretend that the locking is successful. These are process-level locks,
      // and Emscripten programs are a single process. If we supported linking a
      // filesystem between programs, we'd need to do more here.
      // See https://github.com/emscripten-core/emscripten/issues/23697
      return 0;
    }
    return -28;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_fdatasync(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_fstat64(fd, buf) {
  try {
    return SYSCALLS.writeStat(buf, FS.fstat(fd));
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_ioctl(fd, op, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (op) {
     case 21509:
      {
        if (!stream.tty) return -59;
        return 0;
      }

     case 21505:
      {
        if (!stream.tty) return -59;
        if (stream.tty.ops.ioctl_tcgets) {
          var termios = stream.tty.ops.ioctl_tcgets(stream);
          var argp = syscallGetVarargP();
          (growMemViews(), HEAP32)[((argp) >> 2)] = termios.c_iflag || 0;
          (growMemViews(), HEAP32)[(((argp) + (4)) >> 2)] = termios.c_oflag || 0;
          (growMemViews(), HEAP32)[(((argp) + (8)) >> 2)] = termios.c_cflag || 0;
          (growMemViews(), HEAP32)[(((argp) + (12)) >> 2)] = termios.c_lflag || 0;
          for (var i = 0; i < 32; i++) {
            (growMemViews(), HEAP8)[(argp + i) + (17)] = termios.c_cc[i] || 0;
          }
          return 0;
        }
        return 0;
      }

     case 21510:
     case 21511:
     case 21512:
      {
        if (!stream.tty) return -59;
        return 0;
      }

     case 21506:
     case 21507:
     case 21508:
      {
        if (!stream.tty) return -59;
        if (stream.tty.ops.ioctl_tcsets) {
          var argp = syscallGetVarargP();
          var c_iflag = (growMemViews(), HEAP32)[((argp) >> 2)];
          var c_oflag = (growMemViews(), HEAP32)[(((argp) + (4)) >> 2)];
          var c_cflag = (growMemViews(), HEAP32)[(((argp) + (8)) >> 2)];
          var c_lflag = (growMemViews(), HEAP32)[(((argp) + (12)) >> 2)];
          var c_cc = [];
          for (var i = 0; i < 32; i++) {
            c_cc.push((growMemViews(), HEAP8)[(argp + i) + (17)]);
          }
          return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
            c_iflag,
            c_oflag,
            c_cflag,
            c_lflag,
            c_cc
          });
        }
        return 0;
      }

     case 21519:
      {
        if (!stream.tty) return -59;
        var argp = syscallGetVarargP();
        (growMemViews(), HEAP32)[((argp) >> 2)] = 0;
        return 0;
      }

     case 21520:
      {
        if (!stream.tty) return -59;
        return -28;
      }

     case 21531:
      {
        var argp = syscallGetVarargP();
        return FS.ioctl(stream, op, argp);
      }

     case 21523:
      {
        // TODO: in theory we should write to the winsize struct that gets
        // passed in, but for now musl doesn't read anything on it
        if (!stream.tty) return -59;
        if (stream.tty.ops.ioctl_tiocgwinsz) {
          var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
          var argp = syscallGetVarargP();
          (growMemViews(), HEAP16)[((argp) >> 1)] = winsize[0];
          (growMemViews(), HEAP16)[(((argp) + (2)) >> 1)] = winsize[1];
        }
        return 0;
      }

     case 21524:
      {
        // TODO: technically, this ioctl call should change the window size.
        // but, since emscripten doesn't have any concept of a terminal window
        // yet, we'll just silently throw it away as we do TIOCGWINSZ
        if (!stream.tty) return -59;
        return 0;
      }

     case 21515:
      {
        if (!stream.tty) return -59;
        return 0;
      }

     default:
      return -28;
    }
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_lstat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path);
    return SYSCALLS.writeStat(buf, FS.lstat(path));
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_newfstatat(dirfd, path, buf, flags) {
  try {
    path = SYSCALLS.getStr(path);
    var nofollow = flags & 256;
    var allowEmpty = flags & 4096;
    flags = flags & (~6400);
    assert(!flags, `unknown flags in __syscall_newfstatat: ${flags}`);
    path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
    return SYSCALLS.writeStat(buf, nofollow ? FS.lstat(path) : FS.stat(path));
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_openat(dirfd, path, flags, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    var mode = varargs ? syscallGetVarargI() : 0;
    return FS.open(path, flags, mode).fd;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_stat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path);
    return SYSCALLS.writeStat(buf, FS.stat(path));
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

var __abort_js = () => abort("native code called abort()");

var INT53_MAX = 9007199254740992;

var INT53_MIN = -9007199254740992;

var bigintToI53Checked = num => (num < INT53_MIN || num > INT53_MAX) ? NaN : Number(num);

function __gmtime_js(time, tmPtr) {
  time = bigintToI53Checked(time);
  var date = new Date(time * 1e3);
  (growMemViews(), HEAP32)[((tmPtr) >> 2)] = date.getUTCSeconds();
  (growMemViews(), HEAP32)[(((tmPtr) + (4)) >> 2)] = date.getUTCMinutes();
  (growMemViews(), HEAP32)[(((tmPtr) + (8)) >> 2)] = date.getUTCHours();
  (growMemViews(), HEAP32)[(((tmPtr) + (12)) >> 2)] = date.getUTCDate();
  (growMemViews(), HEAP32)[(((tmPtr) + (16)) >> 2)] = date.getUTCMonth();
  (growMemViews(), HEAP32)[(((tmPtr) + (20)) >> 2)] = date.getUTCFullYear() - 1900;
  (growMemViews(), HEAP32)[(((tmPtr) + (24)) >> 2)] = date.getUTCDay();
  var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
  var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
  (growMemViews(), HEAP32)[(((tmPtr) + (28)) >> 2)] = yday;
}

var isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

var MONTH_DAYS_LEAP_CUMULATIVE = [ 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335 ];

var MONTH_DAYS_REGULAR_CUMULATIVE = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 ];

var ydayFromDate = date => {
  var leap = isLeapYear(date.getFullYear());
  var monthDaysCumulative = (leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE);
  var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
  // -1 since it's days since Jan 1
  return yday;
};

function __localtime_js(time, tmPtr) {
  time = bigintToI53Checked(time);
  var date = new Date(time * 1e3);
  (growMemViews(), HEAP32)[((tmPtr) >> 2)] = date.getSeconds();
  (growMemViews(), HEAP32)[(((tmPtr) + (4)) >> 2)] = date.getMinutes();
  (growMemViews(), HEAP32)[(((tmPtr) + (8)) >> 2)] = date.getHours();
  (growMemViews(), HEAP32)[(((tmPtr) + (12)) >> 2)] = date.getDate();
  (growMemViews(), HEAP32)[(((tmPtr) + (16)) >> 2)] = date.getMonth();
  (growMemViews(), HEAP32)[(((tmPtr) + (20)) >> 2)] = date.getFullYear() - 1900;
  (growMemViews(), HEAP32)[(((tmPtr) + (24)) >> 2)] = date.getDay();
  var yday = ydayFromDate(date) | 0;
  (growMemViews(), HEAP32)[(((tmPtr) + (28)) >> 2)] = yday;
  (growMemViews(), HEAP32)[(((tmPtr) + (36)) >> 2)] = -(date.getTimezoneOffset() * 60);
  // Attention: DST is in December in South, and some regions don't have DST at all.
  var start = new Date(date.getFullYear(), 0, 1);
  var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  var winterOffset = start.getTimezoneOffset();
  var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
  (growMemViews(), HEAP32)[(((tmPtr) + (32)) >> 2)] = dst;
}

var __mktime_js = function(tmPtr) {
  var ret = (() => {
    var date = new Date((growMemViews(), HEAP32)[(((tmPtr) + (20)) >> 2)] + 1900, (growMemViews(), 
    HEAP32)[(((tmPtr) + (16)) >> 2)], (growMemViews(), HEAP32)[(((tmPtr) + (12)) >> 2)], (growMemViews(), 
    HEAP32)[(((tmPtr) + (8)) >> 2)], (growMemViews(), HEAP32)[(((tmPtr) + (4)) >> 2)], (growMemViews(), 
    HEAP32)[((tmPtr) >> 2)], 0);
    // There's an ambiguous hour when the time goes back; the tm_isdst field is
    // used to disambiguate it.  Date() basically guesses, so we fix it up if it
    // guessed wrong, or fill in tm_isdst with the guess if it's -1.
    var dst = (growMemViews(), HEAP32)[(((tmPtr) + (32)) >> 2)];
    var guessedOffset = date.getTimezoneOffset();
    var start = new Date(date.getFullYear(), 0, 1);
    var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dstOffset = Math.min(winterOffset, summerOffset);
    // DST is in December in South
    if (dst < 0) {
      // Attention: some regions don't have DST at all.
      (growMemViews(), HEAP32)[(((tmPtr) + (32)) >> 2)] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
    } else if ((dst > 0) != (dstOffset == guessedOffset)) {
      var nonDstOffset = Math.max(winterOffset, summerOffset);
      var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
      // Don't try setMinutes(date.getMinutes() + ...) -- it's messed up.
      date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
    }
    (growMemViews(), HEAP32)[(((tmPtr) + (24)) >> 2)] = date.getDay();
    var yday = ydayFromDate(date) | 0;
    (growMemViews(), HEAP32)[(((tmPtr) + (28)) >> 2)] = yday;
    // To match expected behavior, update fields from date
    (growMemViews(), HEAP32)[((tmPtr) >> 2)] = date.getSeconds();
    (growMemViews(), HEAP32)[(((tmPtr) + (4)) >> 2)] = date.getMinutes();
    (growMemViews(), HEAP32)[(((tmPtr) + (8)) >> 2)] = date.getHours();
    (growMemViews(), HEAP32)[(((tmPtr) + (12)) >> 2)] = date.getDate();
    (growMemViews(), HEAP32)[(((tmPtr) + (16)) >> 2)] = date.getMonth();
    (growMemViews(), HEAP32)[(((tmPtr) + (20)) >> 2)] = date.getYear();
    var timeMs = date.getTime();
    if (isNaN(timeMs)) {
      return -1;
    }
    // Return time in microseconds
    return timeMs / 1e3;
  })();
  return BigInt(ret);
};

var __timegm_js = function(tmPtr) {
  var ret = (() => {
    var time = Date.UTC((growMemViews(), HEAP32)[(((tmPtr) + (20)) >> 2)] + 1900, (growMemViews(), 
    HEAP32)[(((tmPtr) + (16)) >> 2)], (growMemViews(), HEAP32)[(((tmPtr) + (12)) >> 2)], (growMemViews(), 
    HEAP32)[(((tmPtr) + (8)) >> 2)], (growMemViews(), HEAP32)[(((tmPtr) + (4)) >> 2)], (growMemViews(), 
    HEAP32)[((tmPtr) >> 2)], 0);
    var date = new Date(time);
    (growMemViews(), HEAP32)[(((tmPtr) + (24)) >> 2)] = date.getUTCDay();
    var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
    var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
    (growMemViews(), HEAP32)[(((tmPtr) + (28)) >> 2)] = yday;
    return date.getTime() / 1e3;
  })();
  return BigInt(ret);
};

var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
  assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  return stringToUTF8Array(str, (growMemViews(), HEAPU8), outPtr, maxBytesToWrite);
};

var __tzset_js = (timezone, daylight, std_name, dst_name) => {
  // TODO: Use (malleable) environment variables instead of system settings.
  var currentYear = (new Date).getFullYear();
  var winter = new Date(currentYear, 0, 1);
  var summer = new Date(currentYear, 6, 1);
  var winterOffset = winter.getTimezoneOffset();
  var summerOffset = summer.getTimezoneOffset();
  // Local standard timezone offset. Local standard time is not adjusted for
  // daylight savings.  This code uses the fact that getTimezoneOffset returns
  // a greater value during Standard Time versus Daylight Saving Time (DST).
  // Thus it determines the expected output during Standard Time, and it
  // compares whether the output of the given date the same (Standard) or less
  // (DST).
  var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
  // timezone is specified as seconds west of UTC ("The external variable
  // `timezone` shall be set to the difference, in seconds, between
  // Coordinated Universal Time (UTC) and local standard time."), the same
  // as returned by stdTimezoneOffset.
  // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
  (growMemViews(), HEAPU32)[((timezone) >> 2)] = stdTimezoneOffset * 60;
  (growMemViews(), HEAP32)[((daylight) >> 2)] = Number(winterOffset != summerOffset);
  var extractZone = timezoneOffset => {
    // Why inverse sign?
    // Read here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
    var sign = timezoneOffset >= 0 ? "-" : "+";
    var absOffset = Math.abs(timezoneOffset);
    var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
    var minutes = String(absOffset % 60).padStart(2, "0");
    return `UTC${sign}${hours}${minutes}`;
  };
  var winterName = extractZone(winterOffset);
  var summerName = extractZone(summerOffset);
  assert(winterName);
  assert(summerName);
  assert(lengthBytesUTF8(winterName) <= 16, `timezone name truncated to fit in TZNAME_MAX (${winterName})`);
  assert(lengthBytesUTF8(summerName) <= 16, `timezone name truncated to fit in TZNAME_MAX (${summerName})`);
  if (summerOffset < winterOffset) {
    // Northern hemisphere
    stringToUTF8(winterName, std_name, 17);
    stringToUTF8(summerName, dst_name, 17);
  } else {
    stringToUTF8(winterName, dst_name, 17);
    stringToUTF8(summerName, std_name, 17);
  }
};

var _emscripten_get_now;

// AudioWorkletGlobalScope does not have performance.now()
// (https://github.com/WebAudio/web-audio-api/issues/2527), so if building
// with
// Audio Worklets enabled, do a dynamic check for its presence.
if (typeof performance != "undefined" && performance.now) {
  _emscripten_get_now = () => performance.now();
} else {
  _emscripten_get_now = Date.now;
}

var _emscripten_date_now = () => Date.now();

var nowIsMonotonic = ((typeof performance == "object" && performance && typeof performance["now"] == "function"));

var checkWasiClock = clock_id => clock_id >= 0 && clock_id <= 3;

function _clock_time_get(clk_id, ignored_precision, ptime) {
  ignored_precision = bigintToI53Checked(ignored_precision);
  if (!checkWasiClock(clk_id)) {
    return 28;
  }
  var now;
  // all wasi clocks but realtime are monotonic
  if (clk_id === 0) {
    now = _emscripten_date_now();
  } else if (nowIsMonotonic) {
    now = _emscripten_get_now();
  } else {
    return 52;
  }
  // "now" is in ms, and wasi times are in ns.
  var nsec = Math.round(now * 1e3 * 1e3);
  (growMemViews(), HEAP64)[((ptime) >> 3)] = BigInt(nsec);
  return 0;
}

var readEmAsmArgsArray = [];

var readEmAsmArgs = (sigPtr, buf) => {
  // Nobody should have mutated _readEmAsmArgsArray underneath us to be something else than an array.
  assert(Array.isArray(readEmAsmArgsArray));
  // The input buffer is allocated on the stack, so it must be stack-aligned.
  assert(buf % 16 == 0);
  readEmAsmArgsArray.length = 0;
  var ch;
  // Most arguments are i32s, so shift the buffer pointer so it is a plain
  // index into HEAP32.
  while (ch = (growMemViews(), HEAPU8)[sigPtr++]) {
    var chr = String.fromCharCode(ch);
    var validChars = [ "d", "f", "i", "p" ];
    // In WASM_BIGINT mode we support passing i64 values as bigint.
    validChars.push("j");
    assert(validChars.includes(chr), `Invalid character ${ch}("${chr}") in readEmAsmArgs! Use only [${validChars}], and do not specify "v" for void return argument.`);
    // Floats are always passed as doubles, so all types except for 'i'
    // are 8 bytes and require alignment.
    var wide = (ch != 105);
    wide &= (ch != 112);
    buf += wide && (buf % 8) ? 4 : 0;
    readEmAsmArgsArray.push(// Special case for pointers under wasm64 or CAN_ADDRESS_2GB mode.
    ch == 112 ? (growMemViews(), HEAPU32)[((buf) >> 2)] : ch == 106 ? (growMemViews(), 
    HEAP64)[((buf) >> 3)] : ch == 105 ? (growMemViews(), HEAP32)[((buf) >> 2)] : (growMemViews(), 
    HEAPF64)[((buf) >> 3)]);
    buf += wide ? 8 : 4;
  }
  return readEmAsmArgsArray;
};

var runMainThreadEmAsm = (emAsmAddr, sigPtr, argbuf, sync) => {
  var args = readEmAsmArgs(sigPtr, argbuf);
  assert(ASM_CONSTS.hasOwnProperty(emAsmAddr), `No EM_ASM constant found at address ${emAsmAddr}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
  return ASM_CONSTS[emAsmAddr](...args);
};

/** @suppress {duplicate } */ var _emscripten_asm_const_int_sync_on_main_thread = (emAsmAddr, sigPtr, argbuf) => runMainThreadEmAsm(emAsmAddr, sigPtr, argbuf, 1);

var _emscripten_asm_const_double_sync_on_main_thread = _emscripten_asm_const_int_sync_on_main_thread;

var runEmAsmFunction = (code, sigPtr, argbuf) => {
  var args = readEmAsmArgs(sigPtr, argbuf);
  assert(ASM_CONSTS.hasOwnProperty(code), `No EM_ASM constant found at address ${code}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
  return ASM_CONSTS[code](...args);
};

var _emscripten_asm_const_int = (code, sigPtr, argbuf) => runEmAsmFunction(code, sigPtr, argbuf);

var _emscripten_asm_const_ptr_sync_on_main_thread = (emAsmAddr, sigPtr, argbuf) => runMainThreadEmAsm(emAsmAddr, sigPtr, argbuf, 1);

var emscriptenGetContextQuantumSize = contextHandle => 128;

var _emscripten_audio_context_quantum_size = contextHandle => {
  assert(EmAudio[contextHandle], `Called emscripten_audio_context_quantum_size() with an invalid Web Audio Context handle ${contextHandle}`);
  assert(EmAudio[contextHandle] instanceof (window.AudioContext || window.webkitAudioContext), `Called emscripten_audio_context_quantum_size() on handle ${contextHandle} that is not an AudioContext, but of type ${EmAudio[contextHandle]}`);
  return emscriptenGetContextQuantumSize(contextHandle);
};

var _emscripten_set_main_loop_timing = (mode, value) => {
  MainLoop.timingMode = mode;
  MainLoop.timingValue = value;
  if (!MainLoop.func) {
    err("emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.");
    return 1;
  }
  if (!MainLoop.running) {
    MainLoop.running = true;
  }
  if (mode == 0) {
    MainLoop.scheduler = function MainLoop_scheduler_setTimeout() {
      var timeUntilNextTick = Math.max(0, MainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
      setTimeout(MainLoop.runner, timeUntilNextTick);
    };
    MainLoop.method = "timeout";
  } else if (mode == 1) {
    MainLoop.scheduler = function MainLoop_scheduler_rAF() {
      MainLoop.requestAnimationFrame(MainLoop.runner);
    };
    MainLoop.method = "rAF";
  } else if (mode == 2) {
    if (typeof MainLoop.setImmediate == "undefined") {
      if (typeof setImmediate == "undefined") {
        // Emulate setImmediate. (note: not a complete polyfill, we don't emulate clearImmediate() to keep code size to minimum, since not needed)
        var setImmediates = [];
        var emscriptenMainLoopMessageId = "setimmediate";
        /** @param {Event} event */ var MainLoop_setImmediate_messageHandler = event => {
          // When called in current thread or Worker, the main loop ID is structured slightly different to accommodate for --proxy-to-worker runtime listening to Worker events,
          // so check for both cases.
          if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
            event.stopPropagation();
            setImmediates.shift()();
          }
        };
        addEventListener("message", MainLoop_setImmediate_messageHandler, true);
        MainLoop.setImmediate = /** @type{function(function(): ?, ...?): number} */ (func => {
          setImmediates.push(func);
          if (ENVIRONMENT_IS_WORKER) {
            Module["setImmediates"] ??= [];
            Module["setImmediates"].push(func);
            postMessage({
              target: emscriptenMainLoopMessageId
            });
          } else postMessage(emscriptenMainLoopMessageId, "*");
        });
      } else {
        MainLoop.setImmediate = setImmediate;
      }
    }
    MainLoop.scheduler = function MainLoop_scheduler_setImmediate() {
      MainLoop.setImmediate(MainLoop.runner);
    };
    MainLoop.method = "immediate";
  }
  return 0;
};

/**
     * @param {number=} arg
     * @param {boolean=} noSetTiming
     */ var setMainLoop = (iterFunc, fps, simulateInfiniteLoop, arg, noSetTiming) => {
  assert(!MainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
  MainLoop.func = iterFunc;
  MainLoop.arg = arg;
  var thisMainLoopId = MainLoop.currentlyRunningMainloop;
  function checkIsRunning() {
    if (thisMainLoopId < MainLoop.currentlyRunningMainloop) {
      maybeExit();
      return false;
    }
    return true;
  }
  // We create the loop runner here but it is not actually running until
  // _emscripten_set_main_loop_timing is called (which might happen a
  // later time).  This member signifies that the current runner has not
  // yet been started so that we can call runtimeKeepalivePush when it
  // gets it timing set for the first time.
  MainLoop.running = false;
  MainLoop.runner = function MainLoop_runner() {
    if (ABORT) return;
    if (MainLoop.queue.length > 0) {
      var start = Date.now();
      var blocker = MainLoop.queue.shift();
      blocker.func(blocker.arg);
      if (MainLoop.remainingBlockers) {
        var remaining = MainLoop.remainingBlockers;
        var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
        if (blocker.counted) {
          MainLoop.remainingBlockers = next;
        } else {
          // not counted, but move the progress along a tiny bit
          next = next + .5;
          // do not steal all the next one's progress
          MainLoop.remainingBlockers = (8 * remaining + next) / 9;
        }
      }
      MainLoop.updateStatus();
      // catches pause/resume main loop from blocker execution
      if (!checkIsRunning()) return;
      setTimeout(MainLoop.runner, 0);
      return;
    }
    // catch pauses from non-main loop sources
    if (!checkIsRunning()) return;
    // Implement very basic swap interval control
    MainLoop.currentFrameNumber = MainLoop.currentFrameNumber + 1 | 0;
    if (MainLoop.timingMode == 1 && MainLoop.timingValue > 1 && MainLoop.currentFrameNumber % MainLoop.timingValue != 0) {
      // Not the scheduled time to render this frame - skip.
      MainLoop.scheduler();
      return;
    } else if (MainLoop.timingMode == 0) {
      MainLoop.tickStartTime = _emscripten_get_now();
    }
    if (MainLoop.method === "timeout" && Module["ctx"]) {
      warnOnce("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
      MainLoop.method = "";
    }
    MainLoop.runIter(iterFunc);
    // catch pauses from the main loop itself
    if (!checkIsRunning()) return;
    MainLoop.scheduler();
  };
  if (!noSetTiming) {
    if (fps > 0) {
      _emscripten_set_main_loop_timing(0, 1e3 / fps);
    } else {
      // Do rAF by rendering each frame (no decimating)
      _emscripten_set_main_loop_timing(1, 1);
    }
    MainLoop.scheduler();
  }
  if (simulateInfiniteLoop) {
    throw "unwind";
  }
};

var MainLoop = {
  running: false,
  scheduler: null,
  method: "",
  currentlyRunningMainloop: 0,
  func: null,
  arg: 0,
  timingMode: 0,
  timingValue: 0,
  currentFrameNumber: 0,
  queue: [],
  preMainLoop: [],
  postMainLoop: [],
  pause() {
    MainLoop.scheduler = null;
    // Incrementing this signals the previous main loop that it's now become old, and it must return.
    MainLoop.currentlyRunningMainloop++;
  },
  resume() {
    MainLoop.currentlyRunningMainloop++;
    var timingMode = MainLoop.timingMode;
    var timingValue = MainLoop.timingValue;
    var func = MainLoop.func;
    MainLoop.func = null;
    // do not set timing and call scheduler, we will do it on the next lines
    setMainLoop(func, 0, false, MainLoop.arg, true);
    _emscripten_set_main_loop_timing(timingMode, timingValue);
    MainLoop.scheduler();
  },
  updateStatus() {
    if (Module["setStatus"]) {
      var message = Module["statusMessage"] || "Please wait...";
      var remaining = MainLoop.remainingBlockers ?? 0;
      var expected = MainLoop.expectedBlockers ?? 0;
      if (remaining) {
        if (remaining < expected) {
          Module["setStatus"](`{message} ({expected - remaining}/{expected})`);
        } else {
          Module["setStatus"](message);
        }
      } else {
        Module["setStatus"]("");
      }
    }
  },
  init() {
    Module["preMainLoop"] && MainLoop.preMainLoop.push(Module["preMainLoop"]);
    Module["postMainLoop"] && MainLoop.postMainLoop.push(Module["postMainLoop"]);
  },
  runIter(func) {
    if (ABORT) return;
    for (var pre of MainLoop.preMainLoop) {
      if (pre() === false) {
        return;
      }
    }
    callUserCallback(func);
    for (var post of MainLoop.postMainLoop) {
      post();
    }
    checkStackCookie();
  },
  nextRAF: 0,
  fakeRequestAnimationFrame(func) {
    // try to keep 60fps between calls to here
    var now = Date.now();
    if (MainLoop.nextRAF === 0) {
      MainLoop.nextRAF = now + 1e3 / 60;
    } else {
      while (now + 2 >= MainLoop.nextRAF) {
        // fudge a little, to avoid timer jitter causing us to do lots of delay:0
        MainLoop.nextRAF += 1e3 / 60;
      }
    }
    var delay = Math.max(MainLoop.nextRAF - now, 0);
    setTimeout(func, delay);
  },
  requestAnimationFrame(func) {
    if (typeof requestAnimationFrame == "function") {
      requestAnimationFrame(func);
      return;
    }
    var RAF = MainLoop.fakeRequestAnimationFrame;
    RAF(func);
  }
};

var _emscripten_cancel_main_loop = () => {
  MainLoop.pause();
  MainLoop.func = null;
};

var EmAudio = {};

var EmAudioCounter = 0;

var emscriptenRegisterAudioObject = object => {
  assert(object, "Called emscriptenRegisterAudioObject() with a null object handle!");
  EmAudio[++EmAudioCounter] = object;
  return EmAudioCounter;
};

var emscriptenGetAudioObject = objectHandle => EmAudio[objectHandle];

var _emscripten_create_audio_context = options => {
  let ctx = window.AudioContext || window.webkitAudioContext;
  if (!ctx) console.error("emscripten_create_audio_context failed! Web Audio is not supported.");
  options >>= 2;
  let opts = options ? {
    latencyHint: (growMemViews(), HEAPU32)[options] ? UTF8ToString((growMemViews(), 
    HEAPU32)[options]) : void 0,
    sampleRate: (growMemViews(), HEAP32)[options + 1] || void 0
  } : void 0;
  return ctx && emscriptenRegisterAudioObject(new ctx(opts));
};

var _emscripten_create_wasm_audio_worklet_node = (contextHandle, name, options, callback, userData) => {
  assert(contextHandle, `Called emscripten_create_wasm_audio_worklet_node() with a null Web Audio Context handle!`);
  assert(EmAudio[contextHandle], `Called emscripten_create_wasm_audio_worklet_node() with a nonexisting/already freed Web Audio Context handle ${contextHandle}!`);
  assert(EmAudio[contextHandle] instanceof (window.AudioContext || window.webkitAudioContext), `Called emscripten_create_wasm_audio_worklet_node() on a context handle ${contextHandle} that is not an AudioContext, but of type ${typeof EmAudio[contextHandle]}`);
  options >>= 2;
  function readChannelCountArray(heapIndex, numOutputs) {
    let channelCounts = [];
    while (numOutputs--) channelCounts.push((growMemViews(), HEAPU32)[heapIndex++]);
    return channelCounts;
  }
  let opts = options ? {
    numberOfInputs: (growMemViews(), HEAP32)[options],
    numberOfOutputs: (growMemViews(), HEAP32)[options + 1],
    outputChannelCount: (growMemViews(), HEAPU32)[options + 2] ? readChannelCountArray((growMemViews(), 
    HEAPU32)[options + 2] >> 2, (growMemViews(), HEAP32)[options + 1]) : void 0,
    processorOptions: {
      callback,
      userData,
      samplesPerChannel: emscriptenGetContextQuantumSize(contextHandle)
    }
  } : void 0;
  return emscriptenRegisterAudioObject(new AudioWorkletNode(EmAudio[contextHandle], UTF8ToString(name), opts));
};

var _emscripten_create_wasm_audio_worklet_processor_async = (contextHandle, options, callback, userData) => {
  assert(contextHandle, `Called emscripten_create_wasm_audio_worklet_processor_async() with a null Web Audio Context handle!`);
  assert(EmAudio[contextHandle], `Called emscripten_create_wasm_audio_worklet_processor_async() with a nonexisting/already freed Web Audio Context handle ${contextHandle}!`);
  assert(EmAudio[contextHandle] instanceof (window.AudioContext || window.webkitAudioContext), `Called emscripten_create_wasm_audio_worklet_processor_async() on a context handle ${contextHandle} that is not an AudioContext, but of type ${typeof EmAudio[contextHandle]}`);
  options >>= 2;
  let audioParams = [], numAudioParams = (growMemViews(), HEAPU32)[options + 1], audioParamDescriptors = (growMemViews(), 
  HEAPU32)[options + 2] >> 2, i = 0;
  while (numAudioParams--) {
    audioParams.push({
      name: i++,
      defaultValue: (growMemViews(), HEAPF32)[audioParamDescriptors++],
      minValue: (growMemViews(), HEAPF32)[audioParamDescriptors++],
      maxValue: (growMemViews(), HEAPF32)[audioParamDescriptors++],
      automationRate: [ "a", "k" ][(growMemViews(), HEAPU32)[audioParamDescriptors++]] + "-rate"
    });
  }
  EmAudio[contextHandle].audioWorklet.bootstrapMessage.port.postMessage({
    // Deliberately mangled and short names used here ('_wpn', the 'Worklet
    // Processor Name' used as a 'key' to verify the message type so as to
    // not get accidentally mixed with user submitted messages, the remainder
    // for space saving reasons, abbreviated from their variable names).
    "_wpn": UTF8ToString((growMemViews(), HEAPU32)[options]),
    audioParams,
    contextHandle,
    callback,
    userData
  });
};

var _emscripten_destroy_audio_context = contextHandle => {
  assert(EmAudio[contextHandle], `Called emscripten_destroy_audio_context() on an already freed context handle ${contextHandle}`);
  assert(EmAudio[contextHandle] instanceof (window.AudioContext || window.webkitAudioContext), `Called emscripten_destroy_audio_context() on a context handle ${contextHandle} that is not an AudioContext, but of type ${typeof EmAudio[contextHandle]}`);
  EmAudio[contextHandle].suspend();
  delete EmAudio[contextHandle];
};

var _emscripten_destroy_web_audio_node = objectHandle => {
  assert(EmAudio[objectHandle], `Called emscripten_destroy_web_audio_node() on a nonexisting/already freed object handle ${objectHandle}`);
  assert(EmAudio[objectHandle].disconnect, `Called emscripten_destroy_web_audio_node() on a handle ${objectHandle} that is not an Web Audio Node, but of type ${typeof EmAudio[objectHandle]}`);
  // Explicitly disconnect the node from Web Audio graph before letting it GC,
  // to work around browser bugs such as https://bugs.webkit.org/show_bug.cgi?id=222098#c23
  EmAudio[objectHandle].disconnect();
  delete EmAudio[objectHandle];
};

var _emscripten_err = str => err(UTF8ToString(str));

var onExits = [];

var addOnExit = cb => onExits.push(cb);

var JSEvents = {
  memcpy(target, src, size) {
    (growMemViews(), HEAP8).set((growMemViews(), HEAP8).subarray(src, src + size), target);
  },
  removeAllEventListeners() {
    while (JSEvents.eventHandlers.length) {
      JSEvents._removeHandler(JSEvents.eventHandlers.length - 1);
    }
    JSEvents.deferredCalls = [];
  },
  inEventHandler: 0,
  deferredCalls: [],
  deferCall(targetFunction, precedence, argsList) {
    function arraysHaveEqualContent(arrA, arrB) {
      if (arrA.length != arrB.length) return false;
      for (var i in arrA) {
        if (arrA[i] != arrB[i]) return false;
      }
      return true;
    }
    // Test if the given call was already queued, and if so, don't add it again.
    for (var call of JSEvents.deferredCalls) {
      if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
        return;
      }
    }
    JSEvents.deferredCalls.push({
      targetFunction,
      precedence,
      argsList
    });
    JSEvents.deferredCalls.sort((x, y) => x.precedence < y.precedence);
  },
  removeDeferredCalls(targetFunction) {
    JSEvents.deferredCalls = JSEvents.deferredCalls.filter(call => call.targetFunction != targetFunction);
  },
  canPerformEventHandlerRequests() {
    if (navigator.userActivation) {
      // Verify against transient activation status from UserActivation API
      // whether it is possible to perform a request here without needing to defer. See
      // https://developer.mozilla.org/en-US/docs/Web/Security/User_activation#transient_activation
      // and https://caniuse.com/mdn-api_useractivation
      // At the time of writing, Firefox does not support this API: https://bugzilla.mozilla.org/show_bug.cgi?id=1791079
      return navigator.userActivation.isActive;
    }
    return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
  },
  runDeferredCalls() {
    if (!JSEvents.canPerformEventHandlerRequests()) {
      return;
    }
    var deferredCalls = JSEvents.deferredCalls;
    JSEvents.deferredCalls = [];
    for (var call of deferredCalls) {
      call.targetFunction(...call.argsList);
    }
  },
  eventHandlers: [],
  removeAllHandlersOnTarget: (target, eventTypeString) => {
    for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
      if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
        JSEvents._removeHandler(i--);
      }
    }
  },
  _removeHandler(i) {
    var h = JSEvents.eventHandlers[i];
    h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
    JSEvents.eventHandlers.splice(i, 1);
  },
  registerOrRemoveHandler(eventHandler) {
    if (!eventHandler.target) {
      err("registerOrRemoveHandler: the target element for event handler registration does not exist, when processing the following event handler registration:");
      console.dir(eventHandler);
      return -4;
    }
    if (eventHandler.callbackfunc) {
      eventHandler.eventListenerFunc = function(event) {
        // Increment nesting count for the event handler.
        ++JSEvents.inEventHandler;
        JSEvents.currentEventHandler = eventHandler;
        // Process any old deferred calls the user has placed.
        JSEvents.runDeferredCalls();
        // Process the actual event, calls back to user C code handler.
        eventHandler.handlerFunc(event);
        // Process any new deferred calls that were placed right now from this event handler.
        JSEvents.runDeferredCalls();
        // Out of event handler - restore nesting count.
        --JSEvents.inEventHandler;
      };
      eventHandler.target.addEventListener(eventHandler.eventTypeString, eventHandler.eventListenerFunc, eventHandler.useCapture);
      JSEvents.eventHandlers.push(eventHandler);
    } else {
      for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
        if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
          JSEvents._removeHandler(i--);
        }
      }
    }
    return 0;
  },
  getNodeNameForTarget(target) {
    if (!target) return "";
    if (target == window) return "#window";
    if (target == screen) return "#screen";
    return target?.nodeName || "";
  },
  fullscreenEnabled() {
    return document.fullscreenEnabled || document.webkitFullscreenEnabled;
  }
};

/** @type {Object} */ var specialHTMLTargets = [ 0, typeof document != "undefined" ? document : 0, typeof window != "undefined" ? window : 0 ];

var maybeCStringToJsString = cString => cString > 2 ? UTF8ToString(cString) : cString;

/** @suppress {duplicate } */ var findEventTarget = target => {
  target = maybeCStringToJsString(target);
  var domElement = specialHTMLTargets[target] || (typeof document != "undefined" ? document.querySelector(target) : null);
  return domElement;
};

var findCanvasEventTarget = findEventTarget;

var _emscripten_get_canvas_element_size = (target, width, height) => {
  var canvas = findCanvasEventTarget(target);
  if (!canvas) return -4;
  (growMemViews(), HEAP32)[((width) >> 2)] = canvas.width;
  (growMemViews(), HEAP32)[((height) >> 2)] = canvas.height;
};

var stackAlloc = sz => __emscripten_stack_alloc(sz);

var stringToUTF8OnStack = str => {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8(str, ret, size);
  return ret;
};

var getCanvasElementSize = target => {
  var sp = stackSave();
  var w = stackAlloc(8);
  var h = w + 4;
  var targetInt = stringToUTF8OnStack(target.id);
  var ret = _emscripten_get_canvas_element_size(targetInt, w, h);
  var size = [ (growMemViews(), HEAP32)[((w) >> 2)], (growMemViews(), HEAP32)[((h) >> 2)] ];
  stackRestore(sp);
  return size;
};

var _emscripten_set_canvas_element_size = (target, width, height) => {
  var canvas = findCanvasEventTarget(target);
  if (!canvas) return -4;
  canvas.width = width;
  canvas.height = height;
  return 0;
};

var setCanvasElementSize = (target, width, height) => {
  if (!target.controlTransferredOffscreen) {
    target.width = width;
    target.height = height;
  } else {
    // This function is being called from high-level JavaScript code instead of asm.js/Wasm,
    // and it needs to synchronously proxy over to another thread, so marshal the string onto the heap to do the call.
    var sp = stackSave();
    var targetInt = stringToUTF8OnStack(target.id);
    _emscripten_set_canvas_element_size(targetInt, width, height);
    stackRestore(sp);
  }
};

var currentFullscreenStrategy = {};

var registerRestoreOldStyle = canvas => {
  var canvasSize = getCanvasElementSize(canvas);
  var oldWidth = canvasSize[0];
  var oldHeight = canvasSize[1];
  var oldCssWidth = canvas.style.width;
  var oldCssHeight = canvas.style.height;
  var oldBackgroundColor = canvas.style.backgroundColor;
  // Chrome reads color from here.
  var oldDocumentBackgroundColor = document.body.style.backgroundColor;
  // IE11 reads color from here.
  // Firefox always has black background color.
  var oldPaddingLeft = canvas.style.paddingLeft;
  // Chrome, FF, Safari
  var oldPaddingRight = canvas.style.paddingRight;
  var oldPaddingTop = canvas.style.paddingTop;
  var oldPaddingBottom = canvas.style.paddingBottom;
  var oldMarginLeft = canvas.style.marginLeft;
  // IE11
  var oldMarginRight = canvas.style.marginRight;
  var oldMarginTop = canvas.style.marginTop;
  var oldMarginBottom = canvas.style.marginBottom;
  var oldDocumentBodyMargin = document.body.style.margin;
  var oldDocumentOverflow = document.documentElement.style.overflow;
  // Chrome, Firefox
  var oldDocumentScroll = document.body.scroll;
  // IE
  var oldImageRendering = canvas.style.imageRendering;
  function restoreOldStyle() {
    var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fullscreenElement) {
      document.removeEventListener("fullscreenchange", restoreOldStyle);
      // Unprefixed Fullscreen API shipped in Chromium 71 (https://bugs.chromium.org/p/chromium/issues/detail?id=383813)
      // As of Safari 13.0.3 on macOS Catalina 10.15.1 still ships with prefixed webkitfullscreenchange. TODO: revisit this check once Safari ships unprefixed version.
      document.removeEventListener("webkitfullscreenchange", restoreOldStyle);
      setCanvasElementSize(canvas, oldWidth, oldHeight);
      canvas.style.width = oldCssWidth;
      canvas.style.height = oldCssHeight;
      canvas.style.backgroundColor = oldBackgroundColor;
      // Chrome
      // IE11 hack: assigning 'undefined' or an empty string to document.body.style.backgroundColor has no effect, so first assign back the default color
      // before setting the undefined value. Setting undefined value is also important, or otherwise we would later treat that as something that the user
      // had explicitly set so subsequent fullscreen transitions would not set background color properly.
      if (!oldDocumentBackgroundColor) document.body.style.backgroundColor = "white";
      document.body.style.backgroundColor = oldDocumentBackgroundColor;
      // IE11
      canvas.style.paddingLeft = oldPaddingLeft;
      // Chrome, FF, Safari
      canvas.style.paddingRight = oldPaddingRight;
      canvas.style.paddingTop = oldPaddingTop;
      canvas.style.paddingBottom = oldPaddingBottom;
      canvas.style.marginLeft = oldMarginLeft;
      // IE11
      canvas.style.marginRight = oldMarginRight;
      canvas.style.marginTop = oldMarginTop;
      canvas.style.marginBottom = oldMarginBottom;
      document.body.style.margin = oldDocumentBodyMargin;
      document.documentElement.style.overflow = oldDocumentOverflow;
      // Chrome, Firefox
      document.body.scroll = oldDocumentScroll;
      // IE
      canvas.style.imageRendering = oldImageRendering;
      if (canvas.GLctxObject) canvas.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight);
      if (currentFullscreenStrategy.canvasResizedCallback) {
        ((a1, a2, a3) => dynCall_iiii(currentFullscreenStrategy.canvasResizedCallback, a1, a2, a3))(37, 0, currentFullscreenStrategy.canvasResizedCallbackUserData);
      }
    }
  }
  document.addEventListener("fullscreenchange", restoreOldStyle);
  // Unprefixed Fullscreen API shipped in Chromium 71 (https://bugs.chromium.org/p/chromium/issues/detail?id=383813)
  // As of Safari 13.0.3 on macOS Catalina 10.15.1 still ships with prefixed webkitfullscreenchange. TODO: revisit this check once Safari ships unprefixed version.
  document.addEventListener("webkitfullscreenchange", restoreOldStyle);
  return restoreOldStyle;
};

var setLetterbox = (element, topBottom, leftRight) => {
  // Cannot use margin to specify letterboxes in FF or Chrome, since those ignore margins in fullscreen mode.
  element.style.paddingLeft = element.style.paddingRight = leftRight + "px";
  element.style.paddingTop = element.style.paddingBottom = topBottom + "px";
};

var getBoundingClientRect = e => specialHTMLTargets.indexOf(e) < 0 ? e.getBoundingClientRect() : {
  "left": 0,
  "top": 0
};

var JSEvents_resizeCanvasForFullscreen = (target, strategy) => {
  var restoreOldStyle = registerRestoreOldStyle(target);
  var cssWidth = strategy.softFullscreen ? innerWidth : screen.width;
  var cssHeight = strategy.softFullscreen ? innerHeight : screen.height;
  var rect = getBoundingClientRect(target);
  var windowedCssWidth = rect.width;
  var windowedCssHeight = rect.height;
  var canvasSize = getCanvasElementSize(target);
  var windowedRttWidth = canvasSize[0];
  var windowedRttHeight = canvasSize[1];
  if (strategy.scaleMode == 3) {
    setLetterbox(target, (cssHeight - windowedCssHeight) / 2, (cssWidth - windowedCssWidth) / 2);
    cssWidth = windowedCssWidth;
    cssHeight = windowedCssHeight;
  } else if (strategy.scaleMode == 2) {
    if (cssWidth * windowedRttHeight < windowedRttWidth * cssHeight) {
      var desiredCssHeight = windowedRttHeight * cssWidth / windowedRttWidth;
      setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
      cssHeight = desiredCssHeight;
    } else {
      var desiredCssWidth = windowedRttWidth * cssHeight / windowedRttHeight;
      setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
      cssWidth = desiredCssWidth;
    }
  }
  // If we are adding padding, must choose a background color or otherwise Chrome will give the
  // padding a default white color. Do it only if user has not customized their own background color.
  target.style.backgroundColor ||= "black";
  // IE11 does the same, but requires the color to be set in the document body.
  document.body.style.backgroundColor ||= "black";
  // IE11
  // Firefox always shows black letterboxes independent of style color.
  target.style.width = cssWidth + "px";
  target.style.height = cssHeight + "px";
  if (strategy.filteringMode == 1) {
    target.style.imageRendering = "optimizeSpeed";
    target.style.imageRendering = "-moz-crisp-edges";
    target.style.imageRendering = "-o-crisp-edges";
    target.style.imageRendering = "-webkit-optimize-contrast";
    target.style.imageRendering = "optimize-contrast";
    target.style.imageRendering = "crisp-edges";
    target.style.imageRendering = "pixelated";
  }
  var dpiScale = (strategy.canvasResolutionScaleMode == 2) ? devicePixelRatio : 1;
  if (strategy.canvasResolutionScaleMode != 0) {
    var newWidth = (cssWidth * dpiScale) | 0;
    var newHeight = (cssHeight * dpiScale) | 0;
    setCanvasElementSize(target, newWidth, newHeight);
    if (target.GLctxObject) target.GLctxObject.GLctx.viewport(0, 0, newWidth, newHeight);
  }
  return restoreOldStyle;
};

var JSEvents_requestFullscreen = (target, strategy) => {
  // EMSCRIPTEN_FULLSCREEN_SCALE_DEFAULT + EMSCRIPTEN_FULLSCREEN_CANVAS_SCALE_NONE is a mode where no extra logic is performed to the DOM elements.
  if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
    JSEvents_resizeCanvasForFullscreen(target, strategy);
  }
  if (target.requestFullscreen) {
    target.requestFullscreen();
  } else if (target.webkitRequestFullscreen) {
    target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else {
    return JSEvents.fullscreenEnabled() ? -3 : -1;
  }
  currentFullscreenStrategy = strategy;
  if (strategy.canvasResizedCallback) {
    ((a1, a2, a3) => dynCall_iiii(strategy.canvasResizedCallback, a1, a2, a3))(37, 0, strategy.canvasResizedCallbackUserData);
  }
  return 0;
};

function _emscripten_exit_fullscreen() {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_exit_fullscreen' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  if (!JSEvents.fullscreenEnabled()) return -1;
  // Make sure no queued up calls will fire after this.
  JSEvents.removeDeferredCalls(JSEvents_requestFullscreen);
  var d = specialHTMLTargets[1];
  if (d.exitFullscreen) {
    d.fullscreenElement && d.exitFullscreen();
  } else if (d.webkitExitFullscreen) {
    d.webkitFullscreenElement && d.webkitExitFullscreen();
  } else {
    return -1;
  }
  return 0;
}

var requestPointerLock = target => {
  if (target.requestPointerLock) {
    target.requestPointerLock();
  } else {
    // document.body is known to accept pointer lock, so use that to differentiate if the user passed a bad element,
    // or if the whole browser just doesn't support the feature.
    if (document.body.requestPointerLock) {
      return -3;
    }
    return -1;
  }
  return 0;
};

function _emscripten_exit_pointerlock() {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_exit_pointerlock' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  // Make sure no queued up calls will fire after this.
  JSEvents.removeDeferredCalls(requestPointerLock);
  if (!document.exitPointerLock) return -1;
  document.exitPointerLock();
  return 0;
}

var __emscripten_runtime_keepalive_clear = () => {
  noExitRuntime = false;
  runtimeKeepaliveCounter = 0;
};

function _emscripten_force_exit(status) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_force_exit' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  warnOnce("emscripten_force_exit cannot actually shut down the runtime, as the build does not have EXIT_RUNTIME set");
  __emscripten_runtime_keepalive_clear();
  _exit(status);
}

function _emscripten_get_device_pixel_ratio() {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_get_device_pixel_ratio' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  return (typeof devicePixelRatio == "number" && devicePixelRatio) || 1;
}

function _emscripten_get_element_css_size(target, width, height) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_get_element_css_size' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  target = findEventTarget(target);
  if (!target) return -4;
  var rect = getBoundingClientRect(target);
  (growMemViews(), HEAPF64)[((width) >> 3)] = rect.width;
  (growMemViews(), HEAPF64)[((height) >> 3)] = rect.height;
  return 0;
}

var fillGamepadEventData = (eventStruct, e) => {
  (growMemViews(), HEAPF64)[((eventStruct) >> 3)] = e.timestamp;
  for (var i = 0; i < e.axes.length; ++i) {
    (growMemViews(), HEAPF64)[(((eventStruct + i * 8) + (16)) >> 3)] = e.axes[i];
  }
  for (var i = 0; i < e.buttons.length; ++i) {
    if (typeof e.buttons[i] == "object") {
      (growMemViews(), HEAPF64)[(((eventStruct + i * 8) + (528)) >> 3)] = e.buttons[i].value;
    } else {
      (growMemViews(), HEAPF64)[(((eventStruct + i * 8) + (528)) >> 3)] = e.buttons[i];
    }
  }
  for (var i = 0; i < e.buttons.length; ++i) {
    if (typeof e.buttons[i] == "object") {
      (growMemViews(), HEAP8)[(eventStruct + i) + (1040)] = e.buttons[i].pressed;
    } else {
      // Assigning a boolean to HEAP32, that's ok, but Closure would like to warn about it:
      /** @suppress {checkTypes} */ (growMemViews(), HEAP8)[(eventStruct + i) + (1040)] = e.buttons[i] == 1;
    }
  }
  (growMemViews(), HEAP8)[(eventStruct) + (1104)] = e.connected;
  (growMemViews(), HEAP32)[(((eventStruct) + (1108)) >> 2)] = e.index;
  (growMemViews(), HEAP32)[(((eventStruct) + (8)) >> 2)] = e.axes.length;
  (growMemViews(), HEAP32)[(((eventStruct) + (12)) >> 2)] = e.buttons.length;
  stringToUTF8(e.id, eventStruct + 1112, 64);
  stringToUTF8(e.mapping, eventStruct + 1176, 64);
};

function _emscripten_get_gamepad_status(index, gamepadState) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_get_gamepad_status' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  if (!JSEvents.lastGamepadState) throw "emscripten_get_gamepad_status() can only be called after having first called emscripten_sample_gamepad_data() and that function has returned EMSCRIPTEN_RESULT_SUCCESS!";
  // INVALID_PARAM is returned on a Gamepad index that never was there.
  if (index < 0 || index >= JSEvents.lastGamepadState.length) return -5;
  // NO_DATA is returned on a Gamepad index that was removed.
  // For previously disconnected gamepads there should be an empty slot (null/undefined/false) at the index.
  // This is because gamepads must keep their original position in the array.
  // For example, removing the first of two gamepads produces [null/undefined/false, gamepad].
  if (!JSEvents.lastGamepadState[index]) return -7;
  fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]);
  return 0;
}

var _emscripten_get_main_loop_timing = (mode, value) => {
  if (mode) (growMemViews(), HEAP32)[((mode) >> 2)] = MainLoop.timingMode;
  if (value) (growMemViews(), HEAP32)[((value) >> 2)] = MainLoop.timingValue;
};

function _emscripten_get_num_gamepads() {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_get_num_gamepads' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  if (!JSEvents.lastGamepadState) throw "emscripten_get_num_gamepads() can only be called after having first called emscripten_sample_gamepad_data() and that function has returned EMSCRIPTEN_RESULT_SUCCESS!";
  // N.B. Do not call emscripten_get_num_gamepads() unless having first called emscripten_sample_gamepad_data(), and that has returned EMSCRIPTEN_RESULT_SUCCESS.
  // Otherwise the following line will throw an exception.
  return JSEvents.lastGamepadState.length;
}

/** @param {number=} timeout */ var safeSetTimeout = (func, timeout) => setTimeout(() => {
  callUserCallback(func);
}, timeout);

var Browser = {
  useWebGL: false,
  isFullscreen: false,
  pointerLock: false,
  moduleContextCreatedCallbacks: [],
  workers: [],
  preloadedImages: {},
  preloadedAudios: {},
  getCanvas: () => Module["canvas"],
  init() {
    if (Browser.initted) return;
    Browser.initted = true;
    // Support for plugins that can process preloaded files. You can add more of these to
    // your app by creating and appending to preloadPlugins.
    // Each plugin is asked if it can handle a file based on the file's name. If it can,
    // it is given the file's raw data. When it is done, it calls a callback with the file's
    // (possibly modified) data. For example, a plugin might decompress a file, or it
    // might create some side data structure for use later (like an Image element, etc.).
    var imagePlugin = {};
    imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
      return !Module["noImageDecoding"] && /\.(jpg|jpeg|png|bmp|webp)$/i.test(name);
    };
    imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
      var b = new Blob([ byteArray ], {
        type: Browser.getMimetype(name)
      });
      if (b.size !== byteArray.length) {
        // Safari bug #118630
        // Safari's Blob can only take an ArrayBuffer
        b = new Blob([ (new Uint8Array(byteArray)).buffer ], {
          type: Browser.getMimetype(name)
        });
      }
      var url = URL.createObjectURL(b);
      assert(typeof url == "string", "createObjectURL must return a url as a string");
      var img = new Image;
      img.onload = () => {
        assert(img.complete, `Image ${name} could not be decoded`);
        var canvas = /** @type {!HTMLCanvasElement} */ (document.createElement("canvas"));
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        Browser.preloadedImages[name] = canvas;
        URL.revokeObjectURL(url);
        onload?.(byteArray);
      };
      img.onerror = event => {
        err(`Image ${url} could not be decoded`);
        onerror?.();
      };
      img.src = url;
    };
    preloadPlugins.push(imagePlugin);
    var audioPlugin = {};
    audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
      return !Module["noAudioDecoding"] && name.slice(-4) in {
        ".ogg": 1,
        ".wav": 1,
        ".mp3": 1
      };
    };
    audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
      var done = false;
      function finish(audio) {
        if (done) return;
        done = true;
        Browser.preloadedAudios[name] = audio;
        onload?.(byteArray);
      }
      function fail() {
        if (done) return;
        done = true;
        Browser.preloadedAudios[name] = new Audio;
        // empty shim
        onerror?.();
      }
      var b = new Blob([ byteArray ], {
        type: Browser.getMimetype(name)
      });
      var url = URL.createObjectURL(b);
      // XXX we never revoke this!
      assert(typeof url == "string", "createObjectURL must return a url as a string");
      var audio = new Audio;
      audio.addEventListener("canplaythrough", () => finish(audio), false);
      // use addEventListener due to chromium bug 124926
      audio.onerror = function audio_onerror(event) {
        if (done) return;
        err(`warning: browser could not fully decode audio ${name}, trying slower base64 approach`);
        function encode64(data) {
          var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
          var PAD = "=";
          var ret = "";
          var leftchar = 0;
          var leftbits = 0;
          for (var i = 0; i < data.length; i++) {
            leftchar = (leftchar << 8) | data[i];
            leftbits += 8;
            while (leftbits >= 6) {
              var curr = (leftchar >> (leftbits - 6)) & 63;
              leftbits -= 6;
              ret += BASE[curr];
            }
          }
          if (leftbits == 2) {
            ret += BASE[(leftchar & 3) << 4];
            ret += PAD + PAD;
          } else if (leftbits == 4) {
            ret += BASE[(leftchar & 15) << 2];
            ret += PAD;
          }
          return ret;
        }
        audio.src = "data:audio/x-" + name.slice(-3) + ";base64," + encode64(byteArray);
        finish(audio);
      };
      audio.src = url;
      // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
      safeSetTimeout(() => {
        finish(audio);
      }, 1e4);
    };
    preloadPlugins.push(audioPlugin);
    // Canvas event setup
    function pointerLockChange() {
      var canvas = Browser.getCanvas();
      Browser.pointerLock = document["pointerLockElement"] === canvas || document["mozPointerLockElement"] === canvas || document["webkitPointerLockElement"] === canvas || document["msPointerLockElement"] === canvas;
    }
    var canvas = Browser.getCanvas();
    if (canvas) {
      // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
      // Module['forcedAspectRatio'] = 4 / 3;
      canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (() => {});
      canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (() => {});
      // no-op if function does not exist
      canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
      document.addEventListener("pointerlockchange", pointerLockChange, false);
      document.addEventListener("mozpointerlockchange", pointerLockChange, false);
      document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
      document.addEventListener("mspointerlockchange", pointerLockChange, false);
      if (Module["elementPointerLock"]) {
        canvas.addEventListener("click", ev => {
          if (!Browser.pointerLock && Browser.getCanvas().requestPointerLock) {
            Browser.getCanvas().requestPointerLock();
            ev.preventDefault();
          }
        }, false);
      }
    }
  },
  createContext(/** @type {HTMLCanvasElement} */ canvas, useWebGL, setInModule, webGLContextAttributes) {
    if (useWebGL && Module["ctx"] && canvas == Browser.getCanvas()) return Module["ctx"];
    // no need to recreate GL context if it's already been created for this canvas.
    var ctx;
    var contextHandle;
    if (useWebGL) {
      // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
      var contextAttributes = {
        antialias: false,
        alpha: false,
        majorVersion: (typeof WebGL2RenderingContext != "undefined") ? 2 : 1
      };
      if (webGLContextAttributes) {
        for (var attribute in webGLContextAttributes) {
          contextAttributes[attribute] = webGLContextAttributes[attribute];
        }
      }
      // This check of existence of GL is here to satisfy Closure compiler, which yells if variable GL is referenced below but GL object is not
      // actually compiled in because application is not doing any GL operations. TODO: Ideally if GL is not being used, this function
      // Browser.createContext() should not even be emitted.
      if (typeof GL != "undefined") {
        contextHandle = GL.createContext(canvas, contextAttributes);
        if (contextHandle) {
          ctx = GL.getContext(contextHandle).GLctx;
        }
      }
    } else {
      ctx = canvas.getContext("2d");
    }
    if (!ctx) return null;
    if (setInModule) {
      if (!useWebGL) assert(typeof GLctx == "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
      Module["ctx"] = ctx;
      if (useWebGL) GL.makeContextCurrent(contextHandle);
      Browser.useWebGL = useWebGL;
      Browser.moduleContextCreatedCallbacks.forEach(callback => callback());
      Browser.init();
    }
    return ctx;
  },
  fullscreenHandlersInstalled: false,
  lockPointer: undefined,
  resizeCanvas: undefined,
  requestFullscreen(lockPointer, resizeCanvas) {
    Browser.lockPointer = lockPointer;
    Browser.resizeCanvas = resizeCanvas;
    if (typeof Browser.lockPointer == "undefined") Browser.lockPointer = true;
    if (typeof Browser.resizeCanvas == "undefined") Browser.resizeCanvas = false;
    var canvas = Browser.getCanvas();
    function fullscreenChange() {
      Browser.isFullscreen = false;
      var canvasContainer = canvas.parentNode;
      if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
        canvas.exitFullscreen = Browser.exitFullscreen;
        if (Browser.lockPointer) canvas.requestPointerLock();
        Browser.isFullscreen = true;
        if (Browser.resizeCanvas) {
          Browser.setFullscreenCanvasSize();
        } else {
          Browser.updateCanvasDimensions(canvas);
        }
      } else {
        // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
        canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
        canvasContainer.parentNode.removeChild(canvasContainer);
        if (Browser.resizeCanvas) {
          Browser.setWindowedCanvasSize();
        } else {
          Browser.updateCanvasDimensions(canvas);
        }
      }
      Module["onFullScreen"]?.(Browser.isFullscreen);
      Module["onFullscreen"]?.(Browser.isFullscreen);
    }
    if (!Browser.fullscreenHandlersInstalled) {
      Browser.fullscreenHandlersInstalled = true;
      document.addEventListener("fullscreenchange", fullscreenChange, false);
      document.addEventListener("mozfullscreenchange", fullscreenChange, false);
      document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
      document.addEventListener("MSFullscreenChange", fullscreenChange, false);
    }
    // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
    var canvasContainer = document.createElement("div");
    canvas.parentNode.insertBefore(canvasContainer, canvas);
    canvasContainer.appendChild(canvas);
    // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
    canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? () => canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null) || (canvasContainer["webkitRequestFullScreen"] ? () => canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null);
    canvasContainer.requestFullscreen();
  },
  requestFullScreen() {
    abort("Module.requestFullScreen has been replaced by Module.requestFullscreen (without a capital S)");
  },
  exitFullscreen() {
    // This is workaround for chrome. Trying to exit from fullscreen
    // not in fullscreen state will cause "TypeError: Document not active"
    // in chrome. See https://github.com/emscripten-core/emscripten/pull/8236
    if (!Browser.isFullscreen) {
      return false;
    }
    var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || (() => {});
    CFS.apply(document, []);
    return true;
  },
  safeSetTimeout(func, timeout) {
    // Legacy function, this is used by the SDL2 port so we need to keep it
    // around at least until that is updated.
    // See https://github.com/libsdl-org/SDL/pull/6304
    return safeSetTimeout(func, timeout);
  },
  getMimetype(name) {
    return {
      "jpg": "image/jpeg",
      "jpeg": "image/jpeg",
      "png": "image/png",
      "bmp": "image/bmp",
      "ogg": "audio/ogg",
      "wav": "audio/wav",
      "mp3": "audio/mpeg"
    }[name.slice(name.lastIndexOf(".") + 1)];
  },
  getUserMedia(func) {
    window.getUserMedia ||= navigator["getUserMedia"] || navigator["mozGetUserMedia"];
    window.getUserMedia(func);
  },
  getMovementX(event) {
    return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
  },
  getMovementY(event) {
    return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
  },
  getMouseWheelDelta(event) {
    var delta = 0;
    switch (event.type) {
     case "DOMMouseScroll":
      // 3 lines make up a step
      delta = event.detail / 3;
      break;

     case "mousewheel":
      // 120 units make up a step
      delta = event.wheelDelta / 120;
      break;

     case "wheel":
      delta = event.deltaY;
      switch (event.deltaMode) {
       case 0:
        // DOM_DELTA_PIXEL: 100 pixels make up a step
        delta /= 100;
        break;

       case 1:
        // DOM_DELTA_LINE: 3 lines make up a step
        delta /= 3;
        break;

       case 2:
        // DOM_DELTA_PAGE: A page makes up 80 steps
        delta *= 80;
        break;

       default:
        throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
      }
      break;

     default:
      throw "unrecognized mouse wheel event: " + event.type;
    }
    return delta;
  },
  mouseX: 0,
  mouseY: 0,
  mouseMovementX: 0,
  mouseMovementY: 0,
  touches: {},
  lastTouches: {},
  calculateMouseCoords(pageX, pageY) {
    // Calculate the movement based on the changes
    // in the coordinates.
    var canvas = Browser.getCanvas();
    var rect = canvas.getBoundingClientRect();
    // Neither .scrollX or .pageXOffset are defined in a spec, but
    // we prefer .scrollX because it is currently in a spec draft.
    // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
    var scrollX = ((typeof window.scrollX != "undefined") ? window.scrollX : window.pageXOffset);
    var scrollY = ((typeof window.scrollY != "undefined") ? window.scrollY : window.pageYOffset);
    // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
    // and we have no viable fallback.
    assert((typeof scrollX != "undefined") && (typeof scrollY != "undefined"), "Unable to retrieve scroll position, mouse positions likely broken.");
    var adjustedX = pageX - (scrollX + rect.left);
    var adjustedY = pageY - (scrollY + rect.top);
    // the canvas might be CSS-scaled compared to its backbuffer;
    // SDL-using content will want mouse coordinates in terms
    // of backbuffer units.
    adjustedX = adjustedX * (canvas.width / rect.width);
    adjustedY = adjustedY * (canvas.height / rect.height);
    return {
      x: adjustedX,
      y: adjustedY
    };
  },
  setMouseCoords(pageX, pageY) {
    const {x, y} = Browser.calculateMouseCoords(pageX, pageY);
    Browser.mouseMovementX = x - Browser.mouseX;
    Browser.mouseMovementY = y - Browser.mouseY;
    Browser.mouseX = x;
    Browser.mouseY = y;
  },
  calculateMouseEvent(event) {
    // event should be mousemove, mousedown or mouseup
    if (Browser.pointerLock) {
      // When the pointer is locked, calculate the coordinates
      // based on the movement of the mouse.
      // Workaround for Firefox bug 764498
      if (event.type != "mousemove" && ("mozMovementX" in event)) {
        Browser.mouseMovementX = Browser.mouseMovementY = 0;
      } else {
        Browser.mouseMovementX = Browser.getMovementX(event);
        Browser.mouseMovementY = Browser.getMovementY(event);
      }
      // add the mouse delta to the current absolute mouse position
      Browser.mouseX += Browser.mouseMovementX;
      Browser.mouseY += Browser.mouseMovementY;
    } else {
      if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
        var touch = event.touch;
        if (touch === undefined) {
          return;
        }
        var coords = Browser.calculateMouseCoords(touch.pageX, touch.pageY);
        if (event.type === "touchstart") {
          Browser.lastTouches[touch.identifier] = coords;
          Browser.touches[touch.identifier] = coords;
        } else if (event.type === "touchend" || event.type === "touchmove") {
          var last = Browser.touches[touch.identifier];
          last ||= coords;
          Browser.lastTouches[touch.identifier] = last;
          Browser.touches[touch.identifier] = coords;
        }
        return;
      }
      Browser.setMouseCoords(event.pageX, event.pageY);
    }
  },
  resizeListeners: [],
  updateResizeListeners() {
    var canvas = Browser.getCanvas();
    Browser.resizeListeners.forEach(listener => listener(canvas.width, canvas.height));
  },
  setCanvasSize(width, height, noUpdates) {
    var canvas = Browser.getCanvas();
    Browser.updateCanvasDimensions(canvas, width, height);
    if (!noUpdates) Browser.updateResizeListeners();
  },
  windowedWidth: 0,
  windowedHeight: 0,
  setFullscreenCanvasSize() {
    // check if SDL is available
    if (typeof SDL != "undefined") {
      var flags = (growMemViews(), HEAPU32)[((SDL.screen) >> 2)];
      flags = flags | 8388608;
      // set SDL_FULLSCREEN flag
      (growMemViews(), HEAP32)[((SDL.screen) >> 2)] = flags;
    }
    Browser.updateCanvasDimensions(Browser.getCanvas());
    Browser.updateResizeListeners();
  },
  setWindowedCanvasSize() {
    // check if SDL is available
    if (typeof SDL != "undefined") {
      var flags = (growMemViews(), HEAPU32)[((SDL.screen) >> 2)];
      flags = flags & ~8388608;
      // clear SDL_FULLSCREEN flag
      (growMemViews(), HEAP32)[((SDL.screen) >> 2)] = flags;
    }
    Browser.updateCanvasDimensions(Browser.getCanvas());
    Browser.updateResizeListeners();
  },
  updateCanvasDimensions(canvas, wNative, hNative) {
    if (wNative && hNative) {
      canvas.widthNative = wNative;
      canvas.heightNative = hNative;
    } else {
      wNative = canvas.widthNative;
      hNative = canvas.heightNative;
    }
    var w = wNative;
    var h = hNative;
    if (Module["forcedAspectRatio"] > 0) {
      if (w / h < Module["forcedAspectRatio"]) {
        w = Math.round(h * Module["forcedAspectRatio"]);
      } else {
        h = Math.round(w / Module["forcedAspectRatio"]);
      }
    }
    if (((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode) && (typeof screen != "undefined")) {
      var factor = Math.min(screen.width / w, screen.height / h);
      w = Math.round(w * factor);
      h = Math.round(h * factor);
    }
    if (Browser.resizeCanvas) {
      if (canvas.width != w) canvas.width = w;
      if (canvas.height != h) canvas.height = h;
      if (typeof canvas.style != "undefined") {
        canvas.style.removeProperty("width");
        canvas.style.removeProperty("height");
      }
    } else {
      if (canvas.width != wNative) canvas.width = wNative;
      if (canvas.height != hNative) canvas.height = hNative;
      if (typeof canvas.style != "undefined") {
        if (w != wNative || h != hNative) {
          canvas.style.setProperty("width", w + "px", "important");
          canvas.style.setProperty("height", h + "px", "important");
        } else {
          canvas.style.removeProperty("width");
          canvas.style.removeProperty("height");
        }
      }
    }
  }
};

function _emscripten_get_screen_size(width, height) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_get_screen_size' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  (growMemViews(), HEAP32)[((width) >> 2)] = screen.width;
  (growMemViews(), HEAP32)[((height) >> 2)] = screen.height;
}

var GLctx;

var webgl_enable_ANGLE_instanced_arrays = ctx => {
  // Extension available in WebGL 1 from Firefox 26 and Google Chrome 30 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("ANGLE_instanced_arrays");
  // Because this extension is a core function in WebGL 2, assign the extension entry points in place of
  // where the core functions will reside in WebGL 2. This way the calling code can call these without
  // having to dynamically branch depending if running against WebGL 1 or WebGL 2.
  if (ext) {
    ctx["vertexAttribDivisor"] = (index, divisor) => ext["vertexAttribDivisorANGLE"](index, divisor);
    ctx["drawArraysInstanced"] = (mode, first, count, primcount) => ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
    ctx["drawElementsInstanced"] = (mode, count, type, indices, primcount) => ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
    return 1;
  }
};

var webgl_enable_OES_vertex_array_object = ctx => {
  // Extension available in WebGL 1 from Firefox 25 and WebKit 536.28/desktop Safari 6.0.3 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("OES_vertex_array_object");
  if (ext) {
    ctx["createVertexArray"] = () => ext["createVertexArrayOES"]();
    ctx["deleteVertexArray"] = vao => ext["deleteVertexArrayOES"](vao);
    ctx["bindVertexArray"] = vao => ext["bindVertexArrayOES"](vao);
    ctx["isVertexArray"] = vao => ext["isVertexArrayOES"](vao);
    return 1;
  }
};

var webgl_enable_WEBGL_draw_buffers = ctx => {
  // Extension available in WebGL 1 from Firefox 28 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("WEBGL_draw_buffers");
  if (ext) {
    ctx["drawBuffers"] = (n, bufs) => ext["drawBuffersWEBGL"](n, bufs);
    return 1;
  }
};

var webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance = ctx => // Closure is expected to be allowed to minify the '.dibvbi' property, so not accessing it quoted.
!!(ctx.dibvbi = ctx.getExtension("WEBGL_draw_instanced_base_vertex_base_instance"));

var webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance = ctx => !!(ctx.mdibvbi = ctx.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance"));

var webgl_enable_EXT_polygon_offset_clamp = ctx => !!(ctx.extPolygonOffsetClamp = ctx.getExtension("EXT_polygon_offset_clamp"));

var webgl_enable_EXT_clip_control = ctx => !!(ctx.extClipControl = ctx.getExtension("EXT_clip_control"));

var webgl_enable_WEBGL_polygon_mode = ctx => !!(ctx.webglPolygonMode = ctx.getExtension("WEBGL_polygon_mode"));

var webgl_enable_WEBGL_multi_draw = ctx => // Closure is expected to be allowed to minify the '.multiDrawWebgl' property, so not accessing it quoted.
!!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));

var getEmscriptenSupportedExtensions = ctx => {
  // Restrict the list of advertised extensions to those that we actually
  // support.
  var supportedExtensions = [ // WebGL 1 extensions
  "ANGLE_instanced_arrays", "EXT_blend_minmax", "EXT_disjoint_timer_query", "EXT_frag_depth", "EXT_shader_texture_lod", "EXT_sRGB", "OES_element_index_uint", "OES_fbo_render_mipmap", "OES_standard_derivatives", "OES_texture_float", "OES_texture_half_float", "OES_texture_half_float_linear", "OES_vertex_array_object", "WEBGL_color_buffer_float", "WEBGL_depth_texture", "WEBGL_draw_buffers", // WebGL 2 extensions
  "EXT_color_buffer_float", "EXT_conservative_depth", "EXT_disjoint_timer_query_webgl2", "EXT_texture_norm16", "NV_shader_noperspective_interpolation", "WEBGL_clip_cull_distance", // WebGL 1 and WebGL 2 extensions
  "EXT_clip_control", "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend", "EXT_polygon_offset_clamp", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "KHR_parallel_shader_compile", "OES_texture_float_linear", "WEBGL_blend_func_extended", "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw", "WEBGL_polygon_mode" ];
  // .getSupportedExtensions() can return null if context is lost, so coerce to empty array.
  return (ctx.getSupportedExtensions() || []).filter(ext => supportedExtensions.includes(ext));
};

var registerPreMainLoop = f => {
  // Does nothing unless $MainLoop is included/used.
  typeof MainLoop != "undefined" && MainLoop.preMainLoop.push(f);
};

var GL = {
  counter: 1,
  buffers: [],
  mappedBuffers: {},
  programs: [],
  framebuffers: [],
  renderbuffers: [],
  textures: [],
  shaders: [],
  vaos: [],
  contexts: [],
  offscreenCanvases: {},
  queries: [],
  samplers: [],
  transformFeedbacks: [],
  syncs: [],
  byteSizeByTypeRoot: 5120,
  byteSizeByType: [ 1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8 ],
  stringCache: {},
  stringiCache: {},
  unpackAlignment: 4,
  unpackRowLength: 0,
  recordError: errorCode => {
    if (!GL.lastError) {
      GL.lastError = errorCode;
    }
  },
  getNewId: table => {
    var ret = GL.counter++;
    for (var i = table.length; i < ret; i++) {
      table[i] = null;
    }
    // Skip over any non-null elements that might have been created by
    // glBindBuffer.
    while (table[ret]) {
      ret = GL.counter++;
    }
    return ret;
  },
  genObject: (n, buffers, createFunction, objectTable) => {
    for (var i = 0; i < n; i++) {
      var buffer = GLctx[createFunction]();
      var id = buffer && GL.getNewId(objectTable);
      if (buffer) {
        buffer.name = id;
        objectTable[id] = buffer;
      } else {
        GL.recordError(1282);
      }
      (growMemViews(), HEAP32)[(((buffers) + (i * 4)) >> 2)] = id;
    }
  },
  MAX_TEMP_BUFFER_SIZE: 2097152,
  numTempVertexBuffersPerSize: 64,
  log2ceilLookup: i => 32 - Math.clz32(i === 0 ? 0 : i - 1),
  generateTempBuffers: (quads, context) => {
    var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
    context.tempVertexBufferCounters1 = [];
    context.tempVertexBufferCounters2 = [];
    context.tempVertexBufferCounters1.length = context.tempVertexBufferCounters2.length = largestIndex + 1;
    context.tempVertexBuffers1 = [];
    context.tempVertexBuffers2 = [];
    context.tempVertexBuffers1.length = context.tempVertexBuffers2.length = largestIndex + 1;
    context.tempIndexBuffers = [];
    context.tempIndexBuffers.length = largestIndex + 1;
    for (var i = 0; i <= largestIndex; ++i) {
      context.tempIndexBuffers[i] = null;
      // Created on-demand
      context.tempVertexBufferCounters1[i] = context.tempVertexBufferCounters2[i] = 0;
      var ringbufferLength = GL.numTempVertexBuffersPerSize;
      context.tempVertexBuffers1[i] = [];
      context.tempVertexBuffers2[i] = [];
      var ringbuffer1 = context.tempVertexBuffers1[i];
      var ringbuffer2 = context.tempVertexBuffers2[i];
      ringbuffer1.length = ringbuffer2.length = ringbufferLength;
      for (var j = 0; j < ringbufferLength; ++j) {
        ringbuffer1[j] = ringbuffer2[j] = null;
      }
    }
    if (quads) {
      // GL_QUAD indexes can be precalculated
      context.tempQuadIndexBuffer = GLctx.createBuffer();
      context.GLctx.bindBuffer(34963, context.tempQuadIndexBuffer);
      var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
      var quadIndexes = new Uint16Array(numIndexes);
      var i = 0, v = 0;
      while (1) {
        quadIndexes[i++] = v;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 1;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 2;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 2;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 3;
        if (i >= numIndexes) break;
        v += 4;
      }
      context.GLctx.bufferData(34963, quadIndexes, 35044);
      context.GLctx.bindBuffer(34963, null);
    }
  },
  getTempVertexBuffer: sizeBytes => {
    var idx = GL.log2ceilLookup(sizeBytes);
    var ringbuffer = GL.currentContext.tempVertexBuffers1[idx];
    var nextFreeBufferIndex = GL.currentContext.tempVertexBufferCounters1[idx];
    GL.currentContext.tempVertexBufferCounters1[idx] = (GL.currentContext.tempVertexBufferCounters1[idx] + 1) & (GL.numTempVertexBuffersPerSize - 1);
    var vbo = ringbuffer[nextFreeBufferIndex];
    if (vbo) {
      return vbo;
    }
    var prevVBO = GLctx.getParameter(34964);
    ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer();
    GLctx.bindBuffer(34962, ringbuffer[nextFreeBufferIndex]);
    GLctx.bufferData(34962, 1 << idx, 35048);
    GLctx.bindBuffer(34962, prevVBO);
    return ringbuffer[nextFreeBufferIndex];
  },
  getTempIndexBuffer: sizeBytes => {
    var idx = GL.log2ceilLookup(sizeBytes);
    var ibo = GL.currentContext.tempIndexBuffers[idx];
    if (ibo) {
      return ibo;
    }
    var prevIBO = GLctx.getParameter(34965);
    GL.currentContext.tempIndexBuffers[idx] = GLctx.createBuffer();
    GLctx.bindBuffer(34963, GL.currentContext.tempIndexBuffers[idx]);
    GLctx.bufferData(34963, 1 << idx, 35048);
    GLctx.bindBuffer(34963, prevIBO);
    return GL.currentContext.tempIndexBuffers[idx];
  },
  newRenderingFrameStarted: () => {
    if (!GL.currentContext) {
      return;
    }
    var vb = GL.currentContext.tempVertexBuffers1;
    GL.currentContext.tempVertexBuffers1 = GL.currentContext.tempVertexBuffers2;
    GL.currentContext.tempVertexBuffers2 = vb;
    vb = GL.currentContext.tempVertexBufferCounters1;
    GL.currentContext.tempVertexBufferCounters1 = GL.currentContext.tempVertexBufferCounters2;
    GL.currentContext.tempVertexBufferCounters2 = vb;
    var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
    for (var i = 0; i <= largestIndex; ++i) {
      GL.currentContext.tempVertexBufferCounters1[i] = 0;
    }
  },
  getSource: (shader, count, string, length) => {
    var source = "";
    for (var i = 0; i < count; ++i) {
      var len = length ? (growMemViews(), HEAPU32)[(((length) + (i * 4)) >> 2)] : undefined;
      source += UTF8ToString((growMemViews(), HEAPU32)[(((string) + (i * 4)) >> 2)], len);
    }
    return source;
  },
  calcBufLength: (size, type, stride, count) => {
    if (stride > 0) {
      return count * stride;
    }
    var typeSize = GL.byteSizeByType[type - GL.byteSizeByTypeRoot];
    return size * typeSize * count;
  },
  usedTempBuffers: [],
  preDrawHandleClientVertexAttribBindings: count => {
    GL.resetBufferBinding = false;
    // TODO: initial pass to detect ranges we need to upload, might not need
    // an upload per attrib
    for (var i = 0; i < GL.currentContext.maxVertexAttribs; ++i) {
      var cb = GL.currentContext.clientBuffers[i];
      if (!cb.clientside || !cb.enabled) continue;
      GL.resetBufferBinding = true;
      var size = GL.calcBufLength(cb.size, cb.type, cb.stride, count);
      var buf = GL.getTempVertexBuffer(size);
      GLctx.bindBuffer(34962, buf);
      GLctx.bufferSubData(34962, 0, (growMemViews(), HEAPU8).subarray(cb.ptr, cb.ptr + size));
      cb.vertexAttribPointerAdaptor.call(GLctx, i, cb.size, cb.type, cb.normalized, cb.stride, 0);
    }
  },
  postDrawHandleClientVertexAttribBindings: () => {
    if (GL.resetBufferBinding) {
      GLctx.bindBuffer(34962, GL.buffers[GLctx.currentArrayBufferBinding]);
    }
  },
  createContext: (/** @type {HTMLCanvasElement} */ canvas, webGLContextAttributes) => {
    // BUG: Workaround Safari WebGL issue: After successfully acquiring WebGL
    // context on a canvas, calling .getContext() will always return that
    // context independent of which 'webgl' or 'webgl2'
    // context version was passed. See:
    //   https://bugs.webkit.org/show_bug.cgi?id=222758
    // and:
    //   https://github.com/emscripten-core/emscripten/issues/13295.
    // TODO: Once the bug is fixed and shipped in Safari, adjust the Safari
    // version field in above check.
    if (!canvas.getContextSafariWebGL2Fixed) {
      canvas.getContextSafariWebGL2Fixed = canvas.getContext;
      /** @type {function(this:HTMLCanvasElement, string, (Object|null)=): (Object|null)} */ function fixedGetContext(ver, attrs) {
        var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
        return ((ver == "webgl") == (gl instanceof WebGLRenderingContext)) ? gl : null;
      }
      canvas.getContext = fixedGetContext;
    }
    var ctx = (webGLContextAttributes.majorVersion > 1) ? canvas.getContext("webgl2", webGLContextAttributes) : canvas.getContext("webgl", webGLContextAttributes);
    if (!ctx) return 0;
    var handle = GL.registerContext(ctx, webGLContextAttributes);
    return handle;
  },
  registerContext: (ctx, webGLContextAttributes) => {
    // without pthreads a context is just an integer ID
    var handle = GL.getNewId(GL.contexts);
    var context = {
      handle,
      attributes: webGLContextAttributes,
      version: webGLContextAttributes.majorVersion,
      GLctx: ctx
    };
    // Store the created context object so that we can access the context
    // given a canvas without having to pass the parameters again.
    if (ctx.canvas) ctx.canvas.GLctxObject = context;
    GL.contexts[handle] = context;
    if (typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
      GL.initExtensions(context);
    }
    context.maxVertexAttribs = context.GLctx.getParameter(34921);
    context.clientBuffers = [];
    for (var i = 0; i < context.maxVertexAttribs; i++) {
      context.clientBuffers[i] = {
        enabled: false,
        clientside: false,
        size: 0,
        type: 0,
        normalized: 0,
        stride: 0,
        ptr: 0,
        vertexAttribPointerAdaptor: null
      };
    }
    GL.generateTempBuffers(false, context);
    return handle;
  },
  makeContextCurrent: contextHandle => {
    // Active Emscripten GL layer context object.
    GL.currentContext = GL.contexts[contextHandle];
    // Active WebGL context object.
    Module["ctx"] = GLctx = GL.currentContext?.GLctx;
    return !(contextHandle && !GLctx);
  },
  getContext: contextHandle => GL.contexts[contextHandle],
  deleteContext: contextHandle => {
    if (GL.currentContext === GL.contexts[contextHandle]) {
      GL.currentContext = null;
    }
    if (typeof JSEvents == "object") {
      // Release all JS event handlers on the DOM element that the GL context is
      // associated with since the context is now deleted.
      JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
    }
    // Make sure the canvas object no longer refers to the context object so
    // there are no GC surprises.
    if (GL.contexts[contextHandle]?.GLctx.canvas) {
      GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
    }
    GL.contexts[contextHandle] = null;
  },
  initExtensions: context => {
    // If this function is called without a specific context object, init the
    // extensions of the currently active context.
    context ||= GL.currentContext;
    if (context.initExtensionsDone) return;
    context.initExtensionsDone = true;
    var GLctx = context.GLctx;
    // Detect the presence of a few extensions manually, ction GL interop
    // layer itself will need to know if they exist.
    // Extensions that are available in both WebGL 1 and WebGL 2
    webgl_enable_WEBGL_multi_draw(GLctx);
    webgl_enable_EXT_polygon_offset_clamp(GLctx);
    webgl_enable_EXT_clip_control(GLctx);
    webgl_enable_WEBGL_polygon_mode(GLctx);
    // Extensions that are only available in WebGL 1 (the calls will be no-ops
    // if called on a WebGL 2 context active)
    webgl_enable_ANGLE_instanced_arrays(GLctx);
    webgl_enable_OES_vertex_array_object(GLctx);
    webgl_enable_WEBGL_draw_buffers(GLctx);
    // Extensions that are available from WebGL >= 2 (no-op if called on a WebGL 1 context active)
    webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
    webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
    // On WebGL 2, EXT_disjoint_timer_query is replaced with an alternative
    // that's based on core APIs, and exposes only the queryCounterEXT()
    // entrypoint.
    if (context.version >= 2) {
      GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query_webgl2");
    }
    // However, Firefox exposes the WebGL 1 version on WebGL 2 as well and
    // thus we look for the WebGL 1 version again if the WebGL 2 version
    // isn't present. https://bugzilla.mozilla.org/show_bug.cgi?id=1328882
    if (context.version < 2 || !GLctx.disjointTimerQueryExt) {
      GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
    }
    getEmscriptenSupportedExtensions(GLctx).forEach(ext => {
      // WEBGL_lose_context, WEBGL_debug_renderer_info and WEBGL_debug_shaders
      // are not enabled by default.
      if (!ext.includes("lose_context") && !ext.includes("debug")) {
        // Call .getExtension() to enable that extension permanently.
        GLctx.getExtension(ext);
      }
    });
  }
};

/** @suppress {duplicate } */ var _glActiveTexture = x0 => GLctx.activeTexture(x0);

var _emscripten_glActiveTexture = _glActiveTexture;

/** @suppress {duplicate } */ var _glAttachShader = (program, shader) => {
  GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
};

var _emscripten_glAttachShader = _glAttachShader;

/** @suppress {duplicate } */ var _glBeginQuery = (target, id) => {
  GLctx.beginQuery(target, GL.queries[id]);
};

var _emscripten_glBeginQuery = _glBeginQuery;

/** @suppress {duplicate } */ var _glBeginQueryEXT = (target, id) => {
  GLctx.disjointTimerQueryExt["beginQueryEXT"](target, GL.queries[id]);
};

var _emscripten_glBeginQueryEXT = _glBeginQueryEXT;

/** @suppress {duplicate } */ var _glBeginTransformFeedback = x0 => GLctx.beginTransformFeedback(x0);

var _emscripten_glBeginTransformFeedback = _glBeginTransformFeedback;

/** @suppress {duplicate } */ var _glBindAttribLocation = (program, index, name) => {
  GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
};

var _emscripten_glBindAttribLocation = _glBindAttribLocation;

/** @suppress {duplicate } */ var _glBindBuffer = (target, buffer) => {
  // Calling glBindBuffer with an unknown buffer will implicitly create a
  // new one.  Here we bypass `GL.counter` and directly using the ID passed
  // in.
  if (buffer && !GL.buffers[buffer]) {
    var b = GLctx.createBuffer();
    b.name = buffer;
    GL.buffers[buffer] = b;
  }
  if (target == 34962) {
    GLctx.currentArrayBufferBinding = buffer;
  } else if (target == 34963) {
    GLctx.currentElementArrayBufferBinding = buffer;
  }
  if (target == 35051) {
    // In WebGL 2 glReadPixels entry point, we need to use a different WebGL 2
    // API function call when a buffer is bound to
    // GL_PIXEL_PACK_BUFFER_BINDING point, so must keep track whether that
    // binding point is non-null to know what is the proper API function to
    // call.
    GLctx.currentPixelPackBufferBinding = buffer;
  } else if (target == 35052) {
    // In WebGL 2 gl(Compressed)Tex(Sub)Image[23]D entry points, we need to
    // use a different WebGL 2 API function call when a buffer is bound to
    // GL_PIXEL_UNPACK_BUFFER_BINDING point, so must keep track whether that
    // binding point is non-null to know what is the proper API function to
    // call.
    GLctx.currentPixelUnpackBufferBinding = buffer;
  }
  GLctx.bindBuffer(target, GL.buffers[buffer]);
};

var _emscripten_glBindBuffer = _glBindBuffer;

/** @suppress {duplicate } */ var _glBindBufferBase = (target, index, buffer) => {
  GLctx.bindBufferBase(target, index, GL.buffers[buffer]);
};

var _emscripten_glBindBufferBase = _glBindBufferBase;

/** @suppress {duplicate } */ var _glBindBufferRange = (target, index, buffer, offset, ptrsize) => {
  GLctx.bindBufferRange(target, index, GL.buffers[buffer], offset, ptrsize);
};

var _emscripten_glBindBufferRange = _glBindBufferRange;

/** @suppress {duplicate } */ var _glBindFramebuffer = (target, framebuffer) => {
  GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
};

var _emscripten_glBindFramebuffer = _glBindFramebuffer;

/** @suppress {duplicate } */ var _glBindRenderbuffer = (target, renderbuffer) => {
  GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
};

var _emscripten_glBindRenderbuffer = _glBindRenderbuffer;

/** @suppress {duplicate } */ var _glBindSampler = (unit, sampler) => {
  GLctx.bindSampler(unit, GL.samplers[sampler]);
};

var _emscripten_glBindSampler = _glBindSampler;

/** @suppress {duplicate } */ var _glBindTexture = (target, texture) => {
  GLctx.bindTexture(target, GL.textures[texture]);
};

var _emscripten_glBindTexture = _glBindTexture;

/** @suppress {duplicate } */ var _glBindTransformFeedback = (target, id) => {
  GLctx.bindTransformFeedback(target, GL.transformFeedbacks[id]);
};

var _emscripten_glBindTransformFeedback = _glBindTransformFeedback;

/** @suppress {duplicate } */ var _glBindVertexArray = vao => {
  GLctx.bindVertexArray(GL.vaos[vao]);
  var ibo = GLctx.getParameter(34965);
  GLctx.currentElementArrayBufferBinding = ibo ? (ibo.name | 0) : 0;
};

var _emscripten_glBindVertexArray = _glBindVertexArray;

/** @suppress {duplicate } */ var _glBindVertexArrayOES = _glBindVertexArray;

var _emscripten_glBindVertexArrayOES = _glBindVertexArrayOES;

/** @suppress {duplicate } */ var _glBlendColor = (x0, x1, x2, x3) => GLctx.blendColor(x0, x1, x2, x3);

var _emscripten_glBlendColor = _glBlendColor;

/** @suppress {duplicate } */ var _glBlendEquation = x0 => GLctx.blendEquation(x0);

var _emscripten_glBlendEquation = _glBlendEquation;

/** @suppress {duplicate } */ var _glBlendEquationSeparate = (x0, x1) => GLctx.blendEquationSeparate(x0, x1);

var _emscripten_glBlendEquationSeparate = _glBlendEquationSeparate;

/** @suppress {duplicate } */ var _glBlendFunc = (x0, x1) => GLctx.blendFunc(x0, x1);

var _emscripten_glBlendFunc = _glBlendFunc;

/** @suppress {duplicate } */ var _glBlendFuncSeparate = (x0, x1, x2, x3) => GLctx.blendFuncSeparate(x0, x1, x2, x3);

var _emscripten_glBlendFuncSeparate = _glBlendFuncSeparate;

/** @suppress {duplicate } */ var _glBlitFramebuffer = (x0, x1, x2, x3, x4, x5, x6, x7, x8, x9) => GLctx.blitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9);

var _emscripten_glBlitFramebuffer = _glBlitFramebuffer;

/** @suppress {duplicate } */ var _glBufferData = (target, size, data, usage) => {
  if (GL.currentContext.version >= 2) {
    // If size is zero, WebGL would interpret uploading the whole input
    // arraybuffer (starting from given offset), which would not make sense in
    // WebAssembly, so avoid uploading if size is zero. However we must still
    // call bufferData to establish a backing storage of zero bytes.
    if (data && size) {
      GLctx.bufferData(target, (growMemViews(), HEAPU8), usage, data, size);
    } else {
      GLctx.bufferData(target, size, usage);
    }
    return;
  }
  // N.b. here first form specifies a heap subarray, second form an integer
  // size, so the ?: code here is polymorphic. It is advised to avoid
  // randomly mixing both uses in calling code, to avoid any potential JS
  // engine JIT issues.
  GLctx.bufferData(target, data ? (growMemViews(), HEAPU8).subarray(data, data + size) : size, usage);
};

var _emscripten_glBufferData = _glBufferData;

/** @suppress {duplicate } */ var _glBufferSubData = (target, offset, size, data) => {
  if (GL.currentContext.version >= 2) {
    size && GLctx.bufferSubData(target, offset, (growMemViews(), HEAPU8), data, size);
    return;
  }
  GLctx.bufferSubData(target, offset, (growMemViews(), HEAPU8).subarray(data, data + size));
};

var _emscripten_glBufferSubData = _glBufferSubData;

/** @suppress {duplicate } */ var _glCheckFramebufferStatus = x0 => GLctx.checkFramebufferStatus(x0);

var _emscripten_glCheckFramebufferStatus = _glCheckFramebufferStatus;

/** @suppress {duplicate } */ var _glClear = x0 => GLctx.clear(x0);

var _emscripten_glClear = _glClear;

/** @suppress {duplicate } */ var _glClearBufferfi = (x0, x1, x2, x3) => GLctx.clearBufferfi(x0, x1, x2, x3);

var _emscripten_glClearBufferfi = _glClearBufferfi;

/** @suppress {duplicate } */ var _glClearBufferfv = (buffer, drawbuffer, value) => {
  GLctx.clearBufferfv(buffer, drawbuffer, (growMemViews(), HEAPF32), ((value) >> 2));
};

var _emscripten_glClearBufferfv = _glClearBufferfv;

/** @suppress {duplicate } */ var _glClearBufferiv = (buffer, drawbuffer, value) => {
  GLctx.clearBufferiv(buffer, drawbuffer, (growMemViews(), HEAP32), ((value) >> 2));
};

var _emscripten_glClearBufferiv = _glClearBufferiv;

/** @suppress {duplicate } */ var _glClearBufferuiv = (buffer, drawbuffer, value) => {
  GLctx.clearBufferuiv(buffer, drawbuffer, (growMemViews(), HEAPU32), ((value) >> 2));
};

var _emscripten_glClearBufferuiv = _glClearBufferuiv;

/** @suppress {duplicate } */ var _glClearColor = (x0, x1, x2, x3) => GLctx.clearColor(x0, x1, x2, x3);

var _emscripten_glClearColor = _glClearColor;

/** @suppress {duplicate } */ var _glClearDepthf = x0 => GLctx.clearDepth(x0);

var _emscripten_glClearDepthf = _glClearDepthf;

/** @suppress {duplicate } */ var _glClearStencil = x0 => GLctx.clearStencil(x0);

var _emscripten_glClearStencil = _glClearStencil;

/** @suppress {duplicate } */ var _glClientWaitSync = (sync, flags, timeout) => {
  // WebGL2 vs GLES3 differences: in GLES3, the timeout parameter is a uint64, where 0xFFFFFFFFFFFFFFFFULL means GL_TIMEOUT_IGNORED.
  // In JS, there's no 64-bit value types, so instead timeout is taken to be signed, and GL_TIMEOUT_IGNORED is given value -1.
  // Inherently the value accepted in the timeout is lossy, and can't take in arbitrary u64 bit pattern (but most likely doesn't matter)
  // See https://www.khronos.org/registry/webgl/specs/latest/2.0/#5.15
  timeout = Number(timeout);
  return GLctx.clientWaitSync(GL.syncs[sync], flags, timeout);
};

var _emscripten_glClientWaitSync = _glClientWaitSync;

/** @suppress {duplicate } */ var _glClipControlEXT = (origin, depth) => {
  GLctx.extClipControl["clipControlEXT"](origin, depth);
};

var _emscripten_glClipControlEXT = _glClipControlEXT;

/** @suppress {duplicate } */ var _glColorMask = (red, green, blue, alpha) => {
  GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
};

var _emscripten_glColorMask = _glColorMask;

/** @suppress {duplicate } */ var _glCompileShader = shader => {
  GLctx.compileShader(GL.shaders[shader]);
};

var _emscripten_glCompileShader = _glCompileShader;

/** @suppress {duplicate } */ var _glCompressedTexImage2D = (target, level, internalFormat, width, height, border, imageSize, data) => {
  // `data` may be null here, which means "allocate uniniitalized space but
  // don't upload" in GLES parlance, but `compressedTexImage2D` requires the
  // final data parameter, so we simply pass a heap view starting at zero
  // effectively uploading whatever happens to be near address zero.  See
  // https://github.com/emscripten-core/emscripten/issues/19300.
  if (GL.currentContext.version >= 2) {
    if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
      GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data);
      return;
    }
    GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, (growMemViews(), 
    HEAPU8), data, imageSize);
    return;
  }
  GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, (growMemViews(), 
  HEAPU8).subarray((data), data + imageSize));
};

var _emscripten_glCompressedTexImage2D = _glCompressedTexImage2D;

/** @suppress {duplicate } */ var _glCompressedTexImage3D = (target, level, internalFormat, width, height, depth, border, imageSize, data) => {
  if (GLctx.currentPixelUnpackBufferBinding) {
    GLctx.compressedTexImage3D(target, level, internalFormat, width, height, depth, border, imageSize, data);
  } else {
    GLctx.compressedTexImage3D(target, level, internalFormat, width, height, depth, border, (growMemViews(), 
    HEAPU8), data, imageSize);
  }
};

var _emscripten_glCompressedTexImage3D = _glCompressedTexImage3D;

/** @suppress {duplicate } */ var _glCompressedTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, imageSize, data) => {
  if (GL.currentContext.version >= 2) {
    if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
      GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data);
      return;
    }
    GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, (growMemViews(), 
    HEAPU8), data, imageSize);
    return;
  }
  GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, (growMemViews(), 
  HEAPU8).subarray((data), data + imageSize));
};

var _emscripten_glCompressedTexSubImage2D = _glCompressedTexSubImage2D;

/** @suppress {duplicate } */ var _glCompressedTexSubImage3D = (target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data) => {
  if (GLctx.currentPixelUnpackBufferBinding) {
    GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data);
  } else {
    GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, (growMemViews(), 
    HEAPU8), data, imageSize);
  }
};

var _emscripten_glCompressedTexSubImage3D = _glCompressedTexSubImage3D;

/** @suppress {duplicate } */ var _glCopyBufferSubData = (x0, x1, x2, x3, x4) => GLctx.copyBufferSubData(x0, x1, x2, x3, x4);

var _emscripten_glCopyBufferSubData = _glCopyBufferSubData;

/** @suppress {duplicate } */ var _glCopyTexImage2D = (x0, x1, x2, x3, x4, x5, x6, x7) => GLctx.copyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7);

var _emscripten_glCopyTexImage2D = _glCopyTexImage2D;

/** @suppress {duplicate } */ var _glCopyTexSubImage2D = (x0, x1, x2, x3, x4, x5, x6, x7) => GLctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7);

var _emscripten_glCopyTexSubImage2D = _glCopyTexSubImage2D;

/** @suppress {duplicate } */ var _glCopyTexSubImage3D = (x0, x1, x2, x3, x4, x5, x6, x7, x8) => GLctx.copyTexSubImage3D(x0, x1, x2, x3, x4, x5, x6, x7, x8);

var _emscripten_glCopyTexSubImage3D = _glCopyTexSubImage3D;

/** @suppress {duplicate } */ var _glCreateProgram = () => {
  var id = GL.getNewId(GL.programs);
  var program = GLctx.createProgram();
  // Store additional information needed for each shader program:
  program.name = id;
  // Lazy cache results of
  // glGetProgramiv(GL_ACTIVE_UNIFORM_MAX_LENGTH/GL_ACTIVE_ATTRIBUTE_MAX_LENGTH/GL_ACTIVE_UNIFORM_BLOCK_MAX_NAME_LENGTH)
  program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
  program.uniformIdCounter = 1;
  GL.programs[id] = program;
  return id;
};

var _emscripten_glCreateProgram = _glCreateProgram;

/** @suppress {duplicate } */ var _glCreateShader = shaderType => {
  var id = GL.getNewId(GL.shaders);
  GL.shaders[id] = GLctx.createShader(shaderType);
  return id;
};

var _emscripten_glCreateShader = _glCreateShader;

/** @suppress {duplicate } */ var _glCullFace = x0 => GLctx.cullFace(x0);

var _emscripten_glCullFace = _glCullFace;

/** @suppress {duplicate } */ var _glDeleteBuffers = (n, buffers) => {
  for (var i = 0; i < n; i++) {
    var id = (growMemViews(), HEAP32)[(((buffers) + (i * 4)) >> 2)];
    var buffer = GL.buffers[id];
    // From spec: "glDeleteBuffers silently ignores 0's and names that do not
    // correspond to existing buffer objects."
    if (!buffer) continue;
    GLctx.deleteBuffer(buffer);
    buffer.name = 0;
    GL.buffers[id] = null;
    if (id == GLctx.currentArrayBufferBinding) GLctx.currentArrayBufferBinding = 0;
    if (id == GLctx.currentElementArrayBufferBinding) GLctx.currentElementArrayBufferBinding = 0;
    if (id == GLctx.currentPixelPackBufferBinding) GLctx.currentPixelPackBufferBinding = 0;
    if (id == GLctx.currentPixelUnpackBufferBinding) GLctx.currentPixelUnpackBufferBinding = 0;
  }
};

var _emscripten_glDeleteBuffers = _glDeleteBuffers;

/** @suppress {duplicate } */ var _glDeleteFramebuffers = (n, framebuffers) => {
  for (var i = 0; i < n; ++i) {
    var id = (growMemViews(), HEAP32)[(((framebuffers) + (i * 4)) >> 2)];
    var framebuffer = GL.framebuffers[id];
    if (!framebuffer) continue;
    // GL spec: "glDeleteFramebuffers silently ignores 0s and names that do not correspond to existing framebuffer objects".
    GLctx.deleteFramebuffer(framebuffer);
    framebuffer.name = 0;
    GL.framebuffers[id] = null;
  }
};

var _emscripten_glDeleteFramebuffers = _glDeleteFramebuffers;

/** @suppress {duplicate } */ var _glDeleteProgram = id => {
  if (!id) return;
  var program = GL.programs[id];
  if (!program) {
    // glDeleteProgram actually signals an error when deleting a nonexisting
    // object, unlike some other GL delete functions.
    GL.recordError(1281);
    return;
  }
  GLctx.deleteProgram(program);
  program.name = 0;
  GL.programs[id] = null;
};

var _emscripten_glDeleteProgram = _glDeleteProgram;

/** @suppress {duplicate } */ var _glDeleteQueries = (n, ids) => {
  for (var i = 0; i < n; i++) {
    var id = (growMemViews(), HEAP32)[(((ids) + (i * 4)) >> 2)];
    var query = GL.queries[id];
    if (!query) continue;
    // GL spec: "unused names in ids are ignored, as is the name zero."
    GLctx.deleteQuery(query);
    GL.queries[id] = null;
  }
};

var _emscripten_glDeleteQueries = _glDeleteQueries;

/** @suppress {duplicate } */ var _glDeleteQueriesEXT = (n, ids) => {
  for (var i = 0; i < n; i++) {
    var id = (growMemViews(), HEAP32)[(((ids) + (i * 4)) >> 2)];
    var query = GL.queries[id];
    if (!query) continue;
    // GL spec: "unused names in ids are ignored, as is the name zero."
    GLctx.disjointTimerQueryExt["deleteQueryEXT"](query);
    GL.queries[id] = null;
  }
};

var _emscripten_glDeleteQueriesEXT = _glDeleteQueriesEXT;

/** @suppress {duplicate } */ var _glDeleteRenderbuffers = (n, renderbuffers) => {
  for (var i = 0; i < n; i++) {
    var id = (growMemViews(), HEAP32)[(((renderbuffers) + (i * 4)) >> 2)];
    var renderbuffer = GL.renderbuffers[id];
    if (!renderbuffer) continue;
    // GL spec: "glDeleteRenderbuffers silently ignores 0s and names that do not correspond to existing renderbuffer objects".
    GLctx.deleteRenderbuffer(renderbuffer);
    renderbuffer.name = 0;
    GL.renderbuffers[id] = null;
  }
};

var _emscripten_glDeleteRenderbuffers = _glDeleteRenderbuffers;

/** @suppress {duplicate } */ var _glDeleteSamplers = (n, samplers) => {
  for (var i = 0; i < n; i++) {
    var id = (growMemViews(), HEAP32)[(((samplers) + (i * 4)) >> 2)];
    var sampler = GL.samplers[id];
    if (!sampler) continue;
    GLctx.deleteSampler(sampler);
    sampler.name = 0;
    GL.samplers[id] = null;
  }
};

var _emscripten_glDeleteSamplers = _glDeleteSamplers;

/** @suppress {duplicate } */ var _glDeleteShader = id => {
  if (!id) return;
  var shader = GL.shaders[id];
  if (!shader) {
    // glDeleteShader actually signals an error when deleting a nonexisting
    // object, unlike some other GL delete functions.
    GL.recordError(1281);
    return;
  }
  GLctx.deleteShader(shader);
  GL.shaders[id] = null;
};

var _emscripten_glDeleteShader = _glDeleteShader;

/** @suppress {duplicate } */ var _glDeleteSync = id => {
  if (!id) return;
  var sync = GL.syncs[id];
  if (!sync) {
    // glDeleteSync signals an error when deleting a nonexisting object, unlike some other GL delete functions.
    GL.recordError(1281);
    return;
  }
  GLctx.deleteSync(sync);
  sync.name = 0;
  GL.syncs[id] = null;
};

var _emscripten_glDeleteSync = _glDeleteSync;

/** @suppress {duplicate } */ var _glDeleteTextures = (n, textures) => {
  for (var i = 0; i < n; i++) {
    var id = (growMemViews(), HEAP32)[(((textures) + (i * 4)) >> 2)];
    var texture = GL.textures[id];
    // GL spec: "glDeleteTextures silently ignores 0s and names that do not
    // correspond to existing textures".
    if (!texture) continue;
    GLctx.deleteTexture(texture);
    texture.name = 0;
    GL.textures[id] = null;
  }
};

var _emscripten_glDeleteTextures = _glDeleteTextures;

/** @suppress {duplicate } */ var _glDeleteTransformFeedbacks = (n, ids) => {
  for (var i = 0; i < n; i++) {
    var id = (growMemViews(), HEAP32)[(((ids) + (i * 4)) >> 2)];
    var transformFeedback = GL.transformFeedbacks[id];
    if (!transformFeedback) continue;
    // GL spec: "unused names in ids are ignored, as is the name zero."
    GLctx.deleteTransformFeedback(transformFeedback);
    transformFeedback.name = 0;
    GL.transformFeedbacks[id] = null;
  }
};

var _emscripten_glDeleteTransformFeedbacks = _glDeleteTransformFeedbacks;

/** @suppress {duplicate } */ var _glDeleteVertexArrays = (n, vaos) => {
  for (var i = 0; i < n; i++) {
    var id = (growMemViews(), HEAP32)[(((vaos) + (i * 4)) >> 2)];
    GLctx.deleteVertexArray(GL.vaos[id]);
    GL.vaos[id] = null;
  }
};

var _emscripten_glDeleteVertexArrays = _glDeleteVertexArrays;

/** @suppress {duplicate } */ var _glDeleteVertexArraysOES = _glDeleteVertexArrays;

var _emscripten_glDeleteVertexArraysOES = _glDeleteVertexArraysOES;

/** @suppress {duplicate } */ var _glDepthFunc = x0 => GLctx.depthFunc(x0);

var _emscripten_glDepthFunc = _glDepthFunc;

/** @suppress {duplicate } */ var _glDepthMask = flag => {
  GLctx.depthMask(!!flag);
};

var _emscripten_glDepthMask = _glDepthMask;

/** @suppress {duplicate } */ var _glDepthRangef = (x0, x1) => GLctx.depthRange(x0, x1);

var _emscripten_glDepthRangef = _glDepthRangef;

/** @suppress {duplicate } */ var _glDetachShader = (program, shader) => {
  GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
};

var _emscripten_glDetachShader = _glDetachShader;

/** @suppress {duplicate } */ var _glDisable = x0 => GLctx.disable(x0);

var _emscripten_glDisable = _glDisable;

/** @suppress {duplicate } */ var _glDisableVertexAttribArray = index => {
  var cb = GL.currentContext.clientBuffers[index];
  cb.enabled = false;
  GLctx.disableVertexAttribArray(index);
};

var _emscripten_glDisableVertexAttribArray = _glDisableVertexAttribArray;

/** @suppress {duplicate } */ var _glDrawArrays = (mode, first, count) => {
  // bind any client-side buffers
  GL.preDrawHandleClientVertexAttribBindings(first + count);
  GLctx.drawArrays(mode, first, count);
  GL.postDrawHandleClientVertexAttribBindings();
};

var _emscripten_glDrawArrays = _glDrawArrays;

/** @suppress {duplicate } */ var _glDrawArraysInstanced = (mode, first, count, primcount) => {
  GLctx.drawArraysInstanced(mode, first, count, primcount);
};

var _emscripten_glDrawArraysInstanced = _glDrawArraysInstanced;

/** @suppress {duplicate } */ var _glDrawArraysInstancedANGLE = _glDrawArraysInstanced;

var _emscripten_glDrawArraysInstancedANGLE = _glDrawArraysInstancedANGLE;

/** @suppress {duplicate } */ var _glDrawArraysInstancedARB = _glDrawArraysInstanced;

var _emscripten_glDrawArraysInstancedARB = _glDrawArraysInstancedARB;

/** @suppress {duplicate } */ var _glDrawArraysInstancedEXT = _glDrawArraysInstanced;

var _emscripten_glDrawArraysInstancedEXT = _glDrawArraysInstancedEXT;

/** @suppress {duplicate } */ var _glDrawArraysInstancedNV = _glDrawArraysInstanced;

var _emscripten_glDrawArraysInstancedNV = _glDrawArraysInstancedNV;

var tempFixedLengthArray = [];

/** @suppress {duplicate } */ var _glDrawBuffers = (n, bufs) => {
  var bufArray = tempFixedLengthArray[n];
  for (var i = 0; i < n; i++) {
    bufArray[i] = (growMemViews(), HEAP32)[(((bufs) + (i * 4)) >> 2)];
  }
  GLctx.drawBuffers(bufArray);
};

var _emscripten_glDrawBuffers = _glDrawBuffers;

/** @suppress {duplicate } */ var _glDrawBuffersEXT = _glDrawBuffers;

var _emscripten_glDrawBuffersEXT = _glDrawBuffersEXT;

/** @suppress {duplicate } */ var _glDrawBuffersWEBGL = _glDrawBuffers;

var _emscripten_glDrawBuffersWEBGL = _glDrawBuffersWEBGL;

/** @suppress {duplicate } */ var _glDrawElements = (mode, count, type, indices) => {
  var buf;
  var vertexes = 0;
  if (!GLctx.currentElementArrayBufferBinding) {
    var size = GL.calcBufLength(1, type, 0, count);
    buf = GL.getTempIndexBuffer(size);
    GLctx.bindBuffer(34963, buf);
    GLctx.bufferSubData(34963, 0, (growMemViews(), HEAPU8).subarray(indices, indices + size));
    // Calculating vertex count if shader's attribute data is on client side
    if (count > 0) {
      for (var i = 0; i < GL.currentContext.maxVertexAttribs; ++i) {
        var cb = GL.currentContext.clientBuffers[i];
        if (cb.clientside && cb.enabled) {
          let arrayClass;
          switch (type) {
           case 5121:
            arrayClass = Uint8Array;
            break;

           case 5123:
            arrayClass = Uint16Array;
            break;

           case 5125:
            arrayClass = Uint32Array;
            break;

           default:
            GL.recordError(1282);
            return;
          }
          vertexes = new arrayClass((growMemViews(), HEAPU8).buffer, indices, count).reduce((max, current) => Math.max(max, current)) + 1;
          break;
        }
      }
    }
    // the index is now 0
    indices = 0;
  }
  // bind any client-side buffers
  GL.preDrawHandleClientVertexAttribBindings(vertexes);
  GLctx.drawElements(mode, count, type, indices);
  GL.postDrawHandleClientVertexAttribBindings(count);
  if (!GLctx.currentElementArrayBufferBinding) {
    GLctx.bindBuffer(34963, null);
  }
};

var _emscripten_glDrawElements = _glDrawElements;

/** @suppress {duplicate } */ var _glDrawElementsInstanced = (mode, count, type, indices, primcount) => {
  GLctx.drawElementsInstanced(mode, count, type, indices, primcount);
};

var _emscripten_glDrawElementsInstanced = _glDrawElementsInstanced;

/** @suppress {duplicate } */ var _glDrawElementsInstancedANGLE = _glDrawElementsInstanced;

var _emscripten_glDrawElementsInstancedANGLE = _glDrawElementsInstancedANGLE;

/** @suppress {duplicate } */ var _glDrawElementsInstancedARB = _glDrawElementsInstanced;

var _emscripten_glDrawElementsInstancedARB = _glDrawElementsInstancedARB;

/** @suppress {duplicate } */ var _glDrawElementsInstancedEXT = _glDrawElementsInstanced;

var _emscripten_glDrawElementsInstancedEXT = _glDrawElementsInstancedEXT;

/** @suppress {duplicate } */ var _glDrawElementsInstancedNV = _glDrawElementsInstanced;

var _emscripten_glDrawElementsInstancedNV = _glDrawElementsInstancedNV;

/** @suppress {duplicate } */ var _glDrawRangeElements = (mode, start, end, count, type, indices) => {
  // TODO: This should be a trivial pass-though function registered at the bottom of this page as
  // glFuncs[6][1] += ' drawRangeElements';
  // but due to https://bugzilla.mozilla.org/show_bug.cgi?id=1202427,
  // we work around by ignoring the range.
  _glDrawElements(mode, count, type, indices);
};

var _emscripten_glDrawRangeElements = _glDrawRangeElements;

/** @suppress {duplicate } */ var _glEnable = x0 => GLctx.enable(x0);

var _emscripten_glEnable = _glEnable;

/** @suppress {duplicate } */ var _glEnableVertexAttribArray = index => {
  var cb = GL.currentContext.clientBuffers[index];
  cb.enabled = true;
  GLctx.enableVertexAttribArray(index);
};

var _emscripten_glEnableVertexAttribArray = _glEnableVertexAttribArray;

/** @suppress {duplicate } */ var _glEndQuery = x0 => GLctx.endQuery(x0);

var _emscripten_glEndQuery = _glEndQuery;

/** @suppress {duplicate } */ var _glEndQueryEXT = target => {
  GLctx.disjointTimerQueryExt["endQueryEXT"](target);
};

var _emscripten_glEndQueryEXT = _glEndQueryEXT;

/** @suppress {duplicate } */ var _glEndTransformFeedback = () => GLctx.endTransformFeedback();

var _emscripten_glEndTransformFeedback = _glEndTransformFeedback;

/** @suppress {duplicate } */ var _glFenceSync = (condition, flags) => {
  var sync = GLctx.fenceSync(condition, flags);
  if (sync) {
    var id = GL.getNewId(GL.syncs);
    sync.name = id;
    GL.syncs[id] = sync;
    return id;
  }
  return 0;
};

var _emscripten_glFenceSync = _glFenceSync;

/** @suppress {duplicate } */ var _glFinish = () => GLctx.finish();

var _emscripten_glFinish = _glFinish;

/** @suppress {duplicate } */ var _glFlush = () => GLctx.flush();

var _emscripten_glFlush = _glFlush;

var emscriptenWebGLGetBufferBinding = target => {
  switch (target) {
   case 34962:
    target = 34964;
    break;

   case 34963:
    target = 34965;
    break;

   case 35051:
    target = 35053;
    break;

   case 35052:
    target = 35055;
    break;

   case 35982:
    target = 35983;
    break;

   case 36662:
    target = 36662;
    break;

   case 36663:
    target = 36663;
    break;

   case 35345:
    target = 35368;
    break;
  }
  var buffer = GLctx.getParameter(target);
  if (buffer) return buffer.name | 0; else return 0;
};

var emscriptenWebGLValidateMapBufferTarget = target => {
  switch (target) {
   case 34962:
   // GL_ARRAY_BUFFER
    case 34963:
   // GL_ELEMENT_ARRAY_BUFFER
    case 36662:
   // GL_COPY_READ_BUFFER
    case 36663:
   // GL_COPY_WRITE_BUFFER
    case 35051:
   // GL_PIXEL_PACK_BUFFER
    case 35052:
   // GL_PIXEL_UNPACK_BUFFER
    case 35882:
   // GL_TEXTURE_BUFFER
    case 35982:
   // GL_TRANSFORM_FEEDBACK_BUFFER
    case 35345:
    // GL_UNIFORM_BUFFER
    return true;

   default:
    return false;
  }
};

/** @suppress {duplicate } */ var _glFlushMappedBufferRange = (target, offset, length) => {
  if (!emscriptenWebGLValidateMapBufferTarget(target)) {
    GL.recordError(1280);
    err("GL_INVALID_ENUM in glFlushMappedBufferRange");
    return;
  }
  var mapping = GL.mappedBuffers[emscriptenWebGLGetBufferBinding(target)];
  if (!mapping) {
    GL.recordError(1282);
    err("buffer was never mapped in glFlushMappedBufferRange");
    return;
  }
  if (!(mapping.access & 16)) {
    GL.recordError(1282);
    err("buffer was not mapped with GL_MAP_FLUSH_EXPLICIT_BIT in glFlushMappedBufferRange");
    return;
  }
  if (offset < 0 || length < 0 || offset + length > mapping.length) {
    GL.recordError(1281);
    err("invalid range in glFlushMappedBufferRange");
    return;
  }
  GLctx.bufferSubData(target, mapping.offset, (growMemViews(), HEAPU8).subarray(mapping.mem + offset, mapping.mem + offset + length));
};

var _emscripten_glFlushMappedBufferRange = _glFlushMappedBufferRange;

/** @suppress {duplicate } */ var _glFramebufferRenderbuffer = (target, attachment, renderbuffertarget, renderbuffer) => {
  GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
};

var _emscripten_glFramebufferRenderbuffer = _glFramebufferRenderbuffer;

/** @suppress {duplicate } */ var _glFramebufferTexture2D = (target, attachment, textarget, texture, level) => {
  GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
};

var _emscripten_glFramebufferTexture2D = _glFramebufferTexture2D;

/** @suppress {duplicate } */ var _glFramebufferTextureLayer = (target, attachment, texture, level, layer) => {
  GLctx.framebufferTextureLayer(target, attachment, GL.textures[texture], level, layer);
};

var _emscripten_glFramebufferTextureLayer = _glFramebufferTextureLayer;

/** @suppress {duplicate } */ var _glFrontFace = x0 => GLctx.frontFace(x0);

var _emscripten_glFrontFace = _glFrontFace;

/** @suppress {duplicate } */ var _glGenBuffers = (n, buffers) => {
  GL.genObject(n, buffers, "createBuffer", GL.buffers);
};

var _emscripten_glGenBuffers = _glGenBuffers;

/** @suppress {duplicate } */ var _glGenFramebuffers = (n, ids) => {
  GL.genObject(n, ids, "createFramebuffer", GL.framebuffers);
};

var _emscripten_glGenFramebuffers = _glGenFramebuffers;

/** @suppress {duplicate } */ var _glGenQueries = (n, ids) => {
  GL.genObject(n, ids, "createQuery", GL.queries);
};

var _emscripten_glGenQueries = _glGenQueries;

/** @suppress {duplicate } */ var _glGenQueriesEXT = (n, ids) => {
  for (var i = 0; i < n; i++) {
    var query = GLctx.disjointTimerQueryExt["createQueryEXT"]();
    if (!query) {
      GL.recordError(1282);
      while (i < n) (growMemViews(), HEAP32)[(((ids) + (i++ * 4)) >> 2)] = 0;
      return;
    }
    var id = GL.getNewId(GL.queries);
    query.name = id;
    GL.queries[id] = query;
    (growMemViews(), HEAP32)[(((ids) + (i * 4)) >> 2)] = id;
  }
};

var _emscripten_glGenQueriesEXT = _glGenQueriesEXT;

/** @suppress {duplicate } */ var _glGenRenderbuffers = (n, renderbuffers) => {
  GL.genObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
};

var _emscripten_glGenRenderbuffers = _glGenRenderbuffers;

/** @suppress {duplicate } */ var _glGenSamplers = (n, samplers) => {
  GL.genObject(n, samplers, "createSampler", GL.samplers);
};

var _emscripten_glGenSamplers = _glGenSamplers;

/** @suppress {duplicate } */ var _glGenTextures = (n, textures) => {
  GL.genObject(n, textures, "createTexture", GL.textures);
};

var _emscripten_glGenTextures = _glGenTextures;

/** @suppress {duplicate } */ var _glGenTransformFeedbacks = (n, ids) => {
  GL.genObject(n, ids, "createTransformFeedback", GL.transformFeedbacks);
};

var _emscripten_glGenTransformFeedbacks = _glGenTransformFeedbacks;

/** @suppress {duplicate } */ var _glGenVertexArrays = (n, arrays) => {
  GL.genObject(n, arrays, "createVertexArray", GL.vaos);
};

var _emscripten_glGenVertexArrays = _glGenVertexArrays;

/** @suppress {duplicate } */ var _glGenVertexArraysOES = _glGenVertexArrays;

var _emscripten_glGenVertexArraysOES = _glGenVertexArraysOES;

/** @suppress {duplicate } */ var _glGenerateMipmap = x0 => GLctx.generateMipmap(x0);

var _emscripten_glGenerateMipmap = _glGenerateMipmap;

var __glGetActiveAttribOrUniform = (funcName, program, index, bufSize, length, size, type, name) => {
  program = GL.programs[program];
  var info = GLctx[funcName](program, index);
  if (info) {
    // If an error occurs, nothing will be written to length, size and type and name.
    var numBytesWrittenExclNull = name && stringToUTF8(info.name, name, bufSize);
    if (length) (growMemViews(), HEAP32)[((length) >> 2)] = numBytesWrittenExclNull;
    if (size) (growMemViews(), HEAP32)[((size) >> 2)] = info.size;
    if (type) (growMemViews(), HEAP32)[((type) >> 2)] = info.type;
  }
};

/** @suppress {duplicate } */ var _glGetActiveAttrib = (program, index, bufSize, length, size, type, name) => __glGetActiveAttribOrUniform("getActiveAttrib", program, index, bufSize, length, size, type, name);

var _emscripten_glGetActiveAttrib = _glGetActiveAttrib;

/** @suppress {duplicate } */ var _glGetActiveUniform = (program, index, bufSize, length, size, type, name) => __glGetActiveAttribOrUniform("getActiveUniform", program, index, bufSize, length, size, type, name);

var _emscripten_glGetActiveUniform = _glGetActiveUniform;

/** @suppress {duplicate } */ var _glGetActiveUniformBlockName = (program, uniformBlockIndex, bufSize, length, uniformBlockName) => {
  program = GL.programs[program];
  var result = GLctx.getActiveUniformBlockName(program, uniformBlockIndex);
  if (!result) return;
  // If an error occurs, nothing will be written to uniformBlockName or length.
  if (uniformBlockName && bufSize > 0) {
    var numBytesWrittenExclNull = stringToUTF8(result, uniformBlockName, bufSize);
    if (length) (growMemViews(), HEAP32)[((length) >> 2)] = numBytesWrittenExclNull;
  } else {
    if (length) (growMemViews(), HEAP32)[((length) >> 2)] = 0;
  }
};

var _emscripten_glGetActiveUniformBlockName = _glGetActiveUniformBlockName;

/** @suppress {duplicate } */ var _glGetActiveUniformBlockiv = (program, uniformBlockIndex, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if params == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  program = GL.programs[program];
  if (pname == 35393) {
    var name = GLctx.getActiveUniformBlockName(program, uniformBlockIndex);
    (growMemViews(), HEAP32)[((params) >> 2)] = name.length + 1;
    return;
  }
  var result = GLctx.getActiveUniformBlockParameter(program, uniformBlockIndex, pname);
  if (result === null) return;
  // If an error occurs, nothing should be written to params.
  if (pname == 35395) {
    for (var i = 0; i < result.length; i++) {
      (growMemViews(), HEAP32)[(((params) + (i * 4)) >> 2)] = result[i];
    }
  } else {
    (growMemViews(), HEAP32)[((params) >> 2)] = result;
  }
};

var _emscripten_glGetActiveUniformBlockiv = _glGetActiveUniformBlockiv;

/** @suppress {duplicate } */ var _glGetActiveUniformsiv = (program, uniformCount, uniformIndices, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if params == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  if (uniformCount > 0 && uniformIndices == 0) {
    GL.recordError(1281);
    return;
  }
  program = GL.programs[program];
  var ids = [];
  for (var i = 0; i < uniformCount; i++) {
    ids.push((growMemViews(), HEAP32)[(((uniformIndices) + (i * 4)) >> 2)]);
  }
  var result = GLctx.getActiveUniforms(program, ids, pname);
  if (!result) return;
  // GL spec: If an error is generated, nothing is written out to params.
  var len = result.length;
  for (var i = 0; i < len; i++) {
    (growMemViews(), HEAP32)[(((params) + (i * 4)) >> 2)] = result[i];
  }
};

var _emscripten_glGetActiveUniformsiv = _glGetActiveUniformsiv;

/** @suppress {duplicate } */ var _glGetAttachedShaders = (program, maxCount, count, shaders) => {
  var result = GLctx.getAttachedShaders(GL.programs[program]);
  var len = result.length;
  if (len > maxCount) {
    len = maxCount;
  }
  (growMemViews(), HEAP32)[((count) >> 2)] = len;
  for (var i = 0; i < len; ++i) {
    var id = GL.shaders.indexOf(result[i]);
    (growMemViews(), HEAP32)[(((shaders) + (i * 4)) >> 2)] = id;
  }
};

var _emscripten_glGetAttachedShaders = _glGetAttachedShaders;

/** @suppress {duplicate } */ var _glGetAttribLocation = (program, name) => GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));

var _emscripten_glGetAttribLocation = _glGetAttribLocation;

var readI53FromI64 = ptr => (growMemViews(), HEAPU32)[((ptr) >> 2)] + (growMemViews(), 
HEAP32)[(((ptr) + (4)) >> 2)] * 4294967296;

var readI53FromU64 = ptr => (growMemViews(), HEAPU32)[((ptr) >> 2)] + (growMemViews(), 
HEAPU32)[(((ptr) + (4)) >> 2)] * 4294967296;

var writeI53ToI64 = (ptr, num) => {
  (growMemViews(), HEAPU32)[((ptr) >> 2)] = num;
  var lower = (growMemViews(), HEAPU32)[((ptr) >> 2)];
  (growMemViews(), HEAPU32)[(((ptr) + (4)) >> 2)] = (num - lower) / 4294967296;
  var deserialized = (num >= 0) ? readI53FromU64(ptr) : readI53FromI64(ptr);
  var offset = ((ptr) >> 2);
  if (deserialized != num) warnOnce(`writeI53ToI64() out of range: serialized JS Number ${num} to Wasm heap as bytes lo=${ptrToString((growMemViews(), 
  HEAPU32)[offset])}, hi=${ptrToString((growMemViews(), HEAPU32)[offset + 1])}, which deserializes back to ${deserialized} instead!`);
};

var webglGetExtensions = () => {
  var exts = getEmscriptenSupportedExtensions(GLctx);
  exts = exts.concat(exts.map(e => "GL_" + e));
  return exts;
};

var emscriptenWebGLGet = (name_, p, type) => {
  // Guard against user passing a null pointer.
  // Note that GLES2 spec does not say anything about how passing a null
  // pointer should be treated.  Testing on desktop core GL 3, the application
  // crashes on glGetIntegerv to a null pointer, but better to report an error
  // instead of doing anything random.
  if (!p) {
    GL.recordError(1281);
    return;
  }
  var ret = undefined;
  switch (name_) {
   // Handle a few trivial GLES values
    case 36346:
    // GL_SHADER_COMPILER
    ret = 1;
    break;

   case 36344:
    // GL_SHADER_BINARY_FORMATS
    if (type != 0 && type != 1) {
      GL.recordError(1280);
    }
    // Do not write anything to the out pointer, since no binary formats are
    // supported.
    return;

   case 34814:
   // GL_NUM_PROGRAM_BINARY_FORMATS
    case 36345:
    // GL_NUM_SHADER_BINARY_FORMATS
    ret = 0;
    break;

   case 34466:
    // GL_NUM_COMPRESSED_TEXTURE_FORMATS
    // WebGL doesn't have GL_NUM_COMPRESSED_TEXTURE_FORMATS (it's obsolete
    // since GL_COMPRESSED_TEXTURE_FORMATS returns a JS array that can be
    // queried for length), so implement it ourselves to allow C++ GLES2
    // code get the length.
    var formats = GLctx.getParameter(34467);
    ret = formats ? formats.length : 0;
    break;

   case 33309:
    // GL_NUM_EXTENSIONS
    if (GL.currentContext.version < 2) {
      // Calling GLES3/WebGL2 function with a GLES2/WebGL1 context
      GL.recordError(1282);
      return;
    }
    ret = webglGetExtensions().length;
    break;

   case 33307:
   // GL_MAJOR_VERSION
    case 33308:
    // GL_MINOR_VERSION
    if (GL.currentContext.version < 2) {
      GL.recordError(1280);
      // GL_INVALID_ENUM
      return;
    }
    ret = name_ == 33307 ? 3 : 0;
    // return version 3.0
    break;
  }
  if (ret === undefined) {
    var result = GLctx.getParameter(name_);
    switch (typeof result) {
     case "number":
      ret = result;
      break;

     case "boolean":
      ret = result ? 1 : 0;
      break;

     case "string":
      GL.recordError(1280);
      // GL_INVALID_ENUM
      return;

     case "object":
      if (result === null) {
        // null is a valid result for some (e.g., which buffer is bound -
        // perhaps nothing is bound), but otherwise can mean an invalid
        // name_, which we need to report as an error
        switch (name_) {
         case 34964:
         // ARRAY_BUFFER_BINDING
          case 35725:
         // CURRENT_PROGRAM
          case 34965:
         // ELEMENT_ARRAY_BUFFER_BINDING
          case 36006:
         // FRAMEBUFFER_BINDING or DRAW_FRAMEBUFFER_BINDING
          case 36007:
         // RENDERBUFFER_BINDING
          case 32873:
         // TEXTURE_BINDING_2D
          case 34229:
         // WebGL 2 GL_VERTEX_ARRAY_BINDING, or WebGL 1 extension OES_vertex_array_object GL_VERTEX_ARRAY_BINDING_OES
          case 36662:
         // COPY_READ_BUFFER_BINDING or COPY_READ_BUFFER
          case 36663:
         // COPY_WRITE_BUFFER_BINDING or COPY_WRITE_BUFFER
          case 35053:
         // PIXEL_PACK_BUFFER_BINDING
          case 35055:
         // PIXEL_UNPACK_BUFFER_BINDING
          case 36010:
         // READ_FRAMEBUFFER_BINDING
          case 35097:
         // SAMPLER_BINDING
          case 35869:
         // TEXTURE_BINDING_2D_ARRAY
          case 32874:
         // TEXTURE_BINDING_3D
          case 36389:
         // TRANSFORM_FEEDBACK_BINDING
          case 35983:
         // TRANSFORM_FEEDBACK_BUFFER_BINDING
          case 35368:
         // UNIFORM_BUFFER_BINDING
          case 34068:
          {
            // TEXTURE_BINDING_CUBE_MAP
            ret = 0;
            break;
          }

         default:
          {
            GL.recordError(1280);
            // GL_INVALID_ENUM
            return;
          }
        }
      } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
        for (var i = 0; i < result.length; ++i) {
          switch (type) {
           case 0:
            (growMemViews(), HEAP32)[(((p) + (i * 4)) >> 2)] = result[i];
            break;

           case 2:
            (growMemViews(), HEAPF32)[(((p) + (i * 4)) >> 2)] = result[i];
            break;

           case 4:
            (growMemViews(), HEAP8)[(p) + (i)] = result[i] ? 1 : 0;
            break;
          }
        }
        return;
      } else {
        try {
          ret = result.name | 0;
        } catch (e) {
          GL.recordError(1280);
          // GL_INVALID_ENUM
          err(`GL_INVALID_ENUM in glGet${type}v: Unknown object returned from WebGL getParameter(${name_})! (error: ${e})`);
          return;
        }
      }
      break;

     default:
      GL.recordError(1280);
      // GL_INVALID_ENUM
      err(`GL_INVALID_ENUM in glGet${type}v: Native code calling glGet${type}v(${name_}) and it returns ${result} of type ${typeof (result)}!`);
      return;
    }
  }
  switch (type) {
   case 1:
    writeI53ToI64(p, ret);
    break;

   case 0:
    (growMemViews(), HEAP32)[((p) >> 2)] = ret;
    break;

   case 2:
    (growMemViews(), HEAPF32)[((p) >> 2)] = ret;
    break;

   case 4:
    (growMemViews(), HEAP8)[p] = ret ? 1 : 0;
    break;
  }
};

/** @suppress {duplicate } */ var _glGetBooleanv = (name_, p) => emscriptenWebGLGet(name_, p, 4);

var _emscripten_glGetBooleanv = _glGetBooleanv;

/** @suppress {duplicate } */ var _glGetBufferParameteri64v = (target, value, data) => {
  if (!data) {
    // GLES2 specification does not specify how to behave if data is a null pointer. Since calling this function does not make sense
    // if data == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  writeI53ToI64(data, GLctx.getBufferParameter(target, value));
};

var _emscripten_glGetBufferParameteri64v = _glGetBufferParameteri64v;

/** @suppress {duplicate } */ var _glGetBufferParameteriv = (target, value, data) => {
  if (!data) {
    // GLES2 specification does not specify how to behave if data is a null
    // pointer. Since calling this function does not make sense if data ==
    // null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  (growMemViews(), HEAP32)[((data) >> 2)] = GLctx.getBufferParameter(target, value);
};

var _emscripten_glGetBufferParameteriv = _glGetBufferParameteriv;

/** @suppress {duplicate } */ var _glGetBufferPointerv = (target, pname, params) => {
  if (pname == 35005) {
    var ptr = 0;
    var mappedBuffer = GL.mappedBuffers[emscriptenWebGLGetBufferBinding(target)];
    if (mappedBuffer) {
      ptr = mappedBuffer.mem;
    }
    (growMemViews(), HEAP32)[((params) >> 2)] = ptr;
  } else {
    GL.recordError(1280);
    err("GL_INVALID_ENUM in glGetBufferPointerv");
  }
};

var _emscripten_glGetBufferPointerv = _glGetBufferPointerv;

/** @suppress {duplicate } */ var _glGetError = () => {
  var error = GLctx.getError() || GL.lastError;
  GL.lastError = 0;
  return error;
};

var _emscripten_glGetError = _glGetError;

/** @suppress {duplicate } */ var _glGetFloatv = (name_, p) => emscriptenWebGLGet(name_, p, 2);

var _emscripten_glGetFloatv = _glGetFloatv;

/** @suppress {duplicate } */ var _glGetFragDataLocation = (program, name) => GLctx.getFragDataLocation(GL.programs[program], UTF8ToString(name));

var _emscripten_glGetFragDataLocation = _glGetFragDataLocation;

/** @suppress {duplicate } */ var _glGetFramebufferAttachmentParameteriv = (target, attachment, pname, params) => {
  var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
  if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
    result = result.name | 0;
  }
  (growMemViews(), HEAP32)[((params) >> 2)] = result;
};

var _emscripten_glGetFramebufferAttachmentParameteriv = _glGetFramebufferAttachmentParameteriv;

var emscriptenWebGLGetIndexed = (target, index, data, type) => {
  if (!data) {
    // GLES2 specification does not specify how to behave if data is a null pointer. Since calling this function does not make sense
    // if data == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  var result = GLctx.getIndexedParameter(target, index);
  var ret;
  switch (typeof result) {
   case "boolean":
    ret = result ? 1 : 0;
    break;

   case "number":
    ret = result;
    break;

   case "object":
    if (result === null) {
      switch (target) {
       case 35983:
       // TRANSFORM_FEEDBACK_BUFFER_BINDING
        case 35368:
        // UNIFORM_BUFFER_BINDING
        ret = 0;
        break;

       default:
        {
          GL.recordError(1280);
          // GL_INVALID_ENUM
          return;
        }
      }
    } else if (result instanceof WebGLBuffer) {
      ret = result.name | 0;
    } else {
      GL.recordError(1280);
      // GL_INVALID_ENUM
      return;
    }
    break;

   default:
    GL.recordError(1280);
    // GL_INVALID_ENUM
    return;
  }
  switch (type) {
   case 1:
    writeI53ToI64(data, ret);
    break;

   case 0:
    (growMemViews(), HEAP32)[((data) >> 2)] = ret;
    break;

   case 2:
    (growMemViews(), HEAPF32)[((data) >> 2)] = ret;
    break;

   case 4:
    (growMemViews(), HEAP8)[data] = ret ? 1 : 0;
    break;

   default:
    throw "internal emscriptenWebGLGetIndexed() error, bad type: " + type;
  }
};

/** @suppress {duplicate } */ var _glGetInteger64i_v = (target, index, data) => emscriptenWebGLGetIndexed(target, index, data, 1);

var _emscripten_glGetInteger64i_v = _glGetInteger64i_v;

/** @suppress {duplicate } */ var _glGetInteger64v = (name_, p) => {
  emscriptenWebGLGet(name_, p, 1);
};

var _emscripten_glGetInteger64v = _glGetInteger64v;

/** @suppress {duplicate } */ var _glGetIntegeri_v = (target, index, data) => emscriptenWebGLGetIndexed(target, index, data, 0);

var _emscripten_glGetIntegeri_v = _glGetIntegeri_v;

/** @suppress {duplicate } */ var _glGetIntegerv = (name_, p) => emscriptenWebGLGet(name_, p, 0);

var _emscripten_glGetIntegerv = _glGetIntegerv;

/** @suppress {duplicate } */ var _glGetInternalformativ = (target, internalformat, pname, bufSize, params) => {
  if (bufSize < 0) {
    GL.recordError(1281);
    return;
  }
  if (!params) {
    // GLES3 specification does not specify how to behave if values is a null pointer. Since calling this function does not make sense
    // if values == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  var ret = GLctx.getInternalformatParameter(target, internalformat, pname);
  if (ret === null) return;
  for (var i = 0; i < ret.length && i < bufSize; ++i) {
    (growMemViews(), HEAP32)[(((params) + (i * 4)) >> 2)] = ret[i];
  }
};

var _emscripten_glGetInternalformativ = _glGetInternalformativ;

/** @suppress {duplicate } */ var _glGetProgramBinary = (program, bufSize, length, binaryFormat, binary) => {
  GL.recordError(1282);
};

var _emscripten_glGetProgramBinary = _glGetProgramBinary;

/** @suppress {duplicate } */ var _glGetProgramInfoLog = (program, maxLength, length, infoLog) => {
  var log = GLctx.getProgramInfoLog(GL.programs[program]);
  if (log === null) log = "(unknown error)";
  var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
  if (length) (growMemViews(), HEAP32)[((length) >> 2)] = numBytesWrittenExclNull;
};

var _emscripten_glGetProgramInfoLog = _glGetProgramInfoLog;

/** @suppress {duplicate } */ var _glGetProgramiv = (program, pname, p) => {
  if (!p) {
    // GLES2 specification does not specify how to behave if p is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  if (program >= GL.counter) {
    GL.recordError(1281);
    return;
  }
  program = GL.programs[program];
  if (pname == 35716) {
    // GL_INFO_LOG_LENGTH
    var log = GLctx.getProgramInfoLog(program);
    if (log === null) log = "(unknown error)";
    (growMemViews(), HEAP32)[((p) >> 2)] = log.length + 1;
  } else if (pname == 35719) {
    if (!program.maxUniformLength) {
      var numActiveUniforms = GLctx.getProgramParameter(program, 35718);
      for (var i = 0; i < numActiveUniforms; ++i) {
        program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1);
      }
    }
    (growMemViews(), HEAP32)[((p) >> 2)] = program.maxUniformLength;
  } else if (pname == 35722) {
    if (!program.maxAttributeLength) {
      var numActiveAttributes = GLctx.getProgramParameter(program, 35721);
      for (var i = 0; i < numActiveAttributes; ++i) {
        program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1);
      }
    }
    (growMemViews(), HEAP32)[((p) >> 2)] = program.maxAttributeLength;
  } else if (pname == 35381) {
    if (!program.maxUniformBlockNameLength) {
      var numActiveUniformBlocks = GLctx.getProgramParameter(program, 35382);
      for (var i = 0; i < numActiveUniformBlocks; ++i) {
        program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1);
      }
    }
    (growMemViews(), HEAP32)[((p) >> 2)] = program.maxUniformBlockNameLength;
  } else {
    (growMemViews(), HEAP32)[((p) >> 2)] = GLctx.getProgramParameter(program, pname);
  }
};

var _emscripten_glGetProgramiv = _glGetProgramiv;

/** @suppress {duplicate } */ var _glGetQueryObjecti64vEXT = (id, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  var query = GL.queries[id];
  var param;
  if (GL.currentContext.version < 2) {
    param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
  } else {
    param = GLctx.getQueryParameter(query, pname);
  }
  var ret;
  if (typeof param == "boolean") {
    ret = param ? 1 : 0;
  } else {
    ret = param;
  }
  writeI53ToI64(params, ret);
};

var _emscripten_glGetQueryObjecti64vEXT = _glGetQueryObjecti64vEXT;

/** @suppress {duplicate } */ var _glGetQueryObjectivEXT = (id, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  var query = GL.queries[id];
  var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
  var ret;
  if (typeof param == "boolean") {
    ret = param ? 1 : 0;
  } else {
    ret = param;
  }
  (growMemViews(), HEAP32)[((params) >> 2)] = ret;
};

var _emscripten_glGetQueryObjectivEXT = _glGetQueryObjectivEXT;

/** @suppress {duplicate } */ var _glGetQueryObjectui64vEXT = _glGetQueryObjecti64vEXT;

var _emscripten_glGetQueryObjectui64vEXT = _glGetQueryObjectui64vEXT;

/** @suppress {duplicate } */ var _glGetQueryObjectuiv = (id, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  var query = GL.queries[id];
  var param = GLctx.getQueryParameter(query, pname);
  var ret;
  if (typeof param == "boolean") {
    ret = param ? 1 : 0;
  } else {
    ret = param;
  }
  (growMemViews(), HEAP32)[((params) >> 2)] = ret;
};

var _emscripten_glGetQueryObjectuiv = _glGetQueryObjectuiv;

/** @suppress {duplicate } */ var _glGetQueryObjectuivEXT = _glGetQueryObjectivEXT;

var _emscripten_glGetQueryObjectuivEXT = _glGetQueryObjectuivEXT;

/** @suppress {duplicate } */ var _glGetQueryiv = (target, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  (growMemViews(), HEAP32)[((params) >> 2)] = GLctx.getQuery(target, pname);
};

var _emscripten_glGetQueryiv = _glGetQueryiv;

/** @suppress {duplicate } */ var _glGetQueryivEXT = (target, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  (growMemViews(), HEAP32)[((params) >> 2)] = GLctx.disjointTimerQueryExt["getQueryEXT"](target, pname);
};

var _emscripten_glGetQueryivEXT = _glGetQueryivEXT;

/** @suppress {duplicate } */ var _glGetRenderbufferParameteriv = (target, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if params == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  (growMemViews(), HEAP32)[((params) >> 2)] = GLctx.getRenderbufferParameter(target, pname);
};

var _emscripten_glGetRenderbufferParameteriv = _glGetRenderbufferParameteriv;

/** @suppress {duplicate } */ var _glGetSamplerParameterfv = (sampler, pname, params) => {
  if (!params) {
    // GLES3 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  (growMemViews(), HEAPF32)[((params) >> 2)] = GLctx.getSamplerParameter(GL.samplers[sampler], pname);
};

var _emscripten_glGetSamplerParameterfv = _glGetSamplerParameterfv;

/** @suppress {duplicate } */ var _glGetSamplerParameteriv = (sampler, pname, params) => {
  if (!params) {
    // GLES3 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  (growMemViews(), HEAP32)[((params) >> 2)] = GLctx.getSamplerParameter(GL.samplers[sampler], pname);
};

var _emscripten_glGetSamplerParameteriv = _glGetSamplerParameteriv;

/** @suppress {duplicate } */ var _glGetShaderInfoLog = (shader, maxLength, length, infoLog) => {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
  if (length) (growMemViews(), HEAP32)[((length) >> 2)] = numBytesWrittenExclNull;
};

var _emscripten_glGetShaderInfoLog = _glGetShaderInfoLog;

/** @suppress {duplicate } */ var _glGetShaderPrecisionFormat = (shaderType, precisionType, range, precision) => {
  var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
  (growMemViews(), HEAP32)[((range) >> 2)] = result.rangeMin;
  (growMemViews(), HEAP32)[(((range) + (4)) >> 2)] = result.rangeMax;
  (growMemViews(), HEAP32)[((precision) >> 2)] = result.precision;
};

var _emscripten_glGetShaderPrecisionFormat = _glGetShaderPrecisionFormat;

/** @suppress {duplicate } */ var _glGetShaderSource = (shader, bufSize, length, source) => {
  var result = GLctx.getShaderSource(GL.shaders[shader]);
  if (!result) return;
  // If an error occurs, nothing will be written to length or source.
  var numBytesWrittenExclNull = (bufSize > 0 && source) ? stringToUTF8(result, source, bufSize) : 0;
  if (length) (growMemViews(), HEAP32)[((length) >> 2)] = numBytesWrittenExclNull;
};

var _emscripten_glGetShaderSource = _glGetShaderSource;

/** @suppress {duplicate } */ var _glGetShaderiv = (shader, pname, p) => {
  if (!p) {
    // GLES2 specification does not specify how to behave if p is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  if (pname == 35716) {
    // GL_INFO_LOG_LENGTH
    var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
    if (log === null) log = "(unknown error)";
    // The GLES2 specification says that if the shader has an empty info log,
    // a value of 0 is returned. Otherwise the log has a null char appended.
    // (An empty string is falsey, so we can just check that instead of
    // looking at log.length.)
    var logLength = log ? log.length + 1 : 0;
    (growMemViews(), HEAP32)[((p) >> 2)] = logLength;
  } else if (pname == 35720) {
    // GL_SHADER_SOURCE_LENGTH
    var source = GLctx.getShaderSource(GL.shaders[shader]);
    // source may be a null, or the empty string, both of which are falsey
    // values that we report a 0 length for.
    var sourceLength = source ? source.length + 1 : 0;
    (growMemViews(), HEAP32)[((p) >> 2)] = sourceLength;
  } else {
    (growMemViews(), HEAP32)[((p) >> 2)] = GLctx.getShaderParameter(GL.shaders[shader], pname);
  }
};

var _emscripten_glGetShaderiv = _glGetShaderiv;

var stringToNewUTF8 = str => {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8(str, ret, size);
  return ret;
};

/** @suppress {duplicate } */ var _glGetString = name_ => {
  var ret = GL.stringCache[name_];
  if (!ret) {
    switch (name_) {
     case 7939:
      ret = stringToNewUTF8(webglGetExtensions().join(" "));
      break;

     case 7936:
     case 7937:
     case 37445:
     case 37446:
      var s = GLctx.getParameter(name_);
      if (!s) {
        GL.recordError(1280);
      }
      ret = s ? stringToNewUTF8(s) : 0;
      break;

     case 7938:
      var webGLVersion = GLctx.getParameter(7938);
      // return GLES version string corresponding to the version of the WebGL context
      var glVersion = `OpenGL ES 2.0 (${webGLVersion})`;
      if (GL.currentContext.version >= 2) glVersion = `OpenGL ES 3.0 (${webGLVersion})`;
      ret = stringToNewUTF8(glVersion);
      break;

     case 35724:
      var glslVersion = GLctx.getParameter(35724);
      // extract the version number 'N.M' from the string 'WebGL GLSL ES N.M ...'
      var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
      var ver_num = glslVersion.match(ver_re);
      if (ver_num !== null) {
        if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
        // ensure minor version has 2 digits
        glslVersion = `OpenGL ES GLSL ES ${ver_num[1]} (${glslVersion})`;
      }
      ret = stringToNewUTF8(glslVersion);
      break;

     default:
      GL.recordError(1280);
    }
    GL.stringCache[name_] = ret;
  }
  return ret;
};

var _emscripten_glGetString = _glGetString;

/** @suppress {duplicate } */ var _glGetStringi = (name, index) => {
  if (GL.currentContext.version < 2) {
    GL.recordError(1282);
    // Calling GLES3/WebGL2 function with a GLES2/WebGL1 context
    return 0;
  }
  var stringiCache = GL.stringiCache[name];
  if (stringiCache) {
    if (index < 0 || index >= stringiCache.length) {
      GL.recordError(1281);
      return 0;
    }
    return stringiCache[index];
  }
  switch (name) {
   case 7939:
    var exts = webglGetExtensions().map(stringToNewUTF8);
    stringiCache = GL.stringiCache[name] = exts;
    if (index < 0 || index >= stringiCache.length) {
      GL.recordError(1281);
      return 0;
    }
    return stringiCache[index];

   default:
    GL.recordError(1280);
    return 0;
  }
};

var _emscripten_glGetStringi = _glGetStringi;

/** @suppress {duplicate } */ var _glGetSynciv = (sync, pname, bufSize, length, values) => {
  if (bufSize < 0) {
    // GLES3 specification does not specify how to behave if bufSize < 0, however in the spec wording for glGetInternalformativ, it does say that GL_INVALID_VALUE should be raised,
    // so raise GL_INVALID_VALUE here as well.
    GL.recordError(1281);
    return;
  }
  if (!values) {
    // GLES3 specification does not specify how to behave if values is a null pointer. Since calling this function does not make sense
    // if values == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  var ret = GLctx.getSyncParameter(GL.syncs[sync], pname);
  if (ret !== null) {
    (growMemViews(), HEAP32)[((values) >> 2)] = ret;
    if (length) (growMemViews(), HEAP32)[((length) >> 2)] = 1;
  }
};

var _emscripten_glGetSynciv = _glGetSynciv;

/** @suppress {duplicate } */ var _glGetTexParameterfv = (target, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  (growMemViews(), HEAPF32)[((params) >> 2)] = GLctx.getTexParameter(target, pname);
};

var _emscripten_glGetTexParameterfv = _glGetTexParameterfv;

/** @suppress {duplicate } */ var _glGetTexParameteriv = (target, pname, params) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  (growMemViews(), HEAP32)[((params) >> 2)] = GLctx.getTexParameter(target, pname);
};

var _emscripten_glGetTexParameteriv = _glGetTexParameteriv;

/** @suppress {duplicate } */ var _glGetTransformFeedbackVarying = (program, index, bufSize, length, size, type, name) => {
  program = GL.programs[program];
  var info = GLctx.getTransformFeedbackVarying(program, index);
  if (!info) return;
  // If an error occurred, the return parameters length, size, type and name will be unmodified.
  if (name && bufSize > 0) {
    var numBytesWrittenExclNull = stringToUTF8(info.name, name, bufSize);
    if (length) (growMemViews(), HEAP32)[((length) >> 2)] = numBytesWrittenExclNull;
  } else {
    if (length) (growMemViews(), HEAP32)[((length) >> 2)] = 0;
  }
  if (size) (growMemViews(), HEAP32)[((size) >> 2)] = info.size;
  if (type) (growMemViews(), HEAP32)[((type) >> 2)] = info.type;
};

var _emscripten_glGetTransformFeedbackVarying = _glGetTransformFeedbackVarying;

/** @suppress {duplicate } */ var _glGetUniformBlockIndex = (program, uniformBlockName) => GLctx.getUniformBlockIndex(GL.programs[program], UTF8ToString(uniformBlockName));

var _emscripten_glGetUniformBlockIndex = _glGetUniformBlockIndex;

/** @suppress {duplicate } */ var _glGetUniformIndices = (program, uniformCount, uniformNames, uniformIndices) => {
  if (!uniformIndices) {
    // GLES2 specification does not specify how to behave if uniformIndices is a null pointer. Since calling this function does not make sense
    // if uniformIndices == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  if (uniformCount > 0 && (uniformNames == 0 || uniformIndices == 0)) {
    GL.recordError(1281);
    return;
  }
  program = GL.programs[program];
  var names = [];
  for (var i = 0; i < uniformCount; i++) names.push(UTF8ToString((growMemViews(), 
  HEAP32)[(((uniformNames) + (i * 4)) >> 2)]));
  var result = GLctx.getUniformIndices(program, names);
  if (!result) return;
  // GL spec: If an error is generated, nothing is written out to uniformIndices.
  var len = result.length;
  for (var i = 0; i < len; i++) {
    (growMemViews(), HEAP32)[(((uniformIndices) + (i * 4)) >> 2)] = result[i];
  }
};

var _emscripten_glGetUniformIndices = _glGetUniformIndices;

/** @suppress {checkTypes} */ var jstoi_q = str => parseInt(str);

/** @noinline */ var webglGetLeftBracePos = name => name.slice(-1) == "]" && name.lastIndexOf("[");

var webglPrepareUniformLocationsBeforeFirstUse = program => {
  var uniformLocsById = program.uniformLocsById, // Maps GLuint -> WebGLUniformLocation
  uniformSizeAndIdsByName = program.uniformSizeAndIdsByName, // Maps name -> [uniform array length, GLuint]
  i, j;
  // On the first time invocation of glGetUniformLocation on this shader program:
  // initialize cache data structures and discover which uniforms are arrays.
  if (!uniformLocsById) {
    // maps GLint integer locations to WebGLUniformLocations
    program.uniformLocsById = uniformLocsById = {};
    // maps integer locations back to uniform name strings, so that we can lazily fetch uniform array locations
    program.uniformArrayNamesById = {};
    var numActiveUniforms = GLctx.getProgramParameter(program, 35718);
    for (i = 0; i < numActiveUniforms; ++i) {
      var u = GLctx.getActiveUniform(program, i);
      var nm = u.name;
      var sz = u.size;
      var lb = webglGetLeftBracePos(nm);
      var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
      // Assign a new location.
      var id = program.uniformIdCounter;
      program.uniformIdCounter += sz;
      // Eagerly get the location of the uniformArray[0] base element.
      // The remaining indices >0 will be left for lazy evaluation to
      // improve performance. Those may never be needed to fetch, if the
      // application fills arrays always in full starting from the first
      // element of the array.
      uniformSizeAndIdsByName[arrayName] = [ sz, id ];
      // Store placeholder integers in place that highlight that these
      // >0 index locations are array indices pending population.
      for (j = 0; j < sz; ++j) {
        uniformLocsById[id] = j;
        program.uniformArrayNamesById[id++] = arrayName;
      }
    }
  }
};

/** @suppress {duplicate } */ var _glGetUniformLocation = (program, name) => {
  name = UTF8ToString(name);
  if (program = GL.programs[program]) {
    webglPrepareUniformLocationsBeforeFirstUse(program);
    var uniformLocsById = program.uniformLocsById;
    // Maps GLuint -> WebGLUniformLocation
    var arrayIndex = 0;
    var uniformBaseName = name;
    // Invariant: when populating integer IDs for uniform locations, we must
    // maintain the precondition that arrays reside in contiguous addresses,
    // i.e. for a 'vec4 colors[10];', colors[4] must be at location
    // colors[0]+4.  However, user might call glGetUniformLocation(program,
    // "colors") for an array, so we cannot discover based on the user input
    // arguments whether the uniform we are dealing with is an array. The only
    // way to discover which uniforms are arrays is to enumerate over all the
    // active uniforms in the program.
    var leftBrace = webglGetLeftBracePos(name);
    // If user passed an array accessor "[index]", parse the array index off the accessor.
    if (leftBrace > 0) {
      arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
      // "index]", coerce parseInt(']') with >>>0 to treat "foo[]" as "foo[0]" and foo[-1] as unsigned out-of-bounds.
      uniformBaseName = name.slice(0, leftBrace);
    }
    // Have we cached the location of this uniform before?
    // A pair [array length, GLint of the uniform location]
    var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
    // If an uniform with this name exists, and if its index is within the
    // array limits (if it's even an array), query the WebGLlocation, or
    // return an existing cached location.
    if (sizeAndId && arrayIndex < sizeAndId[0]) {
      arrayIndex += sizeAndId[1];
      // Add the base location of the uniform to the array index offset.
      if ((uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name))) {
        return arrayIndex;
      }
    }
  } else {
    // N.b. we are currently unable to distinguish between GL program IDs that
    // never existed vs GL program IDs that have been deleted, so report
    // GL_INVALID_VALUE in both cases.
    GL.recordError(1281);
  }
  return -1;
};

var _emscripten_glGetUniformLocation = _glGetUniformLocation;

var webglGetUniformLocation = location => {
  var p = GLctx.currentProgram;
  if (p) {
    var webglLoc = p.uniformLocsById[location];
    // p.uniformLocsById[location] stores either an integer, or a
    // WebGLUniformLocation.
    // If an integer, we have not yet bound the location, so do it now. The
    // integer value specifies the array index we should bind to.
    if (typeof webglLoc == "number") {
      p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? `[${webglLoc}]` : ""));
    }
    // Else an already cached WebGLUniformLocation, return it.
    return webglLoc;
  } else {
    GL.recordError(1282);
  }
};

/** @suppress{checkTypes} */ var emscriptenWebGLGetUniform = (program, location, params, type) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null
    // pointer. Since calling this function does not make sense if params ==
    // null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  program = GL.programs[program];
  webglPrepareUniformLocationsBeforeFirstUse(program);
  var data = GLctx.getUniform(program, webglGetUniformLocation(location));
  if (typeof data == "number" || typeof data == "boolean") {
    switch (type) {
     case 0:
      (growMemViews(), HEAP32)[((params) >> 2)] = data;
      break;

     case 2:
      (growMemViews(), HEAPF32)[((params) >> 2)] = data;
      break;
    }
  } else {
    for (var i = 0; i < data.length; i++) {
      switch (type) {
       case 0:
        (growMemViews(), HEAP32)[(((params) + (i * 4)) >> 2)] = data[i];
        break;

       case 2:
        (growMemViews(), HEAPF32)[(((params) + (i * 4)) >> 2)] = data[i];
        break;
      }
    }
  }
};

/** @suppress {duplicate } */ var _glGetUniformfv = (program, location, params) => {
  emscriptenWebGLGetUniform(program, location, params, 2);
};

var _emscripten_glGetUniformfv = _glGetUniformfv;

/** @suppress {duplicate } */ var _glGetUniformiv = (program, location, params) => {
  emscriptenWebGLGetUniform(program, location, params, 0);
};

var _emscripten_glGetUniformiv = _glGetUniformiv;

/** @suppress {duplicate } */ var _glGetUniformuiv = (program, location, params) => emscriptenWebGLGetUniform(program, location, params, 0);

var _emscripten_glGetUniformuiv = _glGetUniformuiv;

/** @suppress{checkTypes} */ var emscriptenWebGLGetVertexAttrib = (index, pname, params, type) => {
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null
    // pointer. Since calling this function does not make sense if params ==
    // null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  if (GL.currentContext.clientBuffers[index].enabled) {
    err("glGetVertexAttrib*v on client-side array: not supported, bad data returned");
  }
  var data = GLctx.getVertexAttrib(index, pname);
  if (pname == 34975) {
    (growMemViews(), HEAP32)[((params) >> 2)] = data && data["name"];
  } else if (typeof data == "number" || typeof data == "boolean") {
    switch (type) {
     case 0:
      (growMemViews(), HEAP32)[((params) >> 2)] = data;
      break;

     case 2:
      (growMemViews(), HEAPF32)[((params) >> 2)] = data;
      break;

     case 5:
      (growMemViews(), HEAP32)[((params) >> 2)] = Math.fround(data);
      break;
    }
  } else {
    for (var i = 0; i < data.length; i++) {
      switch (type) {
       case 0:
        (growMemViews(), HEAP32)[(((params) + (i * 4)) >> 2)] = data[i];
        break;

       case 2:
        (growMemViews(), HEAPF32)[(((params) + (i * 4)) >> 2)] = data[i];
        break;

       case 5:
        (growMemViews(), HEAP32)[(((params) + (i * 4)) >> 2)] = Math.fround(data[i]);
        break;
      }
    }
  }
};

/** @suppress {duplicate } */ var _glGetVertexAttribIiv = (index, pname, params) => {
  // N.B. This function may only be called if the vertex attribute was specified using the function glVertexAttribI4iv(),
  // otherwise the results are undefined. (GLES3 spec 6.1.12)
  emscriptenWebGLGetVertexAttrib(index, pname, params, 0);
};

var _emscripten_glGetVertexAttribIiv = _glGetVertexAttribIiv;

/** @suppress {duplicate } */ var _glGetVertexAttribIuiv = _glGetVertexAttribIiv;

var _emscripten_glGetVertexAttribIuiv = _glGetVertexAttribIuiv;

/** @suppress {duplicate } */ var _glGetVertexAttribPointerv = (index, pname, pointer) => {
  if (!pointer) {
    // GLES2 specification does not specify how to behave if pointer is a null
    // pointer. Since calling this function does not make sense if pointer ==
    // null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  if (GL.currentContext.clientBuffers[index].enabled) {
    err("glGetVertexAttribPointer on client-side array: not supported, bad data returned");
  }
  (growMemViews(), HEAP32)[((pointer) >> 2)] = GLctx.getVertexAttribOffset(index, pname);
};

var _emscripten_glGetVertexAttribPointerv = _glGetVertexAttribPointerv;

/** @suppress {duplicate } */ var _glGetVertexAttribfv = (index, pname, params) => {
  // N.B. This function may only be called if the vertex attribute was
  // specified using the function glVertexAttrib*f(), otherwise the results
  // are undefined. (GLES3 spec 6.1.12)
  emscriptenWebGLGetVertexAttrib(index, pname, params, 2);
};

var _emscripten_glGetVertexAttribfv = _glGetVertexAttribfv;

/** @suppress {duplicate } */ var _glGetVertexAttribiv = (index, pname, params) => {
  // N.B. This function may only be called if the vertex attribute was
  // specified using the function glVertexAttrib*f(), otherwise the results
  // are undefined. (GLES3 spec 6.1.12)
  emscriptenWebGLGetVertexAttrib(index, pname, params, 5);
};

var _emscripten_glGetVertexAttribiv = _glGetVertexAttribiv;

/** @suppress {duplicate } */ var _glHint = (x0, x1) => GLctx.hint(x0, x1);

var _emscripten_glHint = _glHint;

/** @suppress {duplicate } */ var _glInvalidateFramebuffer = (target, numAttachments, attachments) => {
  var list = tempFixedLengthArray[numAttachments];
  for (var i = 0; i < numAttachments; i++) {
    list[i] = (growMemViews(), HEAP32)[(((attachments) + (i * 4)) >> 2)];
  }
  GLctx.invalidateFramebuffer(target, list);
};

var _emscripten_glInvalidateFramebuffer = _glInvalidateFramebuffer;

/** @suppress {duplicate } */ var _glInvalidateSubFramebuffer = (target, numAttachments, attachments, x, y, width, height) => {
  var list = tempFixedLengthArray[numAttachments];
  for (var i = 0; i < numAttachments; i++) {
    list[i] = (growMemViews(), HEAP32)[(((attachments) + (i * 4)) >> 2)];
  }
  GLctx.invalidateSubFramebuffer(target, list, x, y, width, height);
};

var _emscripten_glInvalidateSubFramebuffer = _glInvalidateSubFramebuffer;

/** @suppress {duplicate } */ var _glIsBuffer = buffer => {
  var b = GL.buffers[buffer];
  if (!b) return 0;
  return GLctx.isBuffer(b);
};

var _emscripten_glIsBuffer = _glIsBuffer;

/** @suppress {duplicate } */ var _glIsEnabled = x0 => GLctx.isEnabled(x0);

var _emscripten_glIsEnabled = _glIsEnabled;

/** @suppress {duplicate } */ var _glIsFramebuffer = framebuffer => {
  var fb = GL.framebuffers[framebuffer];
  if (!fb) return 0;
  return GLctx.isFramebuffer(fb);
};

var _emscripten_glIsFramebuffer = _glIsFramebuffer;

/** @suppress {duplicate } */ var _glIsProgram = program => {
  program = GL.programs[program];
  if (!program) return 0;
  return GLctx.isProgram(program);
};

var _emscripten_glIsProgram = _glIsProgram;

/** @suppress {duplicate } */ var _glIsQuery = id => {
  var query = GL.queries[id];
  if (!query) return 0;
  return GLctx.isQuery(query);
};

var _emscripten_glIsQuery = _glIsQuery;

/** @suppress {duplicate } */ var _glIsQueryEXT = id => {
  var query = GL.queries[id];
  if (!query) return 0;
  return GLctx.disjointTimerQueryExt["isQueryEXT"](query);
};

var _emscripten_glIsQueryEXT = _glIsQueryEXT;

/** @suppress {duplicate } */ var _glIsRenderbuffer = renderbuffer => {
  var rb = GL.renderbuffers[renderbuffer];
  if (!rb) return 0;
  return GLctx.isRenderbuffer(rb);
};

var _emscripten_glIsRenderbuffer = _glIsRenderbuffer;

/** @suppress {duplicate } */ var _glIsSampler = id => {
  var sampler = GL.samplers[id];
  if (!sampler) return 0;
  return GLctx.isSampler(sampler);
};

var _emscripten_glIsSampler = _glIsSampler;

/** @suppress {duplicate } */ var _glIsShader = shader => {
  var s = GL.shaders[shader];
  if (!s) return 0;
  return GLctx.isShader(s);
};

var _emscripten_glIsShader = _glIsShader;

/** @suppress {duplicate } */ var _glIsSync = sync => GLctx.isSync(GL.syncs[sync]);

var _emscripten_glIsSync = _glIsSync;

/** @suppress {duplicate } */ var _glIsTexture = id => {
  var texture = GL.textures[id];
  if (!texture) return 0;
  return GLctx.isTexture(texture);
};

var _emscripten_glIsTexture = _glIsTexture;

/** @suppress {duplicate } */ var _glIsTransformFeedback = id => GLctx.isTransformFeedback(GL.transformFeedbacks[id]);

var _emscripten_glIsTransformFeedback = _glIsTransformFeedback;

/** @suppress {duplicate } */ var _glIsVertexArray = array => {
  var vao = GL.vaos[array];
  if (!vao) return 0;
  return GLctx.isVertexArray(vao);
};

var _emscripten_glIsVertexArray = _glIsVertexArray;

/** @suppress {duplicate } */ var _glIsVertexArrayOES = _glIsVertexArray;

var _emscripten_glIsVertexArrayOES = _glIsVertexArrayOES;

/** @suppress {duplicate } */ var _glLineWidth = x0 => GLctx.lineWidth(x0);

var _emscripten_glLineWidth = _glLineWidth;

/** @suppress {duplicate } */ var _glLinkProgram = program => {
  program = GL.programs[program];
  GLctx.linkProgram(program);
  // Invalidate earlier computed uniform->ID mappings, those have now become stale
  program.uniformLocsById = 0;
  // Mark as null-like so that glGetUniformLocation() knows to populate this again.
  program.uniformSizeAndIdsByName = {};
};

var _emscripten_glLinkProgram = _glLinkProgram;

/** @suppress {duplicate } */ var _glMapBufferRange = (target, offset, length, access) => {
  if ((access & (1 | 32)) != 0) {
    err("glMapBufferRange access does not support MAP_READ or MAP_UNSYNCHRONIZED");
    return 0;
  }
  if ((access & 2) == 0) {
    err("glMapBufferRange access must include MAP_WRITE");
    return 0;
  }
  if ((access & (4 | 8)) == 0) {
    err("glMapBufferRange access must include INVALIDATE_BUFFER or INVALIDATE_RANGE");
    return 0;
  }
  if (!emscriptenWebGLValidateMapBufferTarget(target)) {
    GL.recordError(1280);
    err("GL_INVALID_ENUM in glMapBufferRange");
    return 0;
  }
  var mem = _malloc(length), binding = emscriptenWebGLGetBufferBinding(target);
  if (!mem) return 0;
  binding = GL.mappedBuffers[binding] ??= {};
  binding.offset = offset;
  binding.length = length;
  binding.mem = mem;
  binding.access = access;
  return mem;
};

var _emscripten_glMapBufferRange = _glMapBufferRange;

/** @suppress {duplicate } */ var _glPauseTransformFeedback = () => GLctx.pauseTransformFeedback();

var _emscripten_glPauseTransformFeedback = _glPauseTransformFeedback;

/** @suppress {duplicate } */ var _glPixelStorei = (pname, param) => {
  if (pname == 3317) {
    GL.unpackAlignment = param;
  } else if (pname == 3314) {
    GL.unpackRowLength = param;
  }
  GLctx.pixelStorei(pname, param);
};

var _emscripten_glPixelStorei = _glPixelStorei;

/** @suppress {duplicate } */ var _glPolygonModeWEBGL = (face, mode) => {
  GLctx.webglPolygonMode["polygonModeWEBGL"](face, mode);
};

var _emscripten_glPolygonModeWEBGL = _glPolygonModeWEBGL;

/** @suppress {duplicate } */ var _glPolygonOffset = (x0, x1) => GLctx.polygonOffset(x0, x1);

var _emscripten_glPolygonOffset = _glPolygonOffset;

/** @suppress {duplicate } */ var _glPolygonOffsetClampEXT = (factor, units, clamp) => {
  GLctx.extPolygonOffsetClamp["polygonOffsetClampEXT"](factor, units, clamp);
};

var _emscripten_glPolygonOffsetClampEXT = _glPolygonOffsetClampEXT;

/** @suppress {duplicate } */ var _glProgramBinary = (program, binaryFormat, binary, length) => {
  GL.recordError(1280);
};

var _emscripten_glProgramBinary = _glProgramBinary;

/** @suppress {duplicate } */ var _glProgramParameteri = (program, pname, value) => {
  GL.recordError(1280);
};

var _emscripten_glProgramParameteri = _glProgramParameteri;

/** @suppress {duplicate } */ var _glQueryCounterEXT = (id, target) => {
  GLctx.disjointTimerQueryExt["queryCounterEXT"](GL.queries[id], target);
};

var _emscripten_glQueryCounterEXT = _glQueryCounterEXT;

/** @suppress {duplicate } */ var _glReadBuffer = x0 => GLctx.readBuffer(x0);

var _emscripten_glReadBuffer = _glReadBuffer;

var computeUnpackAlignedImageSize = (width, height, sizePerPixel) => {
  function roundedToNextMultipleOf(x, y) {
    return (x + y - 1) & -y;
  }
  var plainRowSize = (GL.unpackRowLength || width) * sizePerPixel;
  var alignedRowSize = roundedToNextMultipleOf(plainRowSize, GL.unpackAlignment);
  return height * alignedRowSize;
};

var colorChannelsInGlTextureFormat = format => {
  // Micro-optimizations for size: map format to size by subtracting smallest
  // enum value (0x1902) from all values first.  Also omit the most common
  // size value (1) from the list, which is assumed by formats not on the
  // list.
  var colorChannels = {
    // 0x1902 /* GL_DEPTH_COMPONENT */ - 0x1902: 1,
    // 0x1906 /* GL_ALPHA */ - 0x1902: 1,
    5: 3,
    6: 4,
    // 0x1909 /* GL_LUMINANCE */ - 0x1902: 1,
    8: 2,
    29502: 3,
    29504: 4,
    // 0x1903 /* GL_RED */ - 0x1902: 1,
    26917: 2,
    26918: 2,
    // 0x8D94 /* GL_RED_INTEGER */ - 0x1902: 1,
    29846: 3,
    29847: 4
  };
  return colorChannels[format - 6402] || 1;
};

var heapObjectForWebGLType = type => {
  // Micro-optimization for size: Subtract lowest GL enum number (0x1400/* GL_BYTE */) from type to compare
  // smaller values for the heap, for shorter generated code size.
  // Also the type HEAPU16 is not tested for explicitly, but any unrecognized type will return out HEAPU16.
  // (since most types are HEAPU16)
  type -= 5120;
  if (type == 0) return growMemViews(), HEAP8;
  if (type == 1) return growMemViews(), HEAPU8;
  if (type == 2) return growMemViews(), HEAP16;
  if (type == 4) return growMemViews(), HEAP32;
  if (type == 6) return growMemViews(), HEAPF32;
  if (type == 5 || type == 28922 || type == 28520 || type == 30779 || type == 30782) return growMemViews(), 
  HEAPU32;
  return growMemViews(), HEAPU16;
};

var toTypedArrayIndex = (pointer, heap) => pointer >>> (31 - Math.clz32(heap.BYTES_PER_ELEMENT));

var emscriptenWebGLGetTexPixelData = (type, format, width, height, pixels, internalFormat) => {
  var heap = heapObjectForWebGLType(type);
  var sizePerPixel = colorChannelsInGlTextureFormat(format) * heap.BYTES_PER_ELEMENT;
  var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel);
  return heap.subarray(toTypedArrayIndex(pixels, heap), toTypedArrayIndex(pixels + bytes, heap));
};

/** @suppress {duplicate } */ var _glReadPixels = (x, y, width, height, format, type, pixels) => {
  if (GL.currentContext.version >= 2) {
    if (GLctx.currentPixelPackBufferBinding) {
      GLctx.readPixels(x, y, width, height, format, type, pixels);
      return;
    }
    var heap = heapObjectForWebGLType(type);
    var target = toTypedArrayIndex(pixels, heap);
    GLctx.readPixels(x, y, width, height, format, type, heap, target);
    return;
  }
  var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
  if (!pixelData) {
    GL.recordError(1280);
    return;
  }
  GLctx.readPixels(x, y, width, height, format, type, pixelData);
};

var _emscripten_glReadPixels = _glReadPixels;

/** @suppress {duplicate } */ var _glReleaseShaderCompiler = () => {};

var _emscripten_glReleaseShaderCompiler = _glReleaseShaderCompiler;

/** @suppress {duplicate } */ var _glRenderbufferStorage = (x0, x1, x2, x3) => GLctx.renderbufferStorage(x0, x1, x2, x3);

var _emscripten_glRenderbufferStorage = _glRenderbufferStorage;

/** @suppress {duplicate } */ var _glRenderbufferStorageMultisample = (x0, x1, x2, x3, x4) => GLctx.renderbufferStorageMultisample(x0, x1, x2, x3, x4);

var _emscripten_glRenderbufferStorageMultisample = _glRenderbufferStorageMultisample;

/** @suppress {duplicate } */ var _glResumeTransformFeedback = () => GLctx.resumeTransformFeedback();

var _emscripten_glResumeTransformFeedback = _glResumeTransformFeedback;

/** @suppress {duplicate } */ var _glSampleCoverage = (value, invert) => {
  GLctx.sampleCoverage(value, !!invert);
};

var _emscripten_glSampleCoverage = _glSampleCoverage;

/** @suppress {duplicate } */ var _glSamplerParameterf = (sampler, pname, param) => {
  GLctx.samplerParameterf(GL.samplers[sampler], pname, param);
};

var _emscripten_glSamplerParameterf = _glSamplerParameterf;

/** @suppress {duplicate } */ var _glSamplerParameterfv = (sampler, pname, params) => {
  var param = (growMemViews(), HEAPF32)[((params) >> 2)];
  GLctx.samplerParameterf(GL.samplers[sampler], pname, param);
};

var _emscripten_glSamplerParameterfv = _glSamplerParameterfv;

/** @suppress {duplicate } */ var _glSamplerParameteri = (sampler, pname, param) => {
  GLctx.samplerParameteri(GL.samplers[sampler], pname, param);
};

var _emscripten_glSamplerParameteri = _glSamplerParameteri;

/** @suppress {duplicate } */ var _glSamplerParameteriv = (sampler, pname, params) => {
  var param = (growMemViews(), HEAP32)[((params) >> 2)];
  GLctx.samplerParameteri(GL.samplers[sampler], pname, param);
};

var _emscripten_glSamplerParameteriv = _glSamplerParameteriv;

/** @suppress {duplicate } */ var _glScissor = (x0, x1, x2, x3) => GLctx.scissor(x0, x1, x2, x3);

var _emscripten_glScissor = _glScissor;

/** @suppress {duplicate } */ var _glShaderBinary = (count, shaders, binaryformat, binary, length) => {
  GL.recordError(1280);
};

var _emscripten_glShaderBinary = _glShaderBinary;

/** @suppress {duplicate } */ var _glShaderSource = (shader, count, string, length) => {
  var source = GL.getSource(shader, count, string, length);
  GLctx.shaderSource(GL.shaders[shader], source);
};

var _emscripten_glShaderSource = _glShaderSource;

/** @suppress {duplicate } */ var _glStencilFunc = (x0, x1, x2) => GLctx.stencilFunc(x0, x1, x2);

var _emscripten_glStencilFunc = _glStencilFunc;

/** @suppress {duplicate } */ var _glStencilFuncSeparate = (x0, x1, x2, x3) => GLctx.stencilFuncSeparate(x0, x1, x2, x3);

var _emscripten_glStencilFuncSeparate = _glStencilFuncSeparate;

/** @suppress {duplicate } */ var _glStencilMask = x0 => GLctx.stencilMask(x0);

var _emscripten_glStencilMask = _glStencilMask;

/** @suppress {duplicate } */ var _glStencilMaskSeparate = (x0, x1) => GLctx.stencilMaskSeparate(x0, x1);

var _emscripten_glStencilMaskSeparate = _glStencilMaskSeparate;

/** @suppress {duplicate } */ var _glStencilOp = (x0, x1, x2) => GLctx.stencilOp(x0, x1, x2);

var _emscripten_glStencilOp = _glStencilOp;

/** @suppress {duplicate } */ var _glStencilOpSeparate = (x0, x1, x2, x3) => GLctx.stencilOpSeparate(x0, x1, x2, x3);

var _emscripten_glStencilOpSeparate = _glStencilOpSeparate;

/** @suppress {duplicate } */ var _glTexImage2D = (target, level, internalFormat, width, height, border, format, type, pixels) => {
  if (GL.currentContext.version >= 2) {
    if (GLctx.currentPixelUnpackBufferBinding) {
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
      return;
    }
    if (pixels) {
      var heap = heapObjectForWebGLType(type);
      var index = toTypedArrayIndex(pixels, heap);
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, heap, index);
      return;
    }
  }
  var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null;
  GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
};

var _emscripten_glTexImage2D = _glTexImage2D;

/** @suppress {duplicate } */ var _glTexImage3D = (target, level, internalFormat, width, height, depth, border, format, type, pixels) => {
  if (GLctx.currentPixelUnpackBufferBinding) {
    GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, pixels);
  } else if (pixels) {
    var heap = heapObjectForWebGLType(type);
    GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, heap, toTypedArrayIndex(pixels, heap));
  } else {
    GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, null);
  }
};

var _emscripten_glTexImage3D = _glTexImage3D;

/** @suppress {duplicate } */ var _glTexParameterf = (x0, x1, x2) => GLctx.texParameterf(x0, x1, x2);

var _emscripten_glTexParameterf = _glTexParameterf;

/** @suppress {duplicate } */ var _glTexParameterfv = (target, pname, params) => {
  var param = (growMemViews(), HEAPF32)[((params) >> 2)];
  GLctx.texParameterf(target, pname, param);
};

var _emscripten_glTexParameterfv = _glTexParameterfv;

/** @suppress {duplicate } */ var _glTexParameteri = (x0, x1, x2) => GLctx.texParameteri(x0, x1, x2);

var _emscripten_glTexParameteri = _glTexParameteri;

/** @suppress {duplicate } */ var _glTexParameteriv = (target, pname, params) => {
  var param = (growMemViews(), HEAP32)[((params) >> 2)];
  GLctx.texParameteri(target, pname, param);
};

var _emscripten_glTexParameteriv = _glTexParameteriv;

/** @suppress {duplicate } */ var _glTexStorage2D = (x0, x1, x2, x3, x4) => GLctx.texStorage2D(x0, x1, x2, x3, x4);

var _emscripten_glTexStorage2D = _glTexStorage2D;

/** @suppress {duplicate } */ var _glTexStorage3D = (x0, x1, x2, x3, x4, x5) => GLctx.texStorage3D(x0, x1, x2, x3, x4, x5);

var _emscripten_glTexStorage3D = _glTexStorage3D;

/** @suppress {duplicate } */ var _glTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, type, pixels) => {
  if (GL.currentContext.version >= 2) {
    if (GLctx.currentPixelUnpackBufferBinding) {
      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
      return;
    }
    if (pixels) {
      var heap = heapObjectForWebGLType(type);
      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, heap, toTypedArrayIndex(pixels, heap));
      return;
    }
  }
  var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0) : null;
  GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
};

var _emscripten_glTexSubImage2D = _glTexSubImage2D;

/** @suppress {duplicate } */ var _glTexSubImage3D = (target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels) => {
  if (GLctx.currentPixelUnpackBufferBinding) {
    GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels);
  } else if (pixels) {
    var heap = heapObjectForWebGLType(type);
    GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, heap, toTypedArrayIndex(pixels, heap));
  } else {
    GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, null);
  }
};

var _emscripten_glTexSubImage3D = _glTexSubImage3D;

/** @suppress {duplicate } */ var _glTransformFeedbackVaryings = (program, count, varyings, bufferMode) => {
  program = GL.programs[program];
  var vars = [];
  for (var i = 0; i < count; i++) vars.push(UTF8ToString((growMemViews(), HEAP32)[(((varyings) + (i * 4)) >> 2)]));
  GLctx.transformFeedbackVaryings(program, vars, bufferMode);
};

var _emscripten_glTransformFeedbackVaryings = _glTransformFeedbackVaryings;

/** @suppress {duplicate } */ var _glUniform1f = (location, v0) => {
  GLctx.uniform1f(webglGetUniformLocation(location), v0);
};

var _emscripten_glUniform1f = _glUniform1f;

var miniTempWebGLFloatBuffers = [];

/** @suppress {duplicate } */ var _glUniform1fv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform1fv(webglGetUniformLocation(location), (growMemViews(), HEAPF32), ((value) >> 2), count);
    return;
  }
  if (count <= 288) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; ++i) {
      view[i] = (growMemViews(), HEAPF32)[(((value) + (4 * i)) >> 2)];
    }
  } else {
    var view = (growMemViews(), HEAPF32).subarray((((value) >> 2)), ((value + count * 4) >> 2));
  }
  GLctx.uniform1fv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform1fv = _glUniform1fv;

/** @suppress {duplicate } */ var _glUniform1i = (location, v0) => {
  GLctx.uniform1i(webglGetUniformLocation(location), v0);
};

var _emscripten_glUniform1i = _glUniform1i;

var miniTempWebGLIntBuffers = [];

/** @suppress {duplicate } */ var _glUniform1iv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform1iv(webglGetUniformLocation(location), (growMemViews(), HEAP32), ((value) >> 2), count);
    return;
  }
  if (count <= 288) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLIntBuffers[count];
    for (var i = 0; i < count; ++i) {
      view[i] = (growMemViews(), HEAP32)[(((value) + (4 * i)) >> 2)];
    }
  } else {
    var view = (growMemViews(), HEAP32).subarray((((value) >> 2)), ((value + count * 4) >> 2));
  }
  GLctx.uniform1iv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform1iv = _glUniform1iv;

/** @suppress {duplicate } */ var _glUniform1ui = (location, v0) => {
  GLctx.uniform1ui(webglGetUniformLocation(location), v0);
};

var _emscripten_glUniform1ui = _glUniform1ui;

/** @suppress {duplicate } */ var _glUniform1uiv = (location, count, value) => {
  count && GLctx.uniform1uiv(webglGetUniformLocation(location), (growMemViews(), HEAPU32), ((value) >> 2), count);
};

var _emscripten_glUniform1uiv = _glUniform1uiv;

/** @suppress {duplicate } */ var _glUniform2f = (location, v0, v1) => {
  GLctx.uniform2f(webglGetUniformLocation(location), v0, v1);
};

var _emscripten_glUniform2f = _glUniform2f;

/** @suppress {duplicate } */ var _glUniform2fv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform2fv(webglGetUniformLocation(location), (growMemViews(), HEAPF32), ((value) >> 2), count * 2);
    return;
  }
  if (count <= 144) {
    // avoid allocation when uploading few enough uniforms
    count *= 2;
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; i += 2) {
      view[i] = (growMemViews(), HEAPF32)[(((value) + (4 * i)) >> 2)];
      view[i + 1] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 4)) >> 2)];
    }
  } else {
    var view = (growMemViews(), HEAPF32).subarray((((value) >> 2)), ((value + count * 8) >> 2));
  }
  GLctx.uniform2fv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform2fv = _glUniform2fv;

/** @suppress {duplicate } */ var _glUniform2i = (location, v0, v1) => {
  GLctx.uniform2i(webglGetUniformLocation(location), v0, v1);
};

var _emscripten_glUniform2i = _glUniform2i;

/** @suppress {duplicate } */ var _glUniform2iv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform2iv(webglGetUniformLocation(location), (growMemViews(), HEAP32), ((value) >> 2), count * 2);
    return;
  }
  if (count <= 144) {
    // avoid allocation when uploading few enough uniforms
    count *= 2;
    var view = miniTempWebGLIntBuffers[count];
    for (var i = 0; i < count; i += 2) {
      view[i] = (growMemViews(), HEAP32)[(((value) + (4 * i)) >> 2)];
      view[i + 1] = (growMemViews(), HEAP32)[(((value) + (4 * i + 4)) >> 2)];
    }
  } else {
    var view = (growMemViews(), HEAP32).subarray((((value) >> 2)), ((value + count * 8) >> 2));
  }
  GLctx.uniform2iv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform2iv = _glUniform2iv;

/** @suppress {duplicate } */ var _glUniform2ui = (location, v0, v1) => {
  GLctx.uniform2ui(webglGetUniformLocation(location), v0, v1);
};

var _emscripten_glUniform2ui = _glUniform2ui;

/** @suppress {duplicate } */ var _glUniform2uiv = (location, count, value) => {
  count && GLctx.uniform2uiv(webglGetUniformLocation(location), (growMemViews(), HEAPU32), ((value) >> 2), count * 2);
};

var _emscripten_glUniform2uiv = _glUniform2uiv;

/** @suppress {duplicate } */ var _glUniform3f = (location, v0, v1, v2) => {
  GLctx.uniform3f(webglGetUniformLocation(location), v0, v1, v2);
};

var _emscripten_glUniform3f = _glUniform3f;

/** @suppress {duplicate } */ var _glUniform3fv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform3fv(webglGetUniformLocation(location), (growMemViews(), HEAPF32), ((value) >> 2), count * 3);
    return;
  }
  if (count <= 96) {
    // avoid allocation when uploading few enough uniforms
    count *= 3;
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; i += 3) {
      view[i] = (growMemViews(), HEAPF32)[(((value) + (4 * i)) >> 2)];
      view[i + 1] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 4)) >> 2)];
      view[i + 2] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 8)) >> 2)];
    }
  } else {
    var view = (growMemViews(), HEAPF32).subarray((((value) >> 2)), ((value + count * 12) >> 2));
  }
  GLctx.uniform3fv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform3fv = _glUniform3fv;

/** @suppress {duplicate } */ var _glUniform3i = (location, v0, v1, v2) => {
  GLctx.uniform3i(webglGetUniformLocation(location), v0, v1, v2);
};

var _emscripten_glUniform3i = _glUniform3i;

/** @suppress {duplicate } */ var _glUniform3iv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform3iv(webglGetUniformLocation(location), (growMemViews(), HEAP32), ((value) >> 2), count * 3);
    return;
  }
  if (count <= 96) {
    // avoid allocation when uploading few enough uniforms
    count *= 3;
    var view = miniTempWebGLIntBuffers[count];
    for (var i = 0; i < count; i += 3) {
      view[i] = (growMemViews(), HEAP32)[(((value) + (4 * i)) >> 2)];
      view[i + 1] = (growMemViews(), HEAP32)[(((value) + (4 * i + 4)) >> 2)];
      view[i + 2] = (growMemViews(), HEAP32)[(((value) + (4 * i + 8)) >> 2)];
    }
  } else {
    var view = (growMemViews(), HEAP32).subarray((((value) >> 2)), ((value + count * 12) >> 2));
  }
  GLctx.uniform3iv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform3iv = _glUniform3iv;

/** @suppress {duplicate } */ var _glUniform3ui = (location, v0, v1, v2) => {
  GLctx.uniform3ui(webglGetUniformLocation(location), v0, v1, v2);
};

var _emscripten_glUniform3ui = _glUniform3ui;

/** @suppress {duplicate } */ var _glUniform3uiv = (location, count, value) => {
  count && GLctx.uniform3uiv(webglGetUniformLocation(location), (growMemViews(), HEAPU32), ((value) >> 2), count * 3);
};

var _emscripten_glUniform3uiv = _glUniform3uiv;

/** @suppress {duplicate } */ var _glUniform4f = (location, v0, v1, v2, v3) => {
  GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3);
};

var _emscripten_glUniform4f = _glUniform4f;

/** @suppress {duplicate } */ var _glUniform4fv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform4fv(webglGetUniformLocation(location), (growMemViews(), HEAPF32), ((value) >> 2), count * 4);
    return;
  }
  if (count <= 72) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLFloatBuffers[4 * count];
    // hoist the heap out of the loop for size and for pthreads+growth.
    var heap = (growMemViews(), HEAPF32);
    value = ((value) >> 2);
    count *= 4;
    for (var i = 0; i < count; i += 4) {
      var dst = value + i;
      view[i] = heap[dst];
      view[i + 1] = heap[dst + 1];
      view[i + 2] = heap[dst + 2];
      view[i + 3] = heap[dst + 3];
    }
  } else {
    var view = (growMemViews(), HEAPF32).subarray((((value) >> 2)), ((value + count * 16) >> 2));
  }
  GLctx.uniform4fv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform4fv = _glUniform4fv;

/** @suppress {duplicate } */ var _glUniform4i = (location, v0, v1, v2, v3) => {
  GLctx.uniform4i(webglGetUniformLocation(location), v0, v1, v2, v3);
};

var _emscripten_glUniform4i = _glUniform4i;

/** @suppress {duplicate } */ var _glUniform4iv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform4iv(webglGetUniformLocation(location), (growMemViews(), HEAP32), ((value) >> 2), count * 4);
    return;
  }
  if (count <= 72) {
    // avoid allocation when uploading few enough uniforms
    count *= 4;
    var view = miniTempWebGLIntBuffers[count];
    for (var i = 0; i < count; i += 4) {
      view[i] = (growMemViews(), HEAP32)[(((value) + (4 * i)) >> 2)];
      view[i + 1] = (growMemViews(), HEAP32)[(((value) + (4 * i + 4)) >> 2)];
      view[i + 2] = (growMemViews(), HEAP32)[(((value) + (4 * i + 8)) >> 2)];
      view[i + 3] = (growMemViews(), HEAP32)[(((value) + (4 * i + 12)) >> 2)];
    }
  } else {
    var view = (growMemViews(), HEAP32).subarray((((value) >> 2)), ((value + count * 16) >> 2));
  }
  GLctx.uniform4iv(webglGetUniformLocation(location), view);
};

var _emscripten_glUniform4iv = _glUniform4iv;

/** @suppress {duplicate } */ var _glUniform4ui = (location, v0, v1, v2, v3) => {
  GLctx.uniform4ui(webglGetUniformLocation(location), v0, v1, v2, v3);
};

var _emscripten_glUniform4ui = _glUniform4ui;

/** @suppress {duplicate } */ var _glUniform4uiv = (location, count, value) => {
  count && GLctx.uniform4uiv(webglGetUniformLocation(location), (growMemViews(), HEAPU32), ((value) >> 2), count * 4);
};

var _emscripten_glUniform4uiv = _glUniform4uiv;

/** @suppress {duplicate } */ var _glUniformBlockBinding = (program, uniformBlockIndex, uniformBlockBinding) => {
  program = GL.programs[program];
  GLctx.uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding);
};

var _emscripten_glUniformBlockBinding = _glUniformBlockBinding;

/** @suppress {duplicate } */ var _glUniformMatrix2fv = (location, count, transpose, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, (growMemViews(), 
    HEAPF32), ((value) >> 2), count * 4);
    return;
  }
  if (count <= 72) {
    // avoid allocation when uploading few enough uniforms
    count *= 4;
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; i += 4) {
      view[i] = (growMemViews(), HEAPF32)[(((value) + (4 * i)) >> 2)];
      view[i + 1] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 4)) >> 2)];
      view[i + 2] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 8)) >> 2)];
      view[i + 3] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 12)) >> 2)];
    }
  } else {
    var view = (growMemViews(), HEAPF32).subarray((((value) >> 2)), ((value + count * 16) >> 2));
  }
  GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, view);
};

var _emscripten_glUniformMatrix2fv = _glUniformMatrix2fv;

/** @suppress {duplicate } */ var _glUniformMatrix2x3fv = (location, count, transpose, value) => {
  count && GLctx.uniformMatrix2x3fv(webglGetUniformLocation(location), !!transpose, (growMemViews(), 
  HEAPF32), ((value) >> 2), count * 6);
};

var _emscripten_glUniformMatrix2x3fv = _glUniformMatrix2x3fv;

/** @suppress {duplicate } */ var _glUniformMatrix2x4fv = (location, count, transpose, value) => {
  count && GLctx.uniformMatrix2x4fv(webglGetUniformLocation(location), !!transpose, (growMemViews(), 
  HEAPF32), ((value) >> 2), count * 8);
};

var _emscripten_glUniformMatrix2x4fv = _glUniformMatrix2x4fv;

/** @suppress {duplicate } */ var _glUniformMatrix3fv = (location, count, transpose, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, (growMemViews(), 
    HEAPF32), ((value) >> 2), count * 9);
    return;
  }
  if (count <= 32) {
    // avoid allocation when uploading few enough uniforms
    count *= 9;
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; i += 9) {
      view[i] = (growMemViews(), HEAPF32)[(((value) + (4 * i)) >> 2)];
      view[i + 1] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 4)) >> 2)];
      view[i + 2] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 8)) >> 2)];
      view[i + 3] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 12)) >> 2)];
      view[i + 4] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 16)) >> 2)];
      view[i + 5] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 20)) >> 2)];
      view[i + 6] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 24)) >> 2)];
      view[i + 7] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 28)) >> 2)];
      view[i + 8] = (growMemViews(), HEAPF32)[(((value) + (4 * i + 32)) >> 2)];
    }
  } else {
    var view = (growMemViews(), HEAPF32).subarray((((value) >> 2)), ((value + count * 36) >> 2));
  }
  GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, view);
};

var _emscripten_glUniformMatrix3fv = _glUniformMatrix3fv;

/** @suppress {duplicate } */ var _glUniformMatrix3x2fv = (location, count, transpose, value) => {
  count && GLctx.uniformMatrix3x2fv(webglGetUniformLocation(location), !!transpose, (growMemViews(), 
  HEAPF32), ((value) >> 2), count * 6);
};

var _emscripten_glUniformMatrix3x2fv = _glUniformMatrix3x2fv;

/** @suppress {duplicate } */ var _glUniformMatrix3x4fv = (location, count, transpose, value) => {
  count && GLctx.uniformMatrix3x4fv(webglGetUniformLocation(location), !!transpose, (growMemViews(), 
  HEAPF32), ((value) >> 2), count * 12);
};

var _emscripten_glUniformMatrix3x4fv = _glUniformMatrix3x4fv;

/** @suppress {duplicate } */ var _glUniformMatrix4fv = (location, count, transpose, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, (growMemViews(), 
    HEAPF32), ((value) >> 2), count * 16);
    return;
  }
  if (count <= 18) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLFloatBuffers[16 * count];
    // hoist the heap out of the loop for size and for pthreads+growth.
    var heap = (growMemViews(), HEAPF32);
    value = ((value) >> 2);
    count *= 16;
    for (var i = 0; i < count; i += 16) {
      var dst = value + i;
      view[i] = heap[dst];
      view[i + 1] = heap[dst + 1];
      view[i + 2] = heap[dst + 2];
      view[i + 3] = heap[dst + 3];
      view[i + 4] = heap[dst + 4];
      view[i + 5] = heap[dst + 5];
      view[i + 6] = heap[dst + 6];
      view[i + 7] = heap[dst + 7];
      view[i + 8] = heap[dst + 8];
      view[i + 9] = heap[dst + 9];
      view[i + 10] = heap[dst + 10];
      view[i + 11] = heap[dst + 11];
      view[i + 12] = heap[dst + 12];
      view[i + 13] = heap[dst + 13];
      view[i + 14] = heap[dst + 14];
      view[i + 15] = heap[dst + 15];
    }
  } else {
    var view = (growMemViews(), HEAPF32).subarray((((value) >> 2)), ((value + count * 64) >> 2));
  }
  GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, view);
};

var _emscripten_glUniformMatrix4fv = _glUniformMatrix4fv;

/** @suppress {duplicate } */ var _glUniformMatrix4x2fv = (location, count, transpose, value) => {
  count && GLctx.uniformMatrix4x2fv(webglGetUniformLocation(location), !!transpose, (growMemViews(), 
  HEAPF32), ((value) >> 2), count * 8);
};

var _emscripten_glUniformMatrix4x2fv = _glUniformMatrix4x2fv;

/** @suppress {duplicate } */ var _glUniformMatrix4x3fv = (location, count, transpose, value) => {
  count && GLctx.uniformMatrix4x3fv(webglGetUniformLocation(location), !!transpose, (growMemViews(), 
  HEAPF32), ((value) >> 2), count * 12);
};

var _emscripten_glUniformMatrix4x3fv = _glUniformMatrix4x3fv;

/** @suppress {duplicate } */ var _glUnmapBuffer = target => {
  if (!emscriptenWebGLValidateMapBufferTarget(target)) {
    GL.recordError(1280);
    err("GL_INVALID_ENUM in glUnmapBuffer");
    return 0;
  }
  var buffer = emscriptenWebGLGetBufferBinding(target);
  var mapping = GL.mappedBuffers[buffer];
  if (!mapping || !mapping.mem) {
    GL.recordError(1282);
    err("buffer was never mapped in glUnmapBuffer");
    return 0;
  }
  if (!(mapping.access & 16)) {
    /* GL_MAP_FLUSH_EXPLICIT_BIT */ if (GL.currentContext.version >= 2) {
      GLctx.bufferSubData(target, mapping.offset, (growMemViews(), HEAPU8), mapping.mem, mapping.length);
    } else GLctx.bufferSubData(target, mapping.offset, (growMemViews(), HEAPU8).subarray(mapping.mem, mapping.mem + mapping.length));
  }
  _free(mapping.mem);
  mapping.mem = 0;
  return 1;
};

var _emscripten_glUnmapBuffer = _glUnmapBuffer;

/** @suppress {duplicate } */ var _glUseProgram = program => {
  program = GL.programs[program];
  GLctx.useProgram(program);
  // Record the currently active program so that we can access the uniform
  // mapping table of that program.
  GLctx.currentProgram = program;
};

var _emscripten_glUseProgram = _glUseProgram;

/** @suppress {duplicate } */ var _glValidateProgram = program => {
  GLctx.validateProgram(GL.programs[program]);
};

var _emscripten_glValidateProgram = _glValidateProgram;

/** @suppress {duplicate } */ var _glVertexAttrib1f = (x0, x1) => GLctx.vertexAttrib1f(x0, x1);

var _emscripten_glVertexAttrib1f = _glVertexAttrib1f;

/** @suppress {duplicate } */ var _glVertexAttrib1fv = (index, v) => {
  GLctx.vertexAttrib1f(index, (growMemViews(), HEAPF32)[v >> 2]);
};

var _emscripten_glVertexAttrib1fv = _glVertexAttrib1fv;

/** @suppress {duplicate } */ var _glVertexAttrib2f = (x0, x1, x2) => GLctx.vertexAttrib2f(x0, x1, x2);

var _emscripten_glVertexAttrib2f = _glVertexAttrib2f;

/** @suppress {duplicate } */ var _glVertexAttrib2fv = (index, v) => {
  GLctx.vertexAttrib2f(index, (growMemViews(), HEAPF32)[v >> 2], (growMemViews(), 
  HEAPF32)[v + 4 >> 2]);
};

var _emscripten_glVertexAttrib2fv = _glVertexAttrib2fv;

/** @suppress {duplicate } */ var _glVertexAttrib3f = (x0, x1, x2, x3) => GLctx.vertexAttrib3f(x0, x1, x2, x3);

var _emscripten_glVertexAttrib3f = _glVertexAttrib3f;

/** @suppress {duplicate } */ var _glVertexAttrib3fv = (index, v) => {
  GLctx.vertexAttrib3f(index, (growMemViews(), HEAPF32)[v >> 2], (growMemViews(), 
  HEAPF32)[v + 4 >> 2], (growMemViews(), HEAPF32)[v + 8 >> 2]);
};

var _emscripten_glVertexAttrib3fv = _glVertexAttrib3fv;

/** @suppress {duplicate } */ var _glVertexAttrib4f = (x0, x1, x2, x3, x4) => GLctx.vertexAttrib4f(x0, x1, x2, x3, x4);

var _emscripten_glVertexAttrib4f = _glVertexAttrib4f;

/** @suppress {duplicate } */ var _glVertexAttrib4fv = (index, v) => {
  GLctx.vertexAttrib4f(index, (growMemViews(), HEAPF32)[v >> 2], (growMemViews(), 
  HEAPF32)[v + 4 >> 2], (growMemViews(), HEAPF32)[v + 8 >> 2], (growMemViews(), HEAPF32)[v + 12 >> 2]);
};

var _emscripten_glVertexAttrib4fv = _glVertexAttrib4fv;

/** @suppress {duplicate } */ var _glVertexAttribDivisor = (index, divisor) => {
  GLctx.vertexAttribDivisor(index, divisor);
};

var _emscripten_glVertexAttribDivisor = _glVertexAttribDivisor;

/** @suppress {duplicate } */ var _glVertexAttribDivisorANGLE = _glVertexAttribDivisor;

var _emscripten_glVertexAttribDivisorANGLE = _glVertexAttribDivisorANGLE;

/** @suppress {duplicate } */ var _glVertexAttribDivisorARB = _glVertexAttribDivisor;

var _emscripten_glVertexAttribDivisorARB = _glVertexAttribDivisorARB;

/** @suppress {duplicate } */ var _glVertexAttribDivisorEXT = _glVertexAttribDivisor;

var _emscripten_glVertexAttribDivisorEXT = _glVertexAttribDivisorEXT;

/** @suppress {duplicate } */ var _glVertexAttribDivisorNV = _glVertexAttribDivisor;

var _emscripten_glVertexAttribDivisorNV = _glVertexAttribDivisorNV;

/** @suppress {duplicate } */ var _glVertexAttribI4i = (x0, x1, x2, x3, x4) => GLctx.vertexAttribI4i(x0, x1, x2, x3, x4);

var _emscripten_glVertexAttribI4i = _glVertexAttribI4i;

/** @suppress {duplicate } */ var _glVertexAttribI4iv = (index, v) => {
  GLctx.vertexAttribI4i(index, (growMemViews(), HEAP32)[v >> 2], (growMemViews(), 
  HEAP32)[v + 4 >> 2], (growMemViews(), HEAP32)[v + 8 >> 2], (growMemViews(), HEAP32)[v + 12 >> 2]);
};

var _emscripten_glVertexAttribI4iv = _glVertexAttribI4iv;

/** @suppress {duplicate } */ var _glVertexAttribI4ui = (x0, x1, x2, x3, x4) => GLctx.vertexAttribI4ui(x0, x1, x2, x3, x4);

var _emscripten_glVertexAttribI4ui = _glVertexAttribI4ui;

/** @suppress {duplicate } */ var _glVertexAttribI4uiv = (index, v) => {
  GLctx.vertexAttribI4ui(index, (growMemViews(), HEAPU32)[v >> 2], (growMemViews(), 
  HEAPU32)[v + 4 >> 2], (growMemViews(), HEAPU32)[v + 8 >> 2], (growMemViews(), HEAPU32)[v + 12 >> 2]);
};

var _emscripten_glVertexAttribI4uiv = _glVertexAttribI4uiv;

/** @suppress {duplicate } */ var _glVertexAttribIPointer = (index, size, type, stride, ptr) => {
  var cb = GL.currentContext.clientBuffers[index];
  if (!GLctx.currentArrayBufferBinding) {
    cb.size = size;
    cb.type = type;
    cb.normalized = false;
    cb.stride = stride;
    cb.ptr = ptr;
    cb.clientside = true;
    cb.vertexAttribPointerAdaptor = function(index, size, type, normalized, stride, ptr) {
      this.vertexAttribIPointer(index, size, type, stride, ptr);
    };
    return;
  }
  cb.clientside = false;
  GLctx.vertexAttribIPointer(index, size, type, stride, ptr);
};

var _emscripten_glVertexAttribIPointer = _glVertexAttribIPointer;

/** @suppress {duplicate } */ var _glVertexAttribPointer = (index, size, type, normalized, stride, ptr) => {
  var cb = GL.currentContext.clientBuffers[index];
  if (!GLctx.currentArrayBufferBinding) {
    cb.size = size;
    cb.type = type;
    cb.normalized = normalized;
    cb.stride = stride;
    cb.ptr = ptr;
    cb.clientside = true;
    cb.vertexAttribPointerAdaptor = function(index, size, type, normalized, stride, ptr) {
      this.vertexAttribPointer(index, size, type, normalized, stride, ptr);
    };
    return;
  }
  cb.clientside = false;
  GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
};

var _emscripten_glVertexAttribPointer = _glVertexAttribPointer;

/** @suppress {duplicate } */ var _glViewport = (x0, x1, x2, x3) => GLctx.viewport(x0, x1, x2, x3);

var _emscripten_glViewport = _glViewport;

/** @suppress {duplicate } */ var _glWaitSync = (sync, flags, timeout) => {
  // See WebGL2 vs GLES3 difference on GL_TIMEOUT_IGNORED above (https://www.khronos.org/registry/webgl/specs/latest/2.0/#5.15)
  timeout = Number(timeout);
  GLctx.waitSync(GL.syncs[sync], flags, timeout);
};

var _emscripten_glWaitSync = _glWaitSync;

var _emscripten_has_asyncify = () => 1;

var doRequestFullscreen = (target, strategy) => {
  if (!JSEvents.fullscreenEnabled()) return -1;
  target = findEventTarget(target);
  if (!target) return -4;
  if (!target.requestFullscreen && !target.webkitRequestFullscreen) {
    return -3;
  }
  // Queue this function call if we're not currently in an event handler and
  // the user saw it appropriate to do so.
  if (!JSEvents.canPerformEventHandlerRequests()) {
    if (strategy.deferUntilInEventHandler) {
      JSEvents.deferCall(JSEvents_requestFullscreen, 1, [ target, strategy ]);
      return 1;
    }
    return -2;
  }
  return JSEvents_requestFullscreen(target, strategy);
};

function _emscripten_request_fullscreen_strategy(target, deferUntilInEventHandler, fullscreenStrategy) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_request_fullscreen_strategy' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  var strategy = {
    scaleMode: (growMemViews(), HEAP32)[((fullscreenStrategy) >> 2)],
    canvasResolutionScaleMode: (growMemViews(), HEAP32)[(((fullscreenStrategy) + (4)) >> 2)],
    filteringMode: (growMemViews(), HEAP32)[(((fullscreenStrategy) + (8)) >> 2)],
    deferUntilInEventHandler,
    canvasResizedCallback: (growMemViews(), HEAP32)[(((fullscreenStrategy) + (12)) >> 2)],
    canvasResizedCallbackUserData: (growMemViews(), HEAP32)[(((fullscreenStrategy) + (16)) >> 2)]
  };
  return doRequestFullscreen(target, strategy);
}

function _emscripten_request_pointerlock(target, deferUntilInEventHandler) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_request_pointerlock' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  target = findEventTarget(target);
  if (!target) return -4;
  if (!target.requestPointerLock) {
    return -1;
  }
  // Queue this function call if we're not currently in an event handler and
  // the user saw it appropriate to do so.
  if (!JSEvents.canPerformEventHandlerRequests()) {
    if (deferUntilInEventHandler) {
      JSEvents.deferCall(requestPointerLock, 2, [ target ]);
      return 1;
    }
    return -2;
  }
  return requestPointerLock(target);
}

var getHeapMax = () => // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
// full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
// for any code that deals with heap sizes, which would require special
// casing all heap size related code to treat 0 specially.
2147483648;

var alignMemory = (size, alignment) => {
  assert(alignment, "alignment argument is required");
  return Math.ceil(size / alignment) * alignment;
};

var growMemory = size => {
  var b = wasmMemory.buffer;
  var pages = ((size - b.byteLength + 65535) / 65536) | 0;
  try {
    // round size grow request up to wasm page size (fixed 64KB per spec)
    wasmMemory.grow(pages);
    // .grow() takes a delta compared to the previous size
    updateMemoryViews();
    return 1;
  } catch (e) {
    err(`growMemory: Attempted to grow heap from ${b.byteLength} bytes to ${size} bytes, but got error: ${e}`);
  }
};

var _emscripten_resize_heap = requestedSize => {
  var oldSize = (growMemViews(), HEAPU8).length;
  // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
  requestedSize >>>= 0;
  // With multithreaded builds, races can happen (another thread might increase the size
  // in between), so return a failure, and let the caller retry.
  if (requestedSize <= oldSize) {
    return false;
  }
  // Memory resize rules:
  // 1.  Always increase heap size to at least the requested size, rounded up
  //     to next page multiple.
  // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
  //     geometrically: increase the heap size according to
  //     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
  //     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
  // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
  //     linearly: increase the heap size by at least
  //     MEMORY_GROWTH_LINEAR_STEP bytes.
  // 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
  //     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
  // 4.  If we were unable to allocate as much memory, it may be due to
  //     over-eager decision to excessively reserve due to (3) above.
  //     Hence if an allocation fails, cut down on the amount of excess
  //     growth, in an attempt to succeed to perform a smaller allocation.
  // A limit is set for how much we can grow. We should not exceed that
  // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
  var maxHeapSize = getHeapMax();
  if (requestedSize > maxHeapSize) {
    err(`Cannot enlarge memory, requested ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`);
    return false;
  }
  // Loop through potential heap size increases. If we attempt a too eager
  // reservation that fails, cut down on the attempted size and reserve a
  // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
    // ensure geometric growth
    // but limit overreserving (default to capping at +96MB overgrowth at most)
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
    var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
    var replacement = growMemory(newSize);
    if (replacement) {
      return true;
    }
  }
  err(`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`);
  return false;
};

/** @suppress {checkTypes} */ function _emscripten_sample_gamepad_data() {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_sample_gamepad_data' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  try {
    if (navigator.getGamepads) return (JSEvents.lastGamepadState = navigator.getGamepads()) ? 0 : -1;
  } catch (e) {
    err(`navigator.getGamepads() exists, but failed to execute with exception ${e}. Disabling Gamepad access.`);
    navigator.getGamepads = null;
  }
  return -1;
}

var registerBeforeUnloadEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) => {
  var beforeUnloadEventHandlerFunc = (e = event) => {
    // Note: This is always called on the main browser thread, since it needs synchronously return a value!
    var confirmationMessage = ((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, 0, userData);
    if (confirmationMessage) {
      confirmationMessage = UTF8ToString(confirmationMessage);
    }
    if (confirmationMessage) {
      e.preventDefault();
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    }
  };
  var eventHandler = {
    target: findEventTarget(target),
    eventTypeString,
    callbackfunc,
    handlerFunc: beforeUnloadEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_beforeunload_callback_on_thread(userData, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_beforeunload_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  if (typeof onbeforeunload == "undefined") return -1;
  // beforeunload callback can only be registered on the main browser thread, because the page will go away immediately after returning from the handler,
  // and there is no time to start proxying it anywhere.
  if (targetThread !== 1) return -5;
  return registerBeforeUnloadEventCallback(2, userData, true, callbackfunc, 28, "beforeunload");
}

var registerFocusEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.focusEvent ||= _malloc(256);
  var focusEventHandlerFunc = (e = event) => {
    var nodeName = JSEvents.getNodeNameForTarget(e.target);
    var id = e.target.id ? e.target.id : "";
    var focusEvent = JSEvents.focusEvent;
    stringToUTF8(nodeName, focusEvent + 0, 128);
    stringToUTF8(id, focusEvent + 128, 128);
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, focusEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target: findEventTarget(target),
    eventTypeString,
    callbackfunc,
    handlerFunc: focusEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_blur_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_blur_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerFocusEventCallback(target, userData, useCapture, callbackfunc, 12, "blur", targetThread);
}

function _emscripten_set_element_css_size(target, width, height) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_element_css_size' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  target = findEventTarget(target);
  if (!target) return -4;
  target.style.width = width + "px";
  target.style.height = height + "px";
  return 0;
}

function _emscripten_set_focus_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_focus_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerFocusEventCallback(target, userData, useCapture, callbackfunc, 13, "focus", targetThread);
}

var fillFullscreenChangeEventData = eventStruct => {
  var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  var isFullscreen = !!fullscreenElement;
  // Assigning a boolean to HEAP32 with expected type coercion.
  /** @suppress{checkTypes} */ (growMemViews(), HEAP8)[eventStruct] = isFullscreen;
  (growMemViews(), HEAP8)[(eventStruct) + (1)] = JSEvents.fullscreenEnabled();
  // If transitioning to fullscreen, report info about the element that is now fullscreen.
  // If transitioning to windowed mode, report info about the element that just was fullscreen.
  var reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement;
  var nodeName = JSEvents.getNodeNameForTarget(reportedElement);
  var id = reportedElement?.id || "";
  stringToUTF8(nodeName, eventStruct + 2, 128);
  stringToUTF8(id, eventStruct + 130, 128);
  (growMemViews(), HEAP32)[(((eventStruct) + (260)) >> 2)] = reportedElement ? reportedElement.clientWidth : 0;
  (growMemViews(), HEAP32)[(((eventStruct) + (264)) >> 2)] = reportedElement ? reportedElement.clientHeight : 0;
  (growMemViews(), HEAP32)[(((eventStruct) + (268)) >> 2)] = screen.width;
  (growMemViews(), HEAP32)[(((eventStruct) + (272)) >> 2)] = screen.height;
  if (isFullscreen) {
    JSEvents.previousFullscreenElement = fullscreenElement;
  }
};

var registerFullscreenChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.fullscreenChangeEvent ||= _malloc(276);
  var fullscreenChangeEventhandlerFunc = (e = event) => {
    var fullscreenChangeEvent = JSEvents.fullscreenChangeEvent;
    fillFullscreenChangeEventData(fullscreenChangeEvent);
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, fullscreenChangeEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target,
    eventTypeString,
    callbackfunc,
    handlerFunc: fullscreenChangeEventhandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_fullscreenchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_fullscreenchange_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  if (!JSEvents.fullscreenEnabled()) return -1;
  target = findEventTarget(target);
  if (!target) return -4;
  // Unprefixed Fullscreen API shipped in Chromium 71 (https://bugs.chromium.org/p/chromium/issues/detail?id=383813)
  // As of Safari 13.0.3 on macOS Catalina 10.15.1 still ships with prefixed webkitfullscreenchange. TODO: revisit this check once Safari ships unprefixed version.
  registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "webkitfullscreenchange", targetThread);
  return registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "fullscreenchange", targetThread);
}

var registerGamepadEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.gamepadEvent ||= _malloc(1240);
  var gamepadEventHandlerFunc = (e = event) => {
    var gamepadEvent = JSEvents.gamepadEvent;
    fillGamepadEventData(gamepadEvent, e["gamepad"]);
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, gamepadEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target: findEventTarget(target),
    allowsDeferredCalls: true,
    eventTypeString,
    callbackfunc,
    handlerFunc: gamepadEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_gamepadconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_gamepadconnected_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  if (_emscripten_sample_gamepad_data()) return -1;
  return registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 26, "gamepadconnected", targetThread);
}

function _emscripten_set_gamepaddisconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_gamepaddisconnected_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  if (_emscripten_sample_gamepad_data()) return -1;
  return registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 27, "gamepaddisconnected", targetThread);
}

var registerKeyEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.keyEvent ||= _malloc(160);
  var keyEventHandlerFunc = e => {
    assert(e);
    var keyEventData = JSEvents.keyEvent;
    (growMemViews(), HEAPF64)[((keyEventData) >> 3)] = e.timeStamp;
    var idx = ((keyEventData) >> 2);
    (growMemViews(), HEAP32)[idx + 2] = e.location;
    (growMemViews(), HEAP8)[keyEventData + 12] = e.ctrlKey;
    (growMemViews(), HEAP8)[keyEventData + 13] = e.shiftKey;
    (growMemViews(), HEAP8)[keyEventData + 14] = e.altKey;
    (growMemViews(), HEAP8)[keyEventData + 15] = e.metaKey;
    (growMemViews(), HEAP8)[keyEventData + 16] = e.repeat;
    (growMemViews(), HEAP32)[idx + 5] = e.charCode;
    (growMemViews(), HEAP32)[idx + 6] = e.keyCode;
    (growMemViews(), HEAP32)[idx + 7] = e.which;
    stringToUTF8(e.key || "", keyEventData + 32, 32);
    stringToUTF8(e.code || "", keyEventData + 64, 32);
    stringToUTF8(e.char || "", keyEventData + 96, 32);
    stringToUTF8(e.locale || "", keyEventData + 128, 32);
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, keyEventData, userData)) e.preventDefault();
  };
  var eventHandler = {
    target: findEventTarget(target),
    eventTypeString,
    callbackfunc,
    handlerFunc: keyEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_keydown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_keydown_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerKeyEventCallback(target, userData, useCapture, callbackfunc, 2, "keydown", targetThread);
}

function _emscripten_set_keypress_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_keypress_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerKeyEventCallback(target, userData, useCapture, callbackfunc, 1, "keypress", targetThread);
}

function _emscripten_set_keyup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_keyup_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerKeyEventCallback(target, userData, useCapture, callbackfunc, 3, "keyup", targetThread);
}

var _emscripten_set_main_loop = (func, fps, simulateInfiniteLoop) => {
  var iterFunc = (() => dynCall_v(func));
  setMainLoop(iterFunc, fps, simulateInfiniteLoop);
};

var fillMouseEventData = (eventStruct, e, target) => {
  assert(eventStruct % 4 == 0);
  (growMemViews(), HEAPF64)[((eventStruct) >> 3)] = e.timeStamp;
  var idx = ((eventStruct) >> 2);
  (growMemViews(), HEAP32)[idx + 2] = e.screenX;
  (growMemViews(), HEAP32)[idx + 3] = e.screenY;
  (growMemViews(), HEAP32)[idx + 4] = e.clientX;
  (growMemViews(), HEAP32)[idx + 5] = e.clientY;
  (growMemViews(), HEAP8)[eventStruct + 24] = e.ctrlKey;
  (growMemViews(), HEAP8)[eventStruct + 25] = e.shiftKey;
  (growMemViews(), HEAP8)[eventStruct + 26] = e.altKey;
  (growMemViews(), HEAP8)[eventStruct + 27] = e.metaKey;
  (growMemViews(), HEAP16)[idx * 2 + 14] = e.button;
  (growMemViews(), HEAP16)[idx * 2 + 15] = e.buttons;
  (growMemViews(), HEAP32)[idx + 8] = e["movementX"];
  (growMemViews(), HEAP32)[idx + 9] = e["movementY"];
  // Note: rect contains doubles (truncated to placate SAFE_HEAP, which is the same behaviour when writing to HEAP32 anyway)
  var rect = getBoundingClientRect(target);
  (growMemViews(), HEAP32)[idx + 10] = e.clientX - (rect.left | 0);
  (growMemViews(), HEAP32)[idx + 11] = e.clientY - (rect.top | 0);
};

var registerMouseEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.mouseEvent ||= _malloc(64);
  target = findEventTarget(target);
  var mouseEventHandlerFunc = (e = event) => {
    // TODO: Make this access thread safe, or this could update live while app is reading it.
    fillMouseEventData(JSEvents.mouseEvent, e, target);
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, JSEvents.mouseEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target,
    allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave",
    // Mouse move events do not allow fullscreen/pointer lock requests to be handled in them!
    eventTypeString,
    callbackfunc,
    handlerFunc: mouseEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_mousedown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_mousedown_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerMouseEventCallback(target, userData, useCapture, callbackfunc, 5, "mousedown", targetThread);
}

function _emscripten_set_mouseenter_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_mouseenter_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerMouseEventCallback(target, userData, useCapture, callbackfunc, 33, "mouseenter", targetThread);
}

function _emscripten_set_mouseleave_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_mouseleave_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerMouseEventCallback(target, userData, useCapture, callbackfunc, 34, "mouseleave", targetThread);
}

function _emscripten_set_mousemove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_mousemove_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove", targetThread);
}

function _emscripten_set_mouseup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_mouseup_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerMouseEventCallback(target, userData, useCapture, callbackfunc, 6, "mouseup", targetThread);
}

var screenOrientation = () => {
  if (!window.screen) return undefined;
  return screen.orientation || screen["mozOrientation"] || screen["webkitOrientation"];
};

var fillOrientationChangeEventData = eventStruct => {
  // OrientationType enum
  var orientationsType1 = [ "portrait-primary", "portrait-secondary", "landscape-primary", "landscape-secondary" ];
  // alternative selection from OrientationLockType enum
  var orientationsType2 = [ "portrait", "portrait", "landscape", "landscape" ];
  var orientationIndex = 0;
  var orientationAngle = 0;
  var screenOrientObj = screenOrientation();
  if (typeof screenOrientObj === "object") {
    orientationIndex = orientationsType1.indexOf(screenOrientObj.type);
    if (orientationIndex < 0) {
      orientationIndex = orientationsType2.indexOf(screenOrientObj.type);
    }
    if (orientationIndex >= 0) {
      orientationIndex = 1 << orientationIndex;
    }
    orientationAngle = screenOrientObj.angle;
  } else {
    // fallback for Safari earlier than 16.4 (March 2023)
    orientationAngle = window.orientation;
  }
  (growMemViews(), HEAP32)[((eventStruct) >> 2)] = orientationIndex;
  (growMemViews(), HEAP32)[(((eventStruct) + (4)) >> 2)] = orientationAngle;
};

var registerOrientationChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.orientationChangeEvent ||= _malloc(8);
  var orientationChangeEventHandlerFunc = (e = event) => {
    var orientationChangeEvent = JSEvents.orientationChangeEvent;
    fillOrientationChangeEventData(orientationChangeEvent);
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, orientationChangeEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target,
    eventTypeString,
    callbackfunc,
    handlerFunc: orientationChangeEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_orientationchange_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_orientationchange_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  if (!window.screen || !screen.orientation) return -1;
  return registerOrientationChangeEventCallback(screen.orientation, userData, useCapture, callbackfunc, 18, "change", targetThread);
}

var fillPointerlockChangeEventData = eventStruct => {
  var pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement;
  var isPointerlocked = !!pointerLockElement;
  // Assigning a boolean to HEAP32 with expected type coercion.
  /** @suppress{checkTypes} */ (growMemViews(), HEAP8)[eventStruct] = isPointerlocked;
  var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
  var id = pointerLockElement?.id || "";
  stringToUTF8(nodeName, eventStruct + 1, 128);
  stringToUTF8(id, eventStruct + 129, 128);
};

var registerPointerlockChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.pointerlockChangeEvent ||= _malloc(257);
  var pointerlockChangeEventHandlerFunc = (e = event) => {
    var pointerlockChangeEvent = JSEvents.pointerlockChangeEvent;
    fillPointerlockChangeEventData(pointerlockChangeEvent);
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, pointerlockChangeEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target,
    eventTypeString,
    callbackfunc,
    handlerFunc: pointerlockChangeEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

/** @suppress {missingProperties} */ function _emscripten_set_pointerlockchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_pointerlockchange_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  // TODO: Currently not supported in pthreads or in --proxy-to-worker mode. (In pthreads mode, document object is not defined)
  if (!document || !document.body || (!document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock)) {
    return -1;
  }
  target = findEventTarget(target);
  if (!target) return -4;
  registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mozpointerlockchange", targetThread);
  registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "webkitpointerlockchange", targetThread);
  registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mspointerlockchange", targetThread);
  return registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "pointerlockchange", targetThread);
}

var registerUiEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.uiEvent ||= _malloc(36);
  target = findEventTarget(target);
  var uiEventHandlerFunc = (e = event) => {
    if (e.target != target) {
      // Never take ui events such as scroll via a 'bubbled' route, but always from the direct element that
      // was targeted. Otherwise e.g. if app logs a message in response to a page scroll, the Emscripten log
      // message box could cause to scroll, generating a new (bubbled) scroll message, causing a new log print,
      // causing a new scroll, etc..
      return;
    }
    var b = document.body;
    // Take document.body to a variable, Closure compiler does not outline access to it on its own.
    if (!b) {
      // During a page unload 'body' can be null, with "Cannot read property 'clientWidth' of null" being thrown
      return;
    }
    var uiEvent = JSEvents.uiEvent;
    (growMemViews(), HEAP32)[((uiEvent) >> 2)] = 0;
    // always zero for resize and scroll
    (growMemViews(), HEAP32)[(((uiEvent) + (4)) >> 2)] = b.clientWidth;
    (growMemViews(), HEAP32)[(((uiEvent) + (8)) >> 2)] = b.clientHeight;
    (growMemViews(), HEAP32)[(((uiEvent) + (12)) >> 2)] = innerWidth;
    (growMemViews(), HEAP32)[(((uiEvent) + (16)) >> 2)] = innerHeight;
    (growMemViews(), HEAP32)[(((uiEvent) + (20)) >> 2)] = outerWidth;
    (growMemViews(), HEAP32)[(((uiEvent) + (24)) >> 2)] = outerHeight;
    (growMemViews(), HEAP32)[(((uiEvent) + (28)) >> 2)] = pageXOffset | 0;
    // scroll offsets are float
    (growMemViews(), HEAP32)[(((uiEvent) + (32)) >> 2)] = pageYOffset | 0;
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, uiEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target,
    eventTypeString,
    callbackfunc,
    handlerFunc: uiEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_resize_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_resize_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerUiEventCallback(target, userData, useCapture, callbackfunc, 10, "resize", targetThread);
}

var registerTouchEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.touchEvent ||= _malloc(1552);
  target = findEventTarget(target);
  var touchEventHandlerFunc = e => {
    assert(e);
    var t, touches = {}, et = e.touches;
    // To ease marshalling different kinds of touches that browser reports (all touches are listed in e.touches,
    // only changed touches in e.changedTouches, and touches on target at a.targetTouches), mark a boolean in
    // each Touch object so that we can later loop only once over all touches we see to marshall over to Wasm.
    for (let t of et) {
      // Browser might recycle the generated Touch objects between each frame (Firefox on Android), so reset any
      // changed/target states we may have set from previous frame.
      t.isChanged = t.onTarget = 0;
      touches[t.identifier] = t;
    }
    // Mark which touches are part of the changedTouches list.
    for (let t of e.changedTouches) {
      t.isChanged = 1;
      touches[t.identifier] = t;
    }
    // Mark which touches are part of the targetTouches list.
    for (let t of e.targetTouches) {
      touches[t.identifier].onTarget = 1;
    }
    var touchEvent = JSEvents.touchEvent;
    (growMemViews(), HEAPF64)[((touchEvent) >> 3)] = e.timeStamp;
    (growMemViews(), HEAP8)[touchEvent + 12] = e.ctrlKey;
    (growMemViews(), HEAP8)[touchEvent + 13] = e.shiftKey;
    (growMemViews(), HEAP8)[touchEvent + 14] = e.altKey;
    (growMemViews(), HEAP8)[touchEvent + 15] = e.metaKey;
    var idx = touchEvent + 16;
    var targetRect = getBoundingClientRect(target);
    var numTouches = 0;
    for (let t of Object.values(touches)) {
      var idx32 = ((idx) >> 2);
      // Pre-shift the ptr to index to HEAP32 to save code size
      (growMemViews(), HEAP32)[idx32 + 0] = t.identifier;
      (growMemViews(), HEAP32)[idx32 + 1] = t.screenX;
      (growMemViews(), HEAP32)[idx32 + 2] = t.screenY;
      (growMemViews(), HEAP32)[idx32 + 3] = t.clientX;
      (growMemViews(), HEAP32)[idx32 + 4] = t.clientY;
      (growMemViews(), HEAP32)[idx32 + 5] = t.pageX;
      (growMemViews(), HEAP32)[idx32 + 6] = t.pageY;
      (growMemViews(), HEAP8)[idx + 28] = t.isChanged;
      (growMemViews(), HEAP8)[idx + 29] = t.onTarget;
      (growMemViews(), HEAP32)[idx32 + 8] = t.clientX - (targetRect.left | 0);
      (growMemViews(), HEAP32)[idx32 + 9] = t.clientY - (targetRect.top | 0);
      idx += 48;
      if (++numTouches > 31) {
        break;
      }
    }
    (growMemViews(), HEAP32)[(((touchEvent) + (8)) >> 2)] = numTouches;
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, touchEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target,
    allowsDeferredCalls: eventTypeString == "touchstart" || eventTypeString == "touchend",
    eventTypeString,
    callbackfunc,
    handlerFunc: touchEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_touchcancel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_touchcancel_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel", targetThread);
}

function _emscripten_set_touchend_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_touchend_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend", targetThread);
}

function _emscripten_set_touchmove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_touchmove_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove", targetThread);
}

function _emscripten_set_touchstart_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_touchstart_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart", targetThread);
}

var fillVisibilityChangeEventData = eventStruct => {
  var visibilityStates = [ "hidden", "visible", "prerender", "unloaded" ];
  var visibilityState = visibilityStates.indexOf(document.visibilityState);
  // Assigning a boolean to HEAP32 with expected type coercion.
  /** @suppress{checkTypes} */ (growMemViews(), HEAP8)[eventStruct] = document.hidden;
  (growMemViews(), HEAP32)[(((eventStruct) + (4)) >> 2)] = visibilityState;
};

var registerVisibilityChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.visibilityChangeEvent ||= _malloc(8);
  var visibilityChangeEventHandlerFunc = (e = event) => {
    var visibilityChangeEvent = JSEvents.visibilityChangeEvent;
    fillVisibilityChangeEventData(visibilityChangeEvent);
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, visibilityChangeEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target,
    eventTypeString,
    callbackfunc,
    handlerFunc: visibilityChangeEventHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_visibilitychange_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_visibilitychange_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  if (!specialHTMLTargets[1]) {
    return -4;
  }
  return registerVisibilityChangeEventCallback(specialHTMLTargets[1], userData, useCapture, callbackfunc, 21, "visibilitychange", targetThread);
}

var registerWheelEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
  JSEvents.wheelEvent ||= _malloc(96);
  // The DOM Level 3 events spec event 'wheel'
  var wheelHandlerFunc = (e = event) => {
    var wheelEvent = JSEvents.wheelEvent;
    fillMouseEventData(wheelEvent, e, target);
    (growMemViews(), HEAPF64)[(((wheelEvent) + (64)) >> 3)] = e["deltaX"];
    (growMemViews(), HEAPF64)[(((wheelEvent) + (72)) >> 3)] = e["deltaY"];
    (growMemViews(), HEAPF64)[(((wheelEvent) + (80)) >> 3)] = e["deltaZ"];
    (growMemViews(), HEAP32)[(((wheelEvent) + (88)) >> 2)] = e["deltaMode"];
    if (((a1, a2, a3) => dynCall_iiii(callbackfunc, a1, a2, a3))(eventTypeId, wheelEvent, userData)) e.preventDefault();
  };
  var eventHandler = {
    target,
    allowsDeferredCalls: true,
    eventTypeString,
    callbackfunc,
    handlerFunc: wheelHandlerFunc,
    useCapture
  };
  return JSEvents.registerOrRemoveHandler(eventHandler);
};

function _emscripten_set_wheel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_wheel_callback_on_thread' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  target = findEventTarget(target);
  if (!target) return -4;
  if (typeof target.onwheel != "undefined") {
    return registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "wheel", targetThread);
  } else {
    return -1;
  }
}

function _emscripten_set_window_title(title) {
  assert(!ENVIRONMENT_IS_WASM_WORKER, "Attempted to call proxied function '_emscripten_set_window_title' in a Wasm Worker, but in Wasm Worker enabled builds, proxied function architecture is not available!");
  document.title = UTF8ToString(title);
}

var _emscripten_sleep = ms => Asyncify.handleSleep(wakeUp => safeSetTimeout(wakeUp, ms));

_emscripten_sleep.isAsync = true;

var _wasmWorkersID = 1;

var _EmAudioDispatchProcessorCallback = e => {
  let data = e.data;
  // '_wsc' is short for 'wasm call', trying to use an identifier name that
  // will never conflict with user code
  let wasmCall = data["_wsc"];
  wasmCall && getWasmTableEntry(wasmCall)(...data.args);
};

var _emscripten_start_wasm_audio_worklet_thread_async = (contextHandle, stackLowestAddress, stackSize, callback, userData) => {
  assert(contextHandle, `Called emscripten_start_wasm_audio_worklet_thread_async() with a null Web Audio Context handle!`);
  assert(EmAudio[contextHandle], `Called emscripten_start_wasm_audio_worklet_thread_async() with a nonexisting/already freed Web Audio Context handle ${contextHandle}!`);
  assert(EmAudio[contextHandle] instanceof (window.AudioContext || window.webkitAudioContext), `Called emscripten_start_wasm_audio_worklet_thread_async() on a context handle ${contextHandle} that is not an AudioContext, but of type ${typeof EmAudio[contextHandle]}`);
  let audioContext = EmAudio[contextHandle], audioWorklet = audioContext.audioWorklet;
  assert(stackLowestAddress != 0, "AudioWorklets require a dedicated stack space for audio data marshalling between Wasm and JS!");
  assert(stackLowestAddress % 16 == 0, `AudioWorklet stack should be aligned to 16 bytes! (was ${stackLowestAddress} == ${stackLowestAddress % 16} mod 16) Use e.g. memalign(16, stackSize) to align the stack!`);
  assert(stackSize != 0, "AudioWorklets require a dedicated stack space for audio data marshalling between Wasm and JS!");
  assert(stackSize % 16 == 0, `AudioWorklet stack size should be a multiple of 16 bytes! (was ${stackSize} == ${stackSize % 16} mod 16)`);
  assert(!audioContext.audioWorkletInitialized, "emscripten_create_wasm_audio_worklet() was already called for AudioContext " + contextHandle + "! Only call this function once per AudioContext!");
  audioContext.audioWorkletInitialized = 1;
  let audioWorkletCreationFailed = () => {
    console.error(`emscripten_start_wasm_audio_worklet_thread_async() addModule() failed!`);
    ((a1, a2, a3) => dynCall_viii(callback, a1, a2, a3))(contextHandle, 0, userData);
  };
  // Does browser not support AudioWorklets?
  if (!audioWorklet) {
    if (location.protocol == "http:") {
      console.error(`AudioWorklets are not supported. This is possibly due to running the page over unsecure http:// protocol. Try running over https://, or debug via a localhost-based server, which should also allow AudioWorklets to function.`);
    } else {
      console.error(`AudioWorklets are not supported by current browser.`);
    }
    return audioWorkletCreationFailed();
  }
  audioWorklet.addModule(locateFile("beatboxx.js")).then(() => {
    audioWorklet.bootstrapMessage = new AudioWorkletNode(audioContext, "em-bootstrap", {
      processorOptions: {
        // Assign the loaded AudioWorkletGlobalScope a Wasm Worker ID so that
        // it can utilized its own TLS slots, and it is recognized to not be
        // the main browser thread.
        wwID: _wasmWorkersID++,
        wasm: wasmModule,
        wasmMemory,
        stackLowestAddress,
        // sb = stack base
        stackSize
      }
    });
    audioWorklet.bootstrapMessage.port.onmessage = _EmAudioDispatchProcessorCallback;
    ((a1, a2, a3) => dynCall_viii(callback, a1, a2, a3))(contextHandle, 1, userData);
  }).catch(audioWorkletCreationFailed);
};

var webglPowerPreferences = [ "default", "low-power", "high-performance" ];

/** @suppress {duplicate } */ var _emscripten_webgl_do_create_context = (target, attributes) => {
  assert(attributes);
  var attr32 = ((attributes) >> 2);
  var powerPreference = (growMemViews(), HEAP32)[attr32 + (8 >> 2)];
  var contextAttributes = {
    "alpha": !!(growMemViews(), HEAP8)[attributes + 0],
    "depth": !!(growMemViews(), HEAP8)[attributes + 1],
    "stencil": !!(growMemViews(), HEAP8)[attributes + 2],
    "antialias": !!(growMemViews(), HEAP8)[attributes + 3],
    "premultipliedAlpha": !!(growMemViews(), HEAP8)[attributes + 4],
    "preserveDrawingBuffer": !!(growMemViews(), HEAP8)[attributes + 5],
    "powerPreference": webglPowerPreferences[powerPreference],
    "failIfMajorPerformanceCaveat": !!(growMemViews(), HEAP8)[attributes + 12],
    // The following are not predefined WebGL context attributes in the WebGL specification, so the property names can be minified by Closure.
    majorVersion: (growMemViews(), HEAP32)[attr32 + (16 >> 2)],
    minorVersion: (growMemViews(), HEAP32)[attr32 + (20 >> 2)],
    enableExtensionsByDefault: (growMemViews(), HEAP8)[attributes + 24],
    explicitSwapControl: (growMemViews(), HEAP8)[attributes + 25],
    proxyContextToMainThread: (growMemViews(), HEAP32)[attr32 + (28 >> 2)],
    renderViaOffscreenBackBuffer: (growMemViews(), HEAP8)[attributes + 32]
  };
  //  TODO: Make these into hard errors at some point in the future
  if (contextAttributes.majorVersion !== 1 && contextAttributes.majorVersion !== 2) {
    err(`Invalid WebGL version requested: ${contextAttributes.majorVersion}`);
  }
  var canvas = findCanvasEventTarget(target);
  if (!canvas) {
    return 0;
  }
  if (contextAttributes.explicitSwapControl) {
    return 0;
  }
  var contextHandle = GL.createContext(canvas, contextAttributes);
  return contextHandle;
};

var _emscripten_webgl_create_context = _emscripten_webgl_do_create_context;

var _emscripten_webgl_destroy_context = contextHandle => {
  if (GL.currentContext == contextHandle) GL.currentContext = 0;
  GL.deleteContext(contextHandle);
};

var _emscripten_webgl_make_context_current = contextHandle => {
  var success = GL.makeContextCurrent(contextHandle);
  return success ? 0 : -5;
};

var ENV = {};

var getExecutableName = () => thisProgram || "./this.program";

var getEnvStrings = () => {
  if (!getEnvStrings.strings) {
    // Default values.
    // Browser language detection #8751
    var lang = ((typeof navigator == "object" && navigator.language) || "C").replace("-", "_") + ".UTF-8";
    var env = {
      "USER": "web_user",
      "LOGNAME": "web_user",
      "PATH": "/",
      "PWD": "/",
      "HOME": "/home/web_user",
      "LANG": lang,
      "_": getExecutableName()
    };
    // Apply the user-provided values, if any.
    for (var x in ENV) {
      // x is a key in ENV; if ENV[x] is undefined, that means it was
      // explicitly set to be so. We allow user code to do that to
      // force variables with default values to remain unset.
      if (ENV[x] === undefined) delete env[x]; else env[x] = ENV[x];
    }
    var strings = [];
    for (var x in env) {
      strings.push(`${x}=${env[x]}`);
    }
    getEnvStrings.strings = strings;
  }
  return getEnvStrings.strings;
};

var _environ_get = (__environ, environ_buf) => {
  var bufSize = 0;
  var envp = 0;
  for (var string of getEnvStrings()) {
    var ptr = environ_buf + bufSize;
    (growMemViews(), HEAPU32)[(((__environ) + (envp)) >> 2)] = ptr;
    bufSize += stringToUTF8(string, ptr, Infinity) + 1;
    envp += 4;
  }
  return 0;
};

var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
  var strings = getEnvStrings();
  (growMemViews(), HEAPU32)[((penviron_count) >> 2)] = strings.length;
  var bufSize = 0;
  for (var string of strings) {
    bufSize += lengthBytesUTF8(string) + 1;
  }
  (growMemViews(), HEAPU32)[((penviron_buf_size) >> 2)] = bufSize;
  return 0;
};

function _fd_close(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.close(stream);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

/** @param {number=} offset */ var doReadv = (stream, iov, iovcnt, offset) => {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = (growMemViews(), HEAPU32)[((iov) >> 2)];
    var len = (growMemViews(), HEAPU32)[(((iov) + (4)) >> 2)];
    iov += 8;
    var curr = FS.read(stream, (growMemViews(), HEAP8), ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
    if (curr < len) break;
    // nothing more to read
    if (typeof offset != "undefined") {
      offset += curr;
    }
  }
  return ret;
};

function _fd_read(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doReadv(stream, iov, iovcnt);
    (growMemViews(), HEAPU32)[((pnum) >> 2)] = num;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

function _fd_seek(fd, offset, whence, newOffset) {
  offset = bigintToI53Checked(offset);
  try {
    if (isNaN(offset)) return 61;
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.llseek(stream, offset, whence);
    (growMemViews(), HEAP64)[((newOffset) >> 3)] = BigInt(stream.position);
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
    // reset readdir state
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

/** @param {number=} offset */ var doWritev = (stream, iov, iovcnt, offset) => {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = (growMemViews(), HEAPU32)[((iov) >> 2)];
    var len = (growMemViews(), HEAPU32)[(((iov) + (4)) >> 2)];
    iov += 8;
    var curr = FS.write(stream, (growMemViews(), HEAP8), ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
    if (curr < len) {
      // No more space to write.
      break;
    }
    if (typeof offset != "undefined") {
      offset += curr;
    }
  }
  return ret;
};

function _fd_write(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doWritev(stream, iov, iovcnt);
    (growMemViews(), HEAPU32)[((pnum) >> 2)] = num;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

function _random_get(buffer, size) {
  try {
    randomFill((growMemViews(), HEAPU8).subarray(buffer, buffer + size));
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

/** @param {Object=} elements */ var autoResumeAudioContext = (ctx, elements) => {
  if (!elements) {
    elements = [ document, document.getElementById("canvas") ];
  }
  [ "keydown", "mousedown", "touchstart" ].forEach(event => {
    elements.forEach(element => {
      element?.addEventListener(event, () => {
        if (ctx.state === "suspended") ctx.resume();
      }, {
        "once": true
      });
    });
  });
};

var writeArrayToMemory = (array, buffer) => {
  assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
  (growMemViews(), HEAP8).set(array, buffer);
};

var runAndAbortIfError = func => {
  try {
    return func();
  } catch (e) {
    abort(e);
  }
};

var sigToWasmTypes = sig => {
  var typeNames = {
    "i": "i32",
    "j": "i64",
    "f": "f32",
    "d": "f64",
    "e": "externref",
    "p": "i32"
  };
  var type = {
    parameters: [],
    results: sig[0] == "v" ? [] : [ typeNames[sig[0]] ]
  };
  for (var i = 1; i < sig.length; ++i) {
    assert(sig[i] in typeNames, "invalid signature char: " + sig[i]);
    type.parameters.push(typeNames[sig[i]]);
  }
  return type;
};

var runtimeKeepalivePush = () => {
  runtimeKeepaliveCounter += 1;
};

var runtimeKeepalivePop = () => {
  assert(runtimeKeepaliveCounter > 0);
  runtimeKeepaliveCounter -= 1;
};

var Asyncify = {
  instrumentWasmImports(imports) {
    var importPattern = /^(invoke_.*|__asyncjs__.*)$/;
    for (let [x, original] of Object.entries(imports)) {
      if (typeof original == "function") {
        let isAsyncifyImport = original.isAsync || importPattern.test(x);
        imports[x] = (...args) => {
          var originalAsyncifyState = Asyncify.state;
          try {
            return original(...args);
          } finally {
            // Only asyncify-declared imports are allowed to change the
            // state.
            // Changing the state from normal to disabled is allowed (in any
            // function) as that is what shutdown does (and we don't have an
            // explicit list of shutdown imports).
            var changedToDisabled = originalAsyncifyState === Asyncify.State.Normal && Asyncify.state === Asyncify.State.Disabled;
            // invoke_* functions are allowed to change the state if we do
            // not ignore indirect calls.
            var ignoredInvoke = x.startsWith("invoke_") && true;
            if (Asyncify.state !== originalAsyncifyState && !isAsyncifyImport && !changedToDisabled && !ignoredInvoke) {
              throw new Error(`import ${x} was not in ASYNCIFY_IMPORTS, but changed the state`);
            }
          }
        };
      }
    }
  },
  instrumentFunction(original) {
    var wrapper = (...args) => {
      Asyncify.exportCallStack.push(original);
      try {
        return original(...args);
      } finally {
        if (!ABORT) {
          var top = Asyncify.exportCallStack.pop();
          assert(top === original);
          Asyncify.maybeStopUnwind();
        }
      }
    };
    Asyncify.funcWrappers.set(original, wrapper);
    return wrapper;
  },
  instrumentWasmExports(exports) {
    var ret = {};
    for (let [x, original] of Object.entries(exports)) {
      if (typeof original == "function") {
        var wrapper = Asyncify.instrumentFunction(original);
        ret[x] = wrapper;
      } else {
        ret[x] = original;
      }
    }
    return ret;
  },
  State: {
    Normal: 0,
    Unwinding: 1,
    Rewinding: 2,
    Disabled: 3
  },
  state: 0,
  StackSize: 4096,
  currData: null,
  handleSleepReturnValue: 0,
  exportCallStack: [],
  callstackFuncToId: new Map,
  callStackIdToFunc: new Map,
  funcWrappers: new Map,
  callStackId: 0,
  asyncPromiseHandlers: null,
  sleepCallbacks: [],
  getCallStackId(func) {
    assert(func);
    if (!Asyncify.callstackFuncToId.has(func)) {
      var id = Asyncify.callStackId++;
      Asyncify.callstackFuncToId.set(func, id);
      Asyncify.callStackIdToFunc.set(id, func);
    }
    return Asyncify.callstackFuncToId.get(func);
  },
  maybeStopUnwind() {
    if (Asyncify.currData && Asyncify.state === Asyncify.State.Unwinding && Asyncify.exportCallStack.length === 0) {
      // We just finished unwinding.
      // Be sure to set the state before calling any other functions to avoid
      // possible infinite recursion here (For example in debug pthread builds
      // the dbg() function itself can call back into WebAssembly to get the
      // current pthread_self() pointer).
      Asyncify.state = Asyncify.State.Normal;
      // Keep the runtime alive so that a re-wind can be done later.
      runAndAbortIfError(_asyncify_stop_unwind);
      if (typeof Fibers != "undefined") {
        Fibers.trampoline();
      }
    }
  },
  whenDone() {
    assert(Asyncify.currData, "Tried to wait for an async operation when none is in progress.");
    assert(!Asyncify.asyncPromiseHandlers, "Cannot have multiple async operations in flight at once");
    return new Promise((resolve, reject) => {
      Asyncify.asyncPromiseHandlers = {
        resolve,
        reject
      };
    });
  },
  allocateData() {
    // An asyncify data structure has three fields:
    //  0  current stack pos
    //  4  max stack pos
    //  8  id of function at bottom of the call stack (callStackIdToFunc[id] == wasm func)
    // The Asyncify ABI only interprets the first two fields, the rest is for the runtime.
    // We also embed a stack in the same memory region here, right next to the structure.
    // This struct is also defined as asyncify_data_t in emscripten/fiber.h
    var ptr = _malloc(12 + Asyncify.StackSize);
    Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
    Asyncify.setDataRewindFunc(ptr);
    return ptr;
  },
  setDataHeader(ptr, stack, stackSize) {
    (growMemViews(), HEAPU32)[((ptr) >> 2)] = stack;
    (growMemViews(), HEAPU32)[(((ptr) + (4)) >> 2)] = stack + stackSize;
  },
  setDataRewindFunc(ptr) {
    var bottomOfCallStack = Asyncify.exportCallStack[0];
    assert(bottomOfCallStack, "exportCallStack is empty");
    var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
    (growMemViews(), HEAP32)[(((ptr) + (8)) >> 2)] = rewindId;
  },
  getDataRewindFunc(ptr) {
    var id = (growMemViews(), HEAP32)[(((ptr) + (8)) >> 2)];
    var func = Asyncify.callStackIdToFunc.get(id);
    assert(func, `id ${id} not found in callStackIdToFunc`);
    return func;
  },
  doRewind(ptr) {
    var original = Asyncify.getDataRewindFunc(ptr);
    var func = Asyncify.funcWrappers.get(original);
    assert(original);
    assert(func);
    // Once we have rewound and the stack we no longer need to artificially
    // keep the runtime alive.
    return func();
  },
  handleSleep(startAsync) {
    assert(Asyncify.state !== Asyncify.State.Disabled, "Asyncify cannot be done during or after the runtime exits");
    if (ABORT) return;
    if (Asyncify.state === Asyncify.State.Normal) {
      // Prepare to sleep. Call startAsync, and see what happens:
      // if the code decided to call our callback synchronously,
      // then no async operation was in fact begun, and we don't
      // need to do anything.
      var reachedCallback = false;
      var reachedAfterCallback = false;
      startAsync((handleSleepReturnValue = 0) => {
        assert(!handleSleepReturnValue || typeof handleSleepReturnValue == "number" || typeof handleSleepReturnValue == "boolean");
        // old emterpretify API supported other stuff
        if (ABORT) return;
        Asyncify.handleSleepReturnValue = handleSleepReturnValue;
        reachedCallback = true;
        if (!reachedAfterCallback) {
          // We are happening synchronously, so no need for async.
          return;
        }
        // This async operation did not happen synchronously, so we did
        // unwind. In that case there can be no compiled code on the stack,
        // as it might break later operations (we can rewind ok now, but if
        // we unwind again, we would unwind through the extra compiled code
        // too).
        assert(!Asyncify.exportCallStack.length, "Waking up (starting to rewind) must be done from JS, without compiled code on the stack.");
        Asyncify.state = Asyncify.State.Rewinding;
        runAndAbortIfError(() => _asyncify_start_rewind(Asyncify.currData));
        if (typeof MainLoop != "undefined" && MainLoop.func) {
          MainLoop.resume();
        }
        var asyncWasmReturnValue, isError = false;
        try {
          asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData);
        } catch (err) {
          asyncWasmReturnValue = err;
          isError = true;
        }
        // Track whether the return value was handled by any promise handlers.
        var handled = false;
        if (!Asyncify.currData) {
          // All asynchronous execution has finished.
          // `asyncWasmReturnValue` now contains the final
          // return value of the exported async WASM function.
          // Note: `asyncWasmReturnValue` is distinct from
          // `Asyncify.handleSleepReturnValue`.
          // `Asyncify.handleSleepReturnValue` contains the return
          // value of the last C function to have executed
          // `Asyncify.handleSleep()`, where as `asyncWasmReturnValue`
          // contains the return value of the exported WASM function
          // that may have called C functions that
          // call `Asyncify.handleSleep()`.
          var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
          if (asyncPromiseHandlers) {
            Asyncify.asyncPromiseHandlers = null;
            (isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(asyncWasmReturnValue);
            handled = true;
          }
        }
        if (isError && !handled) {
          // If there was an error and it was not handled by now, we have no choice but to
          // rethrow that error into the global scope where it can be caught only by
          // `onerror` or `onunhandledpromiserejection`.
          throw asyncWasmReturnValue;
        }
      });
      reachedAfterCallback = true;
      if (!reachedCallback) {
        // A true async operation was begun; start a sleep.
        Asyncify.state = Asyncify.State.Unwinding;
        // TODO: reuse, don't alloc/free every sleep
        Asyncify.currData = Asyncify.allocateData();
        if (typeof MainLoop != "undefined" && MainLoop.func) {
          MainLoop.pause();
        }
        runAndAbortIfError(() => _asyncify_start_unwind(Asyncify.currData));
      }
    } else if (Asyncify.state === Asyncify.State.Rewinding) {
      // Stop a resume.
      Asyncify.state = Asyncify.State.Normal;
      runAndAbortIfError(_asyncify_stop_rewind);
      _free(Asyncify.currData);
      Asyncify.currData = null;
      // Call all sleep callbacks now that the sleep-resume is all done.
      Asyncify.sleepCallbacks.forEach(callUserCallback);
    } else {
      abort(`invalid state: ${Asyncify.state}`);
    }
    return Asyncify.handleSleepReturnValue;
  },
  handleAsync: startAsync => Asyncify.handleSleep(wakeUp => {
    // TODO: add error handling as a second param when handleSleep implements it.
    startAsync().then(wakeUp);
  })
};

var FS_createPath = (...args) => FS.createPath(...args);

var FS_unlink = (...args) => FS.unlink(...args);

var FS_createLazyFile = (...args) => FS.createLazyFile(...args);

var FS_createDevice = (...args) => FS.createDevice(...args);

var createContext = Browser.createContext;

FS.createPreloadedFile = FS_createPreloadedFile;

FS.staticInit();

Module["requestAnimationFrame"] = MainLoop.requestAnimationFrame;

Module["pauseMainLoop"] = MainLoop.pause;

Module["resumeMainLoop"] = MainLoop.resume;

MainLoop.init();

// Signal GL rendering layer that processing of a new frame is about to
// start. This helps it optimize VBO double-buffering and reduce GPU stalls.
registerPreMainLoop(() => GL.newRenderingFrameStarted());

for (let i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i));

var miniTempWebGLFloatBuffersStorage = new Float32Array(288);

// Create GL_POOL_TEMP_BUFFERS_SIZE+1 temporary buffers, for uploads of size 0 through GL_POOL_TEMP_BUFFERS_SIZE inclusive
for (/**@suppress{duplicate}*/ var i = 0; i <= 288; ++i) {
  miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i);
}

var miniTempWebGLIntBuffersStorage = new Int32Array(288);

// Create GL_POOL_TEMP_BUFFERS_SIZE+1 temporary buffers, for uploads of size 0 through GL_POOL_TEMP_BUFFERS_SIZE inclusive
for (/**@suppress{duplicate}*/ var i = 0; i <= 288; ++i) {
  miniTempWebGLIntBuffers[i] = miniTempWebGLIntBuffersStorage.subarray(0, i);
}

// End JS library code
// include: postlibrary.js
// This file is included after the automatically-generated JS library code
// but before the wasm module is created.
{
  // With WASM_ESM_INTEGRATION this has to happen at the top level and not
  // delayed until processModuleArgs.
  initMemory();
  // Begin ATMODULES hooks
  if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
  if (Module["preloadPlugins"]) preloadPlugins = Module["preloadPlugins"];
  if (Module["print"]) out = Module["print"];
  if (Module["printErr"]) err = Module["printErr"];
  if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
  // End ATMODULES hooks
  checkIncomingModuleAPI();
  if (Module["arguments"]) arguments_ = Module["arguments"];
  if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
  // Assertions on removed incoming Module JS APIs.
  assert(typeof Module["memoryInitializerPrefixURL"] == "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
  assert(typeof Module["pthreadMainPrefixURL"] == "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
  assert(typeof Module["cdInitializerPrefixURL"] == "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
  assert(typeof Module["filePackagePrefixURL"] == "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
  assert(typeof Module["read"] == "undefined", "Module.read option was removed");
  assert(typeof Module["readAsync"] == "undefined", "Module.readAsync option was removed (modify readAsync in JS)");
  assert(typeof Module["readBinary"] == "undefined", "Module.readBinary option was removed (modify readBinary in JS)");
  assert(typeof Module["setWindowTitle"] == "undefined", "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");
  assert(typeof Module["TOTAL_MEMORY"] == "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
  assert(typeof Module["ENVIRONMENT"] == "undefined", "Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
  assert(typeof Module["STACK_SIZE"] == "undefined", "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");
}

// Begin runtime exports
Module["addRunDependency"] = addRunDependency;

Module["removeRunDependency"] = removeRunDependency;

Module["createContext"] = createContext;

Module["FS_createPreloadedFile"] = FS_createPreloadedFile;

Module["FS_unlink"] = FS_unlink;

Module["FS_createPath"] = FS_createPath;

Module["FS_createDevice"] = FS_createDevice;

Module["FS_createDataFile"] = FS_createDataFile;

Module["FS_createLazyFile"] = FS_createLazyFile;

var missingLibrarySymbols = [ "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "convertI32PairToI53", "convertI32PairToI53Checked", "convertU32PairToI53", "getTempRet0", "setTempRet0", "zeroMemory", "withStackSave", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "emscriptenLog", "getDynCaller", "asmjsMangle", "HandleAllocator", "getNativeTypeSize", "addOnInit", "addOnPostCtor", "addOnPreMain", "STACK_SIZE", "STACK_ALIGN", "POINTER_SIZE", "ASSERTIONS", "ccall", "cwrap", "uleb128Encode", "generateFuncType", "convertJsFunctionToWasm", "getEmptyTableSlot", "updateTableMap", "getFunctionAddress", "addFunction", "removeFunction", "reallyNegative", "unSign", "strLen", "reSign", "formatString", "intArrayToString", "AsciiToString", "stringToAscii", "UTF16ToString", "stringToUTF16", "lengthBytesUTF16", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "hideEverythingExceptGivenElement", "restoreHiddenElements", "softFullscreenResizeWebGLRenderTarget", "registerPointerlockErrorEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "jsStackTrace", "getCallstack", "convertPCtoSourceLocation", "wasiRightsToMuslOFlags", "wasiOFlagsToMuslOFlags", "setImmediateWrapped", "safeRequestAnimationFrame", "clearImmediateWrapped", "registerPostMainLoop", "getPromise", "makePromise", "idsToPromises", "makePromiseCallback", "findMatchingCatch", "Browser_asyncPrepareDataCounter", "arraySum", "addDays", "getSocketFromFD", "getSocketAddress", "FS_mkdirTree", "_setNetworkCallback", "writeGLArray", "registerWebGlEventCallback", "ALLOC_NORMAL", "ALLOC_STACK", "allocate", "writeStringToMemory", "writeAsciiToMemory", "demangle", "stackTrace", "_wasmWorkerPostFunction1", "_wasmWorkerPostFunction2", "_wasmWorkerPostFunction3", "emscripten_audio_worklet_post_function_1", "emscripten_audio_worklet_post_function_2", "emscripten_audio_worklet_post_function_3" ];

missingLibrarySymbols.forEach(missingLibrarySymbol);

var unexportedSymbols = [ "run", "out", "err", "callMain", "abort", "wasmMemory", "wasmExports", "HEAPF32", "HEAPF64", "HEAP8", "HEAPU8", "HEAP16", "HEAPU16", "HEAP32", "HEAPU32", "HEAP64", "HEAPU64", "writeStackCookie", "checkStackCookie", "writeI53ToI64", "readI53FromI64", "readI53FromU64", "INT53_MAX", "INT53_MIN", "bigintToI53Checked", "stackSave", "stackRestore", "stackAlloc", "ptrToString", "exitJS", "getHeapMax", "growMemory", "ENV", "ERRNO_CODES", "strError", "DNS", "Protocols", "Sockets", "timers", "warnOnce", "readEmAsmArgsArray", "readEmAsmArgs", "runEmAsmFunction", "runMainThreadEmAsm", "jstoi_q", "getExecutableName", "autoResumeAudioContext", "dynCallLegacy", "dynCall", "handleException", "keepRuntimeAlive", "runtimeKeepalivePush", "runtimeKeepalivePop", "callUserCallback", "maybeExit", "asyncLoad", "alignMemory", "mmapAlloc", "wasmTable", "getUniqueRunDependency", "noExitRuntime", "addOnPreRun", "addOnExit", "addOnPostRun", "sigToWasmTypes", "freeTableIndexes", "functionsInTableMap", "setValue", "getValue", "PATH", "PATH_FS", "UTF8Decoder", "UTF8ArrayToString", "UTF8ToString", "stringToUTF8Array", "stringToUTF8", "lengthBytesUTF8", "intArrayFromString", "UTF16Decoder", "stringToNewUTF8", "stringToUTF8OnStack", "writeArrayToMemory", "JSEvents", "registerKeyEventCallback", "specialHTMLTargets", "maybeCStringToJsString", "findEventTarget", "findCanvasEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "setLetterbox", "currentFullscreenStrategy", "restoreOldWindowedStyle", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "setCanvasElementSize", "getCanvasElementSize", "UNWIND_CACHE", "ExitStatus", "getEnvStrings", "checkWasiClock", "doReadv", "doWritev", "initRandomFill", "randomFill", "safeSetTimeout", "emSetImmediate", "emClearImmediate_deps", "emClearImmediate", "registerPreMainLoop", "promiseMap", "uncaughtExceptionCount", "exceptionLast", "exceptionCaught", "ExceptionInfo", "Browser", "requestFullscreen", "requestFullScreen", "setCanvasSize", "getUserMedia", "getPreloadedImageData__data", "wget", "MONTH_DAYS_REGULAR", "MONTH_DAYS_LEAP", "MONTH_DAYS_REGULAR_CUMULATIVE", "MONTH_DAYS_LEAP_CUMULATIVE", "isLeapYear", "ydayFromDate", "SYSCALLS", "preloadPlugins", "FS_modeStringToFlags", "FS_getMode", "FS_stdin_getChar_buffer", "FS_stdin_getChar", "FS_readFile", "FS", "FS_root", "FS_mounts", "FS_devices", "FS_streams", "FS_nextInode", "FS_nameTable", "FS_currentPath", "FS_initialized", "FS_ignorePermissions", "FS_filesystems", "FS_syncFSRequests", "FS_readFiles", "FS_lookupPath", "FS_getPath", "FS_hashName", "FS_hashAddNode", "FS_hashRemoveNode", "FS_lookupNode", "FS_createNode", "FS_destroyNode", "FS_isRoot", "FS_isMountpoint", "FS_isFile", "FS_isDir", "FS_isLink", "FS_isChrdev", "FS_isBlkdev", "FS_isFIFO", "FS_isSocket", "FS_flagsToPermissionString", "FS_nodePermissions", "FS_mayLookup", "FS_mayCreate", "FS_mayDelete", "FS_mayOpen", "FS_checkOpExists", "FS_nextfd", "FS_getStreamChecked", "FS_getStream", "FS_createStream", "FS_closeStream", "FS_dupStream", "FS_doSetAttr", "FS_chrdev_stream_ops", "FS_major", "FS_minor", "FS_makedev", "FS_registerDevice", "FS_getDevice", "FS_getMounts", "FS_syncfs", "FS_mount", "FS_unmount", "FS_lookup", "FS_mknod", "FS_statfs", "FS_statfsStream", "FS_statfsNode", "FS_create", "FS_mkdir", "FS_mkdev", "FS_symlink", "FS_rename", "FS_rmdir", "FS_readdir", "FS_readlink", "FS_stat", "FS_fstat", "FS_lstat", "FS_doChmod", "FS_chmod", "FS_lchmod", "FS_fchmod", "FS_doChown", "FS_chown", "FS_lchown", "FS_fchown", "FS_doTruncate", "FS_truncate", "FS_ftruncate", "FS_utime", "FS_open", "FS_close", "FS_isClosed", "FS_llseek", "FS_read", "FS_write", "FS_mmap", "FS_msync", "FS_ioctl", "FS_writeFile", "FS_cwd", "FS_chdir", "FS_createDefaultDirectories", "FS_createDefaultDevices", "FS_createSpecialDirectories", "FS_createStandardStreams", "FS_staticInit", "FS_init", "FS_quit", "FS_findObject", "FS_analyzePath", "FS_createFile", "FS_forceLoadFile", "FS_absolutePath", "FS_createFolder", "FS_createLink", "FS_joinPath", "FS_mmapAlloc", "FS_standardizePath", "MEMFS", "TTY", "PIPEFS", "SOCKFS", "tempFixedLengthArray", "miniTempWebGLFloatBuffers", "miniTempWebGLIntBuffers", "heapObjectForWebGLType", "toTypedArrayIndex", "webgl_enable_ANGLE_instanced_arrays", "webgl_enable_OES_vertex_array_object", "webgl_enable_WEBGL_draw_buffers", "webgl_enable_WEBGL_multi_draw", "webgl_enable_EXT_polygon_offset_clamp", "webgl_enable_EXT_clip_control", "webgl_enable_WEBGL_polygon_mode", "GL", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "colorChannelsInGlTextureFormat", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "__glGetActiveAttribOrUniform", "emscriptenWebGLGetBufferBinding", "emscriptenWebGLValidateMapBufferTarget", "AL", "GLUT", "EGL", "GLEW", "IDBStore", "runAndAbortIfError", "Asyncify", "Fibers", "SDL", "SDL_gfx", "emscriptenWebGLGetIndexed", "webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance", "webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance", "allocateUTF8", "allocateUTF8OnStack", "print", "printErr", "jstoi_s", "_wasmWorkers", "_wasmWorkersID", "_wasmWorkerDelayedMessageQueue", "_wasmWorkerAppendToQueue", "_wasmWorkerRunPostMessage", "_wasmWorkerInitializeRuntime", "EmAudio", "EmAudioCounter", "emscriptenRegisterAudioObject", "emscriptenDestroyAudioContext", "emscriptenGetAudioObject", "emscriptenGetContextQuantumSize", "_EmAudioDispatchProcessorCallback" ];

unexportedSymbols.forEach(unexportedRuntimeSymbol);

// End runtime exports
// Begin JS library exports
// End JS library exports
// end include: postlibrary.js
function checkIncomingModuleAPI() {
  ignoredModuleProp("fetchSettings");
}

var ASM_CONSTS = {
  305224: ($0, $1, $2, $3, $4) => {
    if (typeof window === "undefined" || (window.AudioContext || window.webkitAudioContext) === undefined) {
      return 0;
    }
    if (typeof (window.miniaudio) === "undefined") {
      window.miniaudio = {
        referenceCount: 0
      };
      window.miniaudio.device_type = {};
      window.miniaudio.device_type.playback = $0;
      window.miniaudio.device_type.capture = $1;
      window.miniaudio.device_type.duplex = $2;
      window.miniaudio.device_state = {};
      window.miniaudio.device_state.stopped = $3;
      window.miniaudio.device_state.started = $4;
      let miniaudio = window.miniaudio;
      miniaudio.devices = [];
      miniaudio.track_device = function(device) {
        for (var iDevice = 0; iDevice < miniaudio.devices.length; ++iDevice) {
          if (miniaudio.devices[iDevice] == null) {
            miniaudio.devices[iDevice] = device;
            return iDevice;
          }
        }
        miniaudio.devices.push(device);
        return miniaudio.devices.length - 1;
      };
      miniaudio.untrack_device_by_index = function(deviceIndex) {
        miniaudio.devices[deviceIndex] = null;
        while (miniaudio.devices.length > 0) {
          if (miniaudio.devices[miniaudio.devices.length - 1] == null) {
            miniaudio.devices.pop();
          } else {
            break;
          }
        }
      };
      miniaudio.untrack_device = function(device) {
        for (var iDevice = 0; iDevice < miniaudio.devices.length; ++iDevice) {
          if (miniaudio.devices[iDevice] == device) {
            return miniaudio.untrack_device_by_index(iDevice);
          }
        }
      };
      miniaudio.get_device_by_index = function(deviceIndex) {
        return miniaudio.devices[deviceIndex];
      };
      miniaudio.unlock_event_types = (function() {
        return [ "touchend", "click" ];
      })();
      miniaudio.unlock = function() {
        for (var i = 0; i < miniaudio.devices.length; ++i) {
          var device = miniaudio.devices[i];
          if (device != null && device.webaudio != null && device.state === miniaudio.device_state.started) {
            device.webaudio.resume().then(() => {
              _ma_device__on_notification_unlocked(device.pDevice);
            }, error => {
              console.error("Failed to resume audiocontext", error);
            });
          }
        }
        miniaudio.unlock_event_types.map(function(event_type) {
          document.removeEventListener(event_type, miniaudio.unlock, true);
        });
      };
      miniaudio.unlock_event_types.map(function(event_type) {
        document.addEventListener(event_type, miniaudio.unlock, true);
      });
    }
    window.miniaudio.referenceCount += 1;
    return 1;
  },
  307402: () => {
    if (typeof (window.miniaudio) !== "undefined") {
      miniaudio.unlock_event_types.map(function(event_type) {
        document.removeEventListener(event_type, miniaudio.unlock, true);
      });
      window.miniaudio.referenceCount -= 1;
      if (window.miniaudio.referenceCount === 0) {
        delete window.miniaudio;
      }
    }
  },
  307692: () => (navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined),
  307796: () => {
    try {
      var temp = new (window.AudioContext || window.webkitAudioContext);
      var sampleRate = temp.sampleRate;
      temp.close();
      return sampleRate;
    } catch (e) {
      return 0;
    }
  },
  307967: ($0, $1) => window.miniaudio.track_device({
    webaudio: emscriptenGetAudioObject($0),
    state: 1,
    pDevice: $1
  }),
  308076: ($0, $1) => {
    var getUserMediaResult = 0;
    var audioWorklet = emscriptenGetAudioObject($0);
    var audioContext = emscriptenGetAudioObject($1);
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    }).then(function(stream) {
      audioContext.streamNode = audioContext.createMediaStreamSource(stream);
      audioContext.streamNode.connect(audioWorklet);
      audioWorklet.connect(audioContext.destination);
      getUserMediaResult = 0;
    }).catch(function(error) {
      console.log("navigator.mediaDevices.getUserMedia Failed: " + error);
      getUserMediaResult = -1;
    });
    return getUserMediaResult;
  },
  308638: ($0, $1) => {
    var audioWorklet = emscriptenGetAudioObject($0);
    var audioContext = emscriptenGetAudioObject($1);
    audioWorklet.connect(audioContext.destination);
    return 0;
  },
  308798: $0 => emscriptenGetAudioObject($0).sampleRate,
  308850: $0 => {
    var device = window.miniaudio.get_device_by_index($0);
    if (device.streamNode !== undefined) {
      device.streamNode.disconnect();
      device.streamNode = undefined;
    }
    device.pDevice = undefined;
  },
  309041: $0 => {
    window.miniaudio.untrack_device_by_index($0);
  },
  309091: $0 => {
    var device = window.miniaudio.get_device_by_index($0);
    device.webaudio.resume();
    device.state = window.miniaudio.device_state.started;
  },
  309230: $0 => {
    var device = window.miniaudio.get_device_by_index($0);
    device.webaudio.suspend();
    device.state = window.miniaudio.device_state.stopped;
  },
  309370: $0 => {
    var str = UTF8ToString($0) + "\n\n" + "Abort/Retry/Ignore/AlwaysIgnore? [ariA] :";
    var reply = window.prompt(str, "i");
    if (reply === null) {
      reply = "i";
    }
    return reply.length === 1 ? reply.charCodeAt(0) : -1;
  },
  309585: () => {
    if (typeof (Module["SDL3"]) === "undefined") {
      Module["SDL3"] = {};
    }
    Module["SDL3"].dummy_audio = {};
    Module["SDL3"].dummy_audio.timers = [];
    Module["SDL3"].dummy_audio.timers[0] = undefined;
    Module["SDL3"].dummy_audio.timers[1] = undefined;
  },
  309831: ($0, $1, $2, $3, $4) => {
    var a = Module["SDL3"].dummy_audio;
    if (a.timers[$0] !== undefined) {
      clearInterval(a.timers[$0]);
    }
    a.timers[$0] = setInterval(function() {
      dynCall("vi", $3, [ $4 ]);
    }, ($1 / $2) * 1e3);
  },
  310023: $0 => {
    var a = Module["SDL3"].dummy_audio;
    if (a.timers[$0] !== undefined) {
      clearInterval(a.timers[$0]);
    }
    a.timers[$0] = undefined;
  },
  310154: $0 => {
    var parms = new URLSearchParams(window.location.search);
    for (const [key, value] of parms) {
      if (key.startsWith("SDL_")) {
        var ckey = stringToNewUTF8(key);
        var cvalue = stringToNewUTF8(value);
        if ((ckey != 0) && (cvalue != 0)) {
          dynCall("iiii", $0, [ ckey, cvalue, 1 ]);
        }
        _free(ckey);
        _free(cvalue);
      }
    }
  },
  310461: () => {
    if (typeof (AudioContext) !== "undefined") {
      return true;
    } else if (typeof (webkitAudioContext) !== "undefined") {
      return true;
    }
    return false;
  },
  310608: () => {
    if ((typeof (navigator.mediaDevices) !== "undefined") && (typeof (navigator.mediaDevices.getUserMedia) !== "undefined")) {
      return true;
    } else if (typeof (navigator.webkitGetUserMedia) !== "undefined") {
      return true;
    }
    return false;
  },
  310842: $0 => {
    if (typeof (Module["SDL3"]) === "undefined") {
      Module["SDL3"] = {};
    }
    var SDL3 = Module["SDL3"];
    if (!$0) {
      SDL3.audio_playback = {};
    } else {
      SDL3.audio_recording = {};
    }
    if (!SDL3.audioContext) {
      if (typeof (AudioContext) !== "undefined") {
        SDL3.audioContext = new AudioContext;
      } else if (typeof (webkitAudioContext) !== "undefined") {
        SDL3.audioContext = new webkitAudioContext;
      }
      if (SDL3.audioContext) {
        if ((typeof navigator.userActivation) === "undefined") {
          autoResumeAudioContext(SDL3.audioContext);
        }
      }
    }
    return (SDL3.audioContext !== undefined);
  },
  311405: () => Module["SDL3"].audioContext.sampleRate,
  311456: ($0, $1, $2, $3) => {
    var SDL3 = Module["SDL3"];
    var have_microphone = function(stream) {
      if (SDL3.audio_recording.silenceTimer !== undefined) {
        clearInterval(SDL3.audio_recording.silenceTimer);
        SDL3.audio_recording.silenceTimer = undefined;
        SDL3.audio_recording.silenceBuffer = undefined;
      }
      SDL3.audio_recording.mediaStreamNode = SDL3.audioContext.createMediaStreamSource(stream);
      SDL3.audio_recording.scriptProcessorNode = SDL3.audioContext.createScriptProcessor($1, $0, 1);
      SDL3.audio_recording.scriptProcessorNode.onaudioprocess = function(audioProcessingEvent) {
        if ((SDL3 === undefined) || (SDL3.audio_recording === undefined)) {
          return;
        }
        audioProcessingEvent.outputBuffer.getChannelData(0).fill(0);
        SDL3.audio_recording.currentRecordingBuffer = audioProcessingEvent.inputBuffer;
        dynCall("ip", $2, [ $3 ]);
      };
      SDL3.audio_recording.mediaStreamNode.connect(SDL3.audio_recording.scriptProcessorNode);
      SDL3.audio_recording.scriptProcessorNode.connect(SDL3.audioContext.destination);
      SDL3.audio_recording.stream = stream;
    };
    var no_microphone = function(error) {};
    SDL3.audio_recording.silenceBuffer = SDL3.audioContext.createBuffer($0, $1, SDL3.audioContext.sampleRate);
    SDL3.audio_recording.silenceBuffer.getChannelData(0).fill(0);
    var silence_callback = function() {
      SDL3.audio_recording.currentRecordingBuffer = SDL3.audio_recording.silenceBuffer;
      dynCall("ip", $2, [ $3 ]);
    };
    SDL3.audio_recording.silenceTimer = setInterval(silence_callback, ($1 / SDL3.audioContext.sampleRate) * 1e3);
    if ((navigator.mediaDevices !== undefined) && (navigator.mediaDevices.getUserMedia !== undefined)) {
      navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      }).then(have_microphone).catch(no_microphone);
    } else if (navigator.webkitGetUserMedia !== undefined) {
      navigator.webkitGetUserMedia({
        audio: true,
        video: false
      }, have_microphone, no_microphone);
    }
  },
  313297: ($0, $1, $2, $3) => {
    var SDL3 = Module["SDL3"];
    SDL3.audio_playback.scriptProcessorNode = SDL3.audioContext["createScriptProcessor"]($1, 0, $0);
    SDL3.audio_playback.scriptProcessorNode["onaudioprocess"] = function(e) {
      if ((SDL3 === undefined) || (SDL3.audio_playback === undefined)) {
        return;
      }
      if (SDL3.audio_playback.silenceTimer !== undefined) {
        clearInterval(SDL3.audio_playback.silenceTimer);
        SDL3.audio_playback.silenceTimer = undefined;
        SDL3.audio_playback.silenceBuffer = undefined;
      }
      SDL3.audio_playback.currentPlaybackBuffer = e["outputBuffer"];
      dynCall("ip", $2, [ $3 ]);
    };
    SDL3.audio_playback.scriptProcessorNode["connect"](SDL3.audioContext["destination"]);
    if (SDL3.audioContext.state === "suspended") {
      SDL3.audio_playback.silenceBuffer = SDL3.audioContext.createBuffer($0, $1, SDL3.audioContext.sampleRate);
      SDL3.audio_playback.silenceBuffer.getChannelData(0).fill(0);
      var silence_callback = function() {
        if ((typeof navigator.userActivation) !== "undefined") {
          if (navigator.userActivation.hasBeenActive) {
            SDL3.audioContext.resume();
          }
        }
        SDL3.audio_playback.currentPlaybackBuffer = SDL3.audio_playback.silenceBuffer;
        dynCall("ip", $2, [ $3 ]);
        SDL3.audio_playback.currentPlaybackBuffer = undefined;
      };
      SDL3.audio_playback.silenceTimer = setInterval(silence_callback, ($1 / SDL3.audioContext.sampleRate) * 1e3);
    }
  },
  314613: $0 => {
    var SDL3 = Module["SDL3"];
    if ($0) {
      if (SDL3.audio_recording.silenceTimer !== undefined) {
        clearInterval(SDL3.audio_recording.silenceTimer);
      }
      if (SDL3.audio_recording.stream !== undefined) {
        var tracks = SDL3.audio_recording.stream.getAudioTracks();
        for (var i = 0; i < tracks.length; i++) {
          SDL3.audio_recording.stream.removeTrack(tracks[i]);
        }
      }
      if (SDL3.audio_recording.scriptProcessorNode !== undefined) {
        SDL3.audio_recording.scriptProcessorNode.onaudioprocess = function(audioProcessingEvent) {};
        SDL3.audio_recording.scriptProcessorNode.disconnect();
      }
      if (SDL3.audio_recording.mediaStreamNode !== undefined) {
        SDL3.audio_recording.mediaStreamNode.disconnect();
      }
      SDL3.audio_recording = undefined;
    } else {
      if (SDL3.audio_playback.scriptProcessorNode != undefined) {
        SDL3.audio_playback.scriptProcessorNode.disconnect();
      }
      if (SDL3.audio_playback.silenceTimer !== undefined) {
        clearInterval(SDL3.audio_playback.silenceTimer);
      }
      SDL3.audio_playback = undefined;
    }
    if ((SDL3.audioContext !== undefined) && (SDL3.audio_playback === undefined) && (SDL3.audio_recording === undefined)) {
      SDL3.audioContext.close();
      SDL3.audioContext = undefined;
    }
  },
  315769: ($0, $1) => {
    var buf = $0 >>> 2;
    var SDL3 = Module["SDL3"];
    var numChannels = SDL3.audio_playback.currentPlaybackBuffer["numberOfChannels"];
    for (var c = 0; c < numChannels; ++c) {
      var channelData = SDL3.audio_playback.currentPlaybackBuffer["getChannelData"](c);
      if (channelData.length != $1) {
        throw "Web Audio playback buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
      }
      for (var j = 0; j < $1; ++j) {
        channelData[j] = (growMemViews(), HEAPF32)[buf + (j * numChannels + c)];
      }
    }
  },
  316282: ($0, $1) => {
    var SDL3 = Module["SDL3"];
    var numChannels = SDL3.audio_recording.currentRecordingBuffer.numberOfChannels;
    for (var c = 0; c < numChannels; ++c) {
      var channelData = SDL3.audio_recording.currentRecordingBuffer.getChannelData(c);
      if (channelData.length != $1) {
        throw "Web Audio recording buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
      }
      if (numChannels == 1) {
        for (var j = 0; j < $1; ++j) {
          setValue($0 + (j * 4), channelData[j], "float");
        }
      } else {
        for (var j = 0; j < $1; ++j) {
          setValue($0 + (((j * numChannels) + c) * 4), channelData[j], "float");
        }
      }
    }
  },
  316909: () => {
    if (typeof (Module["SDL3"]) === "undefined") {
      Module["SDL3"] = {};
    }
    Module["SDL3"].camera = {};
  },
  317010: () => (navigator.mediaDevices === undefined) ? 0 : 1,
  317069: ($0, $1, $2, $3, $4, $5, $6) => {
    const device = $0;
    const w = $1;
    const h = $2;
    const framerate_numerator = $3;
    const framerate_denominator = $4;
    const outcome = $5;
    const iterate = $6;
    const constraints = {};
    if ((w <= 0) || (h <= 0)) {
      constraints.video = true;
    } else {
      constraints.video = {};
      constraints.video.width = w;
      constraints.video.height = h;
    }
    if ((framerate_numerator > 0) && (framerate_denominator > 0)) {
      var fps = framerate_numerator / framerate_denominator;
      constraints.video.frameRate = {
        ideal: fps
      };
    }
    function grabNextCameraFrame() {
      const SDL3 = Module["SDL3"];
      if ((typeof (SDL3) === "undefined") || (typeof (SDL3.camera) === "undefined") || (typeof (SDL3.camera.stream) === "undefined")) {
        return;
      }
      const nextframems = SDL3.camera.next_frame_time;
      const now = performance.now();
      if (now >= nextframems) {
        dynCall("vi", iterate, [ device ]);
        while (SDL3.camera.next_frame_time < now) {
          SDL3.camera.next_frame_time += SDL3.camera.fpsincrms;
        }
      }
      requestAnimationFrame(grabNextCameraFrame);
    }
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      const settings = stream.getVideoTracks()[0].getSettings();
      const actualw = settings.width;
      const actualh = settings.height;
      const actualfps = settings.frameRate;
      console.log("Camera is opened! Actual spec: (" + actualw + "x" + actualh + "), fps=" + actualfps);
      if (dynCall("iiiiii", outcome, [ device, 1, actualw, actualh, actualfps ])) {
        const video = document.createElement("video");
        video.width = actualw;
        video.height = actualh;
        video.style.display = "none";
        video.srcObject = stream;
        const canvas = document.createElement("canvas");
        canvas.width = actualw;
        canvas.height = actualh;
        canvas.style.display = "none";
        const ctx2d = canvas.getContext("2d");
        const SDL3 = Module["SDL3"];
        SDL3.camera.width = actualw;
        SDL3.camera.height = actualh;
        SDL3.camera.fps = actualfps;
        SDL3.camera.fpsincrms = 1e3 / actualfps;
        SDL3.camera.stream = stream;
        SDL3.camera.video = video;
        SDL3.camera.canvas = canvas;
        SDL3.camera.ctx2d = ctx2d;
        SDL3.camera.next_frame_time = performance.now();
        video.play();
        video.addEventListener("loadedmetadata", () => {
          grabNextCameraFrame();
        });
      }
    }).catch(err => {
      console.error("Tried to open camera but it threw an error! " + err.name + ": " + err.message);
      dynCall("iiiiii", outcome, [ device, 0, 0, 0, 0 ]);
    });
  },
  319360: () => {
    const SDL3 = Module["SDL3"];
    if ((typeof (SDL3) === "undefined") || (typeof (SDL3.camera) === "undefined") || (typeof (SDL3.camera.stream) === "undefined")) {
      return;
    }
    SDL3.camera.stream.getTracks().forEach(track => track.stop());
    SDL3.camera = {};
  },
  319611: ($0, $1, $2) => {
    const w = $0;
    const h = $1;
    const rgba = $2;
    const SDL3 = Module["SDL3"];
    if ((typeof (SDL3) === "undefined") || (typeof (SDL3.camera) === "undefined") || (typeof (SDL3.camera.ctx2d) === "undefined")) {
      return 0;
    }
    SDL3.camera.ctx2d.drawImage(SDL3.camera.video, 0, 0, w, h);
    const imgrgba = SDL3.camera.ctx2d.getImageData(0, 0, w, h).data;
    Module.HEAPU8.set(imgrgba, rgba);
    return 1;
  },
  319996: () => {
    if (typeof (Module["SDL3"]) !== "undefined") {
      Module["SDL3"].camera = undefined;
    }
  },
  320083: ($0, $1, $2, $3) => {
    var w = $0;
    var h = $1;
    var pixels = $2;
    var canvasId = UTF8ToString($3);
    var canvas = document.querySelector(canvasId);
    if (!Module["SDL3"]) Module["SDL3"] = {};
    var SDL3 = Module["SDL3"];
    if (SDL3.ctxCanvas !== canvas) {
      SDL3.ctx = Browser.createContext(canvas, false, true);
      SDL3.ctxCanvas = canvas;
    }
    if (SDL3.w !== w || SDL3.h !== h || SDL3.imageCtx !== SDL3.ctx) {
      SDL3.image = SDL3.ctx.createImageData(w, h);
      SDL3.w = w;
      SDL3.h = h;
      SDL3.imageCtx = SDL3.ctx;
    }
    var data = SDL3.image.data;
    var src = pixels / 4;
    var dst = 0;
    var num;
    if (SDL3.data32Data !== data) {
      SDL3.data32 = new Int32Array(data.buffer);
      SDL3.data8 = new Uint8Array(data.buffer);
      SDL3.data32Data = data;
    }
    var data32 = SDL3.data32;
    num = data32.length;
    data32.set((growMemViews(), HEAP32).subarray(src, src + num));
    var data8 = SDL3.data8;
    var i = 3;
    var j = i + 4 * num;
    if (num % 8 == 0) {
      while (i < j) {
        data8[i] = 255;
        i = i + 4 | 0;
        data8[i] = 255;
        i = i + 4 | 0;
        data8[i] = 255;
        i = i + 4 | 0;
        data8[i] = 255;
        i = i + 4 | 0;
        data8[i] = 255;
        i = i + 4 | 0;
        data8[i] = 255;
        i = i + 4 | 0;
        data8[i] = 255;
        i = i + 4 | 0;
        data8[i] = 255;
        i = i + 4 | 0;
      }
    } else {
      while (i < j) {
        data8[i] = 255;
        i = i + 4 | 0;
      }
    }
    SDL3.ctx.putImageData(SDL3.image, 0, 0);
  },
  321312: () => {
    if (!Module["SDL3"]) {
      Module["SDL3"] = {};
    }
    var SDL3 = Module["SDL3"];
    SDL3["mouse_x"] = 0;
    SDL3["mouse_y"] = 0;
    SDL3["mouse_buttons"] = [];
    for (var i = 0; i < 5; ++i) {
      SDL3["mouse_buttons"][i] = false;
    }
    document.addEventListener("mousemove", function(e) {
      var SDL3 = Module["SDL3"];
      SDL3["mouse_x"] = e.clientX;
      SDL3["mouse_y"] = e.clientY;
    });
    document.addEventListener("mousedown", function(e) {
      var SDL3 = Module["SDL3"];
      if (0 <= e.button && e.button < SDL3["mouse_buttons"].length) {
        SDL3["mouse_buttons"][e.button] = true;
      }
    });
    document.addEventListener("mouseup", function(e) {
      var SDL3 = Module["SDL3"];
      if (0 <= e.button && e.button < SDL3["mouse_buttons"].length) {
        SDL3["mouse_buttons"][e.button] = false;
      }
    });
  },
  322046: ($0, $1, $2, $3, $4) => {
    var w = $0;
    var h = $1;
    var hot_x = $2;
    var hot_y = $3;
    var pixels = $4;
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    var image = ctx.createImageData(w, h);
    var data = image.data;
    var src = pixels / 4;
    var data32 = new Int32Array(data.buffer);
    data32.set((growMemViews(), HEAP32).subarray(src, src + data32.length));
    ctx.putImageData(image, 0, 0);
    var url = hot_x === 0 && hot_y === 0 ? "url(" + canvas.toDataURL() + "), auto" : "url(" + canvas.toDataURL() + ") " + hot_x + " " + hot_y + ", auto";
    var urlBuf = _SDL_malloc(url.length + 1);
    stringToUTF8(url, urlBuf, url.length + 1);
    return urlBuf;
  },
  322704: $0 => {
    if (Module["canvas"]) {
      Module["canvas"].style["cursor"] = UTF8ToString($0);
    }
  },
  322787: () => {
    if (Module["canvas"]) {
      Module["canvas"].style["cursor"] = "none";
    }
  },
  322856: () => Module["SDL3"]["mouse_x"],
  322894: () => Module["SDL3"]["mouse_y"],
  322932: $0 => Module["SDL3"]["mouse_buttons"][$0],
  322980: $0 => {
    var id = UTF8ToString($0);
    try {
      var canvas = document.querySelector(id);
      if (canvas) {
        return canvas === document.activeElement;
      }
    } catch (e) {}
    return false;
  },
  323146: ($0, $1, $2) => {
    var target = document.querySelector(UTF8ToString($1));
    if (target) {
      var data = $0;
      if (typeof (Module["SDL3"]) === "undefined") {
        Module["SDL3"] = {};
      }
      var SDL3 = Module["SDL3"];
      var makePointerEventCStruct = function(event) {
        var ptr = 0;
        if (event.pointerType == "pen") {
          ptr = _SDL_malloc($2);
          if (ptr != 0) {
            var rect = target.getBoundingClientRect();
            var idx = ptr >> 2;
            (growMemViews(), HEAP32)[idx++] = event.pointerId;
            (growMemViews(), HEAP32)[idx++] = (typeof (event.button) !== "undefined") ? event.button : -1;
            (growMemViews(), HEAP32)[idx++] = event.buttons;
            (growMemViews(), HEAPF32)[idx++] = event.movementX;
            (growMemViews(), HEAPF32)[idx++] = event.movementY;
            (growMemViews(), HEAPF32)[idx++] = event.clientX - rect.left;
            (growMemViews(), HEAPF32)[idx++] = event.clientY - rect.top;
            (growMemViews(), HEAPF32)[idx++] = event.pressure;
            (growMemViews(), HEAPF32)[idx++] = event.tangentialPressure;
            (growMemViews(), HEAPF32)[idx++] = event.tiltX;
            (growMemViews(), HEAPF32)[idx++] = event.tiltY;
            (growMemViews(), HEAPF32)[idx++] = event.twist;
          }
        }
        return ptr;
      };
      SDL3.eventHandlerPointerEnter = function(event) {
        var d = makePointerEventCStruct(event);
        if (d != 0) {
          _Emscripten_HandlePointerEnter(data, d);
          _SDL_free(d);
        }
      };
      target.addEventListener("pointerenter", SDL3.eventHandlerPointerEnter);
      SDL3.eventHandlerPointerLeave = function(event) {
        var d = makePointerEventCStruct(event);
        if (d != 0) {
          _Emscripten_HandlePointerLeave(data, d);
          _SDL_free(d);
        }
      };
      target.addEventListener("pointerleave", SDL3.eventHandlerPointerLeave);
      target.addEventListener("pointercancel", SDL3.eventHandlerPointerLeave);
      SDL3.eventHandlerPointerGeneric = function(event) {
        var d = makePointerEventCStruct(event);
        if (d != 0) {
          _Emscripten_HandlePointerGeneric(data, d);
          _SDL_free(d);
        }
      };
      target.addEventListener("pointerdown", SDL3.eventHandlerPointerGeneric);
      target.addEventListener("pointerup", SDL3.eventHandlerPointerGeneric);
      target.addEventListener("pointermove", SDL3.eventHandlerPointerGeneric);
    }
  },
  324939: ($0, $1, $2) => {
    var target = document.querySelector(UTF8ToString($1));
    if (target) {
      var data = $0;
      if (typeof (Module["SDL3"]) === "undefined") {
        Module["SDL3"] = {};
      }
      var SDL3 = Module["SDL3"];
      var makeDropEventCStruct = function(event) {
        var ptr = 0;
        ptr = _SDL_malloc($2);
        if (ptr != 0) {
          var idx = ptr >> 2;
          var rect = target.getBoundingClientRect();
          (growMemViews(), HEAP32)[idx++] = event.clientX - rect.left;
          (growMemViews(), HEAP32)[idx++] = event.clientY - rect.top;
        }
        return ptr;
      };
      SDL3.eventHandlerDropDragover = function(event) {
        event.preventDefault();
        var d = makeDropEventCStruct(event);
        if (d != 0) {
          _Emscripten_SendDragEvent(data, d);
          _SDL_free(d);
        }
      };
      target.addEventListener("dragover", SDL3.eventHandlerDropDragover);
      SDL3.drop_count = 0;
      FS.mkdir("/tmp/filedrop");
      SDL3.eventHandlerDropDrop = function(event) {
        event.preventDefault();
        if (event.dataTransfer.types.includes("text/plain")) {
          let plain_text = stringToNewUTF8(event.dataTransfer.getData("text/plain"));
          _Emscripten_SendDragTextEvent(data, plain_text);
          _free(plain_text);
        } else if (event.dataTransfer.types.includes("Files")) {
          for (let i = 0; i < event.dataTransfer.files.length; i++) {
            const file = event.dataTransfer.files.item(i);
            const file_reader = new FileReader;
            file_reader.readAsArrayBuffer(file);
            file_reader.onload = function(event) {
              const fs_dropdir = `/tmp/filedrop/${SDL3.drop_count}`;
              SDL3.drop_count += 1;
              const fs_filepath = `${fs_dropdir}/${file.name}`;
              const c_fs_filepath = stringToNewUTF8(fs_filepath);
              const contents_array8 = new Uint8Array(event.target.result);
              FS.mkdir(fs_dropdir);
              var stream = FS.open(fs_filepath, "w");
              FS.write(stream, contents_array8, 0, contents_array8.length, 0);
              FS.close(stream);
              _Emscripten_SendDragFileEvent(data, c_fs_filepath);
              _free(c_fs_filepath);
              _Emscripten_SendDragCompleteEvent(data);
            };
          }
        }
        _Emscripten_SendDragCompleteEvent(data);
      };
      target.addEventListener("drop", SDL3.eventHandlerDropDrop);
      SDL3.eventHandlerDropDragend = function(event) {
        event.preventDefault();
        _Emscripten_SendDragCompleteEvent(data);
      };
      target.addEventListener("dragend", SDL3.eventHandlerDropDragend);
      target.addEventListener("dragleave", SDL3.eventHandlerDropDragend);
    }
  },
  327092: $0 => {
    var target = document.querySelector(UTF8ToString($0));
    if (target) {
      var SDL3 = Module["SDL3"];
      target.removeEventListener("dragleave", SDL3.eventHandlerDropDragend);
      target.removeEventListener("dragend", SDL3.eventHandlerDropDragend);
      target.removeEventListener("drop", SDL3.eventHandlerDropDrop);
      SDL3.drop_count = undefined;
      function recursive_remove(dirpath) {
        FS.readdir(dirpath).forEach(filename => {
          const p = `${dirpath}/${filename}`;
          const p_s = FS.stat(p);
          if (FS.isFile(p_s.mode)) {
            FS.unlink(p);
          } else if (FS.isDir(p)) {
            recursive_remove(p);
          }
        });
        FS.rmdir(dirpath);
      }
      ("/tmp/filedrop");
      FS.rmdir("/tmp/filedrop");
      target.removeEventListener("dragover", SDL3.eventHandlerDropDragover);
      SDL3.eventHandlerDropDragover = undefined;
      SDL3.eventHandlerDropDrop = undefined;
      SDL3.eventHandlerDropDragend = undefined;
    }
  },
  327922: $0 => {
    var target = document.querySelector(UTF8ToString($0));
    if (target) {
      var SDL3 = Module["SDL3"];
      target.removeEventListener("pointerenter", SDL3.eventHandlerPointerEnter);
      target.removeEventListener("pointerleave", SDL3.eventHandlerPointerLeave);
      target.removeEventListener("pointercancel", SDL3.eventHandlerPointerLeave);
      target.removeEventListener("pointerdown", SDL3.eventHandlerPointerGeneric);
      target.removeEventListener("pointerup", SDL3.eventHandlerPointerGeneric);
      target.removeEventListener("pointermove", SDL3.eventHandlerPointerGeneric);
      SDL3.eventHandlerPointerEnter = undefined;
      SDL3.eventHandlerPointerLeave = undefined;
      SDL3.eventHandlerPointerGeneric = undefined;
    }
  },
  328607: () => {
    if (!window.matchMedia) {
      return -1;
    }
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return 0;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return 1;
    }
    return -1;
  },
  328816: () => {
    if (typeof (Module["SDL3"]) !== "undefined") {
      var SDL3 = Module["SDL3"];
      SDL3.themeChangedMatchMedia.removeEventListener("change", SDL3.eventHandlerThemeChanged);
      SDL3.themeChangedMatchMedia = undefined;
      SDL3.eventHandlerThemeChanged = undefined;
    }
  },
  329069: () => window.innerWidth,
  329099: () => window.innerHeight,
  329130: $0 => {
    Module["requestFullscreen"] = function(lockPointer, resizeCanvas) {
      _requestFullscreenThroughSDL($0);
    };
  },
  329239: () => {
    Module["requestFullscreen"] = function(lockPointer, resizeCanvas) {};
  },
  329313: () => {
    if (window.matchMedia) {
      if (typeof (Module["SDL3"]) === "undefined") {
        Module["SDL3"] = {};
      }
      var SDL3 = Module["SDL3"];
      SDL3.eventHandlerThemeChanged = function(event) {
        _Emscripten_SendSystemThemeChangedEvent();
      };
      SDL3.themeChangedMatchMedia = window.matchMedia("(prefers-color-scheme: dark)");
      SDL3.themeChangedMatchMedia.addEventListener("change", SDL3.eventHandlerThemeChanged);
    }
  },
  329704: ($0, $1, $2, $3, $4) => {
    var title = UTF8ToString($0);
    var message = UTF8ToString($1);
    var background = UTF8ToString($2);
    var color = UTF8ToString($3);
    var id = UTF8ToString($4);
    var dialog = document.createElement("dialog");
    dialog.classList.add("SDL3_messagebox");
    dialog.id = id;
    dialog.style.color = color;
    dialog.style.backgroundColor = background;
    document.body.append(dialog);
    var h1 = document.createElement("h1");
    h1.innerText = title;
    dialog.append(h1);
    var p = document.createElement("p");
    p.innerText = message;
    dialog.append(p);
    dialog.showModal();
  },
  330245: ($0, $1, $2, $3, $4, $5, $6, $7) => {
    var dialog_id = UTF8ToString($0);
    var text = UTF8ToString($1);
    var responseId = $2;
    var clickOnReturn = $3;
    var clickOnEscape = $4;
    var border = UTF8ToString($5);
    var background = UTF8ToString($6);
    var hovered = UTF8ToString($7);
    var dialog = document.getElementById(dialog_id);
    if (!dialog) {
      return false;
    }
    var button = document.createElement("button");
    button.innerText = text;
    button.style.borderColor = border;
    button.style.backgroundColor = background;
    dialog.addEventListener("keydown", function(e) {
      if (clickOnReturn && e.key === "Enter") {
        e.preventDefault();
        button.click();
      } else if (clickOnEscape && e.key === "Escape") {
        e.preventDefault();
        button.click();
      }
    });
    dialog.addEventListener("cancel", function(e) {
      e.preventDefault();
    });
    button.onmouseenter = function(e) {
      button.style.backgroundColor = hovered;
    };
    button.onmouseleave = function(e) {
      button.style.backgroundColor = background;
    };
    button.onclick = function(e) {
      dialog.close(responseId);
    };
    dialog.append(button);
    return true;
  },
  331254: $0 => {
    var dialog_id = UTF8ToString($0);
    var dialog = document.getElementById(dialog_id);
    if (!dialog) {
      return false;
    }
    return dialog.open;
  },
  331392: $0 => {
    var dialog_id = UTF8ToString($0);
    var dialog = document.getElementById(dialog_id);
    if (!dialog) {
      return 0;
    }
    try {
      return parseInt(dialog.returnValue);
    } catch (e) {
      return 0;
    }
  },
  331574: ($0, $1) => {
    alert(UTF8ToString($0) + "\n\n" + UTF8ToString($1));
  },
  331631: $0 => {
    window.open(UTF8ToString($0), "_blank");
  }
};

// Imports from the Wasm binary.
var _ma_device__on_notification_unlocked = Module["_ma_device__on_notification_unlocked"] = makeInvalidEarlyAccess("_ma_device__on_notification_unlocked");

var _ma_malloc_emscripten = Module["_ma_malloc_emscripten"] = makeInvalidEarlyAccess("_ma_malloc_emscripten");

var _ma_free_emscripten = Module["_ma_free_emscripten"] = makeInvalidEarlyAccess("_ma_free_emscripten");

var _ma_device_process_pcm_frames_capture__webaudio = Module["_ma_device_process_pcm_frames_capture__webaudio"] = makeInvalidEarlyAccess("_ma_device_process_pcm_frames_capture__webaudio");

var _ma_device_process_pcm_frames_playback__webaudio = Module["_ma_device_process_pcm_frames_playback__webaudio"] = makeInvalidEarlyAccess("_ma_device_process_pcm_frames_playback__webaudio");

var _malloc = makeInvalidEarlyAccess("_malloc");

var _free = makeInvalidEarlyAccess("_free");

var _main = Module["_main"] = makeInvalidEarlyAccess("_main");

var _SDL_free = Module["_SDL_free"] = makeInvalidEarlyAccess("_SDL_free");

var _SDL_malloc = Module["_SDL_malloc"] = makeInvalidEarlyAccess("_SDL_malloc");

var _SDL_calloc = Module["_SDL_calloc"] = makeInvalidEarlyAccess("_SDL_calloc");

var _SDL_realloc = Module["_SDL_realloc"] = makeInvalidEarlyAccess("_SDL_realloc");

var _strerror = makeInvalidEarlyAccess("_strerror");

var _fflush = makeInvalidEarlyAccess("_fflush");

var _Emscripten_HandlePointerEnter = Module["_Emscripten_HandlePointerEnter"] = makeInvalidEarlyAccess("_Emscripten_HandlePointerEnter");

var _Emscripten_HandlePointerLeave = Module["_Emscripten_HandlePointerLeave"] = makeInvalidEarlyAccess("_Emscripten_HandlePointerLeave");

var _Emscripten_HandlePointerGeneric = Module["_Emscripten_HandlePointerGeneric"] = makeInvalidEarlyAccess("_Emscripten_HandlePointerGeneric");

var _Emscripten_SendDragEvent = Module["_Emscripten_SendDragEvent"] = makeInvalidEarlyAccess("_Emscripten_SendDragEvent");

var _Emscripten_SendDragCompleteEvent = Module["_Emscripten_SendDragCompleteEvent"] = makeInvalidEarlyAccess("_Emscripten_SendDragCompleteEvent");

var _Emscripten_SendDragTextEvent = Module["_Emscripten_SendDragTextEvent"] = makeInvalidEarlyAccess("_Emscripten_SendDragTextEvent");

var _Emscripten_SendDragFileEvent = Module["_Emscripten_SendDragFileEvent"] = makeInvalidEarlyAccess("_Emscripten_SendDragFileEvent");

var _Emscripten_SendSystemThemeChangedEvent = Module["_Emscripten_SendSystemThemeChangedEvent"] = makeInvalidEarlyAccess("_Emscripten_SendSystemThemeChangedEvent");

var _requestFullscreenThroughSDL = Module["_requestFullscreenThroughSDL"] = makeInvalidEarlyAccess("_requestFullscreenThroughSDL");

var _emscripten_stack_get_end = makeInvalidEarlyAccess("_emscripten_stack_get_end");

var _emscripten_stack_get_base = makeInvalidEarlyAccess("_emscripten_stack_get_base");

var _emscripten_stack_init = makeInvalidEarlyAccess("_emscripten_stack_init");

var _emscripten_stack_get_free = makeInvalidEarlyAccess("_emscripten_stack_get_free");

var __emscripten_stack_restore = makeInvalidEarlyAccess("__emscripten_stack_restore");

var __emscripten_stack_alloc = makeInvalidEarlyAccess("__emscripten_stack_alloc");

var _emscripten_stack_get_current = makeInvalidEarlyAccess("_emscripten_stack_get_current");

var __emscripten_wasm_worker_initialize = makeInvalidEarlyAccess("__emscripten_wasm_worker_initialize");

var dynCall_iii = makeInvalidEarlyAccess("dynCall_iii");

var dynCall_iiii = makeInvalidEarlyAccess("dynCall_iiii");

var dynCall_vii = makeInvalidEarlyAccess("dynCall_vii");

var dynCall_vi = makeInvalidEarlyAccess("dynCall_vi");

var dynCall_ii = makeInvalidEarlyAccess("dynCall_ii");

var dynCall_iiiii = makeInvalidEarlyAccess("dynCall_iiiii");

var dynCall_viii = makeInvalidEarlyAccess("dynCall_viii");

var dynCall_iiiiii = makeInvalidEarlyAccess("dynCall_iiiiii");

var dynCall_iiiji = makeInvalidEarlyAccess("dynCall_iiiji");

var dynCall_iiji = makeInvalidEarlyAccess("dynCall_iiji");

var dynCall_viiii = makeInvalidEarlyAccess("dynCall_viiii");

var dynCall_iiiiiiii = makeInvalidEarlyAccess("dynCall_iiiiiiii");

var dynCall_iiiiiii = makeInvalidEarlyAccess("dynCall_iiiiiii");

var dynCall_iij = makeInvalidEarlyAccess("dynCall_iij");

var dynCall_viiiii = makeInvalidEarlyAccess("dynCall_viiiii");

var dynCall_jii = makeInvalidEarlyAccess("dynCall_jii");

var dynCall_iiiiiiiii = makeInvalidEarlyAccess("dynCall_iiiiiiiii");

var dynCall_v = makeInvalidEarlyAccess("dynCall_v");

var dynCall_vifff = makeInvalidEarlyAccess("dynCall_vifff");

var dynCall_viiiifiii = makeInvalidEarlyAccess("dynCall_viiiifiii");

var dynCall_viiiiffii = makeInvalidEarlyAccess("dynCall_viiiiffii");

var dynCall_viiiiiif = makeInvalidEarlyAccess("dynCall_viiiiiif");

var dynCall_viiifi = makeInvalidEarlyAccess("dynCall_viiifi");

var dynCall_jiji = makeInvalidEarlyAccess("dynCall_jiji");

var dynCall_viiiiii = makeInvalidEarlyAccess("dynCall_viiiiii");

var dynCall_i = makeInvalidEarlyAccess("dynCall_i");

var dynCall_idiii = makeInvalidEarlyAccess("dynCall_idiii");

var dynCall_viifiii = makeInvalidEarlyAccess("dynCall_viifiii");

var dynCall_vffff = makeInvalidEarlyAccess("dynCall_vffff");

var dynCall_vf = makeInvalidEarlyAccess("dynCall_vf");

var dynCall_viiiiiiii = makeInvalidEarlyAccess("dynCall_viiiiiiii");

var dynCall_viiiiiiiii = makeInvalidEarlyAccess("dynCall_viiiiiiiii");

var dynCall_vff = makeInvalidEarlyAccess("dynCall_vff");

var dynCall_viiiiiii = makeInvalidEarlyAccess("dynCall_viiiiiii");

var dynCall_vfi = makeInvalidEarlyAccess("dynCall_vfi");

var dynCall_viif = makeInvalidEarlyAccess("dynCall_viif");

var dynCall_vif = makeInvalidEarlyAccess("dynCall_vif");

var dynCall_viff = makeInvalidEarlyAccess("dynCall_viff");

var dynCall_viffff = makeInvalidEarlyAccess("dynCall_viffff");

var dynCall_vfff = makeInvalidEarlyAccess("dynCall_vfff");

var dynCall_viiiiiiiiii = makeInvalidEarlyAccess("dynCall_viiiiiiiiii");

var dynCall_viiiiiiiiiii = makeInvalidEarlyAccess("dynCall_viiiiiiiiiii");

var dynCall_viifi = makeInvalidEarlyAccess("dynCall_viifi");

var dynCall_iidiiii = makeInvalidEarlyAccess("dynCall_iidiiii");

var dynCall_viijii = makeInvalidEarlyAccess("dynCall_viijii");

var dynCall_iiiiij = makeInvalidEarlyAccess("dynCall_iiiiij");

var dynCall_iiiiid = makeInvalidEarlyAccess("dynCall_iiiiid");

var dynCall_iiiiijj = makeInvalidEarlyAccess("dynCall_iiiiijj");

var dynCall_iiiiiijj = makeInvalidEarlyAccess("dynCall_iiiiiijj");

var _asyncify_start_unwind = makeInvalidEarlyAccess("_asyncify_start_unwind");

var _asyncify_stop_unwind = makeInvalidEarlyAccess("_asyncify_stop_unwind");

var _asyncify_start_rewind = makeInvalidEarlyAccess("_asyncify_start_rewind");

var _asyncify_stop_rewind = makeInvalidEarlyAccess("_asyncify_stop_rewind");

function assignWasmExports(wasmExports) {
  Module["_ma_device__on_notification_unlocked"] = _ma_device__on_notification_unlocked = createExportWrapper("ma_device__on_notification_unlocked", 1);
  Module["_ma_malloc_emscripten"] = _ma_malloc_emscripten = createExportWrapper("ma_malloc_emscripten", 2);
  Module["_ma_free_emscripten"] = _ma_free_emscripten = createExportWrapper("ma_free_emscripten", 2);
  Module["_ma_device_process_pcm_frames_capture__webaudio"] = _ma_device_process_pcm_frames_capture__webaudio = createExportWrapper("ma_device_process_pcm_frames_capture__webaudio", 3);
  Module["_ma_device_process_pcm_frames_playback__webaudio"] = _ma_device_process_pcm_frames_playback__webaudio = createExportWrapper("ma_device_process_pcm_frames_playback__webaudio", 3);
  _malloc = createExportWrapper("malloc", 1);
  _free = createExportWrapper("free", 1);
  Module["_main"] = _main = createExportWrapper("__main_argc_argv", 2);
  Module["_SDL_free"] = _SDL_free = createExportWrapper("SDL_free", 1);
  Module["_SDL_malloc"] = _SDL_malloc = createExportWrapper("SDL_malloc", 1);
  Module["_SDL_calloc"] = _SDL_calloc = createExportWrapper("SDL_calloc", 2);
  Module["_SDL_realloc"] = _SDL_realloc = createExportWrapper("SDL_realloc", 2);
  _strerror = createExportWrapper("strerror", 1);
  _fflush = createExportWrapper("fflush", 1);
  Module["_Emscripten_HandlePointerEnter"] = _Emscripten_HandlePointerEnter = createExportWrapper("Emscripten_HandlePointerEnter", 2);
  Module["_Emscripten_HandlePointerLeave"] = _Emscripten_HandlePointerLeave = createExportWrapper("Emscripten_HandlePointerLeave", 2);
  Module["_Emscripten_HandlePointerGeneric"] = _Emscripten_HandlePointerGeneric = createExportWrapper("Emscripten_HandlePointerGeneric", 2);
  Module["_Emscripten_SendDragEvent"] = _Emscripten_SendDragEvent = createExportWrapper("Emscripten_SendDragEvent", 2);
  Module["_Emscripten_SendDragCompleteEvent"] = _Emscripten_SendDragCompleteEvent = createExportWrapper("Emscripten_SendDragCompleteEvent", 1);
  Module["_Emscripten_SendDragTextEvent"] = _Emscripten_SendDragTextEvent = createExportWrapper("Emscripten_SendDragTextEvent", 2);
  Module["_Emscripten_SendDragFileEvent"] = _Emscripten_SendDragFileEvent = createExportWrapper("Emscripten_SendDragFileEvent", 2);
  Module["_Emscripten_SendSystemThemeChangedEvent"] = _Emscripten_SendSystemThemeChangedEvent = createExportWrapper("Emscripten_SendSystemThemeChangedEvent", 0);
  Module["_requestFullscreenThroughSDL"] = _requestFullscreenThroughSDL = createExportWrapper("requestFullscreenThroughSDL", 1);
  _emscripten_stack_get_end = wasmExports["emscripten_stack_get_end"];
  _emscripten_stack_get_base = wasmExports["emscripten_stack_get_base"];
  _emscripten_stack_init = wasmExports["emscripten_stack_init"];
  _emscripten_stack_get_free = wasmExports["emscripten_stack_get_free"];
  __emscripten_stack_restore = wasmExports["_emscripten_stack_restore"];
  __emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"];
  _emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"];
  __emscripten_wasm_worker_initialize = createExportWrapper("_emscripten_wasm_worker_initialize", 2);
  dynCalls["iii"] = dynCall_iii = createExportWrapper("dynCall_iii", 3);
  dynCalls["iiii"] = dynCall_iiii = createExportWrapper("dynCall_iiii", 4);
  dynCalls["vii"] = dynCall_vii = createExportWrapper("dynCall_vii", 3);
  dynCalls["vi"] = dynCall_vi = createExportWrapper("dynCall_vi", 2);
  dynCalls["ii"] = dynCall_ii = createExportWrapper("dynCall_ii", 2);
  dynCalls["iiiii"] = dynCall_iiiii = createExportWrapper("dynCall_iiiii", 5);
  dynCalls["viii"] = dynCall_viii = createExportWrapper("dynCall_viii", 4);
  dynCalls["iiiiii"] = dynCall_iiiiii = createExportWrapper("dynCall_iiiiii", 6);
  dynCalls["iiiji"] = dynCall_iiiji = createExportWrapper("dynCall_iiiji", 5);
  dynCalls["iiji"] = dynCall_iiji = createExportWrapper("dynCall_iiji", 4);
  dynCalls["viiii"] = dynCall_viiii = createExportWrapper("dynCall_viiii", 5);
  dynCalls["iiiiiiii"] = dynCall_iiiiiiii = createExportWrapper("dynCall_iiiiiiii", 8);
  dynCalls["iiiiiii"] = dynCall_iiiiiii = createExportWrapper("dynCall_iiiiiii", 7);
  dynCalls["iij"] = dynCall_iij = createExportWrapper("dynCall_iij", 3);
  dynCalls["viiiii"] = dynCall_viiiii = createExportWrapper("dynCall_viiiii", 6);
  dynCalls["jii"] = dynCall_jii = createExportWrapper("dynCall_jii", 3);
  dynCalls["iiiiiiiii"] = dynCall_iiiiiiiii = createExportWrapper("dynCall_iiiiiiiii", 9);
  dynCalls["v"] = dynCall_v = createExportWrapper("dynCall_v", 1);
  dynCalls["vifff"] = dynCall_vifff = createExportWrapper("dynCall_vifff", 5);
  dynCalls["viiiifiii"] = dynCall_viiiifiii = createExportWrapper("dynCall_viiiifiii", 9);
  dynCalls["viiiiffii"] = dynCall_viiiiffii = createExportWrapper("dynCall_viiiiffii", 9);
  dynCalls["viiiiiif"] = dynCall_viiiiiif = createExportWrapper("dynCall_viiiiiif", 8);
  dynCalls["viiifi"] = dynCall_viiifi = createExportWrapper("dynCall_viiifi", 6);
  dynCalls["jiji"] = dynCall_jiji = createExportWrapper("dynCall_jiji", 4);
  dynCalls["viiiiii"] = dynCall_viiiiii = createExportWrapper("dynCall_viiiiii", 7);
  dynCalls["i"] = dynCall_i = createExportWrapper("dynCall_i", 1);
  dynCalls["idiii"] = dynCall_idiii = createExportWrapper("dynCall_idiii", 5);
  dynCalls["viifiii"] = dynCall_viifiii = createExportWrapper("dynCall_viifiii", 7);
  dynCalls["vffff"] = dynCall_vffff = createExportWrapper("dynCall_vffff", 5);
  dynCalls["vf"] = dynCall_vf = createExportWrapper("dynCall_vf", 2);
  dynCalls["viiiiiiii"] = dynCall_viiiiiiii = createExportWrapper("dynCall_viiiiiiii", 9);
  dynCalls["viiiiiiiii"] = dynCall_viiiiiiiii = createExportWrapper("dynCall_viiiiiiiii", 10);
  dynCalls["vff"] = dynCall_vff = createExportWrapper("dynCall_vff", 3);
  dynCalls["viiiiiii"] = dynCall_viiiiiii = createExportWrapper("dynCall_viiiiiii", 8);
  dynCalls["vfi"] = dynCall_vfi = createExportWrapper("dynCall_vfi", 3);
  dynCalls["viif"] = dynCall_viif = createExportWrapper("dynCall_viif", 4);
  dynCalls["vif"] = dynCall_vif = createExportWrapper("dynCall_vif", 3);
  dynCalls["viff"] = dynCall_viff = createExportWrapper("dynCall_viff", 4);
  dynCalls["viffff"] = dynCall_viffff = createExportWrapper("dynCall_viffff", 6);
  dynCalls["vfff"] = dynCall_vfff = createExportWrapper("dynCall_vfff", 4);
  dynCalls["viiiiiiiiii"] = dynCall_viiiiiiiiii = createExportWrapper("dynCall_viiiiiiiiii", 11);
  dynCalls["viiiiiiiiiii"] = dynCall_viiiiiiiiiii = createExportWrapper("dynCall_viiiiiiiiiii", 12);
  dynCalls["viifi"] = dynCall_viifi = createExportWrapper("dynCall_viifi", 5);
  dynCalls["iidiiii"] = dynCall_iidiiii = createExportWrapper("dynCall_iidiiii", 7);
  dynCalls["viijii"] = dynCall_viijii = createExportWrapper("dynCall_viijii", 6);
  dynCalls["iiiiij"] = dynCall_iiiiij = createExportWrapper("dynCall_iiiiij", 6);
  dynCalls["iiiiid"] = dynCall_iiiiid = createExportWrapper("dynCall_iiiiid", 6);
  dynCalls["iiiiijj"] = dynCall_iiiiijj = createExportWrapper("dynCall_iiiiijj", 7);
  dynCalls["iiiiiijj"] = dynCall_iiiiiijj = createExportWrapper("dynCall_iiiiiijj", 8);
  _asyncify_start_unwind = createExportWrapper("asyncify_start_unwind", 1);
  _asyncify_stop_unwind = createExportWrapper("asyncify_stop_unwind", 0);
  _asyncify_start_rewind = createExportWrapper("asyncify_start_rewind", 1);
  _asyncify_stop_rewind = createExportWrapper("asyncify_stop_rewind", 0);
}

var wasmImports;

function assignWasmImports() {
  wasmImports = {
    /** @export */ __assert_fail: ___assert_fail,
    /** @export */ __cxa_throw: ___cxa_throw,
    /** @export */ __syscall_fcntl64: ___syscall_fcntl64,
    /** @export */ __syscall_fdatasync: ___syscall_fdatasync,
    /** @export */ __syscall_fstat64: ___syscall_fstat64,
    /** @export */ __syscall_ioctl: ___syscall_ioctl,
    /** @export */ __syscall_lstat64: ___syscall_lstat64,
    /** @export */ __syscall_newfstatat: ___syscall_newfstatat,
    /** @export */ __syscall_openat: ___syscall_openat,
    /** @export */ __syscall_stat64: ___syscall_stat64,
    /** @export */ _abort_js: __abort_js,
    /** @export */ _gmtime_js: __gmtime_js,
    /** @export */ _localtime_js: __localtime_js,
    /** @export */ _mktime_js: __mktime_js,
    /** @export */ _timegm_js: __timegm_js,
    /** @export */ _tzset_js: __tzset_js,
    /** @export */ clock_time_get: _clock_time_get,
    /** @export */ emscripten_asm_const_double_sync_on_main_thread: _emscripten_asm_const_double_sync_on_main_thread,
    /** @export */ emscripten_asm_const_int: _emscripten_asm_const_int,
    /** @export */ emscripten_asm_const_int_sync_on_main_thread: _emscripten_asm_const_int_sync_on_main_thread,
    /** @export */ emscripten_asm_const_ptr_sync_on_main_thread: _emscripten_asm_const_ptr_sync_on_main_thread,
    /** @export */ emscripten_audio_context_quantum_size: _emscripten_audio_context_quantum_size,
    /** @export */ emscripten_cancel_main_loop: _emscripten_cancel_main_loop,
    /** @export */ emscripten_create_audio_context: _emscripten_create_audio_context,
    /** @export */ emscripten_create_wasm_audio_worklet_node: _emscripten_create_wasm_audio_worklet_node,
    /** @export */ emscripten_create_wasm_audio_worklet_processor_async: _emscripten_create_wasm_audio_worklet_processor_async,
    /** @export */ emscripten_date_now: _emscripten_date_now,
    /** @export */ emscripten_destroy_audio_context: _emscripten_destroy_audio_context,
    /** @export */ emscripten_destroy_web_audio_node: _emscripten_destroy_web_audio_node,
    /** @export */ emscripten_err: _emscripten_err,
    /** @export */ emscripten_exit_fullscreen: _emscripten_exit_fullscreen,
    /** @export */ emscripten_exit_pointerlock: _emscripten_exit_pointerlock,
    /** @export */ emscripten_force_exit: _emscripten_force_exit,
    /** @export */ emscripten_get_device_pixel_ratio: _emscripten_get_device_pixel_ratio,
    /** @export */ emscripten_get_element_css_size: _emscripten_get_element_css_size,
    /** @export */ emscripten_get_gamepad_status: _emscripten_get_gamepad_status,
    /** @export */ emscripten_get_main_loop_timing: _emscripten_get_main_loop_timing,
    /** @export */ emscripten_get_now: _emscripten_get_now,
    /** @export */ emscripten_get_num_gamepads: _emscripten_get_num_gamepads,
    /** @export */ emscripten_get_screen_size: _emscripten_get_screen_size,
    /** @export */ emscripten_glActiveTexture: _emscripten_glActiveTexture,
    /** @export */ emscripten_glAttachShader: _emscripten_glAttachShader,
    /** @export */ emscripten_glBeginQuery: _emscripten_glBeginQuery,
    /** @export */ emscripten_glBeginQueryEXT: _emscripten_glBeginQueryEXT,
    /** @export */ emscripten_glBeginTransformFeedback: _emscripten_glBeginTransformFeedback,
    /** @export */ emscripten_glBindAttribLocation: _emscripten_glBindAttribLocation,
    /** @export */ emscripten_glBindBuffer: _emscripten_glBindBuffer,
    /** @export */ emscripten_glBindBufferBase: _emscripten_glBindBufferBase,
    /** @export */ emscripten_glBindBufferRange: _emscripten_glBindBufferRange,
    /** @export */ emscripten_glBindFramebuffer: _emscripten_glBindFramebuffer,
    /** @export */ emscripten_glBindRenderbuffer: _emscripten_glBindRenderbuffer,
    /** @export */ emscripten_glBindSampler: _emscripten_glBindSampler,
    /** @export */ emscripten_glBindTexture: _emscripten_glBindTexture,
    /** @export */ emscripten_glBindTransformFeedback: _emscripten_glBindTransformFeedback,
    /** @export */ emscripten_glBindVertexArray: _emscripten_glBindVertexArray,
    /** @export */ emscripten_glBindVertexArrayOES: _emscripten_glBindVertexArrayOES,
    /** @export */ emscripten_glBlendColor: _emscripten_glBlendColor,
    /** @export */ emscripten_glBlendEquation: _emscripten_glBlendEquation,
    /** @export */ emscripten_glBlendEquationSeparate: _emscripten_glBlendEquationSeparate,
    /** @export */ emscripten_glBlendFunc: _emscripten_glBlendFunc,
    /** @export */ emscripten_glBlendFuncSeparate: _emscripten_glBlendFuncSeparate,
    /** @export */ emscripten_glBlitFramebuffer: _emscripten_glBlitFramebuffer,
    /** @export */ emscripten_glBufferData: _emscripten_glBufferData,
    /** @export */ emscripten_glBufferSubData: _emscripten_glBufferSubData,
    /** @export */ emscripten_glCheckFramebufferStatus: _emscripten_glCheckFramebufferStatus,
    /** @export */ emscripten_glClear: _emscripten_glClear,
    /** @export */ emscripten_glClearBufferfi: _emscripten_glClearBufferfi,
    /** @export */ emscripten_glClearBufferfv: _emscripten_glClearBufferfv,
    /** @export */ emscripten_glClearBufferiv: _emscripten_glClearBufferiv,
    /** @export */ emscripten_glClearBufferuiv: _emscripten_glClearBufferuiv,
    /** @export */ emscripten_glClearColor: _emscripten_glClearColor,
    /** @export */ emscripten_glClearDepthf: _emscripten_glClearDepthf,
    /** @export */ emscripten_glClearStencil: _emscripten_glClearStencil,
    /** @export */ emscripten_glClientWaitSync: _emscripten_glClientWaitSync,
    /** @export */ emscripten_glClipControlEXT: _emscripten_glClipControlEXT,
    /** @export */ emscripten_glColorMask: _emscripten_glColorMask,
    /** @export */ emscripten_glCompileShader: _emscripten_glCompileShader,
    /** @export */ emscripten_glCompressedTexImage2D: _emscripten_glCompressedTexImage2D,
    /** @export */ emscripten_glCompressedTexImage3D: _emscripten_glCompressedTexImage3D,
    /** @export */ emscripten_glCompressedTexSubImage2D: _emscripten_glCompressedTexSubImage2D,
    /** @export */ emscripten_glCompressedTexSubImage3D: _emscripten_glCompressedTexSubImage3D,
    /** @export */ emscripten_glCopyBufferSubData: _emscripten_glCopyBufferSubData,
    /** @export */ emscripten_glCopyTexImage2D: _emscripten_glCopyTexImage2D,
    /** @export */ emscripten_glCopyTexSubImage2D: _emscripten_glCopyTexSubImage2D,
    /** @export */ emscripten_glCopyTexSubImage3D: _emscripten_glCopyTexSubImage3D,
    /** @export */ emscripten_glCreateProgram: _emscripten_glCreateProgram,
    /** @export */ emscripten_glCreateShader: _emscripten_glCreateShader,
    /** @export */ emscripten_glCullFace: _emscripten_glCullFace,
    /** @export */ emscripten_glDeleteBuffers: _emscripten_glDeleteBuffers,
    /** @export */ emscripten_glDeleteFramebuffers: _emscripten_glDeleteFramebuffers,
    /** @export */ emscripten_glDeleteProgram: _emscripten_glDeleteProgram,
    /** @export */ emscripten_glDeleteQueries: _emscripten_glDeleteQueries,
    /** @export */ emscripten_glDeleteQueriesEXT: _emscripten_glDeleteQueriesEXT,
    /** @export */ emscripten_glDeleteRenderbuffers: _emscripten_glDeleteRenderbuffers,
    /** @export */ emscripten_glDeleteSamplers: _emscripten_glDeleteSamplers,
    /** @export */ emscripten_glDeleteShader: _emscripten_glDeleteShader,
    /** @export */ emscripten_glDeleteSync: _emscripten_glDeleteSync,
    /** @export */ emscripten_glDeleteTextures: _emscripten_glDeleteTextures,
    /** @export */ emscripten_glDeleteTransformFeedbacks: _emscripten_glDeleteTransformFeedbacks,
    /** @export */ emscripten_glDeleteVertexArrays: _emscripten_glDeleteVertexArrays,
    /** @export */ emscripten_glDeleteVertexArraysOES: _emscripten_glDeleteVertexArraysOES,
    /** @export */ emscripten_glDepthFunc: _emscripten_glDepthFunc,
    /** @export */ emscripten_glDepthMask: _emscripten_glDepthMask,
    /** @export */ emscripten_glDepthRangef: _emscripten_glDepthRangef,
    /** @export */ emscripten_glDetachShader: _emscripten_glDetachShader,
    /** @export */ emscripten_glDisable: _emscripten_glDisable,
    /** @export */ emscripten_glDisableVertexAttribArray: _emscripten_glDisableVertexAttribArray,
    /** @export */ emscripten_glDrawArrays: _emscripten_glDrawArrays,
    /** @export */ emscripten_glDrawArraysInstanced: _emscripten_glDrawArraysInstanced,
    /** @export */ emscripten_glDrawArraysInstancedANGLE: _emscripten_glDrawArraysInstancedANGLE,
    /** @export */ emscripten_glDrawArraysInstancedARB: _emscripten_glDrawArraysInstancedARB,
    /** @export */ emscripten_glDrawArraysInstancedEXT: _emscripten_glDrawArraysInstancedEXT,
    /** @export */ emscripten_glDrawArraysInstancedNV: _emscripten_glDrawArraysInstancedNV,
    /** @export */ emscripten_glDrawBuffers: _emscripten_glDrawBuffers,
    /** @export */ emscripten_glDrawBuffersEXT: _emscripten_glDrawBuffersEXT,
    /** @export */ emscripten_glDrawBuffersWEBGL: _emscripten_glDrawBuffersWEBGL,
    /** @export */ emscripten_glDrawElements: _emscripten_glDrawElements,
    /** @export */ emscripten_glDrawElementsInstanced: _emscripten_glDrawElementsInstanced,
    /** @export */ emscripten_glDrawElementsInstancedANGLE: _emscripten_glDrawElementsInstancedANGLE,
    /** @export */ emscripten_glDrawElementsInstancedARB: _emscripten_glDrawElementsInstancedARB,
    /** @export */ emscripten_glDrawElementsInstancedEXT: _emscripten_glDrawElementsInstancedEXT,
    /** @export */ emscripten_glDrawElementsInstancedNV: _emscripten_glDrawElementsInstancedNV,
    /** @export */ emscripten_glDrawRangeElements: _emscripten_glDrawRangeElements,
    /** @export */ emscripten_glEnable: _emscripten_glEnable,
    /** @export */ emscripten_glEnableVertexAttribArray: _emscripten_glEnableVertexAttribArray,
    /** @export */ emscripten_glEndQuery: _emscripten_glEndQuery,
    /** @export */ emscripten_glEndQueryEXT: _emscripten_glEndQueryEXT,
    /** @export */ emscripten_glEndTransformFeedback: _emscripten_glEndTransformFeedback,
    /** @export */ emscripten_glFenceSync: _emscripten_glFenceSync,
    /** @export */ emscripten_glFinish: _emscripten_glFinish,
    /** @export */ emscripten_glFlush: _emscripten_glFlush,
    /** @export */ emscripten_glFlushMappedBufferRange: _emscripten_glFlushMappedBufferRange,
    /** @export */ emscripten_glFramebufferRenderbuffer: _emscripten_glFramebufferRenderbuffer,
    /** @export */ emscripten_glFramebufferTexture2D: _emscripten_glFramebufferTexture2D,
    /** @export */ emscripten_glFramebufferTextureLayer: _emscripten_glFramebufferTextureLayer,
    /** @export */ emscripten_glFrontFace: _emscripten_glFrontFace,
    /** @export */ emscripten_glGenBuffers: _emscripten_glGenBuffers,
    /** @export */ emscripten_glGenFramebuffers: _emscripten_glGenFramebuffers,
    /** @export */ emscripten_glGenQueries: _emscripten_glGenQueries,
    /** @export */ emscripten_glGenQueriesEXT: _emscripten_glGenQueriesEXT,
    /** @export */ emscripten_glGenRenderbuffers: _emscripten_glGenRenderbuffers,
    /** @export */ emscripten_glGenSamplers: _emscripten_glGenSamplers,
    /** @export */ emscripten_glGenTextures: _emscripten_glGenTextures,
    /** @export */ emscripten_glGenTransformFeedbacks: _emscripten_glGenTransformFeedbacks,
    /** @export */ emscripten_glGenVertexArrays: _emscripten_glGenVertexArrays,
    /** @export */ emscripten_glGenVertexArraysOES: _emscripten_glGenVertexArraysOES,
    /** @export */ emscripten_glGenerateMipmap: _emscripten_glGenerateMipmap,
    /** @export */ emscripten_glGetActiveAttrib: _emscripten_glGetActiveAttrib,
    /** @export */ emscripten_glGetActiveUniform: _emscripten_glGetActiveUniform,
    /** @export */ emscripten_glGetActiveUniformBlockName: _emscripten_glGetActiveUniformBlockName,
    /** @export */ emscripten_glGetActiveUniformBlockiv: _emscripten_glGetActiveUniformBlockiv,
    /** @export */ emscripten_glGetActiveUniformsiv: _emscripten_glGetActiveUniformsiv,
    /** @export */ emscripten_glGetAttachedShaders: _emscripten_glGetAttachedShaders,
    /** @export */ emscripten_glGetAttribLocation: _emscripten_glGetAttribLocation,
    /** @export */ emscripten_glGetBooleanv: _emscripten_glGetBooleanv,
    /** @export */ emscripten_glGetBufferParameteri64v: _emscripten_glGetBufferParameteri64v,
    /** @export */ emscripten_glGetBufferParameteriv: _emscripten_glGetBufferParameteriv,
    /** @export */ emscripten_glGetBufferPointerv: _emscripten_glGetBufferPointerv,
    /** @export */ emscripten_glGetError: _emscripten_glGetError,
    /** @export */ emscripten_glGetFloatv: _emscripten_glGetFloatv,
    /** @export */ emscripten_glGetFragDataLocation: _emscripten_glGetFragDataLocation,
    /** @export */ emscripten_glGetFramebufferAttachmentParameteriv: _emscripten_glGetFramebufferAttachmentParameteriv,
    /** @export */ emscripten_glGetInteger64i_v: _emscripten_glGetInteger64i_v,
    /** @export */ emscripten_glGetInteger64v: _emscripten_glGetInteger64v,
    /** @export */ emscripten_glGetIntegeri_v: _emscripten_glGetIntegeri_v,
    /** @export */ emscripten_glGetIntegerv: _emscripten_glGetIntegerv,
    /** @export */ emscripten_glGetInternalformativ: _emscripten_glGetInternalformativ,
    /** @export */ emscripten_glGetProgramBinary: _emscripten_glGetProgramBinary,
    /** @export */ emscripten_glGetProgramInfoLog: _emscripten_glGetProgramInfoLog,
    /** @export */ emscripten_glGetProgramiv: _emscripten_glGetProgramiv,
    /** @export */ emscripten_glGetQueryObjecti64vEXT: _emscripten_glGetQueryObjecti64vEXT,
    /** @export */ emscripten_glGetQueryObjectivEXT: _emscripten_glGetQueryObjectivEXT,
    /** @export */ emscripten_glGetQueryObjectui64vEXT: _emscripten_glGetQueryObjectui64vEXT,
    /** @export */ emscripten_glGetQueryObjectuiv: _emscripten_glGetQueryObjectuiv,
    /** @export */ emscripten_glGetQueryObjectuivEXT: _emscripten_glGetQueryObjectuivEXT,
    /** @export */ emscripten_glGetQueryiv: _emscripten_glGetQueryiv,
    /** @export */ emscripten_glGetQueryivEXT: _emscripten_glGetQueryivEXT,
    /** @export */ emscripten_glGetRenderbufferParameteriv: _emscripten_glGetRenderbufferParameteriv,
    /** @export */ emscripten_glGetSamplerParameterfv: _emscripten_glGetSamplerParameterfv,
    /** @export */ emscripten_glGetSamplerParameteriv: _emscripten_glGetSamplerParameteriv,
    /** @export */ emscripten_glGetShaderInfoLog: _emscripten_glGetShaderInfoLog,
    /** @export */ emscripten_glGetShaderPrecisionFormat: _emscripten_glGetShaderPrecisionFormat,
    /** @export */ emscripten_glGetShaderSource: _emscripten_glGetShaderSource,
    /** @export */ emscripten_glGetShaderiv: _emscripten_glGetShaderiv,
    /** @export */ emscripten_glGetString: _emscripten_glGetString,
    /** @export */ emscripten_glGetStringi: _emscripten_glGetStringi,
    /** @export */ emscripten_glGetSynciv: _emscripten_glGetSynciv,
    /** @export */ emscripten_glGetTexParameterfv: _emscripten_glGetTexParameterfv,
    /** @export */ emscripten_glGetTexParameteriv: _emscripten_glGetTexParameteriv,
    /** @export */ emscripten_glGetTransformFeedbackVarying: _emscripten_glGetTransformFeedbackVarying,
    /** @export */ emscripten_glGetUniformBlockIndex: _emscripten_glGetUniformBlockIndex,
    /** @export */ emscripten_glGetUniformIndices: _emscripten_glGetUniformIndices,
    /** @export */ emscripten_glGetUniformLocation: _emscripten_glGetUniformLocation,
    /** @export */ emscripten_glGetUniformfv: _emscripten_glGetUniformfv,
    /** @export */ emscripten_glGetUniformiv: _emscripten_glGetUniformiv,
    /** @export */ emscripten_glGetUniformuiv: _emscripten_glGetUniformuiv,
    /** @export */ emscripten_glGetVertexAttribIiv: _emscripten_glGetVertexAttribIiv,
    /** @export */ emscripten_glGetVertexAttribIuiv: _emscripten_glGetVertexAttribIuiv,
    /** @export */ emscripten_glGetVertexAttribPointerv: _emscripten_glGetVertexAttribPointerv,
    /** @export */ emscripten_glGetVertexAttribfv: _emscripten_glGetVertexAttribfv,
    /** @export */ emscripten_glGetVertexAttribiv: _emscripten_glGetVertexAttribiv,
    /** @export */ emscripten_glHint: _emscripten_glHint,
    /** @export */ emscripten_glInvalidateFramebuffer: _emscripten_glInvalidateFramebuffer,
    /** @export */ emscripten_glInvalidateSubFramebuffer: _emscripten_glInvalidateSubFramebuffer,
    /** @export */ emscripten_glIsBuffer: _emscripten_glIsBuffer,
    /** @export */ emscripten_glIsEnabled: _emscripten_glIsEnabled,
    /** @export */ emscripten_glIsFramebuffer: _emscripten_glIsFramebuffer,
    /** @export */ emscripten_glIsProgram: _emscripten_glIsProgram,
    /** @export */ emscripten_glIsQuery: _emscripten_glIsQuery,
    /** @export */ emscripten_glIsQueryEXT: _emscripten_glIsQueryEXT,
    /** @export */ emscripten_glIsRenderbuffer: _emscripten_glIsRenderbuffer,
    /** @export */ emscripten_glIsSampler: _emscripten_glIsSampler,
    /** @export */ emscripten_glIsShader: _emscripten_glIsShader,
    /** @export */ emscripten_glIsSync: _emscripten_glIsSync,
    /** @export */ emscripten_glIsTexture: _emscripten_glIsTexture,
    /** @export */ emscripten_glIsTransformFeedback: _emscripten_glIsTransformFeedback,
    /** @export */ emscripten_glIsVertexArray: _emscripten_glIsVertexArray,
    /** @export */ emscripten_glIsVertexArrayOES: _emscripten_glIsVertexArrayOES,
    /** @export */ emscripten_glLineWidth: _emscripten_glLineWidth,
    /** @export */ emscripten_glLinkProgram: _emscripten_glLinkProgram,
    /** @export */ emscripten_glMapBufferRange: _emscripten_glMapBufferRange,
    /** @export */ emscripten_glPauseTransformFeedback: _emscripten_glPauseTransformFeedback,
    /** @export */ emscripten_glPixelStorei: _emscripten_glPixelStorei,
    /** @export */ emscripten_glPolygonModeWEBGL: _emscripten_glPolygonModeWEBGL,
    /** @export */ emscripten_glPolygonOffset: _emscripten_glPolygonOffset,
    /** @export */ emscripten_glPolygonOffsetClampEXT: _emscripten_glPolygonOffsetClampEXT,
    /** @export */ emscripten_glProgramBinary: _emscripten_glProgramBinary,
    /** @export */ emscripten_glProgramParameteri: _emscripten_glProgramParameteri,
    /** @export */ emscripten_glQueryCounterEXT: _emscripten_glQueryCounterEXT,
    /** @export */ emscripten_glReadBuffer: _emscripten_glReadBuffer,
    /** @export */ emscripten_glReadPixels: _emscripten_glReadPixels,
    /** @export */ emscripten_glReleaseShaderCompiler: _emscripten_glReleaseShaderCompiler,
    /** @export */ emscripten_glRenderbufferStorage: _emscripten_glRenderbufferStorage,
    /** @export */ emscripten_glRenderbufferStorageMultisample: _emscripten_glRenderbufferStorageMultisample,
    /** @export */ emscripten_glResumeTransformFeedback: _emscripten_glResumeTransformFeedback,
    /** @export */ emscripten_glSampleCoverage: _emscripten_glSampleCoverage,
    /** @export */ emscripten_glSamplerParameterf: _emscripten_glSamplerParameterf,
    /** @export */ emscripten_glSamplerParameterfv: _emscripten_glSamplerParameterfv,
    /** @export */ emscripten_glSamplerParameteri: _emscripten_glSamplerParameteri,
    /** @export */ emscripten_glSamplerParameteriv: _emscripten_glSamplerParameteriv,
    /** @export */ emscripten_glScissor: _emscripten_glScissor,
    /** @export */ emscripten_glShaderBinary: _emscripten_glShaderBinary,
    /** @export */ emscripten_glShaderSource: _emscripten_glShaderSource,
    /** @export */ emscripten_glStencilFunc: _emscripten_glStencilFunc,
    /** @export */ emscripten_glStencilFuncSeparate: _emscripten_glStencilFuncSeparate,
    /** @export */ emscripten_glStencilMask: _emscripten_glStencilMask,
    /** @export */ emscripten_glStencilMaskSeparate: _emscripten_glStencilMaskSeparate,
    /** @export */ emscripten_glStencilOp: _emscripten_glStencilOp,
    /** @export */ emscripten_glStencilOpSeparate: _emscripten_glStencilOpSeparate,
    /** @export */ emscripten_glTexImage2D: _emscripten_glTexImage2D,
    /** @export */ emscripten_glTexImage3D: _emscripten_glTexImage3D,
    /** @export */ emscripten_glTexParameterf: _emscripten_glTexParameterf,
    /** @export */ emscripten_glTexParameterfv: _emscripten_glTexParameterfv,
    /** @export */ emscripten_glTexParameteri: _emscripten_glTexParameteri,
    /** @export */ emscripten_glTexParameteriv: _emscripten_glTexParameteriv,
    /** @export */ emscripten_glTexStorage2D: _emscripten_glTexStorage2D,
    /** @export */ emscripten_glTexStorage3D: _emscripten_glTexStorage3D,
    /** @export */ emscripten_glTexSubImage2D: _emscripten_glTexSubImage2D,
    /** @export */ emscripten_glTexSubImage3D: _emscripten_glTexSubImage3D,
    /** @export */ emscripten_glTransformFeedbackVaryings: _emscripten_glTransformFeedbackVaryings,
    /** @export */ emscripten_glUniform1f: _emscripten_glUniform1f,
    /** @export */ emscripten_glUniform1fv: _emscripten_glUniform1fv,
    /** @export */ emscripten_glUniform1i: _emscripten_glUniform1i,
    /** @export */ emscripten_glUniform1iv: _emscripten_glUniform1iv,
    /** @export */ emscripten_glUniform1ui: _emscripten_glUniform1ui,
    /** @export */ emscripten_glUniform1uiv: _emscripten_glUniform1uiv,
    /** @export */ emscripten_glUniform2f: _emscripten_glUniform2f,
    /** @export */ emscripten_glUniform2fv: _emscripten_glUniform2fv,
    /** @export */ emscripten_glUniform2i: _emscripten_glUniform2i,
    /** @export */ emscripten_glUniform2iv: _emscripten_glUniform2iv,
    /** @export */ emscripten_glUniform2ui: _emscripten_glUniform2ui,
    /** @export */ emscripten_glUniform2uiv: _emscripten_glUniform2uiv,
    /** @export */ emscripten_glUniform3f: _emscripten_glUniform3f,
    /** @export */ emscripten_glUniform3fv: _emscripten_glUniform3fv,
    /** @export */ emscripten_glUniform3i: _emscripten_glUniform3i,
    /** @export */ emscripten_glUniform3iv: _emscripten_glUniform3iv,
    /** @export */ emscripten_glUniform3ui: _emscripten_glUniform3ui,
    /** @export */ emscripten_glUniform3uiv: _emscripten_glUniform3uiv,
    /** @export */ emscripten_glUniform4f: _emscripten_glUniform4f,
    /** @export */ emscripten_glUniform4fv: _emscripten_glUniform4fv,
    /** @export */ emscripten_glUniform4i: _emscripten_glUniform4i,
    /** @export */ emscripten_glUniform4iv: _emscripten_glUniform4iv,
    /** @export */ emscripten_glUniform4ui: _emscripten_glUniform4ui,
    /** @export */ emscripten_glUniform4uiv: _emscripten_glUniform4uiv,
    /** @export */ emscripten_glUniformBlockBinding: _emscripten_glUniformBlockBinding,
    /** @export */ emscripten_glUniformMatrix2fv: _emscripten_glUniformMatrix2fv,
    /** @export */ emscripten_glUniformMatrix2x3fv: _emscripten_glUniformMatrix2x3fv,
    /** @export */ emscripten_glUniformMatrix2x4fv: _emscripten_glUniformMatrix2x4fv,
    /** @export */ emscripten_glUniformMatrix3fv: _emscripten_glUniformMatrix3fv,
    /** @export */ emscripten_glUniformMatrix3x2fv: _emscripten_glUniformMatrix3x2fv,
    /** @export */ emscripten_glUniformMatrix3x4fv: _emscripten_glUniformMatrix3x4fv,
    /** @export */ emscripten_glUniformMatrix4fv: _emscripten_glUniformMatrix4fv,
    /** @export */ emscripten_glUniformMatrix4x2fv: _emscripten_glUniformMatrix4x2fv,
    /** @export */ emscripten_glUniformMatrix4x3fv: _emscripten_glUniformMatrix4x3fv,
    /** @export */ emscripten_glUnmapBuffer: _emscripten_glUnmapBuffer,
    /** @export */ emscripten_glUseProgram: _emscripten_glUseProgram,
    /** @export */ emscripten_glValidateProgram: _emscripten_glValidateProgram,
    /** @export */ emscripten_glVertexAttrib1f: _emscripten_glVertexAttrib1f,
    /** @export */ emscripten_glVertexAttrib1fv: _emscripten_glVertexAttrib1fv,
    /** @export */ emscripten_glVertexAttrib2f: _emscripten_glVertexAttrib2f,
    /** @export */ emscripten_glVertexAttrib2fv: _emscripten_glVertexAttrib2fv,
    /** @export */ emscripten_glVertexAttrib3f: _emscripten_glVertexAttrib3f,
    /** @export */ emscripten_glVertexAttrib3fv: _emscripten_glVertexAttrib3fv,
    /** @export */ emscripten_glVertexAttrib4f: _emscripten_glVertexAttrib4f,
    /** @export */ emscripten_glVertexAttrib4fv: _emscripten_glVertexAttrib4fv,
    /** @export */ emscripten_glVertexAttribDivisor: _emscripten_glVertexAttribDivisor,
    /** @export */ emscripten_glVertexAttribDivisorANGLE: _emscripten_glVertexAttribDivisorANGLE,
    /** @export */ emscripten_glVertexAttribDivisorARB: _emscripten_glVertexAttribDivisorARB,
    /** @export */ emscripten_glVertexAttribDivisorEXT: _emscripten_glVertexAttribDivisorEXT,
    /** @export */ emscripten_glVertexAttribDivisorNV: _emscripten_glVertexAttribDivisorNV,
    /** @export */ emscripten_glVertexAttribI4i: _emscripten_glVertexAttribI4i,
    /** @export */ emscripten_glVertexAttribI4iv: _emscripten_glVertexAttribI4iv,
    /** @export */ emscripten_glVertexAttribI4ui: _emscripten_glVertexAttribI4ui,
    /** @export */ emscripten_glVertexAttribI4uiv: _emscripten_glVertexAttribI4uiv,
    /** @export */ emscripten_glVertexAttribIPointer: _emscripten_glVertexAttribIPointer,
    /** @export */ emscripten_glVertexAttribPointer: _emscripten_glVertexAttribPointer,
    /** @export */ emscripten_glViewport: _emscripten_glViewport,
    /** @export */ emscripten_glWaitSync: _emscripten_glWaitSync,
    /** @export */ emscripten_has_asyncify: _emscripten_has_asyncify,
    /** @export */ emscripten_request_fullscreen_strategy: _emscripten_request_fullscreen_strategy,
    /** @export */ emscripten_request_pointerlock: _emscripten_request_pointerlock,
    /** @export */ emscripten_resize_heap: _emscripten_resize_heap,
    /** @export */ emscripten_sample_gamepad_data: _emscripten_sample_gamepad_data,
    /** @export */ emscripten_set_beforeunload_callback_on_thread: _emscripten_set_beforeunload_callback_on_thread,
    /** @export */ emscripten_set_blur_callback_on_thread: _emscripten_set_blur_callback_on_thread,
    /** @export */ emscripten_set_canvas_element_size: _emscripten_set_canvas_element_size,
    /** @export */ emscripten_set_element_css_size: _emscripten_set_element_css_size,
    /** @export */ emscripten_set_focus_callback_on_thread: _emscripten_set_focus_callback_on_thread,
    /** @export */ emscripten_set_fullscreenchange_callback_on_thread: _emscripten_set_fullscreenchange_callback_on_thread,
    /** @export */ emscripten_set_gamepadconnected_callback_on_thread: _emscripten_set_gamepadconnected_callback_on_thread,
    /** @export */ emscripten_set_gamepaddisconnected_callback_on_thread: _emscripten_set_gamepaddisconnected_callback_on_thread,
    /** @export */ emscripten_set_keydown_callback_on_thread: _emscripten_set_keydown_callback_on_thread,
    /** @export */ emscripten_set_keypress_callback_on_thread: _emscripten_set_keypress_callback_on_thread,
    /** @export */ emscripten_set_keyup_callback_on_thread: _emscripten_set_keyup_callback_on_thread,
    /** @export */ emscripten_set_main_loop: _emscripten_set_main_loop,
    /** @export */ emscripten_set_main_loop_timing: _emscripten_set_main_loop_timing,
    /** @export */ emscripten_set_mousedown_callback_on_thread: _emscripten_set_mousedown_callback_on_thread,
    /** @export */ emscripten_set_mouseenter_callback_on_thread: _emscripten_set_mouseenter_callback_on_thread,
    /** @export */ emscripten_set_mouseleave_callback_on_thread: _emscripten_set_mouseleave_callback_on_thread,
    /** @export */ emscripten_set_mousemove_callback_on_thread: _emscripten_set_mousemove_callback_on_thread,
    /** @export */ emscripten_set_mouseup_callback_on_thread: _emscripten_set_mouseup_callback_on_thread,
    /** @export */ emscripten_set_orientationchange_callback_on_thread: _emscripten_set_orientationchange_callback_on_thread,
    /** @export */ emscripten_set_pointerlockchange_callback_on_thread: _emscripten_set_pointerlockchange_callback_on_thread,
    /** @export */ emscripten_set_resize_callback_on_thread: _emscripten_set_resize_callback_on_thread,
    /** @export */ emscripten_set_touchcancel_callback_on_thread: _emscripten_set_touchcancel_callback_on_thread,
    /** @export */ emscripten_set_touchend_callback_on_thread: _emscripten_set_touchend_callback_on_thread,
    /** @export */ emscripten_set_touchmove_callback_on_thread: _emscripten_set_touchmove_callback_on_thread,
    /** @export */ emscripten_set_touchstart_callback_on_thread: _emscripten_set_touchstart_callback_on_thread,
    /** @export */ emscripten_set_visibilitychange_callback_on_thread: _emscripten_set_visibilitychange_callback_on_thread,
    /** @export */ emscripten_set_wheel_callback_on_thread: _emscripten_set_wheel_callback_on_thread,
    /** @export */ emscripten_set_window_title: _emscripten_set_window_title,
    /** @export */ emscripten_sleep: _emscripten_sleep,
    /** @export */ emscripten_start_wasm_audio_worklet_thread_async: _emscripten_start_wasm_audio_worklet_thread_async,
    /** @export */ emscripten_webgl_create_context: _emscripten_webgl_create_context,
    /** @export */ emscripten_webgl_destroy_context: _emscripten_webgl_destroy_context,
    /** @export */ emscripten_webgl_make_context_current: _emscripten_webgl_make_context_current,
    /** @export */ environ_get: _environ_get,
    /** @export */ environ_sizes_get: _environ_sizes_get,
    /** @export */ exit: _exit,
    /** @export */ fd_close: _fd_close,
    /** @export */ fd_read: _fd_read,
    /** @export */ fd_seek: _fd_seek,
    /** @export */ fd_write: _fd_write,
    /** @export */ glActiveTexture: _glActiveTexture,
    /** @export */ glAttachShader: _glAttachShader,
    /** @export */ glBindBuffer: _glBindBuffer,
    /** @export */ glBindTexture: _glBindTexture,
    /** @export */ glBindVertexArrayOES: _glBindVertexArrayOES,
    /** @export */ glBlendEquation: _glBlendEquation,
    /** @export */ glBlendEquationSeparate: _glBlendEquationSeparate,
    /** @export */ glBlendFuncSeparate: _glBlendFuncSeparate,
    /** @export */ glBufferData: _glBufferData,
    /** @export */ glBufferSubData: _glBufferSubData,
    /** @export */ glCompileShader: _glCompileShader,
    /** @export */ glCreateProgram: _glCreateProgram,
    /** @export */ glCreateShader: _glCreateShader,
    /** @export */ glDeleteShader: _glDeleteShader,
    /** @export */ glDeleteVertexArraysOES: _glDeleteVertexArraysOES,
    /** @export */ glDetachShader: _glDetachShader,
    /** @export */ glDisable: _glDisable,
    /** @export */ glDrawElements: _glDrawElements,
    /** @export */ glEnable: _glEnable,
    /** @export */ glEnableVertexAttribArray: _glEnableVertexAttribArray,
    /** @export */ glGenBuffers: _glGenBuffers,
    /** @export */ glGenTextures: _glGenTextures,
    /** @export */ glGenVertexArraysOES: _glGenVertexArraysOES,
    /** @export */ glGetAttribLocation: _glGetAttribLocation,
    /** @export */ glGetIntegerv: _glGetIntegerv,
    /** @export */ glGetProgramInfoLog: _glGetProgramInfoLog,
    /** @export */ glGetProgramiv: _glGetProgramiv,
    /** @export */ glGetShaderInfoLog: _glGetShaderInfoLog,
    /** @export */ glGetShaderiv: _glGetShaderiv,
    /** @export */ glGetString: _glGetString,
    /** @export */ glGetUniformLocation: _glGetUniformLocation,
    /** @export */ glIsEnabled: _glIsEnabled,
    /** @export */ glIsProgram: _glIsProgram,
    /** @export */ glLinkProgram: _glLinkProgram,
    /** @export */ glScissor: _glScissor,
    /** @export */ glShaderSource: _glShaderSource,
    /** @export */ glTexImage2D: _glTexImage2D,
    /** @export */ glTexParameteri: _glTexParameteri,
    /** @export */ glUniform1i: _glUniform1i,
    /** @export */ glUniformMatrix4fv: _glUniformMatrix4fv,
    /** @export */ glUseProgram: _glUseProgram,
    /** @export */ glVertexAttribPointer: _glVertexAttribPointer,
    /** @export */ glViewport: _glViewport,
    /** @export */ memory: wasmMemory,
    /** @export */ random_get: _random_get
  };
}

var wasmExports;

createWasm();

// include: postamble.js
// === Auto-generated postamble setup entry stuff ===
var calledRun;

function callMain(args = []) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
  assert(typeof onPreRuns === "undefined" || onPreRuns.length == 0, "cannot call main when preRun functions remain to be called");
  var entryFunction = _main;
  args.unshift(thisProgram);
  var argc = args.length;
  var argv = stackAlloc((argc + 1) * 4);
  var argv_ptr = argv;
  args.forEach(arg => {
    (growMemViews(), HEAPU32)[((argv_ptr) >> 2)] = stringToUTF8OnStack(arg);
    argv_ptr += 4;
  });
  (growMemViews(), HEAPU32)[((argv_ptr) >> 2)] = 0;
  try {
    var ret = entryFunction(argc, argv);
    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */ true);
    return ret;
  } catch (e) {
    return handleException(e);
  }
}

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

function run(args = arguments_) {
  if (runDependencies > 0) {
    dependenciesFulfilled = run;
    return;
  }
  if ((ENVIRONMENT_IS_WASM_WORKER)) {
    initRuntime();
    return;
  }
  stackCheckInit();
  preRun();
  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    dependenciesFulfilled = run;
    return;
  }
  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    assert(!calledRun);
    calledRun = true;
    Module["calledRun"] = true;
    if (ABORT) return;
    initRuntime();
    preMain();
    Module["onRuntimeInitialized"]?.();
    consumedModuleProp("onRuntimeInitialized");
    var noInitialRun = Module["noInitialRun"] || false;
    if (!noInitialRun) callMain(args);
    postRun();
  }
  if (Module["setStatus"]) {
    Module["setStatus"]("Running...");
    setTimeout(() => {
      setTimeout(() => Module["setStatus"](""), 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = x => {
    has = true;
  };
  try {
    // it doesn't matter if it fails
    _fflush(0);
    // also flush in the JS FS layer
    [ "stdout", "stderr" ].forEach(name => {
      var info = FS.analyzePath("/dev/" + name);
      if (!info) return;
      var stream = info.object;
      var rdev = stream.rdev;
      var tty = TTY.ttys[rdev];
      if (tty?.output?.length) {
        has = true;
      }
    });
  } catch (e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.");
  }
}

function preInit() {
  if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
    while (Module["preInit"].length > 0) {
      Module["preInit"].shift()();
    }
  }
  consumedModuleProp("preInit");
}

preInit();

run();
