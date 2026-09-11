'use client';

import { createContext, useContext } from 'react';

import { useFavoritesState, type FavoritesValue } from '@/lib/favorites';
import { useIconStyleState, type IconStyleValue } from '@/lib/icon-style';
import { useUsageStatsState, type UsageValue } from '@/lib/usage';

const FavoritesContext = createContext<FavoritesValue | null>(null);
const UsageContext = createContext<UsageValue | null>(null);
const IconStyleContext = createContext<IconStyleValue | null>(null);

/**
 * 个性化偏好与本地数据 Provider：收藏夹、使用统计与图标风格。
 *
 * 三者都来自 localStorage，必须由单一状态源下发，否则顶栏徽标、卡片按钮、
 * 收藏页、「我的常用」区块与逐个图标之间会出现状态不一致。
 */
export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const favorites = useFavoritesState();
  const usage = useUsageStatsState(favorites.has);
  const iconStyle = useIconStyleState();

  return (
    <FavoritesContext.Provider value={favorites}>
      <UsageContext.Provider value={usage}>
        <IconStyleContext.Provider value={iconStyle}>{children}</IconStyleContext.Provider>
      </UsageContext.Provider>
    </FavoritesContext.Provider>
  );
}

/**
 * 优先使用 Provider 内的共享状态；未处于 Provider 内时降级为组件本地状态
 * （例如静态预渲染阶段），保证组件在任何位置都能安全渲染。
 */
export function useFavorites(): FavoritesValue {
  const context = useContext(FavoritesContext);
  const local = useFavoritesState(context === null);
  return context ?? local;
}

export function useUsageStats(): UsageValue {
  const context = useContext(UsageContext);
  const local = useUsageStatsState(() => false, context === null);
  return context ?? local;
}

/**
 * 图标风格偏好。
 *
 * 由 Provider 统一下发而非每个图标各读一次：首页同时存在 300 多个图标，
 * 各自订阅会造成上百次 localStorage 读取与 storage 监听。
 */
export function useIconStyle(): IconStyleValue {
  const context = useContext(IconStyleContext);
  const local = useIconStyleState(context === null);
  return context ?? local;
}
