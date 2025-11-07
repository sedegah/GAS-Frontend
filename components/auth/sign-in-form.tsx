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
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    
    checkExistingSession();
  }, [router]);

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
      const { data, error } = await supabase.auth.signInWithPassword({
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

      if (data.session) {
        // Store session data
        localStorage.setItem("auth", "true");
        localStorage.setItem("userFullName", data.user.user_metadata?.full_name || "");
        if (rememberMe) {
          localStorage.setItem("supabaseToken", data.session.access_token);
        }

        // Show success message
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });

        // Call success callback and redirect
        onLoginSuccess?.();
        router.push("/dashboard");
        router.refresh(); // Refresh to update any server components
      }
    } catch (err) {
      console.error("Login error:", err);
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
          disabled={isLoading}
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
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            disabled={isLoading}
          />
          <Label htmlFor="remember" className="text-sm">Remember me</Label>
        </div>
        {onForgotPassword && (
          <Button 
            type="button" 
            variant="link" 
            onClick={onForgotPassword}
            disabled={isLoading}
            className="text-sm"
          >
            Forgot password?
          </Button>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full"
        size="lg"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
