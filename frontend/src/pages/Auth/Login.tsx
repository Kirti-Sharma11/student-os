import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import React from "react";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);

      alert(res.data.message);

      navigate("/");
    } catch (error:any) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md border border-zinc-800">

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Login 🚀
        </h1>

        <div className="flex flex-col gap-4">

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="bg-zinc-800 text-white p-3 rounded-lg outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="bg-zinc-800 text-white p-3 rounded-lg outline-none"
          />

          <button
            onClick={handleLogin}
            className="bg-white text-black p-3 rounded-lg font-semibold hover:opacity-90"
          >
            Login
          </button>

        </div>
      </div>
    </div>
  );
};

export default Login;