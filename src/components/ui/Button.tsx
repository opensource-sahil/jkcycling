'use client';


import { ButtonHTMLAttributes, forwardRef } from 'react';

const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  (props, ref) => {
    return (
      <button ref={ref} className="btn" {...props} />
    );
  }
);

Button.displayName = 'Button';

export { Button };