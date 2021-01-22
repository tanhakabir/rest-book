/* eslint-disable @typescript-eslint/naming-convention */
import { FunctionComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { ResponseRendererElements } from '../common/response';

export const Response: FunctionComponent<{ response: Readonly<ResponseRendererElements> }> = ({ response }) => {
    const [activeIndex, setActive] = useState(0);

    const renderTabHeaders = () => {
        let result: h.JSX.Element[] = [];

        //@ts-ignore
        result.push(<button class='tab-header' onClick={() => setActive(0)} active={activeIndex === 0}>Data</button>);

        if(response.headers) {
            //@ts-ignore
            result.push(<button class='tab-header' onClick={() => setActive(1)}  active={activeIndex === 1}>Headers</button>);
        }

        if(response.config) {
            //@ts-ignore
            result.push(<button class='tab-header' onClick={() => setActive(2)}  active={activeIndex === 2}>Config</button>);
        }

        return result;
    };

    return <div>
        <Status code={response.status} text={response.statusText} request={response.request} />
        <br />
        <div id='tab-bar'>
          {renderTabHeaders()}
        </div>
        <br />
        <DataTab data={response.data} active={activeIndex === 0}/>
        <TableTab dict={response.headers} active={activeIndex === 1}/>
        <TableTab dict={response.config} active={activeIndex === 2}/>
    </div>;
};

const Status: FunctionComponent<{ code: number, text: string, request?: any}> = ({ code, text, request }) => {
    return <div>
        {request.method} {code} {text}   <span class='request-url'>/   {request.res.responseUrl}</span>
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
    return <div class='tab-content' id='data-container' hidden={!active}>
        {data}
    </div>;
}