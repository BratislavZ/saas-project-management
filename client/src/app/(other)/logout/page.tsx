"use client";

import { useAuth } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";

const LogoutPage = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut({ redirectUrl: "/?afterLogout=true" });
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

    performLogout();
  }, [signOut]);

  return (
    <div className="flex gap-2 items-center justify-center h-screen">
      <Loader2Icon className="animate-spin" size={40} />
      <p className="text-xl">Logging out...</p>
    </div>
  );
};

export default LogoutPage;
