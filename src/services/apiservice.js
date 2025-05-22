import axios from 'axios';
import { Alert } from 'react-native';

// Base API URL
// const API_BASE_URL = 'https://api.freshozapcart.com/delivery_boy'; // Replace with your actual API URL

const API_BASE_URL ='https://api.localdaddy.in/delivery_boy'

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
}); 

// Create Axios instance
const publicapiClient = axios.create({
  baseURL: 'https://api.freshozapcart.com/public_app',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔹 Centralized error handler function
const handleApiError = (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      return error.response.data;
    } else if (error.request) {
      console.error('Network Error:', error.request);
      Alert.alert('No Internet', 'Please check your internet connection and try again.');
      return { message: 'Network error, please try again later.' };
    } else {
      console.error('Unexpected Error:', error.message);
      return { message: 'Something went wrong. Please try again.' };
    }
  };

// API Functions
const ApiService = {
  // 🔹 User Login
  login: async (number, password) => {
    try {
      const response = await apiClient.post('/logincheck', { number, password });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 🔹 Fetch Orders
  getOrders: async (user) => {
    try {
      const response = await apiClient.post('/getcurrentorders', user);
      console.log("vvvvvvvvvvvv-", response.data)
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getOrderDetails: async (id) => {
    try {
      const response = await apiClient.post('/getorderdetails',{order_id:id});
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  acceptorders: async (user) => {
    try {
      const response = await apiClient.post('/acceptorderstatus', user);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },


  vendorReceived: async (payload) => {
    try {
      const response = await apiClient.post('/updateoderstatdata', payload);
     
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 🔹 Update Order Status
  completedorder: async (array) => {
    try {
      const response = await apiClient.post(`/completedorder`,array);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }, 

  getProfileData: async (array) => {
    try {
      const response = await apiClient.post(`/getprofiledata`,array);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateProfileData: async (data) => {
    console.log("222",data)
    try {
      const response = await apiClient.post(`/updateprofiledata`, data);
    
      return response.data; 
    } catch (error) {
      console.error("API Error:", error);
      return { success: false, message: "Failed to update profile" };
    }
  },

  completedorders: async ({ f_date,t_date,emp_id}) => {
    try {
      const response = await apiClient.post(`/getordersdatewise`, {
        f_date,
        t_date,
        emp_id

      });
      return response.data; // Assuming the API returns an array of completed orders
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      throw error;
    }
  },

   // 🔹 Fetch Payments (New API Function)
   getPayments: async ({ fromDate, toDate, emp_id }) => {
    try {
      const response = await apiClient.post('/getpayments', {
        fromDate,
        toDate,
        emp_id, // Include emp_id if required by API
      });
     // console.log("Payments Response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  // 🔹 contact us api
  getContactUs: async () => {
    try {
      const response = await publicapiClient.post("/application_common_api",[]);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact us details:', error);
      throw error;
    }
  },
  getReportingHistory: async (deliveryboy_id) => {
    try {
      const response = await apiClient.post("/deliveryboypayments",{
        "deliveryboy_id":deliveryboy_id,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching contact us details:', error);
      throw error;
    }
  },

  getReports: async (deliveryboy_id,fromdate,todate) => {
    try {
      const response = await apiClient.post("/deliveryboypaymentreports",{
        "deliveryboy_id":deliveryboy_id,
         "fromdate":`${fromdate}`,
         "todate":`${todate}`
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching contact us details:', error);
      throw error;
    }
  }




};

export default ApiService;
