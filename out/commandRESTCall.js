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
exports.showCallTypeQuickPick = void 0;
const vscode_1 = require("vscode");
const extension_1 = require("./extension");
function showCallTypeQuickPick() {
    return __awaiter(this, void 0, void 0, function* () {
        const picker = yield vscode_1.window.showQuickPick(['GET', 'POST', 'PUT', 'DELETE'], {
            placeHolder: 'Make a GET, POST, PUT, or DELETE call',
            onDidSelectItem: item => { if (extension_1.DEBUG_MODE) {
                console.log(`showCallTypeQuickPick :: selecting ${item}`);
            } }
        });
        return picker;
    });
}
exports.showCallTypeQuickPick = showCallTypeQuickPick;
//# sourceMappingURL=commandRESTCall.js.map