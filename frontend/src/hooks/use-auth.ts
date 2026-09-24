"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  login,
  logout,
  getCurrentUser,
  refreshSession,
  register,
} from "../services/auth.service";
import type { AuthSession } from "../lib/api.service";

type AuthAction = (email: string, password: string) => Promise<AuthSession>;

export type UseAuthResult = ReturnType<typeof useAuth>;

export function useAuth() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch {
        try {
          return await refreshSession();
        } catch {
          return null;
        }
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const isReady = !sessionQuery.isLoading;

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
  const registerMutation = useMutation({
    mutationFn: ({
      email,
      password,
      fullName,
    }: {
      email: string;
      password: string;
      fullName: string;
    }) => register(email, password, fullName),
  });

  async function authenticate(
    action: AuthAction,
    email: string,
    password: string,
  ) {
    const session = await action(email, password);
    queryClient.setQueryData(["auth-session"], session);
    return session;
  }

  const error =
    loginMutation.error?.message ?? registerMutation.error?.message ?? "";
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return {
    user: sessionQuery.data?.user ?? null,
    error,
    isLoading: isLoading || !isReady,
    isReady,
    login: (email: string, password: string) =>
      authenticate(
        (emailValue, passwordValue) =>
          loginMutation.mutateAsync({
            email: emailValue,
            password: passwordValue,
          }),
        email,
        password,
      ),
    register: (email: string, password: string, fullName: string) =>
      authenticate(
        (emailValue, passwordValue) =>
          registerMutation.mutateAsync({
            email: emailValue,
            password: passwordValue,
            fullName,
          }),
        email,
        password,
      ),
    logout: () => {
      queryClient.setQueryData(["auth-session"], null);
      void logout().catch(() => undefined);
    },
  };
}
