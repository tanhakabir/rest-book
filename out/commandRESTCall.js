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
exports.commandRESTCall = void 0;
const vscode_1 = require("vscode");
const common_1 = require("./common");
const multiStepInput_1 = require("./multiStepInput");
const axios = require('axios').default;
function commandRESTCall(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const callTypes = ['GET', 'POST', 'PUT', 'DELETE']
            .map(label => ({ label }));
        const title = 'Perform REST Call';
        function collectInputs() {
            return __awaiter(this, void 0, void 0, function* () {
                const state = {};
                yield multiStepInput_1.MultiStepInput.run(input => pickRESTCallType(input, state));
                return state;
            });
        }
        function pickRESTCallType(input, state) {
            return __awaiter(this, void 0, void 0, function* () {
                const pick = yield input.showQuickPick({
                    title,
                    step: 1,
                    totalSteps: 3,
                    placeholder: 'Which type of REST call do you want to make?',
                    items: callTypes,
                    activeItem: typeof state.callType !== 'string' ? state.callType : undefined,
                    shouldResume: shouldResume
                });
                state.callType = pick;
                if (common_1.DEBUG_MODE) {
                    console.log(`pickRESTCallType :: call type chosen ${pick.label}`);
                }
                return (input) => inputURL(input, state);
            });
        }
        function inputURL(input, state) {
            return __awaiter(this, void 0, void 0, function* () {
                state.url = yield input.showInputBox({
                    title,
                    step: 2,
                    totalSteps: 3,
                    value: state.url || '',
                    prompt: 'Enter the endpoint location as: https://endpoint.com',
                    validate: _validateURL,
                    shouldResume: shouldResume
                });
            });
        }
        function _validateURL(url) {
            return __awaiter(this, void 0, void 0, function* () {
                // wait before validating
                yield new Promise(resolve => setTimeout(resolve, 1000));
                return common_1.validateURL(url) ? undefined : 'Not a valid HTTP/HTTPS URL.';
            });
        }
        function shouldResume() {
            // Could show a notification with the option to resume.
            return new Promise((resolve, reject) => {
                // noop
            });
        }
        const state = yield collectInputs();
        vscode_1.window.showInformationMessage(`Attempting to perform ${state.callType === 'string' ?
            state.callType :
            state.callType.label} 
														call to ${state.url}`);
        try {
            let response = yield axios.get(state.url);
            console.log(response);
        }
        catch (exception) {
            console.log(exception);
        }
        return { callType: state.callType === 'string' ? state.callType : state.callType.label, url: state.url };
    });
}
exports.commandRESTCall = commandRESTCall;
//# sourceMappingURL=commandRESTCall.js.map