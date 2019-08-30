# Deploy from Windows

Requires Powershell

## Install [Scoop](https://github.com/lukesampson/scoop)

```
iex (new-object net.webclient).downloadstring('https://get.scoop.sh')
set-executionpolicy unrestricted -s cu
```

## Install programs

OpenSSH, rsync and [pshazz](https://github.com/lukesampson/pshazz)

```
scoop install openssh
scoop install rsync
scoop install pshazz
```

## Configure shipit-deploy

Here are some advices _(replace everything between <<>> with your own values)_:

### key

Path can be an absolute windows-style path, just replace `\` by `/`

```
"key" : "c:/users/<<username>>/.ssh/id_rsa"
```

### Workspace

Here is where I had problems. On one side, shipit will use the current drive letter as the root for folders. On the other side, rsync expects paths with drive letters in them. Here is what I tried (assuming project is located on `D:` drive):

#### `"workspace" : "/workspace/"`

- Copies project to `d:\workspace`
- rsync fails to find the folder

#### `"workspace" : "d:/workspace/"`

- Copies project to `d:\workspace`
- rsync fails to find the folder

#### `"workspace" : "/d/workspace/"`

- rsync would work and properly sync from `D:\workspace` but...
- ... the copy of the project goes Copies project to `d:\d\workspace`

In the end, I had picked option 1. and I had to make a change in the source code to append the drive letter to rsync's source path. Everything is described in [that commit of my pull request](https://github.com/vpratfr/shipit-deploy/commit/4bbf262a7d7036a2b534ab7233d0152e0d09ba20). You can then simply add a configuration variable to "default": `"rsyncDrive": "/d"`.

## Troubleshooting

### Conflict between ssh executables

Rsync prefers to use its own ssh.exe version. If gitbash is installed (or any other program offering its own ssh.exe), make sure that the ssh.exe used by default is the one from the rsync folder.

Hint: this could be done by making sure the rsync folder comes first in the PATH
