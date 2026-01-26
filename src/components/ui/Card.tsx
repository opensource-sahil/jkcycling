'use client';

import { ElementType, ReactNode } from 'react';

interface CardProps<T extends ElementType = 'div'> {
  children: ReactNode;
  as?: T;
  className?: string;
}

export function Card<T extends ElementType = 'div'>({ children, as }: CardProps<T>) {
  const Component = as || 'div';
  return <Component>{children}</Component>;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children }: CardHeaderProps) {
  return <div>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children }: CardTitleProps) {
  return <h3>{children}</h3>;
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children }: CardDescriptionProps) {
  return <p>{children}</p>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children }: CardContentProps) {
  return <div>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children }: CardFooterProps) {
  return <div>{children}</div>;
}