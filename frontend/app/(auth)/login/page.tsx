"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { API_ENDPOINTS } from "@/lib/apiConfig";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [apiError, setApiError] = useState("");

  const validate = (field: string, value: string) => {
    if (field === "email") {
      if (!value) return "Enter email";
      if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email";
    }

    if (field === "password") {
      if (!value) return "Enter password";
      if (value.length < 6) return "Min 6 characters";
    }

    return "";
  };

  const handleBlur = (field: string, value: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: validate(field, value),
    }));
  };

  const handleChange = (field: string, value: string) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    // Clear error while typing, it will re-validate on blur
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      email: validate("email", email),
      password: validate("password", password),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e !== "")) return;

    try {
      console.log("Attempting login at:", API_ENDPOINTS.AUTH.LOGIN);
      const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Login failed. Please check your credentials.");
        return;
      }

      const token = data.token ? data.token : "temp-token";
      localStorage.setItem("token", token);

      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      const savedUser = {
        ...existingUser,
        ...data.user,
      };

      localStorage.setItem("user", JSON.stringify(savedUser));

      // Remove guest flags
      localStorage.removeItem("isGuest");
      localStorage.removeItem("role");
      localStorage.removeItem("isOnboarded");
      localStorage.removeItem("skills_data");

      router.push("/dashboard");
    } catch (err) {
      console.error("Login Fetch Error:", err);
      setApiError(
        "Could not connect to the server. Please check your internet or try again later."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#fff1f5] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Image
            src="/career-intelligence.png"
            alt="logo"
            width={60}
            height={60}
            className="mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Login to continue</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-pink-200 shadow-sm">
          {apiError && <p className="text-pink-500 text-sm mb-3">{apiError}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={(e) => handleBlur("email", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email
                    ? "border-pink-400 bg-pink-50"
                    : "border-pink-200"
                }`}
              />
              {errors.email && (
                <p className="text-pink-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={(e) => handleBlur("password", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.password
                    ? "border-pink-400 bg-pink-50"
                    : "border-pink-200"
                }`}
              />
              {errors.password && (
                <p className="text-pink-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button className="w-full bg-linear-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold">
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/signup")}
              className="text-purple-600 font-semibold cursor-pointer"
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
