// src/pages/vendor/Inquiry.tsx
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiMessageSquare,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiEye,
  FiX,
  FiPackage,
  FiRefreshCw,
  FiInbox
} from "react-icons/fi";
import apiClient from "../../api/apiClient";

interface Inquiry {
  id: number;
  inquiry_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_name: string;
  service_category: string;
  sub_category?: string;
  created_at: string;
  preferred_date?: string;
  preferred_time?: string;
  customer_city?: string;
  message?: string;
  subject?: string;
  status?: string;
  is_read?: boolean;
  service_url?: string;
}

const Inquiry = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Fetch inquiries
  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("services/vendor/inquiries/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setInquiries(data);
      setFilteredInquiries(data);
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
      Swal.fire("Error", "Failed to load inquiries.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter inquiries
  useEffect(() => {
    let filtered = [...inquiries];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inq) =>
          inq.customer_name?.toLowerCase().includes(term) ||
          inq.customer_email?.toLowerCase().includes(term) ||
          inq.service_name?.toLowerCase().includes(term) ||
          inq.customer_phone?.includes(term) ||
          inq.subject?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((inq) => inq.status === statusFilter);
    }

    setFilteredInquiries(filtered);
  }, [searchTerm, statusFilter, inquiries]);

  const handleView = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setViewModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            <FiAlertCircle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case "responded":
      case "Responded":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            <FiCheckCircle className="w-3.5 h-3.5" />
            Responded
          </span>
        );
      case "closed":
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            <FiXCircle className="w-3.5 h-3.5" />
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {status || "New"}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Stats
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === "pending" || i.status === "Pending").length,
    responded: inquiries.filter((i) => i.status === "responded" || i.status === "Responded").length,
    closed: inquiries.filter((i) => i.status === "closed" || i.status === "Closed").length,
  };

  // Get unique services for filter
  const getUniqueServices = () => {
    return [...new Set(inquiries.map((inq) => inq.service_name).filter(Boolean))];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Customer Inquiries
            </h1>
            <p className="text-gray-600">
              View all inquiries received for your services and packages
            </p>
          </div>
          <button
            onClick={fetchInquiries}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 shadow-sm font-medium text-sm transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Inquiries</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <FiInbox className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending</p>
                <h3 className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</h3>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <FiAlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Responded</p>
                <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.responded}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FiCheckCircle className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Closed</p>
                <h3 className="text-2xl font-bold text-gray-600 mt-1">{stats.closed}</h3>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <FiXCircle className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer name, email, phone or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-500">Loading inquiries...</p>
            </div>
          ) : filteredInquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Service / Package
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                        !inquiry.is_read ? "bg-blue-50/30" : ""
                      }`}
                      onClick={() => handleView(inquiry)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FiUser className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                              {inquiry.customer_name}
                              {!inquiry.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                              )}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <FiMail className="w-3 h-3" />
                                {inquiry.customer_email}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <FiPhone className="w-3 h-3" />
                                {inquiry.customer_phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800 text-sm">
                          {inquiry.service_name || "—"}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {inquiry.service_category && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              <FiTag className="w-3 h-3" />
                              {inquiry.service_category.replace(/_/g, " ")}
                            </span>
                          )}
                          {inquiry.sub_category && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                              <FiPackage className="w-3 h-3" />
                              {inquiry.sub_category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(inquiry.created_at)}
                        </div>
                        {inquiry.customer_city && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                            <FiMapPin className="w-3 h-3" />
                            {inquiry.customer_city}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(inquiry.status || "pending")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(inquiry);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiInbox className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Inquiries Found
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {searchTerm || statusFilter !== "all"
                  ? "No inquiries match your filters."
                  : "No inquiries received yet for your services."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredInquiries.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
            <span>
              Showing <span className="font-semibold text-gray-700">{filteredInquiries.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{inquiries.length}</span> inquiries
            </span>
            <span className="text-xs text-gray-400">
              Click on any row to view full details
            </span>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {viewModalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiMessageSquare className="w-5 h-5 text-blue-600" />
                Inquiry Details
              </h2>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedInquiry(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Status & Date */}
              <div className="flex items-center justify-between pb-4 border-b">
                {getStatusBadge(selectedInquiry.status || "pending")}
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <FiCalendar className="w-4 h-4" />
                  {formatDate(selectedInquiry.created_at)}
                </span>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{selectedInquiry.customer_name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pl-13">
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <FiMail className="w-3.5 h-3.5" /> Email
                      </p>
                      <p className="text-sm font-medium text-gray-700">{selectedInquiry.customer_email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <FiPhone className="w-3.5 h-3.5" /> Phone
                      </p>
                      <p className="text-sm font-medium text-gray-700">{selectedInquiry.customer_phone || "—"}</p>
                    </div>
                    {selectedInquiry.customer_city && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <FiMapPin className="w-3.5 h-3.5" /> City
                        </p>
                        <p className="text-sm font-medium text-gray-700">{selectedInquiry.customer_city}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Service / Package
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FiPackage className="w-5 h-5 text-blue-600" />
                    <p className="font-semibold text-gray-800 text-lg">
                      {selectedInquiry.service_name || "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedInquiry.service_category && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        <FiTag className="w-3.5 h-3.5" />
                        {selectedInquiry.service_category.replace(/_/g, " ")}
                      </span>
                    )}
                    {selectedInquiry.sub_category && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                        <FiPackage className="w-3.5 h-3.5" />
                        {selectedInquiry.sub_category}
                      </span>
                    )}
                  </div>
                  {selectedInquiry.service_url && (
                    <a
                      href={selectedInquiry.service_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline inline-flex items-center gap-1"
                    >
                      View Service Page →
                    </a>
                  )}
                </div>
              </div>

              {/* Subject & Message */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Message
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  {selectedInquiry.subject && (
                    <p className="font-semibold text-gray-800 mb-2">{selectedInquiry.subject}</p>
                  )}
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message || "No message provided."}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedInquiry(null);
                }}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiry;