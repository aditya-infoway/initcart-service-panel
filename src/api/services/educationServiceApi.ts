import apiClient from "../apiClient";

// ✅ Yeh main interface hai jo export karenge
export interface EducationService {
  id: number;
  service_name: string;
  short_description: string;
  full_description: string;
  price: number;
  offer_price?: number;
  gst_percentage: string;
  contact_person: string;
  contact_number: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  video_url?: string;
  batch_timings: string;
  terms_conditions: string;
  
  // Education Specific
  education_type: string;
  subjects_courses: string;
  mode_of_class: string;
  class_duration?: string;
  faculty_details?: string;
  facilities?: string;
  eligibility_criteria?: string;
  
  // Status
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'inactive';
  is_active: boolean;
  is_featured: boolean;
  views_count: number;
  
  // Dates
  created_at: string;
  updated_at: string;
  submitted_for_approval_at?: string;
  approved_at?: string;
  rejected_at?: string;
  
  // Rejection info
  rejection_reason?: string;
  
  // Image
  image?: string;
  image_url?: string;
  
  // Vendor info
  vendor?: number;
  vendor_name?: string;
  
  // Helper properties from serializer
  final_price?: number;
  can_be_edited?: boolean;
  can_be_submitted?: boolean;
}

// ✅ Yeh create ke liye data format hai
export interface CreateEducationServiceData {
  service_name: string;
  short_description: string;
  full_description: string;
  price: number;
  offer_price?: number;
  gst_percentage: string;
  contact_person: string;
  contact_number: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  video_url?: string;
  batch_timings: string;
  terms_conditions: string;
  
  // Education Specific
  education_type: string;
  subjects_courses: string;
  mode_of_class: string;
  class_duration?: string;
  faculty_details?: string;
  facilities?: string;
  eligibility_criteria?: string;
  
  // Image file
  image?: File;
}

// ✅ Yeh update ke liye data format hai
export interface UpdateEducationServiceData extends Partial<CreateEducationServiceData> {
  id: number;
}

// ✅ Yeh API response format hai
export interface EducationServiceResponse {
  success: boolean;
  message?: string;
  data?: any;
  errors?: Record<string, string[]>;
  count?: number;
  services?: EducationService[];
  service?: EducationService;
}

// ✅ Yeh paginated response ke liye hai
export interface PaginatedResponse {
  success: boolean;
  count: number;
  next: string | null;
  previous: string | null;
  results: EducationService[];
}

// ✅ API Endpoints constants
const EDUCATION_SERVICE_API = {
  // Get vendor's own services
  MY_SERVICES: "/ecommerce/services/education/education-services/my-services/",
  
  // CRUD operations
  LIST: "/ecommerce/services/education/education-services/",
  CREATE: "/ecommerce/services/education/education-services/",
  DETAIL: (id: number) => `/ecommerce/services/education/education-services/${id}/`,
  UPDATE: (id: number) => `/ecommerce/services/education/education-services/${id}/`,
  DELETE: (id: number) => `/ecommerce/services/education/education-services/${id}/`,
  
  // Actions
  SUBMIT_FOR_APPROVAL: (id: number) => `/ecommerce/services/education/education-services/${id}/submit-for-approval/`,
  TOGGLE_ACTIVE: (id: number) => `/ecommerce/services/education/education-services/${id}/toggle-active/`,
  APPROVE: (id: number) => `/ecommerce/services/education/education-services/${id}/approve/`,
  REJECT: (id: number) => `/ecommerce/services/education/education-services/${id}/reject/`,
  
  // Public endpoints
  PUBLIC_LIST: "/ecommerce/services/education/education-services/public-list/",
  FILTER_OPTIONS: "/ecommerce/services/education/education-services/filter-options/",
  
  // Dashboard
  VENDOR_DASHBOARD: "/ecommerce/services/education/education-services/vendor-dashboard/",
  ADMIN_DASHBOARD: "/ecommerce/services/education/education-services/admin-dashboard/",
  
  // Admin endpoints
  ADMIN_LIST: "/ecommerce/services/education/education-services/admin-list/",
  PENDING_APPROVALS: "/ecommerce/services/education/education-services/pending-approvals/",
};

// ✅ Class definition - Yeh default export karenge
class EducationServiceApi {
  // ==================== VENDOR FUNCTIONS ====================
  
