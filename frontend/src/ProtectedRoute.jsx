import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";

export function ProtectedRoute() {
  const [user, setUser] = useState(undefined); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <p style={{ textAlign: "center" }}>Checking authentication...</p>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
