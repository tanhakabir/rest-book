/* eslint-disable @typescript-eslint/naming-convention */
import { FunctionComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { ResponseRendererElements } from '../common/response';

export const Response: FunctionComponent<{ response: Readonly<ResponseRendererElements> }> = ({ response }) => {
    const [activeIndex, setActive] = useState(0);

    const renderTabHeaders = () => {
        let result: h.JSX.Element[] = [];

        result.push(<button class='tab-header' onClick={() => setActive(0)}>Data</button>);

        if(response.headers) {
            result.push(<button class='tab-header' onClick={() => setActive(1)}>Headers</button>);
        }

        if(response.config) {
            result.push(<button class='tab-header' onClick={() => setActive(2)}>Config</button>);
        }

        return result;
    };

    return <div>
        <Status code={response.status} text={response.statusText} request={response.request} />
        <div id='tab-bar'>
          {renderTabHeaders()}
        </div>
        <DataTab data={response.data} active={activeIndex === 0}/>
        <HeadersTab headers={response.headers} active={activeIndex === 1}/>
        <ConfigTab config={response.config} active={activeIndex === 2}/>
    </div>;
};

const Status: FunctionComponent<{ code: number, text: string, request?: any}> = ({ code, text, request }) => {
    return <div>
        {code} {text} / {request.res.responseUrl} {request.res.httpVersion}
    </div>;
};

const HeadersTab: FunctionComponent<{ headers?: any, active: boolean}> = ({ headers, active }) => {
    const renderFields = () => { return Object.keys(headers).map((key) => {
        return <li>{key} :  {headers[key]}</li>;
    })};

    //@ts-ignore
    return <div class='tab-content' hidden={!active}>
        <ul>
            {renderFields()}
        </ul>
    </div>;
};

const ConfigTab: FunctionComponent<{ config?: any, active: boolean}> = ({ config, active }) => {
    const renderFields = () => { return Object.keys(config).map((key) => {
        if(key === 'headers') {
            return <ul>
                {Object.keys(config.headers).map((hKey) => {
                    return <li>{hKey} :  {config.headers[hKey]}</li>;
                })}
            </ul>;
        }
        return <li>{key} :  {config[key]}</li>;
    })};

    //@ts-ignore
    return <div class='tab-content' hidden={!active}>
        <ul>
            {renderFields()}
        </ul>
    </div>;
};

const DataTab: FunctionComponent<{ data: any, active: boolean}> = ({ data, active }) => {
    //@ts-ignore
    return <div class='tab-content' hidden={!active}>
        {data}
    </div>;
}