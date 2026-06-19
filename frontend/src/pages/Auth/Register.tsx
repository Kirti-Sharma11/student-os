import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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

  const handleRegister = async () => {
    try {
      const res = await API.post("/auth/register", formData);

      alert(res.data.message);

      navigate("/login");
    } catch (error:any) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md border border-zinc-800">

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Register 🚀
        </h1>

        <div className="flex flex-col gap-4">

          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            className="bg-zinc-800 text-white p-3 rounded-lg outline-none"
          />

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
            onClick={handleRegister}
            className="bg-white text-black p-3 rounded-lg font-semibold hover:opacity-90"
          >
            Register
          </button>
          console.log(import.meta.env.VITE_API_URL);
        </div>
      </div>
    </div>
  );
};

export default Register;