"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Filter } from "lucide-react";
import React from "react";

export default function FilterDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Filter size={20} className="cursor-pointer hover:text-black" />
      </DialogTrigger>
      <DialogContent className="bg-gray-700">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription className="text-white">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
