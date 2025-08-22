"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

interface SignInFormProps {
  onLoginSuccess?: () => void;
  onForgotPassword?: () => void;
}

export default function SignInForm({ onLoginSuccess, onForgotPassword }: SignInFormProps) {
  const router = useRouter();
  const { toast } = useToast(); // ✅ no fallback hack

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Listen to auth state changes
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const userFullName = session.user.user_metadata?.full_name || "";
        localStorage.setItem("auth", "true");
        localStorage.setItem("userFullName", userFullName);
        if (rememberMe && session.access_token) {
          localStorage.setItem("supabaseToken", session.access_token);
        }
        onLoginSuccess?.();
        router.push("/dashboard");
      } else {
        localStorage.removeItem("auth");
        localStorage.removeItem("userFullName");
        localStorage.removeItem("supabaseToken");
      }
    });

    return () => {
      data.subscription?.unsubscribe(); // ✅ safe cleanup
    };
  }, [router, rememberMe, onLoginSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast({
        title: "Login Failed",
        description: "Email and password cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // ✅ onAuthStateChange will handle redirect
    } catch (err) {
      console.error(err);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {/* Email Input */}
      <div className="space-y-3">
        <Label htmlFor="email" className="font-medium flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password Input */}
      <div className="space-y-3">
        <Label htmlFor="password" className="font-medium flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-500" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-4"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(val) => setRememberMe(Boolean(val))}
          />
          <Label htmlFor="remember">Remember me</Label>
        </div>
        {onForgotPassword && (
          <Button type="button" variant="link" onClick={onForgotPassword}>
            Forgot password?
          </Button>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
