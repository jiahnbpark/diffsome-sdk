/**
 * Reservation types for Promptly SDK
 */

export interface ReservationService {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  duration: number;
  price: number;
  requires_staff: boolean;
  requires_payment: boolean;
  deposit: number;
  staffs: ReservationStaffSummary[];
}

export interface ReservationStaff {
  id: number;
  name: string;
  avatar: string | null;
  bio: string | null;
}

export interface ReservationStaffSummary {
  id: number;
  name: string;
  avatar: string | null;
}

export interface ReservationSlot {
  time: string;
  available: boolean;
  staff_id?: number;
}

export interface ReservationSettings {
  timezone: string;
  slot_interval: number;
  min_notice_hours: number;
  max_advance_days: number;
  cancellation_hours: number;
  allow_online_payment: boolean;
  bookable_date_range: {
    start: string;
    end: string;
  };
}

export interface Reservation {
  id: number;
  reservation_number: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  status_label: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  time_range: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  price: number;
  deposit: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'partial';
  payment_status_label: string;
  customer_memo: string | null;
  can_cancel: boolean;
  service: {
    id: number;
    name: string;
    duration: number;
  } | null;
  staff: ReservationStaffSummary | null;
  created_at: string;
}

export interface CreateReservationData {
  service_id: number;
  staff_id?: number;
  reservation_date: string;
  start_time: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_memo?: string;
}

export interface CreateReservationResult {
  reservation: Reservation;
  requires_payment: boolean;
  deposit: number;
}

export interface AvailableDatesParams {
  service_id: number;
  staff_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface AvailableSlotsParams {
  service_id: number;
  date: string;
  staff_id?: number;
}

export interface ReservationListParams {
  status?: string;
  upcoming?: boolean;
  past?: boolean;
  per_page?: number;
  page?: number;
}
