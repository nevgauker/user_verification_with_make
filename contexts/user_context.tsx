// UserContext.tsx
'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
    userId: number | null;
    setUserId: (id: number | null) => void;
}


const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [userId, setUserIdState] = useState<number | null>(null);


    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserIdState(Number(storedUserId));
        }
    }, [])


    const setUserId = (id: number | null) => {
        setUserIdState(id);
        if (id === null) {
            localStorage.removeItem('userId');
        } else {
            localStorage.setItem('userId', id.toString());
        }
    }

    return (
        <UserContext.Provider value={{ userId, setUserId }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
