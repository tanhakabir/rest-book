import * as vscode from 'vscode';
import * as secrets from '../common/secrets';

interface PickerResult {
    id: string,
    type: string
	value?: string
}

interface InputResult {
    id: string,
    value: string
}

class SecretItem implements vscode.QuickPickItem {
	constructor(public label: string) { }
}

class AddNewSecretItem implements vscode.QuickPickItem {
	public readonly label = '$(plus) Add New Secret...';
	public readonly alwaysShow = true;
	constructor() { }
}

class ViewSecretItem implements vscode.QuickPickItem {
	public secretName: string;
	public get label(): string { 
		return `View the secret for ${this.secretName}...`; 
	}
	public readonly alwaysShow = true;
	constructor(secret: string) {
		this.secretName = secret;
	}
}

class DeleteSecretItem implements vscode.QuickPickItem {
	public secretName: string;
	public get label(): string { 
		return `Delete ${this.secretName}...`; 
	}
	public readonly alwaysShow = true;
	constructor(secret: string) {
		this.secretName = secret;
	}
}

type SecretPickerItem = SecretItem | AddNewSecretItem | ViewSecretItem | DeleteSecretItem;

class SetSecretName {
	public secretName = '';

	public get label(): string {
		return this.secretName;
	}

	public readonly alwaysShow = true;

	constructor(placeholder?: string) {
		if(placeholder) { this.secretName = placeholder; }
	}
}

class SetSecretValueItem {
	public secret = '';

	public get label(): string {
		return this.secret;
	}

	public readonly alwaysShow = true;

	constructor(placeholder?: string) {
		if(placeholder) { this.secret = placeholder; }
	}
}

type SecretInputItem = SetSecretName | SetSecretValueItem;

enum InteractiveSecretPickerState {
	selectAction,
	editSecret
}

enum InteractiveSecretInputState {
	addSecretName,
	addSecretValue
}

function _getSecretInput(state: InteractiveSecretInputState, autofills: SecretInputItem): vscode.InputBox {
	const quickInput = vscode.window.createInputBox();

	quickInput.value = autofills.label;

	switch(+state) {
		case InteractiveSecretInputState.addSecretName:
			if(autofills.label === '') {
				quickInput.title = "Create a name for your secret";
			} else {
				quickInput.title = "Edit name of secret";
			}
			break;
		case InteractiveSecretInputState.addSecretValue:
			if(autofills.label === '') {
				quickInput.title = "Add secret";
			} else {
				quickInput.title = "Edit secret";
			}
			break;
	}

	return quickInput;
}

async function _showSecretInput(state: InteractiveSecretInputState, autofills:SecretInputItem): Promise<InputResult> {
	return new Promise<InputResult>((resolve, _) => {
		const quickInput = _getSecretInput(state, autofills);

		let closeQuickInput = () => {
			quickInput.hide();
			quickInput.dispose();
		};

		quickInput.onDidAccept(() => {
			if(autofills instanceof SetSecretName) {
				resolve({value: quickInput.value, id: 'name'});
			} else if(autofills instanceof SetSecretValueItem) {
				closeQuickInput();
				resolve({value: quickInput.value, id: 'value'});
			}
		});

		quickInput.show();
	});
}

function _getSecretPicker(state: InteractiveSecretPickerState, extra?: string[] | string): vscode.QuickPick<SecretPickerItem> {
	const quickPick = vscode.window.createQuickPick<SecretPickerItem>();
	quickPick.ignoreFocusOut = true;

	let newQpItems: SecretPickerItem[] = [];
	switch (+state) {
		case InteractiveSecretPickerState.selectAction:
			const secretListItems = (extra as string[]).map(b => new SecretItem(b));
			quickPick.title = 'View an existing secret or add a new secret';
			newQpItems = [ ... secretListItems];
			newQpItems.splice(0, 0, new AddNewSecretItem());
			break;
		case InteractiveSecretPickerState.editSecret:
			if(typeof extra === 'string') {
				quickPick.title = `View or delete ${extra}`;
				newQpItems.push(new ViewSecretItem(extra));
				newQpItems.push(new DeleteSecretItem(extra));
				break;
			}
	}

	quickPick.items = newQpItems;

	return quickPick;
}

