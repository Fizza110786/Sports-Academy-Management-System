import axios from "axios";

export const login = async (data) => {
  const res = await axios.post("http://localhost:5000/api/auth/login", data);
  return res.data;
};
