import type { NextConfig } from "next";
require("dotenv").config();

const nextConfig: NextConfig = {
	compress: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.supabase.co",
			},
		],
	},
	experimental: {
		serverActions: {
			bodySizeLimit: "2mb",
		},
	},
	env: {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
	},
	compiler: {
		removeConsole: true,
	},
};

export default nextConfig;
