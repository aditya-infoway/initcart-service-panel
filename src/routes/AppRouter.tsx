// routes/AppRouter.tsx - Remove BrowserRouter from here (already in main.tsx)
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import PrivateRouteWithLayout from "./PrivateRouteWithLayout";
import PrivateRouteWithSubscription from "./PrivateRouteWithSubscription";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/profile/Profile";
import ApprovedServices from "../pages/business/ApprovedServices";
import PendingApproval from "../pages/business/PendingApproval";
import RejectedServices from "../pages/business/RejectedServices";
import Inquiry from "../pages/business/Inquiry";
import FollowupsPage from "../pages/business/FollowupsPage";
import MyPropertiesPage from "../pages/vendor/Real Estate/MyProperties";
import MyGymServicesPage from "../pages/vendor/Gym/MyGymPage";
import MySalonServicesPage from "../pages/vendor/Saloon/MySalonServicesPage";
import MyTravelAgencyServicesPage from "../pages/vendor/Travel Agency/MyTravelAgencyServicesPage";
import MyTechIndustryServicesPage from "../pages/vendor/Tech Services/MyTechIndustryServicesPage";
import MyHotelRestaurantServicesPage from "../pages/vendor/Hotel & Restaurant/MyHotelRestaurantServicesPage";
import MyProfessionalServicesPage from "../pages/vendor/Professional/Addprofessionalservice";
import MyWorkPlaceServicesPage from "../pages/vendor/Work Place/MyWorkPlaceServicesPage";
import Withdraws from "../pages/finance/Withdraws";
import VendorSubscription from "../pages/subscription/VendorSubscription";
import AddPropertyPage from "../pages/vendor/Real Estate/AddPropertyPage";
import EditPropertyPage from '../pages/vendor/Real Estate/EditPropertyPage';
import PropertyDetailPage from '../pages/vendor/Real Estate/PropertyDetailPage';
import AddTravelAgencyService from "../pages/vendor/Travel Agency/AddTravelAgencyService";
import AddSalonService from "../pages/vendor/Saloon/AddSalonService";
import AddGymService from "../pages/vendor/Gym/AddGymService";
import AddTechIndustryService from "../pages/vendor/Tech Services/AddTechIndustryService";
import AddProfessionalService from "../pages/vendor/Professional/Addprofessionalservice";
import MyProfessionalServices from "../pages/vendor/Professional/MyProfessionalServices";
import MyFinanceServices from "../pages/vendor/Finance/Myfinanceservices";
import AddFinanceService from "../pages/vendor/Finance/Addfinanceservice";
import MyHealthcareServices from "../pages/vendor/Healthcare/MyHealthcareServices";
import AddHealthcareService from "../pages/vendor/Healthcare/AddHealthcareServices";
import MyEducationServices from "../pages/vendor/Education/MyEducationServices";
import AddEducationService from "../pages/vendor/Education/AddEducationService";
import MyRestaurantServices from "../pages/restaurant/MyRestaurantservices";
import AddRestaurantService from "../pages/restaurant/addRestaurantservice";
import MyHotelServices from "../pages/vendor/Hotel/Myhotelservice";
import AddHotelService from "../pages/vendor/Hotel/AddHotelService";



// ✅ Main Router Component - NO BrowserRouter here
const AppRouter = () => {
  return (
    <Routes>
      {/* RouteHandler for path restoration */}
      
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Private Routes WITHOUT Layout */}
      <Route element={<PrivateRoute />}>
        <Route path="/subscription" element={<VendorSubscription />} />
      </Route>

      {/* Private Routes WITH Layout WITHOUT Subscription */}
      <Route element={<PrivateRouteWithLayout />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Private Routes WITH Layout AND Subscription */}
      <Route element={<PrivateRouteWithSubscription />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/approvedservices" element={<ApprovedServices />} />
        <Route path="/pendingapproval" element={<PendingApproval />} />
        <Route path="/rejectedservices" element={<RejectedServices />} />
        <Route path="/inquiries" element={<Inquiry />} />
        <Route path="/followups" element={<FollowupsPage />} />
        <Route path="/myproperties" element={<MyPropertiesPage />} />
        <Route path="/mygym" element={<MyGymServicesPage />} />
        <Route path="/mygym/add" element={<AddGymService />} />
        <Route path="/mygym/:id/edit" element={<AddGymService />} />
        <Route path="/mysaloon" element={<MySalonServicesPage />} />
        <Route path="/mysaloon/add" element={<AddSalonService />} />
        <Route path="/mysaloon/:id/edit" element={<AddSalonService />} />
        <Route path="/travel-services/add" element={<AddTravelAgencyService />} />
        <Route path="/travel-services/:id/edit" element={<AddTravelAgencyService />} />
        <Route path="/mypackages" element={<MyTravelAgencyServicesPage />} />
        
        <Route path="/mytechservices" element={<MyTechIndustryServicesPage />} />
        <Route path="/tech-services/add" element={<AddTechIndustryService />} />
        <Route path="/tech-services/:id/edit" element={<AddTechIndustryService />} />
        <Route path="/myhotelservices" element={<MyHotelRestaurantServicesPage />} />
        <Route path="/haelthcare" element={<MyHealthcareServices/>}/>
        <Route path="/myhealthcareservices/add" element={<AddHealthcareService />} />
        <Route path="/myhealthcareservices/:id/edit" element={<AddHealthcareService />} />
        <Route path="/myprofessionalservices/add" element={<AddProfessionalService />} />
        <Route path="/myprofessionalservices/:id/edit" element={<AddProfessionalService />} />
        <Route path="/myprofessionalservices" element={<MyProfessionalServices />} />
        <Route path="/myworkplaceservices" element={<MyWorkPlaceServicesPage />} />
        <Route path="/withdraws" element={<Withdraws />} />
        <Route path="/add-property" element={<AddPropertyPage />}/>
        <Route path="/edit-property/:id" element={<EditPropertyPage />}/>
        <Route path="/property/:id" element={<PropertyDetailPage />}/>
        <Route path="/myfinanceservices" element={<MyFinanceServices/>}/>
        <Route path="/myfinanceservices/add" element={<AddFinanceService/>}/>
        <Route path="/myfinanceservices/:id/edit" element={<AddFinanceService/>}/>
        <Route path="/myeducationservices" element={<MyEducationServices />} />
        <Route path="/myeducationservices/add" element={<AddEducationService />} />
        <Route path="/myeducationservices/:id/edit" element={<AddEducationService />} />
        <Route path="/restaurantservices" element={<MyRestaurantServices/>}/>
        <Route path="/restaurantservices/add" element={<AddRestaurantService/>}/>
        <Route path="restaurantservices/:id/edit" element={<AddRestaurantService/>}/>
        <Route path="/hotelservices" element={<MyHotelServices/>}/>
        <Route path="/hotelservices/add" element={<AddHotelService/>}/>
        <Route path="/hotelservices/:id/edit" element={<AddHotelService/>}/>
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;