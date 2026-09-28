// src/pages/vendor/realestate/PropertyDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiCheck,
  FiX,
  FiEdit,
  FiTrash2,
  FiArrowLeft,
  FiEye,
  FiDownload
} from "react-icons/fi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const API_BASE_URL = 'http://localhost:8000/api';

interface PropertyDetail {
  id: number;
  property_id: string;
  title: string;
  description: string;
  transaction_type: string;
  property_type: string | { id: string | number; subcategory_name?: string; label?: string } | number;
  address: string;
  google_map_url: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  
  // Specifications
  total_area_size: string;
  carpet_area: string;
  built_up_area: string;
  bedrooms: number;
  bathrooms: string;
  balconies: number;
  furnishing_status: string;
  floor_number: number;
  total_floors: number;
  facing_direction: string;
  property_age: string;
  construction_status: string;
  
  // Legal & Ownership
  ownership_type: string;
  encumbrance_certificate: string;
  rea_number: string;
  rera_number: string;
  rera_registered: boolean;
  loan_availability: boolean;
  documents_available: string;
  negotiable: boolean;
  
  // Price
  price: string;
  maintenance_charges: string;
  booking_amount: string;
  security_deposit: string;
  price_per_sqft: string;
  
  // Contact
  contact_type: string;
  contact_name: string;
  contact_mobile: string;
  contact_whatsapp: string;
  contact_email: string;
  contact_preferred_time: string;
  use_vendor_info: boolean;
  
  // Status
  status: string;
  is_featured: boolean;
  is_verified: boolean;
  is_premium: boolean;
  views_count: number;
  enquiry_count: number;
  
  // Dates
  created_at: string;
  updated_at: string;
  published_at: string;
  
  // Images
  images: Array<{
    id: number;
    image_url: string;
    image_type: string;
    alt_text: string;
    display_order: number;
  }>;
  
  // JSON Fields
  amenities: string[] | string;
  nearby_facilities: Record<string, string> | string;
  
  // Documents
  documents: string;
  
