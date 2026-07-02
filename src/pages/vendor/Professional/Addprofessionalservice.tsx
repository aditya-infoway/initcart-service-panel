// src/pages/vendor/professional/AddProfessionalService.tsx
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
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiX,
  FiImage,
  FiPhone,
  FiMail,
  FiMessageCircle,
  FiLink,
  FiInfo,
  FiUpload
} from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import apiClient from "../../../api/apiClient";

interface Subcategory {
  id: number;
  subcategory_name: string;
  service_category?: string;
}

const validationSchema = Yup.object({
  subcategory: Yup.string().required("Service category is required"),
  business_name: Yup.string()
    .min(3, "Business name must be at least 3 characters")
    .max(100, "Business name too long")
    .required("Business name is required"),
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
  description: Yup.string()
    .min(50, "Description should be at least 50 characters")
    .required("Description is required"),
});

const AddProfessionalService: React.FC = () => {
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
  const [uploadProgress, setUploadProgress] = useState(false);

  // Fetch subcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await apiClient.get("service-subcategories/by_service/?service=Professional");
        console.log("Subcategories response:", response.data);
        
        if (response.data) {
          if (response.data["Professional"]) {
            setSubcategories(response.data["Professional"]);
          } else if (Array.isArray(response.data)) {
            setSubcategories(response.data);
          } else if (typeof response.data === 'object') {
            const firstKey = Object.keys(response.data)[0];
            if (firstKey && response.data[firstKey]) {
              setSubcategories(response.data[firstKey]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        try {
          const fallbackResponse = await apiClient.get("service-subcategories/");
          if (Array.isArray(fallbackResponse.data)) {
            setSubcategories(fallbackResponse.data);
          } else if (fallbackResponse.data && typeof fallbackResponse.data === 'object') {
            const allSubcats: Subcategory[] = [];
            Object.values(fallbackResponse.data).forEach((value: any) => {
              if (Array.isArray(value)) {
                allSubcats.push(...value);
              }
            });
            setSubcategories(allSubcats);
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
        }
      }
    };
    fetchSubcategories();
  }, []);

  // Fetch existing data for edit mode
  useEffect(() => {
    if (id) {
      setLoadingData(true);
      apiClient.get(`/professional-services/${id}/`)
        .then(res => {
          const data = res.data;
          console.log("API Response Data:", data);

          // Set existing images
          setExistingMainImage(data.main_image || null);
          
          // Extract image URLs from multi_images objects
          const multiImgs = (data.multi_images || []).map((img: any) => ({
            id: img.id,
            image: typeof img === 'string' ? img : img.image
          }));
          setExistingMultiImages(multiImgs);

          // Set form values
          formik.setValues({
            subcategory: data.subcategory ? String(data.subcategory) : "",
            business_name: data.business_name || "",
            location: data.location || "",
            address: data.address || "",
            country: data.country || "",
            state: data.state || "",
            city: data.city || "",
            contact_no: data.contact_no || "",
            whatsapp_no: data.whatsapp_no || "",
            gmail_id: data.gmail_id || "",
            description: data.description || "",
            main_image: null,
            multi_images: [],
          });
        })
        .catch((error) => {
          console.error("Error fetching service:", error);
          Swal.fire("Error!", "Failed to load service data.", "error");
          navigate('/myprofessionalservices');
        })
        .finally(() => setLoadingData(false));
    }
  }, [id]);

  const formik = useFormik({
    initialValues: {
      subcategory: "",
      business_name: "",
      location: "",
      address: "",
      country: "",
      state: "",
      city: "",
      contact_no: "",
      whatsapp_no: "",
      gmail_id: "",
      description: "",
      main_image: null as File | null,
      multi_images: [] as File[],
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setUploadProgress(true);
      
      try {
        const formData = new FormData();
        formData.append("subcategory", values.subcategory);
        formData.append("business_name", values.business_name);
        formData.append("address", values.address);
        formData.append("location", values.location);
        formData.append("country", values.country);
        formData.append("state", values.state);
        formData.append("city", values.city);
        formData.append("contact_no", values.contact_no);
        if (values.whatsapp_no) formData.append("whatsapp_no", values.whatsapp_no);
        if (values.gmail_id) formData.append("gmail_id", values.gmail_id);
        formData.append("description", values.description);
        
        if (values.main_image) formData.append("main_image", values.main_image);
        values.multi_images.forEach(img => formData.append("multi_images", img));

        if (id) {
          await apiClient.put(`/professional-services/${id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          Swal.fire("Updated!", "Service updated successfully!", "success");
        } else {
          await apiClient.post("/professional-services/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          Swal.fire("Success!", "Service added successfully!", "success");
        }
        navigate('/myprofessionalservices');
      } catch (error: any) {
        console.error("Save error:", error);
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.message ||
                            "Failed to save service. Please check all fields.";
        Swal.fire("Error!", errorMessage, "error");
      } finally {
        setIsLoading(false);
        setUploadProgress(false);
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
    
    if (validFiles.length !== files.length) {
      Swal.fire("Warning!", "Some images exceed 5MB and were skipped", "warning");
    }
    
    if (validFiles.length > 0) {
      formik.setFieldValue("multi_images", [...formik.values.multi_images, ...validFiles]);
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setMultiImagesPreviews(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMultiImage = (index: number, isExisting: boolean = false) => {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/myprofessionalservices')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 font-medium transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Services
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            {id ? 'Edit Professional Service' : 'Add Professional Service'}
          </h1>
          <p className="text-slate-500">
            Fill in the details for your professional service business
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <FaBuilding className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-800">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Service Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="subcategory"
                  value={formik.values.subcategory}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="">Select Category</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.subcategory_name}</option>
                  ))}
                </select>
                {subcategories.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Loading categories...</p>
                )}
                {renderError("subcategory")}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formik.values.business_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter business name"
                />
                {renderError("business_name")}
              </div>

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
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter complete address with street, area, pincode"
                />
                {renderError("address")}
              </div>

              {/* Country, State, City Dropdowns - Like AddGymService */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                {id && formik.values.country ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-sm text-slate-500">Current:</span>
                      <strong className="text-slate-800">{formik.values.country}</strong>
                      <button 
                        type="button" 
                        onClick={() => { 
                          setCountryId(0); 
                          setStateId(0); 
                          formik.setFieldValue("country", ""); 
                          formik.setFieldValue("state", ""); 
                          formik.setFieldValue("city", ""); 
                        }}
                        className="ml-auto text-xs text-red-600 hover:text-red-800"
                      >
                        Change
                      </button>
                    </div>
                    {countryId === 0 && (
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
                        placeHolder="Select New Country" 
                      />
                    )}
                  </div>
                ) : (
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
                )}
                {renderError("country")}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                {id && formik.values.state && countryId === 0 ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-sm text-slate-500">Current:</span>
                    <strong className="text-slate-800">{formik.values.state}</strong>
                  </div>
                ) : countryId > 0 ? (
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                {id && formik.values.city && stateId === 0 ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-sm text-slate-500">Current:</span>
                    <strong className="text-slate-800">{formik.values.city}</strong>
                  </div>
                ) : stateId > 0 ? (
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
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Paste the Google Maps share link of your business location</p>
                {renderError("location")}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <FiPhone className="w-5 h-5 text-indigo-500" />
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
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="9876543210"
                  />
                </div>
                {renderError("contact_no")}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <FiMessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                  <input
                    type="tel"
                    name="whatsapp_no"
                    value={formik.values.whatsapp_no}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="9876543210"
                  />
                </div>
                {renderError("whatsapp_no")}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email ID
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
                  <input
                    type="email"
                    name="gmail_id"
                    value={formik.values.gmail_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="business@gmail.com"
                  />
                </div>
                {renderError("gmail_id")}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <FiInfo className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-800">Description</h2>
            </div>
            <CKEditor
              editor={ClassicEditor as any}
              data={formik.values.description}
              onChange={(_, editor) => formik.setFieldValue("description", editor.getData())}
              config={{
                placeholder: "Describe your services, experience, specialties, etc.",
              }}
            />
            {renderError("description")}
            <p className="text-xs text-slate-400 mt-2">Minimum 50 characters. Describe what makes your service unique.</p>
          </div>

          {/* Images Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <FiImage className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-800">Images</h2>
            </div>

            {/* Existing Images Display */}
            {(existingMainImage || existingMultiImages.length > 0) && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Current Images</h3>
                <div className="flex flex-wrap gap-4">
                  {existingMainImage && (
                    <div className="relative group">
                      <img src={existingMainImage} alt="Main" className="w-28 h-28 object-cover rounded-xl border-2 border-indigo-200" />
                      <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-lg">Main</span>
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
                      <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-lg">Gallery</span>
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
              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-6 hover:border-indigo-400 transition-colors bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
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
                    <FiUpload className="w-12 h-12 text-indigo-400 mb-3" />
                    <p className="text-sm text-indigo-600 text-center mb-2 font-medium">Click to upload main image</p>
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
                      className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Multi Images Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gallery Images
              </label>
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 hover:border-purple-400 transition-colors bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                <div className="flex flex-col items-center justify-center">
                  <FiImage className="w-12 h-12 text-purple-400 mb-3" />
                  <p className="text-sm text-purple-600 text-center mb-2 font-medium">Upload multiple images</p>
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
                    className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded-xl cursor-pointer hover:bg-purple-700 transition-colors"
                  >
                    Select Images
                  </label>
                </div>
                {formik.values.multi_images.length > 0 && (
                  <div className="mt-3 text-center">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
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
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
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
              onClick={() => navigate('/myprofessionalservices')}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap  -2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-lg shadow-indigo-200 font-medium transition-all"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {uploadProgress ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  {id ? 'Update Service' : 'Add Service'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProfessionalService;