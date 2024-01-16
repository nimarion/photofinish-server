import Axios from "axios";

import { PHOTOFINISH_API_URL } from "@/config";

export const axios = Axios.create({
  baseURL: PHOTOFINISH_API_URL,
});

axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    if(error.response?.status === 404) {
      return null;
    }
    console.log("Error: ", message);
    return Promise.reject(error);
  },
);
