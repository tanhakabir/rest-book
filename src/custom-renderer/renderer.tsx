/* eslint-disable @typescript-eslint/naming-convention */
import { FunctionComponent, h } from 'preact';
import { StateUpdater, useEffect, useState } from 'preact/hooks';
import { v4 as uuidv4 } from 'uuid';
var stringify = require('json-stringify-safe');
import { ResponseRendererElements } from '../common/response';
import * as Search from 'vscode-codicons/src/icons/search.svg';

export const Response: FunctionComponent<{ response: Readonly<ResponseRendererElements> }> = ({ response }) => {
    const [activeIndex, setActive] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState('');
    const uuid = uuidv4();
    const searchBarId = `search-bar-${uuid}`;
    const searchButtonId = `search-button-${uuid}`;

    let darkMode = document.body.getAttribute('data-vscode-theme-kind')?.includes('dark') ?? false;

    useEffect(() => {
        document.getElementById(searchBarId)?.addEventListener('keypress', event => {
            if (event.key === 'Enter') {
                document.getElementById(searchButtonId)?.click();
            }
        });
    });

    return <div>
        <Status code={response.status} text={response.statusText} request={response.request} />
        <br />
        <div class='tab-bar'>
            <TabHeader activeTab={activeIndex} setActive={setActive} headersExist={response.headers} configExists={response.config} requestExists={response.request} darkMode={darkMode} />
            <span class='tab-bar-tools'>
                <input id={searchBarId} placeholder='Search for keyword'></input>
                <button id={searchButtonId} class='search-button' title='Search for keyword' onClick={() => handleSearchForKeywordClick(setSearchKeyword, searchBarId)}><Icon name={Search} /></button>
            </span>
        </div>
        <br />
        <DataTab data={response.data} active={activeIndex === 0} searchKeyword={searchKeyword} />
        <TableTab dict={response.headers} active={activeIndex === 1} searchKeyword={searchKeyword} />
        <TableTab dict={response.config} active={activeIndex === 2} searchKeyword={searchKeyword} />
        <TableTab dict={response.request} active={activeIndex === 3} searchKeyword={searchKeyword} />
    </div>;
};

const TabHeader: FunctionComponent<{ activeTab: number, setActive: (i: number) => void, headersExist: boolean, configExists: boolean, requestExists: boolean, darkMode: boolean }> = ({ activeTab, setActive, headersExist, configExists, requestExists, darkMode }) => {
    const renderTabHeaders = () => {
        let result: h.JSX.Element[] = [];

        //@ts-ignore
        result.push(<button class='tab' dark-mode={darkMode} onClick={() => setActive(0)} active={activeTab === 0}>Data</button>);

        if (headersExist) {
            //@ts-ignore
            result.push(<button class='tab' dark-mode={darkMode} onClick={() => setActive(1)} active={activeTab === 1}>Headers</button>);
        }

        if (configExists) {
            //@ts-ignore
            result.push(<button class='tab' dark-mode={darkMode} onClick={() => setActive(2)} active={activeTab === 2}>Config</button>);
        }

        if (requestExists) {
            //@ts-ignore
            result.push(<button class='tab' dark-mode={darkMode} onClick={() => setActive(3)} active={activeTab === 3}>Request Sent</button>);
        }

        return result;
    };

    return <span>
        {renderTabHeaders()}
    </span>;
};

// reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
const Status: FunctionComponent<{ code: number, text: string, request?: any }> = ({ code, text, request }) => {
    let statusType: string;
    if (code < 200) {
        statusType = 'info';
    } else if (code < 300) {
        statusType = 'success';
    } else if (code < 400) {
        statusType = 'redirect';
    } else if (code < 500) {
        statusType = 'client-err';
    } else if (code < 600) {
        statusType = 'server-err';
    }

    const generateCodeLabel = () => {
        //@ts-ignore
        return <span class='status-label' statusType={statusType}>{request.method} {code} {text}</span>;
    };

    return <div>
        {generateCodeLabel()}   <span class='request-url'>   {request.responseUrl}</span>
    </div>;
};

const TableTab: FunctionComponent<{ dict?: any, active: boolean, searchKeyword: string }> = ({ dict, active, searchKeyword }) => {
    const renderFields = () => {
        return Object.keys(dict).map((key) => {
            if (typeof dict[key] === 'object') {
                return <tr>
                    <td class='key column'>{key}</td>
                    <td>
                        <ul class='sub-list'>
                            {Object.keys(dict[key]).map((subKey) => {
                                let value;
                                if (typeof dict[key][subKey] === 'object') {
                                    value = stringify(dict[key][subKey]);
                                } else {
                                    value = dict[key][subKey];
                                }
                                return <li><span class='key'>{subKey}:</span>  {searchForTermInText((value as string), searchKeyword)}</li>;
                            })}
                        </ul>
                    </td>
                </tr>;
            }
            return <tr><td class='key column'>{key}</td> <td>{searchForTermInText((dict[key] as string), searchKeyword)}</td></tr>;
        });
    };

    //@ts-ignore
    return <div class='tab-content' hidden={!active}>
        <table>
            {renderFields()}
        </table>
    </div>;
};

const DataTab: FunctionComponent<{ data: any, active: boolean, searchKeyword: string }> = ({ data, active, searchKeyword }) => {
    const dataStr = typeof data === 'string' ? data : stringify(data);

    return <div class='tab-content' id='data-container' hidden={!active}>
        {searchForTermInText(dataStr, searchKeyword)}
    </div>;
};

const Icon: FunctionComponent<{ name: string }> = ({ name: i }) => {
    return <span class='icon'
        dangerouslySetInnerHTML={{ __html: i }}
    />;
};


const handleSearchForKeywordClick = (setter: StateUpdater<string>, searchBarId: string) => {
    const keyword = (document.getElementById(searchBarId) as HTMLInputElement)?.value ?? '';
    setter(keyword);
};

const searchForTermInText = (text: string, searchKeyword: string) => {
    let splitOnSearch = [text];
    if (searchKeyword !== '' && typeof text === 'string' && text) {
        splitOnSearch = text.split(searchKeyword);
    }

    return <span>
        {splitOnSearch.map((token, i) => {
            if (i === splitOnSearch.length - 1) {
                return <span>{token}</span>;
            } else {
                return <span>{token}<span dangerouslySetInnerHTML={{ __html: `<span class='search-term'>${searchKeyword}</span>` }} /></span>;
            }
        })}
    </span>;
};