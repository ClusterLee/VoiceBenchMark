------formdata-undici-084004379291
Content-Disposition: form-data; name="metadata"

{"main_module":"index.js","bindings":[{"name":"APP_NAME","type":"plain_text","text":"ppt-creator"},{"name":"LLM_MODEL","type":"plain_text","text":"@cf/meta/llama-3.3-70b-instruct-fp8-fast"},{"name":"VISION_MODEL","type":"plain_text","text":"@cf/moonshotai/kimi-k2.6"},{"name":"SESSIONS","type":"kv_namespace","namespace_id":"5d97572985ea4b3fbcdd146d2d617686"},{"name":"MATERIALS","type":"r2_bucket","bucket_name":"ppt-creator-materials"},{"name":"DB","type":"d1","id":"82a28c54-f4f9-4ab2-8a82-7dbb9aaa3ccc"},{"name":"AI","type":"ai"}],"compatibility_date":"2026-07-15","compatibility_flags":["nodejs_compat"],"observability":{"enabled":true,"head_sampling_rate":1}}
------formdata-undici-084004379291
Content-Disposition: form-data; name="index.js"; filename="index.js"
Content-Type: application/javascript+module

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
__name(PerformanceEntry, "PerformanceEntry");
var PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
}, "PerformanceMark");
var PerformanceMeasure = class extends PerformanceEntry {
  entryType = "measure";
};
__name(PerformanceMeasure, "PerformanceMeasure");
var PerformanceResourceTiming = class extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
__name(PerformanceResourceTiming, "PerformanceResourceTiming");
var PerformanceObserverEntryList = class {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
__name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
var Performance = class {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
__name(Performance, "Performance");
var PerformanceObserver = class {
  __unenv__ = true;
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
__name(PerformanceObserver, "PerformanceObserver");
__publicField(PerformanceObserver, "supportedEntryTypes", []);
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now3 = Date.now();
  const seconds = Math.trunc(now3 / 1e3);
  const nanos = now3 % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  fd;
  constructor(fd2) {
    super();
    this.fd = fd2;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};
__name(ReadStream, "ReadStream");

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  fd;
  constructor(fd2) {
    super();
    this.fd = fd2;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  columns = 80;
  rows = 24;
  isTTY = false;
};
__name(WriteStream, "WriteStream");

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return "";
  }
  get versions() {
    return {};
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
__name(Process, "Process");

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/lib/utils.ts
function uid() {
  return crypto.randomUUID();
}
__name(uid, "uid");
function now() {
  return Date.now();
}
__name(now, "now");
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers }
  });
}
__name(json, "json");
function err(message, status = 400, extra = {}) {
  return json({ ok: false, error: message, ...extra }, status);
}
__name(err, "err");
function ok(data) {
  return json({ ok: true, ...data });
}
__name(ok, "ok");
function safeParse(text, fallback) {
  if (!text)
    return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}
__name(safeParse, "safeParse");
function extractJson(text) {
  if (!text)
    return null;
  let s = text.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence)
    s = fence[1].trim();
  const start = s.search(/[{[]/);
  if (start < 0)
    return null;
  const candidate = s.slice(start);
  try {
    return JSON.parse(candidate);
  } catch {
    const lastObj = candidate.lastIndexOf("}");
    const lastArr = candidate.lastIndexOf("]");
    const end = Math.max(lastObj, lastArr);
    if (end > 0) {
      try {
        return JSON.parse(candidate.slice(0, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
__name(extractJson, "extractJson");
var KEY_MAP = {
  // Framework
  "\u6838\u5FC3\u8BBA\u70B9": "core_thesis",
  "\u6838\u5FC3\u7ED3\u8BBA": "core_thesis",
  "\u6838\u5FC3\u89C2\u70B9": "core_thesis",
  "\u652F\u67F1": "pillars",
  "\u8BBA\u636E": "points",
  "\u8981\u70B9": "points",
  "\u903B\u8F91\u5907\u6CE8": "logic_notes",
  "\u6807\u9898": "title",
  // Audience
  "\u6458\u8981": "summary",
  "\u53D7\u4F17\u6458\u8981": "summary",
  // Angles
  "\u89D2\u5EA6": "angles",
  "\u95EE\u9898": "questions",
  "\u5173\u952E\u95EE\u9898": "questions",
  "\u63CF\u8FF0": "desc",
  "\u8BF4\u660E": "desc",
  "\u6807\u7B7E": "label",
  "\u952E": "key",
  // Titles
  "\u4FE1\u606F\u7C7B\u578B": "info_type",
  "\u9875\u7801": "page_no",
  "\u8BBA\u70B9\u5E8F\u53F7": "pillar_idx",
  "\u6240\u5C5E\u8BBA\u70B9": "pillar_idx",
  "\u6807\u9898\u5217\u8868": "titles",
  "\u6807\u9898\u6570\u7EC4": "titles",
  "\u6240\u6709\u6807\u9898": "titles",
  "\u9875\u6807\u9898": "titles",
  "\u6807\u9898\u96C6": "titles",
  // MECE
  "\u5907\u6CE8": "notes",
  "\u95EE\u9898\u5217\u8868": "notes",
  // ReadThrough
  "\u8FDE\u8D2F": "coherent",
  "\u6545\u4E8B": "story",
  "\u65AD\u88C2": "breaks",
  // Pages / content
  "\u9875\u9762": "pages",
  "\u5185\u5BB9": "content",
  "\u5E03\u5C40": "layout",
  "\u89C6\u89C9\u63D0\u793A": "visual_hint",
  "\u89C6\u89C9\u5EFA\u8BAE": "visual_hint",
  "\u6765\u6E90": "source",
  "\u6838\u5FC3\u4FE1\u606F": "core_message",
  "\u6838\u5FC3\u7ED3\u8BBA\u7B80\u8FF0": "core_message",
  // Materials / context-pack
  "\u80CC\u666F\u6458\u8981": "background_summary",
  "\u80CC\u666F\u603B\u7ED3": "background_summary",
  "\u5173\u952E\u4E8B\u5B9E": "key_facts",
  "\u4E8B\u5B9E": "fact",
  "\u5FC5\u987B\u5F15\u7528": "must_cite",
  "\u9700\u5F15\u7528": "must_cite",
  "\u6750\u6599\u7C7B\u578B": "doc_type",
  "\u6587\u6863\u7C7B\u578B": "doc_type",
  // Slides / blocks
  "\u5757": "blocks",
  "\u7C7B\u578B": "type",
  "\u6587\u672C": "content",
  "\u9879\u76EE": "items",
  "\u5217\u8868": "items",
  "\u5C42\u7EA7": "level",
  "\u4FEE\u6539\u6458\u8981": "change_summary",
  "\u53D8\u66F4\u6458\u8981": "change_summary",
  "\u4FEE\u6539\u524D": "before",
  "\u4FEE\u6539\u540E": "after",
  // Theme
  "\u4E3B\u9898": "themes",
  "\u63A8\u8350": "recommended",
  // Versions / misc
  "\u5E8F\u53F7": "seq",
  "\u5FEB\u7167": "snapshot",
  "\u521B\u5EFA\u65F6\u95F4": "created_at"
};
function normalizeKeys(obj) {
  if (obj === null || obj === void 0)
    return obj;
  if (Array.isArray(obj))
    return obj.map(normalizeKeys);
  if (typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const nk = KEY_MAP[k] ?? k;
      out[nk] = normalizeKeys(v);
    }
    return out;
  }
  return obj;
}
__name(normalizeKeys, "normalizeKeys");
function extractJsonNormalized(text) {
  const parsed = extractJson(text);
  if (parsed === null)
    return null;
  return normalizeKeys(parsed);
}
__name(extractJsonNormalized, "extractJsonNormalized");
function matchPath(pattern, path) {
  const pSeg = pattern.split("/").filter(Boolean);
  const aSeg = path.split("/").filter(Boolean);
  if (pSeg.length !== aSeg.length)
    return null;
  const params = {};
  for (let i = 0; i < pSeg.length; i++) {
    if (pSeg[i].startsWith(":")) {
      params[pSeg[i].slice(1)] = decodeURIComponent(aSeg[i]);
    } else if (pSeg[i] !== aSeg[i]) {
      return null;
    }
  }
  return params;
}
__name(matchPath, "matchPath");

// src/api/session.ts
var SESSION_TTL = 60 * 60 * 24 * 30;
async function ensureSession(kv, token) {
  if (token) {
    const existing = await kv.get(`sess:${token}`);
    if (existing) {
      await kv.put(`sess:${token}`, existing, { expirationTtl: SESSION_TTL });
      return { token, isNew: false };
    }
  }
  const newToken = uid();
  await kv.put(`sess:${newToken}`, JSON.stringify({ created_at: now() }), { expirationTtl: SESSION_TTL });
  return { token: newToken, isNew: true };
}
__name(ensureSession, "ensureSession");
function readSessionToken(request) {
  const h = request.headers.get("x-session-token");
  if (h)
    return h;
  const cookie = request.headers.get("cookie");
  if (cookie) {
    const m = cookie.match(/(?:^|;\s*)ppt_session=([^;]+)/);
    if (m)
      return m[1];
  }
  return null;
}
__name(readSessionToken, "readSessionToken");

// src/db/index.ts
async function createProject(db, sessionId, topic) {
  const id = uid();
  const t = now();
  await db.prepare("INSERT INTO projects (id, session_id, topic, current_step, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)").bind(id, sessionId, topic, 0, "active", t, t).run();
  return { id, session_id: sessionId, topic, current_step: 0, status: "active", created_at: t, updated_at: t };
}
__name(createProject, "createProject");
async function getProject(db, id) {
  return await db.prepare("SELECT * FROM projects WHERE id=?").bind(id).first();
}
__name(getProject, "getProject");
async function touchProject(db, id, step) {
  const t = now();
  if (step !== void 0) {
    await db.prepare("UPDATE projects SET updated_at=?, current_step=? WHERE id=?").bind(t, step, id).run();
  } else {
    await db.prepare("UPDATE projects SET updated_at=? WHERE id=?").bind(t, id).run();
  }
}
__name(touchProject, "touchProject");
async function listProjects(db, sessionId) {
  const r = await db.prepare("SELECT * FROM projects WHERE session_id=? ORDER BY updated_at DESC LIMIT 100").bind(sessionId).all();
  return r.results ?? [];
}
__name(listProjects, "listProjects");
async function addMessage(db, projectId, step, role, content) {
  await db.prepare("INSERT INTO messages (id, project_id, step, role, content, created_at) VALUES (?,?,?,?,?,?)").bind(uid(), projectId, step, role, content, now()).run();
}
__name(addMessage, "addMessage");
async function getMessages(db, projectId, step) {
  if (step !== void 0) {
    const r2 = await db.prepare("SELECT * FROM messages WHERE project_id=? AND step=? ORDER BY created_at ASC LIMIT 200").bind(projectId, step).all();
    return r2.results ?? [];
  }
  const r = await db.prepare("SELECT * FROM messages WHERE project_id=? ORDER BY created_at ASC LIMIT 500").bind(projectId).all();
  return r.results ?? [];
}
__name(getMessages, "getMessages");

// src/api/project.ts
async function handleCreateProject(env2, sessionId, req) {
  const body = await req.json().catch(() => ({}));
  const project = await createProject(env2.DB, sessionId, body.topic ?? "");
  return ok({ project });
}
__name(handleCreateProject, "handleCreateProject");
async function handleListProjects(env2, sessionId) {
  const projects = await listProjects(env2.DB, sessionId);
  return ok({ projects });
}
__name(handleListProjects, "handleListProjects");
async function handleGetProject(env2, projectId) {
  const project = await getProject(env2.DB, projectId);
  if (!project)
    return err("\u9879\u76EE\u4E0D\u5B58\u5728", 404);
  const [audience, framework, style, titles, pages, slides, messages, mats] = await Promise.all([
    env2.DB.prepare("SELECT * FROM audience WHERE project_id=?").bind(projectId).first(),
    env2.DB.prepare("SELECT * FROM framework WHERE project_id=?").bind(projectId).first(),
    env2.DB.prepare("SELECT * FROM style WHERE project_id=?").bind(projectId).first(),
    env2.DB.prepare("SELECT * FROM titles WHERE project_id=? ORDER BY page_no").bind(projectId).all(),
    env2.DB.prepare("SELECT * FROM pages WHERE project_id=? ORDER BY page_no").bind(projectId).all(),
    env2.DB.prepare("SELECT * FROM slides WHERE project_id=? ORDER BY page_no").bind(projectId).all(),
    getMessages(env2.DB, projectId),
    env2.DB.prepare("SELECT id, kind, name, mime, status, must_cite, created_at FROM materials WHERE project_id=? ORDER BY created_at").bind(projectId).all()
  ]);
  return ok({
    project,
    audience: audience ? { ...audience } : null,
    framework: framework ? { core_thesis: framework.core_thesis, pillars: safeParse(framework.pillars, []), logic_notes: safeParse(framework.logic_notes, []) } : null,
    style: style ?? null,
    titles: titles.results ?? [],
    pages: (pages.results ?? []).map((p) => ({ ...p, points: safeParse(p.points, []) })),
    slides: (slides.results ?? []).map((s) => ({ ...s, blocks: safeParse(s.blocks, []) })),
    messages,
    materials: mats.results ?? []
  });
}
__name(handleGetProject, "handleGetProject");
async function handleSaveStep(env2, projectId, step, data) {
  const t = now();
  const db = env2.DB;
  switch (step) {
    case 1: {
      await db.prepare("INSERT INTO audience (project_id, role, scene, goal, summary, updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET role=excluded.role, scene=excluded.scene, goal=excluded.goal, summary=excluded.summary, updated_at=excluded.updated_at").bind(projectId, String(data.role ?? ""), String(data.scene ?? ""), String(data.goal ?? ""), String(data.summary ?? ""), t).run();
      break;
    }
    case 2: {
      if (data.framework) {
        const fw = data.framework;
        await db.prepare("INSERT INTO framework (project_id, core_thesis, pillars, logic_notes, updated_at) VALUES (?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET core_thesis=excluded.core_thesis, pillars=excluded.pillars, logic_notes=excluded.logic_notes, updated_at=excluded.updated_at").bind(projectId, String(fw.core_thesis ?? ""), JSON.stringify(fw.pillars ?? []), JSON.stringify(fw.logic_notes ?? []), t).run();
      }
      if (Array.isArray(data.titles)) {
        await db.prepare("DELETE FROM titles WHERE project_id=?").bind(projectId).run();
        for (const title2 of data.titles) {
          await db.prepare("INSERT INTO titles (id, project_id, page_no, title, info_type, pillar_idx, created_at) VALUES (?,?,?,?,?,?,?)").bind(uid(), projectId, title2.page_no, title2.title, title2.info_type ?? "viewpoint", title2.pillar_idx ?? 0, t).run();
        }
      }
      break;
    }
    case 3: {
      if (Array.isArray(data.pages)) {
        await db.prepare("DELETE FROM pages WHERE project_id=?").bind(projectId).run();
        for (const p of data.pages) {
          await db.prepare("INSERT INTO pages (id, project_id, page_no, title, layout, points, visual_hint, deep_dived, updated_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(uid(), projectId, p.page_no, p.title, p.layout, JSON.stringify(p.points ?? []), p.visual_hint ?? "", p.deep_dived ? 1 : 0, t).run();
        }
      }
      break;
    }
    case 4: {
      await db.prepare("INSERT INTO style (project_id, theme, primary_color, bg_color, accent_color, text_color, title_font, chart_style, spec_json, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET theme=excluded.theme, primary_color=excluded.primary_color, bg_color=excluded.bg_color, accent_color=excluded.accent_color, text_color=excluded.text_color, title_font=excluded.title_font, chart_style=excluded.chart_style, spec_json=excluded.spec_json, updated_at=excluded.updated_at").bind(projectId, String(data.theme ?? "business-deep"), String(data.primary_color ?? ""), String(data.bg_color ?? ""), String(data.accent_color ?? ""), String(data.text_color ?? ""), String(data.title_font ?? "serif"), String(data.chart_style ?? "flat"), JSON.stringify(data.spec_json ?? {}), t).run();
      break;
    }
    default:
      break;
  }
  await touchProject(env2.DB, projectId, step);
  await addMessage(env2.DB, projectId, step, "system", `step${step} saved`);
  return ok({ saved: true, step });
}
__name(handleSaveStep, "handleSaveStep");

// src/ai/llm.ts
var JSON_GUARD = "\u4F60\u5FC5\u987B\u53EA\u8F93\u51FA\u4E00\u4E2A\u5408\u6CD5\u7684 JSON\uFF0C\u4E0D\u8981\u8F93\u51FA\u4EFB\u4F55\u989D\u5916\u8BF4\u660E\u6587\u5B57\u3001\u4E0D\u8981\u7528 markdown \u4EE3\u7801\u5757\u5305\u88F9\u3001\u4E0D\u8981\u5728 JSON \u524D\u540E\u6DFB\u52A0\u6CE8\u91CA\u3002\u6240\u6709 JSON \u952E\u540D\u5FC5\u987B\u4F7F\u7528\u82F1\u6587\uFF08\u5982 core_thesis\u3001pillars\u3001title\u3001points\uFF09\uFF0C\u4E0D\u5F97\u4F7F\u7528\u4E2D\u6587\u952E\u540D\u3002";
async function chat(env2, messages, opts = {}) {
  const resp = await env2.AI.run(env2.LLM_MODEL, {
    messages,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature ?? 0.4
  });
  if (typeof resp === "string")
    return resp;
  if (typeof resp.response === "string")
    return resp.response;
  const c0 = resp.choices?.[0]?.message?.content;
  if (typeof c0 === "string")
    return c0;
  if (Array.isArray(c0)) {
    const txt = c0.map((p) => p?.text ?? "").join("");
    if (txt)
      return txt;
  }
  if (typeof resp.result?.response === "string")
    return resp.result.response;
  return "";
}
__name(chat, "chat");
async function chatJson(env2, messages, opts = {}) {
  const guarded = [
    ...messages.slice(0, -1),
    { role: messages[messages.length - 1].role, content: messages[messages.length - 1].content + "\n\n" + JSON_GUARD }
  ];
  const text = await chat(env2, guarded, opts);
  return extractJsonNormalized(text);
}
__name(chatJson, "chatJson");
async function vision(env2, imageBase64, prompt) {
  try {
    const resp = await env2.AI.run(env2.VISION_MODEL, {
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } }
          ]
        }
      ],
      max_tokens: 1024
    });
    if (typeof resp === "string")
      return resp;
    if (typeof resp.response === "string")
      return resp.response;
    const c0 = resp.choices?.[0]?.message?.content;
    if (typeof c0 === "string")
      return c0;
    if (Array.isArray(c0)) {
      const txt = c0.map((p) => p?.text ?? "").join("");
      if (txt)
        return txt;
    }
    if (typeof resp.result?.response === "string")
      return resp.result.response;
    return "";
  } catch (e) {
    return `[\u89C6\u89C9\u89E3\u6790\u5931\u8D25] ${e instanceof Error ? e.message : String(e)}`;
  }
}
__name(vision, "vision");
function bufToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 32768;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(bin);
}
__name(bufToBase64, "bufToBase64");

// src/engine/context.ts
async function extractText(env2, m) {
  if (m.kind === "text")
    return m.text ?? "";
  if (m.kind === "link") {
    try {
      const resp = await fetch(m.url, { headers: { "user-agent": "Mozilla/5.0" } });
      const html = await resp.text();
      return stripHtml(html).slice(0, 8e3);
    } catch (e) {
      return `[\u94FE\u63A5\u6293\u53D6\u5931\u8D25] ${m.url} ${e instanceof Error ? e.message : ""}`;
    }
  }
  if (m.kind === "image" && m.data) {
    const b64 = bufToBase64(m.data);
    return await vision(env2, b64, "\u8BF7\u8BE6\u7EC6\u63CF\u8FF0\u8FD9\u5F20\u56FE\u7247\u7684\u5185\u5BB9\uFF0C\u63D0\u53D6\u5176\u4E2D\u7684\u6587\u5B57\u3001\u6570\u636E\u3001\u56FE\u8868\u4FE1\u606F\u3002\u7528\u4E2D\u6587\u8F93\u51FA\u3002");
  }
  if (m.kind === "file") {
    const mime = m.mime ?? "";
    if (m.text)
      return m.text;
    if (m.data) {
      const dec = new TextDecoder("utf-8");
      const raw = dec.decode(m.data);
      if (mime.includes("html"))
        return stripHtml(raw).slice(0, 8e3);
      if (mime.includes("text") || mime.includes("markdown") || m.name.endsWith(".md") || m.name.endsWith(".txt")) {
        return raw.slice(0, 8e3);
      }
      return `[\u4E8C\u8FDB\u5236\u6587\u4EF6 ${m.name}\uFF0C\u6682\u4E0D\u652F\u6301\u76F4\u63A5\u89E3\u6790\u6587\u672C\uFF0C\u8BF7\u7C98\u8D34\u5173\u952E\u5185\u5BB9]`;
    }
  }
  return "";
}
__name(extractText, "extractText");
function stripHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}
__name(stripHtml, "stripHtml");
async function ingestMaterial(env2, projectId, m, r2) {
  const id = uid();
  let r2_key = null;
  if (m.data && (m.kind === "file" || m.kind === "image")) {
    r2_key = `${projectId}/${id}/${m.name}`;
    await r2.put(r2_key, m.data, { httpMetadata: { contentType: m.mime ?? "application/octet-stream" } });
  }
  const raw_text = await extractText(env2, m);
  const summary = await chatJson(env2, [
    {
      role: "system",
      content: '\u4F60\u662F\u7D20\u6750\u89E3\u6790\u5F15\u64CE\u3002\u4ECE\u7528\u6237\u63D0\u4F9B\u7684\u80CC\u666F\u6750\u6599\u4E2D\u63D0\u53D6\u7ED3\u6784\u5316\u4FE1\u606F\u3002\u8F93\u51FA JSON\uFF1A{"summary":"150\u5B57\u5185\u6458\u8981","key_facts":[{"fact":"\u5173\u952E\u4E8B\u5B9E\u6216\u6570\u636E","must_cite":true}],"doc_type":"\u6750\u6599\u7C7B\u578B"}\u3002must_cite \u6807\u8BB0\u7528\u6237\u660E\u786E\u63D0\u4F9B\u3001\u5FC5\u987B\u5728 PPT \u4E2D\u5F15\u7528\u7684\u6838\u5FC3\u6570\u636E/\u7ED3\u8BBA\u3002'
    },
    { role: "user", content: `\u6750\u6599\u540D\u79F0\uFF1A${m.name}

\u6750\u6599\u5185\u5BB9\uFF1A
${raw_text.slice(0, 6e3)}` }
  ], { maxTokens: 1200 });
  const parsed_summary = JSON.stringify(
    summary ?? { summary: raw_text.slice(0, 150), key_facts: [], doc_type: m.kind }
  );
  const must_cite = summary?.key_facts?.some((f) => f.must_cite) ? 1 : 0;
  return {
    id,
    kind: m.kind,
    name: m.name,
    mime: m.mime ?? "",
    r2_key,
    source_url: m.url ?? null,
    raw_text,
    parsed_summary,
    must_cite,
    status: "parsed"
  };
}
__name(ingestMaterial, "ingestMaterial");
async function buildContextPack(env2, materials) {
  if (materials.length === 0) {
    return { background_summary: "", key_facts: [] };
  }
  const combined = materials.map((m) => {
    const s = JSON.parse(m.parsed_summary);
    return `\u3010${m.name}\u3011(${s.doc_type})
\u6458\u8981\uFF1A${s.summary}
\u5173\u952E\u4E8B\u5B9E\uFF1A${s.key_facts.map((f) => f.fact).join("\uFF1B")}`;
  }).join("\n\n");
  const pack = await chatJson(env2, [
    {
      role: "system",
      content: `\u4F60\u662F\u7D20\u6750\u89E3\u6790\u5F15\u64CE\u3002\u628A\u591A\u4EFD\u80CC\u666F\u6750\u6599\u6C47\u603B\u6210\u4E00\u4E2A'\u80CC\u666F\u4E0A\u4E0B\u6587\u5305'\u3002\u8F93\u51FA JSON\uFF1A{"background_summary":"300\u5B57\u5185\u6574\u4F53\u80CC\u666F\u6458\u8981","key_facts":[{"fact":"\u8DE8\u6750\u6599\u7684\u5173\u952E\u4E8B\u5B9E/\u6570\u636E","must_cite":true}]}\u3002key_facts \u53BB\u91CD\u5408\u5E76\uFF0Cmust_cite \u4FDD\u7559\u4EFB\u4E00\u6750\u6599\u6807\u8BB0\u4E3A\u5FC5\u987B\u5F15\u7528\u7684\u3002`
    },
    { role: "user", content: combined.slice(0, 6e3) }
  ], { maxTokens: 1200 });
  const facts = (pack?.key_facts ?? []).map((f) => ({ ...f, source: materials[0]?.name ?? "\u80CC\u666F\u6750\u6599" }));
  return { background_summary: pack?.background_summary ?? combined.slice(0, 300), key_facts: facts };
}
__name(buildContextPack, "buildContextPack");

// src/engine/logic.ts
async function buildAudience(env2, role, scene, goal, background) {
  const r = await chatJson(env2, [
    {
      role: "system",
      content: '\u4F60\u662F\u903B\u8F91\u5F15\u64CE\u3002\u6839\u636E\u7528\u6237\u63D0\u4F9B\u7684\u53D7\u4F17\u4E09\u8981\u7D20\uFF0C\u751F\u6210\u4E00\u53E5\u8BDD\u53D7\u4F17\u753B\u50CF\u6458\u8981\u3002\u8F93\u51FA JSON\uFF1A{"summary":"\u9762\u5411[\u89D2\u8272]\u5728[\u573A\u5408]\uFF0C\u76EE\u6807\u662F[\u6548\u679C]\u7684\u6C47\u62A5"}\u3002'
    },
    { role: "user", content: `\u53D7\u4F17\u89D2\u8272\uFF1A${role}
\u573A\u5408\uFF1A${scene}
\u76EE\u6807\u6548\u679C\uFF1A${goal}
\u80CC\u666F\uFF1A${background.slice(0, 500)}` }
  ], { maxTokens: 300 });
  return { role, scene, goal, summary: r?.summary ?? `\u9762\u5411${role}\u7684${scene}\uFF0C\u76EE\u6807\u662F${goal}` };
}
__name(buildAudience, "buildAudience");
async function proposeAngles(env2, topic, audience, background) {
  const r = await chatJson(env2, [
    {
      role: "system",
      content: '\u4F60\u662F\u903B\u8F91\u5F15\u64CE\uFF0C\u7528\u91D1\u5B57\u5854\u539F\u7406\u5E2E\u7528\u6237\u6784\u5EFA PPT \u6846\u67B6\u3002\u9488\u5BF9\u4E3B\u9898\u63D0\u51FA 2-3 \u4E2A\u5207\u5165\u89D2\u5EA6\uFF0C\u5E76\u8FFD\u95EE 1-2 \u4E2A\u6784\u5EFA\u6846\u67B6\u5FC5\u9700\u7684\u5173\u952E\u95EE\u9898\u3002\u8F93\u51FA JSON\uFF1A{"angles":[{"key":"A","label":"\u89D2\u5EA6\u540D","desc":"\u4E00\u53E5\u8BDD\u8BF4\u660E"}],"questions":["\u5173\u952E\u95EE\u98981","\u5173\u952E\u95EE\u98982"]}\u3002'
    },
    { role: "user", content: `\u4E3B\u9898\uFF1A${topic}
\u53D7\u4F17\u753B\u50CF\uFF1A${audience.summary}
\u80CC\u666F\u6750\u6599\uFF1A${background.slice(0, 1500)}` }
  ], { maxTokens: 800 });
  return r ?? { angles: [{ key: "A", label: "\u6309\u4E3B\u7EBF\u5C55\u5F00", desc: "\u6309\u4E3B\u9898\u6838\u5FC3\u903B\u8F91\u987A\u5E8F\u5C55\u5F00" }], questions: ["\u8FD9\u6B21\u6C47\u62A5\u6700\u60F3\u4F20\u8FBE\u7684\u4E00\u4E2A\u6838\u5FC3\u7ED3\u8BBA\u662F\u4EC0\u4E48\uFF1F"] };
}
__name(proposeAngles, "proposeAngles");
async function buildFramework(env2, topic, audience, background, userInput) {
  const r = await chatJson(env2, [
    {
      role: "system",
      content: '\u4F60\u662F\u903B\u8F91\u5F15\u64CE\u3002\u7528\u91D1\u5B57\u5854\u539F\u7406\u6784\u5EFA\u8BBA\u8BC1\u6846\u67B6\uFF1A\u5854\u5C16=\u6838\u5FC3\u7ED3\u8BBA(\u4E00\u53E5\u8BDD)\uFF0C\u5854\u8EAB=3-5\u4E2A\u76F8\u4E92\u72EC\u7ACB\u3001\u5B8C\u5168\u7A77\u5C3D(MECE)\u7684\u652F\u6491\u8BBA\u70B9\uFF0C\u6BCF\u4E2A\u8BBA\u70B9\u4E0B\u67092-4\u4E2A\u8BBA\u636E\u8981\u70B9\u3002\u8F93\u51FA JSON\uFF1A{"core_thesis":"...","pillars":[{"title":"\u8BBA\u70B9","points":["\u8BBA\u636E1","\u8BBA\u636E2"]}]}\u3002'
    },
    { role: "user", content: `\u4E3B\u9898\uFF1A${topic}
\u53D7\u4F17\u753B\u50CF\uFF1A${audience.summary}
\u80CC\u666F\u6750\u6599\uFF1A${background.slice(0, 2e3)}
\u7528\u6237\u8865\u5145\uFF1A${userInput.slice(0, 1e3)}` }
  ], { maxTokens: 1600 });
  const core = r?.core_thesis ?? topic;
  const pillars = r?.pillars ?? [];
  const logic_notes = await meceCheck(env2, core, pillars);
  return { core_thesis: core, pillars, logic_notes };
}
__name(buildFramework, "buildFramework");
async function meceCheck(env2, core, pillars) {
  if (pillars.length === 0)
    return ["\u6846\u67B6\u4E3A\u7A7A\uFF0C\u8BF7\u5148\u6784\u5EFA\u8BBA\u70B9"];
  const r = await chatJson(env2, [
    {
      role: "system",
      content: '\u4F60\u662F\u903B\u8F91\u5F15\u64CE\u3002\u5BF9\u91D1\u5B57\u5854\u6846\u67B6\u505A MECE \u81EA\u68C0\uFF1A\u8BBA\u70B9\u4E4B\u95F4\u662F\u5426\u91CD\u53E0\uFF1F\u662F\u5426\u9057\u6F0F\u5173\u952E\u7EF4\u5EA6\uFF08\u5982\u98CE\u9669/\u53CD\u5BF9\u610F\u89C1\uFF09\uFF1F\u8F93\u51FA JSON\uFF1A{"notes":["\u95EE\u98981","\u95EE\u98982"]}\uFF0C\u82E5\u65E0\u95EE\u9898 notes \u4E3A\u7A7A\u6570\u7EC4\u3002'
    },
    { role: "user", content: `\u6838\u5FC3\u7ED3\u8BBA\uFF1A${core}
\u8BBA\u70B9\uFF1A${pillars.map((p, i) => `${i + 1}.${p.title}`).join("\uFF1B")}` }
  ], { maxTokens: 500 });
  return r?.notes ?? [];
}
__name(meceCheck, "meceCheck");
async function generateTitles(env2, framework, audience) {
  const r = await chatJson(env2, [
    {
      role: "system",
      content: `\u4F60\u662F\u903B\u8F91\u5F15\u64CE\u3002\u4E3A\u91D1\u5B57\u5854\u6846\u67B6\u7684\u6BCF\u4E00\u9875\u751F\u6210\u6807\u9898\u3002\u89C4\u5219\uFF1A1)\u6807\u9898\u5FC5\u987B\u6709\u4FE1\u606F\u91CF\uFF0C\u5305\u542B\u6570\u5B57/\u4E8B\u5B9E/\u660E\u786E\u5224\u65AD\uFF0C\u7981\u6B62'\u6982\u8FF0/\u5206\u6790/\u603B\u7ED3'\u7C7B\u7A7A\u6D1E\u8BCD\uFF1B2)\u6240\u6709\u6807\u9898\u8FDE\u8BFB\u6784\u6210\u5B8C\u6574\u8BBA\u8BC1\u6545\u4E8B\u7EBF\uFF1B3)\u5339\u914D\u53D7\u4F17\uFF1B4)\u6807\u6CE8\u4FE1\u606F\u7C7B\u578B viewpoint/fact/data/story\u3002\u5C01\u9762\u4E3A\u7B2C1\u9875\u3002\u8F93\u51FA JSON\uFF1A{"titles":[{"title":"...","info_type":"data","pillar_idx":0}]}\u3002`
    },
    {
      role: "user",
      content: `\u53D7\u4F17\u753B\u50CF\uFF1A${audience.summary}
\u6838\u5FC3\u7ED3\u8BBA\uFF1A${framework.core_thesis}
\u8BBA\u70B9\u6846\u67B6\uFF1A${framework.pillars.map((p, i) => `${i}.${p.title}(${p.points.join("\u3001")})`).join("\uFF1B")}`
    }
  ], { maxTokens: 1600 });
  let list = r?.titles ?? [];
  if (list.length === 0 && r && typeof r === "object") {
    for (const v of Object.values(r)) {
      if (Array.isArray(v) && v.length > 0 && typeof v[0]?.title === "string") {
        list = v;
        break;
      }
    }
  }
  if (list.length === 0) {
    list = [
      { title: framework.core_thesis || "\u5C01\u9762", info_type: "viewpoint", pillar_idx: 0 },
      ...framework.pillars.map((p, i) => ({ title: p.title, info_type: "viewpoint", pillar_idx: i }))
    ];
  }
  return list.map((t, i) => ({
    page_no: i + 1,
    title: t.title,
    info_type: ["viewpoint", "fact", "data", "story"].includes(t.info_type) ? t.info_type : "viewpoint",
    pillar_idx: t.pillar_idx ?? 0
  }));
}
__name(generateTitles, "generateTitles");
async function readThroughCheck(env2, titles) {
  const joined = titles.map((t) => t.title).join("\u3002");
  const r = await chatJson(env2, [
    {
      role: "system",
      content: '\u4F60\u662F\u903B\u8F91\u5F15\u64CE\u3002\u5224\u65AD\u4E00\u7EC4 PPT \u6807\u9898\u6309\u987A\u5E8F\u8FDE\u8BFB\u662F\u5426\u6784\u6210\u8FDE\u8D2F\u8BBA\u8BC1\u3002\u8F93\u51FA JSON\uFF1A{"coherent":true,"breaks":[\u65AD\u88C2\u5904\u7684\u9875\u7801]}\uFF0Ccoherent \u4E3A\u662F\u5426\u8FDE\u8D2F\u3002'
    },
    { role: "user", content: joined }
  ], { maxTokens: 400 });
  return { coherent: r?.coherent ?? true, story: joined, breaks: r?.breaks ?? [] };
}
__name(readThroughCheck, "readThroughCheck");

// src/engine/schemes.ts
var LAYOUT_SCHEMES = [
  { key: "zongfen", name: "\u603B\u5206\u8BBA\u8BC1", structure: "\u6838\u5FC3\u7ED3\u8BBA + 3 \u4E2A\u5E76\u5217\u5206\u8BBA\u636E", applicable: "[\u89C2\u70B9]" },
  { key: "data", name: "\u6570\u636E\u8BBA\u8BC1", structure: "\u6838\u5FC3\u6570\u5B57 + \u8D8B\u52BF\u56FE + \u5BF9\u6BD4\u57FA\u51C6 + \u6765\u6E90\u6807\u6CE8", applicable: "[\u6570\u636E]" },
  { key: "compare", name: "\u5BF9\u6BD4\u8BBA\u8BC1", structure: "A/B \u591A\u65B9\u6848\u591A\u7EF4\u5EA6\u6A2A\u5411\u5BF9\u6BD4", applicable: "\u6BD4\u8F83/\u9009\u578B" },
  { key: "cause", name: "\u56E0\u679C\u94FE\u8BBA\u8BC1", structure: "\u539F\u56E0 \u2192 \u4F20\u5BFC\u673A\u5236 \u2192 \u7ED3\u679C", applicable: "\u5F52\u56E0/\u89E3\u91CA" },
  { key: "psb", name: "\u95EE\u9898-\u65B9\u6848-\u6536\u76CA", structure: "\u75DB\u70B9 \u2192 \u65B9\u6848 \u2192 \u91CF\u5316\u6536\u76CA", applicable: "\u65B9\u6848\u63A8\u8350" },
  { key: "story", name: "\u6545\u4E8B\u8BBA\u8BC1", structure: "\u573A\u666F \u2192 \u51B2\u7A81 \u2192 \u8F6C\u6298 \u2192 \u542F\u793A", applicable: "[\u6545\u4E8B]" },
  { key: "timeline", name: "\u65F6\u95F4\u7EBF\u8BBA\u8BC1", structure: "\u8FC7\u53BB \u2192 \u73B0\u5728 \u2192 \u672A\u6765", applicable: "\u53D1\u5C55/\u590D\u76D8" },
  { key: "matrix", name: "2x2 \u77E9\u9635\u8BBA\u8BC1", structure: "\u53CC\u7EF4\u5EA6\u56DB\u8C61\u9650\u5B9A\u4F4D", applicable: "\u6218\u7565/\u4F18\u5148\u7EA7" }
];
var STYLE_THEMES = [
  {
    key: "business-deep",
    name: "\u6C89\u7A33\u5546\u52A1\u98CE",
    desc: "\u6DF1\u84DD + \u7070\u767D + \u886C\u7EBF\u6807\u9898\uFF0C\u9002\u5408\u8463\u4E8B\u4F1A/\u6218\u7565\u6C47\u62A5",
    primary: "#1B3A5C",
    bg: "#F5F3EF",
    accent: "#B8895A",
    text: "#2C2C2C",
    titleFont: "serif",
    chartStyle: "flat"
  },
  {
    key: "tech-modern",
    name: "\u73B0\u4EE3\u79D1\u6280\u98CE",
    desc: "\u6DF1\u8272\u80CC\u666F + \u4EAE\u8272\u5F3A\u8C03 + \u65E0\u886C\u7EBF\uFF0C\u9002\u5408\u8DEF\u6F14/\u6295\u8D44\u4EBA",
    primary: "#0F172A",
    bg: "#1E293B",
    accent: "#38BDF8",
    text: "#E2E8F0",
    titleFont: "sans",
    chartStyle: "minimal"
  },
  {
    key: "academic-clean",
    name: "\u5B66\u672F\u7B80\u6D01\u98CE",
    desc: "\u767D\u5E95 + \u58A8\u84DD + \u6E05\u6670\u5C42\u7EA7\uFF0C\u9002\u5408\u5B66\u672F\u7B54\u8FA9/\u6C47\u62A5",
    primary: "#1E3A8A",
    bg: "#FFFFFF",
    accent: "#059669",
    text: "#111827",
    titleFont: "serif",
    chartStyle: "minimal"
  }
];
function themeByKey(key) {
  return STYLE_THEMES.find((t) => t.key === key) ?? STYLE_THEMES[0];
}
__name(themeByKey, "themeByKey");

// src/engine/content.ts
async function batchPreview(env2, titles, background) {
  const r = await chatJson(env2, [
    {
      role: "system",
      content: `\u4F60\u662F\u5185\u5BB9\u5F15\u64CE\u3002\u57FA\u4E8E\u6BCF\u9875\u6807\u9898\u751F\u6210\u5185\u5BB9\u5EFA\u8BAE\uFF1A3-5 \u4E2A\u8981\u70B9 + \u89C6\u89C9\u5143\u7D20\u5EFA\u8BAE + \u63A8\u8350\u5E03\u5C40\u3002\u5E03\u5C40\u4ECE\u4EE5\u4E0B\u9009\u62E9\uFF1A${LAYOUT_SCHEMES.map((l) => `${l.key}(${l.name})`).join("\u3001")}\u3002\u6BCF\u4E2A\u8981\u70B9\u6807\u6CE8\u6765\u6E90\uFF1Auser_provided(\u80CC\u666F\u6750\u6599\u4E2D\u660E\u786E\u63D0\u4F9B)/ai_retrieved(\u9700\u8054\u7F51\u68C0\u7D22)/pending_verify(AI\u63A8\u6D4B\u9700\u786E\u8BA4)/sample_data(\u5360\u4F4D\u793A\u4F8B\u9700\u66FF\u6362)\u3002\u8F93\u51FA JSON\uFF1A{"pages":[{"page_no":1,"layout":"data","points":[{"text":"...","source":"pending_verify"}],"visual_hint":"\u67F1\u72B6\u56FE"}]}\u3002`
    },
    {
      role: "user",
      content: `\u80CC\u666F\u6750\u6599\uFF08\u53EF\u4F5C\u4E3A user_provided \u6765\u6E90\uFF09\uFF1A
${background.slice(0, 2500)}

\u6807\u9898\u5217\u8868\uFF1A
${titles.map((t) => `\u7B2C${t.page_no}\u9875[${t.info_type}]\uFF1A${t.title}`).join("\n")}`
    }
  ], { maxTokens: 3e3 });
  return (r?.pages ?? []).map((p) => ({
    page_no: p.page_no,
    title: titles.find((t) => t.page_no === p.page_no)?.title ?? "",
    layout: p.layout,
    points: (p.points ?? []).map((pt) => ({ text: pt.text, source: normalizeSource(pt.source) })),
    visual_hint: p.visual_hint ?? ""
  }));
}
__name(batchPreview, "batchPreview");
function normalizeSource(s) {
  const m = {
    user_provided: "user_provided",
    ai_retrieved: "ai_retrieved",
    pending_verify: "pending_verify",
    sample_data: "sample_data"
  };
  return m[s] ?? "pending_verify";
}
__name(normalizeSource, "normalizeSource");
function recommendLayouts(infoType) {
  const map = {
    viewpoint: ["zongfen", "psb"],
    data: ["data", "compare"],
    fact: ["cause", "timeline"],
    story: ["story", "timeline"]
  };
  return map[infoType] ?? ["zongfen", "data"];
}
__name(recommendLayouts, "recommendLayouts");
async function deepenPage(env2, page, layoutKey, background, userNote) {
  const scheme = LAYOUT_SCHEMES.find((l) => l.key === layoutKey);
  const r = await chatJson(env2, [
    {
      role: "system",
      content: `\u4F60\u662F\u5185\u5BB9\u5F15\u64CE\u3002\u4EE5\u6807\u9898\u4E3A\u8BBA\u70B9\uFF0C\u6309'${scheme?.name ?? layoutKey}'\u5E03\u5C40\uFF08\u7ED3\u6784\uFF1A${scheme?.structure ?? ""}\uFF09\u7EC4\u7EC7\u8BBA\u636E\u3002\u7ED3\u5408\u7528\u6237\u8865\u5145\u7D20\u6750\u4E0E\u80CC\u666F\u6750\u6599\uFF0C\u8F93\u51FA\u8BE5\u9875\u5B8C\u6574\u5185\u5BB9\u3002\u6BCF\u4E2A\u8BBA\u636E\u6807\u6CE8\u6765\u6E90(user_provided/ai_retrieved/pending_verify/sample_data)\u3002\u8F93\u51FA JSON\uFF1A{"points":[{"text":"...","source":"user_provided"}],"visual_hint":"...","core_message":"\u672C\u9875\u6838\u5FC3\u7ED3\u8BBA"}\u3002`
    },
    {
      role: "user",
      content: `\u9875\u9762\u6807\u9898\uFF1A${page.title}
\u80CC\u666F\u6750\u6599\uFF1A${background.slice(0, 2e3)}
\u7528\u6237\u8865\u5145\uFF1A${userNote.slice(0, 800)}
\u5F53\u524D\u8981\u70B9\uFF1A${page.points.map((p) => p.text).join("\uFF1B")}`
    }
  ], { maxTokens: 1500 });
  return {
    ...page,
    layout: layoutKey,
    points: (r?.points ?? page.points).map((p) => ({ text: p.text, source: normalizeSource(p.source) })),
    visual_hint: r?.visual_hint ?? page.visual_hint
  };
}
__name(deepenPage, "deepenPage");
function collectPendingData(pages) {
  const out = [];
  for (const p of pages) {
    for (const pt of p.points) {
      if (pt.source === "pending_verify" || pt.source === "sample_data") {
        out.push({ page_no: p.page_no, text: pt.text, source: pt.source });
      }
    }
  }
  return out;
}
__name(collectPendingData, "collectPendingData");

// src/engine/design.ts
function renderSlide(page, _theme) {
  const blocks = [];
  const pts = page.points.map((p) => p.text);
  const sources = page.points.map((p) => p.source);
  blocks.push({ type: "heading", content: page.title });
  switch (page.layout) {
    case "data": {
      const main = pts[0] ?? "";
      blocks.push({ type: "kpi", content: main, source: sources[0] });
      if (pts.length > 1)
        blocks.push({ type: "bullets", content: "", items: pts.slice(1) });
      if (page.visual_hint)
        blocks.push({ type: "chart", content: page.visual_hint });
      break;
    }
    case "compare": {
      blocks.push({ type: "table", content: page.visual_hint || "\u5BF9\u6BD4\u8868", items: pts });
      break;
    }
    case "matrix": {
      blocks.push({ type: "matrix", content: page.visual_hint || "2x2 \u77E9\u9635", items: pts });
      break;
    }
    case "timeline": {
      blocks.push({ type: "bullets", content: "", items: pts, style: { layout: "timeline" } });
      if (page.visual_hint)
        blocks.push({ type: "chart", content: page.visual_hint });
      break;
    }
    case "story": {
      blocks.push({ type: "quote", content: pts[0] ?? "" });
      if (pts.length > 1)
        blocks.push({ type: "bullets", content: "", items: pts.slice(1) });
      break;
    }
    case "cause":
    case "psb": {
      blocks.push({ type: "bullets", content: "", items: pts, style: { layout: "flow" } });
      if (page.visual_hint)
        blocks.push({ type: "chart", content: page.visual_hint });
      break;
    }
    case "zongfen":
    default: {
      if (pts.length > 0)
        blocks.push({ type: "quote", content: pts[0], source: sources[0] });
      if (pts.length > 1)
        blocks.push({ type: "bullets", content: "", items: pts.slice(1) });
      if (page.visual_hint)
        blocks.push({ type: "chart", content: page.visual_hint });
      break;
    }
  }
  return { page_no: page.page_no, title: page.title, layout: page.layout, blocks };
}
__name(renderSlide, "renderSlide");
function renderDeck(pages, theme) {
  return pages.slice().sort((a, b) => a.page_no - b.page_no).map((p) => renderSlide(p, theme));
}
__name(renderDeck, "renderDeck");

// src/engine/edit.ts
async function aiEditSlide(env2, slide, instruction) {
  const r = await chatJson(env2, [
    {
      role: "system",
      content: '\u4F60\u662F\u4FEE\u6539\u5F15\u64CE\u3002\u7528\u6237\u9488\u5BF9\u4E00\u9875\u5E7B\u706F\u7247\u7ED9\u51FA\u4FEE\u6539\u6307\u4EE4\uFF0C\u4F60\u53EA\u4FEE\u6539\u8FD9\u4E00\u9875\u7684 blocks\uFF0C\u4FDD\u6301\u7ED3\u6784\u5408\u6CD5\u3002block \u7C7B\u578B\uFF1Aheading/text/bullets/chart/image/quote/kpi/table/matrix\u3002\u8F93\u51FA JSON\uFF1A{"blocks":[...],"change_summary":"\u4E00\u53E5\u8BDD\u8BF4\u660E\u6539\u4E86\u4EC0\u4E48"}\u3002'
    },
    {
      role: "user",
      content: `\u9875\u9762\u6807\u9898\uFF1A${slide.title}
\u5E03\u5C40\uFF1A${slide.layout}
\u5F53\u524D blocks\uFF1A${JSON.stringify(slide.blocks)}
\u4FEE\u6539\u6307\u4EE4\uFF1A${instruction}`
    }
  ], { maxTokens: 1500 });
  if (!r || !Array.isArray(r.blocks)) {
    return { blocks: slide.blocks, change_summary: "\u672A\u8BC6\u522B\u4FEE\u6539\u6307\u4EE4\uFF0C\u4FDD\u6301\u539F\u6837" };
  }
  return { blocks: r.blocks, change_summary: r.change_summary ?? "\u5DF2\u4FEE\u6539" };
}
__name(aiEditSlide, "aiEditSlide");

// src/api/steps.ts
async function getBackground(env2, projectId) {
  const mats = await env2.DB.prepare("SELECT parsed_summary, raw_text, name FROM materials WHERE project_id=? AND status='parsed'").bind(projectId).all();
  const parts = (mats.results ?? []).map((m) => {
    const r = m;
    return `\u3010${r.name}\u3011${String(r.raw_text ?? "").slice(0, 1200)}`;
  });
  return parts.join("\n\n");
}
__name(getBackground, "getBackground");
async function handleMaterials(env2, projectId, req) {
  const contentType = req.headers.get("content-type") ?? "";
  const inputs = [];
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    for (const [, value] of form.entries()) {
      if (typeof value === "object" && value !== null && "arrayBuffer" in value) {
        const file = value;
        const buf = await file.arrayBuffer();
        const mime = file.type;
        const isImage = mime.startsWith("image/");
        inputs.push({ kind: isImage ? "image" : "file", name: file.name, mime, data: buf });
      }
    }
  } else {
    const body = await req.json().catch(() => ({}));
    for (const m of body.materials ?? [])
      inputs.push(m);
  }
  if (inputs.length === 0)
    return err("\u672A\u63D0\u4F9B\u6750\u6599");
  const results = [];
  for (const m of inputs) {
    const parsed = await ingestMaterial(env2, projectId, m, env2.MATERIALS);
    await env2.DB.prepare(
      "INSERT INTO materials (id, project_id, kind, name, mime, r2_key, source_url, raw_text, parsed_summary, must_cite, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(parsed.id, projectId, parsed.kind, parsed.name, parsed.mime, parsed.r2_key, parsed.source_url, parsed.raw_text, parsed.parsed_summary, parsed.must_cite, parsed.status, now()).run();
    results.push({ id: parsed.id, name: parsed.name, kind: parsed.kind, summary: safeParse(parsed.parsed_summary, {}) });
  }
  await touchProject(env2.DB, projectId, 0);
  await addMessage(env2.DB, projectId, 0, "user", `\u4E0A\u4F20 ${inputs.length} \u4EFD\u80CC\u666F\u6750\u6599`);
  return ok({ ingested: results.length, materials: results });
}
__name(handleMaterials, "handleMaterials");
async function handleContextPack(env2, projectId) {
  const mats = await env2.DB.prepare("SELECT * FROM materials WHERE project_id=? AND status='parsed'").bind(projectId).all();
  const parsed = (mats.results ?? []).map((m) => m);
  const pack = await buildContextPack(env2, parsed);
  return ok({ pack });
}
__name(handleContextPack, "handleContextPack");
async function handleAudience(env2, projectId, req) {
  const body = await req.json().catch(() => ({}));
  const bg = await getBackground(env2, projectId);
  const audience = await buildAudience(env2, body.role ?? "", body.scene ?? "", body.goal ?? "", bg);
  await env2.DB.prepare(
    "INSERT INTO audience (project_id, role, scene, goal, summary, updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET role=excluded.role, scene=excluded.scene, goal=excluded.goal, summary=excluded.summary, updated_at=excluded.updated_at"
  ).bind(projectId, audience.role, audience.scene, audience.goal, audience.summary, now()).run();
  await addMessage(env2.DB, projectId, 1, "user", `\u53D7\u4F17\uFF1A${body.role}/${body.scene}/${body.goal}`);
  return ok({ audience });
}
__name(handleAudience, "handleAudience");
async function handleExplore(env2, projectId, req) {
  const body = await req.json().catch(() => ({}));
  const bg = await getBackground(env2, projectId);
  const audRow = await env2.DB.prepare("SELECT * FROM audience WHERE project_id=?").bind(projectId).first();
  const audience = audRow ?? { role: "", scene: "\u901A\u7528\u5546\u52A1\u6C47\u62A5", goal: "", summary: "\u901A\u7528\u5546\u52A1\u6C47\u62A5" };
  const result = await proposeAngles(env2, body.topic ?? "", audience, bg);
  await env2.DB.prepare("UPDATE projects SET topic=?, updated_at=? WHERE id=?").bind(body.topic ?? "", now(), projectId).run();
  await addMessage(env2.DB, projectId, 2, "user", `\u4E3B\u9898\uFF1A${body.topic}`);
  return ok(result);
}
__name(handleExplore, "handleExplore");
async function handleFramework(env2, projectId, req) {
  const body = await req.json().catch(() => ({}));
  const bg = await getBackground(env2, projectId);
  const audRow = await env2.DB.prepare("SELECT * FROM audience WHERE project_id=?").bind(projectId).first();
  const audience = audRow ?? { role: "", scene: "", goal: "", summary: "\u901A\u7528\u5546\u52A1\u6C47\u62A5" };
  const framework = await buildFramework(env2, body.topic ?? "", audience, bg, body.user_input ?? "");
  await env2.DB.prepare(
    "INSERT INTO framework (project_id, core_thesis, pillars, logic_notes, updated_at) VALUES (?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET core_thesis=excluded.core_thesis, pillars=excluded.pillars, logic_notes=excluded.logic_notes, updated_at=excluded.updated_at"
  ).bind(projectId, framework.core_thesis, JSON.stringify(framework.pillars), JSON.stringify(framework.logic_notes), now()).run();
  await addMessage(env2.DB, projectId, 2, "assistant", `\u6846\u67B6\uFF1A${framework.core_thesis}`);
  return ok({ framework });
}
__name(handleFramework, "handleFramework");
async function handleTitles(env2, projectId, req) {
  const body = await req.json().catch(() => ({}));
  const fwRow = await env2.DB.prepare("SELECT * FROM framework WHERE project_id=?").bind(projectId).first();
  const framework = body.framework ?? (fwRow ? { core_thesis: fwRow.core_thesis, pillars: safeParse(fwRow.pillars, []) } : null);
  if (!framework)
    return err("\u8BF7\u5148\u6784\u5EFA\u6846\u67B6");
  const audRow = await env2.DB.prepare("SELECT * FROM audience WHERE project_id=?").bind(projectId).first();
  const audience = audRow ?? { role: "", scene: "", goal: "", summary: "\u901A\u7528\u5546\u52A1\u6C47\u62A5" };
  const titles = await generateTitles(env2, framework, audience);
  const readThrough = await readThroughCheck(env2, titles);
  const t = now();
  await env2.DB.prepare("DELETE FROM titles WHERE project_id=?").bind(projectId).run();
  for (const title2 of titles) {
    await env2.DB.prepare(
      "INSERT INTO titles (id, project_id, page_no, title, info_type, pillar_idx, created_at) VALUES (?,?,?,?,?,?,?)"
    ).bind(uid(), projectId, title2.page_no, title2.title, title2.info_type, title2.pillar_idx, t).run();
  }
  return ok({ titles, read_through: readThrough });
}
__name(handleTitles, "handleTitles");
async function handleBatchPreview(env2, projectId) {
  const titleRows = await env2.DB.prepare("SELECT * FROM titles WHERE project_id=? ORDER BY page_no").bind(projectId).all();
  const titles = titleRows.results ?? [];
  if (titles.length === 0)
    return err("\u8BF7\u5148\u751F\u6210\u6807\u9898");
  const bg = await getBackground(env2, projectId);
  const pages = await batchPreview(env2, titles, bg);
  const t = now();
  await env2.DB.prepare("DELETE FROM pages WHERE project_id=?").bind(projectId).run();
  for (const p of pages) {
    await env2.DB.prepare(
      "INSERT INTO pages (id, project_id, page_no, title, layout, points, visual_hint, deep_dived, updated_at) VALUES (?,?,?,?,?,?,?,?,?)"
    ).bind(uid(), projectId, p.page_no, p.title, p.layout, JSON.stringify(p.points ?? []), p.visual_hint ?? "", 0, t).run();
  }
  return ok({ pages, recommend: Object.fromEntries(titles.map((t2) => [t2.page_no, recommendLayouts(t2.info_type)])) });
}
__name(handleBatchPreview, "handleBatchPreview");
async function handleDeepenPage(env2, projectId, req) {
  const body = await req.json().catch(() => ({}));
  const pageRow = await env2.DB.prepare("SELECT * FROM pages WHERE project_id=? AND page_no=?").bind(projectId, body.page_no ?? 0).first();
  if (!pageRow)
    return err("\u9875\u9762\u4E0D\u5B58\u5728", 404);
  const page = { ...pageRow, points: safeParse(pageRow.points, []) };
  const bg = await getBackground(env2, projectId);
  const updated = await deepenPage(env2, page, body.layout ?? page.layout, bg, body.user_note ?? "");
  await env2.DB.prepare(
    "UPDATE pages SET layout=?, points=?, visual_hint=?, deep_dived=1, updated_at=? WHERE project_id=? AND page_no=?"
  ).bind(updated.layout, JSON.stringify(updated.points ?? []), updated.visual_hint ?? "", now(), projectId, body.page_no ?? 0).run();
  await addMessage(env2.DB, projectId, 3, "user", `\u6DF1\u5316\u7B2C${body.page_no}\u9875`);
  return ok({ page: updated });
}
__name(handleDeepenPage, "handleDeepenPage");
async function handleStyleRecommend(env2, projectId) {
  const audRow = await env2.DB.prepare("SELECT * FROM audience WHERE project_id=?").bind(projectId).first();
  const summary = audRow?.summary ?? "";
  let recommended = ["business-deep", "tech-modern", "academic-clean"];
  if (/董事会|战略|汇报/.test(summary))
    recommended = ["business-deep", "academic-clean", "tech-modern"];
  else if (/路演|投资|融资/.test(summary))
    recommended = ["tech-modern", "business-deep", "academic-clean"];
  else if (/学术|答辩|研究/.test(summary))
    recommended = ["academic-clean", "business-deep", "tech-modern"];
  return ok({ themes: STYLE_THEMES, recommended });
}
__name(handleStyleRecommend, "handleStyleRecommend");
async function handleGenerate(env2, projectId) {
  const pageRows = await env2.DB.prepare("SELECT * FROM pages WHERE project_id=? ORDER BY page_no").bind(projectId).all();
  const pages = (pageRows.results ?? []).map((p) => ({ ...p, points: safeParse(p.points, []) }));
  if (pages.length === 0)
    return err("\u8BF7\u5148\u5B8C\u6210\u5185\u5BB9\u6DF1\u5316");
  const styleRow = await env2.DB.prepare("SELECT * FROM style WHERE project_id=?").bind(projectId).first();
  const theme = themeByKey(styleRow?.theme ?? "business-deep");
  const slides = renderDeck(pages, theme);
  const t = now();
  await env2.DB.prepare("DELETE FROM slides WHERE project_id=?").bind(projectId).run();
  for (const s of slides) {
    await env2.DB.prepare("INSERT INTO slides (id, project_id, page_no, title, layout, blocks, locked, updated_at) VALUES (?,?,?,?,?,?,0,?)").bind(uid(), projectId, s.page_no, s.title, s.layout, JSON.stringify(s.blocks), t).run();
  }
  await createVersionSnapshot(env2, projectId, "\u751F\u6210\u521D\u7A3F");
  await touchProject(env2.DB, projectId, 5);
  return ok({ slides, theme });
}
__name(handleGenerate, "handleGenerate");
async function createVersionSnapshot(env2, projectId, summary) {
  const slideRows = await env2.DB.prepare("SELECT * FROM slides WHERE project_id=? ORDER BY page_no").bind(projectId).all();
  const seqRow = await env2.DB.prepare("SELECT MAX(seq) as maxseq FROM versions WHERE project_id=?").bind(projectId).first();
  const seq = (seqRow?.maxseq ?? 0) + 1;
  await env2.DB.prepare("INSERT INTO versions (id, project_id, seq, summary, snapshot, created_at) VALUES (?,?,?,?,?,?)").bind(uid(), projectId, seq, summary, JSON.stringify(slideRows.results ?? []), now()).run();
  await env2.DB.prepare("DELETE FROM versions WHERE project_id=? AND seq NOT IN (SELECT seq FROM versions WHERE project_id=? ORDER BY seq DESC LIMIT 50)").bind(projectId, projectId).run();
}
__name(createVersionSnapshot, "createVersionSnapshot");
async function handleAiEdit(env2, projectId, req) {
  const body = await req.json().catch(() => ({}));
  const slideRow = await env2.DB.prepare("SELECT * FROM slides WHERE project_id=? AND page_no=?").bind(projectId, body.page_no ?? 0).first();
  if (!slideRow)
    return err("\u9875\u9762\u4E0D\u5B58\u5728", 404);
  if (slideRow.locked)
    return err("\u8BE5\u9875\u5DF2\u9501\u5B9A\uFF0CAI \u4E0D\u4F1A\u4FEE\u6539", 403);
  const slide = { page_no: body.page_no, title: slideRow.title, layout: slideRow.layout, blocks: safeParse(slideRow.blocks, []) };
  const result = await aiEditSlide(env2, slide, body.instruction ?? "");
  await addMessage(env2.DB, projectId, 6, "user", `\u4FEE\u6539\u7B2C${body.page_no}\u9875\uFF1A${body.instruction}`);
  return ok({ before: slide.blocks, after: result.blocks, change_summary: result.change_summary });
}
__name(handleAiEdit, "handleAiEdit");
async function handleApplyEdit(env2, projectId, req) {
  const body = await req.json().catch(() => ({}));
  await env2.DB.prepare("UPDATE slides SET blocks=?, updated_at=? WHERE project_id=? AND page_no=?").bind(JSON.stringify(body.blocks ?? []), now(), projectId, body.page_no ?? 0).run();
  await createVersionSnapshot(env2, projectId, body.summary ?? `\u4FEE\u6539\u7B2C${body.page_no}\u9875`);
  return ok({ applied: true });
}
__name(handleApplyEdit, "handleApplyEdit");
async function handleSaveSlide(env2, projectId, req) {
  const body = await req.json().catch(() => ({}));
  if (body.title !== void 0) {
    await env2.DB.prepare("UPDATE slides SET title=?, updated_at=? WHERE project_id=? AND page_no=?").bind(body.title, now(), projectId, body.page_no ?? 0).run();
  }
  if (body.blocks !== void 0) {
    await env2.DB.prepare("UPDATE slides SET blocks=?, updated_at=? WHERE project_id=? AND page_no=?").bind(JSON.stringify(body.blocks), now(), projectId, body.page_no ?? 0).run();
  }
  await createVersionSnapshot(env2, projectId, body.summary ?? `\u624B\u52A8\u7F16\u8F91\u7B2C${body.page_no}\u9875`);
  return ok({ saved: true });
}
__name(handleSaveSlide, "handleSaveSlide");
async function handleLockSlide(env2, projectId, req) {
  const body = await req.json().catch(() => ({}));
  await env2.DB.prepare("UPDATE slides SET locked=?, updated_at=? WHERE project_id=? AND page_no=?").bind(body.locked ? 1 : 0, now(), projectId, body.page_no ?? 0).run();
  return ok({ locked: !!body.locked });
}
__name(handleLockSlide, "handleLockSlide");
async function handleVersions(env2, projectId) {
  const rows = await env2.DB.prepare("SELECT id, seq, summary, created_at FROM versions WHERE project_id=? ORDER BY seq DESC").bind(projectId).all();
  return ok({ versions: rows.results ?? [] });
}
__name(handleVersions, "handleVersions");
async function handleRollback(env2, projectId, req) {
  const body = await req.json().catch(() => ({}));
  const vRow = await env2.DB.prepare("SELECT snapshot FROM versions WHERE project_id=? AND seq=?").bind(projectId, body.seq ?? 0).first();
  if (!vRow)
    return err("\u7248\u672C\u4E0D\u5B58\u5728", 404);
  const snapshot = safeParse(vRow.snapshot, []);
  const t = now();
  await env2.DB.prepare("DELETE FROM slides WHERE project_id=?").bind(projectId).run();
  for (const s of snapshot) {
    await env2.DB.prepare("INSERT INTO slides (id, project_id, page_no, title, layout, blocks, locked, updated_at) VALUES (?,?,?,?,?,?,?,?)").bind(uid(), projectId, s.page_no, s.title, s.layout, JSON.stringify(safeParse(s.blocks, [])), s.locked ?? 0, t).run();
  }
  await createVersionSnapshot(env2, projectId, `\u56DE\u6EDA\u5230 v${body.seq}`);
  return ok({ rolled_back: true });
}
__name(handleRollback, "handleRollback");
async function handleExportCheck(env2, projectId) {
  const pageRows = await env2.DB.prepare("SELECT * FROM pages WHERE project_id=? ORDER BY page_no").bind(projectId).all();
  const pages = (pageRows.results ?? []).map((p) => ({ ...p, points: safeParse(p.points, []) }));
  const pending = collectPendingData(pages);
  const slideRows = await env2.DB.prepare("SELECT COUNT(*) as c FROM slides WHERE project_id=?").bind(projectId).first();
  const slideCount = slideRows?.c ?? 0;
  const emptyPages = pages.filter((p) => !p.points || p.points.length === 0).map((p) => p.page_no);
  return ok({
    can_export: pending.length === 0 && slideCount > 0,
    pending_data: pending,
    empty_pages: emptyPages,
    slide_count: slideCount
  });
}
__name(handleExportCheck, "handleExportCheck");

// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = /* @__PURE__ */ __name(function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
}, "freb");
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = /* @__PURE__ */ __name(function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
}, "hMap");
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var shft = /* @__PURE__ */ __name(function(p) {
  return (p + 7) / 8 | 0;
}, "shft");
var slc = /* @__PURE__ */ __name(function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
}, "slc");
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err2 = /* @__PURE__ */ __name(function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err2);
  if (!nt)
    throw e;
  return e;
}, "err");
var wbits = /* @__PURE__ */ __name(function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
}, "wbits");
var wbits16 = /* @__PURE__ */ __name(function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
}, "wbits16");
var hTree = /* @__PURE__ */ __name(function(d, mb) {
  var t = [];
  for (var i = 0; i < d.length; ++i) {
    if (d[i])
      t.push({ s: i, f: d[i] });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s)
    return { t: et, l: 0 };
  if (s == 1) {
    var v = new u8(t[0].s + 1);
    v[t[0].s] = 1;
    return { t: v, l: 1 };
  }
  t.sort(function(a, b) {
    return a.f - b.f;
  });
  t.push({ s: -1, f: 25001 });
  var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
  t[0] = { s: -1, f: l.f + r.f, l, r };
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i2].f ? i0++ : i2++];
    r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
    t[i1++] = { s: -1, f: l.f + r.f, l, r };
  }
  var maxSym = t2[0].s;
  for (var i = 1; i < s; ++i) {
    if (t2[i].s > maxSym)
      maxSym = t2[i].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a, b) {
      return tr[b.s] - tr[a.s] || a.f - b.f;
    });
    for (; i < s; ++i) {
      var i2_1 = t2[i].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt >>= lft;
    while (dt > 0) {
      var i2_2 = t2[i].s;
      if (tr[i2_2] < mb)
        dt -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i;
    }
    for (; i >= 0 && dt; --i) {
      var i2_3 = t2[i].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
}, "hTree");
var ln = /* @__PURE__ */ __name(function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
}, "ln");
var lc = /* @__PURE__ */ __name(function(c) {
  var s = c.length;
  while (s && !c[--s])
    ;
  var cl = new u16(++s);
  var cli = 0, cln = c[0], cls = 1;
  var w = /* @__PURE__ */ __name(function(v) {
    cl[cli++] = v;
  }, "w");
  for (var i = 1; i <= s; ++i) {
    if (c[i] == cln && i != s)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w(32754);
        if (cls > 2) {
          w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w(cln), --cls;
        for (; cls > 6; cls -= 6)
          w(8304);
        if (cls > 2)
          w(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w(cln);
      cls = 1;
      cln = c[i];
    }
  }
  return { c: cl.subarray(0, cli), n: s };
}, "lc");
var clen = /* @__PURE__ */ __name(function(cf, cl) {
  var l = 0;
  for (var i = 0; i < cl.length; ++i)
    l += cf[i] * cl[i];
  return l;
}, "clen");
var wfblk = /* @__PURE__ */ __name(function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i = 0; i < s; ++i)
    out[o + i + 4] = dat[i];
  return (o + 4 + s) * 8;
}, "wfblk");
var wblk = /* @__PURE__ */ __name(function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i = 0; i < lclt.length; ++i)
    ++lcfreq[lclt[i] & 31];
  for (var i = 0; i < lcdt.length; ++i)
    ++lcfreq[lcdt[i] & 31];
  var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i = 0; i < nlcc; ++i)
      wbits(out, p + 3 * i, lct[clim[i]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i = 0; i < clct.length; ++i) {
        var len = clct[i] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15)
          wbits(out, p, clct[i] >> 5 & 127), p += clct[i] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i = 0; i < li; ++i) {
    var sym = syms[i];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7)
        wbits(out, p, sym >> 23 & 31), p += fleb[len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3)
        wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[sym]), p += ll[sym];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
}, "wblk");
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = /* @__PURE__ */ __name(function(dat, lvl, plvl, pre, post, st) {
  var s = st.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w = o.subarray(pre, o.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos)
      w[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = /* @__PURE__ */ __name(function(i2) {
      return (dat[i2] ^ dat[i2 + 1] << bs1_1 ^ dat[i2 + 2] << bs2_1) & msk_1;
    }, "hsh");
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
    for (; i + 2 < s; ++i) {
      var hv = hsh(i);
      var imod = i & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i) {
        var rem = s - i;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
          li = lc_1 = eb = 0, bs = i;
          for (var j = 0; j < 286; ++j)
            lf[j] = 0;
          for (var j = 0; j < 30; ++j)
            df[j] = 0;
        }
        var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i + l] == dat[i + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                ;
              if (nl > l) {
                l = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j = 0; j < mmd; ++j) {
                  var ti = i - dif + j & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i + l;
          ++lc_1;
        } else {
          syms[li++] = dat[i];
          ++lf[dat[i]];
        }
      }
    }
    for (i = Math.max(i, wi); i < s; ++i) {
      syms[li++] = dat[i];
      ++lf[dat[i]];
    }
    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w[pos / 8 | 0] << 3;
      pos -= 7;
      st.h = head, st.p = prev, st.i = i, st.w = wi;
    }
  } else {
    for (var i = st.w || 0; i < s + lst; i += 65535) {
      var e = i + 65535;
      if (e >= s) {
        w[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w, pos + 1, dat.subarray(i, e));
    }
    st.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
}, "dflt");
var crct = /* @__PURE__ */ function() {
  var t = new Int32Array(256);
  for (var i = 0; i < 256; ++i) {
    var c = i, k = 9;
    while (--k)
      c = (c & 1 && -306674912) ^ c >>> 1;
    t[i] = c;
  }
  return t;
}();
var crc = /* @__PURE__ */ __name(function() {
  var c = -1;
  return {
    p: function(d) {
      var cr = c;
      for (var i = 0; i < d.length; ++i)
        cr = crct[cr & 255 ^ d[i]] ^ cr >>> 8;
      c = cr;
    },
    d: function() {
      return ~c;
    }
  };
}, "crc");
var dopt = /* @__PURE__ */ __name(function(dat, opt, pre, post, st) {
  if (!st) {
    st = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
}, "dopt");
var mrg = /* @__PURE__ */ __name(function(a, b) {
  var o = {};
  for (var k in a)
    o[k] = a[k];
  for (var k in b)
    o[k] = b[k];
  return o;
}, "mrg");
var wbytes = /* @__PURE__ */ __name(function(d, b, v) {
  for (; v; ++b)
    d[b] = v, v >>>= 8;
}, "wbytes");
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
__name(deflateSync, "deflateSync");
var fltn = /* @__PURE__ */ __name(function(d, p, t, o) {
  for (var k in d) {
    var val = d[k], n = p + k, op = o;
    if (Array.isArray(val))
      op = mrg(o, val[1]), val = val[0];
    if (ArrayBuffer.isView(val))
      t[n] = [val, op];
    else {
      t[n += "/"] = [new u8(0), op];
      fltn(val, n, t, o);
    }
  }
}, "fltn");
var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
function strToU8(str, latin1) {
  if (latin1) {
    var ar_1 = new u8(str.length);
    for (var i = 0; i < str.length; ++i)
      ar_1[i] = str.charCodeAt(i);
    return ar_1;
  }
  if (te)
    return te.encode(str);
  var l = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w = /* @__PURE__ */ __name(function(v) {
    ar[ai++] = v;
  }, "w");
  for (var i = 0; i < l; ++i) {
    if (ai + 5 > ar.length) {
      var n = new u8(ai + 8 + (l - i << 1));
      n.set(ar);
      ar = n;
    }
    var c = str.charCodeAt(i);
    if (c < 128 || latin1)
      w(c);
    else if (c < 2048)
      w(192 | c >> 6), w(128 | c & 63);
    else if (c > 55295 && c < 57344)
      c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
    else
      w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
  }
  return slc(ar, 0, ai);
}
__name(strToU8, "strToU8");
var exfl = /* @__PURE__ */ __name(function(ex) {
  var le = 0;
  if (ex) {
    for (var k in ex) {
      var l = ex[k].length;
      if (l > 65535)
        err2(9);
      le += l + 4;
    }
  }
  return le;
}, "exfl");
var wzh = /* @__PURE__ */ __name(function(d, b, f, fn, u, c, ce, co) {
  var fl2 = fn.length, ex = f.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
  if (ce != null)
    d[b++] = 20, d[b++] = f.os;
  d[b] = 20, b += 2;
  d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
  d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
  var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
  if (y < 0 || y > 119)
    err2(10);
  wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
  if (c != -1) {
    wbytes(d, b, f.crc);
    wbytes(d, b + 4, c < 0 ? -c - 2 : c);
    wbytes(d, b + 8, f.size);
  }
  wbytes(d, b + 12, fl2);
  wbytes(d, b + 14, exl), b += 16;
  if (ce != null) {
    wbytes(d, b, col);
    wbytes(d, b + 6, f.attrs);
    wbytes(d, b + 10, ce), b += 14;
  }
  d.set(fn, b);
  b += fl2;
  if (exl) {
    for (var k in ex) {
      var exf = ex[k], l = exf.length;
      wbytes(d, b, +k);
      wbytes(d, b + 2, l);
      d.set(exf, b + 4), b += 4 + l;
    }
  }
  if (col)
    d.set(co, b), b += col;
  return b;
}, "wzh");
var wzf = /* @__PURE__ */ __name(function(o, b, c, d, e) {
  wbytes(o, b, 101010256);
  wbytes(o, b + 8, c);
  wbytes(o, b + 10, c);
  wbytes(o, b + 12, d);
  wbytes(o, b + 16, e);
}, "wzf");
function zipSync(data, opts) {
  if (!opts)
    opts = {};
  var r = {};
  var files = [];
  fltn(data, "", r, opts);
  var o = 0;
  var tot = 0;
  for (var fn in r) {
    var _a2 = r[fn], file = _a2[0], p = _a2[1];
    var compression = p.level == 0 ? 0 : 8;
    var f = strToU8(fn), s = f.length;
    var com = p.comment, m = com && strToU8(com), ms = m && m.length;
    var exl = exfl(p.extra);
    if (s > 65535)
      err2(11);
    var d = compression ? deflateSync(file, p) : file, l = d.length;
    var c = crc();
    c.p(file);
    files.push(mrg(p, {
      size: file.length,
      crc: c.d(),
      c: d,
      f,
      m,
      u: s != fn.length || m && com.length != ms,
      o,
      compression
    }));
    o += 30 + s + exl + l;
    tot += 76 + 2 * (s + exl) + (ms || 0) + l;
  }
  var out = new u8(tot + 22), oe = o, cdl = tot - o;
  for (var i = 0; i < files.length; ++i) {
    var f = files[i];
    wzh(out, f.o, f, f.f, f.u, f.c.length);
    var badd = 30 + f.f.length + exfl(f.extra);
    out.set(f.c, f.o + badd);
    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
  }
  wzf(out, o, files.length, cdl, oe);
  return out;
}
__name(zipSync, "zipSync");

// src/export/pptx.ts
var EMU = 914400;
var SLIDE_W = 10 * EMU;
var SLIDE_H = 5.625 * EMU;
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
__name(esc, "esc");
function colorHex(c) {
  return c.replace("#", "").toUpperCase();
}
__name(colorHex, "colorHex");
function shapeXml(shape, id) {
  const paras = shape.runs.map(
    (r) => `<a:p><a:pPr algn="${shape.align}"/><a:r><a:rPr lang="zh-CN" sz="${r.size * 100}" b="${r.bold ? 1 : 0}"><a:solidFill><a:srgbClr val="${colorHex(r.color)}"/></a:solidFill><a:latin typeface="${esc(r.font)}"/><a:ea typeface="${esc(r.font)}"/></a:rPr><a:t>${esc(r.text)}</a:t></a:r></a:p>`
  ).join("");
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="shape${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${shape.x}" y="${shape.y}"/><a:ext cx="${shape.w}" cy="${shape.h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" rtlCol="0"><a:spAutoFit/></a:bodyPr><a:lstStyle/>${paras}</p:txBody></p:sp>`;
}
__name(shapeXml, "shapeXml");
function blockToShapes(block, yStart, theme, idBase) {
  const font = theme.titleFont === "serif" ? "Noto Serif SC" : "Noto Sans SC";
  const margin = EMU * 0.6;
  const width = SLIDE_W - margin * 2;
  let xml = "";
  let y = yStart;
  const add = /* @__PURE__ */ __name((s) => {
    xml += shapeXml(s, idBase.v++);
    y += s.h + EMU * 0.12;
  }, "add");
  switch (block.type) {
    case "heading":
      add({ x: margin, y, w: width, h: EMU * 0.7, align: "l", runs: [{ text: block.content, size: 30, bold: true, color: theme.primary, font }] });
      break;
    case "kpi":
      add({ x: margin, y, w: width, h: EMU * 1.1, align: "ctr", runs: [{ text: block.content, size: 44, bold: true, color: theme.accent, font }] });
      break;
    case "quote":
      add({ x: margin, y, w: width, h: EMU * 0.9, align: "l", runs: [{ text: block.content, size: 20, bold: false, color: theme.text, font }] });
      break;
    case "bullets":
      for (const item of block.items ?? []) {
        add({ x: margin + EMU * 0.3, y, w: width - EMU * 0.3, h: EMU * 0.5, align: "l", runs: [{ text: "\u2022 " + item, size: 16, bold: false, color: theme.text, font: "Noto Sans SC" }] });
      }
      break;
    case "text":
      add({ x: margin, y, w: width, h: EMU * 0.5, align: "l", runs: [{ text: block.content, size: 16, bold: false, color: theme.text, font: "Noto Sans SC" }] });
      break;
    case "chart":
    case "table":
    case "matrix":
      add({ x: margin, y, w: width, h: EMU * 1.6, align: "ctr", runs: [{ text: `[${block.type}: ${block.content}]`, size: 14, bold: false, color: theme.accent, font: "Noto Sans SC" }] });
      for (const item of block.items ?? []) {
        add({ x: margin + EMU * 0.3, y, w: width - EMU * 0.3, h: EMU * 0.4, align: "l", runs: [{ text: "\u25E6 " + item, size: 14, bold: false, color: theme.text, font: "Noto Sans SC" }] });
      }
      break;
    case "divider":
      y += EMU * 0.2;
      break;
    default:
      add({ x: margin, y, w: width, h: EMU * 0.5, align: "l", runs: [{ text: block.content, size: 16, bold: false, color: theme.text, font: "Noto Sans SC" }] });
  }
  return { xml, nextY: y };
}
__name(blockToShapes, "blockToShapes");
function slideXml(slide, theme) {
  const idBase = { v: 2 };
  let shapes = "";
  let y = EMU * 0.5;
  for (const block of slide.blocks) {
    if (y > SLIDE_H - EMU * 0.6)
      break;
    const r = blockToShapes(block, y, theme, idBase);
    shapes += r.xml;
    y = r.nextY;
  }
  const bgFill = `<p:bg><p:bgPr><a:solidFill><a:srgbClr val="${colorHex(theme.bg)}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld>${bgFill}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapes}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}
__name(slideXml, "slideXml");
var CT_HEADER = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>`;
var CT_FOOTER = `</Types>`;
function buildPptx(slides, theme, title2) {
  const n = slides.length;
  let ct = CT_HEADER;
  for (let i = 1; i <= n; i++) {
    ct += `<Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
  }
  ct += CT_FOOTER;
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
  let presSldIds = "";
  let presRels = "";
  for (let i = 1; i <= n; i++) {
    presSldIds += `<p:sldId id="${255 + i}" r:id="rId${i}"/>`;
    presRels += `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>`;
  }
  const presentation = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldSz cx="${SLIDE_W}" cy="${SLIDE_H}" type="screen16x9"/><p:notesSz cx="6858000" cy="9144000"/><p:sldIdLst>${presSldIds}</p:sldIdLst></p:presentation>`;
  const presentationRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${presRels}</Relationships>`;
  const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(title2)}</dc:title><dc:creator>PPT \u667A\u80FD\u521B\u4F5C\u5E73\u53F0</dc:creator></cp:coreProperties>`;
  const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>PPT Creator</Application><Slides>${n}</Slides></Properties>`;
  const files = {
    "[Content_Types].xml": strToU8(ct),
    "_rels/.rels": strToU8(rootRels),
    "ppt/presentation.xml": strToU8(presentation),
    "ppt/_rels/presentation.xml.rels": strToU8(presentationRels),
    "docProps/core.xml": strToU8(core),
    "docProps/app.xml": strToU8(app)
  };
  slides.forEach((s, i) => {
    files[`ppt/slides/slide${i + 1}.xml`] = strToU8(slideXml(s, theme));
    files[`ppt/slides/_rels/slide${i + 1}.xml.rels`] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`);
  });
  return zipSync(files, { level: 6 });
}
__name(buildPptx, "buildPptx");

// src/api/export.ts
async function getSlides(env2, projectId) {
  const rows = await env2.DB.prepare("SELECT * FROM slides WHERE project_id=? ORDER BY page_no").bind(projectId).all();
  return (rows.results ?? []).map((s) => {
    const r = s;
    return { page_no: r.page_no, title: r.title, layout: r.layout, blocks: safeParse(r.blocks, []) };
  });
}
__name(getSlides, "getSlides");
async function getTheme(env2, projectId) {
  const styleRow = await env2.DB.prepare("SELECT theme FROM style WHERE project_id=?").bind(projectId).first();
  return themeByKey(styleRow?.theme ?? "business-deep");
}
__name(getTheme, "getTheme");
async function handleExportPptx(env2, projectId) {
  const slides = await getSlides(env2, projectId);
  if (slides.length === 0)
    return err("\u5C1A\u672A\u751F\u6210\u5E7B\u706F\u7247", 400);
  const theme = await getTheme(env2, projectId);
  const proj = await env2.DB.prepare("SELECT topic FROM projects WHERE id=?").bind(projectId).first();
  const title2 = proj?.topic ?? "\u6F14\u793A\u6587\u7A3F";
  const bytes = buildPptx(slides, theme, title2);
  return new Response(bytes.buffer, {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "content-disposition": `attachment; filename="presentation-${projectId.slice(0, 8)}.pptx"`
    }
  });
}
__name(handleExportPptx, "handleExportPptx");
async function handleExportHtml(env2, projectId) {
  const slides = await getSlides(env2, projectId);
  const theme = await getTheme(env2, projectId);
  const proj = await env2.DB.prepare("SELECT topic FROM projects WHERE id=?").bind(projectId).first();
  const title2 = proj?.topic ?? "\u6F14\u793A\u6587\u7A3F";
  const font = theme.titleFont === "serif" ? "'Noto Serif SC',serif" : "'Noto Sans SC',sans-serif";
  const pages = slides.map((s) => {
    const body = s.blocks.map((b) => {
      if (b.type === "heading")
        return `<h2 style="color:${theme.primary};font-family:${font}">${esc2(b.content)}</h2>`;
      if (b.type === "kpi")
        return `<div style="font-size:44px;font-weight:bold;color:${theme.accent};text-align:center">${esc2(b.content)}</div>`;
      if (b.type === "quote")
        return `<p style="font-size:20px;border-left:4px solid ${theme.accent};padding-left:12px">${esc2(b.content)}</p>`;
      if (b.type === "bullets")
        return `<ul>${(b.items ?? []).map((i) => `<li>${esc2(i)}</li>`).join("")}</ul>`;
      return `<p>${esc2(b.content)}</p>`;
    }).join("");
    return `<section class="slide" style="background:${theme.bg};color:${theme.text}">${body}</section>`;
  }).join("");
  const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>${esc2(title2)}</title><style>@page{size:10in 5.625in;margin:0}body{margin:0;font-family:'Noto Sans SC',sans-serif}.slide{width:10in;height:5.625in;padding:.6in;box-sizing:border-box;page-break-after:always;display:flex;flex-direction:column;justify-content:flex-start}</style></head><body>${pages}</body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
__name(handleExportHtml, "handleExportHtml");
function esc2(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
__name(esc2, "esc");
async function handleCreateShare(env2, projectId, req) {
  const body = await req.json().catch(() => ({}));
  const id = uid().replace(/-/g, "").slice(0, 12);
  let passwordHash = null;
  if (body.password) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body.password));
    passwordHash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  const expires = body.expires_in_hours ? now() + body.expires_in_hours * 3600 * 1e3 : null;
  await env2.DB.prepare("INSERT INTO shares (id, project_id, password, expires_at, created_at) VALUES (?,?,?,?,?)").bind(id, projectId, passwordHash, expires, now()).run();
  return ok({ share_id: id, url: `/share/${id}` });
}
__name(handleCreateShare, "handleCreateShare");
async function handleViewShare(env2, shareId, req) {
  const row = await env2.DB.prepare("SELECT * FROM shares WHERE id=?").bind(shareId).first();
  if (!row)
    return err("\u5206\u4EAB\u4E0D\u5B58\u5728", 404);
  const r = row;
  if (r.expires_at && r.expires_at < now())
    return err("\u5206\u4EAB\u5DF2\u8FC7\u671F", 410);
  if (r.password) {
    const url = new URL(req.url);
    const pwd = url.searchParams.get("pwd") ?? "";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pwd));
    const hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    if (hash !== r.password)
      return err("\u5BC6\u7801\u9519\u8BEF", 401);
  }
  return handleExportHtml(env2, r.project_id);
}
__name(handleViewShare, "handleViewShare");

// src/static.ts
var ASSETS_B64 = {
  "/index.html": {
    mime: "text/html; charset=utf-8",
    b64: "PCFkb2N0eXBlIGh0bWw+CjxodG1sIGxhbmc9InpoLUNOIj4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9InV0Zi04IiAvPgo8bWV0YSBuYW1lPSJ2aWV3cG9ydCIgY29udGVudD0id2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEiIC8+Cjx0aXRsZT5QbGVvbiDCtyBQUFQg5pm66IO95Yib5L2c5bmz5Y+wPC90aXRsZT4KPGxpbmsgcmVsPSJwcmVjb25uZWN0IiBocmVmPSJodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tIj4KPGxpbmsgcmVsPSJwcmVjb25uZWN0IiBocmVmPSJodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tIiBjcm9zc29yaWdpbj4KPGxpbmsgaHJlZj0iaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1JbnN0cnVtZW50K1NlcmlmOml0YWxAMDsxJmZhbWlseT1JbnRlcjp3Z2h0QDIwMDszMDA7NDAwOzUwMDs2MDAmZmFtaWx5PUpldEJyYWlucytNb25vOndnaHRAMzAwOzQwMDs1MDAmZmFtaWx5PU5vdG8rU2VyaWYrU0M6d2dodEAyMDA7MzAwOzQwMDs1MDAmZmFtaWx5PU5vdG8rU2FucytTQzp3Z2h0QDIwMDszMDA7NDAwOzUwMCZkaXNwbGF5PXN3YXAiIHJlbD0ic3R5bGVzaGVldCI+CjxsaW5rIHJlbD0ic3R5bGVzaGVldCIgaHJlZj0iL3N0eWxlLmNzcyIgLz4KPC9oZWFkPgo8Ym9keT4KCjwhLS0gPT09PT09PT09PT09IOinhuWbviAx77ya6aG555uu5bqT6aaW6aG1ID09PT09PT09PT09PSAtLT4KPGRpdiBjbGFzcz0idmlldyB2aWV3LWxpYnJhcnkgaXMtYWN0aXZlIiBpZD0idmlldy1saWJyYXJ5Ij4KICA8aGVhZGVyIGNsYXNzPSJ0b3BiYXIiPgogICAgPGRpdiBjbGFzcz0idG9wYmFyLWxlZnQiPgogICAgICA8ZGl2IGNsYXNzPSJicmFuZCIgaWQ9ImxpYkJyYW5kIj4KICAgICAgICA8c3BhbiBjbGFzcz0iYnJhbmQtbWFyayI+UGxlb248c3BhbiBjbGFzcz0iZG90Ij4uPC9zcGFuPjwvc3Bhbj4KICAgICAgICA8c3BhbiBjbGFzcz0iYnJhbmQtdGFnIj5TdHVkaW8gwrcgTGlicmFyeTwvc3Bhbj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9InNlYXJjaC1ib3giPgogICAgICA8c3BhbiBjbGFzcz0iaWNvbiI+4oyVPC9zcGFuPgogICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImxpYlNlYXJjaCIgcGxhY2Vob2xkZXI9IuaQnOe0oumhueebruOAgeagh+mimOOAgee0oOadkOKApiIgLz4KICAgICAgPHNwYW4gY2xhc3M9ImtiZCI+4oyYSzwvc3Bhbj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0idG9wLWFjdGlvbnMiPgogICAgICA8YnV0dG9uIGNsYXNzPSJpY29uLWJ0biIgaWQ9ImxpYkltcG9ydCI+4qSTIEltcG9ydDwvYnV0dG9uPgogICAgICA8YnV0dG9uIGNsYXNzPSJuZXctZGVjayIgaWQ9ImxpYk5ld0RlY2siPisgTmV3IERlY2s8L2J1dHRvbj4KICAgIDwvZGl2PgogIDwvaGVhZGVyPgoKICA8bWFpbiBjbGFzcz0ibGlicmFyeSI+CiAgICA8ZGl2IGNsYXNzPSJsaWItaGVhZCI+CiAgICAgIDxkaXYgY2xhc3M9ImxpYi1oZWFkLWxlZnQiPgogICAgICAgIDxkaXYgY2xhc3M9ImV5ZWJyb3ciPllvdXIgTGlicmFyeSDCtyDliJvkvZzlupM8L2Rpdj4KICAgICAgICA8aDE+5omA5pyJIDxlbT7mnKrlrozmiJA8L2VtPiDnmoTmg7Pms5XvvIw8YnI+6YO95Zyo6L+Z6YeM57un57ut44CCPC9oMT4KICAgICAgICA8ZGl2IGNsYXNzPSJzdWIiPuS4jeWBmuS4gOmUrueUn+aIkO+8jOWBmuS4gOi1t+aDs+a4healmuOAgjwvZGl2PgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ibGliLWhlYWQtcmlnaHQiIGlkPSJsaWJGaWx0ZXJzIj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJmaWx0ZXItcGlsbCBpcy1hY3RpdmUiIGRhdGEtZmlsdGVyPSJhbGwiPkFsbCA8c3BhbiBjbGFzcz0iY291bnQiIGRhdGEtY291bnQ9ImFsbCI+MDwvc3Bhbj48L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJmaWx0ZXItcGlsbCIgZGF0YS1maWx0ZXI9ImluLXByb2dyZXNzIj5JbiBQcm9ncmVzcyA8c3BhbiBjbGFzcz0iY291bnQiIGRhdGEtY291bnQ9ImluLXByb2dyZXNzIj4wPC9zcGFuPjwvYnV0dG9uPgogICAgICAgIDxidXR0b24gY2xhc3M9ImZpbHRlci1waWxsIiBkYXRhLWZpbHRlcj0iZHJhZnQiPkRyYWZ0IDxzcGFuIGNsYXNzPSJjb3VudCIgZGF0YS1jb3VudD0iZHJhZnQiPjA8L3NwYW4+PC9idXR0b24+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iZmlsdGVyLXBpbGwiIGRhdGEtZmlsdGVyPSJkb25lIj5Eb25lIDxzcGFuIGNsYXNzPSJjb3VudCIgZGF0YS1jb3VudD0iZG9uZSI+MDwvc3Bhbj48L2J1dHRvbj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KCiAgICA8ZGl2IGNsYXNzPSJkZWNrLWdyaWQiIGlkPSJkZWNrR3JpZCI+CiAgICAgIDwhLS0g6aG555uu5Y2h54mH55SxIEpTIOa4suafkyAtLT4KICAgIDwvZGl2PgogIDwvbWFpbj4KPC9kaXY+Cgo8IS0tID09PT09PT09PT09PSDop4blm74gMu+8mumhueebruWGheW3peS9nOWMuiA9PT09PT09PT09PT0gLS0+CjxkaXYgY2xhc3M9InZpZXcgdmlldy1wcm9qZWN0IiBpZD0idmlldy1wcm9qZWN0Ij4KICA8aGVhZGVyIGNsYXNzPSJ0b3BiYXIgcHJvai10b3BiYXIiPgogICAgPGRpdiBjbGFzcz0idGItbGVmdCI+CiAgICAgIDxidXR0b24gY2xhc3M9ImJhY2stbGliIiBpZD0iYmFja1RvTGliIj48c3BhbiBjbGFzcz0iYXJyIj7ihpA8L3NwYW4+IExpYnJhcnk8L2J1dHRvbj4KICAgICAgPGRpdiBjbGFzcz0icHJvai1jcnVtYiI+CiAgICAgICAgPHNwYW4gY2xhc3M9Im5hbWUiIGlkPSJwcm9qQ3J1bWJOYW1lIj7igJQ8L3NwYW4+CiAgICAgICAgPHNwYW4gY2xhc3M9Im1ldGEiIGlkPSJwcm9qQ3J1bWJNZXRhIj5EUkFGVDwvc3Bhbj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9InRiLWNlbnRlciI+CiAgICAgIDxkaXYgY2xhc3M9ImNhcHMtc3RlcHBlciIgaWQ9ImNhcHNTdGVwcGVyIj48L2Rpdj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0idGItcmlnaHQiPgogICAgICA8YnV0dG9uIGNsYXNzPSJ0Yi1idG4iIGlkPSJwcm9qU2hhcmUiIHRpdGxlPSLliIbkuqsiPuKGlzwvYnV0dG9uPgogICAgICA8YnV0dG9uIGNsYXNzPSJ0Yi1idG4gdGItZXhwb3J0IiBpZD0icHJvakV4cG9ydCI+4qSTIEV4cG9ydDwvYnV0dG9uPgogICAgPC9kaXY+CiAgPC9oZWFkZXI+CiAgPGRpdiBjbGFzcz0icHJvamVjdC1sYXlvdXQiPgogICAgPGFzaWRlIGNsYXNzPSJzb3VyY2VzLXBhbmVsIiBpZD0ic291cmNlc1BhbmVsIj48L2FzaWRlPgogICAgPG1haW4gY2xhc3M9IndvcmtzcGFjZSIgaWQ9IndvcmtzcGFjZSI+PC9tYWluPgogICAgPGFzaWRlIGNsYXNzPSJub3Rlcy1wYW5lbCIgaWQ9Im5vdGVzUGFuZWwiPjwvYXNpZGU+CiAgPC9kaXY+CjwvZGl2PgoKPGRpdiBjbGFzcz0idmVyc2lvbi1tYXJrIj52MS4wIMK3IDxzcGFuIGNsYXNzPSJnb2xkIj5QbGVvbiBTdHVkaW88L3NwYW4+PC9kaXY+CjxkaXYgaWQ9InRvYXN0IiBjbGFzcz0idG9hc3QiPjwvZGl2Pgo8ZGl2IGlkPSJsb2FkaW5nIiBjbGFzcz0ibG9hZGluZyBoaWRkZW4iPjxkaXYgY2xhc3M9InNwaW5uZXIiPjwvZGl2PjxwIGlkPSJsb2FkaW5nVGV4dCI+5aSE55CG5LitLi4uPC9wPjwvZGl2PgoKPHNjcmlwdCBzcmM9Ii9hcHAuanMiPjwvc2NyaXB0Pgo8L2JvZHk+CjwvaHRtbD4K"
  },
  "/style.css": {
    mime: "text/css; charset=utf-8",
    b64: "LyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgIFBQVCDmmbrog73liJvkvZzlubPlj7AgwrcgUXVpZXQgTHV4dXJ5ICsgTm90ZWJvb2sgQXJjaGl0ZWN0dXJlCiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwoKLyogPT09PT09PT09PT09IOiuvuiuoeS7pOeJjCA9PT09PT09PT09PT0gKi8KOnJvb3QgewogIC0tdm9pZDogIzBBMEEwQzsKICAtLW9ic2lkaWFuOiAjMTExMTE0OwogIC0tc2xhdGU6ICMxNjE2MUE7CiAgLS1zbGF0ZS0yOiAjMUMxQzIxOwogIC0tc2xhdGUtMzogIzIyMjIyQTsKICAtLWVkZ2U6ICMyNTI1MkM7CiAgLS1lZGdlLTI6ICMyRjJGMzc7CiAgLS1lZGdlLTM6ICMzQTNBNDQ7CgogIC0taXZvcnk6ICNFREVERUU7CiAgLS1jaGFsazogI0M5QzlDRTsKICAtLWFzaDogIzhBOEE5MzsKICAtLXNtb2tlOiAjNUE1QTYyOwoKICAtLWNoYW1wYWduZTogI0M0QTY2MTsKICAtLWNoYW1wYWduZS1zb2Z0OiAjOEE3NDQwOwogIC0tY2hhbXBhZ25lLWdsb3c6IHJnYmEoMTk2LDE2Niw5NywuMTUpOwogIC0tZW1iZXI6ICNENDYwNEE7CiAgLS1zYWdlOiAjN0JBMDg5OwoKICAtLXNlcmlmOiAiSW5zdHJ1bWVudCBTZXJpZiIsICJOb3RvIFNlcmlmIFNDIiwgR2VvcmdpYSwgc2VyaWY7CiAgLS1zZXJpZi1jbjogIk5vdG8gU2VyaWYgU0MiLCAiU29uZ3RpIFNDIiwgc2VyaWY7CiAgLS1zYW5zOiAiSW50ZXIiLCAiTm90byBTYW5zIFNDIiwgLWFwcGxlLXN5c3RlbSwgc2Fucy1zZXJpZjsKICAtLW1vbm86ICJKZXRCcmFpbnMgTW9ubyIsICJTRiBNb25vIiwgTWVubG8sIG1vbm9zcGFjZTsKCiAgLS1tYXg6IDEyMDBweDsKfQoKKiB7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IG1hcmdpbjogMDsgcGFkZGluZzogMDsgfQpodG1sLCBib2R5IHsgaGVpZ2h0OiAxMDAlOyB9CmJvZHkgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1zYW5zKTsKICBiYWNrZ3JvdW5kOiB2YXIoLS12b2lkKTsKICBjb2xvcjogdmFyKC0taXZvcnkpOwogIGZvbnQtc2l6ZTogMTRweDsKICBsaW5lLWhlaWdodDogMS41NTsKICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDsKICBmb250LWZlYXR1cmUtc2V0dGluZ3M6ICJzczAxIiwgImN2MTEiOwogIGJhY2tncm91bmQtaW1hZ2U6CiAgICByYWRpYWwtZ3JhZGllbnQoZWxsaXBzZSAxNDAwcHggNzAwcHggYXQgNTAlIC0xMCUsIHJnYmEoMTk2LDE2Niw5NywuMDUpLCB0cmFuc3BhcmVudCA2MCUpLAogICAgcmFkaWFsLWdyYWRpZW50KGVsbGlwc2UgODAwcHggNDAwcHggYXQgMTAwJSAxMDAlLCByZ2JhKDIxMiw5Niw3NCwuMDIpLCB0cmFuc3BhcmVudCA2MCUpOwp9CgovKiDop4blm77liIfmjaIgKi8KLnZpZXcgeyBkaXNwbGF5OiBub25lOyBtaW4taGVpZ2h0OiAxMDB2aDsgfQoudmlldy5pcy1hY3RpdmUgeyBkaXNwbGF5OiBibG9jazsgfQoKLyogPT09PT09PT09PT09IOmAmueUqOmhtuagjyA9PT09PT09PT09PT0gKi8KLnRvcGJhciB7CiAgZGlzcGxheTogZ3JpZDsKICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IGF1dG8gMWZyIGF1dG87CiAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICBwYWRkaW5nOiAxOHB4IDM2cHg7CiAgYmFja2dyb3VuZDogcmdiYSgxMCwxMCwxMiwuODUpOwogIGJhY2tkcm9wLWZpbHRlcjogYmx1cigyMHB4KTsKICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogYmx1cigyMHB4KTsKICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tZWRnZSk7CiAgcG9zaXRpb246IHN0aWNreTsKICB0b3A6IDA7CiAgei1pbmRleDogNTA7CiAgZ2FwOiAyNHB4Owp9Ci50b3BiYXItbGVmdCB7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMThweDsgfQoKLmJhY2stbGliIHsKICBkaXNwbGF5OiBub25lOwogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsKICBmb250LXNpemU6IDExcHg7CiAgY29sb3I6IHZhcigtLWFzaCk7CiAgYmFja2dyb3VuZDogbm9uZTsKICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1lZGdlLTIpOwogIHBhZGRpbmc6IDdweCAxNHB4OwogIGJvcmRlci1yYWRpdXM6IDRweDsKICBjdXJzb3I6IHBvaW50ZXI7CiAgbGV0dGVyLXNwYWNpbmc6IDAuMDZlbTsKICB0cmFuc2l0aW9uOiBhbGwgLjJzOwogIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgZ2FwOiA4cHg7Cn0KLnZpZXctcHJvamVjdCAuYmFjay1saWIgeyBkaXNwbGF5OiBpbmxpbmUtZmxleDsgfQouYmFjay1saWI6aG92ZXIgeyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgYm9yZGVyLWNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyBiYWNrZ3JvdW5kOiB2YXIoLS1jaGFtcGFnbmUtZ2xvdyk7IH0KLmJhY2stbGliIC5hcnJvdyB7IGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZik7IGZvbnQtc2l6ZTogMTRweDsgfQoKLmJyYW5kIHsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGJhc2VsaW5lOyBnYXA6IDEycHg7IGN1cnNvcjogcG9pbnRlcjsgfQouYnJhbmQtbWFyayB7CiAgZm9udC1mYW1pbHk6IHZhcigtLXNlcmlmKTsKICBmb250LXNpemU6IDI2cHg7CiAgZm9udC13ZWlnaHQ6IDQwMDsKICBsZXR0ZXItc3BhY2luZzogLTAuMDJlbTsKICBjb2xvcjogdmFyKC0taXZvcnkpOwp9Ci5icmFuZC1tYXJrIC5kb3QgeyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgbWFyZ2luOiAwIDJweDsgfQouYnJhbmQtdGFnIHsKICBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7CiAgZm9udC1zaXplOiAxMHB4OwogIGxldHRlci1zcGFjaW5nOiAwLjE4ZW07CiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsKICBjb2xvcjogdmFyKC0tYXNoKTsKICBwYWRkaW5nLWxlZnQ6IDEycHg7CiAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCB2YXIoLS1lZGdlKTsKfQoKLnNlYXJjaC1ib3ggewogIGRpc3BsYXk6IGZsZXg7CiAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICBnYXA6IDEwcHg7CiAgYmFja2dyb3VuZDogdmFyKC0tc2xhdGUpOwogIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UtMik7CiAgYm9yZGVyLXJhZGl1czogNnB4OwogIHBhZGRpbmc6IDhweCAxNHB4OwogIG1heC13aWR0aDogMzYwcHg7CiAgbWFyZ2luOiAwIGF1dG87CiAgdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9yIC4yczsKfQouc2VhcmNoLWJveDpmb2N1cy13aXRoaW4geyBib3JkZXItY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IH0KLnNlYXJjaC1ib3ggLmljb24geyBjb2xvcjogdmFyKC0tc21va2UpOyBmb250LWZhbWlseTogdmFyKC0tc2VyaWYpOyBmb250LXNpemU6IDE0cHg7IH0KLnNlYXJjaC1ib3ggaW5wdXQgewogIGZsZXg6IDE7IGJhY2tncm91bmQ6IG5vbmU7IGJvcmRlcjogbm9uZTsgY29sb3I6IHZhcigtLWl2b3J5KTsKICBmb250LWZhbWlseTogdmFyKC0tc2Fucyk7IGZvbnQtc2l6ZTogMTNweDsgb3V0bGluZTogbm9uZTsKfQouc2VhcmNoLWJveCBpbnB1dDo6cGxhY2Vob2xkZXIgeyBjb2xvcjogdmFyKC0tc21va2UpOyB9Ci5zZWFyY2gtYm94IC5rYmQgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMHB4OyBjb2xvcjogdmFyKC0tc21va2UpOwogIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UtMik7IHBhZGRpbmc6IDJweCA2cHg7IGJvcmRlci1yYWRpdXM6IDNweDsKfQoKLnByb2otY3J1bWIgewogIGRpc3BsYXk6IG5vbmU7CiAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICBnYXA6IDEwcHg7CiAgZm9udC1mYW1pbHk6IHZhcigtLXNlcmlmKTsKICBmb250LXNpemU6IDE0cHg7CiAgY29sb3I6IHZhcigtLWl2b3J5KTsKICBmbGV4OiAxOwogIG1pbi13aWR0aDogMDsKICBvdmVyZmxvdzogaGlkZGVuOwp9Ci52aWV3LXByb2plY3QgLnByb2otY3J1bWIgeyBkaXNwbGF5OiBmbGV4OyB9Ci5wcm9qLWNydW1iIC5zZXAgeyBjb2xvcjogdmFyKC0tc21va2UpOyBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTJweDsgfQoucHJvai1jcnVtYiAubmFtZSB7IGxldHRlci1zcGFjaW5nOiAtMC4wMWVtOyBtYXgtd2lkdGg6IDEwMCU7IG92ZXJmbG93OiBoaWRkZW47IHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOyB3aGl0ZS1zcGFjZTogbm93cmFwOyBtaW4td2lkdGg6IDA7IH0KLnByb2otY3J1bWIgLm1ldGEgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiA5cHg7IGNvbG9yOiB2YXIoLS1hc2gpOwogIGxldHRlci1zcGFjaW5nOiAwLjFlbTsgcGFkZGluZzogMnB4IDdweDsKICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1lZGdlLTIpOyBib3JkZXItcmFkaXVzOiAzcHg7CiAgZmxleC1zaHJpbms6IDA7Cn0KLnByb2otY3J1bWIgLm1ldGEuZG9uZSB7IGNvbG9yOiB2YXIoLS1zYWdlKTsgYm9yZGVyLWNvbG9yOiByZ2JhKDEyMywxNjAsMTM3LC4zKTsgfQoucHJvai1jcnVtYiAubWV0YS5pbi1wcm9ncmVzcyB7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyBib3JkZXItY29sb3I6IHJnYmEoMTk2LDE2Niw5NywuMyk7IH0KCi50b3AtYWN0aW9ucyB7IGRpc3BsYXk6IGZsZXg7IGdhcDogMTJweDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgfQoubmV3LWRlY2sgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1zYW5zKTsgZm9udC1zaXplOiAxMnB4OyBmb250LXdlaWdodDogNTAwOwogIGNvbG9yOiB2YXIoLS12b2lkKTsgYmFja2dyb3VuZDogdmFyKC0taXZvcnkpOwogIHBhZGRpbmc6IDlweCAxOHB4OyBib3JkZXItcmFkaXVzOiA0cHg7CiAgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTsgdHJhbnNpdGlvbjogYWxsIC4yczsKICBib3JkZXI6IG5vbmU7IGN1cnNvcjogcG9pbnRlcjsKfQoubmV3LWRlY2s6aG92ZXIgeyBiYWNrZ3JvdW5kOiB2YXIoLS1jaGFtcGFnbmUpOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7IH0KLmljb24tYnRuIHsKICBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTFweDsgY29sb3I6IHZhcigtLWFzaCk7CiAgYmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZS0yKTsKICBwYWRkaW5nOiA4cHggMTJweDsgYm9yZGVyLXJhZGl1czogNHB4OwogIGN1cnNvcjogcG9pbnRlcjsgdHJhbnNpdGlvbjogYWxsIC4yczsKfQouaWNvbi1idG46aG92ZXIgeyBjb2xvcjogdmFyKC0taXZvcnkpOyBib3JkZXItY29sb3I6IHZhcigtLWVkZ2UtMyk7IGJhY2tncm91bmQ6IHZhcigtLXNsYXRlKTsgfQoKLyogPT09PT09PT09PT09IOW6k+mmlumhteS4u+S9kyA9PT09PT09PT09PT0gKi8KLmxpYnJhcnkgeyBtYXgtd2lkdGg6IHZhcigtLW1heCk7IG1hcmdpbjogMCBhdXRvOyBwYWRkaW5nOiA1NnB4IDM2cHggMTIwcHg7IH0KCi5saWItaGVhZCB7CiAgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGZsZXgtZW5kOyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgbWFyZ2luLWJvdHRvbTogNDhweDsgcGFkZGluZy1ib3R0b206IDI0cHg7CiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOwp9Ci5saWItaGVhZC1sZWZ0IC5leWVicm93IHsKICBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTBweDsKICBsZXR0ZXItc3BhY2luZzogMC4yMmVtOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOwogIGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyBtYXJnaW4tYm90dG9tOiAxNHB4Owp9Ci5saWItaGVhZC1sZWZ0IGgxIHsKICBmb250LWZhbWlseTogdmFyKC0tc2VyaWYpOyBmb250LXdlaWdodDogNDAwOwogIGZvbnQtc2l6ZTogNDhweDsgbGluZS1oZWlnaHQ6IDEuMDU7CiAgbGV0dGVyLXNwYWNpbmc6IC0wLjAyNWVtOyBjb2xvcjogdmFyKC0taXZvcnkpOyBtYXJnaW4tYm90dG9tOiA4cHg7Cn0KLmxpYi1oZWFkLWxlZnQgaDEgZW0geyBmb250LXN0eWxlOiBpdGFsaWM7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyB9Ci5saWItaGVhZC1sZWZ0IC5zdWIgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZi1jbik7IGZvbnQtc2l6ZTogMTVweDsKICBjb2xvcjogdmFyKC0tYXNoKTsgZm9udC13ZWlnaHQ6IDMwMDsgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTsKfQoubGliLWhlYWQtcmlnaHQgeyBkaXNwbGF5OiBmbGV4OyBnYXA6IDhweDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgfQouZmlsdGVyLXBpbGwgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMHB4OyBjb2xvcjogdmFyKC0tYXNoKTsKICBiYWNrZ3JvdW5kOiB2YXIoLS1zbGF0ZSk7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UtMik7CiAgcGFkZGluZzogN3B4IDEycHg7IGJvcmRlci1yYWRpdXM6IDIwcHg7CiAgY3Vyc29yOiBwb2ludGVyOyBsZXR0ZXItc3BhY2luZzogMC4wOGVtOyB0cmFuc2l0aW9uOiBhbGwgLjJzOwp9Ci5maWx0ZXItcGlsbDpob3ZlciB7IGNvbG9yOiB2YXIoLS1pdm9yeSk7IGJvcmRlci1jb2xvcjogdmFyKC0tZWRnZS0zKTsgfQouZmlsdGVyLXBpbGwuaXMtYWN0aXZlIHsKICBjb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgYm9yZGVyLWNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOwogIGJhY2tncm91bmQ6IHZhcigtLWNoYW1wYWduZS1nbG93KTsKfQouZmlsdGVyLXBpbGwgLmNvdW50IHsgbWFyZ2luLWxlZnQ6IDZweDsgY29sb3I6IHZhcigtLXNtb2tlKTsgfQouZmlsdGVyLXBpbGwuaXMtYWN0aXZlIC5jb3VudCB7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUtc29mdCk7IH0KCi8qIOmhueebrue9keagvCAqLwouZGVjay1ncmlkIHsgZGlzcGxheTogZ3JpZDsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywgMWZyKTsgZ2FwOiAyNHB4OyB9CkBtZWRpYSAobWF4LXdpZHRoOiA5NjBweCkgeyAuZGVjay1ncmlkIHsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgMWZyKTsgfSB9CkBtZWRpYSAobWF4LXdpZHRoOiA2NDBweCkgeyAuZGVjay1ncmlkIHsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7IH0gfQoKLmRlY2stY2FyZCB7CiAgYmFja2dyb3VuZDogdmFyKC0tc2xhdGUpOyBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1lZGdlKTsKICBib3JkZXItcmFkaXVzOiA4cHg7IG92ZXJmbG93OiBoaWRkZW47IGN1cnNvcjogcG9pbnRlcjsKICB0cmFuc2l0aW9uOiBhbGwgLjNzOyBkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyBwb3NpdGlvbjogcmVsYXRpdmU7Cn0KLmRlY2stY2FyZDpob3ZlciB7CiAgYm9yZGVyLWNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTNweCk7CiAgYm94LXNoYWRvdzogMCAxNnB4IDQ4cHggcmdiYSgwLDAsMCwuNCksIDAgMCAwIDFweCB2YXIoLS1jaGFtcGFnbmUtZ2xvdyk7Cn0KLmRlY2stY2FyZDpob3ZlciAudGh1bWItY2FudmFzLW1pbmkgLnNsaWRlLXRpdGxlIHsgY29sb3I6IHZhcigtLWNoYW1wYWduZS1zb2Z0KTsgfQoKLyog5Y2h54mH57yp55Wl5Zu+77ya5qih5ouf5LiA5byg5bm754Gv54mHICovCi50aHVtYi13cmFwIHsKICBhc3BlY3QtcmF0aW86IDE2LzEwOwogIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNGQUZBRkEgMCUsICNGMkYwRUEgMTAwJSk7CiAgcG9zaXRpb246IHJlbGF0aXZlOyBvdmVyZmxvdzogaGlkZGVuOwogIHBhZGRpbmc6IDE4cHggMjJweDsgY29sb3I6ICMwQTBBMEM7Cn0KLnRodW1iLXdyYXAgLnNsaWRlLWV5ZWJyb3cgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiA3cHg7CiAgbGV0dGVyLXNwYWNpbmc6IDAuMThlbTsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsKICBjb2xvcjogdmFyKC0tY2hhbXBhZ25lLXNvZnQpOyBtYXJnaW4tYm90dG9tOiA2cHg7Cn0KLnRodW1iLXdyYXAgLnNsaWRlLXRpdGxlIHsKICBmb250LWZhbWlseTogdmFyKC0tc2VyaWYpOyBmb250LXNpemU6IDEzcHg7IGZvbnQtd2VpZ2h0OiA0MDA7CiAgbGluZS1oZWlnaHQ6IDEuMjsgY29sb3I6ICMwQTBBMEM7CiAgbGV0dGVyLXNwYWNpbmc6IC0wLjAxZW07IHRyYW5zaXRpb246IGNvbG9yIC4zczsgbWF4LXdpZHRoOiA5MCU7Cn0KLnRodW1iLXdyYXAgLnNsaWRlLXRpdGxlIGVtIHsgZm9udC1zdHlsZTogaXRhbGljOyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lLXNvZnQpOyB9Ci50aHVtYi13cmFwIC5zbGlkZS1rcGkgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZik7IGZvbnQtc2l6ZTogMjhweDsgZm9udC13ZWlnaHQ6IDQwMDsKICBjb2xvcjogIzBBMEEwQzsgbGluZS1oZWlnaHQ6IDE7IGxldHRlci1zcGFjaW5nOiAtMC4wM2VtOyBtYXJnaW4tdG9wOiAxMHB4Owp9Ci50aHVtYi13cmFwIC5zbGlkZS1rcGktbGFiZWwgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiA2cHg7CiAgbGV0dGVyLXNwYWNpbmc6IDAuMTVlbTsgY29sb3I6ICM1QTVBNjI7IG1hcmdpbi10b3A6IDNweDsKfQoudGh1bWItd3JhcCAuc2xpZGUtc291cmNlIHsKICBwb3NpdGlvbjogYWJzb2x1dGU7IGJvdHRvbTogMTJweDsgbGVmdDogMjJweDsgcmlnaHQ6IDIycHg7CiAgcGFkZGluZy10b3A6IDZweDsgYm9yZGVyLXRvcDogMXB4IHNvbGlkICNEOEQ0Qzg7CiAgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDZweDsgY29sb3I6ICM4QThBOTM7CiAgbGV0dGVyLXNwYWNpbmc6IDAuMWVtOyBkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47Cn0KLnRodW1iLXdyYXAgLmNvcm5lci1tYXJrIHsKICBwb3NpdGlvbjogYWJzb2x1dGU7IGJvdHRvbTogMTJweDsgcmlnaHQ6IDIycHg7CiAgZm9udC1mYW1pbHk6IHZhcigtLXNlcmlmKTsgZm9udC1zdHlsZTogaXRhbGljOwogIGZvbnQtc2l6ZTogOHB4OyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lLXNvZnQpOwp9Ci50aHVtYi13cmFwLmVtcHR5LXRodW1iIHsKICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMUMxQzIxIDAlLCAjMTYxNjFBIDEwMCUpOwogIGNvbG9yOiB2YXIoLS1zbW9rZSk7CiAgZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7Cn0KLnRodW1iLXdyYXAuZW1wdHktdGh1bWIgLnBsYWNlaG9sZGVyLW1hcmsgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZik7IGZvbnQtc2l6ZTogMzJweDsgY29sb3I6IHZhcigtLWVkZ2UtMyk7IGZvbnQtc3R5bGU6IGl0YWxpYzsKfQoudGh1bWItd3JhcC5lbXB0eS10aHVtYiAucGxhY2Vob2xkZXItdGV4dCB7CiAgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDhweDsgY29sb3I6IHZhcigtLXNtb2tlKTsKICBsZXR0ZXItc3BhY2luZzogMC4yZW07IG1hcmdpbi10b3A6IDhweDsKfQoKLyog5Y2h54mH54q25oCB6KeS5qCHICovCi5jYXJkLWJhZGdlIHsKICBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMTJweDsgcmlnaHQ6IDEycHg7CiAgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDlweDsKICBwYWRkaW5nOiAzcHggOHB4OyBib3JkZXItcmFkaXVzOiAzcHg7CiAgbGV0dGVyLXNwYWNpbmc6IDAuMDhlbTsgei1pbmRleDogMjsKfQouY2FyZC1iYWRnZS5kcmFmdCB7IGNvbG9yOiB2YXIoLS1hc2gpOyBiYWNrZ3JvdW5kOiByZ2JhKDI2LDI2LDMxLC44KTsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZS0yKTsgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDhweCk7IH0KLmNhcmQtYmFkZ2UuaW4tcHJvZ3Jlc3MgeyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgYmFja2dyb3VuZDogcmdiYSgxOTYsMTY2LDk3LC4xNSk7IGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTk2LDE2Niw5NywuMyk7IGJhY2tkcm9wLWZpbHRlcjogYmx1cig4cHgpOyB9Ci5jYXJkLWJhZGdlLmRvbmUgeyBjb2xvcjogdmFyKC0tc2FnZSk7IGJhY2tncm91bmQ6IHJnYmEoMTIzLDE2MCwxMzcsLjEyKTsgYm9yZGVyOiAxcHggc29saWQgcmdiYSgxMjMsMTYwLDEzNywuMyk7IGJhY2tkcm9wLWZpbHRlcjogYmx1cig4cHgpOyB9CgovKiDljaHniYfkv6Hmga/ljLogKi8KLmNhcmQtYm9keSB7IHBhZGRpbmc6IDE4cHggMjBweCAyMHB4OyBmbGV4OiAxOyBkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9Ci5jYXJkLXRpdGxlIHsKICBmb250LWZhbWlseTogdmFyKC0tc2VyaWYtY24pOyBmb250LXNpemU6IDE1cHg7IGZvbnQtd2VpZ2h0OiA1MDA7CiAgY29sb3I6IHZhcigtLWl2b3J5KTsgbGluZS1oZWlnaHQ6IDEuNDsgbWFyZ2luLWJvdHRvbTogOHB4OyBsZXR0ZXItc3BhY2luZzogMC4wMWVtOwp9Ci5jYXJkLWRlc2MgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1zYW5zKTsgZm9udC1zaXplOiAxMnB4OyBjb2xvcjogdmFyKC0tYXNoKTsKICBsaW5lLWhlaWdodDogMS41OyBtYXJnaW4tYm90dG9tOiAxNHB4OwogIGRpc3BsYXk6IC13ZWJraXQtYm94OyAtd2Via2l0LWxpbmUtY2xhbXA6IDI7IC13ZWJraXQtYm94LW9yaWVudDogdmVydGljYWw7CiAgb3ZlcmZsb3c6IGhpZGRlbjsgZm9udC13ZWlnaHQ6IDMwMDsKfQouY2FyZC1wcm9ncmVzcyB7IG1hcmdpbi1ib3R0b206IDE0cHg7IH0KLnByb2dyZXNzLWJhciB7IGhlaWdodDogMnB4OyBiYWNrZ3JvdW5kOiB2YXIoLS1lZGdlLTIpOyBib3JkZXItcmFkaXVzOiAxcHg7IG92ZXJmbG93OiBoaWRkZW47IG1hcmdpbi1ib3R0b206IDZweDsgfQoucHJvZ3Jlc3MtZmlsbCB7IGhlaWdodDogMTAwJTsgYmFja2dyb3VuZDogdmFyKC0tY2hhbXBhZ25lKTsgYm94LXNoYWRvdzogMCAwIDhweCB2YXIoLS1jaGFtcGFnbmUtZ2xvdyk7IHRyYW5zaXRpb246IHdpZHRoIC40czsgfQoucHJvZ3Jlc3MtZmlsbC5kb25lIHsgYmFja2dyb3VuZDogdmFyKC0tc2FnZSk7IGJveC1zaGFkb3c6IDAgMCA4cHggcmdiYSgxMjMsMTYwLDEzNywuMyk7IH0KLnByb2dyZXNzLW1ldGEgewogIGRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogOXB4OwogIGNvbG9yOiB2YXIoLS1zbW9rZSk7IGxldHRlci1zcGFjaW5nOiAwLjA4ZW07Cn0KLnByb2dyZXNzLW1ldGEgLnN0ZXAgeyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgfQoucHJvZ3Jlc3MtbWV0YSAuc3RlcC5kb25lIHsgY29sb3I6IHZhcigtLXNhZ2UpOyB9Ci5jYXJkLWZvb3QgewogIGRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsKICBtYXJnaW4tdG9wOiBhdXRvOyBwYWRkaW5nLXRvcDogMTJweDsgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOwogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMHB4OyBjb2xvcjogdmFyKC0tc21va2UpOyBsZXR0ZXItc3BhY2luZzogMC4wNmVtOwp9Ci5jYXJkLWZvb3QgLnVwZGF0ZWQgeyBjb2xvcjogdmFyKC0tYXNoKTsgfQoKLyog5paw5bu65Y2h54mHICovCi5uZXctY2FyZCB7CiAgYm9yZGVyOiAxcHggZGFzaGVkIHZhcigtLWVkZ2UtMik7IGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogIGJvcmRlci1yYWRpdXM6IDhweDsgbWluLWhlaWdodDogMTAwJTsKICBkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICBjdXJzb3I6IHBvaW50ZXI7IHRyYW5zaXRpb246IGFsbCAuM3M7IHBhZGRpbmc6IDYwcHggMjBweDsKfQoubmV3LWNhcmQ6aG92ZXIgeyBib3JkZXItY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IGJhY2tncm91bmQ6IHZhcigtLWNoYW1wYWduZS1nbG93KTsgfQoubmV3LWNhcmQgLnBsdXMgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZik7IGZvbnQtc2l6ZTogNDhweDsgY29sb3I6IHZhcigtLWNoYW1wYWduZSk7CiAgbGluZS1oZWlnaHQ6IDE7IG1hcmdpbi1ib3R0b206IDE0cHg7IGZvbnQtd2VpZ2h0OiAzMDA7Cn0KLm5ldy1jYXJkIC5sYWJlbCB7CiAgZm9udC1mYW1pbHk6IHZhcigtLXNlcmlmLWNuKTsgZm9udC1zaXplOiAxNHB4OyBjb2xvcjogdmFyKC0tY2hhbGspOwogIG1hcmdpbi1ib3R0b206IDRweDsgbGV0dGVyLXNwYWNpbmc6IDAuMDRlbTsKfQoubmV3LWNhcmQgLmhpbnQgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMHB4OyBjb2xvcjogdmFyKC0tc21va2UpOyBsZXR0ZXItc3BhY2luZzogMC4xZW07Cn0KCi8qIOW6k+epuueKtuaAgSAqLwoubGliLWVtcHR5IHsKICBncmlkLWNvbHVtbjogMSAvIC0xOwogIHRleHQtYWxpZ246IGNlbnRlcjsgcGFkZGluZzogODBweCAyMHB4OwogIGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZi1jbik7IGNvbG9yOiB2YXIoLS1hc2gpOwp9Ci5saWItZW1wdHkgLm1hcmsgeyBmb250LWZhbWlseTogdmFyKC0tc2VyaWYpOyBmb250LXNpemU6IDU2cHg7IGNvbG9yOiB2YXIoLS1lZGdlLTMpOyBmb250LXN0eWxlOiBpdGFsaWM7IG1hcmdpbi1ib3R0b206IDIwcHg7IH0KLmxpYi1lbXB0eSBoMiB7IGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZik7IGZvbnQtc2l6ZTogMjhweDsgY29sb3I6IHZhcigtLWl2b3J5KTsgZm9udC13ZWlnaHQ6IDQwMDsgbWFyZ2luLWJvdHRvbTogMTBweDsgfQoubGliLWVtcHR5IHAgeyBmb250LXNpemU6IDE0cHg7IGNvbG9yOiB2YXIoLS1hc2gpOyB9CgovKiA9PT09PT09PT09PT0g6aG555uu5YaF5bel5L2c5Yy6ID09PT09PT09PT09PSAqLwoucHJvamVjdC1sYXlvdXQgewogIGRpc3BsYXk6IGdyaWQ7CiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAyNjBweCAxZnIgMzAwcHg7CiAgbWluLWhlaWdodDogY2FsYygxMDB2aCAtIDU2cHgpOwp9Ci8qIOaKmOWPoOaAgSAqLwoucHJvamVjdC1sYXlvdXQuc291cmNlcy1jb2xsYXBzZWQgeyBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDQ4cHggMWZyIDMwMHB4OyB9Ci5wcm9qZWN0LWxheW91dC5ub3Rlcy1jb2xsYXBzZWQgeyBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDI2MHB4IDFmciA0OHB4OyB9Ci5wcm9qZWN0LWxheW91dC5zb3VyY2VzLWNvbGxhcHNlZC5ub3Rlcy1jb2xsYXBzZWQgeyBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDQ4cHggMWZyIDQ4cHg7IH0KCi8qIOatpemqpOWvvOiIqiAqLwouc3RlcHBlciB7CiAgcGFkZGluZzogMzJweCAwOyBwb3NpdGlvbjogc3RpY2t5OyB0b3A6IDY1cHg7CiAgaGVpZ2h0OiBjYWxjKDEwMHZoIC0gNjVweCk7IG92ZXJmbG93LXk6IGF1dG87CiAgYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgdmFyKC0tZWRnZSk7IGJhY2tncm91bmQ6IHJnYmEoMTcsMTcsMjAsLjUpOwp9Ci5zdGVwcGVyLWhlYWQgewogIHBhZGRpbmc6IDAgMjhweCAyMHB4OyBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTBweDsKICBsZXR0ZXItc3BhY2luZzogMC4yZW07IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IGNvbG9yOiB2YXIoLS1zbW9rZSk7CiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOyBtYXJnaW4tYm90dG9tOiAxNHB4OwogIGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKfQouc3RlcHBlci1oZWFkIC5jb3VudCB7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyBmb250LXdlaWdodDogNTAwOyB9Cgouc3RlcCB7CiAgZGlzcGxheTogZ3JpZDsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiA0MHB4IDFmcjsKICBwYWRkaW5nOiAxMXB4IDI4cHg7IGN1cnNvcjogcG9pbnRlcjsgcG9zaXRpb246IHJlbGF0aXZlOwogIHRyYW5zaXRpb246IGJhY2tncm91bmQgLjJzOwp9Ci5zdGVwOmhvdmVyIHsgYmFja2dyb3VuZDogdmFyKC0tc2xhdGUpOyB9Ci5zdGVwLmlzLWFjdGl2ZSB7IGJhY2tncm91bmQ6IHZhcigtLXNsYXRlKTsgfQouc3RlcC5pcy1hY3RpdmU6OmJlZm9yZSB7CiAgY29udGVudDogIiI7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogMDsgdG9wOiAxMXB4OyBib3R0b206IDExcHg7CiAgd2lkdGg6IDJweDsgYmFja2dyb3VuZDogdmFyKC0tY2hhbXBhZ25lKTsgYm94LXNoYWRvdzogMCAwIDEycHggdmFyKC0tY2hhbXBhZ25lLWdsb3cpOwp9Ci5zdGVwLW5vIHsgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDEycHg7IGNvbG9yOiB2YXIoLS1zbW9rZSk7IGxpbmUtaGVpZ2h0OiAxLjQ7IH0KLnN0ZXAuaXMtYWN0aXZlIC5zdGVwLW5vIHsgY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IH0KLnN0ZXAuaXMtZG9uZSAuc3RlcC1ubyB7IGNvbG9yOiB2YXIoLS1zYWdlKTsgfQouc3RlcC5pcy1kb25lIC5zdGVwLW5vOjphZnRlciB7IGNvbnRlbnQ6ICIg4pyTIjsgfQouc3RlcC1ib2R5IHsgcGFkZGluZy10b3A6IDA7IH0KLnN0ZXAtdGl0bGUgeyBmb250LWZhbWlseTogdmFyKC0tc2Fucyk7IGZvbnQtc2l6ZTogMTNweDsgZm9udC13ZWlnaHQ6IDQwMDsgY29sb3I6IHZhcigtLWNoYWxrKTsgfQouc3RlcC5pcy1hY3RpdmUgLnN0ZXAtdGl0bGUgeyBjb2xvcjogdmFyKC0taXZvcnkpOyBmb250LXdlaWdodDogNTAwOyB9Ci5zdGVwLXN1YiB7IGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMHB4OyBjb2xvcjogdmFyKC0tc21va2UpOyBtYXJnaW4tdG9wOiAycHg7IGxldHRlci1zcGFjaW5nOiAwLjA4ZW07IH0KCi8qIOW3peS9nOWMuiAqLwoud29ya3NwYWNlIHsgcGFkZGluZzogMzJweCA0MHB4IDgwcHg7IG1pbi13aWR0aDogMDsgfQpAbWVkaWEgKG1heC13aWR0aDogOTAwcHgpIHsgLndvcmtzcGFjZSB7IHBhZGRpbmc6IDI0cHggMjRweCA2MHB4OyB9IH0KCi8qID09PT09PT09PT09PSDpobnnm67pobbmoI/kuInmrrXnvZHmoLwgPT09PT09PT09PT09ICovCi5wcm9qLXRvcGJhciB7CiAgaGVpZ2h0OiA1NnB4OwogIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjYwcHggMWZyIDMwMHB4OwogIHBhZGRpbmc6IDAgMjBweDsKICBnYXA6IDA7Cn0KLnRiLWxlZnQgeyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDEycHg7IG1pbi13aWR0aDogMDsgb3ZlcmZsb3c6IGhpZGRlbjsgfQoudGItY2VudGVyIHsgZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IG1pbi13aWR0aDogMDsgb3ZlcmZsb3cteDogYXV0bzsgb3ZlcmZsb3cteTogaGlkZGVuOyBzY3JvbGxiYXItd2lkdGg6IG5vbmU7IH0KLnRiLWNlbnRlcjo6LXdlYmtpdC1zY3JvbGxiYXIgeyBkaXNwbGF5OiBub25lOyB9Ci50Yi1yaWdodCB7IGRpc3BsYXk6IGZsZXg7IGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7IGdhcDogOHB4OyBhbGlnbi1pdGVtczogY2VudGVyOyBmbGV4LXNocmluazogMDsgfQoKLnZpZXctcHJvamVjdCAuYmFjay1saWIgeyBkaXNwbGF5OiBpbmxpbmUtZmxleDsgfQouYmFjay1saWIgLmFyciB7IGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZik7IGZvbnQtc2l6ZTogMTNweDsgbGluZS1oZWlnaHQ6IDE7IH0KCi8qIOmhtuagj+Wbvuagh+aMiemSriAqLwoudGItYnRuIHsKICB3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OwogIGRpc3BsYXk6IGlubGluZS1mbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICBiYWNrZ3JvdW5kOiB2YXIoLS1zbGF0ZSk7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOwogIGJvcmRlci1yYWRpdXM6IDZweDsgY29sb3I6IHZhcigtLWFzaCk7IGN1cnNvcjogcG9pbnRlcjsKICB0cmFuc2l0aW9uOiBhbGwgLjJzOyBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTRweDsKfQoudGItYnRuOmhvdmVyIHsgY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IGJvcmRlci1jb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgYmFja2dyb3VuZDogdmFyKC0tY2hhbXBhZ25lLWdsb3cpOyB9Ci50Yi1leHBvcnQgewogIHdpZHRoOiBhdXRvOyBwYWRkaW5nOiAwIDEycHg7IGdhcDogN3B4OwogIGZvbnQtZmFtaWx5OiB2YXIoLS1zYW5zKTsgZm9udC1zaXplOiAxMXB4OyBjb2xvcjogdmFyKC0taXZvcnkpOyBmb250LXdlaWdodDogNTAwOwp9Ci50Yi1leHBvcnQ6aG92ZXIgeyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgfQoKLyogPT09PT09PT09PT09IOiDtuWbiiBzdGVwcGVyID09PT09PT09PT09PSAqLwouY2Fwcy1zdGVwcGVyIHsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA0cHg7IGZsZXgtc2hyaW5rOiAwOyB9Ci5jYXBzIHsKICBkaXNwbGF5OiBpbmxpbmUtZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA3cHg7CiAgcGFkZGluZzogNXB4IDExcHggNXB4IDlweDsKICBib3JkZXItcmFkaXVzOiA5OTlweDsKICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1lZGdlKTsKICBiYWNrZ3JvdW5kOiB2YXIoLS1zbGF0ZSk7CiAgY3Vyc29yOiBwb2ludGVyOyB0cmFuc2l0aW9uOiBhbGwgLjJzOyBsaW5lLWhlaWdodDogMTsKICB3aGl0ZS1zcGFjZTogbm93cmFwOwogIGZsZXgtc2hyaW5rOiAwOwp9Ci5jYXBzIC5jLW4geyBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTBweDsgY29sb3I6IHZhcigtLXNtb2tlKTsgZm9udC13ZWlnaHQ6IDUwMDsgfQouY2FwcyAuYy1sIHsgZm9udC1mYW1pbHk6IHZhcigtLXNhbnMpOyBmb250LXNpemU6IDExcHg7IGNvbG9yOiB2YXIoLS1hc2gpOyBsZXR0ZXItc3BhY2luZzogMC4wMmVtOyB9Ci5jYXBzOmhvdmVyIHsgYm9yZGVyLWNvbG9yOiB2YXIoLS1lZGdlLTMpOyB9Ci5jYXBzLmlzLWRvbmUgewogIGJvcmRlci1jb2xvcjogcmdiYSgxMjMsMTYwLDEzNywuMjgpOwogIGJhY2tncm91bmQ6IHJnYmEoMTIzLDE2MCwxMzcsLjA2KTsKfQouY2Fwcy5pcy1kb25lIC5jLW4geyBjb2xvcjogdmFyKC0tc2FnZSk7IH0KLmNhcHMuaXMtZG9uZSAuYy1sIHsgY29sb3I6IHZhcigtLWNoYWxrKTsgfQouY2Fwcy5pcy1kb25lIC5jLW46OmFmdGVyIHsgY29udGVudDogIiDinJMiOyB9Ci5jYXBzLmlzLW9wdGlvbmFsIHsgYm9yZGVyLXN0eWxlOiBkYXNoZWQ7IGJvcmRlci1jb2xvcjogdmFyKC0tZWRnZS0yKTsgfQouY2Fwcy5pcy1vcHRpb25hbCAuYy1sOjpiZWZvcmUgeyBjb250ZW50OiAi5Y+v6YCJIMK3ICI7IGNvbG9yOiB2YXIoLS1zbW9rZSk7IGZvbnQtc2l6ZTogOS41cHg7IH0KLmNhcHMuaXMtYWN0aXZlIHsKICBib3JkZXItY29sb3I6IHZhcigtLWNoYW1wYWduZSk7CiAgYmFja2dyb3VuZDogdmFyKC0tY2hhbXBhZ25lLWdsb3cpOwogIGJveC1zaGFkb3c6IDAgMCAxNnB4IHZhcigtLWNoYW1wYWduZS1nbG93KSwgaW5zZXQgMCAwIDEwcHggcmdiYSgxOTYsMTY2LDk3LC4xKTsKfQouY2Fwcy5pcy1hY3RpdmUgLmMtbiB7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyB9Ci5jYXBzLmlzLWFjdGl2ZSAuYy1sIHsgY29sb3I6IHZhcigtLWl2b3J5KTsgZm9udC13ZWlnaHQ6IDUwMDsgfQouY2Fwcy1zZXAgeyB3aWR0aDogMTBweDsgaGVpZ2h0OiAxcHg7IGJhY2tncm91bmQ6IHZhcigtLWVkZ2UtMik7IGZsZXgtc2hyaW5rOiAwOyB9CgovKiA9PT09PT09PT09PT0g5bem5qCPIFNvdXJjZXMgPT09PT09PT09PT09ICovCi5zb3VyY2VzLXBhbmVsIHsKICBiYWNrZ3JvdW5kOiByZ2JhKDE3LDE3LDIwLC41NSk7CiAgYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgdmFyKC0tZWRnZSk7CiAgZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICBtaW4taGVpZ2h0OiAwOyBtaW4td2lkdGg6IDA7CiAgcG9zaXRpb246IHN0aWNreTsgdG9wOiA1NnB4OwogIGhlaWdodDogY2FsYygxMDB2aCAtIDU2cHgpOwogIG92ZXJmbG93OiBoaWRkZW47Cn0KLnNyYy1oZWFkIHsKICBwYWRkaW5nOiAxNnB4IDE4cHggMTJweDsKICBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOyBnYXA6IDhweDsKfQouc3JjLXRpdGxlIHsKICBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTBweDsKICBsZXR0ZXItc3BhY2luZzogMC4yMmVtOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyBjb2xvcjogdmFyKC0tYXNoKTsKfQouc3JjLXRpdGxlIGIgeyBjb2xvcjogdmFyKC0taXZvcnkpOyBmb250LXdlaWdodDogNTAwOyB9Ci5zcmMtYWRkLWJ0biB7CiAgd2lkdGg6IDI2cHg7IGhlaWdodDogMjZweDsgYm9yZGVyLXJhZGl1czogNXB4OwogIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UtMik7IGJhY2tncm91bmQ6IHZhcigtLXNsYXRlKTsKICBjb2xvcjogdmFyKC0tY2hhbGspOyBjdXJzb3I6IHBvaW50ZXI7CiAgZGlzcGxheTogaW5saW5lLWZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOwogIHRyYW5zaXRpb246IGFsbCAuMnM7IGZvbnQtc2l6ZTogMTVweDsgbGluZS1oZWlnaHQ6IDE7IGZsZXgtc2hyaW5rOiAwOwp9Ci5zcmMtYWRkLWJ0bjpob3ZlciB7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyBib3JkZXItY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IGJhY2tncm91bmQ6IHZhcigtLWNoYW1wYWduZS1nbG93KTsgfQouc3JjLWxpc3QgeyBkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyBnYXA6IDdweDsgcGFkZGluZzogMTJweCAxNHB4OyBvdmVyZmxvdy15OiBhdXRvOyBmbGV4OiAxOyB9Ci5zcmMtY2FyZCB7CiAgYmFja2dyb3VuZDogdmFyKC0tc2xhdGUpOyBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1lZGdlKTsKICBib3JkZXItcmFkaXVzOiA3cHg7IHBhZGRpbmc6IDlweCAxMXB4OwogIGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0OyBnYXA6IDlweDsKICB0cmFuc2l0aW9uOiBhbGwgLjE4czsgY3Vyc29yOiBwb2ludGVyOwp9Ci5zcmMtY2FyZDpob3ZlciB7IGJvcmRlci1jb2xvcjogdmFyKC0tZWRnZS0zKTsgYmFja2dyb3VuZDogdmFyKC0tc2xhdGUtMik7IH0KLnNyYy1jYXJkLmlzLW5ldyB7IGJvcmRlci1jb2xvcjogcmdiYSgyMTIsOTYsNzQsLjM1KTsgYmFja2dyb3VuZDogcmdiYSgyMTIsOTYsNzQsLjA0KTsgfQouc3JjLW5hbWUgewogIGZvbnQtc2l6ZTogMTJweDsgY29sb3I6IHZhcigtLWl2b3J5KTsgbGluZS1oZWlnaHQ6IDEuMzU7CiAgd2hpdGUtc3BhY2U6IG5vd3JhcDsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7Cn0KLnNyYy1zdGF0dXMgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiA5cHg7IGNvbG9yOiB2YXIoLS1zbW9rZSk7CiAgbWFyZ2luLXRvcDogMnB4OyBsZXR0ZXItc3BhY2luZzogMC4wNGVtOwogIGRpc3BsYXk6IGlubGluZS1mbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDZweDsKfQouc3JjLXN0YXR1czo6YmVmb3JlIHsKICBjb250ZW50OiAiIjsgd2lkdGg6IDZweDsgaGVpZ2h0OiA2cHg7IGJvcmRlci1yYWRpdXM6IDUwJTsKICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGZsZXgtc2hyaW5rOiAwOyBiYWNrZ3JvdW5kOiB2YXIoLS1zbW9rZSk7Cn0KLnNyYy1zdGF0dXMub2s6OmJlZm9yZSB7IGJhY2tncm91bmQ6IHZhcigtLXNhZ2UpOyBib3gtc2hhZG93OiAwIDAgNnB4IHJnYmEoMTIzLDE2MCwxMzcsLjUpOyB9Ci5zcmMtc3RhdHVzLnBhcnNpbmc6OmJlZm9yZSB7IGJhY2tncm91bmQ6IHZhcigtLWVtYmVyKTsgYW5pbWF0aW9uOiBzcmMtcHVsc2UgMS42cyBlYXNlLWluLW91dCBpbmZpbml0ZTsgfQouc3JjLXN0YXR1cy5wZW5kaW5nOjpiZWZvcmUgeyBiYWNrZ3JvdW5kOiB2YXIoLS1zbW9rZSk7IH0KQGtleWZyYW1lcyBzcmMtcHVsc2UgewogIDAlLDEwMCUgeyBvcGFjaXR5OiAxOyBib3gtc2hhZG93OiAwIDAgNnB4IHJnYmEoMjEyLDk2LDc0LC4zKTsgfQogIDUwJSB7IG9wYWNpdHk6IC40OyBib3gtc2hhZG93OiAwIDAgMnB4IHJnYmEoMjEyLDk2LDc0LC4zKTsgfQp9CgovKiDlvoXph43nrpfmj5DnpLrmnaEgKi8KLnJlY2FsYy1iYXIgewogIG1hcmdpbjogMTJweCAxNHB4IDA7CiAgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA5cHg7CiAgcGFkZGluZzogOXB4IDExcHg7CiAgYmFja2dyb3VuZDogcmdiYSgyMTIsOTYsNzQsLjE1KTsKICBib3JkZXItbGVmdDogMnB4IHNvbGlkIHZhcigtLWVtYmVyKTsKICBib3JkZXItcmFkaXVzOiA2cHg7CiAgcG9zaXRpb246IHJlbGF0aXZlOyBvdmVyZmxvdzogaGlkZGVuOwp9Ci5yZWNhbGMtYmFyOjpiZWZvcmUgewogIGNvbnRlbnQ6ICIiOyBwb3NpdGlvbjogYWJzb2x1dGU7IGluc2V0OiAwOwogIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudChlbGxpcHNlIDEyMHB4IDYwcHggYXQgMCUgNTAlLCByZ2JhKDIxMiw5Niw3NCwuMTgpLCB0cmFuc3BhcmVudCA3MCUpOwogIHBvaW50ZXItZXZlbnRzOiBub25lOwp9Ci5yZWNhbGMtdHh0IHsgZmxleDogMTsgZm9udC1zaXplOiAxMS41cHg7IGNvbG9yOiB2YXIoLS1pdm9yeSk7IGxpbmUtaGVpZ2h0OiAxLjM7IHBvc2l0aW9uOiByZWxhdGl2ZTsgfQoucmVjYWxjLXR4dCBiIHsgY29sb3I6IHZhcigtLWVtYmVyKTsgZm9udC13ZWlnaHQ6IDYwMDsgfQoucmVjYWxjLWJ0biB7CiAgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDkuNXB4OyBsZXR0ZXItc3BhY2luZzogMC4wNmVtOwogIGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyBiYWNrZ3JvdW5kOiByZ2JhKDE5NiwxNjYsOTcsLjE0KTsKICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jaGFtcGFnbmUtc29mdCk7CiAgcGFkZGluZzogNXB4IDlweDsgYm9yZGVyLXJhZGl1czogNHB4OyBjdXJzb3I6IHBvaW50ZXI7CiAgd2hpdGUtc3BhY2U6IG5vd3JhcDsgdHJhbnNpdGlvbjogYWxsIC4xOHM7IHBvc2l0aW9uOiByZWxhdGl2ZTsKfQoucmVjYWxjLWJ0bjpob3ZlciB7IGJhY2tncm91bmQ6IHZhcigtLWNoYW1wYWduZSk7IGNvbG9yOiB2YXIoLS12b2lkKTsgYm9yZGVyLWNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyB9CgovKiBDb250ZXh0IFBhY2sg5oqY5Y+g5Yy6ICovCi5jdHgtcGFjayB7CiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOwogIHBhZGRpbmc6IDE0cHg7IGJhY2tncm91bmQ6IHJnYmEoMTAsMTAsMTIsLjQpOwp9Ci5jdHgtcGFjay1oZWFkIHsKICBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgY3Vyc29yOiBwb2ludGVyOyBtYXJnaW4tYm90dG9tOiAxMHB4OyBnYXA6IDhweDsKfQouY3R4LXBhY2staGVhZCAuY3AtdGl0bGUgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMHB4OwogIGxldHRlci1zcGFjaW5nOiAwLjE4ZW07IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOwogIGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogOHB4Owp9Ci5jdHgtcGFjay1oZWFkIC5jcC10aXRsZSAuY3AtZG90IHsKICB3aWR0aDogNXB4OyBoZWlnaHQ6IDVweDsgYm9yZGVyLXJhZGl1czogNTAlOwogIGJhY2tncm91bmQ6IHZhcigtLWNoYW1wYWduZSk7IGJveC1zaGFkb3c6IDAgMCA4cHggdmFyKC0tY2hhbXBhZ25lKTsKfQouY3R4LXBhY2staGVhZCAuY3AtY2hldiB7IGNvbG9yOiB2YXIoLS1hc2gpOyBmb250LXNpemU6IDEwcHg7IHRyYW5zaXRpb246IHRyYW5zZm9ybSAuMnM7IH0KLmN0eC1wYWNrLmlzLW9wZW4gLmNwLWNoZXYgeyB0cmFuc2Zvcm06IHJvdGF0ZSgxODBkZWcpOyB9Ci5jdHgtcGFjay1ib2R5IHsgZGlzcGxheTogbm9uZTsgfQouY3R4LXBhY2suaXMtb3BlbiAuY3R4LXBhY2stYm9keSB7IGRpc3BsYXk6IGJsb2NrOyBhbmltYXRpb246IGZhZGUtdXAgLjRzIGVhc2UgYm90aDsgfQoKLyogPT09PT09PT09PT09IOWPs+agjyBOb3RlcyA9PT09PT09PT09PT0gKi8KLm5vdGVzLXBhbmVsIHsKICBiYWNrZ3JvdW5kOiByZ2JhKDE3LDE3LDIwLC41NSk7CiAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCB2YXIoLS1lZGdlKTsKICBkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogIG1pbi1oZWlnaHQ6IDA7IG1pbi13aWR0aDogMDsKICBwb3NpdGlvbjogc3RpY2t5OyB0b3A6IDU2cHg7CiAgaGVpZ2h0OiBjYWxjKDEwMHZoIC0gNTZweCk7CiAgb3ZlcmZsb3c6IGhpZGRlbjsKfQoubm90ZXMtaGVhZCB7CiAgcGFkZGluZzogMTZweCAxOHB4IDEycHg7CiAgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOwogIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1lZGdlKTsgZ2FwOiA4cHg7Cn0KLm5vdGVzLXRpdGxlIHsKICBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTBweDsKICBsZXR0ZXItc3BhY2luZzogMC4yMmVtOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyBjb2xvcjogdmFyKC0tYXNoKTsKfQoubm90ZXMtdGl0bGUgYiB7IGNvbG9yOiB2YXIoLS1pdm9yeSk7IGZvbnQtd2VpZ2h0OiA1MDA7IH0KLm5vdGVzLXNjcm9sbCB7IGZsZXg6IDE7IG92ZXJmbG93LXk6IGF1dG87IHBhZGRpbmc6IDE0cHggMTZweCA4cHg7IH0KLm5vdGUtZ3JvdXAgeyBtYXJnaW4tYm90dG9tOiAxOHB4OyB9Ci5ub3RlLWdyb3VwLWhlYWQgewogIGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogOXB4OwogIG1hcmdpbi1ib3R0b206IDlweDsgcGFkZGluZy1ib3R0b206IDdweDsKICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tZWRnZSk7Cn0KLm5vdGUtZ3JvdXAtaGVhZCAubmctc3RlcCB7CiAgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDlweDsgbGV0dGVyLXNwYWNpbmc6IDAuMWVtOwogIGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyBiYWNrZ3JvdW5kOiB2YXIoLS1jaGFtcGFnbmUtZ2xvdyk7CiAgcGFkZGluZzogMnB4IDZweDsgYm9yZGVyLXJhZGl1czogM3B4Owp9Ci5ub3RlLWdyb3VwLWhlYWQgLm5nLXN0ZXAuaXMtZG9uZSB7IGNvbG9yOiB2YXIoLS1zYWdlKTsgYmFja2dyb3VuZDogcmdiYSgxMjMsMTYwLDEzNywuMTUpOyB9Ci5ub3RlLWdyb3VwLWhlYWQgLm5nLXRpdGxlIHsKICBmb250LWZhbWlseTogdmFyKC0tc2Fucyk7IGZvbnQtc2l6ZTogMTFweDsgY29sb3I6IHZhcigtLWl2b3J5KTsKICBmb250LXdlaWdodDogNTAwOyBsZXR0ZXItc3BhY2luZzogMC4wMmVtOwp9Ci5ub3RlLWdyb3VwLWhlYWQgLm5nLWNvdW50IHsKICBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogOXB4OyBjb2xvcjogdmFyKC0tc21va2UpOyBtYXJnaW4tbGVmdDogYXV0bzsKfQoubm90ZS1jYXJkIHsKICBiYWNrZ3JvdW5kOiB2YXIoLS1zbGF0ZSk7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOwogIGJvcmRlci1yYWRpdXM6IDdweDsgcGFkZGluZzogMTFweCAxMnB4OyBtYXJnaW4tYm90dG9tOiA3cHg7CiAgY3Vyc29yOiBwb2ludGVyOyB0cmFuc2l0aW9uOiBhbGwgLjE4czsgcG9zaXRpb246IHJlbGF0aXZlOwp9Ci5ub3RlLWNhcmQ6aG92ZXIgeyBib3JkZXItY29sb3I6IHZhcigtLWVkZ2UtMyk7IGJhY2tncm91bmQ6IHZhcigtLXNsYXRlLTIpOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTJweCk7IH0KCi8qIENpdGF0aW9uIOe7n+iuoeadoSAqLwouY2l0ZS1iYXIgewogIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1lZGdlKTsKICBwYWRkaW5nOiAxMnB4IDE2cHg7CiAgYmFja2dyb3VuZDogcmdiYSgxMCwxMCwxMiwuNSk7CiAgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA5cHg7Cn0KLmNpdGUtYmFyIC5jYi1tYWluIHsgZm9udC1zaXplOiAxMXB4OyBjb2xvcjogdmFyKC0taXZvcnkpOyB9Ci5jaXRlLWJhciAuY2ItbWFpbiBiIHsgY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IGZvbnQtd2VpZ2h0OiA1MDA7IH0KLmNpdGUtYmFyIC5jYi1zdWIgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiA5cHg7IGNvbG9yOiB2YXIoLS1zbW9rZSk7CiAgbGV0dGVyLXNwYWNpbmc6IDAuMDZlbTsgbWFyZ2luLXRvcDogMXB4Owp9CgovKiA9PT09PT09PT09PT0g5oqY5Y+g5oCBID09PT09PT09PT09PSAqLwouc291cmNlcy1wYW5lbC5pcy1jb2xsYXBzZWQgLnNyYy1oZWFkLAouc291cmNlcy1wYW5lbC5pcy1jb2xsYXBzZWQgLnNyYy1saXN0LAouc291cmNlcy1wYW5lbC5pcy1jb2xsYXBzZWQgLmN0eC1wYWNrLAouc291cmNlcy1wYW5lbC5pcy1jb2xsYXBzZWQgLnJlY2FsYy1iYXIgeyBkaXNwbGF5OiBub25lOyB9Ci5ub3Rlcy1wYW5lbC5pcy1jb2xsYXBzZWQgLm5vdGVzLWhlYWQsCi5ub3Rlcy1wYW5lbC5pcy1jb2xsYXBzZWQgLm5vdGVzLXNjcm9sbCwKLm5vdGVzLXBhbmVsLmlzLWNvbGxhcHNlZCAuY2l0ZS1iYXIgeyBkaXNwbGF5OiBub25lOyB9CgovKiA9PT09PT09PT09PT0g6Z2i5p2/77yI5q2l6aqk5Li75Yy677yJID09PT09PT09PT09PSAqLwoucGFuZWwgeyBtYXgtd2lkdGg6IDkyMHB4OyB9Ci5wYW5lbC1leWVicm93IHsKICBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDE2cHg7IG1hcmdpbi1ib3R0b206IDIycHg7Cn0KLnBhbmVsLWV5ZWJyb3cgLm51bSB7IGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMXB4OyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgbGV0dGVyLXNwYWNpbmc6IDAuMWVtOyB9Ci5wYW5lbC1leWVicm93IC5sYWJlbCB7CiAgZm9udC1mYW1pbHk6IHZhcigtLXNhbnMpOyBmb250LXNpemU6IDEwcHg7CiAgbGV0dGVyLXNwYWNpbmc6IDAuMjJlbTsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgY29sb3I6IHZhcigtLWFzaCk7Cn0KLnBhbmVsLWV5ZWJyb3cgLnJ1bGUgeyBmbGV4OiAxOyBoZWlnaHQ6IDFweDsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIHJpZ2h0LCB2YXIoLS1lZGdlLTIpLCB0cmFuc3BhcmVudCk7IH0KLnBhbmVsLXRpdGxlIHsKICBmb250LWZhbWlseTogdmFyKC0tc2VyaWYpOyBmb250LXdlaWdodDogNDAwOwogIGZvbnQtc2l6ZTogNTJweDsgbGluZS1oZWlnaHQ6IDEuMDU7IGxldHRlci1zcGFjaW5nOiAtMC4wMjVlbTsKICBjb2xvcjogdmFyKC0taXZvcnkpOyBtYXJnaW4tYm90dG9tOiAxNnB4Owp9Ci5wYW5lbC10aXRsZSBlbSB7IGZvbnQtc3R5bGU6IGl0YWxpYzsgY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IGZvbnQtd2VpZ2h0OiA0MDA7IH0KLnBhbmVsLWRlc2MsIC5wYW5lbC1sZWRlIHsKICBmb250LWZhbWlseTogdmFyKC0tc2VyaWYtY24pOyBmb250LXNpemU6IDE2cHg7IGxpbmUtaGVpZ2h0OiAxLjc7CiAgY29sb3I6IHZhcigtLWNoYWxrKTsgbWF4LXdpZHRoOiA2MjBweDsgbWFyZ2luLWJvdHRvbTogNDhweDsgZm9udC13ZWlnaHQ6IDMwMDsKfQoKLyogPT09PT09PT09PT09IOWNoeeJhyA9PT09PT09PT09PT0gKi8KLmNhcmQgewogIGJhY2tncm91bmQ6IHZhcigtLXNsYXRlKTsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZSk7CiAgYm9yZGVyLXJhZGl1czogOHB4OyBwYWRkaW5nOiAyOHB4IDMycHg7IG1hcmdpbi1ib3R0b206IDIwcHg7Cn0KLmNhcmQgaDMgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZi1jbik7IGZvbnQtc2l6ZTogMTZweDsgZm9udC13ZWlnaHQ6IDUwMDsKICBjb2xvcjogdmFyKC0taXZvcnkpOyBtYXJnaW4tYm90dG9tOiAxOHB4OyBsZXR0ZXItc3BhY2luZzogMC4wMWVtOwogIGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMTBweDsKfQouY2FyZCBoMyAubnVtLXRhZyB7CiAgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDEwcHg7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOwogIGxldHRlci1zcGFjaW5nOiAwLjFlbTsgZm9udC13ZWlnaHQ6IDQwMDsKfQoKLyogPT09PT09PT09PT09IOihqOWNlSA9PT09PT09PT09PT0gKi8KLmZpZWxkIHsgbWFyZ2luLWJvdHRvbTogMThweDsgfQouZmllbGQgbGFiZWwgewogIGRpc3BsYXk6IGJsb2NrOyBmb250LWZhbWlseTogdmFyKC0tc2Fucyk7IGZvbnQtc2l6ZTogMTJweDsKICBmb250LXdlaWdodDogNTAwOyBtYXJnaW4tYm90dG9tOiA4cHg7IGNvbG9yOiB2YXIoLS1jaGFsayk7CiAgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTsKfQouZmllbGQgLmhpbnQgeyBmb250LXdlaWdodDogMzAwOyBjb2xvcjogdmFyKC0tc21va2UpOyBmb250LXNpemU6IDExcHg7IG1hcmdpbi1sZWZ0OiA2cHg7IH0KaW5wdXRbdHlwZT0idGV4dCJdLCB0ZXh0YXJlYSwgc2VsZWN0IHsKICB3aWR0aDogMTAwJTsgcGFkZGluZzogMTJweCAxNHB4OwogIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UtMik7IGJvcmRlci1yYWRpdXM6IDRweDsKICBmb250LWZhbWlseTogdmFyKC0tc2Fucyk7IGZvbnQtc2l6ZTogMTRweDsKICBiYWNrZ3JvdW5kOiB2YXIoLS1vYnNpZGlhbik7IGNvbG9yOiB2YXIoLS1pdm9yeSk7CiAgdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9yIC4ycywgYmFja2dyb3VuZCAuMnM7Cn0KaW5wdXRbdHlwZT0idGV4dCJdOjpwbGFjZWhvbGRlciwgdGV4dGFyZWE6OnBsYWNlaG9sZGVyIHsgY29sb3I6IHZhcigtLXNtb2tlKTsgfQppbnB1dFt0eXBlPSJ0ZXh0Il06Zm9jdXMsIHRleHRhcmVhOmZvY3VzLCBzZWxlY3Q6Zm9jdXMgewogIG91dGxpbmU6IG5vbmU7IGJvcmRlci1jb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsKICBiYWNrZ3JvdW5kOiB2YXIoLS1zbGF0ZS0zKTsKfQp0ZXh0YXJlYSB7IG1pbi1oZWlnaHQ6IDk2cHg7IHJlc2l6ZTogdmVydGljYWw7IGxpbmUtaGVpZ2h0OiAxLjY7IGZvbnQtZmFtaWx5OiB2YXIoLS1zYW5zKTsgfQppbnB1dFt0eXBlPSJmaWxlIl0gewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMnB4OyBjb2xvcjogdmFyKC0tYXNoKTsKICBwYWRkaW5nOiAxMHB4OyBib3JkZXI6IDFweCBkYXNoZWQgdmFyKC0tZWRnZS0yKTsgYm9yZGVyLXJhZGl1czogNHB4OwogIGJhY2tncm91bmQ6IHZhcigtLW9ic2lkaWFuKTsgd2lkdGg6IDEwMCU7IGN1cnNvcjogcG9pbnRlcjsKfQoKLyogPT09PT09PT09PT09IOaMiemSriA9PT09PT09PT09PT0gKi8KLmJ0biB7CiAgcGFkZGluZzogMTFweCAyMnB4OyBib3JkZXItcmFkaXVzOiA0cHg7CiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZS0yKTsgYmFja2dyb3VuZDogdmFyKC0tc2xhdGUpOwogIGNvbG9yOiB2YXIoLS1jaGFsayk7IGZvbnQtc2l6ZTogMTNweDsgY3Vyc29yOiBwb2ludGVyOwogIGZvbnQtZmFtaWx5OiB2YXIoLS1zYW5zKTsgdHJhbnNpdGlvbjogYWxsIC4yczsKICBsZXR0ZXItc3BhY2luZzogMC4wMmVtOyBmb250LXdlaWdodDogNDAwOwp9Ci5idG46aG92ZXIgeyBib3JkZXItY29sb3I6IHZhcigtLWVkZ2UtMyk7IGNvbG9yOiB2YXIoLS1pdm9yeSk7IGJhY2tncm91bmQ6IHZhcigtLXNsYXRlLTIpOyB9Ci5idG4tcHJpbWFyeSB7CiAgYmFja2dyb3VuZDogdmFyKC0taXZvcnkpOyBjb2xvcjogdmFyKC0tdm9pZCk7IGJvcmRlci1jb2xvcjogdmFyKC0taXZvcnkpOwogIGZvbnQtd2VpZ2h0OiA1MDA7Cn0KLmJ0bi1wcmltYXJ5OmhvdmVyIHsgYmFja2dyb3VuZDogdmFyKC0tY2hhbXBhZ25lKTsgYm9yZGVyLWNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyBjb2xvcjogdmFyKC0tdm9pZCk7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXB4KTsgYm94LXNoYWRvdzogMCA4cHggMjRweCB2YXIoLS1jaGFtcGFnbmUtZ2xvdyk7IH0KLmJ0bi1hY2NlbnQgewogIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsKICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jaGFtcGFnbmUpOwp9Ci5idG4tYWNjZW50OmhvdmVyIHsgYmFja2dyb3VuZDogdmFyKC0tY2hhbXBhZ25lLWdsb3cpOyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgfQouYnRuLWdob3N0IHsKICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDsgYm9yZGVyLWNvbG9yOiB0cmFuc3BhcmVudDsgY29sb3I6IHZhcigtLWFzaCk7Cn0KLmJ0bi1naG9zdDpob3ZlciB7IGNvbG9yOiB2YXIoLS1pdm9yeSk7IGJhY2tncm91bmQ6IHZhcigtLXNsYXRlKTsgfQouYnRuLXNtIHsgcGFkZGluZzogNnB4IDEycHg7IGZvbnQtc2l6ZTogMTFweDsgfQouYnRuOmRpc2FibGVkIHsgb3BhY2l0eTogLjQ7IGN1cnNvcjogbm90LWFsbG93ZWQ7IH0KLmJ0bi1yb3cgeyBkaXNwbGF5OiBmbGV4OyBnYXA6IDEycHg7IG1hcmdpbi10b3A6IDIwcHg7IGZsZXgtd3JhcDogd3JhcDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgfQoKLyogPT09PT09PT09PT09IOagh+etviA9PT09PT09PT09PT0gKi8KLnRhZyB7CiAgZGlzcGxheTogaW5saW5lLWJsb2NrOyBwYWRkaW5nOiAycHggOHB4OyBib3JkZXItcmFkaXVzOiAzcHg7CiAgZm9udC1zaXplOiAxMHB4OyBmb250LXdlaWdodDogNTAwOyBtYXJnaW4tbGVmdDogOHB4OwogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgbGV0dGVyLXNwYWNpbmc6IDAuMDhlbTsKICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwp9Ci50YWctdXNlciB7IGJhY2tncm91bmQ6IHJnYmEoMTIzLDE2MCwxMzcsLjE1KTsgY29sb3I6IHZhcigtLXNhZ2UpOyBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDEyMywxNjAsMTM3LC4zKTsgfQoudGFnLWFpIHsgYmFja2dyb3VuZDogcmdiYSgxOTYsMTY2LDk3LC4xMik7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDE5NiwxNjYsOTcsLjMpOyB9Ci50YWctcGVuZGluZyB7IGJhY2tncm91bmQ6IHJnYmEoMjEyLDk2LDc0LC4xMik7IGNvbG9yOiB2YXIoLS1lbWJlcik7IGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjEyLDk2LDc0LC4zKTsgfQoudGFnLXNhbXBsZSB7IGJhY2tncm91bmQ6IHJnYmEoMTM4LDEzOCwxNDcsLjEyKTsgY29sb3I6IHZhcigtLWFzaCk7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UtMik7IH0KCi8qID09PT09PT09PT09PSDntKDmnZDliJfooaggPT09PT09PT09PT09ICovCi5pdGVtLXJvdyB7CiAgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7IGdhcDogMTJweDsKICBwYWRkaW5nOiAxNHB4IDE2cHg7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOwogIGJvcmRlci1yYWRpdXM6IDZweDsgbWFyZ2luLWJvdHRvbTogOHB4OwogIGJhY2tncm91bmQ6IHZhcigtLW9ic2lkaWFuKTsgdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9yIC4yczsKfQouaXRlbS1yb3c6aG92ZXIgeyBib3JkZXItY29sb3I6IHZhcigtLWVkZ2UtMyk7IH0KLml0ZW0tcm93IC5ncm93IHsgZmxleDogMTsgbWluLXdpZHRoOiAwOyB9Ci5pdGVtLXJvdyAuZ3JvdyBzdHJvbmcgeyBkaXNwbGF5OiBibG9jazsgZm9udC1mYW1pbHk6IHZhcigtLXNhbnMpOyBmb250LXNpemU6IDEzcHg7IGNvbG9yOiB2YXIoLS1pdm9yeSk7IGZvbnQtd2VpZ2h0OiA1MDA7IG1hcmdpbi1ib3R0b206IDRweDsgfQouaXRlbS1yb3cgLmdyb3cgZGl2IHsgZm9udC1zaXplOiAxMnB4OyBjb2xvcjogdmFyKC0tYXNoKTsgbGluZS1oZWlnaHQ6IDEuNTsgfQoubWF0ZXJpYWwtYmFkZ2UgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMHB4OwogIGJhY2tncm91bmQ6IHZhcigtLXNsYXRlLTIpOyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsKICBwYWRkaW5nOiAzcHggOHB4OyBib3JkZXItcmFkaXVzOiAzcHg7CiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZS0yKTsgbGV0dGVyLXNwYWNpbmc6IDAuMDhlbTsKICBmbGV4LXNocmluazogMDsKfQoKLyogPT09PT09PT09PT09IOahhuaetumHkeWtl+WhlCA9PT09PT09PT09PT0gKi8KLnB5cmFtaWQgewogIGJhY2tncm91bmQ6IHZhcigtLXNsYXRlKTsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZSk7CiAgYm9yZGVyLXJhZGl1czogOHB4OyBwYWRkaW5nOiAzNnB4IDQwcHg7IG1hcmdpbi1ib3R0b206IDI4cHg7Cn0KLnB5cmFtaWQtYXBleCB7CiAgdGV4dC1hbGlnbjogY2VudGVyOyBwYWRkaW5nLWJvdHRvbTogMjRweDsKICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tZWRnZSk7IG1hcmdpbi1ib3R0b206IDI0cHg7Cn0KLnB5cmFtaWQtYXBleCAubGFiZWwgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMHB4OwogIGxldHRlci1zcGFjaW5nOiAwLjE4ZW07IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IG1hcmdpbi1ib3R0b206IDEwcHg7Cn0KLnB5cmFtaWQtYXBleCAudGV4dCB7CiAgZm9udC1mYW1pbHk6IHZhcigtLXNlcmlmKTsgZm9udC1zaXplOiAyMnB4OyBmb250LXdlaWdodDogNDAwOwogIGNvbG9yOiB2YXIoLS1pdm9yeSk7IGxpbmUtaGVpZ2h0OiAxLjM7IGxldHRlci1zcGFjaW5nOiAtMC4wMWVtOwp9Ci5weXJhbWlkLWFwZXggLnRleHQgZW0geyBmb250LXN0eWxlOiBpdGFsaWM7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyB9Ci5waWxsYXJzIHsgZGlzcGxheTogZ3JpZDsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywgMWZyKTsgZ2FwOiAwOyB9CkBtZWRpYSAobWF4LXdpZHRoOiA3MjBweCkgeyAucGlsbGFycyB7IGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyOyBnYXA6IDIwcHg7IH0gLnBpbGxhciB7IGJvcmRlci1yaWdodDogbm9uZSAhaW1wb3J0YW50OyBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tZWRnZSk7IHBhZGRpbmctYm90dG9tOiAyMHB4OyB9IC5waWxsYXI6bGFzdC1jaGlsZCB7IGJvcmRlci1ib3R0b206IG5vbmU7IH0gfQoucGlsbGFyIHsgcGFkZGluZzogMCAyMHB4OyBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCB2YXIoLS1lZGdlKTsgfQoucGlsbGFyOmZpcnN0LWNoaWxkIHsgcGFkZGluZy1sZWZ0OiAwOyB9Ci5waWxsYXI6bGFzdC1jaGlsZCB7IHBhZGRpbmctcmlnaHQ6IDA7IGJvcmRlci1yaWdodDogbm9uZTsgfQoucGlsbGFyLW5vIHsgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDExcHg7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyBtYXJnaW4tYm90dG9tOiA2cHg7IGxldHRlci1zcGFjaW5nOiAwLjFlbTsgfQoucGlsbGFyLXRpdGxlIHsgZm9udC1mYW1pbHk6IHZhcigtLXNlcmlmLWNuKTsgZm9udC1zaXplOiAxNHB4OyBmb250LXdlaWdodDogNTAwOyBjb2xvcjogdmFyKC0taXZvcnkpOyBtYXJnaW4tYm90dG9tOiAxMnB4OyBsaW5lLWhlaWdodDogMS40OyB9Ci5waWxsYXItcG9pbnRzIHsgbGlzdC1zdHlsZTogbm9uZTsgZm9udC1mYW1pbHk6IHZhcigtLXNhbnMpOyBmb250LXNpemU6IDEycHg7IGNvbG9yOiB2YXIoLS1jaGFsayk7IGxpbmUtaGVpZ2h0OiAxLjg7IH0KLnBpbGxhci1wb2ludHMgbGksIC5waWxsYXItcG9pbnQgeyBwYWRkaW5nLWxlZnQ6IDE0cHg7IHBvc2l0aW9uOiByZWxhdGl2ZTsgZm9udC1zaXplOiAxMnB4OyBjb2xvcjogdmFyKC0tY2hhbGspOyBsaW5lLWhlaWdodDogMS44OyBtYXJnaW4tYm90dG9tOiAycHg7IH0KLnBpbGxhci1wb2ludHMgbGk6OmJlZm9yZSwgLnBpbGxhci1wb2ludDo6YmVmb3JlIHsgY29udGVudDogIuKAlCI7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogMDsgY29sb3I6IHZhcigtLXNtb2tlKTsgfQoubG9naWMtbm90ZSB7CiAgYmFja2dyb3VuZDogcmdiYSgyMTIsOTYsNzQsLjA2KTsgYm9yZGVyLWxlZnQ6IDJweCBzb2xpZCB2YXIoLS1lbWJlcik7CiAgcGFkZGluZzogMTBweCAxNHB4OyBmb250LWZhbWlseTogdmFyKC0tc2Fucyk7IGZvbnQtc2l6ZTogMTJweDsKICBjb2xvcjogdmFyKC0tY2hhbGspOyBtYXJnaW4tYm90dG9tOiA4cHg7IGJvcmRlci1yYWRpdXM6IDAgNHB4IDRweCAwOwogIGxpbmUtaGVpZ2h0OiAxLjY7Cn0KCi8qID09PT09PT09PT09PSDmoIfpopjliJfooaggPT09PT09PT09PT09ICovCi50aXRsZS1saXN0IHsgbWFyZ2luLXRvcDogOHB4OyB9Ci50aXRsZS1yb3cgewogIGRpc3BsYXk6IGdyaWQ7IGdyaWQtdGVtcGxhdGUtY29sdW1uczogNTZweCAxZnIgMTIwcHg7CiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgcGFkZGluZzogMThweCAxNnB4OwogIGJhY2tncm91bmQ6IHZhcigtLXNsYXRlKTsgYm9yZGVyLXJhZGl1czogNnB4OwogIG1hcmdpbi1ib3R0b206IDRweDsgZ2FwOiAyMHB4OwogIHRyYW5zaXRpb246IGFsbCAuMnM7IGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50Owp9Ci50aXRsZS1yb3c6aG92ZXIgeyBiYWNrZ3JvdW5kOiB2YXIoLS1zbGF0ZS0yKTsgYm9yZGVyLWNvbG9yOiB2YXIoLS1lZGdlLTIpOyB9Ci50aXRsZS1yb3cuaXMtYWN0aXZlIHsgYmFja2dyb3VuZDogdmFyKC0tc2xhdGUtMik7IGJvcmRlci1jb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgfQoudGl0bGUtbm8geyBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTJweDsgY29sb3I6IHZhcigtLXNtb2tlKTsgfQoudGl0bGUtcm93LmlzLWFjdGl2ZSAudGl0bGUtbm8geyBjb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgfQoudGl0bGUtdGV4dCB7IGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZi1jbik7IGZvbnQtc2l6ZTogMTVweDsgY29sb3I6IHZhcigtLWl2b3J5KTsgbGluZS1oZWlnaHQ6IDEuNTsgZm9udC13ZWlnaHQ6IDQwMDsgfQoudGl0bGUtdGV4dCAuc291cmNlLXRhZyB7CiAgZGlzcGxheTogaW5saW5lLWJsb2NrOyBtYXJnaW4tbGVmdDogMTBweDsKICBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogOXB4OyBjb2xvcjogdmFyKC0tc21va2UpOwogIHBhZGRpbmc6IDJweCA2cHg7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UtMik7IGJvcmRlci1yYWRpdXM6IDNweDsKICBsZXR0ZXItc3BhY2luZzogMC4wOGVtOyB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwp9Ci50aXRsZS10ZXh0IC5zb3VyY2UtdGFnLnVzZXIgeyBjb2xvcjogdmFyKC0tc2FnZSk7IGJvcmRlci1jb2xvcjogcmdiYSgxMjMsMTYwLDEzNywuMyk7IH0KLnRpdGxlLXRleHQgLnNvdXJjZS10YWcucGVuZGluZyB7IGNvbG9yOiB2YXIoLS1lbWJlcik7IGJvcmRlci1jb2xvcjogcmdiYSgyMTIsOTYsNzQsLjMpOyB9Ci50aXRsZS10eXBlIHsgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDEwcHg7IGNvbG9yOiB2YXIoLS1hc2gpOyB0ZXh0LWFsaWduOiByaWdodDsgbGV0dGVyLXNwYWNpbmc6IDAuMWVtOyB9CgovKiDml6fniYggdGl0bGUtaXRlbSDlhbzlrrkgKi8KLnRpdGxlLWl0ZW0gewogIGRpc3BsYXk6IGdyaWQ7IGdyaWQtdGVtcGxhdGUtY29sdW1uczogMzZweCAxZnIgODBweDsKICBhbGlnbi1pdGVtczogY2VudGVyOyBwYWRkaW5nOiAxNHB4IDE2cHg7CiAgYmFja2dyb3VuZDogdmFyKC0tc2xhdGUpOyBib3JkZXItcmFkaXVzOiA2cHg7CiAgbWFyZ2luLWJvdHRvbTogNnB4OyBnYXA6IDE2cHg7CiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZSk7IHRyYW5zaXRpb246IGFsbCAuMnM7Cn0KLnRpdGxlLWl0ZW06aG92ZXIgeyBib3JkZXItY29sb3I6IHZhcigtLWVkZ2UtMyk7IGJhY2tncm91bmQ6IHZhcigtLXNsYXRlLTIpOyB9Ci50aXRsZS1pdGVtIC5wYWdlbm8geyBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTJweDsgY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IGZvbnQtd2VpZ2h0OiA1MDA7IH0KLnRpdGxlLWl0ZW0gaW5wdXQgewogIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OyBib3JkZXI6IG5vbmU7IHBhZGRpbmc6IDRweCAwOwogIGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZi1jbik7IGZvbnQtc2l6ZTogMTRweDsgY29sb3I6IHZhcigtLWl2b3J5KTsKfQoudGl0bGUtaXRlbSBpbnB1dDpmb2N1cyB7IG91dGxpbmU6IG5vbmU7IGJhY2tncm91bmQ6IHZhcigtLW9ic2lkaWFuKTsgcGFkZGluZzogNHB4IDhweDsgYm9yZGVyLXJhZGl1czogM3B4OyB9Ci5pbmZvLXR5cGUgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMHB4OyBjb2xvcjogdmFyKC0tYXNoKTsKICB0ZXh0LWFsaWduOiByaWdodDsgbGV0dGVyLXNwYWNpbmc6IDAuMDhlbTsKICBwYWRkaW5nOiAzcHggOHB4OyBiYWNrZ3JvdW5kOiB2YXIoLS1vYnNpZGlhbik7IGJvcmRlci1yYWRpdXM6IDNweDsKICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1lZGdlKTsKfQoKLyogPT09PT09PT09PT09IOi/nuivu+mihOiniCA9PT09PT09PT09PT0gKi8KLnJlYWR0aHJvdWdoIHsKICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCB2YXIoLS1zbGF0ZSkgMCUsIHZhcigtLXNsYXRlLTIpIDEwMCUpOwogIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOyBib3JkZXItbGVmdDogMnB4IHNvbGlkIHZhcigtLWNoYW1wYWduZSk7CiAgcGFkZGluZzogMjhweCAzNnB4OyBtYXJnaW4tdG9wOiAyOHB4OyBib3JkZXItcmFkaXVzOiAwIDhweCA4cHggMDsKfQoucmVhZHRocm91Z2gtbGFiZWwgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMHB4OwogIGxldHRlci1zcGFjaW5nOiAwLjE4ZW07IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IG1hcmdpbi1ib3R0b206IDEycHg7Cn0KLnJlYWR0aHJvdWdoLXRleHQgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZi1jbik7IGZvbnQtc2l6ZTogMTVweDsKICBsaW5lLWhlaWdodDogMjsgY29sb3I6IHZhcigtLWNoYWxrKTsgZm9udC13ZWlnaHQ6IDMwMDsKfQoucmVhZHRocm91Z2gtdGV4dCAuc2VwIHsgY29sb3I6IHZhcigtLXNtb2tlKTsgbWFyZ2luOiAwIDEwcHg7IGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgfQoKLyogPT09PT09PT09PT09IOW4g+WxgOmAieaLqSA9PT09PT09PT09PT0gKi8KLmxheW91dC1ncmlkIHsKICBkaXNwbGF5OiBncmlkOyBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpbGwsIG1pbm1heCgxODBweCwgMWZyKSk7CiAgZ2FwOiAxMHB4OyBtYXJnaW46IDEycHggMDsKfQoubGF5b3V0LW9wdCB7CiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZSk7IGJvcmRlci1yYWRpdXM6IDZweDsKICBwYWRkaW5nOiAxNHB4OyBjdXJzb3I6IHBvaW50ZXI7IHRyYW5zaXRpb246IGFsbCAuMTVzOwogIGJhY2tncm91bmQ6IHZhcigtLW9ic2lkaWFuKTsKfQoubGF5b3V0LW9wdDpob3ZlciB7IGJvcmRlci1jb2xvcjogdmFyKC0tZWRnZS0zKTsgYmFja2dyb3VuZDogdmFyKC0tc2xhdGUtMyk7IH0KLmxheW91dC1vcHQuc2VsZWN0ZWQgeyBib3JkZXItY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IGJhY2tncm91bmQ6IHZhcigtLWNoYW1wYWduZS1nbG93KTsgfQoubGF5b3V0LW9wdCAubG5hbWUgeyBmb250LWZhbWlseTogdmFyKC0tc2Fucyk7IGZvbnQtd2VpZ2h0OiA1MDA7IGZvbnQtc2l6ZTogMTNweDsgY29sb3I6IHZhcigtLWl2b3J5KTsgbWFyZ2luLWJvdHRvbTogNHB4OyB9Ci5sYXlvdXQtb3B0LnNlbGVjdGVkIC5sbmFtZSB7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyB9Ci5sYXlvdXQtb3B0IC5sc3RydWN0IHsgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDEwcHg7IGNvbG9yOiB2YXIoLS1zbW9rZSk7IGxpbmUtaGVpZ2h0OiAxLjU7IGxldHRlci1zcGFjaW5nOiAwLjA0ZW07IH0KCi8qID09PT09PT09PT09PSDkuLvpopjpgInmi6kgPT09PT09PT09PT09ICovCi50aGVtZS1ncmlkIHsgZGlzcGxheTogZ3JpZDsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMjIwcHgsIDFmcikpOyBnYXA6IDE0cHg7IH0KLnRoZW1lLWNhcmQgewogIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOyBib3JkZXItcmFkaXVzOiA2cHg7CiAgb3ZlcmZsb3c6IGhpZGRlbjsgY3Vyc29yOiBwb2ludGVyOyB0cmFuc2l0aW9uOiBhbGwgLjJzOwogIGJhY2tncm91bmQ6IHZhcigtLW9ic2lkaWFuKTsKfQoudGhlbWUtY2FyZDpob3ZlciB7IGJvcmRlci1jb2xvcjogdmFyKC0tZWRnZS0zKTsgfQoudGhlbWUtY2FyZC5zZWxlY3RlZCB7IGJvcmRlci1jb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsgYm94LXNoYWRvdzogMCA0cHggMjBweCB2YXIoLS1jaGFtcGFnbmUtZ2xvdyk7IH0KLnRoZW1lLXByZXZpZXcgeyBoZWlnaHQ6IDExMHB4OyBwYWRkaW5nOiAxOHB4OyBkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfQoudGhlbWUtbmFtZSB7IHBhZGRpbmc6IDEycHggMTRweCA0cHg7IGZvbnQtd2VpZ2h0OiA1MDA7IGZvbnQtc2l6ZTogMTNweDsgY29sb3I6IHZhcigtLWl2b3J5KTsgZm9udC1mYW1pbHk6IHZhcigtLXNhbnMpOyB9Ci50aGVtZS1kZXNjIHsgZm9udC1zaXplOiAxMXB4OyBjb2xvcjogdmFyKC0tYXNoKTsgcGFkZGluZzogMCAxNHB4IDEycHg7IGZvbnQtZmFtaWx5OiB2YXIoLS1zYW5zKTsgbGluZS1oZWlnaHQ6IDEuNTsgfQoKLyogPT09PT09PT09PT09IOW5u+eBr+eJh+mihOiniC/nvJbovpEgPT09PT09PT09PT09ICovCi5kZWNrIHsgZGlzcGxheTogZmxleDsgZ2FwOiAyNHB4OyBtYXJnaW4tdG9wOiAxNnB4OyB9Ci5zbGlkZS10aHVtYi1saXN0IHsKICB3aWR0aDogMTgwcHg7IGZsZXgtc2hyaW5rOiAwOyBvdmVyZmxvdy15OiBhdXRvOwogIG1heC1oZWlnaHQ6IDcwdmg7IHBhZGRpbmctcmlnaHQ6IDRweDsKfQouc2xpZGUtdGh1bWIgewogIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOyBib3JkZXItcmFkaXVzOiA0cHg7CiAgbWFyZ2luLWJvdHRvbTogMTBweDsgY3Vyc29yOiBwb2ludGVyOwogIG92ZXJmbG93OiBoaWRkZW47IGJhY2tncm91bmQ6IHZhcigtLWl2b3J5KTsKICBwb3NpdGlvbjogcmVsYXRpdmU7IHRyYW5zaXRpb246IGJvcmRlci1jb2xvciAuMTVzOwp9Ci5zbGlkZS10aHVtYjpob3ZlciB7IGJvcmRlci1jb2xvcjogdmFyKC0tZWRnZS0zKTsgfQouc2xpZGUtdGh1bWIuYWN0aXZlIHsgYm9yZGVyLWNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyBib3gtc2hhZG93OiAwIDAgMCAxcHggdmFyKC0tY2hhbXBhZ25lLWdsb3cpOyB9Ci5zbGlkZS10aHVtYiAudGh1bWItY2FudmFzIHsgaGVpZ2h0OiA5MnB4OyBwYWRkaW5nOiAxMHB4OyBmb250LXNpemU6IDhweDsgb3ZlcmZsb3c6IGhpZGRlbjsgY29sb3I6IHZhcigtLXZvaWQpOyBiYWNrZ3JvdW5kOiAjZmZmOyB9Ci5zbGlkZS10aHVtYiAudGh1bWItdGl0bGUgewogIGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZik7IGZvbnQtd2VpZ2h0OiA2MDA7CiAgZm9udC1zaXplOiA5cHg7IG1hcmdpbi1ib3R0b206IDRweDsgbGluZS1oZWlnaHQ6IDEuMjsKICBjb2xvcjogdmFyKC0tdm9pZCk7Cn0KLnNsaWRlLXRodW1iIC50aHVtYi1ubyB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiA0cHg7IHJpZ2h0OiA2cHg7IGZvbnQtc2l6ZTogMTBweDsgY29sb3I6IHZhcigtLXNtb2tlKTsgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyB9Ci5zbGlkZS10aHVtYiAubG9jay1iYWRnZSB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgYm90dG9tOiA0cHg7IHJpZ2h0OiA2cHg7IGZvbnQtc2l6ZTogMTJweDsgfQouc2xpZGUtY2FudmFzLXdyYXAgeyBmbGV4OiAxOyBtaW4td2lkdGg6IDA7IH0KLnNsaWRlLWNhbnZhcyB7CiAgYmFja2dyb3VuZDogI2ZmZjsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZSk7CiAgYm9yZGVyLXJhZGl1czogNnB4OyBhc3BlY3QtcmF0aW86IDE2Lzk7CiAgcGFkZGluZzogNDRweCA1NnB4OyBvdmVyZmxvdy15OiBhdXRvOwogIGJveC1zaGFkb3c6IDAgNHB4IDIwcHggcmdiYSgwLDAsMCwuMik7CiAgY29sb3I6IHZhcigtLXZvaWQpOwp9Ci5ibG9jayB7IG1hcmdpbi1ib3R0b206IDE4cHg7IHBvc2l0aW9uOiByZWxhdGl2ZTsgfQouYmxvY2s6aG92ZXIgLmJsb2NrLXRvb2xzIHsgb3BhY2l0eTogMTsgfQouYmxvY2stdG9vbHMgeyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogLTZweDsgcmlnaHQ6IDA7IG9wYWNpdHk6IDA7IHRyYW5zaXRpb246IC4xNXM7IH0KLmJsb2NrLWhlYWRpbmcgeyBmb250LWZhbWlseTogdmFyKC0tc2VyaWYpOyBmb250LXNpemU6IDMwcHg7IGZvbnQtd2VpZ2h0OiA2MDA7IGxpbmUtaGVpZ2h0OiAxLjI7IH0KLmJsb2NrLWtwaSB7IGZvbnQtc2l6ZTogNDhweDsgZm9udC13ZWlnaHQ6IDcwMDsgdGV4dC1hbGlnbjogY2VudGVyOyBsZXR0ZXItc3BhY2luZzogLTAuMDJlbTsgfQouYmxvY2stcXVvdGUgeyBmb250LXNpemU6IDIycHg7IGZvbnQtc3R5bGU6IGl0YWxpYzsgYm9yZGVyLWxlZnQ6IDRweCBzb2xpZDsgcGFkZGluZy1sZWZ0OiAxOHB4OyBmb250LWZhbWlseTogdmFyKC0tc2VyaWYpOyBsaW5lLWhlaWdodDogMS41OyB9Ci5ibG9jay1idWxsZXRzIHsgcGFkZGluZy1sZWZ0OiAwOyBsaXN0LXN0eWxlOiBub25lOyB9Ci5ibG9jay1idWxsZXRzIGxpIHsgZm9udC1zaXplOiAxNnB4OyBtYXJnaW4tYm90dG9tOiA4cHg7IGxpbmUtaGVpZ2h0OiAxLjY7IHBhZGRpbmctbGVmdDogMjBweDsgcG9zaXRpb246IHJlbGF0aXZlOyB9Ci5ibG9jay1idWxsZXRzIGxpOjpiZWZvcmUgeyBjb250ZW50OiAi4paqIjsgcG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAwOyB9Ci5ibG9jay1jaGFydCwgLmJsb2NrLXRhYmxlLCAuYmxvY2stbWF0cml4IHsKICBib3JkZXI6IDFweCBkYXNoZWQgdmFyKC0tZWRnZS0zKTsgYm9yZGVyLXJhZGl1czogNHB4OwogIHBhZGRpbmc6IDI0cHg7IHRleHQtYWxpZ246IGNlbnRlcjsgZm9udC1zaXplOiAxM3B4OwogIGJhY2tncm91bmQ6IHJnYmEoMCwwLDAsLjAyKTsKfQouYmxvY2stdGV4dCB7IGZvbnQtc2l6ZTogMTVweDsgbGluZS1oZWlnaHQ6IDEuNzsgfQouYmxvY2tbY29udGVudGVkaXRhYmxlPSJ0cnVlIl0geyBvdXRsaW5lOiAycHggc29saWQgdmFyKC0tY2hhbXBhZ25lKTsgYm9yZGVyLXJhZGl1czogMnB4OyB9CgovKiA9PT09PT09PT09PT0gQUkg5a+56K+d5L+u5pS5ID09PT09PT09PT09PSAqLwouYWktY2hhdCB7CiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZSk7IGJvcmRlci1yYWRpdXM6IDZweDsKICBiYWNrZ3JvdW5kOiB2YXIoLS1zbGF0ZSk7IG1hcmdpbi10b3A6IDIwcHg7Cn0KLmFpLWNoYXQtaGVhZCB7CiAgcGFkZGluZzogMTRweCAyMHB4OyBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tZWRnZSk7CiAgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDExcHg7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOwogIGxldHRlci1zcGFjaW5nOiAwLjFlbTsKfQouYWktY2hhdC1ib2R5IHsgcGFkZGluZzogMThweCAyMHB4OyB9Ci5kaWZmLWJveCB7CiAgZGlzcGxheTogZ3JpZDsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnIgMWZyOyBnYXA6IDE0cHg7CiAgbWFyZ2luLXRvcDogMTRweDsgcGFkZGluZzogMTRweDsgYmFja2dyb3VuZDogdmFyKC0tb2JzaWRpYW4pOwogIGJvcmRlci1yYWRpdXM6IDZweDsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZSk7Cn0KLmRpZmYtY29sIGg1IHsKICBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTBweDsgY29sb3I6IHZhcigtLWFzaCk7CiAgbWFyZ2luLWJvdHRvbTogOHB4OyBsZXR0ZXItc3BhY2luZzogMC4xZW07IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7Cn0KLmRpZmYtY29sOm50aC1jaGlsZCgxKSBoNSB7IGNvbG9yOiB2YXIoLS1lbWJlcik7IH0KLmRpZmYtY29sOm50aC1jaGlsZCgyKSBoNSB7IGNvbG9yOiB2YXIoLS1zYWdlKTsgfQouZGlmZi1jb2wgPiBkaXYgeyBmb250LXNpemU6IDEycHg7IGNvbG9yOiB2YXIoLS1jaGFsayk7IGxpbmUtaGVpZ2h0OiAxLjY7IH0KLnZlcnNpb24taXRlbSB7CiAgZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyBhbGlnbi1pdGVtczogY2VudGVyOwogIHBhZGRpbmc6IDEwcHggMTRweDsgYmFja2dyb3VuZDogdmFyKC0tb2JzaWRpYW4pOwogIGJvcmRlci1yYWRpdXM6IDRweDsgbWFyZ2luLWJvdHRvbTogNnB4OwogIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMnB4OyBjb2xvcjogdmFyKC0tY2hhbGspOwogIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVkZ2UpOwp9CgovKiA9PT09PT09PT09PT0g5a+85Ye6ID09PT09PT09PT09PSAqLwouZXhwb3J0LWdyaWQgewogIGRpc3BsYXk6IGdyaWQ7IGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDMsIDFmcik7CiAgZ2FwOiAxNHB4OyBtYXJnaW4tdG9wOiAxNHB4Owp9Ci5leHBvcnQtY2FyZCB7CiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZSk7IGJvcmRlci1yYWRpdXM6IDZweDsKICBwYWRkaW5nOiAyNHB4IDIwcHg7IGN1cnNvcjogcG9pbnRlcjsgdGV4dC1hbGlnbjogY2VudGVyOwogIHRyYW5zaXRpb246IGFsbCAuMnM7IGJhY2tncm91bmQ6IHZhcigtLW9ic2lkaWFuKTsKfQouZXhwb3J0LWNhcmQ6aG92ZXIgeyBib3JkZXItY29sb3I6IHZhcigtLWNoYW1wYWduZSk7IGJhY2tncm91bmQ6IHZhcigtLXNsYXRlLTIpOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTJweCk7IH0KLmV4cG9ydC1jYXJkIC5pY29uIHsgZm9udC1zaXplOiAzMnB4OyBtYXJnaW4tYm90dG9tOiAxMnB4OyB9Ci5leHBvcnQtY2FyZCAubmFtZSB7IGZvbnQtZmFtaWx5OiB2YXIoLS1zZXJpZi1jbik7IGZvbnQtc2l6ZTogMTVweDsgZm9udC13ZWlnaHQ6IDUwMDsgY29sb3I6IHZhcigtLWl2b3J5KTsgbWFyZ2luLWJvdHRvbTogNnB4OyB9Ci5leHBvcnQtY2FyZCAuZGVzYyB7IGZvbnQtc2l6ZTogMTFweDsgY29sb3I6IHZhcigtLWFzaCk7IGZvbnQtZmFtaWx5OiB2YXIoLS1zYW5zKTsgfQoKLyogPT09PT09PT09PT09IOaoquW5hSA9PT09PT09PT09PT0gKi8KLm9rLWJhbm5lciB7CiAgYmFja2dyb3VuZDogcmdiYSgxMjMsMTYwLDEzNywuMDgpOyBib3JkZXItbGVmdDogM3B4IHNvbGlkIHZhcigtLXNhZ2UpOwogIHBhZGRpbmc6IDE0cHggMThweDsgYm9yZGVyLXJhZGl1czogMCA0cHggNHB4IDA7CiAgZm9udC1mYW1pbHk6IHZhcigtLXNhbnMpOyBmb250LXNpemU6IDEzcHg7IGNvbG9yOiB2YXIoLS1zYWdlKTsKICBtYXJnaW4tYm90dG9tOiAxNHB4Owp9Ci53YXJuLWJhbm5lciB7CiAgYmFja2dyb3VuZDogcmdiYSgyMTIsOTYsNzQsLjA4KTsgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCB2YXIoLS1lbWJlcik7CiAgcGFkZGluZzogMTRweCAxOHB4OyBib3JkZXItcmFkaXVzOiAwIDRweCA0cHggMDsKICBmb250LWZhbWlseTogdmFyKC0tc2Fucyk7IGZvbnQtc2l6ZTogMTNweDsgY29sb3I6IHZhcigtLWVtYmVyKTsKICBtYXJnaW4tYm90dG9tOiAxNHB4Owp9CgovKiA9PT09PT09PT09PT0g56m654q25oCBID09PT09PT09PT09PSAqLwouZW1wdHkgewogIHRleHQtYWxpZ246IGNlbnRlcjsgcGFkZGluZzogODBweCAyMHB4OyBjb2xvcjogdmFyKC0tYXNoKTsKfQouZW1wdHkgLmJpZyB7CiAgZm9udC1mYW1pbHk6IHZhcigtLXNlcmlmKTsgZm9udC1zaXplOiA1NnB4OyBjb2xvcjogdmFyKC0tZWRnZS0zKTsKICBmb250LXN0eWxlOiBpdGFsaWM7IG1hcmdpbi1ib3R0b206IDIwcHg7Cn0KLmVtcHR5IGgyIHsgZm9udC1mYW1pbHk6IHZhcigtLXNlcmlmKTsgZm9udC1zaXplOiAyOHB4OyBjb2xvcjogdmFyKC0taXZvcnkpOyBmb250LXdlaWdodDogNDAwOyBtYXJnaW4tYm90dG9tOiAxMHB4OyB9Ci5lbXB0eSBwIHsgZm9udC1zaXplOiAxNHB4OyBjb2xvcjogdmFyKC0tYXNoKTsgZm9udC1mYW1pbHk6IHZhcigtLXNlcmlmLWNuKTsgfQoKLyogPT09PT09PT09PT09IOaPkOekuuS4juWKoOi9vSA9PT09PT09PT09PT0gKi8KLnRvYXN0IHsKICBwb3NpdGlvbjogZml4ZWQ7IGJvdHRvbTogMzJweDsgbGVmdDogNTAlOwogIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTsKICBiYWNrZ3JvdW5kOiB2YXIoLS1zbGF0ZS0yKTsgY29sb3I6IHZhcigtLWl2b3J5KTsKICBwYWRkaW5nOiAxMnB4IDI0cHg7IGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMXB4OwogIGJvcmRlci1yYWRpdXM6IDZweDsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tZWRnZS0yKTsgbGV0dGVyLXNwYWNpbmc6IDAuMDZlbTsKICBvcGFjaXR5OiAwOyB0cmFuc2l0aW9uOiBvcGFjaXR5IC4zcywgdHJhbnNmb3JtIC4zczsKICBwb2ludGVyLWV2ZW50czogbm9uZTsgei1pbmRleDogMTAwOwogIGJveC1zaGFkb3c6IDAgOHB4IDMycHggcmdiYSgwLDAsMCwuNSk7Cn0KLnRvYXN0LnNob3cgeyBvcGFjaXR5OiAxOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSkgdHJhbnNsYXRlWSgtNHB4KTsgfQoudG9hc3Q6OmJlZm9yZSB7IGNvbnRlbnQ6ICLil48iOyBjb2xvcjogdmFyKC0tc2FnZSk7IG1hcmdpbi1yaWdodDogOHB4OyB9CgoubG9hZGluZyB7CiAgcG9zaXRpb246IGZpeGVkOyBpbnNldDogMDsgYmFja2dyb3VuZDogcmdiYSgxMCwxMCwxMiwuNzgpOwogIGJhY2tkcm9wLWZpbHRlcjogYmx1cig4cHgpOyBkaXNwbGF5OiBmbGV4OwogIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOwogIHotaW5kZXg6IDIwMDsgZ2FwOiAxOHB4Owp9Ci5sb2FkaW5nLmhpZGRlbiB7IGRpc3BsYXk6IG5vbmU7IH0KLnNwaW5uZXIgewogIHdpZHRoOiAzNnB4OyBoZWlnaHQ6IDM2cHg7CiAgYm9yZGVyOiAycHggc29saWQgdmFyKC0tZWRnZS0yKTsgYm9yZGVyLXRvcC1jb2xvcjogdmFyKC0tY2hhbXBhZ25lKTsKICBib3JkZXItcmFkaXVzOiA1MCU7IGFuaW1hdGlvbjogc3BpbiAuOHMgbGluZWFyIGluZmluaXRlOwp9Ci5sb2FkaW5nIHAgeyBmb250LWZhbWlseTogdmFyKC0tbW9ubyk7IGZvbnQtc2l6ZTogMTJweDsgY29sb3I6IHZhcigtLWNoYWxrKTsgbGV0dGVyLXNwYWNpbmc6IDAuMWVtOyB9CkBrZXlmcmFtZXMgc3BpbiB7IHRvIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfSB9CgoudmVyc2lvbi1tYXJrIHsKICBwb3NpdGlvbjogZml4ZWQ7IGJvdHRvbTogMjRweDsgcmlnaHQ6IDMycHg7CiAgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDEwcHg7IGNvbG9yOiB2YXIoLS1zbW9rZSk7CiAgbGV0dGVyLXNwYWNpbmc6IDAuMWVtOyB6LWluZGV4OiA1MDsgcG9pbnRlci1ldmVudHM6IG5vbmU7Cn0KLnZlcnNpb24tbWFyayAuZ29sZCB7IGNvbG9yOiB2YXIoLS1jaGFtcGFnbmUpOyB9CgovKiA9PT09PT09PT09PT0g5YWl5Zy65Yqo55S7ID09PT09PT09PT09PSAqLwpAa2V5ZnJhbWVzIGZhZGUtdXAgewogIGZyb20geyBvcGFjaXR5OiAwOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTJweCk7IH0KICB0byB7IG9wYWNpdHk6IDE7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsgfQp9Ci5saWItaGVhZCwgLmRlY2stY2FyZCwgLm5ldy1jYXJkLCAubGliLWVtcHR5IHsgYW5pbWF0aW9uOiBmYWRlLXVwIC42cyBlYXNlIGJvdGg7IH0KLmRlY2stY2FyZDpudGgtY2hpbGQoMikgeyBhbmltYXRpb24tZGVsYXk6IC4wNXM7IH0KLmRlY2stY2FyZDpudGgtY2hpbGQoMykgeyBhbmltYXRpb24tZGVsYXk6IC4xczsgfQouZGVjay1jYXJkOm50aC1jaGlsZCg0KSB7IGFuaW1hdGlvbi1kZWxheTogLjE1czsgfQouZGVjay1jYXJkOm50aC1jaGlsZCg1KSB7IGFuaW1hdGlvbi1kZWxheTogLjJzOyB9Ci5kZWNrLWNhcmQ6bnRoLWNoaWxkKDYpIHsgYW5pbWF0aW9uLWRlbGF5OiAuMjVzOyB9Ci5uZXctY2FyZCB7IGFuaW1hdGlvbi1kZWxheTogLjI1czsgfQoucGFuZWwtZXllYnJvdywgLnBhbmVsLXRpdGxlLCAucGFuZWwtbGVkZSwgLnBhbmVsLWRlc2MgeyBhbmltYXRpb246IGZhZGUtdXAgLjZzIGVhc2UgYm90aDsgfQoucGFuZWwtdGl0bGUgeyBhbmltYXRpb24tZGVsYXk6IC4wOHM7IH0KLnBhbmVsLWxlZGUsIC5wYW5lbC1kZXNjIHsgYW5pbWF0aW9uLWRlbGF5OiAuMTZzOyB9Ci5weXJhbWlkLCAudGl0bGUtbGlzdCwgLnJlYWR0aHJvdWdoLCAuY2FyZCB7IGFuaW1hdGlvbjogZmFkZS11cCAuOHMgZWFzZSAuMjRzIGJvdGg7IH0KCjpmb2N1cy12aXNpYmxlIHsgb3V0bGluZTogMnB4IHNvbGlkIHZhcigtLWNoYW1wYWduZSk7IG91dGxpbmUtb2Zmc2V0OiAycHg7IH0KOjpzZWxlY3Rpb24geyBiYWNrZ3JvdW5kOiB2YXIoLS1jaGFtcGFnbmUpOyBjb2xvcjogdmFyKC0tdm9pZCk7IH0KCi8qIOa7muWKqOadoSAqLwo6Oi13ZWJraXQtc2Nyb2xsYmFyIHsgd2lkdGg6IDhweDsgaGVpZ2h0OiA4cHg7IH0KOjotd2Via2l0LXNjcm9sbGJhci10cmFjayB7IGJhY2tncm91bmQ6IHZhcigtLW9ic2lkaWFuKTsgfQo6Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHsgYmFja2dyb3VuZDogdmFyKC0tZWRnZS0yKTsgYm9yZGVyLXJhZGl1czogNHB4OyB9Cjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWI6aG92ZXIgeyBiYWNrZ3JvdW5kOiB2YXIoLS1lZGdlLTMpOyB9Cg=="
  },
  "/app.js": {
    mime: "application/javascript; charset=utf-8",
    b64: "LyogUGxlb24gwrcgUFBUIOaZuuiDveWIm+S9nOW5s+WPsCDCtyDliY3nq68gU1BBIMK3IFF1aWV0IEx1eHVyeSArIE5vdGVib29rICovCiJ1c2Ugc3RyaWN0IjsKCi8qIC0tLS0tLS0tLS0tLS0tLS0g54q25oCBIC0tLS0tLS0tLS0tLS0tLS0gKi8KY29uc3Qgc3RhdGUgPSB7CiAgc2Vzc2lvbjogbnVsbCwKICB2aWV3OiAibGlicmFyeSIsCiAgcHJvamVjdHM6IFtdLAogIGZpbHRlcjogImFsbCIsCiAgc2VhcmNoS2V5d29yZDogIiIsCiAgcHJvamVjdElkOiBudWxsLAogIHByb2plY3Q6IG51bGwsCiAgc3RlcDogMCwKICBhdWRpZW5jZTogbnVsbCwKICBmcmFtZXdvcms6IG51bGwsCiAgdGl0bGVzOiBbXSwKICBwYWdlczogW10sCiAgc3R5bGU6IG51bGwsCiAgc2xpZGVzOiBbXSwKICBjdXJyZW50U2xpZGU6IDAsCiAgdGhlbWVzOiBbXSwKICByZWFkVGhyb3VnaDogbnVsbCwKICAvKiBTb3VyY2VzIOmdouadv++8iFRhc2sgNO+8iSAqLwogIG1hdGVyaWFsczogW10sCiAgc291cmNlc0NvbGxhcHNlZDogZmFsc2UsCiAgcGVuZGluZ1JlY2FsYzogMCwKICBjb250ZXh0UGFjazogbnVsbCwKICBjdHhQYWNrQ29sbGFwc2VkOiBmYWxzZSwKICAvKiBOb3RlcyDpnaLmnb/vvIhUYXNrIDXvvIkgKi8KICBub3Rlc0NvbGxhcHNlZDogZmFsc2UsCn07Cgpjb25zdCBTVEVQUyA9IFsKICB7IG46IDAsIGxhYmVsOiAi6IOM5pmv57Sg5p2QIiwgc3ViOiAiY29udGV4dCIsIHRhZzogIkNvbnRleHQgwrcg57Sg5p2Q6L6T5YWlIiB9LAogIHsgbjogMSwgbGFiZWw6ICLlj5fkvJfliIbmnpAiLCBzdWI6ICJhdWRpZW5jZSIsIHRhZzogIkF1ZGllbmNlIMK3IOWPl+S8l+WumuS5iSIgfSwKICB7IG46IDIsIGxhYmVsOiAi5qGG5p625LiO5qCH6aKYIiwgc3ViOiAiZnJhbWV3b3JrIiwgdGFnOiAiRnJhbWV3b3JrIMK3IOmHkeWtl+WhlOmAu+i+kSIgfSwKICB7IG46IDMsIGxhYmVsOiAi6YCQ6aG15rex5YyWIiwgc3ViOiAiZGV2ZWxvcCIsIHRhZzogIkRldmVsb3Agwrcg6K665o2u5biD5bGAIiB9LAogIHsgbjogNCwgbGFiZWw6ICLpo47moLzlrprosIMiLCBzdWI6ICJzdHlsZSIsIHRhZzogIlN0eWxlIMK3IOinhuinieS4u+mimCIgfSwKICB7IG46IDUsIGxhYmVsOiAi55Sf5oiQ5bm754Gv54mHIiwgc3ViOiAicmVuZGVyIiwgdGFnOiAiUmVuZGVyIMK3IOa4suafk+WIneeovyIgfSwKICB7IG46IDYsIGxhYmVsOiAi5a+56K+d57K+5L+uIiwgc3ViOiAicmVmaW5lIiwgdGFnOiAiUmVmaW5lIMK3IEFJIOeyvuS/riIgfSwKICB7IG46IDcsIGxhYmVsOiAi5a+85Ye65YiG5LqrIiwgc3ViOiAiZXhwb3J0IiwgdGFnOiAiRXhwb3J0IMK3IOWujOaIkOWvvOWHuiIgfSwKXTsKCi8qIC0tLS0tLS0tLS0tLS0tLS0g5bel5YW3IC0tLS0tLS0tLS0tLS0tLS0gKi8KY29uc3QgJCA9IChzZWwpID0+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsKTsKY29uc3QgZWwgPSAodGFnLCBjbHMsIGh0bWwpID0+IHsKICBjb25zdCBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpOwogIGlmIChjbHMpIGUuY2xhc3NOYW1lID0gY2xzOwogIGlmIChodG1sICE9PSB1bmRlZmluZWQpIGUuaW5uZXJIVE1MID0gaHRtbDsKICByZXR1cm4gZTsKfTsKY29uc3QgZXNjID0gKHMpID0+IFN0cmluZyhzID8/ICIiKS5yZXBsYWNlKC8mL2csICImYW1wOyIpLnJlcGxhY2UoLzwvZywgIiZsdDsiKS5yZXBsYWNlKC8+L2csICImZ3Q7IikucmVwbGFjZSgvIi9nLCAiJnF1b3Q7Iik7CmNvbnN0IHBhZDIgPSAobikgPT4gU3RyaW5nKG4pLnBhZFN0YXJ0KDIsICIwIik7CgpmdW5jdGlvbiB0b2FzdChtc2cpIHsKICBjb25zdCB0ID0gJCgiI3RvYXN0Iik7CiAgdC50ZXh0Q29udGVudCA9IG1zZzsKICB0LmNsYXNzTGlzdC5hZGQoInNob3ciKTsKICBjbGVhclRpbWVvdXQodC5fdGltZXIpOwogIHQuX3RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0LmNsYXNzTGlzdC5yZW1vdmUoInNob3ciKSwgMjQwMCk7Cn0KZnVuY3Rpb24gbG9hZGluZyhzaG93LCB0ZXh0ID0gIuWkhOeQhuS4rS4uLiIpIHsKICAkKCIjbG9hZGluZyIpLmNsYXNzTGlzdC50b2dnbGUoImhpZGRlbiIsICFzaG93KTsKICBpZiAoc2hvdykgJCgiI2xvYWRpbmdUZXh0IikudGV4dENvbnRlbnQgPSB0ZXh0Owp9CgovKiAtLS0tLS0tLS0tLS0tLS0tIEFQSSAtLS0tLS0tLS0tLS0tLS0tICovCmFzeW5jIGZ1bmN0aW9uIGFwaShwYXRoLCBvcHRzID0ge30pIHsKICBjb25zdCBoZWFkZXJzID0gb3B0cy5oZWFkZXJzIHx8IHt9OwogIGlmIChzdGF0ZS5zZXNzaW9uKSBoZWFkZXJzWyJ4LXNlc3Npb24tdG9rZW4iXSA9IHN0YXRlLnNlc3Npb247CiAgaWYgKG9wdHMuYm9keSAmJiB0eXBlb2Ygb3B0cy5ib2R5ID09PSAib2JqZWN0IiAmJiAhKG9wdHMuYm9keSBpbnN0YW5jZW9mIEZvcm1EYXRhKSkgewogICAgaGVhZGVyc1siY29udGVudC10eXBlIl0gPSAiYXBwbGljYXRpb24vanNvbiI7CiAgICBvcHRzLmJvZHkgPSBKU09OLnN0cmluZ2lmeShvcHRzLmJvZHkpOwogIH0KICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2gocGF0aCwgeyAuLi5vcHRzLCBoZWFkZXJzIH0pOwogIGNvbnN0IHRva2VuID0gcmVzcC5oZWFkZXJzLmdldCgieC1zZXNzaW9uLXRva2VuIik7CiAgaWYgKHRva2VuKSBzdGF0ZS5zZXNzaW9uID0gdG9rZW47CiAgY29uc3QgY3QgPSByZXNwLmhlYWRlcnMuZ2V0KCJjb250ZW50LXR5cGUiKSB8fCAiIjsKICBpZiAoY3QuaW5jbHVkZXMoImFwcGxpY2F0aW9uL2pzb24iKSkgewogICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpOwogICAgaWYgKCFyZXNwLm9rIHx8IGRhdGEub2sgPT09IGZhbHNlKSB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvciB8fCBg6K+35rGC5aSx6LSlICR7cmVzcC5zdGF0dXN9YCk7CiAgICByZXR1cm4gZGF0YTsKICB9CiAgcmV0dXJuIHJlc3A7Cn0KCi8qIC0tLS0tLS0tLS0tLS0tLS0g6KeG5Zu+5YiH5o2iIC0tLS0tLS0tLS0tLS0tLS0gKi8KZnVuY3Rpb24gc2hvd1ZpZXcobmFtZSkgewogIHN0YXRlLnZpZXcgPSBuYW1lOwogIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIi52aWV3IikuZm9yRWFjaCh2ID0+IHYuY2xhc3NMaXN0LnJlbW92ZSgiaXMtYWN0aXZlIikpOwogICQoIiN2aWV3LSIgKyBuYW1lKS5jbGFzc0xpc3QuYWRkKCJpcy1hY3RpdmUiKTsKICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7Cn0KCmZ1bmN0aW9uIGJhY2tUb0xpYnJhcnkoKSB7CiAgc2hvd1ZpZXcoImxpYnJhcnkiKTsKICBsb2FkUHJvamVjdHMoKTsKfQoKLyogLS0tLS0tLS0tLS0tLS0tLSDlupPpppbpobUgLS0tLS0tLS0tLS0tLS0tLSAqLwpmdW5jdGlvbiBwcm9qZWN0U3RhdHVzKHApIHsKICBjb25zdCBzdGVwID0gcC5jdXJyZW50X3N0ZXAgfHwgMDsKICBpZiAoc3RlcCA+PSA3KSByZXR1cm4gImRvbmUiOwogIGlmIChzdGVwID09PSAwICYmICFwLnRvcGljKSByZXR1cm4gImRyYWZ0IjsKICByZXR1cm4gImluLXByb2dyZXNzIjsKfQoKZnVuY3Rpb24gcHJvamVjdERlc2MocCkgewogIGNvbnN0IHN0ZXAgPSBwLmN1cnJlbnRfc3RlcCB8fCAwOwogIGlmIChzdGVwID09PSAwKSByZXR1cm4gcC50b3BpYyA/ICLntKDmnZDovpPlhaXpmLbmrrXvvIznrYnlvoXog4zmma/kuIrkuIvmlofjgIIiIDogIuWwmuacquW8gOWni+eahOWGheWuueiNieeov++8jOetieW+hee0oOadkOi+k+WFpeOAgiI7CiAgaWYgKHN0ZXAgPj0gNykgcmV0dXJuICLlt7LkuqTku5jlrozmiJDvvIzlvZLmoaPkv53nlZnjgIIiOwogIGNvbnN0IGxhYmVscyA9IFsi6IOM5pmv57Sg5p2Q6Zi25q61IiwgIuWPl+S8l+WIhuaekOmYtuautSIsICLmoYbmnrbmnoTlu7rpmLbmrrUiLCAi5YaF5a655rex5YyW6Zi25q61IiwgIumjjuagvOWumuiwg+mYtuautSIsICLnlJ/miJDlubvnga/niYfpmLbmrrUiLCAi57K+5L+u6Zi25q61Il07CiAgcmV0dXJuIGDmraPlnKjov5vooYwgJHtsYWJlbHNbc3RlcF0gfHwgIuWIm+S9nOS4rSJ944CCYDsKfQoKZnVuY3Rpb24gdGltZUFnbyh0cykgewogIGlmICghdHMpIHJldHVybiAi4oCUIjsKICBjb25zdCBkID0gbmV3IERhdGUodHlwZW9mIHRzID09PSAibnVtYmVyIiA/IHRzICogMTAwMCA6IHRzKTsKICBjb25zdCBkaWZmID0gKERhdGUubm93KCkgLSBkLmdldFRpbWUoKSkgLyAxMDAwOwogIGlmIChkaWZmIDwgNjApIHJldHVybiAianVzdCBub3ciOwogIGlmIChkaWZmIDwgMzYwMCkgcmV0dXJuIE1hdGguZmxvb3IoZGlmZiAvIDYwKSArICJtIGFnbyI7CiAgaWYgKGRpZmYgPCA4NjQwMCkgcmV0dXJuIE1hdGguZmxvb3IoZGlmZiAvIDM2MDApICsgImggYWdvIjsKICBpZiAoZGlmZiA8IDYwNDgwMCkgcmV0dXJuIE1hdGguZmxvb3IoZGlmZiAvIDg2NDAwKSArICJkIGFnbyI7CiAgcmV0dXJuIE1hdGguZmxvb3IoZGlmZiAvIDYwNDgwMCkgKyAidyBhZ28iOwp9CgpmdW5jdGlvbiByZW5kZXJMaWJyYXJ5KCkgewogIGNvbnN0IGdyaWQgPSAkKCIjZGVja0dyaWQiKTsKICBpZiAoIWdyaWQpIHJldHVybjsKCiAgLy8g6K6h5pWwCiAgY29uc3QgY291bnRzID0geyBhbGw6IHN0YXRlLnByb2plY3RzLmxlbmd0aCwgImluLXByb2dyZXNzIjogMCwgZHJhZnQ6IDAsIGRvbmU6IDAgfTsKICBzdGF0ZS5wcm9qZWN0cy5mb3JFYWNoKHAgPT4geyBjb3VudHNbcHJvamVjdFN0YXR1cyhwKV0rKzsgfSk7CiAgT2JqZWN0LmtleXMoY291bnRzKS5mb3JFYWNoKGsgPT4gewogICAgY29uc3QgZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWNvdW50PSIke2t9Il1gKTsKICAgIGlmIChlKSBlLnRleHRDb250ZW50ID0gY291bnRzW2tdOwogIH0pOwoKICAvLyDov4fmu6QKICBjb25zdCBrZXl3b3JkID0gc3RhdGUuc2VhcmNoS2V5d29yZC50b0xvd2VyQ2FzZSgpLnRyaW0oKTsKICBjb25zdCBmaWx0ZXJlZCA9IHN0YXRlLnByb2plY3RzLmZpbHRlcihwID0+IHsKICAgIGlmIChzdGF0ZS5maWx0ZXIgIT09ICJhbGwiICYmIHByb2plY3RTdGF0dXMocCkgIT09IHN0YXRlLmZpbHRlcikgcmV0dXJuIGZhbHNlOwogICAgaWYgKGtleXdvcmQgJiYgIShwLnRvcGljIHx8ICIiKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGtleXdvcmQpKSByZXR1cm4gZmFsc2U7CiAgICByZXR1cm4gdHJ1ZTsKICB9KTsKCiAgaWYgKCFzdGF0ZS5wcm9qZWN0cy5sZW5ndGgpIHsKICAgIGdyaWQuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9ImxpYi1lbXB0eSI+PGRpdiBjbGFzcz0ibWFyayI+4oCUPC9kaXY+PGgyPuWIm+S9nOW6k+i/mOaYr+epuueahDwvaDI+PHA+54K55Ye75Y+z5LiK6KeSICJOZXcgRGVjayIg5byA5aeL5L2g55qE56ys5LiA5Liq6aG555uuPC9wPjwvZGl2PmA7CiAgICByZXR1cm47CiAgfQoKICBsZXQgaHRtbCA9IGZpbHRlcmVkLm1hcChwID0+IHsKICAgIGNvbnN0IHN0YXR1cyA9IHByb2plY3RTdGF0dXMocCk7CiAgICBjb25zdCBzdGVwID0gcC5jdXJyZW50X3N0ZXAgfHwgMDsKICAgIGNvbnN0IHByb2dyZXNzID0gTWF0aC5yb3VuZCgoc3RlcCAvIDcpICogMTAwKTsKICAgIGNvbnN0IHN0ZXBMYWJlbCA9IFNURVBTW3N0ZXBdPy5sYWJlbCB8fCAi5pyq5byA5aeLIjsKICAgIGNvbnN0IGJhZGdlVGV4dCA9IHN0YXR1cyA9PT0gImRvbmUiID8gIkRPTkUiIDogc3RhdHVzID09PSAiZHJhZnQiID8gIkRSQUZUIiA6ICJJTiBQUk9HUkVTUyI7CiAgICBjb25zdCBmb290SWNvbiA9IHN0YXR1cyA9PT0gImRvbmUiID8gIuKYhSBTdGFycmVkIiA6IHN0YXR1cyA9PT0gImRyYWZ0IiA/ICLil4sgRHJhZnQiIDogIuKXkCBBY3RpdmUiOwoKICAgIC8vIOe8qeeVpeWbvgogICAgbGV0IHRodW1iOwogICAgaWYgKHAudG9waWMpIHsKICAgICAgdGh1bWIgPSBgPGRpdiBjbGFzcz0idGh1bWItd3JhcCI+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC1iYWRnZSAke3N0YXR1c30iPiR7YmFkZ2VUZXh0fTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InNsaWRlLWV5ZWJyb3ciPiR7cGFkMihzdGVwKX0gwrcgJHtlc2Moc3RlcExhYmVsKX08L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJzbGlkZS10aXRsZSI+JHtlc2MocC50b3BpYyl9PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ic2xpZGUta3BpIj4ke3Byb2dyZXNzfSU8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJzbGlkZS1rcGktbGFiZWwiPlBST0dSRVNTIMK3IFNURVAgJHtzdGVwfSAvIDc8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJzbGlkZS1zb3VyY2UiPgogICAgICAgICAgPHNwYW4+U09VUkNFIMK3IFBMRU9OIFNUVURJTzwvc3Bhbj4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJjb3JuZXItbWFyayI+4oCUIFBsZW9uPC9zcGFuPgogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj5gOwogICAgfSBlbHNlIHsKICAgICAgdGh1bWIgPSBgPGRpdiBjbGFzcz0idGh1bWItd3JhcCBlbXB0eS10aHVtYiI+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC1iYWRnZSAke3N0YXR1c30iPiR7YmFkZ2VUZXh0fTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InBsYWNlaG9sZGVyLW1hcmsiPuKAlDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InBsYWNlaG9sZGVyLXRleHQiPk5PVCBTVEFSVEVEPC9kaXY+CiAgICAgIDwvZGl2PmA7CiAgICB9CgogICAgcmV0dXJuIGA8ZGl2IGNsYXNzPSJkZWNrLWNhcmQiIGRhdGEtaWQ9IiR7ZXNjKHAuaWQpfSI+CiAgICAgICR7dGh1bWJ9CiAgICAgIDxkaXYgY2xhc3M9ImNhcmQtYm9keSI+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+JHtlc2MocC50b3BpYyB8fCAi5pyq5ZG95ZCNIERlY2siKX08L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLWRlc2MiPiR7ZXNjKHByb2plY3REZXNjKHApKX08L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLXByb2dyZXNzIj4KICAgICAgICAgIDxkaXYgY2xhc3M9InByb2dyZXNzLWJhciI+PGRpdiBjbGFzcz0icHJvZ3Jlc3MtZmlsbCAke3N0YXR1cyA9PT0gImRvbmUiID8gImRvbmUiIDogIiJ9IiBzdHlsZT0id2lkdGg6JHtwcm9ncmVzc30lIj48L2Rpdj48L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InByb2dyZXNzLW1ldGEiPgogICAgICAgICAgICA8c3Bhbj48c3BhbiBjbGFzcz0ic3RlcCAke3N0YXR1cyA9PT0gImRvbmUiID8gImRvbmUiIDogIiJ9Ij5TdGVwICR7c3RlcH08L3NwYW4+IC8gNyDCtyAke2VzYyhzdGVwTGFiZWwpfTwvc3Bhbj4KICAgICAgICAgICAgPHNwYW4+JHtzdGF0dXMgPT09ICJkb25lIiA/ICLlt7LlrozmiJAiIDogc3RhdHVzID09PSAiZHJhZnQiID8gIuacquW8gOWniyIgOiAi6L+b6KGM5LitIn08L3NwYW4+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLWZvb3QiPgogICAgICAgICAgPHNwYW4+JHtmb290SWNvbn08L3NwYW4+CiAgICAgICAgICA8c3BhbiBjbGFzcz0idXBkYXRlZCI+JHt0aW1lQWdvKHAudXBkYXRlZF9hdCl9PC9zcGFuPgogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj4KICAgIDwvZGl2PmA7CiAgfSkuam9pbigiIik7CgogIC8vIOaWsOW7uuWNoeeJhwogIGlmIChmaWx0ZXJlZC5sZW5ndGggPT09IHN0YXRlLnByb2plY3RzLmxlbmd0aCkgewogICAgaHRtbCArPSBgPGRpdiBjbGFzcz0ibmV3LWNhcmQiIGlkPSJsaWJOZXdDYXJkIj48ZGl2IGNsYXNzPSJwbHVzIj4rPC9kaXY+PGRpdiBjbGFzcz0ibGFiZWwiPuW8gOWni+S4gOS4quaWsOeahCBEZWNrPC9kaXY+PGRpdiBjbGFzcz0iaGludCI+RlJPTSBTQ1JBVENIIMK3IEJMQU5LIENBTlZBUzwvZGl2PjwvZGl2PmA7CiAgfQoKICBncmlkLmlubmVySFRNTCA9IGh0bWw7CgogIC8vIOe7keWumueCueWHuwogIGdyaWQucXVlcnlTZWxlY3RvckFsbCgiLmRlY2stY2FyZCIpLmZvckVhY2goYyA9PiB7CiAgICBjLm9uY2xpY2sgPSAoKSA9PiBvcGVuUHJvamVjdChjLmRhdGFzZXQuaWQpOwogIH0pOwogIGNvbnN0IG5ld0NhcmQgPSAkKCIjbGliTmV3Q2FyZCIpOwogIGlmIChuZXdDYXJkKSBuZXdDYXJkLm9uY2xpY2sgPSBjcmVhdGVQcm9qZWN0Owp9CgovKiAtLS0tLS0tLS0tLS0tLS0tIOS8muivneS4jumhueebriAtLS0tLS0tLS0tLS0tLS0tICovCmFzeW5jIGZ1bmN0aW9uIGluaXRTZXNzaW9uKCkgewogIHN0YXRlLnNlc3Npb24gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgicHB0X3Nlc3Npb24iKTsKICBjb25zdCByID0gYXdhaXQgYXBpKCIvYXBpL3Nlc3Npb24iKTsKICBzdGF0ZS5zZXNzaW9uID0gci5zZXNzaW9uOwogIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCJwcHRfc2Vzc2lvbiIsIHIuc2Vzc2lvbik7Cn0KCmFzeW5jIGZ1bmN0aW9uIGxvYWRQcm9qZWN0cygpIHsKICB0cnkgewogICAgY29uc3QgciA9IGF3YWl0IGFwaSgiL2FwaS9wcm9qZWN0cyIpOwogICAgc3RhdGUucHJvamVjdHMgPSByLnByb2plY3RzIHx8IFtdOwogICAgcmVuZGVyTGlicmFyeSgpOwogIH0gY2F0Y2ggKGUpIHsKICAgIHRvYXN0KCLliqDovb3pobnnm67liJfooajlpLHotKXvvJoiICsgZS5tZXNzYWdlKTsKICB9Cn0KCmFzeW5jIGZ1bmN0aW9uIG9wZW5Qcm9qZWN0KGlkKSB7CiAgbG9hZGluZyh0cnVlLCAi5Yqg6L296aG555uuLi4uIik7CiAgdHJ5IHsKICAgIGNvbnN0IHIgPSBhd2FpdCBhcGkoYC9hcGkvcHJvamVjdHMvJHtpZH1gKTsKICAgIHN0YXRlLnByb2plY3RJZCA9IGlkOwogICAgc3RhdGUucHJvamVjdCA9IHIucHJvamVjdDsKICAgIHN0YXRlLmF1ZGllbmNlID0gci5hdWRpZW5jZTsKICAgIHN0YXRlLmZyYW1ld29yayA9IHIuZnJhbWV3b3JrOwogICAgc3RhdGUudGl0bGVzID0gci50aXRsZXMgfHwgW107CiAgICBzdGF0ZS5wYWdlcyA9IHIucGFnZXMgfHwgW107CiAgICBzdGF0ZS5zdHlsZSA9IHIuc3R5bGU7CiAgICBzdGF0ZS5zbGlkZXMgPSByLnNsaWRlcyB8fCBbXTsKICAgIHN0YXRlLm1hdGVyaWFscyA9IHIubWF0ZXJpYWxzIHx8IFtdOwogICAgc3RhdGUuc3RlcCA9IE1hdGgubWluKHIucHJvamVjdC5jdXJyZW50X3N0ZXAgfHwgMCwgNyk7CiAgICBzdGF0ZS5jdXJyZW50U2xpZGUgPSAwOwogICAgLy8g5pu05paw6aG555uu6Z2i5YyF5bGRCiAgICBjb25zdCBzdGF0dXMgPSBwcm9qZWN0U3RhdHVzKHIucHJvamVjdCk7CiAgICAkKCIjcHJvakNydW1iTmFtZSIpLnRleHRDb250ZW50ID0gci5wcm9qZWN0LnRvcGljIHx8ICLmnKrlkb3lkI0gRGVjayI7CiAgICBjb25zdCBtZXRhID0gJCgiI3Byb2pDcnVtYk1ldGEiKTsKICAgIG1ldGEudGV4dENvbnRlbnQgPSBzdGF0dXMgPT09ICJkb25lIiA/ICJET05FIiA6IHN0YXR1cyA9PT0gImRyYWZ0IiA/ICJEUkFGVCIgOiAiSU4gUFJPR1JFU1MiOwogICAgbWV0YS5jbGFzc05hbWUgPSAibWV0YSAiICsgc3RhdHVzOwogICAgc2hvd1ZpZXcoInByb2plY3QiKTsKICAgIHJlbmRlckFsbCgpOwogIH0gY2F0Y2ggKGUpIHsKICAgIHRvYXN0KCLliqDovb3lpLHotKXvvJoiICsgZS5tZXNzYWdlKTsKICB9IGZpbmFsbHkgewogICAgbG9hZGluZyhmYWxzZSk7CiAgfQp9Cgphc3luYyBmdW5jdGlvbiBjcmVhdGVQcm9qZWN0KCkgewogIGNvbnN0IHRvcGljID0gcHJvbXB0KCLovpPlhaUgUFBUIOS4u+mimO+8iOWPr+eojeWQjuWcqCBTdGVwIDIg57uG5YyW77yJ77yaIiwgIiIpOwogIGlmICh0b3BpYyA9PT0gbnVsbCkgcmV0dXJuOwogIGxvYWRpbmcodHJ1ZSwgIuWIm+W7uumhueebri4uLiIpOwogIHRyeSB7CiAgICBjb25zdCByID0gYXdhaXQgYXBpKCIvYXBpL3Byb2plY3RzIiwgeyBtZXRob2Q6ICJQT1NUIiwgYm9keTogeyB0b3BpYyB9IH0pOwogICAgc3RhdGUucHJvamVjdElkID0gci5wcm9qZWN0LmlkOwogICAgc3RhdGUuc3RlcCA9IDA7CiAgICBzdGF0ZS5hdWRpZW5jZSA9IG51bGw7IHN0YXRlLmZyYW1ld29yayA9IG51bGw7IHN0YXRlLnRpdGxlcyA9IFtdOyBzdGF0ZS5wYWdlcyA9IFtdOyBzdGF0ZS5zbGlkZXMgPSBbXTsgc3RhdGUuc3R5bGUgPSBudWxsOwogICAgc3RhdGUucHJvamVjdCA9IHIucHJvamVjdDsKICAgIGF3YWl0IGxvYWRQcm9qZWN0cygpOwogICAgLy8g55u05o6l6L+b5YWl6aG555uu6KeG5Zu+CiAgICAkKCIjcHJvakNydW1iTmFtZSIpLnRleHRDb250ZW50ID0gci5wcm9qZWN0LnRvcGljIHx8ICLmnKrlkb3lkI0gRGVjayI7CiAgICBjb25zdCBtZXRhID0gJCgiI3Byb2pDcnVtYk1ldGEiKTsKICAgIG1ldGEudGV4dENvbnRlbnQgPSAiRFJBRlQiOwogICAgbWV0YS5jbGFzc05hbWUgPSAibWV0YSBkcmFmdCI7CiAgICBzaG93VmlldygicHJvamVjdCIpOwogICAgcmVuZGVyQWxsKCk7CiAgICB0b2FzdCgi6aG555uu5bey5Yib5bu677yM5LuOIFN0ZXAgMCDog4zmma/ovpPlhaXlvIDlp4siKTsKICB9IGNhdGNoIChlKSB7CiAgICB0b2FzdCgi5Yib5bu65aSx6LSl77yaIiArIGUubWVzc2FnZSk7CiAgfSBmaW5hbGx5IHsKICAgIGxvYWRpbmcoZmFsc2UpOwogIH0KfQoKLyogLS0tLS0tLS0tLS0tLS0tLSDmuLLmn5PmoYbmnrYgLS0tLS0tLS0tLS0tLS0tLSAqLwpmdW5jdGlvbiByZW5kZXJTdGVwcGVyKCkgewogIGNvbnN0IHdyYXAgPSAkKCIjY2Fwc1N0ZXBwZXIiKTsKICBpZiAoIXdyYXApIHJldHVybjsKICBjb25zdCBjdXIgPSBzdGF0ZS5zdGVwOwogIGxldCBodG1sID0gIiI7CiAgU1RFUFMuZm9yRWFjaCgocywgaSkgPT4gewogICAgY29uc3QgY2xzID0gImNhcHMiICsgKHMubiA9PT0gY3VyID8gIiBpcy1hY3RpdmUiIDogIiIpICsgKHMubiA8IGN1ciA/ICIgaXMtZG9uZSIgOiAiIikgKyAocy5uID09PSAwID8gIiBpcy1vcHRpb25hbCIgOiAiIik7CiAgICBodG1sICs9IGA8ZGl2IGNsYXNzPSIke2Nsc30iIGRhdGEtc3RlcD0iJHtzLm59Ij48c3BhbiBjbGFzcz0iYy1uIj4ke3BhZDIocy5uKX08L3NwYW4+PHNwYW4gY2xhc3M9ImMtbCI+JHtlc2Mocy5sYWJlbCl9PC9zcGFuPjwvZGl2PmA7CiAgICBpZiAoaSA8IFNURVBTLmxlbmd0aCAtIDEpIGh0bWwgKz0gYDxzcGFuIGNsYXNzPSJjYXBzLXNlcCI+PC9zcGFuPmA7CiAgfSk7CiAgd3JhcC5pbm5lckhUTUwgPSBodG1sOwogIHdyYXAucXVlcnlTZWxlY3RvckFsbCgiLmNhcHMiKS5mb3JFYWNoKGMgPT4gewogICAgYy5vbmNsaWNrID0gKCkgPT4geyBpZiAoc3RhdGUucHJvamVjdElkKSB7IHN0YXRlLnN0ZXAgPSArYy5kYXRhc2V0LnN0ZXA7IHNhdmVTdGVwTmF2KHN0YXRlLnN0ZXApOyByZW5kZXJBbGwoKTsgfSB9OwogIH0pOwp9CgpmdW5jdGlvbiByZW5kZXJBbGwoKSB7CiAgcmVuZGVyU3RlcHBlcigpOwogIHJlbmRlclNvdXJjZXMoKTsKICByZW5kZXJXb3Jrc3BhY2UoKTsKICByZW5kZXJOb3RlcygpOwp9CgovKiA9PT09PT09PT09PT0gU291cmNlcyDlhajlsYDpnaLmnb/vvIhUYXNrIDTvvIkgPT09PT09PT09PT09ICovCmZ1bmN0aW9uIHJlbmRlclNvdXJjZXMoKSB7CiAgY29uc3QgcGFuZWwgPSAkKCIjc291cmNlc1BhbmVsIik7CiAgaWYgKCFwYW5lbCkgcmV0dXJuOwogIGlmICghc3RhdGUucHJvamVjdElkKSB7IHBhbmVsLmlubmVySFRNTCA9ICIiOyByZXR1cm47IH0KCiAgLyog5ZCM5q2l5oqY5Y+g5oCB5YiwIC5wcm9qZWN0LWxheW91dCDkuI4gLnNvdXJjZXMtcGFuZWwgKi8KICBjb25zdCBsYXlvdXQgPSAkKCIucHJvamVjdC1sYXlvdXQiKTsKICBpZiAobGF5b3V0KSBsYXlvdXQuY2xhc3NMaXN0LnRvZ2dsZSgic291cmNlcy1jb2xsYXBzZWQiLCAhIXN0YXRlLnNvdXJjZXNDb2xsYXBzZWQpOwogIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoImlzLWNvbGxhcHNlZCIsICEhc3RhdGUuc291cmNlc0NvbGxhcHNlZCk7CgogIC8qIOaKmOWPoOaAge+8muS7hea4suafk+S4gOS4quWxleW8gOaMiemSru+8iHJhaWzvvIkgKi8KICBpZiAoc3RhdGUuc291cmNlc0NvbGxhcHNlZCkgewogICAgcGFuZWwuaW5uZXJIVE1MID0gYDxidXR0b24gaWQ9InNyY0V4cGFuZCIgdGl0bGU9IuWxleW8gCBTb3VyY2VzIiBzdHlsZT0icG9zaXRpb246YWJzb2x1dGU7dG9wOjE0cHg7bGVmdDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSk7d2lkdGg6MjZweDtoZWlnaHQ6MjZweDtib3JkZXItcmFkaXVzOjVweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWVkZ2UtMik7YmFja2dyb3VuZDp2YXIoLS1zbGF0ZSk7Y29sb3I6dmFyKC0tY2hhbGspO2N1cnNvcjpwb2ludGVyO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1zaXplOjE0cHg7bGluZS1oZWlnaHQ6MTt0cmFuc2l0aW9uOmFsbCAuMnM7Ij7igLo8L2J1dHRvbj5gOwogICAgY29uc3QgZXggPSAkKCIjc3JjRXhwYW5kIik7CiAgICBpZiAoZXgpIHsKICAgICAgZXgub25tb3VzZWVudGVyID0gKCkgPT4geyBleC5zdHlsZS5jb2xvciA9ICJ2YXIoLS1jaGFtcGFnbmUpIjsgZXguc3R5bGUuYm9yZGVyQ29sb3IgPSAidmFyKC0tY2hhbXBhZ25lKSI7IGV4LnN0eWxlLmJhY2tncm91bmQgPSAidmFyKC0tY2hhbXBhZ25lLWdsb3cpIjsgfTsKICAgICAgZXgub25tb3VzZWxlYXZlID0gKCkgPT4geyBleC5zdHlsZS5jb2xvciA9ICJ2YXIoLS1jaGFsaykiOyBleC5zdHlsZS5ib3JkZXJDb2xvciA9ICJ2YXIoLS1lZGdlLTIpIjsgZXguc3R5bGUuYmFja2dyb3VuZCA9ICJ2YXIoLS1zbGF0ZSkiOyB9OwogICAgICBleC5vbmNsaWNrID0gKCkgPT4geyBzdGF0ZS5zb3VyY2VzQ29sbGFwc2VkID0gZmFsc2U7IHJlbmRlclNvdXJjZXMoKTsgfTsKICAgIH0KICAgIHJldHVybjsKICB9CgogIC8qIOWxleW8gOaAge+8mmhlYWRlciArIOe0oOadkOWIl+ihqCArIOW+hemHjeeul+aPkOekuuadoSArIENvbnRleHQgUGFjayDmipjlj6DljLogKi8KICBjb25zdCBtYXRzID0gQXJyYXkuaXNBcnJheShzdGF0ZS5tYXRlcmlhbHMpID8gc3RhdGUubWF0ZXJpYWxzIDogW107CiAgY29uc3QgY291bnQgPSBtYXRzLmxlbmd0aDsKCiAgY29uc3QgYWRkTWVudUh0bWwgPSBgCiAgICA8ZGl2IGlkPSJzcmNBZGRNZW51IiBzdHlsZT0icG9zaXRpb246YWJzb2x1dGU7dG9wOjMycHg7cmlnaHQ6MDt3aWR0aDoxNzBweDtiYWNrZ3JvdW5kOnZhcigtLXNsYXRlLTIpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZWRnZS0yKTtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjZweDtib3gtc2hhZG93OjAgMTJweCAzMnB4IHJnYmEoMCwwLDAsLjUpO3otaW5kZXg6MzA7b3BhY2l0eTowO3RyYW5zZm9ybTp0cmFuc2xhdGVZKC00cHgpO3BvaW50ZXItZXZlbnRzOm5vbmU7dHJhbnNpdGlvbjphbGwgLjE4czsiPgogICAgICA8ZGl2IGRhdGEtYWN0PSJhZGQtdGV4dCIgc3R5bGU9ImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjlweDtwYWRkaW5nOjhweCAxMHB4O2JvcmRlci1yYWRpdXM6NXB4O2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWNoYWxrKTtjdXJzb3I6cG9pbnRlcjt0cmFuc2l0aW9uOmJhY2tncm91bmQgLjE1czsiPjxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS1jaGFtcGFnbmUpO3dpZHRoOjE0cHg7ZGlzcGxheTppbmxpbmUtZmxleDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyI+wrY8L3NwYW4+PHNwYW4+5re75Yqg5paH5a2XPC9zcGFuPjwvZGl2PgogICAgICA8ZGl2IGRhdGEtYWN0PSJhZGQtbGluayIgc3R5bGU9ImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjlweDtwYWRkaW5nOjhweCAxMHB4O2JvcmRlci1yYWRpdXM6NXB4O2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWNoYWxrKTtjdXJzb3I6cG9pbnRlcjt0cmFuc2l0aW9uOmJhY2tncm91bmQgLjE1czsiPjxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS1zYWdlKTt3aWR0aDoxNHB4O2Rpc3BsYXk6aW5saW5lLWZsZXg7anVzdGlmeS1jb250ZW50OmNlbnRlcjsiPuKMljwvc3Bhbj48c3Bhbj7lr7zlhaXpk77mjqU8L3NwYW4+PC9kaXY+CiAgICAgIDxkaXYgZGF0YS1hY3Q9ImFkZC1maWxlIiBzdHlsZT0iZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OXB4O3BhZGRpbmc6OHB4IDEwcHg7Ym9yZGVyLXJhZGl1czo1cHg7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tY2hhbGspO2N1cnNvcjpwb2ludGVyO3RyYW5zaXRpb246YmFja2dyb3VuZCAuMTVzOyI+PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLWVtYmVyKTt3aWR0aDoxNHB4O2Rpc3BsYXk6aW5saW5lLWZsZXg7anVzdGlmeS1jb250ZW50OmNlbnRlcjsiPuKGpTwvc3Bhbj48c3Bhbj7kuIrkvKDmlofku7Y8L3NwYW4+PC9kaXY+CiAgICA8L2Rpdj4KICBgOwoKICBjb25zdCBjYXJkc0h0bWwgPSBtYXRzLmxlbmd0aCA9PT0gMAogICAgPyBgPHAgc3R5bGU9ImNvbG9yOnZhcigtLXNtb2tlKTtmb250LXNpemU6MTFweDtwYWRkaW5nOjE4cHggNHB4O3RleHQtYWxpZ246Y2VudGVyOyI+5bCa5peg57Sg5p2Q77yM54K5ICsg5re75YqgPC9wPmAKICAgIDogbWF0cy5tYXAocmVuZGVyU3JjQ2FyZCkuam9pbigiIik7CgogIGNvbnN0IHJlY2FsY0h0bWwgPSBzdGF0ZS5wZW5kaW5nUmVjYWxjID4gMAogICAgPyBgPGRpdiBjbGFzcz0icmVjYWxjLWJhciI+PGRpdiBjbGFzcz0icmVjYWxjLXR4dCI+PGI+JHtzdGF0ZS5wZW5kaW5nUmVjYWxjfTwvYj4g5p2h5paw57Sg5p2Q5b6F6YeN566XPC9kaXY+PGJ1dHRvbiBjbGFzcz0icmVjYWxjLWJ0biIgaWQ9InJlY2FsY05vdyI+56uL5Y2z5pu05pawPC9idXR0b24+PC9kaXY+YAogICAgOiAiIjsKCiAgY29uc3QgY3R4UGFja0h0bWwgPSBzdGF0ZS5jb250ZXh0UGFjayA/IHJlbmRlckN0eFBhY2soc3RhdGUuY29udGV4dFBhY2spIDogIiI7CgogIHBhbmVsLmlubmVySFRNTCA9IGAKICAgIDxkaXYgY2xhc3M9InNyYy1oZWFkIj4KICAgICAgPHNwYW4gY2xhc3M9InNyYy10aXRsZSI+U291cmNlcyA8Yj4ke2NvdW50fTwvYj48L3NwYW4+CiAgICAgIDxkaXYgaWQ9InNyY0FkZFdyYXAiIHN0eWxlPSJwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4OyI+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0ic3JjLWFkZC1idG4iIGlkPSJzcmNBZGQiIHRpdGxlPSLmt7vliqDntKDmnZAiPis8L2J1dHRvbj4KICAgICAgICAke2FkZE1lbnVIdG1sfQogICAgICAgIDxidXR0b24gaWQ9InNyY0NvbGxhcHNlIiB0aXRsZT0i5oqY5Y+gIiBzdHlsZT0id2lkdGg6MjZweDtoZWlnaHQ6MjZweDtib3JkZXItcmFkaXVzOjVweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWVkZ2UtMik7YmFja2dyb3VuZDp2YXIoLS1zbGF0ZSk7Y29sb3I6dmFyKC0tY2hhbGspO2N1cnNvcjpwb2ludGVyO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1zaXplOjEzcHg7bGluZS1oZWlnaHQ6MTt0cmFuc2l0aW9uOmFsbCAuMnM7ZmxleC1zaHJpbms6MDsiPuKAuTwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0ic3JjLWxpc3QiPiR7Y2FyZHNIdG1sfTwvZGl2PgogICAgJHtyZWNhbGNIdG1sfQogICAgJHtjdHhQYWNrSHRtbH0KICBgOwoKICBiaW5kU3JjRXZlbnRzKHBhbmVsKTsKfQoKZnVuY3Rpb24gcmVuZGVyU3JjQ2FyZChtKSB7CiAgY29uc3Qga2luZCA9IChtICYmIG0ua2luZCkgfHwgImZpbGUiOwogIGNvbnN0IGljID0ga2luZCA9PT0gInRleHQiID8gIsK2IiA6IGtpbmQgPT09ICJsaW5rIiA/ICLijJYiIDoga2luZCA9PT0gImltYWdlIiA/ICLilqYiIDogIuKGpSI7CiAgY29uc3QgaWNDb2xvciA9IGtpbmQgPT09ICJ0ZXh0IiA/ICJ2YXIoLS1jaGFtcGFnbmUpIiA6IGtpbmQgPT09ICJsaW5rIiA/ICJ2YXIoLS1zYWdlKSIgOiAidmFyKC0tZW1iZXIpIjsKICBjb25zdCBzdGF0dXMgPSBtLnN0YXR1cyA9PT0gInBhcnNlZCIgPyAib2siIDogbS5zdGF0dXMgPT09ICJwYXJzaW5nIiA/ICJwYXJzaW5nIiA6ICJwZW5kaW5nIjsKICBjb25zdCBzdGF0dXNMYWJlbCA9IHN0YXR1cyA9PT0gIm9rIiA/ICLlt7Lop6PmnpAiIDogc3RhdHVzID09PSAicGFyc2luZyIgPyAi6Kej5p6Q5LitIiA6ICLlvoXop6PmnpAiOwogIGNvbnN0IG5hbWUgPSBlc2MobS5uYW1lIHx8ICIo5pyq5ZG95ZCNKSIpOwogIC8qIOaRmOimge+8mkFQSSDov5Tlm57nmoQgc3VtbWFyeSDlj6/og73mmK/lr7nosaHmiJblrZfnrKbkuLLvvIznu5/kuIDmj5Dlj5bmlofmnKwgKi8KICBjb25zdCBzdW1SYXcgPSBtLnN1bW1hcnk7CiAgY29uc3Qgc3VtVGV4dCA9IHR5cGVvZiBzdW1SYXcgPT09ICJzdHJpbmciID8gc3VtUmF3IDogKHN1bVJhdyAmJiAoc3VtUmF3LnN1bW1hcnkgfHwgc3VtUmF3LmJhY2tncm91bmRfc3VtbWFyeSkpIHx8ICIiOwogIGNvbnN0IHN1bVN0ciA9IFN0cmluZyhzdW1UZXh0IHx8ICIiKTsKICBjb25zdCBzdW1IdG1sID0gc3VtU3RyID8gYDxkaXYgY2xhc3M9InNyYy1zdW1tYXJ5IiBzdHlsZT0ibWFyZ2luLXRvcDo0cHg7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tYXNoKTtsaW5lLWhlaWdodDoxLjQ1O2Rpc3BsYXk6LXdlYmtpdC1ib3g7LXdlYmtpdC1saW5lLWNsYW1wOjI7LXdlYmtpdC1ib3gtb3JpZW50OnZlcnRpY2FsO292ZXJmbG93OmhpZGRlbjsiPiR7ZXNjKHN1bVN0ci5zbGljZSgwLCAxNDApKX0ke3N1bVN0ci5sZW5ndGggPiAxNDAgPyAi4oCmIiA6ICIifTwvZGl2PmAgOiAiIjsKICByZXR1cm4gYAogICAgPGRpdiBjbGFzcz0ic3JjLWNhcmQiPgogICAgICA8ZGl2IHN0eWxlPSJ3aWR0aDoyNnB4O2hlaWdodDoyNnB4O2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQ6dmFyKC0tc2xhdGUtMyk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1lZGdlKTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2NvbG9yOiR7aWNDb2xvcn07ZmxleC1zaHJpbms6MDtmb250LXNpemU6MTJweDtmb250LWZhbWlseTp2YXIoLS1tb25vKTsiPiR7aWN9PC9kaXY+CiAgICAgIDxkaXYgc3R5bGU9ImZsZXg6MTttaW4td2lkdGg6MDsiPgogICAgICAgIDxkaXYgY2xhc3M9InNyYy1uYW1lIj4ke25hbWV9PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ic3JjLXN0YXR1cyAke3N0YXR1c30iPiR7c3RhdHVzTGFiZWx9PC9kaXY+CiAgICAgICAgJHtzdW1IdG1sfQogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogIGA7Cn0KCmZ1bmN0aW9uIHJlbmRlckN0eFBhY2socGFjaykgewogIGNvbnN0IGlzT3BlbiA9IHN0YXRlLmN0eFBhY2tDb2xsYXBzZWQgPyAiIiA6ICIgaXMtb3BlbiI7CiAgY29uc3QgZmFjdHMgPSAocGFjay5rZXlfZmFjdHMgfHwgW10pLm1hcChmID0+IGA8ZGl2IGNsYXNzPSJwaWxsYXItcG9pbnQiPiR7ZXNjKGYuZmFjdCl9JHtmLm11c3RfY2l0ZSA/ICc8c3BhbiBjbGFzcz0idGFnIHRhZy11c2VyIj7lv4XpobvlvJXnlKg8L3NwYW4+JyA6ICIifTwvZGl2PmApLmpvaW4oIiIpOwogIHJldHVybiBgCiAgICA8ZGl2IGNsYXNzPSJjdHgtcGFjayR7aXNPcGVufSI+CiAgICAgIDxkaXYgY2xhc3M9ImN0eC1wYWNrLWhlYWQiPgogICAgICAgIDxkaXYgY2xhc3M9ImNwLXRpdGxlIj48c3BhbiBjbGFzcz0iY3AtZG90Ij48L3NwYW4+Q29udGV4dCBQYWNrPC9kaXY+CiAgICAgICAgPHNwYW4gY2xhc3M9ImNwLWNoZXYiPuKWvjwvc3Bhbj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImN0eC1wYWNrLWJvZHkiPgogICAgICAgIDxwIHN0eWxlPSJtYXJnaW4tYm90dG9tOjEycHg7bGluZS1oZWlnaHQ6MS43O2NvbG9yOnZhcigtLWNoYWxrKTtmb250LXNpemU6MTJweDsiPiR7ZXNjKHBhY2suYmFja2dyb3VuZF9zdW1tYXJ5IHx8ICIiKX08L3A+CiAgICAgICAgPGgzIHN0eWxlPSJtYXJnaW4tdG9wOjEycHg7Zm9udC1mYW1pbHk6dmFyKC0tbW9ubyk7Zm9udC1zaXplOjEwcHg7bGV0dGVyLXNwYWNpbmc6MC4xOGVtO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTtjb2xvcjp2YXIoLS1hc2gpOyI+5YWz6ZSu5LqL5a6ePC9oMz4KICAgICAgICAke2ZhY3RzIHx8ICc8cCBzdHlsZT0iY29sb3I6dmFyKC0tYXNoKTtmb250LXNpemU6MTJweDsiPuaXoDwvcD4nfQogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogIGA7Cn0KCmZ1bmN0aW9uIGJpbmRTcmNFdmVudHMocGFuZWwpIHsKICAvKiDmipjlj6DpnaLmnb8gKi8KICBjb25zdCBjb2xsYXBzZUJ0biA9ICQoIiNzcmNDb2xsYXBzZSIsIHBhbmVsKTsKICBpZiAoY29sbGFwc2VCdG4pIHsKICAgIGNvbGxhcHNlQnRuLm9ubW91c2VlbnRlciA9ICgpID0+IHsgY29sbGFwc2VCdG4uc3R5bGUuY29sb3IgPSAidmFyKC0tY2hhbXBhZ25lKSI7IGNvbGxhcHNlQnRuLnN0eWxlLmJvcmRlckNvbG9yID0gInZhcigtLWNoYW1wYWduZSkiOyBjb2xsYXBzZUJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gInZhcigtLWNoYW1wYWduZS1nbG93KSI7IH07CiAgICBjb2xsYXBzZUJ0bi5vbm1vdXNlbGVhdmUgPSAoKSA9PiB7IGNvbGxhcHNlQnRuLnN0eWxlLmNvbG9yID0gInZhcigtLWNoYWxrKSI7IGNvbGxhcHNlQnRuLnN0eWxlLmJvcmRlckNvbG9yID0gInZhcigtLWVkZ2UtMikiOyBjb2xsYXBzZUJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gInZhcigtLXNsYXRlKSI7IH07CiAgICBjb2xsYXBzZUJ0bi5vbmNsaWNrID0gKCkgPT4geyBzdGF0ZS5zb3VyY2VzQ29sbGFwc2VkID0gdHJ1ZTsgcmVuZGVyU291cmNlcygpOyB9OwogIH0KCiAgLyog5re75Yqg5oyJ6ZKu5LiL5ouJ6I+c5Y2VICovCiAgY29uc3Qgd3JhcCA9ICQoIiNzcmNBZGRXcmFwIiwgcGFuZWwpOwogIGNvbnN0IGFkZEJ0biA9ICQoIiNzcmNBZGQiLCBwYW5lbCk7CiAgY29uc3QgbWVudSA9ICQoIiNzcmNBZGRNZW51IiwgcGFuZWwpOwogIGlmIChhZGRCdG4gJiYgbWVudSAmJiB3cmFwKSB7CiAgICBhZGRCdG4ub25jbGljayA9IChlKSA9PiB7CiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7CiAgICAgIGNvbnN0IG9wZW5lZCA9IHdyYXAuZGF0YXNldC5vcGVuID09PSAiMSI7CiAgICAgIGlmIChvcGVuZWQpIHsKICAgICAgICBtZW51LnN0eWxlLm9wYWNpdHkgPSAiMCI7CiAgICAgICAgbWVudS5zdHlsZS50cmFuc2Zvcm0gPSAidHJhbnNsYXRlWSgtNHB4KSI7CiAgICAgICAgbWVudS5zdHlsZS5wb2ludGVyRXZlbnRzID0gIm5vbmUiOwogICAgICAgIHdyYXAuZGF0YXNldC5vcGVuID0gIjAiOwogICAgICB9IGVsc2UgewogICAgICAgIG1lbnUuc3R5bGUub3BhY2l0eSA9ICIxIjsKICAgICAgICBtZW51LnN0eWxlLnRyYW5zZm9ybSA9ICJ0cmFuc2xhdGVZKDApIjsKICAgICAgICBtZW51LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAiYXV0byI7CiAgICAgICAgd3JhcC5kYXRhc2V0Lm9wZW4gPSAiMSI7CiAgICAgIH0KICAgIH07CiAgICBjb25zdCBjbG9zZU1lbnUgPSAoKSA9PiB7CiAgICAgIG1lbnUuc3R5bGUub3BhY2l0eSA9ICIwIjsKICAgICAgbWVudS5zdHlsZS50cmFuc2Zvcm0gPSAidHJhbnNsYXRlWSgtNHB4KSI7CiAgICAgIG1lbnUuc3R5bGUucG9pbnRlckV2ZW50cyA9ICJub25lIjsKICAgICAgd3JhcC5kYXRhc2V0Lm9wZW4gPSAiMCI7CiAgICB9OwogICAgLyog54K55Ye75aSW6YOo5YWz6ZetICovCiAgICBzZXRUaW1lb3V0KCgpID0+IHsKICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigiY2xpY2siLCBmdW5jdGlvbiBvbkRvY0NsaWNrKGUpIHsKICAgICAgICBpZiAoIXdyYXAuY29udGFpbnMoZS50YXJnZXQpKSB7CiAgICAgICAgICBjbG9zZU1lbnUoKTsKICAgICAgICAgIC8qIOiPnOWNleWFs+mXreWQjuenu+mZpOebkeWQrO+8jOmBv+WFjeazhOa8j++8iOS4i+asoSBiaW5kIOaXtumHjeaWsOaMgu+8iSAqLwogICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigiY2xpY2siLCBvbkRvY0NsaWNrKTsKICAgICAgICB9CiAgICAgIH0pOwogICAgfSwgMCk7CiAgICAvKiDoj5zljZXpobkgaG92ZXIgKi8KICAgIG1lbnUucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0XScpLmZvckVhY2gobWkgPT4gewogICAgICBtaS5vbm1vdXNlZW50ZXIgPSAoKSA9PiB7IG1pLnN0eWxlLmJhY2tncm91bmQgPSAidmFyKC0tc2xhdGUtMykiOyBtaS5zdHlsZS5jb2xvciA9ICJ2YXIoLS1pdm9yeSkiOyB9OwogICAgICBtaS5vbm1vdXNlbGVhdmUgPSAoKSA9PiB7IG1pLnN0eWxlLmJhY2tncm91bmQgPSAiIjsgbWkuc3R5bGUuY29sb3IgPSAidmFyKC0tY2hhbGspIjsgfTsKICAgIH0pOwogICAgLyog6I+c5Y2V6aG554K55Ye7ICovCiAgICBjb25zdCB0ZXh0SXRlbSA9IG1lbnUucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0PSJhZGQtdGV4dCJdJyk7CiAgICBpZiAodGV4dEl0ZW0pIHRleHRJdGVtLm9uY2xpY2sgPSAoKSA9PiB7IGNsb3NlTWVudSgpOyBzcmNBZGRUZXh0KCk7IH07CiAgICBjb25zdCBsaW5rSXRlbSA9IG1lbnUucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0PSJhZGQtbGluayJdJyk7CiAgICBpZiAobGlua0l0ZW0pIGxpbmtJdGVtLm9uY2xpY2sgPSAoKSA9PiB7IGNsb3NlTWVudSgpOyBzcmNBZGRMaW5rKCk7IH07CiAgICBjb25zdCBmaWxlSXRlbSA9IG1lbnUucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0PSJhZGQtZmlsZSJdJyk7CiAgICBpZiAoZmlsZUl0ZW0pIGZpbGVJdGVtLm9uY2xpY2sgPSAoKSA9PiB7IGNsb3NlTWVudSgpOyBzcmNBZGRGaWxlKCk7IH07CiAgfQoKICAvKiDnq4vljbPph43nrpcgKi8KICBjb25zdCByZWNhbGNCdG4gPSAkKCIjcmVjYWxjTm93IiwgcGFuZWwpOwogIGlmIChyZWNhbGNCdG4pIHJlY2FsY0J0bi5vbmNsaWNrID0gYnVpbGRDb250ZXh0UGFjazsKCiAgLyogQ29udGV4dCBQYWNrIOaKmOWPoCAqLwogIGNvbnN0IGNwSGVhZCA9IHBhbmVsLnF1ZXJ5U2VsZWN0b3IoIi5jdHgtcGFjay1oZWFkIik7CiAgaWYgKGNwSGVhZCkgY3BIZWFkLm9uY2xpY2sgPSAoKSA9PiB7IHN0YXRlLmN0eFBhY2tDb2xsYXBzZWQgPSAhc3RhdGUuY3R4UGFja0NvbGxhcHNlZDsgcmVuZGVyU291cmNlcygpOyB9Owp9CgovKiBTb3VyY2VzIOmdouadv+a3u+WKoOWFpeWPo++8iOWkjeeUqCB1cGxvYWRNYXRlcmlhbHMgLyB1cGxvYWRNYXRlcmlhbHNGb3Jt77yJICovCmZ1bmN0aW9uIHNyY0FkZFRleHQoKSB7CiAgY29uc3QgdGV4dCA9IHByb21wdCgi57KY6LS05paH5a2XIC8g6KaB54K577yaIiwgIiIpOwogIGlmICghdGV4dCB8fCAhdGV4dC50cmltKCkpIHJldHVybjsKICB1cGxvYWRNYXRlcmlhbHMoW3sga2luZDogInRleHQiLCBuYW1lOiAi57KY6LS055qE5paH5a2XIiwgdGV4dDogdGV4dC50cmltKCkgfV0pOwp9CgpmdW5jdGlvbiBzcmNBZGRMaW5rKCkgewogIGNvbnN0IHVybCA9IHByb21wdCgi6L6T5YWl6ZO+5o6lIFVSTO+8miIsICJodHRwczovLyIpOwogIGlmICghdXJsIHx8ICF1cmwudHJpbSgpKSByZXR1cm47CiAgdXBsb2FkTWF0ZXJpYWxzKFt7IGtpbmQ6ICJsaW5rIiwgbmFtZTogdXJsLnRyaW0oKSwgdXJsOiB1cmwudHJpbSgpIH1dKTsKfQoKZnVuY3Rpb24gc3JjQWRkRmlsZSgpIHsKICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImlucHV0Iik7CiAgaW5wdXQudHlwZSA9ICJmaWxlIjsKICBpbnB1dC5tdWx0aXBsZSA9IHRydWU7CiAgaW5wdXQuYWNjZXB0ID0gIi50eHQsLm1kLC5odG1sLC5wZGYsLmRvY3gsLnBuZywuanBnLC5qcGVnIjsKICBpbnB1dC5vbmNoYW5nZSA9IGFzeW5jICgpID0+IHsKICAgIGNvbnN0IGZpbGVzID0gaW5wdXQuZmlsZXM7CiAgICBpZiAoIWZpbGVzIHx8ICFmaWxlcy5sZW5ndGgpIHJldHVybjsKICAgIGNvbnN0IGZkID0gbmV3IEZvcm1EYXRhKCk7CiAgICBmb3IgKGNvbnN0IGYgb2YgZmlsZXMpIGZkLmFwcGVuZCgiZmlsZXMiLCBmKTsKICAgIGF3YWl0IHVwbG9hZE1hdGVyaWFsc0Zvcm0oZmQpOwogIH07CiAgaW5wdXQuY2xpY2soKTsKfQoKLyogPT09PT09PT09PT09IE5vdGVzIOWFqOWxgOmdouadv++8iFRhc2sgNe+8iSA9PT09PT09PT09PT0gKi8KZnVuY3Rpb24gcmVuZGVyTm90ZXMoKSB7CiAgY29uc3QgcGFuZWwgPSAkKCIjbm90ZXNQYW5lbCIpOwogIGlmICghcGFuZWwpIHJldHVybjsKICBpZiAoIXN0YXRlLnByb2plY3RJZCkgeyBwYW5lbC5pbm5lckhUTUwgPSAiIjsgcmV0dXJuOyB9CgogIC8qIOWQjOatpeaKmOWPoOaAgeWIsCAucHJvamVjdC1sYXlvdXQg5LiOIC5ub3Rlcy1wYW5lbCAqLwogIGNvbnN0IGxheW91dCA9ICQoIi5wcm9qZWN0LWxheW91dCIpOwogIGlmIChsYXlvdXQpIGxheW91dC5jbGFzc0xpc3QudG9nZ2xlKCJub3Rlcy1jb2xsYXBzZWQiLCAhIXN0YXRlLm5vdGVzQ29sbGFwc2VkKTsKICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKCJpcy1jb2xsYXBzZWQiLCAhIXN0YXRlLm5vdGVzQ29sbGFwc2VkKTsKCiAgLyog5oqY5Y+g5oCB77ya5LuF5riy5p+T5LiA5Liq5bGV5byA5oyJ6ZKu77yIcmFpbO+8iSAqLwogIGlmIChzdGF0ZS5ub3Rlc0NvbGxhcHNlZCkgewogICAgcGFuZWwuaW5uZXJIVE1MID0gYDxidXR0b24gaWQ9Im5vdGVzRXhwYW5kIiB0aXRsZT0i5bGV5byAIE5vdGVzIiBzdHlsZT0icG9zaXRpb246YWJzb2x1dGU7dG9wOjE0cHg7bGVmdDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSk7d2lkdGg6MjZweDtoZWlnaHQ6MjZweDtib3JkZXItcmFkaXVzOjVweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWVkZ2UtMik7YmFja2dyb3VuZDp2YXIoLS1zbGF0ZSk7Y29sb3I6dmFyKC0tY2hhbGspO2N1cnNvcjpwb2ludGVyO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1zaXplOjE0cHg7bGluZS1oZWlnaHQ6MTt0cmFuc2l0aW9uOmFsbCAuMnM7Ij7igLk8L2J1dHRvbj5gOwogICAgY29uc3QgZXggPSAkKCIjbm90ZXNFeHBhbmQiKTsKICAgIGlmIChleCkgewogICAgICBleC5vbm1vdXNlZW50ZXIgPSAoKSA9PiB7IGV4LnN0eWxlLmNvbG9yID0gInZhcigtLWNoYW1wYWduZSkiOyBleC5zdHlsZS5ib3JkZXJDb2xvciA9ICJ2YXIoLS1jaGFtcGFnbmUpIjsgZXguc3R5bGUuYmFja2dyb3VuZCA9ICJ2YXIoLS1jaGFtcGFnbmUtZ2xvdykiOyB9OwogICAgICBleC5vbm1vdXNlbGVhdmUgPSAoKSA9PiB7IGV4LnN0eWxlLmNvbG9yID0gInZhcigtLWNoYWxrKSI7IGV4LnN0eWxlLmJvcmRlckNvbG9yID0gInZhcigtLWVkZ2UtMikiOyBleC5zdHlsZS5iYWNrZ3JvdW5kID0gInZhcigtLXNsYXRlKSI7IH07CiAgICAgIGV4Lm9uY2xpY2sgPSAoKSA9PiB7IHN0YXRlLm5vdGVzQ29sbGFwc2VkID0gZmFsc2U7IHJlbmRlck5vdGVzKCk7IH07CiAgICB9CiAgICByZXR1cm47CiAgfQoKICAvKiDlhoXogZTmoLflvI/niYfmrrXvvIgubmMtKiDlnKggc3R5bGUuY3NzIOS4reacquWumuS5ie+8jOeUqCBDU1Mg5Y+Y6YeP5aSN5Yi76K6+6K6h56i/77yM6YG/5YWN56Gs57yW56CB6aKc6Imy77yJICovCiAgY29uc3QgUyA9IHsKICAgIGxhYmVsOiAiZm9udC1mYW1pbHk6dmFyKC0tbW9ubyk7Zm9udC1zaXplOjguNXB4O2xldHRlci1zcGFjaW5nOjAuMTJlbTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7Y29sb3I6dmFyKC0tc21va2UpO21hcmdpbi1ib3R0b206NXB4OyIsCiAgICBudGl0bGU6ICJmb250LWZhbWlseTp2YXIoLS1zZXJpZi1jbik7Zm9udC1zaXplOjEyLjVweDtjb2xvcjp2YXIoLS1pdm9yeSk7bGluZS1oZWlnaHQ6MS40O2ZvbnQtd2VpZ2h0OjQwMDttYXJnaW4tYm90dG9tOjVweDsiLAogICAgcm93czogImRpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjNweDsiLAogICAgcm93OiAiZGlzcGxheTpmbGV4O2dhcDo3cHg7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tYXNoKTtsaW5lLWhlaWdodDoxLjU7IiwKICAgIHJrOiAiY29sb3I6dmFyKC0tc21va2UpO2ZvbnQtZmFtaWx5OnZhcigtLW1vbm8pO2ZvbnQtc2l6ZTo5LjVweDttaW4td2lkdGg6MzhweDtwYWRkaW5nLXRvcDoxcHg7ZmxleC1zaHJpbms6MDsiLAogICAgcnY6ICJjb2xvcjp2YXIoLS1jaGFsayk7ZmxleDoxO21pbi13aWR0aDowOyIsCiAgICBsaXN0OiAiZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4OyIsCiAgICBsaTogImRpc3BsYXk6ZmxleDtnYXA6NnB4O2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWNoYWxrKTtsaW5lLWhlaWdodDoxLjQ1OyIsCiAgICBsbm86ICJmb250LWZhbWlseTp2YXIoLS1tb25vKTtmb250LXNpemU6OXB4O2NvbG9yOnZhcigtLXNtb2tlKTttaW4td2lkdGg6MjJweDtmbGV4LXNocmluazowOyIsCiAgICBtaW5pOiAiZm9udC1mYW1pbHk6dmFyKC0tbW9ubyk7Zm9udC1zaXplOjkuNXB4O2NvbG9yOnZhcigtLWNoYW1wYWduZSk7bGV0dGVyLXNwYWNpbmc6MC4wNGVtO21hcmdpbi10b3A6NHB4OyIsCiAgfTsKICBjb25zdCBta1JvdyA9IChrLCB2LCBib2xkKSA9PiBgPGRpdiBzdHlsZT0iJHtTLnJvd30iPjxzcGFuIHN0eWxlPSIke1Mucmt9Ij4ke2VzYyhrKX08L3NwYW4+PHNwYW4gc3R5bGU9IiR7Uy5ydn0ke2JvbGQgPyAiO2NvbG9yOnZhcigtLWl2b3J5KTtmb250LXdlaWdodDo1MDA7IiA6ICIifSI+JHtlc2Modil9PC9zcGFuPjwvZGl2PmA7CiAgY29uc3QgbWtDYXJkID0gKHN0ZXAsIGlubmVyKSA9PiBgPGRpdiBjbGFzcz0ibm90ZS1jYXJkIiBkYXRhLXN0ZXA9IiR7c3RlcH0iPiR7aW5uZXJ9PC9kaXY+YDsKCiAgLyog5pS26ZuG5ZCE5q2l6aqk5Lqn54mp5YiG57uEICovCiAgY29uc3QgZ3JvdXBzID0gW107CgogIC8qIFN0ZXAgMSDlj5fkvJfnlLvlg48gKi8KICBjb25zdCBhdWQgPSBzdGF0ZS5hdWRpZW5jZTsKICBpZiAoYXVkKSB7CiAgICBjb25zdCByb3dzID0gW107CiAgICBpZiAoYXVkLnJvbGUpIHJvd3MucHVzaChta1Jvdygi6KeS6ImyIiwgYXVkLnJvbGUsIHRydWUpKTsKICAgIGlmIChhdWQuc2NlbmUpIHJvd3MucHVzaChta1Jvdygi5Zy65pmvIiwgYXVkLnNjZW5lKSk7CiAgICBpZiAoYXVkLmdvYWwpIHJvd3MucHVzaChta1Jvdygi55uu5qCHIiwgYXVkLmdvYWwpKTsKICAgIGlmIChhdWQuc3VtbWFyeSkgcm93cy5wdXNoKG1rUm93KCLmkZjopoEiLCBhdWQuc3VtbWFyeSkpOwogICAgaWYgKHJvd3MubGVuZ3RoKSBncm91cHMucHVzaCh7IG46IDEsIHRpdGxlOiAi5Y+X5LyX55S75YOPIiwgY291bnQ6IHJvd3MubGVuZ3RoICsgIiDlrZfmrrUiLCBjYXJkczogW21rQ2FyZCgxLCBgPGRpdiBzdHlsZT0iJHtTLnJvd3N9Ij4ke3Jvd3Muam9pbigiIil9PC9kaXY+YCldIH0pOwogIH0KCiAgLyogU3RlcCAyIOahhuaetuS4juagh+mimCAqLwogIGNvbnN0IGZ3ID0gc3RhdGUuZnJhbWV3b3JrOwogIGNvbnN0IHRpdGxlcyA9IHN0YXRlLnRpdGxlcyB8fCBbXTsKICBpZiAoZncgfHwgdGl0bGVzLmxlbmd0aCkgewogICAgY29uc3QgY2FyZHMgPSBbXTsKICAgIGlmIChmdyAmJiBmdy5jb3JlX3RoZXNpcykgewogICAgICBjb25zdCBwY250ID0gKGZ3LnBpbGxhcnMgfHwgW10pLmxlbmd0aDsKICAgICAgY2FyZHMucHVzaChta0NhcmQoMiwgYDxkaXYgc3R5bGU9IiR7Uy5sYWJlbH0iPuaguOW/g+e7k+iuuiDCtyDloZTlsJY8L2Rpdj48ZGl2IHN0eWxlPSIke1MubnRpdGxlfSI+JHtlc2MoZncuY29yZV90aGVzaXMpfTwvZGl2PiR7cGNudCA/IGA8ZGl2IHN0eWxlPSIke1MubWluaX0iPiR7cGNudH0g5pSv5p+xPC9kaXY+YCA6ICIifWApKTsKICAgIH0KICAgIGlmICh0aXRsZXMubGVuZ3RoKSB7CiAgICAgIGNvbnN0IGxpc3QgPSB0aXRsZXMubWFwKHQgPT4gYDxkaXYgc3R5bGU9IiR7Uy5saX0iPjxzcGFuIHN0eWxlPSIke1MubG5vfSI+JHt0LnBhZ2Vfbm8gIT0gbnVsbCA/IHBhZDIodC5wYWdlX25vKSA6ICLCtyJ9PC9zcGFuPjxzcGFuIHN0eWxlPSJmbGV4OjE7Ij4ke2VzYyh0LnRpdGxlIHx8ICIiKX08L3NwYW4+PC9kaXY+YCkuam9pbigiIik7CiAgICAgIGNhcmRzLnB1c2gobWtDYXJkKDIsIGA8ZGl2IHN0eWxlPSIke1MubGFiZWx9Ij7moIfpopjlgJnpgIkgwrcgJHt0aXRsZXMubGVuZ3RofTwvZGl2PjxkaXYgc3R5bGU9IiR7Uy5saXN0fSI+JHtsaXN0fTwvZGl2PmApKTsKICAgIH0KICAgIGlmIChjYXJkcy5sZW5ndGgpIGdyb3Vwcy5wdXNoKHsgbjogMiwgdGl0bGU6ICLmoYbmnrbkuI7moIfpopgiLCBjb3VudDogY2FyZHMubGVuZ3RoICsgIiDkuqfniakiLCBjYXJkcyB9KTsKICB9CgogIC8qIFN0ZXAgMyDlhoXlrrnmt7HljJYgKi8KICBjb25zdCBwYWdlcyA9IHN0YXRlLnBhZ2VzIHx8IFtdOwogIGlmIChwYWdlcy5sZW5ndGgpIHsKICAgIGNvbnN0IGxpc3QgPSBwYWdlcy5tYXAocCA9PiB7CiAgICAgIGNvbnN0IGxheSA9IChMQVlPVVRfU0NIRU1FUyAmJiBwLmxheW91dCAmJiBMQVlPVVRfU0NIRU1FU1twLmxheW91dF0pID8gTEFZT1VUX1NDSEVNRVNbcC5sYXlvdXRdLm5hbWUgOiAocC5sYXlvdXQgfHwgIuKAlCIpOwogICAgICByZXR1cm4gYDxkaXYgc3R5bGU9IiR7Uy5saX0iPjxzcGFuIHN0eWxlPSIke1MubG5vfSI+JHtwLnBhZ2Vfbm8gIT0gbnVsbCA/ICJQIiArIGVzYyhwLnBhZ2Vfbm8pIDogIsK3In08L3NwYW4+PHNwYW4gc3R5bGU9ImZsZXg6MTsiPiR7ZXNjKHAudGl0bGUgfHwgIiIpfTxzcGFuIHN0eWxlPSJmb250LWZhbWlseTp2YXIoLS1tb25vKTtmb250LXNpemU6OXB4O2NvbG9yOnZhcigtLXNtb2tlKTttYXJnaW4tbGVmdDo2cHg7Ij4ke2VzYyhsYXkpfTwvc3Bhbj48L3NwYW4+PC9kaXY+YDsKICAgIH0pLmpvaW4oIiIpOwogICAgZ3JvdXBzLnB1c2goeyBuOiAzLCB0aXRsZTogIumhtemdouWkp+e6siIsIGNvdW50OiBwYWdlcy5sZW5ndGggKyAiIOmhtSIsIGNhcmRzOiBbbWtDYXJkKDMsIGA8ZGl2IHN0eWxlPSIke1MubGlzdH0iPiR7bGlzdH08L2Rpdj5gKV0gfSk7CiAgfQoKICAvKiBTdGVwIDQg6aOO5qC86YCJ5oupICovCiAgY29uc3Qgc3QgPSBzdGF0ZS5zdHlsZTsKICBpZiAoc3QgfHwgc3RhdGUudGhlbWUpIHsKICAgIGNvbnN0IHRoZW1lS2V5ID0gKHN0ICYmIHN0LnRoZW1lKSB8fCBzdGF0ZS50aGVtZSB8fCAiIjsKICAgIGlmICh0aGVtZUtleSkgewogICAgICBjb25zdCB0aGVtZU9iaiA9IChzdGF0ZS50aGVtZXMgfHwgW10pLmZpbmQodCA9PiB0LmtleSA9PT0gdGhlbWVLZXkpOwogICAgICBjb25zdCB0aGVtZU5hbWUgPSB0aGVtZU9iaiA/IHRoZW1lT2JqLm5hbWUgOiB0aGVtZUtleTsKICAgICAgZ3JvdXBzLnB1c2goeyBuOiA0LCB0aXRsZTogIumjjuagvOmAieaLqSIsIGNvdW50OiB2b2lkIDAsIGNhcmRzOiBbbWtDYXJkKDQsIGA8ZGl2IHN0eWxlPSIke1MubGFiZWx9Ij7op4bop4nkuLvpopg8L2Rpdj4ke21rUm93KCLkuLvpopgiLCB0aGVtZU5hbWUsIHRydWUpfWApXSB9KTsKICAgIH0KICB9CgogIC8qIFN0ZXAgNSDnlJ/miJDnirbmgIEgKi8KICBjb25zdCBzbGlkZXMgPSBzdGF0ZS5zbGlkZXMgfHwgW107CiAgaWYgKHNsaWRlcy5sZW5ndGgpIHsKICAgIGdyb3Vwcy5wdXNoKHsgbjogNSwgdGl0bGU6ICLnlJ/miJDnirbmgIEiLCBjb3VudDogdm9pZCAwLCBjYXJkczogW21rQ2FyZCg1LCBgJHtta1Jvdygi55Sf5oiQIiwgc2xpZGVzLmxlbmd0aCArICIg6aG15bm754Gv54mH5bey55Sf5oiQIiwgdHJ1ZSl9PGRpdiBzdHlsZT0iJHtTLm1pbml9O2NvbG9yOnZhcigtLXNhZ2UpOyI+4pePIOWFqOmDqOWwsee7qjwvZGl2PmApXSB9KTsKICB9CgogIC8qIFN0ZXAgNiDnsr7kv67orrDlvZXvvIhzdGF0ZS5tZXNzYWdlcyDlj6/pgInvvIzmnKrliqDovb3ml7bkuLogdW5kZWZpbmVk77yM56m65pWw57uE5YWc5bqV77yJICovCiAgY29uc3QgbXNncyA9IChzdGF0ZS5tZXNzYWdlcyB8fCBbXSkuZmlsdGVyKG0gPT4gbSAmJiBtLnN0ZXAgPT09IDYpOwogIGlmIChtc2dzLmxlbmd0aCkgewogICAgY29uc3QgcmVjZW50ID0gbXNncy5zbGljZSgtMykucmV2ZXJzZSgpOwogICAgY29uc3QgbGlzdCA9IHJlY2VudC5tYXAobSA9PiBgPGRpdiBzdHlsZT0iJHtTLmxpfSI+PHNwYW4gc3R5bGU9IiR7Uy5sbm99Ij4ke2VzYyhtLnZlcnNpb24gfHwgbS5zZXEgfHwgIsK3Iil9PC9zcGFuPjxzcGFuIHN0eWxlPSJmbGV4OjE7Ij4ke2VzYyhtLnN1bW1hcnkgfHwgbS50ZXh0IHx8ICIiKX08L3NwYW4+PC9kaXY+YCkuam9pbigiIik7CiAgICBncm91cHMucHVzaCh7IG46IDYsIHRpdGxlOiAi57K+5L+u6K6w5b2VIiwgY291bnQ6IG1zZ3MubGVuZ3RoICsgIiDmnaEiLCBjYXJkczogW21rQ2FyZCg2LCBgPGRpdiBzdHlsZT0iJHtTLmxhYmVsfSI+5pyA6L+R5L+u5pS5PC9kaXY+PGRpdiBzdHlsZT0iJHtTLmxpc3R9Ij4ke2xpc3R9PC9kaXY+YCldIH0pOwogIH0KCiAgLyog5riy5p+T5YiG57uEIEhUTUwgKi8KICBjb25zdCBncm91cHNIdG1sID0gZ3JvdXBzLmxlbmd0aAogICAgPyBncm91cHMubWFwKGcgPT4gewogICAgICAgIGNvbnN0IGRvbmUgPSBzdGF0ZS5zdGVwID4gZy5uID8gIiBpcy1kb25lIiA6ICIiOwogICAgICAgIGNvbnN0IGJhZGdlID0gIlNURVAgIiArIGcubiArIChzdGF0ZS5zdGVwID4gZy5uID8gIiDinJMiIDogIiIpOwogICAgICAgIGNvbnN0IGNudCA9IGcuY291bnQgPyBgPHNwYW4gY2xhc3M9Im5nLWNvdW50Ij4ke2VzYyhnLmNvdW50KX08L3NwYW4+YCA6ICIiOwogICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz0ibm90ZS1ncm91cCI+PGRpdiBjbGFzcz0ibm90ZS1ncm91cC1oZWFkIj48c3BhbiBjbGFzcz0ibmctc3RlcCR7ZG9uZX0iPiR7YmFkZ2V9PC9zcGFuPjxzcGFuIGNsYXNzPSJuZy10aXRsZSI+JHtlc2MoZy50aXRsZSl9PC9zcGFuPiR7Y250fTwvZGl2PiR7Zy5jYXJkcy5qb2luKCIiKX08L2Rpdj5gOwogICAgICB9KS5qb2luKCIiKQogICAgOiBgPGRpdiBzdHlsZT0idGV4dC1hbGlnbjpjZW50ZXI7cGFkZGluZzo0MHB4IDE2cHg7Ij48ZGl2IHN0eWxlPSJmb250LWZhbWlseTp2YXIoLS1zZXJpZik7Zm9udC1zaXplOjM2cHg7Y29sb3I6dmFyKC0tZWRnZS0zKTtmb250LXN0eWxlOml0YWxpYzttYXJnaW4tYm90dG9tOjEycHg7Ij7igJQ8L2Rpdj48ZGl2IHN0eWxlPSJmb250LWZhbWlseTp2YXIoLS1zZXJpZi1jbik7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tY2hhbGspO21hcmdpbi1ib3R0b206NHB4OyI+5Yib5L2c5Lqn54mp5bCG5Zyo6L+Z6YeM57Sv56evPC9kaXY+PGRpdiBzdHlsZT0iZm9udC1mYW1pbHk6dmFyKC0tbW9ubyk7Zm9udC1zaXplOjlweDtjb2xvcjp2YXIoLS1zbW9rZSk7bGV0dGVyLXNwYWNpbmc6MC4xZW07Ij7lj5fkvJcgwrcg5qGG5p62IMK3IOWkp+e6siDCtyDpo47moLw8L2Rpdj48L2Rpdj5gOwoKICAvKiDlupXpg6ggQ2l0YXRpb24g57uf6K6h5p2hICovCiAgY29uc3QgbWF0Q291bnQgPSAoc3RhdGUubWF0ZXJpYWxzIHx8IFtdKS5sZW5ndGg7CiAgY29uc3QgY2l0ZUh0bWwgPSBtYXRDb3VudCA+IDAKICAgID8gYDxkaXYgY2xhc3M9ImNpdGUtYmFyIj48ZGl2IHN0eWxlPSJmbGV4OjE7Ij48ZGl2IGNsYXNzPSJjYi1tYWluIj7lt7LlvJXnlKggPGI+JHttYXRDb3VudH08L2I+IOadoeadpea6kDwvZGl2PjxkaXYgY2xhc3M9ImNiLXN1YiI+Q0lUQVRJT04gwrcgJHttYXRDb3VudH0gU09VUkNFUzwvZGl2PjwvZGl2PjwvZGl2PmAKICAgIDogYDxkaXYgY2xhc3M9ImNpdGUtYmFyIj48ZGl2IHN0eWxlPSJmbGV4OjE7Ij48ZGl2IGNsYXNzPSJjYi1tYWluIj7lsJrml6DlvJXnlKg8L2Rpdj48ZGl2IGNsYXNzPSJjYi1zdWIiPkNJVEFUSU9OIMK3IEVNUFRZPC9kaXY+PC9kaXY+PC9kaXY+YDsKCiAgcGFuZWwuaW5uZXJIVE1MID0gYAogICAgPGRpdiBjbGFzcz0ibm90ZXMtaGVhZCI+CiAgICAgIDxzcGFuIGNsYXNzPSJub3Rlcy10aXRsZSI+PGI+Tm90ZXM8L2I+PC9zcGFuPgogICAgICA8YnV0dG9uIGlkPSJub3Rlc0NvbGxhcHNlIiB0aXRsZT0i5oqY5Y+gIiBzdHlsZT0id2lkdGg6MjZweDtoZWlnaHQ6MjZweDtib3JkZXItcmFkaXVzOjVweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWVkZ2UtMik7YmFja2dyb3VuZDp2YXIoLS1zbGF0ZSk7Y29sb3I6dmFyKC0tY2hhbGspO2N1cnNvcjpwb2ludGVyO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1zaXplOjEzcHg7bGluZS1oZWlnaHQ6MTt0cmFuc2l0aW9uOmFsbCAuMnM7ZmxleC1zaHJpbms6MDsiPuKAujwvYnV0dG9uPgogICAgPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJub3Rlcy1zY3JvbGwiPiR7Z3JvdXBzSHRtbH08L2Rpdj4KICAgICR7Y2l0ZUh0bWx9CiAgYDsKCiAgLyog57uR5a6a5oqY5Y+g5oyJ6ZKuICovCiAgY29uc3QgY29sbGFwc2VCdG4gPSAkKCIjbm90ZXNDb2xsYXBzZSIpOwogIGlmIChjb2xsYXBzZUJ0bikgewogICAgY29sbGFwc2VCdG4ub25tb3VzZWVudGVyID0gKCkgPT4geyBjb2xsYXBzZUJ0bi5zdHlsZS5jb2xvciA9ICJ2YXIoLS1jaGFtcGFnbmUpIjsgY29sbGFwc2VCdG4uc3R5bGUuYm9yZGVyQ29sb3IgPSAidmFyKC0tY2hhbXBhZ25lKSI7IGNvbGxhcHNlQnRuLnN0eWxlLmJhY2tncm91bmQgPSAidmFyKC0tY2hhbXBhZ25lLWdsb3cpIjsgfTsKICAgIGNvbGxhcHNlQnRuLm9ubW91c2VsZWF2ZSA9ICgpID0+IHsgY29sbGFwc2VCdG4uc3R5bGUuY29sb3IgPSAidmFyKC0tY2hhbGspIjsgY29sbGFwc2VCdG4uc3R5bGUuYm9yZGVyQ29sb3IgPSAidmFyKC0tZWRnZS0yKSI7IGNvbGxhcHNlQnRuLnN0eWxlLmJhY2tncm91bmQgPSAidmFyKC0tc2xhdGUpIjsgfTsKICAgIGNvbGxhcHNlQnRuLm9uY2xpY2sgPSAoKSA9PiB7CiAgICAgIHN0YXRlLm5vdGVzQ29sbGFwc2VkID0gIXN0YXRlLm5vdGVzQ29sbGFwc2VkOwogICAgICBjb25zdCBsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigiLnByb2plY3QtbGF5b3V0Iik7CiAgICAgIGlmIChsKSBsLmNsYXNzTGlzdC50b2dnbGUoIm5vdGVzLWNvbGxhcHNlZCIsIHN0YXRlLm5vdGVzQ29sbGFwc2VkKTsKICAgICAgJCgiI25vdGVzUGFuZWwiKS5jbGFzc0xpc3QudG9nZ2xlKCJpcy1jb2xsYXBzZWQiLCBzdGF0ZS5ub3Rlc0NvbGxhcHNlZCk7CiAgICAgIHJlbmRlck5vdGVzKCk7CiAgICB9OwogIH0KCiAgLyog57uR5a6a5Lqn54mp5Y2h54mH54K55Ye76Lez6L2sICovCiAgcGFuZWwucXVlcnlTZWxlY3RvckFsbCgiLm5vdGUtY2FyZCIpLmZvckVhY2goYyA9PiB7CiAgICBjLm9uY2xpY2sgPSAoKSA9PiB7IHN0YXRlLnN0ZXAgPSArYy5kYXRhc2V0LnN0ZXA7IHNhdmVTdGVwTmF2KHN0YXRlLnN0ZXApOyByZW5kZXJBbGwoKTsgfTsKICB9KTsKfQoKZnVuY3Rpb24gcmVuZGVyV29ya3NwYWNlKCkgewogIGNvbnN0IHcgPSAkKCIjd29ya3NwYWNlIik7CiAgdy5pbm5lckhUTUwgPSAiIjsKICBpZiAoIXN0YXRlLnByb2plY3RJZCkgewogICAgdy5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz0iZW1wdHkiPjxkaXYgY2xhc3M9ImJpZyI+4oCUPC9kaXY+PGgyPuacqumAieaLqemhueebrjwvaDI+PHA+6L+U5Zue5bqT6aaW6aG16YCJ5oup5oiW5paw5bu65LiA5Liq6aG555uuPC9wPjwvZGl2PmA7CiAgICByZXR1cm47CiAgfQogIGNvbnN0IHJlbmRlcmVycyA9IFtyZW5kZXJTdGVwMCwgcmVuZGVyU3RlcDEsIHJlbmRlclN0ZXAyLCByZW5kZXJTdGVwMywgcmVuZGVyU3RlcDQsIHJlbmRlclN0ZXA1LCByZW5kZXJTdGVwNiwgcmVuZGVyU3RlcDddOwogIHJlbmRlcmVyc1tzdGF0ZS5zdGVwXSh3KTsKfQoKZnVuY3Rpb24gcGFuZWxIZWFkKHRpdGxlLCBkZXNjKSB7CiAgY29uc3QgbnVtID0gcGFkMihzdGF0ZS5zdGVwKSArICIgLyAwNyI7CiAgY29uc3QgdGFnID0gU1RFUFNbc3RhdGUuc3RlcF0udGFnOwogIHJldHVybiBgPGRpdiBjbGFzcz0icGFuZWwtZXllYnJvdyI+PHNwYW4gY2xhc3M9Im51bSI+JHtudW19PC9zcGFuPjxzcGFuIGNsYXNzPSJsYWJlbCI+JHtlc2ModGFnKX08L3NwYW4+PHNwYW4gY2xhc3M9InJ1bGUiPjwvc3Bhbj48L2Rpdj48aDEgY2xhc3M9InBhbmVsLXRpdGxlIj4ke3RpdGxlfTwvaDE+PHAgY2xhc3M9InBhbmVsLWxlZGUiPiR7ZXNjKGRlc2MpfTwvcD5gOwp9CgovKiAtLS0tLS0tLS0tLS0tLS0tIFN0ZXAgMCDlj6/pgInlvJXlr7wgLS0tLS0tLS0tLS0tLS0tLSAqLwpmdW5jdGlvbiByZW5kZXJTdGVwMCh3KSB7CiAgY29uc3QgcGFuZWwgPSBlbCgiZGl2IiwgInBhbmVsIik7CiAgcGFuZWwuaW5uZXJIVE1MID0gYAogICAgPGRpdiBjbGFzcz0icGFuZWwtZXllYnJvdyI+CiAgICAgIDxzcGFuIGNsYXNzPSJudW0iPjAwIC8gMDc8L3NwYW4+CiAgICAgIDxzcGFuIGNsYXNzPSJsYWJlbCI+Q29udGV4dCDCtyDlj6/pgInlvJXlr7w8L3NwYW4+CiAgICAgIDxzcGFuIGNsYXNzPSJydWxlIj48L3NwYW4+CiAgICA8L2Rpdj4KICAgIDxoMSBjbGFzcz0icGFuZWwtdGl0bGUiPuW8gOWni+S9oOeahCA8ZW0+UFBUIOWIm+S9nDwvZW0+PC9oMT4KICAgIDxwIGNsYXNzPSJwYW5lbC1sZWRlIj7mt7vliqDog4zmma/ntKDmnZDorqkgQUkg5pu05oeC5L2g55qE5Li76aKY77yM5oiW55u05o6l6Lez5Yiw5Y+X5LyX5a6a5LmJ5byA5aeL5Yib5L2c44CC57Sg5p2Q5Y+v5Zyo5Lu75oSP5q2l6aqk6YCa6L+H5bem5L6nIFNvdXJjZXMg6Z2i5p2/6ZqP5pe25re75Yqg44CCPC9wPgogICAgPGRpdiBjbGFzcz0iY2FyZCIgc3R5bGU9Im1hcmdpbi10b3A6MzJweCI+CiAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDtnYXA6MjRweDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0Ij4KICAgICAgICA8ZGl2IHN0eWxlPSJmbGV4OjEiPgogICAgICAgICAgPGgzIHN0eWxlPSJmb250LWZhbWlseTp2YXIoLS1zZXJpZik7Zm9udC1zaXplOjIycHg7Y29sb3I6dmFyKC0taXZvcnkpO21hcmdpbi1ib3R0b206MTJweCI+5Li65LuA5LmI5re75Yqg6IOM5pmv57Sg5p2Q77yfPC9oMz4KICAgICAgICAgIDx1bCBzdHlsZT0ibGlzdC1zdHlsZTpub25lO2NvbG9yOnZhcigtLWNoYWxrKTtmb250LXNpemU6MTNweDtsaW5lLWhlaWdodDoyIj4KICAgICAgICAgICAgPGxpPsK3IEFJIOWwhuino+aekOS4uuKAnOiDjOaZr+S4iuS4i+aWh+WMheKAne+8jOi0r+epv+WQjue7reaJgOacieatpemqpDwvbGk+CiAgICAgICAgICAgIDxsaT7CtyDlhbPplK7kuovlrp7oh6rliqjmoIfms6jigJzlv4XpobvlvJXnlKjigJ3vvIznoa7kv53lhoXlrrnmnInmja7lj6/kvp08L2xpPgogICAgICAgICAgICA8bGk+wrcg5Lu75oSP5q2l6aqk5Y+v6KGl5YWF5paw57Sg5p2Q77yM6YeN566X5ZCO5pu05paw5LiK5LiL5paHPC9saT4KICAgICAgICAgIDwvdWw+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJidG4tcm93IiBzdHlsZT0ibWFyZ2luLXRvcDoyOHB4Ij4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiIGlkPSJndWlkZUFkZFNvdXJjZSI+5re75Yqg6IOM5pmv57Sg5p2QPC9idXR0b24+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1naG9zdCIgaWQ9Imd1aWRlU2tpcCI+6Lez6L+H77yM55u05o6l5a6a5LmJ5Y+X5LyXIOKGkjwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogIGA7CiAgdy5hcHBlbmRDaGlsZChwYW5lbCk7CgogIC8qIOehruS/nSBTb3VyY2VzIOmdouadv+aVsOaNruW3suWKoOi9ve+8iFRhc2sgNO+8muWFqOWxgCBTb3VyY2VzIOW3suaJv+aLhee0oOadkOa4suafk+S4juino+aekOWxleekuu+8iSAqLwogIGxvYWRNYXRlcmlhbHMoKTsKCiAgLyog5byV5a+877ya6Kem5Y+RIFNvdXJjZXMg6Z2i5p2/55qE5re75Yqg6I+c5Y2V77yII3NyY0FkZCDlt7LlnKggcmVuZGVyU291cmNlcyDkuK3nu5HlrpogdG9nZ2xl77yJICovCiAgJCgiI2d1aWRlQWRkU291cmNlIikub25jbGljayA9ICgpID0+IHsKICAgIGNvbnN0IHNyY0FkZCA9ICQoIiNzcmNBZGQiKTsKICAgIGlmIChzcmNBZGQpIHNyY0FkZC5jbGljaygpOwogIH07CiAgLyog6Lez6L+H77ya6L+b5YWlIFN0ZXAgMSDlj5fkvJflrprkuYkgKi8KICAkKCIjZ3VpZGVTa2lwIikub25jbGljayA9ICgpID0+IHsgc3RhdGUuc3RlcCA9IDE7IHNhdmVTdGVwTmF2KDEpOyByZW5kZXJBbGwoKTsgfTsKfQoKYXN5bmMgZnVuY3Rpb24gdXBsb2FkTWF0ZXJpYWxzKG1hdGVyaWFscykgewogIGxvYWRpbmcodHJ1ZSwgIkFJIOino+aekOe0oOadkOS4rS4uLiIpOwogIHRyeSB7CiAgICBjb25zdCByID0gYXdhaXQgYXBpKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS9tYXRlcmlhbHNgLCB7IG1ldGhvZDogIlBPU1QiLCBib2R5OiB7IG1hdGVyaWFscyB9IH0pOwogICAgdG9hc3QoIue0oOadkOW3suino+aekCIpOwogICAgLyogU291cmNlcyDpnaLmnb/vvJrov73liqDmlrDntKDmnZDjgIHorqHlhaXlvoXph43nrpfvvIhUYXNrIDTvvIkKICAgICAgIOWQjuerr+WTjeW6lOS4jeWQqyBzdGF0dXMg5a2X5q6177yM5L2G6Kej5p6Q5Zyo5ZON5bqU5YmN5bey5a6M5oiQ77yM5qCH6K6w5Li6IHBhcnNlZCAqLwogICAgaWYgKEFycmF5LmlzQXJyYXkoci5tYXRlcmlhbHMpKSB7CiAgICAgIGZvciAoY29uc3QgbSBvZiByLm1hdGVyaWFscykgc3RhdGUubWF0ZXJpYWxzLnB1c2goeyAuLi5tLCBzdGF0dXM6ICJwYXJzZWQiIH0pOwogICAgfQogICAgc3RhdGUucGVuZGluZ1JlY2FsYyArPSByLmluZ2VzdGVkIHx8IDA7CiAgICBhd2FpdCBsb2FkTWF0ZXJpYWxzKCk7CiAgfSBjYXRjaCAoZSkgeyB0b2FzdCgi5aSx6LSl77yaIiArIGUubWVzc2FnZSk7IH0gZmluYWxseSB7IGxvYWRpbmcoZmFsc2UpOyB9Cn0KYXN5bmMgZnVuY3Rpb24gdXBsb2FkTWF0ZXJpYWxzRm9ybShmZCkgewogIGxvYWRpbmcodHJ1ZSwgIuS4iuS8oOW5tuino+aekOS4rS4uLiIpOwogIHRyeSB7CiAgICBjb25zdCBoZWFkZXJzID0gc3RhdGUuc2Vzc2lvbiA/IHsgIngtc2Vzc2lvbi10b2tlbiI6IHN0YXRlLnNlc3Npb24gfSA6IHt9OwogICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS9tYXRlcmlhbHNgLCB7IG1ldGhvZDogIlBPU1QiLCBoZWFkZXJzLCBib2R5OiBmZCB9KTsKICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTsKICAgIGlmICghZGF0YS5vaykgdGhyb3cgbmV3IEVycm9yKGRhdGEuZXJyb3IpOwogICAgdG9hc3QoIuaWh+S7tuW3suino+aekCIpOwogICAgLyogU291cmNlcyDpnaLmnb/vvJrov73liqDmlrDntKDmnZDjgIHorqHlhaXlvoXph43nrpfvvIhUYXNrIDTvvIkgKi8KICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEubWF0ZXJpYWxzKSkgewogICAgICBmb3IgKGNvbnN0IG0gb2YgZGF0YS5tYXRlcmlhbHMpIHN0YXRlLm1hdGVyaWFscy5wdXNoKHsgLi4ubSwgc3RhdHVzOiAicGFyc2VkIiB9KTsKICAgIH0KICAgIHN0YXRlLnBlbmRpbmdSZWNhbGMgKz0gZGF0YS5pbmdlc3RlZCB8fCAwOwogICAgYXdhaXQgbG9hZE1hdGVyaWFscygpOwogIH0gY2F0Y2ggKGUpIHsgdG9hc3QoIuWksei0pe+8miIgKyBlLm1lc3NhZ2UpOyB9IGZpbmFsbHkgeyBsb2FkaW5nKGZhbHNlKTsgfQp9CmFzeW5jIGZ1bmN0aW9uIGxvYWRNYXRlcmlhbHMoKSB7CiAgdHJ5IHsKICAgIGNvbnN0IHIgPSBhd2FpdCBhcGkoYC9hcGkvcHJvamVjdHMvJHtzdGF0ZS5wcm9qZWN0SWR9YCk7CiAgICAvKiDliLfmlrAgc3RhdGUucHJvamVjdCDkuI4gbWF0ZXJpYWxz77yI5L+d5oyBIFNvdXJjZXMg6Z2i5p2/5pWw5o2u5ZCM5q2l77yJICovCiAgICBpZiAociAmJiByLnByb2plY3QpIHN0YXRlLnByb2plY3QgPSByLnByb2plY3Q7CiAgICBpZiAociAmJiBBcnJheS5pc0FycmF5KHIubWF0ZXJpYWxzKSkgc3RhdGUubWF0ZXJpYWxzID0gci5tYXRlcmlhbHM7CiAgICAvKiDmuLLmn5MgU291cmNlcyDpnaLmnb/vvIjmm7/ku6Pljp8gI21hdGVyaWFsTGlzdCDljaDkvY3mlofmoYjvvIkgKi8KICAgIHJlbmRlclNvdXJjZXMoKTsKICB9IGNhdGNoIChlKSB7IC8qIGlnbm9yZSAqLyB9Cn0KYXN5bmMgZnVuY3Rpb24gYnVpbGRDb250ZXh0UGFjaygpIHsKICBsb2FkaW5nKHRydWUsICLmsYfmgLvog4zmma/kuIrkuIvmlofljIUuLi4iKTsKICB0cnkgewogICAgY29uc3QgciA9IGF3YWl0IGFwaShgL2FwaS9wcm9qZWN0cy8ke3N0YXRlLnByb2plY3RJZH0vY29udGV4dC1wYWNrYCwgeyBtZXRob2Q6ICJQT1NUIiB9KTsKICAgIC8qIFNvdXJjZXMg6Z2i5p2/77ya5a2Y5YKoIHBhY2vjgIHmuIXpm7blvoXph43nrpfjgIHph43mlrDmuLLmn5PvvIhUYXNrIDTvvIkgKi8KICAgIHN0YXRlLmNvbnRleHRQYWNrID0gci5wYWNrOwogICAgc3RhdGUucGVuZGluZ1JlY2FsYyA9IDA7CiAgICByZW5kZXJTb3VyY2VzKCk7CiAgICAvKiDkv53nlZnljp8gU3RlcCAwIOWNoeeJh+abtOaWsO+8iHJlbmRlclN0ZXAwIOS7jeW8leeUqCAjY29udGV4dFBhY2tDYXJkIC8gI2NvbnRleHRQYWNrIERPTe+8iSAqLwogICAgY29uc3QgY2FyZCA9ICQoIiNjb250ZXh0UGFja0NhcmQiKTsKICAgIGlmIChjYXJkKSB7CiAgICAgIGNhcmQuc3R5bGUuZGlzcGxheSA9ICJibG9jayI7CiAgICAgIGNvbnN0IGZhY3RzID0gKHIucGFjay5rZXlfZmFjdHMgfHwgW10pLm1hcChmID0+IGA8ZGl2IGNsYXNzPSJwaWxsYXItcG9pbnQiPiR7ZXNjKGYuZmFjdCl9JHtmLm11c3RfY2l0ZSA/ICc8c3BhbiBjbGFzcz0idGFnIHRhZy11c2VyIj7lv4XpobvlvJXnlKg8L3NwYW4+JyA6ICIifTwvZGl2PmApLmpvaW4oIiIpOwogICAgICBjb25zdCBjcCA9ICQoIiNjb250ZXh0UGFjayIpOwogICAgICBpZiAoY3ApIGNwLmlubmVySFRNTCA9IGA8cCBzdHlsZT0ibWFyZ2luLWJvdHRvbToxMnB4O2xpbmUtaGVpZ2h0OjEuNyI+JHtlc2Moci5wYWNrLmJhY2tncm91bmRfc3VtbWFyeSl9PC9wPjxoMyBzdHlsZT0ibWFyZ2luLXRvcDoxMnB4Ij7lhbPplK7kuovlrp48L2gzPiR7ZmFjdHMgfHwgJzxwIHN0eWxlPSJjb2xvcjp2YXIoLS1hc2gpIj7ml6A8L3A+J31gOwogICAgfQogICAgdG9hc3QoIuiDjOaZr+S4iuS4i+aWh+WMheW3sueUn+aIkCIpOwogIH0gY2F0Y2ggKGUpIHsgdG9hc3QoIuWksei0pe+8miIgKyBlLm1lc3NhZ2UpOyB9IGZpbmFsbHkgeyBsb2FkaW5nKGZhbHNlKTsgfQp9Cgphc3luYyBmdW5jdGlvbiBzYXZlU3RlcE5hdihzdGVwKSB7CiAgdHJ5IHsgYXdhaXQgYXBpKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS9zdGVwcy8ke3N0ZXB9YCwgeyBtZXRob2Q6ICJQT1NUIiwgYm9keToge30gfSk7IH0gY2F0Y2ggKGUpIHt9Cn0KCi8qIC0tLS0tLS0tLS0tLS0tLS0gU3RlcCAxIOWPl+S8l+WumuS5iSAtLS0tLS0tLS0tLS0tLS0tICovCmZ1bmN0aW9uIHJlbmRlclN0ZXAxKHcpIHsKICBjb25zdCBhID0gc3RhdGUuYXVkaWVuY2UgfHwge307CiAgY29uc3QgcGFuZWwgPSBlbCgiZGl2IiwgInBhbmVsIik7CiAgcGFuZWwuaW5uZXJIVE1MID0gcGFuZWxIZWFkKCLnu5nosIHnnIvvvIw8ZW0+5Yaz5a6aPC9lbT7mgI7kuYjorrLjgIIiLCAi5Y+X5LyX5Yaz5a6a6K666K+B5bGC5qyh44CC57uZIENFTyDmsYfmiqXlkoznu5nmioDmnK/lm6LpmJ/orrLop6PvvIzlkIzmoLfnmoTkuLvpopjvvIzmoIfpopjlkozmoYbmnrblrozlhajkuI3lkIzjgIIiKTsKICBwYW5lbC5pbm5lckhUTUwgKz0gYAogICAgPGRpdiBjbGFzcz0iY2FyZCI+CiAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWw+6L+Z5LiqIFBQVCDnu5nosIHnnIvvvJ88c3BhbiBjbGFzcz0iaGludCI+77yI6KeS6ImyL+iBjOS9jS/nn6Xor4bog4zmma/vvIk8L3NwYW4+PC9sYWJlbD48aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImF1ZFJvbGUiIHZhbHVlPSIke2VzYyhhLnJvbGUgfHwgIiIpfSIgcGxhY2Vob2xkZXI9IuWmgu+8muWFrOWPuCBDRU8g5LiO6JGj5LqL5Lya5oiQ5ZGYIj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbD7ku4DkuYjlnLrlkIjkvb/nlKjvvJ88c3BhbiBjbGFzcz0iaGludCI+77yI5q2j5byP5rGH5oqlIC8g6Lev5ryUIC8g5Z+56K6tIC8g5a2m5pyv562U6L6p77yJPC9zcGFuPjwvbGFiZWw+PGlucHV0IHR5cGU9InRleHQiIGlkPSJhdWRTY2VuZSIgdmFsdWU9IiR7ZXNjKGEuc2NlbmUgfHwgIiIpfSIgcGxhY2Vob2xkZXI9IuWmgu+8muW5tOW6puaImOeVpeaxh+aKpeS8miI+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWw+5oOz6L6+5Yiw5LuA5LmI5pWI5p6c77yfPHNwYW4gY2xhc3M9ImhpbnQiPu+8iOivtOacjeWGs+etliAvIOS8oOmAkuS/oeaBryAvIOa/gOWPkeWFtOi2o++8iTwvc3Bhbj48L2xhYmVsPjxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0iYXVkR29hbCIgdmFsdWU9IiR7ZXNjKGEuZ29hbCB8fCAiIil9IiBwbGFjZWhvbGRlcj0i5aaC77ya6K+05pyN6JGj5LqL5Lya5om55YeG5piO5bm06aKE566XIj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iYnRuLXJvdyI+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IiBpZD0iYXVkR2VuIj7nlJ/miJDlj5fkvJfnlLvlg488L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLWdob3N0IiBpZD0iYXVkU2tpcCI+6Lez6L+H77yI6YCa55So5ZWG5Yqh5rGH5oql77yJPC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJjYXJkIiBpZD0iYXVkQ2FyZCIgc3R5bGU9ImRpc3BsYXk6JHthLnN1bW1hcnkgPyAiYmxvY2siIDogIm5vbmUifSI+PGgzPuWPl+S8l+eUu+WDjzwvaDM+PGRpdiBjbGFzcz0icmVhZHRocm91Z2giIGlkPSJhdWRTdW1tYXJ5Ij4ke2VzYyhhLnN1bW1hcnkgfHwgIiIpfTwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJidG4tcm93Ij48YnV0dG9uIGNsYXNzPSJidG4gYnRuLWFjY2VudCIgaWQ9InRvU3RlcDIiPuS4i+S4gOatpe+8muahhuaetuS4juagh+mimCDihpI8L2J1dHRvbj48L2Rpdj4KICAgIDwvZGl2PgogIGA7CiAgdy5hcHBlbmRDaGlsZChwYW5lbCk7CiAgJCgiI2F1ZEdlbiIpLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7CiAgICBjb25zdCByb2xlID0gJCgiI2F1ZFJvbGUiKS52YWx1ZS50cmltKCksIHNjZW5lID0gJCgiI2F1ZFNjZW5lIikudmFsdWUudHJpbSgpLCBnb2FsID0gJCgiI2F1ZEdvYWwiKS52YWx1ZS50cmltKCk7CiAgICBpZiAoIXJvbGUpIHJldHVybiB0b2FzdCgi6K+35aGr5YaZ5Y+X5LyX6KeS6ImyIik7CiAgICBsb2FkaW5nKHRydWUsICLnlJ/miJDlj5fkvJfnlLvlg48uLi4iKTsKICAgIHRyeSB7CiAgICAgIGNvbnN0IHIgPSBhd2FpdCBhcGkoYC9hcGkvcHJvamVjdHMvJHtzdGF0ZS5wcm9qZWN0SWR9L2F1ZGllbmNlYCwgeyBtZXRob2Q6ICJQT1NUIiwgYm9keTogeyByb2xlLCBzY2VuZSwgZ29hbCB9IH0pOwogICAgICBzdGF0ZS5hdWRpZW5jZSA9IHIuYXVkaWVuY2U7CiAgICAgIGF3YWl0IGFwaShgL2FwaS9wcm9qZWN0cy8ke3N0YXRlLnByb2plY3RJZH0vc3RlcHMvMWAsIHsgbWV0aG9kOiAiUE9TVCIsIGJvZHk6IHIuYXVkaWVuY2UgfSk7CiAgICAgIHJlbmRlckFsbCgpOwogICAgfSBjYXRjaCAoZSkgeyB0b2FzdCgi5aSx6LSl77yaIiArIGUubWVzc2FnZSk7IH0gZmluYWxseSB7IGxvYWRpbmcoZmFsc2UpOyB9CiAgfTsKICAkKCIjYXVkU2tpcCIpLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7CiAgICBzdGF0ZS5hdWRpZW5jZSA9IHsgcm9sZTogIumAmueUqCIsIHNjZW5lOiAi5ZWG5Yqh5rGH5oqlIiwgZ29hbDogIuS8oOmAkuS/oeaBryIsIHN1bW1hcnk6ICLpnaLlkJHpgJrnlKjllYbliqHlj5fkvJfnmoTmsYfmiqUiIH07CiAgICBhd2FpdCBhcGkoYC9hcGkvcHJvamVjdHMvJHtzdGF0ZS5wcm9qZWN0SWR9L3N0ZXBzLzFgLCB7IG1ldGhvZDogIlBPU1QiLCBib2R5OiBzdGF0ZS5hdWRpZW5jZSB9KTsKICAgIHN0YXRlLnN0ZXAgPSAyOwogICAgc2F2ZVN0ZXBOYXYoMik7CiAgICByZW5kZXJBbGwoKTsKICB9OwogIGNvbnN0IHRvMiA9ICQoIiN0b1N0ZXAyIik7IGlmICh0bzIpIHRvMi5vbmNsaWNrID0gKCkgPT4geyBzdGF0ZS5zdGVwID0gMjsgc2F2ZVN0ZXBOYXYoMik7IHJlbmRlckFsbCgpOyB9Owp9CgovKiAtLS0tLS0tLS0tLS0tLS0tIFN0ZXAgMiDmoYbmnrbkuI7moIfpopggLS0tLS0tLS0tLS0tLS0tLSAqLwpmdW5jdGlvbiByZW5kZXJTdGVwMih3KSB7CiAgY29uc3QgcGFuZWwgPSBlbCgiZGl2IiwgInBhbmVsIik7CiAgcGFuZWwuaW5uZXJIVE1MID0gcGFuZWxIZWFkKCLlhYjmg7PmuIXmpZo8ZW0+6aqo5p62PC9lbT7vvIw8YnI+5YaN5aGr6KGA6IKJ44CCIiwgIueUqOmHkeWtl+WhlOWOn+eQhuehruWumuaVtOS9k+iuuuivgeahhuaetu+8jOi+k+WHuuavj+mhteacieS/oeaBr+mHj+eahOagh+mimOOAguagh+mimOi/nuivu+WNs+aVheS6i+e6v+OAgiIpOwogIHBhbmVsLmlubmVySFRNTCArPSBgCiAgICA8ZGl2IGNsYXNzPSJjYXJkIj4KICAgICAgPGgzPjxzcGFuIGNsYXNzPSJudW0tdGFnIj4wMTwvc3Bhbj4g5Li76aKY5o6i57SiPC9oMz4KICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbD5QUFQg5Li76aKYPC9sYWJlbD48aW5wdXQgdHlwZT0idGV4dCIgaWQ9InRvcGljIiB2YWx1ZT0iJHtlc2Moc3RhdGUucHJvamVjdD8udG9waWMgfHwgIiIpfSIgcGxhY2Vob2xkZXI9IuWmgu+8mjIwMjUg5bm05bqm5Lqn5ZOB5aSN55uYIj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iYnRuLXJvdyI+PGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IiBpZD0iZXhwbG9yZUJ0biI+QUkg5o+Q5Ye65YiH5YWl6KeS5bqmPC9idXR0b24+PC9kaXY+CiAgICAgIDxkaXYgaWQ9ImFuZ2xlc0JveCI+PC9kaXY+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImNhcmQiPgogICAgICA8aDM+PHNwYW4gY2xhc3M9Im51bS10YWciPjAyPC9zcGFuPiDmoYbmnrbmnoTlu7o8L2gzPgogICAgICA8ZGl2IGNsYXNzPSJmaWVsZCI+PGxhYmVsPuihpeWFheivtOaYjiAvIOmAieWumuinkuW6piAvIOWFs+mUrumXrumimOWbnuetlDwvbGFiZWw+PHRleHRhcmVhIGlkPSJmcmFtZXdvcmtJbnB1dCIgcGxhY2Vob2xkZXI9IuS+i+Wmgu+8mumAieaLqeinkuW6pkHjgILku4rlubTmnIDlgLzlvpforrLnmoTmiJDlsLHmmK8uLi4iPjwvdGV4dGFyZWE+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImJ0bi1yb3ciPjxidXR0b24gY2xhc3M9ImJ0biBidG4tcHJpbWFyeSIgaWQ9ImZyYW1ld29ya0J0biI+5p6E5bu66YeR5a2X5aGU5qGG5p62PC9idXR0b24+PC9kaXY+CiAgICAgIDxkaXYgaWQ9ImZyYW1ld29ya0JveCI+PC9kaXY+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImNhcmQiPgogICAgICA8aDM+PHNwYW4gY2xhc3M9Im51bS10YWciPjAzPC9zcGFuPiDmoIfpopjnlJ/miJA8L2gzPgogICAgICA8ZGl2IGNsYXNzPSJidG4tcm93Ij48YnV0dG9uIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiIGlkPSJ0aXRsZXNCdG4iPueUn+aIkOavj+mhteagh+mimDwvYnV0dG9uPjwvZGl2PgogICAgICA8ZGl2IGlkPSJ0aXRsZXNCb3giPjwvZGl2PgogICAgPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJidG4tcm93Ij48YnV0dG9uIGNsYXNzPSJidG4gYnRuLWFjY2VudCIgaWQ9InRvU3RlcDMiIHN0eWxlPSJkaXNwbGF5OiR7c3RhdGUudGl0bGVzLmxlbmd0aCA/ICJpbmxpbmUtYmxvY2siIDogIm5vbmUifSI+5LiL5LiA5q2l77ya5YaF5a655rex5YyWIOKGkjwvYnV0dG9uPjwvZGl2PgogIGA7CiAgdy5hcHBlbmRDaGlsZChwYW5lbCk7CiAgaWYgKHN0YXRlLmZyYW1ld29yaykgc2hvd0ZyYW1ld29yaygpOwogIGlmIChzdGF0ZS50aXRsZXMubGVuZ3RoKSBzaG93VGl0bGVzKCk7CgogICQoIiNleHBsb3JlQnRuIikub25jbGljayA9IGFzeW5jICgpID0+IHsKICAgIGNvbnN0IHRvcGljID0gJCgiI3RvcGljIikudmFsdWUudHJpbSgpOyBpZiAoIXRvcGljKSByZXR1cm4gdG9hc3QoIuivt+i+k+WFpeS4u+mimCIpOwogICAgbG9hZGluZyh0cnVlLCAiQUkg5o+Q5Ye65YiH5YWl6KeS5bqmLi4uIik7CiAgICB0cnkgewogICAgICBjb25zdCByID0gYXdhaXQgYXBpKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS9leHBsb3JlYCwgeyBtZXRob2Q6ICJQT1NUIiwgYm9keTogeyB0b3BpYyB9IH0pOwogICAgICBzdGF0ZS5wcm9qZWN0LnRvcGljID0gdG9waWM7CiAgICAgIGNvbnN0IGFuZ2xlcyA9IChyLmFuZ2xlcyB8fCBbXSkubWFwKGEgPT4gYDxkaXYgY2xhc3M9Iml0ZW0tcm93Ij48ZGl2IGNsYXNzPSJncm93Ij48c3Ryb25nPuinkuW6piAke2VzYyhhLmtleSl977yaJHtlc2MoYS5sYWJlbCl9PC9zdHJvbmc+PGRpdj4ke2VzYyhhLmRlc2MpfTwvZGl2PjwvZGl2PjwvZGl2PmApLmpvaW4oIiIpOwogICAgICBjb25zdCBxcyA9IChyLnF1ZXN0aW9ucyB8fCBbXSkubWFwKHEgPT4gYDxkaXYgY2xhc3M9ImxvZ2ljLW5vdGUiPuKdkyAke2VzYyhxKX08L2Rpdj5gKS5qb2luKCIiKTsKICAgICAgJCgiI2FuZ2xlc0JveCIpLmlubmVySFRNTCA9IGA8ZGl2IHN0eWxlPSJtYXJnaW4tdG9wOjE0cHgiPiR7YW5nbGVzfTxoMyBzdHlsZT0ibWFyZ2luOjE0cHggMCA4cHgiPuivt+WbnuetlOS7peS4i+mXrumimO+8jOWhq+WFpeS4iuaWuSLooaXlhYXor7TmmI4iPC9oMz4ke3FzfTwvZGl2PmA7CiAgICB9IGNhdGNoIChlKSB7IHRvYXN0KCLlpLHotKXvvJoiICsgZS5tZXNzYWdlKTsgfSBmaW5hbGx5IHsgbG9hZGluZyhmYWxzZSk7IH0KICB9OwogICQoIiNmcmFtZXdvcmtCdG4iKS5vbmNsaWNrID0gYXN5bmMgKCkgPT4gewogICAgY29uc3QgdG9waWMgPSAkKCIjdG9waWMiKS52YWx1ZS50cmltKCkgfHwgc3RhdGUucHJvamVjdD8udG9waWM7IGlmICghdG9waWMpIHJldHVybiB0b2FzdCgi6K+35YWI56Gu5a6a5Li76aKYIik7CiAgICBsb2FkaW5nKHRydWUsICLmnoTlu7rph5HlrZfloZTmoYbmnrYuLi4iKTsKICAgIHRyeSB7CiAgICAgIGNvbnN0IHIgPSBhd2FpdCBhcGkoYC9hcGkvcHJvamVjdHMvJHtzdGF0ZS5wcm9qZWN0SWR9L2ZyYW1ld29ya2AsIHsgbWV0aG9kOiAiUE9TVCIsIGJvZHk6IHsgdG9waWMsIHVzZXJfaW5wdXQ6ICQoIiNmcmFtZXdvcmtJbnB1dCIpLnZhbHVlIH0gfSk7CiAgICAgIHN0YXRlLmZyYW1ld29yayA9IHIuZnJhbWV3b3JrOwogICAgICBhd2FpdCBhcGkoYC9hcGkvcHJvamVjdHMvJHtzdGF0ZS5wcm9qZWN0SWR9L3N0ZXBzLzJgLCB7IG1ldGhvZDogIlBPU1QiLCBib2R5OiB7IGZyYW1ld29yazogci5mcmFtZXdvcmsgfSB9KTsKICAgICAgc2hvd0ZyYW1ld29yaygpOwogICAgfSBjYXRjaCAoZSkgeyB0b2FzdCgi5aSx6LSl77yaIiArIGUubWVzc2FnZSk7IH0gZmluYWxseSB7IGxvYWRpbmcoZmFsc2UpOyB9CiAgfTsKICAkKCIjdGl0bGVzQnRuIikub25jbGljayA9IGFzeW5jICgpID0+IHsKICAgIGlmICghc3RhdGUuZnJhbWV3b3JrKSByZXR1cm4gdG9hc3QoIuivt+WFiOaehOW7uuahhuaetiIpOwogICAgbG9hZGluZyh0cnVlLCAi55Sf5oiQ5qCH6aKYICsg6L+e6K+75qOA5rWLLi4uIik7CiAgICB0cnkgewogICAgICBjb25zdCByID0gYXdhaXQgYXBpKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS90aXRsZXNgLCB7IG1ldGhvZDogIlBPU1QiLCBib2R5OiB7IGZyYW1ld29yazogc3RhdGUuZnJhbWV3b3JrIH0gfSk7CiAgICAgIHN0YXRlLnRpdGxlcyA9IHIudGl0bGVzOyBzdGF0ZS5yZWFkVGhyb3VnaCA9IHIucmVhZF90aHJvdWdoOwogICAgICBhd2FpdCBhcGkoYC9hcGkvcHJvamVjdHMvJHtzdGF0ZS5wcm9qZWN0SWR9L3N0ZXBzLzJgLCB7IG1ldGhvZDogIlBPU1QiLCBib2R5OiB7IHRpdGxlczogci50aXRsZXMgfSB9KTsKICAgICAgc2hvd1RpdGxlcygpOyAkKCIjdG9TdGVwMyIpLnN0eWxlLmRpc3BsYXkgPSAiaW5saW5lLWJsb2NrIjsKICAgIH0gY2F0Y2ggKGUpIHsgdG9hc3QoIuWksei0pe+8miIgKyBlLm1lc3NhZ2UpOyB9IGZpbmFsbHkgeyBsb2FkaW5nKGZhbHNlKTsgfQogIH07CiAgY29uc3QgdG8zID0gJCgiI3RvU3RlcDMiKTsgaWYgKHRvMykgdG8zLm9uY2xpY2sgPSAoKSA9PiB7IHN0YXRlLnN0ZXAgPSAzOyBzYXZlU3RlcE5hdigzKTsgcmVuZGVyQWxsKCk7IH07Cn0KCmZ1bmN0aW9uIHNob3dGcmFtZXdvcmsoKSB7CiAgY29uc3QgZncgPSBzdGF0ZS5mcmFtZXdvcms7IGlmICghZncpIHJldHVybjsKICBjb25zdCBwaWxsYXJzID0gKGZ3LnBpbGxhcnMgfHwgW10pLm1hcCgocCwgaSkgPT4gYDxkaXYgY2xhc3M9InBpbGxhciI+PGRpdiBjbGFzcz0icGlsbGFyLW5vIj4ke3BhZDIoaSArIDEpfTwvZGl2PjxkaXYgY2xhc3M9InBpbGxhci10aXRsZSI+JHtlc2MocC50aXRsZSl9PC9kaXY+PHVsIGNsYXNzPSJwaWxsYXItcG9pbnRzIj4keyhwLnBvaW50cyB8fCBbXSkubWFwKHB0ID0+IGA8bGk+JHtlc2MocHQpfTwvbGk+YCkuam9pbigiIil9PC91bD48L2Rpdj5gKS5qb2luKCIiKTsKICBjb25zdCBub3RlcyA9IChmdy5sb2dpY19ub3RlcyB8fCBbXSkubWFwKG4gPT4gYDxkaXYgY2xhc3M9ImxvZ2ljLW5vdGUiPuKaoCAke2VzYyhuKX08L2Rpdj5gKS5qb2luKCIiKTsKICAkKCIjZnJhbWV3b3JrQm94IikuaW5uZXJIVE1MID0gYDxkaXYgc3R5bGU9Im1hcmdpbi10b3A6MTZweCI+PGRpdiBjbGFzcz0icHlyYW1pZCI+PGRpdiBjbGFzcz0icHlyYW1pZC1hcGV4Ij48ZGl2IGNsYXNzPSJsYWJlbCI+Q29yZSBDb25jbHVzaW9uIMK3IOaguOW/g+e7k+iuujwvZGl2PjxkaXYgY2xhc3M9InRleHQiPiR7ZXNjKGZ3LmNvcmVfdGhlc2lzKX08L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPSJwaWxsYXJzIj4ke3BpbGxhcnN9PC9kaXY+PC9kaXY+JHtub3RlcyA/IGA8aDMgc3R5bGU9Im1hcmdpbjoxNnB4IDAgOHB4Ij5NRUNFIOiHquajgDwvaDM+JHtub3Rlc31gIDogIiJ9PC9kaXY+YDsKfQoKY29uc3QgSU5GT19MQUJFTCA9IHsgdmlld3BvaW50OiAi6KeC54K5IiwgZmFjdDogIuS6i+WuniIsIGRhdGE6ICLmlbDmja4iLCBzdG9yeTogIuaVheS6iyIgfTsKZnVuY3Rpb24gc2hvd1RpdGxlcygpIHsKICBjb25zdCBsaXN0ID0gc3RhdGUudGl0bGVzLm1hcCgodCwgaSkgPT4gYDxkaXYgY2xhc3M9InRpdGxlLWl0ZW0iPjxzcGFuIGNsYXNzPSJwYWdlbm8iPiR7cGFkMih0LnBhZ2Vfbm8pfTwvc3Bhbj48aW5wdXQgdHlwZT0idGV4dCIgZGF0YS1pZHg9IiR7aX0iIHZhbHVlPSIke2VzYyh0LnRpdGxlKX0iPjxzcGFuIGNsYXNzPSJpbmZvLXR5cGUiPiR7SU5GT19MQUJFTFt0LmluZm9fdHlwZV0gfHwgIuingueCuSJ9PC9zcGFuPjwvZGl2PmApLmpvaW4oIiIpOwogIGNvbnN0IHJ0ID0gc3RhdGUucmVhZFRocm91Z2ggPyBgPGRpdiBjbGFzcz0icmVhZHRocm91Z2giPjxkaXYgY2xhc3M9InJlYWR0aHJvdWdoLWxhYmVsIj5SZWFkLVRocm91Z2ggwrcg6L+e6K+76Ieq5qOAICR7c3RhdGUucmVhZFRocm91Z2guY29oZXJlbnQgPyAnPHNwYW4gY2xhc3M9InRhZyB0YWctdXNlciI+6L+e6LSvPC9zcGFuPicgOiAnPHNwYW4gY2xhc3M9InRhZyB0YWctcGVuZGluZyI+5a2Y5Zyo5pat6KOCPC9zcGFuPid9PC9kaXY+PGRpdiBjbGFzcz0icmVhZHRocm91Z2gtdGV4dCI+JHtlc2Moc3RhdGUucmVhZFRocm91Z2guc3RvcnkpfTwvZGl2PjwvZGl2PmAgOiAiIjsKICAkKCIjdGl0bGVzQm94IikuaW5uZXJIVE1MID0gYDxkaXYgc3R5bGU9Im1hcmdpbi10b3A6MTRweCI+JHtsaXN0fTwvZGl2PiR7cnR9YDsKICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCIjdGl0bGVzQm94IGlucHV0IikuZm9yRWFjaChpbnAgPT4gewogICAgaW5wLm9uY2hhbmdlID0gKCkgPT4geyBzdGF0ZS50aXRsZXNbK2lucC5kYXRhc2V0LmlkeF0udGl0bGUgPSBpbnAudmFsdWU7IH07CiAgfSk7Cn0KCi8qIC0tLS0tLS0tLS0tLS0tLS0gU3RlcCAzIOWGheWuuea3seWMliAtLS0tLS0tLS0tLS0tLS0tICovCmNvbnN0IExBWU9VVF9TQ0hFTUVTID0gewogIHpvbmdmZW46IHsgbmFtZTogIuaAu+WIhuiuuuivgSIsIHN0cnVjdDogIuaguOW/g+e7k+iuuiArIDMg5Liq5bm25YiX5YiG6K665o2uIiB9LAogIGRhdGE6IHsgbmFtZTogIuaVsOaNruiuuuivgSIsIHN0cnVjdDogIuaguOW/g+aVsOWtlyArIOi2i+WKvyArIOWvueavlCArIOadpea6kCIgfSwKICBjb21wYXJlOiB7IG5hbWU6ICLlr7nmr5Torrror4EiLCBzdHJ1Y3Q6ICLlpJrmlrnmoYjmqKrlkJHlr7nmr5QiIH0sCiAgY2F1c2U6IHsgbmFtZTogIuWboOaenOmTvuiuuuivgSIsIHN0cnVjdDogIuWOn+WboCDihpIg5py65Yi2IOKGkiDnu5PmnpwiIH0sCiAgcHNiOiB7IG5hbWU6ICLpl67popgt5pa55qGILeaUtuebiiIsIHN0cnVjdDogIueXm+eCuSDihpIg5pa55qGIIOKGkiDph4/ljJbmlLbnm4oiIH0sCiAgc3Rvcnk6IHsgbmFtZTogIuaVheS6i+iuuuivgSIsIHN0cnVjdDogIuWcuuaZryDihpIg5Yay56qBIOKGkiDovazmipgg4oaSIOWQr+ekuiIgfSwKICB0aW1lbGluZTogeyBuYW1lOiAi5pe26Ze057q/6K666K+BIiwgc3RydWN0OiAi6L+H5Y67IOKGkiDnjrDlnKgg4oaSIOacquadpSIgfSwKICBtYXRyaXg6IHsgbmFtZTogIjJ4MiDnn6npmLXorrror4EiLCBzdHJ1Y3Q6ICLlj4znu7Tluqblm5vosaHpmZAiIH0sCn07CmNvbnN0IFNPVVJDRV9MQUJFTCA9IHsgdXNlcl9wcm92aWRlZDogWyLnlKjmiLfmj5DkvpsiLCAidGFnLXVzZXIiXSwgYWlfcmV0cmlldmVkOiBbIkFJ5qOA57SiIiwgInRhZy1haSJdLCBwZW5kaW5nX3ZlcmlmeTogWyLlvoXpqozor4EiLCAidGFnLXBlbmRpbmciXSwgc2FtcGxlX2RhdGE6IFsi56S65L6L5pWw5o2uIiwgInRhZy1zYW1wbGUiXSB9OwoKZnVuY3Rpb24gcmVuZGVyU3RlcDModykgewogIGNvbnN0IHBhbmVsID0gZWwoImRpdiIsICJwYW5lbCIpOwogIHBhbmVsLmlubmVySFRNTCA9IHBhbmVsSGVhZCgi6K6p5q+P6aG1PGVtPuacieaWmTwvZW0+77yMPGJyPuS4jeWPquaYr+acieagh+mimOOAgiIsICLku6XmoIfpopjkuLrorrrngrnvvIzpgInmi6norrrmja7luIPlsYDmlrnmoYjvvIzmlLbpm4bmlbTnkIborrrmja7jgILlhYjmibnph4/pooTop4jlhajosozvvIzlho3pgJDpobXmt7HlhaXjgIIiKTsKICBwYW5lbC5pbm5lckhUTUwgKz0gYAogICAgPGRpdiBjbGFzcz0iY2FyZCI+PGRpdiBjbGFzcz0iYnRuLXJvdyI+PGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IiBpZD0icHJldmlld0J0biI+56ys5LiA6L2uIMK3IOaJuemHj+eUn+aIkOWGheWuuemihOiniDwvYnV0dG9uPjwvZGl2PjwvZGl2PgogICAgPGRpdiBpZD0icGFnZXNCb3giPjwvZGl2PgogICAgPGRpdiBjbGFzcz0iYnRuLXJvdyI+PGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1hY2NlbnQiIGlkPSJ0b1N0ZXA0IiBzdHlsZT0iZGlzcGxheToke3N0YXRlLnBhZ2VzLmxlbmd0aCA/ICJpbmxpbmUtYmxvY2siIDogIm5vbmUifSI+5LiL5LiA5q2l77ya6KeG6KeJ6aOO5qC8IOKGkjwvYnV0dG9uPjwvZGl2PgogIGA7CiAgdy5hcHBlbmRDaGlsZChwYW5lbCk7CiAgaWYgKHN0YXRlLnBhZ2VzLmxlbmd0aCkgc2hvd1BhZ2VzKCk7CiAgJCgiI3ByZXZpZXdCdG4iKS5vbmNsaWNrID0gYXN5bmMgKCkgPT4gewogICAgbG9hZGluZyh0cnVlLCAi5om56YeP55Sf5oiQ5YaF5a655bu66K6u77yI5pyA5aSaIDMwIOenku+8iS4uLiIpOwogICAgdHJ5IHsKICAgICAgY29uc3QgciA9IGF3YWl0IGFwaShgL2FwaS9wcm9qZWN0cy8ke3N0YXRlLnByb2plY3RJZH0vcHJldmlld2AsIHsgbWV0aG9kOiAiUE9TVCIgfSk7CiAgICAgIHN0YXRlLnBhZ2VzID0gci5wYWdlczsKICAgICAgLy8g5YWI5riy5p+TIFVJ77yM5YaN5byC5q2l5oyB5LmF5YyW77yI6YG/5YWNIHN0ZXBzLzMg5aSx6LSl6Zi75patIFVJ77yJCiAgICAgIHNob3dQYWdlcygpOyAkKCIjdG9TdGVwNCIpLnN0eWxlLmRpc3BsYXkgPSAiaW5saW5lLWJsb2NrIjsKICAgICAgdHJ5IHsgYXdhaXQgYXBpKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS9zdGVwcy8zYCwgeyBtZXRob2Q6ICJQT1NUIiwgYm9keTogeyBwYWdlczogci5wYWdlcyB9IH0pOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUud2Fybigic3RlcHMvMyBzYXZlIGZhaWxlZDoiLCBlLm1lc3NhZ2UpOyB9CiAgICB9IGNhdGNoIChlKSB7IHRvYXN0KCLlpLHotKXvvJoiICsgZS5tZXNzYWdlKTsgfSBmaW5hbGx5IHsgbG9hZGluZyhmYWxzZSk7IH0KICB9OwogIGNvbnN0IHRvNCA9ICQoIiN0b1N0ZXA0Iik7IGlmICh0bzQpIHRvNC5vbmNsaWNrID0gKCkgPT4geyBzdGF0ZS5zdGVwID0gNDsgc2F2ZVN0ZXBOYXYoNCk7IHJlbmRlckFsbCgpOyB9Owp9CgpmdW5jdGlvbiBzaG93UGFnZXMoKSB7CiAgY29uc3QgYm94ID0gJCgiI3BhZ2VzQm94Iik7CiAgYm94LmlubmVySFRNTCA9IHN0YXRlLnBhZ2VzLm1hcCgocCwgaSkgPT4gewogICAgY29uc3QgcHRzID0gKHAucG9pbnRzIHx8IFtdKS5tYXAocHQgPT4gewogICAgICBjb25zdCBzID0gU09VUkNFX0xBQkVMW3B0LnNvdXJjZV0gfHwgU09VUkNFX0xBQkVMLnBlbmRpbmdfdmVyaWZ5OwogICAgICByZXR1cm4gYDxkaXYgY2xhc3M9InBpbGxhci1wb2ludCI+JHtlc2MocHQudGV4dCl9PHNwYW4gY2xhc3M9InRhZyAke3NbMV19Ij4ke3NbMF19PC9zcGFuPjwvZGl2PmA7CiAgICB9KS5qb2luKCIiKTsKICAgIGNvbnN0IGxheW91dHMgPSBPYmplY3QuZW50cmllcyhMQVlPVVRfU0NIRU1FUykubWFwKChbaywgbF0pID0+IGA8ZGl2IGNsYXNzPSJsYXlvdXQtb3B0ICR7cC5sYXlvdXQgPT09IGsgPyAic2VsZWN0ZWQiIDogIiJ9IiBkYXRhLXBhZ2U9IiR7aX0iIGRhdGEtbGF5b3V0PSIke2t9Ij48ZGl2IGNsYXNzPSJsbmFtZSI+JHtsLm5hbWV9PC9kaXY+PGRpdiBjbGFzcz0ibHN0cnVjdCI+JHtsLnN0cnVjdH08L2Rpdj48L2Rpdj5gKS5qb2luKCIiKTsKICAgIHJldHVybiBgPGRpdiBjbGFzcz0iY2FyZCI+CiAgICAgIDxoMz7nrKwgJHtwLnBhZ2Vfbm99IOmhtSDCtyAke2VzYyhwLnRpdGxlKX08L2gzPgogICAgICA8ZGl2IHN0eWxlPSJtYXJnaW46OHB4IDAiPjxzdHJvbmcgc3R5bGU9ImZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWFzaCkiPumAieaLqeiuuuaNruW4g+WxgOaWueahiO+8mjwvc3Ryb25nPjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJsYXlvdXQtZ3JpZCI+JHtsYXlvdXRzfTwvZGl2PgogICAgICA8ZGl2IHN0eWxlPSJtYXJnaW4tdG9wOjEwcHgiPiR7cHRzIHx8ICc8cCBzdHlsZT0iY29sb3I6dmFyKC0tYXNoKSI+5pqC5peg6KaB54K5PC9wPid9PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIiBzdHlsZT0ibWFyZ2luLXRvcDoxMnB4Ij48bGFiZWw+6KGl5YWF57Sg5p2QIC8g6LCD5pW06KeS5bqm77yI56ys5LqM6L2u5rex5YWl77yJPC9sYWJlbD48dGV4dGFyZWEgaWQ9Im5vdGUtJHtpfSIgcGxhY2Vob2xkZXI9IuaPkOS+m+aVsOaNruOAgeS4iuS8oOivtOaYjuOAgeiwg+aVtOiuuuivgeinkuW6pi4uLiI+PC90ZXh0YXJlYT48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iYnRuLXJvdyI+PGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zbSBidG4tcHJpbWFyeSIgZGF0YS1kZWVwZW49IiR7aX0iPua3seWMluacrOmhtTwvYnV0dG9uPjwvZGl2PgogICAgPC9kaXY+YDsKICB9KS5qb2luKCIiKTsKICBib3gucXVlcnlTZWxlY3RvckFsbCgiLmxheW91dC1vcHQiKS5mb3JFYWNoKG9wdCA9PiB7CiAgICBvcHQub25jbGljayA9ICgpID0+IHsKICAgICAgY29uc3QgaSA9ICtvcHQuZGF0YXNldC5wYWdlOwogICAgICBzdGF0ZS5wYWdlc1tpXS5sYXlvdXQgPSBvcHQuZGF0YXNldC5sYXlvdXQ7CiAgICAgIGJveC5xdWVyeVNlbGVjdG9yQWxsKGAubGF5b3V0LW9wdFtkYXRhLXBhZ2U9IiR7aX0iXWApLmZvckVhY2gobyA9PiBvLmNsYXNzTGlzdC50b2dnbGUoInNlbGVjdGVkIiwgby5kYXRhc2V0LmxheW91dCA9PT0gb3B0LmRhdGFzZXQubGF5b3V0KSk7CiAgICB9OwogIH0pOwogIGJveC5xdWVyeVNlbGVjdG9yQWxsKCJbZGF0YS1kZWVwZW5dIikuZm9yRWFjaChidG4gPT4gewogICAgYnRuLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7CiAgICAgIGNvbnN0IGkgPSArYnRuLmRhdGFzZXQuZGVlcGVuOwogICAgICBjb25zdCBwID0gc3RhdGUucGFnZXNbaV07CiAgICAgIGxvYWRpbmcodHJ1ZSwgYOa3seWMluesrCAke3AucGFnZV9ub30g6aG1Li4uYCk7CiAgICAgIHRyeSB7CiAgICAgICAgY29uc3QgciA9IGF3YWl0IGFwaShgL2FwaS9wcm9qZWN0cy8ke3N0YXRlLnByb2plY3RJZH0vZGVlcGVuYCwgeyBtZXRob2Q6ICJQT1NUIiwgYm9keTogeyBwYWdlX25vOiBwLnBhZ2Vfbm8sIGxheW91dDogcC5sYXlvdXQsIHVzZXJfbm90ZTogJCgiI25vdGUtIiArIGkpLnZhbHVlIH0gfSk7CiAgICAgICAgc3RhdGUucGFnZXNbaV0gPSByLnBhZ2U7CiAgICAgICAgLy8g5YWI5riy5p+TIFVJ77yM5YaN5byC5q2l5oyB5LmF5YyW77yI6YG/5YWNIHN0ZXBzLzMg5aSx6LSl6Zi75patIFVJ77yJCiAgICAgICAgc2hvd1BhZ2VzKCk7CiAgICAgICAgdHJ5IHsgYXdhaXQgYXBpKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS9zdGVwcy8zYCwgeyBtZXRob2Q6ICJQT1NUIiwgYm9keTogeyBwYWdlczogW3IucGFnZV0gfSB9KTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLndhcm4oInN0ZXBzLzMgc2F2ZSBmYWlsZWQ6IiwgZS5tZXNzYWdlKTsgfQogICAgICB9IGNhdGNoIChlKSB7IHRvYXN0KCLlpLHotKXvvJoiICsgZS5tZXNzYWdlKTsgfSBmaW5hbGx5IHsgbG9hZGluZyhmYWxzZSk7IH0KICAgIH07CiAgfSk7Cn0KCi8qIC0tLS0tLS0tLS0tLS0tLS0gU3RlcCA0IOinhuiniemjjuagvCAtLS0tLS0tLS0tLS0tLS0tICovCmZ1bmN0aW9uIHJlbmRlclN0ZXA0KHcpIHsKICBjb25zdCBwYW5lbCA9IGVsKCJkaXYiLCAicGFuZWwiKTsKICBwYW5lbC5pbm5lckhUTUwgPSBwYW5lbEhlYWQoIuWGheWuueWumuS6hu+8jDxlbT7po47moLw8L2VtPuaJjeacieaEj+S5ieOAgiIsICLlhoXlrrnnoa7lrprlkI7pgInmi6nljLnphY3nmoTorr7orqHpo47moLzvvIzpgb/lhY0n5YWI6YCJ5qih5p2/5YaN56Gs5aGe5YaF5a65J+OAgiIpOwogIHBhbmVsLmlubmVySFRNTCArPSBgPGRpdiBjbGFzcz0iY2FyZCI+PGRpdiBjbGFzcz0iYnRuLXJvdyI+PGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IiBpZD0ibG9hZFRoZW1lcyI+QUkg5o6o6I2Q6aOO5qC8PC9idXR0b24+PC9kaXY+PGRpdiBpZD0idGhlbWVCb3giIHN0eWxlPSJtYXJnaW4tdG9wOjE2cHgiPjwvZGl2PjwvZGl2PgogIDxkaXYgY2xhc3M9ImJ0bi1yb3ciPjxidXR0b24gY2xhc3M9ImJ0biBidG4tYWNjZW50IiBpZD0idG9TdGVwNSIgc3R5bGU9ImRpc3BsYXk6JHtzdGF0ZS5zdHlsZSA/ICJpbmxpbmUtYmxvY2siIDogIm5vbmUifSI+5LiL5LiA5q2l77ya55Sf5oiQ5Yid56i/IOKGkjwvYnV0dG9uPjwvZGl2PmA7CiAgdy5hcHBlbmRDaGlsZChwYW5lbCk7CiAgJCgiI2xvYWRUaGVtZXMiKS5vbmNsaWNrID0gYXN5bmMgKCkgPT4gewogICAgbG9hZGluZyh0cnVlLCAi5o6o6I2Q6aOO5qC8Li4uIik7CiAgICB0cnkgewogICAgICBjb25zdCByID0gYXdhaXQgYXBpKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS9zdHlsZS9yZWNvbW1lbmRgLCB7IG1ldGhvZDogIlBPU1QiIH0pOwogICAgICBzdGF0ZS50aGVtZXMgPSByLnRoZW1lczsgc2hvd1RoZW1lcyhyLnJlY29tbWVuZGVkKTsKICAgIH0gY2F0Y2ggKGUpIHsgdG9hc3QoIuWksei0pe+8miIgKyBlLm1lc3NhZ2UpOyB9IGZpbmFsbHkgeyBsb2FkaW5nKGZhbHNlKTsgfQogIH07CiAgY29uc3QgdG81ID0gJCgiI3RvU3RlcDUiKTsgaWYgKHRvNSkgdG81Lm9uY2xpY2sgPSAoKSA9PiB7IHN0YXRlLnN0ZXAgPSA1OyBzYXZlU3RlcE5hdig1KTsgcmVuZGVyQWxsKCk7IH07Cn0KZnVuY3Rpb24gc2hvd1RoZW1lcyhyZWNvbW1lbmRlZCkgewogIGNvbnN0IGJveCA9ICQoIiN0aGVtZUJveCIpOwogIGJveC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz0idGhlbWUtZ3JpZCI+YCArIHN0YXRlLnRoZW1lcy5tYXAodCA9PiB7CiAgICBjb25zdCByZWMgPSAocmVjb21tZW5kZWQgfHwgW10pWzBdID09PSB0LmtleSA/ICc8c3BhbiBjbGFzcz0idGFnIHRhZy11c2VyIj7mjqjojZA8L3NwYW4+JyA6ICIiOwogICAgcmV0dXJuIGA8ZGl2IGNsYXNzPSJ0aGVtZS1jYXJkICR7c3RhdGUuc3R5bGU/LnRoZW1lID09PSB0LmtleSA/ICJzZWxlY3RlZCIgOiAiIn0iIGRhdGEtdGhlbWU9IiR7dC5rZXl9Ij4KICAgICAgPGRpdiBjbGFzcz0idGhlbWUtcHJldmlldyIgc3R5bGU9ImJhY2tncm91bmQ6JHt0LmJnfSI+CiAgICAgICAgPGRpdiBzdHlsZT0iZm9udC1mYW1pbHk6JHt0LnRpdGxlRm9udCA9PT0gInNlcmlmIiA/ICJ2YXIoLS1zZXJpZikiIDogInZhcigtLXNhbnMpIn07Zm9udC1zaXplOjE4cHg7Zm9udC13ZWlnaHQ6Ym9sZDtjb2xvcjoke3QucHJpbWFyeX0iPuagh+mimOekuuS+iyBBYTwvZGl2PgogICAgICAgIDxkaXYgc3R5bGU9ImZvbnQtc2l6ZToxMXB4O2NvbG9yOiR7dC50ZXh0fTttYXJnaW4tdG9wOjZweCI+5q2j5paH56S65L6L5paH5a2XIMK3IOaVsOaNriA8c3BhbiBzdHlsZT0iY29sb3I6JHt0LmFjY2VudH07Zm9udC13ZWlnaHQ6Ym9sZCI+MzglPC9zcGFuPjwvZGl2PgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0idGhlbWUtbmFtZSI+JHtlc2ModC5uYW1lKX0gJHtyZWN9PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InRoZW1lLWRlc2MiPiR7ZXNjKHQuZGVzYyl9PC9kaXY+CiAgICA8L2Rpdj5gOwogIH0pLmpvaW4oIiIpICsgYDwvZGl2PmA7CiAgYm94LnF1ZXJ5U2VsZWN0b3JBbGwoIi50aGVtZS1jYXJkIikuZm9yRWFjaChjYXJkID0+IHsKICAgIGNhcmQub25jbGljayA9IGFzeW5jICgpID0+IHsKICAgICAgY29uc3Qga2V5ID0gY2FyZC5kYXRhc2V0LnRoZW1lOwogICAgICBjb25zdCB0ID0gc3RhdGUudGhlbWVzLmZpbmQoeCA9PiB4LmtleSA9PT0ga2V5KTsKICAgICAgc3RhdGUuc3R5bGUgPSB7IHRoZW1lOiBrZXksIHByaW1hcnlfY29sb3I6IHQucHJpbWFyeSwgYmdfY29sb3I6IHQuYmcsIGFjY2VudF9jb2xvcjogdC5hY2NlbnQsIHRleHRfY29sb3I6IHQudGV4dCwgdGl0bGVfZm9udDogdC50aXRsZUZvbnQsIGNoYXJ0X3N0eWxlOiB0LmNoYXJ0U3R5bGUgfTsKICAgICAgYXdhaXQgYXBpKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS9zdGVwcy80YCwgeyBtZXRob2Q6ICJQT1NUIiwgYm9keTogc3RhdGUuc3R5bGUgfSk7CiAgICAgIGJveC5xdWVyeVNlbGVjdG9yQWxsKCIudGhlbWUtY2FyZCIpLmZvckVhY2goYyA9PiBjLmNsYXNzTGlzdC50b2dnbGUoInNlbGVjdGVkIiwgYy5kYXRhc2V0LnRoZW1lID09PSBrZXkpKTsKICAgICAgJCgiI3RvU3RlcDUiKS5zdHlsZS5kaXNwbGF5ID0gImlubGluZS1ibG9jayI7CiAgICAgIHRvYXN0KCLlt7LpgInmi6nvvJoiICsgdC5uYW1lKTsKICAgIH07CiAgfSk7Cn0KCi8qIC0tLS0tLS0tLS0tLS0tLS0gU3RlcCA1IOeUn+aIkOWIneeovyAtLS0tLS0tLS0tLS0tLS0tICovCmZ1bmN0aW9uIHJlbmRlclN0ZXA1KHcpIHsKICBjb25zdCBwYW5lbCA9IGVsKCJkaXYiLCAicGFuZWwiKTsKICBwYW5lbC5pbm5lckhUTUwgPSBwYW5lbEhlYWQoIumqqOaetuS4juihgOiCieS/seWkh++8jDxicj48ZW0+5riy5p+TPC9lbT7msLTliLDmuKDmiJDjgIIiLCAi5Z+65LqO5Y+X5LyX44CB5qCH6aKY44CB5YaF5a655Y2h54mH44CB6aOO5qC86KeE6IyD77yM5riy5p+T5a6M5pW05bm754Gv54mH5Yid56i/44CCIik7CiAgcGFuZWwuaW5uZXJIVE1MICs9IGA8ZGl2IGNsYXNzPSJjYXJkIj48ZGl2IGNsYXNzPSJidG4tcm93Ij48YnV0dG9uIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiIGlkPSJnZW5CdG4iPueUn+aIkOWujOaVtOWIneeovzwvYnV0dG9uPjwvZGl2PjxkaXYgaWQ9ImdlblN0YXR1cyIgc3R5bGU9Im1hcmdpbi10b3A6MTJweCI+PC9kaXY+PC9kaXY+CiAgPGRpdiBpZD0iZGVja1ByZXZpZXciPjwvZGl2PgogIDxkaXYgY2xhc3M9ImJ0bi1yb3ciPjxidXR0b24gY2xhc3M9ImJ0biBidG4tYWNjZW50IiBpZD0idG9TdGVwNiIgc3R5bGU9ImRpc3BsYXk6JHtzdGF0ZS5zbGlkZXMubGVuZ3RoID8gImlubGluZS1ibG9jayIgOiAibm9uZSJ9Ij7kuIvkuIDmraXvvJrnsr7kv64g4oaSPC9idXR0b24+PC9kaXY+YDsKICB3LmFwcGVuZENoaWxkKHBhbmVsKTsKICBpZiAoc3RhdGUuc2xpZGVzLmxlbmd0aCkgc2hvd0RlY2tQcmV2aWV3KCk7CiAgJCgiI2dlbkJ0biIpLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7CiAgICBsb2FkaW5nKHRydWUsICLpgJDpobXmuLLmn5PliJ3nqL8uLi4iKTsKICAgIHRyeSB7CiAgICAgIGNvbnN0IHIgPSBhd2FpdCBhcGkoYC9hcGkvcHJvamVjdHMvJHtzdGF0ZS5wcm9qZWN0SWR9L2dlbmVyYXRlYCwgeyBtZXRob2Q6ICJQT1NUIiB9KTsKICAgICAgc3RhdGUuc2xpZGVzID0gci5zbGlkZXM7CiAgICAgICQoIiNnZW5TdGF0dXMiKS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz0ib2stYmFubmVyIj7inJMg5bey55Sf5oiQICR7ci5zbGlkZXMubGVuZ3RofSDpobXlubvnga/niYc8L2Rpdj5gOwogICAgICBzaG93RGVja1ByZXZpZXcoKTsgJCgiI3RvU3RlcDYiKS5zdHlsZS5kaXNwbGF5ID0gImlubGluZS1ibG9jayI7CiAgICB9IGNhdGNoIChlKSB7IHRvYXN0KCLlpLHotKXvvJoiICsgZS5tZXNzYWdlKTsgfSBmaW5hbGx5IHsgbG9hZGluZyhmYWxzZSk7IH0KICB9OwogIGNvbnN0IHRvNiA9ICQoIiN0b1N0ZXA2Iik7IGlmICh0bzYpIHRvNi5vbmNsaWNrID0gKCkgPT4geyBzdGF0ZS5zdGVwID0gNjsgc2F2ZVN0ZXBOYXYoNik7IHJlbmRlckFsbCgpOyB9Owp9CgpmdW5jdGlvbiBibG9ja0h0bWwoYiwgdGhlbWUpIHsKICB0aGVtZSA9IHRoZW1lIHx8IHsgcHJpbWFyeTogIiMxQjNBNUMiLCBhY2NlbnQ6ICIjQjg4OTVBIiwgdGV4dDogIiMyQzJDMkMiLCB0aXRsZUZvbnQ6ICJzZXJpZiIgfTsKICBjb25zdCBmb250ID0gdGhlbWUudGl0bGVGb250ID09PSAic2VyaWYiID8gInZhcigtLXNlcmlmKSIgOiAidmFyKC0tc2FucykiOwogIHN3aXRjaCAoYi50eXBlKSB7CiAgICBjYXNlICJoZWFkaW5nIjogcmV0dXJuIGA8ZGl2IGNsYXNzPSJibG9jayBibG9jay1oZWFkaW5nIiBzdHlsZT0iY29sb3I6JHt0aGVtZS5wcmltYXJ5fTtmb250LWZhbWlseToke2ZvbnR9Ij4ke2VzYyhiLmNvbnRlbnQpfTwvZGl2PmA7CiAgICBjYXNlICJrcGkiOiByZXR1cm4gYDxkaXYgY2xhc3M9ImJsb2NrIGJsb2NrLWtwaSIgc3R5bGU9ImNvbG9yOiR7dGhlbWUuYWNjZW50fSI+JHtlc2MoYi5jb250ZW50KX08L2Rpdj5gOwogICAgY2FzZSAicXVvdGUiOiByZXR1cm4gYDxkaXYgY2xhc3M9ImJsb2NrIGJsb2NrLXF1b3RlIiBzdHlsZT0iYm9yZGVyLWNvbG9yOiR7dGhlbWUuYWNjZW50fTtjb2xvcjoke3RoZW1lLnRleHR9Ij4ke2VzYyhiLmNvbnRlbnQpfTwvZGl2PmA7CiAgICBjYXNlICJidWxsZXRzIjogcmV0dXJuIGA8dWwgY2xhc3M9ImJsb2NrIGJsb2NrLWJ1bGxldHMiIHN0eWxlPSJjb2xvcjoke3RoZW1lLnRleHR9Ij4keyhiLml0ZW1zIHx8IFtdKS5tYXAoaSA9PiBgPGxpPiR7ZXNjKGkpfTwvbGk+YCkuam9pbigiIil9PC91bD5gOwogICAgY2FzZSAiY2hhcnQiOiBjYXNlICJ0YWJsZSI6IGNhc2UgIm1hdHJpeCI6IHJldHVybiBgPGRpdiBjbGFzcz0iYmxvY2sgYmxvY2stJHtiLnR5cGV9IiBzdHlsZT0iY29sb3I6JHt0aGVtZS5hY2NlbnR9Ij5bJHtiLnR5cGV9XSAke2VzYyhiLmNvbnRlbnQpfSR7KGIuaXRlbXMgfHwgW10pLmxlbmd0aCA/IGA8ZGl2IHN0eWxlPSJ0ZXh0LWFsaWduOmxlZnQ7bWFyZ2luLXRvcDo4cHg7Y29sb3I6JHt0aGVtZS50ZXh0fSI+JHtiLml0ZW1zLm1hcChpID0+ICLil6YgIiArIGVzYyhpKSkuam9pbigiPGJyPiIpfTwvZGl2PmAgOiAiIn08L2Rpdj5gOwogICAgZGVmYXVsdDogcmV0dXJuIGA8ZGl2IGNsYXNzPSJibG9jayBibG9jay10ZXh0IiBzdHlsZT0iY29sb3I6JHt0aGVtZS50ZXh0fSI+JHtlc2MoYi5jb250ZW50KX08L2Rpdj5gOwogIH0KfQpmdW5jdGlvbiBzaG93RGVja1ByZXZpZXcoKSB7CiAgY29uc3QgdGhlbWUgPSBzdGF0ZS5zdHlsZSA/IHsgcHJpbWFyeTogc3RhdGUuc3R5bGUucHJpbWFyeV9jb2xvciwgYWNjZW50OiBzdGF0ZS5zdHlsZS5hY2NlbnRfY29sb3IsIHRleHQ6IHN0YXRlLnN0eWxlLnRleHRfY29sb3IsIHRpdGxlRm9udDogc3RhdGUuc3R5bGUudGl0bGVfZm9udCB9IDogbnVsbDsKICAkKCIjZGVja1ByZXZpZXciKS5pbm5lckhUTUwgPSBzdGF0ZS5zbGlkZXMubWFwKHMgPT4gYDxkaXYgY2xhc3M9ImNhcmQiPjxoMz7nrKwgJHtzLnBhZ2Vfbm99IOmhtTwvaDM+JHtzLmJsb2Nrcy5tYXAoYiA9PiBibG9ja0h0bWwoYiwgdGhlbWUpKS5qb2luKCIiKX08L2Rpdj5gKS5qb2luKCIiKTsKfQoKLyogLS0tLS0tLS0tLS0tLS0tLSBTdGVwIDYg57K+5L+uIC0tLS0tLS0tLS0tLS0tLS0gKi8KZnVuY3Rpb24gcmVuZGVyU3RlcDYodykgewogIGNvbnN0IHBhbmVsID0gZWwoImRpdiIsICJwYW5lbCIpOwogIHBhbmVsLmlubmVySFRNTCA9IHBhbmVsSGVhZCgi5YOP5a+56K+d5LiA5qC3PGVtPueyvuS/rjwvZW0+77yMPGJyPumUgeWumua7oeaEj+eahO+8jOmHjeWBmuS4jea7oeaEj+eahOOAgiIsICJBSSDlr7nor53kv67mlLnvvIjku4XlvZPliY3pobXvvIkrIOaJi+WKqOe8lui+kSArIOeJiOacrOeuoeeQhuOAgumUgeWumua7oeaEj+mhtemdoumYsuatoiBBSSDmlLnliqjjgIIiKTsKICBwYW5lbC5pbm5lckhUTUwgKz0gYDxkaXYgaWQ9ImVkaXRvckJveCI+PC9kaXY+CiAgPGRpdiBjbGFzcz0iYnRuLXJvdyI+PGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1hY2NlbnQiIGlkPSJ0b1N0ZXA3Ij7kuIvkuIDmraXvvJrlrozmiJDlr7zlh7og4oaSPC9idXR0b24+PC9kaXY+YDsKICB3LmFwcGVuZENoaWxkKHBhbmVsKTsKICBpZiAoIXN0YXRlLnNsaWRlcy5sZW5ndGgpIHsgJCgiI2VkaXRvckJveCIpLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPSJ3YXJuLWJhbm5lciI+5bCa5pyq55Sf5oiQ5Yid56i/77yM6K+35YWI5Zue5YiwIFN0ZXAgNSDnlJ/miJDjgII8L2Rpdj5gOyByZXR1cm47IH0KICBzaG93RWRpdG9yKCk7CiAgJCgiI3RvU3RlcDciKS5vbmNsaWNrID0gKCkgPT4geyBzdGF0ZS5zdGVwID0gNzsgc2F2ZVN0ZXBOYXYoNyk7IHJlbmRlckFsbCgpOyB9Owp9CgpmdW5jdGlvbiBzaG93RWRpdG9yKCkgewogIGNvbnN0IHRoZW1lID0gc3RhdGUuc3R5bGUgPyB7IHByaW1hcnk6IHN0YXRlLnN0eWxlLnByaW1hcnlfY29sb3IsIGFjY2VudDogc3RhdGUuc3R5bGUuYWNjZW50X2NvbG9yLCB0ZXh0OiBzdGF0ZS5zdHlsZS50ZXh0X2NvbG9yLCB0aXRsZUZvbnQ6IHN0YXRlLnN0eWxlLnRpdGxlX2ZvbnQgfSA6IG51bGw7CiAgY29uc3QgY3VyID0gc3RhdGUuc2xpZGVzW3N0YXRlLmN1cnJlbnRTbGlkZV07CiAgY29uc3QgdGh1bWJzID0gc3RhdGUuc2xpZGVzLm1hcCgocywgaSkgPT4gYDxkaXYgY2xhc3M9InNsaWRlLXRodW1iICR7aSA9PT0gc3RhdGUuY3VycmVudFNsaWRlID8gImFjdGl2ZSIgOiAiIn0iIGRhdGEtc2xpZGU9IiR7aX0iPgogICAgPGRpdiBjbGFzcz0idGh1bWItY2FudmFzIj48ZGl2IGNsYXNzPSJ0aHVtYi10aXRsZSI+JHtlc2Mocy50aXRsZSl9PC9kaXY+PC9kaXY+CiAgICA8c3BhbiBjbGFzcz0idGh1bWItbm8iPiR7cy5wYWdlX25vfTwvc3Bhbj4ke3MubG9ja2VkID8gJzxzcGFuIGNsYXNzPSJsb2NrLWJhZGdlIj7wn5SSPC9zcGFuPicgOiAiIn0KICA8L2Rpdj5gKS5qb2luKCIiKTsKICBjb25zdCBibG9ja3MgPSBjdXIuYmxvY2tzLm1hcCgoYiwgYmkpID0+IGA8ZGl2IGNsYXNzPSJibG9jay13cmFwIiBkYXRhLWJsb2NrPSIke2JpfSI+JHtibG9ja0h0bWwoYiwgdGhlbWUpfTwvZGl2PmApLmpvaW4oIiIpOwogICQoIiNlZGl0b3JCb3giKS5pbm5lckhUTUwgPSBgCiAgICA8ZGl2IGNsYXNzPSJkZWNrIj4KICAgICAgPGRpdiBjbGFzcz0ic2xpZGUtdGh1bWItbGlzdCI+JHt0aHVtYnN9PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InNsaWRlLWNhbnZhcy13cmFwIj4KICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkIiBzdHlsZT0icGFkZGluZzoxMnB4IDE2cHg7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlciI+CiAgICAgICAgICA8c3Ryb25nPuesrCAke2N1ci5wYWdlX25vfSDpobU8L3N0cm9uZz4KICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc20iIGlkPSJsb2NrQnRuIj4ke2N1ci5sb2NrZWQgPyAi8J+UkyDop6PplIEiIDogIvCflJIg6ZSB5a6aIn08L2J1dHRvbj4KICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zbSIgaWQ9Im1hbnVhbEVkaXRCdG4iPuKcj++4jyDmiYvliqjnvJbovpE8L2J1dHRvbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InNsaWRlLWNhbnZhcyIgaWQ9InNsaWRlQ2FudmFzIj4ke2Jsb2Nrc308L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJhaS1jaGF0Ij4KICAgICAgICAgIDxkaXYgY2xhc3M9ImFpLWNoYXQtaGVhZCI+8J+SrCBBSSDlr7nor53kv67mlLnvvIjku4XlvZPliY3pobXvvIk8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImFpLWNoYXQtYm9keSI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImFpSW5zdHJ1Y3Rpb24iIHBsYWNlaG9sZGVyPSflpoLvvJoi5oqK5Zu+6KGo5o2i5oiQ5p+x54q25Zu+IiAvICLov5npobXlpKrmu6HkuobvvIzliKDmjonnrKzkuozkuKropoHngrkiJz48L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iYnRuLXJvdyI+PGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSIgaWQ9ImFpRWRpdEJ0biI+QUkg5L+u5pS5PC9idXR0b24+PC9kaXY+CiAgICAgICAgICAgIDxkaXYgaWQ9ImRpZmZCb3giPjwvZGl2PgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FyZCIgc3R5bGU9Im1hcmdpbi10b3A6MTZweCI+PGgzPueJiOacrOeuoeeQhjwvaDM+PGRpdiBjbGFzcz0iYnRuLXJvdyIgc3R5bGU9Im1hcmdpbi10b3A6MDttYXJnaW4tYm90dG9tOjEycHgiPjxidXR0b24gY2xhc3M9ImJ0biBidG4tc20iIGlkPSJsb2FkVmVyc2lvbnMiPuafpeeci+eJiOacrOWOhuWPsjwvYnV0dG9uPjwvZGl2PjxkaXYgaWQ9InZlcnNpb25Cb3giPjwvZGl2PjwvZGl2PgogICAgICA8L2Rpdj4KICAgIDwvZGl2PmA7CiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgiLnNsaWRlLXRodW1iIikuZm9yRWFjaCh0ID0+IHsgdC5vbmNsaWNrID0gKCkgPT4geyBzdGF0ZS5jdXJyZW50U2xpZGUgPSArdC5kYXRhc2V0LnNsaWRlOyBzaG93RWRpdG9yKCk7IH07IH0pOwogICQoIiNsb2NrQnRuIikub25jbGljayA9IGFzeW5jICgpID0+IHsKICAgIHRyeSB7CiAgICAgIGNvbnN0IHIgPSBhd2FpdCBhcGkoYC9hcGkvcHJvamVjdHMvJHtzdGF0ZS5wcm9qZWN0SWR9L3NsaWRlL2xvY2tgLCB7IG1ldGhvZDogIlBPU1QiLCBib2R5OiB7IHBhZ2Vfbm86IGN1ci5wYWdlX25vLCBsb2NrZWQ6ICFjdXIubG9ja2VkIH0gfSk7CiAgICAgIGN1ci5sb2NrZWQgPSByLmxvY2tlZCA/IDEgOiAwOyBzaG93RWRpdG9yKCk7IHRvYXN0KHIubG9ja2VkID8gIuW3sumUgeWumiIgOiAi5bey6Kej6ZSBIik7CiAgICB9IGNhdGNoIChlKSB7IHRvYXN0KCLlpLHotKXvvJoiICsgZS5tZXNzYWdlKTsgfQogIH07CiAgJCgiI21hbnVhbEVkaXRCdG4iKS5vbmNsaWNrID0gKCkgPT4gewogICAgY29uc3QgY2FudmFzID0gJCgiI3NsaWRlQ2FudmFzIik7CiAgICBjb25zdCBlZGl0aW5nID0gY2FudmFzLmRhdGFzZXQuZWRpdGluZyA9PT0gIjEiOwogICAgaWYgKCFlZGl0aW5nKSB7CiAgICAgIGNhbnZhcy5kYXRhc2V0LmVkaXRpbmcgPSAiMSI7CiAgICAgIGNhbnZhcy5xdWVyeVNlbGVjdG9yQWxsKCIuYmxvY2siKS5mb3JFYWNoKGIgPT4geyBiLmNvbnRlbnRFZGl0YWJsZSA9ICJ0cnVlIjsgfSk7CiAgICAgICQoIiNtYW51YWxFZGl0QnRuIikudGV4dENvbnRlbnQgPSAi8J+SviDkv53lrZjnvJbovpEiOwogICAgICB0b2FzdCgi5Y+v55u05o6l54K55Ye75paH5a2X57yW6L6R77yM5a6M5oiQ5ZCO54K55L+d5a2YIik7CiAgICB9IGVsc2UgewogICAgICBjYW52YXMucXVlcnlTZWxlY3RvckFsbCgiLmJsb2NrIikuZm9yRWFjaChiID0+IHsgYi5jb250ZW50RWRpdGFibGUgPSAiZmFsc2UiOyB9KTsKICAgICAgY2FudmFzLmRhdGFzZXQuZWRpdGluZyA9ICIwIjsKICAgICAgJCgiI21hbnVhbEVkaXRCdG4iKS50ZXh0Q29udGVudCA9ICLinI/vuI8g5omL5Yqo57yW6L6RIjsKICAgICAgc2F2ZU1hbnVhbEVkaXQoY3VyKTsKICAgIH0KICB9OwogICQoIiNhaUVkaXRCdG4iKS5vbmNsaWNrID0gYXN5bmMgKCkgPT4gewogICAgY29uc3QgaW5zdHJ1Y3Rpb24gPSAkKCIjYWlJbnN0cnVjdGlvbiIpLnZhbHVlLnRyaW0oKTsgaWYgKCFpbnN0cnVjdGlvbikgcmV0dXJuIHRvYXN0KCLor7fovpPlhaXkv67mlLnmjIfku6QiKTsKICAgIGxvYWRpbmcodHJ1ZSwgIkFJIOS/ruaUueW9k+WJjemhtS4uLiIpOwogICAgdHJ5IHsKICAgICAgY29uc3QgciA9IGF3YWl0IGFwaShgL2FwaS9wcm9qZWN0cy8ke3N0YXRlLnByb2plY3RJZH0vZWRpdC9haWAsIHsgbWV0aG9kOiAiUE9TVCIsIGJvZHk6IHsgcGFnZV9ubzogY3VyLnBhZ2Vfbm8sIGluc3RydWN0aW9uIH0gfSk7CiAgICAgICQoIiNkaWZmQm94IikuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9ImRpZmYtYm94Ij48ZGl2IGNsYXNzPSJkaWZmLWNvbCI+PGg1PuS/ruaUueWJjTwvaDU+PGRpdj4ke3IuYmVmb3JlLm1hcChiID0+IGVzYyhiLmNvbnRlbnQgfHwgYi50eXBlKSkuam9pbigiPGJyPiIpfTwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9ImRpZmYtY29sIj48aDU+5L+u5pS55ZCOPC9oNT48ZGl2PiR7ci5hZnRlci5tYXAoYiA9PiBlc2MoYi5jb250ZW50IHx8IGIudHlwZSkpLmpvaW4oIjxicj4iKX08L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPHAgc3R5bGU9ImZvbnQtc2l6ZToxM3B4O21hcmdpbjo4cHggMDtjb2xvcjp2YXIoLS1jaGFsaykiPiR7ZXNjKHIuY2hhbmdlX3N1bW1hcnkpfTwvcD4KICAgICAgPGRpdiBjbGFzcz0iYnRuLXJvdyI+PGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1hY2NlbnQgYnRuLXNtIiBpZD0iYXBwbHlFZGl0Ij7noa7orqTnlJ/mlYg8L2J1dHRvbj48YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNtIiBpZD0iY2FuY2VsRWRpdCI+5Y+W5raIPC9idXR0b24+PC9kaXY+YDsKICAgICAgJCgiI2FwcGx5RWRpdCIpLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7CiAgICAgICAgYXdhaXQgYXBpKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS9lZGl0L2FwcGx5YCwgeyBtZXRob2Q6ICJQT1NUIiwgYm9keTogeyBwYWdlX25vOiBjdXIucGFnZV9ubywgYmxvY2tzOiByLmFmdGVyLCBzdW1tYXJ5OiByLmNoYW5nZV9zdW1tYXJ5IH0gfSk7CiAgICAgICAgY3VyLmJsb2NrcyA9IHIuYWZ0ZXI7ICQoIiNkaWZmQm94IikuaW5uZXJIVE1MID0gIiI7ICQoIiNhaUluc3RydWN0aW9uIikudmFsdWUgPSAiIjsgc2hvd0VkaXRvcigpOyB0b2FzdCgi5bey55Sf5pWIIik7CiAgICAgIH07CiAgICAgICQoIiNjYW5jZWxFZGl0Iikub25jbGljayA9ICgpID0+IHsgJCgiI2RpZmZCb3giKS5pbm5lckhUTUwgPSAiIjsgfTsKICAgIH0gY2F0Y2ggKGUpIHsgdG9hc3QoIuWksei0pe+8miIgKyBlLm1lc3NhZ2UpOyB9IGZpbmFsbHkgeyBsb2FkaW5nKGZhbHNlKTsgfQogIH07CiAgJCgiI2xvYWRWZXJzaW9ucyIpLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7CiAgICB0cnkgewogICAgICBjb25zdCByID0gYXdhaXQgYXBpKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS92ZXJzaW9uc2ApOwogICAgICAkKCIjdmVyc2lvbkJveCIpLmlubmVySFRNTCA9IHIudmVyc2lvbnMubWFwKHYgPT4gYDxkaXYgY2xhc3M9InZlcnNpb24taXRlbSI+PHNwYW4+diR7di5zZXF9IMK3ICR7ZXNjKHYuc3VtbWFyeSl9PC9zcGFuPjxidXR0b24gY2xhc3M9ImJ0biBidG4tc20gYnRuLWdob3N0IiBkYXRhLXJvbGxiYWNrPSIke3Yuc2VxfSI+5Zue5ruaPC9idXR0b24+PC9kaXY+YCkuam9pbigiIikgfHwgJzxwIHN0eWxlPSJjb2xvcjp2YXIoLS1hc2gpIj7mmoLml6DniYjmnKw8L3A+JzsKICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgiW2RhdGEtcm9sbGJhY2tdIikuZm9yRWFjaChiID0+IHsKICAgICAgICBiLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7CiAgICAgICAgICBpZiAoIWNvbmZpcm0oYOWbnua7muWIsCB2JHtiLmRhdGFzZXQucm9sbGJhY2t977yf5b2T5YmN5pyq5L+d5a2Y5L+u5pS55bCG6KKr6KaG55uWYCkpIHJldHVybjsKICAgICAgICAgIGxvYWRpbmcodHJ1ZSwgIuWbnua7muS4rS4uLiIpOwogICAgICAgICAgdHJ5IHsgYXdhaXQgYXBpKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS9yb2xsYmFja2AsIHsgbWV0aG9kOiAiUE9TVCIsIGJvZHk6IHsgc2VxOiArYi5kYXRhc2V0LnJvbGxiYWNrIH0gfSk7IGF3YWl0IG9wZW5Qcm9qZWN0KHN0YXRlLnByb2plY3RJZCk7IHN0YXRlLnN0ZXAgPSA2OyByZW5kZXJBbGwoKTsgdG9hc3QoIuW3suWbnua7miIpOyB9CiAgICAgICAgICBjYXRjaCAoZSkgeyB0b2FzdCgi5aSx6LSl77yaIiArIGUubWVzc2FnZSk7IH0gZmluYWxseSB7IGxvYWRpbmcoZmFsc2UpOyB9CiAgICAgICAgfTsKICAgICAgfSk7CiAgICB9IGNhdGNoIChlKSB7IHRvYXN0KCLlpLHotKXvvJoiICsgZS5tZXNzYWdlKTsgfQogIH07Cn0KYXN5bmMgZnVuY3Rpb24gc2F2ZU1hbnVhbEVkaXQoY3VyKSB7CiAgdHJ5IHsKICAgIGF3YWl0IGFwaShgL2FwaS9wcm9qZWN0cy8ke3N0YXRlLnByb2plY3RJZH0vc2xpZGVgLCB7IG1ldGhvZDogIlBVVCIsIGJvZHk6IHsgcGFnZV9ubzogY3VyLnBhZ2Vfbm8sIGJsb2NrczogY3VyLmJsb2Nrcywgc3VtbWFyeTogYOaJi+WKqOe8lui+keesrCR7Y3VyLnBhZ2Vfbm996aG1YCB9IH0pOwogICAgdG9hc3QoIuW3suS/neWtmCIpOwogIH0gY2F0Y2ggKGUpIHsgdG9hc3QoIuS/neWtmOWksei0pe+8miIgKyBlLm1lc3NhZ2UpOyB9Cn0KCi8qIC0tLS0tLS0tLS0tLS0tLS0gU3RlcCA3IOWujOaIkOWvvOWHuiAtLS0tLS0tLS0tLS0tLS0tICovCmZ1bmN0aW9uIHJlbmRlclN0ZXA3KHcpIHsKICBjb25zdCBwYW5lbCA9IGVsKCJkaXYiLCAicGFuZWwiKTsKICBwYW5lbC5pbm5lckhUTUwgPSBwYW5lbEhlYWQoIjxlbT7kuqTku5g8L2VtPuS5i+WJje+8jDxicj7lho3lgZrkuIDmrKHlhajouqvkvZPmo4DjgIIiLCAi5a+85Ye65YmNIEFJIOWBmuacgOe7iOajgOafpe+8muW+hemqjOivgeaVsOaNruOAgeepuumhtemdouOAgeagh+mimOi/nuivu+OAgiIpOwogIHBhbmVsLmlubmVySFRNTCArPSBgCiAgICA8ZGl2IGNsYXNzPSJjYXJkIj48ZGl2IGNsYXNzPSJidG4tcm93Ij48YnV0dG9uIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiIGlkPSJjaGVja0J0biI+5a+85Ye65YmN5qOA5p+lPC9idXR0b24+PC9kaXY+PGRpdiBpZD0iY2hlY2tCb3giIHN0eWxlPSJtYXJnaW4tdG9wOjE0cHgiPjwvZGl2PjwvZGl2PgogICAgPGRpdiBjbGFzcz0iY2FyZCI+PGgzPuWvvOWHuuaWueW8jzwvaDM+PGRpdiBjbGFzcz0iZXhwb3J0LWdyaWQiPgogICAgICA8ZGl2IGNsYXNzPSJleHBvcnQtY2FyZCIgaWQ9ImV4cFBwdHgiPjxkaXYgY2xhc3M9Imljb24iPvCfk4o8L2Rpdj48ZGl2IGNsYXNzPSJuYW1lIj5QUFRYPC9kaXY+PGRpdiBjbGFzcz0iZGVzYyI+UG93ZXJQb2ludCAvIFdQU++8jOaWh+acrOWPr+e8lui+kTwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJleHBvcnQtY2FyZCIgaWQ9ImV4cEh0bWwiPjxkaXYgY2xhc3M9Imljb24iPvCflqjvuI88L2Rpdj48ZGl2IGNsYXNzPSJuYW1lIj7miZPljbAgLyBQREY8L2Rpdj48ZGl2IGNsYXNzPSJkZXNjIj7mtY/op4jlmajmiZPljbDkuLogUERGPC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImV4cG9ydC1jYXJkIiBpZD0iZXhwU2hhcmUiPjxkaXYgY2xhc3M9Imljb24iPvCflJc8L2Rpdj48ZGl2IGNsYXNzPSJuYW1lIj7liIbkuqvpk77mjqU8L2Rpdj48ZGl2IGNsYXNzPSJkZXNjIj7lj6ror7vlnKjnur/pooTop4g8L2Rpdj48L2Rpdj4KICAgIDwvZGl2PjxkaXYgaWQ9InNoYXJlQm94IiBzdHlsZT0ibWFyZ2luLXRvcDoxNHB4Ij48L2Rpdj48L2Rpdj4KICBgOwogIHcuYXBwZW5kQ2hpbGQocGFuZWwpOwogICQoIiNjaGVja0J0biIpLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7CiAgICBsb2FkaW5nKHRydWUsICLlr7zlh7rliY3moKHpqowuLi4iKTsKICAgIHRyeSB7CiAgICAgIGNvbnN0IHIgPSBhd2FpdCBhcGkoYC9hcGkvcHJvamVjdHMvJHtzdGF0ZS5wcm9qZWN0SWR9L2V4cG9ydC9jaGVja2AsIHsgbWV0aG9kOiAiUE9TVCIgfSk7CiAgICAgIGxldCBodG1sID0gci5jYW5fZXhwb3J0ID8gYDxkaXYgY2xhc3M9Im9rLWJhbm5lciI+4pyTIOajgOafpemAmui/h++8jOWPr+S7peWvvOWHujwvZGl2PmAgOiBgPGRpdiBjbGFzcz0id2Fybi1iYW5uZXIiPuKaoCDlrZjlnKjlvoXlpITnkIbpobnvvIzlu7rorq7lpITnkIblkI7lho3lr7zlh7o8L2Rpdj5gOwogICAgICBpZiAoci5wZW5kaW5nX2RhdGEubGVuZ3RoKSB7CiAgICAgICAgaHRtbCArPSBgPGgzIHN0eWxlPSJtYXJnaW46MTJweCAwIDZweCI+5b6F6aqM6K+BL+ekuuS+i+aVsOaNru+8iCR7ci5wZW5kaW5nX2RhdGEubGVuZ3Rofe+8iTwvaDM+YCArIHIucGVuZGluZ19kYXRhLm1hcChwID0+IGA8ZGl2IGNsYXNzPSJsb2dpYy1ub3RlIj7nrKwke3AucGFnZV9ub33pobXvvJoke2VzYyhwLnRleHQpfTxzcGFuIGNsYXNzPSJ0YWcgJHtTT1VSQ0VfTEFCRUxbcC5zb3VyY2VdWzFdfSI+JHtTT1VSQ0VfTEFCRUxbcC5zb3VyY2VdWzBdfTwvc3Bhbj48L2Rpdj5gKS5qb2luKCIiKTsKICAgICAgfQogICAgICBpZiAoci5lbXB0eV9wYWdlcy5sZW5ndGgpIGh0bWwgKz0gYDxkaXYgY2xhc3M9Indhcm4tYmFubmVyIj7nqbrpobXpnaLvvJrnrKwgJHtyLmVtcHR5X3BhZ2VzLmpvaW4oIuOAgSIpfSDpobU8L2Rpdj5gOwogICAgICAkKCIjY2hlY2tCb3giKS5pbm5lckhUTUwgPSBodG1sOwogICAgfSBjYXRjaCAoZSkgeyB0b2FzdCgi5aSx6LSl77yaIiArIGUubWVzc2FnZSk7IH0gZmluYWxseSB7IGxvYWRpbmcoZmFsc2UpOyB9CiAgfTsKICAkKCIjZXhwUHB0eCIpLm9uY2xpY2sgPSAoKSA9PiB7IHdpbmRvdy5vcGVuKGAvYXBpL3Byb2plY3RzLyR7c3RhdGUucHJvamVjdElkfS9leHBvcnQvcHB0eGAsICJfYmxhbmsiKTsgdG9hc3QoIuW8gOWni+S4i+i9vSBQUFRYIik7IH07CiAgJCgiI2V4cEh0bWwiKS5vbmNsaWNrID0gKCkgPT4geyB3aW5kb3cub3BlbihgL2FwaS9wcm9qZWN0cy8ke3N0YXRlLnByb2plY3RJZH0vZXhwb3J0L2h0bWxgLCAiX2JsYW5rIik7IH07CiAgJCgiI2V4cFNoYXJlIikub25jbGljayA9IGFzeW5jICgpID0+IHsKICAgIGxvYWRpbmcodHJ1ZSwgIuWIm+W7uuWIhuS6q+mTvuaOpS4uLiIpOwogICAgdHJ5IHsKICAgICAgY29uc3QgciA9IGF3YWl0IGFwaShgL2FwaS9wcm9qZWN0cy8ke3N0YXRlLnByb2plY3RJZH0vc2hhcmVgLCB7IG1ldGhvZDogIlBPU1QiLCBib2R5OiB7fSB9KTsKICAgICAgY29uc3QgZnVsbCA9IGxvY2F0aW9uLm9yaWdpbiArIHIudXJsOwogICAgICAkKCIjc2hhcmVCb3giKS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz0ib2stYmFubmVyIj7inJMg5YiG5Lqr6ZO+5o6l77yaPGEgaHJlZj0iJHtyLnVybH0iIHRhcmdldD0iX2JsYW5rIiBzdHlsZT0iY29sb3I6dmFyKC0tc2FnZSkiPiR7ZnVsbH08L2E+PC9kaXY+YDsKICAgIH0gY2F0Y2ggKGUpIHsgdG9hc3QoIuWksei0pe+8miIgKyBlLm1lc3NhZ2UpOyB9IGZpbmFsbHkgeyBsb2FkaW5nKGZhbHNlKTsgfQogIH07Cn0KCi8qIC0tLS0tLS0tLS0tLS0tLS0g5Yid5aeL5YyWIC0tLS0tLS0tLS0tLS0tLS0gKi8KJCgiI2xpYk5ld0RlY2siKS5vbmNsaWNrID0gY3JlYXRlUHJvamVjdDsKJCgiI2xpYkJyYW5kIikub25jbGljayA9ICgpID0+IHsgaWYgKHN0YXRlLnZpZXcgPT09ICJwcm9qZWN0IikgYmFja1RvTGlicmFyeSgpOyB9OwokKCIjYmFja1RvTGliIikub25jbGljayA9IGJhY2tUb0xpYnJhcnk7CiQoIiNsaWJTZWFyY2giKS5vbmlucHV0ID0gKGUpID0+IHsgc3RhdGUuc2VhcmNoS2V5d29yZCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXJMaWJyYXJ5KCk7IH07CiQoIiNsaWJGaWx0ZXJzIikub25jbGljayA9IChlKSA9PiB7CiAgY29uc3QgcGlsbCA9IGUudGFyZ2V0LmNsb3Nlc3QoIi5maWx0ZXItcGlsbCIpOwogIGlmICghcGlsbCkgcmV0dXJuOwogIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIi5maWx0ZXItcGlsbCIpLmZvckVhY2gocCA9PiBwLmNsYXNzTGlzdC5yZW1vdmUoImlzLWFjdGl2ZSIpKTsKICBwaWxsLmNsYXNzTGlzdC5hZGQoImlzLWFjdGl2ZSIpOwogIHN0YXRlLmZpbHRlciA9IHBpbGwuZGF0YXNldC5maWx0ZXI7CiAgcmVuZGVyTGlicmFyeSgpOwp9OwokKCIjcHJvakV4cG9ydCIpLm9uY2xpY2sgPSAoKSA9PiB7IGlmIChzdGF0ZS5wcm9qZWN0SWQpIHsgc3RhdGUuc3RlcCA9IDc7IHNhdmVTdGVwTmF2KDcpOyByZW5kZXJBbGwoKTsgfSB9OwokKCIjcHJvalNoYXJlIikub25jbGljayA9ICgpID0+IHsgaWYgKHN0YXRlLnByb2plY3RJZCkgeyBzdGF0ZS5zdGVwID0gNzsgc2F2ZVN0ZXBOYXYoNyk7IHJlbmRlckFsbCgpOyB9IH07CiQoIiNsaWJJbXBvcnQiKS5vbmNsaWNrID0gKCkgPT4gdG9hc3QoIkltcG9ydCDlip/og73ljbPlsIbkuIrnur8iKTsKCihhc3luYyAoKSA9PiB7CiAgdHJ5IHsKICAgIGF3YWl0IGluaXRTZXNzaW9uKCk7CiAgICBhd2FpdCBsb2FkUHJvamVjdHMoKTsKICB9IGNhdGNoIChlKSB7CiAgICAkKCIjZGVja0dyaWQiKS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz0ibGliLWVtcHR5Ij48ZGl2IGNsYXNzPSJtYXJrIj7imqA8L2Rpdj48aDI+5Yid5aeL5YyW5aSx6LSlPC9oMj48cD4ke2VzYyhlLm1lc3NhZ2UpfTwvcD48cCBzdHlsZT0ibWFyZ2luLXRvcDo4cHg7Zm9udC1zaXplOjEycHgiPuivt+ehruiupOWQjuerr+W3suWQr+WKqOS4lOaVsOaNruW6k+W3suWIneWni+WMljwvcD48L2Rpdj5gOwogIH0KfSkoKTsK"
  }
};
var decoder = new TextDecoder("utf-8");
function decodeB64(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++)
    bytes[i] = bin.charCodeAt(i);
  return decoder.decode(bytes);
}
__name(decodeB64, "decodeB64");
var DECODED = {};
for (const [path, { b64, mime }] of Object.entries(ASSETS_B64)) {
  DECODED[path] = { content: decodeB64(b64), mime };
}
function serveStatic(path) {
  const key = path === "/" ? "/index.html" : path;
  const asset = DECODED[key];
  if (!asset)
    return null;
  return new Response(asset.content, {
    headers: {
      "content-type": asset.mime,
      "cache-control": "no-cache"
    }
  });
}
__name(serveStatic, "serveStatic");

// src/index.ts
function sessionHeaders(token) {
  return { "x-session-token": token, "set-cookie": `ppt_session=${token}; Path=/; Max-Age=${30 * 24 * 3600}; SameSite=Lax` };
}
__name(sessionHeaders, "sessionHeaders");
var src_default = {
  async fetch(request, env2, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
          "access-control-allow-headers": "content-type,x-session-token"
        }
      });
    }
    try {
      let m = matchPath("/share/:id", path);
      if (m && method === "GET")
        return await handleViewShare(env2, m.id, request);
      if (path.startsWith("/api/")) {
        const { token } = await ensureSession(env2.SESSIONS, readSessionToken(request));
        const extra = sessionHeaders(token);
        const withSession = /* @__PURE__ */ __name((resp) => {
          for (const [k, v] of Object.entries(extra))
            resp.headers.set(k, v);
          resp.headers.set("access-control-allow-origin", "*");
          return resp;
        }, "withSession");
        if (path === "/api/session" && method === "GET") {
          return withSession(new Response(JSON.stringify({ ok: true, session: token }), { headers: { "content-type": "application/json" } }));
        }
        if (path === "/api/projects" && method === "POST")
          return withSession(await handleCreateProject(env2, token, request));
        if (path === "/api/projects" && method === "GET")
          return withSession(await handleListProjects(env2, token));
        m = matchPath("/api/projects/:id", path);
        if (m && method === "GET")
          return withSession(await handleGetProject(env2, m.id));
        m = matchPath("/api/projects/:id/steps/:step", path);
        if (m && method === "POST") {
          const body = await request.json().catch(() => ({}));
          return withSession(await handleSaveStep(env2, m.id, parseInt(m.step, 10), body));
        }
        m = matchPath("/api/projects/:id/materials", path);
        if (m && method === "POST")
          return withSession(await handleMaterials(env2, m.id, request));
        m = matchPath("/api/projects/:id/context-pack", path);
        if (m && method === "POST")
          return withSession(await handleContextPack(env2, m.id));
        m = matchPath("/api/projects/:id/audience", path);
        if (m && method === "POST")
          return withSession(await handleAudience(env2, m.id, request));
        m = matchPath("/api/projects/:id/explore", path);
        if (m && method === "POST")
          return withSession(await handleExplore(env2, m.id, request));
        m = matchPath("/api/projects/:id/framework", path);
        if (m && method === "POST")
          return withSession(await handleFramework(env2, m.id, request));
        m = matchPath("/api/projects/:id/titles", path);
        if (m && method === "POST")
          return withSession(await handleTitles(env2, m.id, request));
        m = matchPath("/api/projects/:id/preview", path);
        if (m && method === "POST")
          return withSession(await handleBatchPreview(env2, m.id));
        m = matchPath("/api/projects/:id/deepen", path);
        if (m && method === "POST")
          return withSession(await handleDeepenPage(env2, m.id, request));
        m = matchPath("/api/projects/:id/style/recommend", path);
        if (m && method === "POST")
          return withSession(await handleStyleRecommend(env2, m.id));
        m = matchPath("/api/projects/:id/generate", path);
        if (m && method === "POST")
          return withSession(await handleGenerate(env2, m.id));
        m = matchPath("/api/projects/:id/edit/ai", path);
        if (m && method === "POST")
          return withSession(await handleAiEdit(env2, m.id, request));
        m = matchPath("/api/projects/:id/edit/apply", path);
        if (m && method === "POST")
          return withSession(await handleApplyEdit(env2, m.id, request));
        m = matchPath("/api/projects/:id/slide", path);
        if (m && method === "PUT")
          return withSession(await handleSaveSlide(env2, m.id, request));
        m = matchPath("/api/projects/:id/slide/lock", path);
        if (m && method === "POST")
          return withSession(await handleLockSlide(env2, m.id, request));
        m = matchPath("/api/projects/:id/versions", path);
        if (m && method === "GET")
          return withSession(await handleVersions(env2, m.id));
        m = matchPath("/api/projects/:id/rollback", path);
        if (m && method === "POST")
          return withSession(await handleRollback(env2, m.id, request));
        m = matchPath("/api/projects/:id/export/check", path);
        if (m && method === "POST")
          return withSession(await handleExportCheck(env2, m.id));
        m = matchPath("/api/projects/:id/export/pptx", path);
        if (m && method === "GET")
          return await handleExportPptx(env2, m.id);
        m = matchPath("/api/projects/:id/export/html", path);
        if (m && method === "GET")
          return await handleExportHtml(env2, m.id);
        m = matchPath("/api/projects/:id/share", path);
        if (m && method === "POST")
          return withSession(await handleCreateShare(env2, m.id, request));
        return withSession(err("\u63A5\u53E3\u4E0D\u5B58\u5728", 404));
      }
      const staticResp = serveStatic(path);
      if (staticResp)
        return staticResp;
      return err("\u8DEF\u5F84\u4E0D\u5B58\u5728", 404);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return err(`\u670D\u52A1\u5668\u9519\u8BEF\uFF1A${message}`, 500);
    }
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map

------formdata-undici-084004379291--