"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const ShowNotificationAfterLogout = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const afterLogout = searchParams.get("afterLogout");
    if (afterLogout === "true") {
      const params = new URLSearchParams(searchParams);
      params.delete("afterLogout");
      // Show a notification or toast message
      toast.success("You have successfully logged out.");
      // Optionally, you can redirect to the home page or another page
    }
  }, [searchParams]);

  return null;
};

export default ShowNotificationAfterLogout;
