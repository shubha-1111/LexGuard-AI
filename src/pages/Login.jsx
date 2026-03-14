import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Login = () => {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async () => {

    try{

      const res = await API.post("/auth/login",{
        email,
        password
      });

      localStorage.setItem("token",res.data.token);

      navigate("/");

    }catch(err){

      alert("Login failed");

    }

  }

  return (

    <div className="flex items-center justify-center h-screen bg-gray-100">

      <div className="bg-white p-6 rounded shadow w-80">

        <h2 className="text-xl font-bold mb-4">
          Lawyer Login
        </h2>

        <input
        className="border w-full mb-3 p-2"
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
        />

        <input
        className="border w-full mb-3 p-2"
        placeholder="Password"
        type="password"
        onChange={(e)=>setPassword(e.target.value)}
        />

        <button
        className="bg-blue-900 text-white w-full p-2 rounded"
        onClick={handleLogin}
        >
          Login
        </button>

      </div>

    </div>

  )

}

export default Login