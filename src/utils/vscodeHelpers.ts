import { Uri, window, workspace } from "vscode";
import { getUserMemberships, isValidKey } from "../studio-gql/graphClient";
import { StateManager } from "../workbench/stateManager";
import { WorkbenchUri } from "./files/fileProvider";

export async function getLineText(serviceName: string, lineAt: number = 0): Promise<string> {
    let doc = await workspace.openTextDocument(WorkbenchUri.parse(serviceName));
    if (doc)
        return doc.lineAt(lineAt).text;

    return "";
}

export async function getLastLineOfText(serviceName: string) {
    let doc = await workspace.openTextDocument(WorkbenchUri.parse(serviceName));
    let docLine = doc.lineAt(doc.lineCount - 1);

    return docLine;
}

export async function enterApiKey() {
    let apiKey = await window.showInputBox({ placeHolder: "Enter User API Key - user:gh.michael-watson:023jr324tj....", })
    if (apiKey && await isValidKey(apiKey)) {
        StateManager.instance.globalState_userApiKey = apiKey;
    }
}

export async function setAccountId() {
    if (!StateManager.instance.globalState_userApiKey)
        await enterApiKey();

    let accountId = '';
    let apiKey = StateManager.instance.globalState_userApiKey;

    if (apiKey) {
        const myAccountIds = await getUserMemberships(apiKey);
        const memberships = (myAccountIds?.me as any)?.memberships;
        if (memberships?.length > 1) {
            let accountMapping: { [key: string]: string } = {};
            memberships.map(membership => {
                let accountId = membership.account.id;
                let accountName = membership.account.name;
                accountMapping[accountName] = accountId;
            });

            let selectedOrgName = await window.showQuickPick(Object.keys(accountMapping), { placeHolder: "Select an account to load graphs from" }) ?? "";
            accountId = accountMapping[selectedOrgName];

        } else {
            accountId = memberships[0]?.account?.id ?? "";
        }

        if (accountId) {
            StateManager.instance.globalState_selectedGraph = "";
            StateManager.instance.globalState_selectedApolloAccount = accountId;
        }
    }
}