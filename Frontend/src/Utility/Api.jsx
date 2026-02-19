import axios from "axios";

const api = axios.create({
  baseURL: "https://newwork-1-ubb2.onrender.com/api",
  withCredentials: true,
});

export default api;
