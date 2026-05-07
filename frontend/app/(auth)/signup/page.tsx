"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { API_ENDPOINTS } from "@/lib/apiConfig";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [apiError, setApiError] = useState("");

  const validate = (field: string, value: string) => {
    if (field === "name") {
      if (!value.trim()) return "Enter your name";
      if (!/^[A-Za-z ]+$/.test(value)) return "Only letters allowed";
      if (value.trim().length < 3) return "Name too short";
    }

    if (field === "email") {
      if (!value) return "Enter email";
      if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email";
    }

    if (field === "password") {
      if (!value) return "Enter password";
      if (value.length < 6) return "Min 6 characters";
    }

    if (field === "confirmPassword") {
      if (!value) return "Confirm password";
      if (value !== password) return "Passwords not matching";
    }

    return "";
  };

  // 👉 ONLY set value (NO validation here)
  const handleChange = (field: string, value: string) => {
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
  };

  // 👉 Validate when user leaves field
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });

    setErrors({
      ...errors,
      [field]: validate(
        field,
        field === "name"
          ? name
          : field === "email"
            ? email
            : field === "password"
              ? password
              : confirmPassword,
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: validate("name", name),
      email: validate("email", email),
      password: validate("password", password),
      confirmPassword: validate("confirmPassword", confirmPassword),
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((e) => e !== "");
    if (hasError) return;

    try {
      console.log("Attempting signup at:", API_ENDPOINTS.AUTH.SIGNUP);
      const res = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const errorText = await res.text();
        console.error("❌ Non-JSON Response:", errorText);
        setApiError("Server error: Received invalid response format.");
        return;
      }

      if (!res.ok) {
        setApiError(data.message || "Signup failed");
        return;
      }

      localStorage.setItem("token", data.token || "signed-up");

      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user || {
            name,
            email,
            role: "",
          }
        )
      );

      localStorage.removeItem("isGuest");
      localStorage.removeItem("role");
      localStorage.removeItem("isOnboarded");
      localStorage.removeItem("skills_data");

      router.push("/onboarding");
    } catch (error) {
      console.error("Signup Fetch Error:", error);
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
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm">Start your journey</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-pink-200 shadow-sm">
          {apiError && <p className="text-pink-500 text-sm mb-3">{apiError}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                className={`w-full px-4 py-3 rounded-xl border ${
                  touched.name && errors.name
                    ? "border-pink-400 bg-pink-50"
                    : "border-pink-200"
                } focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none`}
              />
              {touched.name && errors.name && (
                <p className="text-pink-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={`w-full px-4 py-3 rounded-xl border ${
                  touched.email && errors.email
                    ? "border-pink-400 bg-pink-50"
                    : "border-pink-200"
                }`}
              />
              {touched.email && errors.email && (
                <p className="text-pink-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                className={`w-full px-4 py-3 rounded-xl border ${
                  touched.password && errors.password
                    ? "border-pink-400 bg-pink-50"
                    : "border-pink-200"
                }`}
              />
              {touched.password && errors.password && (
                <p className="text-pink-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                onBlur={() => handleBlur("confirmPassword")}
                className={`w-full px-4 py-3 rounded-xl border ${
                  touched.confirmPassword && errors.confirmPassword
                    ? "border-pink-400 bg-pink-50"
                    : "border-pink-200"
                }`}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-pink-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button className="w-full bg-linear-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold">
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-purple-600 font-semibold cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
