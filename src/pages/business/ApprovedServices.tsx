import { useEffect, useState, useMemo } from "react";
import DataTable from "../../components/common/DataTable";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import apiClient from "../../api/apiClient"; // your axios or API wrapper

interface Service {
  id: number;
  serviceId: string;
  serviceName: string;
  business_name: string;
  category: string;
  subcategory_name?: string;
  price: number;
  description: string;
  added_date: string;
  approved_date: string;
  approved_by: string;
  status: "Approved" | "Pending";
  rating: number;
  total_bookings: number;
}

const ApprovedServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("all-services/");
      console.log("API data:", response.data); // check data structure
      setServices(response.data); // adjust if API wraps array in 'results'
    } catch (error) {
      console.error("Error fetching services:", error);
      Swal.fire("Error", "Failed to load services", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Generate service ID
  const generateServiceId = () => `SRV-${Math.floor(10000 + Math.random() * 90000)}`;

  const serviceId = useMemo(() => editingService?.serviceId || generateServiceId(), [editingService]);

  const handleAdd = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Service) => {
    setEditingService(item);
    setModalOpen(true);
  };

  const handleDelete = async (item: Service) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.serviceName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`all-services/${item.id}/`);
        setServices((prev) => prev.filter((s) => s.id !== item.id));
        Swal.fire("Deleted!", `"${item.serviceName}" has been deleted.`, "success");
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error", "Failed to delete service", "error");
      }
    }
  };

  // Formik validation
  const validationSchema = Yup.object({
    serviceName: Yup.string().required("Service name is required"),
    category: Yup.string().required("Category is required"),
    price: Yup.number().min(1, "Price must be at least 1").required("Price is required"),
    description: Yup.string().required("Description is required"),
    subcategory_name: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      serviceId,
      serviceName: editingService?.serviceName || "",
      category: editingService?.category || "",
      subcategory_name: editingService?.subcategory_name || "",
      price: editingService?.price || 0,
      description: editingService?.description || "",
      added_date: editingService?.added_date || new Date().toISOString().split("T")[0],
      approved_date: editingService?.approved_date || new Date().toISOString().split("T")[0],
      approved_by: editingService?.approved_by || "Super Admin",
      status: editingService?.status || "Approved",
      rating: editingService?.rating || 0,
      total_bookings: editingService?.total_bookings || 0,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        if (editingService) {
          const response = await apiClient.put(`gym-services/${editingService.id}/`, values);
          setServices((prev) =>
            prev.map((s) => (s.id === editingService.id ? response.data : s))
          );
          Swal.fire("Success", `"${values.serviceName}" updated successfully!`, "success");
        } else {
          const response = await apiClient.post("gym-services/", values);
          setServices((prev) => [response.data, ...prev]);
          Swal.fire("Success", `"${values.serviceName}" added successfully!`, "success");
        }
      } catch (error) {
        console.error("Save error:", error);
        Swal.fire("Error", "Failed to save service", "error");
      } finally {
        setModalOpen(false);
        formik.resetForm();
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100">
      <DataTable
        title="Approved Services"
        data={services.filter((s) => s.status?.toLowerCase() === "approved")}
        columns={[
          { key: "business_name", label: "Business Name" },
          { key: "subcategory_name", label: "SubCategory" },
          { key: "status", label: "Status" },
          { key: "total_bookings", label: "Total Bookings" },
          { key: "approved_date", label: "Approved Date" },
          { key: "approved_by", label: "Approved By" },
        ]}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Service"
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
            style={{ maxHeight: "80dvh", overflowY: "auto" }}
          >
            <h2 className="text-xl font-bold mb-7">
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              {/* Service ID */}
              <div>
                <label className="block mb-1 font-medium">Service ID</label>
                <input type="text" value={formik.values.serviceId} disabled className="customInput bg-gray-100" />
              </div>

              {/* Service Name */}
              <div>
                <label className="block mb-1 font-medium">Service Name</label>
                <input
                  type="text"
                  name="serviceName"
                  value={formik.values.serviceName}
                  onChange={formik.handleChange}
                  placeholder="Enter service name"
                  className={`customInput ${formik.touched.serviceName && formik.errors.serviceName ? "customInputError" : ""}`}
                />
                {formik.touched.serviceName && formik.errors.serviceName && (
                  <div className="text-red-500 text-sm mt-1 ms-2">{formik.errors.serviceName}</div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block mb-1 font-medium">Category</label>
                <input type="text" name="category" value={formik.values.category} onChange={formik.handleChange} placeholder="Enter category" className="customInput" />
              </div>

              {/* SubCategory */}
              <div>
                <label className="block mb-1 font-medium">Sub Category</label>
                <input type="text" name="subcategory_name" value={formik.values.subcategory_name} onChange={formik.handleChange} placeholder="Optional" className="customInput" />
              </div>

              {/* Price */}
              <div>
                <label className="block mb-1 font-medium">Price (₹)</label>
                <input type="number" name="price" value={formik.values.price} onChange={formik.handleChange} className="customInput" />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea name="description" value={formik.values.description} onChange={formik.handleChange} className="customInput h-24" />
              </div>

              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium">Added Date</label>
                  <input type="date" value={formik.values.added_date} disabled className="customInput bg-gray-100" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Approved Date</label>
                  <input type="date" value={formik.values.approved_date} disabled className="customInput bg-gray-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium">Approved By</label>
                  <input type="text" value={formik.values.approved_by} disabled className="customInput bg-gray-100" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Status</label>
                  <input type="text" value={formik.values.status} disabled className="customInput bg-gray-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium">Rating</label>
                  <input type="number" value={formik.values.rating} disabled className="customInput bg-gray-100" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Total Bookings</label>
                  <input type="number" value={formik.values.total_bookings} disabled className="customInput bg-gray-100" />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-400">
                  {editingService ? "Update Service" : "Add Service"}
                </button>
              </div>
            </form>

            <button onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl">&times;</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedServices;