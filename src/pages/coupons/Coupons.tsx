import { useState } from "react";
import DataTable from "../../components/common/DataTable";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";

interface Coupon {
  id: number;
  type: "Discount" | "FreeDelivery";
  title: string;
  code: string;
  customerType: "All" | number;
  limitPerUser: number;
  discountType: "Amount" | "Percentage";
  discountAmount: number;
  minimumPurchase: number;
  startDate: string;
  expireDate: string;
  status: "Active" | "Inactive";
}

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 1,
      type: "Discount",
      title: "Summer Sale",
      code: "SUMMER25",
      customerType: "All",
      limitPerUser: 1,
      discountType: "Percentage",
      discountAmount: 25,
      minimumPurchase: 100,
      startDate: "2025-06-01",
      expireDate: "2025-08-31",
      status: "Active",
    },
    {
      id: 2,
      type: "FreeDelivery",
      title: "Free Shipping",
      code: "FREESHIP",
      customerType: "All",
      limitPerUser: 2,
      discountType: "Amount",
      discountAmount: 0,
      minimumPurchase: 50,
      startDate: "2025-01-01",
      expireDate: "2025-12-31",
      status: "Active",
    },
  ]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock user list for dropdown
  const users = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Bob Johnson" },
  ];

  const generateCouponCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleAdd = () => {
    setEditingCoupon(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Coupon) => {
    setEditingCoupon(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Coupon) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setCoupons(coupons.filter((c) => c.id !== item.id));
        Swal.fire("Deleted!", `"${item.title}" has been deleted.`, "success");
      }
    });
  };

  const handleToggleStatus = (id: number) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" }
          : c
      )
    );
  };

  // Formik validation schema
  const validationSchema = Yup.object({
    type: Yup.string().required("Coupon type is required"),
    title: Yup.string().required("Coupon title is required"),
    code: Yup.string().required("Coupon code is required"),
    customerType: Yup.mixed().required("Customer selection is required"),
    limitPerUser: Yup.number()
      .min(1, "Limit must be at least 1")
      .required("Limit is required"),
    discountType: Yup.string().required("Discount type is required"),
    discountAmount: Yup.number()
      .min(0, "Discount amount cannot be negative")
      .required("Discount amount is required"),
    minimumPurchase: Yup.number()
      .min(0, "Minimum purchase cannot be negative")
      .required("Minimum purchase is required"),
    startDate: Yup.date().required("Start date is required"),
    expireDate: Yup.date()
      .required("Expire date is required")
      .min(Yup.ref("startDate"), "Expire date must be after start date"),
  });

  const formik = useFormik({
    initialValues: {
      type: editingCoupon?.type || "Discount",
      title: editingCoupon?.title || "",
      code: editingCoupon?.code || "",
      customerType: editingCoupon?.customerType || "All",
      limitPerUser: editingCoupon?.limitPerUser || 1,
      discountType: editingCoupon?.discountType || "Amount",
      discountAmount: editingCoupon?.discountAmount || 0,
      minimumPurchase: editingCoupon?.minimumPurchase || 0,
      startDate: editingCoupon?.startDate || "",
      expireDate: editingCoupon?.expireDate || "",
      status: editingCoupon ? editingCoupon.status === "Active" : true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      setIsLoading(true);
      const newCoupon: Coupon = {
        id: editingCoupon ? editingCoupon.id : coupons.length + 1,
        type: values.type as "Discount" | "FreeDelivery",
        title: values.title,
        code: values.code,
        customerType: values.customerType,
        limitPerUser: values.limitPerUser,
        discountType: values.discountType as "Amount" | "Percentage",
        discountAmount: values.discountAmount,
        minimumPurchase: values.minimumPurchase,
        startDate: values.startDate,
        expireDate: values.expireDate,
        status: values.status ? "Active" : "Inactive",
      };

      if (editingCoupon) {
        setCoupons(
          coupons.map((c) => (c.id === editingCoupon.id ? newCoupon : c))
        );
        Swal.fire({
          icon: "success",
          title: "Coupon Updated",
          text: `"${values.title}" has been updated successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        setCoupons([newCoupon, ...coupons]);
        Swal.fire({
          icon: "success",
          title: "Coupon Added",
          text: `"${values.title}" has been added successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setModalOpen(false);
      formik.resetForm();
      setIsLoading(false);
    },
  });

  return (
    <div className=" bg-gradient-to-b from-gray-50 to-gray-100">
      <DataTable
        title="Coupons"
        data={coupons}
        columns={[
          {
            key: "title",
            label: "Coupon Title",

            render: (item) => (
              <div className="flex flex-col">
                <div className="text-[16px]">{item.title}</div>
                <div className="font-bold text-[16px]">Code : {item.code}</div>
              </div>
            ),
          },
          { key: "type", label: "Type" },
          {
            key: "customerType",
            label: "Customer",
            render: (item) =>
              item.customerType === "All"
                ? "All Customers"
                : users.find((u) => u.id === item.customerType)?.name ||
                  "Unknown",
          },
          { key: "discountType", label: "Discount Type" },
          { key: "discountAmount", label: "Discount Amount" },
          { key: "minimumPurchase", label: "Min. Purchase" },
          { key: "startDate", label: "Start Date" },
          { key: "expireDate", label: "Expire Date" },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold ${
                    item.status === "Active" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ),
          },
        ]}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Coupon"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
            style={{ maxHeight: "80dvh", overflowY: "auto" }}
          >
            <h2 className="text-xl font-bold mb-7">
              {editingCoupon ? "Edit Coupon" : "Add Coupon"}
            </h2>
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="mb-2">
                <label className="block mb-1 font-medium">Coupon Type</label>
                <select
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.type && formik.errors.type
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="Discount">Discount on Purchase</option>
                  <option value="FreeDelivery">Free Delivery</option>
                </select>
                {formik.touched.type && formik.errors.type && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.type}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Coupon Title</label>
                <input
                  type="text"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  placeholder="Enter coupon title"
                  className={`customInput ${
                    formik.touched.title && formik.errors.title
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.title && formik.errors.title && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.title}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <label className="block mb-1 font-medium">Coupon Code</label>
                  <button
                    type="button"
                    onClick={() =>
                      formik.setFieldValue("code", generateCouponCode())
                    }
                    className="text-blue-600 text-sm hover:underline cursor-pointer"
                  >
                    Generate Code
                  </button>
                </div>
                <input
                  type="text"
                  name="code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  placeholder="Enter coupon code"
                  className={`customInput ${
                    formik.touched.code && formik.errors.code
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.code && formik.errors.code && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.code}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Customer</label>
                <select
                  name="customerType"
                  value={formik.values.customerType}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.customerType && formik.errors.customerType
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="All">All Customers</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                {formik.touched.customerType && formik.errors.customerType && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.customerType}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Limit for Same User
                </label>
                <input
                  type="number"
                  name="limitPerUser"
                  value={formik.values.limitPerUser}
                  onChange={formik.handleChange}
                  placeholder="Enter limit"
                  className={`customInput ${
                    formik.touched.limitPerUser && formik.errors.limitPerUser
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.limitPerUser && formik.errors.limitPerUser && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.limitPerUser}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Discount Type</label>
                <select
                  name="discountType"
                  value={formik.values.discountType}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.discountType && formik.errors.discountType
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="Amount">Amount</option>
                  <option value="Percentage">Percentage</option>
                </select>
                {formik.touched.discountType && formik.errors.discountType && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.discountType}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Discount Amount
                </label>
                <input
                  type="number"
                  name="discountAmount"
                  value={formik.values.discountAmount}
                  onChange={formik.handleChange}
                  placeholder="Enter discount amount"
                  className={`customInput ${
                    formik.touched.discountAmount &&
                    formik.errors.discountAmount
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.discountAmount &&
                  formik.errors.discountAmount && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.discountAmount}
                    </div>
                  )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Minimum Purchase
                </label>
                <input
                  type="number"
                  name="minimumPurchase"
                  value={formik.values.minimumPurchase}
                  onChange={formik.handleChange}
                  placeholder="Enter minimum purchase"
                  className={`customInput ${
                    formik.touched.minimumPurchase &&
                    formik.errors.minimumPurchase
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.minimumPurchase &&
                  formik.errors.minimumPurchase && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.minimumPurchase}
                    </div>
                  )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formik.values.startDate}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.startDate && formik.errors.startDate
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.startDate && formik.errors.startDate && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.startDate}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Expire Date</label>
                <input
                  type="date"
                  name="expireDate"
                  disabled={!formik.values.startDate}
                  min={formik.values.startDate}
                  value={formik.values.expireDate}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.expireDate && formik.errors.expireDate
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.expireDate && formik.errors.expireDate && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.expireDate}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="font-medium">Status</label>
                <ToggleSwitch
                  checked={formik.values.status}
                  onChange={(val) => formik.setFieldValue("status", val)}
                />
                <span>{formik.values.status ? "Active" : "Inactive"}</span>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white cursor-pointer disabled:bg-blue-400"
                >
                  {editingCoupon ? "Update" : "Add"}
                </button>
              </div>
            </form>
            <button
              disabled={isLoading}
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
