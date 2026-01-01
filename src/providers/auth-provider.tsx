"use client";

import { checkUserIsAdmin } from "@/app/actions/auth";
import { createSupabaseClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

interface AuthContextType {
	user: User | null;
	isAdmin: boolean;
	isLoading: boolean;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const loadUser = async () => {
		try {
			setIsLoading(true);
			const supabase = createSupabaseClient();
			const {
				data: { user: currentUser },
			} = await supabase.auth.getUser();
			setUser(currentUser);

			if (currentUser) {
				const adminStatus = await checkUserIsAdmin(currentUser.id);
				setIsAdmin(adminStatus);
			} else {
				setIsAdmin(false);
			}
		} catch (error) {
			console.error("Error loading user:", error);
			setUser(null);
			setIsAdmin(false);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const supabase = createSupabaseClient();

		// Load initial user
		loadUser();

		// Set up auth state change listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log("Auth state changed:", event);
			if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
				loadUser();
			} else if (event === "SIGNED_OUT") {
				setUser(null);
				setIsAdmin(false);
				setIsLoading(false);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return (
		<AuthContext.Provider
			value={{ user, isAdmin, isLoading, refreshUser: loadUser }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
