// app/(protected)/layout.tsx

'use client'
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { useUser } from '@/contexts/user_context'

interface ProtectedLayoutProps {
    children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
    const { userId } = useUser()
    if (!userId) {
        redirect('/signup') // Redirect if userId is null.
    }

    return <>{children}</> // Render children if userId is present.
}
