import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "../types/schema";
import { authApi } from "../api/authApi";

interface AuthContextType {
  token: string | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("pcx_token")
  );
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("pcx_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedProfile = localStorage.getItem("pcx_profile");
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    };

    window.addEventListener("local-storage-update", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("local-storage-update", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = async (
    inputIdentifier: string,
    password?: string
  ): Promise<any> => {
    setIsLoading(true);
    try {
      const data = await authApi.login(inputIdentifier, password);

      const accessToken = data.token;

      const userProfile = {
        MaND: data.MaND,
        HoTen: data.HoTen,
        Email: data.Email,
        SDT: data.SDT,
        Role: data.Role,
        MaCN: data.MaCN,
        DiemTichLuy: data.DiemTichLuy,
      };

      setToken(accessToken);
      setProfile(userProfile);

      localStorage.setItem("pcx_token", accessToken);
      localStorage.setItem("pcx_profile", JSON.stringify(userProfile));

      return data.Role;
    } catch (error: any) {
      const msg = error.response?.data?.message || "Đăng nhập thất bại";
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    setToken(null);
    setProfile(null);
    localStorage.removeItem("pcx_token");
    localStorage.removeItem("pcx_profile");
  };

  return (
    <AuthContext.Provider value={{ token, profile, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
