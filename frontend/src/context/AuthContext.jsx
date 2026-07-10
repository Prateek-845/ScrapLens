import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const currentRole = localStorage.getItem("role");
      const token = localStorage.getItem("token");
      if (!currentRole || !token) {
        setLoading(false);
        return;
      }

      const endpoint =
        currentRole === "dealer" ? "/users/dealer/me" : "/users/me";
      const response = await api.get(endpoint);

      setUser(
        currentRole === "dealer"
          ? response.data.data.dealer
          : response.data.data.user,
      );
      setRole(currentRole);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userRole) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole);
    setRole(userRole);
    setLoading(true);
    fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        role,
        loading,
        login,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
