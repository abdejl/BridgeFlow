// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const OPERATOR_ROLES = ["admin", "tech"];

export function hasOperatorRole(role) {
  return OPERATOR_ROLES.includes(role);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    uid: "mock-001",
    displayName: "Youssef Alami",
    email: "youssef.alami@bridgeflow.ma",
    role: "tech",
  });

  const switchRole = useCallback((role) => {
    setUser((prev) => (prev ? { ...prev, role } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}