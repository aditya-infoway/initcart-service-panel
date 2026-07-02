import { useState } from "react";
import DataTable from "../../components/common/DataTable";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";

interface Product {
  id: number;
  vendorType: "Retailer" | "Wholesaler";
  productName: string;
  sku: string;
  category: string;
  subcategory: string;
  subSubCategory: string;
  brand: string;
  productType: "Simple" | "Variant";
  keywords: string;
  shortDescription: string;
  fullDescription: string;
  productVideoUrl: string;
  mrp?: number;
  sellingPrice: number;
  wholesalePrice?: number;
  discountType: "Flat" | "Percentage";
  discountValue: number;
  tax: string;
  stockQuantity: number;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  unit: string;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  warehouseLocation: string;
  stockAvailability: "In Stock" | "Out of Stock";
  lowStockAlertQuantity: number;
  productCondition: "New" | "Refurbished" | "Used";
  freeShipping: boolean;
  shippingCharge?: number;
  minimumOrderValueForFreeShipping?: number;
  returnPolicy?: "7 Days" | "15 Days" | "Non-returnable";
  codAvailable?: boolean;
  estimatedDeliveryTime: string;
  status: "Pending" | "Approved" | "Rejected";
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      vendorType: "Retailer",
      productName: "Men's Cotton Shirt",
      sku: "SKU-R1234",
      category: "Apparel",
      subcategory: "Shirts",
      subSubCategory: "Formal Shirts",
      brand: "Peter England",
      productType: "Simple",
      keywords: "shirt,cotton,men",
      shortDescription: "Soft cotton fabric shirt",
      fullDescription: "100% cotton, full-sleeve shirt for men.",
      productVideoUrl: "https://youtu.be/demo",
      mrp: 999,
      sellingPrice: 799,
      discountType: "Percentage",
      discountValue: 10,
      tax: "12%",
      stockQuantity: 100,
      maximumOrderQuantity: 5,
      unit: "pcs",
      weight: 0.5,
      dimensions: { length: 30, width: 20, height: 5 },
      warehouseLocation: "Delhi",
      stockAvailability: "In Stock",
      lowStockAlertQuantity: 5,
      productCondition: "New",
      freeShipping: true,
      shippingCharge: 50,
      returnPolicy: "7 Days",
      codAvailable: true,
      estimatedDeliveryTime: "3-7 Days",
      status: "Approved",
    },
  ]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateSKU = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = `SKU-${editingProduct?.vendorType.charAt(0) || "R"}`;
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Product) => {
    setEditingProduct(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Product) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${item.productName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts(products.filter((p) => p.id !== item.id));
        Swal.fire(
          "Deleted!",
          `"${item.productName}" has been deleted.`,
          "success"
        );
      }
    });
  };

  const handleToggleStatus = (id: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status:
                p.status === "Approved"
                  ? "Pending"
                  : p.status === "Pending"
                  ? "Rejected"
                  : "Approved",
            }
          : p
      )
    );
  };

  const validationSchema = Yup.object({
    vendorType: Yup.string().required("Vendor type is required"),
    productName: Yup.string().required("Product name is required"),
    sku: Yup.string().required("SKU is required"),
    category: Yup.string().required("Category is required"),
    subcategory: Yup.string().required("Subcategory is required"),
    subSubCategory: Yup.string().required("Sub Sub Category is required"),
    brand: Yup.string().required("Brand is required"),
    productType: Yup.string().required("Product type is required"),
    keywords: Yup.string().required("Keywords is required"),
    shortDescription: Yup.string().required("Short Description is required"),
    fullDescription: Yup.string().required("Full Description is required"),
    sellingPrice: Yup.number()
      .min(0, "Selling price cannot be negative")
      .required("Selling price is required"),
    discountType: Yup.string().required("Discount type is required"),
    discountValue: Yup.number()
      .min(0, "Discount value cannot be negative")
      .required("Discount value is required"),
    tax: Yup.string().required("Tax rate is required"),
    stockQuantity: Yup.number()
      .min(0, "Stock quantity cannot be negative")
      .required("Stock quantity is required"),
    unit: Yup.string().required("Unit is required"),
    weight: Yup.number()
      .min(0, "Weight cannot be negative")
      .required("Weight is required"),
    dimensions: Yup.object({
      length: Yup.number()
        .min(0, "Length cannot be negative")
        .required("Length is required"),
      width: Yup.number()
        .min(0, "Width cannot be negative")
        .required("Width is required"),
      height: Yup.number()
        .min(0, "Height cannot be negative")
        .required("Height is required"),
    }).required(),
    warehouseLocation: Yup.string().required("Warehouse location is required"),
    stockAvailability: Yup.string().required("Stock availability is required"),
    lowStockAlertQuantity: Yup.number()
      .min(0, "Low stock alert quantity cannot be negative")
      .required("Low stock alert quantity is required"),
    productCondition: Yup.string().required("Product condition is required"),
    freeShipping: Yup.boolean().required("Free shipping selection is required"),
    estimatedDeliveryTime: Yup.string().required(
      "Estimated delivery time is required"
    ),
    mrp: Yup.number()
      .min(0, "MRP cannot be negative")
      .when("vendorType", ([vendorType], schema) => {
        return vendorType === "Retailer"
          ? schema.required("MRP is required for Retailer")
          : schema;
      }),

    maximumOrderQuantity: Yup.number()
      .min(1, "Maximum order quantity must be at least 1")
      .when("vendorType", ([vendorType], schema) => {
        return vendorType === "Retailer"
          ? schema.required("Maximum order quantity is required for Retailer")
          : schema;
      }),

    shippingCharge: Yup.number()
      .min(0, "Shipping charge cannot be negative")
      .when("vendorType", ([vendorType], schema) => {
        return vendorType === "Retailer"
          ? schema.required("Shipping charge is required for Retailer")
          : schema;
      }),

    returnPolicy: Yup.string().when("vendorType", ([vendorType], schema) => {
      return vendorType === "Retailer"
        ? schema.required("Return policy is required for Retailer")
        : schema;
    }),

    codAvailable: Yup.boolean().when("vendorType", ([vendorType], schema) => {
      return vendorType === "Retailer"
        ? schema.required("COD availability is required for Retailer")
        : schema;
    }),

    wholesalePrice: Yup.number()
      .min(0, "Wholesale price cannot be negative")
      .when("vendorType", ([vendorType], schema) => {
        return vendorType === "Wholesaler"
          ? schema.required("Wholesale price is required for Wholesaler")
          : schema;
      }),

    minimumOrderQuantity: Yup.number()
      .min(1, "Minimum order quantity must be at least 1")
      .when("vendorType", ([vendorType], schema) => {
        return vendorType === "Wholesaler"
          ? schema.required("Minimum order quantity is required for Wholesaler")
          : schema;
      }),

    minimumOrderValueForFreeShipping: Yup.number()
      .min(0, "Minimum order value cannot be negative")
      .when("vendorType", ([vendorType], schema) => {
        return vendorType === "Wholesaler"
          ? schema.required(
              "Minimum order value for free shipping is required for Wholesaler"
            )
          : schema;
      }),
  });

  const formik = useFormik({
    initialValues: {
      vendorType: editingProduct?.vendorType || "Retailer",
      productName: editingProduct?.productName || "",
      sku44: editingProduct?.sku || "",
      category: editingProduct?.category || "",
      subcategory: editingProduct?.subcategory || "",
      subSubCategory: editingProduct?.subSubCategory || "",
      brand: editingProduct?.brand || "",
      productType: editingProduct?.productType || "Simple",
      keywords: editingProduct?.keywords || "",
      shortDescription: editingProduct?.shortDescription || "",
      fullDescription: editingProduct?.fullDescription || "",
      productVideoUrl: editingProduct?.productVideoUrl || "",
      mrp: editingProduct?.mrp || 0,
      sellingPrice: editingProduct?.sellingPrice || 0,
      wholesalePrice: editingProduct?.wholesalePrice || 0,
      discountType: editingProduct?.discountType || "Flat",
      discountValue: editingProduct?.discountValue || 0,
      tax: editingProduct?.tax || "",
      stockQuantity: editingProduct?.stockQuantity || 0,
      minimumOrderQuantity: editingProduct?.minimumOrderQuantity || 1,
      maximumOrderQuantity: editingProduct?.maximumOrderQuantity || 1,
      unit: editingProduct?.unit || "",
      weight: editingProduct?.weight || 0,
      dimensions: editingProduct?.dimensions || {
        length: 0,
        width: 0,
        height: 0,
      },
      warehouseLocation: editingProduct?.warehouseLocation || "",
      stockAvailability: editingProduct?.stockAvailability || "In Stock",
      lowStockAlertQuantity: editingProduct?.lowStockAlertQuantity || 0,
      productCondition: editingProduct?.productCondition || "New",
      freeShipping: editingProduct?.freeShipping || false,
      shippingCharge: editingProduct?.shippingCharge || 0,
      minimumOrderValueForFreeShipping:
        editingProduct?.minimumOrderValueForFreeShipping || 0,
      returnPolicy: editingProduct?.returnPolicy || "7 Days",
      codAvailable: editingProduct?.codAvailable || false,
      estimatedDeliveryTime: editingProduct?.estimatedDeliveryTime || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      setIsLoading(true);
      const newProduct: Product = {
        id: editingProduct ? editingProduct.id : products.length + 1,
        vendorType: values.vendorType as "Retailer" | "Wholesaler",
        productName: values.productName,
        sku: values.sku44,
        category: values.category,
        subcategory: values.subcategory,
        subSubCategory: values.subSubCategory,
        brand: values.brand,
        productType: values.productType as "Simple" | "Variant",
        keywords: values?.keywords || "",
        shortDescription: values?.shortDescription || "",
        fullDescription: values?.fullDescription || "",
        productVideoUrl: values?.productVideoUrl || "",
        mrp: values.vendorType === "Retailer" ? values.mrp : undefined,
        sellingPrice: values.sellingPrice,
        wholesalePrice:
          values.vendorType === "Wholesaler"
            ? values.wholesalePrice
            : undefined,
        discountType: values.discountType as "Flat" | "Percentage",
        discountValue: values.discountValue,
        tax: values.tax,
        stockQuantity: values.stockQuantity,
        minimumOrderQuantity:
          values.vendorType === "Wholesaler"
            ? values.minimumOrderQuantity
            : undefined,
        maximumOrderQuantity:
          values.vendorType === "Retailer"
            ? values.maximumOrderQuantity
            : undefined,
        unit: values.unit,
        weight: values.weight,
        dimensions: values.dimensions,
        warehouseLocation: values.warehouseLocation,
        stockAvailability: values.stockAvailability as
          | "In Stock"
          | "Out of Stock",
        lowStockAlertQuantity: values.lowStockAlertQuantity,
        productCondition: values.productCondition as
          | "New"
          | "Refurbished"
          | "Used",
        freeShipping: values.freeShipping,
        shippingCharge:
          values.vendorType === "Retailer" ? values.shippingCharge : undefined,
        minimumOrderValueForFreeShipping:
          values.vendorType === "Wholesaler"
            ? values.minimumOrderValueForFreeShipping
            : undefined,
        returnPolicy:
          values.vendorType === "Retailer"
            ? (values.returnPolicy as "7 Days" | "15 Days" | "Non-returnable")
            : undefined,
        codAvailable:
          values.vendorType === "Retailer" ? values.codAvailable : undefined,
        estimatedDeliveryTime: values.estimatedDeliveryTime,
        status: editingProduct ? editingProduct.status : "Pending",
      };

      if (editingProduct) {
        setProducts(
          products.map((p) => (p.id === editingProduct.id ? newProduct : p))
        );
        Swal.fire({
          icon: "success",
          title: "Product Updated",
          text: `"${values.productName}" has been updated successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        setProducts([newProduct, ...products]);
        Swal.fire({
          icon: "success",
          title: "Product Added",
          text: `"${values.productName}" has been submitted for approval!`,
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
    <div className="bg-gradient-to-b from-gray-50 to-gray-100">
      <DataTable
        title="Products"
        data={products}
        columns={[
          {
            key: "productName",
            label: "Product Name",
            render: (item) => (
              <div className="flex flex-col">
                <div className="text-[16px]">{item.productName}</div>
                <div className="font-bold text-[16px]">SKU: {item.sku}</div>
              </div>
            ),
          },
          { key: "vendorType", label: "Vendor Type" },
          { key: "category", label: "Category" },
          { key: "brand", label: "Brand" },
          { key: "sellingPrice", label: "Selling Price" },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold ${
                    item.status === "Approved"
                      ? "text-green-700"
                      : item.status === "Pending"
                      ? "text-yellow-700"
                      : "text-red-700"
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
        addButtonLabel="Add Product"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000007d] px-3">
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
            style={{ maxHeight: "80dvh", overflowY: "auto" }}
          >
            <h2 className="text-xl font-bold mb-7">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="mb-2">
                <label className="block mb-1 font-medium">Vendor Type</label>
                <select
                  name="vendorType"
                  value={formik.values.vendorType}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.vendorType && formik.errors.vendorType
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="Retailer">Retailer</option>
                  <option value="Wholesaler">Wholesaler</option>
                </select>
                {formik.touched.vendorType && formik.errors.vendorType && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.vendorType}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={formik.values.productName}
                  onChange={formik.handleChange}
                  placeholder="Enter product name"
                  className={`customInput ${
                    formik.touched.productName && formik.errors.productName
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.productName && formik.errors.productName && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.productName}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <label className="block mb-1 font-medium">SKU</label>
                  <button
                    type="button"
                    onClick={() => formik.setFieldValue("sku44", generateSKU())}
                    className="text-blue-600 text-sm hover:underline cursor-pointer"
                  >
                    Generate SKU
                  </button>
                </div>
                <input
                  type="text"
                  name="sku44"
                  value={formik.values.sku44}
                  onChange={formik.handleChange}
                  placeholder="Enter SKU"
                  className={`customInput ${
                    formik.touched.sku44 && formik.errors.sku44
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.sku44 && formik.errors.sku44 && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.sku44}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Category</label>
                <select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.category && formik.errors.category
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="">Select Category</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Furniture">Furniture</option>
                </select>
                {formik.touched.category && formik.errors.category && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.category}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Subcategory</label>
                <select
                  name="subcategory"
                  value={formik.values.subcategory}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.subcategory && formik.errors.subcategory
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="">Select Subcategory</option>
                  <option value="Shirts">Shirts</option>
                </select>
                {formik.touched.subcategory && formik.errors.subcategory && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.subcategory}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Sub Sub Category
                </label>
                <select
                  name="subSubCategory"
                  value={formik.values.subSubCategory}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.subSubCategory &&
                    formik.errors.subSubCategory
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="">Select Sub Sub Category</option>
                  <option value="Formal Shirts">Formal Shirts</option>
                </select>
                {formik.touched.subSubCategory &&
                  formik.errors.subSubCategory && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.subSubCategory}
                    </div>
                  )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formik.values.brand}
                  onChange={formik.handleChange}
                  placeholder="Enter brand"
                  className={`customInput ${
                    formik.touched.brand && formik.errors.brand
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.brand && formik.errors.brand && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.brand}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Product Type</label>
                <select
                  name="productType"
                  value={formik.values.productType}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.productType && formik.errors.productType
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="Simple">Simple</option>
                  <option value="Variant">Variant</option>
                </select>
                {formik.touched.productType && formik.errors.productType && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.productType}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Tags / Keywords
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={formik.values.keywords}
                  onChange={formik.handleChange}
                  placeholder="Enter Tags / Keywords"
                  className={`customInput ${
                    formik.touched.keywords && formik.errors.keywords
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.keywords && formik.errors.keywords && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.keywords}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Short Description
                </label>
                <textarea
                  //   type="text"
                  name="shortDescription"
                  rows={4}
                  value={formik.values.shortDescription}
                  onChange={formik.handleChange}
                  placeholder="Enter Short Description"
                  className={`customInput ${
                    formik.touched.shortDescription &&
                    formik.errors.shortDescription
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.shortDescription &&
                  formik.errors.shortDescription && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.shortDescription}
                    </div>
                  )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Full Description
                </label>
                <textarea
                  //   type="text"
                  name="fullDescription"
                  rows={4}
                  value={formik.values.fullDescription}
                  onChange={formik.handleChange}
                  placeholder="Enter Full Description"
                  className={`customInput ${
                    formik.touched.fullDescription &&
                    formik.errors.fullDescription
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.fullDescription &&
                  formik.errors.fullDescription && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.fullDescription}
                    </div>
                  )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Product Video URL
                </label>
                <input
                  type="text"
                  name="productVideoUrl"
                  value={formik.values.productVideoUrl}
                  onChange={formik.handleChange}
                  placeholder="Enter Product Video URL"
                  className={`customInput ${
                    formik.touched.productVideoUrl &&
                    formik.errors.productVideoUrl
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.productVideoUrl &&
                  formik.errors.productVideoUrl && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.productVideoUrl}
                    </div>
                  )}
              </div>

              {formik.values.vendorType === "Retailer" && (
                <div className="mb-2">
                  <label className="block mb-1 font-medium">MRP</label>
                  <input
                    type="number"
                    name="mrp"
                    value={formik.values.mrp}
                    onChange={formik.handleChange}
                    placeholder="Enter MRP"
                    className={`customInput ${
                      formik.touched.mrp && formik.errors.mrp
                        ? "customInputError"
                        : ""
                    }`}
                  />
                  {formik.touched.mrp && formik.errors.mrp && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.mrp}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-2">
                <label className="block mb-1 font-medium">Selling Price</label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formik.values.sellingPrice}
                  onChange={formik.handleChange}
                  placeholder="Enter selling price"
                  className={`customInput ${
                    formik.touched.sellingPrice && formik.errors.sellingPrice
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.sellingPrice && formik.errors.sellingPrice && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.sellingPrice}
                  </div>
                )}
              </div>

              {formik.values.vendorType === "Wholesaler" && (
                <div className="mb-2">
                  <label className="block mb-1 font-medium">
                    Wholesale Price
                  </label>
                  <input
                    type="number"
                    name="wholesalePrice"
                    value={formik.values.wholesalePrice}
                    onChange={formik.handleChange}
                    placeholder="Enter wholesale price"
                    className={`customInput ${
                      formik.touched.wholesalePrice &&
                      formik.errors.wholesalePrice
                        ? "customInputError"
                        : ""
                    }`}
                  />
                  {formik.touched.wholesalePrice &&
                    formik.errors.wholesalePrice && (
                      <div className="text-red-500 text-sm mt-1 ms-2">
                        {formik.errors.wholesalePrice}
                      </div>
                    )}
                </div>
              )}

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
                  <option value="Flat">Flat</option>
                  <option value="Percentage">Percentage</option>
                </select>
                {formik.touched.discountType && formik.errors.discountType && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.discountType}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Discount Value</label>
                <input
                  type="number"
                  name="discountValue"
                  value={formik.values.discountValue}
                  onChange={formik.handleChange}
                  placeholder="Enter discount value"
                  className={`customInput ${
                    formik.touched.discountValue && formik.errors.discountValue
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.discountValue &&
                  formik.errors.discountValue && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.discountValue}
                    </div>
                  )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Tax (GST %)</label>
                <select
                  name="tax"
                  value={formik.values.tax}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.tax && formik.errors.tax
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="">Select Tax Rate</option>
                  <option value="5%">5%</option>
                  <option value="12%">12%</option>
                  <option value="18%">18%</option>
                  <option value="28%">28%</option>
                </select>
                {formik.touched.tax && formik.errors.tax && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.tax}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Stock Quantity</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formik.values.stockQuantity}
                  onChange={formik.handleChange}
                  placeholder="Enter stock quantity"
                  className={`customInput ${
                    formik.touched.stockQuantity && formik.errors.stockQuantity
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.stockQuantity &&
                  formik.errors.stockQuantity && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.stockQuantity}
                    </div>
                  )}
              </div>

              {formik.values.vendorType === "Wholesaler" && (
                <div className="mb-2">
                  <label className="block mb-1 font-medium">
                    Minimum Order Quantity
                  </label>
                  <input
                    type="number"
                    name="minimumOrderQuantity"
                    value={formik.values.minimumOrderQuantity}
                    onChange={formik.handleChange}
                    placeholder="Enter minimum order quantity"
                    className={`customInput ${
                      formik.touched.minimumOrderQuantity &&
                      formik.errors.minimumOrderQuantity
                        ? "customInputError"
                        : ""
                    }`}
                  />
                  {formik.touched.minimumOrderQuantity &&
                    formik.errors.minimumOrderQuantity && (
                      <div className="text-red-500 text-sm mt-1 ms-2">
                        {formik.errors.minimumOrderQuantity}
                      </div>
                    )}
                </div>
              )}

              {formik.values.vendorType === "Retailer" && (
                <div className="mb-2">
                  <label className="block mb-1 font-medium">
                    Maximum Order Quantity
                  </label>
                  <input
                    type="number"
                    name="maximumOrderQuantity"
                    value={formik.values.maximumOrderQuantity}
                    onChange={formik.handleChange}
                    placeholder="Enter maximum order quantity"
                    className={`customInput ${
                      formik.touched.maximumOrderQuantity &&
                      formik.errors.maximumOrderQuantity
                        ? "customInputError"
                        : ""
                    }`}
                  />
                  {formik.touched.maximumOrderQuantity &&
                    formik.errors.maximumOrderQuantity && (
                      <div className="text-red-500 text-sm mt-1 ms-2">
                        {formik.errors.maximumOrderQuantity}
                      </div>
                    )}
                </div>
              )}

              <div className="mb-2">
                <label className="block mb-1 font-medium">Unit</label>
                <select
                  name="unit"
                  value={formik.values.unit}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.unit && formik.errors.unit
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="">Select Unit</option>
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="litre">litre</option>
                </select>
                {formik.touched.unit && formik.errors.unit && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.unit}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formik.values.weight}
                  onChange={formik.handleChange}
                  placeholder="Enter weight"
                  className={`customInput ${
                    formik.touched.weight && formik.errors.weight
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.weight && formik.errors.weight && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.weight}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Dimensions (cm)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="dimensions.length"
                    value={formik.values.dimensions.length}
                    onChange={formik.handleChange}
                    placeholder="Length"
                    className={`customInput w-1/3 ${
                      formik.touched.dimensions?.length &&
                      formik.errors.dimensions?.length
                        ? "customInputError"
                        : ""
                    }`}
                  />
                  <input
                    type="number"
                    name="dimensions.width"
                    value={formik.values.dimensions.width}
                    onChange={formik.handleChange}
                    placeholder="Width"
                    className={`customInput w-1/3 ${
                      formik.touched.dimensions?.width &&
                      formik.errors.dimensions?.width
                        ? "customInputError"
                        : ""
                    }`}
                  />
                  <input
                    type="number"
                    name="dimensions.height"
                    value={formik.values.dimensions.height}
                    onChange={formik.handleChange}
                    placeholder="Height"
                    className={`customInput w-1/3 ${
                      formik.touched.dimensions?.height &&
                      formik.errors.dimensions?.height
                        ? "customInputError"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.dimensions && formik.errors.dimensions && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {typeof formik.errors.dimensions === "string"
                      ? formik.errors.dimensions
                      : "Invalid dimensions"}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Warehouse Location
                </label>
                <select
                  name="warehouseLocation"
                  value={formik.values.warehouseLocation}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.warehouseLocation &&
                    formik.errors.warehouseLocation
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="">Select Warehouse</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
                {formik.touched.warehouseLocation &&
                  formik.errors.warehouseLocation && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.warehouseLocation}
                    </div>
                  )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Stock Availability
                </label>
                <select
                  name="stockAvailability"
                  value={formik.values.stockAvailability}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.stockAvailability &&
                    formik.errors.stockAvailability
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
                {formik.touched.stockAvailability &&
                  formik.errors.stockAvailability && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.stockAvailability}
                    </div>
                  )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Low Stock Alert Quantity
                </label>
                <input
                  type="number"
                  name="lowStockAlertQuantity"
                  value={formik.values.lowStockAlertQuantity}
                  onChange={formik.handleChange}
                  placeholder="Enter low stock alert quantity"
                  className={`customInput ${
                    formik.touched.lowStockAlertQuantity &&
                    formik.errors.lowStockAlertQuantity
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.lowStockAlertQuantity &&
                  formik.errors.lowStockAlertQuantity && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.lowStockAlertQuantity}
                    </div>
                  )}
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Product Condition
                </label>
                <select
                  name="productCondition"
                  value={formik.values.productCondition}
                  onChange={formik.handleChange}
                  className={`customInput ${
                    formik.touched.productCondition &&
                    formik.errors.productCondition
                      ? "customInputError"
                      : ""
                  }`}
                >
                  <option value="New">New</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Used">Used</option>
                </select>
                {formik.touched.productCondition &&
                  formik.errors.productCondition && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.productCondition}
                    </div>
                  )}
              </div>

              <div className="flex items-center gap-2">
                <label className="font-medium">Free Shipping</label>
                <ToggleSwitch
                  checked={formik.values.freeShipping}
                  onChange={(val) => formik.setFieldValue("freeShipping", val)}
                />
                <span>{formik.values.freeShipping ? "Yes" : "No"}</span>
              </div>

              {formik.values.vendorType === "Retailer" && (
                <div className="mb-2">
                  <label className="block mb-1 font-medium">
                    Shipping Charge
                  </label>
                  <input
                    type="number"
                    name="shippingCharge"
                    value={formik.values.shippingCharge}
                    onChange={formik.handleChange}
                    placeholder="Enter shipping charge"
                    className={`customInput ${
                      formik.touched.shippingCharge &&
                      formik.errors.shippingCharge
                        ? "customInputError"
                        : ""
                    }`}
                  />
                  {formik.touched.shippingCharge &&
                    formik.errors.shippingCharge && (
                      <div className="text-red-500 text-sm mt-1 ms-2">
                        {formik.errors.shippingCharge}
                      </div>
                    )}
                </div>
              )}

              {formik.values.vendorType === "Wholesaler" && (
                <div className="mb-2">
                  <label className="block mb-1 font-medium">
                    Minimum Order Value for Free Shipping
                  </label>
                  <input
                    type="number"
                    name="minimumOrderValueForFreeShipping"
                    value={formik.values.minimumOrderValueForFreeShipping}
                    onChange={formik.handleChange}
                    placeholder="Enter minimum order value"
                    className={`customInput ${
                      formik.touched.minimumOrderValueForFreeShipping &&
                      formik.errors.minimumOrderValueForFreeShipping
                        ? "customInputError"
                        : ""
                    }`}
                  />
                  {formik.touched.minimumOrderValueForFreeShipping &&
                    formik.errors.minimumOrderValueForFreeShipping && (
                      <div className="text-red-500 text-sm mt-1 ms-2">
                        {formik.errors.minimumOrderValueForFreeShipping}
                      </div>
                    )}
                </div>
              )}

              {formik.values.vendorType === "Retailer" && (
                <div className="mb-2">
                  <label className="block mb-1 font-medium">
                    Return Policy
                  </label>
                  <select
                    name="returnPolicy"
                    value={formik.values.returnPolicy}
                    onChange={formik.handleChange}
                    className={`customInput ${
                      formik.touched.returnPolicy && formik.errors.returnPolicy
                        ? "customInputError"
                        : ""
                    }`}
                  >
                    <option value="7 Days">7 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="Non-returnable">Non-returnable</option>
                  </select>
                  {formik.touched.returnPolicy &&
                    formik.errors.returnPolicy && (
                      <div className="text-red-500 text-sm mt-1 ms-2">
                        {formik.errors.returnPolicy}
                      </div>
                    )}
                </div>
              )}

              {formik.values.vendorType === "Retailer" && (
                <div className="flex items-center gap-2">
                  <label className="font-medium">COD Available</label>
                  <ToggleSwitch
                    checked={formik.values.codAvailable}
                    onChange={(val) =>
                      formik.setFieldValue("codAvailable", val)
                    }
                  />
                  <span>{formik.values.codAvailable ? "Yes" : "No"}</span>
                </div>
              )}

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  name="estimatedDeliveryTime"
                  value={formik.values.estimatedDeliveryTime}
                  onChange={formik.handleChange}
                  placeholder="Enter estimated delivery time"
                  className={`customInput ${
                    formik.touched.estimatedDeliveryTime &&
                    formik.errors.estimatedDeliveryTime
                      ? "customInputError"
                      : ""
                  }`}
                />
                {formik.touched.estimatedDeliveryTime &&
                  formik.errors.estimatedDeliveryTime && (
                    <div className="text-red-500 text-sm mt-1 ms-2">
                      {formik.errors.estimatedDeliveryTime}
                    </div>
                  )}
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
                  {editingProduct ? "Update" : "Add"}
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

export default Products;
