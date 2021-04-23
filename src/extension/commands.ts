import * as vscode from 'vscode';
import { getNamesOfSecrets } from '../common/secrets';

interface PickerResult {
    id: string,
    type: string
}

class SecretItem implements vscode.QuickPickItem {
	constructor(public label: string) { }
}

class ConfigureSecretsItem implements vscode.QuickPickItem {
	public readonly label = 'Edit Saved Secrets...';
	public readonly alwaysShow = true;
	constructor() { }
}

class AddNewSecretItem implements vscode.QuickPickItem {
	public readonly label = '$(plus) Add New Secret...';
	public readonly alwaysShow = true;
	constructor() { }
}

class NewSecretItem implements vscode.QuickPickItem {
	public secret = '';

	public get label(): string {
		return `➤ ${this.secret}`;
	}

	public readonly alwaysShow = true;

	constructor() { }
}

type SecretPickerItem = SecretItem | ConfigureSecretsItem | AddNewSecretItem | NewSecretItem;

function _getSecretPicker(boxes: string[]): vscode.QuickPick<SecretPickerItem> {
    const secretListItems = boxes.map(b => new SecretItem(b));
	const configureSecretsAction = new ConfigureSecretsItem();
	const addSecretAction = new AddNewSecretItem();

	const quickPick = vscode.window.createQuickPick<SecretPickerItem>();
	quickPick.ignoreFocusOut = true;
	quickPick.title = 'Select a saved secret or enter a new secret';

	const newSecretItem = new NewSecretItem();
	let filterItemIsVisible = false;

	const updateQuickPickItems = () => {
		const newQpItems = [
			...secretListItems,
		];
		if (filterItemIsVisible) {
			newQpItems.push(newSecretItem);
		}
		newQpItems.push(addSecretAction);
		newQpItems.push(configureSecretsAction);

		quickPick.items = newQpItems;
	};
	updateQuickPickItems();

	quickPick.onDidChangeValue(text => {
		newSecretItem.secret = text;
		filterItemIsVisible = typeof text === 'string' && text.length > 0;
		updateQuickPickItems();
	});

	return quickPick;
}

async function _showSecretPicker(boxes: string[]): Promise<PickerResult | null> {
    return new Promise<PickerResult | null>((resolve, _reject) => {
		const quickPick = _getSecretPicker(boxes);

		let secret: String | undefined;

		quickPick.onDidAccept(async () => {
			quickPick.busy = true;

			const selected = quickPick.selectedItems[0];
			if (selected instanceof ConfigureSecretsItem) {
				resolve({ type: 'command', id: 'edit' });
                return;
			}

			if (selected instanceof AddNewSecretItem) {
				resolve({ type: 'command', id: 'new' });
                return;
			}

			const selectedSecretName = selected instanceof NewSecretItem ?
				selected.secret :
				selected.label;
			secret = selectedSecretName;

			quickPick.busy = false;
			quickPick.hide();
			quickPick.dispose();
		});

		quickPick.onDidHide(async () => {
			if (secret) {
				resolve({ type: 'secret', id: secret as string });
			} else {
				resolve(null);
			}
		});

		quickPick.show();
    });
}

async function _useInteractiveSecretPicker() {
    const secretNames = getNamesOfSecrets();
	const pickerResult = await _showSecretPicker(secretNames);
	if (pickerResult) {
		if (pickerResult.type === 'command' && pickerResult.id === 'edit') {
			// configure
			return null;
		}
		if (pickerResult.type === 'command' && pickerResult.id === 'new') {
			// TODO
			// add
		}
		if (pickerResult.type === 'secret') {
			return pickerResult.id;
		}
	}

	return null;
}

export function registerCommands(): vscode.Disposable {
    const subscriptions: vscode.Disposable[] = [];

    subscriptions.push(vscode.commands.registerCommand('rest-book.secrets', () => {
        _useInteractiveSecretPicker();
    }));

    return vscode.Disposable.from(...subscriptions);
}