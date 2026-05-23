import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getAuth } from "firebase/auth"

interface User {
    _id: string
    authUid?: string
    username: string
    name?: string
    profilePic?: string | null
    email: string
    emailVerified?: boolean
    type: string
    birthDate?: string
    responsavelId?: string
    dojoId?: string | null
    status?: string
    absences?: number
    belt?: string
    points?: number
    ranking?: number
    tournamentParticipations?: number; // Total de torneios que o atleta participou
    tournamentVictories?: number; // Total de vitórias por acertos de predições
    childrenStats?: Array<{
        _id: string
        username: string
        name?: string
        profilePic?: string
        belt?: string
        points?: number
        ranking?: number
    }>
    childrens?: {
        _id?: string
        username: string
        birthDate: string
        absences?: {
            month: string
            count: number
        }[]
    }[]
}

export const getAthleteProfileStats = (user: User | null | undefined) => ({
    predictionVictories: user?.tournamentVictories ?? 0,
    tournamentParticipations: user?.tournamentParticipations ?? 0,
})

interface AuthContextType {
    user: User | null
    isAuthenticated: () => boolean
    Login: (userData: User) => void
    logout: () => void
    getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem("user")
        return savedUser ? JSON.parse(savedUser) : null
    })

    const auth = getAuth()

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user))
        } else {
            localStorage.removeItem("user")
        }
    }, [user])

    const Login = (userData: User) => {
        setUser(userData)
        localStorage.setItem("user",JSON.stringify(userData))
    }

    const persistToken = async () => {
        try {
            const firebaseUser = auth.currentUser
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken()
                localStorage.setItem('token', token)
            }
        } catch (err) {

        }
    }

    useEffect(() => {
        if (user) {
            persistToken()
        }
    }, [user])

    const logout = async () => {
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        await auth.signOut()
    }

    const isAuthenticated = () => !!user

    const getToken = async (): Promise<string | null> => {
        const firebaseUser = auth.currentUser
        if (!firebaseUser) return null
        try {
            return await firebaseUser.getIdToken()
        } catch (error) {

            return null
        }
    }

    return (
        <AuthContext.Provider value={{ user, Login, logout, isAuthenticated, getToken}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}