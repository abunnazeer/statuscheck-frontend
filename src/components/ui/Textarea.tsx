// src/components/ui/Textarea.tsx

import { TextareaHTMLAttributes, forwardRef } from 'react';
import styles from './Textarea.module.css';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      showCharCount = false,
      maxLength,
      className,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const charCount = value ? String(value).length : 0;

    return (
      <div className={cn(styles.wrapper, fullWidth && styles.fullWidth)}>
        {label && (
          <div className={styles.labelWrapper}>
            <label className={styles.label} htmlFor={props.id}>
              {label}
              {props.required && <span className={styles.required}>*</span>}
            </label>
            {showCharCount && maxLength && (
              <span className={styles.charCount}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}

        <div className={cn(styles.textareaWrapper, error && styles.hasError)}>
          <textarea
            ref={ref}
            className={cn(
              styles.textarea,
              error && styles.textareaError,
              className
            )}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${props.id}-error`
                : helperText
                ? `${props.id}-helper`
                : undefined
            }
            {...props}
          />
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

Textarea.displayName = 'Textarea';

export default Textarea;