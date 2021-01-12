/* eslint-disable @typescript-eslint/naming-convention */
import { FunctionComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { ResponseRendererElements } from '../common/response';

export const Response: FunctionComponent<{ response: Readonly<ResponseRendererElements> }> = ({ response }) => {
    const [activeIndex, setActive] = useState(1);

    return <div>
        <Status code={response.status} text={response.statusText} request={response.request} />
        <div id='tab-bar'>
          <button class='tab-header' onClick={() => setActive(0)}>
            Headers
          </button>
          <button class='tab-header' onClick={() => setActive(1)}>
            Data
          </button>
        </div>
        <HeadersTab headers={response.headers} active={activeIndex === 0}/>
        <DataTab data={response.data} active={activeIndex === 1}/>
    </div>;
};

const Status: FunctionComponent<{ code: number, text: string, request?: any}> = ({ code, text, request }) => {
    return <div>
        {code} {text} / {request.res.responseUrl}
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

const DataTab: FunctionComponent<{ data: any, active: boolean}> = ({ data, active }) => {
    //@ts-ignore
    return <div class='tab-content' hidden={!active}>
        {data}
    </div>;
}