import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";
import CommonFields from "../../../components/common/CommonFields";

interface HotelRestaurantService {
  id: number;
  serviceName: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  offer?: number;
  gst: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  videoUrl?: string;
  timings: string;
  terms: string;
  activeStatus: "Active" | "Inactive";
  
  // Hotel & Restaurant Specific
  menuUpload?: string;
  cuisineType?: string;
  tableBookingAvailable?: boolean;
  homeDelivery?: boolean;
}

const validationSchema = Yup.object({
  serviceName: Yup.string().required("Service Name is required"),
  shortDescription: Yup.string().required("Short Description is required"),
  fullDescription: Yup.string().required("Full Description is required"),
  price: Yup.number().required("Price is required"),
  gst: Yup.string().required("GST is required"),
  contactPerson: Yup.string().required("Contact Person is required"),
  contactNumber: Yup.string().required("Contact Number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: Yup.string().required("Pincode is required"),
  timings: Yup.string().required("Timings required"),
  terms: Yup.string().required("Terms required"),
  cuisineType: Yup.string().required("Cuisine Type is required"),
});

const MyHotelRestaurantServicesPage = () => {
  const [services, setServices] = useState<HotelRestaurantService[]>([]);
  const [editingService, setEditingService] = useState<HotelRestaurantService | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      serviceName: editingService?.serviceName || "",
      shortDescription: editingService?.shortDescription || "",
      fullDescription: editingService?.fullDescription || "",
      price: editingService?.price || 0,
      offer: editingService?.offer || undefined,
      gst: editingService?.gst || "18%",
      contactPerson: editingService?.contactPerson || "",
      contactNumber: editingService?.contactNumber || "",
      email: editingService?.email || "",
      address: editingService?.address || "",
      city: editingService?.city || "",
      state: editingService?.state || "",
      pincode: editingService?.pincode || "",
      videoUrl: editingService?.videoUrl || "",
      timings: editingService?.timings || "",
      terms: editingService?.terms || "",
      activeStatus: editingService?.activeStatus || "Active",
      menuUpload: editingService?.menuUpload || "",
      cuisineType: editingService?.cuisineType || "",
      tableBookingAvailable: editingService?.tableBookingAvailable || false,
      homeDelivery: editingService?.homeDelivery || false,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      setIsLoading(true);

      if (editingService) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingService.id ? { ...editingService, ...values } : s
          )
        );
        Swal.fire("Updated!", `"${values.serviceName}" updated successfully!`, "success");
      } else {
        const newService: HotelRestaurantService = {
          id: services.length + 1,
          ...values,
        };
        setServices([newService, ...services]);
        Swal.fire("Added!", `"${values.serviceName}" added successfully!`, "success");
      }

      setModalOpen(false);
      setEditingService(null);
      formik.resetForm();
      setIsLoading(false);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For simplicity, store file name; in a real app, handle file upload to a server
      formik.setFieldValue("menuUpload", file.name);
    }
  };

  const renderError = (field: keyof typeof formik.errors) =>
    formik.touched[field] && formik.errors[field] ? (
      <div className="text-red-500 text-sm mt-1">{formik.errors[field]}</div>
    ) : null;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 min-h-screen">
      <DataTable
        title="My Hotel & Restaurant Services"
        data={services}
        columns={[
          { key: "serviceName", label: "Service Name" },
          { key: "city", label: "City" },
          { key: "price", label: "Price" },
          {
            key: "activeStatus",
            label: "Status",
            render: (item) => (
              <span
                className={`px-2 py-1 rounded font-semibold ${
                  item.activeStatus === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.activeStatus}
              </span>
            ),
          },
        ]}
        onAdd={() => {
          setEditingService(null);
          setModalOpen(true);
        }}
        onEdit={(service) => {
          setEditingService(service);
          setModalOpen(true);
        }}
        onDelete={(service) => {
          Swal.fire({
            title: "Are you sure?",
            text: `Delete "${service.serviceName}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
          }).then((res) => {
            if (res.isConfirmed) {
              setServices(services.filter((s) => s.id !== service.id));
              Swal.fire("Deleted!", "Service deleted successfully.", "success");
            }
          });
        }}
        addButtonLabel="Add Hotel & Restaurant Service"
      />

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080] px-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[85vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingService ? "Edit Hotel & Restaurant Service" : "Add Hotel & Restaurant Service"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
              {/* Common fields */}
              <CommonFields formik={formik} />

              {/* Hotel & Restaurant Specific */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-3">
                  Hotel & Restaurant Specific Fields
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Menu Upload */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">Menu Upload</label>
                    <input
                      type="file"
                      name="menuUpload"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className={`customInput ${
                        formik.touched.menuUpload && formik.errors.menuUpload ? "customInputError" : ""
                      }`}
                    />
                    {formik.values.menuUpload && (
                      <span className="text-sm text-gray-600">Uploaded: {formik.values.menuUpload}</span>
                    )}
                    {renderError("menuUpload")}
                  </div>

                  {/* Cuisine Type */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">Cuisine Type</label>
                    <select
                      name="cuisineType"
                      value={formik.values.cuisineType || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`customInput ${
                        formik.touched.cuisineType && formik.errors.cuisineType ? "customInputError" : ""
                      }`}
                    >
                      <option value="">Select</option>
                      {["Indian", "Chinese", "Italian", "Continental"].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {renderError("cuisineType")}
                  </div>

                  {/* Table Booking Available */}
                  <div>
                    <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        name="tableBookingAvailable"
                        checked={formik.values.tableBookingAvailable || false}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-5 h-5 accent-blue-600"
                      />
                      <span>Table Booking Available</span>
                    </label>
                  </div>

                  {/* Home Delivery */}
                  <div>
                    <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        name="homeDelivery"
                        checked={formik.values.homeDelivery || false}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-5 h-5 accent-blue-600"
                      />
                      <span>Home Delivery</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>

            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHotelRestaurantServicesPage;