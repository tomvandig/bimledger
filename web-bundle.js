(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/spark-md5/spark-md5.js
  var require_spark_md5 = __commonJS({
    "node_modules/spark-md5/spark-md5.js"(exports, module) {
      (function(factory) {
        if (typeof exports === "object") {
          module.exports = factory();
        } else if (typeof define === "function" && define.amd) {
          define(factory);
        } else {
          var glob;
          try {
            glob = window;
          } catch (e) {
            glob = self;
          }
          glob.SparkMD5 = factory();
        }
      })(function(undefined) {
        "use strict";
        var add32 = function(a, b) {
          return a + b & 4294967295;
        }, hex_chr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
        function cmn(q, a, b, x, s, t) {
          a = add32(add32(a, q), add32(x, t));
          return add32(a << s | a >>> 32 - s, b);
        }
        function md5cycle(x, k) {
          var a = x[0], b = x[1], c = x[2], d = x[3];
          a += (b & c | ~b & d) + k[0] - 680876936 | 0;
          a = (a << 7 | a >>> 25) + b | 0;
          d += (a & b | ~a & c) + k[1] - 389564586 | 0;
          d = (d << 12 | d >>> 20) + a | 0;
          c += (d & a | ~d & b) + k[2] + 606105819 | 0;
          c = (c << 17 | c >>> 15) + d | 0;
          b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
          b = (b << 22 | b >>> 10) + c | 0;
          a += (b & c | ~b & d) + k[4] - 176418897 | 0;
          a = (a << 7 | a >>> 25) + b | 0;
          d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
          d = (d << 12 | d >>> 20) + a | 0;
          c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
          c = (c << 17 | c >>> 15) + d | 0;
          b += (c & d | ~c & a) + k[7] - 45705983 | 0;
          b = (b << 22 | b >>> 10) + c | 0;
          a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
          a = (a << 7 | a >>> 25) + b | 0;
          d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
          d = (d << 12 | d >>> 20) + a | 0;
          c += (d & a | ~d & b) + k[10] - 42063 | 0;
          c = (c << 17 | c >>> 15) + d | 0;
          b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
          b = (b << 22 | b >>> 10) + c | 0;
          a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
          a = (a << 7 | a >>> 25) + b | 0;
          d += (a & b | ~a & c) + k[13] - 40341101 | 0;
          d = (d << 12 | d >>> 20) + a | 0;
          c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
          c = (c << 17 | c >>> 15) + d | 0;
          b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
          b = (b << 22 | b >>> 10) + c | 0;
          a += (b & d | c & ~d) + k[1] - 165796510 | 0;
          a = (a << 5 | a >>> 27) + b | 0;
          d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
          d = (d << 9 | d >>> 23) + a | 0;
          c += (d & b | a & ~b) + k[11] + 643717713 | 0;
          c = (c << 14 | c >>> 18) + d | 0;
          b += (c & a | d & ~a) + k[0] - 373897302 | 0;
          b = (b << 20 | b >>> 12) + c | 0;
          a += (b & d | c & ~d) + k[5] - 701558691 | 0;
          a = (a << 5 | a >>> 27) + b | 0;
          d += (a & c | b & ~c) + k[10] + 38016083 | 0;
          d = (d << 9 | d >>> 23) + a | 0;
          c += (d & b | a & ~b) + k[15] - 660478335 | 0;
          c = (c << 14 | c >>> 18) + d | 0;
          b += (c & a | d & ~a) + k[4] - 405537848 | 0;
          b = (b << 20 | b >>> 12) + c | 0;
          a += (b & d | c & ~d) + k[9] + 568446438 | 0;
          a = (a << 5 | a >>> 27) + b | 0;
          d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
          d = (d << 9 | d >>> 23) + a | 0;
          c += (d & b | a & ~b) + k[3] - 187363961 | 0;
          c = (c << 14 | c >>> 18) + d | 0;
          b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
          b = (b << 20 | b >>> 12) + c | 0;
          a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
          a = (a << 5 | a >>> 27) + b | 0;
          d += (a & c | b & ~c) + k[2] - 51403784 | 0;
          d = (d << 9 | d >>> 23) + a | 0;
          c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
          c = (c << 14 | c >>> 18) + d | 0;
          b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
          b = (b << 20 | b >>> 12) + c | 0;
          a += (b ^ c ^ d) + k[5] - 378558 | 0;
          a = (a << 4 | a >>> 28) + b | 0;
          d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
          d = (d << 11 | d >>> 21) + a | 0;
          c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
          c = (c << 16 | c >>> 16) + d | 0;
          b += (c ^ d ^ a) + k[14] - 35309556 | 0;
          b = (b << 23 | b >>> 9) + c | 0;
          a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
          a = (a << 4 | a >>> 28) + b | 0;
          d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
          d = (d << 11 | d >>> 21) + a | 0;
          c += (d ^ a ^ b) + k[7] - 155497632 | 0;
          c = (c << 16 | c >>> 16) + d | 0;
          b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
          b = (b << 23 | b >>> 9) + c | 0;
          a += (b ^ c ^ d) + k[13] + 681279174 | 0;
          a = (a << 4 | a >>> 28) + b | 0;
          d += (a ^ b ^ c) + k[0] - 358537222 | 0;
          d = (d << 11 | d >>> 21) + a | 0;
          c += (d ^ a ^ b) + k[3] - 722521979 | 0;
          c = (c << 16 | c >>> 16) + d | 0;
          b += (c ^ d ^ a) + k[6] + 76029189 | 0;
          b = (b << 23 | b >>> 9) + c | 0;
          a += (b ^ c ^ d) + k[9] - 640364487 | 0;
          a = (a << 4 | a >>> 28) + b | 0;
          d += (a ^ b ^ c) + k[12] - 421815835 | 0;
          d = (d << 11 | d >>> 21) + a | 0;
          c += (d ^ a ^ b) + k[15] + 530742520 | 0;
          c = (c << 16 | c >>> 16) + d | 0;
          b += (c ^ d ^ a) + k[2] - 995338651 | 0;
          b = (b << 23 | b >>> 9) + c | 0;
          a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
          a = (a << 6 | a >>> 26) + b | 0;
          d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
          d = (d << 10 | d >>> 22) + a | 0;
          c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
          c = (c << 15 | c >>> 17) + d | 0;
          b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
          b = (b << 21 | b >>> 11) + c | 0;
          a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
          a = (a << 6 | a >>> 26) + b | 0;
          d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
          d = (d << 10 | d >>> 22) + a | 0;
          c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
          c = (c << 15 | c >>> 17) + d | 0;
          b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
          b = (b << 21 | b >>> 11) + c | 0;
          a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
          a = (a << 6 | a >>> 26) + b | 0;
          d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
          d = (d << 10 | d >>> 22) + a | 0;
          c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
          c = (c << 15 | c >>> 17) + d | 0;
          b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
          b = (b << 21 | b >>> 11) + c | 0;
          a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
          a = (a << 6 | a >>> 26) + b | 0;
          d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
          d = (d << 10 | d >>> 22) + a | 0;
          c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
          c = (c << 15 | c >>> 17) + d | 0;
          b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
          b = (b << 21 | b >>> 11) + c | 0;
          x[0] = a + x[0] | 0;
          x[1] = b + x[1] | 0;
          x[2] = c + x[2] | 0;
          x[3] = d + x[3] | 0;
        }
        function md5blk(s) {
          var md5blks = [], i;
          for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
          }
          return md5blks;
        }
        function md5blk_array(a) {
          var md5blks = [], i;
          for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
          }
          return md5blks;
        }
        function md51(s) {
          var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i, length, tail, tmp, lo, hi;
          for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
          }
          s = s.substring(i - 64);
          length = s.length;
          tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
          }
          tail[i >> 2] |= 128 << (i % 4 << 3);
          if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
              tail[i] = 0;
            }
          }
          tmp = n * 8;
          tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
          lo = parseInt(tmp[2], 16);
          hi = parseInt(tmp[1], 16) || 0;
          tail[14] = lo;
          tail[15] = hi;
          md5cycle(state, tail);
          return state;
        }
        function md51_array(a) {
          var n = a.length, state = [1732584193, -271733879, -1732584194, 271733878], i, length, tail, tmp, lo, hi;
          for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
          }
          a = i - 64 < n ? a.subarray(i - 64) : new Uint8Array(0);
          length = a.length;
          tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= a[i] << (i % 4 << 3);
          }
          tail[i >> 2] |= 128 << (i % 4 << 3);
          if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
              tail[i] = 0;
            }
          }
          tmp = n * 8;
          tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
          lo = parseInt(tmp[2], 16);
          hi = parseInt(tmp[1], 16) || 0;
          tail[14] = lo;
          tail[15] = hi;
          md5cycle(state, tail);
          return state;
        }
        function rhex(n) {
          var s = "", j;
          for (j = 0; j < 4; j += 1) {
            s += hex_chr[n >> j * 8 + 4 & 15] + hex_chr[n >> j * 8 & 15];
          }
          return s;
        }
        function hex(x) {
          var i;
          for (i = 0; i < x.length; i += 1) {
            x[i] = rhex(x[i]);
          }
          return x.join("");
        }
        if (hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592") {
          add32 = function(x, y) {
            var lsw = (x & 65535) + (y & 65535), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return msw << 16 | lsw & 65535;
          };
        }
        if (typeof ArrayBuffer !== "undefined" && !ArrayBuffer.prototype.slice) {
          (function() {
            function clamp(val, length) {
              val = val | 0 || 0;
              if (val < 0) {
                return Math.max(val + length, 0);
              }
              return Math.min(val, length);
            }
            ArrayBuffer.prototype.slice = function(from, to) {
              var length = this.byteLength, begin = clamp(from, length), end = length, num, target, targetArray, sourceArray;
              if (to !== undefined) {
                end = clamp(to, length);
              }
              if (begin > end) {
                return new ArrayBuffer(0);
              }
              num = end - begin;
              target = new ArrayBuffer(num);
              targetArray = new Uint8Array(target);
              sourceArray = new Uint8Array(this, begin, num);
              targetArray.set(sourceArray);
              return target;
            };
          })();
        }
        function toUtf8(str) {
          if (/[\u0080-\uFFFF]/.test(str)) {
            str = unescape(encodeURIComponent(str));
          }
          return str;
        }
        function utf8Str2ArrayBuffer(str, returnUInt8Array) {
          var length = str.length, buff = new ArrayBuffer(length), arr = new Uint8Array(buff), i;
          for (i = 0; i < length; i += 1) {
            arr[i] = str.charCodeAt(i);
          }
          return returnUInt8Array ? arr : buff;
        }
        function arrayBuffer2Utf8Str(buff) {
          return String.fromCharCode.apply(null, new Uint8Array(buff));
        }
        function concatenateArrayBuffers(first, second, returnUInt8Array) {
          var result = new Uint8Array(first.byteLength + second.byteLength);
          result.set(new Uint8Array(first));
          result.set(new Uint8Array(second), first.byteLength);
          return returnUInt8Array ? result : result.buffer;
        }
        function hexToBinaryString(hex2) {
          var bytes = [], length = hex2.length, x;
          for (x = 0; x < length - 1; x += 2) {
            bytes.push(parseInt(hex2.substr(x, 2), 16));
          }
          return String.fromCharCode.apply(String, bytes);
        }
        function SparkMD5() {
          this.reset();
        }
        SparkMD5.prototype.append = function(str) {
          this.appendBinary(toUtf8(str));
          return this;
        };
        SparkMD5.prototype.appendBinary = function(contents) {
          this._buff += contents;
          this._length += contents.length;
          var length = this._buff.length, i;
          for (i = 64; i <= length; i += 64) {
            md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
          }
          this._buff = this._buff.substring(i - 64);
          return this;
        };
        SparkMD5.prototype.end = function(raw) {
          var buff = this._buff, length = buff.length, i, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ret;
          for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff.charCodeAt(i) << (i % 4 << 3);
          }
          this._finish(tail, length);
          ret = hex(this._hash);
          if (raw) {
            ret = hexToBinaryString(ret);
          }
          this.reset();
          return ret;
        };
        SparkMD5.prototype.reset = function() {
          this._buff = "";
          this._length = 0;
          this._hash = [1732584193, -271733879, -1732584194, 271733878];
          return this;
        };
        SparkMD5.prototype.getState = function() {
          return {
            buff: this._buff,
            length: this._length,
            hash: this._hash.slice()
          };
        };
        SparkMD5.prototype.setState = function(state) {
          this._buff = state.buff;
          this._length = state.length;
          this._hash = state.hash;
          return this;
        };
        SparkMD5.prototype.destroy = function() {
          delete this._hash;
          delete this._buff;
          delete this._length;
        };
        SparkMD5.prototype._finish = function(tail, length) {
          var i = length, tmp, lo, hi;
          tail[i >> 2] |= 128 << (i % 4 << 3);
          if (i > 55) {
            md5cycle(this._hash, tail);
            for (i = 0; i < 16; i += 1) {
              tail[i] = 0;
            }
          }
          tmp = this._length * 8;
          tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
          lo = parseInt(tmp[2], 16);
          hi = parseInt(tmp[1], 16) || 0;
          tail[14] = lo;
          tail[15] = hi;
          md5cycle(this._hash, tail);
        };
        SparkMD5.hash = function(str, raw) {
          return SparkMD5.hashBinary(toUtf8(str), raw);
        };
        SparkMD5.hashBinary = function(content, raw) {
          var hash2 = md51(content), ret = hex(hash2);
          return raw ? hexToBinaryString(ret) : ret;
        };
        SparkMD5.ArrayBuffer = function() {
          this.reset();
        };
        SparkMD5.ArrayBuffer.prototype.append = function(arr) {
          var buff = concatenateArrayBuffers(this._buff.buffer, arr, true), length = buff.length, i;
          this._length += arr.byteLength;
          for (i = 64; i <= length; i += 64) {
            md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
          }
          this._buff = i - 64 < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);
          return this;
        };
        SparkMD5.ArrayBuffer.prototype.end = function(raw) {
          var buff = this._buff, length = buff.length, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], i, ret;
          for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff[i] << (i % 4 << 3);
          }
          this._finish(tail, length);
          ret = hex(this._hash);
          if (raw) {
            ret = hexToBinaryString(ret);
          }
          this.reset();
          return ret;
        };
        SparkMD5.ArrayBuffer.prototype.reset = function() {
          this._buff = new Uint8Array(0);
          this._length = 0;
          this._hash = [1732584193, -271733879, -1732584194, 271733878];
          return this;
        };
        SparkMD5.ArrayBuffer.prototype.getState = function() {
          var state = SparkMD5.prototype.getState.call(this);
          state.buff = arrayBuffer2Utf8Str(state.buff);
          return state;
        };
        SparkMD5.ArrayBuffer.prototype.setState = function(state) {
          state.buff = utf8Str2ArrayBuffer(state.buff, true);
          return SparkMD5.prototype.setState.call(this, state);
        };
        SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;
        SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;
        SparkMD5.ArrayBuffer.hash = function(arr, raw) {
          var hash2 = md51_array(new Uint8Array(arr)), ret = hex(hash2);
          return raw ? hexToBinaryString(ret) : ret;
        };
        return SparkMD5;
      });
    }
  });

  // bl_core.ts
  var spark = __toESM(require_spark_md5());
  var verbose = false;
  function ComponentTypeToString(type) {
    return type.join("::");
  }
  var ECS = class {
    constructor(defs, comps) {
      this.definitions = defs;
      this.components = comps;
      this.cleanupHashes();
    }
    cleanupHashes() {
      let refmap = BuildRefMap(this);
      let equivalenceMap = BuildEquivalenceHashMap(this, refmap);
      if (Object.keys(equivalenceMap).length === 0) {
        return;
      } else {
        this.components.forEach((comp) => {
          VisitAttributes(comp, (attr) => {
            if (attr.type === 8 /* REF */) {
              if (attr.val) {
                let val = attr.val;
                let replacementRef = equivalenceMap[val];
                if (!replacementRef) {
                  return;
                }
                attr.val = replacementRef;
              }
            }
          });
        });
        for (let i = 0; i < this.components.length; i++) {
          let comp = this.components[i];
          if (equivalenceMap[comp.ref]) {
            this.components[i] = null;
          }
        }
        this.components = this.components.filter((c) => c !== null);
      }
    }
    GetComponentByRef(ref) {
      return this.components.filter((c) => c.ref === ref)[0];
    }
    GetComponentByGuid(guid) {
      return this.components.filter((c) => c.guid === guid)[0];
    }
  };
  function GetMaxRef(ecs) {
    let maxRef = 0;
    ecs.components.forEach((comp) => {
      maxRef = Math.max(maxRef, comp.ref);
    });
    return maxRef;
  }
  function BuildRefMap(ecs) {
    let map = {};
    ecs.components.forEach((comp) => {
      map[comp.ref] = comp;
    });
    return map;
  }
  function BuildGuidMap(ecs) {
    let map = {};
    ecs.components.forEach((comp) => {
      if (comp.guid) {
        map[comp.guid] = comp.ref;
      }
    });
    return map;
  }
  function HashComponent(comp, refMap, compToHash, shallow = false) {
    if (compToHash[comp.ref]) {
      return compToHash[comp.ref];
    }
    let hash2 = [comp.guid, ...comp.type];
    VisitAttributes(comp, (attr) => {
      let hasNestedObj = attr.type === 3 /* ARRAY */ || attr.type === 2 /* SELECT */ || attr.type === 4 /* LABEL */;
      if (hasNestedObj) {
        return;
      }
      if (attr.type === 8 /* REF */) {
        if (attr.val && attr.val !== comp.ref) {
          let val = attr.val;
          if (shallow) {
            hash2.push(val);
          } else {
            let childComp = refMap[val];
            if (!childComp) {
              throw new Error(`Unknown component reference ${val}`);
            }
            hash2.push(HashComponent(childComp, refMap, compToHash));
          }
        }
      } else {
        hash2.push(attr.val);
      }
    });
    let finalHash = spark.hash(hash2.join(","));
    compToHash[comp.ref] = finalHash;
    return finalHash;
  }
  function BuildEquivalenceHashMap(ecs, refMap) {
    let map = {};
    let compToHash = {};
    let hashEquivalenceMap = {};
    ecs.components.forEach((comp) => {
      if (!comp.guid) {
        comp.hash = HashComponent(comp, refMap, compToHash);
        if (comp.hash === null || comp.hash === "") {
          throw new Error(`Null hash for component ${comp}`);
        }
        if (map[comp.hash]) {
          hashEquivalenceMap[comp.ref] = map[comp.hash];
        } else {
          map[comp.hash] = comp.ref;
        }
      }
    });
    return hashEquivalenceMap;
  }
  function BuildHashMap(ecs, refMap) {
    let map = {};
    let compToHash = {};
    ecs.components.forEach((comp) => {
      if (!comp.guid) {
        comp.hash = HashComponent(comp, refMap, compToHash);
        if (comp.hash === null) {
          throw new Error(`Null hash for component ${comp}`);
        }
        if (map[comp.hash]) {
          throw new Error(`Duplicate hash while building hashmap, this is a bug!`);
        } else {
          map[comp.hash] = comp.ref;
        }
      }
    });
    return map;
  }
  function MakeCreatedComponent(comp, ref) {
    let ccomp = {
      ref,
      guid: comp.guid,
      type: comp.type,
      data: comp.data
    };
    return ccomp;
  }
  function attributeValueEqual(left, right, attrValue) {
    if (left.type === 3 /* ARRAY */) {
      if (!(left.val && right.val)) {
        return left.val === right.val;
      }
      if (left.val.length !== right.val.length) {
        return false;
      }
      for (let i = 0; i < left.val.length; i++) {
        if (!attributeValueEqual(left.val[i], right.val[i], null)) {
          return false;
        }
      }
      return true;
    } else if (left.type === 4 /* LABEL */) {
      if (left.namedType !== right.namedType) {
        return false;
      }
      attributeValueEqual(left.val, right.val, null);
    } else {
      return left.val === right.val;
    }
  }
  function GetAttrByName(name, comp) {
    let attrs = comp.data.filter((ncai) => ncai.name === name);
    if (attrs.length === 0)
      return false;
    return attrs[0];
  }
  function attributeEqual(left, right, attr) {
    let l = GetAttrByName(attr.name, left);
    let r = GetAttrByName(attr.name, right);
    if (l && r) {
      return attributeValueEqual(l.val, r.val, attr.value);
    } else {
      console.log(left, right);
      throw new Error(`Schema mismatch for attribute ${attr.name}`);
    }
  }
  function ApplyComponentModification(comp, mod) {
    comp.data[mod.attributeName] = mod.newValue;
  }
  function BuildModifications(left, right, schema) {
    let modifications = [];
    schema.attributes.forEach((attr) => {
      if (!attributeEqual(left, right, attr)) {
        let newValue = GetAttrByName(attr.name, right);
        if (newValue) {
          modifications.push({ attributeName: attr.name, newValue: newValue.val });
        }
      }
    });
    return modifications;
  }
  function MakeModifiedComponent(left, right, schemaMap) {
    if (left.hash === right.hash) {
      return false;
    }
    let componentDefinition = schemaMap[ComponentTypeToString(left.type)];
    if (!componentDefinition) {
      throw new Error(`Component type without definition ${ComponentTypeToString(left.type)}`);
    }
    let ccomp = {
      ref: left.ref,
      modifications: BuildModifications(left, right, componentDefinition.schema)
    };
    if (ccomp.modifications.length === 0) {
      return false;
    }
    return ccomp;
  }
  function BuildSchemaMap(ecs) {
    let defs = {};
    ecs.definitions.forEach((def) => {
      defs[ComponentTypeToString(def.id)] = def;
    });
    return defs;
  }
  function MergeSchemaMap(left, right, delta) {
    let merge = {};
    Object.keys(left).forEach((key) => {
      let l = left[key];
      let r = right[key];
      merge[key] = l;
      if (!r) {
        if (verbose)
          console.log(`Removed ${key}`);
        delta.expired.push({ id: l.id });
      } else {
        if (verbose)
          console.log(`Skipped ${key}`);
      }
    });
    Object.keys(right).forEach((key) => {
      let l = left[key];
      let r = right[key];
      merge[key] = l;
      if (!l) {
        if (verbose)
          console.log(`Added ${key}`);
        delta.created.push(r);
      } else {
        if (verbose)
          console.log(`Skipped ${key}`);
      }
    });
    return merge;
  }
  function VisitAttribute(attr, fn) {
    if (attr.type === 3 /* ARRAY */) {
      fn(attr);
      if (attr.val) {
        let attributes = attr.val;
        attributes.forEach((ncai) => VisitAttribute(ncai, fn));
      }
    } else if (attr.type === 4 /* LABEL */) {
      fn(attr);
      if (attr.val) {
        VisitAttribute(attr.val, fn);
      }
    } else if (attr.type === 2 /* SELECT */) {
      fn(attr);
      if (attr.val) {
        VisitAttribute(attr.val, fn);
      }
    } else {
      fn(attr);
    }
  }
  function VisitAttributes(comp, fn) {
    comp.data.forEach((ncai) => {
      VisitAttribute(ncai.val, fn);
    });
  }
  function GetRefsFromComponent(comp) {
    let refs = [];
    VisitAttributes(comp, (attr) => {
      if (attr.type === 8 /* REF */) {
        if (attr.val) {
          refs.push(attr.val);
        }
      }
    });
    return refs;
  }
  var HashDifference = class {
    constructor() {
      this.hashToRefLeft = {};
      this.hashToRefRight = {};
      this.matchingHashes = [];
      this.addedHashes = [];
      this.removedHashes = [];
    }
  };
  var GuidsDifference = class {
    constructor() {
      this.guidToRefLeft = {};
      this.guidToRefRight = {};
      this.matchingGuids = [];
      this.addedGuids = [];
      this.removedGuids = [];
    }
  };
  function BuildHashDiff(left, right, refMapLeft, refMapRight) {
    let diff = new HashDifference();
    diff.hashToRefLeft = BuildHashMap(left, refMapLeft);
    console.log(`e`);
    diff.hashToRefRight = BuildHashMap(right, refMapRight);
    Object.keys(diff.hashToRefLeft).forEach((hash2) => {
      if (diff.hashToRefRight[hash2]) {
        diff.matchingHashes.push(hash2);
      } else {
        diff.removedHashes.push(hash2);
      }
    });
    Object.keys(diff.hashToRefRight).forEach((hash2) => {
      if (diff.hashToRefLeft[hash2]) {
      } else {
        diff.addedHashes.push(hash2);
      }
    });
    return diff;
  }
  function BuildGuidsDiff(left, right) {
    let diff = new GuidsDifference();
    diff.guidToRefLeft = BuildGuidMap(left);
    diff.guidToRefRight = BuildGuidMap(right);
    Object.keys(diff.guidToRefLeft).forEach((guid) => {
      if (diff.guidToRefRight[guid]) {
        diff.matchingGuids.push(guid);
      } else {
        diff.removedGuids.push(guid);
      }
    });
    Object.keys(diff.guidToRefRight).forEach((guid) => {
      if (diff.guidToRefLeft[guid]) {
      } else {
        diff.addedGuids.push(guid);
      }
    });
    return diff;
  }
  function BuildInitialLockedReferences(hashDiff, guidsDiff) {
    let lockedReferences = {};
    hashDiff.matchingHashes.forEach((matchingHash) => {
      let refLeft = hashDiff.hashToRefLeft[matchingHash];
      let refRight = hashDiff.hashToRefRight[matchingHash];
      lockedReferences[refRight] = refLeft;
    });
    guidsDiff.matchingGuids.forEach((matchingGuid) => {
      let refLeft = guidsDiff.guidToRefLeft[matchingGuid];
      let refRight = guidsDiff.guidToRefRight[matchingGuid];
      lockedReferences[refRight] = refLeft;
    });
    return lockedReferences;
  }
  function BuildLockedReferences(hashDiff, guidsDiff, refMapLeft, refMapRight) {
    let lockedReferences = BuildInitialLockedReferences(hashDiff, guidsDiff);
    let newlyLockedReferences = [];
    guidsDiff.matchingGuids.forEach((guid) => {
      let refR = guidsDiff.guidToRefRight[guid];
      if (!refR) {
        throw new Error(`Unknown right ref for guid ${guid}`);
      }
      newlyLockedReferences.push(refR);
    });
    while (true) {
      let nextIteration = [];
      newlyLockedReferences.forEach((refR) => {
        let refL = lockedReferences[refR];
        let compL = refMapLeft[refL];
        let compR = refMapRight[refR];
        if (!compL || !compR) {
          console.log(refL, refR);
          console.log(compL, compR);
          throw new Error(`Comp mismtach!`);
        }
        let refsL = GetRefsFromComponent(compL);
        let refsR = GetRefsFromComponent(compR);
        if (refsL.length !== refsR.length) {
        } else {
          for (let i = 0; i < refsL.length; i++) {
            let refL2 = refsL[i];
            let refR2 = refsR[i];
            let compL2 = refMapLeft[refL2];
            let compR2 = refMapRight[refR2];
            if (ComponentTypeToString(compL2.type) !== ComponentTypeToString(compR2.type)) {
              continue;
            }
            if (lockedReferences[refR2]) {
              let lockedRef = lockedReferences[refR2];
              if (lockedRef === refL2) {
              } else {
              }
            } else {
              lockedReferences[refR2] = refL2;
              nextIteration.push(refR2);
            }
          }
        }
      });
      if (nextIteration.length === 0) {
        break;
      }
      newlyLockedReferences = nextIteration;
    }
    return lockedReferences;
  }
  function UpdateComponentRefsToMatchLeft(comp, newLeftRefForNewRightRef) {
    VisitAttributes(comp, (attr) => {
      if (attr.type === 8 /* REF */) {
        if (attr.val) {
          let newRef = newLeftRefForNewRightRef[attr.val];
          if (!newRef) {
            throw new Error(`Unknown new left ref for ${attr.val}`);
          }
          attr.val = newRef;
        }
      }
    });
  }
  function DiffECS(left, right) {
    let nextRef = GetMaxRef(left) + 1;
    let refMapLeft = BuildRefMap(left);
    let refMapRight = BuildRefMap(right);
    let schemaMapLeft = BuildSchemaMap(left);
    let schemaMapRight = BuildSchemaMap(right);
    let definitionsDelta = {
      created: [],
      expired: []
    };
    let schemaMap = MergeSchemaMap(schemaMapLeft, schemaMapRight, definitionsDelta);
    let hashDiff = BuildHashDiff(left, right, refMapLeft, refMapRight);
    let guidsDiff = BuildGuidsDiff(left, right);
    console.log("d");
    if (true) {
      console.log(`left components: ${left.components.length}`);
      console.log(`right components: ${right.components.length}`);
      console.log(`hash matches: ${hashDiff.matchingHashes.length}`);
      console.log(`hash added: ${hashDiff.addedHashes.length}`);
      console.log(`hash removed: ${hashDiff.removedHashes.length}`);
      console.log(`guids matches: ${guidsDiff.matchingGuids.length}`);
      console.log(`guids added: ${guidsDiff.addedGuids.length}`);
      console.log(`guids removed: ${guidsDiff.removedGuids.length}`);
    }
    let lockedReferences = BuildLockedReferences(hashDiff, guidsDiff, refMapLeft, refMapRight);
    let invertedLockedReferences = {};
    Object.keys(lockedReferences).forEach((refRight) => invertedLockedReferences[lockedReferences[refRight]] = refRight);
    let allRemovedComponents = [];
    let allModifiedComponents = [];
    let allAddedComponents = [];
    Object.keys(refMapLeft).forEach((refLeft) => {
      let refRight = invertedLockedReferences[refLeft];
      if (!refRight) {
        allRemovedComponents.push(parseInt(refLeft));
      }
    });
    let newLeftRefForNewRightRef = {};
    Object.keys(refMapRight).forEach((refRight) => {
      let refLeft = lockedReferences[refRight];
      if (refLeft) {
        newLeftRefForNewRightRef[refRight] = refLeft;
      } else {
        newLeftRefForNewRightRef[refRight] = nextRef++;
      }
    });
    Object.keys(refMapRight).forEach((refRight) => {
      let refLeft = lockedReferences[refRight];
      if (refLeft) {
        UpdateComponentRefsToMatchLeft(refMapRight[refRight], newLeftRefForNewRightRef);
        let modification = MakeModifiedComponent(refMapLeft[refLeft], refMapRight[refRight], schemaMap);
        if (modification)
          allModifiedComponents.push(modification);
      } else {
        let newLeftRef = newLeftRefForNewRightRef[refRight];
        if (!newLeftRef) {
          throw new Error(`Missing mapping to left ref!`);
        } else {
          UpdateComponentRefsToMatchLeft(refMapRight[refRight], newLeftRefForNewRightRef);
          allAddedComponents.push(MakeCreatedComponent(refMapRight[refRight], newLeftRef));
        }
      }
    });
    let addedHashes = {};
    let removedHashes = {};
    let compsForType = {};
    let compToHash = {};
    allAddedComponents.forEach((comp) => {
      addedHashes[HashComponent(comp, null, compToHash, true)] = comp;
      if (!compsForType[ComponentTypeToString(comp.type)]) {
        compsForType[ComponentTypeToString(comp.type)] = { added: [], removed: [] };
      }
      compsForType[ComponentTypeToString(comp.type)].added.push(comp);
    });
    compToHash = {};
    allRemovedComponents.forEach((compID) => {
      let comp = refMapLeft[compID];
      removedHashes[HashComponent(comp, null, compToHash, true)] = comp;
      if (!compsForType[ComponentTypeToString(comp.type)]) {
        compsForType[ComponentTypeToString(comp.type)] = { added: [], removed: [] };
      }
      compsForType[ComponentTypeToString(comp.type)].removed.push(comp);
    });
    let existingHash = 0;
    let newHash = 0;
    Object.keys(addedHashes).forEach((hash2) => {
      if (removedHashes[hash2]) {
        existingHash++;
      } else {
        newHash++;
      }
    });
    console.log(`Existing ${existingHash}, new: ${newHash}`);
    let componentsDelta = {
      added: allAddedComponents,
      modified: allModifiedComponents,
      removed: allRemovedComponents
    };
    let delta = {
      components: componentsDelta,
      definitions: definitionsDelta
    };
    let transaction = {
      date: "",
      hash: "",
      context: "",
      author: "bob@bob.com",
      delta
    };
    return transaction;
  }
  function Rehash(comp) {
    comp.hash = spark.hash(JSON.stringify([comp.guid, comp.type, comp.data]));
  }
  function BuildComponent(ccomp) {
    let comp = {
      ref: ccomp.ref,
      hash: "",
      guid: ccomp.guid,
      type: ccomp.type,
      data: ccomp.data
    };
    return comp;
  }
  function ApplyTransaction(ecs, transaction) {
    transaction.delta.definitions.created.forEach((definition) => {
      ecs.definitions.push(definition);
    });
    let refMap = BuildRefMap(ecs);
    transaction.delta.components.added.forEach((addedComponent) => {
      ecs.components.push(BuildComponent(addedComponent));
    });
    transaction.delta.components.modified.forEach((modifiedComponent) => {
      let originalComponent = refMap[modifiedComponent.ref];
      if (!originalComponent) {
        throw new Error(`Unknown modified component ref ${modifiedComponent.ref}`);
      }
      modifiedComponent.modifications.forEach((mod) => {
        ApplyComponentModification(originalComponent, mod);
      });
    });
    transaction.delta.components.removed.forEach((removedRef) => {
      let originalComponent = refMap[removedRef];
      if (!originalComponent) {
        throw new Error(`Unknown removed component ref ${removedRef}`);
      }
      ecs.components = ecs.components.filter((e) => e.ref !== removedRef);
    });
  }
  function BuildECS(ledger2) {
    let ecs = new ECS([], []);
    ledger2.transactions.forEach((transaction) => {
      ApplyTransaction(ecs, transaction);
    });
    ecs.components.forEach((comp) => Rehash(comp));
    return ecs;
  }

  // exp2ecs.ts
  function sortEntities(entities) {
    let sortedEntities = [];
    let unsortedEntities = [];
    entities.forEach((val) => unsortedEntities.push(val));
    while (unsortedEntities.length > 0) {
      for (let i = 0; i < unsortedEntities.length; i++) {
        if (unsortedEntities[i].parent == null || sortedEntities.some((e) => e.name === unsortedEntities[i].parent)) {
          sortedEntities.push(unsortedEntities[i]);
        }
      }
      unsortedEntities = unsortedEntities.filter((n) => !sortedEntities.includes(n));
    }
    return sortedEntities;
  }
  function expTypeToTSType(expTypeName) {
    let tsType = expTypeName;
    if (expTypeName == "REAL" || expTypeName == "INTEGER" || expTypeName == "NUMBER") {
      tsType = "number";
    } else if (expTypeName == "STRING") {
      tsType = "string";
    } else if (expTypeName == "BOOLEAN") {
      tsType = "boolean";
    } else if (expTypeName == "BINARY") {
      tsType = "number";
    } else if (expTypeName == "LOGICAL") {
      tsType = "boolean";
    }
    return tsType;
  }
  function parseInverse(line, entity) {
    let split = line.split(" ");
    let name = split[0].replace("INVERSE", "").trim();
    let set = split.indexOf("SET") != -1 || split.indexOf("LIST") != -1;
    let forVal = split[split.length - 1].replace(";", "");
    let type = split[split.length - 3];
    let tsType = expTypeToTSType(type);
    entity.inverseProps.push({
      name,
      type: tsType,
      set,
      for: forVal
    });
  }
  function parseElements(data) {
    let lines = data.split(";");
    let entities = [];
    let types = [];
    let type = false;
    let entity = false;
    let readProps = false;
    let readInverse = false;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      let hasColon = line.indexOf(" : ") != -1;
      if (line.indexOf("ENTITY") == 0) {
        let split = line.split(" ");
        let name = split[1].trim();
        entity = {
          name,
          parent: null,
          props: [],
          children: [],
          derivedProps: [],
          inverseProps: [],
          derivedInverseProps: [],
          isIfcProduct: false,
          isIfcRelationship: false,
          isIfcOwnerHistory: false,
          isEntity: true,
          isType: false
        };
        if (name === "IfcProduct")
          entity.isIfcProduct = true;
        if (name === "IfcRelationship")
          entity.isIfcRelationship = true;
        if (name === "IfcPropertySetDefinition")
          entity.isIfcRelationship = true;
        if (name === "IfcElementType")
          entity.isIfcRelationship = true;
        if (name === "IfcGrid")
          entity.isIfcRelationship = true;
        if (name === "IfcDistributionPort")
          entity.isIfcRelationship = true;
        if (name === "IfcRoof")
          entity.isIfcRelationship = true;
        if (name === "IfcOwnerHistory")
          entity.isIfcOwnerHistory = true;
        readProps = true;
        readInverse = false;
        let subIndex = split.indexOf("SUBTYPE");
        if (subIndex != -1) {
          let parent = split[subIndex + 2].replace("(", "").replace(")", "");
          entity.parent = parent;
        }
      } else if (line.indexOf("END_ENTITY") == 0) {
        if (entity)
          entities.push(entity);
        readProps = false;
        readInverse = false;
      } else if (line.indexOf("WHERE") == 0) {
        readProps = false;
        readInverse = false;
      } else if (line.indexOf("INVERSE") == 0) {
        readProps = false;
        readInverse = true;
        parseInverse(line, entity);
      } else if (line.indexOf("DERIVE") == 0) {
        readProps = false;
        readInverse = false;
      } else if (line.indexOf("UNIQUE") == 0) {
        readProps = false;
        readInverse = false;
      } else if (line.indexOf("TYPE") == 0) {
        readProps = false;
        readInverse = false;
        let split = line.split(" ").map((s) => s.trim());
        let name = split[1];
        let isList = split.indexOf("LIST") != -1 || split.indexOf("SET") != -1 || split.indexOf("ARRAY") != -1;
        let isEnum = split.indexOf("ENUMERATION") != -1;
        let isSelect = split[3].indexOf("SELECT") == 0;
        let values = null;
        let typeName = "";
        if (isList) {
          typeName = split[split.length - 1];
        } else if (isEnum || isSelect) {
          let firstBracket2 = line.indexOf("(");
          let secondBracket = line.indexOf(")");
          let stringList = line.substring(firstBracket2 + 1, secondBracket);
          values = stringList.split(",").map((s) => s.trim());
        } else {
          typeName = split[3];
        }
        let firstBracket = typeName.indexOf("(");
        if (firstBracket != -1) {
          typeName = typeName.substr(0, firstBracket);
        }
        type = {
          name,
          typeName,
          isList,
          isEnum,
          isSelect,
          values,
          isType: true,
          isEntity: false
        };
      } else if (line.indexOf("END_TYPE") == 0) {
        if (type) {
          types.push(type);
        }
        type = false;
      } else if (entity && readInverse && hasColon) {
        parseInverse(line, entity);
      } else if (entity && readProps && hasColon) {
        let split = line.split(" ");
        let name = split[0];
        let optional = split.indexOf("OPTIONAL") != -1;
        let set = split.indexOf("SET") != -1 || split.indexOf("LIST") != -1;
        let setOfSet = split.filter((s) => s === "LIST").length === 2;
        let type2 = split[split.length - 1].replace(";", "");
        let firstBracket = type2.indexOf("(");
        if (firstBracket != -1) {
          type2 = type2.substr(0, firstBracket);
        }
        let tsType = type2;
        entity.props.push({
          name,
          type: tsType,
          primitive: tsType !== type2,
          optional,
          set,
          setOfSet
        });
      }
    }
    return {
      entities,
      types
    };
  }
  function findEntity(entityName, entityList) {
    if (entityName == null)
      return null;
    for (var i = 0; i < entityList.length; i++) {
      if (entityList[i].name == entityName) {
        return entityList[i];
      }
    }
    return null;
  }
  function findSubClasses(entities) {
    for (var y = entities.length - 1; y >= 0; y--) {
      let parent = findEntity(entities[y].parent, entities);
      if (parent == null)
        continue;
      parent.children.push(...entities[y].children);
      parent.children.push(entities[y].name);
    }
    return entities;
  }
  function walkParents(entity, entityList) {
    let parent = findEntity(entity.parent, entityList);
    if (parent == null) {
      entity.derivedProps = entity.props;
      entity.derivedInverseProps = entity.inverseProps;
    } else {
      walkParents(parent, entityList);
      if (parent.isIfcProduct)
        entity.isIfcProduct = true;
      if (parent.isIfcRelationship)
        entity.isIfcRelationship = true;
      entity.derivedProps = [...parent.derivedProps, ...entity.props];
      entity.derivedInverseProps = [...parent.derivedInverseProps, ...entity.inverseProps];
    }
  }
  console.log("Starting...");
  function ParseEXP(expString) {
    let completeEntityList = /* @__PURE__ */ new Set();
    completeEntityList.add("FILE_SCHEMA");
    completeEntityList.add("FILE_NAME");
    completeEntityList.add("FILE_DESCRIPTION");
    let completeifcElementList = /* @__PURE__ */ new Set();
    let schemaData = expString;
    let parsed = parseElements(schemaData);
    let entities = sortEntities(parsed.entities);
    let types = parsed.types;
    entities.forEach((e) => {
      walkParents(e, entities);
    });
    entities = findSubClasses(entities);
    for (var x = 0; x < entities.length; x++) {
      completeEntityList.add(entities[x].name);
      if (entities[x].isIfcProduct) {
        completeifcElementList.add(entities[x].name);
      }
      if (entities[x].derivedInverseProps.length > 0) {
        entities[x].derivedInverseProps.forEach((prop) => {
          let pos = 0;
          for (let targetEntity of entities) {
            if (targetEntity.name == prop.type) {
              for (let i = 0; i < targetEntity.derivedProps.length; i++) {
                if (targetEntity.derivedProps[i].name == prop.for) {
                  pos = i;
                  break;
                }
              }
              break;
            }
          }
          let type = `ifc.${prop.type.toUpperCase()}`;
        });
      }
    }
    let nameToObj = {};
    entities.forEach((e) => nameToObj[e.name] = e);
    types.forEach((t) => nameToObj[t.name] = t);
    function print(e) {
      e.derivedProps.forEach((p) => {
        console.log(nameToObj[p.type]);
      });
      console.log(JSON.stringify(e, null, 4));
    }
    function PropTypeToAttrType(typeName) {
      if (typeName === "NUMBER" || typeName === "REAL" || typeName === "INTEGER") {
        return 0 /* NUMBER */;
      } else if (typeName == "STRING") {
        return 1 /* STRING */;
      } else if (typeName == "BOOLEAN") {
        return 5 /* BOOLEAN */;
      } else if (typeName == "BINARY") {
        return 6 /* BINARY */;
      } else if (typeName == "LOGICAL") {
        return 7 /* LOGICAL */;
      }
      throw new Error(`Unkonwn prop type: "${typeName}"`);
    }
    function ToChildAttrVal(propType) {
      let type = 3 /* ARRAY */;
      if (propType.isType) {
        let _type = propType;
        if (_type.isEnum) {
          type = 1 /* STRING */;
        } else if (_type.isList) {
          let obj = nameToObj[_type.typeName];
          if (obj && obj.isEntity) {
            return {
              type: 3 /* ARRAY */,
              optional: false,
              child: {
                type: 8 /* REF */,
                optional: false,
                child: null
              }
            };
          } else if (obj && obj.isType) {
            return {
              type: 3 /* ARRAY */,
              optional: false,
              child: ToChildAttrVal(obj)
            };
          } else {
            return {
              type: 3 /* ARRAY */,
              optional: false,
              child: {
                type: PropTypeToAttrType(_type.typeName),
                optional: false,
                child: null
              }
            };
          }
        } else if (_type.isSelect) {
          return {
            type: 2 /* SELECT */,
            optional: false,
            child: _type.values.map((val) => ToChildAttrVal(nameToObj[val]))
          };
        } else {
          let propType2 = nameToObj[_type.typeName];
          if (propType2) {
            return ToChildAttrVal(propType2);
          } else {
            type = PropTypeToAttrType(_type.typeName);
          }
        }
      } else if (propType.isEntity) {
        type = 8 /* REF */;
      }
      return {
        type,
        optional: false,
        child: null
      };
    }
    function ToAttrVal(prop) {
      let propType = nameToObj[prop.type];
      if (!propType) {
        let type = PropTypeToAttrType(prop.type);
        if (prop.setOfSet) {
          return {
            type: 3 /* ARRAY */,
            optional: prop.optional,
            child: {
              type: 3 /* ARRAY */,
              optional: false,
              child: {
                type,
                optional: false,
                child: null
              }
            }
          };
        } else if (prop.set) {
          return {
            type: 3 /* ARRAY */,
            optional: prop.optional,
            child: {
              type,
              optional: false,
              child: null
            }
          };
        } else {
          return {
            type,
            optional: prop.optional,
            child: null
          };
        }
      } else if (prop.setOfSet) {
        return {
          type: 3 /* ARRAY */,
          optional: prop.optional,
          child: {
            type: 3 /* ARRAY */,
            optional: false,
            child: ToChildAttrVal(propType)
          }
        };
      } else if (prop.set) {
        return {
          type: 3 /* ARRAY */,
          optional: prop.optional,
          child: ToChildAttrVal(propType)
        };
      } else {
        let attr = ToChildAttrVal(propType);
        attr.optional = prop.optional;
        return attr;
      }
    }
    function ToAttribute(prop) {
      let attr = {
        name: prop.name,
        value: ToAttrVal(prop)
      };
      return attr;
    }
    function ToSchema(props) {
      let schema = {
        attributes: props.map((prop) => ToAttribute(prop))
      };
      return schema;
    }
    function ToComponentDefinition(e) {
      let comp = {
        id: ["ifc2x3", e.name.toLocaleLowerCase()],
        parent: null,
        ownership: "any",
        isEntity: e.isIfcProduct,
        isRelationShip: e.isIfcRelationship,
        isIfcOwnerHistory: e.isIfcOwnerHistory,
        schema: ToSchema(e.derivedProps)
      };
      return comp;
    }
    let definitions = entities.map((e) => ToComponentDefinition(e));
    return definitions;
  }

  // ifc2ecs.ts
  var READ_BUF_SIZE = 1024 * 1024;
  var LineParser = class {
    constructor(d, s) {
      this.data_ptr = 0;
      this.schema_ptr = 0;
      this.attrInstances = [];
      this.data = d;
      this.schema = s;
    }
    AtEnd() {
      return this.data_ptr === this.data.length;
    }
    ParseAttribute(schemaValue) {
      let type = this.data[this.data_ptr++];
      if (type === 2 /* LABEL */) {
        let specificType = this.data[this.data_ptr++];
        let openingBrace = this.data[this.data_ptr++];
        if (openingBrace !== 7 /* SET_BEGIN */) {
          throw new Error(`No opening brace for named type!`);
        }
        let nestedObj = {
          type: 4 /* LABEL */,
          namedType: specificType,
          val: this.ParseAttribute(schemaValue)
        };
        let closingBrace = this.data[this.data_ptr++];
        if (closingBrace !== 8 /* SET_END */) {
          throw new Error(`No closing brace for named type!`);
        }
        return nestedObj;
      }
      if (type === 0 /* UNKNOWN */) {
        return {
          type: schemaValue.type,
          val: null
        };
      }
      if (schemaValue.optional && type === 6 /* EMPTY */) {
        return {
          type: schemaValue.type,
          val: null
        };
      } else {
        if (schemaValue.type === 1 /* STRING */) {
          if (type !== 1 /* STRING */ && type !== 3 /* ENUM */) {
            throw new Error(`Bad type ${type} found for string`);
          } else {
            return {
              type: 1 /* STRING */,
              val: this.data[this.data_ptr++]
            };
          }
        } else if (schemaValue.type === 8 /* REF */) {
          if (type !== 5 /* REF */) {
            throw new Error(`Bad type ${type} found for ref`);
          } else {
            return {
              type: 8 /* REF */,
              val: this.data[this.data_ptr++]
            };
          }
        } else if (schemaValue.type === 0 /* NUMBER */) {
          if (type !== 4 /* REAL */) {
            throw new Error(`Bad type ${type} found for number`);
          } else {
            return {
              type: 0 /* NUMBER */,
              val: this.data[this.data_ptr++]
            };
          }
        } else if (schemaValue.type === 5 /* BOOLEAN */) {
          if (type !== 3 /* ENUM */) {
            throw new Error(`Bad type ${type} found for boolean`);
          } else {
            return {
              type: 5 /* BOOLEAN */,
              val: this.data[this.data_ptr++] === "T"
            };
          }
        } else if (schemaValue.type === 7 /* LOGICAL */) {
          if (type !== 3 /* ENUM */) {
            throw new Error(`Bad type ${type} found for boolean`);
          } else {
            return {
              type: 7 /* LOGICAL */,
              val: this.data[this.data_ptr++] === "T"
            };
          }
        } else if (schemaValue.type === 2 /* SELECT */) {
          let childTypes = schemaValue.child;
          let attr = null;
          let saved_ptr = this.data_ptr - 1;
          for (let i = 0; i < childTypes.length; i++) {
            this.data_ptr = saved_ptr;
            let type2 = childTypes[i];
            try {
              attr = this.ParseAttribute(type2);
              break;
            } catch (e) {
            }
          }
          if (!attr) {
            throw new Error(`None of the select types match!`);
          } else {
            return attr;
          }
        } else if (schemaValue.type === 3 /* ARRAY */) {
          if (type !== 7 /* SET_BEGIN */) {
            throw new Error(`Bad type ${type} found for array`);
          } else {
            let arr = [];
            let arrayType = this.data[this.data_ptr];
            while (arrayType !== 8 /* SET_END */) {
              arr.push(this.ParseAttribute(schemaValue.child));
              arrayType = this.data[this.data_ptr];
            }
            this.data_ptr++;
            return {
              type: 3 /* ARRAY */,
              val: arr
            };
          }
        } else {
          throw new Error(`Unsupported type ${schemaValue.type}`);
        }
      }
    }
    ParseNewAttribute() {
      if (this.schema.attributes.length <= this.schema_ptr) {
        throw new Error(`Exceeded schema length ${this.schema_ptr} ${this.schema.attributes.length}`);
      }
      let attr = this.schema.attributes[this.schema_ptr++];
      let schemaValue = attr.value;
      return {
        name: attr.name,
        val: this.ParseAttribute(schemaValue)
      };
    }
    ParseLineDataToSchema() {
      while (!this.AtEnd()) {
        this.attrInstances.push(this.ParseNewAttribute());
      }
      return this.attrInstances;
    }
  };
  function ParseLineToSchema(line, definition) {
    return new LineParser(line.data, definition.schema).ParseLineDataToSchema();
  }
  function FindGuidForComponent(component) {
    let guid = null;
    component.forEach((attr) => {
      if (attr.name === "GlobalId") {
        guid = attr.val.val;
      }
    });
    return guid;
  }
  function ClearGuidForComponent(component) {
    component.forEach((attr) => {
      if (attr.name === "GlobalId") {
        attr.val.val = "";
      }
    });
  }
  function ClearComponentValues(component) {
    component.forEach((attr) => {
      attr.val.type = 1 /* STRING */;
      attr.val.val = "";
    });
  }
  function ConvertIFCToECS(stringData, definitions) {
    let tokenizer = new Tokenizer();
    let ptr = 0;
    tokenizer.Tokenize((data, size) => {
      let start = ptr;
      let end = Math.min(ptr + size, stringData.length);
      for (let i = start; i < end; i++) {
        let index = i - start;
        data[index] = stringData.charCodeAt(i);
      }
      ptr = end;
      return end - start;
    });
    let parser = new Parser(tokenizer._tape);
    parser.ParseTape();
    let schemaMap = {};
    definitions.forEach((def) => {
      schemaMap[ComponentTypeToString(def.id)] = def;
    });
    let components = [];
    for (let i = 0; i < parser._lines.length; i++) {
      let line = parser._lines[i];
      let lineType = ComponentTypeToString([`ifc2x3`, line.type.toLocaleLowerCase()]);
      let definition = schemaMap[lineType];
      if (!definition) {
        throw new Error(`Unknown line type ${lineType}`);
      }
      let result = ParseLineToSchema(line, definition);
      if (definition.isRelationShip)
        ClearGuidForComponent(result);
      if (definition.isIfcOwnerHistory)
        ClearComponentValues(result);
      let component = {
        ref: line.id,
        hash: "",
        guid: !definition.isRelationShip ? FindGuidForComponent(result) : null,
        type: ["ifc2x3", line.type.toLocaleLowerCase()],
        data: result
      };
      components.push(component);
    }
    return new ECS(definitions, components);
  }
  var Line = class {
  };
  function BuildLine(lineData, currentExpressID, currentIfcType) {
    let l = new Line();
    l.id = currentExpressID;
    l.type = currentIfcType;
    l.data = lineData.slice(1, lineData.length - 2);
    return l;
  }
  var Parser = class {
    constructor(tape) {
      this._tape = [];
      this._line = [];
      this._lines = [];
      this._tape = tape;
    }
    ParseTape() {
      let maxExpressId = 0;
      let currentIfcType = "";
      let currentExpressID = 0;
      let insideLine = false;
      let ptr = 0;
      while (ptr != this._tape.length) {
        let t = this._tape[ptr++];
        if (t === 7 /* SET_BEGIN */) {
          insideLine = true;
        }
        if (insideLine)
          this._line.push(t);
        switch (t) {
          case 9 /* LINE_END */: {
            if (currentExpressID != 0) {
              this._lines.push(BuildLine(this._line, currentExpressID, currentIfcType));
            } else if (currentIfcType != "") {
            }
            insideLine = false;
            currentExpressID = 0;
            currentIfcType = "";
            this._line = [];
            break;
          }
          case 0 /* UNKNOWN */:
          case 6 /* EMPTY */:
          case 7 /* SET_BEGIN */:
          case 8 /* SET_END */:
            break;
          case 1 /* STRING */:
          case 3 /* ENUM */:
          case 4 /* REAL */: {
            let item = this._tape[ptr++];
            if (insideLine)
              this._line.push(item);
            break;
          }
          case 2 /* LABEL */: {
            let label = this._tape[ptr++];
            if (insideLine)
              this._line.push(label);
            if (currentIfcType === "") {
              currentIfcType = label;
            }
            break;
          }
          case 5 /* REF */: {
            let ref = this._tape[ptr++];
            if (insideLine)
              this._line.push(ref);
            if (currentExpressID == 0) {
              currentExpressID = ref;
            }
            break;
          }
          default:
            break;
        }
      }
    }
  };
  var BufferPointer = class {
    constructor() {
      this.bufPos = 0;
      this.bufLength = 0;
      this.done = false;
      this._readBuffer = new Int8Array(READ_BUF_SIZE);
    }
    Advance() {
      this.bufPos++;
      if (!this.done && this.AtEnd()) {
        this.bufPos = 0;
        this.bufLength = this._requestData(this._readBuffer, READ_BUF_SIZE);
        this.done = this.bufLength == 0;
      }
      this.prev = this.cur;
      this.cur = this.next;
      this.next = this.done ? 0 : this._readBuffer[this.bufPos];
    }
    AtEnd() {
      return this.bufPos >= this.bufLength;
    }
  };
  var Tokenizer = class {
    constructor() {
      this._temp = [];
      this._tape = [];
      this._ptr = new BufferPointer();
    }
    Tokenize(requestData) {
      this._ptr._requestData = requestData;
      this._ptr.bufPos = 1;
      this._ptr.bufLength = 0;
      this._ptr.Advance();
      this._ptr.Advance();
      let numLines = 0;
      while (this.TokenizeLine()) {
        numLines++;
      }
      return numLines;
    }
    TokenizeLine() {
      let eof = false;
      while (true) {
        if (this._ptr.done) {
          eof = true;
          break;
        }
        const c = this._ptr.cur;
        let isWhiteSpace = c == " ".charCodeAt(0) || c == "\n".charCodeAt(0) || c == "\r".charCodeAt(0) || c == "	".charCodeAt(0);
        if (isWhiteSpace) {
          this._ptr.Advance();
          continue;
        }
        if (c == "'".charCodeAt(0)) {
          this._ptr.Advance();
          let prevSlash = false;
          this._temp = [];
          while (true) {
            this._temp.push(this._ptr.cur);
            if (this._ptr.cur == "'".charCodeAt(0)) {
              if (this._ptr.next == "'".charCodeAt(0)) {
                this._ptr.Advance();
                this._temp.push(this._ptr.cur);
              } else {
                this._temp.pop();
                break;
              }
            }
            this._ptr.Advance();
          }
          this._tape.push(1 /* STRING */);
          this._tape.push(String.fromCharCode(...this._temp));
        } else if (c == "#".charCodeAt(0)) {
          this._ptr.Advance();
          let num = this.readInt();
          this._tape.push(5 /* REF */);
          this._tape.push(num);
          continue;
        } else if (c == "$".charCodeAt(0)) {
          this._tape.push(6 /* EMPTY */);
        } else if (c == "*".charCodeAt(0)) {
          if (this._ptr.prev == "/".charCodeAt(0)) {
            this._ptr.Advance();
            while (!(this._ptr.prev == "*".charCodeAt(0) && this._ptr.cur == "/".charCodeAt(0))) {
              this._ptr.Advance();
            }
          } else {
            this._tape.push(0 /* UNKNOWN */);
          }
        } else if (c == "(".charCodeAt(0)) {
          this._tape.push(7 /* SET_BEGIN */);
        } else if (c >= "0".charCodeAt(0) && c <= "9".charCodeAt(0)) {
          let negative = this._ptr.prev == "-".charCodeAt(0);
          let value = this.readDouble();
          if (negative) {
            value *= -1;
          }
          this._tape.push(4 /* REAL */);
          this._tape.push(value);
          continue;
        } else if (c == ".".charCodeAt(0)) {
          this._temp = [];
          this._ptr.Advance();
          while (this._ptr.cur != ".".charCodeAt(0)) {
            this._temp.push(this._ptr.cur);
            this._ptr.Advance();
          }
          this._tape.push(3 /* ENUM */);
          this._tape.push(String.fromCharCode(...this._temp));
        } else if (c >= "A".charCodeAt(0) && c <= "Z".charCodeAt(0) || c >= "a".charCodeAt(0) && c <= "z".charCodeAt(0)) {
          this._temp = [];
          while (this._ptr.cur >= "A".charCodeAt(0) && this._ptr.cur <= "Z".charCodeAt(0) || this._ptr.cur >= "a".charCodeAt(0) && this._ptr.cur <= "z".charCodeAt(0) || this._ptr.cur >= "0".charCodeAt(0) && this._ptr.cur <= "9".charCodeAt(0) || this._ptr.cur == "_".charCodeAt(0)) {
            this._temp.push(this._ptr.cur);
            this._ptr.Advance();
          }
          this._tape.push(2 /* LABEL */);
          this._tape.push(String.fromCharCode(...this._temp));
          continue;
        } else if (c == ")".charCodeAt(0)) {
          this._tape.push(8 /* SET_END */);
        } else if (c == ";".charCodeAt(0)) {
          this._tape.push(9 /* LINE_END */);
          this._ptr.Advance();
          break;
        }
        this._ptr.Advance();
      }
      return !eof && !this._ptr.done;
    }
    readInt() {
      let val = 0;
      let c = this._ptr.cur;
      this._temp = [];
      while (c >= "0".charCodeAt(0) && c <= "9".charCodeAt(0)) {
        this._temp.push(c);
        this._ptr.Advance();
        c = this._ptr.cur;
      }
      return parseInt(String.fromCharCode(...this._temp));
    }
    readDouble() {
      let c = this._ptr.cur;
      this._temp = [];
      while (this._ptr.cur >= "0".charCodeAt(0) && this._ptr.cur <= "9".charCodeAt(0) || this._ptr.cur == ".".charCodeAt(0) || this._ptr.cur == "e".charCodeAt(0) || this._ptr.cur == "E".charCodeAt(0) || this._ptr.cur == "-".charCodeAt(0) || this._ptr.cur == "+".charCodeAt(0)) {
        this._temp.push(this._ptr.cur);
        this._ptr.Advance();
      }
      let d = parseFloat(String.fromCharCode(...this._temp));
      return d;
    }
  };

  // bl_web.ts
  console.log(`BL web`);
  var ledger = { transactions: [] };
  var current_ecs = new ECS([], []);
  function DownloadString(str, name) {
    const uri = window.URL.createObjectURL(new Blob([str], {
      type: "text/plain"
    }));
    var link = document.createElement("a");
    link.setAttribute("download", name);
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  document.addEventListener("DOMContentLoaded", function() {
    let outputLog = document.getElementById("outputlog");
    let schema_select = document.getElementById("select_schema");
    document.getElementById("button_dl_ecs").onclick = () => {
      DownloadString(JSON.stringify(current_ecs, null, 4), "ecs.json");
    };
    document.getElementById("button_dl_ledger").onclick = () => {
      DownloadString(JSON.stringify(ledger, null, 4), "ledger.json");
    };
    function log(txt) {
      outputLog.innerHTML += txt + "<br>";
    }
    log(`Choose a file above, and select the schema of the file`);
    log(`!!! NOTE: Mixing schemas will make everything explode !!!`);
    document.getElementById("fileinput").onchange = function(evt) {
      let schema = schema_select.value;
      var reader = new FileReader();
      console.log(`input change`);
      reader.onload = async function(evt2) {
        if (evt2.target.readyState != 2)
          return;
        if (evt2.target.error) {
          alert("Error while reading file");
          return;
        }
        try {
          log(``);
          log(`Current ECS has ${current_ecs.definitions.length} definitions`);
          log(`Current ECS has ${current_ecs.components.length} components`);
          let filecontent = evt2.target.result;
          let schemaFileName = schema === "ifc2x3" ? "ifc2x3.exp" : "IFC4.exp";
          log(`Using schema ${schemaFileName}`);
          let response = await (await fetch(schemaFileName)).text();
          log(`Converting IFC file to ECS...`);
          let modified_ecs = ConvertIFCToECS(filecontent, ParseEXP(response));
          log(`Done`);
          log(`Added ECS has ${modified_ecs.definitions.length} definitions`);
          log(`Added ECS has ${modified_ecs.components.length} components`);
          log(`Creating transaction...`);
          let transaction = DiffECS(current_ecs, modified_ecs);
          log(`Done!`);
          log(`Transaction has ${transaction.delta.definitions.created.length} created definitions`);
          log(`Transaction has ${transaction.delta.components.added.length} added components`);
          log(`Transaction has ${transaction.delta.components.removed.length} removed components`);
          log(`Transaction has ${transaction.delta.components.modified.length} modified components`);
          log(`Current ECS has ${current_ecs.definitions.length} definitions`);
          log(`Current ECS has ${current_ecs.components.length} components`);
          ledger.transactions.push(transaction);
          log(`Current ledger has ${ledger.transactions.length} transactions`);
          current_ecs = BuildECS(ledger);
        } catch (e) {
          log(e);
          log(`Please check if you're using the right schema, otherwise, sorry :-)`);
        }
      };
      reader.readAsText(evt.target.files[0]);
    };
  }, false);
})();
