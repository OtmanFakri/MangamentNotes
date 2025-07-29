'use client'
import type React from "react"
import { useRouter } from "next/navigation"
import { useState,useEffect } from "react"
import { checkToken } from "@/app/service/api"
import { UserNav } from "./components/user-nav"
import Image from "next/image" 
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { Note } from "@/lib/utils"

const Page =  async () => {

  const[isopen,setIsOpen] = useState(false)

  const notes: Note[] = [
  {
    "id": "NOTE-8782",
    "title": "Configuration du serveur de développement",
    "content": "# Configuration serveur\n\nPour configurer le serveur de développement, il faut d'abord installer les dépendances nécessaires :\n\n```bash\nnpm install express dotenv\n```\n\nEnsuite, créer le fichier `.env` avec les variables d'environnement appropriées.",
    "createdAt": new Date("2024-01-15T10:30:00"),
    "modifiedAt": new Date("2024-01-16T14:20:00"),
    "tags": ["développement", "serveur", "configuration"],
    "visibility": "private"
  },
  {
    "id": "NOTE-7878",
    "title": "Idées pour l'amélioration de l'interface utilisateur",
    "content": "## Améliorations UI/UX\n\n- Ajouter un mode sombre\n- Améliorer la navigation mobile\n- Optimiser les temps de chargement\n- Ajouter des animations fluides\n\n**Priorité haute :** Mode sombre et navigation mobile",
    "createdAt": new Date("2024-01-12T09:15:00"),
    "modifiedAt": new Date("2024-01-12T09:15:00"),
    "tags": ["ui", "ux", "amélioration"],
    "visibility": "shared"
  },
  {
    "id": "NOTE-9123",
    "title": "Réunion équipe - Points clés",
    "content": "# Réunion du 10 janvier 2024\n\n## Participants\n- Marie (Chef de projet)\n- Paul (Développeur)\n- Sophie (Designer)\n\n## Points abordés\n1. Nouvelle fonctionnalité de recherche\n2. Mise à jour de la base de données\n3. Planning des prochaines releases",
    "createdAt": new Date("2024-01-10T16:00:00"),
    "modifiedAt": new Date("2024-01-10T17:30:00"),
    "tags": ["réunion", "équipe", "planning"],
    "visibility": "shared"
  },
  {
    "id": "NOTE-4567",
    "title": "Recette de tarte aux pommes",
    "content": "# Tarte aux pommes traditionnelle\n\n## Ingrédients\n- 6 pommes\n- 200g de farine\n- 100g de beurre\n- 1 œuf\n- 50g de sucre\n\n## Préparation\n1. Éplucher et couper les pommes\n2. Préparer la pâte brisée\n3. Cuire 35 minutes à 180°C",
    "createdAt": new Date("2024-01-08T20:45:00"),
    "modifiedAt": new Date("2024-01-09T10:00:00"),
    "tags": ["cuisine", "recette", "dessert"],
    "visibility": "public"
  },
  {
    "id": "NOTE-3456",
    "title": "Liste de lecture - Livres techniques",
    "content": "## Livres à lire - 2024\n\n### En cours\n- Clean Code - Robert Martin\n- Design Patterns - Gang of Four\n\n### À lire\n- System Design Interview - Alex Xu\n- Microservices Patterns - Chris Richardson\n- Domain-Driven Design - Eric Evans\n\n*Objectif : 1 livre par mois*",
    "createdAt": new Date("2024-01-05T11:20:00"),
    "modifiedAt": new Date("2024-01-14T18:00:00"),
    "tags": ["lecture", "formation", "technique"],
    "visibility": "private"
  },
  {
    "id": "NOTE-2345",
    "title": "Idée d'application mobile",
    "content": "# App de suivi des habitudes\n\n## Concept\nUne application pour suivre et développer de bonnes habitudes quotidiennes.\n\n## Fonctionnalités principales\n- Création d'habitudes personnalisées\n- Suivi quotidien avec statistiques\n- Rappels intelligents\n- Gamification avec badges\n- Synchronisation cloud\n\n## Technologies envisagées\n- React Native\n- Firebase\n- TypeScript",
    "createdAt": new Date("2024-01-03T14:30:00"),
    "modifiedAt": new Date("2024-01-11T09:45:00"),
    "tags": ["idée", "mobile", "projet"],
    "visibility": "shared"
  }
]
  // function create new note
  const createNewNote = (note) => {
    notes.push(note)
  }

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
            <UserNav/>
          </div>
        </div>
        <DataTable data={notes} columns={columns} />
      </div>
    </>
  )
}
 
export default Page;