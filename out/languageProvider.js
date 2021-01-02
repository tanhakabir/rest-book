"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLanguageProvider = void 0;
const vscode = require("vscode");
const common_1 = require("./common");
const selector = { language: common_1.NAME };
function registerLanguageProvider() {
    const disposables = [];
    return vscode.Disposable.from(...disposables);
}
exports.registerLanguageProvider = registerLanguageProvider;
//# sourceMappingURL=languageProvider.js.map