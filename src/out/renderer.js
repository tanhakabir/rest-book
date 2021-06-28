"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
var preact_1 = require("preact");
var hooks_1 = require("preact/hooks");
var uuid_1 = require("uuid");
var stringify = require('json-stringify-safe');
var Search = require("vscode-codicons/src/icons/search.svg");
var Response = function (_a) {
    var _b, _c;
    var response = _a.response;
    var _d = __read(hooks_1.useState(0), 2), activeIndex = _d[0], setActive = _d[1];
    var _e = __read(hooks_1.useState(''), 2), searchKeyword = _e[0], setSearchKeyword = _e[1];
    var uuid = uuid_1.v4();
    var searchBarId = "search-bar-" + uuid;
    var searchButtonId = "search-button-" + uuid;
    var darkMode = (_c = (_b = document.body.getAttribute('data-vscode-theme-kind')) === null || _b === void 0 ? void 0 : _b.includes('dark')) !== null && _c !== void 0 ? _c : false;
    hooks_1.useEffect(function () {
        var _a;
        (_a = document.getElementById(searchBarId)) === null || _a === void 0 ? void 0 : _a.addEventListener('keypress', function (event) {
            var _a;
            if (event.key === 'Enter') {
                (_a = document.getElementById(searchButtonId)) === null || _a === void 0 ? void 0 : _a.click();
            }
        });
    });
    return preact_1.h("div", null,
        preact_1.h(Status, { code: response.status, text: response.statusText, request: response.request }),
        preact_1.h("br", null),
        preact_1.h("div", { class: 'tab-bar' },
            preact_1.h(TabHeader, { activeTab: activeIndex, setActive: setActive, headersExist: response.headers, configExists: response.config, requestExists: response.request, darkMode: darkMode }),
            preact_1.h("span", { class: 'tab-bar-tools' },
                preact_1.h("input", { id: searchBarId, placeholder: 'Search for keyword' }),
                preact_1.h("button", { id: searchButtonId, class: 'search-button', title: 'Search for keyword', onClick: function () { return handleSearchForKeywordClick(setSearchKeyword, searchBarId); } },
                    preact_1.h(Icon, { name: Search })))),
        preact_1.h("br", null),
        preact_1.h(DataTab, { data: response.data, active: activeIndex === 0, searchKeyword: searchKeyword }),
        preact_1.h(TableTab, { dict: response.headers, active: activeIndex === 1, searchKeyword: searchKeyword }),
        preact_1.h(TableTab, { dict: response.config, active: activeIndex === 2, searchKeyword: searchKeyword }),
        preact_1.h(TableTab, { dict: response.request, active: activeIndex === 3, searchKeyword: searchKeyword }));
};
exports.Response = Response;
var TabHeader = function (_a) {
    var activeTab = _a.activeTab, setActive = _a.setActive, headersExist = _a.headersExist, configExists = _a.configExists, requestExists = _a.requestExists, darkMode = _a.darkMode;
    var renderTabHeaders = function () {
        var result = [];
        //@ts-ignore
        result.push(preact_1.h("button", { class: 'tab', "dark-mode": darkMode, onClick: function () { return setActive(0); }, active: activeTab === 0 }, "Data"));
        if (headersExist) {
            //@ts-ignore
            result.push(preact_1.h("button", { class: 'tab', "dark-mode": darkMode, onClick: function () { return setActive(1); }, active: activeTab === 1 }, "Headers"));
        }
        if (configExists) {
            //@ts-ignore
            result.push(preact_1.h("button", { class: 'tab', "dark-mode": darkMode, onClick: function () { return setActive(2); }, active: activeTab === 2 }, "Config"));
        }
        if (requestExists) {
            //@ts-ignore
            result.push(preact_1.h("button", { class: 'tab', "dark-mode": darkMode, onClick: function () { return setActive(3); }, active: activeTab === 3 }, "Request Sent"));
        }
        return result;
    };
    return preact_1.h("span", null, renderTabHeaders());
};
// reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
var Status = function (_a) {
    var code = _a.code, text = _a.text, request = _a.request;
    var statusType;
    if (code < 200) {
        statusType = 'info';
    }
    else if (code < 300) {
        statusType = 'success';
    }
    else if (code < 400) {
        statusType = 'redirect';
    }
    else if (code < 500) {
        statusType = 'client-err';
    }
    else if (code < 600) {
        statusType = 'server-err';
    }
    var generateCodeLabel = function () {
        //@ts-ignore
        return preact_1.h("span", { class: 'status-label', statusType: statusType },
            request.method,
            " ",
            code,
            " ",
            text);
    };
    return preact_1.h("div", null,
        generateCodeLabel(),
        "   ",
        preact_1.h("span", { class: 'request-url' },
            "   ",
            request.responseUrl));
};
var TableTab = function (_a) {
    var dict = _a.dict, active = _a.active, searchKeyword = _a.searchKeyword;
    var renderFields = function () {
        return Object.keys(dict).map(function (key) {
            if (typeof dict[key] === 'object') {
                return preact_1.h("tr", null,
                    preact_1.h("td", { class: 'key column' }, key),
                    preact_1.h("td", null,
                        preact_1.h("ul", { class: 'sub-list' }, Object.keys(dict[key]).map(function (subKey) {
                            var value;
                            if (typeof dict[key][subKey] === 'object') {
                                value = stringify(dict[key][subKey]);
                            }
                            else {
                                value = dict[key][subKey];
                            }
                            return preact_1.h("li", null,
                                preact_1.h("span", { class: 'key' },
                                    subKey,
                                    ":"),
                                "  ",
                                searchForTermInText(value, searchKeyword));
                        }))));
            }
            return preact_1.h("tr", null,
                preact_1.h("td", { class: 'key column' }, key),
                " ",
                preact_1.h("td", null, searchForTermInText(dict[key], searchKeyword)));
        });
    };
    //@ts-ignore
    return preact_1.h("div", { class: 'tab-content', hidden: !active },
        preact_1.h("table", null, renderFields()));
};
var DataTab = function (_a) {
    var data = _a.data, active = _a.active, searchKeyword = _a.searchKeyword;
    var dataStr = typeof data === 'string' ? data : stringify(data);
    return preact_1.h("div", { class: 'tab-content', id: 'data-container', hidden: !active }, searchForTermInText(dataStr, searchKeyword));
};
var Icon = function (_a) {
    var i = _a.name;
    return preact_1.h("span", { class: 'icon', dangerouslySetInnerHTML: { __html: i } });
};
var handleSearchForKeywordClick = function (setter, searchBarId) {
    var _a, _b;
    var keyword = (_b = (_a = document.getElementById(searchBarId)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
    setter(keyword);
};
var searchForTermInText = function (text, searchKeyword) {
    var splitOnSearch = [text];
    if (searchKeyword !== '' && typeof text === 'string' && text) {
        splitOnSearch = text.split(searchKeyword);
    }
    return preact_1.h("span", null, splitOnSearch.map(function (token, i) {
        if (i === splitOnSearch.length - 1) {
            return preact_1.h("span", null, token);
        }
        else {
            return preact_1.h("span", null,
                token,
                preact_1.h("span", { dangerouslySetInnerHTML: { __html: "<span class='search-term'>" + searchKeyword + "</span>" } }));
        }
    }));
};
//# sourceMappingURL=renderer.js.map