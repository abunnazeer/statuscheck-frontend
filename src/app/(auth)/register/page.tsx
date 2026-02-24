// // src/app/(auth)/register/page.tsx

// 'use client';

// import { useState, FormEvent } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import styles from './page.module.css';
// import Layout from '@/components/layout/Layout';
// import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
// import Input from '@/components/ui/Input';
// import Button from '@/components/ui/Button';
// import { useAuthStore } from '@/stores/authStore';
// import { useNotificationStore } from '@/stores/notificationStore';
// import { isValidEmail, isValidNigerianPhone } from '@/lib/utils';

// export default function RegisterPage() {
//   const router = useRouter();
//   const register = useAuthStore((state) => state.register);
//   const isLoading = useAuthStore((state) => state.isLoading);
//   const { success, error: showError } = useNotificationStore();

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//   });

//   const [errors, setErrors] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [acceptTerms, setAcceptTerms] = useState(false);

//   const validateForm = (): boolean => {
//     const newErrors = {
//       firstName: '',
//       lastName: '',
//       email: '',
//       phone: '',
//       password: '',
//       confirmPassword: '',
//     };

//     if (!formData.firstName) {
//       newErrors.firstName = 'First name is required';
//     } else if (formData.firstName.length < 2) {
//       newErrors.firstName = 'First name must be at least 2 characters';
//     }

//     if (!formData.lastName) {
//       newErrors.lastName = 'Last name is required';
//     } else if (formData.lastName.length < 2) {
//       newErrors.lastName = 'Last name must be at least 2 characters';
//     }

//     if (!formData.email) {
//       newErrors.email = 'Email is required';
//     } else if (!isValidEmail(formData.email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }

//     if (!formData.phone) {
//       newErrors.phone = 'Phone number is required';
//     } else if (!isValidNigerianPhone(formData.phone)) {
//       newErrors.phone = 'Please enter a valid Nigerian phone number';
//     }

//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 8) {
//       newErrors.password = 'Password must be at least 8 characters';
//     } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
//       newErrors.password = 'Password must contain uppercase, lowercase, and number';
//     }

//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = 'Please confirm your password';
//     } else if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }

//     setErrors(newErrors);
//     return Object.values(newErrors).every((error) => !error);
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();

//     if (!acceptTerms) {
//       showError('Please accept the terms and conditions');
//       return;
//     }

//     if (!validateForm()) return;

//     try {
//       await register({
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         phone: formData.phone,
//         password: formData.password,
//       });
//       success('Registration successful! Welcome to StatusCheck.');
//       router.push('/dashboard');
//     } catch (err) {
//       showError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
//     }
//   };

//   const handleChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     setErrors((prev) => ({ ...prev, [field]: '' }));
//   };

//   return (
//     <Layout showNavbar={false} showFooter={false}>
//       <div className={styles.container}>
//         <div className={styles.wrapper}>
//           {/* Left Section - Branding */}
//           <div className={styles.leftSection}>
//             <div className={styles.branding}>
//               <Link href="/" className={styles.logo}>
//                 <div className={styles.logoIcon}>
//                   <svg
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//                     <path d="M9 12l2 2 4-4" />
//                   </svg>
//                 </div>
//                 <span className={styles.logoText}>StatusCheck</span>
//               </Link>

//               <div className={styles.brandContent}>
//                 <h1 className={styles.brandTitle}>
//                   Start Verifying with StatusCheck
//                 </h1>
//                 <p className={styles.brandDescription}>
//                   Create your account to access secure NIN/BVN verification
//                   services. Join thousands of satisfied users.
//                 </p>

//                 <div className={styles.stats}>
//                   <div className={styles.stat}>
//                     <h3 className={styles.statValue}>50K+</h3>
//                     <p className={styles.statLabel}>Verifications</p>
//                   </div>
//                   <div className={styles.stat}>
//                     <h3 className={styles.statValue}>99.9%</h3>
//                     <p className={styles.statLabel}>Accuracy</p>
//                   </div>
//                   <div className={styles.stat}>
//                     <h3 className={styles.statValue}>24/7</h3>
//                     <p className={styles.statLabel}>Support</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Section - Form */}
//           <div className={styles.rightSection}>
//             <Card variant="elevated" padding="lg" className={styles.card}>
//               <CardHeader>
//                 <CardTitle>Create Account</CardTitle>
//                 <CardDescription>
//                   Fill in your details to get started
//                 </CardDescription>
//               </CardHeader>

