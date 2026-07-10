import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, role: userRole } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    pinCode: "",
    address: "",
    companyName: "",
    servicePinCodes: ""
  });

  useEffect(() => {
    if (isAuthenticated) navigate(userRole === "dealer" ? "/dealer" : "/user");
  }, [isAuthenticated, userRole, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        const endpoint = role === "dealer" ? "/users/dealer/login" : "/users/login";
        response = await api.post(endpoint, { email: form.email, password: form.password });
      } else {
        if (role === "user") {
          response = await api.post("/users/register", {
            name: form.name,
            email: form.email,
            password: form.password,
            pinCode: form.pinCode,
            address: form.address
          });
        } else {
          const pinCodesArray = form.servicePinCodes.split(",").map(p => p.trim()).filter(Boolean);
          if (!pinCodesArray.length) throw new Error("Enter at least one service PIN.");
          response = await api.post("/users/dealer/register", {
            companyName: form.companyName,
            email: form.email,
            password: form.password,
            servicePinCodes: pinCodesArray
          });
        }
      }
      login(response.data.token, role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#fcfbfa] border border-[#1e140f]/35 focus:border-[#1e140f] rounded-none py-2.5 px-4 text-[#1e140f] focus:outline-none transition text-xs placeholder-[#1e140f]/40 font-mono";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4ef] text-[#1e140f] p-8 antialiased">
      <div className="max-w-md w-full border border-[#1e140f]/15 p-4 rounded-none bg-[#f7f4ef]">
        <div className="bg-[#fcfbfa] border-2 border-[#1e140f] p-8 rounded-none space-y-6">
          <div className="text-center border-b border-[#1e140f]/15 pb-4">
            <h2 className="text-4xl font-serif font-bold italic tracking-tight text-[#1e140f]">ScrapLens</h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#1e140f]/50 mt-1.5">Direct Recycling Coordination Directory</p>
          </div>

          {/* Monospace Role Toggle */}
          <div className="flex bg-[#f7f4ef] p-1 border border-[#1e140f]/20 text-[10px] font-mono uppercase tracking-widest">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`flex-1 py-2 text-center rounded-none font-bold transition-all duration-200 cursor-pointer ${
                role === "user" ? "bg-[#1e140f] text-[#f7f4ef] border border-[#1e140f]" : "text-[#1e140f]/50 hover:text-[#1e140f] border border-transparent"
              }`}
            >
              Household
            </button>
            <button
              type="button"
              onClick={() => setRole("dealer")}
              className={`flex-1 py-2 text-center rounded-none font-bold transition-all duration-200 cursor-pointer ${
                role === "dealer" ? "bg-[#1e140f] text-[#f7f4ef] border border-[#1e140f]" : "text-[#1e140f]/50 hover:text-[#1e140f] border border-transparent"
              }`}
            >
              Scrap Dealer
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex justify-center gap-6 text-[10px] font-mono uppercase tracking-widest border-b border-[#1e140f]/10 pb-1.5">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`pb-1 font-bold cursor-pointer transition ${
                isLogin ? "text-[#1e140f] border-b border-[#1e140f]" : "text-[#1e140f]/50 hover:text-[#1e140f]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`pb-1 font-bold cursor-pointer transition ${
                !isLogin ? "text-[#1e140f] border-b border-[#1e140f]" : "text-[#1e140f]/50 hover:text-[#1e140f]"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-[#ab4e35]/5 border border-[#ab4e35]/30 text-[#ab4e35] text-xs font-mono py-2.5 px-4 rounded-none text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                {role === "user" ? (
                  <>
                    <input name="name" required placeholder="Full Name" value={form.name} onChange={handleChange} className={inputClass} />
                    <input name="pinCode" required placeholder="PIN Code" maxLength={10} value={form.pinCode} onChange={handleChange} className={inputClass} />
                    <textarea name="address" required placeholder="Pickup Address" value={form.address} onChange={handleChange} className={`${inputClass} h-16 resize-none`} />
                  </>
                ) : (
                  <>
                    <input name="companyName" required placeholder="Company Name" value={form.companyName} onChange={handleChange} className={inputClass} />
                    <input name="servicePinCodes" required placeholder="Service PINs (comma separated)" value={form.servicePinCodes} onChange={handleChange} className={inputClass} />
                  </>
                )}
              </>
            )}

            <input name="email" type="email" required placeholder="Email Address" value={form.email} onChange={handleChange} className={inputClass} />
            <input name="password" type="password" required placeholder="Password" value={form.password} onChange={handleChange} className={inputClass} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1e140f] text-[#f7f4ef] border border-[#1e140f] hover:bg-[#fcfbfa] hover:text-[#1e140f] font-mono font-bold uppercase tracking-widest text-[9px] rounded-none disabled:opacity-50 mt-2 cursor-pointer transition-colors duration-200"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
