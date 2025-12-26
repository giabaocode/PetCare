import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "../types/schema";
import { authApi } from "../api/authApi"; // <--- Dùng API

interface AuthContextType {
  token: string | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (token: string) => Promise<UserRole>;
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

  // ... trong AuthProvider
  useEffect(() => {
    const handleStorageChange = () => {
      // Khi dataProvider bắn tín hiệu, đọc lại localStorage ngay
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

  const login = async (inputIdentifier: string): Promise<UserRole> => {
    setIsLoading(true);
    try {
      setToken(inputIdentifier);
      localStorage.setItem("pcx_token", inputIdentifier);

      // GỌI API LOGIN
      const foundProfile: any = await authApi.login(inputIdentifier);

      setProfile(foundProfile);
      localStorage.setItem("pcx_profile", JSON.stringify(foundProfile));
      return foundProfile!.Role;
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