  // Vendor
  vendor_details: {
    id: number;
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
  };
}

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'images' | 'legal' | 'contact'>('overview');
  const [deleting, setDeleting] = useState(false);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const getAuthToken = () => {
    return localStorage.getItem('access') || localStorage.getItem('access_token');
  };

  const fetchSubcategories = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/services/service-subcategories/active_by_service/?service=Real-Estate`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setSubcategories(list);
    }
  } catch (error) {
    console.error("Error fetching subcategories:", error);
  }
};

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const token = getAuthToken();

        if (!token) {
          Swal.fire({
            title: "Error!",
            text: "Please login again.",
            icon: "error",
            confirmButtonText: "OK"
          });
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/services/real-estate/vendor/properties/${id}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProperty(data);
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to load property details.",
            icon: "error",
            confirmButtonText: "OK"
          });
          navigate('/vendor/realestate/my-properties');
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        Swal.fire({
          title: "Error!",
          text: "Unable to load property details.",
          icon: "error",
          confirmButtonText: "OK"
        });
        navigate('/myproperties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
    fetchSubcategories();
  }, [id]);

  const handleDelete = async () => {
    const MySwal = withReactContent(Swal);
    
    const result = await MySwal.fire({
      title: <div className="text-lg font-semibold">Delete Property?</div>,
      html: <div className="text-sm">
        <p>Are you sure you want to delete this property?</p>
        <p className="text-red-600 mt-1">This action cannot be undone.</p>
      </div>,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      width: 400
    });

    if (result.isConfirmed) {
      try {
        setDeleting(true);
        const token = getAuthToken();

        if (!token) {
          Swal.fire({
            title: "Error!",
            text: "Please login again.",
            icon: "error",
            confirmButtonText: "OK"
          });
          return;
        }

        const response = await fetch(`${API_BASE_URL}/services/real-estate/vendor/properties/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          Swal.fire({
            title: "Deleted!",
            text: "Property has been deleted successfully.",
            icon: "success",
            confirmButtonText: "OK"
          }).then(() => {
            navigate('/vendor/realestate/my-properties');
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to delete property.",
            icon: "error",
            confirmButtonText: "OK"
          });
        }
      } catch (error) {
        console.error("Error deleting property:", error);
        Swal.fire({
          title: "Error!",
          text: "Unable to delete property.",
          icon: "error",
          confirmButtonText: "OK"
        });
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        Swal.fire({
          title: "Error!",
          text: "Please login again.",
          icon: "error",
          confirmButtonText: "OK"
        });
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/services/real-estate/vendor/properties/${id}/submit_for_approval/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Submitted!",
          text: "Property has been submitted for admin approval.",
          icon: "success",
          confirmButtonText: "OK"
        }).then(() => {
          window.location.reload();
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: "Error!",
          text: errorData.error || "Failed to submit for approval.",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    } catch (error) {
      console.error("Error submitting for approval:", error);
      Swal.fire({
        title: "Error!",
        text: "Unable to submit for approval.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Approved</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Pending</span>;
      case 'draft':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">Draft</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">Rejected</span>;
      case 'sold_rented':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Sold/Rented</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">{status}</span>;
    }
  };

const getPropertyTypeDisplay = (type: any): string => {
  if (!type) return 'Unknown';
  
  // If type is an object with subcategory_name
  if (typeof type === 'object' && type !== null) {
    return type.subcategory_name || type.label || String(type.id || 'Unknown');
  }
  
  // If type is a string ID, look up in subcategories
  const typeStr = String(type);
  
  // Look for matching subcategory by ID
  const matchingSubcategory = subcategories.find(
    (sub) => String(sub.id) === typeStr
  );
  
  if (matchingSubcategory) {
    return matchingSubcategory.subcategory_name;
  }
  
  // Check if it matches hardcoded types
  switch (typeStr.toLowerCase()) {
    case 'apartment': return 'Apartment';
    case 'house': return 'House';
    case 'villa': return 'Villa';
    case 'commercial': return 'Commercial';
    case 'pg_coliving': return 'PG/Co-living';
    case 'plots': return 'Plots';
    default: 
      return 'Property';
  }
};

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'sale': return 'For Sale';
      case 'rent': return 'For Rent';
      case 'lease': return 'For Lease';
      default: return type;
    }
  };

  const getFurnishingStatus = (status: string) => {
    switch (status) {
      case 'fully_furnished': return 'Fully Furnished';
      case 'semi_furnished': return 'Semi Furnished';
      case 'unfurnished': return 'Unfurnished';
      default: return status;
    }
  };

  const getOwnershipType = (type: string) => {
    switch (type) {
      case 'freehold': return 'Freehold';
      case 'leasehold': return 'Leasehold';
      case 'cooperative': return 'Co-operative';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <FiHome className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Property Not Found</h3>
            <p className="text-gray-500 mb-6">The property you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/vendor/realestate/my-properties')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mainImage = property.images?.find(img => img.image_type === 'main')?.image_url;
  const additionalImages = property.images?.filter(img => img.image_type === 'additional') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/myproperties')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Properties
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{property.title}</h1>
                {getStatusBadge(property.status)}
                {property.is_featured && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Featured</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <FiMapPin className="w-4 h-4" />
                  <span>{property.city}, {property.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>ID: {property.property_id}</span>
                  <span>•</span>
                  <span>{getTransactionTypeDisplay(property.transaction_type)}</span>
                  <span>•</span>
                  <span>{getPropertyTypeDisplay(property.property_type)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {property.status === 'draft' && (
                <button
                  onClick={handleSubmitForApproval}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Submit for Approval
                </button>
              )}
              <button
                onClick={() => navigate(`/edit-property/${property.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <FiEdit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                <FiTrash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
              
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Price</div>
            <div className="text-xl font-bold text-gray-800">{formatCurrency(property.price)}</div>
            {property.price_per_sqft && (
              <div className="text-sm text-gray-600">{formatCurrency(property.price_per_sqft)}/sqft</div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Views</div>
            <div className="text-xl font-bold text-gray-800">{property.views_count}</div>
            <div className="text-sm text-gray-600">Total views</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Enquiries</div>
            <div className="text-xl font-bold text-gray-800">{property.enquiry_count}</div>
            <div className="text-sm text-gray-600">Total enquiries</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Created</div>
            <div className="text-xl font-bold text-gray-800">
              {new Date(property.created_at).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600">
              {new Date(property.created_at).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: <FiEye /> },
            { id: 'images', label: 'Images', icon: <FiEye /> },
            { id: 'legal', label: 'Legal Info', icon: <FiDownload /> },
            { id: 'contact', label: 'Contact', icon: <FiUser /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors relative ${activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Address</h3>
                <div className="flex items-start gap-2 text-gray-600">
                  <FiMapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{property.address}</p>
                    <p>{property.city}, {property.state} - {property.pincode}</p>
                    {property.google_map_url && (
                      <a
                        href={property.google_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                      >
                        View on Google Maps →
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Specifications Grid */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Property Type</div>
                    <div className="font-medium">{getPropertyTypeDisplay(property.property_type)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Transaction Type</div>
                    <div className="font-medium">{getTransactionTypeDisplay(property.transaction_type)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Furnishing Status</div>
                    <div className="font-medium">{getFurnishingStatus(property.furnishing_status)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Area</div>
                    <div className="font-medium">{property.total_area_size} sqft</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Carpet Area</div>
                    <div className="font-medium">{property.carpet_area} sqft</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Built-up Area</div>
                    <div className="font-medium">{property.built_up_area || property.carpet_area} sqft</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Bedrooms</div>
                    <div className="font-medium">{property.bedrooms} BHK</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Bathrooms</div>
                    <div className="font-medium">{property.bathrooms}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Balconies</div>
                    <div className="font-medium">{property.balconies}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Floor</div>
                    <div className="font-medium">{property.floor_number} of {property.total_floors}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Facing Direction</div>
                    <div className="font-medium">{property.facing_direction.replace('_', ' ').toUpperCase()}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Property Age</div>
                    <div className="font-medium">{property.property_age}</div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    let amenities: string[] = [];
                    try {
                      if (typeof property.amenities === 'string') {
                        amenities = JSON.parse(property.amenities);
                      } else if (Array.isArray(property.amenities)) {
                        amenities = property.amenities;
                      }
                    } catch {
                      amenities = [];
                    }
                    
                    return amenities.length > 0 ? (
                      amenities.map((amenity, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {amenity}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No amenities listed</p>
                    );
                  })()}
                </div>
              </div>

              {/* Nearby Facilities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Nearby Facilities</h3>
                <div className="space-y-3">
                  {(() => {
                    let facilities: Record<string, string> = {};
                    try {
                      if (typeof property.nearby_facilities === 'string') {
                        facilities = JSON.parse(property.nearby_facilities);
                      } else if (typeof property.nearby_facilities === 'object') {
                        facilities = property.nearby_facilities;
                      }
                    } catch {
                      facilities = {};
                    }
                    
                    return Object.keys(facilities).length > 0 ? (
                      Object.entries(facilities).map(([facility, distance]) => (
                        <div key={facility} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium text-gray-700">{facility}</span>
                          <span className="text-green-600">{distance} km</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No nearby facilities listed</p>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              {/* Main Image */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Main Image</h3>
                {mainImage ? (
                  <div className="relative">
                    <img
                      src={mainImage}
                      alt="Main"
                      className="w-full h-96 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FiHome className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Additional Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Additional Images ({additionalImages.length})
                </h3>
                {additionalImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {additionalImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.image_url}
                          alt={image.alt_text || 'Additional image'}
                          className="w-full h-48 object-cover rounded-lg shadow hover:shadow-lg transition-shadow"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FiHome className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No additional images</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ownership Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Ownership Information</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Ownership Type</div>
                      <div className="font-medium">{getOwnershipType(property.ownership_type)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Encumbrance Certificate</div>
                      <div className="font-medium">
                        {property.encumbrance_certificate || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">REA Number</div>
                      <div className="font-medium">{property.rea_number || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">RERA Registered</div>
                      <div className="font-medium">
                        {property.rera_registered ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <FiCheck /> Yes {property.rera_number && `(${property.rera_number})`}
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <FiX /> No
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Legal Details</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Loan Availability</div>
                      <div className="font-medium">
                        {property.loan_availability ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <FiCheck /> Yes
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <FiX /> No
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Documents Available</div>
                      <div className="font-medium capitalize">{property.documents_available || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Negotiable</div>
                      <div className="font-medium">
                        {property.negotiable ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <FiCheck /> Yes
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <FiX /> No
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Construction Status</div>
                      <div className="font-medium capitalize">
                        {property.construction_status?.replace('_', ' ') || 'Ready to move'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Main Price</div>
                    <div className="text-xl font-bold text-gray-800">{formatCurrency(property.price)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Maintenance Charges</div>
                    <div className="text-xl font-bold text-gray-800">
                      {formatCurrency(property.maintenance_charges || '0')}
                    </div>
                    <div className="text-xs text-gray-500">per month</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Booking Amount</div>
                    <div className="text-xl font-bold text-gray-800">
                      {formatCurrency(property.booking_amount || '0')}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Security Deposit</div>
                    <div className="text-xl font-bold text-gray-800">
                      {formatCurrency(property.security_deposit || '0')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Contact Type</div>
                      <div className="font-medium capitalize">
                        {property.use_vendor_info ? 'Vendor Information' : 'Custom Contact'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiUser className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Contact Person</div>
                        <div className="font-medium">{property.contact_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Mobile Number</div>
                        <div className="font-medium">{property.contact_mobile}</div>
                      </div>
                    </div>
                    {property.contact_whatsapp && (
                      <div className="flex items-center gap-3">
                        <FiPhone className="w-5 h-5 text-green-400" />
                        <div>
                          <div className="text-sm text-gray-500">WhatsApp Number</div>
                          <div className="font-medium">{property.contact_whatsapp}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium">{property.contact_email}</div>
                      </div>
                    </div>
                    {property.contact_preferred_time && (
                      <div className="flex items-center gap-3">
                        <FiCalendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Preferred Contact Time</div>
                          <div className="font-medium">{property.contact_preferred_time}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vendor Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Information</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Business Name</div>
                      <div className="font-medium">{property.vendor_details.business_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Owner Name</div>
                      <div className="font-medium">{property.vendor_details.owner_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Vendor Email</div>
                      <div className="font-medium">{property.vendor_details.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Vendor Phone</div>
                      <div className="font-medium">{property.vendor_details.phone}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;