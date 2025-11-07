"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, RefreshCw } from "lucide-react";

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
  const [retryCount, setRetryCount] = useState(0);

  // Check Supabase connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
      return !error;
    } catch {
      return false;
    }
  };

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
      // Test connection first
      const isConnected = await testConnection();
      if (!isConnected && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        toast({
          title: "Connection Issue",
          description: `Retrying connection... (${retryCount + 1}/3)`,
          variant: "destructive",
        });
        
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return handleLogin(e);
      }

      if (!isConnected) {
        toast({
          title: "Connection Failed",
          description: "Cannot connect to server. Please check your internet connection and try again.",
          variant: "destructive",
        });
        return;
      }

      // Reset retry count on successful connection test
      setRetryCount(0);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        console.error("Supabase auth error:", error);
        
        let errorMessage = error.message;
        if (error.message.includes("Failed to fetch") || error.message.includes("CONNECTION_CLOSED")) {
          errorMessage = "Network connection failed. Please check your internet connection.";
        } else if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password.";
        }

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (data.session) {
        // Store session data
        localStorage.setItem("auth", "true");
        localStorage.setItem("userEmail", data.user.email || "");
        if (rememberMe) {
          localStorage.setItem("supabaseToken", data.session.access_token);
        }

        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        });

        onLoginSuccess?.();
        
        // Use window.location.href instead of router.push for full page reload
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      
      let errorMessage = "Something went wrong. Please try again.";
      if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
        errorMessage = "Network error. Please check your internet connection.";
      }

      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryConnection = () => {
    setRetryCount(0);
    toast({
      title: "Retrying Connection",
      description: "Attempting to reconnect...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Error Banner */}
      {retryCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Connection issues detected. {retryCount > 2 && "Please check your network."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryConnection}
              className="text-yellow-800 border-yellow-300"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

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
            className="disabled:opacity-50"
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
              className="disabled:opacity-50 pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent disabled:opacity-50"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? 
                <EyeOff className="w-4 h-4" /> : 
                <Eye className="w-4 h-4" />
              }
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
            <Label htmlFor="remember" className="text-sm disabled:opacity-50">
              Remember me
            </Label>
          </div>
          {onForgotPassword && (
            <Button 
              type="button" 
              variant="link" 
              onClick={onForgotPassword}
              disabled={isLoading}
              className="text-sm disabled:opacity-50"
            >
              Forgot password?
            </Button>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full relative"
          size="lg"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}
