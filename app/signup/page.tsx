"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Shield, Phone, CreditCard, User, Mail, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface SignupData {
  fullName: string
  phoneNumber: string
  email: string
  cardNumber: string
  expiryDate: string
  cvv: string
  pin: string
  confirmPin: string
}

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [signupData, setSignupData] = useState<SignupData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    pin: "",
    confirmPin: "",
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 3) return `+258 ${digits}`
    if (digits.length <= 5) return `+258 ${digits.slice(3, 5)} ${digits.slice(5)}`
    return `+258 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
  }

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    }
    return digits
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return signupData.fullName.length >= 2 && signupData.phoneNumber.length >= 9
      case 2:
        return signupData.email.includes("@") && signupData.email.includes(".")
      case 3:
        return (
          signupData.cardNumber.replace(/\D/g, "").length === 16 &&
          signupData.expiryDate.length === 5 &&
          signupData.cvv.length === 3
        )
      case 4:
        return (
          signupData.pin.length === 6 && signupData.confirmPin.length === 6 && signupData.pin === signupData.confirmPin
        )
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError("")
      setCurrentStep(currentStep + 1)
    } else {
      setError("Por favor, preencha todos os campos corretamente")
    }
  }

  const handleBack = () => {
    setError("")
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError("PINs não coincidem ou são inválidos")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate account creation
    setTimeout(() => {
      // Save user data
      localStorage.setItem("userData", JSON.stringify(signupData))
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("authMethod", "pin")
      localStorage.setItem("userPhone", signupData.phoneNumber)

      // Redirect to dashboard
      window.location.href = "/dashboard"
    }, 2000)
  }

  const updateSignupData = (field: keyof SignupData, value: string) => {
    setSignupData((prev) => ({ ...prev, [field]: value }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-pink-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Informações Pessoais</h3>
              <p className="text-sm text-gray-600">Vamos começar com seus dados básicos</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={signupData.fullName}
                onChange={(e) => updateSignupData("fullName", e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Número de Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+258 XX XXX XXXX"
                  value={formatPhoneNumber(signupData.phoneNumber)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "")
                    if (digits.length <= 12) {
                      updateSignupData("phoneNumber", digits)
                    }
                  }}
                  className="h-12 pl-12"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 text-pink-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Email de Contato</h3>
              <p className="text-sm text-gray-600">Para recuperação de senha e notificações</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Endereço de Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={signupData.email}
                onChange={(e) => updateSignupData("email", e.target.value)}
                className="h-12"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CreditCard className="w-12 h-12 text-pink-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Associar Cartão</h3>
              <p className="text-sm text-gray-600">Vincule seu cartão Millennium BIM</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={formatCardNumber(signupData.cardNumber)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "")
                  if (digits.length <= 16) {
                    updateSignupData("cardNumber", digits)
                  }
                }}
                className="h-12"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Validade</Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/AA"
                  value={formatExpiryDate(signupData.expiryDate)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "")
                    if (digits.length <= 4) {
                      updateSignupData("expiryDate", digits)
                    }
                  }}
                  className="h-12"
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={signupData.cvv}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "")
                    if (digits.length <= 3) {
                      updateSignupData("cvv", digits)
                    }
                  }}
                  className="h-12"
                  maxLength={3}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-pink-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Criar PIN de Segurança</h3>
              <p className="text-sm text-gray-600">Escolha um PIN de 6 dígitos para acessar sua conta</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">PIN (6 dígitos)</Label>
              <Input
                id="pin"
                type="password"
                placeholder="••••••"
                value={signupData.pin}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 6)
                  updateSignupData("pin", digits)
                }}
                className="h-12 text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirmar PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                placeholder="••••••"
                value={signupData.confirmPin}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 6)
                  updateSignupData("confirmPin", digits)
                }}
                className="h-12 text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            {signupData.pin && signupData.confirmPin && (
              <div className="flex items-center gap-2 text-sm">
                {signupData.pin === signupData.confirmPin ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">PINs coincidem</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-red-500" />
                    <span className="text-red-600">PINs não coincidem</span>
                  </>
                )}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-between">
            {currentStep > 1 ? (
              <Button variant="ghost" size="sm" onClick={handleBack} className="text-pink-600">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            ) : (
              <Link href="/login" className="text-pink-600 hover:text-pink-700">
                <ArrowLeft className="w-6 h-6" />
              </Link>
            )}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="w-6"></div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">IziPay</CardTitle>
          <CardDescription className="text-gray-600">
            Passo {currentStep} de {totalSteps}
          </CardDescription>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500">{Math.round(progress)}% concluído</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {renderStep()}

          <div className="flex gap-3">
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold"
                disabled={!validateStep(currentStep)}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold"
                disabled={isLoading || !validateStep(4)}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
