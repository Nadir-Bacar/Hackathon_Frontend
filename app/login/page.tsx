"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, Phone, ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"

interface LoginAttempt {
  timestamp: number
  device: string
  success: boolean
}

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0)
  const [failedAttempts, setFailedAttempts] = useState(0)

  useEffect(() => {
    checkAccountStatus()
    const interval = setInterval(() => {
      if (blockTimeRemaining > 0) {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsBlocked(false)
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [blockTimeRemaining])

  const checkAccountStatus = () => {
    const attempts = JSON.parse(localStorage.getItem("loginAttempts") || "[]") as LoginAttempt[]
    const recentFailures = attempts.filter(
      (attempt) => !attempt.success && Date.now() - attempt.timestamp < 30 * 60 * 1000, // 30 minutes
    )

    if (recentFailures.length >= 3) {
      const lastFailure = Math.max(...recentFailures.map((a) => a.timestamp))
      const blockEndTime = lastFailure + 30 * 60 * 1000 // 30 min block
      const remaining = Math.max(0, Math.ceil((blockEndTime - Date.now()) / 1000))

      if (remaining > 0) {
        setIsBlocked(true)
        setBlockTimeRemaining(remaining)
      }
    }

    setFailedAttempts(recentFailures.length)
  }

  const logLoginAttempt = (success: boolean) => {
    const attempts = JSON.parse(localStorage.getItem("loginAttempts") || "[]") as LoginAttempt[]
    const newAttempt: LoginAttempt = {
      timestamp: Date.now(),
      device: navigator.userAgent,
      success,
    }

    attempts.push(newAttempt)
    // Keep only last 50 attempts
    if (attempts.length > 50) {
      attempts.splice(0, attempts.length - 50)
    }

    localStorage.setItem("loginAttempts", JSON.stringify(attempts))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBlocked) return

    setIsLoading(true)
    setError("")

    // Simulate login process
    setTimeout(() => {
      const isValidPhone = phoneNumber && phoneNumber.length >= 9
      const isValidPin = pin && pin.length === 6 && /^\d+$/.test(pin)

      if (isValidPhone && isValidPin) {
        logLoginAttempt(true)
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("authMethod", "pin")
        localStorage.setItem("userPhone", phoneNumber)
        window.location.href = "/dashboard"
      } else {
        logLoginAttempt(false)
        setError("Número de telefone ou PIN inválido")
        checkAccountStatus()
      }
      setIsLoading(false)
    }, 1500)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Format as +258 XX XXX XXXX (Mozambique format)
    if (digits.length <= 3) return `+258 ${digits}`
    if (digits.length <= 5) return `+258 ${digits.slice(3, 5)} ${digits.slice(5)}`
    return `+258 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-pink-600 hover:text-pink-700">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="w-6"></div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">IziPay</CardTitle>
          {/* <CardDescription className="text-gray-600">Entre com seu número e PIN</CardDescription> */}

          {/* <div className="flex justify-center gap-2">
            <Badge variant={isBlocked ? "destructive" : "secondary"} className="text-xs">
              {isBlocked
                ? `Bloqueado ${formatTime(blockTimeRemaining)}`
                : failedAttempts > 0
                  ? `${failedAttempts}/3 tentativas`
                  : "Seguro"}
            </Badge>
          </div> */}
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isBlocked && (
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Conta temporariamente bloqueada por segurança. Tente novamente em {formatTime(blockTimeRemaining)}.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Número de Telefone
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+258 XX XXX XXXX"
                  value={formatPhoneNumber(phoneNumber)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "")
                    if (digits.length <= 12) {
                      setPhoneNumber(digits)
                    }
                  }}
                  required
                  disabled={isBlocked}
                  className="h-12 pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin" className="text-sm font-medium text-gray-700">
                PIN (6 dígitos)
              </Label>
              <Input
                id="pin"
                type="password"
                placeholder="••••••"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                  setPin(value)
                }}
                required
                disabled={isBlocked}
                className="h-12 text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold"
              disabled={isLoading || isBlocked}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="space-y-3 text-center">
            <Link
              href="/recover-password"
              className="text-sm text-pink-600 hover:text-pink-700 font-medium inline-flex items-center gap-1"
            >
              <Phone className="w-4 h-4" />
              Esqueci minha senha
            </Link>

            <div className="border-t pt-3">
              <Link
                href="/signup"
                className="text-sm text-gray-600 hover:text-pink-600 font-medium inline-flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                Criar nova conta
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
