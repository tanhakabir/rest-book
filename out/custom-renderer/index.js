"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const preact_1 = require("preact");
const React = require("react");
const renderer_1 = require("./renderer");
const api = acquireNotebookRendererApi('rest-book');
api.onDidCreateOutput(event => {
    const data = event.output.data[event.mimeType];
    preact_1.render(React.createElement(renderer_1.Response, { response: data }), event.element);
});
//# sourceMappingURL=index.js.map