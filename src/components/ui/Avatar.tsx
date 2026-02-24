// // src/components/ui/Avatar.tsx

// import { ImgHTMLAttributes, ReactNode } from 'react';
// import styles from './Avatar.module.css';
// import { cn } from '@/lib/utils';
// import { getInitials } from '@/lib/utils';

// interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
//   src?: string | null;
//   alt: string;
//   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
//   shape?: 'circle' | 'square';
//   fallback?: ReactNode;
//   status?: 'online' | 'offline' | 'away' | 'busy';
//   firstName?: string;
//   lastName?: string;
// }

// export default function Avatar({
//   src,
//   alt,
//   size = 'md',
//   shape = 'circle',
//   fallback,
//   status,
//   firstName,
//   lastName,
//   className,
//   ...props
// }: AvatarProps) {
//   const showStatus = status !== undefined;
//   const initials =
//     firstName && lastName ? getInitials(firstName, lastName) : alt.slice(0, 2).toUpperCase();

//   return (
//     <div
//       className={cn(
//         styles.avatarWrapper,
//         styles[size],
//         showStatus && styles.withStatus
//       )}
//     >
//       <div className={cn(styles.avatar, styles[shape], className)}>
//         {src ? (
//           <img
//             src={src}
//             alt={alt}
//             className={styles.image}
//             onError={(e) => {
//               e.currentTarget.style.display = 'none';
//             }}
//             {...props}
//           />
//         ) : fallback ? (
//           <div className={styles.fallback}>{fallback}</div>
//         ) : (
//           <div className={styles.initials}>{initials}</div>
//         )}
//       </div>

//       {showStatus && (
//         <span
//           className={cn(styles.status, styles[`status-${status}`])}
//           aria-label={`Status: ${status}`}
//         />
//       )}
//     </div>
//   );
// }

// interface AvatarGroupProps {
//   children: ReactNode;
//   max?: number;
//   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
//   className?: string;
// }

// export function AvatarGroup({
//   children,
//   max = 4,
//   size = 'md',
//   className,
// }: AvatarGroupProps) {
//   const childrenArray = Array.isArray(children) ? children : [children];
//   const visibleChildren = childrenArray.slice(0, max);
//   const extraCount = Math.max(0, childrenArray.length - max);

//   return (
//     <div className={cn(styles.avatarGroup, styles[`group-${size}`], className)}>
//       {visibleChildren}
//       {extraCount > 0 && (
//         <div className={cn(styles.avatar, styles.circle, styles[size])}>
//           <div className={styles.extra}>+{extraCount}</div>
//         </div>
//       )}
//     </div>
//   );
// }


// src/components/ui/Avatar.tsx

import { ImgHTMLAttributes, ReactNode } from 'react';
import styles from './Avatar.module.css';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  fallback?: ReactNode;
  status?: 'online' | 'offline' | 'away' | 'busy';
  firstName?: string;
  lastName?: string;
}

const Avatar = ({
  src,
  alt = '',
  size = 'md',
  shape = 'circle',
  fallback,
  status,
  firstName,
  lastName,
  className,
  ...props
}: AvatarProps) => {
  const showStatus = status !== undefined;
  const initials =
    firstName && lastName 
      ? getInitials(firstName, lastName) 
      : alt 
        ? alt.slice(0, 2).toUpperCase() 
        : '?';

  return (
    <div
      className={cn(
        styles.avatarWrapper,
        styles[size],
        showStatus && styles.withStatus
      )}
    >
      <div className={cn(styles.avatar, styles[shape], className)}>
        {src ? (
          <img
            src={src}
            alt={alt}
            className={styles.image}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            {...props}
          />
        ) : fallback ? (
          <div className={styles.fallback}>{fallback}</div>
        ) : (
          <div className={styles.initials}>{initials}</div>
        )}
      </div>

      {showStatus && (
        <span
          className={cn(styles.status, styles[`status-${status}`])}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';

export default Avatar;

interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const visibleChildren = childrenArray.slice(0, max);
  const extraCount = Math.max(0, childrenArray.length - max);

  return (
    <div className={cn(styles.avatarGroup, styles[`group-${size}`], className)}>
      {visibleChildren}
      {extraCount > 0 && (
        <div className={cn(styles.avatar, styles.circle, styles[size])}>
          <div className={styles.extra}>+{extraCount}</div>
        </div>
      )}
    </div>
  );
}