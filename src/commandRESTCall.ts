import { QuickPickItem, window, Disposable, CancellationToken, QuickInputButton, QuickInput, ExtensionContext, QuickInputButtons, Uri } from 'vscode';
import { DEBUG_MODE } from './extension';

export async function showCallTypeQuickPick(): Promise<string | undefined> {
	const picker = await window.showQuickPick(['GET', 'POST', 'PUT', 'DELETE'], {
		placeHolder: 'Make a GET, POST, PUT, or DELETE call',
		onDidSelectItem: item =>  { if (DEBUG_MODE) { console.log(`showCallTypeQuickPick :: selecting ${item}`) } }
	});
	
	return picker;
}