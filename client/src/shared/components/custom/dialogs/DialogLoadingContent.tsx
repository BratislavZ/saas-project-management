"use client";

import { LoaderIcon } from "lucide-react";
import { DialogTitle } from "../../ui/dialog";

const DialogLoadingContent = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <DialogTitle className="hidden" />
      <LoaderIcon className="animate-spin" />
    </div>
  );
};
export default DialogLoadingContent;
