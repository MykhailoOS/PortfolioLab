const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

interface LoginResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface RegisterResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier: email,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Login failed');
  }

  return response.json();
}

export async function register(
  email: string,
  password: string,
  username?: string
): Promise<RegisterResponse> {
  const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username || email.split('@')[0],
      email,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Registration failed');
  }

  return response.json();
}

export async function getMe(jwt: string) {
  const response = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
}
