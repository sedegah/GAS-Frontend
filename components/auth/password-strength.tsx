import { CheckCircle, XCircle } from "lucide-react"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    strength = Object.values(checks).filter(Boolean).length

    return {
      score: strength,
      checks,
      label: strength < 2 ? "Weak" : strength < 4 ? "Medium" : "Strong",
      color: strength < 2 ? "text-red-400" : strength < 4 ? "text-yellow-400" : "text-green-400",
    }
  }

  const passwordStrength = getPasswordStrength(password)

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Password strength:</span>
        <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.label}</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-200 ${
              i < passwordStrength.score
                ? passwordStrength.score < 2
                  ? "bg-red-400"
                  : passwordStrength.score < 4
                    ? "bg-yellow-400"
                    : "bg-green-400"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <div className="space-y-1">
        {Object.entries(passwordStrength.checks).map(([key, passed]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            {passed ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : (
              <XCircle className="w-3 h-3 text-gray-500" />
            )}
            <span className={passed ? "text-green-400" : "text-gray-500"}>
              {key === "length" && "At least 8 characters"}
              {key === "uppercase" && "One uppercase letter"}
              {key === "lowercase" && "One lowercase letter"}
              {key === "number" && "One number"}
              {key === "special" && "One special character"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { getPasswordStrength } from "./password-strength"

function getPasswordStrength(password: string) {
  let strength = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  strength = Object.values(checks).filter(Boolean).length

  return {
    score: strength,
    checks,
    label: strength < 2 ? "Weak" : strength < 4 ? "Medium" : "Strong",
    color: strength < 2 ? "text-red-400" : strength < 4 ? "text-yellow-400" : "text-green-400",
  }
}
