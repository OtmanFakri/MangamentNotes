'use client'
import type React from "react"
import { useRouter } from "next/navigation"
import { useState,useEffect } from "react"
import { checkToken } from "@/app/service/api"
const Page = () => {
      const router = useRouter()
    
    
        useEffect(() => {
            async function verify() {
                const isAuthenticated = await checkToken();
                if (!isAuthenticated) {
                    router.replace("/auth"); 
                }
            }
            verify();
        }, [router]);
    return (
        <div>
            <h1>Notes</h1>
            <p>Here you can manage your notes.</p>
        </div>
    );
}
 
export default Page;