"use client";
import type React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { checkToken, getNotes } from "@/app/service/api";
import { UserNav } from "./components/user-nav";
import Image from "next/image";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { toast } from "sonner";
import { Note } from "../types";

const Page = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const router = useRouter();


useEffect(() => {
  async function verifyAndFetch() {
    const isAuthenticated = await checkToken();
    if (!isAuthenticated) {
      router.replace("/auth");
    } else {
      const response = await getNotes();
      if (response) {
        setNotes(response);
      } else {
        toast.error("Failed to fetch notes");
      }
    }
  }
  verifyAndFetch();
}, [router]);

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/tasks-light.png"
          width={1280}
          height={998}
          alt="Playground"
          className="block dark:hidden"
        />
        <Image
          src="/examples/tasks-dark.png"
          width={1280}
          height={998}
          alt="Playground"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your Notes for this month!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
        <DataTable data={notes} columns={columns} />
      </div>
    </>
  );
};

export default Page;
