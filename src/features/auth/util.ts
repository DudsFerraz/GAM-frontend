import { jwtDecode } from 'jwt-decode';

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

export const clearToken = () => {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
};

interface JwtPayload {
  sub: string;
  exp: number;
}

export const getUserIdFromToken = (): string | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub;
  } catch (error) {
    console.error("Erro ao decodificar token", error);
    return null;
  }
};