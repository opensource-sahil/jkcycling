'use client';

import { ReactNode, ElementType } from 'react';

interface ContainerProps<T extends ElementType> {
  children: ReactNode;
  as?: T;
  className?: string;
}

export function Container<T extends ElementType = 'div'>({ children, as }: ContainerProps<T>) {
  const Component = as || 'div';
  return <Component>{children}</Component>;
}