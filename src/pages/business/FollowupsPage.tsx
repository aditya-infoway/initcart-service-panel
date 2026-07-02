import  { useState, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable";

interface Followup {
  id: number;
  followupId: string;
  inquiryId: string;
  customerName: string;
  followupDate: string;
  followupType: "Call" | "Email" | "Visit";
  followupNotes: string;
  nextFollowupDate?: string;
  status: "Pending" | "Completed" | "Cancelled";
  handledBy: string;
}

const generateFollowupId = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `FUP-${random}`;
};

const validationSchema = Yup.object({
  inquiryId: Yup.string().required("Inquiry ID is required"),
  followupDate: Yup.string().required("Follow-up Date is required"),
  followupType: Yup.string().required("Follow-up Type is required"),
  followupNotes: Yup.string().required("Follow-up Notes are required"),
  status: Yup.string().required("Status is required"),
});

const FollowupsPage = () => {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const followupId = useMemo(() => editingFollowup?.followupId || generateFollowupId(), [editingFollowup]);

  const formik = useFormik({
    initialValues: {
      followupId,
      inquiryId: editingFollowup?.inquiryId || "",
      customerName: editingFollowup?.customerName || "Auto fetched",
      followupDate: editingFollowup?.followupDate || new Date().toISOString().split("T")[0],
      followupType: editingFollowup?.followupType || "Call",
      followupNotes: editingFollowup?.followupNotes || "",
      nextFollowupDate: editingFollowup?.nextFollowupDate || "",
      status: editingFollowup?.status || "Pending",
      handledBy: editingFollowup?.handledBy || "Vendor Name",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      setIsLoading(true);
      const newFollowup: Followup = {
        id: editingFollowup ? editingFollowup.id : followups.length + 1,
        ...values,
      };

      if (editingFollowup) {
        setFollowups(followups.map(f => f.id === editingFollowup.id ? newFollowup : f));
        Swal.fire({ icon: "success", title: "Follow-up Updated", text: `"${values.inquiryId}" updated!`, timer: 2000, showConfirmButton: false });
      } else {
        setFollowups([newFollowup, ...followups]);
        Swal.fire({ icon: "success", title: "Follow-up Added", text: `"${values.inquiryId}" added!`, timer: 2000, showConfirmButton: false });
      }

      setModalOpen(false);
      setEditingFollowup(null);
      formik.resetForm();
      setIsLoading(false);
    },
  });

  const handleAdd = () => {
    setEditingFollowup(null);
    setModalOpen(true);
  };

  const handleEdit = (followup: Followup) => {
    setEditingFollowup(followup);
    setModalOpen(true);
  };

  const handleDelete = (followup: Followup) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete follow-up "${followup.followupId}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(res => {
      if (res.isConfirmed) {
        setFollowups(followups.filter(f => f.id !== followup.id));
        Swal.fire("Deleted!", "Follow-up deleted.", "success");
      }
    });
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 min-h-screen">
      <DataTable
        title="Follow-ups List"
        data={followups}
        columns={[
          { key: "followupId", label: "Follow-up ID" },
          { key: "inquiryId", label: "Inquiry ID" },
          { key: "customerName", label: "Customer Name" },
          { key: "followupDate", label: "Follow-up Date" },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <span className={`px-2 py-1 rounded font-semibold ${
                item.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                item.status === "Completed" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              }`}>
                {item.status}
              </span>
            ),
          },
        ]}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Follow-up"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative" style={{ maxHeight: "80dvh", overflowY: "auto" }}>
            <h2 className="text-xl font-bold mb-6">{editingFollowup ? "Edit Follow-up" : "Add Follow-up"}</h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              {/* Follow-up ID */}
              <div>
                <label className="block mb-1 font-medium">Follow-up ID</label>
                <input type="text" value={formik.values.followupId} disabled className="customInput bg-gray-100" placeholder="Auto-generated" />
              </div>

              {/* Inquiry ID */}
              <div>
                <label className="block mb-1 font-medium">Inquiry ID</label>
                <input type="text" name="inquiryId" value={formik.values.inquiryId} onChange={formik.handleChange} placeholder="Enter Inquiry ID" className={`customInput ${formik.touched.inquiryId && formik.errors.inquiryId ? "customInputError" : ""}`} />
                {formik.touched.inquiryId && formik.errors.inquiryId && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.inquiryId}</div>
                )}
              </div>

              {/* Customer Name */}
              <div>
                <label className="block mb-1 font-medium">Customer Name</label>
                <input type="text" name="customerName" value={formik.values.customerName} disabled className="customInput bg-gray-100" />
              </div>

              {/* Follow-up Date */}
              <div>
                <label className="block mb-1 font-medium">Follow-up Date</label>
                <input type="date" name="followupDate" value={formik.values.followupDate} onChange={formik.handleChange} className={`customInput ${formik.touched.followupDate && formik.errors.followupDate ? "customInputError" : ""}`} />
                {formik.touched.followupDate && formik.errors.followupDate && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.followupDate}</div>
                )}
              </div>

              {/* Follow-up Type */}
              <div>
                <label className="block mb-1 font-medium">Follow-up Type</label>
                <select name="followupType" value={formik.values.followupType} onChange={formik.handleChange} className={`customInput ${formik.touched.followupType && formik.errors.followupType ? "customInputError" : ""}`}>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Visit">Visit</option>
                </select>
                {formik.touched.followupType && formik.errors.followupType && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.followupType}</div>
                )}
              </div>

              {/* Follow-up Notes */}
              <div>
                <label className="block mb-1 font-medium">Follow-up Notes</label>
                <textarea name="followupNotes" value={formik.values.followupNotes} onChange={formik.handleChange} rows={3} placeholder="Enter follow-up notes" className={`customInput ${formik.touched.followupNotes && formik.errors.followupNotes ? "customInputError" : ""}`} />
                {formik.touched.followupNotes && formik.errors.followupNotes && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.followupNotes}</div>
                )}
              </div>

              {/* Next Follow-up Date */}
              <div>
                <label className="block mb-1 font-medium">Next Follow-up Date</label>
                <input type="date" name="nextFollowupDate" value={formik.values.nextFollowupDate} onChange={formik.handleChange} className="customInput" placeholder="Optional" />
              </div>

              {/* Status */}
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select name="status" value={formik.values.status} onChange={formik.handleChange} className={`customInput ${formik.touched.status && formik.errors.status ? "customInputError" : ""}`}>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.status}</div>
                )}
              </div>

              {/* Handled By */}
              <div>
                <label className="block mb-1 font-medium">Handled By</label>
                <input type="text" name="handledBy" value={formik.values.handledBy} disabled className="customInput bg-gray-100" />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-400 cursor-pointer">
                  {editingFollowup ? "Update Follow-up" : "Add Follow-up"}
                </button>
              </div>
            </form>

            <button onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-2xl text-gray-500 hover:text-gray-700 cursor-pointer">&times;</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowupsPage;
