# Git 与 GitHub 后续步骤

当前项目还没有 Git commit，也没有 GitHub remote。不要伪造日期或拆分成并未真实发生的历史记录。

## 现在可以完成的真实里程碑

在你检查当前应用和源代码后，可以将目前真实完成的版本作为第一个提交：

```bash
git add .
git commit -m "feat: implement SiteCheck reporting workflow with camera and GPS"
```

## 后续真实提交

1. 用 iPhone 完成 `TEST_PLAN.md`，发现并修复真实问题后提交，例如：

   ```bash
   git commit -am "fix: handle iPhone location permission test findings"
   ```

2. 加入真实截图、填写测试结果并更新 README 后提交，例如：

   ```bash
   git add README.md docs
   git commit -m "docs: add verified iPhone test evidence"
   ```

3. 最终复查和材料链接完成后再做最后一次真实提交。

如果测试没有发现某个问题，就不要为了增加 commit 数量虚构一个修复。

## GitHub

在自己的 GitHub 账号新建空仓库后，使用 GitHub 页面提供的真实仓库地址：

```bash
git remote add origin YOUR_REAL_GITHUB_REPOSITORY_URL
git branch -M main
git push -u origin main
```

推送后检查：源代码、README、docs、package files 和图片资源都存在；`node_modules`、`.expo`、`dist` 不应上传。若仓库为 private，必须向老师提供读取权限。
