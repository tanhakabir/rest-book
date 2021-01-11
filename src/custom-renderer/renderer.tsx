import { FunctionComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import React = require('react');
import { ResponseRendererElements } from '../response';

export const Response: FunctionComponent<{ response: Readonly<ResponseRendererElements> }> = ({ response }) => {
    return <div>
        <Status code={response.status} text={response.statusText} request={response.request}></Status>
    </div>;
};

const Status: FunctionComponent<{ code: number, text: string, request?: any}> = ({ code, text, request }) => {
    return <div>
        {code} {text} / {request.res.responseUrl}
    </div>;
}