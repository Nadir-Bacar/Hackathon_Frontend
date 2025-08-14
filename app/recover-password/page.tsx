"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Phone, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function RecoverPasswordPage() {
  const [step, setStep] = useState<"phone" | "sent" | "reset">("phone")
  const [phone, setPhone] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate phone validation and email sending
    setTimeout(() => {
      if (phone && phone.length >= 9) {
        // Simulate finding user by phone and sending email
        setStep("sent")
      } else {
        setError("Número de telefone inválido")
      }
      setIsLoading(false)
    }, 2000)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    setTimeout(() => {
      if (newPassword.length < 6) {
        setError("Senha deve ter pelo menos 6 caracteres")
      } else if (newPassword !== confirmPassword) {
        setError("Senhas não coincidem")
      } else {
        // Save new password (in real app, this would be handled by backend)
        localStorage.setItem("passwordReset", "true")
        setStep("reset")
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
            {step === "reset" ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Phone className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {step === "phone" && "Recuperar Senha"}
            {step === "sent" && "Email Enviado"}
            {step === "reset" && "Senha Alterada"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {step === "phone" && "Digite seu número de telefone para receber instruções"}
            {step === "sent" && "Verifique seu email para continuar"}
            {step === "reset" && "Sua senha foi alterada com sucesso"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "phone" && (
            <form onSubmit={handleSendRecovery} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Número de Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+258 84 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar Instruções"}
              </Button>
            </form>
          )}

          {step === "sent" && (
            <div className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Enviamos as instruções para o email associado ao número {phone}. Verifique sua caixa de entrada e
                  spam.
                </AlertDescription>
              </Alert>
              <Button onClick={() => setStep("phone")} variant="outline" className="w-full h-12">
                Tentar Outro Número
              </Button>
              <div className="text-center">
                <Button onClick={() => setStep("reset")} variant="link" className="text-pink-600 hover:text-pink-700">
                  Já recebi o email - Alterar senha
                </Button>
              </div>
            </div>
          )}

          {step === "reset" && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Sua senha foi alterada com sucesso! Você já pode fazer login com a nova senha.
                </AlertDescription>
              </Alert>
              <Link href="/">
                <Button className="w-full h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold">
                  Voltar ao Login
                </Button>
              </Link>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-700 font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
