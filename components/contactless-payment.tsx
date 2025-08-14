"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, QrCode, Wifi, CheckCircle, XCircle, AlertTriangle, Zap, CreditCard, MapPin } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  merchant: string
  location: string
  timestamp: number
  status: "SUCCESS" | "FAILED"
  method: "NFC" | "QR_CODE"
  receipt: string
}

interface ContactlessPaymentProps {
  onBack: () => void
  userBalance: number
}

export function ContactlessPayment({ onBack, userBalance }: ContactlessPaymentProps) {
  const [step, setStep] = useState<"amount" | "method" | "processing" | "proximity" | "success" | "failed">("amount")
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"NFC" | "QR_CODE">("NFC")
  const [error, setError] = useState("")
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [proximityDetected, setProximityDetected] = useState(false)

  const validateAmount = (value: string): boolean => {
    if (!value || Number.parseFloat(value) <= 0) return false

    // Check precision (max 15-16 digits)
    const parts = value.split(".")
    const totalDigits = parts.join("").length

    if (totalDigits > 16) {
      setError("Valor excede a precisão máxima permitida (16 dígitos)")
      return false
    }

    const numValue = Number.parseFloat(value)
    if (numValue > userBalance) {
      setError("Saldo insuficiente")
      return false
    }

    return true
  }

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (validateAmount(amount)) {
      setStep("method")
    }
  }

  const handleMethodSelect = (method: "NFC" | "QR_CODE") => {
    setPaymentMethod(method)
    if (method === "NFC") {
      setStep("proximity")
      // Simulate proximity detection
      setTimeout(() => {
        setProximityDetected(true)
        setTimeout(() => processPayment(), 2000)
      }, 3000)
    } else {
      setStep("processing")
      setTimeout(() => processPayment(), 2000)
    }
  }

  const processPayment = () => {
    setStep("processing")

    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.1 // 90% success rate

      const newTransaction: Transaction = {
        id: `TXN${Date.now()}`,
        amount: Number.parseFloat(amount),
        merchant: "Loja Exemplo",
        location: "Maputo, Moçambique",
        timestamp: Date.now(),
        status: success ? "SUCCESS" : "FAILED",
        method: paymentMethod,
        receipt: `REC${Date.now()}`,
      }

      setTransaction(newTransaction)

      // Save transaction to localStorage
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
      transactions.unshift(newTransaction)
      localStorage.setItem("transactions", JSON.stringify(transactions))

      // Log transaction
      const logs = JSON.parse(localStorage.getItem("transactionLogs") || "[]")
      logs.push({
        timestamp: Date.now(),
        action: "PAYMENT_ATTEMPT",
        details: newTransaction,
        device: navigator.userAgent,
      })
      localStorage.setItem("transactionLogs", JSON.stringify(logs))

      setStep(success ? "success" : "failed")
    }, 3000)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
    }).format(value)
  }

  const formatDateTime = (timestamp: number) => {
    return new Intl.DateTimeFormat("pt-MZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-pink-600 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 text-white">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Pagamento Contactless</h1>
            <p className="text-pink-100 text-sm">Pague de forma rápida e segura</p>
          </div>
        </div>

        {/* Amount Input Step */}
        {step === "amount" && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Valor do Pagamento
              </CardTitle>
              <CardDescription>Digite o valor que deseja pagar</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleAmountSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (MZN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setError("")
                    }}
                    className="h-12 text-lg text-center"
                    required
                  />
                  <p className="text-sm text-gray-500">Saldo disponível: {formatCurrency(userBalance)}</p>
                </div>

                <Button type="submit" className="w-full h-12 bg-pink-500 hover:bg-pink-600">
                  Continuar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Payment Method Selection */}
        {step === "method" && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Escolha o Método</CardTitle>
              <CardDescription>Como deseja efetuar o pagamento?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-pink-600">{formatCurrency(Number.parseFloat(amount))}</p>
              </div>

              <Button
                onClick={() => handleMethodSelect("NFC")}
                className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center justify-center gap-3"
              >
                <Wifi className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold">Pagamento NFC</p>
                  <p className="text-sm opacity-90">Aproxime o dispositivo</p>
                </div>
              </Button>

              <Button
                onClick={() => handleMethodSelect("QR_CODE")}
                className="w-full h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center justify-center gap-3"
              >
                <QrCode className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold">QR Code</p>
                  <p className="text-sm opacity-90">Escaneie para pagar</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Proximity Detection */}
        {step === "proximity" && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Wifi
                  className={`w-8 h-8 ${proximityDetected ? "text-green-500" : "text-blue-500"} ${!proximityDetected ? "animate-pulse" : ""}`}
                />
              </div>
              <CardTitle>{proximityDetected ? "Dispositivo Detectado!" : "Aproxime o Dispositivo"}</CardTitle>
              <CardDescription>
                {proximityDetected
                  ? "Processando pagamento..."
                  : "Mantenha o telefone próximo ao terminal de pagamento"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-2xl font-bold text-pink-600">{formatCurrency(Number.parseFloat(amount))}</div>
              <Badge variant={proximityDetected ? "default" : "secondary"} className="text-sm">
                {proximityDetected ? "Conectado" : "Procurando..."}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Processing */}
        {step === "processing" && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
              <CardTitle>Processando Pagamento</CardTitle>
              <CardDescription>Aguarde enquanto processamos sua transação</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-2xl font-bold text-pink-600">{formatCurrency(Number.parseFloat(amount))}</div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {step === "success" && transaction && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-green-600">Pagamento Realizado!</CardTitle>
              <CardDescription>Sua transação foi processada com sucesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID da Transação:</span>
                  <span className="font-mono text-sm">{transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comerciante:</span>
                  <span>{transaction.merchant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <Badge variant="outline">{transaction.method}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data/Hora:</span>
                  <span className="text-sm">{formatDateTime(transaction.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Local:</span>
                  <span className="text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {transaction.location}
                  </span>
                </div>
              </div>

              <Button onClick={onBack} className="w-full h-12 bg-pink-500 hover:bg-pink-600">
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Failed */}
        {step === "failed" && transaction && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-red-600">Pagamento Falhou</CardTitle>
              <CardDescription>Não foi possível processar sua transação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Erro no processamento. Tente novamente ou contacte o suporte.</AlertDescription>
              </Alert>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID da Transação:</span>
                  <span className="font-mono text-sm">{transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span>{formatCurrency(transaction.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="destructive">FALHOU</Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep("amount")} variant="outline" className="flex-1">
                  Tentar Novamente
                </Button>
                <Button onClick={onBack} className="flex-1 bg-pink-500 hover:bg-pink-600">
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
