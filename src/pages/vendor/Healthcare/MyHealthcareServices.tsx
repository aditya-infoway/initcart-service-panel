// src/pages/vendor/healthcare/MyHealthcareServices.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiMapPin,
  FiPhone,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiMail,
  FiMessageCircle,
  FiImage,
  FiClock,
  FiEye,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiSearch
} from "react-icons/fi";
import { FaHospitalUser } from "react-icons/fa";
import apiClient from "../../../api/apiClient";

interface HealthcareService {
  id: number;
  subcategory: number;
  subcategory_name: string;
  category: string;
  business_name: string;
  location: string;
  address: string;
  country?: string;
  state?: string;
  city?: string;
  contact_no: string;
  whatsapp_no: string;
  gmail_id: string;
  description: string;
  status: string;
  main_image?: string;
  multi_images?: Array<{ id: number; image: string }>;
  created_at: string;
  approved_date?: string;
  approved_by?: number;
  vendor?: number;
}

const MyHealthcareServices: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<HealthcareService[]>([]);
  const [filteredServices, setFilteredServices] = useState<HealthcareService[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [selectedImageList, setSelectedImageList] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/healthcare-services/");
      const servicesData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setServices(servicesData);
      setFilteredServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
      Swal.fire("Error!", "Failed to load services.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service =>
        service.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.subcategory_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.contact_no?.includes(searchTerm)
      );
      setFilteredServices(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, services]);

  const handleDelete = async (service: HealthcareService) => {
    const result = await Swal.fire({
      title: "Delete Service?",
      html: `<p>Are you sure you want to delete <strong>${service.business_name}</strong>?</p><p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setDeletingId(service.id);
        await apiClient.delete(`/healthcare-services/${service.id}/`);
        setServices(prev => prev.filter(s => s.id !== service.id));
        Swal.fire("Deleted!", "Service has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting service:", error);
        Swal.fire("Error!", "Failed to delete service.", "error");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs rounded-full flex items-center gap-1.5 w-fit border border-green-200">
            <FiCheck className="w-3 h-3" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 text-xs rounded-full flex items-center gap-1.5 w-fit border border-yellow-200">
            <FiAlertCircle className="w-3 h-3" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 text-xs rounded-full flex items-center gap-1.5 w-fit border border-red-200">
            <FiX className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const openImageGallery = (images: Array<{ id: number; image: string }>, startIndex = 0) => {
    const imageUrls = images.map(img => img.image);
    setSelectedImageList(imageUrls);
    setViewImage(imageUrls[startIndex]);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {currentItems.map((service) => (
        <div
          key={service.id}
          className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div
            className="relative h-48 bg-gradient-to-br from-teal-100 to-cyan-100 overflow-hidden cursor-pointer"
            onClick={() => {
              if (service.main_image) {
                const allImages = service.multi_images || [];
                openImageGallery([{ id: 0, image: service.main_image! }, ...allImages], 0);
              } else if (service.multi_images && service.multi_images.length > 0) {
                openImageGallery(service.multi_images, 0);
              }
            }}
          >
            {service.main_image ? (
              <img
                src={service.main_image}
                alt={service.business_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaHospitalUser className="w-16 h-16 text-teal-300" />
              </div>
            )}
            <div className="absolute top-3 right-3">{getStatusBadge(service.status)}</div>
            {service.category && (
              <div className="absolute bottom-3 left-3">
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-teal-700 text-xs rounded-lg font-medium">
                  {service.category}
                </span>
              </div>
            )}
            {((service.main_image ? 1 : 0) + (service.multi_images?.length || 0)) > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                <FiImage className="w-3 h-3" />
                {(service.main_image ? 1 : 0) + (service.multi_images?.length || 0)}
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="mb-3">
              <h3 className="text-xl font-bold text-slate-800 mb-1 line-clamp-1">{service.business_name}</h3>
              {service.subcategory_name && (
                <p className="text-sm text-teal-600 font-medium">{service.subcategory_name}</p>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-teal-400" />
                <span className="line-clamp-2">
                  {service.city && service.state ? `${service.city}, ${service.state}` : service.address}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FiPhone className="w-4 h-4 text-teal-400" />
                <span>{service.contact_no}</span>
              </div>
              {service.whatsapp_no && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiMessageCircle className="w-4 h-4 text-green-500" />
                  <span>{service.whatsapp_no}</span>
                </div>
              )}
              {service.gmail_id && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiMail className="w-4 h-4 text-red-400" />
                  <span className="truncate">{service.gmail_id}</span>
                </div>
              )}
            </div>

            {service.multi_images && service.multi_images.length > 0 && (
              <div className="flex gap-2 mb-4">
                {service.multi_images.slice(0, 4).map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const allImages = service.main_image
                        ? [{ id: 0, image: service.main_image! }, ...service.multi_images!]
                        : service.multi_images!;
                      openImageGallery(allImages, service.main_image ? idx + 1 : idx);
                    }}
                    className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 hover:border-teal-300 transition-colors"
                  >
                    <img src={img.image} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                {service.multi_images.length > 4 && (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                    +{service.multi_images.length - 4}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => navigate(`/myhealthcareservices/${service.id}/edit`)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-colors font-medium text-sm"
              >
                <FiEdit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete(service)}
                disabled={deletingId === service.id}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm disabled:opacity-50"
              >
                <FiTrash2 className="w-4 h-4" /> Delete
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3">Added: {formatDate(service.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {['Service', 'Category', 'Location', 'Contact', 'Status', 'Added On', 'Actions'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {currentItems.map((service) => (
            <tr key={service.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {service.main_image ? (
                    <img src={service.main_image} alt={service.business_name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                      <FaHospitalUser className="w-5 h-5 text-teal-600" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-slate-900">{service.business_name}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{service.address}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-lg">
                  {service.subcategory_name || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-600">
                  {service.city && service.state ? `${service.city}, ${service.state}` : 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-600">{service.contact_no}</div>
                {service.whatsapp_no && (
                  <div className="text-xs text-green-600">WhatsApp: {service.whatsapp_no}</div>
                )}
              </td>
              <td className="px-6 py-4">{getStatusBadge(service.status)}</td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-600">{formatDate(service.created_at)}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/myhealthcareservices/${service.id}/edit`)}
                    className="p-2 text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    disabled={deletingId === service.id}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Healthcare Services
            </h1>
            <p className="text-slate-500">Manage your healthcare service listings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/myhealthcareservices/add')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 shadow-lg shadow-teal-200 transition-all duration-200 font-medium"
            >
              <FiPlus className="w-5 h-5" /> Add New Service
            </button>
            <button
              onClick={fetchServices}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all duration-200"
              title="Refresh"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Services', value: services.length, icon: <FaHospitalUser className="w-6 h-6 text-teal-600" />, bg: 'bg-teal-100', color: 'text-slate-800' },
            { label: 'Approved', value: services.filter(s => s.status === 'approved').length, icon: <FiCheck className="w-6 h-6 text-green-600" />, bg: 'bg-green-100', color: 'text-green-600' },
            { label: 'Pending', value: services.filter(s => s.status === 'pending').length, icon: <FiClock className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-100', color: 'text-amber-600' },
            { label: 'Rejected', value: services.filter(s => s.status === 'rejected').length, icon: <FiX className="w-6 h-6 text-red-600" />, bg: 'bg-red-100', color: 'text-red-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by business name, category, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
            </div>
            <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
              {(['card', 'table'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${viewMode === mode ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {mode === 'card' ? <FiGrid className="w-4 h-4" /> : <FiList className="w-4 h-4" />}
                  <span className="text-sm font-medium capitalize">{mode} View</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredServices.length}</span> services
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading services...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <>
            {viewMode === 'card' ? <CardView /> : <TableView />}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`px-3 py-1 rounded-lg transition-colors ${currentPage === num ? 'bg-teal-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaHospitalUser className="w-10 h-10 text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Services Found</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              {searchTerm
                ? `No services match "${searchTerm}". Try a different search term.`
                : "You haven't added any healthcare services yet."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/myhealthcareservices/add')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 shadow-lg shadow-teal-200 font-medium"
              >
                <FiPlus className="w-5 h-5" /> Add Your First Service
              </button>
            )}
          </div>
        )}

        {viewImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setViewImage(null)}
          >
            <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setViewImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300"
              >
                <FiX className="w-8 h-8" />
              </button>
              {selectedImageList.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const idx = selectedImageList.indexOf(viewImage);
                      setViewImage(selectedImageList[idx > 0 ? idx - 1 : selectedImageList.length - 1]);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                  >←</button>
                  <button
                    onClick={() => {
                      const idx = selectedImageList.indexOf(viewImage);
                      setViewImage(selectedImageList[idx < selectedImageList.length - 1 ? idx + 1 : 0]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                  >→</button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                    {selectedImageList.indexOf(viewImage) + 1} / {selectedImageList.length}
                  </div>
                </>
              )}
              <img src={viewImage} alt="Full size" className="w-full h-auto max-h-[90vh] object-contain rounded-2xl" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHealthcareServices;