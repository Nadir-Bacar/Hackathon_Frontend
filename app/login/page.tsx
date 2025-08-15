"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, Phone, ArrowLeft, UserPlus, Fingerprint, Eye, Lock } from "lucide-react"
import Link from "next/link"

interface LoginAttempt {
  timestamp: number
  device: string
  success: boolean
  method: 'pin' | 'biometric'
}

interface BiometricStatus {
  available: boolean
  enrolled: boolean
  types: string[]
  error?: string
}

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [authMethod, setAuthMethod] = useState<'pin' | 'biometric'>('biometric')
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus>({
    available: false,
    enrolled: false,
    types: []
  })
  const [isBiometricLoading, setIsBiometricLoading] = useState(false)

  useEffect(() => {
    checkAccountStatus()
    checkBiometricAvailability()
    
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

  const checkBiometricAvailability = async () => {
    try {
      // Verifica se a API WebAuthn está disponível
      if (!window.PublicKeyCredential) {
        setBiometricStatus({
          available: false,
          enrolled: false,
          types: [],
          error: "WebAuthn não suportado neste navegador"
        })
        setAuthMethod('pin')
        return
      }

      // Verifica se há autenticadores disponíveis
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      
      if (available) {
        // Verifica tipos de biometria disponíveis
        const types: string[] = []
        
        // Simula detecção de tipos (na prática, isso seria mais complexo)
        if (navigator.userAgent.includes('Mobile')) {
          types.push('fingerprint', 'face')
        } else {
          types.push('fingerprint')
        }

        setBiometricStatus({
          available: true,
          enrolled: true, // Assumimos que já está configurado para este exemplo
          types
        })
        
        // Se biometria está disponível e o usuário já usou antes, mantenha como método preferido
        const lastAuthMethod = localStorage.getItem('preferredAuthMethod')
        if (lastAuthMethod === 'biometric') {
          setAuthMethod('biometric')
        }
      } else {
        setBiometricStatus({
          available: false,
          enrolled: false,
          types: [],
          error: "Autenticação biométrica não disponível"
        })
        setAuthMethod('pin')
      }
    } catch (error) {
      console.error('Erro ao verificar biometria:', error)
      setBiometricStatus({
        available: false,
        enrolled: false,
        types: [],
        error: "Erro ao verificar disponibilidade biométrica"
      })
      setAuthMethod('pin')
    }
  }

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

  const logLoginAttempt = (success: boolean, method: 'pin' | 'biometric') => {
    const attempts = JSON.parse(localStorage.getItem("loginAttempts") || "[]") as LoginAttempt[]
    const newAttempt: LoginAttempt = {
      timestamp: Date.now(),
      device: navigator.userAgent,
      success,
      method
    }

    attempts.push(newAttempt)
    // Keep only last 50 attempts
    if (attempts.length > 50) {
      attempts.splice(0, attempts.length - 50)
    }

    localStorage.setItem("loginAttempts", JSON.stringify(attempts))
  }

  const handleBiometricLogin = async () => {
    if (isBlocked || !biometricStatus.available) return

    setIsBiometricLoading(true)
    setError("")

    try {
      // Configuração do desafio WebAuthn
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
          type: 'public-key',
          id: new TextEncoder().encode('user-credential-id'), // Em produção, seria um ID único do usuário
        }],
        userVerification: 'required',
        timeout: 60000
      }

      // Solicita autenticação biométrica
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential

      if (credential) {
        // Simula validação do servidor (em produção, seria validado no backend)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        logLoginAttempt(true, 'biometric')
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("authMethod", "biometric")
        localStorage.setItem("preferredAuthMethod", "biometric")
        localStorage.setItem("userPhone", phoneNumber || "biometric-user")
        
        window.location.href = "/dashboard"
      } else {
        throw new Error("Credencial não foi criada")
      }
    } catch (error: any) {
      console.error('Erro na autenticação biométrica:', error)
      
      let errorMessage = "Falha na autenticação biométrica"
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Acesso negado pelo usuário"
      } else if (error.name === 'InvalidStateError') {
        errorMessage = "Estado inválido do autenticador"
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "Autenticação biométrica não suportada"
      } else if (error.name === 'SecurityError') {
        errorMessage = "Erro de segurança na autenticação"
      }
      
      setError(errorMessage)
      logLoginAttempt(false, 'biometric')
      checkAccountStatus()
    } finally {
      setIsBiometricLoading(false)
    }
  }

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBlocked) return

    setIsLoading(true)
    setError("")

    // Simulate login process
    setTimeout(() => {
      const isValidPhone = phoneNumber && phoneNumber.length >= 9
      const isValidPin = pin && pin.length === 6 && /^\d+$/.test(pin)

      if (isValidPhone && isValidPin) {
        logLoginAttempt(true, 'pin')
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("authMethod", "pin")
        localStorage.setItem("userPhone", phoneNumber)
        window.location.href = "/dashboard"
      } else {
        logLoginAttempt(false, 'pin')
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

  const getBiometricIcon = () => {
    if (biometricStatus.types.includes('face')) {
      return <Eye className="w-6 h-6" />
    }
    return <Fingerprint className="w-6 h-6" />
  }

  const getBiometricLabel = () => {
    if (biometricStatus.types.includes('face') && biometricStatus.types.includes('fingerprint')) {
      return "Face ID ou Touch ID"
    }
    if (biometricStatus.types.includes('face')) {
      return "Face ID"
    }
    if (biometricStatus.types.includes('fingerprint')) {
      return "Touch ID"
    }
    return "Biometria"
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
          <CardTitle className="text-2xl font-bold text-gray-900">Quick Quick</CardTitle>
          <CardDescription className="text-gray-600">
            {authMethod === 'biometric' ? 'Autenticação segura' : 'Entre com seu número e PIN'}
          </CardDescription>

          {/* Seletor de método de autenticação */}
          {biometricStatus.available && !isBlocked && (
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <Button
                type="button"
                variant={authMethod === 'biometric' ? 'default' : 'ghost'}
                size="sm"
                className={`flex-1 h-8 text-xs ${
                  authMethod === 'biometric' 
                    ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                    : 'text-gray-600 hover:text-pink-600'
                }`}
                onClick={() => setAuthMethod('biometric')}
              >
                {getBiometricIcon()}
                <span className="ml-1">Biometria</span>
              </Button>
              <Button
                type="button"
                variant={authMethod === 'pin' ? 'default' : 'ghost'}
                size="sm"
                className={`flex-1 h-8 text-xs ${
                  authMethod === 'pin' 
                    ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                    : 'text-gray-600 hover:text-pink-600'
                }`}
                onClick={() => setAuthMethod('pin')}
              >
                <Lock className="w-4 h-4" />
                <span className="ml-1">PIN</span>
              </Button>
            </div>
          )}
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

          {/* Autenticação Biométrica */}
          {authMethod === 'biometric' && biometricStatus.available && (
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center space-y-4 py-8">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isBiometricLoading 
                    ? 'bg-pink-100 animate-pulse' 
                    : 'bg-gray-100 hover:bg-pink-50'
                }`}>
                  <div className={`transition-all duration-300 ${
                    isBiometricLoading ? 'text-pink-600' : 'text-gray-600'
                  }`}>
                    {getBiometricIcon()}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getBiometricLabel()}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {isBiometricLoading 
                      ? 'Verificando identidade...' 
                      : 'Toque para autenticar'}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleBiometricLogin}
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold"
                disabled={isBiometricLoading || isBlocked}
              >
                {isBiometricLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Autenticando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {getBiometricIcon()}
                    Usar {getBiometricLabel()}
                  </div>
                )}
              </Button>

              {phoneNumber && (
                <p className="text-xs text-gray-500">
                  Autenticando como {formatPhoneNumber(phoneNumber)}
                </p>
              )}
            </div>
          )}

          {/* Autenticação por PIN */}
          {(authMethod === 'pin' || !biometricStatus.available) && (
            <form onSubmit={handlePinLogin} className="space-y-4">
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
          )}

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

          {/* Status da biometria para debug (remover em produção) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              <div>Biometria disponível: {biometricStatus.available ? 'Sim' : 'Não'}</div>
              <div>Tipos: {biometricStatus.types.join(', ') || 'Nenhum'}</div>
              {biometricStatus.error && <div>Erro: {biometricStatus.error}</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}