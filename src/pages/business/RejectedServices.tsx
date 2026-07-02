import { useEffect, useState, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import DataTable from "../../components/common/DataTable";
import apiClient from "../../api/apiClient"; // axios or your API wrapper

interface PendingService {
  id: number;
  serviceId: string;
  serviceName: string;
  category: string;
  subCategory: string;
  price: number;
  description: string;
  submissionDate: string;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  remarks?: string;
  status: boolean;
}

const generateServiceId = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `SRV-${random}`;
};

const validationSchema = Yup.object({
  serviceName: Yup.string().required("Service Name is required"),
  category: Yup.string().required("Category is required"),
  price: Yup.number().min(1).required("Price is required"),
  description: Yup.string().required("Description is required"),
});

const RejectedServices = () => {
  const [services, setServices] = useState<PendingService[]>([]);
  const [editingService, setEditingService] = useState<PendingService | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pending services from API
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("all-services/"); // your API endpoint
      // Map API response to PendingService
      const pendingServices = response.data
        .filter((s: any) => s.status === "rejected")
        .map((s: any) => ({
          id: s.id,
          business_name: s.business_name,
          category: s.category,
          subcategory_name: s.subcategory_name,
          status: s.status,
          description: s.description,
        }));
      setServices(pendingServices);
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

  const serviceId = useMemo(() => {
    return editingService?.serviceId || generateServiceId();
  }, [editingService]);

  const formik = useFormik({
    initialValues: {
      serviceId,
      serviceName: editingService?.serviceName || "",
      category: editingService?.category || "",
      subCategory: editingService?.subCategory || "",
      price: editingService?.price || 0,
      description: editingService?.description || "",
      submissionDate:
        editingService?.submissionDate ||
        new Date().toISOString().split("T")[0],
      approvalStatus: "Pending",
      remarks: editingService?.remarks || "",
      status: editingService?.status ?? true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        if (editingService) {
          // Update existing service
          const response = await apiClient.put(
            `pending-services/${editingService.id}/`,
            values
          );
          setServices((prev) =>
            prev.map((s) => (s.id === editingService.id ? response.data : s))
          );
          Swal.fire(
            "Success",
            `"${values.serviceName}" updated successfully!`,
            "success"
          );
        } else {
          // Add new service
          const response = await apiClient.post("pending-services/", values);
          setServices((prev) => [response.data, ...prev]);
          Swal.fire(
            "Success",
            `"${values.serviceName}" submitted for approval!`,
            "success"
          );
        }
      } catch (error) {
        console.error("Save error:", error);
        Swal.fire("Error", "Failed to save service", "error");
      } finally {
        setModalOpen(false);
        formik.resetForm();
        setEditingService(null);
        setIsLoading(false);
      }
    },
  });

  const handleAdd = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const handleEdit = (service: PendingService) => {
    setEditingService(service);
    setModalOpen(true);
  };

  const handleDelete = async (service: PendingService) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${service.serviceName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        await apiClient.delete(`pending-services/${service.id}/`);
        setServices((prev) => prev.filter((s) => s.id !== service.id));
        Swal.fire(
          "Deleted!",
          `"${service.serviceName}" has been deleted.`,
          "success"
        );
      } catch (error) {
        Swal.fire("Error", "Failed to delete service", "error");
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 min-h-screen">
      <DataTable
        title="Pending Approval Services"
        data={services}
        columns={[
          { key: "subcategory_name", label: "Subcategory" },
          { key: "business_name", label: "Business Name" },
          // { key: "category", label: "Category" },
          // { key: "price", label: "Price", render: (item) => `₹${item.price}` },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <span className="px-2 py-1 rounded font-semibold bg-yellow-100 text-yellow-800">
                {item.status}
              </span>
            ),
          },
        ]}
        onAdd={handleAdd}
        //onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Service"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 relative"
            style={{ maxHeight: "80dvh", overflowY: "auto" }}
          >
            <h2 className="text-xl font-bold mb-6">
              {editingService ? "Edit Service" : "Add Service"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              {/* Form fields remain same as before */}
              {/* ... */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectedServices;