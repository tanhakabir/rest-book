"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
const React = require("react");
exports.Response = ({ response }) => {
    return React.createElement("div", null,
        React.createElement(Status, { code: response.status, text: response.statusText, request: response.request }));
};
const Status = ({ code, text, request }) => {
    return React.createElement("div", null,
        code,
        " ",
        text,
        " / ",
        request.res.responseUrl);
};
//# sourceMappingURL=renderer.js.map