import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../../components/common/DataTable";
import CommonFields from "../../../components/common/CommonFields";

interface WorkPlaceService {
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
  
  // Work Place Specific
  workspaceType?: string;
  seatingCapacity?: number;
  amenities?: string[];
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
  workspaceType: Yup.string().required("Workspace Type is required"),
  seatingCapacity: Yup.number().required("Seating Capacity is required"),
  amenities: Yup.array().min(1, "At least one amenity must be selected").required("Amenities are required"),
});

const MyWorkPlaceServicesPage = () => {
  const [services, setServices] = useState<WorkPlaceService[]>([]);
  const [editingService, setEditingService] = useState<WorkPlaceService | null>(null);
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
      workspaceType: editingService?.workspaceType || "",
      seatingCapacity: editingService?.seatingCapacity || undefined,
      amenities: editingService?.amenities || [],
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
        const newService: WorkPlaceService = {
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

  const renderError = (field: keyof typeof formik.errors) =>
    formik.touched[field] && formik.errors[field] ? (
      <div className="text-red-500 text-sm mt-1">{formik.errors[field]}</div>
    ) : null;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 min-h-screen">
      <DataTable
        title="My Work Place Services"
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
        addButtonLabel="Add Work Place Service"
      />

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080] px-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[85vh]">
            <h2 className="text-xl font-bold mb-6">
              {editingService ? "Edit Work Place Service" : "Add Work Place Service"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
              {/* Common fields */}
              <CommonFields formik={formik} />

              {/* Work Place Specific */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-3">
                  Work Place Specific Fields
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Workspace Type */}
                  <div>
                    <label className="block mb-1 font-medium">Workspace Type</label>
                    <select
                      name="workspaceType"
                      value={formik.values.workspaceType || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`customInput ${
                        formik.touched.workspaceType && formik.errors.workspaceType ? "customInputError" : ""
                      }`}
                    >
                      <option value="">Select</option>
                      {["Co-Working", "Office Space"].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {renderError("workspaceType")}
                  </div>

                  {/* Seating Capacity */}
                  <div>
                    <label className="block mb-1 font-medium">Seating Capacity</label>
                    <input
                      type="number"
                      name="seatingCapacity"
                      value={formik.values.seatingCapacity || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`customInput ${
                        formik.touched.seatingCapacity && formik.errors.seatingCapacity ? "customInputError" : ""
                      }`}
                      placeholder="Enter seating capacity"
                    />
                    {renderError("seatingCapacity")}
                  </div>

                  {/* Amenities */}
                  <div className="md:col-span-2">
                    <label className="block mb-2 font-semibold text-gray-700">Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {["Wi-Fi", "AC", "Conference Room", "Cafeteria"].map((amenity) => {
                        const checked = formik.values.amenities?.includes(amenity);
                        return (
                          <label
                            key={amenity}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              checked ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                            }`}
                          >
                            <input
                              type="checkbox"
                              value={amenity}
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  formik.setFieldValue("amenities", [
                                    ...(formik.values.amenities || []),
                                    amenity,
                                  ]);
                                } else {
                                  formik.setFieldValue(
                                    "amenities",
                                    formik.values.amenities?.filter((x) => x !== amenity)
                                  );
                                }
                              }}
                              className="w-5 h-5 accent-blue-600"
                            />
                            <span>{amenity}</span>
                          </label>
                        );
                      })}
                    </div>
                    {renderError("amenities")}
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

export default MyWorkPlaceServicesPage;