//               <CardContent>
//                 <form onSubmit={handleSubmit} className={styles.form}>
//                   <div className={styles.formRow}>
//                     <Input
//                       id="firstName"
//                       type="text"
//                       label="First Name"
//                       placeholder="John"
//                       value={formData.firstName}
//                       onChange={(e) => handleChange('firstName', e.target.value)}
//                       error={errors.firstName}
//                       required
//                       fullWidth
//                     />

//                     <Input
//                       id="lastName"
//                       type="text"
//                       label="Last Name"
//                       placeholder="Doe"
//                       value={formData.lastName}
//                       onChange={(e) => handleChange('lastName', e.target.value)}
//                       error={errors.lastName}
//                       required
//                       fullWidth
//                     />
//                   </div>

//                   <Input
//                     id="email"
//                     type="email"
//                     label="Email Address"
//                     placeholder="you@example.com"
//                     value={formData.email}
//                     onChange={(e) => handleChange('email', e.target.value)}
//                     error={errors.email}
//                     required
//                     fullWidth
//                     leftIcon={
//                       <svg viewBox="0 0 20 20" fill="currentColor">
//                         <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                         <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                       </svg>
//                     }
//                   />

//                   <Input
//                     id="phone"
//                     type="tel"
//                     label="Phone Number"
//                     placeholder="08012345678"
//                     value={formData.phone}
//                     onChange={(e) => handleChange('phone', e.target.value)}
//                     error={errors.phone}
//                     helperText="Enter your Nigerian phone number"
//                     required
//                     fullWidth
//                     leftIcon={
//                       <svg viewBox="0 0 20 20" fill="currentColor">
//                         <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
//                       </svg>
//                     }
//                   />

//                   <Input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     label="Password"
//                     placeholder="Create a strong password"
//                     value={formData.password}
//                     onChange={(e) => handleChange('password', e.target.value)}
//                     error={errors.password}
//                     helperText="Must be 8+ characters with uppercase, lowercase, and number"
//                     required
//                     fullWidth
//                     leftIcon={
//                       <svg viewBox="0 0 20 20" fill="currentColor">
//                         <path
//                           fillRule="evenodd"
//                           d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     }
//                     rightIcon={
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
//                       >
//                         <svg
//                           viewBox="0 0 20 20"
//                           fill="currentColor"
//                           style={{ width: '20px', height: '20px' }}
//                         >
//                           {showPassword ? (
//                             <path
//                               fillRule="evenodd"
//                               d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
//                               clipRule="evenodd"
//                             />
//                           ) : (
//                             <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                           )}
//                           <path
//                             fillRule="evenodd"
//                             d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       </button>
//                     }
//                   />

//                   <Input
//                     id="confirmPassword"
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     label="Confirm Password"
//                     placeholder="Re-enter your password"
//                     value={formData.confirmPassword}
//                     onChange={(e) => handleChange('confirmPassword', e.target.value)}
//                     error={errors.confirmPassword}
//                     required
//                     fullWidth
//                     leftIcon={
//                       <svg viewBox="0 0 20 20" fill="currentColor">
//                         <path
//                           fillRule="evenodd"
//                           d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     }
//                     rightIcon={
//                       <button
//                         type="button"
//                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                         style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
//                       >
//                         <svg
//                           viewBox="0 0 20 20"
//                           fill="currentColor"
//                           style={{ width: '20px', height: '20px' }}
//                         >
//                           {showConfirmPassword ? (
//                             <path
//                               fillRule="evenodd"
//                               d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
//                               clipRule="evenodd"
//                             />
//                           ) : (
//                             <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                           )}
//                           <path
//                             fillRule="evenodd"
//                             d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       </button>
//                     }
//                   />

//                   <div className={styles.checkbox}>
//                     <input
//                       type="checkbox"
//                       id="terms"
//                       checked={acceptTerms}
//                       onChange={(e) => setAcceptTerms(e.target.checked)}
//                       className={styles.checkboxInput}
//                     />
//                     <label htmlFor="terms" className={styles.checkboxLabel}>
//                       I agree to the{' '}
//                       <Link href="/terms" className={styles.link}>
//                         Terms of Service
//                       </Link>{' '}
//                       and{' '}
//                       <Link href="/privacy" className={styles.link}>
//                         Privacy Policy
//                       </Link>
//                     </label>
//                   </div>

//                   <Button
//                     type="submit"
//                     variant="primary"
//                     size="lg"
//                     fullWidth
//                     isLoading={isLoading}
//                     disabled={isLoading || !acceptTerms}
//                   >
//                     Create Account
//                   </Button>
//                 </form>
//               </CardContent>

//               <CardFooter>
//                 <p className={styles.footerText}>
//                   Already have an account?{' '}
//                   <Link href="/login" className={styles.link}>
//                     Sign in
//                   </Link>
//                 </p>
//               </CardFooter>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }


// src/app/(auth)/register/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { isValidEmail, isValidNigerianPhone } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const { success, error: showError } = useNotificationStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const validateForm = (): boolean => {
    const newErrors = {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    };

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidNigerianPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Nigerian phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      showError('Please accept the terms and conditions');
      return;
    }

    if (!validateForm()) return;

    try {
      // Split fullName into firstName and lastName for the store
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      await register({
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      success('Registration successful! Welcome to StatusCheck.');
      router.push('/dashboard');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <Layout showNavbar={false} showFooter={false}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {/* Left Section - Branding */}
          <div className={styles.leftSection}>
            <div className={styles.branding}>
              <Link href="/" className={styles.logo}>
                <div className={styles.logoIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <span className={styles.logoText}>StatusCheck</span>
              </Link>

              <div className={styles.brandContent}>
                <h1 className={styles.brandTitle}>
                  Start Verifying with StatusCheck
                </h1>
                <p className={styles.brandDescription}>
                  Create your account to access secure NIN/BVN verification
                  services. Join thousands of satisfied users.
                </p>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <h3 className={styles.statValue}>50K+</h3>
                    <p className={styles.statLabel}>Verifications</p>
                  </div>
                  <div className={styles.stat}>
                    <h3 className={styles.statValue}>99.9%</h3>
                    <p className={styles.statLabel}>Accuracy</p>
                  </div>
                  <div className={styles.stat}>
                    <h3 className={styles.statValue}>24/7</h3>
                    <p className={styles.statLabel}>Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className={styles.rightSection}>
            <Card variant="elevated" padding="lg" className={styles.card}>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Fill in your details to get started
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <Input
                    id="fullName"
                    type="text"
                    label="Full Name"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    error={errors.fullName}
                    required
                    fullWidth
                  />

                  <Input
                    id="email"
                    type="email"
                    label="Email Address"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    required
                    fullWidth
                    leftIcon={
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    }
                  />

                  <Input
                    id="phone"
                    type="tel"
                    label="Phone Number"
                    placeholder="08012345678"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    error={errors.phone}
                    helperText="Enter your Nigerian phone number"
                    required
                    fullWidth
                    leftIcon={
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    }
                  />

                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    error={errors.password}
                    helperText="Must be 8+ characters with uppercase, lowercase, and number"
                    required
                    fullWidth
                    leftIcon={
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          style={{ width: '20px', height: '20px' }}
                        >
                          {showPassword ? (
                            <path
                              fillRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          )}
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    }
                  />

                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    required
                    fullWidth
                    leftIcon={
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          style={{ width: '20px', height: '20px' }}
                        >
                          {showConfirmPassword ? (
                            <path
                              fillRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          )}
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    }
                  />

                  <div className={styles.checkbox}>
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className={styles.checkboxInput}
                    />
                    <label htmlFor="terms" className={styles.checkboxLabel}>
                      I agree to the{' '}
                      <Link href="/terms" className={styles.link}>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className={styles.link}>
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                    disabled={isLoading || !acceptTerms}
                  >
                    Create Account
                  </Button>
                </form>
              </CardContent>

              <CardFooter>
                <p className={styles.footerText}>
                  Already have an account?{' '}
                  <Link href="/login" className={styles.link}>
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}