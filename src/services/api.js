import axios from "axios";

const API = axios.create({
  baseURL: "https://student-backend-xbxl.onrender.com/api",
});

// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
// });
// ==========================================
// ADD TOKEN
// ==========================================
API.interceptors.request.use((req) => {

  const token =
    localStorage.getItem("token");

  if (token) {

    req.headers.Authorization =
      `Bearer ${token}`;
  }

  return req;
});

// ==========================================
// AUTO LOGOUT IF TOKEN EXPIRED
// ==========================================
API.interceptors.response.use(

  (response) => response,

  (error) => {

    if (
      error.response &&
      error.response.status === 401
    ) {

      localStorage.clear();

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default API;