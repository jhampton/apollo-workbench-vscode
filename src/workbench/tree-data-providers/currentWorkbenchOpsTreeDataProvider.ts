import * as path from 'path';
import * as vscode from 'vscode';
import { FileProvider } from '../file-system/fileProvider';

export class CurrentWorkbenchOpsTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    constructor(private workspaceRoot: string) { }

    private _onDidChangeTreeData: vscode.EventEmitter<WorkbenchOperationTreeItem | undefined> = new vscode.EventEmitter<WorkbenchOperationTreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<WorkbenchOperationTreeItem | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: WorkbenchOperationTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: WorkbenchOperationTreeItem): Thenable<vscode.TreeItem[]> {
        if (element) {
            throw new Error('Element?');
        } else {
            let items = this.getOperationsFromWorkbenchFile();
            if (items.length == 0)
                items.push(new WorkbenchOperationTreeItem("No operations in selected workbench file", ""));

            return Promise.resolve(items);
        }
    }

    private getOperationsFromWorkbenchFile(): vscode.TreeItem[] {
        const operations = FileProvider.instance.currrentWorkbenchOperations;
        if (operations == undefined) {
            return [new vscode.TreeItem("No workbench file selected", vscode.TreeItemCollapsibleState.None)];
        } else if (operations == {}) {
            return [new WorkbenchOperationTreeItem("No operations in selected workbench file", "")];
        } else {
            const toDep = (operationName: string, operation: string): WorkbenchOperationTreeItem => {
                return new WorkbenchOperationTreeItem(
                    operationName,
                    operation
                );
            };

            return Object.keys(operations).map(operationName => toDep(operationName, operations[operationName]));
        }
    }
}

export class WorkbenchOperationTreeItem extends vscode.TreeItem {
    constructor(
        public readonly operationName: string,
        public readonly operationString: string
    ) {
        super(operationName, vscode.TreeItemCollapsibleState.None);
        this.tooltip = this.operationName;

        if (this.operationString.includes('mutation'))
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', 'media', 'm.svg'),
                dark: path.join(__filename, '..', '..', '..', '..', 'media', 'm.svg')
            };
        else
            this.iconPath = {
                light: path.join(__filename, '..', '..', '..', '..', 'media', 'q.svg'),
                dark: path.join(__filename, '..', '..', '..', '..', 'media', 'q.svg')
            };

        this.command = {
            command: "current-workbench-operations.editOperation",
            title: "Open Operation File",
            arguments: [this]
        };

        this.contextValue = 'workbenchOperationTreeItem';
    }
}