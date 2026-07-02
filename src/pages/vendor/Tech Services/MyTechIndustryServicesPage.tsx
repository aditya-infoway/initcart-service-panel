// src/pages/vendor/tech/MyTechIndustryServices.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiMapPin,
  FiClock,
  FiPhone,
  FiCheck,
  FiAlertCircle,
  FiX
} from "react-icons/fi";
import apiClient from "../../../api/apiClient";

interface ServiceItem {
  id?: number;
  name: string;
  description: string;
  price: number;
}

interface TechIndustryService {
  id: number;
  subcategory?: number;
  subcategory_name: string;
  business_name: string;
  location: string;
  country: string;
  state: string;
  city: string;
  address: string;
  open_time: string;
  close_time: string;
  contact_no: string;
  whatsapp_no: string;
  description: string;
  status: string;
  main_image?: string;
  second_image?: string;
  multi_images?: string[];
  items: ServiceItem[];
  created_at?: string;
}

const MyTechIndustryServices: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<TechIndustryService[]>([]);
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await apiClient.get("service-subcategories/by_service/?service=Tech Industry");
        if (response.data) {
          const techSubcategories = response.data["Tech Industry"] || [];
          setSubcategories(techSubcategories);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchSubcategories();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tech-services/");
      setServices(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      Swal.fire("Error!", "Failed to load services.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (service: TechIndustryService) => {
    const result = await Swal.fire({
      title: "Delete Service?",
      html: `<p>Are you sure you want to delete <strong>${service.business_name}</strong>?</p>`,
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
        await apiClient.delete(`/tech-services/${service.id}/`);
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

  const getSubcategoryName = (subcategoryId: any): string => {
    if (!subcategoryId) return "Unknown";
    const id = typeof subcategoryId === 'object' ? subcategoryId.id : subcategoryId;
    const match = subcategories.find(s => String(s.id) === String(id));
    return match?.subcategory_name || "Unknown";
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1 w-fit"><FiCheck className="w-3 h-3" /> Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1 w-fit"><FiAlertCircle className="w-3 h-3" /> Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1 w-fit"><FiX className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Tech Industry Services</h1>
            <p className="text-gray-600">Manage your tech industry business listings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/tech-services/add')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 shadow-md"
            >
              <FiPlus className="w-5 h-5" />
              Add New Service
            </button>
            <button onClick={fetchServices} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50" title="Refresh">
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4"><p className="text-sm text-gray-500">Total Services</p><h3 className="text-2xl font-bold text-gray-800">{services.length}</h3></div>
          <div className="bg-white rounded-xl shadow-lg p-4"><p className="text-sm text-gray-500">Approved</p><h3 className="text-2xl font-bold text-green-600">{services.filter(s => s.status === 'approved').length}</h3></div>
          <div className="bg-white rounded-xl shadow-lg p-4"><p className="text-sm text-gray-500">Pending</p><h3 className="text-2xl font-bold text-yellow-600">{services.filter(s => s.status === 'pending').length}</h3></div>
          <div className="bg-white rounded-xl shadow-lg p-4"><p className="text-sm text-gray-500">Rejected</p><h3 className="text-2xl font-bold text-red-600">{services.filter(s => s.status === 'rejected').length}</h3></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div><p className="text-gray-600">Loading services...</p></div>
          ) : services.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {service.main_image ? (
                            <img src={service.main_image} alt={service.business_name} className="w-12 h-12 rounded-lg object-cover mr-3" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center mr-3">
                              <span className="text-cyan-600 font-bold text-lg">{service.business_name?.charAt(0) || 'T'}</span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{service.business_name}</div>
                            <div className="flex items-center text-xs text-gray-500 mt-1"><FiMapPin className="w-3 h-3 mr-1" />{service.city}, {service.state}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full">{getSubcategoryName(service.subcategory)}</span></td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-1"><FiPhone className="w-3 h-3" /> {service.contact_no}</div>
                        {service.whatsapp_no && <div className="text-xs text-gray-500 mt-1">WhatsApp: {service.whatsapp_no}</div>}
                      </td>
                      <td className="px-6 py-4"><div className="text-sm text-gray-900 flex items-center gap-1"><FiClock className="w-3 h-3" />{service.open_time} - {service.close_time}</div></td>
                      <td className="px-6 py-4">{getStatusBadge(service.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/tech-services/${service.id}/edit`)} className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg" title="Edit"><FiEdit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(service)} disabled={deletingId === service.id} className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg disabled:opacity-50" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiPlus className="w-8 h-8 text-gray-400" /></div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Services Found</h3>
              <p className="text-gray-500 mb-6">You haven't added any tech industry services yet.</p>
              <button onClick={() => navigate('/tech-services/add')} className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                <div className="flex items-center gap-2"><FiPlus className="w-5 h-5" />Add Your First Service</div>
              </button>
            </div>
          )}
        </div>
        {services.length > 0 && <div className="mt-6 text-sm text-gray-600">Showing <span className="font-semibold">{services.length}</span> services</div>}
      </div>
    </div>
  );
};

export default MyTechIndustryServices;