// src/pages/vendor/realestate/MyPropertiesPage.tsx - FINAL VERSION WITH CARD AND TABLE VIEW
import React, { useState, useEffect } from "react";
import { useNavigate, } from "react-router-dom";
import {
  FiHome,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPlus,
  FiCheck,

  FiAlertCircle,

  FiMapPin,

  FiSearch,

  FiRefreshCw,
  FiGrid,
  FiList,
  FiStar,
  FiTrendingUp,
  FiMessageSquare
} from "react-icons/fi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const API_BASE_URL = 'https://api.initcart.in/api';

interface Property {
  id: number;
  property_id: string;
  title: string;
  transaction_type: string;
  property_type: string | { id: string | number; subcategory_name?: string; label?: string } | number;
  price: string;
  price_per_sqft: string;
  total_area_size: string;
  bedrooms: number;
  bathrooms: string;
  city: string;
  state: string;
  status: string;
  is_featured: boolean;
  is_premium: boolean;
  views_count: number;
  enquiry_count: number;
  created_at: string;
  description: string;
  furnishing_status: string;
  construction_status: string;
  property_age: string;
  main_image: string | null;
  thumbnail_image: string | null;
  vendor_details: {
    id: number;
    business_name: string;
    owner_name: string;
  };
}

interface PropertyFilter {
  status: string;
   property_type: string; 
  transaction_type: string;
  search: string;
}
// Add this interface after PropertyFilter interface
interface Subcategory {
  id: string;
  subcategory_name: string;
  parent_service: string;
  status: string;
  description?: string;
  image?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

const MyPropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [realEstateSubcategories, setRealEstateSubcategories] = useState<Subcategory[]>([]);
  const [filter, setFilter] = useState<PropertyFilter>({
    status: '',
    property_type: '',
    transaction_type: '',
    search: ''
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    draft: 0,
    sold_rented: 0
  });

