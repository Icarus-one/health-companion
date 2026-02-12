
import React from 'react';

export const RED_FLAG_KEYWORDS = [
  '胸痛', '呼吸困难', '黑便', '呕血', '肢体无力', '高烧不退', '意识改变', '晕厥', '剧烈腹痛'
];

export const GASTRO_OPTIONS = {
  zh: {
    comfortable: '舒适',
    bloated: '胀气',
    pain: '疼痛',
    acid_reflux: '反酸'
  },
  en: {
    comfortable: 'Comfy',
    bloated: 'Bloated',
    pain: 'Pain',
    acid_reflux: 'Reflux'
  }
};

export const UI_TRANSLATIONS = {
  zh: {
    // Landing & Auth
    tagline: "您的长期健康伴侣",
    desc: "结合纵向身体数据，提供上下文感知的医疗洞察与个性化微干预。",
    start: "立即开始",
    login: "登录",
    email: "邮箱地址",
    otp: "验证码",
    sendOtp: "获取验证码",
    confirm: "确认",
    logout: "退出登录",
    deleteData: "注销并清空数据",
    lang: "English",
    welcome: "👋 欢迎。开始您今天的“10秒记录”。",
    settings: "系统设置",
    privacy: "隐私保护：所有数据均存储在您的本地设备。",
    otpMsg: "验证码已发送（模拟：请输入 123456）",
    back: "返回",
    
    // Nav
    navRecord: "记录",
    navChart: "趋势",
    navAI: "助手",

    // Record Form
    formTitle: "实时身体状态记录",
    formDesc: "您可以随时记录现在的感受。系统将结合记录时刻自动分析您的昼夜节律规律。",
    sleepLabel: "睡眠/休息感受",
    energyLabel: "当前精力水平",
    moodLabel: "当前情绪状态",
    gastroLabel: "肠胃感觉",
    symptomsLabel: "异常症状/即时感受 (可选)",
    symptomsPlaceholder: "如：饭后困倦、由于压力心跳快...",
    submitBtn: "提交当前记录",
    ratingBad: "不适",
    ratingAvg: "一般",
    ratingGood: "优秀",
    ratingScore: "分",

    // Dashboard
    chartTitle: "高维时序追踪",
    chartSubtitle: "捕获全天身体波动规律",
    insightTitle: "时序深度洞察",
    insightSubtitle: "Chronological Insights",
    genReportBtn: "生成分析",
    analyzing: "分析中...",
    noDataTitle: "暂无时序数据",
    noDataDesc: "请开始记录身体在不同时刻的状态。",
    lowDataDesc: "累积至少 3 个记录点后，我将为您分析身体在不同时段的微观规律。",
    readyDataDesc: "时序数据已就绪。点击按钮查看 AI 捕获的周期性特征。",

    // Chat
    chatTitle: "中西医结合助手",
    chatSubtitle: "已整合：症状检索 + 纵向趋势",
    chatPlaceholder: "问问身体的变化...",
    chatEmptyTitle: "“我不仅了解医学，更了解你”",
    chatEmptyDesc: "结合您的历史记录，我可以为您提供更精准的身体解读。",
    chatThinking: "正在分析医学知识库...",
  },
  en: {
    // Landing & Auth
    tagline: "Long-term Health Companion",
    desc: "Combining longitudinal body data to provide context-aware insights and micro-interventions.",
    start: "Get Started",
    login: "Login",
    email: "Email Address",
    otp: "Verification Code",
    sendOtp: "Send Code",
    confirm: "Confirm",
    logout: "Logout",
    deleteData: "Reset & Clear All Data",
    lang: "中文",
    welcome: "👋 Welcome. Start your '10-sec log' today.",
    settings: "Settings",
    privacy: "Privacy: All data is stored locally on your device.",
    otpMsg: "Code sent (Simulated: Enter 123456)",
    back: "Back",

    // Nav
    navRecord: "Log",
    navChart: "Trends",
    navAI: "AI Assistant",

    // Record Form
    formTitle: "Real-time Body Status",
    formDesc: "Record your feelings at any time. The system analyzes your circadian rhythm patterns.",
    sleepLabel: "Sleep/Rest Quality",
    energyLabel: "Current Energy Level",
    moodLabel: "Current Mood Status",
    gastroLabel: "Gastrointestinal Feeling",
    symptomsLabel: "Symptoms / Sensations (Optional)",
    symptomsPlaceholder: "e.g., Post-meal drowsiness, stress-induced rapid heart rate...",
    submitBtn: "Submit Record",
    ratingBad: "Bad",
    ratingAvg: "Average",
    ratingGood: "Excellent",
    ratingScore: "pts",

    // Dashboard
    chartTitle: "High-Dim Chrono Tracking",
    chartSubtitle: "Capturing all-day body fluctuations",
    insightTitle: "Chrono Deep Insights",
    insightSubtitle: "Chronological Insights",
    genReportBtn: "Generate Analysis",
    analyzing: "Analyzing...",
    noDataTitle: "No Data Available",
    noDataDesc: "Please start recording your body status.",
    lowDataDesc: "Record at least 3 points to enable micro-pattern analysis.",
    readyDataDesc: "Time-series data ready. Click the button to view AI-captured periodic traits.",

    // Chat
    chatTitle: "Health Assistant",
    chatSubtitle: "Integrated: Symptom check + Longitudinal trends",
    chatPlaceholder: "Ask about your body changes...",
    chatEmptyTitle: "“I know medicine, and I know you”",
    chatEmptyDesc: "Based on your history, I can provide precise interpretations.",
    chatThinking: "Analyzing medical database...",
  }
};
