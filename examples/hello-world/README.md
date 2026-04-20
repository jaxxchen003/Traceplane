# Traceplane Hello World

一个简单的 Agent SDK 使用示例。

## 快速开始

1. 确保 Traceplane 后端在运行：
```bash
cd ../..
npm run dev
```

2. 安装依赖：
```bash
cd examples/hello-world
npm install
```

3. 运行演示：
```bash
npm run demo
```

或者设置环境变量：
```bash
TRACEPLANE_BASE_URL=http://localhost:3000 \
TRACEPLANE_PROJECT_ID=q2-customer-pulse \
TRACEPLANE_AGENT_ID=my-agent \
npm run demo
```

4. 在浏览器中查看结果：
打开 http://localhost:3000/zh/projects/q2-customer-pulse 查看新创建的 Episode

## 代码说明

`agent-demo.ts` 演示了：
1. 创建 Episode
2. 记录执行步骤 (steps)
3. 记录工具调用 (toolUse)
4. 创建 Memory
5. 创建 Artifact
6. 标记 Episode 完成
