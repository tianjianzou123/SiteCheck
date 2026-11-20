# SiteCheck iPhone 实机测试与取证指南

这份指南用于真实测试，不代表测试已经通过。所有照片、坐标、截图和结果都必须来自你实际运行的版本。

## 1. 连接 iPhone

1. 在 iPhone 的 App Store 安装 **Expo Go**。
2. 让电脑和 iPhone 连接同一个 Wi-Fi。
3. 在项目目录运行：

   ```bash
   npm install
   npm start
   ```

4. 用 iPhone 自带的相机扫描终端中的二维码，点击提示后选择在 Expo Go 中打开。
5. 如果同一 Wi-Fi 仍连接失败，停止服务后运行 `npx expo start --tunnel` 再扫码。

注意：当前交付方式是 Expo Go。没有 Apple 签名和开发者账号时，不能诚实地承诺一个可随意安装的 `.ipa`。

## 2. 第一次权限设置

- 相机弹窗：选择允许。
- 定位弹窗：选择 **Allow While Using App / 使用 App 期间允许**。
- 为了展示 GPS 精度，打开 **Precise Location / 精确位置**。
- SiteCheck 不申请后台定位，也不申请麦克风。

如需测试拒绝权限，在 iPhone 的 **Settings → Expo Go** 中关闭 Camera 或 Location，然后回到 App 重试。完成拒绝测试后再恢复权限。

## 3. 在校园完成一条真实报告

选择一个安全、允许拍摄的户外设施，例如路灯、长椅、指示牌或垃圾桶。不要为了演示虚构故障；如果设施正常，也可以如实记录轻微维护观察。

1. Dashboard 点击 **Create new report**。
2. `Inspection title`：正常设备可以写 `Routine inspection – crossing light near The Hub`；只有现场确实存在问题时才写故障标题。
3. `Description`：客观说明你看到的设施状态，不要写自动检测结果。
4. 选择真实的 Facility type 和 Inspection outcome。Normal不会显示问题处理字段；Needs attention或Fault found才需要Severity和Follow-up status。
5. 点击 **Take site photo**，让照片同时包含设施和周边定位参照物。
6. 点击 **Capture current GPS**，等待坐标和 `accuracy ±... m` 出现。
7. 如标记偏离设施，点击 **Fine-tune marker on map**，放大后拖动或点击正确位置。
8. `Location description`：写建筑物方向、道路、入口或地标，例如 `East path, opposite library entrance B`。
9. 根据现场情况完成检查清单；不确定的项目选 N/A，不要猜测。
10. 点击 **Save report**，然后核对详情页。

## 4. 必须亲自执行的功能流程

按 `TEST_PLAN.md` 记录结果，至少完整演示一次：

1. Create：新增真实报告。
2. Read：从 Dashboard 打开详情，并在 Map 查看标记。
3. Update：修改说明或状态，确认统计数字与标记颜色同步。
4. Persistence：完全关闭 Expo Go，重新打开项目，确认报告和照片仍在。
5. Delete：先取消一次删除，再确认删除，检查列表、统计和地图同步更新。
6. Offline：关闭网络后查看已保存记录；如地图瓦片不显示，应如实说明地图底图需要网络。
7. Permission errors：分别测试相机拒绝和定位拒绝，确认 App 不崩溃。

## 5. PPT 建议截图

截图前保持同一条真实报告的数据一致，并隐藏通知或个人信息。

- Dashboard：统计、搜索/筛选和真实报告卡片。
- Create Report：照片预览、GPS 坐标/精度和部分表单。
- Map：真实报告标记及弹窗。
- Details：照片、状态、坐标、定位来源和检查清单。
- Edit/Status：更新前后能够证明同步的画面。
- 代码截图：`ReportContext.tsx`、`reportStorage.ts`、`locationService.ts`、`photoStorage.ts` 中你能亲自解释的少量关键代码。

不要把模拟器像素场景、注入的虚拟 GPS、未执行的测试表或虚构截图当成实机证据。

## 6. 五分钟视频建议顺序

1. 约 20 秒：介绍 SiteCheck 和大型户外场地业务目的。
2. 约 45 秒：Dashboard、搜索、筛选和统计。
3. 约 90 秒：新建报告，真实拍照、GPS、位置说明和检查清单。
4. 约 45 秒：详情和地图标记。
5. 约 55 秒：编辑、状态更新、删除确认，覆盖完整 CRUD。
6. 约 30 秒：关闭并重开，证明本地持久化。
7. 约 45 秒：展示少量关键源码并用自己的话解释 Hooks、AsyncStorage、文件存储和两个设备 API。

视频必须由你本人配音，最终内容以实际完成和测试结果为准。
