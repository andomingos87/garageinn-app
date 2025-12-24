import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getURL() {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // URL configurada manualmente
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // URL automática da Vercel
    'http://localhost:3000/'
  
  // Garantir https:// quando não for localhost
  url = url.startsWith('http') ? url : `https://${url}`
  // Garantir trailing slash
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}