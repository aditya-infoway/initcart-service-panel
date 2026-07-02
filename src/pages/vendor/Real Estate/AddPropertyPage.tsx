// src/pages/vendor/realestate/AddPropertyPage.tsx
import { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import {
  FiUpload,
  FiMapPin,
  FiHome,
  FiDollarSign,
  FiCheck,
  FiFileText,
  FiImage,
  FiX,
  FiTrash2
} from "react-icons/fi";
import apiClient from "../../../api/apiClient";

const API_BASE_URL = 'https://api.initcart.in/api';

interface PropertyFormData {
  // 1. Property Information
  userId: string;
  description: string;
  transactionType: string;
  address: string;
  googleMapPin: string;
  propertyTitle: string;
  propertyType: string;
  city: string;
  state: string;
  pincode: string;

  // 2. Property Specifications
  totalAreaSize: string;
  carpetArea: string;
  bedrooms: string;
  bathrooms: string;
  balconies: string;
  furnishingStatus: string;
  floorNumber: string;
  totalFloors: string;
  facingDirection: string;
  propertyAge: string;

  // 3. Legal & Ownership Info
  ownershipType: string;
  encumbranceCertificate: string;
  documents: File | null;
  reaNumber: string;
  loanAvailability: string;
  documentsAvailable: string;
  negotiable: string;

  // 4. Price Info & Contact Info
  price: string;
  maintenanceCharges: string;
  bookingAmount: string;

  // Amenities
  amenities: string[];

  // Nearby Facilities
  nearbyFacilities: string[];

  // Contact Information
  contactType: "user" | "other";
  name: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  preferredTime: string;

  // Images
  mainImage: File | null;
  thumbnailImage: File | null;
  additionalImages: File[];
}

// Extended interface for dynamic distance fields
interface ExtendedPropertyFormData extends PropertyFormData {
  subcategory: string;
  schoolsCollegesDistance?: string;
  railwayStationBusStopDistance?: string;
  hospitalsDistance?: string;
  templesParksDistance?: string;
  marketsShoppingMallsDistance?: string;
}

const validationSchema = Yup.object({
  // Property Information
  description: Yup.string().required("Description is required"),
  transactionType: Yup.string().required("Transaction Type is required"),
  address: Yup.string().required("Address is required"),
  propertyTitle: Yup.string().required("Property Title is required"),
  propertyType: Yup.string().required("Property Type is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
  facingDirection: Yup.string().required("Facing Direction is required"),
  ownershipType: Yup.string().required("Ownership Type is required"),

  // Property Specifications - Number validation
  totalAreaSize: Yup.string()
    .test('is-number', 'Total Area Size must be a number', value => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    })
    .required("Total Area Size is required"),

  carpetArea: Yup.string()
    .test('is-number', 'Carpet Area must be a number', value => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    })
    .required("Carpet Area is required"),

  bedrooms: Yup.string()
    .matches(/^[0-9]+$/, "Bedrooms must be a number")
    .required("Number of Bedrooms is required"),

  bathrooms: Yup.string()
    .matches(/^[0-9]+(\+)?$/, "Bathrooms must be a number or number+")
    .required("Number of Bathrooms is required"),

  balconies: Yup.string()
    .matches(/^[0-9]+$/, "Balconies must be a number")
    .required("Number of Balconies is required"),

  furnishingStatus: Yup.string().required("Furnishing Status is required"),

  floorNumber: Yup.string()
    .matches(/^[0-9]+$/, "Floor Number must be a number")
    .required("Floor Number is required"),

  totalFloors: Yup.string()
    .matches(/^[0-9]+$/, "Total Floors must be a number")
    .required("Total Floors is required"),

  propertyAge: Yup.string().required("Property Age is required"),

  // Price Info & Contact Info - Number validation
  price: Yup.string()
    .test('is-number', 'Price must be a number', value => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    })
    .required("Price is required"),

  maintenanceCharges: Yup.string()
    .test('is-number', 'Maintenance Charges must be a number', value => {
      if (!value || value === '') return true; // Optional field
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    }),

  bookingAmount: Yup.string()
    .test('is-number', 'Booking Amount must be a number', value => {
      if (!value || value === '') return true; // Optional field
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    }),

  name: Yup.string().required("Name is required"),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Mobile Number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),

  // Images
  mainImage: Yup.mixed().required("Main image is required"),
  thumbnailImage: Yup.mixed().required("Thumbnail image is required"),
});

const AddPropertyPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("property");
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [isFetchingVendorInfo, setIsFetchingVendorInfo] = useState(false);
  const [capturedLocation, setCapturedLocation] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null
  });

  // Refs for file inputs
  const mainImageRef = useRef<HTMLInputElement>(null);
  const thumbnailImageRef = useRef<HTMLInputElement>(null);
  const additionalImagesRef = useRef<HTMLInputElement>(null);

  // Image preview states
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [thumbnailImagePreview, setThumbnailImagePreview] = useState<string | null>(null);
  const [additionalImagesPreviews, setAdditionalImagesPreviews] = useState<string[]>([]);

  // Get auth token helper
  const getAuthToken = () => {
    return localStorage.getItem('access') || localStorage.getItem('access_token');
  };

  // Fetch vendor info on component mount
  useEffect(() => {
    const fetchVendorInfo = async () => {
      try {
        setIsFetchingVendorInfo(true);
        const token = getAuthToken();

        if (!token) {
          console.error("No access token found");
          setIsFetchingVendorInfo(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/services/real-estate/vendor/properties/contact_info/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setVendorInfo(data);
          console.log("Vendor info fetched:", data);
        } else {
          console.error("Failed to fetch vendor info:", response.status);
        }
      } catch (error) {
        console.error("Error fetching vendor info:", error);
      } finally {
        setIsFetchingVendorInfo(false);
      }
    };

    fetchVendorInfo();
  }, []);

  // Helper function to handle numeric input (type="text" but number only)
  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof ExtendedPropertyFormData,
    allowDecimal: boolean = true
  ) => {
    const value = e.target.value;

    // Allow only numbers and optionally decimal point
    if (allowDecimal) {
      // Allow numbers and single decimal point
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === '' || regex.test(value)) {
        formik.setFieldValue(fieldName, value);
      }
    } else {
      // Allow only integers
      const regex = /^[0-9]*$/;
      if (value === '' || regex.test(value)) {
        formik.setFieldValue(fieldName, value);
      }
    }
  };

  // Helper function to handle distance input
  const handleDistanceInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof ExtendedPropertyFormData
  ) => {
    const value = e.target.value;
    // Allow numbers and single decimal point for distance
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (value === '' || regex.test(value)) {
      formik.setFieldValue(fieldName, value);
    }
  };

  const formik = useFormik<ExtendedPropertyFormData>({
    initialValues: {
      // 1. Property Information
      userId: "",
      description: "",
      transactionType: "",
      address: "",
      googleMapPin: "",
      propertyTitle: "",
      propertyType: "",
      subcategory: "",
      city: "",
      state: "",
      pincode: "",

      // 2. Property Specifications
      totalAreaSize: "",
      carpetArea: "",
      bedrooms: "",
      bathrooms: "",
      balconies: "",
      furnishingStatus: "unfurnished",
      floorNumber: "",
      totalFloors: "",
      facingDirection: "east",
      propertyAge: "",

      // 3. Legal & Ownership Info
      ownershipType: "freehold",
      encumbranceCertificate: "",
      documents: null,
      reaNumber: "",
      loanAvailability: "",
      documentsAvailable: "",
      negotiable: "",

      // 4. Price Info & Contact Info
      price: "",
      maintenanceCharges: "0",
      bookingAmount: "0",

      // Amenities
      amenities: [],

      // Nearby Facilities
      nearbyFacilities: [],

      // Contact Information
      contactType: "user",
      name: "",
      mobileNumber: "",
      whatsappNumber: "",
      email: "",
      preferredTime: "",

      // Images
      mainImage: null,
      thumbnailImage: null,
      additionalImages: [],

      // Distance fields
      schoolsCollegesDistance: "",
      railwayStationBusStopDistance: "",
      hospitalsDistance: "",
      templesParksDistance: "",
      marketsShoppingMallsDistance: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      console.log("=== FORM SUBMISSION STARTED ===");
      console.log("Submitting form data:", JSON.stringify(values, null, 2));

      try {
        // Create FormData
        const formData = new FormData();

        // Helper function to safely append values
        const appendIfExists = (key: string, value: any) => {
          if (value !== null && value !== undefined && value !== '') {
            console.log(`📝 Appending ${key}:`, value);
            formData.append(key, value.toString());
            return true;
          }
          console.log(`⏭️ Skipping ${key} (empty/null)`);
          return false;
        };

        // Helper for boolean fields
        const appendBoolean = (key: string, value: string) => {
          if (value) {
            const boolValue = value === "Yes" ? "true" : "false";
            console.log(`🔘 Appending ${key}: ${boolValue} (from: ${value})`);
            formData.append(key, boolValue);
            return true;
          }
          console.log(`⏭️ Skipping ${key} (empty)`);
          return false;
        };

        console.log("=== 1. CONVERTING NUMERIC FIELDS ===");
        // Convert numeric fields
        const totalAreaSize = parseFloat(values.totalAreaSize) || 0;
        const carpetArea = parseFloat(values.carpetArea) || 0;
        const bedrooms = parseInt(values.bedrooms) || 0;
        const bathrooms = values.bathrooms; // Keep as string (CharField)
        const balconies = parseInt(values.balconies) || 0;
        const floorNumber = parseInt(values.floorNumber) || 0;
        const totalFloors = parseInt(values.totalFloors) || 0;
        const price = parseFloat(values.price) || 0;
        const maintenanceCharges = parseFloat(values.maintenanceCharges) || 0;
        const bookingAmount = parseFloat(values.bookingAmount) || 0;

        console.log(`📊 Numeric conversions:
      totalAreaSize: ${values.totalAreaSize} → ${totalAreaSize}
      carpetArea: ${values.carpetArea} → ${carpetArea}
      bedrooms: ${values.bedrooms} → ${bedrooms}
      bathrooms: ${values.bathrooms} (kept as string)
      balconies: ${values.balconies} → ${balconies}
      floorNumber: ${values.floorNumber} → ${floorNumber}
      totalFloors: ${values.totalFloors} → ${totalFloors}
      price: ${values.price} → ${price}
      maintenanceCharges: ${values.maintenanceCharges} → ${maintenanceCharges}
      bookingAmount: ${values.bookingAmount} → ${bookingAmount}
    `);

        // Ownership type mapping
        const getOwnershipTypeValue = (type: string): string => {
          const typeLower = type.toLowerCase();
          if (typeLower.includes('co-operative') || typeLower.includes('cooperative')) {
            return 'cooperative';
          }
          return typeLower;
        };

        console.log("=== 2. BASIC INFORMATION ===");
        // 1. Basic Information
        appendIfExists('title', values.propertyTitle);
        appendIfExists('description', values.description);
        appendIfExists('transaction_type', values.transactionType);
        appendIfExists('property_type', values.propertyType);
        appendIfExists('subcategory', values.subcategory);
        appendIfExists('address', values.address);
        appendIfExists('city', values.city);
        appendIfExists('state', values.state);
        appendIfExists('pincode', values.pincode);

        if (values.googleMapPin) {
          console.log("📍 Google Map URL:", values.googleMapPin);
          appendIfExists('google_map_url', values.googleMapPin);
        }

        // Add captured latitude and longitude if available
        if (capturedLocation.lat && capturedLocation.lng) {
          console.log("🌍 Adding captured location:");
          console.log(`   Latitude: ${capturedLocation.lat}`);
          console.log(`   Longitude: ${capturedLocation.lng}`);
          appendIfExists('latitude', capturedLocation.lat.toString());
          appendIfExists('longitude', capturedLocation.lng.toString());
        } else {
          console.log("🌍 No location captured");
        }

        console.log("=== 3. SPECIFICATIONS ===");
        // 2. Specifications - Use converted values
        appendIfExists('total_area_size', totalAreaSize.toString());
        appendIfExists('carpet_area', carpetArea.toString());
        appendIfExists('bedrooms', bedrooms.toString());
        appendIfExists('bathrooms', bathrooms); // String value
        appendIfExists('balconies', balconies.toString());
        appendIfExists('furnishing_status', values.furnishingStatus);
        appendIfExists('floor_number', floorNumber.toString());
        appendIfExists('total_floors', totalFloors.toString());
        appendIfExists('facing_direction', values.facingDirection);
        appendIfExists('property_age', values.propertyAge);

        console.log("=== 4. LEGAL & OWNERSHIP ===");
        // 3. Legal & Ownership
        const ownershipValue = getOwnershipTypeValue(values.ownershipType);
        console.log(`🏠 Ownership type: ${values.ownershipType} → ${ownershipValue}`);
        appendIfExists('ownership_type', ownershipValue);

        if (values.encumbranceCertificate) {
          console.log("📄 Encumbrance certificate:", values.encumbranceCertificate);
          appendIfExists('encumbrance_certificate', values.encumbranceCertificate);
        }

        if (values.reaNumber) {
          console.log("🏢 REA Number:", values.reaNumber);
          appendIfExists('rea_number', values.reaNumber);
        }

        // Handle boolean fields
        console.log("📋 Boolean fields:");
        appendBoolean('loan_availability', values.loanAvailability);

        if (values.documentsAvailable) {
          const docsValue = values.documentsAvailable.toLowerCase();
          console.log(`📑 Documents available: ${values.documentsAvailable} → ${docsValue}`);
          appendIfExists('documents_available', docsValue);
        }

        appendBoolean('negotiable', values.negotiable);

        console.log("=== 5. PRICE INFORMATION ===");
        // 4. Price - Use converted values
        appendIfExists('price', price.toString());
        appendIfExists('maintenance_charges', maintenanceCharges.toString());
        appendIfExists('booking_amount', bookingAmount.toString());

        console.log("=== 6. CONTACT INFORMATION ===");
        // 5. Contact Information
        const useVendorInfo = values.contactType === "user";
        console.log(`📞 Contact type: ${values.contactType} (use_vendor_info: ${useVendorInfo})`);
        formData.append('use_vendor_info', useVendorInfo.toString());

        appendIfExists('contact_name', values.name);
        appendIfExists('contact_mobile', values.mobileNumber);

        if (values.whatsappNumber) {
          console.log("💬 WhatsApp number:", values.whatsappNumber);
          appendIfExists('contact_whatsapp', values.whatsappNumber);
        }

        appendIfExists('contact_email', values.email);

        if (values.preferredTime) {
          console.log("⏰ Preferred time:", values.preferredTime);
          appendIfExists('contact_preferred_time', values.preferredTime);
        }

        console.log("=== 7. STATUS ===");
        // 6. Status - IMPORTANT: Always set to pending
        console.log("🚦 Setting status to 'pending'");
        formData.append('status', 'pending');

        console.log("=== 8. IMAGES & DOCUMENTS ===");
        // 7. Images
        if (values.mainImage) {
          console.log("🖼️ Main image:", {
            name: values.mainImage.name,
            type: values.mainImage.type,
            size: values.mainImage.size,
            lastModified: values.mainImage.lastModified
          });
          formData.append('main_image', values.mainImage);
        } else {
          console.log("❌ Main image is required but not provided");
        }

        if (values.thumbnailImage) {
          console.log("🖼️ Thumbnail image:", {
            name: values.thumbnailImage.name,
            type: values.thumbnailImage.type,
            size: values.thumbnailImage.size
          });
          formData.append('thumbnail_image', values.thumbnailImage);
        } else {
          console.log("❌ Thumbnail image is required but not provided");
        }

        if (values.additionalImages.length > 0) {
          console.log(`📸 ${values.additionalImages.length} additional images:`);
          values.additionalImages.forEach((file, index) => {
            console.log(`   ${index + 1}. ${file.name} (${file.type}, ${file.size} bytes)`);
            formData.append('additional_images', file);
          });
        } else {
          console.log("📸 No additional images");
        }

        // 8. Document
        if (values.documents) {
          console.log("📎 Document file:", {
            name: values.documents.name,
            type: values.documents.type,
            size: values.documents.size
          });
          formData.append('documents', values.documents);
        } else {
          console.log("📎 No document file");
        }

        console.log("=== 9. AMENITIES ===");
        // 9. Amenities (as array)
        if (values.amenities && values.amenities.length > 0) {
          const amenitiesArray = values.amenities.map(amenity => amenity.trim());
          console.log(`🏊 ${amenitiesArray.length} amenities:`, amenitiesArray);
          const amenitiesJson = JSON.stringify(amenitiesArray);
          console.log("🔤 Amenities JSON:", amenitiesJson);
          formData.append('amenities', amenitiesJson);
        } else {
          console.log("🏊 No amenities selected");
          formData.append('amenities', JSON.stringify([]));
        }

        console.log("=== 10. NEARBY FACILITIES ===");
        // 10. Nearby Facilities with distances - PROPER JSON FORMAT
        const nearbyFacilitiesDict: Record<string, string> = {};

        if (values.nearbyFacilities.length > 0) {
          console.log(`📍 ${values.nearbyFacilities.length} nearby facilities:`);

          values.nearbyFacilities.forEach((facility) => {
            const distanceKey = getDistanceFieldName(facility);
            const distanceValue = values[distanceKey as keyof ExtendedPropertyFormData];

            // Safely get distance value
            let distance = '';
            if (distanceValue !== undefined && distanceValue !== null && distanceValue !== '') {
              distance = String(distanceValue).trim();

              // Validate it's a proper number
              if (distance && !isNaN(parseFloat(distance))) {
                const cleanDistance = parseFloat(distance).toString();
                console.log(`   🛣️ ${facility}: ${cleanDistance} km`);

                // Add to dictionary instead of separate formData entries
                nearbyFacilitiesDict[facility] = cleanDistance;
              } else {
                console.log(`   🛣️ ${facility}: Invalid distance value - ${distanceValue}`);
              }
            } else {
              console.log(`   🛣️ ${facility}: No distance provided`);
            }
          });

          // Convert to JSON string and append as single field
          if (Object.keys(nearbyFacilitiesDict).length > 0) {
            const nearbyFacilitiesJson = JSON.stringify(nearbyFacilitiesDict);
            console.log("🔤 Nearby Facilities JSON:", nearbyFacilitiesJson);
            formData.append('nearby_facilities', nearbyFacilitiesJson);
          } else {
            console.log("📍 Nearby facilities selected but no valid distances provided");
            formData.append('nearby_facilities', JSON.stringify({}));
          }
        } else {
          console.log("📍 No nearby facilities selected");
          formData.append('nearby_facilities', JSON.stringify({}));
        }


        // Detailed FormData logging
        console.log("=== 📊 FINAL FORMDATA CONTENTS ===");
        let formDataSize = 0;
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`📁 ${key}: File - ${value.name}, ${value.type}, ${value.size} bytes`);
            formDataSize += value.size;
          } else {
            console.log(`📝 ${key}: ${value}`);
            formDataSize += String(value).length;
          }
        }
        console.log(`📦 Total FormData estimated size: ${formDataSize} bytes (${(formDataSize / 1024).toFixed(2)} KB)`);
        console.log("=== END FORMDATA ===");

        // Get auth token
        const token = getAuthToken();
        if (!token) {
          console.error("❌ No authentication token found");
          Swal.fire({
            title: "Error!",
            text: "Authentication token not found. Please login again.",
            icon: "error",
            confirmButtonText: "OK"
          });
          setIsLoading(false);
          return;
        }

        console.log("✅ Authentication token found:", token.substring(0, 20) + "...");

        // Make API call
        const API_URL = `${API_BASE_URL}/services/real-estate/vendor/properties/`;
        console.log("🌐 Making API call to:", API_URL);
        console.log("🔑 Authorization header:", `Bearer ${token.substring(0, 20)}...`);

        // Start timing
        const startTime = Date.now();

        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              // Note: Don't set Content-Type for FormData - browser sets it automatically
            },
            body: formData,
          });

          const endTime = Date.now();
          const responseTime = endTime - startTime;
          console.log(`⏱️ Response time: ${responseTime}ms`);
          console.log("📡 Response status:", response.status, response.statusText);

          // Log response headers
          console.log("📋 Response headers:");
          response.headers.forEach((value, key) => {
            console.log(`   ${key}: ${value}`);
          });

          if (response.ok) {
            const responseData = await response.json();
            console.log("✅ SUCCESS - API Response data:", responseData);

            Swal.fire({
              title: "Success!",
              text: "Property added successfully! It has been submitted for admin approval.",
              icon: "success",
              confirmButtonText: "OK"
            });

            // Reset form
            console.log("🔄 Resetting form...");
            formik.resetForm();
            setCapturedLocation({ lat: null, lng: null });

            // Clear file previews
            setMainImagePreview(null);
            setThumbnailImagePreview(null);
            setAdditionalImagesPreviews([]);

            // Clear file inputs
            if (mainImageRef.current) {
              mainImageRef.current.value = "";
              console.log("🧹 Cleared main image input");
            }
            if (thumbnailImageRef.current) {
              thumbnailImageRef.current.value = "";
              console.log("🧹 Cleared thumbnail image input");
            }
            if (additionalImagesRef.current) {
              additionalImagesRef.current.value = "";
              console.log("🧹 Cleared additional images input");
            }

            console.log("=== FORM SUBMISSION COMPLETED SUCCESSFULLY ===");

          } else {
            // Handle API errors
            console.error("❌ API Error - Status:", response.status);

            let errorMessage = "Failed to add property. Please try again.";
            let errorDetails: any = null;

            try {
              // Try to parse as JSON first
              const errorText = await response.text();
              console.error("📄 Raw error response:", errorText);

              try {
                errorDetails = JSON.parse(errorText);
                console.error("🔍 Parsed error details:", errorDetails);
              } catch (parseError) {
                console.error("⚠️ Could not parse error as JSON, treating as text");
                errorDetails = errorText;
              }

              if (errorDetails) {
                if (typeof errorDetails === 'string') {
                  errorMessage = errorDetails;
                } else if (errorDetails.error) {
                  errorMessage = errorDetails.error;
                } else if (errorDetails.detail) {
                  errorMessage = errorDetails.detail;
                } else if (typeof errorDetails === 'object') {
                  // Format validation errors
                  const errors = Object.entries(errorDetails)
                    .map(([key, value]) => {
                      if (Array.isArray(value)) {
                        return `${key}: ${value.join(', ')}`;
                      }
                      return `${key}: ${value}`;
                    })
                    .join('\n');
                  errorMessage = errors;
                }
              }
            } catch (readError) {
              console.error("📛 Error reading error response:", readError);
              errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }

            console.error("💥 Final error message:", errorMessage);

            Swal.fire({
              title: "Error!",
              text: errorMessage,
              icon: "error",
              confirmButtonText: "OK",
              scrollbarPadding: false
            });

            console.log("=== FORM SUBMISSION FAILED ===");
          }

        } catch (fetchError: any) {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          console.error("🌐 Fetch error after", responseTime, "ms:", fetchError);

          if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
            console.error("🔌 Network error detected. Possible causes:");
            console.error("   1. Django server not running");
            console.error("   2. CORS configuration issue");
            console.error("   3. Network connectivity problem");
            console.error("   4. Wrong URL/Port");

            Swal.fire({
              title: "Network Error!",
              html: `
            <div class="text-left">
              <p>Cannot connect to server. Please check:</p>
              <ul class="list-disc pl-5 mt-2 text-sm">
                <li>Django server is running (145.14.157.45:8000)</li>
                <li>CORS is properly configured</li>
                <li>No firewall blocking the connection</li>
                <li>Correct API URL: ${API_URL}</li>
              </ul>
              <p class="mt-4 text-sm text-red-600">Error: ${fetchError.message}</p>
            </div>
          `,
              icon: "error",
              confirmButtonText: "OK",
              width: '500px'
            });
          } else {
            Swal.fire({
              title: "Connection Error!",
              text: fetchError.message || "Unable to connect to the server",
              icon: "error",
              confirmButtonText: "OK"
            });
          }

          console.log("=== FORM SUBMISSION FAILED (NETWORK ERROR) ===");
        }

      } catch (error: any) {
        console.error("💥 Unexpected error in onSubmit:", error);
        console.error("Stack trace:", error.stack);

        Swal.fire({
          title: "Unexpected Error!",
          text: error.message || "An unexpected error occurred during form submission",
          icon: "error",
          confirmButtonText: "OK"
        });

        console.log("=== FORM SUBMISSION FAILED (UNEXPECTED ERROR) ===");
      } finally {
        console.log("⏳ Setting isLoading to false");
        setIsLoading(false);
      }
    },
  });

  const [subcategories, setSubcategories] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get("/service-subcategories/services-type/")
      .then(res => setSubcategories(res.data))
      .catch(() => { });
  }, []);

  // Handle contact type change
  useEffect(() => {
    if (formik.values.contactType === "user" && vendorInfo) {
      console.log("Auto-filling vendor info:", vendorInfo);
      formik.setValues({
        ...formik.values,
        name: vendorInfo.name || vendorInfo.owner_name || '',
        mobileNumber: vendorInfo.phone || '',
        email: vendorInfo.email || '',
        whatsappNumber: vendorInfo.phone || '',
      });
    } else if (formik.values.contactType === "other") {
      // Clear vendor info
      formik.setValues({
        ...formik.values,
        name: "",
        mobileNumber: "",
        email: "",
        whatsappNumber: "",
      });
    }
  }, [formik.values.contactType, vendorInfo]);

  const renderError = (field: keyof ExtendedPropertyFormData) =>
    formik.touched[field] && formik.errors[field] ? (
      <div className="text-red-500 text-sm mt-1">{formik.errors[field] as string}</div>
    ) : null;

  // Handle main image change
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      formik.setFieldValue("mainImage", file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle thumbnail image change
  const handleThumbnailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      formik.setFieldValue("thumbnailImage", file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle additional images change
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...formik.values.additionalImages, ...files];
      formik.setFieldValue("additionalImages", newImages);

      // Create previews
      const newPreviews: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setAdditionalImagesPreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove additional image
  const removeAdditionalImage = (index: number) => {
    const newImages = [...formik.values.additionalImages];
    const newPreviews = [...additionalImagesPreviews];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    formik.setFieldValue("additionalImages", newImages);
    setAdditionalImagesPreviews(newPreviews);
  };

  // Clear main image
  const clearMainImage = () => {
    formik.setFieldValue("mainImage", null);
    setMainImagePreview(null);
    if (mainImageRef.current) {
      mainImageRef.current.value = "";
    }
  };

  // Clear thumbnail image
  const clearThumbnailImage = () => {
    formik.setFieldValue("thumbnailImage", null);
    setThumbnailImagePreview(null);
    if (thumbnailImageRef.current) {
      thumbnailImageRef.current.value = "";
    }
  };

  const amenitiesOptions = [
    "Reserved Parking",
    "Security / Guard",
    "Garden / Park",
    "Power Backup",
    "CCTV",
    "Clubhouse / Gym / Swimming Pool",
    "Lift",
    "Water Supply (24x7)",
    "Gated Community",
  ];

  const nearbyFacilitiesOptions = [
    "Schools / Colleges",
    "Railway Station / Bus Stop",
    "Hospitals",
    "Temples / Parks",
    "Markets / Shopping Malls",
  ];

  const propertyTypes = [
    "apartment",
    "house",
    "villa",
    "commercial",
    "pg_coliving",
    "plots"
  ];

  const transactionTypes = [
    "sale",
    "rent",
    "lease"
  ];

  const furnishingOptions = [
    { value: "fully_furnished", label: "Fully Furnished" },
    { value: "semi_furnished", label: "Semi Furnished" },
    { value: "unfurnished", label: "Unfurnished" },
  ];

  const ownershipTypes = [
    { value: 'freehold', label: 'Freehold' },
    { value: 'leasehold', label: 'Leasehold' },
    { value: 'cooperative', label: 'Co-operative' },
  ];

  const facingDirections = [
    { value: "east", label: "East" },
    { value: "west", label: "West" },
    { value: "north", label: "North" },
    { value: "south", label: "South" },
    { value: "north_east", label: "North-East" },
    { value: "north_west", label: "North-West" },
    { value: "south_east", label: "South-East" },
    { value: "south_west", label: "South-West" },
  ];

  // Map React field names to distance field names
  const getDistanceFieldName = (facilityName: string) => {
    const map: Record<string, string> = {
      "Schools / Colleges": "schoolsCollegesDistance",
      "Railway Station / Bus Stop": "railwayStationBusStopDistance",
      "Hospitals": "hospitalsDistance",
      "Temples / Parks": "templesParksDistance",
      "Markets / Shopping Malls": "marketsShoppingMallsDistance",
    };
    return map[facilityName] || "";
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      Swal.fire({
        title: 'Getting location...',
        text: 'Please allow location access',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const url = `https://www.google.com/maps?q=${lat},${lng}`;

          // Set captured location
          setCapturedLocation({ lat, lng });
          formik.setFieldValue("googleMapPin", url);

          Swal.fire({
            title: "Location Captured!",
            html: `
              <div class="text-left">
                <p><strong>Latitude:</strong> ${lat.toFixed(6)}</p>
                <p><strong>Longitude:</strong> ${lng.toFixed(6)}</p>
                <p class="mt-2 text-sm text-green-600">Coordinates will be automatically included with property submission</p>
              </div>
            `,
            icon: "success",
            confirmButtonText: "OK"
          });
        },
        (error) => {
          let errorMessage = "Failed to get current location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please allow location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          Swal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK"
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      Swal.fire({
        title: "Not Supported",
        text: "Geolocation is not supported by your browser.",
        icon: "warning",
        confirmButtonText: "OK"
      });
    }
  };

  // Clear captured location
  const clearCapturedLocation = () => {
    setCapturedLocation({ lat: null, lng: null });
    formik.setFieldValue("googleMapPin", "");
    Swal.fire({
      title: "Location Cleared!",
      text: "Location coordinates have been cleared.",
      icon: "info",
      confirmButtonText: "OK"
    });
  };

  const sections = ["property", "specifications", "legal", "price"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Property</h1>

          <p className="text-gray-600">Create Real Estate Services</p>
          {isFetchingVendorInfo && (
            <div className="text-blue-600 text-sm mt-2">
              Loading vendor information...
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-2">
          {[
            { id: "property", label: "Property Info", icon: <FiHome /> },
            { id: "specifications", label: "Specifications", icon: <FiHome /> },
            { id: "legal", label: "Legal & Info", icon: <FiFileText /> },
            { id: "price", label: "Price & Contact", icon: <FiDollarSign /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeSection === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-8">
          {/* 1. Property Information Section */}
          {(activeSection === "property" || activeSection === "all") && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                Property Information
              </h2>

              <div className="space-y-6 ">
                {/* Property Images Section - All in One Line */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Property Images</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Image *
                      </label>
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-400 transition-colors bg-blue-50 min-h-[200px] flex flex-col">
                        {mainImagePreview ? (
                          <div className="flex-1 relative">
                            <img
                              src={mainImagePreview}
                              alt="Main Preview"
                              className="w-full h-40 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={clearMainImage}
                              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center">
                            <FiImage className="w-10 h-10 text-blue-400 mb-2" />
                            <p className="text-sm text-blue-600 text-center mb-1">Main Image</p>
                            <p className="text-xs text-gray-500 text-center mb-3">1200x800px recommended</p>
                            <input
                              ref={mainImageRef}
                              type="file"
                              id="mainImage"
                              className="hidden"
                              onChange={handleMainImageChange}
                              accept=".jpg,.jpeg,.png,.webp"
                            />
                            <label
                              htmlFor="mainImage"
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700"
                            >
                              Upload
                            </label>
                          </div>
                        )}
                      </div>
                      {renderError("mainImage")}
                    </div>

                    {/* Thumbnail Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thumbnail *
                      </label>
                      <div className="border-2 border-dashed border-green-300 rounded-lg p-4 hover:border-green-400 transition-colors bg-green-50 min-h-[200px] flex flex-col">
                        {thumbnailImagePreview ? (
                          <div className="flex-1 relative">
                            <img
                              src={thumbnailImagePreview}
                              alt="Thumbnail Preview"
                              className="w-full h-40 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={clearThumbnailImage}
                              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center">
                            <FiImage className="w-10 h-10 text-green-400 mb-2" />
                            <p className="text-sm text-green-600 text-center mb-1">Thumbnail</p>
                            <p className="text-xs text-gray-500 text-center mb-3">400x300px recommended</p>
                            <input
                              ref={thumbnailImageRef}
                              type="file"
                              id="thumbnailImage"
                              className="hidden"
                              onChange={handleThumbnailImageChange}
                              accept=".jpg,.jpeg,.png,.webp"
                            />
                            <label
                              htmlFor="thumbnailImage"
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg cursor-pointer hover:bg-green-700"
                            >
                              Upload
                            </label>
                          </div>
                        )}
                      </div>
                      {renderError("thumbnailImage")}
                    </div>

                    {/* Additional Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Images
                      </label>
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 hover:border-purple-400 transition-colors bg-purple-50 min-h-[200px] flex flex-col">
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <FiUpload className="w-10 h-10 text-purple-400 mb-2" />
                          <p className="text-sm text-purple-600 text-center mb-1">Additional Images</p>
                          <p className="text-xs text-gray-500 text-center mb-3">Multiple images allowed</p>
                          <input
                            ref={additionalImagesRef}
                            type="file"
                            id="additionalImages"
                            className="hidden"
                            onChange={handleAdditionalImagesChange}
                            accept=".jpg,.jpeg,.png,.webp"
                            multiple
                          />
                          <label
                            htmlFor="additionalImages"
                            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg cursor-pointer hover:bg-purple-700"
                          >
                            Upload
                          </label>
                        </div>

                        {/* Show count if images uploaded */}
                        {formik.values.additionalImages.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-purple-200">
                            <div className="flex items-center justify-center">
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                {formik.values.additionalImages.length} images
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Images Preview (Below the 3 boxes) */}
                  {additionalImagesPreviews.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Uploaded Additional Images ({additionalImagesPreviews.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {additionalImagesPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Additional ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                            <div className="text-xs text-gray-500 mt-1 truncate px-1">
                              {formik.values.additionalImages[index]?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter property description"
                  />
                  {renderError("description")}
                </div>

                {/* Property Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="propertyTitle"
                    value={formik.values.propertyTitle}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter property title"
                  />
                  {renderError("propertyTitle")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type *
                    </label>
<select
    name="propertyType"
    value={formik.values.propertyType}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
    <option value="">Select property type</option>
    {subcategories.map((sub) => (
        <option key={sub.id} value={sub.id}> 
            {sub.subcategory_name}
        </option>
    ))}
</select>
                    {renderError("propertyType")}
                  </div>

                  {/* Transaction Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Type *
                    </label>
                    <select
                      name="transactionType"
                      value={formik.values.transactionType}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select type</option>
                      {transactionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === 'sale' ? 'For Sale' : type === 'rent' ? 'For Rent' : 'For Lease'}
                        </option>
                      ))}
                    </select>
                    {renderError("transactionType")}
                  </div>
                </div>
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter complete address"
                  />
                  {renderError("address")}
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter city"
                    />
                    {renderError("city")}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formik.values.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter state"
                    />
                    {renderError("state")}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formik.values.pincode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter pincode"
                    />
                    {renderError("pincode")}
                  </div>
                </div>

                {/* Google Map Pin - MAP SECTION */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Map Pin (optional)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="googleMapPin"
                      value={formik.values.googleMapPin}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter Google Maps URL or location"
                      readOnly
                    />

                    {/* Map Preview/Container */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden h-64 bg-gray-100 relative">
                      {capturedLocation.lat && capturedLocation.lng ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <FiMapPin className="w-12 h-12 text-green-600 mb-3" />
                          <p className="text-center text-green-700 font-medium mb-2">
                            Location Captured Successfully!
                          </p>
                          <div className="text-sm text-gray-700 mb-3 text-center">
                            <p>Latitude: {capturedLocation.lat.toFixed(6)}</p>
                            <p>Longitude: {capturedLocation.lng.toFixed(6)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                              onClick={() => {
                                window.open(`https://www.google.com/maps?q=${capturedLocation.lat},${capturedLocation.lng}`, "_blank");
                              }}
                            >
                              View on Google Maps
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                              onClick={clearCapturedLocation}
                            >
                              Clear Location
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4">
                          <FiMapPin className="w-12 h-12 mb-3" />
                          <p className="text-center px-4 mb-3">No location captured yet</p>
                          <p className="text-sm text-center mb-4">
                            Click "Use Current Location" to capture coordinates automatically
                          </p>
                          <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            onClick={getCurrentLocation}
                          >
                            Use Current Location
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Note:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Latitude and Longitude will be automatically captured from your device</li>
                        <li>Click "Use Current Location" button to get current coordinates</li>
                        <li>Coordinates are required for accurate property location mapping</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Property Specifications Section */}
          {(activeSection === "specifications" || activeSection === "all") && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                Property Specifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Area Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Area Size (SqFt) *
                  </label>
                  <input
                    type="text"
                    name="totalAreaSize"
                    value={formik.values.totalAreaSize}
                    onChange={(e) => handleNumericInput(e, 'totalAreaSize', true)}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter total area"
                  />
                  {renderError("totalAreaSize")}
                </div>

                {/* Carpet/Built-up Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carpet/Built-up Area (SqFt) *
                  </label>
                  <input
                    type="text"
                    name="carpetArea"
                    value={formik.values.carpetArea}
                    onChange={(e) => handleNumericInput(e, 'carpetArea', true)}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter carpet area"
                  />
                  {renderError("carpetArea")}
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. of Bedrooms (BHK) *
                  </label>
                  <select
                    name="bedrooms"
                    value={formik.values.bedrooms}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">4+ BHK</option>
                  </select>
                  {renderError("bedrooms")}
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. of Bathrooms *
                  </label>
                  <select
                    name="bathrooms"
                    value={formik.values.bathrooms}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="4+">4+</option>
                  </select>
                  {renderError("bathrooms")}
                </div>

                {/* Balconies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Balconies *
                  </label>
                  <select
                    name="balconies"
                    value={formik.values.balconies}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                  {renderError("balconies")}
                </div>

                {/* Furnishing Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Furnishing Status *
                  </label>
                  <select
                    name="furnishingStatus"
                    value={formik.values.furnishingStatus}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    {furnishingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {renderError("furnishingStatus")}
                </div>

                {/* Floor Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Number *
                  </label>
                  <input
                    type="text"
                    name="floorNumber"
                    value={formik.values.floorNumber}
                    onChange={(e) => handleNumericInput(e, 'floorNumber', false)}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter floor number"
                  />
                  {renderError("floorNumber")}
                </div>

                {/* Total Floors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Floors *
                  </label>
                  <input
                    type="text"
                    name="totalFloors"
                    value={formik.values.totalFloors}
                    onChange={(e) => handleNumericInput(e, 'totalFloors', false)}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter total floors"
                  />
                  {renderError("totalFloors")}
                </div>

                {/* Facing Direction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facing Direction *
                  </label>
                  <select
                    name="facingDirection"
                    value={formik.values.facingDirection}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    {facingDirections.map((direction) => (
                      <option key={direction.value} value={direction.value}>
                        {direction.label}
                      </option>
                    ))}
                  </select>
                  {renderError("facingDirection")}
                </div>

                {/* Property Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Age / Year *
                  </label>
                  <input
                    type="text"
                    name="propertyAge"
                    value={formik.values.propertyAge}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5 years or 2018"
                  />
                  {renderError("propertyAge")}
                </div>
              </div>
            </div>
          )}

          {/* 3. Legal & Ownership Information Section */}
          {(activeSection === "legal" || activeSection === "all") && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                Legal & Ownership Information
              </h2>

              <div className="space-y-6">
                {/* Ownership Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ownership Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {ownershipTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${formik.values.ownershipType === type.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:border-blue-400"
                          }`}
                      >
                        <input
                          type="radio"
                          name="ownershipType"
                          value={type.value}
                          checked={formik.values.ownershipType === type.value}
                          onChange={formik.handleChange}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="font-medium">{type.label}</span>
                      </label>
                    ))}
                  </div>
                  {renderError("ownershipType")}
                </div>

                {/* Additional Legal Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Encumbrance Certificate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Encumbrance Certificate
                    </label>
                    <input
                      type="text"
                      name="encumbranceCertificate"
                      value={formik.values.encumbranceCertificate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter certificate details"
                    />
                  </div>
                  {/* REA Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      REA Number
                    </label>
                    <input
                      type="text"
                      name="reaNumber"
                      value={formik.values.reaNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter REA number"
                    />
                  </div>

                  {/* Loan Availability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Availability
                    </label>
                    <select
                      name="loanAvailability"
                      value={formik.values.loanAvailability}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Documents Available */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Documents Available
                    </label>
                    <select
                      name="documentsAvailable"
                      value={formik.values.documentsAvailable}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="All">All</option>
                      <option value="Partial">Partial</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  {/* Negotiable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Negotiable
                    </label>
                    <select
                      name="negotiable"
                      value={formik.values.negotiable}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      Click to upload property documents
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload property documents (PDF, JPEG, PNG)
                    </p>
                    <input
                      type="file"
                      id="documentUpload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        formik.setFieldValue("documents", file);
                      }}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="documentUpload"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                    >
                      Choose File
                    </label>
                    {formik.values.documents && (
                      <p className="mt-3 text-green-600">
                        Selected: {formik.values.documents.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Price Info & Contact Information Section */}
          {(activeSection === "price" || activeSection === "all") && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                Price Information & Contact Details
              </h2>

              <div className="space-y-8">
                {/* Price Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Price Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="text"
                          name="price"
                          value={formik.values.price}
                          onChange={(e) => handleNumericInput(e, 'price', true)}
                          onBlur={formik.handleBlur}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter price"
                        />
                      </div>
                      {renderError("price")}
                    </div>

                    {/* Maintenance Charges */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maintenance Charges
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="text"
                          name="maintenanceCharges"
                          value={formik.values.maintenanceCharges}
                          onChange={(e) => handleNumericInput(e, 'maintenanceCharges', true)}
                          onBlur={formik.handleBlur}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter maintenance charges"
                        />
                      </div>
                    </div>

                    {/* Booking Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Booking Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="text"
                          name="bookingAmount"
                          value={formik.values.bookingAmount}
                          onChange={(e) => handleNumericInput(e, 'bookingAmount', true)}
                          onBlur={formik.handleBlur}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter booking amount"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {amenitiesOptions.map((amenity) => {
                      const isSelected = formik.values.amenities.includes(amenity);
                      return (
                        <label
                          key={amenity}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newAmenities = e.target.checked
                                ? [...formik.values.amenities, amenity]
                                : formik.values.amenities.filter((a) => a !== amenity);
                              formik.setFieldValue("amenities", newAmenities);
                            }}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                          <span className="text-sm">{amenity}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Nearby Facilities with Distance Input */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Nearby Facilities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nearbyFacilitiesOptions.map((facility) => {
                      const isSelected = formik.values.nearbyFacilities.includes(facility);
                      const distanceFieldName = getDistanceFieldName(facility);
                      const distanceValue = formik.values[distanceFieldName as keyof ExtendedPropertyFormData] as string || '';

                      return (
                        <div
                          key={facility}
                          className={`p-4 rounded-lg border transition-all ${isSelected
                            ? "border-green-600 bg-green-50"
                            : "border-gray-300 hover:border-green-100"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const newFacilities = e.target.checked
                                    ? [...formik.values.nearbyFacilities, facility]
                                    : formik.values.nearbyFacilities.filter((f) => f !== facility);
                                  formik.setFieldValue("nearbyFacilities", newFacilities);

                                  if (!e.target.checked) {
                                    formik.setFieldValue(distanceFieldName, '');
                                  }
                                }}
                                className="w-5 h-5 text-green-600 rounded"
                              />
                              <span className="font-medium text-gray-700">{facility}</span>
                            </label>
                          </div>

                          {/* Distance Input - Only shows when facility is selected */}
                          {isSelected && (
                            <div className="mt-3 pl-8">
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Distance (in kilometers)
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  name={distanceFieldName}
                                  placeholder="e.g., 2.5"
                                  value={distanceValue}
                                  onChange={(e) => handleDistanceInput(e, distanceFieldName as keyof ExtendedPropertyFormData)}
                                  onBlur={formik.handleBlur}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                <span className="text-sm text-gray-500 whitespace-nowrap">km</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Contact Information
                  </h3>

                  {/* Contact Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose type of contact information
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="contactType"
                          value="user"
                          checked={formik.values.contactType === "user"}
                          onChange={formik.handleChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span>Your current user information</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="contactType"
                          value="other"
                          checked={formik.values.contactType === "other"}
                          onChange={formik.handleChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span>Other contact</span>
                      </label>
                    </div>
                    {vendorInfo && formik.values.contactType === "user" && (
                      <div className="mt-3 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                        <p>Using vendor information: {vendorInfo.name || vendorInfo.owner_name}</p>
                        <p className="text-xs mt-1">Email: {vendorInfo.email} | Phone: {vendorInfo.phone}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter name"
                        disabled={formik.values.contactType === "user"}
                      />
                      {renderError("name")}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formik.values.mobileNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter mobile number"
                        disabled={formik.values.contactType === "user"}
                      />
                      {renderError("mobileNumber")}
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        name="whatsappNumber"
                        value={formik.values.whatsappNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter WhatsApp number"
                        disabled={formik.values.contactType === "user"}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email"
                        disabled={formik.values.contactType === "user"}
                      />
                      {renderError("email")}
                    </div>

                    {/* Preferred Time */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Time to Contact
                      </label>
                      <input
                        type="text"
                        name="preferredTime"
                        value={formik.values.preferredTime}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 10 AM - 6 PM"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-6">
            <div className="space-x-3">
              {activeSection !== "property" && (
                <button
                  type="button"
                  onClick={() => {
                    const sections = ["property", "specifications", "legal", "price"];
                    const currentIndex = sections.indexOf(activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(sections[currentIndex - 1]);
                    }
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="space-x-3">
              {activeSection !== "price" ? (
                <button
                  type="button"
                  onClick={() => {
                    const sections = ["property", "specifications", "legal", "price"];
                    const currentIndex = sections.indexOf(activeSection);
                    if (currentIndex < sections.length - 1) {
                      setActiveSection(sections[currentIndex + 1]);
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveSection("property")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    View All Sections
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FiCheck className="w-5 h-5" />
                        Submit Property
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>

        {/* Progress Indicator */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            {sections.map((section, index) => (
              <div key={section} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${activeSection === section
                    ? "bg-blue-600 text-white"
                    : sections.indexOf(activeSection) > index
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-2 text-gray-600 capitalize">
                  {section === "property" ? "Property Info" :
                    section === "specifications" ? "Specifications" :
                      section === "legal" ? "Legal & Info" : "Price & Contact"}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${(sections.indexOf(activeSection) + 1) * 25}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyPage;