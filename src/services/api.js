import axios from "axios";

const API = axios.create({
  baseURL: "https://student-backend-xbxl.onrender.com/api",
});

// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// ==========================================
// 🔹 ADD TOKEN (SESSION STORAGE PER TAB)
// ==========================================
API.interceptors.request.use((req) => {
  // Read from sessionStorage first so each tab maintains its own session
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ==========================================
// 🔹 AUTO LOGOUT IF TOKEN EXPIRED
// ==========================================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.clear();
      localStorage.clear();

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default API;