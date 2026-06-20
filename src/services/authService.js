import axios from "axios";

export const registerUser = async (userData) => {
  const response = await axios.post(
    "http://localhost:5000/api/auth/register",
    userData
  );

  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axios.post(
    "http://localhost:5000/api/auth/login",
    userData
  );

  return response.data;
};