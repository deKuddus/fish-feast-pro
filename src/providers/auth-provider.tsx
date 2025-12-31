"use client";

import { checkUserIsAdmin, getCurrentUser } from "@/app/actions/auth";
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
			const currentUser = await getCurrentUser();
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
		loadUser();

		// Listen for auth changes (important for OAuth flows)
		const channel = new BroadcastChannel("supabase-auth");
		channel.onmessage = (event) => {
			if (
				event.data?.event === "SIGNED_IN" ||
				event.data?.event === "TOKEN_REFRESHED"
			) {
				loadUser();
			}
		};

		// Also refresh on window focus (catches OAuth redirects)
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				loadUser();
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			channel.close();
			document.removeEventListener("visibilitychange", handleVisibilityChange);
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
