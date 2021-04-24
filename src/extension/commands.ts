import * as vscode from 'vscode';
import { getNamesOfSecrets, addSecret, deleteSecret } from '../common/secrets';

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

class ConfigureSecretsItem implements vscode.QuickPickItem {
	public readonly label = 'View Saved Secrets...';
	public readonly alwaysShow = true;
	constructor() { }
}

class AddNewSecretItem implements vscode.QuickPickItem {
	public readonly label = '$(plus) Add New Secret...';
	public readonly alwaysShow = true;
	constructor() { }
}

class EditSecretItem implements vscode.QuickPickItem {
	public secretName: string;
	public get label(): string { 
		return `Edit ${this.secretName}...`; 
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

type SecretPickerItem = SecretItem | ConfigureSecretsItem | AddNewSecretItem;

class SetSecretName {
	public secretName = '';

	public get label(): string {
		return this.secretName;
	}

	public readonly alwaysShow = true;

	constructor() { }
}

class SetSecretValueItem {
	public secret = '';

	public get label(): string {
		return this.secret;
	}

	public readonly alwaysShow = true;

	constructor() { }
}

type SecretInputItem = SetSecretName | SetSecretValueItem;

enum InteractiveSecretPickerState {
	selectAction,
	viewSecretsToEdit,
	editSecret
}

enum InteractiveSecretInputState {
	addSecretName,
	addSecretValue
}

function _getSecretInput(state: InteractiveSecretInputState, autofills?: SecretInputItem): vscode.InputBox {
	const quickInput = vscode.window.createInputBox();

	if(autofills) {
		quickInput.value = autofills.label;
	}

	switch(+state) {
		case InteractiveSecretInputState.addSecretName:
			if(autofills) {
				quickInput.title = "Edit name of secret";
			} else {
				quickInput.title = "Create a name for your secret";
			}
			break;
		case InteractiveSecretInputState.addSecretValue:
			if(autofills) {
				quickInput.title = "Edit the secret";
			} else {
				quickInput.title = "Add the secret";
			}
			break;
	}

	return quickInput;
}

async function _showSecretInput(state: InteractiveSecretInputState, autofills:SecretInputItem): Promise<InputResult> {
	return new Promise<InputResult>((resolve, _) => {
		const quickInput = _getSecretInput(state, autofills);

		quickInput.onDidAccept(() => {
			if(autofills instanceof SetSecretName) {
				resolve({value: quickInput.value, id: 'name'});
			} else if(autofills instanceof SetSecretValueItem) {
				resolve({value: quickInput.value, id: 'value'});
			}
		});

		quickInput.show();
	})
}

function _getSecretPicker(state: InteractiveSecretPickerState, extra?: string[] | string): vscode.QuickPick<SecretPickerItem> {
	const quickPick = vscode.window.createQuickPick<SecretPickerItem>();
	quickPick.ignoreFocusOut = true;

	let newQpItems: SecretPickerItem[] = [];
	switch (+state) {
		case InteractiveSecretPickerState.selectAction:
			quickPick.title = 'View secrets to edit them or add a new secret';
			newQpItems.push(new AddNewSecretItem());
			newQpItems.push(new ConfigureSecretsItem());
			break;
		case InteractiveSecretPickerState.viewSecretsToEdit:
			const secretListItems = (extra as string[]).map(b => new SecretItem(b));
			quickPick.title = 'Choose a secret to edit';
			newQpItems = [ ...secretListItems ];
			break;
		case InteractiveSecretPickerState.editSecret:
			if(typeof extra === 'string') {
				quickPick.title = `Edit or delete ${extra}`;
				newQpItems.push(new EditSecretItem(extra));
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
			if (selected instanceof ConfigureSecretsItem) {
				resolve({ type: 'command', id: 'view' });
                return;
			}

			if (selected instanceof AddNewSecretItem) {
				resolve({ type: 'command', id: 'new' });
                return;
			}

			if (selected instanceof EditSecretItem) {
				resolve({ type: 'command', id: 'edit', value: extra as string });
                return;
			}

			if (selected instanceof DeleteSecretItem) {
				closeQuickPick();
				resolve({ type: 'command', id: 'delete', value: extra as string });
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

async function _useInteractiveSecretInput(state: InteractiveSecretInputState, placeholder? : string) {

}

async function _useInteractiveSecretPicker(state: InteractiveSecretPickerState, extra?: string[] | string) {
	const pickerResult = await _showSecretPicker(state, extra);

	if(!pickerResult) { return; }

	switch(+state) {
		case InteractiveSecretPickerState.selectAction:
			if (pickerResult.type === 'command' && pickerResult.id === 'view') {
				_useInteractiveSecretPicker(InteractiveSecretPickerState.viewSecretsToEdit, getNamesOfSecrets());
			}
			if (pickerResult.type === 'command' && pickerResult.id === 'new') {
				_useInteractiveSecretInput(InteractiveSecretInputState.addSecretName);
			}
			break;
		case InteractiveSecretPickerState.viewSecretsToEdit:
			if (pickerResult.type === 'secret') {
				_useInteractiveSecretPicker(InteractiveSecretPickerState.editSecret, pickerResult.value);
				return pickerResult.id;
			}
			break;
		case InteractiveSecretPickerState.editSecret: {
			if (pickerResult.type === 'command' && pickerResult.id === 'edit') {
				_useInteractiveSecretPicker(InteractiveSecretPickerState.viewSecretsToEdit, pickerResult.value);
			}
			if (pickerResult.type === 'command' && pickerResult.id === 'delete') {
				if(pickerResult.value) { deleteSecret(pickerResult.value); }
				vscode.window.showInformationMessage(`Deleted secret ${pickerResult.value}.`);
			}
		}
	}

	return null;
}

export function registerCommands(): vscode.Disposable {
    const subscriptions: vscode.Disposable[] = [];

    subscriptions.push(vscode.commands.registerCommand('rest-book.secrets', () => {
		addSecret('foo', 'bar');
        _useInteractiveSecretPicker(InteractiveSecretPickerState.selectAction);
    }));

    return vscode.Disposable.from(...subscriptions);
}