  // Get vendor's own services
  static async getMyServices(status?: string): Promise<EducationServiceResponse> {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(EDUCATION_SERVICE_API.MY_SERVICES, { params });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching services:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch services",
        errors: error.response?.data,
      };
    }
  }
  
  // Create new education service
  static async createService(formData: FormData): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.post(EDUCATION_SERVICE_API.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error creating service:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create service",
        errors: error.response?.data,
      };
    }
  }
  
  // Update education service
  static async updateService(id: number, formData: FormData): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.patch(EDUCATION_SERVICE_API.UPDATE(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error updating service:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update service",
        errors: error.response?.data,
      };
    }
  }
  
  // Delete education service
  static async deleteService(id: number): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.delete(EDUCATION_SERVICE_API.DELETE(id));
      return response.data;
    } catch (error: any) {
      console.error("Error deleting service:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete service",
        errors: error.response?.data,
      };
    }
  }
  
  // Submit service for approval
  static async submitForApproval(id: number): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.post(EDUCATION_SERVICE_API.SUBMIT_FOR_APPROVAL(id));
      return response.data;
    } catch (error: any) {
      console.error("Error submitting for approval:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to submit for approval",
        errors: error.response?.data,
      };
    }
  }
  
  // Toggle service active status
  static async toggleActive(id: number): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.post(EDUCATION_SERVICE_API.TOGGLE_ACTIVE(id));
      return response.data;
    } catch (error: any) {
      console.error("Error toggling active status:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to toggle active status",
        errors: error.response?.data,
      };
    }
  }
  
  // Get vendor dashboard
  static async getVendorDashboard(): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.get(EDUCATION_SERVICE_API.VENDOR_DASHBOARD);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching vendor dashboard:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch dashboard",
        errors: error.response?.data,
      };
    }
  }
  
  // ==================== ADMIN FUNCTIONS ====================
  
  // Get all services (admin)
  static async getAdminList(status?: string, vendor_id?: number): Promise<EducationServiceResponse> {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (vendor_id) params.vendor_id = vendor_id;
      
      const response = await apiClient.get(EDUCATION_SERVICE_API.ADMIN_LIST, { params });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching admin list:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch services",
        errors: error.response?.data,
      };
    }
  }
  
  // Get pending approvals
  static async getPendingApprovals(): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.get(EDUCATION_SERVICE_API.PENDING_APPROVALS);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching pending approvals:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch pending approvals",
        errors: error.response?.data,
      };
    }
  }
  
  // Approve service
  static async approveService(id: number): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.post(EDUCATION_SERVICE_API.APPROVE(id));
      return response.data;
    } catch (error: any) {
      console.error("Error approving service:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve service",
        errors: error.response?.data,
      };
    }
  }
  
  // Reject service
  static async rejectService(id: number, rejection_reason: string): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.post(EDUCATION_SERVICE_API.REJECT(id), {
        rejection_reason
      });
      return response.data;
    } catch (error: any) {
      console.error("Error rejecting service:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject service",
        errors: error.response?.data,
      };
    }
  }
  
  // Get admin dashboard
  static async getAdminDashboard(): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.get(EDUCATION_SERVICE_API.ADMIN_DASHBOARD);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching admin dashboard:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch admin dashboard",
        errors: error.response?.data,
      };
    }
  }
  
  // ==================== PUBLIC FUNCTIONS ====================
  
  // Get public list of approved services
  static async getPublicList(filters?: {
    education_type?: string;
    mode?: string;
    city?: string;
    min_price?: number;
    max_price?: number;
  }): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.get(EDUCATION_SERVICE_API.PUBLIC_LIST, {
        params: filters
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching public list:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch services",
        errors: error.response?.data,
      };
    }
  }
  
  // Get filter options
  static async getFilterOptions(): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.get(EDUCATION_SERVICE_API.FILTER_OPTIONS);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching filter options:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch filter options",
        errors: error.response?.data,
      };
    }
  }
  
  // Get service details
  static async getServiceDetails(id: number): Promise<EducationServiceResponse> {
    try {
      const response = await apiClient.get(EDUCATION_SERVICE_API.DETAIL(id));
      return response.data;
    } catch (error: any) {
      console.error("Error fetching service details:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch service details",
        errors: error.response?.data,
      };
    }
  }
}

// ✅ Default export the class
export default EducationServiceApi;