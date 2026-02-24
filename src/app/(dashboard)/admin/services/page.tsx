// frontend/src/app/(dashboard)/admin/services/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { adminService } from '@/lib/api/services';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency } from '@/lib/utils';
import styles from './page.module.css';

interface ServicePricing {
  id: string;
  serviceCode: string;
  serviceName: string;
  description: string;
  price: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminServicesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { success, error: showError } = useNotificationStore();

  const [services, setServices] = useState<ServicePricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServicePricing | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [newStatus, setNewStatus] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchServices();
  }, [isAuthenticated, user, router]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getServicePricing();
      setServices(response.data || []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      showError('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (service: ServicePricing) => {
    setSelectedService(service);
    setNewPrice(service.price);
    setNewStatus(service.isActive);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setNewPrice('');
    setNewStatus(true);
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      showError('Please enter a valid price');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.updateServicePricing(selectedService.serviceCode, {
        price: priceNum,
        isActive: newStatus,
      });
      success('Service updated successfully');
      closeModal();
      fetchServices();
    } catch (err) {
      console.error('Failed to update service:', err);
      showError('Failed to update service');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleServiceStatus = async (service: ServicePricing) => {
    try {
      await adminService.updateServicePricing(service.serviceCode, {
        isActive: !service.isActive,
      });
      success(`Service ${service.isActive ? 'disabled' : 'enabled'} successfully`);
      fetchServices();
    } catch (err) {
      console.error('Failed to toggle service:', err);
      showError('Failed to update service status');
    }
  };

  const getServiceIcon = (serviceCode: string) => {
    if (serviceCode.includes('NIN')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="M15 8h2M15 12h2M7 16h10" />
        </svg>
      );
    }
    if (serviceCode.includes('BVN')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <path d="M6 15h4M14 15h4" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4" />
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href="/admin" className={styles.backLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </Link>
            <h1 className={styles.title}>Service Pricing</h1>
            <p className={styles.subtitle}>Manage verification service pricing and availability</p>
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className={styles.emptyState}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
            </svg>
            <h3>No services found</h3>
            <p>Services will appear here once configured</p>
          </div>
        ) : (
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div
                key={service.id}
                className={`${styles.serviceCard} ${!service.isActive ? styles.inactive : ''}`}
              >
                <div className={styles.serviceHeader}>
                  <div className={styles.serviceIcon}>
                    {getServiceIcon(service.serviceCode)}
                  </div>
                  <div className={styles.serviceToggle}>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={service.isActive}
                        onChange={() => toggleServiceStatus(service)}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>
                </div>

                <div className={styles.serviceContent}>
                  <h3 className={styles.serviceName}>{service.serviceName}</h3>
                  <p className={styles.serviceDesc}>{service.description}</p>
                  <div className={styles.serviceCode}>{service.serviceCode}</div>
                </div>

                <div className={styles.serviceFooter}>
                  <div className={styles.priceSection}>
                    <span className={styles.priceLabel}>Price</span>
                    <span className={styles.priceValue}>
                      {formatCurrency(parseFloat(service.price))}
                    </span>
                  </div>
                  <button
                    className={styles.editBtn}
                    onClick={() => openModal(service)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                </div>

                {!service.isActive && (
                  <div className={styles.inactiveBadge}>Disabled</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pricing Info */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <div className={styles.infoContent}>
              <h4>Pricing Guidelines</h4>
              <ul>
                <li>Prices are in Nigerian Naira (₦)</li>
                <li>Changes take effect immediately</li>
                <li>Disabled services cannot be used by customers</li>
                <li>Consider market rates when setting prices</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showModal && selectedService && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Edit Service</h2>
                <button className={styles.closeBtn} onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.selectedServiceInfo}>
                  <div className={styles.serviceIcon}>
                    {getServiceIcon(selectedService.serviceCode)}
                  </div>
                  <div>
                    <strong>{selectedService.serviceName}</strong>
                    <span>{selectedService.serviceCode}</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Service Description</label>
                  <p className={styles.descriptionText}>{selectedService.description}</p>
                </div>

                <div className={styles.formGroup}>
                  <label>Price (₦)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Status</label>
                  <div className={styles.statusToggle}>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={newStatus}
                        onChange={(e) => setNewStatus(e.target.checked)}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                    <span className={newStatus ? styles.activeText : styles.inactiveText}>
                      {newStatus ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={handleUpdateService}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}