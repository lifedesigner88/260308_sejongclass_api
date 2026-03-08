import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignMyTechStack,
  createTechStack,
  deleteTechStack,
  fetchMe,
  fetchMyTechStacks,
  fetchTechStacks,
  loginUser,
  registerUser,
  removeMyTechStack,
  updateTechStack,
} from './api'
import { clearSession, loadSession, saveSession } from './session'

export const queryKeys = {
  session: ['session'] as const,
  me: ['me'] as const,
  techStacks: ['tech-stacks'] as const,
  myTechStacks: ['my-tech-stacks'] as const,
}

export function getMeQueryOptions(token: string) {
  return {
    queryKey: queryKeys.me,
    queryFn: async () => {
      const user = await fetchMe(token)
      saveSession({ accessToken: token, user })
      return user
    },
  }
}

export function getTechStacksQueryOptions(token: string) {
  return {
    queryKey: queryKeys.techStacks,
    queryFn: async () => fetchTechStacks(token),
  }
}

export function getMyTechStacksQueryOptions(token: string) {
  return {
    queryKey: queryKeys.myTechStacks,
    queryFn: async () => fetchMyTechStacks(token),
  }
}

function requireToken() {
  const session = loadSession()
  if (!session) {
    throw new Error('로그인이 필요합니다.')
  }
  return session.accessToken
}

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => loadSession(),
    staleTime: Infinity,
  })
}

export function useMe(enabled: boolean) {
  return useQuery({
    enabled,
    ...getMeQueryOptions(requireToken()),
  })
}

export function useTechStacks(enabled: boolean) {
  return useQuery({
    enabled,
    ...getTechStacksQueryOptions(requireToken()),
  })
}

export function useMyTechStacks(enabled: boolean) {
  return useQuery({
    enabled,
    ...getMyTechStacksQueryOptions(requireToken()),
  })
}

export function useAuthMutations() {
  const queryClient = useQueryClient()

  const onAuthSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.session })
    void queryClient.invalidateQueries({ queryKey: queryKeys.me })
    void queryClient.invalidateQueries({ queryKey: queryKeys.techStacks })
    void queryClient.invalidateQueries({ queryKey: queryKeys.myTechStacks })
  }

  return {
    login: useMutation({
      mutationFn: loginUser,
      onSuccess: (response) => {
        saveSession({ accessToken: response.access_token, user: response.user })
        onAuthSuccess()
      },
    }),
    register: useMutation({
      mutationFn: registerUser,
      onSuccess: (response) => {
        saveSession({ accessToken: response.access_token, user: response.user })
        onAuthSuccess()
      },
    }),
    logout: () => {
      clearSession()
      void queryClient.removeQueries()
      void queryClient.invalidateQueries({ queryKey: queryKeys.session })
    },
  }
}

export function useTechStackMutations() {
  const queryClient = useQueryClient()
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.techStacks }),
      queryClient.invalidateQueries({ queryKey: queryKeys.myTechStacks }),
    ])
  }

  return {
    create: useMutation({
      mutationFn: (payload: { name: string; category?: string }) =>
        createTechStack(requireToken(), payload),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: { name?: string; category?: string } }) =>
        updateTechStack(requireToken(), id, payload),
      onSuccess: invalidate,
    }),
    delete: useMutation({
      mutationFn: (id: number) => deleteTechStack(requireToken(), id),
      onSuccess: invalidate,
    }),
    assign: useMutation({
      mutationFn: (techStackId: number) => assignMyTechStack(requireToken(), techStackId),
      onSuccess: invalidate,
    }),
    unassign: useMutation({
      mutationFn: (techStackId: number) => removeMyTechStack(requireToken(), techStackId),
      onSuccess: invalidate,
    }),
  }
}
