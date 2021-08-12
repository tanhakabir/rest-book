import * as vscode from 'vscode';
const stringify = require('json-stringify-safe');

interface RawNotebookCell {
	language: string;
	value: string;
	kind: vscode.NotebookCellKind;
    editable?: boolean;
    outputs: RawCellOutput[];
}

interface RawCellOutput {
	mime: string;
	value: any;
}

export class NotebookSerializer implements vscode.NotebookSerializer {

    async deserializeNotebook(content: Uint8Array, _token: vscode.CancellationToken): Promise<vscode.NotebookData> {
        var contents = new TextDecoder().decode(content);    // convert to String to make JSON object

        // Read file contents
		let raw: RawNotebookCell[];
		try {
			raw = <RawNotebookCell[]>JSON.parse(contents);
		} catch {
			raw = [];
		}

        function convertRawOutputToBytes(raw: RawNotebookCell) {
            let result: vscode.NotebookCellOutputItem[] = [];

            for(let output of raw.outputs) {
                let data = new TextEncoder().encode(stringify(output.value));
                result.push(new vscode.NotebookCellOutputItem(data, output.mime));
            }

            return result;
        }

        // Create array of Notebook cells for the VS Code API from file contents
		const cells = raw.map(item => new vscode.NotebookCellData(
			item.kind,
			item.value,
			item.language
		));

		for(let i = 0; i < cells.length; i++) {
			let cell = cells[i];
			cell.outputs = raw[i].outputs ? [new vscode.NotebookCellOutput(convertRawOutputToBytes(raw[i]))] : [];
		}

        // Pass read and formatted Notebook Data to VS Code to display Notebook with saved cells
		return new vscode.NotebookData(
			cells
		);
    }

    async serializeNotebook(data: vscode.NotebookData, _token: vscode.CancellationToken): Promise<Uint8Array> {
        // function to take output renderer data to a format to save to the file
		function asRawOutput(cell: vscode.NotebookCellData): RawCellOutput[] {
			let result: RawCellOutput[] = [];
			for (let output of cell.outputs ?? []) {
				for (let item of output.items) {
                    let outputContents = '';
                    try {
                        outputContents = new TextDecoder().decode(item.data);
                    } catch {
                        
                    }

                    try {
                        let outputData = JSON.parse(outputContents);
                        result.push({ mime: item.mime, value: outputData });
                    } catch {
                        result.push({ mime: item.mime, value: outputContents });
                    }
				}
			}
			return result;
		}

        // Map the Notebook data into the format we want to save the Notebook data as

		let contents: RawNotebookCell[] = [];

		for (const cell of data.cells) {
			contents.push({
				kind: cell.kind,
				language: cell.languageId,
				value: cell.value,
				outputs: asRawOutput(cell)
			});
		}

        // Give a string of all the data to save and VS Code will handle the rest 
		return new TextEncoder().encode(stringify(contents));
    }    
}


// NEEDED Declaration to silence errors
declare class TextDecoder {
	decode(data: Uint8Array): string;
}

declare class TextEncoder {
	encode(data: string): Uint8Array;
}