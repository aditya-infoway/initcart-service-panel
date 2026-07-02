// src/pages/vendor/tech/AddTechIndustryService.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import { FiSave, FiPlus, FiTrash2, FiArrowLeft, FiX, FiImage } from "react-icons/fi";
import apiClient from "../../../api/apiClient";

interface ServiceItem { name: string; description: string; price: number; }

const validationSchema = Yup.object({
  subcategory: Yup.string().required("Subcategory is required"),
  businessName: Yup.string().required("Business name is required"),
  address: Yup.string().required("Address is required"),
  location: Yup.string().required("Location is required"),
  country: Yup.string().required("Country is required"),
  state: Yup.string().required("State is required"),
  city: Yup.string().required("City is required"),
  openTime: Yup.string().required("Opening time is required"),
  closeTime: Yup.string().required("Closing time is required"),
  contactNo: Yup.string().matches(/^[0-9]{10}$/, "Must be 10 digits").required("Contact number is required"),
  description: Yup.string().required("Description is required"),
});

const AddTechIndustryService: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [countryId, setCountryId] = useState<number>(0);
  const [stateId, setStateId] = useState<number>(0);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [secondImagePreview, setSecondImagePreview] = useState<string | null>(null); 

  const [multiImagesPreviews, setMultiImagesPreviews] = useState<string[]>([]);
  const [existingMainImage, setExistingMainImage] = useState<string | null>(null);
  const [existingSecondImage, setExistingSecondImage] = useState<string | null>(null);
  const [existingMultiImages, setExistingMultiImages] = useState<string[]>([]);

  useEffect(() => {
    apiClient.get("service-subcategories/by_service/?service=Tech Industry")
      .then(res => { if (res.data) setSubcategories(res.data["Tech Industry"] || []); })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (id) {
      setLoadingData(true);
      apiClient.get(`/tech-services/${id}/`).then(res => {
        const data = res.data;
        setExistingMainImage(data.main_image || null);
        setExistingSecondImage(data.second_image || null);
        const multiImgs = (data.multi_images || []).map((img: any) => typeof img === 'string' ? img : img.image || img.image_url || '').filter(Boolean);
        setExistingMultiImages(multiImgs);
        
        formik.setValues({
          subcategory: data.subcategory ? String(data.subcategory) : "",
          businessName: data.business_name || "", location: data.location || "",
          country: data.country || "", state: data.state || "", city: data.city || "",
          address: data.address || "", openTime: data.open_time || "", closeTime: data.close_time || "",
          contactNo: data.contact_no || "", whatsappNo: data.whatsapp_no || "",
          description: data.description || "", main_image: null, second_image: null, multi_images: [],
          services: data.items?.length ? data.items : [{ name: "", description: "", price: 0 }],
        });
      }).catch(() => { Swal.fire("Error!", "Failed to load.", "error"); navigate('/tech-services'); })
      .finally(() => setLoadingData(false));
    }
  }, [id]);

  const formik = useFormik({
    initialValues: { subcategory: "", businessName: "", location: "", country: "", state: "", city: "", address: "", openTime: "", closeTime: "", contactNo: "", whatsappNo: "", description: "", main_image: null as File | null, second_image: null as File | null, multi_images: [] as File[], services: [{ name: "", description: "", price: 0 }] as ServiceItem[] },
    enableReinitialize: true, validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("subcategory", values.subcategory);
        formData.append("business_name", values.businessName);
        formData.append("address", values.address);
        formData.append("location", values.location);
        formData.append("country", values.country);
        formData.append("state", values.state);
        formData.append("city", values.city);
        formData.append("open_time", values.openTime);
        formData.append("close_time", values.closeTime);
        formData.append("contact_no", values.contactNo);
        formData.append("whatsapp_no", values.whatsappNo);
        formData.append("description", values.description);
        if (values.main_image) formData.append("main_image", values.main_image);
        if (values.second_image) formData.append("second_image", values.second_image);
        values.multi_images.forEach(img => formData.append("multi_images", img));
        const validServices = values.services.filter(s => s.name.trim() !== "");
        formData.append("items", JSON.stringify(validServices));

        if (id) {
          await apiClient.put(`/tech-services/${id}/`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await apiClient.post("/tech-services/", formData, { headers: { "Content-Type": "multipart/form-data" } });
        }
        Swal.fire("Success!", `Service ${id ? "updated" : "added"}!`, "success");
        navigate('/tech-services');
      } catch (error: any) {
        Swal.fire("Error!", error.response?.data?.detail || "Failed to save.", "error");
      } finally { setIsLoading(false); }
    },
  });

  const renderError = (field: string) => formik.touched[field as keyof typeof formik.values] && formik.errors[field as keyof typeof formik.values] ? <div className="text-red-500 text-sm mt-1">{formik.errors[field as keyof typeof formik.values] as string}</div> : null;
  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0] || null; if (file) { formik.setFieldValue("main_image", file); const reader = new FileReader(); reader.onloadend = () => setMainImagePreview(reader.result as string); reader.readAsDataURL(file); } };
  const handleSecondImage = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0] || null; if (file) { formik.setFieldValue("second_image", file); const reader = new FileReader(); reader.onloadend = () => setSecondImagePreview(reader.result as string); reader.readAsDataURL(file); } };
  const handleMultiImages = (e: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(e.target.files || []); if (files.length > 0) { formik.setFieldValue("multi_images", [...formik.values.multi_images, ...files]); files.forEach(file => { const reader = new FileReader(); reader.onloadend = () => setMultiImagesPreviews(prev => [...prev, reader.result as string]); reader.readAsDataURL(file); }); } };
  const removeMultiImage = (index: number) => { const newImages = [...formik.values.multi_images]; const newPreviews = [...multiImagesPreviews]; newImages.splice(index, 1); newPreviews.splice(index, 1); formik.setFieldValue("multi_images", newImages); setMultiImagesPreviews(newPreviews); };
  const addServiceRow = () => formik.setFieldValue("services", [...formik.values.services, { name: "", description: "", price: 0 }]);
  const deleteServiceRow = (index: number) => { const updated = [...formik.values.services]; updated.splice(index, 1); formik.setFieldValue("services", updated); };

  if (loadingData) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate('/tech-services')} className="flex items-center gap-2 text-cyan-600 hover:text-cyan-800 mb-4 font-medium"><FiArrowLeft className="w-5 h-5" />Back to Services</button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{id ? 'Edit Tech Service' : 'Add Tech Service'}</h1>
          <p className="text-gray-600">Fill in the details for your tech business</p>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Service Category *</label><select name="subcategory" value={formik.values.subcategory} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"><option value="">Select Category</option>{subcategories.map((sub) => (<option key={sub.id} value={sub.id}>{sub.subcategory_name}</option>))}</select>{renderError("subcategory")}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label><input type="text" name="businessName" value={formik.values.businessName} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="Enter business name" />{renderError("businessName")}</div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label><textarea name="address" value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="Enter complete address" />{renderError("address")}</div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Location / Map Link *</label><input type="text" name="location" value={formik.values.location} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="Enter Google Maps URL" />{renderError("location")}</div>
              {/* Country with prefill */}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>{id && formik.values.country ? (<div className="space-y-2"><div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"><span className="text-sm text-gray-500">Current:</span><strong className="text-gray-800">{formik.values.country}</strong><button type="button" onClick={() => { setCountryId(0); setStateId(0); formik.setFieldValue("country", ""); formik.setFieldValue("state", ""); formik.setFieldValue("city", ""); }} className="ml-auto text-xs text-red-600 hover:text-red-800">Change</button></div>{countryId === 0 && (<CountrySelect value={countryId} onChange={(selected: any) => { if (selected) { formik.setFieldValue("country", selected.name); setCountryId(selected.id); setStateId(0); formik.setFieldValue("state", ""); formik.setFieldValue("city", ""); } }} placeHolder="Select New Country" />)}</div>) : (<CountrySelect value={countryId} onChange={(selected: any) => { if (selected) { formik.setFieldValue("country", selected.name); setCountryId(selected.id); setStateId(0); formik.setFieldValue("state", ""); formik.setFieldValue("city", ""); } }} placeHolder="Select Country" />)}{renderError("country")}</div>
              {/* State with prefill */}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">State *</label>{id && formik.values.state && countryId === 0 ? (<div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"><span className="text-sm text-gray-500">Current:</span><strong className="text-gray-800">{formik.values.state}</strong></div>) : countryId > 0 ? (<StateSelect countryid={countryId} value={formik.values.state} onChange={(selected: any) => { if (selected) { formik.setFieldValue("state", selected.name); setStateId(selected.id); formik.setFieldValue("city", ""); } }} placeHolder="Select State" />) : (<div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 text-sm">Select country first</div>)}{renderError("state")}</div>
              {/* City with prefill */}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label>{id && formik.values.city && stateId === 0 ? (<div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"><span className="text-sm text-gray-500">Current:</span><strong className="text-gray-800">{formik.values.city}</strong></div>) : stateId > 0 ? (<CitySelect countryid={countryId} stateid={stateId} value={formik.values.city} onChange={(selected: any) => { if (selected) formik.setFieldValue("city", selected.name); }} placeHolder="Select City" />) : (<div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 text-sm">Select state first</div>)}{renderError("city")}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Opening Time *</label><input type="time" name="openTime" value={formik.values.openTime} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />{renderError("openTime")}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Closing Time *</label><input type="time" name="closeTime" value={formik.values.closeTime} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />{renderError("closeTime")}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label><input type="tel" name="contactNo" value={formik.values.contactNo} onChange={formik.handleChange} onBlur={formik.handleBlur} maxLength={10} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="Enter 10-digit number" />{renderError("contactNo")}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label><input type="tel" name="whatsappNo" value={formik.values.whatsappNo} onChange={formik.handleChange} onBlur={formik.handleBlur} maxLength={10} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="Enter WhatsApp number" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6"><h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Description</h2><CKEditor editor={ClassicEditor as any} data={formik.values.description} onChange={(_, editor) => formik.setFieldValue("description", editor.getData())} />{renderError("description")}</div>
          {/* Images section - same pattern as gym/salon */}
{/* Images Section */}
<div className="bg-white rounded-xl shadow-lg p-6">
  <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Images</h2>
  
  {/* Existing Images */}
  {(existingMainImage || existingSecondImage || existingMultiImages.length > 0) && (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
      <div className="flex flex-wrap gap-4">
        {existingMainImage && (
          <div className="relative">
            <img src={existingMainImage} alt="Main" className="w-32 h-32 object-cover rounded-lg border" />
            <span className="absolute bottom-1 left-1 bg-cyan-600 text-white text-xs px-2 py-0.5 rounded">Main</span>
          </div>
        )}
        {existingSecondImage && (
          <div className="relative">
            <img src={existingSecondImage} alt="Second" className="w-32 h-32 object-cover rounded-lg border" />
            <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">Second</span>
          </div>
        )}
        {existingMultiImages.map((img, idx) => (
          <div key={idx} className="relative">
            <img src={img} alt={`Multi ${idx + 1}`} className="w-32 h-32 object-cover rounded-lg border" />
            <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded">Gallery</span>
          </div>
        ))}
      </div>
    </div>
  )}

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Main Image */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Main Image {!id && <span className="text-red-500">*</span>}
      </label>
      <div className="border-2 border-dashed border-cyan-300 rounded-lg p-4 hover:border-cyan-400 transition-colors bg-cyan-50 min-h-[200px] flex flex-col">
        {(mainImagePreview || existingMainImage) ? (
          <div className="flex-1 relative">
            <img
              src={mainImagePreview || existingMainImage || ''}
              alt="Main Preview"
              className="w-full h-40 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => {
                formik.setFieldValue("main_image", null);
                setMainImagePreview(null);
              }}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <FiImage className="w-10 h-10 text-cyan-400 mb-2" />
            <p className="text-sm text-cyan-600 text-center mb-1">Main Image</p>
            <p className="text-xs text-gray-500 text-center mb-3">800x600px recommended</p>
            <input
              type="file"
              id="main_image"
              className="hidden"
              onChange={handleMainImage}
              accept=".jpg,.jpeg,.png,.webp"
            />
            <label
              htmlFor="main_image"
              className="px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-lg cursor-pointer hover:bg-cyan-700"
            >
              Upload
            </label>
          </div>
        )}
      </div>
    </div>

    {/* Second Image */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Second Image</label>
      <div className="border-2 border-dashed border-green-300 rounded-lg p-4 hover:border-green-400 transition-colors bg-green-50 min-h-[200px] flex flex-col">
        {(secondImagePreview || existingSecondImage) ? (
          <div className="flex-1 relative">
            <img
              src={secondImagePreview || existingSecondImage || ''}
              alt="Second Preview"
              className="w-full h-40 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => {
                formik.setFieldValue("second_image", null);
                setSecondImagePreview(null);
              }}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <FiImage className="w-10 h-10 text-green-400 mb-2" />
            <p className="text-sm text-green-600 text-center mb-1">Second Image</p>
            <p className="text-xs text-gray-500 text-center mb-3">800x600px recommended</p>
            <input
              type="file"
              id="second_image"
              className="hidden"
              onChange={handleSecondImage}
              accept=".jpg,.jpeg,.png,.webp"
            />
            <label
              htmlFor="second_image"
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg cursor-pointer hover:bg-green-700"
            >
              Upload
            </label>
          </div>
        )}
      </div>
    </div>

    {/* Gallery Images */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
      <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 hover:border-purple-400 transition-colors bg-purple-50 min-h-[200px] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <FiImage className="w-10 h-10 text-purple-400 mb-2" />
          <p className="text-sm text-purple-600 text-center mb-1">Multiple Images</p>
          <p className="text-xs text-gray-500 text-center mb-3">Add gallery images</p>
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
            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg cursor-pointer hover:bg-purple-700"
          >
            Upload
          </label>
        </div>
        {formik.values.multi_images.length > 0 && (
          <div className="mt-3 pt-3 border-t border-purple-200">
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              {formik.values.multi_images.length} files selected
            </span>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* New Multi Images Preview */}
  {multiImagesPreviews.length > 0 && (
    <div className="mt-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        New Gallery Images ({multiImagesPreviews.length})
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {multiImagesPreviews.map((preview, index) => (
          <div key={index} className="relative group">
            <img
              src={preview}
              alt={`Gallery ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg border border-gray-200"
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
          {/* Services */}
          <div className="bg-white rounded-xl shadow-lg p-6"><div className="flex items-center justify-between mb-6 border-b pb-2"><h2 className="text-xl font-bold text-gray-800">Services / Packages</h2><button type="button" onClick={addServiceRow} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"><FiPlus className="w-4 h-4" />Add Service</button></div>{formik.values.services.map((srv, index) => (<div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 p-4 bg-gray-50 rounded-lg items-start"><div className="md:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label><input type="text" placeholder="Service name" value={srv.name} onChange={e => { const updated = [...formik.values.services]; updated[index].name = e.target.value; formik.setFieldValue("services", updated); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" /></div><div className="md:col-span-5"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="text" placeholder="Description" value={srv.description} onChange={e => { const updated = [...formik.values.services]; updated[index].description = e.target.value; formik.setFieldValue("services", updated); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" /></div><div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label><input type="number" placeholder="Price" value={srv.price} onChange={e => { const updated = [...formik.values.services]; updated[index].price = Number(e.target.value); formik.setFieldValue("services", updated); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" /></div><div className="md:col-span-2 flex items-end h-full pt-6"><button type="button" onClick={() => deleteServiceRow(index)} className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center justify-center gap-1"><FiTrash2 className="w-4 h-4" />Remove</button></div></div>))}</div>
          {/* Submit */}
          <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-6">
            <button type="button" onClick={() => navigate('/tech-services')} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 shadow-md">{isLoading ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Saving...</>) : (<><FiSave className="w-5 h-5" />{id ? 'Update Service' : 'Add Service'}</>)}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTechIndustryService;