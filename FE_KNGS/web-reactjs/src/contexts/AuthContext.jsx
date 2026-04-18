import { createContext, useContext, useState, useEffect } from "react";
import { getAdminCounts } from "../services/userApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const [adminCounts, setAdminCounts] = useState({
    tutor_count: 0, post_count: 0, booking_count: 0, payment_count: 0
  });

  // Hàm gọi API lấy số lượng (Dùng chung toàn hệ thống)
  const refreshAdminCounts = async () => {
    if (user?.role_id == 1) {
      try {
        const data = await getAdminCounts();
        setAdminCounts(data || {});
      } catch (e) {
        console.error("Lỗi cập nhật badge:", e);
      }
    }
  };

  // Tự động load khi user là admin
  useEffect(() => {
    if (user?.role_id == 1) refreshAdminCounts();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        adminCounts,        
        refreshAdminCounts,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);