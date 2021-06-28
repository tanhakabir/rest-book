import { h, render } from 'preact';
import { ActivationFunction } from 'vscode-notebook-renderer';
import { Response } from './renderer';
import './style.css';

export const activate: ActivationFunction = (context) => ({
	renderOutputItem(data, element) {
		let saveDataToFile;
		if(context.postMessage) {
			saveDataToFile = async (response: any) => {
				console.log("meesage!");
				context.postMessage!({
					command: 'save-response',
					data: response
				});
			};
		}

		try {
			render(<Response response={data.json()} saveResponse={saveDataToFile}/>, element);
		} catch {
			render(<p>Error!</p>, element);
		}
	}
});