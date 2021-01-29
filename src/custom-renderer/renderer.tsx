/* eslint-disable @typescript-eslint/naming-convention */
import { FunctionComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { ResponseRendererElements } from '../common/response';
import * as Flame from 'vscode-codicons/src/icons/flame.svg';

export const Response: FunctionComponent<{ response: Readonly<ResponseRendererElements>, saveResponse: (d: any) => void }> = ({ response, saveResponse }) => {
    const [activeIndex, setActive] = useState(0);

    let darkMode = document.body.getAttribute('data-vscode-theme-kind')?.includes('dark') ?? false;

    return <div>
        <Status code={response.status} text={response.statusText} request={response.request} />
        <br />
        <div id='tab-bar'>
            <TabHeader activeTab={activeIndex} setActive={setActive} headersExist={response.headers} configExists={response.config} requestExists={response.request} darkMode={darkMode}/>
            <button class='save-button' onClick={() => saveResponse(response) }><Icon name={Flame}/>Save Response</button>
        </div>
        <br />
        <DataTab data={response.data} active={activeIndex === 0}/>
        <TableTab dict={response.headers} active={activeIndex === 1}/>
        <TableTab dict={response.config} active={activeIndex === 2}/>
        <TableTab dict={response.request} active={activeIndex === 3}/>
    </div>;
};

const TabHeader:FunctionComponent<{activeTab: number, setActive: (i: number) => void, headersExist: boolean, configExists:boolean, requestExists: boolean, darkMode: boolean}> = ({activeTab, setActive, headersExist, configExists, requestExists, darkMode}) => {
    const renderTabHeaders = () => {
        let result: h.JSX.Element[] = [];

        //@ts-ignore
        result.push(<button class='tab' dark-mode={darkMode} onClick={() => setActive(0)} active={activeTab === 0}>Data</button>);

        if(headersExist) {
            //@ts-ignore
            result.push(<button class='tab' dark-mode={darkMode} onClick={() => setActive(1)}  active={activeTab === 1}>Headers</button>);
        }

        if(configExists) {
            //@ts-ignore
            result.push(<button class='tab' dark-mode={darkMode} onClick={() => setActive(2)}  active={activeTab === 2}>Config</button>);
        }

        if(requestExists) {
            //@ts-ignore
            result.push(<button class='tab' dark-mode={darkMode} onClick={() => setActive(3)}  active={activeTab === 3}>Request Sent</button>);
        }

        return result;
    };

    return <span>
        {renderTabHeaders()}
    </span>;
};

// reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
const Status: FunctionComponent<{ code: number, text: string, request?: any}> = ({ code, text, request }) => {
    let statusType: string;
    if(code < 200) {
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

const TableTab: FunctionComponent<{ dict?: any, active: boolean}> = ({ dict, active }) => {
    const renderFields = () => { return Object.keys(dict).map((key) => {
            if(typeof dict[key] === 'object') {
                return <tr>
                    <td class='key column'>{key}</td>
                    <td>
                    <ul class='sub-list'>
                        {Object.keys(dict[key]).map((subKey) => {
                            let value;
                            if(typeof dict[key][subKey] === 'object') {
                                value = JSON.stringify(dict[key][subKey]);
                            } else {
                                value = dict[key][subKey];
                            }
                            return <li><span class='key'>{subKey}:</span>  {value}</li>;
                        })}
                    </ul>
                    </td>
                </tr>;
            }
            return <tr><td class='key column'>{key}</td> <td>{dict[key]}</td></tr>;
        });
    };

    //@ts-ignore
    return <div class='tab-content' hidden={!active}>
        <table>
            {renderFields()}
        </table>
    </div>;
};

const DataTab: FunctionComponent<{ data: any, active: boolean}> = ({ data, active }) => {
    //@ts-ignore
    return <div class='tab-content' id='data-container' hidden={!active}>
        {data}
    </div>;
};

const Icon: FunctionComponent<{ name: string}> = ({ name: i}) => {
    return <span class='icon'
        dangerouslySetInnerHTML={{ __html: i }}
    />;
};