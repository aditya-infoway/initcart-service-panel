import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import {
  FiSave,
  FiTrash2,
  FiArrowLeft,
  FiX,
  FiImage,
  FiPhone,
  FiMail,
  FiMessageCircle,
  FiLink,
  FiInfo,
  FiUpload,
  FiStar,
  FiMapPin
} from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import apiClient from "../../api/apiClient";

interface Subcategory {
  id: number;
  subcategory_name: string;
}

const validationSchema = Yup.object({
  subcategory: Yup.string().required("Restaurant category is required"),
  restaurant_name: Yup.string()
    .min(3, "Restaurant name must be at least 3 characters")
    .max(100, "Restaurant name too long")
    .required("Restaurant name is required"),
  address: Yup.string()
    .min(10, "Please enter full address")
    .required("Address is required"),
  location: Yup.string()
    .url("Please enter a valid URL")
    .required("Google Maps location is required"),
  country: Yup.string().required("Country is required"),
  state: Yup.string().required("State is required"),
  city: Yup.string().required("City is required"),
  contact_no: Yup.string()
    .matches(/^[0-9]{10}$/, "Must be a valid 10-digit number")
    .required("Contact number is required"),
  whatsapp_no: Yup.string()
    .matches(/^[0-9]{10}$/, "Must be a valid 10-digit number")
    .nullable(),
  gmail_id: Yup.string()
    .email("Please enter a valid email address")
    .nullable(),
  restaurant_rating: Yup.number()
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5")
    .nullable(),
  description: Yup.string()
    .min(50, "Description should be at least 50 characters")
    .required("Description is required"),
  tax_description: Yup.string().nullable(),
});

