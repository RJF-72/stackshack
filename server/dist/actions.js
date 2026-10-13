// @bun
// ../node_modules/zod/v4/core/core.js
var _a;
function $constructor(name, initializer, params) {
  function init(inst, def) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: new Set
        },
        enumerable: false
      });
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0;i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;

  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    var _a;
    const inst = params?.Parent ? new Definition : this;
    init(inst, def);
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
var $brand = Symbol("zod_brand");

class $ZodAsyncError extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
}

class $ZodEncodeError extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
}
(_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
var globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}
// ../node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  const set = false;
  return {
    get value() {
      if (!set) {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    }
  };
}
function nullish(input) {
  return input === null || input === undefined;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const ratio = val / step;
  const roundedRatio = Math.round(ratio);
  const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
  if (Math.abs(ratio - roundedRatio) < tolerance)
    return 0;
  return ratio - roundedRatio;
}
var EVALUATING = /* @__PURE__ */ Symbol("evaluating");
function defineLazy(object, key, getter) {
  let value = undefined;
  Object.defineProperty(object, key, {
    get() {
      if (value === EVALUATING) {
        return;
      }
      if (value === undefined) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object, key, {
        value: v
      });
    },
    configurable: true
  });
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = /* @__PURE__ */ cached(() => {
  if (globalConfig.jitless) {
    return false;
  }
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === undefined)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  if (o instanceof Map)
    return new Map(o);
  if (o instanceof Set)
    return new Set(o);
  return o;
}
var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== undefined) {
    if (params?.error !== undefined)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
  });
}
var NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-340282346638528860000000000000000000000, 340282346638528860000000000000000000000],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        newShape[key] = currDef.shape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = schema._zod.def.shape;
    for (const key in shape) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== undefined) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function merge(a, b) {
  if (a._zod.def.checks?.length) {
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  }
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: b._zod.def.checks ?? []
  });
  return clone(a, def);
}
function partial(Class, schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = Class ? new Class({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class ? new Class({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = new Class({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    }
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function explicitlyAborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue === false) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a;
    (_a = iss).path ?? (_a.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config) {
  const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
  const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
  rest.path ?? (rest.path = []);
  rest.message = message;
  if (ctx?.reportInput) {
    rest.input = _input;
  }
  return rest;
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}

// ../node_modules/zod/v4/core/errors.js
var initializer = (inst, def) => {
  inst.name = "$ZodError";
  Object.defineProperty(inst, "_zod", {
    value: inst._zod,
    enumerable: false
  });
  Object.defineProperty(inst, "issues", {
    value: def,
    enumerable: false
  });
  inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
  Object.defineProperty(inst, "toString", {
    value: () => inst.message,
    enumerable: false
  });
};
var $ZodError = $constructor("$ZodError", initializer);
var $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
function flattenError(error, mapper = (issue) => issue.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error, mapper = (issue) => issue.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error, path = []) => {
    for (const issue of error.issues) {
      if (issue.code === "invalid_union" && issue.errors.length) {
        issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
      } else if (issue.code === "invalid_key") {
        processError({ issues: issue.issues }, [...path, ...issue.path]);
      } else if (issue.code === "invalid_element") {
        processError({ issues: issue.issues }, [...path, ...issue.path]);
      } else {
        const fullpath = [...path, ...issue.path];
        if (fullpath.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < fullpath.length) {
            const el = fullpath[i];
            const terminal = i === fullpath.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    }
  };
  processError(error);
  return fieldErrors;
}

// ../node_modules/zod/v4/core/parse.js
var _parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError;
  }
  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, _params?.callee);
    throw e;
  }
  return result.value;
};
var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, params?.callee);
    throw e;
  }
  return result.value;
};
var _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError;
  }
  return result.issues.length ? {
    success: false,
    error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length ? {
    success: false,
    error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
var _encode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _parse(_Err)(schema, value, ctx);
};
var _decode = (_Err) => (schema, value, _ctx) => {
  return _parse(_Err)(schema, value, _ctx);
};
var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _parseAsync(_Err)(schema, value, ctx);
};
var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _parseAsync(_Err)(schema, value, _ctx);
};
var _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
var _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};
// ../node_modules/zod/v4/core/regexes.js
var cuid = /^[cC][0-9a-z]{6,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var uuid = (version) => {
  if (!version)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
  return new RegExp(_emoji, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^[A-Za-z0-9_-]*$/;
var httpProtocol = /^https?$/;
var e164 = /^\+[1-9]\d{6,14}$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
var date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const time = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local)
    opts.push("");
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const timeRegex = `${time}(?:${opts.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var string = (params) => {
  const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
  return new RegExp(`^${regex}$`);
};
var integer = /^-?\d+$/;
var number = /^-?\d+(?:\.\d+)?$/;
var boolean = /^(?:true|false)$/i;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;

// ../node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a = inst._zod).onattach ?? (_a.onattach = []);
});
var numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    if (def.value < curr) {
      if (def.inclusive)
        bag.maximum = def.value;
      else
        bag.exclusiveMaximum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    if (def.value > curr) {
      if (def.inclusive)
        bag.minimum = def.value;
      else
        bag.exclusiveMinimum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst) => {
    var _a;
    (_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
  });
  inst._zod.check = (payload) => {
    if (typeof payload.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
    if (isMultiple)
      return;
    payload.issues.push({
      origin: typeof payload.value,
      code: "not_multiple_of",
      divisor: def.value,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  def.format = def.format || "float64";
  const isInt = def.format?.includes("int");
  const origin = isInt ? "int" : "number";
  const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.format = def.format;
    bag.minimum = minimum;
    bag.maximum = maximum;
    if (isInt)
      bag.pattern = integer;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (isInt) {
      if (!Number.isInteger(input)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: "invalid_type",
          continue: false,
          input,
          inst
        });
        return;
      }
      if (!Number.isSafeInteger(input)) {
        if (input > 0) {
          payload.issues.push({
            input,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        } else {
          payload.issues.push({
            input,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        }
        return;
      }
    }
    if (input < minimum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_big",
        maximum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== undefined;
  });
  inst._zod.onattach.push((inst) => {
    const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== undefined;
  });
  inst._zod.onattach.push((inst) => {
    const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== undefined;
  });
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.minimum = def.length;
    bag.maximum = def.length;
    bag.length = def.length;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a, _b;
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.format = def.format;
    if (def.pattern) {
      bag.patterns ?? (bag.patterns = new Set);
      bag.patterns.add(def.pattern);
    }
  });
  if (def.pattern)
    (_a = inst._zod).check ?? (_a.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b = inst._zod).check ?? (_b.check = () => {});
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
  def.pattern = pattern;
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});

// ../node_modules/zod/v4/core/doc.js
class Doc {
  constructor(args = []) {
    this.content = [];
    this.indent = 0;
    if (this)
      this.args = args;
  }
  indented(fn) {
    this.indent += 1;
    fn(this);
    this.indent -= 1;
  }
  write(arg) {
    if (typeof arg === "function") {
      arg(this, { execution: "sync" });
      arg(this, { execution: "async" });
      return;
    }
    const content = arg;
    const lines = content.split(`
`).filter((x) => x);
    const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
    const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
    for (const line of dedented) {
      this.content.push(line);
    }
  }
  compile() {
    const F = Function;
    const args = this?.args;
    const content = this?.content ?? [``];
    const lines = [...content.map((x) => `  ${x}`)];
    return new F(...args, lines.join(`
`));
  }
}

// ../node_modules/zod/v4/core/versions.js
var version = {
  major: 4,
  minor: 4,
  patch: 3
};

// ../node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const checks = [...inst._zod.def.checks ?? []];
  if (inst._zod.traits.has("$ZodCheck")) {
    checks.unshift(inst);
  }
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks, ctx) => {
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks) {
        if (ch._zod.def.when) {
          if (explicitlyAborted(payload))
            continue;
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError;
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary) => {
            return handleCanaryResult(canary, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return result.then((result) => runChecks(result, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
  defineLazy(inst, "~standard", () => ({
    validate: (value) => {
      try {
        const r = safeParse(inst, value);
        return r.success ? { value: r.data } : { issues: r.error?.issues };
      } catch (_) {
        return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
});
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_) {}
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === undefined)
      throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ?? (def.pattern = uuid(v));
  } else
    def.pattern ?? (def.pattern = uuid());
  $ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email);
  $ZodStringFormat.init(inst, def);
});
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      if (!def.normalize && def.protocol?.source === httpProtocol.source) {
        if (!/^https?:\/\//i.test(trimmed)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid URL format",
            input: payload.value,
            inst,
            continue: !def.abort
          });
          return;
        }
      }
      const url = new URL(trimmed);
      if (def.hostname) {
        def.hostname.lastIndex = 0;
        if (!def.hostname.test(url.hostname)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid hostname",
            pattern: def.hostname.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.protocol) {
        def.protocol.lastIndex = 0;
        if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid protocol",
            pattern: def.protocol.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.normalize) {
        payload.value = url.href;
      } else {
        payload.value = trimmed;
      }
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji());
  $ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  def.pattern ?? (def.pattern = nanoid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid);
  $ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date);
  $ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration);
  $ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv4);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv4`;
});
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv6`;
  inst._zod.check = (payload) => {
    try {
      new URL(`http://[${payload.value}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    const parts = payload.value.split("/");
    try {
      if (parts.length !== 2)
        throw new Error;
      const [address, prefix] = parts;
      if (!prefix)
        throw new Error;
      const prefixNum = Number(prefix);
      if (`${prefixNum}` !== prefix)
        throw new Error;
      if (prefixNum < 0 || prefixNum > 128)
        throw new Error;
      new URL(`http://[${address}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (/\s/.test(data))
    return false;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base64);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64";
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return isValidBase64(padded);
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64url);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64url";
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = inst._zod.bag.pattern ?? number;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : undefined : undefined;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...received ? { received } : {}
    });
    return payload;
  };
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
  $ZodCheckNumberFormat.init(inst, def);
  $ZodNumber.init(inst, def);
});
var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = boolean;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Boolean(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "boolean")
      return payload;
    payload.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = Array(input.length);
    const proms = [];
    for (let i = 0;i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result) => handleArrayResult(result, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
  const isPresent = key in input;
  if (result.issues.length) {
    if (isOptionalIn && isOptionalOut && !isPresent) {
      return;
    }
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (!isPresent && !isOptionalIn) {
    if (!result.issues.length) {
      final.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: undefined,
        path: [key]
      });
    }
    return;
  }
  if (result.value === undefined) {
    if (isPresent) {
      final.value[key] = undefined;
    }
  } else {
    final.value[key] = result.value;
  }
}
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  for (const k of keys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    keys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const isOptionalIn = _catchall.optin === "optional";
  const isOptionalOut = _catchall.optout === "optional";
  for (const key in input) {
    if (key === "__proto__")
      continue;
    if (keySet.has(key))
      continue;
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
    } else {
      handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
  $ZodType.init(inst, def);
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  if (!desc?.get) {
    const sh = def.shape;
    Object.defineProperty(def, "shape", {
      get: () => {
        const newSh = { ...sh };
        Object.defineProperty(def, "shape", {
          value: newSh
        });
        return newSh;
      }
    });
  }
  const _normalized = cached(() => normalizeDef(def));
  defineLazy(inst._zod, "propValues", () => {
    const shape = def.shape;
    const propValues = {};
    for (const key in shape) {
      const field = shape[key]._zod;
      if (field.values) {
        propValues[key] ?? (propValues[key] = new Set);
        for (const v of field.values)
          propValues[key].add(v);
      }
    }
    return propValues;
  });
  const isObject2 = isObject;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = {};
    const proms = [];
    const shape = value.shape;
    for (const key of value.keys) {
      const el = shape[key];
      const isOptionalIn = el._zod.optin === "optional";
      const isOptionalOut = el._zod.optout === "optional";
      const r = el._zod.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
      } else {
        handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
      }
    }
    if (!catchall) {
      return proms.length ? Promise.all(proms).then(() => payload) : payload;
    }
    return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
  };
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
  $ZodObject.init(inst, def);
  const superParse = inst._zod.parse;
  const _normalized = cached(() => normalizeDef(def));
  const generateFastpass = (shape) => {
    const doc = new Doc(["shape", "payload", "ctx"]);
    const normalized = _normalized.value;
    const parseStr = (key) => {
      const k = esc(key);
      return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
    };
    doc.write(`const input = payload.value;`);
    const ids = Object.create(null);
    let counter = 0;
    for (const key of normalized.keys) {
      ids[key] = `key_${counter++}`;
    }
    doc.write(`const newResult = {};`);
    for (const key of normalized.keys) {
      const id = ids[key];
      const k = esc(key);
      const schema = shape[key];
      const isOptionalIn = schema?._zod?.optin === "optional";
      const isOptionalOut = schema?._zod?.optout === "optional";
      doc.write(`const ${id} = ${parseStr(key)};`);
      if (isOptionalIn && isOptionalOut) {
        doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      } else if (!isOptionalIn) {
        doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
      } else {
        doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      }
    }
    doc.write(`payload.value = newResult;`);
    doc.write(`return payload;`);
    const fn = doc.compile();
    return (payload, ctx) => fn(shape, payload, ctx);
  };
  let fastpass;
  const isObject2 = isObject;
  const jit = !globalConfig.jitless;
  const allowsEval2 = allowsEval;
  const fastEnabled = jit && allowsEval2.value;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      if (!fastpass)
        fastpass = generateFastpass(def.shape);
      payload = fastpass(payload, ctx);
      if (!catchall)
        return payload;
      return handleCatchall([], input, payload, ctx, value, inst);
    }
    return superParse(payload, ctx);
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : undefined);
  defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : undefined);
  defineLazy(inst._zod, "values", () => {
    if (def.options.every((o) => o._zod.values)) {
      return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return;
  });
  defineLazy(inst._zod, "pattern", () => {
    if (def.options.every((o) => o._zod.pattern)) {
      const patterns = def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
    return;
  });
  const first = def.options.length === 1 ? def.options[0]._zod.run : null;
  inst._zod.parse = (payload, ctx) => {
    if (first) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0)
          return result;
        results.push(result);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results) => {
      return handleUnionResults(results, payload, inst, ctx);
    });
  };
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left, right]) => {
        return handleIntersectionResults(payload, left, right);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0;index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = new Map;
  let unrecIssue;
  for (const iss of left.issues) {
    if (iss.code === "unrecognized_keys") {
      unrecIssue ?? (unrecIssue = iss);
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).l = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  for (const iss of right.issues) {
    if (iss.code === "unrecognized_keys") {
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).r = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length && unrecIssue) {
    result.issues.push({ ...unrecIssue, keys: bothKeys });
  }
  if (aborted(result))
    return result;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    throw new Error(`Unmergable intersection. Error path: ` + `${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
var $ZodTuple = /* @__PURE__ */ $constructor("$ZodTuple", (inst, def) => {
  $ZodType.init(inst, def);
  const items = def.items;
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        input,
        inst,
        expected: "tuple",
        code: "invalid_type"
      });
      return payload;
    }
    payload.value = [];
    const proms = [];
    const optinStart = getTupleOptStart(items, "optin");
    const optoutStart = getTupleOptStart(items, "optout");
    if (!def.rest) {
      if (input.length < optinStart) {
        payload.issues.push({
          code: "too_small",
          minimum: optinStart,
          inclusive: true,
          input,
          inst,
          origin: "array"
        });
        return payload;
      }
      if (input.length > items.length) {
        payload.issues.push({
          code: "too_big",
          maximum: items.length,
          inclusive: true,
          input,
          inst,
          origin: "array"
        });
      }
    }
    const itemResults = new Array(items.length);
    for (let i = 0;i < items.length; i++) {
      const r = items[i]._zod.run({ value: input[i], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((rr) => {
          itemResults[i] = rr;
        }));
      } else {
        itemResults[i] = r;
      }
    }
    if (def.rest) {
      let i = items.length - 1;
      const rest = input.slice(items.length);
      for (const el of rest) {
        i++;
        const result = def.rest._zod.run({ value: el, issues: [] }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((r) => handleTupleResult(r, payload, i)));
        } else {
          handleTupleResult(result, payload, i);
        }
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => handleTupleResults(itemResults, payload, items, input, optoutStart));
    }
    return handleTupleResults(itemResults, payload, items, input, optoutStart);
  };
});
function getTupleOptStart(items, key) {
  for (let i = items.length - 1;i >= 0; i--) {
    if (items[i]._zod[key] !== "optional")
      return i + 1;
  }
  return 0;
}
function handleTupleResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
function handleTupleResults(itemResults, final, items, input, optoutStart) {
  for (let i = 0;i < items.length; i++) {
    const r = itemResults[i];
    const isPresent = i < input.length;
    if (r.issues.length) {
      if (!isPresent && i >= optoutStart) {
        final.value.length = i;
        break;
      }
      final.issues.push(...prefixIssues(i, r.issues));
    }
    final.value[i] = r.value;
  }
  for (let i = final.value.length - 1;i >= input.length; i--) {
    if (items[i]._zod.optout === "optional" && final.value[i] === undefined) {
      final.value.length = i;
    } else {
      break;
    }
  }
  return final;
}
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
  $ZodType.init(inst, def);
  if (def.values.length === 0) {
    throw new Error("Cannot create literal schema with no valid values");
  }
  const values = new Set(def.values);
  inst._zod.values = values;
  inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (values.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values: def.values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output) => {
        payload.value = output;
        payload.fallback = true;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError;
    }
    payload.value = _out;
    payload.fallback = true;
    return payload;
  };
});
function handleOptionalResult(result, input) {
  if (input === undefined && (result.issues.length || result.fallback)) {
    return { issues: [], value: undefined };
  }
  return result;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? new Set([...def.innerType._zod.values, undefined]) : undefined;
  });
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (def.innerType._zod.optin === "optional") {
      const input = payload.value;
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise)
        return result.then((r) => handleOptionalResult(r, input));
      return handleOptionalResult(result, input);
    }
    if (payload.value === undefined) {
      return payload;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
  inst._zod.parse = (payload, ctx) => {
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : undefined;
  });
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleDefaultResult(result, def));
    }
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === undefined) {
    payload.value = def.defaultValue;
  }
  return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => {
    const v = def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== undefined)) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleNonOptionalResult(result, inst));
    }
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === undefined) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => {
        payload.value = result.value;
        if (result.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
          payload.fallback = true;
        }
        return payload;
      });
    }
    payload.value = result.value;
    if (result.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: {
          issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        },
        input: payload.value
      });
      payload.issues = [];
      payload.fallback = true;
    }
    return payload;
  };
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right) => handlePipeResult(right, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left) => handlePipeResult(left, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues, fallback: left.fallback }, ctx);
}
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
  defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r) => handleRefineResult(r, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      path: [...inst._zod.def.path ?? []],
      continue: !inst._zod.def.abort
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}
// ../node_modules/zod/v4/core/registries.js
var _a2;
var $output = Symbol("ZodOutput");
var $input = Symbol("ZodInput");

class $ZodRegistry {
  constructor() {
    this._map = new WeakMap;
    this._idmap = new Map;
  }
  add(schema, ..._meta) {
    const meta = _meta[0];
    this._map.set(schema, meta);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.set(meta.id, schema);
    }
    return this;
  }
  clear() {
    this._map = new WeakMap;
    this._idmap = new Map;
    return this;
  }
  remove(schema) {
    const meta = this._map.get(schema);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.delete(meta.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : undefined;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
}
function registry() {
  return new $ZodRegistry;
}
(_a2 = globalThis).__zod_globalRegistry ?? (_a2.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;
// ../node_modules/zod/v4/core/api.js
function _string(Class, params) {
  return new Class({
    type: "string",
    ...normalizeParams(params)
  });
}
function _email(Class, params) {
  return new Class({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _guid(Class, params) {
  return new Class({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuid(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuidv4(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
function _uuidv6(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
function _uuidv7(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
function _url(Class, params) {
  return new Class({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _emoji2(Class, params) {
  return new Class({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _nanoid(Class, params) {
  return new Class({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid(Class, params) {
  return new Class({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid2(Class, params) {
  return new Class({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ulid(Class, params) {
  return new Class({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _xid(Class, params) {
  return new Class({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ksuid(Class, params) {
  return new Class({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv4(Class, params) {
  return new Class({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv6(Class, params) {
  return new Class({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv4(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv6(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64(Class, params) {
  return new Class({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64url(Class, params) {
  return new Class({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _e164(Class, params) {
  return new Class({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _jwt(Class, params) {
  return new Class({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _isoDateTime(Class, params) {
  return new Class({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDate(Class, params) {
  return new Class({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _isoTime(Class, params) {
  return new Class({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDuration(Class, params) {
  return new Class({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _number(Class, params) {
  return new Class({
    type: "number",
    checks: [],
    ...normalizeParams(params)
  });
}
function _int(Class, params) {
  return new Class({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
function _boolean(Class, params) {
  return new Class({
    type: "boolean",
    ...normalizeParams(params)
  });
}
function _unknown(Class) {
  return new Class({
    type: "unknown"
  });
}
function _never(Class, params) {
  return new Class({
    type: "never",
    ...normalizeParams(params)
  });
}
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
function _normalize(form) {
  return _overwrite((input) => input.normalize(form));
}
function _trim() {
  return _overwrite((input) => input.trim());
}
function _toLowerCase() {
  return _overwrite((input) => input.toLowerCase());
}
function _toUpperCase() {
  return _overwrite((input) => input.toUpperCase());
}
function _slugify() {
  return _overwrite((input) => slugify(input));
}
function _array(Class, element, params) {
  return new Class({
    type: "array",
    element,
    ...normalizeParams(params)
  });
}
function _refine(Class, fn, _params) {
  const schema = new Class({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
function _superRefine(fn, params) {
  const ch = _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  }, params);
  return ch;
}
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}
// ../node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {}),
    io: params?.io ?? "output",
    counter: 0,
    seen: new Map,
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? undefined
  };
}
function process(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: undefined, path: _params.path };
  ctx.seen.set(schema, result);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref)
        result.ref = parent;
      process(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta = ctx.metadataRegistry.get(schema);
  if (meta)
    Object.assign(result.schema, meta);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && "_prefault" in result.schema)
    (_a = result.schema).default ?? (_a.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const idToSchema = new Map;
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id) => id);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
    }
    if (entry[1] === root) {
      return { ref: "#" };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + defId };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema = seen.schema;
    for (const key in schema) {
      delete schema[key];
    }
    schema.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error("Cycle detected: " + `#/${seen.cycle?.join("/")}/<root>` + '\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.');
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema = seen.def ?? seen.schema;
    const _cached = { ...schema };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema.allOf = schema.allOf ?? [];
        schema.allOf.push(refSchema);
      } else {
        Object.assign(schema, refSchema);
      }
      Object.assign(schema, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema[key];
          }
        }
      }
      if (refSchema.$ref && refSeen.def) {
        for (const key in schema) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema,
      path: seen.path ?? []
    });
  };
  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0]);
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {}
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  Object.assign(result, root.def ?? root.schema);
  const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
  if (rootMetaId !== undefined && result.id === rootMetaId)
    delete result.id;
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      if (seen.def.id === seen.defId)
        delete seen.def.id;
      defs[seen.defId] = seen.def;
    }
  }
  if (ctx.external) {} else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: new Set };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    if (_schema._zod.traits.has("$ZodCodec"))
      return true;
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  process(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
  process(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
// ../node_modules/zod/v4/core/json-schema-processors.js
var formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
};
var stringProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minLength = minimum;
  if (typeof maximum === "number")
    json.maxLength = maximum;
  if (format) {
    json.format = formatMap[format] ?? format;
    if (json.format === "")
      delete json.format;
    if (format === "time") {
      delete json.format;
    }
  }
  if (contentEncoding)
    json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1)
      json.pattern = regexes[0].source;
    else if (regexes.length > 1) {
      json.allOf = [
        ...regexes.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
var numberProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
  if (typeof format === "string" && format.includes("int"))
    json.type = "integer";
  else
    json.type = "number";
  const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
  const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
  const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
  if (exMin) {
    if (legacy) {
      json.minimum = exclusiveMinimum;
      json.exclusiveMinimum = true;
    } else {
      json.exclusiveMinimum = exclusiveMinimum;
    }
  } else if (typeof minimum === "number") {
    json.minimum = minimum;
  }
  if (exMax) {
    if (legacy) {
      json.maximum = exclusiveMaximum;
      json.exclusiveMaximum = true;
    } else {
      json.exclusiveMaximum = exclusiveMaximum;
    }
  } else if (typeof maximum === "number") {
    json.maximum = maximum;
  }
  if (typeof multipleOf === "number")
    json.multipleOf = multipleOf;
};
var booleanProcessor = (_schema, _ctx, json, _params) => {
  json.type = "boolean";
};
var neverProcessor = (_schema, _ctx, json, _params) => {
  json.not = {};
};
var unknownProcessor = (_schema, _ctx, _json, _params) => {};
var enumProcessor = (schema, _ctx, json, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.every((v) => typeof v === "number"))
    json.type = "number";
  if (values.every((v) => typeof v === "string"))
    json.type = "string";
  json.enum = values;
};
var literalProcessor = (schema, ctx, json, _params) => {
  const def = schema._zod.def;
  const vals = [];
  for (const val of def.values) {
    if (val === undefined) {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      }
    } else if (typeof val === "bigint") {
      if (ctx.unrepresentable === "throw") {
        throw new Error("BigInt literals cannot be represented in JSON Schema");
      } else {
        vals.push(Number(val));
      }
    } else {
      vals.push(val);
    }
  }
  if (vals.length === 0) {} else if (vals.length === 1) {
    const val = vals[0];
    json.type = val === null ? "null" : typeof val;
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json.enum = [val];
    } else {
      json.const = val;
    }
  } else {
    if (vals.every((v) => typeof v === "number"))
      json.type = "number";
    if (vals.every((v) => typeof v === "string"))
      json.type = "string";
    if (vals.every((v) => typeof v === "boolean"))
      json.type = "boolean";
    if (vals.every((v) => v === null))
      json.type = "null";
    json.enum = vals;
  }
};
var customProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Custom types cannot be represented in JSON Schema");
  }
};
var transformProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Transforms cannot be represented in JSON Schema");
  }
};
var arrayProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minItems = minimum;
  if (typeof maximum === "number")
    json.maxItems = maximum;
  json.type = "array";
  json.items = process(def.element, ctx, {
    ...params,
    path: [...params.path, "items"]
  });
};
var objectProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  json.properties = {};
  const shape = def.shape;
  for (const key in shape) {
    json.properties[key] = process(shape[key], ctx, {
      ...params,
      path: [...params.path, "properties", key]
    });
  }
  const allKeys = new Set(Object.keys(shape));
  const requiredKeys = new Set([...allKeys].filter((key) => {
    const v = def.shape[key]._zod;
    if (ctx.io === "input") {
      return v.optin === undefined;
    } else {
      return v.optout === undefined;
    }
  }));
  if (requiredKeys.size > 0) {
    json.required = Array.from(requiredKeys);
  }
  if (def.catchall?._zod.def.type === "never") {
    json.additionalProperties = false;
  } else if (!def.catchall) {
    if (ctx.io === "output")
      json.additionalProperties = false;
  } else if (def.catchall) {
    json.additionalProperties = process(def.catchall, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
};
var unionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => process(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json.oneOf = options;
  } else {
    json.anyOf = options;
  }
};
var intersectionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const a = process(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = process(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => ("allOf" in val) && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json.allOf = allOf;
};
var tupleProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "array";
  const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
  const restPath = ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";
  const prefixItems = def.items.map((x, i) => process(x, ctx, {
    ...params,
    path: [...params.path, prefixPath, i]
  }));
  const rest = def.rest ? process(def.rest, ctx, {
    ...params,
    path: [...params.path, restPath, ...ctx.target === "openapi-3.0" ? [def.items.length] : []]
  }) : null;
  if (ctx.target === "draft-2020-12") {
    json.prefixItems = prefixItems;
    if (rest) {
      json.items = rest;
    }
  } else if (ctx.target === "openapi-3.0") {
    json.items = {
      anyOf: prefixItems
    };
    if (rest) {
      json.items.anyOf.push(rest);
    }
    json.minItems = prefixItems.length;
    if (!rest) {
      json.maxItems = prefixItems.length;
    }
  } else {
    json.items = prefixItems;
    if (rest) {
      json.additionalItems = rest;
    }
  }
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minItems = minimum;
  if (typeof maximum === "number")
    json.maxItems = maximum;
};
var nullableProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const inner = process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else {
    json.anyOf = [inner, { type: "null" }];
  }
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var defaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
var prefaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io === "input")
    json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
var catchProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(undefined);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  json.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const inIsTransform = def.in._zod.traits.has("$ZodTransform");
  const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
  process(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.readOnly = true;
};
var optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
// ../node_modules/zod/v4/classic/iso.js
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function datetime2(params) {
  return _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function date2(params) {
  return _isoDate(ZodISODate, params);
}
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function time2(params) {
  return _isoTime(ZodISOTime, params);
}
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function duration2(params) {
  return _isoDuration(ZodISODuration, params);
}

// ../node_modules/zod/v4/classic/errors.js
var initializer2 = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  Object.defineProperties(inst, {
    format: {
      value: (mapper) => formatError(inst, mapper)
    },
    flatten: {
      value: (mapper) => flattenError(inst, mapper)
    },
    addIssue: {
      value: (issue) => {
        inst.issues.push(issue);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
    },
    addIssues: {
      value: (issues) => {
        inst.issues.push(...issues);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0;
      }
    }
  });
};
var ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer2, {
  Parent: Error
});

// ../node_modules/zod/v4/classic/parse.js
var parse3 = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse2 = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode = /* @__PURE__ */ _encode(ZodRealError);
var decode = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

// ../node_modules/zod/v4/classic/schemas.js
var _installedGroups = /* @__PURE__ */ new WeakMap;
function _installLazyMethods(inst, group, methods) {
  const proto = Object.getPrototypeOf(inst);
  let installed = _installedGroups.get(proto);
  if (!installed) {
    installed = new Set;
    _installedGroups.set(proto, installed);
  }
  if (installed.has(group))
    return;
  installed.add(group);
  for (const key in methods) {
    const fn = methods[key];
    Object.defineProperty(proto, key, {
      configurable: true,
      enumerable: false,
      get() {
        const bound = fn.bind(this);
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: bound
        });
        return bound;
      },
      set(v) {
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: v
        });
      }
    });
  }
}
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  $ZodType.init(inst, def);
  Object.assign(inst["~standard"], {
    jsonSchema: {
      input: createStandardJSONSchemaMethod(inst, "input"),
      output: createStandardJSONSchemaMethod(inst, "output")
    }
  });
  inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
  inst.def = def;
  inst.type = def.type;
  Object.defineProperty(inst, "_def", { value: def });
  inst.parse = (data, params) => parse3(inst, data, params, { callee: inst.parse });
  inst.safeParse = (data, params) => safeParse2(inst, data, params);
  inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
  inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
  inst.spa = inst.safeParseAsync;
  inst.encode = (data, params) => encode(inst, data, params);
  inst.decode = (data, params) => decode(inst, data, params);
  inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
  inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
  inst.safeEncode = (data, params) => safeEncode(inst, data, params);
  inst.safeDecode = (data, params) => safeDecode(inst, data, params);
  inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
  inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
  _installLazyMethods(inst, "ZodType", {
    check(...chks) {
      const def = this.def;
      return this.clone(mergeDefs(def, {
        checks: [
          ...def.checks ?? [],
          ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
        ]
      }), { parent: true });
    },
    with(...chks) {
      return this.check(...chks);
    },
    clone(def, params) {
      return clone(this, def, params);
    },
    brand() {
      return this;
    },
    register(reg, meta) {
      reg.add(this, meta);
      return this;
    },
    refine(check, params) {
      return this.check(refine(check, params));
    },
    superRefine(refinement, params) {
      return this.check(superRefine(refinement, params));
    },
    overwrite(fn) {
      return this.check(_overwrite(fn));
    },
    optional() {
      return optional(this);
    },
    exactOptional() {
      return exactOptional(this);
    },
    nullable() {
      return nullable(this);
    },
    nullish() {
      return optional(nullable(this));
    },
    nonoptional(params) {
      return nonoptional(this, params);
    },
    array() {
      return array(this);
    },
    or(arg) {
      return union([this, arg]);
    },
    and(arg) {
      return intersection(this, arg);
    },
    transform(tx) {
      return pipe(this, transform(tx));
    },
    default(d) {
      return _default(this, d);
    },
    prefault(d) {
      return prefault(this, d);
    },
    catch(params) {
      return _catch(this, params);
    },
    pipe(target) {
      return pipe(this, target);
    },
    readonly() {
      return readonly(this);
    },
    describe(description) {
      const cl = this.clone();
      globalRegistry.add(cl, { description });
      return cl;
    },
    meta(...args) {
      if (args.length === 0)
        return globalRegistry.get(this);
      const cl = this.clone();
      globalRegistry.add(cl, args[0]);
      return cl;
    },
    isOptional() {
      return this.safeParse(undefined).success;
    },
    isNullable() {
      return this.safeParse(null).success;
    },
    apply(fn) {
      return fn(this);
    }
  });
  Object.defineProperty(inst, "description", {
    get() {
      return globalRegistry.get(inst)?.description;
    },
    configurable: true
  });
  return inst;
});
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
  const bag = inst._zod.bag;
  inst.format = bag.format ?? null;
  inst.minLength = bag.minimum ?? null;
  inst.maxLength = bag.maximum ?? null;
  _installLazyMethods(inst, "_ZodString", {
    regex(...args) {
      return this.check(_regex(...args));
    },
    includes(...args) {
      return this.check(_includes(...args));
    },
    startsWith(...args) {
      return this.check(_startsWith(...args));
    },
    endsWith(...args) {
      return this.check(_endsWith(...args));
    },
    min(...args) {
      return this.check(_minLength(...args));
    },
    max(...args) {
      return this.check(_maxLength(...args));
    },
    length(...args) {
      return this.check(_length(...args));
    },
    nonempty(...args) {
      return this.check(_minLength(1, ...args));
    },
    lowercase(params) {
      return this.check(_lowercase(params));
    },
    uppercase(params) {
      return this.check(_uppercase(params));
    },
    trim() {
      return this.check(_trim());
    },
    normalize(...args) {
      return this.check(_normalize(...args));
    },
    toLowerCase() {
      return this.check(_toLowerCase());
    },
    toUpperCase() {
      return this.check(_toUpperCase());
    },
    slugify() {
      return this.check(_slugify());
    }
  });
});
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
  inst.email = (params) => inst.check(_email(ZodEmail, params));
  inst.url = (params) => inst.check(_url(ZodURL, params));
  inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
  inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
  inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
  inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
  inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
  inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
  inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
  inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
  inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
  inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
  inst.xid = (params) => inst.check(_xid(ZodXID, params));
  inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
  inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
  inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
  inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
  inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
  inst.e164 = (params) => inst.check(_e164(ZodE164, params));
  inst.datetime = (params) => inst.check(datetime2(params));
  inst.date = (params) => inst.check(date2(params));
  inst.time = (params) => inst.check(time2(params));
  inst.duration = (params) => inst.check(duration2(params));
});
function string2(params) {
  return _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
  $ZodNumber.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
  _installLazyMethods(inst, "ZodNumber", {
    gt(value, params) {
      return this.check(_gt(value, params));
    },
    gte(value, params) {
      return this.check(_gte(value, params));
    },
    min(value, params) {
      return this.check(_gte(value, params));
    },
    lt(value, params) {
      return this.check(_lt(value, params));
    },
    lte(value, params) {
      return this.check(_lte(value, params));
    },
    max(value, params) {
      return this.check(_lte(value, params));
    },
    int(params) {
      return this.check(int(params));
    },
    safe(params) {
      return this.check(int(params));
    },
    positive(params) {
      return this.check(_gt(0, params));
    },
    nonnegative(params) {
      return this.check(_gte(0, params));
    },
    negative(params) {
      return this.check(_lt(0, params));
    },
    nonpositive(params) {
      return this.check(_lte(0, params));
    },
    multipleOf(value, params) {
      return this.check(_multipleOf(value, params));
    },
    step(value, params) {
      return this.check(_multipleOf(value, params));
    },
    finite() {
      return this;
    }
  });
  const bag = inst._zod.bag;
  inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
  inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
  inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = bag.format ?? null;
});
function number2(params) {
  return _number(ZodNumber, params);
}
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
  $ZodNumberFormat.init(inst, def);
  ZodNumber.init(inst, def);
});
function int(params) {
  return _int(ZodNumberFormat, params);
}
var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
  $ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
});
function boolean2(params) {
  return _boolean(ZodBoolean, params);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
  $ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
});
function unknown() {
  return _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
  $ZodNever.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
  return _never(ZodNever, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
  inst.element = def.element;
  _installLazyMethods(inst, "ZodArray", {
    min(n, params) {
      return this.check(_minLength(n, params));
    },
    nonempty(params) {
      return this.check(_minLength(1, params));
    },
    max(n, params) {
      return this.check(_maxLength(n, params));
    },
    length(n, params) {
      return this.check(_length(n, params));
    },
    unwrap() {
      return this.element;
    }
  });
});
function array(element, params) {
  return _array(ZodArray, element, params);
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
  $ZodObjectJIT.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
  defineLazy(inst, "shape", () => {
    return def.shape;
  });
  _installLazyMethods(inst, "ZodObject", {
    keyof() {
      return _enum(Object.keys(this._zod.def.shape));
    },
    catchall(catchall) {
      return this.clone({ ...this._zod.def, catchall });
    },
    passthrough() {
      return this.clone({ ...this._zod.def, catchall: unknown() });
    },
    loose() {
      return this.clone({ ...this._zod.def, catchall: unknown() });
    },
    strict() {
      return this.clone({ ...this._zod.def, catchall: never() });
    },
    strip() {
      return this.clone({ ...this._zod.def, catchall: undefined });
    },
    extend(incoming) {
      return extend(this, incoming);
    },
    safeExtend(incoming) {
      return safeExtend(this, incoming);
    },
    merge(other) {
      return merge(this, other);
    },
    pick(mask) {
      return pick(this, mask);
    },
    omit(mask) {
      return omit(this, mask);
    },
    partial(...args) {
      return partial(ZodOptional, this, args[0]);
    },
    required(...args) {
      return required(ZodNonOptional, this, args[0]);
    }
  });
});
function object(shape, params) {
  const def = {
    type: "object",
    shape: shape ?? {},
    ...normalizeParams(params)
  };
  return new ZodObject(def);
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...normalizeParams(params)
  });
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
var ZodTuple = /* @__PURE__ */ $constructor("ZodTuple", (inst, def) => {
  $ZodTuple.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => tupleProcessor(inst, ctx, json, params);
  inst.rest = (rest) => inst.clone({
    ...inst._zod.def,
    rest
  });
});
function tuple(items, _paramsOrRest, _params) {
  const hasRest = _paramsOrRest instanceof $ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new ZodTuple({
    type: "tuple",
    items,
    rest,
    ...normalizeParams(params)
  });
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
  inst.enum = def.entries;
  inst.options = Object.values(def.entries);
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
});
function _enum(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...normalizeParams(params)
  });
}
var ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
  $ZodLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
  inst.values = new Set(def.values);
  Object.defineProperty(inst, "value", {
    get() {
      if (def.values.length > 1) {
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      }
      return def.values[0];
    }
  });
});
function literal(value, params) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...normalizeParams(params)
  });
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output) => {
        payload.value = output;
        payload.fallback = true;
        return payload;
      });
    }
    payload.value = output;
    payload.fallback = true;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
  $ZodExactOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...normalizeParams(params)
  });
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
  });
}
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
  return _superRefine(fn, params);
}
// ../node_modules/@hatch/space-sdk/dist/server-contract.js
var ACTION_BRAND = "@hatch/space-sdk/action/v1";
var LEGACY_ACTION_BRAND = Symbol.for("@hatch/space-sdk/action");
function createDefineAction() {
  return function defineAction(spec) {
    return {
      __brand: ACTION_BRAND,
      request: spec.request,
      response: spec.response,
      ...spec.privileged !== undefined ? { privileged: spec.privileged } : {},
      handler: spec.handler
    };
  };
}
// ../node_modules/@hatch/space-sdk/dist/index.js
var defineAction = createDefineAction();

// ../node_modules/drizzle-orm/entity.js
var entityKind = Symbol.for("drizzle:entityKind");
var hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(`Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`);
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}

// ../node_modules/drizzle-orm/column.js
class Column {
  constructor(table, config) {
    this.table = table;
    this.config = config;
    this.name = config.name;
    this.keyAsName = config.keyAsName;
    this.notNull = config.notNull;
    this.default = config.default;
    this.defaultFn = config.defaultFn;
    this.onUpdateFn = config.onUpdateFn;
    this.hasDefault = config.hasDefault;
    this.primary = config.primaryKey;
    this.isUnique = config.isUnique;
    this.uniqueName = config.uniqueName;
    this.uniqueType = config.uniqueType;
    this.dataType = config.dataType;
    this.columnType = config.columnType;
    this.generated = config.generated;
    this.generatedIdentity = config.generatedIdentity;
  }
  static [entityKind] = "Column";
  name;
  keyAsName;
  primary;
  notNull;
  default;
  defaultFn;
  onUpdateFn;
  hasDefault;
  isUnique;
  uniqueName;
  uniqueType;
  dataType;
  columnType;
  enumValues = undefined;
  generated = undefined;
  generatedIdentity = undefined;
  config;
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
  shouldDisableInsert() {
    return this.config.generated !== undefined && this.config.generated.type !== "byDefault";
  }
}

// ../node_modules/drizzle-orm/column-builder.js
class ColumnBuilder {
  static [entityKind] = "ColumnBuilder";
  config;
  constructor(name, dataType, columnType) {
    this.config = {
      name,
      keyAsName: name === "",
      notNull: false,
      default: undefined,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: undefined,
      uniqueType: undefined,
      dataType,
      columnType,
      generated: undefined
    };
  }
  $type() {
    return this;
  }
  notNull() {
    this.config.notNull = true;
    return this;
  }
  default(value) {
    this.config.default = value;
    this.config.hasDefault = true;
    return this;
  }
  $defaultFn(fn) {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  $default = this.$defaultFn;
  $onUpdateFn(fn) {
    this.config.onUpdateFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  $onUpdate = this.$onUpdateFn;
  primaryKey() {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this;
  }
  setName(name) {
    if (this.config.name !== "")
      return;
    this.config.name = name;
  }
}

// ../node_modules/drizzle-orm/table.utils.js
var TableName = Symbol.for("drizzle:Name");

// ../node_modules/drizzle-orm/tracing-utils.js
function iife(fn, ...args) {
  return fn(...args);
}

// ../node_modules/drizzle-orm/pg-core/columns/enum.js
var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}

// ../node_modules/drizzle-orm/subquery.js
class Subquery {
  static [entityKind] = "Subquery";
  constructor(sql, fields, alias, isWith = false, usedTables = []) {
    this._ = {
      brand: "Subquery",
      sql,
      selectedFields: fields,
      alias,
      isWith,
      usedTables
    };
  }
}

// ../node_modules/drizzle-orm/version.js
var version2 = "0.45.2";

// ../node_modules/drizzle-orm/tracing.js
var otel;
var rawTracer;
var tracer = {
  startActiveSpan(name, fn) {
    if (!otel) {
      return fn();
    }
    if (!rawTracer) {
      rawTracer = otel.trace.getTracer("drizzle-orm", version2);
    }
    return iife((otel2, rawTracer2) => rawTracer2.startActiveSpan(name, (span) => {
      try {
        return fn(span);
      } catch (e) {
        span.setStatus({
          code: otel2.SpanStatusCode.ERROR,
          message: e instanceof Error ? e.message : "Unknown error"
        });
        throw e;
      } finally {
        span.end();
      }
    }), otel, rawTracer);
  }
};

// ../node_modules/drizzle-orm/view-common.js
var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");

// ../node_modules/drizzle-orm/table.js
var Schema = Symbol.for("drizzle:Schema");
var Columns = Symbol.for("drizzle:Columns");
var ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
var OriginalName = Symbol.for("drizzle:OriginalName");
var BaseName = Symbol.for("drizzle:BaseName");
var IsAlias = Symbol.for("drizzle:IsAlias");
var ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
var IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");

class Table {
  static [entityKind] = "Table";
  static Symbol = {
    Name: TableName,
    Schema,
    OriginalName,
    Columns,
    ExtraConfigColumns,
    BaseName,
    IsAlias,
    ExtraConfigBuilder
  };
  [TableName];
  [OriginalName];
  [Schema];
  [Columns];
  [ExtraConfigColumns];
  [BaseName];
  [IsAlias] = false;
  [IsDrizzleTable] = true;
  [ExtraConfigBuilder] = undefined;
  constructor(name, schema, baseName) {
    this[TableName] = this[OriginalName] = name;
    this[Schema] = schema;
    this[BaseName] = baseName;
  }
}

// ../node_modules/drizzle-orm/sql/sql.js
function isSQLWrapper(value) {
  return value !== null && value !== undefined && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if (query.typings?.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}

class StringChunk {
  static [entityKind] = "StringChunk";
  value;
  constructor(value) {
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
}

class SQL {
  constructor(queryChunks) {
    this.queryChunks = queryChunks;
    for (const chunk of queryChunks) {
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        this.usedTables.push(schemaName === undefined ? chunk[Table.Symbol.Name] : schemaName + "." + chunk[Table.Symbol.Name]);
      }
    }
  }
  static [entityKind] = "SQL";
  decoder = noopDecoder;
  shouldInlineParams = false;
  usedTables = [];
  append(query) {
    this.queryChunks.push(...query.queryChunks);
    return this;
  }
  toQuery(config) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      const query = this.buildQueryFromSourceParams(this.queryChunks, config);
      span?.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      });
      return query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    const config = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    });
    const {
      casing,
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config;
    return mergeQueries(chunks.map((chunk) => {
      if (is(chunk, StringChunk)) {
        return { sql: chunk.value.join(""), params: [] };
      }
      if (is(chunk, Name)) {
        return { sql: escapeName(chunk.value), params: [] };
      }
      if (chunk === undefined) {
        return { sql: "", params: [] };
      }
      if (Array.isArray(chunk)) {
        const result = [new StringChunk("(")];
        for (const [i, p] of chunk.entries()) {
          result.push(p);
          if (i < chunk.length - 1) {
            result.push(new StringChunk(", "));
          }
        }
        result.push(new StringChunk(")"));
        return this.buildQueryFromSourceParams(result, config);
      }
      if (is(chunk, SQL)) {
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      }
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        const tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === undefined || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        const columnName = casing.getColumnCasing(chunk);
        if (_config.invokeSource === "indexes") {
          return { sql: escapeName(columnName), params: [] };
        }
        const schemaName = chunk.table[Table.Symbol.Schema];
        return {
          sql: chunk.table[IsAlias] || schemaName === undefined ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
          params: []
        };
      }
      if (is(chunk, View)) {
        const schemaName = chunk[ViewBaseConfig].schema;
        const viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === undefined || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        if (is(chunk.value, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }
        const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, SQL)) {
          return this.buildQueryFromSourceParams([mappedValue], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(mappedValue, config), params: [] };
        }
        let typings = ["none"];
        if (prepareTyping) {
          typings = [prepareTyping(chunk.encoder)];
        }
        return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      if (is(chunk, Placeholder)) {
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
      }
      if (is(chunk, SQL.Aliased) && chunk.fieldAlias !== undefined) {
        return { sql: escapeName(chunk.fieldAlias), params: [] };
      }
      if (is(chunk, Subquery)) {
        if (chunk._.isWith) {
          return { sql: escapeName(chunk._.alias), params: [] };
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk._.sql,
          new StringChunk(") "),
          new Name(chunk._.alias)
        ], config);
      }
      if (isPgEnum(chunk)) {
        if (chunk.schema) {
          return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
        }
        return { sql: escapeName(chunk.enumName), params: [] };
      }
      if (isSQLWrapper(chunk)) {
        if (chunk.shouldOmitSQLParens?.()) {
          return this.buildQueryFromSourceParams([chunk.getSQL()], config);
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk.getSQL(),
          new StringChunk(")")
        ], config);
      }
      if (inlineParams) {
        return { sql: this.mapInlineParam(chunk, config), params: [] };
      }
      return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null) {
      return "null";
    }
    if (typeof chunk === "number" || typeof chunk === "boolean") {
      return chunk.toString();
    }
    if (typeof chunk === "string") {
      return escapeString(chunk);
    }
    if (typeof chunk === "object") {
      const mappedValueAsString = chunk.toString();
      if (mappedValueAsString === "[object Object]") {
        return escapeString(JSON.stringify(chunk));
      }
      return escapeString(mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    if (alias === undefined) {
      return this;
    }
    return new SQL.Aliased(this, alias);
  }
  mapWith(decoder) {
    this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
    return this;
  }
  inlineParams() {
    this.shouldInlineParams = true;
    return this;
  }
  if(condition) {
    return condition ? this : undefined;
  }
}

class Name {
  constructor(value) {
    this.value = value;
  }
  static [entityKind] = "Name";
  brand;
  getSQL() {
    return new SQL([this]);
  }
}
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
var noopDecoder = {
  mapFromDriverValue: (value) => value
};
var noopEncoder = {
  mapToDriverValue: (value) => value
};
var noopMapper = {
  ...noopDecoder,
  ...noopEncoder
};

class Param {
  constructor(value, encoder = noopEncoder) {
    this.value = value;
    this.encoder = encoder;
  }
  static [entityKind] = "Param";
  brand;
  getSQL() {
    return new SQL([this]);
  }
}
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
((sql2) => {
  function empty() {
    return new SQL([]);
  }
  sql2.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  sql2.fromList = fromList;
  function raw(str) {
    return new SQL([new StringChunk(str)]);
  }
  sql2.raw = raw;
  function join(chunks, separator) {
    const result = [];
    for (const [i, chunk] of chunks.entries()) {
      if (i > 0 && separator !== undefined) {
        result.push(separator);
      }
      result.push(chunk);
    }
    return new SQL(result);
  }
  sql2.join = join;
  function identifier(value) {
    return new Name(value);
  }
  sql2.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  sql2.placeholder = placeholder2;
  function param2(value, encoder) {
    return new Param(value, encoder);
  }
  sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {

  class Aliased {
    constructor(sql2, fieldAlias) {
      this.sql = sql2;
      this.fieldAlias = fieldAlias;
    }
    static [entityKind] = "SQL.Aliased";
    isSelectionField = false;
    getSQL() {
      return this.sql;
    }
    clone() {
      return new Aliased(this.sql, this.fieldAlias);
    }
  }
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));

class Placeholder {
  constructor(name2) {
    this.name = name2;
  }
  static [entityKind] = "Placeholder";
  getSQL() {
    return new SQL([this]);
  }
}
var IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");

class View {
  static [entityKind] = "View";
  [ViewBaseConfig];
  [IsDrizzleView] = true;
  constructor({ name: name2, schema, selectedFields, query }) {
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: false
    };
  }
  getSQL() {
    return new SQL([this]);
  }
}
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};

// ../node_modules/drizzle-orm/utils.js
function getColumnNameAndConfig(a, b) {
  return {
    name: typeof a === "string" && a.length > 0 ? a : "",
    config: typeof a === "object" ? a : b
  };
}
var textDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder;

// ../node_modules/drizzle-orm/sql/expressions/conditions.js
function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
var eq = (left, right) => {
  return sql`${left} = ${bindIfParam(right, left)}`;
};
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter((c) => c !== undefined);
  if (conditions.length === 0) {
    return;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}

// ../node_modules/drizzle-orm/sql/expressions/select.js
function asc(column) {
  return sql`${column} asc`;
}
function desc(column) {
  return sql`${column} desc`;
}

// ../node_modules/drizzle-orm/sqlite-core/foreign-keys.js
class ForeignKeyBuilder {
  static [entityKind] = "SQLiteForeignKeyBuilder";
  reference;
  _onUpdate;
  _onDelete;
  constructor(config, actions) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action;
    return this;
  }
  build(table) {
    return new ForeignKey(table, this);
  }
}

class ForeignKey {
  constructor(table, builder) {
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  static [entityKind] = "SQLiteForeignKey";
  reference;
  onUpdate;
  onDelete;
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
}

// ../node_modules/drizzle-orm/sqlite-core/unique-constraint.js
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}

// ../node_modules/drizzle-orm/sqlite-core/columns/common.js
class SQLiteColumnBuilder extends ColumnBuilder {
  static [entityKind] = "SQLiteColumnBuilder";
  foreignKeyConfigs = [];
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    return this;
  }
  generatedAlwaysAs(as, config) {
    this.config.generated = {
      as,
      type: "always",
      mode: config?.mode ?? "virtual"
    };
    return this;
  }
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return ((ref2, actions2) => {
        const builder = new ForeignKeyBuilder(() => {
          const foreignColumn = ref2();
          return { columns: [column], foreignColumns: [foreignColumn] };
        });
        if (actions2.onUpdate) {
          builder.onUpdate(actions2.onUpdate);
        }
        if (actions2.onDelete) {
          builder.onDelete(actions2.onDelete);
        }
        return builder.build(table);
      })(ref, actions);
    });
  }
}

class SQLiteColumn extends Column {
  constructor(table, config) {
    if (!config.uniqueName) {
      config.uniqueName = uniqueKeyName(table, [config.name]);
    }
    super(table, config);
    this.table = table;
  }
  static [entityKind] = "SQLiteColumn";
}

// ../node_modules/drizzle-orm/sqlite-core/columns/blob.js
class SQLiteBigIntBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteBigIntBuilder";
  constructor(name) {
    super(name, "bigint", "SQLiteBigInt");
  }
  build(table) {
    return new SQLiteBigInt(table, this.config);
  }
}

class SQLiteBigInt extends SQLiteColumn {
  static [entityKind] = "SQLiteBigInt";
  getSQLType() {
    return "blob";
  }
  mapFromDriverValue(value) {
    if (typeof Buffer !== "undefined" && Buffer.from) {
      const buf = Buffer.isBuffer(value) ? value : value instanceof ArrayBuffer ? Buffer.from(value) : value.buffer ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(value);
      return BigInt(buf.toString("utf8"));
    }
    return BigInt(textDecoder.decode(value));
  }
  mapToDriverValue(value) {
    return Buffer.from(value.toString());
  }
}

class SQLiteBlobJsonBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteBlobJsonBuilder";
  constructor(name) {
    super(name, "json", "SQLiteBlobJson");
  }
  build(table) {
    return new SQLiteBlobJson(table, this.config);
  }
}

class SQLiteBlobJson extends SQLiteColumn {
  static [entityKind] = "SQLiteBlobJson";
  getSQLType() {
    return "blob";
  }
  mapFromDriverValue(value) {
    if (typeof Buffer !== "undefined" && Buffer.from) {
      const buf = Buffer.isBuffer(value) ? value : value instanceof ArrayBuffer ? Buffer.from(value) : value.buffer ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(value);
      return JSON.parse(buf.toString("utf8"));
    }
    return JSON.parse(textDecoder.decode(value));
  }
  mapToDriverValue(value) {
    return Buffer.from(JSON.stringify(value));
  }
}

class SQLiteBlobBufferBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteBlobBufferBuilder";
  constructor(name) {
    super(name, "buffer", "SQLiteBlobBuffer");
  }
  build(table) {
    return new SQLiteBlobBuffer(table, this.config);
  }
}

class SQLiteBlobBuffer extends SQLiteColumn {
  static [entityKind] = "SQLiteBlobBuffer";
  mapFromDriverValue(value) {
    if (Buffer.isBuffer(value)) {
      return value;
    }
    return Buffer.from(value);
  }
  getSQLType() {
    return "blob";
  }
}
function blob(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "json") {
    return new SQLiteBlobJsonBuilder(name);
  }
  if (config?.mode === "bigint") {
    return new SQLiteBigIntBuilder(name);
  }
  return new SQLiteBlobBufferBuilder(name);
}

// ../node_modules/drizzle-orm/sqlite-core/columns/custom.js
class SQLiteCustomColumnBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteCustomColumnBuilder";
  constructor(name, fieldConfig, customTypeParams) {
    super(name, "custom", "SQLiteCustomColumn");
    this.config.fieldConfig = fieldConfig;
    this.config.customTypeParams = customTypeParams;
  }
  build(table) {
    return new SQLiteCustomColumn(table, this.config);
  }
}

class SQLiteCustomColumn extends SQLiteColumn {
  static [entityKind] = "SQLiteCustomColumn";
  sqlName;
  mapTo;
  mapFrom;
  constructor(table, config) {
    super(table, config);
    this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
    this.mapTo = config.customTypeParams.toDriver;
    this.mapFrom = config.customTypeParams.fromDriver;
  }
  getSQLType() {
    return this.sqlName;
  }
  mapFromDriverValue(value) {
    return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
  }
  mapToDriverValue(value) {
    return typeof this.mapTo === "function" ? this.mapTo(value) : value;
  }
}
function customType(customTypeParams) {
  return (a, b) => {
    const { name, config } = getColumnNameAndConfig(a, b);
    return new SQLiteCustomColumnBuilder(name, config, customTypeParams);
  };
}

// ../node_modules/drizzle-orm/sqlite-core/columns/integer.js
class SQLiteBaseIntegerBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteBaseIntegerBuilder";
  constructor(name, dataType, columnType) {
    super(name, dataType, columnType);
    this.config.autoIncrement = false;
  }
  primaryKey(config) {
    if (config?.autoIncrement) {
      this.config.autoIncrement = true;
    }
    this.config.hasDefault = true;
    return super.primaryKey();
  }
}

class SQLiteBaseInteger extends SQLiteColumn {
  static [entityKind] = "SQLiteBaseInteger";
  autoIncrement = this.config.autoIncrement;
  getSQLType() {
    return "integer";
  }
}

class SQLiteIntegerBuilder extends SQLiteBaseIntegerBuilder {
  static [entityKind] = "SQLiteIntegerBuilder";
  constructor(name) {
    super(name, "number", "SQLiteInteger");
  }
  build(table) {
    return new SQLiteInteger(table, this.config);
  }
}

class SQLiteInteger extends SQLiteBaseInteger {
  static [entityKind] = "SQLiteInteger";
}

class SQLiteTimestampBuilder extends SQLiteBaseIntegerBuilder {
  static [entityKind] = "SQLiteTimestampBuilder";
  constructor(name, mode) {
    super(name, "date", "SQLiteTimestamp");
    this.config.mode = mode;
  }
  defaultNow() {
    return this.default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`);
  }
  build(table) {
    return new SQLiteTimestamp(table, this.config);
  }
}

class SQLiteTimestamp extends SQLiteBaseInteger {
  static [entityKind] = "SQLiteTimestamp";
  mode = this.config.mode;
  mapFromDriverValue(value) {
    if (this.config.mode === "timestamp") {
      return new Date(value * 1000);
    }
    return new Date(value);
  }
  mapToDriverValue(value) {
    const unix = value.getTime();
    if (this.config.mode === "timestamp") {
      return Math.floor(unix / 1000);
    }
    return unix;
  }
}

class SQLiteBooleanBuilder extends SQLiteBaseIntegerBuilder {
  static [entityKind] = "SQLiteBooleanBuilder";
  constructor(name, mode) {
    super(name, "boolean", "SQLiteBoolean");
    this.config.mode = mode;
  }
  build(table) {
    return new SQLiteBoolean(table, this.config);
  }
}

class SQLiteBoolean extends SQLiteBaseInteger {
  static [entityKind] = "SQLiteBoolean";
  mode = this.config.mode;
  mapFromDriverValue(value) {
    return Number(value) === 1;
  }
  mapToDriverValue(value) {
    return value ? 1 : 0;
  }
}
function integer2(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "timestamp" || config?.mode === "timestamp_ms") {
    return new SQLiteTimestampBuilder(name, config.mode);
  }
  if (config?.mode === "boolean") {
    return new SQLiteBooleanBuilder(name, config.mode);
  }
  return new SQLiteIntegerBuilder(name);
}

// ../node_modules/drizzle-orm/sqlite-core/columns/numeric.js
class SQLiteNumericBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteNumericBuilder";
  constructor(name) {
    super(name, "string", "SQLiteNumeric");
  }
  build(table) {
    return new SQLiteNumeric(table, this.config);
  }
}

class SQLiteNumeric extends SQLiteColumn {
  static [entityKind] = "SQLiteNumeric";
  mapFromDriverValue(value) {
    if (typeof value === "string")
      return value;
    return String(value);
  }
  getSQLType() {
    return "numeric";
  }
}

class SQLiteNumericNumberBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteNumericNumberBuilder";
  constructor(name) {
    super(name, "number", "SQLiteNumericNumber");
  }
  build(table) {
    return new SQLiteNumericNumber(table, this.config);
  }
}

class SQLiteNumericNumber extends SQLiteColumn {
  static [entityKind] = "SQLiteNumericNumber";
  mapFromDriverValue(value) {
    if (typeof value === "number")
      return value;
    return Number(value);
  }
  mapToDriverValue = String;
  getSQLType() {
    return "numeric";
  }
}

class SQLiteNumericBigIntBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteNumericBigIntBuilder";
  constructor(name) {
    super(name, "bigint", "SQLiteNumericBigInt");
  }
  build(table) {
    return new SQLiteNumericBigInt(table, this.config);
  }
}

class SQLiteNumericBigInt extends SQLiteColumn {
  static [entityKind] = "SQLiteNumericBigInt";
  mapFromDriverValue = BigInt;
  mapToDriverValue = String;
  getSQLType() {
    return "numeric";
  }
}
function numeric(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  const mode = config?.mode;
  return mode === "number" ? new SQLiteNumericNumberBuilder(name) : mode === "bigint" ? new SQLiteNumericBigIntBuilder(name) : new SQLiteNumericBuilder(name);
}

// ../node_modules/drizzle-orm/sqlite-core/columns/real.js
class SQLiteRealBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteRealBuilder";
  constructor(name) {
    super(name, "number", "SQLiteReal");
  }
  build(table) {
    return new SQLiteReal(table, this.config);
  }
}

class SQLiteReal extends SQLiteColumn {
  static [entityKind] = "SQLiteReal";
  getSQLType() {
    return "real";
  }
}
function real(name) {
  return new SQLiteRealBuilder(name ?? "");
}

// ../node_modules/drizzle-orm/sqlite-core/columns/text.js
class SQLiteTextBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteTextBuilder";
  constructor(name, config) {
    super(name, "string", "SQLiteText");
    this.config.enumValues = config.enum;
    this.config.length = config.length;
  }
  build(table) {
    return new SQLiteText(table, this.config);
  }
}

class SQLiteText extends SQLiteColumn {
  static [entityKind] = "SQLiteText";
  enumValues = this.config.enumValues;
  length = this.config.length;
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return `text${this.config.length ? `(${this.config.length})` : ""}`;
  }
}

class SQLiteTextJsonBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteTextJsonBuilder";
  constructor(name) {
    super(name, "json", "SQLiteTextJson");
  }
  build(table) {
    return new SQLiteTextJson(table, this.config);
  }
}

class SQLiteTextJson extends SQLiteColumn {
  static [entityKind] = "SQLiteTextJson";
  getSQLType() {
    return "text";
  }
  mapFromDriverValue(value) {
    return JSON.parse(value);
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
}
function text(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "json") {
    return new SQLiteTextJsonBuilder(name);
  }
  return new SQLiteTextBuilder(name, config);
}

// ../node_modules/drizzle-orm/sqlite-core/columns/all.js
function getSQLiteColumnBuilders() {
  return {
    blob,
    customType,
    integer: integer2,
    numeric,
    real,
    text
  };
}

// ../node_modules/drizzle-orm/sqlite-core/table.js
var InlineForeignKeys = Symbol.for("drizzle:SQLiteInlineForeignKeys");

class SQLiteTable extends Table {
  static [entityKind] = "SQLiteTable";
  static Symbol = Object.assign({}, Table.Symbol, {
    InlineForeignKeys
  });
  [Table.Symbol.Columns];
  [InlineForeignKeys] = [];
  [Table.Symbol.ExtraConfigBuilder] = undefined;
}
function sqliteTableBase(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new SQLiteTable(name, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getSQLiteColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
    const colBuilder = colBuilderBase;
    colBuilder.setName(name2);
    const column = colBuilder.build(rawTable);
    rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
    return [name2, column];
  }));
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumns;
  if (extraConfig) {
    table[SQLiteTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return table;
}
var sqliteTable = (name, columns, extraConfig) => {
  return sqliteTableBase(name, columns, extraConfig);
};

// src/schema.ts
var retailerIds = ["walmart", "heb", "aldi", "united", "dollar_general", "family_dollar", "kroger", "publix", "safeway", "target", "meijer", "giant", "stop_shop", "food_lion", "costco", "sams_club", "piggly_wiggly"];
var regionIds = ["texas", "southeast", "northeast", "midwest", "west", "national"];
var deals = sqliteTable("deals", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  externalKey: text("external_key").notNull().unique(),
  retailer: text("retailer", { enum: retailerIds }).notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  priceLabel: text("price_label").notNull(),
  finalPrice: real("final_price"),
  unitLabel: text("unit_label").notNull().default("item"),
  couponSteps: text("coupon_steps").notNull(),
  validFrom: text("valid_from"),
  validThrough: text("valid_through"),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  confidence: text("confidence", { enum: ["verified_live", "indexed"] }).notNull(),
  caveat: text("caveat"),
  refreshedAt: integer2("refreshed_at", { mode: "timestamp_ms" }).notNull()
});
var dealFeedChecks = sqliteTable("deal_feed_checks", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  retailer: text("retailer", { enum: retailerIds }).notNull(),
  checkedAt: integer2("checked_at", { mode: "timestamp_ms" }).notNull(),
  currentDeals: integer2("current_deals").notNull().default(0),
  note: text("note")
});
var scannedProducts = sqliteTable("scanned_products", {
  upc: text("upc").primaryKey(),
  name: text("name").notNull(),
  unit: text("unit").notNull().default("item"),
  basePrice: real("base_price").notNull(),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var basketItems = sqliteTable("basket_items", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  quantity: integer2("quantity").notNull().default(1),
  unit: text("unit").notNull().default("item"),
  checked: integer2("checked", { mode: "boolean" }).notNull().default(false),
  sourceDealId: integer2("source_deal_id").references(() => deals.id, { onDelete: "set null" }),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var quotes = sqliteTable("quotes", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  basketItemId: integer2("basket_item_id").notNull().references(() => basketItems.id, { onDelete: "cascade" }),
  retailer: text("retailer", { enum: retailerIds }).notNull(),
  unitPrice: real("unit_price").notNull(),
  savings: real("savings").notNull().default(0),
  sourceLabel: text("source_label").notNull().default("Shopper-entered"),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var deliveryFees = sqliteTable("delivery_fees", {
  retailer: text("retailer", { enum: retailerIds }).primaryKey(),
  amount: real("amount").notNull().default(0),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var checkoutSelections = sqliteTable("checkout_selections", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  retailer: text("retailer", { enum: retailerIds }).notNull(),
  itemCount: integer2("item_count").notNull(),
  quotedTotal: real("quoted_total"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var billingSettings = sqliteTable("billing_settings", {
  id: integer2("id").primaryKey(),
  stripePublishableKey: text("stripe_publishable_key"),
  stripeSecretKey: text("stripe_secret_key"),
  paymentLinkUrl: text("payment_link_url"),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var subscriptions = sqliteTable("subscriptions", {
  id: integer2("id").primaryKey(),
  email: text("email"),
  status: text("status", { enum: ["none", "active", "trialing", "past_due", "canceled", "incomplete"] }).notNull().default("none"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodEnd: integer2("current_period_end", { mode: "timestamp_ms" }),
  cancelAtPeriodEnd: integer2("cancel_at_period_end", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var alertSeen = sqliteTable("alert_seen", {
  dealId: integer2("deal_id").primaryKey().references(() => deals.id, { onDelete: "cascade" }),
  seenAt: integer2("seen_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var userSettings = sqliteTable("user_settings", {
  id: integer2("id").primaryKey(),
  region: text("region", { enum: regionIds }).notNull().default("texas"),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});

// src/catalog-extra.ts
var VARIANT_ESTIMATE_UPDATED_AT = "2026-10-13T00:00:00.000Z";
var groups = [
  { key: "banana", category: "Produce", basePrice: 0.58, imageSlug: "bananas", imageAlt: "Bananas product type photo", keywords: "banana plantain fruit produce", variants: [["Organic bananas", "lb", undefined, 1.3], ["Mini bananas", "1.5-lb bag", undefined, 1.29], ["Green bananas", "lb", undefined, 1], ["Ripe bananas", "lb", undefined, 1], ["Banana bunch", "each", undefined, 1.7], ["Plantains", "lb", undefined, 1.1]] },
  { key: "apple", category: "Produce", basePrice: 1.49, imageSlug: "apples", imageAlt: "Apples product type photo", keywords: "apple fruit produce", variants: [["Honeycrisp apples", "lb", undefined, 1.8], ["Rave apples", "lb", undefined, 1.3], ["Granny Smith apples", "lb", undefined, 1.1], ["Fuji apples", "lb", undefined, 1.05], ["Red Delicious apples", "lb", undefined, 1], ["Pink Lady apples", "lb", undefined, 1.3], ["Golden Delicious apples", "lb", undefined, 1.05], ["Cosmic Crisp apples", "lb", undefined, 1.6], ["Organic Gala apples", "2-lb bag", undefined, 2.3], ["Sliced apples", "12 oz bag", undefined, 1.7]] },
  { key: "strawberry", category: "Produce", basePrice: 2.99, imageSlug: "strawberries", imageAlt: "Strawberries product type photo", keywords: "strawberry berries fruit produce", variants: [["Organic strawberries", "1-lb package", undefined, 1.35], ["Sliced strawberries", "16 oz package", "Food Club", 1.15], ["Family-size strawberries", "2-lb package", undefined, 1.9], ["Snack Pack strawberry gel cups", "4 count", "Snack Pack", 1.2]] },
  { key: "chicken-breast", category: "Meat & seafood", basePrice: 3.24, imageSlug: "chicken-breast", imageAlt: "Chicken breast product type photo", keywords: "chicken poultry meat breast", variants: [["Fresh chicken breasts", "lb", undefined, 1], ["Thin-sliced chicken breasts", "lb", undefined, 1.15], ["Chicken breast tenderloins", "lb", undefined, 1.2], ["Organic chicken breasts", "lb", "O Organics", 1.85], ["Family-pack chicken breasts", "5-lb pack", undefined, 4.6], ["Frozen chicken breasts", "3-lb bag", "Great Value", 2.7], ["Diced chicken breast", "lb", undefined, 1.1], ["Chicken breast cutlets", "lb", undefined, 1.15]] },
  { key: "ground-beef", category: "Meat & seafood", basePrice: 4.98, imageSlug: "ground-beef", imageAlt: "Ground beef product type photo", keywords: "ground beef hamburger meat", variants: [["Ground beef 73/27", "lb", undefined, 0.82], ["Ground beef 85/15", "lb", undefined, 1.08], ["Ground beef 90/10", "lb", undefined, 1.2], ["Ground beef 93/7", "lb", undefined, 1.3], ["Ground chuck", "lb", "H-E-B", 1.02], ["Ground sirloin", "lb", undefined, 1.35], ["Organic ground beef", "1-lb pack", "Simple Truth", 1.5], ["Family-pack ground beef", "3-lb pack", undefined, 2.85]] },
  { key: "bacon", category: "Meat & seafood", basePrice: 5.49, imageSlug: "bacon", imageAlt: "Sliced bacon product type photo", keywords: "bacon pork breakfast meat", variants: [["Thick-cut bacon", "12 oz", "Farmland", 1.05], ["Center-cut bacon", "12 oz", "H-E-B", 1], ["Hickory-smoked bacon", "16 oz", "Sugardale", 1.3], ["Applewood-smoked bacon", "12 oz", "H-E-B", 1.1], ["Lower-sodium bacon", "12 oz", "H-E-B", 1], ["Uncured bacon", "12 oz", "Hormel Natural Choice", 1.15]] },
  { key: "salmon", category: "Meat & seafood", basePrice: 9.98, imageSlug: "salmon", imageAlt: "Salmon fillet product type photo", keywords: "salmon fish seafood fillet", variants: [["Wild-caught salmon fillet", "lb", undefined, 1.2], ["Skinless salmon portions", "12 oz", undefined, 0.85], ["Frozen salmon fillets", "2-lb bag", "365 Whole Foods Market", 1.8], ["Atlantic salmon portions", "4 count", "Wellsley Farms", 1.1], ["Sockeye salmon fillet", "lb", undefined, 1.25]] },
  { key: "deli-turkey", category: "Meat & seafood", basePrice: 8.49, imageSlug: "deli-turkey", imageAlt: "Deli turkey product type photo", keywords: "turkey deli lunch meat sandwich", variants: [["Smoked deli turkey", "lb", undefined, 1], ["Honey-roasted turkey", "lb", undefined, 1.02], ["Lower-sodium turkey", "lb", "Private Selection", 1.05], ["Thin-sliced turkey", "9 oz", undefined, 0.62], ["Deli Fresh turkey breast", "8 oz", "Oscar Mayer", 0.55]] },
  { key: "milk", category: "Dairy & eggs", basePrice: 3.48, imageSlug: "whole-milk", imageAlt: "Milk product type photo", keywords: "milk dairy gallon", variants: [["2% reduced-fat milk", "gallon", "Oak Farms", 1], ["1% low-fat milk", "gallon", "Farmland", 1], ["Fat-free milk", "gallon", undefined, 1], ["Whole milk half gallon", "half gallon", "Richlands", 0.58], ["Lactose-free whole milk", "half gallon", "Prairie Farms", 0.95], ["Lactose-free 2% milk", "half gallon", "Organic Valley", 0.95], ["Organic whole milk", "half gallon", "Organic Valley", 1.25], ["Chocolate milk", "half gallon", "Great Value", 0.62]] },
  { key: "eggs", category: "Dairy & eggs", basePrice: 3.19, imageSlug: "eggs", imageAlt: "Egg carton product type photo", keywords: "eggs dairy breakfast", variants: [["Large brown eggs", "dozen", undefined, 1.05], ["Large white eggs", "18 count", undefined, 1.4], ["Cage-free large eggs", "dozen", "Lucerne", 1.25], ["Organic large eggs", "dozen", "Organic Valley", 1.6], ["Pasture-raised eggs", "dozen", undefined, 1.7], ["Extra-large eggs", "dozen", undefined, 1.1], ["Medium eggs", "dozen", undefined, 0.92], ["Hard-boiled eggs", "6 count", "Great Value", 0.85]] },
  { key: "cheddar", category: "Dairy & eggs", basePrice: 2.79, imageSlug: "cheddar", imageAlt: "Cheddar cheese product type photo", keywords: "cheddar cheese dairy", variants: [["Mild cheddar cheese", "8 oz block", "Shullsbury Creamery", 0.95], ["Extra-sharp cheddar cheese", "8 oz block", "Food Club", 1.05], ["Shredded cheddar cheese", "8 oz bag", "Shullsbury Creamery", 0.95], ["Cheddar cheese slices", "12 count", undefined, 0.9], ["White cheddar cheese", "8 oz block", "Land O'Lakes", 1.05], ["Reduced-fat cheddar cheese", "8 oz block", "Cabot", 1]] },
  { key: "yogurt", category: "Dairy & eggs", basePrice: 4.29, imageSlug: "yogurt", imageAlt: "Yogurt product type photo", keywords: "yogurt dairy breakfast", variants: [["Vanilla Greek yogurt", "32 oz tub", "Chobani", 1.05], ["Nonfat Greek yogurt", "32 oz tub", "Chobani", 1], ["Whole-milk Greek yogurt", "32 oz tub", "Chobani", 1.05], ["Strawberry yogurt cups", "4 count", "Dannon", 0.8], ["Vanilla yogurt cups", "4 count", "Yoplait", 0.8], ["Kids yogurt tubes", "8 count", "Stonyfield", 0.85], ["Low-fat plain yogurt", "32 oz tub", "Lucerne", 0.9]] },
  { key: "bread", category: "Bread & bakery", basePrice: 2.49, imageSlug: "bread", imageAlt: "Sandwich bread product type photo", keywords: "bread loaf toast bakery", variants: [["Whole-wheat sandwich bread", "20 oz loaf", "Signature Select", 1], ["Honey-wheat bread", "20 oz loaf", "Nature's Own", 1.1], ["Multigrain bread", "20 oz loaf", "Sara Lee", 1.15], ["Texas toast bread", "24 oz loaf", "Kroger", 1.1], ["Sourdough bread", "24 oz loaf", "San Luis Sourdough", 1.35], ["Rye bread", "16 oz loaf", "Village Hearth", 1.15], ["Gluten-free sandwich bread", "18 oz loaf", "Udi's", 1.6], ["Brioche bread", "18 oz loaf", undefined, 1.4]] },
  { key: "bagel", category: "Bread & bakery", basePrice: 3.49, imageSlug: "bagels", imageAlt: "Bagels product type photo", keywords: "bagel bread breakfast bakery", variants: [["Everything bagels", "6 count", undefined, 1], ["Cinnamon-raisin bagels", "6 count", undefined, 1], ["Whole-wheat bagels", "6 count", undefined, 1], ["Blueberry bagels", "6 count", "Just Bagels", 1], ["Mini bagels", "12 count", "Pepperidge Farm", 1.05]] },
  { key: "rice", category: "Pantry staples", basePrice: 2.18, imageSlug: "rice", imageAlt: "Rice product type photo", keywords: "rice grain pantry", variants: [["Jasmine rice", "2-lb bag", "RiceSelect", 1.35], ["Basmati rice", "2-lb bag", "Royal", 1.4], ["Brown rice", "2-lb bag", "Food Club", 1.05], ["White rice", "5-lb bag", "Lowes Foods", 2.2], ["Parboiled rice", "2-lb bag", "Carolina", 1], ["Instant white rice", "14 oz box", "Food Club", 0.85], ["Microwave rice cups", "2 count", "Minute", 1.15], ["Organic brown rice", "2-lb bag", "Mahatma", 1.45]] },
  { key: "pasta", category: "Pantry staples", basePrice: 1.38, imageSlug: "pasta", imageAlt: "Dry pasta product type photo", keywords: "pasta noodles pantry", variants: [["Penne pasta", "16 oz box", "Barilla", 1], ["Elbow macaroni", "16 oz box", "Food Lion", 0.95], ["Rotini pasta", "16 oz box", "Barilla", 1], ["Fettuccine pasta", "16 oz box", "DeLallo", 1.5], ["Angel-hair pasta", "16 oz box", "Hill Country Fare", 0.95], ["Whole-wheat spaghetti", "16 oz box", "Green Way", 1.1], ["Gluten-free pasta", "12 oz box", "Barilla", 1.7], ["Lasagna noodles", "16 oz box", "Barilla", 1.05]] },
  { key: "peanut-butter", category: "Pantry staples", basePrice: 2.48, imageSlug: "peanut-butter", imageAlt: "Peanut butter product type photo", keywords: "peanut butter spread pantry", variants: [["Crunchy peanut butter", "16 oz jar", "Jif", 1.2], ["Natural creamy peanut butter", "16 oz jar", "Smucker's", 1.5], ["Natural crunchy peanut butter", "16 oz jar", "Adams", 1.45], ["Reduced-fat peanut butter", "16 oz jar", "Jif", 1.2], ["No-sugar-added peanut butter", "16 oz jar", "Peanut Butter & Co", 1.6], ["Peanut butter squeeze pack", "13 oz", "Jif", 1.35]] },
  { key: "tomatoes", category: "Canned goods", basePrice: 1.18, imageSlug: "canned-tomatoes", imageAlt: "Canned tomato product type photo", keywords: "tomato canned pantry vegetables", variants: [["Crushed tomatoes", "28 oz can", "Hunt's", 1.6], ["Whole peeled tomatoes", "28 oz can", "Muir Glen", 1.9], ["Tomato sauce", "15 oz can", "Kroger", 0.95], ["Tomato paste", "6 oz can", "Food Club", 0.8], ["Fire-roasted diced tomatoes", "14.5 oz can", "Muir Glen", 1.55], ["No-salt-added diced tomatoes", "14.5 oz can", "Hunt's", 1.2]] },
  { key: "tuna", category: "Canned goods", basePrice: 1.19, imageSlug: "canned-tuna", imageAlt: "Canned tuna product type photo", keywords: "tuna fish canned seafood pantry", variants: [["Albacore tuna in water", "5 oz can", "Great Value", 1.1], ["Chunk light tuna in oil", "5 oz can", "Chicken of the Sea", 1.05], ["Low-sodium tuna", "5 oz can", "Chicken of the Sea", 1.15], ["Tuna pouches", "4 count", "StarKist", 3.4], ["Family-size chunk light tuna", "12 oz can", "Chicken of the Sea", 2.2]] },
  { key: "coffee", category: "Coffee & tea", basePrice: 9.98, imageSlug: "ground-coffee", imageAlt: "Ground coffee product type photo", keywords: "coffee ground caffeine breakfast", variants: [["Great Value Classic Roast ground coffee", "30.5 oz canister", "Great Value", 0.85], ["Peet's French Roast ground coffee", "32 oz bag", "Peet's", 1.9], ["Food Lion breakfast blend whole-bean coffee", "24 oz bag", "Food Lion", 1.1], ["Sunny Select French Roast ground coffee", "24.2 oz canister", "Sunny Select", 0.95], ["Decaf ground coffee", "22 oz canister", "Folgers", 0.9], ["Whole-bean medium roast coffee", "12 oz bag", "Starbucks", 1.5], ["Whole-bean dark roast coffee", "12 oz bag", "Farmers Market", 1.1], ["Instant coffee", "8 oz jar", "Folgers", 0.8]] },
  { key: "coffee-pods", category: "Coffee & tea", basePrice: 10.98, imageSlug: "coffee-pods", imageAlt: "Coffee pods product type photo", keywords: "coffee pods k cups caffeine", variants: [["Dark roast coffee pods", "24 count", "Green Mountain", 1.15], ["Light roast coffee pods", "24 count", "Green Mountain", 1.15], ["Decaf coffee pods", "24 count", "Green Mountain", 1.15], ["Breakfast blend coffee pods", "24 count", "Community Coffee", 0.95], ["Maud's Fall coffee pods", "24 count", "Maud's", 1.45], ["Variety-pack coffee pods", "40 count", "Keurig", 1.8]] },
  { key: "tea", category: "Coffee & tea", basePrice: 4.48, imageSlug: "black-tea", imageAlt: "Tea bags product type photo", keywords: "tea bags drinks beverage", variants: [["Green tea bags", "40 count", "H-E-B", 0.8], ["Decaf black tea bags", "48 count", "Kroger", 0.85], ["Iced tea bags", "24 count", "Lipton", 0.9], ["Earl Grey tea bags", "20 count", "Bigelow", 0.85], ["English breakfast tea bags", "20 count", "Twinings", 0.85], ["Herbal tea variety pack", "20 count", "Twinings", 0.85]] },
  { key: "pizza", category: "Frozen foods", basePrice: 5.48, imageSlug: "frozen-pizza", imageAlt: "Frozen pizza product type photo", keywords: "pizza frozen dinner", variants: [["Frozen pepperoni pizza", "each", "Market Pantry", 0.95], ["Frozen supreme pizza", "each", "SE Grocers", 1.05], ["Frozen meat-lovers pizza", "each", "DiGiorno", 1.25], ["Frozen vegetable pizza", "each", undefined, 0.95], ["Frozen thin-crust pizza", "each", "Food Lion", 0.9], ["H-E-B Rising Crust supreme pizza", "each", "H-E-B", 1.15], ["Frozen gluten-free pizza", "each", "Open Nature", 1.35], ["Frozen personal pizzas", "4 count", undefined, 0.9]] },
  { key: "frozen-vegetables", category: "Frozen foods", basePrice: 1.49, imageSlug: "frozen-vegetables", imageAlt: "Frozen vegetables product type photo", keywords: "frozen vegetables peas carrots broccoli", variants: [["Frozen broccoli florets", "12 oz bag", "Full Circle Market", 1.2], ["Frozen sweet corn", "12 oz bag", "Our Family", 0.95], ["Frozen green beans", "12 oz bag", "Flav-R-Pac", 1], ["Frozen peas", "12 oz bag", "PictSweet Farms", 1.05], ["Frozen stir-fry vegetables", "20 oz bag", "Great Value", 1.5], ["Frozen California blend vegetables", "12 oz bag", undefined, 0.95]] },
  { key: "ice-cream", category: "Frozen foods", basePrice: 3.98, imageSlug: "ice-cream", imageAlt: "Ice cream product type photo", keywords: "ice cream frozen dessert", variants: [["Chocolate ice cream", "48 oz tub", "Breyers", 1.15], ["Strawberry ice cream", "48 oz tub", "Our Family", 0.95], ["Cookies-and-cream ice cream", "48 oz tub", "Private Selection", 1.1], ["Butter-pecan ice cream", "48 oz tub", "Breyers", 1.15], ["Chocolate-chip ice cream", "48 oz tub", "Tillamook", 1.35], ["Klondike ice cream bars", "6 count", "Klondike", 1.15], ["Vanilla ice cream sandwiches", "12 count", "Sundae Shoppe", 0.9]] },
  { key: "orange-juice", category: "Beverages", basePrice: 3.78, imageSlug: "orange-juice", imageAlt: "Orange juice product type photo", keywords: "orange juice beverage breakfast", variants: [["Simply Orange juice", "52 fl oz", "Simply", 1.05], ["Pulp-free orange juice", "89 fl oz", "Florida's Natural", 1.5], ["Calcium-fortified orange juice", "52 fl oz", "Simply", 1.05], ["Orange juice concentrate", "12 fl oz", "Food Club", 0.55], ["Orange juice boxes", "8 count", "Juicy Juice", 0.95]] },
  { key: "sparkling-water", category: "Beverages", basePrice: 4.98, imageSlug: "sparkling-water", imageAlt: "Sparkling water product type photo", keywords: "sparkling water seltzer cans beverage", variants: [["Lime sparkling water", "12-pack", "LaCroix", 1], ["Lemon sparkling water", "12-pack", "LaCroix", 1], ["Berry sparkling water", "12-pack", "Sparkling Ice", 1.05], ["Grapefruit sparkling water", "12-pack", "Spindrift", 1.25], ["Sparkling water variety pack", "24-pack", "LaCroix", 1.95], ["Plain sparkling water", "8-pack", "Ice Mountain", 0.8]] },
  { key: "chips", category: "Snacks", basePrice: 2.98, imageSlug: "potato-chips", imageAlt: "Potato chips product type photo", keywords: "potato chips snack salty", variants: [["Barbecue potato chips", "8 oz bag", "Harris Teeter", 0.95], ["Sour-cream potato chips", "8 oz bag", "Ruffles", 1.1], ["Salt-and-vinegar chips", "8 oz bag", "Great Value", 0.9], ["Kettle-cooked potato chips", "8 oz bag", "Harris Teeter", 0.95], ["Herr's Baked potato crisps", "8 oz bag", "Herr's", 1], ["Variety-pack potato chips", "18 count", "Kroger", 2.2]] },
  { key: "granola", category: "Snacks", basePrice: 3.48, imageSlug: "granola-bars", imageAlt: "Granola bars product type photo", keywords: "granola snack bars breakfast", variants: [["Chocolate-chip granola bars", "10 count", undefined, 1], ["Peanut-butter granola bars", "10 count", undefined, 1], ["Oats-and-honey granola bars", "12 count", "Nature Valley", 1.05], ["Protein granola bars", "6 count", undefined, 1.25], ["Kids granola bars", "12 count", undefined, 1]] },
  { key: "diapers", category: "Baby", basePrice: 16.49, imageSlug: "diapers", imageAlt: "Diapers product type photo", keywords: "baby diapers infant toddler", variants: [["Diapers, newborn", "small pack", "Pampers", 1.05], ["Diapers, size 1", "small pack", "Parent's Choice", 0.8], ["Diapers, size 2", "112 count box", "Pampers", 1.6], ["Diapers, size 4", "small pack", "Pampers", 1], ["Diapers, size 5", "78 count box", "Pampers", 1.35], ["Diapers, size 6", "small pack", "Pampers", 1], ["Overnight diapers, size 4", "small pack", "Huggies", 0.95]] },
  { key: "formula", category: "Baby", basePrice: 24.98, imageSlug: "baby-formula", imageAlt: "Infant formula product type photo", keywords: "baby infant formula powder milk", variants: [["Gentle infant formula powder", "22 oz can", "Gerber", 0.95], ["Sensitive infant formula powder", "22 oz can", "Similac", 1], ["Soy infant formula powder", "22 oz can", "Enfamil", 1.05], ["Enfamil infant formula", "4-pack cans", "Enfamil", 3.4], ["Ready-to-feed infant formula", "32 fl oz", "Similac", 0.6]] },
  { key: "paper-towels", category: "Household", basePrice: 8.98, imageSlug: "paper-towels", imageAlt: "Paper towels product type photo", keywords: "paper towels household kitchen", variants: [["Paper towels, 2 rolls", "2-roll pack", undefined, 0.35], ["Paper towels, 4 rolls", "4-roll pack", "Bounty", 0.7], ["Paper towels, 8 rolls", "8-roll pack", "Bounty", 1.35], ["Select-a-size paper towels", "6-roll pack", "Bounty", 1], ["Recycled paper towels", "6-roll pack", "Seventh Generation", 1.05]] },
  { key: "toilet-paper", category: "Household", basePrice: 9.98, imageSlug: "toilet-paper", imageAlt: "Toilet paper product type photo", keywords: "toilet paper bath tissue household", variants: [["Toilet paper, 6 rolls", "6-roll pack", "Scott", 0.55], ["Toilet paper, 18 rolls", "18-roll pack", "Scott", 1.3], ["Ultra-soft toilet paper", "12-roll pack", "Charmin", 1.15], ["Strong toilet paper", "12-roll pack", "Charmin", 1.15], ["Recycled toilet paper", "12-roll pack", "Seventh Generation", 1.1]] },
  { key: "laundry", category: "Cleaning", basePrice: 9.98, imageSlug: "laundry-detergent", imageAlt: "Laundry detergent product type photo", keywords: "laundry detergent soap washer cleaning", variants: [["Free-and-clear laundry detergent", "92 fl oz", "Purex", 0.85], ["High-efficiency laundry detergent", "92 fl oz", "Tide", 1.35], ["Concentrated laundry detergent", "64 fl oz", "Better Life", 1.1], ["Laundry detergent pods", "42 count", "Tide", 1.5], ["Powder laundry detergent", "16 oz box", "PowerHouse", 0.35], ["Persil liquid detergent", "63 oz", "Persil", 1.55]] },
  { key: "dish-soap", category: "Cleaning", basePrice: 3.48, imageSlug: "dish-soap", imageAlt: "Dish soap product type photo", keywords: "dish soap dishwashing cleaning kitchen", variants: [["Lemon dish soap", "28 fl oz", "Ajax", 0.85], ["Free-and-clear dish soap", "24 fl oz", "Dawn", 1], ["Antibacterial dish soap", "24 fl oz", "Dawn", 1], ["Concentrated dish soap", "18 fl oz", "Dawn", 0.8], ["Dish soap refill", "56 fl oz", "Dawn", 1.7]] },
  { key: "toothpaste", category: "Personal care", basePrice: 3.98, imageSlug: "toothpaste", imageAlt: "Toothpaste product type photo", keywords: "toothpaste dental oral care", variants: [["Whitening toothpaste", "tube", "Colgate", 1.05], ["Sensitive toothpaste", "tube", "Colgate", 1.15], ["Kids fluoride toothpaste", "tube", "Crest", 0.9], ["Cavity-protection toothpaste", "2-pack", "Colgate", 1.6], ["Fresh-mint toothpaste", "tube", "Freshmint", 0.6]] },
  { key: "shampoo", category: "Personal care", basePrice: 5.98, imageSlug: "shampoo", imageAlt: "Shampoo product type photo", keywords: "shampoo hair care bath", variants: [["Moisturizing shampoo", "22 fl oz", "XtraCare", 0.7], ["Clarifying shampoo", "22 fl oz", "Dove", 1.1], ["Color-safe shampoo", "22 fl oz", "Garnier Fructis", 1.05], ["Dandruff shampoo", "14 fl oz", "Head & Shoulders", 1.15], ["Kids shampoo", "18 fl oz", "Suave Kids", 0.75]] },
  { key: "dog-food", category: "Pet supplies", basePrice: 18.98, imageSlug: "dog-food", imageAlt: "Dry dog food product type photo", keywords: "dog food pet kibble", variants: [["Chicken dry dog food", "15-lb bag", "Ol' Roy", 0.8], ["Beef dry dog food", "33-lb bag", "Barkin", 1.9], ["Small-breed dry dog food", "12-lb bag", "Pedigree", 1.05], ["Large-breed dry dog food", "30-lb bag", "Hill's Science Diet", 2.6], ["Puppy dry dog food", "15-lb bag", "Purina Puppy Chow", 0.95]] },
  { key: "cat-litter", category: "Pet supplies", basePrice: 11.98, imageSlug: "cat-litter", imageAlt: "Cat litter product type photo", keywords: "cat litter pet clumping", variants: [["Unscented clumping cat litter", "20-lb jug", "Purina Tidy Cats", 1.05], ["Multi-cat clumping litter", "20-lb jug", "Purina Tidy Cats", 1.05], ["Lightweight cat litter", "15-lb jug", "Cat's Pride", 0.95], ["Scented clumping litter", "20-lb jug", "Cat's Pride", 0.95], ["Natural cat litter", "15-lb bag", "Naturally Fresh", 1.25]] }
];
function slugify2(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
var extraCatalog = groups.flatMap((group) => group.variants.map(([name, unit, brand, factor]) => {
  const id = `${group.key}-${slugify2(name)}-${slugify2(unit)}`;
  return {
    id,
    category: group.category,
    brand: brand ?? group.brand ?? "Store brand",
    name,
    unit,
    imageSlug: id,
    imageAlt: `${name}, ${unit}`,
    basePrice: Math.round(group.basePrice * (factor ?? 1) * 100) / 100,
    keywords: group.keywords,
    estimateUpdatedAt: VARIANT_ESTIMATE_UPDATED_AT
  };
}));

// src/actions.ts
var retailerValues = retailerIds;
var regionValues = regionIds;
var stores = [
  { id: "walmart", name: "Walmart", short: "WM", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.walmart.com", couponUrl: null, delivery: "Walmart+ offers free same-day delivery on $35+; nonmember fees are typically $7.95\u2013$9.95. Confirm at checkout.", rule: "One manufacturer coupon per item; no traditional stacking. Pair eligible rollbacks with rebate apps. Walmart Cash cannot combine with a paper manufacturer coupon on the same item.", membership: "No membership required; Walmart+ optional.", policyStatus: "verified" },
  { id: "heb", name: "H-E-B", short: "HEB", regions: ["texas"], orderUrl: "https://www.heb.com", couponUrl: "https://www.heb.com/digital-coupon/coupon-selection/all-coupons", delivery: "Curbside is free on $35+; Favor handles home and rapid delivery. Confirm fees locally.", rule: "One manufacturer coupon plus one H-E-B yellow store coupon may stack. Digital and paper coupons do not stack on the same item.", membership: "No membership required.", policyStatus: "verified" },
  { id: "aldi", name: "ALDI", short: "ALDI", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://shop.aldi.us", couponUrl: null, delivery: "Instacart-powered pickup and delivery. Online prices may be higher than in store; fees vary.", rule: "No manufacturer coupons. Weekly prices and eligible rebate apps are the savings path.", membership: "No membership required; Instacart+ optional.", policyStatus: "verified" },
  { id: "united", name: "United Supermarkets", short: "UNITED", regions: ["texas"], orderUrl: "https://www.shopunitedsupermarkets.com/", couponUrl: "https://www.shopunitedsupermarkets.com/", delivery: "Pickup and delivery at participating locations; fees appear at checkout.", rule: "One United store coupon plus one manufacturer coupon per item; no overage.", membership: "Free forU account for digital coupons.", policyStatus: "verified" },
  { id: "dollar_general", name: "Dollar General", short: "DG", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.dollargeneral.com", couponUrl: "https://www.dollargeneral.com/deals", delivery: "Same-day options vary; DoorDash or Uber Eats fees and tips may apply.", rule: "One manufacturer coupon plus one DG store coupon per item. Saturday $5 off $25 uses post-store-discount threshold math.", membership: "Free myDG account for digital coupons.", policyStatus: "verified" },
  { id: "family_dollar", name: "Family Dollar", short: "FD", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.familydollar.com", couponUrl: "https://www.familydollar.com/smartcoupons", delivery: "DoorDash and Instacart-powered same-day options vary by area; fees and tips may apply.", rule: "One manufacturer coupon plus one Family Dollar coupon per item. Saturday $5 off $25 is applied after other discounts; Smart Coupons are in-store only.", membership: "Free account for Smart Coupons.", policyStatus: "verified" },
  { id: "kroger", name: "Kroger", short: "KROGER", regions: ["texas", "southeast", "midwest", "west"], orderUrl: "https://www.kroger.com", couponUrl: "https://www.kroger.com/d/coupons", delivery: "Pickup is free on $35+. Boost has $59/$99 annual tiers; the $99 tier includes free same-day delivery on $35+. Express is $4.95.", rule: "Current policy allows one store OR manufacturer coupon per item, not both. Maximum three identical coupon redemptions per household per day.", membership: "Free Shopper\u2019s Card; paid Boost optional.", policyStatus: "verified" },
  { id: "publix", name: "Publix", short: "PUBLIX", regions: ["southeast"], orderUrl: "https://www.publix.com/shop", couponUrl: "https://www.publix.com/savings/digital-coupons", delivery: "Instacart delivery starts around $3.99 on $35+ plus service fee; curbside fees vary. In-store pickup is free.", rule: "One manufacturer coupon plus one Publix store or accepted competitor coupon per item; not all three. Limit eight identical coupons per household daily.", membership: "No membership required; Club Publix is free.", policyStatus: "verified" },
  { id: "safeway", name: "Safeway / Albertsons", short: "SAFEWAY", regions: ["texas", "northeast", "midwest", "west"], orderUrl: "https://www.safeway.com", couponUrl: "https://www.safeway.com/foru-guest.html", delivery: "FreshPass is $12.99/month or $99/year with free delivery on $30+; standard window fees are roughly $3.95\u2013$5.95.", rule: "Official for U terms say offers cannot combine with other offers; secondary guidance conflicts on store-plus-manufacturer stacking. Confirm the exact offer.", membership: "Free for U account; paid FreshPass optional.", policyStatus: "confirm_local" },
  { id: "target", name: "Target", short: "TARGET", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.target.com", couponUrl: "https://www.target.com/circle", delivery: "Drive Up and pickup are free on $35+. Same-day is $9.99/order or included on $35+ with Circle 360.", rule: "One manufacturer coupon, one Target coupon, and one Target Circle offer may combine per item. Four identical coupons per household daily; no overage.", membership: "Target Circle is free; Circle 360 is optional.", policyStatus: "verified" },
  { id: "meijer", name: "Meijer", short: "MEIJER", regions: ["midwest"], orderUrl: "https://www.meijer.com", couponUrl: "https://www.meijer.com/content/shopping/coupons.html", delivery: "Pickup is free on $35+ and $4.95 under $35. Shipt delivery is about $9.95/order; fees vary.", rule: "One manufacturer coupon per item may combine with applicable Meijer store coupons when the coupon terms allow. No overage.", membership: "Free mPerks; Shipt optional.", policyStatus: "verified" },
  { id: "giant", name: "Giant Food", short: "GIANT", regions: ["northeast"], orderUrl: "https://giantfood.com/", couponUrl: null, delivery: "Giant Delivers is reported free Tue\u2013Thu and $3.95 Fri\u2013Mon on $30+; Giant Pickup is reported free. Confirm locally.", rule: "A store coupon and manufacturer coupon may combine. A digital coupon cannot combine with a paper manufacturer coupon on the same item. Limit five identical manufacturer coupons.", membership: "Free GIANT Card / Flexible Rewards.", policyStatus: "confirm_local" },
  { id: "stop_shop", name: "Stop & Shop", short: "STOP & SHOP", regions: ["northeast"], orderUrl: "https://www.stopandshop.com", couponUrl: "https://stopandshop.com/dashboard/coupons-deals", delivery: "GO Pass is $12.95/month or $119/year with free delivery on $100+ and free pickup; other fees vary.", rule: "One digital store coupon plus one paper manufacturer coupon may stack. Sources conflict on competitor coupons; confirm current local policy.", membership: "Free GO Rewards; paid GO Pass optional.", policyStatus: "confirm_local" },
  { id: "food_lion", name: "Food Lion", short: "FOOD LION", regions: ["southeast", "northeast"], orderUrl: "https://shop.foodlion.com", couponUrl: null, delivery: "To Go pickup is reported $1.99 on $35+; Instacart, DoorDash, and Uber Eats delivery fees vary.", rule: "Sources conflict on store-plus-manufacturer stacking. Confirm the current policy with your local store before relying on a stack.", membership: "Free MVP card.", policyStatus: "confirm_local" },
  { id: "costco", name: "Costco", short: "COSTCO", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.costco.com", couponUrl: null, delivery: "Same-day via Instacart uses marked-up prices and a $35 minimum; reported fee is about $6.99 without Instacart+.", rule: "No manufacturer coupons. Member coupon-book savings apply automatically.", membership: "Required: Gold Star $65/year or Executive $130/year.", policyStatus: "verified" },
  { id: "sams_club", name: "Sam\u2019s Club", short: "SAM\u2019S", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.samsclub.com", couponUrl: "https://help.samsclub.com/app/answers/detail/a_id/1130", delivery: "Plus includes free delivery on $50+; Express is reported $10 for Plus or $22 for Club, and three-hour delivery $5 or $17.", rule: "Instant Savings are account-loaded discounts, not coupons; no clipping or traditional coupon stacking.", membership: "Required: Club $60/year or Plus $120/year.", policyStatus: "verified" },
  { id: "piggly_wiggly", name: "Piggly Wiggly", short: "THE PIG", regions: ["southeast", "midwest"], orderUrl: "https://www.shopthepig.com/shop", couponUrl: "http://www.shopthepig.com/coupon-policy/", delivery: "Participating Midwest stores use Instacart; Shipt and other delivery options vary by independently owned location.", rule: "The published Midwest policy says no coupon stacking and no overage. Paper takes precedence when both paper and digital match. Acceptance varies by independently owned store\u2014confirm locally.", membership: "Pig Point$ and digital account availability vary by location.", policyStatus: "confirm_local" }
];
var regions = [
  { id: "texas", label: "Texas" },
  { id: "southeast", label: "Southeast" },
  { id: "northeast", label: "Northeast" },
  { id: "midwest", label: "Midwest" },
  { id: "west", label: "West" },
  { id: "national", label: "National chains" }
];
var baselineDeals = [
  { externalKey: "2026-10-wm-klondike", retailer: "walmart", title: "Klondike 6-packs", detail: "Buy 2 at $3.78 each, then submit eligible receipt offers.", priceLabel: "$2.56 for 2 \xB7 $1.28 each", finalPrice: 1.28, unitLabel: "6-pack", couponSteps: "Buy 2; submit $3 Ibotta and $2 Fetch offers.", validFrom: "2026-10-06", validThrough: "2026-10-12", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/06/klondike-ice-cream-bar-6-packs-as-low-as-1-24-at-walmart-or-kroger", confidence: "indexed", caveat: "This round has ended; Ibotta and Fetch amounts vary by account. Kept in the feed as an expired offer." },
  { externalKey: "2026-10-wm-pb2", retailer: "walmart", title: "PB2 peanut butter powder, 32 oz", detail: "Listed in Living Rich with Coupons' October 2026 Walmart deals roundup.", priceLabel: "$15.99 \xB7 was $29.99", finalPrice: 15.99, unitLabel: "32 oz", couponSteps: "Event price; no extra coupon stated. Confirm the current price at Walmart.com before ordering.", validFrom: "2026-10-05", validThrough: null, sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/best-walmart-deals-october-2026.html", confidence: "indexed", caveat: "The Walmart Deals event window was reported through Oct 11; event inventory and price can change or sell out." },
  { externalKey: "2026-10-wm-coffee", retailer: "walmart", title: "Maud's Fall coffee pods, 24 ct", detail: "Listed in Living Rich with Coupons' October 2026 Walmart deals roundup.", priceLabel: "$16.06 \xB7 was $22.94", finalPrice: 16.06, unitLabel: "24 ct", couponSteps: "Event price; no extra coupon stated. Confirm the current price at Walmart.com before ordering.", validFrom: "2026-10-05", validThrough: null, sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/best-walmart-deals-october-2026.html", confidence: "indexed", caveat: "The Walmart Deals event window was reported through Oct 11; event inventory and price can change or sell out." },
  { externalKey: "2026-10-heb-cheerios", retailer: "heb", title: "General Mills Cheerios, family size", detail: "H-E-B weekly deals listing.", priceLabel: "$4.97", finalPrice: 4.97, unitLabel: "family-size box", couponSteps: "Weekly deals price on heb.com; no coupon stated.", validFrom: "2026-10-07", validThrough: null, sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Weekly deals rotate; confirm the current listing on heb.com." },
  { externalKey: "2026-10-heb-cakemix", retailer: "heb", title: "Betty Crocker cake mix", detail: "H-E-B weekly deals listing.", priceLabel: "$1.47", finalPrice: 1.47, unitLabel: "box", couponSteps: "Weekly deals price on heb.com; no coupon stated.", validFrom: "2026-10-07", validThrough: null, sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Weekly deals rotate; confirm the current listing on heb.com." },
  { externalKey: "2026-10-heb-barilla", retailer: "heb", title: "Barilla spaghetti", detail: "H-E-B weekly deals listing.", priceLabel: "$1.88", finalPrice: 1.88, unitLabel: "box", couponSteps: "Weekly deals price on heb.com; no coupon stated.", validFrom: "2026-10-07", validThrough: null, sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Weekly deals rotate; confirm the current listing on heb.com." },
  { externalKey: "2026-10-heb-towels", retailer: "heb", title: "H-E-B paper towels coupon", detail: "Digital coupon on H-E-B brand paper towels in the weekly deals listing.", priceLabel: "$1.00 off", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the digital coupon in your H-E-B account; it applies at checkout.", validFrom: "2026-10-07", validThrough: null, sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Shelf price was not supplied, so final total is not computed." },
  { externalKey: "2026-10-heb-laundry", retailer: "heb", title: "Laundry care: $5 off $25", detail: "Basket coupon in the H-E-B weekly deals listing.", priceLabel: "$5 off $25 of laundry care", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the digital coupon and spend $25 on eligible laundry care.", validFrom: "2026-10-07", validThrough: "2026-10-20", sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Threshold is calculated under H-E-B coupon rules; confirm eligible items in the listing." },
  { externalKey: "2026-10-heb-pet", retailer: "heb", title: "Pet food & litter: $5 off $30", detail: "Basket coupon in the H-E-B weekly deals listing.", priceLabel: "$5 off $30 of pet food or litter", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the digital coupon and spend $30 on eligible pet food or litter.", validFrom: "2026-10-07", validThrough: "2026-10-20", sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Threshold is calculated under H-E-B coupon rules; confirm eligible items in the listing." },
  { externalKey: "2026-10-aldi-pasta", retailer: "aldi", title: "Priano bronze-cut pasta", detail: "New ALDI Find starting Oct 14 per Tasting Table's October roundup.", priceLabel: "$3.39", finalPrice: 3.39, unitLabel: "bag", couponSteps: "ALDI Finds price; no coupon needed. ALDI does not accept manufacturer coupons.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Tasting Table", sourceUrl: "https://www.tastingtable.com/2274778/best-new-aldi-products-october-2026/", confidence: "indexed", caveat: "ALDI Finds are while supplies last and can sell out early." },
  { externalKey: "2026-10-aldi-cheese", retailer: "aldi", title: "Emporium Selection Dutch cheese", detail: "New ALDI Find starting Oct 14 per Tasting Table's October roundup.", priceLabel: "$4.49", finalPrice: 4.49, unitLabel: "package", couponSteps: "ALDI Finds price; no coupon needed.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Tasting Table", sourceUrl: "https://www.tastingtable.com/2274778/best-new-aldi-products-october-2026/", confidence: "indexed", caveat: "ALDI Finds are while supplies last and can sell out early." },
  { externalKey: "2026-10-aldi-pizza", retailer: "aldi", title: "Mama Cozzi's dill pickle pizza", detail: "ALDI Find arriving Oct 21 per EatingWell's October finds roundup.", priceLabel: "$6.99", finalPrice: 6.99, unitLabel: "pizza", couponSteps: "ALDI Finds price; no coupon needed.", validFrom: "2026-10-21", validThrough: "2026-10-27", sourceName: "EatingWell", sourceUrl: "https://www.eatingwell.com/aldi-finds-october-2026-12166366", confidence: "indexed", caveat: "Starts Oct 21; ALDI Finds are while supplies last." },
  { externalKey: "2026-10-united-wine", retailer: "united", title: "Wine event: extra 10% off any 6 bottles", detail: "United Supermarkets / Market Street wine event, prices effective Oct 5 \u2013 Nov 1, 2026.", priceLabel: "Save 10% on 6+ bottles (750 ml+)", finalPrice: null, unitLabel: "offer", couponSteps: "Mix and match varieties; the 10% discount applies at checkout when you buy any 6 bottles of wine 750 ml or larger.", validFrom: "2026-10-05", validThrough: "2026-11-01", sourceName: "HotCouponWorld (United ad preview)", sourceUrl: "https://www.hotcouponworld.com/unitedsupermarkets-weekly-ad/", confidence: "indexed", caveat: "From the printed United/Market Street event flyer; selection varies by store and wine is not sold at every location." },
  { externalKey: "2026-10-dg-cereal", retailer: "dollar_general", title: "General Mills cereal", detail: "Part of the Saturday coupon scenario; exact variety and size must match the digital offer.", priceLabel: "$1 each in stated scenario", finalPrice: 1, unitLabel: "item", couponSteps: "Clip the Saturday $5 off $25 and matching item digital coupons in the DG app.", validFrom: "2026-10-13", validThrough: "2026-10-17", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more", confidence: "indexed", caveat: "Scenario pricing depends on the Saturday $5 off $25 threshold math; build the exact qualifying cart in the DG app." },
  { externalKey: "2026-10-dg-soda", retailer: "dollar_general", title: "Nine soda 12-packs", detail: "Saturday $5 off $25 scenario.", priceLabel: "$20 total \xB7 $2.22 each", finalPrice: 2.22, unitLabel: "12-pack", couponSteps: "Build the published scenario and clip the Saturday $5 off $25 coupon.", validFrom: "2026-10-13", validThrough: "2026-10-17", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more", confidence: "indexed", caveat: "The source did not expose the exact soda varieties and item-level coupon breakdown." },
  { externalKey: "2026-10-fd-redbaron", retailer: "family_dollar", title: "Red Baron frozen pizza", detail: "Family Dollar weekly ad, Oct 11\u201317: Classic Crust or Brick Oven, 17.89\u201323.45 oz.", priceLabel: "2 for $9 \xB7 $4.50 each", finalPrice: 4.5, unitLabel: "pizza", couponSteps: "Buy 2 eligible pizzas; the 2-for-$9 price applies at checkout.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the price at your local store." },
  { externalKey: "2026-10-fd-prego", retailer: "family_dollar", title: "Prego pasta sauce, 23.5\u201324 oz", detail: "Family Dollar weekly ad, Oct 11\u201317.", priceLabel: "2 for $5 \xB7 $2.50 each", finalPrice: 2.5, unitLabel: "jar", couponSteps: "Buy 2 eligible jars; the 2-for-$5 price applies at checkout.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the price at your local store." },
  { externalKey: "2026-10-kroger-cereal", retailer: "kroger", title: "General Mills cereal", detail: "Kroger weekly ad, Oct 14\u201320.", priceLabel: "$1.99", finalPrice: 1.99, unitLabel: "box", couponSteps: "Weekly-ad price with your Kroger Shopper's Card.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "http://weeklyadhunters.com/kroger-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; participating varieties and sizes are listed in the full ad." },
  { externalKey: "2026-10-kroger-pasta", retailer: "kroger", title: "Barilla pasta", detail: "Kroger weekly ad, Oct 14\u201320.", priceLabel: "$1.79", finalPrice: 1.79, unitLabel: "box", couponSteps: "Weekly-ad price with your Kroger Shopper's Card.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "http://weeklyadhunters.com/kroger-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm eligible cuts in the full ad." },
  { externalKey: "2026-10-kroger-coffee", retailer: "kroger", title: "Starbucks coffee", detail: "Kroger weekly ad, Oct 14\u201320.", priceLabel: "$7.99", finalPrice: 7.99, unitLabel: "bag", couponSteps: "Weekly-ad price with your Kroger Shopper's Card.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "http://weeklyadhunters.com/kroger-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm eligible sizes in the full ad." },
  { externalKey: "2026-10-kroger-bacon", retailer: "kroger", title: "Smithfield bacon", detail: "Kroger weekly ad, Oct 14\u201320.", priceLabel: "$4.99", finalPrice: 4.99, unitLabel: "package", couponSteps: "Weekly-ad price with your Kroger Shopper's Card.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "http://weeklyadhunters.com/kroger-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the package size in the full ad." },
  { externalKey: "2026-10-kroger-milk", retailer: "kroger", title: "Kroger milk, gallon", detail: "Three-day sale, Oct 17\u201319, in the Kroger weekly ad.", priceLabel: "$2.49", finalPrice: 2.49, unitLabel: "gallon", couponSteps: "Three-day sale price with your Kroger Shopper's Card, Oct 17\u201319 only.", validFrom: "2026-10-17", validThrough: "2026-10-19", sourceName: "WeeklyAdHunters", sourceUrl: "http://weeklyadhunters.com/kroger-weekly-ad/", confidence: "indexed", caveat: "Three-day sale inside the Oct 14\u201320 ad week." },
  { externalKey: "2026-10-publix-sargento", retailer: "publix", title: "Sargento cheese", detail: "Publix weekly ad BOGO, Oct 15\u201321 (Oct 14\u201320 for some areas).", priceLabel: "Buy 1, get 1 free \xB7 $5.15 shelf", finalPrice: null, unitLabel: "package", couponSteps: "Buy 2 eligible packages; the second rings up free at checkout.", validFrom: "2026-10-15", validThrough: "2026-10-21", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-ad-coupons-week-of-10-15-to-10-21-10-14-to-10-20-for-some/", confidence: "indexed", caveat: "BOGO shelf price shown; per-unit total depends on buying two. Ad dates vary by area." },
  { externalKey: "2026-10-publix-welchs", retailer: "publix", title: "Welch's juice", detail: "Publix weekly ad BOGO, Oct 15\u201321 (Oct 14\u201320 for some areas).", priceLabel: "Buy 1, get 1 free \xB7 $5.27 shelf", finalPrice: null, unitLabel: "bottle", couponSteps: "Buy 2 eligible bottles; the second rings up free at checkout.", validFrom: "2026-10-15", validThrough: "2026-10-21", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-ad-coupons-week-of-10-15-to-10-21-10-14-to-10-20-for-some/", confidence: "indexed", caveat: "BOGO shelf price shown; ad dates vary by area." },
  { externalKey: "2026-10-publix-turkey", retailer: "publix", title: "Jennie-O ground turkey", detail: "Publix weekly ad BOGO, Oct 15\u201321 (Oct 14\u201320 for some areas).", priceLabel: "Buy 1, get 1 free \xB7 $6.99 shelf", finalPrice: null, unitLabel: "package", couponSteps: "Buy 2 eligible packages; the second rings up free at checkout.", validFrom: "2026-10-15", validThrough: "2026-10-21", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-ad-coupons-week-of-10-15-to-10-21-10-14-to-10-20-for-some/", confidence: "indexed", caveat: "BOGO shelf price shown; ad dates vary by area." },
  { externalKey: "2026-10-safeway-salmon", retailer: "safeway", title: "Salmon portions", detail: "Safeway weekly roundup, week of Oct 9\u201315.", priceLabel: "$3.99", finalPrice: 3.99, unitLabel: "portion", couponSteps: "Weekly-ad price with a free Safeway for U account.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAd.io", sourceUrl: "https://www.weeklyad.io/safeway", confidence: "indexed", caveat: "Regional roundup; the listing did not state whether the price is per portion or per pound \u2014 confirm in your local ad." },
  { externalKey: "2026-10-safeway-beef", retailer: "safeway", title: "90% lean ground beef", detail: "Safeway weekly roundup, week of Oct 9\u201315.", priceLabel: "$6.99/lb", finalPrice: 6.99, unitLabel: "lb", couponSteps: "Weekly-ad price with a free Safeway for U account.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAd.io", sourceUrl: "https://www.weeklyad.io/safeway", confidence: "indexed", caveat: "Regional roundup; prices vary by Safeway/Albertsons banner and area." },
  { externalKey: "2026-10-safeway-strawberries", retailer: "safeway", title: "Strawberries, 2 lb", detail: "Safeway weekly roundup, week of Oct 9\u201315.", priceLabel: "$4.99", finalPrice: 4.99, unitLabel: "2-lb package", couponSteps: "Weekly-ad price with a free Safeway for U account.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAd.io", sourceUrl: "https://www.weeklyad.io/safeway", confidence: "indexed", caveat: "Regional roundup; prices vary by area." },
  { externalKey: "2026-10-target-chobani", retailer: "target", title: "Chobani yogurt 4-packs", detail: "Target weekly ad, Oct 11\u201317.", priceLabel: "2 for $7 \xB7 $3.50 each", finalPrice: 3.5, unitLabel: "4-pack", couponSteps: "Buy 2 eligible 4-packs; the 2-for-$7 price applies at checkout.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/target-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm eligible flavors in the full ad." },
  { externalKey: "2026-10-target-soda", retailer: "target", title: "Soda 12-packs", detail: "Target Circle Week pricing highlighted by Hip2Save.", priceLabel: "$5.33 each when you buy 3", finalPrice: 5.33, unitLabel: "12-pack", couponSteps: "Buy 3 eligible 12-packs in one trip to get the per-pack price.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "Hip2Save", sourceUrl: "https://hip2save.com/deals/target-sales-this-week/", confidence: "indexed", caveat: "Quantity threshold required; eligible brands are listed in the source roundup." },
  { externalKey: "2026-10-meijer-chicken", retailer: "meijer", title: "Family-pack chicken breast", detail: "Meijer weekly ad, Oct 14\u201320.", priceLabel: "$2.59/lb", finalPrice: 2.59, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-10-meijer-skippy", retailer: "meijer", title: "Skippy peanut butter, 16 oz", detail: "Meijer weekly ad, Oct 14\u201320.", priceLabel: "$1.99", finalPrice: 1.99, unitLabel: "16 oz jar", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-10-meijer-starkist", retailer: "meijer", title: "StarKist tuna pouches", detail: "Meijer weekly ad, Oct 14\u201320.", priceLabel: "$1.25", finalPrice: 1.25, unitLabel: "pouch", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-10-meijer-folgers", retailer: "meijer", title: "Folgers coffee, 19\u201326 oz", detail: "Meijer weekly ad, Oct 14\u201320.", priceLabel: "$10.99", finalPrice: 10.99, unitLabel: "canister", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-10-meijer-tidycats", retailer: "meijer", title: "Tidy Cats litter, 20 lb", detail: "Meijer weekly ad, Oct 14\u201320.", priceLabel: "$11.49", finalPrice: 11.49, unitLabel: "20 lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-10-giant-eggs", retailer: "giant", title: "Giant large eggs", detail: "Giant Food weekly ad, Oct 9\u201315.", priceLabel: "$1.79", finalPrice: 1.79, unitLabel: "dozen", couponSteps: "Weekly-ad price with your free GIANT Card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/giant-food-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-10-giant-bacon", retailer: "giant", title: "Hormel bacon", detail: "Giant Food weekly ad, Oct 9\u201315.", priceLabel: "$3.99", finalPrice: 3.99, unitLabel: "package", couponSteps: "Weekly-ad price with your free GIANT Card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/giant-food-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the package size in the full ad." },
  { externalKey: "2026-10-giant-chips", retailer: "giant", title: "Utz potato chips", detail: "Giant Food weekly ad, Oct 9\u201315.", priceLabel: "Buy 1, get 1 free", finalPrice: null, unitLabel: "bag", couponSteps: "Buy 2 eligible bags; the second rings up free at checkout.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/giant-food-weekly-ad/", confidence: "indexed", caveat: "Shelf price was not supplied, so final total is not computed." },
  { externalKey: "2026-10-giant-cereal", retailer: "giant", title: "General Mills cereal", detail: "Giant Food weekly ad, Oct 9\u201315.", priceLabel: "Buy 1, get 1 free", finalPrice: null, unitLabel: "box", couponSteps: "Buy 2 eligible boxes; the second rings up free at checkout.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/giant-food-weekly-ad/", confidence: "indexed", caveat: "Shelf price was not supplied, so final total is not computed." },
  { externalKey: "2026-10-ss-honeycrisp", retailer: "stop_shop", title: "Honeycrisp apples", detail: "Stop & Shop weekly ad, Oct 9\u201315.", priceLabel: "$1.49/lb", finalPrice: 1.49, unitLabel: "lb", couponSteps: "Weekly-ad price with your free GO Rewards card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/stop-and-shop-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-10-ss-chicken", retailer: "stop_shop", title: "Chicken breast", detail: "Stop & Shop weekly ad, Oct 9\u201315.", priceLabel: "$2.99/lb", finalPrice: 2.99, unitLabel: "lb", couponSteps: "Weekly-ad price with your free GO Rewards card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/stop-and-shop-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-10-ss-bacon", retailer: "stop_shop", title: "Stop & Shop sliced bacon", detail: "Stop & Shop weekly ad, Oct 9\u201315.", priceLabel: "$4.49", finalPrice: 4.49, unitLabel: "package", couponSteps: "Weekly-ad price with your free GO Rewards card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/stop-and-shop-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the package size in the full ad." },
  { externalKey: "2026-10-ss-barilla", retailer: "stop_shop", title: "Barilla pasta", detail: "Stop & Shop weekly ad, Oct 9\u201315.", priceLabel: "4 for $5 \xB7 $1.25 each", finalPrice: 1.25, unitLabel: "box", couponSteps: "Buy 4 eligible boxes to get the per-box price.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/stop-and-shop-weekly-ad/", confidence: "indexed", caveat: "Quantity threshold required; confirm eligible cuts in the full ad." },
  { externalKey: "2026-10-ss-kelloggs", retailer: "stop_shop", title: "Kellogg's cereal", detail: "Stop & Shop weekly ad, Oct 9\u201315.", priceLabel: "2 for $5 \xB7 $2.50 each", finalPrice: 2.5, unitLabel: "box", couponSteps: "Buy 2 eligible boxes to get the per-box price.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/stop-and-shop-weekly-ad/", confidence: "indexed", caveat: "Quantity threshold required; confirm eligible varieties in the full ad." },
  { externalKey: "2026-10-fl-klondike", retailer: "food_lion", title: "Klondike bars, 4\u20136 ct", detail: "Food Lion weekly ad offer running through Oct 20.", priceLabel: "2 for $7 \xB7 $3.50 each", finalPrice: 3.5, unitLabel: "pack", couponSteps: "Buy 2 eligible packs; the 2-for-$7 price applies at checkout.", validFrom: "2026-10-09", validThrough: "2026-10-20", sourceName: "SmartDealsHub", sourceUrl: "https://smartdealshub.co/food-lion/food-lion-weekly-ad-2605516&expired=true/", confidence: "indexed", caveat: "Offer dates came from the ad roundup; confirm in your local ad." },
  { externalKey: "2026-10-fl-yogurt", retailer: "food_lion", title: "Food Lion yogurt, 32 oz", detail: "Food Lion weekly ad offer.", priceLabel: "2 for $5 \xB7 $2.50 each", finalPrice: 2.5, unitLabel: "32 oz tub", couponSteps: "Buy 2 eligible tubs; the 2-for-$5 price applies at checkout.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "SmartDealsHub", sourceUrl: "https://smartdealshub.co/food-lion/food-lion-weekly-ad-2605516&expired=true/", confidence: "indexed", caveat: "Offer dates came from the ad roundup; confirm in your local ad." },
  { externalKey: "2026-10-fl-beef", retailer: "food_lion", title: "93% lean ground beef", detail: "Food Lion weekly ad MVP price, Oct 15\u201321.", priceLabel: "$6.99/lb with MVP", finalPrice: 6.99, unitLabel: "lb", couponSteps: "MVP card price; scan your free MVP card at checkout.", validFrom: "2026-10-15", validThrough: "2026-10-21", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; MVP pricing requires the free MVP card." },
  { externalKey: "2026-10-fl-tenderloins", retailer: "food_lion", title: "Chicken breast tenderloins", detail: "Food Lion weekly ad MVP price, Oct 15\u201321.", priceLabel: "$3.49/lb with MVP", finalPrice: 3.49, unitLabel: "lb", couponSteps: "MVP card price; scan your free MVP card at checkout.", validFrom: "2026-10-15", validThrough: "2026-10-21", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; MVP pricing requires the free MVP card." },
  { externalKey: "2026-10-costco-soup", retailer: "costco", title: "Campbell's soup, 8-pack", detail: "Costco coupon book, Sep 21 \u2013 Oct 18.", priceLabel: "$7.99 after coupon-book savings", finalPrice: 7.99, unitLabel: "8-pack", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; warehouse selection varies." },
  { externalKey: "2026-10-costco-tide", retailer: "costco", title: "Tide laundry detergent", detail: "Costco coupon book, Sep 21 \u2013 Oct 18.", priceLabel: "$16.49 after coupon-book savings", finalPrice: 16.49, unitLabel: "bottle", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; confirm the size on the coupon-book page." },
  { externalKey: "2026-10-costco-granola", retailer: "costco", title: "Nature Valley protein bars, 30-pack", detail: "Costco coupon book, Sep 21 \u2013 Oct 18.", priceLabel: "$9.99 after coupon-book savings", finalPrice: 9.99, unitLabel: "30-pack", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; warehouse selection varies." },
  { externalKey: "2026-10-costco-perrier", retailer: "costco", title: "Perrier sparkling water, 24-pack", detail: "Costco coupon book, Sep 21 \u2013 Oct 18.", priceLabel: "$17.99 after coupon-book savings", finalPrice: 17.99, unitLabel: "24-pack", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; warehouse selection varies." },
  { externalKey: "2026-10-costco-crest", retailer: "costco", title: "Crest toothpaste, 5-pack", detail: "Costco coupon book, Sep 21 \u2013 Oct 18.", priceLabel: "$11.99 after coupon-book savings", finalPrice: 11.99, unitLabel: "5-pack", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; warehouse selection varies." },
  { externalKey: "2026-10-costco-pantene", retailer: "costco", title: "Pantene shampoo", detail: "Costco coupon book, Sep 21 \u2013 Oct 18.", priceLabel: "$9.99 after coupon-book savings", finalPrice: 9.99, unitLabel: "bottle", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; confirm the size on the coupon-book page." },
  { externalKey: "2026-10-sams-nutella", retailer: "sams_club", title: "Nutella peanut spread, twin pack", detail: "Highlighted in MoneyLion's Oct 10 Sam's Club grocery roundup.", priceLabel: "$9.98 \xB7 2 \xD7 26.5 oz", finalPrice: 9.98, unitLabel: "twin pack", couponSteps: "Club price for members; no coupon stated.", validFrom: "2026-10-10", validThrough: null, sourceName: "MoneyLion", sourceUrl: "https://www.moneylion.com/trending/money/sams-club-groceries-worth-money", confidence: "indexed", caveat: "Roundup pricing from Oct 10; Sam's Club membership required and prices can change." },
  { externalKey: "2026-10-sams-liquidiv", retailer: "sams_club", title: "Liquid I.V., 30 count", detail: "Highlighted in MoneyLion's Oct 10 Sam's Club grocery roundup.", priceLabel: "$20.98", finalPrice: 20.98, unitLabel: "30 count", couponSteps: "Club price for members; no coupon stated.", validFrom: "2026-10-10", validThrough: null, sourceName: "MoneyLion", sourceUrl: "https://www.moneylion.com/trending/money/sams-club-groceries-worth-money", confidence: "indexed", caveat: "Roundup pricing from Oct 10; Sam's Club membership required and prices can change." },
  { externalKey: "2026-10-pig-bananas", retailer: "piggly_wiggly", title: "Bananas", detail: "Piggly Wiggly weekly ad, Oct 14\u201320.", priceLabel: "$0.55/lb", finalPrice: 0.55, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/", confidence: "indexed", caveat: "Piggly Wiggly stores are independently owned; prices vary by location." },
  { externalKey: "2026-10-pig-soda", retailer: "piggly_wiggly", title: "Soda 12-packs", detail: "Piggly Wiggly weekly ad, Oct 14\u201320.", priceLabel: "3 for $15 \xB7 $5 each", finalPrice: 5, unitLabel: "12-pack", couponSteps: "Buy 3 eligible 12-packs to get the per-pack price.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/", confidence: "indexed", caveat: "Independently owned stores; prices vary by location." },
  { externalKey: "2026-10-pig-lunchables", retailer: "piggly_wiggly", title: "Lunchables", detail: "Piggly Wiggly weekly ad, Oct 14\u201320.", priceLabel: "2 for $3 \xB7 $1.50 each", finalPrice: 1.5, unitLabel: "pack", couponSteps: "Buy 2 eligible packs to get the per-pack price.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/", confidence: "indexed", caveat: "Independently owned stores; prices vary by location." },
  { externalKey: "2026-w42-wm-tylenol", retailer: "walmart", title: "Tylenol 8 Hour Arthritis Pain", detail: "Posted in The Krazy Coupon Lady's Walmart deal feed around Oct 12.", priceLabel: "$0.27 \xB7 was $4.97", finalPrice: 0.27, unitLabel: "bottle", couponSteps: "Deal price; no coupon stated. Confirm the current price in the Walmart app before ordering.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/walmart", confidence: "indexed", caveat: "Rollback/clearance pricing varies by store, can sell out, and can disappear at any time; the source listed no end date." },
  { externalKey: "2026-w42-wm-pur-gum", retailer: "walmart", title: "PUR Gum", detail: "Posted in The Krazy Coupon Lady's Walmart deal feed around Oct 12.", priceLabel: "$1.00 \xB7 was $4.99", finalPrice: 1, unitLabel: "pack", couponSteps: "Deal price; no coupon stated. Confirm the current price in the Walmart app before ordering.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/walmart", confidence: "indexed", caveat: "Deal-feed pricing varies by store and can disappear at any time; the source listed no end date." },
  { externalKey: "2026-w42-wm-sheba", retailer: "walmart", title: "Sheba Premium Purees cat food", detail: "Freebie listing in The Krazy Coupon Lady's extreme-couponing feed.", priceLabel: "FREE \xB7 was $2.68", finalPrice: 0, unitLabel: "pack", couponSteps: "Listed as a freebie; no coupon stated in the source. Confirm availability in the Walmart app.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/deals/extreme-couponing", confidence: "indexed", caveat: "Freebie listings end without notice; the source listed no end date." },
  { externalKey: "2026-w42-wm-pillsbury-dough", retailer: "walmart", title: "Pillsbury cookie dough packs", detail: "Two packs at the deal price in The Krazy Coupon Lady's extreme-couponing feed.", priceLabel: "2 for $1.80 \xB7 $0.90 each (was $8.78 for 2)", finalPrice: 0.9, unitLabel: "pack", couponSteps: "Deal price; no coupon stated. Confirm the current price in the Walmart app before ordering.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/deals/extreme-couponing", confidence: "indexed", caveat: "Deal-feed pricing varies by store and can disappear at any time; the source listed no end date." },
  { externalKey: "2026-w42-wm-king-arthur", retailer: "walmart", title: "King Arthur Soft Golden Roll & Bun Mix", detail: "Posted in The Krazy Coupon Lady's extreme-couponing feed.", priceLabel: "$0.96 \xB7 was $3.96", finalPrice: 0.96, unitLabel: "box", couponSteps: "Deal price; no coupon stated. Confirm the current price in the Walmart app before ordering.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/deals/extreme-couponing", confidence: "indexed", caveat: "Deal-feed pricing varies by store and can disappear at any time; the source listed no end date." },
  { externalKey: "2026-w42-wm-ground-beef", retailer: "walmart", title: "Ground beef value pack", detail: "Posted in The Krazy Coupon Lady's Walmart deal feed around Oct 12; the listing did not state the pack size.", priceLabel: "$19.94 \xB7 was $24.94", finalPrice: 19.94, unitLabel: "pack", couponSteps: "Deal price; no coupon stated. Confirm the pack size and current price in the Walmart app before ordering.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/walmart", confidence: "indexed", caveat: "Pack size was not stated in the source; meat pricing varies by store and can change at any time." },
  { externalKey: "2026-w42-wm-no7", retailer: "walmart", title: "No7 beauty products: $5 off", detail: "Sponsored in-store QR-code coupon; example items priced $18.97\u2013$25.97 ring up about $13.97\u2013$20.97 after the coupon.", priceLabel: "$5 off 1 No7 product", finalPrice: null, unitLabel: "coupon", couponSteps: "Scan the No7 promo QR code in store before checkout; the $5 coupon comes off one item. Limit one per customer.", validFrom: "2026-10-11", validThrough: "2026-11-01", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/11/save-5-on-no7-beauty-products-at-walmart", confidence: "indexed", caveat: "Sponsored offer valid through Nov 1, 2026; one-time use per customer." },
  { externalKey: "2026-w42-heb-tortillas", retailer: "heb", title: "FREE H-E-B Mi Tienda Tortillas, 20 ct", detail: "H-E-B Meal Deal: buy 2 H-E-B Mi Tienda fully cooked fajitas (chicken 26 oz or beef 16 oz), get the tortillas free.", priceLabel: "FREE with Meal Deal purchase", finalPrice: 0, unitLabel: "20-ct pack", couponSteps: "Buy 2 qualifying Mi Tienda fajitas in one trip; the H-E-B Meal Deal coupon makes the 20-ct tortillas free. Unlimited use while the deal runs.", validFrom: "2026-10-14", validThrough: null, sourceName: "H-E-B Weekly Ad", sourceUrl: "https://www.heb.com/collections/weekly-ad?N=490024&int=coupon-home-shortcuts-weekly-ad", confidence: "indexed", caveat: "The source lists this Meal Deal as expiring 'Tuesday' without a printed date; confirm it is still live in the H-E-B app." },
  { externalKey: "2026-w42-heb-zyrtec", retailer: "heb", title: "Zyrtec 24\u201360 ct: $5 off", detail: "Example from the source: the 30-ct size at $19.97 drops to $14.97 after the digital coupon.", priceLabel: "$5 off 1 adult Zyrtec (24\u201360 ct)", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $5/1 any adult Zyrtec 24\u201360 ct digital coupon in the H-E-B app or on heb.com. Limit 1 per customer; excludes trial and travel sizes.", validFrom: "2026-10-13", validThrough: "2026-10-24", sourceName: "Saving Our Way", sourceUrl: "https://www.savingourway.com/post/h-e-b-digital-coupon-on-zyrtec", confidence: "indexed", caveat: "Digital coupon expires Oct 24, 2026; final price depends on the size you buy." },
  { externalKey: "2026-w42-heb-huggies", retailer: "heb", title: "Huggies, Pull-Ups, or Goodnites: $7 off", detail: "H-E-B digital coupon in the weekly 'can't miss coupons' set.", priceLabel: "$7 off Huggies / Pull-Ups / Goodnites", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $7 H-E-B digital coupon in the app or on heb.com and buy qualifying Huggies, Pull-Ups, or Goodnites. Unlimited use while the coupon runs.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "H-E-B Weekly Ad", sourceUrl: "https://www.heb.com/collections/weekly-ad?N=490024&int=coupon-home-shortcuts-weekly-ad", confidence: "indexed", caveat: "Coupon expires Oct 20, 2026 per the source." },
  { externalKey: "2026-w42-heb-candy", retailer: "heb", title: "Halloween candy variety bags: $5 off 2", detail: "Reese's, Hershey's, Kit Kat, or Jolly Rancher variety bags, 55\u2013120 ct.", priceLabel: "$5 off 2 candy variety bags", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the H-E-B digital coupon and buy 2 qualifying Halloween candy variety bags (55\u2013120 ct).", validFrom: "2026-10-14", validThrough: "2026-10-27", sourceName: "H-E-B Weekly Ad", sourceUrl: "https://www.heb.com/collections/weekly-ad?N=490024&int=coupon-home-shortcuts-weekly-ad", confidence: "indexed", caveat: "Coupon expires Oct 27, 2026 per the source." },
  { externalKey: "2026-w42-heb-pampers-wipes", retailer: "heb", title: "FREE Pampers Baby Wipes, 52\u201372 ct", detail: "Free wipes with a Pampers or Luvs box diaper purchase (36\u2013168 ct), per The Krazy Coupon Lady's coupon roundup.", priceLabel: "FREE with box diaper purchase", finalPrice: 0, unitLabel: "wipes pack", couponSteps: "Buy Pampers or Luvs box diapers (36\u2013168 ct); the H-E-B store coupon makes the 52\u201372 ct Pampers wipes free. The source also lists $1/1 Luvs jumbo-bag and $3/1 Luvs box H-E-B digitals.", validFrom: "2026-10-13", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons/luvs", confidence: "indexed", caveat: "The source listed no end date; store coupons can end early \u2014 confirm in the H-E-B app before shopping." },
  { externalKey: "2026-w42-aldi-raspberries", retailer: "aldi", title: "Raspberries", detail: "ALDI weekly ad price, Oct 7\u201313. ALDI accepts no manufacturer coupons.", priceLabel: "$1.49", finalPrice: 1.49, unitLabel: "package", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7\u201313 ad. The Oct 14\u201320 ad had not been posted by any source checked on Oct 13 \u2014 recorded as found, not replaced with invented prices." },
  { externalKey: "2026-w42-aldi-tenderloins", retailer: "aldi", title: "Chicken tenderloins", detail: "ALDI weekly ad price, Oct 7\u201313. ALDI accepts no manufacturer coupons.", priceLabel: "$2.09/lb", finalPrice: 2.09, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7\u201313 ad; the Oct 14\u201320 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-potstickers", retailer: "aldi", title: "Chicken potstickers", detail: "ALDI weekly ad price, Oct 7\u201313. ALDI accepts no manufacturer coupons.", priceLabel: "$3.99", finalPrice: 3.99, unitLabel: "package", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7\u201313 ad; the Oct 14\u201320 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-granny-smith", retailer: "aldi", title: "Granny Smith apples", detail: "ALDI weekly ad price, Oct 7\u201313; the listing did not state the package size. ALDI accepts no manufacturer coupons.", priceLabel: "$2.99", finalPrice: 2.99, unitLabel: "package", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7\u201313 ad; the Oct 14\u201320 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-fried-rice", retailer: "aldi", title: "Chicken fried rice", detail: "ALDI weekly ad price, Oct 7\u201313. ALDI accepts no manufacturer coupons.", priceLabel: "$5.99", finalPrice: 5.99, unitLabel: "package", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7\u201313 ad; the Oct 14\u201320 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-pork-belly", retailer: "aldi", title: "Pork belly", detail: "ALDI weekly ad price, Oct 7\u201313 (the source suggests it for burnt ends). ALDI accepts no manufacturer coupons.", priceLabel: "$2.99/lb", finalPrice: 2.99, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7\u201313 ad; the Oct 14\u201320 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-blackberries", retailer: "aldi", title: "Blackberries, 6 oz", detail: "ALDI weekly ad price, Oct 7\u201313. ALDI accepts no manufacturer coupons.", priceLabel: "$1.79", finalPrice: 1.79, unitLabel: "6 oz package", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/aldi-ad/", confidence: "indexed", caveat: "From ALDI's Oct 7\u201313 ad; the Oct 14\u201320 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-chicken-thighs", retailer: "aldi", title: "Boneless skinless chicken thighs", detail: "ALDI weekly ad price, Oct 7\u201313. ALDI accepts no manufacturer coupons.", priceLabel: "$2.49/lb", finalPrice: 2.49, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/aldi-ad/", confidence: "indexed", caveat: "From ALDI's Oct 7\u201313 ad; the Oct 14\u201320 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-united-chicken", retailer: "united", title: "Open Nature whole chicken", detail: "United Supermarkets weekly ad, Oct 8\u201315 (Texas regional chain).", priceLabel: "$2.49/lb", finalPrice: 2.49, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/wide-range-of-offers-1522340/6/", confidence: "indexed", caveat: "Weekly-ad roundup; no coupon-blog matchup coverage was found for United, so no stacking scenario is shown." },
  { externalKey: "2026-w42-united-turkey", retailer: "united", title: "Signature Farms lean ground turkey, 16 oz", detail: "United Supermarkets weekly ad, Oct 8\u201315.", priceLabel: "$4.49", finalPrice: 4.49, unitLabel: "16 oz pack", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/wide-range-of-offers-1522340/6/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-nabisco", retailer: "united", title: "Nabisco party-size cookies or crackers", detail: "United Supermarkets weekly ad, Oct 8\u201315.", priceLabel: "$2.50", finalPrice: 2.5, unitLabel: "party-size pack", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/wide-range-of-offers-1522340/6/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-dawn", retailer: "united", title: "Dawn dish soap, 70 oz", detail: "United Supermarkets weekly ad, Oct 8\u201315.", priceLabel: "$9.99", finalPrice: 9.99, unitLabel: "70 oz bottle", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/wide-range-of-offers-1522340/6/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-ham", retailer: "united", title: "Whole sliced ham: buy 1, get 1 free", detail: "United Supermarkets weekly ad, Oct 8\u201315.", priceLabel: "Buy 1, get 1 free", finalPrice: null, unitLabel: "ham", couponSteps: "Buy 2 eligible hams; the second rings up free at checkout. No coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/united-supermarkets-weekly-ad-3307370/4/", confidence: "indexed", caveat: "Shelf price was not supplied, so no per-ham total is computed." },
  { externalKey: "2026-w42-united-lemons", retailer: "united", title: "Fresh lemons", detail: "United Supermarkets weekly ad, Oct 8\u201315.", priceLabel: "4 for $1.00 \xB7 $0.25 each", finalPrice: 0.25, unitLabel: "lemon", couponSteps: "Buy 4 lemons to get the per-lemon price. No coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/united-supermarkets-weekly-ad-3307370/4/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-oranges", retailer: "united", title: "Navel oranges", detail: "United Supermarkets weekly ad, Oct 8\u201315.", priceLabel: "$0.99/lb", finalPrice: 0.99, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/united-supermarkets-weekly-ad-3307370/4/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-salad-kits", retailer: "united", title: "Taylor Farms broccoli salad kits", detail: "United Supermarkets weekly ad, Oct 8\u201315.", priceLabel: "2 for $7 \xB7 $3.50 each", finalPrice: 3.5, unitLabel: "kit", couponSteps: "Buy 2 eligible kits to get the per-kit price. No coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/united-supermarkets-weekly-ad-3307370/4/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-online", retailer: "united", title: "Online orders: $30 off $75+", detail: "Recurring United Supermarkets online promo code tracked by SimplyCodes.", priceLabel: "$30 off a $75+ online order", finalPrice: null, unitLabel: "offer", couponSteps: "Enter the current promo code from the source page at online checkout on a $75+ order.", validFrom: "2026-10-13", validThrough: null, sourceName: "SimplyCodes", sourceUrl: "https://simplycodes.com/store/unitedsupermarkets.com", confidence: "indexed", caveat: "The source tracked this code as active in 7 of the last 8 months; confirm it still applies before counting on it. United's free forU program also earns points on groceries and gas." },
  { externalKey: "2026-w42-dg-colgate", retailer: "dollar_general", title: "Colgate toothpaste: $1 Saturday stack", detail: "Part of The Krazy Coupon Lady's Dollar General Saturday scenario for Oct 17.", priceLabel: "$1 each in the Saturday scenario", finalPrice: 1, unitLabel: "tube", couponSteps: "Clip the Saturday $5 off $25 digital in the myDG app and build the published scenario cart; the $5/$25 applies after item coupons under DG threshold math.", validFrom: "2026-10-13", validThrough: "2026-10-17", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more", confidence: "indexed", caveat: "Saturday-only scenario pricing; exact varieties and sizes must match the digital offers in your myDG account." },
  { externalKey: "2026-w42-dg-airwick", retailer: "dollar_general", title: "Air Wick warmer: $1 Saturday stack", detail: "Part of The Krazy Coupon Lady's Dollar General Saturday scenario for Oct 17.", priceLabel: "$1 each in the Saturday scenario", finalPrice: 1, unitLabel: "warmer", couponSteps: "Clip the Saturday $5 off $25 digital in the myDG app and build the published scenario cart with the matching item digital.", validFrom: "2026-10-13", validThrough: "2026-10-17", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more", confidence: "indexed", caveat: "Saturday-only scenario pricing; digital coupons can end early." },
  { externalKey: "2026-w42-dg-irish-spring", retailer: "dollar_general", title: "Irish Spring body wash", detail: "Sale price minus a DG digital coupon, per Living Rich with Coupons.", priceLabel: "$3.35 \xB7 $5.35 shelf \u2212 $2 digital", finalPrice: 3.35, unitLabel: "bottle", couponSteps: "Clip the $2 Irish Spring DG digital coupon in the myDG app before checkout.", validFrom: "2026-10-12", validThrough: "2026-10-17", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/new-5-25-dollar-general-coupon-soda-12-packs-just-3-45-each-just-use-your-phone-10-10-only.html", confidence: "indexed", caveat: "Digital coupons can end early; confirm the offer is in your myDG account." },
  { externalKey: "2026-w42-dg-febreze-plug", retailer: "dollar_general", title: "Febreze Plug refill, 2-pack", detail: "Sale price minus a DG digital coupon, per Living Rich with Coupons.", priceLabel: "$5.00 \xB7 $10 shelf \u2212 $5 digital", finalPrice: 5, unitLabel: "2-pack", couponSteps: "Clip the $5 Febreze Plug DG digital coupon in the myDG app before checkout.", validFrom: "2026-10-12", validThrough: "2026-10-17", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/new-5-25-dollar-general-coupon-soda-12-packs-just-3-45-each-just-use-your-phone-10-10-only.html", confidence: "indexed", caveat: "Digital coupons can end early; confirm the offer is in your myDG account." },
  { externalKey: "2026-w42-dg-febreze-small", retailer: "dollar_general", title: "Febreze Small Spaces", detail: "Sale price minus a DG digital coupon, per Living Rich with Coupons.", priceLabel: "$1.50 \xB7 $3.50 shelf \u2212 $2 digital", finalPrice: 1.5, unitLabel: "unit", couponSteps: "Clip the $2 Febreze Small Spaces DG digital coupon in the myDG app before checkout.", validFrom: "2026-10-12", validThrough: "2026-10-17", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/new-5-25-dollar-general-coupon-soda-12-packs-just-3-45-each-just-use-your-phone-10-10-only.html", confidence: "indexed", caveat: "Digital coupons can end early; confirm the offer is in your myDG account." },
  { externalKey: "2026-w42-dg-energizer", retailer: "dollar_general", title: "Energizer Max AA/AAA, 4-pack", detail: "Sale price minus a DG digital coupon, per Living Rich with Coupons.", priceLabel: "$2.50 \xB7 $5.50 shelf \u2212 $3 digital", finalPrice: 2.5, unitLabel: "4-pack", couponSteps: "Clip the $3 Energizer DG digital coupon in the myDG app before checkout.", validFrom: "2026-10-12", validThrough: "2026-10-17", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/new-5-25-dollar-general-coupon-soda-12-packs-just-3-45-each-just-use-your-phone-10-10-only.html", confidence: "indexed", caveat: "Digital coupons can end early; confirm the offer is in your myDG account." },
  { externalKey: "2026-w42-dg-household-scenario", retailer: "dollar_general", title: "Saturday scenario: 8 household staples for $8", detail: "Suavitel, Fabuloso, Softsoap refill, Palmolive, OxiClean spray, Arm & Hammer scent beads, and 2 Snuggle \u2014 stacked with item digitals, Colgate-Palmolive $5/$15 instant savings, and the Saturday $5 off $25.", priceLabel: "$8 total for 8 items in the published scenario", finalPrice: null, unitLabel: "scenario", couponSteps: "Clip every item digital in the myDG app (Suavitel \u2212$2, Fabuloso \u2212$0.75, Softsoap \u2212$2, Palmolive \u2212$1, OxiClean \u2212$2, Arm & Hammer beads \u2212$2, Snuggle \u2212$4/2), buy all 8 items on Saturday, and let the $5/$15 instant savings and the $5/$25 store coupon apply at checkout.", validFrom: "2026-10-13", validThrough: "2026-10-17", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more", confidence: "indexed", caveat: "Scenario math per DG stacking rules in the source; every digital must be clipped and available in your account, and the $5/$25 is Saturday Oct 17 only." },
  { externalKey: "2026-w42-fd-gain", retailer: "family_dollar", title: "Gain laundry products: $5 off Smart Coupon", detail: "Covers Gain liquid 81 oz, fabric softener 100 oz, scent boosters, or dryer sheets; weekly ad Oct 11\u201317 plus Smart Coupons.", priceLabel: "$5 off Gain laundry products", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $5 Gain Smart Coupon to your Family Dollar account and buy a qualifying Gain laundry product; Smart Coupons apply in store.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Smart Coupons are in-store only; confirm the coupon is in your account before shopping." },
  { externalKey: "2026-w42-fd-arm-hammer", retailer: "family_dollar", title: "Arm & Hammer laundry: $4 off Smart Coupon", detail: "Arm & Hammer liquid 96.2\u2013110 oz or Power Paks 42 ct; weekly ad Oct 11\u201317 plus Smart Coupons.", priceLabel: "$4 off Arm & Hammer laundry", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $4 Arm & Hammer Smart Coupon to your Family Dollar account and buy the 96.2\u2013110 oz liquid or 42-ct Power Paks.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Smart Coupons are in-store only; confirm the coupon is in your account before shopping." },
  { externalKey: "2026-w42-fd-dawn", retailer: "family_dollar", title: "Dawn Platinum: $2 off Smart Coupon", detail: "Dawn Platinum EZ-Squeeze 24 oz or Power Suds 17.4 oz; weekly ad Oct 11\u201317 plus Smart Coupons.", priceLabel: "$2 off Dawn Platinum", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $2 Dawn Platinum Smart Coupon to your Family Dollar account and buy the EZ-Squeeze 24 oz or Power Suds 17.4 oz.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Smart Coupons are in-store only; confirm the coupon is in your account before shopping." },
  { externalKey: "2026-w42-fd-downy", retailer: "family_dollar", title: "Downy: $2 off Smart Coupon", detail: "Downy liquid 56/100 oz or scent boosters; weekly ad Oct 11\u201317 plus Smart Coupons.", priceLabel: "$2 off Downy products", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $2 Downy Smart Coupon to your Family Dollar account and buy a qualifying Downy liquid or scent booster.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Smart Coupons are in-store only; confirm the coupon is in your account before shopping." },
  { externalKey: "2026-w42-fd-pizza-coupon", retailer: "family_dollar", title: "DiGiorno or Tombstone pizza: $1 off 2", detail: "Family Dollar digital coupon running Oct 1\u201331, 2026.", priceLabel: "$1 off 2 frozen pizzas", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $1 off 2 DiGiorno/Tombstone digital coupon and buy 2 qualifying pizzas. Per the source it stacks on the pizza category's 2-for-$9 ad pricing (Red Baron).", validFrom: "2026-10-01", validThrough: "2026-10-31", sourceName: "Family Dollar", sourceUrl: "https://www.familydollar.com/coupon-details", confidence: "indexed", caveat: "Digital coupon expires Oct 31, 2026; confirm it is clipped to your account." },
  { externalKey: "2026-w42-fd-coke", retailer: "family_dollar", title: "Coca-Cola 6-packs, 16.9 oz", detail: "Family Dollar weekly ad, Oct 11\u201317.", priceLabel: "$4 each when you buy 4", finalPrice: 4, unitLabel: "6-pack", couponSteps: "Buy 4 eligible 6-packs in one trip to get the $4 per-pack price. No coupon stated.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Quantity threshold required; the same ad lists Dr Pepper 12-packs 3 for $17, Doritos 2 for $7, and Lay's 3 for $7." },
  { externalKey: "2026-w42-fd-scott", retailer: "family_dollar", title: "Scott paper products", detail: "Scott Choose-A-Sheet 6 rolls or Comfort Plus bath tissue 6/12 rolls; weekly ad Oct 11\u201317.", priceLabel: "2 for $8 \xB7 $4 each", finalPrice: 4, unitLabel: "pack", couponSteps: "Buy 2 eligible Scott packs; the 2-for-$8 price applies at checkout. No coupon stated.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the price at your local store." },
  { externalKey: "2026-w42-kroger-salsa", retailer: "kroger", title: "Salsa: FREE", detail: "Lead deal in The Krazy Coupon Lady's Top 10 Kroger deals for the Oct 14\u201320 ad week.", priceLabel: "FREE \xB7 was $4.99", finalPrice: 0, unitLabel: "jar", couponSteps: "Follow the digital/coupon combination in the source post exactly; clip the required Kroger digital before shopping.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/08/top-10-must-do-kroger-deals-free-salsa-0-65-hellmanns-mayo-and-more", confidence: "indexed", caveat: "Digital coupons can be removed at any time; the exact brand and size are in the source post." },
  { externalKey: "2026-w42-kroger-yakisoba", retailer: "kroger", title: "Maruchan Yakisoba noodle packs", detail: "Two packs at the deal price in The Krazy Coupon Lady's Top 10 Kroger deals, Oct 14\u201320.", priceLabel: "$0.39 for 2 \xB7 about $0.20 each (was $2.78 for 2)", finalPrice: 0.2, unitLabel: "pack", couponSteps: "Buy 2 Maruchan Yakisoba packs and use the $1/2 Maruchan digital coupon clipped to your Shopper's Card.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/08/top-10-must-do-kroger-deals-free-salsa-0-65-hellmanns-mayo-and-more", confidence: "indexed", caveat: "Digital coupon required; per-pack math rounds the $0.39 two-pack total." },
  { externalKey: "2026-w42-kroger-hellmanns", retailer: "kroger", title: "Hellmann's mayonnaise", detail: "Coupon-plus-rebate stack in The Krazy Coupon Lady's Top 10 Kroger deals, Oct 14\u201320.", priceLabel: "$0.65 after coupon + rebate (pay $3.29)", finalPrice: 0.65, unitLabel: "jar", couponSteps: "Pay $3.29 at checkout with the $2/1 Hellmann's digital coupon clipped, then submit the $2 Fetch Rewards rebate offer.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/08/top-10-must-do-kroger-deals-free-salsa-0-65-hellmanns-mayo-and-more", confidence: "indexed", caveat: "Fetch rebate amounts vary by account; you pay $3.29 at the register and get the rest back as a rebate." },
  { externalKey: "2026-w42-kroger-grands", retailer: "kroger", title: "Pillsbury Grands! biscuit tubes", detail: "Two tubes at the deal price in The Krazy Coupon Lady's Kroger feed, Oct 14\u201320.", priceLabel: "$1.49 each when you buy 2 (was $6.78 for 2)", finalPrice: 1.49, unitLabel: "tube", couponSteps: "Buy 2 eligible Pillsbury Grands! tubes with your Shopper's Card; the sale price applies at checkout.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/kroger", confidence: "indexed", caveat: "Weekly deal-feed price; participating varieties are listed in the source." },
  { externalKey: "2026-w42-kroger-tillamook", retailer: "kroger", title: "Tillamook cheese", detail: "Two packages at the deal price in The Krazy Coupon Lady's Kroger feed, Oct 14\u201320.", priceLabel: "2 for $4.59 \xB7 about $2.30 each (was $9.18 for 2)", finalPrice: 2.3, unitLabel: "package", couponSteps: "Buy 2 eligible Tillamook cheeses with your Shopper's Card; the sale price applies at checkout.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/kroger", confidence: "indexed", caveat: "Weekly deal-feed price; per-package math rounds the $4.59 two-pack total." },
  { externalKey: "2026-w42-kroger-arm-hammer", retailer: "kroger", title: "Arm & Hammer laundry detergent", detail: "Digital-coupon price in The Krazy Coupon Lady's Top 10 Kroger deals, Oct 14\u201320; the same post lists $2 cash back on Persil.", priceLabel: "$4.50 after $2/1 digital coupon", finalPrice: 4.5, unitLabel: "bottle", couponSteps: "Clip the $2/1 Arm & Hammer digital coupon to your Shopper's Card and buy the qualifying detergent.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/08/top-10-must-do-kroger-deals-free-salsa-0-65-hellmanns-mayo-and-more", confidence: "indexed", caveat: "Kroger's Mega Event (buy 5+, save $1 each) and 33%-off Halloween candy digital also run Oct 14\u201320 per Kroger Krazy and KCL; see the sources for item lists." },
  { externalKey: "2026-w42-kroger-deal-days", retailer: "kroger", title: "Deal Days: $30 off $75+ pickup or delivery", detail: "Kroger Deal Days digital coupon, running through Oct 20 per Hip2Save.", priceLabel: "$30 off a $75+ pickup/delivery order", finalPrice: null, unitLabel: "offer", couponSteps: "Clip the Deal Days digital coupon to your Shopper's Card and place a $75+ pickup or delivery order; per the source it stacks with other Kroger digitals.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Hip2Save", sourceUrl: "https://hip2save.com/deals/kroger-deal-days/", confidence: "indexed", caveat: "Online orders only; coupon must be clipped before ordering." },
  { externalKey: "2026-w42-publix-pringles", retailer: "publix", title: "Pringles potato crisps, 5.2/5.5 oz", detail: "BOGO plus printable coupon stack from iHeartPublix, ad week Oct 8\u201314.", priceLabel: "$1.02 per can when you buy 2", finalPrice: 1.02, unitLabel: "can", couponSteps: "Buy 2 cans on BOGO ($2.79 shelf) and use the $0.75/2 Pringles printable coupon.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/get-cans-of-pringles-potato-crisps-for-just-1-02-each/", confidence: "indexed", caveat: "Publix ad dates vary slightly by region (some areas run a day earlier); printable coupons can run out." },
  { externalKey: "2026-w42-publix-progresso", retailer: "publix", title: "Progresso broth, 32 oz", detail: "BOGO plus digital coupon stack from iHeartPublix, ad week Oct 8\u201314.", priceLabel: "$1.15 per carton when you buy 4", finalPrice: 1.15, unitLabel: "carton", couponSteps: "Buy 4 cartons on BOGO ($2.79 shelf) and use the $1/4 Progresso/Old El Paso Publix digital coupon \u2014 or a $1/4 Ibotta offer; the two cannot combine.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/get-cartons-of-progresso-broth-for-just-1-15-at-publix/", confidence: "indexed", caveat: "Publix ad dates vary slightly by region; choose the digital or Ibotta \u2014 not both." },
  { externalKey: "2026-w42-publix-arm-hammer", retailer: "publix", title: "Arm & Hammer laundry detergent", detail: "BOGO plus Publix digital stack from iHeartPublix, ad week Oct 8\u201314 (liquid, unit dose, or sheets).", priceLabel: "As low as $1.05 after BOGO + digital", finalPrice: 1.05, unitLabel: "bottle", couponSteps: "Buy on BOGO ($6.10\u2013$7.49 shelf) and use the $2/1 Arm & Hammer Publix digital coupon clipped to your Club Publix account.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/grab-arm-hammer-laundry-detergent-as-low-as-1-05-at-publix-5/", confidence: "indexed", caveat: "Final price depends on which BOGO shelf price your store runs; ad dates vary slightly by region." },
  { externalKey: "2026-w42-publix-oscar-mayer", retailer: "publix", title: "Oscar Mayer Deli Fresh lunch meat", detail: "BOGO plus Ibotta stack in iHeartPublix's Super Deals, ad week Oct 8\u201314.", priceLabel: "$1.60 after Ibotta cash back", finalPrice: 1.6, unitLabel: "package", couponSteps: "Buy on BOGO ($6.19 shelf), then submit the $1.50/1 Ibotta deposit (limit 5).", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-super-deals-week-of-10-8-to-10-14-10-7-to-10-13-for-some/", confidence: "indexed", caveat: "You pay the BOGO price at the register; the $1.60 figure is after Ibotta cash back. Ad dates vary slightly by region." },
  { externalKey: "2026-w42-publix-siggis", retailer: "publix", title: "Siggi's skyr yogurt cups", detail: "BOGO plus printable coupon stack in iHeartPublix's Super Deals, ad week Oct 8\u201314.", priceLabel: "As low as $0.50 per cup", finalPrice: 0.5, unitLabel: "cup", couponSteps: "Buy 4\u20138 oz cups on BOGO ($2\u2013$2.50 shelf) and use the $1/2 Siggi's printable coupon.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-super-deals-week-of-10-8-to-10-14-10-7-to-10-13-for-some/", confidence: "indexed", caveat: "The 24 oz cup runs BOGO $6.99 with the same printable, about $3 each; ad dates vary slightly by region." },
  { externalKey: "2026-w42-publix-country-crock", retailer: "publix", title: "Country Crock spread or plant butter", detail: "BOGO plus printable coupon stack in iHeartPublix's Super Deals, ad week Oct 8\u201314.", priceLabel: "As low as $0.33 after BOGO + coupon", finalPrice: 0.33, unitLabel: "tub", couponSteps: "Buy on BOGO and use the $1.50/1 Country Crock printable coupon.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-super-deals-week-of-10-8-to-10-14-10-7-to-10-13-for-some/", confidence: "indexed", caveat: "Lowest figure assumes the lowest BOGO shelf price in the source; ad dates vary slightly by region." },
  { externalKey: "2026-w42-publix-digiorno", retailer: "publix", title: "DiGiorno stuffed crust pizzas", detail: "Two pizzas at the deal price in iHeartPublix's Super Deals, ad week Oct 8\u201314.", priceLabel: "2 for $9.29 \xB7 $4.65 each (was $23.58 for 2)", finalPrice: 4.65, unitLabel: "pizza", couponSteps: "Buy 2 DiGiorno stuffed crust pizzas at the ad price; no extra coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-super-deals-week-of-10-8-to-10-14-10-7-to-10-13-for-some/", confidence: "indexed", caveat: "Ad dates vary slightly by region; per-pizza math splits the $9.29 two-pizza total." },
  { externalKey: "2026-w42-safeway-honeycrisp", retailer: "safeway", title: "Honeycrisp apples", detail: "Safeway/Albertsons for U digital price in the ad week ending Oct 13.", priceLabel: "$0.97/lb with for U", finalPrice: 0.97, unitLabel: "lb", couponSteps: "Clip the for U digital offer to your free Safeway/Albertsons account before shopping.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "From the ad week ending Oct 13; couponing sources had not yet covered the ad starting Oct 14 \u2014 check the for U app for the new week." },
  { externalKey: "2026-w42-safeway-ribs", retailer: "safeway", title: "Pork ribs: back, spare, or St. Louis-style", detail: "Safeway/Albertsons weekly ad price in the week ending Oct 13.", priceLabel: "$2.77/lb", finalPrice: 2.77, unitLabel: "lb", couponSteps: "Weekly-ad price with a free Safeway for U account; no coupon stated.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "From the ad week ending Oct 13; the new week's ad was not yet covered by the sources checked \u2014 confirm in the for U app." },
  { externalKey: "2026-w42-safeway-haagen", retailer: "safeway", title: "H\xE4agen-Dazs ice cream or treats", detail: "Safeway/Albertsons weekly ad price in the week ending Oct 13.", priceLabel: "$2.47 each when you buy 2", finalPrice: 2.47, unitLabel: "carton", couponSteps: "Buy 2 eligible H\xE4agen-Dazs items with your for U account to get the per-item price.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "From the ad week ending Oct 13; the new week's ad was not yet covered by the sources checked \u2014 confirm in the for U app." },
  { externalKey: "2026-w42-safeway-chicken", retailer: "safeway", title: "Boneless skinless chicken breasts", detail: "Safeway/Albertsons weekly ad price in the week ending Oct 13.", priceLabel: "$1.99/lb", finalPrice: 1.99, unitLabel: "lb", couponSteps: "Weekly-ad price with a free Safeway for U account; no coupon stated.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "From the ad week ending Oct 13; the new week's ad was not yet covered by the sources checked \u2014 confirm in the for U app." },
  { externalKey: "2026-w42-safeway-quaker", retailer: "safeway", title: "Quaker cereal, oatmeal, or Chewy bars", detail: "Safeway/Albertsons weekly ad price in the week ending Oct 13; the same roundup listed Bartlett pears, a 5-lb bag of Signature Select russets, and a 3-lb bag of yellow onions at $0.99 each.", priceLabel: "$1.99 each (first 4)", finalPrice: 1.99, unitLabel: "box", couponSteps: "Weekly-ad price with a free Safeway for U account; the $1.99 price applies to the first 4 items.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "From the ad week ending Oct 13; the new week's ad was not yet covered by the sources checked \u2014 confirm in the for U app." },
  { externalKey: "2026-w42-safeway-folgers", retailer: "safeway", title: "Folgers coffee: buy 1, get 1 free", detail: "Safeway/Albertsons weekly ad offer in the week ending Oct 13.", priceLabel: "Buy 1, get 1 free", finalPrice: null, unitLabel: "canister", couponSteps: "Buy 2 eligible Folgers canisters with your for U account; the second rings up free.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "Shelf price was not supplied, so no per-canister total is computed. From the ad week ending Oct 13." },
  { externalKey: "2026-w42-target-oxiclean", retailer: "target", title: "OxiClean MaxForce stain remover", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$1.42 \xB7 was $3.49", finalPrice: 1.42, unitLabel: "bottle", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; Circle offers are account-specific and manufacturer coupons are one-time use \u2014 the source listed no end date." },
  { externalKey: "2026-w42-target-poise", retailer: "target", title: "Poise Ultra Thin Pads", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$3.89 \xB7 was $6.59", finalPrice: 3.89, unitLabel: "pack", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early." },
  { externalKey: "2026-w42-target-degree", retailer: "target", title: "Degree antiperspirant", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$2.84 \xB7 was $4.99", finalPrice: 2.84, unitLabel: "stick", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early." },
  { externalKey: "2026-w42-target-dove", retailer: "target", title: "Dove Bond Strength shampoo", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$2.75 \xB7 was $4.89", finalPrice: 2.75, unitLabel: "bottle", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early." },
  { externalKey: "2026-w42-target-dawn", retailer: "target", title: "Dawn Ultra EZ Squeeze or Platinum dish soap", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$1.89 \xB7 was $3.99", finalPrice: 1.89, unitLabel: "bottle", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early." },
  { externalKey: "2026-w42-target-febreze", retailer: "target", title: "Febreze Bathroom air freshener", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$1.61 \xB7 was $3.69", finalPrice: 1.61, unitLabel: "unit", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early." },
  { externalKey: "2026-w42-target-colgate", retailer: "target", title: "Colgate oral care", detail: "Final prices after Target Circle plus manufacturer coupons in the Target app, per The Krazy Coupon Lady.", priceLabel: "360 toothbrush $1.42 \xB7 Max Fresh toothpaste $1.89", finalPrice: 1.42, unitLabel: "item", couponSteps: "Clip the Target Circle offers and the one-time manufacturer coupons in the Target app before checkout; the toothbrush was $3.49 and the toothpaste $3.99 before offers.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early. Final price shown is for the toothbrush." },
  { externalKey: "2026-w42-target-swiffer", retailer: "target", title: "Swiffer Heavy Duty Duster Kit", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$4.74 \xB7 was $9.99", finalPrice: 4.74, unitLabel: "kit", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; KCL also lists a one-time 25% off one toy or kids' book Circle coupon (clip Oct 11\u2013Nov 14) on its Target hacks page." },
  { externalKey: "2026-w42-meijer-apples", retailer: "meijer", title: "Local apples (tote bag)", detail: "Meijer weekly ad, Oct 14\u201320 (Green Bay/Howard store roundup); the same ad lists 5-lb russet potatoes and 3-lb yellow onions at $2.49 each.", priceLabel: "$0.99/lb", finalPrice: 0.99, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-potatoes", retailer: "meijer", title: "Russet potatoes, 5-lb bag", detail: "Meijer weekly ad, Oct 14\u201320; 3-lb yellow onions are also $2.49 in the same ad.", priceLabel: "$2.49 per 5-lb bag", finalPrice: 2.49, unitLabel: "5-lb bag", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-carrots", retailer: "meijer", title: "Baby carrots, 1 lb (Buy 5, Save $5)", detail: "Meijer weekly ad, Oct 14\u201320; a Buy 5, Save $5 participating item (2,000+ items this week). Little Potato Co. creamer potatoes (3 lb) are $3.99 as a Buy5 item in the same ad.", priceLabel: "$0.39 with Buy 5, Save $5", finalPrice: 0.39, unitLabel: "1-lb bag", couponSteps: "Buy any 5 participating Buy 5, Save $5 items in one trip; the per-item price reflects the event discount.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Requires 5 participating items; regional weekly-ad roundup \u2014 confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-sargento", retailer: "meijer", title: "Sargento cheese (Buy 5, Save $5)", detail: "Meijer weekly ad, Oct 14\u201320; a Buy 5, Save $5 participating item.", priceLabel: "$1.99 with Buy 5, Save $5", finalPrice: 1.99, unitLabel: "package", couponSteps: "Buy any 5 participating Buy 5, Save $5 items in one trip; the per-item price reflects the event discount.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Requires 5 participating items; regional weekly-ad roundup \u2014 confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-egglands", retailer: "meijer", title: "Eggland's Best eggs (Buy 5, Save $5)", detail: "Meijer weekly ad, Oct 14\u201320; a Buy 5, Save $5 participating item. Daisy sour cream (24 oz) is $2.69 as a Buy5 item in the same ad.", priceLabel: "$2.79 with Buy 5, Save $5", finalPrice: 2.79, unitLabel: "dozen", couponSteps: "Buy any 5 participating Buy 5, Save $5 items in one trip; the per-item price reflects the event discount.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Requires 5 participating items; regional weekly-ad roundup \u2014 confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-pork", retailer: "meijer", title: "Whole pork shoulder butt", detail: "Meijer weekly ad, Oct 14\u201320; pork loin assorted chops are $1.79/lb in the same ad.", priceLabel: "$1.99/lb", finalPrice: 1.99, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-15-off-150", retailer: "meijer", title: "Meijer: $15 off $150 digital coupon", detail: "mPerks digital coupon highlighted in the Wisconsin Consumer weekly roundup.", priceLabel: "$15 off a $150 order", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $15 off $150 digital coupon in your mPerks account; per the source it can be used up to 3 times.", validFrom: "2026-10-14", validThrough: "2026-11-03", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Coupon expires Nov 3, 2026 per the source; threshold calculated under mPerks terms." },
  { externalKey: "2026-w42-giant-cheese", retailer: "giant", title: "Giant brand shredded or chunk cheese", detail: "Giant Food deal, Oct 9\u201315, from ForTheMommas.", priceLabel: "$1.77 each when you buy 4", finalPrice: 1.77, unitLabel: "package", couponSteps: "Buy 4 Giant brand shredded or chunk cheeses; the per-package price applies at checkout. No coupon needed.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "ForTheMommas", sourceUrl: "https://forthemommas.com/category/store-deals/giant-food-store", confidence: "indexed", caveat: "Quantity threshold required; deals stack with Giant digital coupons and Flexible Rewards gas points per the source." },
  { externalKey: "2026-w42-giant-birdseye", retailer: "giant", title: "Birds Eye Premium Vegetables", detail: "Giant Food deal, Oct 9\u201315, from ForTheMommas.", priceLabel: "$1.75 each \xB7 $2.00 wyb 4 \u2212 $1/4 digital", finalPrice: 1.75, unitLabel: "bag", couponSteps: "Buy 4 at $2.00 each and use the $1/4 Giant digital coupon clipped to your GIANT Card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "ForTheMommas", sourceUrl: "https://forthemommas.com/category/store-deals/giant-food-store", confidence: "indexed", caveat: "Digital coupon required; confirm the offer is clipped before shopping." },
  { externalKey: "2026-w42-giant-ben-jerrys", retailer: "giant", title: "Ben & Jerry's pints", detail: "Giant Food deal, Oct 9\u201315, from ForTheMommas.", priceLabel: "$3.00 each \xB7 $4.00 \u2212 $2/2 digital", finalPrice: 3, unitLabel: "pint", couponSteps: "Buy 2 pints at $4.00 each and use the $2/2 Giant digital coupon clipped to your GIANT Card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "ForTheMommas", sourceUrl: "https://forthemommas.com/store-deals/giant-food-store/best-giant-deals-24", confidence: "indexed", caveat: "Digital coupon required; confirm the offer is clipped before shopping." },
  { externalKey: "2026-w42-giant-ragu", retailer: "giant", title: "Ragu sauce or San Giorgio / Mueller's pasta", detail: "Giant Food deal, Oct 9\u201315, from ForTheMommas.", priceLabel: "$1.25 each when you buy 4", finalPrice: 1.25, unitLabel: "item", couponSteps: "Buy 4 participating Ragu, San Giorgio, or Mueller's items; the per-item price applies at checkout. No coupon needed.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "ForTheMommas", sourceUrl: "https://forthemommas.com/store-deals/giant-food-store/best-giant-deals-24", confidence: "indexed", caveat: "Quantity threshold required; mix-and-match participation is per the source's deal list." },
  { externalKey: "2026-w42-giant-arm-hammer", retailer: "giant", title: "Arm & Hammer liquid detergent", detail: "Giant Food deal, Oct 9\u201315, from ForTheMommas.", priceLabel: "$1.99 \xB7 $3.99 \u2212 $2 digital coupon", finalPrice: 1.99, unitLabel: "bottle", couponSteps: "Use the $2 Giant digital coupon clipped to your GIANT Card on the $3.99 sale price.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "ForTheMommas", sourceUrl: "https://forthemommas.com/store-deals/giant-food-store/best-giant-deals-24", confidence: "indexed", caveat: "Digital coupon required; the same source shows a McCormick taco-seasoning gas-points scenario that can net free-plus \u2014 see the source for that math." },
  { externalKey: "2026-w42-giant-freschetta", retailer: "giant", title: "Freschetta pizza", detail: "Giant Food digital coupon, limit 2, expiring Oct 15.", priceLabel: "$3.99 with digital coupon", finalPrice: 3.99, unitLabel: "pizza", couponSteps: "Clip the Freschetta digital coupon to your GIANT Card; limit 2 per account.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "Giant Food", sourceUrl: "https://giantfood.com/savings/coupons/browse", confidence: "indexed", caveat: "Digital coupon expires Oct 15, 2026 per the retailer's coupon gallery." },
  { externalKey: "2026-w42-ss-progresso", retailer: "stop_shop", title: "Progresso Pitmaster soups: 4 for $4", detail: "Coupon-plus-rebate stack from Living Rich with Coupons, week of Oct 9\u201315.", priceLabel: "$1 each when you buy 4 (after eCoupon + rebates)", finalPrice: 1, unitLabel: "can", couponSteps: "Buy 4 at $2.00 each ($8), clip the $1/4 Stop & Shop eCoupon (expires Nov 14), then submit (4) $0.50/1 Ibotta rebates and (2) $0.50/2 Fetch Rewards offers (Fetch expires Oct 31) \u2014 $4 back total.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/stop-shop-coupon-deals-week-of-10-9-10-15.html", confidence: "indexed", caveat: "You pay $7 at the register after the eCoupon; the $1-per-can figure is after Ibotta and Fetch rebates, which vary by account." },
  { externalKey: "2026-w42-ss-avocado", retailer: "stop_shop", title: "Hass avocado", detail: "Stop & Shop weekly ad, Oct 9\u201315.", priceLabel: "$1.00 each", finalPrice: 1, unitLabel: "avocado", couponSteps: "Weekly-ad price with your free GO Rewards card; no coupon stated.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/stop-shop-coupon-deals-week-of-10-9-10-15.html", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-ss-carrots", retailer: "stop_shop", title: "Baby-cut carrots, 1 lb (store brand)", detail: "Stop & Shop weekly ad, Oct 9\u201315; the same ad runs store-brand russet/mini potatoes and yellow onions buy 2, get 1 free.", priceLabel: "$1.00 per 1-lb bag", finalPrice: 1, unitLabel: "1-lb bag", couponSteps: "Weekly-ad price with your free GO Rewards card; no coupon stated.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/stop-shop-coupon-deals-week-of-10-9-10-15.html", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-ss-grapes", retailer: "stop_shop", title: "Adora black seedless grapes", detail: "Stop & Shop weekly ad, Oct 9\u201315; Honeycrisp apples are $1.49/lb in the same ad.", priceLabel: "$1.99/lb", finalPrice: 1.99, unitLabel: "lb", couponSteps: "Weekly-ad price with your free GO Rewards card; no coupon stated.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/stop-shop-coupon-deals-week-of-10-9-10-15.html", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-ss-online", retailer: "stop_shop", title: "Online orders: $25 off your first two $100+ orders", detail: "Promo code SSONLINE50 for delivery or pickup orders, ending Oct 16, 2026 per the source.", priceLabel: "$25 off $100+ online orders (first two)", finalPrice: null, unitLabel: "offer", couponSteps: "Enter code SSONLINE50 on a $100+ delivery or pickup order; applies to your first two online orders.", validFrom: "2026-10-09", validThrough: "2026-10-16", sourceName: "DontPayFull", sourceUrl: "https://www.dontpayfull.com/at/stopandshop.com", confidence: "indexed", caveat: "The source verified the code working about a week before Oct 13; new online customers \u2014 confirm at checkout." },
  { externalKey: "2026-w42-fl-arm-hammer", retailer: "food_lion", title: "Arm & Hammer liquid or Power Paks", detail: "Food Lion weekly ad preview, Oct 14\u201320: liquid 32.5\u201343 oz or Power Paks 14 ct.", priceLabel: "$1.99", finalPrice: 1.99, unitLabel: "bottle or pack", couponSteps: "Weekly-ad MVP price; scan your free MVP card at checkout. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; stack MVP digital coupons where eligible." },
  { externalKey: "2026-w42-fl-haagen", retailer: "food_lion", title: "H\xE4agen-Dazs, 14 oz", detail: "Food Lion weekly ad preview, Oct 14\u201320.", priceLabel: "$3.29", finalPrice: 3.29, unitLabel: "14 oz carton", couponSteps: "Weekly-ad MVP price; scan your free MVP card at checkout. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-fl-eight-oclock", retailer: "food_lion", title: "Eight O'Clock coffee", detail: "Food Lion weekly ad preview, Oct 14\u201320: K-cups or bagged coffee.", priceLabel: "$5.99", finalPrice: 5.99, unitLabel: "package", couponSteps: "Weekly-ad MVP price; scan your free MVP card at checkout. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-fl-eggo", retailer: "food_lion", title: "Eggo waffles", detail: "Food Lion weekly ad preview, Oct 14\u201320; Devour frozen dinners are $3.49 and Totino's Pizza Rolls (100 ct) $8.99 in the same ad.", priceLabel: "2 for $6 \xB7 $3 each", finalPrice: 3, unitLabel: "box", couponSteps: "Buy 2 eligible boxes with your MVP card; the 2-for-$6 price applies at checkout.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-fl-dog-chow", retailer: "food_lion", title: "Purina Dog Chow, 16.5\u201320 lb", detail: "Food Lion weekly ad preview, Oct 14\u201320; Pup-Peroni and Milk-Bone treats are 2 for $6 in the same ad.", priceLabel: "$15.99", finalPrice: 15.99, unitLabel: "bag", couponSteps: "Weekly-ad MVP price; scan your free MVP card at checkout. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-fl-fall-haul", retailer: "food_lion", title: "MVP Fall Haul: earn a $20 coupon", detail: "Shop 6 times with your personal MVP card during the event, spending $50+ per trip, and a $20 coupon prints at the bottom of your receipt.", priceLabel: "Earn a $20 coupon after 6 qualifying trips", finalPrice: null, unitLabel: "offer", couponSteps: "Use the same personal MVP card for 6 trips of $50+ during the event window; the earned $20 coupon prints on a receipt and is valid about two weeks.", validFrom: "2026-10-15", validThrough: "2026-11-26", sourceName: "Progressive Grocer", sourceUrl: "https://progressivegrocer.com/food-lion-offers-mvp-fall-haul", confidence: "indexed", caveat: "Sources differ on the window \u2014 Progressive Grocer says Oct 15\u2013Nov 26, a coupon roundup says Oct 13\u2013Nov 24; confirm the dates in your MVP account. A $5 off $30 printable coupon is also listed by coupon sources." },
  { externalKey: "2026-w42-costco-rice-krispies", retailer: "costco", title: "Kellogg's Rice Krispies Treats, 60 ct", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members.", priceLabel: "$8.99 \xB7 $12.99 \u2212 $4 Instant Savings", finalPrice: 8.99, unitLabel: "60-ct box", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "The current Instant Savings book ends Oct 18; the next book runs Oct 19\u2013Nov 15 per The Krazy Coupon Lady. Warehouse selection varies." },
  { externalKey: "2026-w42-costco-tasters", retailer: "costco", title: "Nescaf\xE9 Taster's Choice, 14 oz", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members.", priceLabel: "$15.99 \xB7 $21.99 \u2212 $6 Instant Savings", finalPrice: 15.99, unitLabel: "14 oz jar", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "Instant Savings book ends Oct 18; warehouse selection varies." },
  { externalKey: "2026-w42-costco-vita-coco", retailer: "costco", title: "Vita Coco coconut water, 18-pack", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members.", priceLabel: "$15.69 \xB7 $24.49 \u2212 $5.80 Instant Savings", finalPrice: 15.69, unitLabel: "18-pack", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "Instant Savings book ends Oct 18; warehouse selection varies." },
  { externalKey: "2026-w42-costco-celsius", retailer: "costco", title: "Celsius energy drinks, 18-pack", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members.", priceLabel: "$17.99 \xB7 $23.99 \u2212 $6 Instant Savings", finalPrice: 17.99, unitLabel: "18-pack", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "Instant Savings book ends Oct 18; warehouse selection varies." },
  { externalKey: "2026-w42-costco-peets", retailer: "costco", title: "Peet's Organic French Roast, 32 oz", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members.", priceLabel: "$15.49 \xB7 $21.99 \u2212 $6.50 Instant Savings", finalPrice: 15.49, unitLabel: "32 oz bag", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "Instant Savings book ends Oct 18; warehouse selection varies." },
  { externalKey: "2026-w42-costco-classico", retailer: "costco", title: "Classico Organic pasta sauce, 3-pack", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members. Maison Perrier (24 pk) $16.99 and Waterloo (24 pk) $7.99 after Instant Savings are in the same roundup.", priceLabel: "$8.79 \xB7 $12.79 \u2212 $4 Instant Savings", finalPrice: 8.79, unitLabel: "3-pack", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "Instant Savings book ends Oct 18; warehouse selection varies." },
  { externalKey: "2026-w42-sams-tyson", retailer: "sams_club", title: "Tyson chicken nuggets bag", detail: "Member price spotted by The Krazy Coupon Lady's deal hunters about a week before Oct 13.", priceLabel: "$9.97 member price", finalPrice: 9.97, unitLabel: "bag", couponSteps: "Club price for members; no coupon or clipping \u2014 Sam's Instant Savings are automatic account discounts when a book is running.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "Sam's is between Instant Savings books (the next is predicted Oct 28\u2013Nov 29 per KCL), so this week's finds are member/clearance prices that can change or sell out; membership required." },
  { externalKey: "2026-w42-sams-rice-krispies", retailer: "sams_club", title: "Kellogg's Rice Krispies cereal box", detail: "Member price spotted by The Krazy Coupon Lady's deal hunters about a week before Oct 13.", priceLabel: "$7.98 member price", finalPrice: 7.98, unitLabel: "box", couponSteps: "Club price for members; no coupon stated.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "Between Instant Savings books; member prices can change at any time and the source listed no end date." },
  { externalKey: "2026-w42-sams-barber", retailer: "sams_club", title: "Barber Foods Stuffed Turkey Breast, 6-pack", detail: "Member price spotted by The Krazy Coupon Lady's deal hunters about a week before Oct 13.", priceLabel: "$12.98 member price", finalPrice: 12.98, unitLabel: "6-pack", couponSteps: "Club price for members; no coupon stated.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "Between Instant Savings books; member prices can change at any time and the source listed no end date." },
  { externalKey: "2026-w42-sams-clorox", retailer: "sams_club", title: "Clorox Bathroom Cleaner, 3-pack", detail: "Member price spotted by The Krazy Coupon Lady's deal hunters about a week before Oct 13.", priceLabel: "$12.98 member price", finalPrice: 12.98, unitLabel: "3-pack", couponSteps: "Club price for members; no coupon stated.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "Between Instant Savings books; member prices can change at any time and the source listed no end date." },
  { externalKey: "2026-w42-sams-pants", retailer: "sams_club", title: "Member's Mark women's wide leg pants (clearance)", detail: "Clearance price spotted by The Krazy Coupon Lady's deal hunters about a week before Oct 13; a kids' Sandwash pullover at $5.81 and a women's UV tee at $4.81 were in the same roundup.", priceLabel: "$6.81 clearance \xB7 was $16.98", finalPrice: 6.81, unitLabel: "pair", couponSteps: "Clearance member price; no coupon stated. Check your club's clearance section or the item page in the app.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "Clearance is club-specific and sells out fast; the source listed no end date." },
  { externalKey: "2026-w42-sams-membership", retailer: "sams_club", title: "New-member deal: Club $20 or Plus $60", detail: "Promotional new-member pricing via the links in The Krazy Coupon Lady's Sam's Club roundup (Club regularly $60/year per the store profile).", priceLabel: "Club $20 (60% off) \xB7 Plus $60 for new members", finalPrice: null, unitLabel: "offer", couponSteps: "Join through the promotional link in the source roundup as a new member; pricing is applied by Sam's at signup.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "New members only (per the source); promotional pricing can end at any time and the source listed no end date." },
  { externalKey: "2026-w42-pig-carrots", retailer: "piggly_wiggly", title: "Matchstix, Carrot Crinkle, or Supremes packs, 10\u201316 oz", detail: "Piggly Wiggly weekly ad preview, Oct 14\u201320.", priceLabel: "3 for $5 \xB7 about $1.67 each", finalPrice: 1.67, unitLabel: "pack", couponSteps: "Buy 3 eligible packs to get the per-pack price. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/", confidence: "indexed", caveat: "Piggly Wiggly stores are independently owned; ad prices vary by location. Select stores double coupons daily and seniors save an extra 5% on Wednesdays at participating locations." },
  { externalKey: "2026-w42-pig-oats", retailer: "piggly_wiggly", title: "Better Oats oatmeal, 10-pack", detail: "Piggly Wiggly weekly ad preview, Oct 14\u201320.", priceLabel: "2 for $6 \xB7 $3 each", finalPrice: 3, unitLabel: "10-pack box", couponSteps: "Buy 2 eligible boxes to get the per-box price. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/", confidence: "indexed", caveat: "Independently owned stores; prices vary by location." },
  { externalKey: "2026-w42-pig-tide", retailer: "piggly_wiggly", title: "Tide 73\u201384 oz: $3 off digital coupon", detail: "Digital coupon from a Louisiana Piggly Wiggly franchise coupon gallery, expiring Oct 25, 2026.", priceLabel: "$3 off Tide (73\u201384 oz)", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $3 Tide digital coupon in your local store's digital account before shopping.", validFrom: "2026-10-13", validThrough: "2026-10-25", sourceName: "Tangipig (Piggly Wiggly Louisiana)", sourceUrl: "https://tangipig.com/", confidence: "indexed", caveat: "Coupon detail comes from a Louisiana regional franchise site; Piggly Wiggly stores are independently operated and coupon programs vary \u2014 verify your local store participates." },
  { externalKey: "2026-w42-pig-crest", retailer: "piggly_wiggly", title: "Crest 3 oz+: $3 off digital coupon", detail: "Digital coupon from a Louisiana Piggly Wiggly franchise coupon gallery, expiring Oct 25, 2026.", priceLabel: "$3 off Crest (3 oz or larger)", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $3 Crest digital coupon in your local store's digital account before shopping.", validFrom: "2026-10-13", validThrough: "2026-10-25", sourceName: "Tangipig (Piggly Wiggly Louisiana)", sourceUrl: "https://tangipig.com/", confidence: "indexed", caveat: "Louisiana franchise source; independently operated stores vary \u2014 verify locally." },
  { externalKey: "2026-w42-pig-gain", retailer: "piggly_wiggly", title: "Gain laundry: $3 off digital coupon", detail: "Digital coupon from a Louisiana Piggly Wiggly franchise coupon gallery, expiring Oct 25, 2026; covers Gain liquid 99 oz or powder 82 oz.", priceLabel: "$3 off Gain liquid 99 oz / powder 82 oz", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $3 Gain digital coupon in your local store's digital account before shopping.", validFrom: "2026-10-13", validThrough: "2026-10-25", sourceName: "Tangipig (Piggly Wiggly Louisiana)", sourceUrl: "https://tangipig.com/", confidence: "indexed", caveat: "Louisiana franchise source; independently operated stores vary \u2014 verify locally. The same gallery lists $2.50 off Poise/Depend through Nov 1 and $1 off 4 Campbell's cream soups through Oct 23." },
  { externalKey: "2026-w42-pig-hellmanns", retailer: "piggly_wiggly", title: "Hellmann's / Best Foods 11.5 oz: $2 off digital", detail: "Digital coupon from a Louisiana Piggly Wiggly franchise coupon gallery, expiring Oct 15, 2026.", priceLabel: "$2 off Hellmann's/Best Foods (11.5 oz)", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $2 Hellmann's/Best Foods digital coupon in your local store's digital account before shopping.", validFrom: "2026-10-13", validThrough: "2026-10-15", sourceName: "Tangipig (Piggly Wiggly Louisiana)", sourceUrl: "https://tangipig.com/", confidence: "indexed", caveat: "Louisiana franchise source; independently operated stores vary \u2014 verify locally before the Oct 15 expiry." }
];
var storePriceFactors = {
  walmart: 1,
  heb: 0.99,
  aldi: 0.94,
  united: 1.08,
  dollar_general: 1.12,
  family_dollar: 1.13,
  kroger: 1.04,
  publix: 1.18,
  safeway: 1.17,
  target: 1.05,
  meijer: 1.02,
  giant: 1.11,
  stop_shop: 1.14,
  food_lion: 1.07,
  costco: 0.91,
  sams_club: 0.9,
  piggly_wiggly: 1.08
};
function priceFor(basePrice, retailer) {
  return Math.round(basePrice * storePriceFactors[retailer] * 100) / 100;
}
var catalogBase = [
  { id: "bananas", category: "Produce", brand: "Fresh", name: "Bananas", unit: "lb", imageSlug: "bananas", imageAlt: "Bananas product photo", basePrice: 0.58, keywords: "banana fruit" },
  { id: "apples", category: "Produce", brand: "Fresh", name: "Gala apples", unit: "lb", imageSlug: "apples", imageAlt: "Gala apples product photo", basePrice: 1.49, keywords: "apple fruit" },
  { id: "strawberries", category: "Produce", brand: "Fresh", name: "Strawberries", unit: "1-lb package", imageSlug: "strawberries", imageAlt: "Strawberries product photo", basePrice: 2.99, keywords: "berries fruit" },
  { id: "chicken-breast", category: "Meat & seafood", brand: "Fresh", name: "Boneless chicken breasts", unit: "lb", imageSlug: "chicken-breast", imageAlt: "Boneless chicken breasts product photo", basePrice: 3.24, keywords: "chicken poultry meat breast" },
  { id: "ground-beef", category: "Meat & seafood", brand: "Fresh", name: "Ground beef 80/20", unit: "lb", imageSlug: "ground-beef", imageAlt: "Ground beef 80/20 product photo", basePrice: 4.98, keywords: "beef hamburger meat" },
  { id: "bacon", category: "Meat & seafood", brand: "Smokehouse", name: "Sliced bacon", unit: "12 oz", imageSlug: "bacon", imageAlt: "Sliced bacon product photo", basePrice: 5.49, keywords: "pork breakfast meat" },
  { id: "salmon", category: "Meat & seafood", brand: "Fresh", name: "Atlantic salmon fillet", unit: "lb", imageSlug: "salmon", imageAlt: "Atlantic salmon fillet product photo", basePrice: 9.98, keywords: "fish seafood" },
  { id: "deli-turkey", category: "Meat & seafood", brand: "Deli", name: "Oven-roasted turkey", unit: "lb", imageSlug: "deli-turkey", imageAlt: "Oven-roasted turkey product photo", basePrice: 8.49, keywords: "deli lunch meat sandwich" },
  { id: "whole-milk", category: "Dairy & eggs", brand: "Store brand", name: "Whole milk", unit: "gallon", imageSlug: "whole-milk", imageAlt: "Whole milk product photo", basePrice: 3.48, keywords: "milk dairy" },
  { id: "eggs", category: "Dairy & eggs", brand: "Store brand", name: "Large eggs", unit: "dozen", imageSlug: "eggs", imageAlt: "Large eggs product photo", basePrice: 3.19, keywords: "eggs dairy" },
  { id: "cheddar", category: "Dairy & eggs", brand: "Store brand", name: "Sharp cheddar cheese", unit: "8 oz block", imageSlug: "cheddar", imageAlt: "Sharp cheddar cheese product photo", basePrice: 2.79, keywords: "cheese dairy" },
  { id: "yogurt", category: "Dairy & eggs", brand: "Tillamook", name: "Tillamook plain Greek yogurt", unit: "32 oz tub", imageSlug: "yogurt", imageAlt: "Tillamook plain Greek yogurt product photo", basePrice: 4.29, keywords: "yogurt dairy breakfast" },
  { id: "bread", category: "Bread & bakery", brand: "Bakery", name: "White sandwich bread", unit: "20 oz loaf", imageSlug: "bread", imageAlt: "White sandwich bread product photo", basePrice: 2.49, keywords: "bread toast" },
  { id: "bagels", category: "Bread & bakery", brand: "Bakery", name: "Plain bagels", unit: "6 count", imageSlug: "bagels", imageAlt: "Plain bagels product photo", basePrice: 3.49, keywords: "bagel bread breakfast" },
  { id: "rice", category: "Pantry staples", brand: "Food Lion", name: "Food Lion long grain white rice", unit: "2-lb bag", imageSlug: "rice", imageAlt: "Food Lion long grain white rice product photo", basePrice: 2.18, keywords: "rice grain pantry" },
  { id: "pasta", category: "Pantry staples", brand: "Store brand", name: "Spaghetti pasta", unit: "16 oz box", imageSlug: "pasta", imageAlt: "Spaghetti pasta product photo", basePrice: 1.38, keywords: "pasta noodles pantry" },
  { id: "peanut-butter", category: "Pantry staples", brand: "Store brand", name: "Creamy peanut butter", unit: "16 oz jar", imageSlug: "peanut-butter", imageAlt: "Creamy peanut butter product photo", basePrice: 2.48, keywords: "peanut spread pantry" },
  { id: "canned-tomatoes", category: "Canned goods", brand: "Del Monte", name: "Del Monte diced tomatoes with green chilies", unit: "14.5 oz can", imageSlug: "canned-tomatoes", imageAlt: "Del Monte diced tomatoes with green chilies product photo", basePrice: 1.18, keywords: "tomato canned vegetables" },
  { id: "canned-tuna", category: "Canned goods", brand: "StarKist", name: "StarKist chunk light tuna in water", unit: "5 oz can", imageSlug: "canned-tuna", imageAlt: "StarKist chunk light tuna in water product photo", basePrice: 1.19, keywords: "tuna fish canned seafood" },
  { id: "cheerios", category: "Cereal", brand: "General Mills", name: "Original Cheerios", unit: "12.6 oz box", imageSlug: "cheerios", imageAlt: "Original Cheerios product photo", basePrice: 4.48, keywords: "cereal breakfast oats", upcs: ["0001600027526", "016000275263"] },
  { id: "honey-nut", category: "Cereal", brand: "General Mills", name: "Honey Nut Cheerios", unit: "27.2 oz box", imageSlug: "honey-nut", imageAlt: "Honey Nut Cheerios giant size product photo", basePrice: 4.48, keywords: "cereal breakfast honey oats" },
  { id: "frosted-flakes", category: "Cereal", brand: "Kellogg's", name: "Frosted Flakes", unit: "12 oz box", imageSlug: "frosted-flakes", imageAlt: "Frosted Flakes product photo", basePrice: 4.69, keywords: "cereal breakfast corn" },
  { id: "froot-loops", category: "Cereal", brand: "Kellogg's", name: "Froot Loops", unit: "16.6 oz box", imageSlug: "froot-loops", imageAlt: "Froot Loops product photo", basePrice: 4.69, keywords: "cereal breakfast fruit" },
  { id: "ground-coffee", category: "Coffee & tea", brand: "Folgers", name: "Folgers Classic Roast ground coffee", unit: "40.3 oz canister", imageSlug: "ground-coffee", imageAlt: "Folgers Classic Roast ground coffee product photo", basePrice: 9.98, keywords: "coffee caffeine breakfast" },
  { id: "coffee-pods", category: "Coffee & tea", brand: "Snack Box Pros", name: "Coffee pod variety tray", unit: "24 count", imageSlug: "coffee-pods", imageAlt: "Coffee pod variety tray product photo", basePrice: 10.98, keywords: "coffee pods k cups" },
  { id: "black-tea", category: "Coffee & tea", brand: "Twinings", name: "Twinings Blackcurrant Breeze tea bags", unit: "20 count", imageSlug: "black-tea", imageAlt: "Twinings Blackcurrant Breeze tea bags product photo", basePrice: 4.48, keywords: "tea bags drinks" },
  { id: "frozen-pizza", category: "Frozen foods", brand: "Store brand", name: "Frozen cheese pizza", unit: "each", imageSlug: "frozen-pizza", imageAlt: "Frozen cheese pizza product photo", basePrice: 5.48, keywords: "pizza frozen dinner" },
  { id: "frozen-vegetables", category: "Frozen foods", brand: "Store brand", name: "Mixed vegetables", unit: "12 oz bag", imageSlug: "frozen-vegetables", imageAlt: "Mixed vegetables product photo", basePrice: 1.49, keywords: "vegetables peas carrots" },
  { id: "ice-cream", category: "Frozen foods", brand: "Store brand", name: "Vanilla ice cream", unit: "48 oz tub", imageSlug: "ice-cream", imageAlt: "Vanilla ice cream product photo", basePrice: 3.98, keywords: "ice cream dessert" },
  { id: "orange-juice", category: "Beverages", brand: "Store brand", name: "Orange juice", unit: "52 fl oz", imageSlug: "orange-juice", imageAlt: "Orange juice product photo", basePrice: 3.78, keywords: "juice drink breakfast" },
  { id: "sparkling-water", category: "Beverages", brand: "LaCroix", name: "LaCroix peach-pear sparkling water", unit: "12-pack", imageSlug: "sparkling-water", imageAlt: "LaCroix peach-pear sparkling water product photo", basePrice: 4.98, keywords: "water seltzer cans" },
  { id: "potato-chips", category: "Snacks", brand: "Store brand", name: "Classic potato chips", unit: "8 oz bag", imageSlug: "potato-chips", imageAlt: "Classic potato chips product photo", basePrice: 2.98, keywords: "chips salty snack" },
  { id: "granola-bars", category: "Snacks", brand: "Nature Valley", name: "Nature Valley Crunchy granola bars", unit: "6 count", imageSlug: "granola-bars", imageAlt: "Nature Valley Crunchy granola bars product photo", basePrice: 3.48, keywords: "granola snack bars" },
  { id: "diapers", category: "Baby", brand: "Up & Up", name: "Up & Up overnight diapers, size 3", unit: "88 count box", imageSlug: "diapers", imageAlt: "Up & Up overnight diapers, size 3 product photo", basePrice: 16.49, keywords: "baby diapers infant" },
  { id: "baby-formula", category: "Baby", brand: "Store brand", name: "Infant formula powder", unit: "22 oz can", imageSlug: "baby-formula", imageAlt: "Infant formula powder product photo", basePrice: 24.98, keywords: "baby formula milk" },
  { id: "paper-towels", category: "Household", brand: "Bounty", name: "Bounty paper towels", unit: "6-roll pack", imageSlug: "paper-towels", imageAlt: "Bounty paper towels product photo", basePrice: 8.98, keywords: "paper towels kitchen" },
  { id: "toilet-paper", category: "Household", brand: "Quilton", name: "Quilton toilet paper", unit: "12-roll pack", imageSlug: "toilet-paper", imageAlt: "Quilton toilet paper product photo", basePrice: 9.98, keywords: "bath tissue paper" },
  { id: "laundry-detergent", category: "Cleaning", brand: "Store brand", name: "Liquid laundry detergent", unit: "92 fl oz", imageSlug: "laundry-detergent", imageAlt: "Liquid laundry detergent product photo", basePrice: 9.98, keywords: "soap laundry washer" },
  { id: "dish-soap", category: "Cleaning", brand: "Store brand", name: "Dish soap", unit: "28 fl oz", imageSlug: "dish-soap", imageAlt: "Dish soap product photo", basePrice: 3.48, keywords: "dishwashing cleaning kitchen" },
  { id: "toothpaste", category: "Personal care", brand: "Marvis", name: "Marvis Aquatic Mint toothpaste", unit: "tube", imageSlug: "toothpaste", imageAlt: "Marvis Aquatic Mint toothpaste product photo", basePrice: 3.98, keywords: "dental oral care" },
  { id: "shampoo", category: "Personal care", brand: "Store brand", name: "Daily shampoo", unit: "22 fl oz", imageSlug: "shampoo", imageAlt: "Daily shampoo product photo", basePrice: 5.98, keywords: "hair care bath" },
  { id: "dog-food", category: "Pet supplies", brand: "Purina Dog Chow", name: "Purina Dog Chow Complete Adult", unit: "50-lb bag", imageSlug: "dog-food", imageAlt: "Purina Dog Chow Complete Adult product photo", basePrice: 18.98, keywords: "pet dog kibble" },
  { id: "cat-litter", category: "Pet supplies", brand: "Store brand", name: "Lightweight cat litter", unit: "7-lb jug", imageSlug: "cat-litter", imageAlt: "Lightweight cat litter product photo", basePrice: 11.98, keywords: "pet cat litter" }
];
var catalog = [
  ...catalogBase.map((product) => ({ ...product, estimateUpdatedAt: "2026-10-13T00:00:00.000Z" })),
  ...extraCatalog
];
var saleCatalogMatches = {
  "2026-10-wm-klondike": ["ice-cream-klondike-ice-cream-bars-6-count"],
  "2026-10-wm-coffee": ["coffee-pods-maud-s-fall-coffee-pods-24-count"],
  "2026-10-heb-apples": ["apple-rave-apples-lb"],
  "2026-10-aldi-honeycrisp": ["apple-honeycrisp-apples-lb"],
  "2026-10-aldi-chicken": ["chicken-breast-fresh-chicken-breasts-lb", "chicken-breast"],
  "2026-10-heb-barilla": ["pasta"],
  "2026-10-kroger-cereal": ["cheerios", "honey-nut", "frosted-flakes", "froot-loops"],
  "2026-10-kroger-pasta": ["pasta-penne-pasta-16-oz-box", "pasta-rotini-pasta-16-oz-box"],
  "2026-10-kroger-milk": ["whole-milk"],
  "2026-10-meijer-chicken": ["chicken-breast", "chicken-breast-family-pack-chicken-breasts-5-lb-pack"],
  "2026-10-meijer-folgers": ["ground-coffee"],
  "2026-10-meijer-tidycats": ["cat-litter-unscented-clumping-cat-litter-20-lb-jug", "cat-litter-multi-cat-clumping-litter-20-lb-jug"],
  "2026-10-giant-eggs": ["eggs"],
  "2026-10-ss-chicken": ["chicken-breast", "chicken-breast-fresh-chicken-breasts-lb"],
  "2026-10-ss-barilla": ["pasta-penne-pasta-16-oz-box", "pasta-rotini-pasta-16-oz-box"],
  "2026-10-fl-klondike": ["ice-cream-klondike-ice-cream-bars-6-count"],
  "2026-10-costco-tide": ["laundry-high-efficiency-laundry-detergent-92-fl-oz"],
  "2026-w42-aldi-tenderloins": ["chicken-breast-chicken-breast-tenderloins-lb"],
  "2026-w42-aldi-granny-smith": ["apple-granny-smith-apples-lb"],
  "2026-w42-united-dawn": ["dish-soap-dish-soap-refill-56-fl-oz"],
  "2026-w42-safeway-honeycrisp": ["apple-honeycrisp-apples-lb"],
  "2026-w42-safeway-chicken": ["chicken-breast", "chicken-breast-fresh-chicken-breasts-lb"],
  "2026-w42-safeway-folgers": ["ground-coffee"],
  "2026-w42-target-dawn": ["dish-soap-free-and-clear-dish-soap-24-fl-oz", "dish-soap-antibacterial-dish-soap-24-fl-oz"],
  "2026-w42-publix-digiorno": ["pizza-frozen-meat-lovers-pizza-each"],
  "2026-w42-costco-peets": ["coffee-peet-s-french-roast-ground-coffee-32-oz-bag"],
  "2026-w42-meijer-egglands": ["eggs"],
  "2026-w42-giant-cheese": ["cheddar-shredded-cheddar-cheese-8-oz-bag"]
};
async function loadPlan(ctx) {
  const db = ctx.db();
  const billingRows = await db.select().from(billingSettings).limit(1);
  const billing = billingRows[0];
  const billingConfigured = Boolean(billing?.paymentLinkUrl && billing?.stripeSecretKey);
  const subRows = await db.select().from(subscriptions).limit(1);
  const sub = subRows[0];
  const periodActive = !sub?.currentPeriodEnd || sub.currentPeriodEnd.getTime() >= Date.now();
  const saver = Boolean(sub && (sub.status === "active" || sub.status === "trialing") && periodActive);
  return {
    tier: saver ? "saver" : "free",
    status: sub?.status ?? "none",
    currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
    billingConfigured
  };
}
var alertStopWords = new Set(["and", "the", "with", "for", "from", "each", "item", "pack", "size", "fresh", "whole"]);
function dealMatchesBasketWords(deal, itemNames) {
  const dealWords = new Set(`${deal.title} ${deal.detail}`.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2 && !alertStopWords.has(word)));
  return itemNames.some((name) => name.toLowerCase().split(/[^a-z0-9]+/).some((word) => word.length > 2 && dealWords.has(word)));
}
function isDealCurrent(deal) {
  if (!deal.validThrough)
    return true;
  return deal.validThrough >= new Date().toISOString().slice(0, 10);
}
function normalizedProductText(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function dealAppliesToProduct(deal, product) {
  if (saleCatalogMatches[deal.externalKey]?.includes(product.id))
    return true;
  const dealTitle = normalizedProductText(deal.title);
  const productName = normalizedProductText(product.name);
  return productName.length >= 8 && (dealTitle === productName || dealTitle.startsWith(`${productName} `));
}
async function insertPricedBasketItem(ctx, item) {
  const db = ctx.db();
  const rows = await db.insert(basketItems).values({ name: item.name, quantity: 1, unit: item.unit }).returning({ id: basketItems.id });
  const basketItem = rows[0];
  if (!basketItem)
    throw new Error("Scanned item could not be added");
  for (const retailer of retailerValues) {
    await db.insert(quotes).values({ basketItemId: basketItem.id, retailer, unitPrice: item.prices(retailer), savings: 0, sourceLabel: item.sourceLabel });
  }
  ctx.invalidateQueries();
  return basketItem.id;
}
var scanResponse = object({
  status: _enum(["added_catalog", "added_saved", "unknown"]),
  upc: string2(),
  name: string2().nullable(),
  id: number2().nullable()
});
var knownDealSavings = {
  "2026-10-wm-klondike": 2.5,
  "2026-10-wm-pb2": 14,
  "2026-10-wm-coffee": 6.88,
  "2026-10-united-hidden-valley": 1.69,
  "2026-10-united-butterfinger": 1.5,
  "2026-w42-wm-tylenol": 4.7,
  "2026-w42-wm-pur-gum": 3.99,
  "2026-w42-wm-sheba": 2.68,
  "2026-w42-wm-pillsbury-dough": 3.49,
  "2026-w42-wm-king-arthur": 3,
  "2026-w42-wm-ground-beef": 5,
  "2026-w42-kroger-yakisoba": 1.19,
  "2026-w42-kroger-grands": 1.9,
  "2026-w42-kroger-tillamook": 2.29,
  "2026-w42-publix-digiorno": 7.14,
  "2026-w42-target-oxiclean": 2.07,
  "2026-w42-target-poise": 2.7,
  "2026-w42-target-degree": 2.15,
  "2026-w42-target-dove": 2.14,
  "2026-w42-target-dawn": 2.1,
  "2026-w42-target-febreze": 2.08,
  "2026-w42-target-swiffer": 5.25,
  "2026-w42-dg-irish-spring": 2,
  "2026-w42-dg-febreze-plug": 5,
  "2026-w42-dg-febreze-small": 2,
  "2026-w42-dg-energizer": 3,
  "2026-w42-costco-rice-krispies": 4,
  "2026-w42-costco-tasters": 6,
  "2026-w42-costco-vita-coco": 8.8,
  "2026-w42-costco-celsius": 6,
  "2026-w42-costco-peets": 6.5,
  "2026-w42-costco-classico": 4,
  "2026-w42-sams-pants": 10.17,
  "2026-w42-giant-arm-hammer": 2,
  "2026-w42-giant-ben-jerrys": 1,
  "2026-w42-giant-birdseye": 0.25
};
var dealShape = object({
  retailer: _enum(retailerValues),
  title: string2().min(3).max(160),
  detail: string2().min(3).max(400),
  priceLabel: string2().min(1).max(120),
  finalPrice: number2().nonnegative().nullable(),
  unitLabel: string2().min(1).max(60),
  couponSteps: string2().min(1).max(400),
  validFrom: string2().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  validThrough: string2().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  sourceName: string2().min(1).max(120),
  sourceUrl: string2().url(),
  caveat: string2().max(400).nullable()
});
async function stripeRequest(secretKey, path, params) {
  const isGet = params === undefined;
  const url = isGet ? `https://api.stripe.com/v1/${path}` : `https://api.stripe.com/v1/${path}`;
  const response = await fetch(url, {
    method: isGet ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...isGet ? {} : { "Content-Type": "application/x-www-form-urlencoded" }
    },
    ...isGet ? {} : { body: new URLSearchParams(params).toString() }
  });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}
