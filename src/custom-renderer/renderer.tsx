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
        <TableTab dict={response.headers} active={activeIndex === 1}/>
        <TableTab dict={response.config} active={activeIndex === 2}/>
    </div>;
};

const Status: FunctionComponent<{ code: number, text: string, request?: any}> = ({ code, text, request }) => {
    return <div>
        {code} {text} / {request.res.responseUrl} {request.res.httpVersion}
    </div>;
};

const TableTab: FunctionComponent<{ dict?: any, active: boolean}> = ({ dict, active }) => {
    const renderFields = () => { return Object.keys(dict).map((key) => {
        if(typeof dict[key] === 'object') {
            return <ul>
                {Object.keys(dict[key]).map((subKey) => {
                    return <li>{subKey} :  {dict[key][subKey]}</li>;
                })}
            </ul>;
        }
        return <li>{key} :  {dict[key]}</li>;
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