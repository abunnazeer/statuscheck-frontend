// // frontend/src/app/(dashboard)/verification/page.tsx

// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import DashboardLayout from '@/components/layout/DashboardLayout';
// import { useAuthStore } from '@/stores/authStore';
// import { useWalletStore } from '@/stores/walletStore';
// import { verificationService } from '@/lib/api/services';
// import { useNotificationStore } from '@/stores/notificationStore';
// import { formatCurrency } from '@/lib/utils';
// import styles from './page.module.css';

// interface ServicePricing {
//   id: string;
//   serviceCode: string;
//   serviceName: string;
//   price: string;
//   description: string;
//   isActive: boolean;
// }

// type VerificationType = 
//   | 'NIN_VERIFICATION' 
//   | 'NIN_PHONE_VERIFICATION' 
//   | 'BVN_VERIFICATION' 
//   | 'BVN_PHONE_RETRIEVAL' 
//   | 'BVN_NIN_RETRIEVAL'
//   | 'NIN_DEMOGRAPHIC_SEARCH';

// export default function VerificationPage() {
//   const router = useRouter();
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const { wallet, fetchWallet } = useWalletStore();
//   const { success, error: showError } = useNotificationStore();

//   const [services, setServices] = useState<ServicePricing[]>([]);
//   const [selectedService, setSelectedService] = useState<VerificationType | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isVerifying, setIsVerifying] = useState(false);

//   // Form states
//   const [nin, setNin] = useState('');
//   const [bvn, setBvn] = useState('');
//   const [phone, setPhone] = useState('');
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [dateOfBirth, setDateOfBirth] = useState('');
//   const [gender, setGender] = useState('');

//   // Result state
//   const [verificationResult, setVerificationResult] = useState<any>(null);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/login');
//       return;
//     }

//     const loadData = async () => {
//       try {
//         setIsLoading(true);
//         const [servicesData] = await Promise.all([
//           verificationService.getServices(),
//           fetchWallet(),
//         ]);
//         setServices(servicesData);
//       } catch (err) {
//         console.error('Failed to load services:', err);
//         showError('Failed to load verification services');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadData();
//   }, [isAuthenticated, router, fetchWallet, showError]);

//   const getServicePrice = (serviceCode: string): number => {
//     const service = services.find((s) => s.serviceCode === serviceCode);
//     return service ? parseFloat(service.price) : 0;
//   };

//   const resetForm = () => {
//     setNin('');
//     setBvn('');
//     setPhone('');
//     setFirstName('');
//     setLastName('');
//     setDateOfBirth('');
//     setGender('');
//     setVerificationResult(null);
//   };

//   const handleServiceSelect = (serviceCode: VerificationType) => {
//     setSelectedService(serviceCode);
//     resetForm();
//   };

//   const handleVerify = async () => {
//     if (!selectedService) return;

//     const price = getServicePrice(selectedService);
//     const balance = wallet ? parseFloat(wallet.balance) : 0;

//     if (balance < price) {
//       showError(`Insufficient balance. You need ${formatCurrency(price)} but have ${formatCurrency(balance)}`);
//       return;
//     }

//     setIsVerifying(true);
//     setVerificationResult(null);

//     try {
//       let result;

//       switch (selectedService) {
//         case 'NIN_VERIFICATION':
//           if (!nin || nin.length !== 11) {
//             showError('Please enter a valid 11-digit NIN');
//             setIsVerifying(false);
//             return;
//           }
//           result = await verificationService.verifyNIN(nin);
//           break;

//         case 'NIN_PHONE_VERIFICATION':
//           if (!phone) {
//             showError('Please enter a valid phone number');
//             setIsVerifying(false);
//             return;
//           }
//           result = await verificationService.verifyNINByPhone(phone);
//           break;

//         case 'BVN_VERIFICATION':
//           if (!bvn || bvn.length !== 11) {
//             showError('Please enter a valid 11-digit BVN');
//             setIsVerifying(false);
//             return;
//           }
//           result = await verificationService.verifyBVN(bvn);
//           break;

//         case 'BVN_PHONE_RETRIEVAL':
//           if (!phone) {
//             showError('Please enter a valid phone number');
//             setIsVerifying(false);
//             return;
//           }
//           result = await verificationService.getBVNByPhone(phone);
//           break;

//         case 'BVN_NIN_RETRIEVAL':
//           if (!nin || nin.length !== 11) {
//             showError('Please enter a valid 11-digit NIN');
//             setIsVerifying(false);
//             return;
//           }
//           result = await verificationService.getBVNByNIN(nin);
//           break;

//         case 'NIN_DEMOGRAPHIC_SEARCH':
//           if (!firstName || !lastName || !dateOfBirth || !gender) {
//             showError('Please fill in all demographic fields');
//             setIsVerifying(false);
//             return;
//           }
//           result = await verificationService.searchNINByDemographic({
//             firstName,
//             lastName,
//             dateOfBirth,
//             gender,
//           });
//           break;

//         default:
//           showError('Invalid service selected');
//           setIsVerifying(false);
//           return;
//       }

//       setVerificationResult(result);
      
//       if (result.status === 'SUCCESS') {
//         success('Verification completed successfully!');
//       } else {
//         showError(result.message || 'Verification failed');
//       }

//       // Refresh wallet balance
//       await fetchWallet();
//     } catch (err) {
//       console.error('Verification error:', err);
//       showError(err instanceof Error ? err.message : 'Verification failed');
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   if (!isAuthenticated) {
//     return null;
//   }

//   const renderServiceForm = () => {
//     switch (selectedService) {
//       case 'NIN_VERIFICATION':
//         return (
//           <div className={styles.formGroup}>
//             <label className={styles.label}>NIN (National Identification Number)</label>
//             <input
//               type="text"
//               className={styles.input}
//               placeholder="Enter 11-digit NIN"
//               value={nin}
//               onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
//               maxLength={11}
//             />
//             <p className={styles.hint}>Enter the 11-digit NIN to verify</p>
//           </div>
//         );

//       case 'NIN_PHONE_VERIFICATION':
//         return (
//           <div className={styles.formGroup}>
//             <label className={styles.label}>Phone Number</label>
//             <input
//               type="tel"
//               className={styles.input}
//               placeholder="Enter phone number (e.g., 08012345678)"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
//               maxLength={11}
//             />
//             <p className={styles.hint}>Enter the phone number linked to the NIN</p>
//           </div>
//         );

//       case 'BVN_VERIFICATION':
//         return (
//           <div className={styles.formGroup}>
//             <label className={styles.label}>BVN (Bank Verification Number)</label>
//             <input
//               type="text"
//               className={styles.input}
//               placeholder="Enter 11-digit BVN"
//               value={bvn}
//               onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
//               maxLength={11}
//             />
//             <p className={styles.hint}>Enter the 11-digit BVN to verify</p>
//           </div>
//         );

//       case 'BVN_PHONE_RETRIEVAL':
//         return (
//           <div className={styles.formGroup}>
//             <label className={styles.label}>Phone Number</label>
//             <input
//               type="tel"
//               className={styles.input}
//               placeholder="Enter phone number (e.g., 08012345678)"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
//               maxLength={11}
//             />
//             <p className={styles.hint}>Enter the phone number to retrieve associated BVN</p>
//           </div>
//         );

//       case 'BVN_NIN_RETRIEVAL':
//         return (
//           <div className={styles.formGroup}>
//             <label className={styles.label}>NIN (National Identification Number)</label>
//             <input
//               type="text"
//               className={styles.input}
//               placeholder="Enter 11-digit NIN"
//               value={nin}
//               onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
//               maxLength={11}
//             />
//             <p className={styles.hint}>Enter the NIN to retrieve associated BVN</p>
//           </div>
//         );

//       case 'NIN_DEMOGRAPHIC_SEARCH':
//         return (
//           <div className={styles.demographicForm}>
//             <div className={styles.formRow}>
//               <div className={styles.formGroup}>
//                 <label className={styles.label}>First Name</label>
//                 <input
//                   type="text"
//                   className={styles.input}
//                   placeholder="Enter first name"
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                 />
//               </div>
//               <div className={styles.formGroup}>
//                 <label className={styles.label}>Last Name</label>
//                 <input
//                   type="text"
//                   className={styles.input}
//                   placeholder="Enter last name"
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                 />
//               </div>
//             </div>
//             <div className={styles.formRow}>
//               <div className={styles.formGroup}>
//                 <label className={styles.label}>Date of Birth</label>
//                 <input
//                   type="date"
//                   className={styles.input}
//                   value={dateOfBirth}
//                   onChange={(e) => setDateOfBirth(e.target.value)}
//                 />
//               </div>
//               <div className={styles.formGroup}>
//                 <label className={styles.label}>Gender</label>
//                 <select
//                   className={styles.input}
//                   value={gender}
//                   onChange={(e) => setGender(e.target.value)}
//                 >
//                   <option value="">Select gender</option>
//                   <option value="M">Male</option>
//                   <option value="F">Female</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   const renderVerificationResult = () => {
//     if (!verificationResult) return null;

//     const { status, data, requestRef, message } = verificationResult;

//     return (
//       <div className={`${styles.resultCard} ${styles[`result${status}`]}`}>
//         <div className={styles.resultHeader}>
//           <div className={`${styles.resultIcon} ${styles[`icon${status}`]}`}>
//             {status === 'SUCCESS' ? (
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M9 12l2 2 4-4" />
//                 <circle cx="12" cy="12" r="10" />
//               </svg>
//             ) : (
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="12" cy="12" r="10" />
//                 <path d="M15 9l-6 6M9 9l6 6" />
//               </svg>
//             )}
//           </div>
//           <div>
//             <h3 className={styles.resultTitle}>
//               {status === 'SUCCESS' ? 'Verification Successful' : 'Verification Failed'}
//             </h3>
//             <p className={styles.resultRef}>Reference: {requestRef}</p>
//           </div>
//         </div>

//         {status === 'SUCCESS' && data && (
//           <div className={styles.resultData}>
//             <h4 className={styles.dataTitle}>Verification Data</h4>
//             <div className={styles.dataGrid}>
//               {data.firstName && (
//                 <div className={styles.dataItem}>
//                   <span className={styles.dataLabel}>First Name</span>
//                   <span className={styles.dataValue}>{data.firstName}</span>
//                 </div>
//               )}
//               {data.lastName && (
//                 <div className={styles.dataItem}>
//                   <span className={styles.dataLabel}>Last Name</span>
//                   <span className={styles.dataValue}>{data.lastName}</span>
//                 </div>
//               )}
//               {data.middleName && (
//                 <div className={styles.dataItem}>
//                   <span className={styles.dataLabel}>Middle Name</span>
//                   <span className={styles.dataValue}>{data.middleName}</span>
//                 </div>
//               )}
//               {data.dateOfBirth && (
//                 <div className={styles.dataItem}>
//                   <span className={styles.dataLabel}>Date of Birth</span>
//                   <span className={styles.dataValue}>{data.dateOfBirth}</span>
//                 </div>
//               )}
//               {data.gender && (
//                 <div className={styles.dataItem}>
//                   <span className={styles.dataLabel}>Gender</span>
//                   <span className={styles.dataValue}>{data.gender}</span>
//                 </div>
//               )}
//               {data.phone && (
//                 <div className={styles.dataItem}>
//                   <span className={styles.dataLabel}>Phone</span>
//                   <span className={styles.dataValue}>{data.phone}</span>
//                 </div>
//               )}
//               {data.email && (
//                 <div className={styles.dataItem}>
//                   <span className={styles.dataLabel}>Email</span>
//                   <span className={styles.dataValue}>{data.email}</span>
//                 </div>
//               )}
//               {data.nin && (
//                 <div className={styles.dataItem}>
//                   <span className={styles.dataLabel}>NIN</span>
//                   <span className={styles.dataValue}>{data.nin}</span>
//                 </div>
//               )}
//               {data.bvn && (
//                 <div className={styles.dataItem}>
//                   <span className={styles.dataLabel}>BVN</span>
//                   <span className={styles.dataValue}>{data.bvn}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {status === 'FAILED' && (
//           <p className={styles.resultMessage}>{message}</p>
//         )}
//       </div>
//     );
//   };

//   return (
//     <DashboardLayout>
//       <div className={styles.container}>
//         {/* Header */}
//         <div className={styles.header}>
//           <div>
//             <h1 className={styles.title}>Identity Verification</h1>
//             <p className={styles.subtitle}>Verify NIN and BVN quickly and securely</p>
//           </div>
//           <div className={styles.balanceCard}>
//             <span className={styles.balanceLabel}>Wallet Balance</span>
//             <span className={styles.balanceValue}>
//               {wallet ? formatCurrency(parseFloat(wallet.balance)) : '₦0.00'}
//             </span>
//           </div>
//         </div>

//         {/* Loading State */}
//         {isLoading && (
//           <div className={styles.loading}>
//             <div className={styles.spinner}></div>
//             <p>Loading services...</p>
//           </div>
//         )}

//         {/* Services Grid */}
//         {!isLoading && (
//           <div className={styles.content}>
//             <div className={styles.servicesSection}>
//               <h2 className={styles.sectionTitle}>Select a Service</h2>
//               <div className={styles.servicesGrid}>
//                 {services.filter(s => s.isActive).map((service) => (
//                   <button
//                     key={service.id}
//                     className={`${styles.serviceCard} ${selectedService === service.serviceCode ? styles.selected : ''}`}
//                     onClick={() => handleServiceSelect(service.serviceCode as VerificationType)}
//                   >
//                     <div className={styles.serviceIcon}>
//                       {service.serviceCode.includes('NIN') ? (
//                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                           <rect x="3" y="4" width="18" height="16" rx="2" />
//                           <circle cx="9" cy="10" r="2" />
//                           <path d="M15 8h2M15 12h2M7 16h10" />
//                         </svg>
//                       ) : (
//                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                           <rect x="2" y="5" width="20" height="14" rx="2" />
//                           <path d="M2 10h20" />
//                         </svg>
//                       )}
//                     </div>
//                     <div className={styles.serviceInfo}>
//                       <h3 className={styles.serviceName}>{service.serviceName}</h3>
//                       <p className={styles.serviceDesc}>{service.description}</p>
//                     </div>
//                     <div className={styles.servicePrice}>
//                       {formatCurrency(parseFloat(service.price))}
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Verification Form */}
//             {selectedService && (
//               <div className={styles.formSection}>
//                 <h2 className={styles.sectionTitle}>
//                   {services.find(s => s.serviceCode === selectedService)?.serviceName}
//                 </h2>
                
//                 <div className={styles.formCard}>
//                   {renderServiceForm()}
                  
//                   <div className={styles.formFooter}>
//                     <div className={styles.priceInfo}>
//                       <span>Service Fee:</span>
//                       <strong>{formatCurrency(getServicePrice(selectedService))}</strong>
//                     </div>
//                     <button
//                       className={styles.verifyBtn}
//                       onClick={handleVerify}
//                       disabled={isVerifying}
//                     >
//                       {isVerifying ? (
//                         <>
//                           <div className={styles.btnSpinner}></div>
//                           Verifying...
//                         </>
//                       ) : (
//                         <>
//                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                             <path d="M9 12l2 2 4-4" />
//                             <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//                           </svg>
//                           Verify Now
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Verification Result */}
//                 {renderVerificationResult()}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }


// frontend/src/app/(dashboard)/verification/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { formatCurrency } from '@/lib/utils';
import styles from './page.module.css';

export default function VerificationPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { wallet, fetchWallet } = useWalletStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchWallet();
  }, [isAuthenticated, router, fetchWallet]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Identity Verification</h1>
            <p className={styles.subtitle}>
              Verify NIN and BVN quickly and securely
            </p>
          </div>
          <div className={styles.balanceCard}>
            <span className={styles.balanceLabel}>Wallet Balance</span>
            <span className={styles.balanceValue}>
              {wallet ? formatCurrency(Number(wallet.balance)) : '₦0.00'}
            </span>
          </div>
        </div>

        {/* Verification Options */}
        <div className={styles.optionsGrid}>
          {/* NIN Verification Card */}
          <div className={styles.optionCard}>
            <div className={styles.optionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="M15 8h2M15 12h2M7 16h10" />
              </svg>
            </div>
            <div className={styles.optionContent}>
              <h2 className={styles.optionTitle}>NIN Verification</h2>
              <p className={styles.optionDesc}>
                Premium NIN verification with downloadable PDF output
              </p>
              <ul className={styles.optionFeatures}>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Premium NIN Verification (PDF)
                </li>
              </ul>
              <div className={styles.optionPricing}>
                <span>Starting from</span>
                <strong>₦50.00</strong>
              </div>
            </div>
            <button
              className={styles.optionBtn}
              onClick={() => router.push('/verification/nin')}
            >
              Verify NIN
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* BVN Verification Card */}
          <div className={styles.optionCard}>
            <div className={styles.optionIconBvn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
                <path d="M6 15h4M14 15h4" />
              </svg>
            </div>
            <div className={styles.optionContent}>
              <h2 className={styles.optionTitle}>BVN Verification</h2>
              <p className={styles.optionDesc}>
                Premium BVN verification with downloadable PDF output
              </p>
              <ul className={styles.optionFeatures}>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Premium BVN Verification (PDF)
                </li>
              </ul>
              <div className={styles.optionPricing}>
                <span>Starting from</span>
                <strong>₦50.00</strong>
              </div>
            </div>
            <button
              className={styles.optionBtnBvn}
              onClick={() => router.push('/verification/bvn')}
            >
              Verify BVN
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.infoSection}>
          <h3 className={styles.infoTitle}>Why Choose StatusCheck?</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h4>Instant Results</h4>
              <p>Get verification results in seconds</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4>Secure & Reliable</h4>
              <p>Direct integration with NIMC</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h4>Affordable Pricing</h4>
              <p>Competitive rates for all services</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h4>PDF Generation</h4>
              <p>Download official NIN slips</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
