import { h, render } from 'preact';
import { ActivationFunction } from 'vscode-notebook-renderer';
import { Response } from './renderer';
import './style.css';

export const activate: ActivationFunction = () => ({
	renderOutputItem(data, element) {
		try {
			render(<Response response={data.json()} saveResponse={saveDataToFile}/>, element);
		} catch {
			render(<p>Error!</p>, element);
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