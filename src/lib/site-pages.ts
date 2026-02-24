export interface SitePageTable {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface SitePageSection {
  heading: string;
  body: string;
  points?: string[];
  table?: SitePageTable;
}

export interface SitePageContent {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  sections: SitePageSection[];
  cta?: {
    label: string;
    href: string;
  };
}

export const sitePages: Record<string, SitePageContent> = {
  product: {
    title: 'Product',
    subtitle:
      'StatusCheck is an operational identity verification platform for teams that need trusted NIN and BVN checks with clear transaction and document records.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Platform Overview',
        body:
          'StatusCheck combines verification processing, wallet billing, transaction history, and downloadable reports in one interface so operations teams can run identity checks without moving between tools.',
        points: [
          'Premium NIN and BVN verification requests with reference tracking',
          'Wallet-controlled charging so every request has an auditable debit',
          'Downloadable PDF records for completed checks',
          'User and admin views for operational oversight',
        ],
      },
      {
        heading: 'How The Workflow Operates',
        body:
          'A funded wallet submits a request, provider data is normalized, verification status is stored, and document output is attached to the request record. This keeps request lifecycle, cost, and result in one timeline.',
      },
      {
        heading: 'Operational Controls',
        body:
          'The product is designed for high traceability. Every successful charge, failed request, and document download can be tied back to a request reference and transaction record.',
        points: [
          'Request references for support and reconciliation',
          'Status-driven history with filtering and pagination',
          'No additional charge for redownloading previously generated reports',
        ],
      },
    ],
    cta: {
      label: 'Start Verification',
      href: '/verification',
    },
  },
  features: {
    title: 'Features',
    subtitle: 'Core capabilities currently available across wallet, verification, and reporting workflows.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Verification Features',
        body:
          'Verification modules focus on premium NIN and BVN output quality with persistent request references and downloadable PDF reports.',
        points: [
          'Premium NIN verification template rendering with structured field placement',
          'BVN verification with stored response metadata',
          'Recent verification history and full historical listing',
          'Download buttons for completed verification documents',
        ],
      },
      {
        heading: 'Wallet Features',
        body:
          'Wallet operations are built around reserved account transfers and automatic reconciliation from provider webhooks.',
        points: [
          'Dedicated Paystack reserved account display per user',
          'Automatic wallet credit on confirmed transfer events',
          'Transaction history with status filtering and pagination',
          'Copy account number action for quick transfer flow',
        ],
      },
      {
        heading: 'Admin and Control Features',
        body:
          'Admin interfaces allow pricing and service control without redeployment for day-to-day operations.',
        points: [
          'Service pricing and activation management',
          'User and verification monitoring views',
          'Transaction oversight for operational support',
        ],
      },
    ],
    cta: {
      label: 'Open Dashboard',
      href: '/dashboard',
    },
  },
  pricing: {
    title: 'Pricing',
    subtitle:
      'Pricing is usage-based. Verification charges are deducted per request from wallet balance and are fully traceable in transaction history.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Billing Table',
        body:
          'The table below describes how charges are applied in the platform. Final verification unit price is controlled by your active service pricing configuration in admin settings.',
        table: {
          caption: 'Current billing model',
          headers: ['Item', 'Price', 'Billing Rule'],
          rows: [
            ['Premium NIN Verification', 'Admin-configured', 'Charged once per submitted request'],
            ['BVN Verification', 'Admin-configured', 'Charged once per submitted request'],
            ['PDF Re-download', 'Free', 'No additional verification debit'],
            ['Reserved Account Funding', 'Free on platform', 'Bank transfer fees, if any, are external'],
          ],
        },
      },
      {
        heading: 'Funding and Reconciliation',
        body:
          'Users fund wallet through reserved account transfer. On successful provider confirmation, balance is updated automatically and a credit transaction is recorded.',
      },
      {
        heading: 'Pricing Governance',
        body:
          'Service rates can be updated by authorized admin users. This allows operational pricing changes without code changes.',
        points: [
          'Pricing edits are centralized in service pricing admin',
          'Charges are visible in user transaction history',
          'Debits and credits include references for audit and support',
        ],
      },
    ],
    cta: {
      label: 'Fund Wallet',
      href: '/wallet',
    },
  },
  'about-us': {
    title: 'About Us',
    subtitle:
      'StatusCheck is focused on practical identity verification operations for Nigerian use cases that require speed, consistency, and auditable records.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Mission',
        body:
          'Make identity verification workflows operationally reliable for teams that run high-volume checks and need consistent evidence output.',
      },
      {
        heading: 'What We Prioritize',
        body:
          'The platform is built around operational correctness, reconciliation clarity, and usable reporting rather than surface-level UI complexity.',
        points: [
          'Accuracy of request records and references',
          'Straightforward wallet billing visibility',
          'Secure handling of verification artifacts',
        ],
      },
      {
        heading: 'Who Uses StatusCheck',
        body:
          'Operations teams, customer onboarding units, and compliance-support roles that need identity checks with fast retrieval of request history and documents.',
      },
    ],
  },
  blog: {
    title: 'Blog',
    subtitle: 'Updates on product changes, operational guidance, and verification ecosystem notes.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'What Will Be Published',
        body:
          'This section will carry release notes, integration updates, and service-impact announcements for platform users.',
        points: [
          'Verification flow improvements',
          'Wallet and reconciliation updates',
          'Provider behavior changes and mitigations',
          'Security and reliability advisories',
        ],
      },
      {
        heading: 'Editorial Focus',
        body:
          'Articles are written for operators and implementers, with direct implementation detail instead of marketing-only language.',
      },
    ],
  },
  careers: {
    title: 'Careers',
    subtitle: 'Join a team building dependable identity verification operations at scale.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Working Style',
        body:
          'Roles at StatusCheck are execution-focused. We value reliability, clear ownership, and measurable improvement in product operations.',
      },
      {
        heading: 'Typical Role Areas',
        body:
          'Hiring usually targets engineering and operations disciplines required to keep verification services stable and auditable.',
        points: [
          'Backend/API engineering',
          'Frontend product engineering',
          'Verification operations and quality control',
          'Security and compliance operations',
        ],
      },
      {
        heading: 'How To Apply',
        body:
          'Send role interest and background summary through the contact route while formal job board integration is being finalized.',
      },
    ],
  },
  contact: {
    title: 'Contact',
    subtitle: 'Use the appropriate channel so your request reaches the right team quickly.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Contact Channels',
        body:
          'For faster resolution, include your request reference, transaction reference, and account email where relevant.',
        table: {
          headers: ['Team', 'Email', 'Best For'],
          rows: [
            ['Support', 'support@statuscheck.com', 'Account issues, payment reconciliation, failed requests'],
            ['Sales', 'sales@statuscheck.com', 'Business onboarding and volume planning'],
            ['Security', 'security@statuscheck.com', 'Security disclosures and risk reports'],
          ],
        },
      },
      {
        heading: 'Response Expectations',
        body:
          'Support responses are prioritized by operational impact. Critical service interruptions receive first-response priority.',
      },
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle:
      'This Privacy Policy explains what data StatusCheck processes, why it is processed, and how access is controlled.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Data We Process',
        body:
          'StatusCheck processes account details, verification input data, request metadata, transaction records, and generated report references necessary to deliver service and maintain auditability.',
      },
      {
        heading: 'Purpose of Processing',
        body:
          'Data is processed to execute verification requests, maintain wallet and billing records, provide support, prevent abuse, and satisfy legal or regulatory obligations.',
      },
      {
        heading: 'Storage and Retention',
        body:
          'Data is retained only for operational, legal, and audit requirements. Retention periods may differ by record category such as billing, verification history, and access logs.',
      },
      {
        heading: 'Access and Security',
        body:
          'Access is role-restricted and system-logged. Administrative actions, request references, and transaction operations are tracked to support accountability.',
      },
      {
        heading: 'Your Controls',
        body:
          'You may request support for account data questions, correction requests, and applicable deletion requests, subject to statutory retention obligations.',
      },
    ],
  },
  'terms-of-service': {
    title: 'Terms of Service',
    subtitle: 'These terms govern access to and use of the StatusCheck platform.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Acceptance and Eligibility',
        body:
          'By using StatusCheck, you agree to these terms and confirm you are authorized to operate the account for lawful verification purposes.',
      },
      {
        heading: 'Account Responsibilities',
        body:
          'You are responsible for credential security, authorized use, and the accuracy of data submitted for verification processing.',
      },
      {
        heading: 'Billing and Wallet Terms',
        body:
          'Verification charges are deducted from wallet balance according to active service pricing. Users must maintain sufficient balance before initiating billable requests.',
      },
      {
        heading: 'Acceptable Use',
        body:
          'You must not use the service for unauthorized surveillance, identity abuse, or unlawful data processing. Misuse may result in suspension.',
      },
      {
        heading: 'Service Availability and Third Parties',
        body:
          'Some functionality depends on external providers. Delays, upstream errors, or provider outages may affect response times or outcomes.',
      },
      {
        heading: 'Limitation and Changes',
        body:
          'StatusCheck may update features, pricing controls, and terms as needed. Continued use after updates constitutes acceptance of revised terms.',
      },
    ],
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    subtitle: 'This policy describes how cookies and similar technologies are used on StatusCheck.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Essential Cookies',
        body:
          'Essential cookies are used for secure authentication, session continuity, and protection of account access.',
      },
      {
        heading: 'Preference Cookies',
        body:
          'Preference storage may be used to preserve interface choices and improve usability across sessions.',
      },
      {
        heading: 'Security and Abuse Prevention',
        body:
          'Security-related cookies or tokens may be used to detect suspicious behavior and reduce unauthorized access risk.',
      },
      {
        heading: 'Cookie Controls',
        body:
          'If browser settings disable required cookies, parts of the platform may not function correctly, including authenticated routes.',
      },
    ],
  },
  compliance: {
    title: 'Compliance',
    subtitle:
      'StatusCheck is operated with controls intended to support lawful identity verification and auditable operational behavior.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Control Areas',
        body:
          'Compliance posture is maintained through access control, record traceability, and documented operational behavior across verification and billing workflows.',
        table: {
          headers: ['Control Area', 'Implementation Focus', 'Evidence Source'],
          rows: [
            ['Access Control', 'Role-based route and action permissions', 'Authentication and activity records'],
            ['Transaction Traceability', 'Credit/debit records with references', 'Wallet transaction history'],
            ['Request Auditability', 'Reference-based verification lifecycle', 'Verification history and status logs'],
            ['Document Handling', 'Controlled download paths', 'Request-linked PDF records'],
          ],
        },
      },
      {
        heading: 'Operational Governance',
        body:
          'Compliance controls are reviewed with service updates, including provider changes and new verification flow requirements.',
      },
    ],
  },
  'help-center': {
    title: 'Help Center',
    subtitle: 'Start here for usage guidance and common operational tasks.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Quick Start',
        body:
          'Most teams follow a simple sequence to begin operations.',
        points: [
          'Register and confirm account access',
          'Fund wallet via reserved account transfer',
          'Run NIN or BVN verification',
          'Download completed report from history when needed',
        ],
      },
      {
        heading: 'Common Issues',
        body:
          'If balance does not update after transfer confirmation or a request fails, collect reference details before contacting support.',
        points: [
          'Transaction reference from wallet history',
          'Verification request reference from history',
          'Account email used for the request',
        ],
      },
    ],
  },
  support: {
    title: 'Support',
    subtitle: 'Support routes and service levels for platform users.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Support Scope',
        body:
          'Support covers account access, wallet reconciliation, transaction visibility, and verification request troubleshooting.',
      },
      {
        heading: 'Response Windows',
        body:
          'Target response windows depend on severity and business impact.',
        table: {
          headers: ['Priority', 'Example', 'Target First Response'],
          rows: [
            ['Critical', 'Platform unavailable or widespread payment mismatch', 'Within 2 hours'],
            ['High', 'Repeated failed requests with active impact', 'Within 8 hours'],
            ['Normal', 'General how-to and non-blocking questions', 'Within 24 hours'],
          ],
        },
      },
      {
        heading: 'How To Raise A Ticket',
        body:
          'Send issues to support@statuscheck.com with account email, affected references, and a short timeline of what happened.',
      },
    ],
  },
  status: {
    title: 'Status',
    subtitle: 'Operational status guidance for key service components.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'Service Components',
        body:
          'Status communications are organized by component so users can quickly identify affected flows.',
        table: {
          headers: ['Component', 'Description', 'Impact If Degraded'],
          rows: [
            ['Verification API', 'NIN/BVN request processing path', 'New verification requests may fail or delay'],
            ['Wallet Reconciliation', 'Funding confirmation and wallet credit path', 'Transfers may confirm later than expected'],
            ['PDF Delivery', 'Download endpoint for completed reports', 'Report downloads may be temporarily unavailable'],
          ],
        },
      },
      {
        heading: 'Incident Communication',
        body:
          'For major incidents, updates should include scope, current mitigation, expected next update, and restoration confirmation.',
      },
    ],
  },
  faq: {
    title: 'FAQ',
    subtitle: 'Answers to common product, billing, and verification questions.',
    lastUpdated: 'February 23, 2026',
    sections: [
      {
        heading: 'How does wallet funding work?',
        body:
          'Each user gets a reserved account. When transfer confirmation is received, wallet is credited automatically and a credit transaction is created.',
      },
      {
        heading: 'Do I pay again to redownload a completed PDF?',
        body: 'No. Redownloading a previously generated report does not create an additional verification charge.',
      },
      {
        heading: 'Why can a verification fail?',
        body:
          'Failures can come from invalid input, insufficient balance at request time, provider-side authorization errors, or temporary upstream outages.',
      },
      {
        heading: 'Where can I find references for support?',
        body:
          'Use verification request references from verification history and transaction references from transaction history when contacting support.',
      },
      {
        heading: 'Can pricing be changed without code deployment?',
        body: 'Yes. Admin users can update service pricing from the admin service pricing interface.',
      },
    ],
  },
};