async function _showSecretPicker(state: InteractiveSecretPickerState, extra?: string[] | string): Promise<PickerResult | null> {
    return new Promise<PickerResult | null>((resolve, _reject) => {
		const quickPick = _getSecretPicker(state, extra);

		let secret: String | undefined;

		let closeQuickPick = () => {
			quickPick.busy = false;
			quickPick.hide();
			quickPick.dispose();
		};

		quickPick.onDidAccept(async () => {
			quickPick.busy = true;

			const selected = quickPick.selectedItems[0];
			if (selected instanceof AddNewSecretItem) {
				resolve({ type: 'command', id: 'new' });
                return;
			}

			if (selected instanceof ViewSecretItem) {
				resolve({ type: 'command', id: 'view', value: extra as string });
                return;
			}

			if (selected instanceof DeleteSecretItem) {
				resolve({ type: 'command', id: 'delete', value: extra as string });
				closeQuickPick();
                return;
			}

			secret = selected.label;

			closeQuickPick();
		});

		quickPick.onDidHide(async () => {
			if (secret) {
				resolve({ type: 'secret', id:'secret', value: secret as string });
			} else {
				resolve(null);
			}
		});

		quickPick.show();
    });
}

async function _useInteractiveSecretInput(state: InteractiveSecretInputState, secret? : string) {
	let placeholder; 
	if(secret) {
		placeholder = secrets.getSecret(secret);
	}

	let inputResult;

	switch(+state) {
		case InteractiveSecretInputState.addSecretName:
			inputResult = await _showSecretInput(state, new SetSecretName(placeholder));
			break;
		case InteractiveSecretInputState.addSecretValue:
			inputResult = await _showSecretInput(state, new SetSecretValueItem(placeholder));
			break;
	}

	if(inputResult?.id === 'name') {
		_useInteractiveSecretInput(InteractiveSecretInputState.addSecretValue, inputResult.value);
	} else if(inputResult?.id === 'value' && secret) {
		secrets.addSecret(secret, inputResult.value);
		vscode.window.showInformationMessage(`Saved secret for ${secret}.`);
	}
}

async function _useInteractiveSecretPicker(state: InteractiveSecretPickerState, extra?: string[] | string) {
	const pickerResult = await _showSecretPicker(state, extra);

	if(!pickerResult) { return; }

	if (pickerResult.type === 'secret') {
		_useInteractiveSecretPicker(InteractiveSecretPickerState.editSecret, pickerResult.value);
		return;
	}
	if (pickerResult.type === 'command' && pickerResult.id === 'new') {
		_useInteractiveSecretInput(InteractiveSecretInputState.addSecretName);
		return;
	}

	if (pickerResult.type === 'command' && pickerResult.id === 'view') {
		if(pickerResult.value) {
			_useInteractiveSecretInput(InteractiveSecretInputState.addSecretValue, pickerResult.value);
		} else {
			_useInteractiveSecretInput(InteractiveSecretInputState.addSecretValue);
		}
		return;
	}

	if (pickerResult.type === 'command' && pickerResult.id === 'delete') {
		if(pickerResult.value) { secrets.deleteSecret(pickerResult.value); }
		vscode.window.showInformationMessage(`Deleted secret ${pickerResult.value}.`);
		return;
	}
}

export function registerCommands(): vscode.Disposable {
    const subscriptions: vscode.Disposable[] = [];

    subscriptions.push(vscode.commands.registerCommand('rest-book.secrets', () => {
        _useInteractiveSecretPicker(InteractiveSecretPickerState.selectAction, secrets.getNamesOfSecrets());
    }));

	subscriptions.push(vscode.commands.registerCommand('rest-book.newNotebook', async () => {
		const newNotebook = await vscode.notebook.openNotebookDocument('rest-book', 
			new vscode.NotebookData([
				new vscode.NotebookCellData(vscode.NotebookCellKind.Code, '', 'rest-book')
			]));
		vscode.window.showNotebookDocument(newNotebook);
	}));

    return vscode.Disposable.from(...subscriptions);
}
