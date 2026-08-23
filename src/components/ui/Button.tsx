'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

/**
 * `.btn` only supplies shape and spacing, so a variant class is needed for
 * the button to have any colour at all. Callers can pass their own className
 * to override.
 */
const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <button ref={ref} className={className ?? 'btn btn-primary'} {...props} />
    );
  }
);

Button.displayName = 'Button';

export { Button };
