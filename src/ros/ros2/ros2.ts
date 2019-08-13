// Copyright (c) Andrew Short. All rights reserved.
// Licensed under the MIT License.

import * as vscode from "vscode";

import * as ros from "../ros";

export class ROS2 implements ros.ROSApi {
    private _context: vscode.ExtensionContext;
    private _env: any;

    public setContext(context: vscode.ExtensionContext, env: any) {
        this._context = context;
        this._env = env;
    }

    public getPackages(): Promise<{ [name: string]: string }> {
        // not yet implemented.
        return;
    }

    public getIncludeDirs(): Promise<string[]> {
        // not yet implemented.
        return;
    }

    public findPackageExecutables(packageName: string): Promise<string[]> {
        // not yet implemented.
        return;
    }

    public findPackageLaunchFiles(packageName: string): Promise<string[]> {
        // not yet implemented.
        return;
    }

    public startCore() {
        // not yet implemented.
        return;
    }

    public stopCore() {
        // not yet implemented.
        return;
    }

    public activateCoreMonitor(): vscode.Disposable {
        // not yet implemented.
        return;
    }

    public showCoreMonitor() {
        // not yet implemented.
        return;
    }

    public activateRosrun(packageName: string, executableName:string, argument: string): vscode.Terminal {
        // not yet implemented.
        return;
    }

    public activateRoslaunch(launchFilepath: string, argument: string): vscode.Terminal {
        // not yet implemented.
        return;
    }
}
