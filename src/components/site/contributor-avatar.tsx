'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';

/**
 * 贡献者头像：优先使用 GitHub 头像（外链，不引入任何追踪脚本），
 * 加载失败时回退为首字母渐变块。
 */
export function ContributorAvatar({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = name.slice(0, 1).toUpperCase();

  if (failed) {
    return (
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-semibold text-primary-foreground',
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        aria-hidden="true"
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://github.com/${encodeURIComponent(name)}.png?size=${size * 2}`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('shrink-0 rounded-full border border-white/10 object-cover', className)}
      style={{ width: size, height: size }}
    />
  );
}
