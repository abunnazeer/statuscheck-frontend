// src/components/ui/Table.tsx

import { ReactNode, HTMLAttributes } from 'react';
import styles from './Table.module.css';
import { cn } from '@/lib/utils';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  variant?: 'default' | 'striped' | 'bordered';
  responsive?: boolean;
}

export default function Table({
  children,
  variant = 'default',
  responsive = true,
  className,
  ...props
}: TableProps) {
  const table = (
    <table className={cn(styles.table, styles[variant], className)} {...props}>
      {children}
    </table>
  );

  if (responsive) {
    return <div className={styles.responsive}>{table}</div>;
  }

  return table;
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableHeader({
  children,
  className,
  ...props
}: TableHeaderProps) {
  return (
    <thead className={cn(styles.thead, className)} {...props}>
      {children}
    </thead>
  );
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody className={cn(styles.tbody, className)} {...props}>
      {children}
    </tbody>
  );
}

interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableFooter({
  children,
  className,
  ...props
}: TableFooterProps) {
  return (
    <tfoot className={cn(styles.tfoot, className)} {...props}>
      {children}
    </tfoot>
  );
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
}

export function TableRow({
  children,
  hoverable = false,
  clickable = false,
  className,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={cn(
        styles.tr,
        hoverable && styles.hoverable,
        clickable && styles.clickable,
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export function TableHead({
  children,
  align = 'left',
  className,
  ...props
}: TableHeadProps) {
  return (
    <th
      className={cn(styles.th, styles[`align-${align}`], className)}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export function TableCell({
  children,
  align = 'left',
  className,
  ...props
}: TableCellProps) {
  return (
    <td
      className={cn(styles.td, styles[`align-${align}`], className)}
      {...props}
    >
      {children}
    </td>
  );
}

interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  children: ReactNode;
}

export function TableCaption({
  children,
  className,
  ...props
}: TableCaptionProps) {
  return (
    <caption className={cn(styles.caption, className)} {...props}>
      {children}
    </caption>
  );
}