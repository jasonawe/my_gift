import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { Solar } from "lunar-javascript"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatToLunar(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();
    return `${lunar.getYearInGanZhi()}(${lunar.getYearShengXiao()})年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
  } catch (e) {
    return "";
  }
}

export function getThemeByEventType(type: string, manualTheme?: string): "theme-festive" | "theme-ink" | "theme-celadon" | "theme-solemn" {
  // 优先使用手动指定的主题
  if (manualTheme && manualTheme !== "auto") {
    return manualTheme as any;
  }

  if (!type) return "theme-ink";
  
  // 喜庆类
  if (["婚礼", "满月", "寿宴", "乔迁"].includes(type) || type.includes("喜") || type.includes("婚")) {
    return "theme-festive";
  }
  
  // 肃穆类
  if (type.includes("白事") || type.includes("吊唁") || type.includes("追思") || type.includes("丧")) {
    return "theme-solemn";
  }
  
  // 文雅类
  if (type === "其他") {
    return "theme-ink";
  }

  // 默认天青
  return "theme-celadon";
}

export function amountToChinese(n: number): string {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];
  let s = '';
  for (let i = 0; i < fraction.length; i++) {
    s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
  }
  s = s || '整';
  n = Math.floor(n);
  for (let i = 0; i < unit[0].length && n > 0; i++) {
    let p = '';
    for (let j = 0; j < unit[1].length && n > 0; j++) {
      p = digit[n % 10] + unit[1][j] + p;
      n = Math.floor(n / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }
  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整');
}
