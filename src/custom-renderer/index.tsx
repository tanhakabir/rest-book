import { h, render } from 'preact';
import { ActivationFunction } from 'vscode-notebook-renderer';
import { Response } from './renderer';
import './style.css';

export const activate: ActivationFunction = () => ({
	renderCell(_id, { value, element }) {
		render(<Response response={value as any} saveResponse={saveDataToFile}/>, element);
	}
});

const saveDataToFile = async (_data: any) => {
	console.log("SAVE");
	// api.postMessage({
	// 	command: 'save-response',
	// 	data: data
	// });
};