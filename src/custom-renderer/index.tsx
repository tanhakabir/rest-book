import { h, render } from 'preact';
import React = require('react');
import { Response } from './renderer';

const api = acquireNotebookRendererApi('rest-book');

api.onDidCreateOutput(event => {
	const data = event.output.data[event.mimeType];
	render(<Response response={data} />, event.element);
});