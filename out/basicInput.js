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
Object.defineProperty(exports, "__esModule", { value: true });
exports.showInputBox = exports.showQuickPick = void 0;
const vscode_1 = require("vscode");
/**
 * Shows a pick list using window.showQuickPick().
 */
function showQuickPick() {
    return __awaiter(this, void 0, void 0, function* () {
        let i = 0;
        const result = yield vscode_1.window.showQuickPick(['eins', 'zwei', 'drei'], {
            placeHolder: 'eins, zwei or drei',
            onDidSelectItem: item => vscode_1.window.showInformationMessage(`Focus ${++i}: ${item}`)
        });
        vscode_1.window.showInformationMessage(`Got: ${result}`);
    });
}
exports.showQuickPick = showQuickPick;
/**
 * Shows an input box using window.showInputBox().
 */
function showInputBox() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield vscode_1.window.showInputBox({
            value: 'abcdef',
            valueSelection: [2, 4],
            placeHolder: 'For example: fedcba. But not: 123',
            validateInput: text => {
                vscode_1.window.showInformationMessage(`Validating: ${text}`);
                return text === '123' ? 'Not 123!' : null;
            }
        });
        vscode_1.window.showInformationMessage(`Got: ${result}`);
    });
}
exports.showInputBox = showInputBox;
//# sourceMappingURL=basicInput.js.map