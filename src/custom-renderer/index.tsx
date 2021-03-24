import { h, render } from 'preact';
import { Response } from './renderer';
import './style.css';

const api = acquireNotebookRendererApi('rest-book');

api.onDidCreateOutput(event => {
	const data = event.value.data[event.mime];
	render(<Response response={data} saveResponse={saveDataToFile}/>, event.element);
});


const saveDataToFile = async (data: any) => {
	api.postMessage({
		command: 'save-response',
		data: data
	});
};