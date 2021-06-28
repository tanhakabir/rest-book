"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.NotebookKernel = void 0;
var common_1 = require("../common/common");
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var request_1 = require("../common/request");
var response_1 = require("../common/response");
var cache_1 = require("../common/cache");
var axios = require('axios').default;
var stringify = require('json-stringify-safe');
var NotebookKernel = /** @class */ (function () {
    function NotebookKernel() {
        this.id = 'rest-book-kernel';
        this.label = 'REST Book Kernel';
        this.supportedLanguages = ['rest-book'];
        // private readonly _renderMessaging: vscode.NotebookRendererMessaging;
        this._executionOrder = 0;
        this._controller = vscode.notebooks.createNotebookController('rest-book-kernel', 'rest-book', 'REST Book');
        this._controller.supportedLanguages = ['rest-book'];
        this._controller.supportsExecutionOrder = true;
        this._controller.description = 'A notebook for making REST calls.';
        this._controller.executeHandler = this._executeAll.bind(this);
        // this._renderMessaging = vscode.notebooks.createRendererMessaging('rest-book');
        // this._renderMessaging.onDidReceiveMessage(this._handleMessage.bind(this));
    }
    NotebookKernel.prototype.dispose = function () {
        this._controller.dispose();
    };
    NotebookKernel.prototype._executeAll = function (cells, _notebook, _controller) {
        var e_1, _a;
        try {
            for (var cells_1 = __values(cells), cells_1_1 = cells_1.next(); !cells_1_1.done; cells_1_1 = cells_1.next()) {
                var cell = cells_1_1.value;
                this._doExecution(cell);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (cells_1_1 && !cells_1_1.done && (_a = cells_1.return)) _a.call(cells_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    NotebookKernel.prototype._doExecution = function (cell) {
        return __awaiter(this, void 0, void 0, function () {
            var execution, logger, req, parser, cancelTokenAxios_1, options, response, exception_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        execution = this._controller.createNotebookCellExecution(cell);
                        execution.executionOrder = ++this._executionOrder;
                        execution.start(Date.now());
                        logger = function (d, r, requestParser) {
                            try {
                                var response = new response_1.ResponseParser(d, r, requestParser);
                                cache_1.updateCache(requestParser, response);
                                execution.replaceOutput([new vscode.NotebookCellOutput([
                                        vscode.NotebookCellOutputItem.json(response.renderer(), common_1.MIME_TYPE),
                                        vscode.NotebookCellOutputItem.json(response.json()),
                                        vscode.NotebookCellOutputItem.text(response.html(), 'text/html')
                                    ])]);
                                execution.end(true, Date.now());
                            }
                            catch (e) {
                                execution.replaceOutput([
                                    new vscode.NotebookCellOutput([
                                        vscode.NotebookCellOutputItem.error({
                                            name: e instanceof Error && e.name || 'error',
                                            message: e instanceof Error && e.message || stringify(e, undefined, 4)
                                        })
                                    ])
                                ]);
                                execution.end(false, Date.now());
                            }
                        };
                        try {
                            parser = new request_1.RequestParser(cell.document.getText());
                            req = parser.getRequest();
                            if (req === undefined) {
                                execution.end(true, Date.now());
                                return [2 /*return*/];
                            }
                        }
                        catch (err) {
                            execution.replaceOutput([
                                new vscode.NotebookCellOutput([
                                    common_1.DEBUG_MODE ?
                                        vscode.NotebookCellOutputItem.error(err) :
                                        vscode.NotebookCellOutputItem.error({
                                            name: err instanceof Error && err.name || 'error',
                                            message: err instanceof Error && err.message || stringify(err, undefined, 4)
                                        })
                                ])
                            ]);
                            execution.end(false, Date.now());
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        cancelTokenAxios_1 = axios.CancelToken.source();
                        options = __assign({}, req);
                        options['cancelToken'] = cancelTokenAxios_1.token;
                        execution.token.onCancellationRequested(function (_) { return cancelTokenAxios_1.cancel(); });
                        return [4 /*yield*/, axios(options)];
                    case 2:
                        response = _a.sent();
                        logger(response, req, parser);
                        return [3 /*break*/, 4];
                    case 3:
                        exception_1 = _a.sent();
                        logger(exception_1, req, parser);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // private async _handleMessage(event: vscode.NotebookRendererMessage<any>) {
    //     switch(event.message.command) {
    //         case 'save-response': 
    //             this._saveDataToFile(event.message.data);
    //             return;
    //         default: break;
    //     }
    // }
    NotebookKernel.prototype._saveDataToFile = function (data) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var workSpaceDir, name, url, name_1, date, defaultPath, location;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        workSpaceDir = path.dirname((_b = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri.fsPath) !== null && _b !== void 0 ? _b : '');
                        if (!workSpaceDir) {
                            return [2 /*return*/];
                        }
                        url = (_c = data.request) === null || _c === void 0 ? void 0 : _c.responseUrl;
                        if (url) {
                            name_1 = url;
                            name_1 = name_1.replace(/^[A-Za-z0-9]+\./g, '');
                            name_1 = name_1.replace(/\.[A-Za-z0-9]+$/g, '');
                            name_1 = name_1.replace(/\./g, '-');
                        }
                        else {
                            name = 'unknown-url';
                        }
                        date = new Date().toDateString().replace(/\s/g, '-');
                        defaultPath = vscode.Uri.file(path.join(workSpaceDir, "response-" + name + "-" + date + ".json"));
                        return [4 /*yield*/, vscode.window.showSaveDialog({ defaultUri: defaultPath })];
                    case 1:
                        location = _d.sent();
                        if (!location) {
                            return [2 /*return*/];
                        }
                        fs.writeFile(location === null || location === void 0 ? void 0 : location.fsPath, stringify(data, null, 4), { flag: 'w' }, function (e) {
                            vscode.window.showInformationMessage((e === null || e === void 0 ? void 0 : e.message) || "Saved response to " + location);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    return NotebookKernel;
}());
exports.NotebookKernel = NotebookKernel;
//# sourceMappingURL=notebookKernel.js.map