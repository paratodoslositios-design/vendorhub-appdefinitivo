"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type UserRole = "admin" | "guest" | null;

export interface User {
  username: string;
  role: UserRole;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS = {
  admin: {
    username: "admin",
    password: "admin123",
    role: "admin" as UserRole,
    displayName: "Administrador",
  },
  guest: {
    username: "invitado",
    password: null,
    role: "guest" as UserRole,
    displayName: "Invitado",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password?: string): boolean => {
    const normalizedUsername = username.toLowerCase().trim();

    if (normalizedUsername === "admin") {
      if (password === USERS.admin.password) {
        const userData: User = {
          username: USERS.admin.username,
          role: USERS.admin.role,
          displayName: USERS.admin.displayName,
        };
        setUser(userData);
        localStorage.setItem("currentUser", JSON.stringify(userData));
        return true;
      }
      return false;
    }

    if (normalizedUsername === "invitado") {
      const userData: User = {
        username: USERS.guest.username,
        role: USERS.guest.role,
        displayName: USERS.guest.displayName,
      };
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const isAdmin = user?.role === "admin";
  const isGuest = user?.role === "guest";
  const isAuthenticated = user !== null;
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canCreate = isAdmin;

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        isGuest,
        isAuthenticated,
        canEdit,
        canDelete,
        canCreate,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
