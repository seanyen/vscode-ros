// Copyright (c) Andrew Short. All rights reserved.
// Licensed under the MIT License.

import * as child_process from "child_process";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as os from "os";
import * as path from "path";
import * as readline from "readline";
import * as shell_quote from "shell-quote";
import * as tmp from "tmp";
import * as util from "util";
import * as vscode from "vscode";

import * as extension from "../../../../extension";
import * as requests from "../../../requests";
import * as utils from "../../../utils";
import { rosApi } from "../../../../ros/ros";
import { env } from "../../../../extension";

const promisifiedExec = util.promisify(child_process.exec);

interface ILaunchRequest {
    nodeName: string;
    executable: string;
    arguments: string[];
    cwd: string;
    env: { [key: string]: string };
}

export class LaunchResolver implements vscode.DebugConfigurationProvider {
    // tslint:disable-next-line: max-line-length
    public async resolveDebugConfigurationWithSubstitutedVariables(folder: vscode.WorkspaceFolder | undefined, config: requests.ILaunchRequest, token?: vscode.CancellationToken) {
        if (!path.isAbsolute(config.target) || (path.extname(config.target) !== ".launch" && path.extname(config.target) !== ".test")) {
            throw new Error("Launch request requires an absolute path as target.");
        }

        const delay = ms => new Promise(res => setTimeout(res, ms));

        // Manage the status of the ROS core, starting one if not present
        // The ROS core will continue to run until the VSCode window is closed
        if (await rosApi.getCoreStatus() == false) {
            console.log("ROS Core is not active, attempting to start automatically");
            rosApi.startCore();

            // Wait for the core to start up to a timeout
            const timeout_ms: number = 30000;
            const interval_ms: number = 100;
            let timeWaited: number = 0;
            while (await rosApi.getCoreStatus() == false && 
                timeWaited < timeout_ms) {
                timeWaited += interval_ms;
                await delay(interval_ms);
            }

            console.log("Waited " + timeWaited + " for ROS Core to start");

            if (timeWaited >= timeout_ms) {
                throw new Error('Timed out (' + timeWaited / 1000 + ' seconds) waiting for ROS Core to start. Start ROSCore manually to avoid this error.');
            }
        }

        const rosExecOptions: child_process.ExecOptions = {
            env: await extension.resolvedEnv(),
        };

        let result = await promisifiedExec(`roslaunch --dump-params ${config.target}`, rosExecOptions);
        if (result.stderr) {
            throw (new Error(`Error from roslaunch:\r\n ${result.stderr}`));
        } else if (result.stdout.length == 0) {
            throw (new Error(`roslaunch unexpectedly produced no output, please test by running \"roslaunch --dump-params ${config.target}\" in a ros terminal.`));
        }


        const parameters = Object.keys(yaml.load(result.stdout));
        if (parameters && parameters.length) {
            // only call into rosparam when necessary
            const tmpFile = tmp.fileSync();
            fs.writeFile(`${tmpFile.name}`, result.stdout, async (error) => {
                if (error) {
                    throw error;
                }
                await promisifiedExec(`rosparam load ${tmpFile.name}`, rosExecOptions);
                tmpFile.removeCallback();
            });
        }

        result = await promisifiedExec(`roslaunch --nodes ${config.target}`, rosExecOptions);
        if (result.stderr) {
            throw (new Error(`Error from roslaunch:\r\n ${result.stderr}`));
        } else if (result.stdout.length == 0) {
            throw (new Error(`roslaunch unexpectedly produced no output, please test by running \"roslaunch --dump-params ${config.target}\" in a ros terminal.`));
        }

        const nodes = result.stdout.trim().split(os.EOL);
        await Promise.all(nodes.map((node: string) => {
            return promisifiedExec(`roslaunch --args ${node} ${config.target}`, rosExecOptions);
        })).then((commands: Array<{ stdout: string; stderr: string; }>) => {
            commands.forEach((command, index) => {
                const launchRequest = this.generateLaunchRequest(nodes[index], command.stdout);
                this.executeLaunchRequest(launchRequest, false);
            });
        });
        // @todo: error handling for Promise.all

        // Return null as we have spawned new debug requests
        return null;
    }


    private generateLaunchRequest(nodeName: string, command: string): ILaunchRequest {
        let parsedArgs: shell_quote.ParseEntry[];
        const isWindows = os.platform() === "win32";

        if (isWindows) {
            // https://github.com/ros/ros_comm/pull/1809
            // escape backslash in file path
            parsedArgs = shell_quote.parse(command.replace(/[\\]/g, "\\$&"));
            parsedArgs = shell_quote.parse(parsedArgs[2].toString().replace(/[\\]/g, "\\$&"));
        } else {
            parsedArgs = shell_quote.parse(command);
        }

        const envConfig: { [key: string]: string; } = {};
        while (parsedArgs) {
            // https://github.com/ros/ros_comm/pull/1809
            if (isWindows && parsedArgs[0].toString() === "set") {
                parsedArgs.shift();
            }
            if (parsedArgs[0].toString().includes("=")) {
                const arg = parsedArgs.shift().toString();
                envConfig[arg.substring(0, arg.indexOf("="))] = arg.substring(arg.indexOf("=") + 1);

                // https://github.com/ros/ros_comm/pull/1809
                // "&&" is treated as Object
                if (isWindows && parsedArgs[0] instanceof Object) {
                    parsedArgs.shift();
                }
            } else {
                break;
            }
        }
        const request: ILaunchRequest = {
            nodeName: nodeName,
            executable: parsedArgs.shift().toString(),
            arguments: parsedArgs.map((arg) => {
                return arg.toString();
            }),
            cwd: ".",
            env: {
                ...extension.env,
                ...envConfig,
            },
        };
        return request;
    }

    private async executeLaunchRequest(request: ILaunchRequest, stopOnEntry: boolean) {
        let debugConfig: ICppvsdbgLaunchConfiguration | ICppdbgLaunchConfiguration | IPythonLaunchConfiguration;

        if (os.platform() === "win32") {
            if (request.executable.toLowerCase().endsWith("python") ||
                request.executable.toLowerCase().endsWith("python.exe")) {
                const pythonScript: string = request.arguments.shift();
                const pythonLaunchConfig: IPythonLaunchConfiguration = {
                    name: request.nodeName,
                    type: "python",
                    request: "launch",
                    program: pythonScript,
                    args: request.arguments,
                    env: request.env,
                    stopOnEntry: stopOnEntry,
                    justMyCode: false,
                };
                debugConfig = pythonLaunchConfig;
            } else if (request.executable.endsWith(".exe")) {
                interface ICppEnvConfig {
                    name: string;
                    value: string;
                }
                const envConfigs: ICppEnvConfig[] = [];
                for (const key in request.env) {
                    if (request.env.hasOwnProperty(key)) {
                        envConfigs.push({
                            name: key,
                            value: request.env[key],
                        });
                    }
                }
                const cppvsdbgLaunchConfig: ICppvsdbgLaunchConfiguration = {
                    name: request.nodeName,
                    type: "cppvsdbg",
                    request: "launch",
                    cwd: ".",
                    program: request.executable,
                    args: request.arguments,
                    environment: envConfigs,
                    stopAtEntry: stopOnEntry,
                };
                debugConfig = cppvsdbgLaunchConfig;
            }

            if (!debugConfig) {
                throw (new Error(`Failed to create a debug configuration!`));
            }
            const launched = await vscode.debug.startDebugging(undefined, debugConfig);
            if (!launched) {
                throw (new Error(`Failed to start debug session!`));
            }
        } else {
            try {
                // this should be guaranteed by roslaunch
                fs.accessSync(request.executable, fs.constants.X_OK);
            } catch (errNotExecutable) {
                throw (new Error(`Error! ${request.executable} is not executable!`));
            }

            try {
                // need to be readable to check shebang line
                fs.accessSync(request.executable, fs.constants.R_OK);
            } catch (errNotReadable) {
                throw (new Error(`Error! ${request.executable} is not readable!`));
            }

            const fileStream = fs.createReadStream(request.executable);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });

            // we only want to read 1 line to check for shebang line
            let linesToRead: number = 1;
            rl.on("line", async (line) => {
                if (linesToRead <= 0) {
                    return;
                }
                linesToRead--;
                if (!linesToRead) {
                    rl.close();
                }

                // look for Python in shebang line
                if (line.startsWith("#!") && line.toLowerCase().indexOf("python") !== -1) {
                    const pythonLaunchConfig: IPythonLaunchConfiguration = {
                        name: request.nodeName,
                        type: "python",
                        request: "launch",
                        program: request.executable,
                        args: request.arguments,
                        env: request.env,
                        stopOnEntry: stopOnEntry,
                        justMyCode: false,
                    };
                    debugConfig = pythonLaunchConfig;
                } else {
                    interface ICppEnvConfig {
                        name: string;
                        value: string;
                    }
                    const envConfigs: ICppEnvConfig[] = [];
                    for (const key in request.env) {
                        if (request.env.hasOwnProperty(key)) {
                            envConfigs.push({
                                name: key,
                                value: request.env[key],
                            });
                        }
                    }
                    const cppdbgLaunchConfig: ICppdbgLaunchConfiguration = {
                        name: request.nodeName,
                        type: "cppdbg",
                        request: "launch",
                        cwd: ".",
                        program: request.executable,
                        args: request.arguments,
                        environment: envConfigs,
                        stopAtEntry: stopOnEntry,
                        setupCommands: [
                            {
                                text: "-enable-pretty-printing",
                                description: "Enable pretty-printing for gdb",
                                ignoreFailures: true
                            }
                        ]
                    };
                    debugConfig = cppdbgLaunchConfig;
                }

                if (!debugConfig) {
                    throw (new Error(`Failed to create a debug configuration!`));
                }
                const launched = await vscode.debug.startDebugging(undefined, debugConfig);
                if (!launched) {
                    throw (new Error(`Failed to start debug session!`));
                }
            });
        }
    }
}
