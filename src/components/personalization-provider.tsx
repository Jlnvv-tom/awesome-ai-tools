'use client';

import { createContext, useContext } from 'react';

import { useFavoritesState, type FavoritesValue } from '@/lib/favorites';
import { useUsageStatsState, type UsageValue } from '@/lib/usage';

const FavoritesContext = createContext<FavoritesValue | null>(null);
const UsageContext = createContext<UsageValue | null>(null);

/**
 * 个性化数据 Provider：收藏夹与使用统计。
 *
 * 二者都来自 localStorage，必须由单一状态源下发，否则顶栏徽标、卡片按钮、
 * 收藏页与「我的常用」区块之间会出现状态不一致。
 */
export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const favorites = useFavoritesState();
  const usage = useUsageStatsState(favorites.has);

  return (
    <FavoritesContext.Provider value={favorites}>
      <UsageContext.Provider value={usage}>{children}</UsageContext.Provider>
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
