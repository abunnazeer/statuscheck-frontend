'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { verificationService, pdfService, type NINSlipType } from '@/lib/api/services';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency } from '@/lib/utils';
import Modal, { ModalBody, ModalDescription, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import styles from './page.module.css';

type SearchMode = 'NIN' | 'PHONE' | 'DEMOGRAPHIC';

const SEARCH_MODE_CONFIG: Array<{
  id: SearchMode;
  serviceCode: 'NIN_VERIFICATION' | 'NIN_PHONE_VERIFICATION' | 'NIN_DEMOGRAPHIC_SEARCH';
  title: string;
  description: string;
}> = [
  {
    id: 'NIN',
    serviceCode: 'NIN_VERIFICATION',
    title: 'Search by NIN',
    description: 'Provide the 11-digit NIN directly',
  },
  {
    id: 'PHONE',
    serviceCode: 'NIN_PHONE_VERIFICATION',
    title: 'Search by Phone',
    description: 'Use the phone linked to the NIN',
  },
  {
    id: 'DEMOGRAPHIC',
    serviceCode: 'NIN_DEMOGRAPHIC_SEARCH',
    title: 'Search by Demography',
    description: 'Use name, DOB, and gender',
  },
];

const SLIP_TYPE_CONFIG: Array<{
  id: NINSlipType;
  label: string;
  description: string;
}> = [
  {
    id: 'NORMAL',
    label: 'Normal Slip',
    description: 'Header and footer slip style',
  },
  {
    id: 'PREMIUM',
    label: 'Premium Slip',
    description: 'Front and back premium card style',
  },
  {
    id: 'NIN_VERIFIED',
    label: 'NIN Verified Slip',
    description: 'Verified output template',
  },
  {
    id: 'VERIFICATION',
    label: 'Verification Slip',
    description: 'General verification layout',
  },
  {
    id: 'NIN_IMPROVED',
    label: 'NIN Improved Slip',
    description: 'Improved modern NIN layout',
  },
];

const NIN_TEMPLATE_SERVICE_CODE: Record<NINSlipType, string> = {
  NORMAL: 'NIN_TEMPLATE_NORMAL',
  PREMIUM: 'NIN_TEMPLATE_PREMIUM',
  NIN_VERIFIED: 'NIN_TEMPLATE_VERIFIED',
  VERIFICATION: 'NIN_TEMPLATE_VERIFICATION',
  NIN_IMPROVED: 'NIN_TEMPLATE_IMPROVED',
};

const getSlipLabel = (slipType: NINSlipType): string =>
  SLIP_TYPE_CONFIG.find((item) => item.id === slipType)?.label || 'Premium Slip';

const isValidNigerianPhone = (value: string): boolean => /^(\+234|234|0)[7-9][0-1]\d{8}$/.test(value.trim());

export default function NINVerificationPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { wallet, fetchWallet } = useWalletStore();
  const { success, error: showError } = useNotificationStore();

  const [searchMode, setSearchMode] = useState<SearchMode>('NIN');
  const [slipType, setSlipType] = useState<NINSlipType>('PREMIUM');

  const [nin, setNin] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | ''>('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [pricingMap, setPricingMap] = useState<Record<string, number>>({});
  const [priceReady, setPriceReady] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadPageData = async () => {
      try {
        const [costs] = await Promise.all([verificationService.getVerificationCosts(), fetchWallet()]);
        setPricingMap(costs || {});
        setPriceReady(true);
      } catch (err) {
        setPriceReady(false);
        showError(err instanceof Error ? err.message : 'Unable to load NIN pricing');
      }
    };

    loadPageData();
  }, [isAuthenticated, router, fetchWallet, showError]);

  const activeModeConfig = useMemo(
    () => SEARCH_MODE_CONFIG.find((item) => item.id === searchMode) || SEARCH_MODE_CONFIG[0],
    [searchMode]
  );

  const servicePrice = useMemo(() => {
    const templateCode = NIN_TEMPLATE_SERVICE_CODE[slipType];
    const configuredPrice = Number(pricingMap[templateCode] || 0);
    return Number.isFinite(configuredPrice) ? configuredPrice : 0;
  }, [pricingMap, slipType]);
  const selectedSlipOption = useMemo(
    () => SLIP_TYPE_CONFIG.find((item) => item.id === slipType) || SLIP_TYPE_CONFIG[0],
    [slipType]
  );

  const resultData = useMemo(() => verificationResult?.data || {}, [verificationResult]);
  const previewSrc = useMemo(() => {
    if (!pdfPreviewUrl) return null;
    return `${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`;
  }, [pdfPreviewUrl]);

  const resolveField = (...values: Array<unknown>) => {
    const value = values.find((item) => item !== null && item !== undefined && String(item).trim() !== '');
    return value ? String(value) : '';
  };

  const viewModel = {
    firstName: resolveField(resultData.firstName, resultData.firstname, resultData.personalInfo?.firstName),
    middleName: resolveField(resultData.middleName, resultData.middlename, resultData.personalInfo?.middleName),
    lastName: resolveField(resultData.lastName, resultData.surname, resultData.personalInfo?.surName),
    dateOfBirth: resolveField(
      resultData.dateOfBirth,
      resultData.birthdate,
      resultData.personalInfo?.dateOfBirth,
      resultData.personalInfo?.dob
    ),
    gender: resolveField(resultData.gender, resultData.personalInfo?.gender),
    phone: resolveField(
      resultData.phone,
      resultData.telephoneno,
      resultData.personalInfo?.phoneNumber,
      resultData.personalInfo?.phoneNumber1
    ),
    nin: resolveField(resultData.nin, resultData.ninInfo?.nin),
    email: resolveField(resultData.email, resultData.personalInfo?.email),
  };

  const buildUniquePdfName = (prefix: string, identityValue: string): string => {
    const safeIdentity = identityValue.replace(/[^a-zA-Z0-9]/g, '') || 'UNKNOWN';
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(
      now.getMinutes()
    )}${pad(now.getSeconds())}`;
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}_${safeIdentity}_${timestamp}_${suffix}.pdf`;
  };

  const setPreviewObjectUrl = (nextUrl: string | null) => {
    if (previewUrlRef.current && previewUrlRef.current !== nextUrl) {
      window.URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = nextUrl;
    setPdfPreviewUrl(nextUrl);
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        window.URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const resetVerificationResult = () => {
    setVerificationResult(null);
    setPreviewBlob(null);
    setPreviewObjectUrl(null);
    setPreviewError(null);
    setIsPreparingPreview(false);
    setIsPreviewModalOpen(false);
  };

  const preparePdfPreview = async (requestRef: string) => {
    try {
      setIsPreparingPreview(true);
      setPreviewError(null);
      const blob = await pdfService.downloadVerificationPDF(requestRef);
      setPreviewBlob(blob);
      setPreviewObjectUrl(window.URL.createObjectURL(blob));
    } catch (err) {
      setPreviewBlob(null);
      setPreviewObjectUrl(null);
      setPreviewError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsPreparingPreview(false);
    }
  };

  const validateBeforeVerify = (): boolean => {
    if (!priceReady || servicePrice <= 0) {
      showError('Selected template price is unavailable. Please check admin pricing or refresh and try again.');
      return false;
    }

    const balance = wallet ? Number(wallet.balance) : 0;
    if (balance < servicePrice) {
      showError(`Insufficient balance. You need ${formatCurrency(servicePrice)} but have ${formatCurrency(balance)}`);
      return false;
    }

    if (searchMode === 'NIN' && (!nin || nin.length !== 11)) {
      showError('Please enter a valid 11-digit NIN');
      return false;
    }

    if (searchMode === 'PHONE' && !isValidNigerianPhone(phone)) {
      showError('Please enter a valid Nigerian phone number');
      return false;
    }

    if (searchMode === 'DEMOGRAPHIC') {
      if (!firstName.trim() || !lastName.trim() || !dateOfBirth || !gender) {
        showError('Please provide first name, last name, date of birth, and gender');
        return false;
      }
    }

    return true;
  };

  const handleVerify = async () => {
    if (!validateBeforeVerify()) {
      return;
    }

    setIsVerifying(true);
    resetVerificationResult();

    try {
      let result;

      if (searchMode === 'NIN') {
        result = await verificationService.verifyNIN({ nin, slipType });
      } else if (searchMode === 'PHONE') {
        result = await verificationService.verifyNINByPhone({ phoneNumber: phone, slipType });
      } else {
        result = await verificationService.searchNINByDemographic({
          firstname: firstName.trim(),
          lastname: lastName.trim(),
          dateOfBirth,
          gender,
          slipType,
        });
      }

      setVerificationResult(result);

      if (result.status === 'SUCCESS') {
        setIsPreviewModalOpen(true);
        if (result.requestRef) {
          void preparePdfPreview(result.requestRef);
        } else {
          setPreviewError('Preview unavailable for this result');
        }
        success(`${getSlipLabel(slipType)} generated successfully`);
      } else {
        showError(result.message || 'Verification failed');
      }

      await fetchWallet();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadPdf = async () => {
    const requestRef = resolveField(
      verificationResult?.requestRef,
      verificationResult?.request_ref,
      verificationResult?.reference,
      verificationResult?.ref
    );

    if (!requestRef) {
      showError('No verification reference available for download');
      return;
    }

    try {
      setIsDownloadingPdf(true);
      const blob = previewBlob || (await pdfService.downloadVerificationPDF(requestRef));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = buildUniquePdfName(slipType, viewModel.nin || requestRef);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success(`${getSlipLabel(slipType)} PDF downloaded successfully`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to download NIN PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link href="/verification" className={styles.breadcrumbLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Verification
          </Link>
        </div>

        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <path d="M15 8h2M15 12h2M7 16h10" />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>NIN Verification Suite</h1>
            <p className={styles.subtitle}>Choose search mode and slip template, then generate and download PDF</p>
          </div>
          <div className={styles.balanceCard}>
            <span className={styles.balanceLabel}>Balance</span>
            <span className={styles.balanceValue}>{wallet ? formatCurrency(Number(wallet.balance)) : '₦0.00'}</span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>1</span>
              <h2 className={styles.sectionTitle}>Search Method</h2>
            </div>
            <div className={`${styles.servicesGrid} ${styles.modeGrid}`}>
              {SEARCH_MODE_CONFIG.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.serviceCard} ${searchMode === item.id ? styles.selected : ''}`}
                  onClick={() => {
                    setSearchMode(item.id);
                    resetVerificationResult();
                  }}
                >
                  <div className={styles.serviceIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4" />
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h3 className={styles.serviceName}>{item.title}</h3>
                  <p className={styles.serviceDesc}>{item.description}</p>
                  <div className={styles.servicePrice}>{formatCurrency(servicePrice)}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>2</span>
              <h2 className={styles.sectionTitle}>Slip Template</h2>
            </div>
            <div className={styles.formCard}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Template Type</label>
                <select
                  className={`${styles.inputFull} ${styles.selectField}`}
                  value={slipType}
                  onChange={(e) => {
                    setSlipType(e.target.value as NINSlipType);
                    resetVerificationResult();
                  }}
                >
                  {SLIP_TYPE_CONFIG.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <p className={styles.hint}>{selectedSlipOption.description}</p>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>3</span>
              <h2 className={styles.sectionTitle}>Input Details</h2>
            </div>
            <div className={styles.formCard}>
              {searchMode === 'NIN' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>National Identification Number (NIN)</label>
                  <input
                    type="text"
                    className={styles.inputFull}
                    placeholder="Enter 11-digit NIN"
                    value={nin}
                    onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    maxLength={11}
                  />
                  <p className={styles.hint}>Only 11-digit NIN is accepted</p>
                </div>
              )}

              {searchMode === 'PHONE' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    className={styles.inputFull}
                    placeholder="08012345678 or +2348012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.trim())}
                  />
                  <p className={styles.hint}>Enter the phone number linked to the NIN</p>
                </div>
              )}

              {searchMode === 'DEMOGRAPHIC' && (
                <div className={styles.inputGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>First Name</label>
                    <input
                      type="text"
                      className={styles.inputFull}
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Last Name</label>
                    <input
                      type="text"
                      className={styles.inputFull}
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Date of Birth</label>
                    <input
                      type="date"
                      className={styles.inputFull}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Gender</label>
                    <select
                      className={`${styles.inputFull} ${styles.selectField}`}
                      value={gender}
                      onChange={(e) => setGender((e.target.value as 'M' | 'F' | '') || '')}
                    >
                      <option value="">Select gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                </div>
              )}

              <div className={styles.formFooter}>
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Search Mode</span>
                    <span>{activeModeConfig.title}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Slip Type</span>
                    <span>{getSlipLabel(slipType)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Service Fee</span>
                    <span>{formatCurrency(servicePrice)}</span>
                  </div>
                  <div className={styles.priceTotal}>
                    <span>Total</span>
                    <strong>{formatCurrency(servicePrice)}</strong>
                  </div>
                </div>
                <button className={styles.verifyBtn} onClick={handleVerify} disabled={isVerifying || !priceReady}>
                  {isVerifying ? (
                    <>
                      <div className={styles.spinner}></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Run Verification
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {verificationResult && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepNumber}>4</span>
                <h2 className={styles.sectionTitle}>Verification Result</h2>
              </div>
              <div className={`${styles.resultCard} ${styles[`result${verificationResult.status}`]}`}>
                <div className={styles.resultHeader}>
                  <div className={`${styles.resultIcon} ${styles[`icon${verificationResult.status}`]}`}>
                    {verificationResult.status === 'SUCCESS' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.resultInfo}>
                    <h3 className={styles.resultTitle}>
                      {verificationResult.status === 'SUCCESS' ? 'Verification Successful' : 'Verification Failed'}
                    </h3>
                    <p className={styles.resultRef}>Reference: {verificationResult.requestRef}</p>
                  </div>
                </div>

                {verificationResult.status === 'SUCCESS' && (
                  <>
                    <div className={styles.resultData}>
                      <p className={styles.previewMetaInline}>
                        {isPreparingPreview
                          ? 'Preparing PDF preview...'
                          : previewSrc
                            ? 'Preview ready. Click "Open Preview" to view in modal.'
                            : previewError || 'Preview unavailable. You can still download the PDF below.'}
                      </p>
                    </div>

                    <div className={styles.resultActions}>
                      <button
                        type="button"
                        className={styles.downloadBtn}
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {isDownloadingPdf ? 'Downloading...' : `Download ${getSlipLabel(slipType)} PDF`}
                      </button>
                    </div>
                  </>
                )}

                {verificationResult.status === 'FAILED' && (
                  <div className={styles.resultError}>
                    <p>{verificationResult.message || 'Verification failed. Please check the details and try again.'}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} size="full">
        <ModalHeader>
          <ModalTitle>{getSlipLabel(slipType)} PDF Preview</ModalTitle>
          <ModalDescription>Full-page preview with PDF controls hidden</ModalDescription>
        </ModalHeader>
        <ModalBody className={styles.previewModalBody}>
          {isPreparingPreview && <div className={styles.previewState}>Preparing PDF preview...</div>}
          {!isPreparingPreview && previewSrc && (
            <div className={styles.pdfPreviewViewportModal}>
              <iframe
                title={`${getSlipLabel(slipType)} PDF Preview Modal`}
                src={previewSrc}
                className={styles.pdfPreviewFrameModal}
                tabIndex={-1}
              />
            </div>
          )}
          {!isPreparingPreview && !previewSrc && (
            <div className={styles.previewState}>{previewError || 'Preview unavailable.'}</div>
          )}
          <div className={styles.previewModalActions}>
            <button type="button" className={styles.previewBtn} onClick={() => setIsPreviewModalOpen(false)}>
              Close
            </button>
            <button type="button" className={styles.downloadBtn} onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
              {isDownloadingPdf ? 'Downloading...' : `Download ${getSlipLabel(slipType)} PDF`}
            </button>
          </div>
        </ModalBody>
      </Modal>
    </DashboardLayout>
  );
}
