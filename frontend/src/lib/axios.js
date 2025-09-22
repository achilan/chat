import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:"https://link.tractodiesel.com.ec/api",
  withCredentials: true,
});
