# Guidelines for Maintainers ddd

## Repository Policies

Please follow these principles for this repository:

- pull requests require 2+ approvals
- always work in forks
- do not merge your own changes
- follow release testing guidelines

### Release Testing

#### Starting, terminating, and monitoring ROS core

1. launch ROS core monitor with `ros.showMasterStatus`
2. start a new ROS core process in background with `ros.startCore`
3. check if ROS core monitor shows parameters and nodes correctly
4. termintate the ROS core process with `ros.stopCore`
5. check if ROS core monitor shows "offline"

#### Creating a terminal with ROS environment sourced

1. start a new ROS terminal with `ros.createTerminal`
2. check if ROS environment variables are properly configured

#### Execute a ROS executable

1. start a ROS core process (in another terminal or with `ros.startCore`)
2. execute `ros.rosrun` and choose an executable
3. check if the executable gets launched

#### Execute a ROS launch file

1. execute `ros.roslaunch` and choose a launch file
2. check if the launch file gets launched

## Release Instructions

The following instructions are intended for developers responsible for maintaining this repository.

### Working with this repository

Here are a few recommendations for maintainers for this project:

- While this project is created as a fork from the [original vscode-ros project][ajshort_vscode-ros], please **do not** merge `upstream/master` and push (unless planned).
- Please **do not** alter commit history unless it is necessary and everyone working on the project is notified:
    - **do not** use `git rebase`
    - **do not** use `git reset --hard` to revert to any commit earlier than current `HEAD`
    - try to avoid calling `git push --force`
- Please **try not to** directly push to `origin`, work with forks and merge changes through pull requests
- Because **tags** are used for release purposes ***for this project***, please **do not** abuse the use of them, and follow instructions for releasing.

### Publishing a release

#### Release checklist

Please review the following before publishing a new release:

Metadata:

- [ ] update `README.md`
- [ ] update `CHANGELOG.md`
- [ ] update version number in `package.json`

#### Authorizing a manual release (through the release pipeline)

To authorize a release manually, schedule a release build with the [vscode-ros.ci pipeline][vscode-ros.ci].

![schedule a release build][schedule_manual_release_build]

#### Triggering an automatic release (with a new tag)

The [auto-publish pipeline][vscode-ros.auto-publish] automatically picks up new tags and starts a release build automatically once a new tag is created. To create a new tag, follow these steps in a local `ms-iot/vscode-ros` git repository:

1. Sync with remote
    ```
    git pull
    ```

2. Create a new tag
    ```
    git tag --list
    git log --oneline -n <log_number>
    git tag <tag_name> <commit_id>
    git push origin <tag_name>
    ```

> `TODO:` The `git tag <tag_name>` command creates a lightweight tag. Signed tags are supposedly recommended for release purposes.

3. Remove (cleanup) a tag
    ```
    git tag --list
    git tag -d <tag_name>
    git push origin --delete <tag_name>
    ```

<!-- link to files -->
[schedule_manual_release_build]: /media/documentation/pipeline-manual-release.png

<!-- link to external sites -->
[ajshort_vscode-ros]: https://github.com/ajshort/vscode-ros
[vscode-ros.auto-publish]: https://ros-win.visualstudio.com/ros-win/_build?definitionId=58
[vscode-ros.ci]: https://ros-win.visualstudio.com/ros-win/_build?definitionId=57
