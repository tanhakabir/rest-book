"use strict";
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLanguageProvider = exports.VariableCompletionItemProvider = exports.CacheVariableCompletionItemProvider = exports.HeaderCompletionItemProvider = exports.KeywordCompletionItemProvider = void 0;
var vscode = require("vscode");
var common_1 = require("../common/common");
var cache_1 = require("../common/cache");
var httpConstants_1 = require("../common/httpConstants");
var selector = { language: common_1.NAME };
var KeywordCompletionItemProvider = /** @class */ (function () {
    function KeywordCompletionItemProvider() {
    }
    KeywordCompletionItemProvider.prototype.provideCompletionItems = function (document, position, _token, _context) {
        var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
        var result = [];
        var autocompleteMethod = position.line === 0 ? true : false;
        try {
            for (var _e = __values(Object.values(httpConstants_1.Method)), _f = _e.next(); !_f.done; _f = _e.next()) {
                var field = _f.value;
                if (document.lineAt(position).text.includes(field)) {
                    autocompleteMethod = false;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (autocompleteMethod) {
            try {
                for (var _g = __values(Object.values(httpConstants_1.Method)), _h = _g.next(); !_h.done; _h = _g.next()) {
                    var field = _h.value;
                    result.push({
                        label: field,
                        insertText: field + " ",
                        detail: 'HTTP request method',
                        kind: vscode.CompletionItemKind.Method
                    });
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        if (position.line !== 0) {
            try {
                for (var _j = __values(Object.values(httpConstants_1.RequestHeaderField)), _k = _j.next(); !_k.done; _k = _j.next()) {
                    var field = _k.value;
                    result.push({
                        label: field,
                        insertText: field + ": ",
                        detail: 'HTTP request header field',
                        kind: vscode.CompletionItemKind.Field
                    });
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        try {
            for (var _l = __values(cache_1.getBaseUrls()), _m = _l.next(); !_m.done; _m = _l.next()) {
                var url = _m.value;
                result.push({
                    label: url,
                    kind: vscode.CompletionItemKind.Keyword
                });
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
            }
            finally { if (e_4) throw e_4.error; }
        }
        ["const", "let"].forEach(function (str) {
            result.push({
                label: str,
                insertText: str + " ",
                kind: vscode.CompletionItemKind.Keyword
            });
        });
        return result;
    };
    KeywordCompletionItemProvider.triggerCharacters = [];
    return KeywordCompletionItemProvider;
}());
exports.KeywordCompletionItemProvider = KeywordCompletionItemProvider;
var HeaderCompletionItemProvider = /** @class */ (function () {
    function HeaderCompletionItemProvider() {
    }
    HeaderCompletionItemProvider.prototype.provideCompletionItems = function (_document, position, _token, _context) {
        var e_5, _a;
        var result = [];
        if (position.line === 0) {
            return result;
        }
        try {
            for (var _b = __values(Object.values(httpConstants_1.MIMEType)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var field = _c.value;
                result.push({
                    label: field,
                    detail: 'HTTP MIME type',
                    kind: vscode.CompletionItemKind.EnumMember
                });
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return result;
    };
    HeaderCompletionItemProvider.triggerCharacters = [':'];
    return HeaderCompletionItemProvider;
}());
exports.HeaderCompletionItemProvider = HeaderCompletionItemProvider;
var CacheVariableCompletionItemProvider = /** @class */ (function () {
    function CacheVariableCompletionItemProvider() {
    }
    CacheVariableCompletionItemProvider.prototype.provideCompletionItems = function (_document, _position, _token, _context) {
        var e_6, _a;
        var result = [];
        try {
            for (var _b = __values(cache_1.getVariableNames()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var variable = _c.value;
                result.push({
                    label: variable,
                    kind: vscode.CompletionItemKind.Variable
                });
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return result;
    };
    CacheVariableCompletionItemProvider.triggerCharacters = ['$'];
    return CacheVariableCompletionItemProvider;
}());
exports.CacheVariableCompletionItemProvider = CacheVariableCompletionItemProvider;
var VariableCompletionItemProvider = /** @class */ (function () {
    function VariableCompletionItemProvider() {
    }
    VariableCompletionItemProvider.prototype.provideCompletionItems = function (document, position, _token, _context) {
        var e_7, _a;
        var result = [];
        var text = document.lineAt(position.line).text.substring(0, position.character);
        var startingIndex = Math.max(text.lastIndexOf(' '), text.lastIndexOf('='), text.lastIndexOf('/')) + 1;
        var varName = text.substring(startingIndex).trim();
        if (!varName.startsWith('$')) {
            return result;
        }
        varName = varName.substr(1, varName.length - 2);
        var matchingData = cache_1.attemptToLoadVariable(varName);
        if (matchingData && typeof matchingData === 'object') {
            try {
                for (var _b = __values(Object.keys(matchingData)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    result.push({
                        label: key,
                        kind: vscode.CompletionItemKind.Variable
                    });
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
        }
        return result;
    };
    VariableCompletionItemProvider.triggerCharacters = ['.'];
    return VariableCompletionItemProvider;
}());
exports.VariableCompletionItemProvider = VariableCompletionItemProvider;
function registerLanguageProvider() {
    var _a, _b, _c, _d, _e;
    var disposables = [];
    // TODO add hover provider or definition provider
    disposables.push((_a = vscode.languages).registerCompletionItemProvider.apply(_a, __spreadArray([selector, new KeywordCompletionItemProvider()], __read(KeywordCompletionItemProvider.triggerCharacters))));
    disposables.push((_b = vscode.languages).registerCompletionItemProvider.apply(_b, __spreadArray([selector, new HeaderCompletionItemProvider()], __read(HeaderCompletionItemProvider.triggerCharacters))));
    disposables.push((_c = vscode.languages).registerCompletionItemProvider.apply(_c, __spreadArray([selector, new CacheVariableCompletionItemProvider()], __read(CacheVariableCompletionItemProvider.triggerCharacters))));
    disposables.push((_d = vscode.languages).registerCompletionItemProvider.apply(_d, __spreadArray([selector, new VariableCompletionItemProvider()], __read(VariableCompletionItemProvider.triggerCharacters))));
    return (_e = vscode.Disposable).from.apply(_e, __spreadArray([], __read(disposables)));
}
exports.registerLanguageProvider = registerLanguageProvider;
//# sourceMappingURL=languageProvider.js.map