async function stripeGet(secretKey, path, query) {
  const qs = new URLSearchParams(query).toString();
  const response = await fetch(`https://api.stripe.com/v1/${path}?${qs}`, {
    headers: { Authorization: `Bearer ${secretKey}` }
  });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}
function stripeErrorMessage(body) {
  const error = body.error;
  return error?.message ?? "Stripe did not accept that request.";
}
async function saveSubscriptionRow(ctx, values) {
  const db = ctx.db();
  await db.insert(subscriptions).values({ id: 1, ...values }).onConflictDoUpdate({
    target: subscriptions.id,
    set: { ...values, updatedAt: new Date }
  });
}
var billingResponse = object({
  configured: boolean2(),
  publishableKey: string2().nullable(),
  paymentLinkUrl: string2().nullable(),
  secretKeySet: boolean2(),
  subscription: object({
    status: string2(),
    email: string2().nullable(),
    currentPeriodEnd: string2().nullable(),
    cancelAtPeriodEnd: boolean2()
  }).nullable()
});
var Actions = {
  getDashboard: defineAction({
    request: object({}),
    response: object({
      region: _enum(regionValues),
      regions: array(object({ id: _enum(regionValues), label: string2() })),
      stores: array(object({ id: _enum(retailerValues), name: string2(), short: string2(), regions: array(_enum(regionValues)), orderUrl: string2(), couponUrl: string2().nullable(), delivery: string2(), rule: string2(), membership: string2(), policyStatus: _enum(["verified", "confirm_local"]) })),
      catalog: array(object({ id: string2(), category: string2(), brand: string2(), name: string2(), unit: string2(), imageSlug: string2(), imageAlt: string2(), keywords: string2(), prices: array(object({ retailer: _enum(retailerValues), storeName: string2(), amount: number2(), updatedAt: string2(), priceType: _enum(["sale", "planning_estimate"]), sourceLabel: string2(), validThrough: string2().nullable() })) })),
      deals: array(object({ id: number2(), retailer: _enum(retailerValues), title: string2(), detail: string2(), priceLabel: string2(), finalPrice: number2().nullable(), unitLabel: string2(), couponSteps: string2(), validFrom: string2().nullable(), validThrough: string2().nullable(), sourceName: string2(), sourceUrl: string2(), confidence: _enum(["verified_live", "indexed"]), caveat: string2().nullable(), refreshedAt: string2() })),
      items: array(object({ id: number2(), name: string2(), quantity: number2(), unit: string2(), checked: boolean2(), sourceDealId: number2().nullable(), quotes: array(object({ retailer: _enum(retailerValues), unitPrice: number2(), savings: number2(), sourceLabel: string2(), updatedAt: string2() })) })),
      comparisons: array(object({ retailer: _enum(retailerValues), storeName: string2(), subtotal: number2(), savings: number2(), delivery: number2(), deliveryUpdatedAt: string2().nullable(), total: number2(), missingCount: number2(), complete: boolean2(), priceUpdatedFrom: string2().nullable(), priceUpdatedThrough: string2().nullable() })),
      splitComparison: object({ stores: tuple([_enum(retailerValues), _enum(retailerValues)]), storeNames: tuple([string2(), string2()]), total: number2(), savings: number2(), priceUpdatedFrom: string2(), priceUpdatedThrough: string2(), lines: array(object({ item: string2(), retailer: _enum(retailerValues), storeName: string2(), total: number2(), updatedAt: string2() })) }).nullable(),
      lastRefresh: string2().nullable(),
      plan: object({ tier: _enum(["free", "saver"]), status: string2(), currentPeriodEnd: string2().nullable(), billingConfigured: boolean2() }),
      alerts: array(object({ dealId: number2(), retailer: _enum(retailerValues), title: string2(), priceLabel: string2(), validThrough: string2().nullable(), refreshedAt: string2(), isNew: boolean2() })),
      feedChecks: array(object({ retailer: _enum(retailerValues), checkedAt: string2(), currentDeals: number2(), note: string2().nullable() }))
    }),
    async handler(ctx) {
      const db = ctx.db();
      const dealRows = await db.select().from(deals).orderBy(desc(deals.refreshedAt), asc(deals.retailer));
      const itemRows = await db.select().from(basketItems).orderBy(asc(basketItems.createdAt));
      const quoteRows = await db.select().from(quotes);
      const feeRows = await db.select().from(deliveryFees);
      const settingRows = await db.select().from(userSettings).limit(1);
      const region = settingRows[0]?.region ?? "texas";
      const plan = await loadPlan(ctx);
      const eligibleStores = stores.filter((store) => region === "national" ? store.regions.includes("national") : store.regions.includes(region) || store.regions.includes("national"));
      const items = itemRows.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        checked: item.checked,
        sourceDealId: item.sourceDealId,
        quotes: quoteRows.filter((quote) => quote.basketItemId === item.id).map((quote) => ({ retailer: quote.retailer, unitPrice: quote.unitPrice, savings: quote.savings, sourceLabel: quote.sourceLabel, updatedAt: quote.updatedAt.toISOString() }))
      }));
      const activeItems = items.filter((item) => !item.checked);
      const comparisons = eligibleStores.map((store) => {
        let subtotal = 0;
        let savings = 0;
        let missingCount = 0;
        const usedDates = [];
        for (const item of activeItems) {
          const quote = item.quotes.find((candidate) => candidate.retailer === store.id);
          if (!quote) {
            missingCount += 1;
            continue;
          }
          subtotal += quote.unitPrice * item.quantity;
          savings += quote.savings * item.quantity;
          usedDates.push(quote.updatedAt);
        }
        const deliveryRow = feeRows.find((fee) => fee.retailer === store.id);
        const delivery = deliveryRow?.amount ?? 0;
        if (deliveryRow)
          usedDates.push(deliveryRow.updatedAt.toISOString());
        usedDates.sort();
        return { retailer: store.id, storeName: store.name, subtotal, savings, delivery, deliveryUpdatedAt: deliveryRow?.updatedAt.toISOString() ?? null, total: subtotal - savings + delivery, missingCount, complete: activeItems.length > 0 && missingCount === 0, priceUpdatedFrom: usedDates[0] ?? null, priceUpdatedThrough: usedDates.at(-1) ?? null };
      }).sort((a, b) => Number(b.complete) - Number(a.complete) || a.total - b.total);
      let splitComparison = null;
      for (let i = 0;i < eligibleStores.length; i += 1) {
        const first = eligibleStores[i];
        if (!first)
          continue;
        for (let j = i + 1;j < eligibleStores.length; j += 1) {
          const second = eligibleStores[j];
          if (!second)
            continue;
          let itemTotal = 0;
          let savings = 0;
          let complete = activeItems.length > 0;
          const used = new Set;
          const lines = [];
          for (const item of activeItems) {
            const qa = item.quotes.find((quote) => quote.retailer === first.id);
            const qb = item.quotes.find((quote) => quote.retailer === second.id);
            if (!qa && !qb) {
              complete = false;
              break;
            }
            const chosenStore = !qb || qa && qa.unitPrice - qa.savings <= qb.unitPrice - qb.savings ? first : second;
            const chosenQuote = chosenStore.id === first.id ? qa : qb;
            if (!chosenQuote) {
              complete = false;
              break;
            }
            const lineTotal = (chosenQuote.unitPrice - chosenQuote.savings) * item.quantity;
            itemTotal += lineTotal;
            savings += chosenQuote.savings * item.quantity;
            used.add(chosenStore.id);
            lines.push({ item: item.name, retailer: chosenStore.id, storeName: chosenStore.name, total: lineTotal, updatedAt: chosenQuote.updatedAt });
          }
          if (!complete || used.size < 2)
            continue;
          const deliveryRows = [...used].map((id) => feeRows.find((fee) => fee.retailer === id)).filter((row) => Boolean(row));
          const delivery = deliveryRows.reduce((sum, row) => sum + row.amount, 0);
          const total = itemTotal + delivery;
          const priceDates = [...lines.map((line) => line.updatedAt), ...deliveryRows.map((row) => row.updatedAt.toISOString())].sort();
          const priceUpdatedFrom = priceDates[0];
          const priceUpdatedThrough = priceDates.at(-1);
          if (!priceUpdatedFrom || !priceUpdatedThrough)
            continue;
          if (!splitComparison || total < splitComparison.total)
            splitComparison = { stores: [first.id, second.id], storeNames: [first.name, second.name], total, savings, priceUpdatedFrom, priceUpdatedThrough, lines };
        }
      }
      const lastRefresh = dealRows.length > 0 ? new Date(Math.max(...dealRows.map((deal) => deal.refreshedAt.getTime()))).toISOString() : null;
      const checkRows = await db.select().from(dealFeedChecks).orderBy(desc(dealFeedChecks.checkedAt));
      const feedChecks = eligibleStores.flatMap((store) => {
        const latest = checkRows.find((row) => row.retailer === store.id);
        return latest ? [{ retailer: store.id, checkedAt: latest.checkedAt.toISOString(), currentDeals: latest.currentDeals, note: latest.note }] : [];
      });
      let alerts = [];
      if (plan.tier === "saver") {
        const seenRows = await db.select().from(alertSeen);
        const seenIds = new Set(seenRows.map((row) => row.dealId));
        const basketNames = activeItems.map((item) => item.name);
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        alerts = dealRows.filter((deal) => eligibleStores.some((store) => store.id === deal.retailer)).filter((deal) => isDealCurrent(deal)).filter((deal) => dealMatchesBasketWords(deal, basketNames) || catalog.some((product) => basketNames.includes(product.name) && dealAppliesToProduct(deal, product))).slice(0, 12).map((deal) => ({ dealId: deal.id, retailer: deal.retailer, title: deal.title, priceLabel: deal.priceLabel, validThrough: deal.validThrough, refreshedAt: deal.refreshedAt.toISOString(), isNew: deal.refreshedAt.getTime() >= sevenDaysAgo && !seenIds.has(deal.id) }));
      }
      return {
        region,
        regions,
        stores: eligibleStores,
        catalog: catalog.map((product) => ({
          id: product.id,
          category: product.category,
          brand: product.brand,
          name: product.name,
          unit: product.unit,
          imageSlug: product.imageSlug,
          imageAlt: product.imageAlt,
          keywords: product.keywords,
          prices: eligibleStores.reduce((prices, store) => {
            const sale = plan.tier === "saver" ? dealRows.find((deal) => deal.retailer === store.id && deal.finalPrice !== null && isDealCurrent(deal) && dealAppliesToProduct(deal, product)) : undefined;
            if (sale?.finalPrice !== null && sale?.finalPrice !== undefined)
              prices.push({ retailer: store.id, storeName: store.name, amount: sale.finalPrice, updatedAt: sale.refreshedAt.toISOString(), priceType: "sale", sourceLabel: sale.sourceName, validThrough: sale.validThrough });
            else if (product.basePrice !== null && product.estimateUpdatedAt)
              prices.push({ retailer: store.id, storeName: store.name, amount: priceFor(product.basePrice, store.id), updatedAt: product.estimateUpdatedAt, priceType: "planning_estimate", sourceLabel: "Planning estimate", validThrough: null });
            return prices;
          }, [])
        })),
        deals: dealRows.filter((deal) => eligibleStores.some((store) => store.id === deal.retailer)).map((deal) => ({ ...deal, refreshedAt: deal.refreshedAt.toISOString() })),
        items,
        comparisons: plan.tier === "saver" ? comparisons : [],
        splitComparison: plan.tier === "saver" ? splitComparison : null,
        lastRefresh,
        plan,
        alerts,
        feedChecks
      };
    }
  }),
  setRegion: defineAction({
    request: object({ region: _enum(regionValues) }),
    response: object({ ok: literal(true) }),
    async handler(ctx, args) {
      const db = ctx.db();
      await db.insert(userSettings).values({ id: 1, region: args.region }).onConflictDoUpdate({ target: userSettings.id, set: { region: args.region, updatedAt: new Date } });
      ctx.invalidateQueries();
      return { ok: true };
    }
  }),
  addCatalogItem: defineAction({
    request: object({ catalogId: string2().min(1), quantity: number2().int().min(1).max(99).default(1) }),
    response: object({ id: number2() }),
    async handler(ctx, args) {
      const product = catalog.find((candidate) => candidate.id === args.catalogId);
      if (!product)
        throw new Error("Catalog item unavailable");
      const db = ctx.db();
      const rows = await db.insert(basketItems).values({ name: product.name, quantity: args.quantity, unit: product.unit }).returning({ id: basketItems.id });
      const item = rows[0];
      if (!item)
        throw new Error("Catalog item could not be added");
      const plan = await loadPlan(ctx);
      const dealRows = await db.select().from(deals);
      for (const retailer of retailerValues) {
        const sale = plan.tier === "saver" ? dealRows.find((deal) => deal.retailer === retailer && deal.finalPrice !== null && isDealCurrent(deal) && dealAppliesToProduct(deal, product)) : undefined;
        if (sale?.finalPrice !== null && sale?.finalPrice !== undefined) {
          await db.insert(quotes).values({ basketItemId: item.id, retailer, unitPrice: sale.finalPrice, savings: 0, sourceLabel: `${sale.sourceName} sale \xB7 updated ${sale.refreshedAt.toISOString().slice(0, 10)}`, updatedAt: sale.refreshedAt });
        } else if (product.basePrice !== null && product.estimateUpdatedAt) {
          await db.insert(quotes).values({ basketItemId: item.id, retailer, unitPrice: priceFor(product.basePrice, retailer), savings: 0, sourceLabel: `Planning estimate \xB7 updated ${product.estimateUpdatedAt.slice(0, 10)}`, updatedAt: new Date(product.estimateUpdatedAt) });
        }
      }
      ctx.invalidateQueries();
      return { id: item.id };
    }
  }),
  addScannedItem: defineAction({
    request: object({ upc: string2().regex(/^\d{8,14}$/) }),
    response: scanResponse,
    async handler(ctx, args) {
      const product = catalog.find((candidate) => candidate.upcs?.includes(args.upc));
      if (product?.basePrice !== null && product?.basePrice !== undefined) {
        const id = await insertPricedBasketItem(ctx, {
          name: product.name,
          unit: product.unit,
          prices: (retailer) => priceFor(product.basePrice ?? 0, retailer),
          sourceLabel: `Catalog barcode planning estimate \xB7 updated ${(product.estimateUpdatedAt ?? new Date().toISOString()).slice(0, 10)}`
        });
        return { status: "added_catalog", upc: args.upc, name: product.name, id };
      }
      const db = ctx.db();
      const rememberedRows = await db.select().from(scannedProducts).where(eq(scannedProducts.upc, args.upc)).limit(1);
      const remembered = rememberedRows[0];
      if (!remembered)
        return { status: "unknown", upc: args.upc, name: null, id: null };
      const id = await insertPricedBasketItem(ctx, {
        name: remembered.name,
        unit: remembered.unit,
        prices: () => remembered.basePrice,
        sourceLabel: "Saved barcode estimate"
      });
      return { status: "added_saved", upc: args.upc, name: remembered.name, id };
    }
  }),
  rememberScannedProduct: defineAction({
    request: object({
      upc: string2().regex(/^\d{8,14}$/),
      name: string2().trim().min(2).max(100),
      unit: string2().trim().min(1).max(30).default("item"),
      price: number2().nonnegative().max(1e4)
    }),
    response: object({ id: number2(), name: string2() }),
    async handler(ctx, args) {
      const db = ctx.db();
      await db.insert(scannedProducts).values({ upc: args.upc, name: args.name, unit: args.unit, basePrice: args.price }).onConflictDoUpdate({
        target: scannedProducts.upc,
        set: { name: args.name, unit: args.unit, basePrice: args.price, updatedAt: new Date }
      });
      const id = await insertPricedBasketItem(ctx, {
        name: args.name,
        unit: args.unit,
        prices: () => args.price,
        sourceLabel: "Scanned shopper estimate"
      });
      return { id, name: args.name };
    }
  }),
  addBasketItem: defineAction({
    request: object({ name: string2().trim().min(2).max(100), quantity: number2().int().min(1).max(99), unit: string2().trim().min(1).max(30) }),
    response: object({ id: number2() }),
    async handler(ctx, args) {
      const db = ctx.db();
      const rows = await db.insert(basketItems).values({ name: args.name, quantity: args.quantity, unit: args.unit }).returning({ id: basketItems.id });
      const row = rows[0];
      if (!row)
        throw new Error("Basket item could not be created");
      ctx.invalidateQueries();
      return { id: row.id };
    }
  }),
  addDealToBasket: defineAction({
    request: object({ dealId: number2().int().positive() }),
    response: object({ id: number2() }),
    async handler(ctx, args) {
      const db = ctx.db();
      const found = await db.select().from(deals).where(eq(deals.id, args.dealId)).limit(1);
      const deal = found[0];
      if (!deal)
        throw new Error("That deal is no longer available");
      const rows = await db.insert(basketItems).values({ name: deal.title, quantity: 1, unit: deal.unitLabel, sourceDealId: deal.id }).returning({ id: basketItems.id });
      const item = rows[0];
      if (!item)
        throw new Error("Deal could not be added");
      if (deal.finalPrice !== null) {
        const savings = knownDealSavings[deal.externalKey] ?? 0;
        await db.insert(quotes).values({ basketItemId: item.id, retailer: deal.retailer, unitPrice: deal.finalPrice + savings, savings, sourceLabel: `${deal.sourceName} \xB7 matched deal` });
      }
      ctx.invalidateQueries();
      return { id: item.id };
    }
  }),
  updateBasketItem: defineAction({
    request: object({ id: number2().int().positive(), quantity: number2().int().min(1).max(99).optional(), checked: boolean2().optional() }),
    response: object({ ok: literal(true) }),
    async handler(ctx, args) {
      const patch = {};
      if (args.quantity !== undefined)
        patch.quantity = args.quantity;
      if (args.checked !== undefined)
        patch.checked = args.checked;
      await ctx.db().update(basketItems).set(patch).where(eq(basketItems.id, args.id));
      ctx.invalidateQueries();
      return { ok: true };
    }
  }),
  removeBasketItem: defineAction({
    request: object({ id: number2().int().positive() }),
    response: object({ ok: literal(true) }),
    async handler(ctx, args) {
      await ctx.db().delete(basketItems).where(eq(basketItems.id, args.id));
      ctx.invalidateQueries();
      return { ok: true };
    }
  }),
  setQuote: defineAction({
    request: object({ basketItemId: number2().int().positive(), retailer: _enum(retailerValues), unitPrice: number2().nonnegative().max(1e4), savings: number2().nonnegative().max(1e4).default(0) }),
    response: object({ ok: literal(true) }),
    async handler(ctx, args) {
      const db = ctx.db();
      const existing = await db.select().from(quotes).where(and(eq(quotes.basketItemId, args.basketItemId), eq(quotes.retailer, args.retailer))).limit(1);
      if (existing[0]) {
        await db.update(quotes).set({ unitPrice: args.unitPrice, savings: args.savings, sourceLabel: "Shopper-confirmed", updatedAt: new Date }).where(eq(quotes.id, existing[0].id));
      } else {
        await db.insert(quotes).values({ basketItemId: args.basketItemId, retailer: args.retailer, unitPrice: args.unitPrice, savings: args.savings, sourceLabel: "Shopper-confirmed" });
      }
      ctx.invalidateQueries();
      return { ok: true };
    }
  }),
  setDeliveryFee: defineAction({
    request: object({ retailer: _enum(retailerValues), amount: number2().nonnegative().max(500) }),
    response: object({ ok: literal(true) }),
    async handler(ctx, args) {
      const db = ctx.db();
      await db.insert(deliveryFees).values({ retailer: args.retailer, amount: args.amount }).onConflictDoUpdate({ target: deliveryFees.retailer, set: { amount: args.amount, updatedAt: new Date } });
      ctx.invalidateQueries();
      return { ok: true };
    }
  }),
  chooseCheckout: defineAction({
    request: object({ retailer: _enum(retailerValues) }),
    response: object({ locked: boolean2(), orderUrl: string2().nullable(), storeName: string2(), lines: array(string2()), quotedTotal: number2().nullable(), priceUpdatedFrom: string2().nullable(), priceUpdatedThrough: string2().nullable() }),
    async handler(ctx, args) {
      const plan = await loadPlan(ctx);
      const requestedStore = stores.find((candidate) => candidate.id === args.retailer);
      if (plan.tier !== "saver") {
        return { locked: true, orderUrl: null, storeName: requestedStore?.name ?? "Store", lines: [], quotedTotal: null, priceUpdatedFrom: null, priceUpdatedThrough: null };
      }
      const db = ctx.db();
      const itemRows = await db.select().from(basketItems).where(eq(basketItems.checked, false)).orderBy(asc(basketItems.createdAt));
      const quoteRows = await db.select().from(quotes).where(eq(quotes.retailer, args.retailer));
      const feeRows = await db.select().from(deliveryFees).where(eq(deliveryFees.retailer, args.retailer)).limit(1);
      let quotedTotal = 0;
      for (const item of itemRows) {
        const quote = quoteRows.find((candidate) => candidate.basketItemId === item.id);
        if (!quote) {
          quotedTotal = null;
          break;
        }
        if (quotedTotal !== null)
          quotedTotal += (quote.unitPrice - quote.savings) * item.quantity;
      }
      if (quotedTotal !== null)
        quotedTotal += feeRows[0]?.amount ?? 0;
      await db.insert(checkoutSelections).values({ retailer: args.retailer, itemCount: itemRows.length, quotedTotal });
      const store = stores.find((candidate) => candidate.id === args.retailer) ?? stores[0];
      if (!store)
        throw new Error("Store unavailable");
      const priceDates = [...quoteRows.map((quote) => quote.updatedAt.toISOString()), ...feeRows[0] ? [feeRows[0].updatedAt.toISOString()] : []].sort();
      return { locked: false, orderUrl: store.orderUrl, storeName: store.name, lines: itemRows.map((item) => {
        const quote = quoteRows.find((candidate) => candidate.basketItemId === item.id);
        if (!quote)
          return `${item.quantity} ${item.unit} \u2014 ${item.name} \xB7 price missing`;
        const before = quote.unitPrice * item.quantity;
        const saved = quote.savings * item.quantity;
        return `${item.quantity} ${item.unit} \u2014 ${item.name} \xB7 ${before.toFixed(2)} \u2212 ${saved.toFixed(2)} coupons = ${(before - saved).toFixed(2)} \xB7 updated ${quote.updatedAt.toISOString().slice(0, 10)}`;
      }), quotedTotal, priceUpdatedFrom: priceDates[0] ?? null, priceUpdatedThrough: priceDates.at(-1) ?? null };
    }
  }),
  refreshDeals: defineAction({
    request: object({ includeBaseline: boolean2().default(false) }),
    response: object({ ok: literal(true), added: number2(), checkedSources: number2(), storesChecked: number2(), storesWithDeals: number2(), message: string2() }),
    async handler(ctx, args) {
      const db = ctx.db();
      let added = 0;
      let checkedSources = 0;
      const now = new Date;
      args.includeBaseline;
      for (const deal of baselineDeals) {
        await db.insert(deals).values({ ...deal, refreshedAt: now }).onConflictDoUpdate({ target: deals.externalKey, set: { ...deal, refreshedAt: now } });
        added += 1;
      }
      const existingRows = await db.select().from(deals);
      const knownTitles = new Set(existingRows.map((row) => `${row.retailer}|${normalizedProductText(row.title)}`));
      let storesWithDeals = 0;
      const emptyStoreNames = [];
      for (const store of stores) {
        let note = null;
        try {
          const query = `${store.name} weekly deals digital coupons coupon matchups this week October 2026 Krazy Coupon Lady Hip2Save`;
          const search = await ctx.tool.web_search(query);
          const candidates = search.content.results.filter((result) => result.url && result.snippet).slice(0, 8);
          checkedSources += candidates.length;
          if (candidates.length === 0) {
            note = "No couponing sources returned results for this store in this week's check \u2014 nothing was added, and nothing was invented to fill the gap.";
          } else {
            const allowedUrls = new Set(candidates.map((candidate) => candidate.url).filter((url) => typeof url === "string"));
            const extracted = await ctx.inference.complete(`Extract current grocery or household deals for ${store.name} ONLY (retailer id "${store.id}") from these web search results. Aim for up to 10 deals \u2014 the strongest coupon stacks, freebies, and sale prices with explicit prices or explicit coupon amounts. For every deal include: the exact items and quantities required; every coupon needed (digital, paper, store, or app) and where to clip or find it; the sale price and the final out-of-pocket price \u2014 finalPrice must be null when the source does not state a shelf or sale price, never compute one yourself; explicit start and end dates only when the source states them (null otherwise); and a caveat carrying every uncertainty the source carries (regional variation, account-only offers, while supplies last, rebates paid later). Preserve each deal's exact source URL from the results below. Do not include deals for any other retailer, and do not invent prices, dates, or coupons.

${candidates.map((candidate) => `TITLE: ${candidate.title}
URL: ${candidate.url ?? ""}
SOURCE: ${candidate.source ?? ""}
SNIPPET: ${candidate.snippet ?? ""}`).join(`

`)}`, { schema: object({ deals: array(dealShape).max(10) }) });
            for (const deal of extracted.deals) {
              if (deal.retailer !== store.id)
                continue;
              if (!allowedUrls.has(deal.sourceUrl))
                continue;
              const titleKey = `${store.id}|${normalizedProductText(deal.title)}`;
              if (knownTitles.has(titleKey))
                continue;
              knownTitles.add(titleKey);
              const externalKey = `search-${deal.retailer}-${deal.sourceUrl}-${deal.title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 180);
              await db.insert(deals).values({ ...deal, externalKey, confidence: "indexed", refreshedAt: now }).onConflictDoUpdate({ target: deals.externalKey, set: { ...deal, confidence: "indexed", refreshedAt: now } });
              added += 1;
            }
          }
        } catch {
          note = "This week's source check for this store could not be completed \u2014 the previously sourced offers were kept unchanged and nothing was invented.";
        }
        const storeRows = await db.select().from(deals).where(eq(deals.retailer, store.id));
        const currentCount = storeRows.filter((deal) => isDealCurrent(deal)).length;
        if (currentCount > 0)
          storesWithDeals += 1;
        else
          emptyStoreNames.push(store.name);
        if (note === null && currentCount === 0) {
          note = "No current deals were found in this week's couponing sources for this store \u2014 recorded as found, not filled in. Expired offers stay visible below, labeled expired; check the store's own weekly ad for anything the coupon blogs have not covered yet.";
        }
        await db.insert(dealFeedChecks).values({ retailer: store.id, checkedAt: now, currentDeals: currentCount, note });
      }
      const refreshedDeals = await db.select().from(deals);
      const basketRows = await db.select().from(basketItems);
      const quoteRows = await db.select().from(quotes);
      const refreshPlan = await loadPlan(ctx);
      for (const deal of refreshPlan.tier === "saver" ? refreshedDeals : []) {
        if (deal.finalPrice === null || !isDealCurrent(deal))
          continue;
        const matchedProducts = catalog.filter((product) => dealAppliesToProduct(deal, product));
        for (const product of matchedProducts) {
          for (const basketItem of basketRows.filter((item) => item.name === product.name)) {
            const existing = quoteRows.find((quote) => quote.basketItemId === basketItem.id && quote.retailer === deal.retailer);
            const patch = { unitPrice: deal.finalPrice, savings: 0, sourceLabel: `${deal.sourceName} sale \xB7 updated ${deal.refreshedAt.toISOString().slice(0, 10)}`, updatedAt: deal.refreshedAt };
            if (existing)
              await db.update(quotes).set(patch).where(eq(quotes.id, existing.id));
            else
              await db.insert(quotes).values({ basketItemId: basketItem.id, retailer: deal.retailer, ...patch });
          }
        }
      }
      ctx.invalidateQueries();
      const message = emptyStoreNames.length === 0 ? `Weekly haul complete: all ${stores.length} stores checked and every store has current sourced deals (${refreshedDeals.length} offers in the feed).` : `Weekly haul complete: ${stores.length} stores checked; ${storesWithDeals} have current sourced deals. No current deals found for ${emptyStoreNames.join(", ")} \u2014 recorded in the feed, not invented. ${refreshedDeals.length} offers are in the feed, expired ones labeled.`;
      return { ok: true, added, checkedSources, storesChecked: stores.length, storesWithDeals, message };
    }
  }),
  getBilling: defineAction({
    request: object({}),
    response: billingResponse,
    async handler(ctx) {
      const db = ctx.db();
      const billingRows = await db.select().from(billingSettings).limit(1);
      const billing = billingRows[0];
      const subRows = await db.select().from(subscriptions).limit(1);
      const sub = subRows[0];
      return {
        configured: Boolean(billing?.paymentLinkUrl && billing?.stripeSecretKey),
        publishableKey: billing?.stripePublishableKey ?? null,
        paymentLinkUrl: billing?.paymentLinkUrl ?? null,
        secretKeySet: Boolean(billing?.stripeSecretKey),
        subscription: sub ? { status: sub.status, email: sub.email, currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null, cancelAtPeriodEnd: sub.cancelAtPeriodEnd } : null
      };
    }
  }),
  saveStripeSettings: defineAction({
    request: object({
      publishableKey: string2().max(200).optional(),
      paymentLinkUrl: string2().max(300).optional(),
      secretKey: string2().max(300).optional()
    }),
    response: object({ ok: literal(true), configured: boolean2() }),
    async handler(ctx, args) {
      const db = ctx.db();
      const existingRows = await db.select().from(billingSettings).limit(1);
      const existing = existingRows[0];
      const publishableKey = args.publishableKey !== undefined ? args.publishableKey.trim() || null : existing?.stripePublishableKey ?? null;
      const paymentLinkUrl = args.paymentLinkUrl !== undefined ? args.paymentLinkUrl.trim() || null : existing?.paymentLinkUrl ?? null;
      const secretKey = args.secretKey !== undefined ? args.secretKey.trim() || null : existing?.stripeSecretKey ?? null;
      if (paymentLinkUrl && !paymentLinkUrl.startsWith("https://"))
        throw new Error("The payment link must be a full https:// URL from your Stripe dashboard.");
      await db.insert(billingSettings).values({ id: 1, stripePublishableKey: publishableKey, stripeSecretKey: secretKey, paymentLinkUrl }).onConflictDoUpdate({
        target: billingSettings.id,
        set: { stripePublishableKey: publishableKey, stripeSecretKey: secretKey, paymentLinkUrl, updatedAt: new Date }
      });
      ctx.invalidateQueries();
      return { ok: true, configured: Boolean(paymentLinkUrl && secretKey) };
    }
  }),
  verifySubscription: defineAction({
    request: object({ email: string2().email().max(200) }),
    response: object({ status: _enum(["active", "trialing", "not_found", "not_configured", "error"]), message: string2(), currentPeriodEnd: string2().nullable() }),
    async handler(ctx, args) {
      const db = ctx.db();
      const billingRows = await db.select().from(billingSettings).limit(1);
      const billing = billingRows[0];
      if (!billing?.stripeSecretKey)
        return { status: "not_configured", message: "Stripe is not connected yet. The app owner needs to add their Stripe keys in the plan setup first.", currentPeriodEnd: null };
      const customers = await stripeGet(billing.stripeSecretKey, "customers", { email: args.email, limit: "5" });
      if (!customers.ok)
        return { status: "error", message: `Stripe lookup failed: ${stripeErrorMessage(customers.body)}`, currentPeriodEnd: null };
      const customerList = customers.body.data ?? [];
      for (const customer of customerList) {
        const subs = await stripeGet(billing.stripeSecretKey, "subscriptions", { customer: customer.id, status: "all", limit: "10" });
        if (!subs.ok)
          continue;
        const subList = subs.body.data ?? [];
        const live = subList.find((sub) => sub.status === "active" || sub.status === "trialing");
        if (live) {
          const periodEnd = live.current_period_end ? new Date(live.current_period_end * 1000) : null;
          await saveSubscriptionRow(ctx, {
            email: args.email,
            status: live.status === "trialing" ? "trialing" : "active",
            stripeCustomerId: customer.id,
            stripeSubscriptionId: live.id,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: Boolean(live.cancel_at_period_end)
          });
          ctx.invalidateQueries();
          return { status: live.status === "trialing" ? "trialing" : "active", message: "Subscription confirmed with Stripe. Checkout Saver is on.", currentPeriodEnd: periodEnd?.toISOString() ?? null };
        }
      }
      return { status: "not_found", message: "No active Stripe subscription was found for that email. Subscribe with the payment link first, using the same email.", currentPeriodEnd: null };
    }
  }),
  refreshSubscriptionStatus: defineAction({
    request: object({}),
    response: object({ status: string2(), message: string2(), currentPeriodEnd: string2().nullable() }),
    async handler(ctx) {
      const db = ctx.db();
      const billingRows = await db.select().from(billingSettings).limit(1);
      const billing = billingRows[0];
      const subRows = await db.select().from(subscriptions).limit(1);
      const sub = subRows[0];
      if (!billing?.stripeSecretKey || !sub?.stripeSubscriptionId) {
        return { status: sub?.status ?? "none", message: "Nothing to refresh yet \u2014 no Stripe subscription is linked.", currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null };
      }
      const result = await stripeGet(billing.stripeSecretKey, `subscriptions/${sub.stripeSubscriptionId}`, {});
      if (!result.ok)
        return { status: sub.status, message: `Stripe lookup failed: ${stripeErrorMessage(result.body)}`, currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null };
      const live = result.body;
      const known = ["active", "trialing", "past_due", "canceled", "incomplete"];
      const status = known.find((candidate) => candidate === live.status) ?? "incomplete";
      const periodEnd = live.current_period_end ? new Date(live.current_period_end * 1000) : null;
      await saveSubscriptionRow(ctx, {
        email: sub.email,
        status,
        stripeCustomerId: sub.stripeCustomerId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: Boolean(live.cancel_at_period_end)
      });
      ctx.invalidateQueries();
      return { status, message: "Subscription status refreshed from Stripe.", currentPeriodEnd: periodEnd?.toISOString() ?? null };
    }
  }),
  cancelSubscription: defineAction({
    request: object({}),
    response: object({ ok: boolean2(), message: string2() }),
    async handler(ctx) {
      const db = ctx.db();
      const billingRows = await db.select().from(billingSettings).limit(1);
      const billing = billingRows[0];
      const subRows = await db.select().from(subscriptions).limit(1);
      const sub = subRows[0];
      if (!billing?.stripeSecretKey || !sub?.stripeSubscriptionId)
        return { ok: false, message: "No linked Stripe subscription to cancel." };
      const result = await stripeRequest(billing.stripeSecretKey, `subscriptions/${sub.stripeSubscriptionId}`, { cancel_at_period_end: "true" });
      if (!result.ok)
        return { ok: false, message: `Stripe did not accept the cancellation: ${stripeErrorMessage(result.body)}` };
      await saveSubscriptionRow(ctx, {
        email: sub.email,
        status: sub.status,
        stripeCustomerId: sub.stripeCustomerId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: true
      });
      ctx.invalidateQueries();
      return { ok: true, message: "Cancellation scheduled in Stripe. Saver stays on until the end of the current billing period." };
    }
  }),
  markAlertSeen: defineAction({
    request: object({ dealId: number2().int().positive() }),
    response: object({ ok: literal(true) }),
    async handler(ctx, args) {
      const db = ctx.db();
      await db.insert(alertSeen).values({ dealId: args.dealId }).onConflictDoNothing();
      ctx.invalidateQueries();
      return { ok: true };
    }
  })
};
export {
  Actions
};
