// src/pages/vendor/education/MyEducationServices.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiPlus, FiEdit, FiTrash2, FiRefreshCw, FiMapPin, FiPhone,
  FiCheck, FiAlertCircle, FiX, FiMail, FiMessageCircle, FiImage,
  FiClock, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiSearch
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import apiClient from "../../../api/apiClient";

interface EducationService {
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
}

const MyEducationServices: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<EducationService[]>([]);
  const [filteredServices, setFilteredServices] = useState<EducationService[]>([]);
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
      const response = await apiClient.get("/education-services/");
      const servicesData = Array.isArray(response.data) ? response.data : response.data.results || [];
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

  const handleDelete = async (service: EducationService) => {
    const result = await Swal.fire({
      title: "Delete Service?",
      html: `<p>Are you sure you want to delete <strong>${service.business_name}</strong>?</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
    });

    if (result.isConfirmed) {
      try {
        setDeletingId(service.id);
        await apiClient.delete(`/education-services/${service.id}/`);
        setServices(prev => prev.filter(s => s.id !== service.id));
        Swal.fire("Deleted!", "Service has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete service.", "error");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><FiCheck className="w-3 h-3" /> Approved</span>;
      case 'pending': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1"><FiAlertCircle className="w-3 h-3" /> Pending</span>;
      case 'rejected': return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1"><FiX className="w-3 h-3" /> Rejected</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{status || 'Unknown'}</span>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">Education Services</h1>
            <p className="text-slate-500">Manage your educational institute listings</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/myeducationservices/add')} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200 transition-all font-medium">
              <FiPlus className="w-5 h-5" /> Add New Institute
            </button>
            <button onClick={fetchServices} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50">
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Institutes', value: services.length, icon: <FaGraduationCap className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-100' },
            { label: 'Approved', value: services.filter(s => s.status === 'approved').length, icon: <FiCheck className="w-6 h-6 text-green-600" />, bg: 'bg-green-100' },
            { label: 'Pending', value: services.filter(s => s.status === 'pending').length, icon: <FiClock className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-100' },
            { label: 'Rejected', value: services.filter(s => s.status === 'rejected').length, icon: <FiX className="w-6 h-6 text-red-600" />, bg: 'bg-red-100' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-slate-500 mb-1">{stat.label}</p><h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3></div>
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by institute name, category, address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
              {(['card', 'table'] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${viewMode === mode ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}>
                  {mode === 'card' ? <FiGrid /> : <FiList />} <span className="text-sm font-medium capitalize">{mode} View</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div><p>Loading services...</p></div>
        ) : filteredServices.length > 0 ? (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentItems.map((service) => (
                  <div key={service.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all">
                    <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-100 overflow-hidden cursor-pointer" onClick={() => { if (service.main_image) { const allImages = service.multi_images || []; setSelectedImageList([service.main_image!, ...allImages.map(i => i.image)]); setViewImage(service.main_image!); } }}>
                      {service.main_image ? <img src={service.main_image} alt={service.business_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FaGraduationCap className="w-16 h-16 text-purple-300" /></div>}
                      <div className="absolute top-3 right-3">{getStatusBadge(service.status)}</div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{service.business_name}</h3>
                      <p className="text-sm text-purple-600 font-medium mb-2">{service.subcategory_name}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2"><FiMapPin className="w-4 h-4" /><span>{service.city && service.state ? `${service.city}, ${service.state}` : service.address}</span></div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4"><FiPhone className="w-4 h-4" /><span>{service.contact_no}</span></div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/myeducationservices/${service.id}/edit`)} className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 text-sm font-medium">Edit</button>
                        <button onClick={() => handleDelete(service)} disabled={deletingId === service.id} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 text-sm font-medium">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50"><tr>{['Institute', 'Category', 'Location', 'Contact', 'Status', 'Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody>{currentItems.map(service => (
                    <tr key={service.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><FaGraduationCap className="w-5 h-5 text-purple-600" /></div><div><div className="text-sm font-medium">{service.business_name}</div></div></div></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg">{service.subcategory_name}</span></td>
                      <td className="px-6 py-4 text-sm">{service.city && service.state ? `${service.city}, ${service.state}` : 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">{service.contact_no}</td>
                      <td className="px-6 py-4">{getStatusBadge(service.status)}</td>
                      <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => navigate(`/myeducationservices/${service.id}/edit`)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"><FiEdit /></button><button onClick={() => handleDelete(service)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 /></button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 border rounded-lg disabled:opacity-50"><FiChevronLeft /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => <button key={num} onClick={() => setCurrentPage(num)} className={`px-3 py-1 rounded-lg ${currentPage === num ? 'bg-purple-600 text-white' : 'hover:bg-slate-100'}`}>{num}</button>)}
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 border rounded-lg disabled:opacity-50"><FiChevronRight /></button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center"><div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><FaGraduationCap className="w-10 h-10 text-purple-400" /></div><h3 className="text-xl font-semibold mb-2">No Institutes Found</h3><button onClick={() => navigate('/myeducationservices/add')} className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl">Add Your First Institute</button></div>
        )}

        {viewImage && <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setViewImage(null)}><img src={viewImage} alt="Full size" className="max-w-full max-h-[90vh] object-contain" /></div>}
      </div>
    </div>
  );
};

export default MyEducationServices;