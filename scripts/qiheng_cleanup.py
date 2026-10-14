#!/usr/bin/env python3
"""Inventory Qiheng evidence and generate literal cleanup commands; never delete."""
from pathlib import Path
import json
import os
import shlex

PROJECT = Path(__file__).resolve().parents[1]
ROOT = PROJECT / '.tmp' / 'qiheng'
CONTROL = ROOT / 'cleanup'


def validate_path(path, legacy=False):
    if not path.is_absolute() or '..' in path.parts:
        raise ValueError(f'路径必须是明确绝对路径：{path}')
    if legacy:
        if len(path.parts) < 4 or path.parts[:3] != ('/', 'private', 'tmp') or not path.parts[3].startswith('qiheng'):
            raise ValueError(f'非奇衡旧临时路径：{path}')
    else:
        path.relative_to(ROOT)
        if path == CONTROL or CONTROL in path.parents:
            raise ValueError('清理控制文件不得进入删除清单')
    if any(p.is_symlink() for p in (path, *path.parents)):
        raise ValueError(f'不沿符号链接收集清理目标：{path}')


def inventory():
    files, dirs = set(), set()
    legacy = CONTROL / 'legacy-manifest.json'
    if legacy.exists():
        data = json.loads(legacy.read_text())
        for item in data['files']:
            p = Path(item['path']); validate_path(p, legacy=True)
            if p.exists():
                if not p.is_file(): raise ValueError(f'原文件类型已变化：{p}')
                files.add(p)
        for name in data['directories_retained']:
            p = Path(name); validate_path(p, legacy=True)
            if p.exists():
                if not p.is_dir(): raise ValueError(f'原目录类型已变化：{p}')
                dirs.add(p)
    def onerror(error):
        raise error
    for base, subdirs, names in os.walk(ROOT, followlinks=False, onerror=onerror):
        parent = Path(base)
        subdirs[:] = [d for d in subdirs if parent / d != CONTROL]
        for name in subdirs:
            p = parent / name; validate_path(p); dirs.add(p)
        for name in names:
            p = parent / name; validate_path(p)
            if not p.is_file(): raise ValueError(f'非普通文件：{p}')
            files.add(p)
    return sorted(files), sorted(dirs, key=lambda p: (-len(p.parts), str(p)))


def main():
    # Keep the managed root and cleanup controls for subsequent course runs.
    if any(p.is_symlink() for p in (CONTROL, ROOT, ROOT.parent)):
        raise ValueError('工作目录不能是符号链接')
    CONTROL.mkdir(parents=True, exist_ok=True)
    files, dirs = inventory()
    size = sum(p.stat().st_size for p in files)
    data = {'file_count':len(files), 'bytes':size,
            'files':[{'path':str(p),'bytes':p.stat().st_size} for p in files],
            'empty_directory_commands':[str(p) for p in dirs]}
    (CONTROL / 'manifest.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
    lines = ['#!/bin/sh', '# 课程完成后由用户审阅并执行。生成器从不执行删除。',
             '# 每个 rm/rmdir 仅有一个固定绝对路径；不递归，无通配符、无循环。',
             '# 未登记的新文件会使 rmdir 失败并停止；请重新生成清单后审阅。', 'set -e', '', '# 文件']
    for p in files:
        q=shlex.quote(str(p))
        lines.append(f'if [ -e {q} ]; then /bin/rm -- {q}; fi')
    lines += ['', '# 空目录：最深层在先。保留项目临时根目录及 cleanup 控制文件。']
    for p in dirs:
        q=shlex.quote(str(p))
        lines.append(f'if [ -d {q} ]; then /bin/rmdir -- {q}; fi')
    (CONTROL/'delete-files.sh').write_text('\n'.join(lines)+'\n')
    text=f'''# 奇衡课程临时材料清理清单

当前记录 {len(files)} 个文件，约 {size/1024**3:.2f} GiB；另生成 {len(dirs)} 条空目录删除命令。

课程完成前保留素材。生成器只写清单和命令，未执行删除。

- 新材料统一存放于项目 `.tmp/qiheng/<series>/<BVID>/`，由 Git 忽略。
- 旧 `/private/tmp` 材料保持原位，按 `legacy-manifest.json` 明确路径登记；不自动扩大外部扫描范围。
- 每次制作完成运行 `python3 scripts/qiheng_cleanup.py` 更新本清单及 `delete-files.sh`。
- 命令逐文件删除，再逐个 `rmdir` 清理空目录；未登记文件仍在时目录不会被删除，脚本停止。
- 正式文章、入库图片、skill、Git、共享缓存不在清理范围内。
- 项目 `.tmp/qiheng/` 及 `cleanup/` 控制文件保留以便后续维护；旧系统清理目录纳入删除。
- 当前清单不能替代历史全盘审计；匿名缓存和之前无法读取的系统位置仍未纳入。

课程完成后，用户审阅后手动执行：

```sh
/bin/sh {CONTROL/'delete-files.sh'}
```

## 文件

| 路径 | 字节 |
| --- | ---: |
'''
    for p in files:text+=f'| `{p}` | {p.stat().st_size} |\n'
    text+='\n## 空目录删除顺序\n\n'
    for p in dirs:text+=f'- `{p}`\n'
    (CONTROL/'README.md').write_text(text)
    print(f'仅生成清单：{len(files)} 个文件，{len(dirs)} 个目录，{size/1024**3:.2f} GiB；未删除。')


if __name__ == '__main__':
    main()
