"use client";

import { useState, useEffect, useCallback } from "react";
import { authApi, setToken, clearToken, getToken, type User } from "@/lib/api";
import { toast } from "react-hot-toast";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.me();
      setUser(data);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      toast.success(`Welcome back, ${res.user.full_name}!`);
      return res.user;
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({ email, password, full_name: fullName });
      setToken(res.token);
      setUser(res.user);
      toast.success(`Account created! Welcome, ${res.user.full_name}!`);
      return res.user;
    } catch (err: any) {
      toast.error(err.message || "Failed to sign up");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    return login("demo@jenita.ai", "jenitademo123");
  };

  const logout = () => {
    clearToken();
    setUser(null);
    toast("Signed out");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginDemo,
    logout,
    refresh: fetchProfile,
  };
}
