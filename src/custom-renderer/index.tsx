import { h, render } from 'preact';
import { ActivationFunction } from 'vscode-notebook-renderer';
import { Response } from './renderer';
import './style.css';

export const activate: ActivationFunction = () => ({
	renderCell(_id, info) {
		try {
			//@ts-ignore
			render(<Response response={info.json()} saveResponse={saveDataToFile}/>, info.element);
		} catch {
			render(<p>Error!</p>, info.element);
		}
	}
});

const saveDataToFile = async (_data: any) => {
	console.log("SAVE");
	// api.postMessage({
	// 	command: 'save-response',
	// 	data: data
	// });
};