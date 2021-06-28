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
exports.registerCommands = void 0;
var vscode = require("vscode");
var secrets = require("../common/secrets");
var SecretItem = /** @class */ (function () {
    function SecretItem(label) {
        this.label = label;
    }
    return SecretItem;
}());
var AddNewSecretItem = /** @class */ (function () {
    function AddNewSecretItem() {
        this.label = '$(plus) Add New Secret...';
        this.alwaysShow = true;
    }
    return AddNewSecretItem;
}());
var ViewSecretItem = /** @class */ (function () {
    function ViewSecretItem(secret) {
        this.alwaysShow = true;
        this.secretName = secret;
    }
    Object.defineProperty(ViewSecretItem.prototype, "label", {
        get: function () {
            return "View the secret for " + this.secretName + "...";
        },
        enumerable: false,
        configurable: true
    });
    return ViewSecretItem;
}());
var DeleteSecretItem = /** @class */ (function () {
    function DeleteSecretItem(secret) {
        this.alwaysShow = true;
        this.secretName = secret;
    }
    Object.defineProperty(DeleteSecretItem.prototype, "label", {
        get: function () {
            return "Delete " + this.secretName + "...";
        },
        enumerable: false,
        configurable: true
    });
    return DeleteSecretItem;
}());
var SetSecretName = /** @class */ (function () {
    function SetSecretName(placeholder) {
        this.secretName = '';
        this.alwaysShow = true;
        if (placeholder) {
            this.secretName = placeholder;
        }
    }
    Object.defineProperty(SetSecretName.prototype, "label", {
        get: function () {
            return this.secretName;
        },
        enumerable: false,
        configurable: true
    });
    return SetSecretName;
}());
var SetSecretValueItem = /** @class */ (function () {
    function SetSecretValueItem(placeholder) {
        this.secret = '';
        this.alwaysShow = true;
        if (placeholder) {
            this.secret = placeholder;
        }
    }
    Object.defineProperty(SetSecretValueItem.prototype, "label", {
        get: function () {
            return this.secret;
        },
        enumerable: false,
        configurable: true
    });
    return SetSecretValueItem;
}());
var InteractiveSecretPickerState;
(function (InteractiveSecretPickerState) {
    InteractiveSecretPickerState[InteractiveSecretPickerState["selectAction"] = 0] = "selectAction";
    InteractiveSecretPickerState[InteractiveSecretPickerState["editSecret"] = 1] = "editSecret";
})(InteractiveSecretPickerState || (InteractiveSecretPickerState = {}));
var InteractiveSecretInputState;
(function (InteractiveSecretInputState) {
    InteractiveSecretInputState[InteractiveSecretInputState["addSecretName"] = 0] = "addSecretName";
    InteractiveSecretInputState[InteractiveSecretInputState["addSecretValue"] = 1] = "addSecretValue";
})(InteractiveSecretInputState || (InteractiveSecretInputState = {}));
function _getSecretInput(state, autofills) {
    var quickInput = vscode.window.createInputBox();
    quickInput.value = autofills.label;
    switch (+state) {
        case InteractiveSecretInputState.addSecretName:
            if (autofills.label === '') {
                quickInput.title = "Create a name for your secret";
            }
            else {
                quickInput.title = "Edit name of secret";
            }
            break;
        case InteractiveSecretInputState.addSecretValue:
            if (autofills.label === '') {
                quickInput.title = "Add secret";
            }
            else {
                quickInput.title = "Edit secret";
            }
            break;
    }
    return quickInput;
}
function _showSecretInput(state, autofills) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, _) {
                    var quickInput = _getSecretInput(state, autofills);
                    var closeQuickInput = function () {
                        quickInput.hide();
                        quickInput.dispose();
                    };
                    quickInput.onDidAccept(function () {
                        if (autofills instanceof SetSecretName) {
                            resolve({ value: quickInput.value, id: 'name' });
                        }
                        else if (autofills instanceof SetSecretValueItem) {
                            closeQuickInput();
                            resolve({ value: quickInput.value, id: 'value' });
                        }
                    });
                    quickInput.show();
                })];
        });
    });
}
function _getSecretPicker(state, extra) {
    var quickPick = vscode.window.createQuickPick();
    quickPick.ignoreFocusOut = true;
    var newQpItems = [];
    switch (+state) {
        case InteractiveSecretPickerState.selectAction:
            var secretListItems = extra.map(function (b) { return new SecretItem(b); });
            quickPick.title = 'View an existing secret or add a new secret';
            newQpItems = __spreadArray([], __read(secretListItems));
            newQpItems.splice(0, 0, new AddNewSecretItem());
            break;
        case InteractiveSecretPickerState.editSecret:
            if (typeof extra === 'string') {
                quickPick.title = "View or delete " + extra;
                newQpItems.push(new ViewSecretItem(extra));
                newQpItems.push(new DeleteSecretItem(extra));
                break;
            }
    }
    quickPick.items = newQpItems;
    return quickPick;
}
function _showSecretPicker(state, extra) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, _reject) {
                    var quickPick = _getSecretPicker(state, extra);
                    var secret;
                    var closeQuickPick = function () {
                        quickPick.busy = false;
                        quickPick.hide();
                        quickPick.dispose();
                    };
                    quickPick.onDidAccept(function () { return __awaiter(_this, void 0, void 0, function () {
                        var selected;
                        return __generator(this, function (_a) {
                            quickPick.busy = true;
                            selected = quickPick.selectedItems[0];
                            if (selected instanceof AddNewSecretItem) {
                                resolve({ type: 'command', id: 'new' });
                                return [2 /*return*/];
                            }
                            if (selected instanceof ViewSecretItem) {
                                resolve({ type: 'command', id: 'view', value: extra });
                                return [2 /*return*/];
                            }
                            if (selected instanceof DeleteSecretItem) {
                                resolve({ type: 'command', id: 'delete', value: extra });
                                closeQuickPick();
                                return [2 /*return*/];
                            }
                            secret = selected.label;
                            closeQuickPick();
                            return [2 /*return*/];
                        });
                    }); });
                    quickPick.onDidHide(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (secret) {
                                resolve({ type: 'secret', id: 'secret', value: secret });
                            }
                            else {
                                resolve(null);
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    quickPick.show();
                })];
        });
    });
}
function _useInteractiveSecretInput(state, secret) {
    return __awaiter(this, void 0, void 0, function () {
        var placeholder, inputResult, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (secret) {
                        placeholder = secrets.getSecret(secret);
                    }
                    _a = +state;
                    switch (_a) {
                        case InteractiveSecretInputState.addSecretName: return [3 /*break*/, 1];
                        case InteractiveSecretInputState.addSecretValue: return [3 /*break*/, 3];
                    }
                    return [3 /*break*/, 5];
                case 1: return [4 /*yield*/, _showSecretInput(state, new SetSecretName(placeholder))];
                case 2:
                    inputResult = _b.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, _showSecretInput(state, new SetSecretValueItem(placeholder))];
                case 4:
                    inputResult = _b.sent();
                    return [3 /*break*/, 5];
                case 5:
                    if ((inputResult === null || inputResult === void 0 ? void 0 : inputResult.id) === 'name') {
                        _useInteractiveSecretInput(InteractiveSecretInputState.addSecretValue, inputResult.value);
                    }
                    else if ((inputResult === null || inputResult === void 0 ? void 0 : inputResult.id) === 'value' && secret) {
                        secrets.addSecret(secret, inputResult.value);
                        vscode.window.showInformationMessage("Saved secret for " + secret + ".");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function _useInteractiveSecretPicker(state, extra) {
    return __awaiter(this, void 0, void 0, function () {
        var pickerResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _showSecretPicker(state, extra)];
                case 1:
                    pickerResult = _a.sent();
                    if (!pickerResult) {
                        return [2 /*return*/];
                    }
                    if (pickerResult.type === 'secret') {
                        _useInteractiveSecretPicker(InteractiveSecretPickerState.editSecret, pickerResult.value);
                        return [2 /*return*/];
                    }
                    if (pickerResult.type === 'command' && pickerResult.id === 'new') {
                        _useInteractiveSecretInput(InteractiveSecretInputState.addSecretName);
                        return [2 /*return*/];
                    }
                    if (pickerResult.type === 'command' && pickerResult.id === 'view') {
                        if (pickerResult.value) {
                            _useInteractiveSecretInput(InteractiveSecretInputState.addSecretValue, pickerResult.value);
                        }
                        else {
                            _useInteractiveSecretInput(InteractiveSecretInputState.addSecretValue);
                        }
                        return [2 /*return*/];
                    }
                    if (pickerResult.type === 'command' && pickerResult.id === 'delete') {
                        if (pickerResult.value) {
                            secrets.deleteSecret(pickerResult.value);
                        }
                        vscode.window.showInformationMessage("Deleted secret " + pickerResult.value + ".");
                        return [2 /*return*/];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function registerCommands() {
    var _a;
    var _this = this;
    var subscriptions = [];
    subscriptions.push(vscode.commands.registerCommand('rest-book.secrets', function () {
        _useInteractiveSecretPicker(InteractiveSecretPickerState.selectAction, secrets.getNamesOfSecrets());
    }));
    subscriptions.push(vscode.commands.registerCommand('rest-book.newNotebook', function () { return __awaiter(_this, void 0, void 0, function () {
        var newNotebook;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.workspace.openNotebookDocument('rest-book', new vscode.NotebookData([
                        new vscode.NotebookCellData(vscode.NotebookCellKind.Code, '', 'rest-book')
                    ]))];
                case 1:
                    newNotebook = _a.sent();
                    vscode.window.showNotebookDocument(newNotebook);
                    return [2 /*return*/];
            }
        });
    }); }));
    return (_a = vscode.Disposable).from.apply(_a, __spreadArray([], __read(subscriptions)));
}
exports.registerCommands = registerCommands;
//# sourceMappingURL=commands.js.map