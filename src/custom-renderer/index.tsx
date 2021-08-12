import { h, render } from 'preact';
import { ActivationFunction } from 'vscode-notebook-renderer';
import { Response } from './renderer';
import './style.css';

export const activate: ActivationFunction = (_context) => ({
	renderOutputItem(data, element) {
		try {
			render(<Response response={data.json()}/>, element);
		} catch {
			render(<p>Error!</p>, element);
		}
	}
});