// src/components/ui/Select.tsx

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import styles from './Select.module.css';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      fullWidth = false,
      options,
      placeholder,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn(styles.wrapper, fullWidth && styles.fullWidth)}>
        {label && (
          <label className={styles.label} htmlFor={props.id}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={cn(styles.selectWrapper, error && styles.hasError)}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

          <select
            ref={ref}
            className={cn(
              styles.select,
              leftIcon && styles.hasLeftIcon,
              error && styles.selectError,
              className
            )}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${props.id}-error`
                : helperText
                ? `${props.id}-helper`
                : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <span className={styles.arrow}>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className={styles.arrowIcon}
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {error && (
          <p className={styles.error} id={`${props.id}-error`}>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className={styles.helperText} id={`${props.id}-helper`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;