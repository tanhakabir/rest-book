export declare class NotebookKernel {
    readonly id: string;
    readonly notebookType: string;
    readonly label: string;
    readonly supportedLanguages: string[];
    private readonly _controller;
    private _executionOrder;
    constructor(isInteractive?: boolean);
    dispose(): void;
    private _executeAll;
    private _doExecution;
    private _saveDataToFile;
}
