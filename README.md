# Visual Studio Code Extension for ROS~

[![Build Status][vscode-ros-master-build_status]][vscode-ros-master-build_details]

The [Visual Studio Code][vscode] Extension for ROS provides support for [Robot Operating System (ROS)][ros] development. Providing an easier and more stream-lined developer experience.

## Getting Started

The extension will automatically start when you open a catkin workspace.
The build system (e.g. catkin_make or catkin build) will automatically be confirmed from the hidden files associated with
each system.
The ROS distro will automatically be confirmed from the parent environment, or you will be prompted to select a ROS
distro if this can't be done automatically.

> You must build the catkin workspace at least once before the extension will recognise it.

To start ROS core, use the "ROS: Start Core" command.
The "ROS Core" indicator in the bottom left will show if the core is currently running, and you can click on this to view parameters etc.

The first time you open the workspace the extension will automatically create build and test tasks and update the
C++ and Python paths. You can re-run this process later using the appropriate commands.

## Talk Video

[![ROSCON 2019 ROS Extension Talk Video](https://i.vimeocdn.com/video/839088609_640.webp)](https://vimeopro.com/osrfoundation/roscon-2019/video/379127667)

## Features

* Automatic ROS environment configuration.
* Allows starting, stopping and viewing the ROS core status.
* Automatically discover `catkin_make` or `catkin build` build tasks.
* Create catkin packages using `catkin_create_pkg` script or `catkin create pkg`.
* Run `rosrun` or `roslaunch`
* Resolve dependencies with `rosdep` shortcut
* Syntax highlighting for `.msg`, `.urdf` and other ROS files.
* Automatically add the ROS C++ include and Python import paths.
* Format C++ using the ROS `clang-format` style.
* Preview URDF and Xacro files.
* Debug a single ROS node (C++ or Python) by [attaching to the process][debug_support-attach].
* Debug ROS nodes (C++ or Python) [launched from a `.launch` file][debug_support-launch].

## Commands

| Name | Command | Description |
|:---:|:---:|:---|
| Create Catkin Package | `ros.createCatkinPackage` | Create a catkin package. You can right click on a folder in the explorer to create it in a specific location. |
| Create Terminal | `ros.createTerminal` | Create a terminal with ROS sourced. |
| Show Core Status | `ros.showCoreStatus` | Open a detail view showing ROS core runtime status. |
| Start Core | `ros.startCore` | Spawn a ROS core |
| Stop Core | `ros.stopCore` | Terminate the ROS core |
| Update C++ Properties | `ros.updateCppProperties` | Update the C++ include path to include ROS. |
| Update Python Path | `ros.updatePythonPath` | Update the Python path to include ROS. |
| Preview URDF | `ros.previewUrdf` | Preview URDF and Xacro files. Updates after changes are saved. |
| Run rosdep | `ros.rosdep` | Shortcut for `rosdep install --from-paths src --ignore-src -r -y`. |

### Get Latest Build

[![Build Status][vscode-ros-master-build_status]][vscode-ros-master-build_details]

The lastest unreleased changes could be added by installing the extension's latest build manually.
To get the latest build (`.vsix` built from the latest commit), access our [build pipeline][vscode-ros-master-build_details] by clicking on the build badge attached above.
In the build status page, the generated `.vsix` could be downloaded as an artifact:

![download vsix artifact][download_vsix_artifact]

The downloaded `.vsix` package could be installed with the `Extensions: Install from VSIX...` command from the Command Palette (`Ctrl+Shift+P`), or by choosing the `Install from VSIX...` option in the Extensions tab from any Visual Studio Code instance.

## Reporting Security Issues

Security issues and bugs should be reported privately, via email, to the Microsoft Security Response Center (MSRC) at [secure@microsoft.com](mailto:secure@microsoft.com). You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Further information, including the [MSRC PGP](https://technet.microsoft.com/en-us/security/dn606155) key, can be found in the [Security TechCenter](https://technet.microsoft.com/en-us/security/default).

## Data and Telemetry

This extension collects usage data and sends it to Microsoft to help improve our products and services. Read our [privacy statement](https://privacy.microsoft.com/en-us/privacystatement) to learn more.

This extension respects the `telemetry.enableTelemetry` setting, learn more about [this option](https://code.visualstudio.com/docs/supporting/faq#_how-to-disable-telemetry-reporting).

## Contributors

A big ***Thank you!*** to everyone that have helped make this extension better!

* Andrew Short ([@ajshort](https://github.com/ajshort)), **original author**
* James Giller ([@JamesGiller](https://github.com/JamesGiller))

Contributions are always welcome! Please see our [contributing guide][contributing] for more details!

<!-- link to files -->
<!-- relative links in Visual Studio Marketplace page lead to 404 error, need to use absolute link -->
[contributing]: https://github.com/ms-iot/vscode-ros/blob/master/CONTRIBUTING.md

<!-- feature documentation -->
[debug_support-attach]: https://github.com/ms-iot/vscode-ros/blob/master/doc/debug-support.md#attach
[debug_support-launch]: https://github.com/ms-iot/vscode-ros/blob/master/doc/debug-support.md#launch

<!-- media -->
[download_vsix_artifact]: https://github.com/ms-iot/vscode-ros/blob/master/media/documentation/download-vsix-artifact.png

<!-- link to external sites -->
[ros]: http://ros.org
[vscode]: https://code.visualstudio.com
[vscode-ros-master-build_status]: https://dev.azure.com/ros-win/ros-win/_apis/build/status/vscode-ros.ci?branchName=master
[vscode-ros-master-build_details]: https://dev.azure.com/ros-win/ros-win/_build/latest?definitionId=57&branchName=master
