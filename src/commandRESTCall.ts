import { QuickPickItem, window, Disposable, CancellationToken, QuickInputButton, QuickInput, ExtensionContext, QuickInputButtons, Uri, Event } from 'vscode';
import { URL, parse } from 'url';
import { logDebug, validateURL } from './common';
import { MultiStepInput } from './multiStepInput';
const axios = require('axios').default;

export async function commandRESTCall(context: ExtensionContext) {
	const callTypes: QuickPickItem[] = ['GET', 'POST', 'PUT', 'DELETE']
		.map(label => ({ label }));

	interface State {
		title: string;
		step: number;
		totalSteps: number;
		callType: QuickPickItem | string;
		url: string;
		runtime: QuickPickItem;
	}

	const title = 'Perform REST Call';

	async function collectInputs() {
		const state = {} as Partial<State>;
		await MultiStepInput.run(input => pickRESTCallType(input, state));
		return state as State;
	}

	async function pickRESTCallType(input: MultiStepInput, state: Partial<State>) {
		const pick = await input.showQuickPick({
			title,
			step: 1,
			totalSteps: 3,
			placeholder: 'Which type of REST call do you want to make?',
			items: callTypes,
			activeItem: typeof state.callType !== 'string' ? state.callType : undefined,
			shouldResume: shouldResume
		});

		state.callType = pick;
		logDebug(`pickRESTCallType :: call type chosen ${pick.label}`);
		return (input: MultiStepInput) => inputURL(input, state);
	}

	async function inputURL(input: MultiStepInput, state: Partial<State>) {
		state.url = await input.showInputBox({
			title,
			step: 2,
			totalSteps: 3,
			value: state.url || '',
			prompt: 'Enter the endpoint location as: https://endpoint.com',
			validate: _validateURL,
			shouldResume: shouldResume
		});
	}

	async function _validateURL(url: string) {
		// wait before validating
		await new Promise(resolve => setTimeout(resolve, 1000));

		return validateURL(url) ? undefined : 'Not a valid HTTP/HTTPS URL.';
	}

	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			// noop
		});
	}

	const state = await collectInputs();
	window.showInformationMessage(`Attempting to perform ${state.callType === 'string' ? 
															state.callType : 
															(state.callType as QuickPickItem).label} 
														call to ${state.url}`);

	try {
		let response = await axios.get(state.url);
		console.log(response);
	} catch (exception) {
		console.log(exception);
	}

	return { callType: state.callType === 'string' ? state.callType : (state.callType as QuickPickItem).label, 
			 url: state.url };
}