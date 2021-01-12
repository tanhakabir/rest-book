/* eslint-disable @typescript-eslint/naming-convention */
import { FunctionComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { ResponseRendererElements } from '../common/response';

export const Response: FunctionComponent<{ response: Readonly<ResponseRendererElements> }> = ({ response }) => {
    return <div>
        <Status code={response.status} text={response.statusText} request={response.request} />
        <Headers headers={response.headers} />
        <Data data={response.data}/>
    </div>;
};

const Status: FunctionComponent<{ code: number, text: string, request?: any}> = ({ code, text, request }) => {
    return <div>
        {code} {text} / {request.res.responseUrl}
    </div>;
};

const Headers: FunctionComponent<{ headers?: any}> = ({ headers }) => {
    const renderFields = () => { return Object.keys(headers).map((key) => {
        return <li>{key} :  {headers[key]}</li>;
    })};

    return <div>
        <ul>
            {renderFields()}
        </ul>
    </div>;
};

const Data: FunctionComponent<{ data: any}> = ({ data }) => {
    return <div>
        {data}
    </div>;
}