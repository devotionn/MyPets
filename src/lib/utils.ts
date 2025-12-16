import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatAge(years: number, months: number): string {
    if (years === 0 && months === 0) return "不到1个月";
    if (years === 0) return `${months}个月`;
    if (months === 0) return `${years}岁`;
    return `${years}岁${months}个月`;
}

export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function formatRelativeTime(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return formatDate(date);
}

export const speciesLabels: Record<string, string> = {
    dog: "狗狗",
    cat: "猫咪",
    rabbit: "兔子",
    bird: "鸟类",
    other: "其他",
};

export const genderLabels: Record<string, string> = {
    male: "公",
    female: "母",
    unknown: "未知",
};

export const sizeLabels: Record<string, string> = {
    small: "小型",
    medium: "中型",
    large: "大型",
};

export const statusLabels: Record<string, string> = {
    available: "待领养",
    pending: "申请中",
    adopted: "已领养",
};

export const applicationStatusLabels: Record<string, string> = {
    pending: "审核中",
    approved: "已通过",
    rejected: "已拒绝",
    withdrawn: "已撤回",
};
