const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const API_PREFIX = configuredApiBaseUrl ? `${configuredApiBaseUrl}/api` : '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, init)

  if (!response.ok) {
    const text = await response.text()
    let parsedDetail: string | undefined

    try {
      const parsed = JSON.parse(text) as { detail?: string }
      parsedDetail = parsed.detail
    } catch {
      parsedDetail = undefined
    }

    throw new Error(parsedDetail || text || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export interface DeveloperTechStack {
  id: number
  developer_id: number
  tech_stack_id: number
  created_at: string
  tech_stack: TechStack
}

export interface TechStack {
  id: number
  name: string
  category: string | null
  created_at: string
}

export interface User {
  id: number
  email: string
  full_name: string | null
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

function withAuth(token: string, init?: RequestInit): RequestInit {
  return {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  }
}

export function registerUser(payload: {
  email: string
  password: string
  full_name?: string
}) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function loginUser(payload: { email: string; password: string }) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function fetchMe(token: string) {
  return request<User>('/auth/me', withAuth(token))
}

export function fetchTechStacks(token: string) {
  return request<TechStack[]>('/tech-stacks', withAuth(token))
}

export function createTechStack(
  token: string,
  payload: { name: string; category?: string },
) {
  const init = withAuth(token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  init.headers = {
    ...(init.headers ?? {}),
    'Content-Type': 'application/json',
  }
  return request<TechStack>('/tech-stacks', init)
}

export function deleteTechStack(token: string, id: number) {
  return request<void>(`/tech-stacks/${id}`, withAuth(token, { method: 'DELETE' }))
}

export function updateTechStack(
  token: string,
  id: number,
  payload: { name?: string; category?: string },
) {
  const init = withAuth(token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  init.headers = {
    ...(init.headers ?? {}),
    'Content-Type': 'application/json',
  }
  return request<TechStack>(`/tech-stacks/${id}`, init)
}

export function fetchMyTechStacks(token: string) {
  return request<DeveloperTechStack[]>('/tech-stacks/me', withAuth(token))
}

export function assignMyTechStack(token: string, techStackId: number) {
  return request<DeveloperTechStack>(`/tech-stacks/me/${techStackId}`, withAuth(token, { method: 'POST' }))
}

export function removeMyTechStack(token: string, techStackId: number) {
  return request<void>(`/tech-stacks/me/${techStackId}`, withAuth(token, { method: 'DELETE' }))
}
