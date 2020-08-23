import * as firebase from 'firebase/app';
import 'firebase/auth';
import * as vscode from 'vscode';
import { firebaseConfig } from './config';

const EMAIL_KEY = "email";
const PASSWORD_KEY = "password";
let trackStatusBarItem: vscode.StatusBarItem;

async function connect(email: string, password: string): Promise<firebase.auth.UserCredential> {
	return firebase.auth().signInWithEmailAndPassword(email, password).then(cred => {
		vscode.window.showInformationMessage('Connected to firebase');
		return cred;
	}).catch(error => {
		vscode.window.showErrorMessage(error.message);
		throw error;
	});
}

function hasCredentials(state: vscode.Memento): boolean {
	let email = state.get(EMAIL_KEY, "");
	let password = state.get(PASSWORD_KEY, "");
	return ((email !== "") && (password !== ""));
}

async function registerCredentials(state: vscode.Memento) {
	let email = await vscode.window.showInputBox({
		prompt: "User email",
		placeHolder: "email"});
	if (email) {
		await state.update(EMAIL_KEY, email);
	} else {
		vscode.window.showErrorMessage("Email is required for authentification");
		return;
	}
	let password = await vscode.window.showInputBox({
		prompt: "User password",
		placeHolder: "password", 
		password: true});
	if (password) {
		await state.update(PASSWORD_KEY, password);
	} else {
		vscode.window.showErrorMessage("Password is required for authentification");
		return;
	}
}

async function resetCredentials(state: vscode.Memento) {
	await state.update(EMAIL_KEY, "");
	await state.update(PASSWORD_KEY, "");
	vscode.window.showInformationMessage("Credentials reset");
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "trackme" is now active!');
	let app = firebase.initializeApp(firebaseConfig);
	let state = context.globalState;
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('trackme.start', async () => {
		// The code you place here will be executed every time your command is executed
		while (!hasCredentials(state)) {
			await registerCredentials(state);
		}
	
		let email = state.get(EMAIL_KEY, "");
		let password = state.get(PASSWORD_KEY, "");
		// Display a message box to the user
		connect(email, password).then(_ => {
			vscode.window.showInformationMessage("Start tracking");
		}).catch(error => {
			vscode.window.showErrorMessage("Failed to start tracking");
		});
	});

	context.subscriptions.push(disposable);

	// Credentials
	let registerCred = vscode.commands.registerCommand('trackme.register', async () => {
		await registerCredentials(state);
	});
	context.subscriptions.push(registerCred);
	let resetCred = vscode.commands.registerCommand('trackme.reset', async () => {
		await resetCredentials(state);
	});

}

// this method is called when your extension is deactivated
export function deactivate() {}
