import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAuth } from "firebase/auth";

interface User {
    _id: string;
    authUid?: string;
    username: string;
    profilePic?: string | null;
    email: string;
    emailVerified?: boolean;
    type: string;
    birthDate?: string;
    responsavelId?: string;
    dojoId?: string | null;
    status?: string;
    absences?: number;
    childrens?: {
        _id?: string;
        username: string;
        birthDate: string;
        absences?: number;
    }[];
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: () => boolean;
    Login: (userData: User) => void;
    logout: () => void;
    getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const auth = getAuth();

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    const Login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("user",JSON.stringify(userData));
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('user');
        await auth.signOut();
    };

    const isAuthenticated = () => !!user;

    const getToken = async (): Promise<string | null> => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return null;
        try {
            return await firebaseUser.getIdToken(true);
        } catch (error) {
            console.error('Erro ao pegar token: ', error);
            return null;
        }
    }

    return (
        <AuthContext.Provider value={{ user, Login, logout, isAuthenticated, getToken}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};