  // Get auth token helper
  const getAuthToken = () => {
    return localStorage.getItem('access') || localStorage.getItem('access_token');
  };

  

// Fetch Real Estate subcategories
// Fetch Real Estate subcategories
const fetchRealEstateSubcategories = async (): Promise<void> => {
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
      console.log('Subcategories from API:', data);
      const subcategoriesList: Subcategory[] = Array.isArray(data) ? data : data.results || [];
      setRealEstateSubcategories(subcategoriesList);
    }
  } catch (error) {
    console.error("Error fetching subcategories:", error);
  }
};



  // Fetch properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        console.error("No access token found");
        Swal.fire({
          title: "Error!",
          text: "Please login again.",
          icon: "error",
          confirmButtonText: "OK"
        });
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/services/real-estate/vendor/properties/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const propertiesList = Array.isArray(data) ? data : data.results || [];
        setProperties(propertiesList);

        // Calculate stats
        calculateStats(propertiesList);
      } else {
        console.error("Failed to fetch properties:", response.status);
        Swal.fire({
          title: "Error!",
          text: "Failed to load properties. Please try again.",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      Swal.fire({
        title: "Connection Error!",
        text: "Unable to connect to server",
        icon: "error",
        confirmButtonText: "OK"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (propertiesList: Property[]) => {
    const stats = {
      total: propertiesList.length,
      approved: propertiesList.filter(p => p.status === 'approved').length,
      pending: propertiesList.filter(p => p.status === 'pending').length,
      draft: propertiesList.filter(p => p.status === 'draft').length,
      sold_rented: propertiesList.filter(p => p.status === 'sold_rented').length
    };
    setStats(stats);
  };

  // Delete property
  const deleteProperty = async (id: number) => {
    const MySwal = withReactContent(Swal);

    const result = await MySwal.fire({
      title: <div className="text-lg font-semibold">Are you sure?</div>,
      html: <div className="text-sm">
        <p>This action cannot be undone.</p>
        <p className="text-red-600 mt-1">The property will be permanently deleted.</p>
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
        setDeletingId(id);
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
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Remove from state
          const updatedProperties = properties.filter(property => property.id !== id);
          setProperties(updatedProperties);
          calculateStats(updatedProperties);

          Swal.fire({
            title: "Deleted!",
            text: "Property has been deleted successfully.",
            icon: "success",
            confirmButtonText: "OK"
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to delete property. Please try again.",
            icon: "error",
            confirmButtonText: "OK"
          });
        }
      } catch (error) {
        console.error("Error deleting property:", error);
        Swal.fire({
          title: "Error!",
          text: "Unable to delete property. Please try again.",
          icon: "error",
          confirmButtonText: "OK"
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Submit for approval
  const submitForApproval = async (id: number) => {
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
        // Update property status in state
        const updatedProperties = properties.map(property =>
          property.id === id ? { ...property, status: 'pending' } : property
        );
        setProperties(updatedProperties);
        calculateStats(updatedProperties);

        Swal.fire({
          title: "Submitted!",
          text: "Property has been submitted for admin approval.",
          icon: "success",
          confirmButtonText: "OK"
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
        text: "Unable to submit for approval. Please try again.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchProperties();
    fetchRealEstateSubcategories();
  }, []);

// Apply filters
const filteredProperties = properties.filter(property => {
  if (filter.status && property.status !== filter.status) return false;
  
  // Compare property_type ID with filter value
  if (filter.property_type) {
    // property.property_type might be the ID directly or an object
    const propTypeId = typeof property.property_type === 'object' 
      ? property.property_type?.id 
      : property.property_type;
    
    console.log('Comparing:', propTypeId, 'with filter:', filter.property_type); // Debug
    
    if (String(propTypeId) !== String(filter.property_type)) return false;
  }
  
  if (filter.transaction_type && property.transaction_type !== filter.transaction_type) return false;
  
  if (filter.search) {
    const searchTerm = filter.search.toLowerCase();
    return (
      property.title.toLowerCase().includes(searchTerm) ||
      property.city.toLowerCase().includes(searchTerm) ||
      property.state.toLowerCase().includes(searchTerm) ||
      property.property_id.toLowerCase().includes(searchTerm)
    );  
  }
  return true;
});
  // Format currency
  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Draft</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Rejected</span>;
      case 'sold_rented':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Sold/Rented</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

const getPropertyTypeDisplay = (type: any): string => {
  if (!type) return 'Unknown';
  
  // If type is an object with subcategory_name
  if (typeof type === 'object' && type !== null) {
    return (type as any).subcategory_name || (type as any).label || 'Unknown';
  }
  
  // If type is a string (ID), find matching subcategory
  const matchingSubcategory = realEstateSubcategories.find(
    (sub: Subcategory) => String(sub.id) === String(type)
  );
  
  if (matchingSubcategory) {
    return matchingSubcategory.subcategory_name;
  }
  
  // Fallback for hardcoded types
  const typeStr = String(type);
  switch (typeStr) {
    case 'apartment': return 'Apartment';
    case 'house': return 'House';
    case 'villa': return 'Villa';
    case 'commercial': return 'Commercial';
    case 'pg_coliving': return 'PG/Co-living';
    case 'plots': return 'Plots';
    default: return typeStr.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

  // Get transaction type display
  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'sale': return 'For Sale';
      case 'rent': return 'For Rent';
      case 'lease': return 'For Lease';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Properties</h1>
            <p className="text-gray-600">Manage your property listings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/add-property')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md"
            >
              <FiPlus className="w-5 h-5" />
              Add New Property
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Properties</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiHome className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Approved</p>
                <h3 className="text-2xl font-bold text-green-600">{stats.approved}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Draft</p>
                <h3 className="text-2xl font-bold text-gray-600">{stats.draft}</h3>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiEdit className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Sold/Rented</p>
                <h3 className="text-2xl font-bold text-purple-600">{stats.sold_rented}</h3>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiTrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search properties by title, city, or property ID..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="sold_rented">Sold/Rented</option>
              </select>
<select
  value={filter.property_type}
  onChange={(e) => {
    console.log('Selected filter value:', e.target.value); // Debug
    setFilter({ ...filter, property_type: e.target.value });
  }}
  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
>
  <option value="">All Types</option>
  {realEstateSubcategories.map((sub) => (
    <option key={sub.id} value={sub.id}>
      {sub.subcategory_name}
    </option>
  ))}
</select>

              <select
                value={filter.transaction_type}
                onChange={(e) => setFilter({ ...filter, transaction_type: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
              >
                <option value="">All Transactions</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="lease">For Lease</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded ${viewMode === 'card' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                title="Card View"
              >
                <FiGrid className={`w-5 h-5 ${viewMode === 'card' ? 'text-blue-600' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                title="Table View"
              >
                <FiList className={`w-5 h-5 ${viewMode === 'table' ? 'text-blue-600' : 'text-gray-500'}`} />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchProperties}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              title="Refresh Properties"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Content based on view mode */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          viewMode === 'card' ? (
            // Card View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Property Image */}
                  <div className="relative h-48">
                    {property.main_image ? (
                      <img
                        src={property.main_image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <FiHome className="w-16 h-16 text-blue-300" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(property.status)}
                    </div>

                    {/* Featured/Premium Badge */}
                    {property.is_featured && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Featured</span>
                      </div>
                    )}
                    {property.is_premium && (
                      <div className="absolute top-12 right-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Premium</span>
                      </div>
                    )}

                    {/* Price Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="text-white font-bold text-lg">
                        {formatCurrency(property.price)}
                        {property.price_per_sqft && (
                          <span className="text-sm font-normal ml-2">
                            ({formatCurrency(property.price_per_sqft)}/sqft)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 truncate">
                      {property.title}
                    </h3>

                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <FiMapPin className="w-4 h-4 mr-1" />
                      <span>{property.city}, {property.state}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span>{property.bedrooms} BHK</span>
                        <span>{property.total_area_size} sqft</span>
                        <span>{getTransactionTypeDisplay(property.transaction_type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiEye className="w-3 h-3" />
                        <span>{property.views_count}</span>
                        <FiMessageSquare className="w-3 h-3 ml-2" />
                        <span>{property.enquiry_count}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {property.description || 'No description available'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/property/${property.id}`)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/edit-property/${property.id}`)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm"
                          title="Edit Property"
                        >
                          <FiEdit className="w-4 h-4" />
                          Edit
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {property.status === 'draft' && (
                          <button
                            onClick={() => submitForApproval(property.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            Submit for Approval
                          </button>
                        )}

                        <button
                          onClick={() => deleteProperty(property.id)}
                          disabled={deletingId === property.id}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 disabled:opacity-50 text-sm"
                          title="Delete Property"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          {deletingId === property.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Table View
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type & Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProperties.map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {property.thumbnail_image ? (
                              <img
                                src={property.thumbnail_image}
                                alt={property.title}
                                className="w-12 h-12 rounded-md object-cover mr-3"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mr-3">
                                <FiHome className="w-6 h-6 text-blue-300" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {property.title}
                              </div>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <FiMapPin className="w-3 h-3 mr-1" />
                                {property.city}, {property.state}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                ID: {property.property_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getPropertyTypeDisplay(property.property_type)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getTransactionTypeDisplay(property.transaction_type)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {property.bedrooms} BHK • {property.total_area_size} sqft
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(property.status)}
                            {property.is_featured && (
                              <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full inline-flex items-center gap-1 w-fit">
                                <FiStar className="w-2.5 h-2.5" />
                                Featured
                              </span>
                            )}
                            {property.is_premium && (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full w-fit">
                                Premium
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(property.price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {property.price_per_sqft && `${formatCurrency(property.price_per_sqft)}/sqft`}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">{property.views_count}</div>
                              <div className="text-xs text-gray-500">Views</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">{property.enquiry_count}</div>
                              <div className="text-xs text-gray-500">Enquiries</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(property.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => navigate(`/property/${property.id}`)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/edit-property/${property.id}`)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Edit Property"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            {property.status === 'draft' && (
                              <button
                                onClick={() => submitForApproval(property.id)}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                title="Submit for Approval"
                              >
                                Submit
                              </button>
                            )}
                            <button
                              onClick={() => deleteProperty(property.id)}
                              disabled={deletingId === property.id}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                              title="Delete Property"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <FiHome className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-6">
              {filter.status || filter.property_type || filter.transaction_type || filter.search
                ? "No properties match your filters. Try adjusting your search criteria."
                : "You haven't added any properties yet. Get started by adding your first property!"}
            </p>
            <button
              onClick={() => navigate('/add-property')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <div className="flex items-center gap-2">
                <FiPlus className="w-5 h-5" />
                Add Your First Property
              </div>
            </button>
          </div>
        )}

        {/* Results Count and Pagination Info */}
        {filteredProperties.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing <span className="font-semibold">{filteredProperties.length}</span> of{' '}
              <span className="font-semibold">{properties.length}</span> properties
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                Card View
              </span>
              <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs">
                Table View
              </span>
              <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded text-xs">
                Switch between views using the toggle above
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPropertiesPage;