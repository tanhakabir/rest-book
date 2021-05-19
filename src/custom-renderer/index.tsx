import { h, render } from 'preact';
import { ActivationFunction } from 'vscode-notebook-renderer';
import { Response } from './renderer';
import './style.css';

declare const scriptUrl: string;
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = scriptUrl.split('/').slice(0, -1).concat('style.css').join('/');
document.head.appendChild(link);

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