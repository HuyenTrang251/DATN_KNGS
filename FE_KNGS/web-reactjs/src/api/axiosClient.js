import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3300/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export default axiosClient;