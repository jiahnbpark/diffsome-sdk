/**
 * Reservation Resource for Promptly SDK
 */

import type { HttpClient } from '../http';
import type { ListResponse } from '../types';
import type {
  ReservationService,
  ReservationStaff,
  ReservationSlot,
  ReservationSettings,
  Reservation,
  CreateReservationData,
  CreateReservationResult,
  AvailableDatesParams,
  AvailableSlotsParams,
  ReservationListParams,
} from '../types';

export class ReservationResource {
  constructor(private http: HttpClient) {}

  // ============================================
  // Public Endpoints
  // ============================================

  /**
   * Get reservation settings
   * @returns Reservation settings for the tenant
   */
  async getSettings(): Promise<ReservationSettings> {
    return this.http.get<ReservationSettings>('/public/reservations/settings');
  }

  /**
   * List available services
   * @returns Array of services (always an array)
   */
  async listServices(): Promise<ReservationService[]> {
    const response = await this.http.getList<ReservationService>('/public/reservations/services');
    return response.data;
  }

  /**
   * List available staff members
   * @param serviceId - Optional: filter staff by service
   * @returns Array of staff members (always an array)
   */
  async listStaff(serviceId?: number): Promise<ReservationStaff[]> {
    const params = serviceId ? { service_id: serviceId } : undefined;
    const response = await this.http.getList<ReservationStaff>('/public/reservations/staffs', params);
    return response.data;
  }

  /**
   * Get available dates for booking
   * @returns Array of available date strings (YYYY-MM-DD)
   */
  async getAvailableDates(params: AvailableDatesParams): Promise<string[]> {
    const response = await this.http.get<string[] | { data: string[] }>('/public/reservations/dates', params);
    return Array.isArray(response) ? response : (response?.data ?? []);
  }

  /**
   * Get available time slots for a specific date
   * @returns Array of available slots (always an array)
   */
  async getAvailableSlots(params: AvailableSlotsParams): Promise<ReservationSlot[]> {
    const response = await this.http.get<ReservationSlot[] | { data: ReservationSlot[] }>('/public/reservations/slots', params);
    return Array.isArray(response) ? response : (response?.data ?? []);
  }

  // ============================================
  // Protected Endpoints (requires auth)
  // ============================================

  /**
   * Create a new reservation
   * @returns Created reservation with payment info
   */
  async create(data: CreateReservationData): Promise<CreateReservationResult> {
    return this.http.post<CreateReservationResult>('/reservations', data);
  }

  /**
   * List my reservations
   * @returns ListResponse with reservations and pagination meta
   */
  async list(params?: ReservationListParams): Promise<ListResponse<Reservation>> {
    return this.http.getList<Reservation>('/reservations', params);
  }

  /**
   * Get upcoming reservations
   * @returns Array of upcoming reservations
   */
  async upcoming(limit: number = 10): Promise<Reservation[]> {
    const response = await this.http.getList<Reservation>('/reservations', {
      upcoming: true,
      per_page: limit,
    });
    return response.data;
  }

  /**
   * Get past reservations
   * @returns Array of past reservations
   */
  async past(limit: number = 10): Promise<Reservation[]> {
    const response = await this.http.getList<Reservation>('/reservations', {
      past: true,
      per_page: limit,
    });
    return response.data;
  }

  /**
   * Get reservation by reservation number
   */
  async get(reservationNumber: string): Promise<Reservation> {
    return this.http.get<Reservation>(`/reservations/${reservationNumber}`);
  }

  /**
   * Cancel a reservation
   * @param reservationNumber - Reservation number to cancel
   * @param reason - Optional cancellation reason
   */
  async cancel(reservationNumber: string, reason?: string): Promise<Reservation> {
    return this.http.post<Reservation>(`/reservations/${reservationNumber}/cancel`, { reason });
  }
}
