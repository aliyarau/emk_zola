import type { NextConfig } from "next"

// bundle analyzer как у тебя
// @ts-ignore
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

const devOrigins = ["http://127.0.0.1:54321", "http://localhost:54321"]
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "https://*.supabase.co"

// CSP: разрешаем картинки/медиа/коннекты с локального Supabase и *.supabase.co
const csp = `
  default-src 'self';
  img-src 'self' data: blob: ${devOrigins.join(" ")} ${supabaseOrigin};
  media-src 'self' data: blob: ${devOrigins.join(" ")} ${supabaseOrigin};
  connect-src 'self' ${devOrigins.join(" ")} ${supabaseOrigin} https: ws: wss:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
  style-src 'self' 'unsafe-inline' https:;
  font-src 'self' data: https:;
  object-src 'none';
  base-uri 'self';
`
  .replace(/\n/g, " ")
  .trim()

const nextConfig: NextConfig = withBundleAnalyzer({
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
    nodeMiddleware: true,
  },
  serverExternalPackages: ["shiki", "vscode-oniguruma"],

  // ВАЖНО: добавили локальный Supabase и расширили pathname,
  // чтобы покрыть и /object/sign/**, и /public/**
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },

  // ДОБАВЛЯЕМ CSP ХЕДЕР
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ]
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
})

export default nextConfig
