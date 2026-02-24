import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import styles from './InfoPage.module.css';

interface InfoTable {
  headers: string[];
  rows: string[][];
  caption?: string;
}

interface InfoSection {
  heading: string;
  body: string;
  points?: string[];
  table?: InfoTable;
}

interface InfoPageProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  sections: InfoSection[];
  cta?: {
    label: string;
    href: string;
  };
}

export default function InfoPage({ title, subtitle, lastUpdated, sections, cta }: InfoPageProps) {
  return (
    <Layout containerized={false}>
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
            {lastUpdated ? (
              <p className={styles.lastUpdated}>Last updated: {lastUpdated}</p>
            ) : null}
          </header>

          <section className={styles.contentCard}>
            {sections.map((section) => (
              <article key={section.heading} className={styles.section}>
                <h2 className={styles.sectionTitle}>{section.heading}</h2>
                <p className={styles.sectionBody}>{section.body}</p>
                {section.points && section.points.length > 0 ? (
                  <ul className={styles.points}>
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}

                {section.table ? (
                  <div className={styles.tableWrap}>
                    {section.table.caption ? (
                      <p className={styles.tableCaption}>{section.table.caption}</p>
                    ) : null}
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          {section.table.headers.map((header) => (
                            <th key={header}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, index) => (
                          <tr key={`${section.heading}-${index}`}>
                            {row.map((cell, cellIndex) => (
                              <td key={`${section.heading}-${index}-${cellIndex}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </article>
            ))}
          </section>

          {cta ? (
            <div className={styles.actions}>
              <Link href={cta.href} className={styles.primaryBtn}>
                {cta.label}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
