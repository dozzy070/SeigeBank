import axios from "axios";

// API Configuration - uses Render backend URL
const api = axios.create({
 
  baseURL: import.meta.env.VITE_API_URL || "https://newwork-1-ubb2.onrender.com/api",
  withCredentials: true,

});

export default api;
