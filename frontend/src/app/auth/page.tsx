"use client"

import type React from "react"

import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { checkToken, login, register } from "@/app/service/api"

export default function page() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()


    useEffect(() => {
        async function verify() {
            const isAuthenticated = await checkToken();
            if (isAuthenticated) {
                router.replace("/notes"); 
            }
        }
        verify();
    }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const data  = await login({ email, password });
      console.log(data)

      if (data.access_token) {
        toast("Connexion réussie")
        router.push("/notes")
      } else {
        toast("Erreur de connexion")
      }
    } catch (error) {
      toast("Erreur réseau")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const first_name = formData.get("first_name") as string
    const last_name = formData.get("last_name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirm_password = formData.get("confirm_password") as string



    try {
      const response = await register({ first_name, last_name, email, password,confirm_password }) 

      if (response.ok) {
        toast("Compte créé avec succès")
      } else {
        toast("Erreur lors de la création du compte")
      }
    } catch (error) {
      toast("Erreur réseau")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Notes App</CardTitle>
          <CardDescription>Gérez vos notes en toute simplicité</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" placeholder="votre@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input id="login-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>


            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-first-name">Prénom</Label>
                  <Input id="signup-first-name" name="first_name" placeholder="Votre prénom" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-last-name">Nom</Label>
                  <Input id="signup-last-name" name="last_name" placeholder="Votre nom" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" placeholder="votre@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input id="signup-password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirmer le mot de passe</Label>
                    <Input id="signup-confirm-password" name="confirm_password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Création..." : "Créer un compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
