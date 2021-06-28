"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotebookSerializer = void 0;
var util_1 = require("util");
var vscode = require("vscode");
var stringify = require('json-stringify-safe');
var NotebookSerializer = /** @class */ (function () {
    function NotebookSerializer() {
    }
    NotebookSerializer.prototype.deserializeNotebook = function (content, _token) {
        return __awaiter(this, void 0, void 0, function () {
            function convertRawOutputToBytes(raw) {
                var e_1, _a;
                var result = [];
                try {
                    for (var _b = __values(raw.outputs), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var output = _c.value;
                        var data = new util_1.TextEncoder().encode(stringify(output.value));
                        result.push(new vscode.NotebookCellOutputItem(data, output.mime));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return result;
            }
            var contents, raw, cells, i, cell;
            return __generator(this, function (_a) {
                contents = new util_1.TextDecoder().decode(content);
                try {
                    raw = JSON.parse(contents);
                }
                catch (_b) {
                    raw = [];
                }
                cells = raw.map(function (item) { return new vscode.NotebookCellData(item.kind, item.value, item.language); });
                for (i = 0; i < cells.length; i++) {
                    cell = cells[i];
                    cell.outputs = raw[i].outputs ? [new vscode.NotebookCellOutput(convertRawOutputToBytes(raw[i]))] : [];
                }
                // Pass read and formatted Notebook Data to VS Code to display Notebook with saved cells
                return [2 /*return*/, new vscode.NotebookData(cells)];
            });
        });
    };
    NotebookSerializer.prototype.serializeNotebook = function (data, _token) {
        return __awaiter(this, void 0, void 0, function () {
            // function to take output renderer data to a format to save to the file
            function asRawOutput(cell) {
                var e_3, _a, e_4, _b;
                var _c;
                var result = [];
                try {
                    for (var _d = __values((_c = cell.outputs) !== null && _c !== void 0 ? _c : []), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var output = _e.value;
                        try {
                            for (var _f = (e_4 = void 0, __values(output.items)), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var item = _g.value;
                                var outputContents = '';
                                try {
                                    outputContents = new util_1.TextDecoder().decode(item.data);
                                }
                                catch (_h) {
                                }
                                try {
                                    var outputData = JSON.parse(outputContents);
                                    result.push({ mime: item.mime, value: outputData });
                                }
                                catch (_j) {
                                    result.push({ mime: item.mime, value: outputContents });
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                return result;
            }
            var contents, _a, _b, cell;
            var e_2, _c;
            return __generator(this, function (_d) {
                contents = [];
                try {
                    for (_a = __values(data.cells), _b = _a.next(); !_b.done; _b = _a.next()) {
                        cell = _b.value;
                        contents.push({
                            kind: cell.kind,
                            language: cell.languageId,
                            value: cell.value,
                            outputs: asRawOutput(cell)
                        });
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                // Give a string of all the data to save and VS Code will handle the rest 
                return [2 /*return*/, new util_1.TextEncoder().encode(stringify(contents))];
            });
        });
    };
    return NotebookSerializer;
}());
exports.NotebookSerializer = NotebookSerializer;
//# sourceMappingURL=notebookSerializer.js.map