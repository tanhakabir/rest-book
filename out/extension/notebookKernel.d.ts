export declare class NotebookKernel {
    readonly id = "rest-book-kernel";
    readonly notebookType = "rest-book";
    readonly label = "REST Book";
    readonly supportedLanguages: string[];
    private readonly _controller;
    private readonly _renderMessaging;
    private _executionOrder;
    constructor();
    dispose(): void;
    private _executeAll;
    private _doExecution;
    private _handleMessage;
    private _saveDataToFile;
}
