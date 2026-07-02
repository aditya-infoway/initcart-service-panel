// src/pages/vendor/realestate/EditPropertyPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import {
    FiUpload,
    FiMapPin,
    FiHome,
    FiUser,
    FiDollarSign,
    FiCheck,
    FiFileText,
    FiImage,
    FiX,
    FiTrash2,
    FiArrowLeft
} from "react-icons/fi";
import apiClient from "../../../api/apiClient";

const API_BASE_URL = 'https://api.initcart.in/api';

// Use the same interface from AddPropertyPage
interface ExtendedPropertyFormData {
    subcategory: string;
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

    // Distance fields
    schoolsCollegesDistance?: string;
    railwayStationBusStopDistance?: string;
    hospitalsDistance?: string;
    templesParksDistance?: string;
    marketsShoppingMallsDistance?: string;

    // Existing images (for display)
    existingMainImage?: string;
    existingThumbnailImage?: string;
    existingAdditionalImages?: Array<{ id: number; url: string }>;
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
            if (!value || value === '') return true;
            const num = parseFloat(value);
            return !isNaN(num) && num >= 0;
        }),

    bookingAmount: Yup.string()
        .test('is-number', 'Booking Amount must be a number', value => {
            if (!value || value === '') return true;
            const num = parseFloat(value);
            return !isNaN(num) && num >= 0;
        }),

    name: Yup.string().required("Name is required"),
    mobileNumber: Yup.string()
        .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
        .required("Mobile Number is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
});

// Move formik outside the component to use in useEffect before declaration
let formikInstance: any = null;

const EditPropertyPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProperty, setLoadingProperty] = useState(true);
    const [activeSection, setActiveSection] = useState<string>("property");
    const [vendorInfo, setVendorInfo] = useState<any>(null);
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
    const [existingAdditionalImages, setExistingAdditionalImages] = useState<Array<{ id: number; url: string }>>([]);
    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

    // Get auth token helper
    const getAuthToken = () => {
        return localStorage.getItem('access') || localStorage.getItem('access_token');
    };

    // Fetch vendor info
    useEffect(() => {
        const fetchVendorInfo = async () => {
            try {
                const token = getAuthToken();

                if (!token) {
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
                }
            } catch (error) {
                console.error("Error fetching vendor info:", error);
            }
        };

        fetchVendorInfo();
    }, []);

    // Helper functions (same as AddPropertyPage)
    const handleNumericInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: keyof ExtendedPropertyFormData,
        allowDecimal: boolean = true
    ) => {
        const value = e.target.value;

        if (allowDecimal) {
            const regex = /^[0-9]*\.?[0-9]*$/;
            if (value === '' || regex.test(value)) {
                formik.setFieldValue(fieldName, value);
            }
        } else {
            const regex = /^[0-9]*$/;
            if (value === '' || regex.test(value)) {
                formik.setFieldValue(fieldName, value);
            }
        }
    };

    const handleDistanceInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: keyof ExtendedPropertyFormData
    ) => {
        const value = e.target.value;
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
            subcategory:"",
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
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            console.log("=== UPDATING PROPERTY ===");

            try {
                const formData = new FormData();

                // Helper functions
                const appendIfExists = (key: string, value: any) => {
                    if (value !== null && value !== undefined && value !== '') {
                        formData.append(key, value.toString());
                    }
                };

                const appendBoolean = (key: string, value: string) => {
                    if (value) {
                        const boolValue = value === "Yes" ? "true" : "false";
                        formData.append(key, boolValue);
                    }
                };

                // Convert numeric fields
                const totalAreaSize = parseFloat(values.totalAreaSize) || 0;
                const carpetArea = parseFloat(values.carpetArea) || 0;
                const bedrooms = parseInt(values.bedrooms) || 0;
                const bathrooms = values.bathrooms;
                const balconies = parseInt(values.balconies) || 0;
                const floorNumber = parseInt(values.floorNumber) || 0;
                const totalFloors = parseInt(values.totalFloors) || 0;
                const price = parseFloat(values.price) || 0;
                const maintenanceCharges = parseFloat(values.maintenanceCharges) || 0;
                const bookingAmount = parseFloat(values.bookingAmount) || 0;

                // Basic Information
                appendIfExists('title', values.propertyTitle);
                appendIfExists('description', values.description);
                appendIfExists('transaction_type', values.transactionType);
                appendIfExists('property_type', values.propertyType);
                appendIfExists('address', values.address);
                appendIfExists('city', values.city);
                appendIfExists('state', values.state);
                appendIfExists('pincode', values.pincode);
                appendIfExists('google_map_url', values.googleMapPin);

                if (capturedLocation.lat && capturedLocation.lng) {
                    appendIfExists('latitude', capturedLocation.lat.toString());
                    appendIfExists('longitude', capturedLocation.lng.toString());
                }

                // Specifications
                appendIfExists('total_area_size', totalAreaSize.toString());
                appendIfExists('carpet_area', carpetArea.toString());
                appendIfExists('bedrooms', bedrooms.toString());
                appendIfExists('bathrooms', bathrooms);
                appendIfExists('balconies', balconies.toString());
                appendIfExists('furnishing_status', values.furnishingStatus);
                appendIfExists('floor_number', floorNumber.toString());
                appendIfExists('total_floors', totalFloors.toString());
                appendIfExists('facing_direction', values.facingDirection);
                appendIfExists('property_age', values.propertyAge);

                // Legal & Ownership
                const ownershipValue = values.ownershipType.toLowerCase().includes('co-operative') ||
                    values.ownershipType.toLowerCase().includes('cooperative')
                    ? 'cooperative'
                    : values.ownershipType.toLowerCase();
                appendIfExists('ownership_type', ownershipValue);

                appendIfExists('encumbrance_certificate', values.encumbranceCertificate);
                appendIfExists('rea_number', values.reaNumber);
                appendBoolean('loan_availability', values.loanAvailability);

                if (values.documentsAvailable) {
                    const docsValue = values.documentsAvailable.toLowerCase();
                    appendIfExists('documents_available', docsValue);
                }

                appendBoolean('negotiable', values.negotiable);

                // Price
                appendIfExists('price', price.toString());
                appendIfExists('maintenance_charges', maintenanceCharges.toString());
                appendIfExists('booking_amount', bookingAmount.toString());

                // Contact Information
                const useVendorInfo = values.contactType === "user";
                formData.append('use_vendor_info', useVendorInfo.toString());
                appendIfExists('contact_name', values.name);
                appendIfExists('contact_mobile', values.mobileNumber);
                appendIfExists('contact_whatsapp', values.whatsappNumber);
                appendIfExists('contact_email', values.email);
                appendIfExists('contact_preferred_time', values.preferredTime);

                // Status (keep existing status on update)
                const token = getAuthToken();
                if (token && id) {
                    const propertyResponse = await fetch(
                        `${API_BASE_URL}/services/real-estate/vendor/properties/${id}/`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        }
                    );

                    if (propertyResponse.ok) {
                        const propertyData = await propertyResponse.json();
                        appendIfExists('status', propertyData.status);
                    }
                }

                // Images (only append if new ones are selected)
                if (values.mainImage) {
                    formData.append('main_image', values.mainImage);
                }
                if (values.thumbnailImage) {
                    formData.append('thumbnail_image', values.thumbnailImage);
                }
                if (values.additionalImages.length > 0) {
                    values.additionalImages.forEach((file) => {
                        formData.append('additional_images', file);
                    });
                }

                // Document
                if (values.documents) {
                    formData.append('document_file', values.documents);
                }

                // Amenities
                if (values.amenities && values.amenities.length > 0) {
                    const amenitiesJson = JSON.stringify(values.amenities.map(amenity => amenity.trim()));
                    formData.append('amenities', amenitiesJson);
                } else {
                    formData.append('amenities', JSON.stringify([]));
                }

                // Nearby Facilities with distances
                if (values.nearbyFacilities.length > 0) {
                    values.nearbyFacilities.forEach((facility) => {
                        const distanceKey = getDistanceFieldName(facility);
                        const distanceValue = values[distanceKey as keyof ExtendedPropertyFormData];

                        if (distanceValue && String(distanceValue).trim() !== '') {
                            const cleanDistance = String(distanceValue).trim();
                            if (!isNaN(parseFloat(cleanDistance))) {
                                formData.append(`nearby_facilities[${facility}]`, cleanDistance);
                            }
                        }
                    });
                }

                // Make PATCH request
                if (!token) {
                    Swal.fire({
                        title: "Error!",
                        text: "Authentication token not found. Please login again.",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                    setIsLoading(false);
                    return;
                }

                if (!id) {
                    Swal.fire({
                        title: "Error!",
                        text: "Property ID not found.",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/services/real-estate/vendor/properties/${id}/`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (response.ok) {
                    Swal.fire({
                        title: "Success!",
                        text: "Property updated successfully!",
                        icon: "success",
                        confirmButtonText: "OK"
                    }).then(() => {
                        navigate('/myproperties');
                    });
                } else {
                    const errorData = await response.json();
                    let errorMessage = "Failed to update property.";
                    if (typeof errorData === 'object') {
                        errorMessage = Object.entries(errorData)
                            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                            .join('\n');
                    }
                    Swal.fire({
                        title: "Error!",
                        text: errorMessage,
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                }
            } catch (error: any) {
                console.error("Error updating property:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.message || "An unexpected error occurred",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            } finally {
                setIsLoading(false);
            }
        },
    });

    // Store formik instance globally
    useEffect(() => {
        formikInstance = formik;
    }, [formik]);

    const [subcategories, setSubcategories] = useState<any[]>([]);

    useEffect(() => {
        apiClient.get("/service-subcategories/services-type/")
            .then(res => setSubcategories(res.data))
            .catch(() => { });
    }, []);

        // Helper to find subcategory name from stored value
    const findSubcategoryBySlug = (slug: string, subcategoriesList: any[]): string => {
        if (!slug) return '';
        
        // First try to match by creating slug from subcategory_name
        const matching = subcategoriesList.find((sub) => {
            const subSlug = sub.subcategory_name
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');
            return subSlug === slug;
        });
        
        return matching ? slug : '';
    };
    // Fetch property data
    useEffect(() => {
        const fetchProperty = async () => {
            if (!id) return;

            try {
                setLoadingProperty(true);
                const token = getAuthToken();

                if (!token) {
                    Swal.fire({
                        title: "Error!",
                        text: "Please login again.",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                    navigate('/login');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/services/real-estate/vendor/properties/${id}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    // Parse amenities if it's a string
                    let amenities: string[] = [];
                    if (data.amenities) {
                        try {
                            amenities = typeof data.amenities === 'string'
                                ? JSON.parse(data.amenities)
                                : data.amenities;
                        } catch {
                            amenities = Array.isArray(data.amenities) ? data.amenities : [];
                        }
                    }

                    // Parse nearby facilities - FIXED TYPE ERROR
                    let nearbyFacilities: string[] = [];
                    const distanceFields: Record<string, string> = {};

                    if (data.nearby_facilities) {
                        try {
                            const facilities = typeof data.nearby_facilities === 'string'
                                ? JSON.parse(data.nearby_facilities)
                                : data.nearby_facilities;

                            if (typeof facilities === 'object' && facilities !== null) {
                                nearbyFacilities = Object.keys(facilities);
                                // Map distance fields
                                distanceFields["schoolsCollegesDistance"] = facilities["Schools / Colleges"] || '';
                                distanceFields["railwayStationBusStopDistance"] = facilities["Railway Station / Bus Stop"] || '';
                                distanceFields["hospitalsDistance"] = facilities["Hospitals"] || '';
                                distanceFields["templesParksDistance"] = facilities["Temples / Parks"] || '';
                                distanceFields["marketsShoppingMallsDistance"] = facilities["Markets / Shopping Malls"] || '';
                            }
                        } catch {
                            nearbyFacilities = [];
                        }
                    }

                    // Set existing images
                    const existingAdditional = data.images
                        ?.filter((img: any) => img.image_type === 'additional')
                        .map((img: any) => ({ id: img.id, url: img.image_url })) || [];

                    setExistingAdditionalImages(existingAdditional);

                    // Initialize form with fetched data
                    formik.setValues({
                        // Property Information
                        userId: data.user?.toString() || "",
                        description: data.description || "",
                        transactionType: data.transaction_type || "",
                        address: data.address || "",
                        googleMapPin: data.google_map_url || "",
                        propertyTitle: data.title || "",
                        propertyType: data.property_type || "",
                        subcategory: data.subcategory || "",
                        city: data.city || "",
                        state: data.state || "",
                        pincode: data.pincode || "",

                        // Property Specifications
                        totalAreaSize: data.total_area_size?.toString() || "",
                        carpetArea: data.carpet_area?.toString() || "",
                        bedrooms: data.bedrooms?.toString() || "",
                        bathrooms: data.bathrooms || "",
                        balconies: data.balconies?.toString() || "",
                        furnishingStatus: data.furnishing_status || "unfurnished",
                        floorNumber: data.floor_number?.toString() || "",
                        totalFloors: data.total_floors?.toString() || "",
                        facingDirection: data.facing_direction || "east",
                        propertyAge: data.property_age || "",

                        // Legal & Ownership Info
                        ownershipType: data.ownership_type || "freehold",
                        encumbranceCertificate: data.encumbrance_certificate || "",
                        documents: null,
                        reaNumber: data.rea_number || "",
                        loanAvailability: data.loan_availability ? "Yes" : "No",
                        documentsAvailable: data.documents_available || "",
                        negotiable: data.negotiable ? "Yes" : "No",

                        // Price Info & Contact Info
                        price: data.price?.toString() || "",
                        maintenanceCharges: data.maintenance_charges?.toString() || "0",
                        bookingAmount: data.booking_amount?.toString() || "0",

                        // Amenities
                        amenities: amenities,

                        // Nearby Facilities - FIXED: Use the typed variable
                        nearbyFacilities: nearbyFacilities,

                        // Contact Information
                        contactType: data.use_vendor_info ? "user" : "other",
                        name: data.contact_name || "",
                        mobileNumber: data.contact_mobile || "",
                        whatsappNumber: data.contact_whatsapp || "",
                        email: data.contact_email || "",
                        preferredTime: data.contact_preferred_time || "",

                        // Images
                        mainImage: null,
                        thumbnailImage: null,
                        additionalImages: [],

                        // Existing images for display
                        existingMainImage: data.images?.find((img: any) => img.image_type === 'main')?.image_url,
                        existingThumbnailImage: data.images?.find((img: any) => img.image_type === 'thumbnail')?.image_url,

                        // Distance fields - FIXED: Use spread operator correctly
                        ...distanceFields
                    });

                    // Set location if exists
                    if (data.latitude && data.longitude) {
                        setCapturedLocation({
                            lat: parseFloat(data.latitude),
                            lng: parseFloat(data.longitude)
                        });
                    }

                } else {
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to load property data.",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                    navigate('/myproperties');
                }
            } catch (error) {
                console.error("Error fetching property:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Unable to load property data.",
                    icon: "error",
                    confirmButtonText: "OK"
                });
                navigate('/myproperties');
            } finally {
                setLoadingProperty(false);
            }
        };

        fetchProperty();
    }, [id, navigate]);

    // Handle contact type change
    useEffect(() => {
        if (formik.values.contactType === "user" && vendorInfo) {
            formik.setValues({
                ...formik.values,
                name: vendorInfo.name || vendorInfo.owner_name || '',
                mobileNumber: vendorInfo.phone || '',
                email: vendorInfo.email || '',
                whatsappNumber: vendorInfo.phone || '',
            });
        } else if (formik.values.contactType === "other") {
            // Don't clear if we already have values
            const currentName = formik.values.name;
            const currentMobile = formik.values.mobileNumber;
            const currentEmail = formik.values.email;
            const currentWhatsapp = formik.values.whatsappNumber;

            // Only clear if they match vendor info
            if (vendorInfo && currentName === vendorInfo.name && currentMobile === vendorInfo.phone) {
                formik.setValues({
                    ...formik.values,
                    name: "",
                    mobileNumber: "",
                    email: "",
                    whatsappNumber: "",
                });
            }
        }
    }, [formik.values.contactType, vendorInfo]);

    const renderError = (field: keyof ExtendedPropertyFormData) =>
        formik.touched[field] && formik.errors[field] ? (
            <div className="text-red-500 text-sm mt-1">{formik.errors[field] as string}</div>
        ) : null;

    // Image handlers
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            formik.setFieldValue("mainImage", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleThumbnailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            formik.setFieldValue("thumbnailImage", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newImages = [...formik.values.additionalImages, ...files];
            formik.setFieldValue("additionalImages", newImages);

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

    const removeAdditionalImage = (index: number) => {
        const newImages = [...formik.values.additionalImages];
        const newPreviews = [...additionalImagesPreviews];
        newImages.splice(index, 1);
        newPreviews.splice(index, 1);
        formik.setFieldValue("additionalImages", newImages);
        setAdditionalImagesPreviews(newPreviews);
    };

    const removeExistingAdditionalImage = (id: number) => {
        setImagesToDelete([...imagesToDelete, id]);
        setExistingAdditionalImages(prev => prev.filter(img => img.id !== id));
    };

    const clearMainImage = () => {
        formik.setFieldValue("mainImage", null);
        setMainImagePreview(null);
        if (mainImageRef.current) mainImageRef.current.value = "";
    };

    const clearThumbnailImage = () => {
        formik.setFieldValue("thumbnailImage", null);
        setThumbnailImagePreview(null);
        if (thumbnailImageRef.current) thumbnailImageRef.current.value = "";
    };

    // Location functions
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            Swal.fire({
                title: 'Getting location...',
                text: 'Please allow location access',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const url = `https://www.google.com/maps?q=${lat},${lng}`;
                    setCapturedLocation({ lat, lng });
                    formik.setFieldValue("googleMapPin", url);
                    Swal.fire({
                        title: "Location Updated!",
                        icon: "success",
                        confirmButtonText: "OK"
                    });
                },
                (error) => {
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to get location.",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                }
            );
        }
    };

    const clearCapturedLocation = () => {
        setCapturedLocation({ lat: null, lng: null });
        formik.setFieldValue("googleMapPin", "");
    };

    // Options (same as AddPropertyPage)
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

    const propertyTypes = ["apartment", "house", "villa", "commercial", "pg_coliving", "plots"];
    const transactionTypes = ["sale", "rent", "lease"];
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

    const getDistanceFieldName = (facilityName: string): string => {
        const map: Record<string, string> = {
            "Schools / Colleges": "schoolsCollegesDistance",
            "Railway Station / Bus Stop": "railwayStationBusStopDistance",
            "Hospitals": "hospitalsDistance",
            "Temples / Parks": "templesParksDistance",
            "Markets / Shopping Malls": "marketsShoppingMallsDistance",
        };
        return map[facilityName] || "";
    };

    if (loadingProperty) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading property data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/myproperties')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        Back to Properties
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Property</h1>
                    <p className="text-gray-600">Update property details</p>
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
                            type="button" // यहाँ भी type="button" जोड़ें
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
                    {activeSection === "property" && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                                Property Information
                            </h2>

                            <div className="space-y-6">
                                {/* Property Images */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Property Images</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Main Image */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Main Image {!formik.values.existingMainImage && '*'}
                                            </label>
                                            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-blue-400 transition-colors bg-blue-50 min-h-[200px] flex flex-col">
                                                {mainImagePreview || formik.values.existingMainImage ? (
                                                    <div className="flex-1 relative">
                                                        <img
                                                            src={mainImagePreview || formik.values.existingMainImage || ''}
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
                                                        <p className="text-xs text-gray-500 text-center mb-3">Keep current or upload new</p>
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
                                                            {formik.values.existingMainImage ? 'Change' : 'Upload'}
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                            {!formik.values.existingMainImage && renderError("mainImage")}
                                        </div>

                                        {/* Thumbnail Image */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Thumbnail {!formik.values.existingThumbnailImage && '*'}
                                            </label>
                                            <div className="border-2 border-dashed border-green-300 rounded-lg p-4 hover:border-green-400 transition-colors bg-green-50 min-h-[200px] flex flex-col">
                                                {thumbnailImagePreview || formik.values.existingThumbnailImage ? (
                                                    <div className="flex-1 relative">
                                                        <img
                                                            src={thumbnailImagePreview || formik.values.existingThumbnailImage || ''}
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
                                                        <p className="text-xs text-gray-500 text-center mb-3">Keep current or upload new</p>
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
                                                            {formik.values.existingThumbnailImage ? 'Change' : 'Upload'}
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                            {!formik.values.existingThumbnailImage && renderError("thumbnailImage")}
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
                                                    <p className="text-xs text-gray-500 text-center mb-3">Add more images</p>
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
                                                        Upload More
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Existing Additional Images */}
                                    {existingAdditionalImages.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                Existing Additional Images
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                {existingAdditionalImages.map((img) => (
                                                    <div key={img.id} className="relative group">
                                                        <img
                                                            src={img.url}
                                                            alt={`Additional ${img.id}`}
                                                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingAdditionalImage(img.id)}
                                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <FiTrash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* New Additional Images Preview */}
                                    {additionalImagesPreviews.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                New Additional Images ({additionalImagesPreviews.length})
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                {additionalImagesPreviews.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={preview}
                                                            alt={`New Additional ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAdditionalImage(index)}
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

                                {/* Rest of the form */}
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

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
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
                                            placeholder="Google Maps URL"
                                            readOnly
                                        />
                                        <div className="border border-gray-300 rounded-lg overflow-hidden h-64 bg-gray-100 relative">
                                            {capturedLocation.lat && capturedLocation.lng ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                                    <FiMapPin className="w-12 h-12 text-green-600 mb-3" />
                                                    <p className="text-center text-green-700 font-medium mb-2">
                                                        Location Captured
                                                    </p>
                                                    <div className="text-sm text-gray-700 mb-3 text-center">
                                                        <p>Latitude: {capturedLocation.lat?.toFixed(6)}</p>
                                                        <p>Longitude: {capturedLocation.lng?.toFixed(6)}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                                            onClick={() => {
                                                                window.open(`https://www.google.com/maps?q=${capturedLocation.lat},${capturedLocation.lng}`, "_blank");
                                                            }}
                                                        >
                                                            View on Maps
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
                                                    <p className="text-center px-4 mb-3">Update location if needed</p>
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Specifications Section */}
                    {activeSection === "specifications" && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                                Property Specifications
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                    {/* 3. Legal & Ownership Section */}
                    {activeSection === "legal" && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                                Legal & Ownership Information
                            </h2>

                            <div className="space-y-6">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            <option value="all">All</option>
                                            <option value="partial">Partial</option>
                                            <option value="none">None</option>
                                        </select>
                                    </div>


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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Property Documents (Optional)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                        <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600 mb-2">
                                            Click to upload new documents
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

                    {/* 4. Price & Contact Section */}
                    {activeSection === "price" && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                                Price Information & Contact Details
                            </h2>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Price Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Contact Information
                                    </h3>

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
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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



                    {/* Navigation Buttons - फॉर्म के बाहर */}
                    <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-6 mt-8">
                        <div className="space-x-3">
                            {activeSection !== "property" && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
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
                            <button
                                type="button"
                                onClick={() => navigate('/myproperties')}
                                className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                            >
                                Cancel
                            </button>
                        </div>
                        <div className="space-x-3">
                            {activeSection !== "price" ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
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
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    onClick={(e) => {
                                        // सिर्फ submit बटन के लिए
                                        e.stopPropagation();
                                    }}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isLoading ? "Updating..." : "Update Property"}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPropertyPage;