// src/components/layout/Footer.tsx

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Product', href: '/product' },
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
    ],
    company: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
      { label: 'Compliance', href: '/compliance' },
    ],
    support: [
      { label: 'Help Center', href: '/help-center' },
      { label: 'Support', href: '/support' },
      { label: 'Status', href: '/status' },
      { label: 'FAQ', href: '/faq' },
    ],
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className={styles.logoText}>StatusCheck</span>
            </div>
            <p className={styles.brandDescription}>
              Secure and reliable NIN/BVN verification platform for Nigeria.
              Fast, accurate, and compliant with NIMC standards.
            </p>
            <div className={styles.socialLinks}>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <span>𝕏</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <span>in</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="GitHub"
              >
                <span>GH</span>
              </a>
            </div>
          </div>

          <div className={styles.linksGrid}>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkColumnTitle}>Product</h3>
              <ul className={styles.linkList}>
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h3 className={styles.linkColumnTitle}>Company</h3>
              <ul className={styles.linkList}>
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h3 className={styles.linkColumnTitle}>Legal</h3>
              <ul className={styles.linkList}>
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h3 className={styles.linkColumnTitle}>Support</h3>
              <ul className={styles.linkList}>
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © {currentYear} StatusCheck. All rights reserved.
          </p>
          <div className={styles.certifications}>
            <span className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              NIMC Certified
            </span>
            <span className={styles.badge}>
              <span className={styles.badgeIcon}>🔒</span>
              SSL Secured
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