const AddRestaurantService: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [countryId, setCountryId] = useState<number>(0);
  const [stateId, setStateId] = useState<number>(0);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [multiImagesPreviews, setMultiImagesPreviews] = useState<string[]>([]);
  const [existingMainImage, setExistingMainImage] = useState<string | null>(null);
  const [existingMultiImages, setExistingMultiImages] = useState<Array<{ id: number; image: string }>>([]);

  // Fetch subcategories for Restaurant
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await apiClient.get("service-subcategories/by_service/?service=Restaurant");
        if (response.data) {
          if (response.data["Restaurant"]) {
            setSubcategories(response.data["Restaurant"]);
          } else if (Array.isArray(response.data)) {
            setSubcategories(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchSubcategories();
  }, []);

  // Fetch existing data for edit mode
  useEffect(() => {
    if (id) {
      setLoadingData(true);
      apiClient.get(`/restaurant-services/${id}/`)
        .then(res => {
          const data = res.data;
          setExistingMainImage(data.main_image || null);
          const multiImgs = (data.multi_images || []).map((img: any) => ({
            id: img.id,
            image: typeof img === 'string' ? img : img.image,
          }));
          setExistingMultiImages(multiImgs);
          formik.setValues({
            subcategory: data.subcategory ? String(data.subcategory) : "",
            restaurant_name: data.restaurant_name || "",
            location: data.location || "",
            address: data.address || "",
            country: data.country || "",
            state: data.state || "",
            city: data.city || "",
            contact_no: data.contact_no || "",
            whatsapp_no: data.whatsapp_no || "",
            gmail_id: data.gmail_id || "",
            restaurant_rating: data.restaurant_rating || "",
            description: data.description || "",
            tax_description: data.tax_description || "",
            main_image: null,
            multi_images: [],
          });
        })
        .catch(() => {
          Swal.fire("Error!", "Failed to load restaurant data.", "error");
          navigate('/restaurantservices');
        })
        .finally(() => setLoadingData(false));
    }
  }, [id]);

  const formik = useFormik({
    initialValues: {
      subcategory: "",
      restaurant_name: "",
      location: "",
      address: "",
      country: "",
      state: "",
      city: "",
      contact_no: "",
      whatsapp_no: "",
      gmail_id: "",
      restaurant_rating: "",
      description: "",
      tax_description: "",
      main_image: null as File | null,
      multi_images: [] as File[],
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("subcategory", values.subcategory);
        formData.append("restaurant_name", values.restaurant_name);
        formData.append("address", values.address);
        formData.append("location", values.location);
        formData.append("country", values.country);
        formData.append("state", values.state);
        formData.append("city", values.city);
        formData.append("contact_no", values.contact_no);
        if (values.whatsapp_no) formData.append("whatsapp_no", values.whatsapp_no);
        if (values.gmail_id) formData.append("gmail_id", values.gmail_id);
        if (values.restaurant_rating) formData.append("restaurant_rating", values.restaurant_rating);
        formData.append("description", values.description);
        if (values.tax_description) formData.append("tax_description", values.tax_description);
        if (values.main_image) formData.append("main_image", values.main_image);
        values.multi_images.forEach(img => formData.append("multi_images", img));

        if (id) {
          await apiClient.put(`/restaurant-services/${id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          Swal.fire("Updated!", "Restaurant service updated successfully!", "success");
        } else {
          await apiClient.post("/restaurant-services/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          Swal.fire("Success!", "Restaurant service added successfully!", "success");
        }
        navigate('/restaurantservices');
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || "Failed to save restaurant.";
        Swal.fire("Error!", errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const renderError = (field: keyof typeof formik.values) => {
    if (formik.touched[field] && formik.errors[field]) {
      return (
        <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <FiInfo className="w-3 h-3" />
          {formik.errors[field] as string}
        </div>
      );
    }
    return null;
  };

  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Error!", "Image size should be less than 5MB", "error");
        return;
      }
      formik.setFieldValue("main_image", file);
      const reader = new FileReader();
      reader.onloadend = () => setMainImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMultiImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (validFiles.length > 0) {
      formik.setFieldValue("multi_images", [...formik.values.multi_images, ...validFiles]);
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setMultiImagesPreviews(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMultiImage = (index: number, isExisting = false) => {
    if (isExisting) {
      setExistingMultiImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const newImages = [...formik.values.multi_images];
      const newPreviews = [...multiImagesPreviews];
      newImages.splice(index, 1);
      newPreviews.splice(index, 1);
      formik.setFieldValue("multi_images", newImages);
      setMultiImagesPreviews(newPreviews);
    }
  };

  const removeMainImage = () => {
    formik.setFieldValue("main_image", null);
    setMainImagePreview(null);
    setExistingMainImage(null);
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/restaurantservices')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-medium transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Restaurant Services
          </button>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {id ? 'Edit Restaurant Service' : 'Add Restaurant Service'}
          </h1>
          <p className="text-slate-500">Fill in the details for your restaurant business</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <MdRestaurant className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-800">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Restaurant Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="subcategory"
                  value={formik.values.subcategory}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Category</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.subcategory_name}</option>
                  ))}
                </select>
                {renderError("subcategory")}
              </div>

              {/* Restaurant Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Restaurant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="restaurant_name"
                  value={formik.values.restaurant_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter restaurant name"
                />
                {renderError("restaurant_name")}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter complete address with street, area, pincode"
                />
                {renderError("address")}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <CountrySelect
                  value={countryId}
                  onChange={(selected: any) => {
                    if (selected) {
                      formik.setFieldValue("country", selected.name);
                      setCountryId(selected.id);
                      setStateId(0);
                      formik.setFieldValue("state", "");
                      formik.setFieldValue("city", "");
                    }
                  }}
                  placeHolder="Select Country"
                />
                {renderError("country")}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                {countryId > 0 ? (
                  <StateSelect
                    countryid={countryId}
                    value={formik.values.state}
                    onChange={(selected: any) => {
                      if (selected) {
                        formik.setFieldValue("state", selected.name);
                        setStateId(selected.id);
                        formik.setFieldValue("city", "");
                      }
                    }}
                    placeHolder="Select State"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm">
                    Select country first
                  </div>
                )}
                {renderError("state")}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                {stateId > 0 ? (
                  <CitySelect
                    countryid={countryId}
                    stateid={stateId}
                    value={formik.values.city}
                    onChange={(selected: any) => {
                      if (selected) formik.setFieldValue("city", selected.name);
                    }}
                    placeHolder="Select City"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm">
                    Select state first
                  </div>
                )}
                {renderError("city")}
              </div>

              {/* Google Maps Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Google Maps Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    name="location"
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Paste the Google Maps share link of your restaurant location</p>
                {renderError("location")}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <FiPhone className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-800">Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="contact_no"
                    value={formik.values.contact_no}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="9876543210"
                  />
                </div>
                {renderError("contact_no")}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp Number</label>
                <div className="relative">
                  <FiMessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                  <input
                    type="tel"
                    name="whatsapp_no"
                    value={formik.values.whatsapp_no}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="9876543210"
                  />
                </div>
                {renderError("whatsapp_no")}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email ID</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
                  <input
                    type="email"
                    name="gmail_id"
                    value={formik.values.gmail_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="restaurant@gmail.com"
                  />
                </div>
                {renderError("gmail_id")}
              </div>

              {/* Restaurant Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Restaurant Rating
                </label>
                <div className="relative">
                  <FiStar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 w-4 h-4" />
                  <input
                    type="number"
                    name="restaurant_rating"
                    value={formik.values.restaurant_rating}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="4.5"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Rating out of 5 (e.g., 4.5)</p>
                {renderError("restaurant_rating")}
              </div>
            </div>
          </div>

          {/* Description with Tax Editor */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <FiInfo className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-800">Description & Tax Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Restaurant Description <span className="text-red-500">*</span>
                </label>
                <CKEditor
                  editor={ClassicEditor as any}
                  data={formik.values.description}
                  onChange={(_, editor) => formik.setFieldValue("description", editor.getData())}
                  config={{ placeholder: "Describe your restaurant, cuisine, ambiance, specialties, etc." }}
                />
                {renderError("description")}
                <p className="text-xs text-slate-400 mt-2">Minimum 50 characters. Describe what makes your restaurant unique.</p>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <FiImage className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-800">Images</h2>
            </div>

            {/* Existing Images */}
            {(existingMainImage || existingMultiImages.length > 0) && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Current Images</h3>
                <div className="flex flex-wrap gap-4">
                  {existingMainImage && (
                    <div className="relative group">
                      <img src={existingMainImage} alt="Main" className="w-28 h-28 object-cover rounded-xl border-2 border-blue-200" />
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-lg">Main</span>
                      <button
                        type="button"
                        onClick={removeMainImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {existingMultiImages.map((img, idx) => (
                    <div key={img.id} className="relative group">
                      <img src={img.image} alt={`Gallery ${idx + 1}`} className="w-28 h-28 object-cover rounded-xl border border-slate-200" />
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-lg">Gallery</span>
                      <button
                        type="button"
                        onClick={() => removeMultiImage(idx, true)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Main Image {!id && <span className="text-red-500">*</span>}
              </label>
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 hover:border-blue-400 transition-colors bg-blue-50/30">
                {(mainImagePreview || existingMainImage) ? (
                  <div className="relative">
                    <img
                      src={mainImagePreview || existingMainImage || ''}
                      alt="Main Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeMainImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FiUpload className="w-12 h-12 text-blue-400 mb-3" />
                    <p className="text-sm text-blue-600 text-center mb-2 font-medium">Click to upload main image</p>
                    <p className="text-xs text-slate-400 text-center">JPG, PNG, WEBP up to 5MB</p>
                    <input
                      type="file"
                      id="main_image"
                      className="hidden"
                      onChange={handleMainImage}
                      accept=".jpg,.jpeg,.png,.webp"
                    />
                    <label
                      htmlFor="main_image"
                      className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Multi Images Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gallery Images</label>
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 hover:border-blue-400 transition-colors bg-blue-50/30">
                <div className="flex flex-col items-center justify-center">
                  <FiImage className="w-12 h-12 text-blue-400 mb-3" />
                  <p className="text-sm text-blue-600 text-center mb-2 font-medium">Upload multiple images</p>
                  <p className="text-xs text-slate-400 text-center">You can select multiple images at once</p>
                  <input
                    type="file"
                    id="multi_images"
                    className="hidden"
                    onChange={handleMultiImages}
                    accept=".jpg,.jpeg,.png,.webp"
                    multiple
                  />
                  <label
                    htmlFor="multi_images"
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    Select Images
                  </label>
                </div>
                {formik.values.multi_images.length > 0 && (
                  <div className="mt-3 text-center">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {formik.values.multi_images.length} new file(s) selected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* New Gallery Images Preview */}
            {multiImagesPreviews.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-700 mb-3">New Gallery Images ({multiImagesPreviews.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {multiImagesPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                      <button
                        type="button"
                        onClick={() => removeMultiImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky bottom-4">
            <button
              type="button"
              onClick={() => navigate('/restaurantservices')}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 font-medium transition-all"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  {id ? 'Update Restaurant' : 'Add Restaurant'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurantService;