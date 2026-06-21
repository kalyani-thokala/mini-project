import axios from "axios";

const API_URL =
  `${(process.env.INTERNAL_API_BASE_URL || `http://localhost:${process.env.PORT || 5000}/api`).replace(/\/+$/, "")}/auth`;

export const registerUser = async (
  userData
) => {
  const response =
    await axios.post(
      `${API_URL}/register`,
      userData
    );

  return response.data;
};

export const loginUser = async (
  userData
) => {
  const response =
    await axios.post(
      `${API_URL}/login`,
      userData
    );

  return response.data;
};
