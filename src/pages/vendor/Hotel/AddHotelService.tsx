// src/pages/vendor/hotel/AddHotelService.tsx
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
  FiMapPin,
  FiPlus,
  FiUser,
  FiDollarSign,
  FiHome,
  FiAward,
  FiCheckCircle,
  FiGlobe,
  FiMap,
  FiBriefcase
} from "react-icons/fi";
import { MdHotel, MdLocationOn, MdPhone, MdEmail, MdDescription, MdPhotoLibrary } from "react-icons/md";
import { motion } from "framer-motion";
import apiClient from "../../../api/apiClient";

interface Subcategory {
  id: number;
  subcategory_name: string;
}

interface RoomType {
  id?: number;
  room_type: string;
  person: number | string;
  rate: number | string;
}

const validationSchema = Yup.object({
  subcategory: Yup.string().required("Hotel category is required"),
  hotel_name: Yup.string()
    .min(3, "Hotel name must be at least 3 characters")
    .max(100, "Hotel name too long")
    .required("Hotel name is required"),
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
  hotel_rating: Yup.number()
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5")
    .nullable(),
  description: Yup.string()
    .min(50, "Description should be at least 50 characters")
    .required("Description is required"),
  room_category: Yup.string().required("Room category is required"),
});

const AddHotelService: React.FC = () => {
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
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { room_type: "", person: "", rate: "" }
  ]);

  // Fetch subcategories for Hotel
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await apiClient.get("service-subcategories/by_service/?service=Hotel");
        if (response.data) {
          if (response.data["Hotel"]) {
            setSubcategories(response.data["Hotel"]);
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
      apiClient.get(`/hotel-services/${id}/`)
        .then(res => {
          const data = res.data;
          setExistingMainImage(data.main_image || null);
          const multiImgs = (data.multi_images || []).map((img: any) => ({
            id: img.id,
            image: typeof img === 'string' ? img : img.image,
          }));
          setExistingMultiImages(multiImgs);
          
          if (data.room_types && data.room_types.length > 0) {
            setRoomTypes(data.room_types);
          }

          formik.setValues({
            subcategory: data.subcategory ? String(data.subcategory) : "",
            hotel_name: data.hotel_name || "",
            location: data.location || "",
            address: data.address || "",
            country: data.country || "",
            state: data.state || "",
            city: data.city || "",
            contact_no: data.contact_no || "",
            whatsapp_no: data.whatsapp_no || "",
            gmail_id: data.gmail_id || "",
            hotel_rating: data.hotel_rating || "",
            description: data.description || "",
            room_category: data.room_category || "manual",
            main_image: null,
            multi_images: [],
          });
        })
        .catch(() => {
          Swal.fire("Error!", "Failed to load hotel data.", "error");
          navigate('/hotelservices');
        })
        .finally(() => setLoadingData(false));
    }
  }, [id]);

  const formik = useFormik({
    initialValues: {
      subcategory: "",
      hotel_name: "",
      location: "",
      address: "",
      country: "",
      state: "",
      city: "",
      contact_no: "",
      whatsapp_no: "",
      gmail_id: "",
      hotel_rating: "",
      description: "",
      room_category: "manual",
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
        formData.append("hotel_name", values.hotel_name);
        formData.append("address", values.address);
        formData.append("location", values.location);
        formData.append("country", values.country);
        formData.append("state", values.state);
        formData.append("city", values.city);
        formData.append("contact_no", values.contact_no);
        if (values.whatsapp_no) formData.append("whatsapp_no", values.whatsapp_no);
        if (values.gmail_id) formData.append("gmail_id", values.gmail_id);
        if (values.hotel_rating) formData.append("hotel_rating", values.hotel_rating);
        formData.append("description", values.description);
        formData.append("room_category", values.room_category);
        if (values.main_image) formData.append("main_image", values.main_image);
        values.multi_images.forEach(img => formData.append("multi_images", img));

        const validRoomTypes = roomTypes.filter(r => r.room_type.trim() && r.person && r.rate);
        formData.append("room_types", JSON.stringify(validRoomTypes));

        if (id) {
          await apiClient.put(`/hotel-services/${id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          Swal.fire("Updated!", "Hotel service updated successfully!", "success");
        } else {
          await apiClient.post("/hotel-services/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          Swal.fire("Success!", "Hotel service added successfully!", "success");
        }
        navigate('/hotelservices');
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || "Failed to save hotel.";
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

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { room_type: "", person: "", rate: "" }]);
  };

  const removeRoomType = (index: number) => {
    if (roomTypes.length > 1) {
      setRoomTypes(roomTypes.filter((_, i) => i !== index));
    } else {
      Swal.fire("Warning!", "At least one room type is required.", "warning");
    }
  };

  const updateRoomType = (index: number, field: keyof RoomType, value: string | number) => {
    const updated = [...roomTypes];
    updated[index] = { ...updated[index], [field]: value };
    setRoomTypes(updated);
  };

  // Star Rating Component with Decimal Support
  const StarRating = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => {
    const [hover, setHover] = useState<number>(0);
    
    const handleRatingChange = (star: number) => {
      if (Math.floor(value) === star) {
        const decimal = value % 1;
        if (decimal === 0) {
          onChange(star + 0.5);
        } else if (decimal === 0.5) {
          onChange(star - 0.5);
        }
      } else {
        onChange(star);
      }
    };

    const getStarFill = (star: number) => {
      const currentValue = hover || value || 0;
      if (currentValue >= star) return 100;
      if (currentValue >= star - 1) {
        return ((currentValue - (star - 1)) * 100);
      }
      return 0;
    };

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const fillPercent = getStarFill(star);
            return (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="focus:outline-none transition-transform hover:scale-110 relative"
              >
                <div className="relative w-8 h-8">
                  <FiStar className="w-8 h-8 text-gray-300 absolute inset-0" />
                  <div 
                    className="absolute inset-0 overflow-hidden transition-all duration-200"
                    style={{ width: `${fillPercent}%` }}
                  >
                    <FiStar className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              </button>
            );
          })}
          {(hover || value) > 0 && (
            <span className="ml-2 text-sm font-semibold text-gray-600 min-w-[40px]">
              {(hover || value || 0).toFixed(1)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-slate-500">Or enter rating:</span>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={value || 0}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val >= 0 && val <= 5) {
                onChange(Math.round(val * 10) / 10);
              }
            }}
            className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center"
          />
          <span className="text-xs text-slate-400">/ 5</span>
        </div>
      </div>
    );
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  const isPremium = formik.values.room_category === "premium";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/hotelservices')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-medium transition-colors group"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Hotel Services
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200">
              <MdHotel className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">
                {id ? 'Edit Hotel Service' : 'Add Hotel Service'}
              </h1>
              <p className="text-slate-500">Fill in the details for your hotel business</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
                <FiHome className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Basic Information</h2>
              <span className="ml-auto text-xs text-slate-400">Step 1 of 5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hotel Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <select
                    name="subcategory"
                    value={formik.values.subcategory}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="">Select Category</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.subcategory_name}</option>
                    ))}
                  </select>
                </div>
                {renderError("subcategory")}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hotel Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MdHotel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="hotel_name"
                    value={formik.values.hotel_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter hotel name"
                  />
                </div>
                {renderError("hotel_name")}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MdLocationOn className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter complete address with street, area, pincode"
                  />
                </div>
                {renderError("address")}
              </div>

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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Google Maps Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
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
                <p className="text-xs text-slate-400 mt-1">Paste the Google Maps share link of your hotel location</p>
                {renderError("location")}
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-md">
                <FiPhone className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Contact Information</h2>
              <span className="ml-auto text-xs text-slate-400">Step 2 of 5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
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
                  <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="gmail_id"
                    value={formik.values.gmail_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="hotel@gmail.com"
                  />
                </div>
                {renderError("gmail_id")}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hotel Rating
                </label>
                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                  <StarRating 
                    value={formik.values.hotel_rating ? parseFloat(formik.values.hotel_rating) : 0}
                    onChange={(val) => formik.setFieldValue("hotel_rating", val)}
                  />
                  <input
                    type="hidden"
                    name="hotel_rating"
                    value={formik.values.hotel_rating}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {renderError("hotel_rating")}
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                <MdDescription className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Description</h2>
              <span className="ml-auto text-xs text-slate-400">Step 3 of 5</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hotel Description <span className="text-red-500">*</span>
              </label>
              <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <CKEditor
                  editor={ClassicEditor as any}
                  data={formik.values.description}
                  onChange={(_, editor) => formik.setFieldValue("description", editor.getData())}
                  config={{ 
                    placeholder: "Describe your hotel, amenities, services, location advantages, etc." 
                  }}
                />
              </div>
              {renderError("description")}
              <p className="text-xs text-slate-400 mt-2">Minimum 50 characters. Describe what makes your hotel unique.</p>
            </div>
          </motion.div>

          {/* Room Category & Room Types Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md">
                <FiHome className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Room Details</h2>
              <span className="ml-auto text-xs text-slate-400">Step 4 of 5</span>
            </div>

            {/* Room Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Room Category <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                <label className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  !isPremium 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="room_category"
                    value="manual"
                    checked={!isPremium}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Manual</span>
                </label>
                
                <label className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  isPremium 
                    ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-200/50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="room_category"
                    value="premium"
                    checked={isPremium}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <FiAward className={`w-4 h-4 ${isPremium ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${isPremium ? 'text-amber-600' : 'text-slate-700'}`}>
                      Premium
                    </span>
                    {isPremium && (
                      <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                </label>
              </div>
              {renderError("room_category")}
            </div>

            {/* Room Types Grid */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-slate-700">
                  Room Types
                </label>
                <button
                  type="button"
                  onClick={addRoomType}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  <FiPlus className="w-4 h-4" /> Add Room
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Room Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Persons</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rate (₹)</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {roomTypes.map((room, index) => (
                      <motion.tr 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={room.room_type}
                            onChange={(e) => updateRoomType(index, "room_type", e.target.value)}
                            placeholder="e.g., Deluxe Room"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={room.person}
                            onChange={(e) => updateRoomType(index, "person", parseInt(e.target.value) || "")}
                            placeholder="2"
                            min="1"
                            className="w-20 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={room.rate}
                            onChange={(e) => updateRoomType(index, "rate", parseFloat(e.target.value) || "")}
                            placeholder="4999"
                            min="0"
                            step="any"
                            className="w-28 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeRoomType(index)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {roomTypes.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  No room types added. Click "Add Room" to add.
                </div>
              )}
              {isPremium && (
                <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl flex items-start gap-2">
                  <FiAward className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">Premium Category:</span> Your hotel will be featured with a premium badge and priority listing.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Images Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-md">
                <MdPhotoLibrary className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Images</h2>
              <span className="ml-auto text-xs text-slate-400">Step 5 of 5</span>
            </div>

            {/* Existing Images */}
            {(existingMainImage || existingMultiImages.length > 0) && (
              <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <FiImage className="w-4 h-4" /> Current Images
                </h3>
                <div className="flex flex-wrap gap-4">
                  {existingMainImage && (
                    <div className="relative group">
                      <img src={existingMainImage} alt="Main" className="w-28 h-28 object-cover rounded-xl border-2 border-blue-200 shadow-md" />
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-lg">Main</span>
                      <button
                        type="button"
                        onClick={removeMainImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {existingMultiImages.map((img, idx) => (
                    <div key={img.id} className="relative group">
                      <img src={img.image} alt={`Gallery ${idx + 1}`} className="w-28 h-28 object-cover rounded-xl border border-slate-200 shadow-md" />
                      <span className="absolute bottom-1 left-1 bg-teal-600 text-white text-xs px-2 py-0.5 rounded-lg">Gallery</span>
                      <button
                        type="button"
                        onClick={() => removeMultiImage(idx, true)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
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
              <div className={`border-2 border-dashed rounded-xl p-6 transition-all bg-gradient-to-br ${
                (mainImagePreview || existingMainImage) 
                  ? 'border-green-400 bg-green-50/30' 
                  : 'border-blue-300 hover:border-blue-400 bg-blue-50/30'
              }`}>
                {(mainImagePreview || existingMainImage) ? (
                  <div className="relative">
                    <img
                      src={mainImagePreview || existingMainImage || ''}
                      alt="Main Preview"
                      className="w-full h-56 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removeMainImage}
                      className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                      <FiUpload className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-sm text-blue-600 text-center mb-1 font-medium">Click to upload main image</p>
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
                      className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-xl cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md hover:shadow-lg"
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
              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-6 hover:border-indigo-400 transition-all bg-gradient-to-br from-indigo-50/30 to-blue-50/30">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-3 shadow-md">
                    <FiImage className="w-7 h-7 text-indigo-500" />
                  </div>
                  <p className="text-sm text-indigo-600 text-center mb-1 font-medium">Upload multiple images</p>
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
                    className="mt-3 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm rounded-xl cursor-pointer hover:from-indigo-700 hover:to-blue-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    Select Images
                  </label>
                </div>
                {formik.values.multi_images.length > 0 && (
                  <div className="mt-3 text-center">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full shadow-sm">
                      {formik.values.multi_images.length} new file(s) selected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* New Gallery Images Preview */}
            {multiImagesPreviews.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <FiImage className="w-4 h-4" /> New Gallery Images ({multiImagesPreviews.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {multiImagesPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeMultiImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Submit Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky bottom-4 z-10"
          >
            <button
              type="button"
              onClick={() => navigate('/hotelservices')}
              className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-lg shadow-blue-200 font-medium transition-all"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  {id ? 'Update Hotel' : 'Add Hotel'}
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default AddHotelService;