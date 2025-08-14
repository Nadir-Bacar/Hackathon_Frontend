"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Wifi, Smartphone, CheckCircle, XCircle, Loader2, ArrowLeft, Receipt } from "lucide-react"
import { TransactionStorage } from "@/lib/transaction-storage"

interface NFCPaymentInterfaceProps {
  isNfcEnabled: boolean
  onClose: () => void
}

type PaymentStep = "amount" | "proximity" | "processing" | "success" | "error" | "receipt"

export default function NFCPaymentInterface({ isNfcEnabled, onClose }: NFCPaymentInterfaceProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>("amount")
  const [amount, setAmount] = useState("")
  const [merchantName, setMerchantName] = useState("Loja Exemplo")
  const [isProximityDetected, setIsProximityDetected] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [paymentTime, setPaymentTime] = useState("")
  const [savedTransaction, setSavedTransaction] = useState<any>(null)

  useEffect(() => {
    if (currentStep === "proximity") {
      // Simulate proximity detection after 2 seconds
      const timer = setTimeout(() => {
        setIsProximityDetected(true)
        setTimeout(() => {
          setCurrentStep("processing")
        }, 1000)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  useEffect(() => {
    if (currentStep === "processing") {
      // Simulate payment processing
      const timer = setTimeout(() => {
        const success = Math.random() > 0.1 // 90% success rate
        const now = new Date()
        const transactionData = {
          amount: Number.parseFloat(amount),
          merchantName,
          date: now.toISOString().split("T")[0],
          time: now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          status: success ? ("success" as const) : ("failed" as const),
          type: "nfc" as const,
          description: success ? "Pagamento contactless" : "Pagamento rejeitado - Erro de processamento",
          location: "Maputo Centro",
        }

        const savedTxn = TransactionStorage.addTransaction(transactionData)
        setSavedTransaction(savedTxn)
        setTransactionId(savedTxn.id)
        setPaymentTime(now.toLocaleString("pt-PT"))

        if (success) {
          setCurrentStep("success")
        } else {
          setCurrentStep("error")
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, amount, merchantName])

  const handleAmountSubmit = () => {
    if (amount && Number.parseFloat(amount) > 0) {
      setCurrentStep("proximity")
    }
  }

  const handleRetry = () => {
    setCurrentStep("amount")
    setAmount("")
    setIsProximityDetected(false)
    setSavedTransaction(null)
  }

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Smartphone className="h-16 w-16 mx-auto mb-4 text-pink-500" />
        <h2 className="text-2xl font-bold text-gray-900">Pagamento NFC</h2>
        <p className="text-gray-600 mt-2">Insira o valor a pagar</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Valor (€)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-2xl text-center h-16"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Comerciante</label>
          <Input value={merchantName} onChange={(e) => setMerchantName(e.target.value)} className="h-12" />
        </div>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          Cancelar
        </Button>
        <Button
          onClick={handleAmountSubmit}
          disabled={!amount || Number.parseFloat(amount) <= 0}
          className="flex-1 bg-pink-500 hover:bg-pink-600"
        >
          Continuar
        </Button>
      </div>
    </div>
  )

  const renderProximityStep = () => (
    <div className="space-y-6 text-center">
      <div className="relative">
        <div
          className={`w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
            isProximityDetected ? "border-green-500 bg-green-50" : "border-pink-500 bg-pink-50 animate-pulse"
          }`}
        >
          <Wifi className={`h-12 w-12 ${isProximityDetected ? "text-green-500" : "text-pink-500"}`} />
        </div>

        {!isProximityDetected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-pink-300 rounded-full animate-ping opacity-75"></div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isProximityDetected ? "Dispositivo Detectado!" : "Aproxime o Dispositivo"}
        </h2>
        <p className="text-gray-600 mt-2">
          {isProximityDetected ? "Processando pagamento..." : "Coloque o telemóvel próximo ao terminal POS"}
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Valor:</span>
          <span className="text-2xl font-bold text-pink-600">€ {amount}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Comerciante:</span>
          <span className="font-medium">{merchantName}</span>
        </div>
      </div>

      <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
        Cancelar Pagamento
      </Button>
    </div>
  )

  const renderProcessingStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-24 h-24 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Processando Pagamento</h2>
        <p className="text-gray-600 mt-2">Aguarde enquanto processamos a transação</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Valor:</span>
          <span className="text-2xl font-bold text-blue-600">€ {amount}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Comerciante:</span>
          <span className="font-medium">{merchantName}</span>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
      </div>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-24 h-24 mx-auto rounded-full bg-green-50 flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-green-600">Pagamento Aprovado!</h2>
        <p className="text-gray-600 mt-2">Transação realizada com sucesso</p>
      </div>

      <div className="bg-green-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Valor Pago:</span>
          <span className="text-2xl font-bold text-green-600">€ {amount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Comerciante:</span>
          <span className="font-medium">{merchantName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">ID Transação:</span>
          <span className="font-mono text-sm">{transactionId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Data/Hora:</span>
          <span className="text-sm">{paymentTime}</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={() => setCurrentStep("receipt")} className="flex-1">
          <Receipt className="h-4 w-4 mr-2" />
          Ver Recibo
        </Button>
        <Button onClick={onClose} className="flex-1 bg-green-500 hover:bg-green-600">
          Concluir
        </Button>
      </div>
    </div>
  )

  const renderErrorStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-24 h-24 mx-auto rounded-full bg-red-50 flex items-center justify-center">
        <XCircle className="h-12 w-12 text-red-500" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-red-600">Pagamento Rejeitado</h2>
        <p className="text-gray-600 mt-2">Não foi possível processar o pagamento</p>
      </div>

      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700 font-medium">Possíveis causas:</p>
        <ul className="text-sm text-red-600 mt-2 space-y-1">
          <li>• Saldo insuficiente</li>
          <li>• Limite diário excedido</li>
          <li>• Problema de conectividade</li>
          <li>• Cartão temporariamente bloqueado</li>
        </ul>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          Cancelar
        </Button>
        <Button onClick={handleRetry} className="flex-1 bg-red-500 hover:bg-red-600">
          Tentar Novamente
        </Button>
      </div>
    </div>
  )

  const renderReceiptStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-500" />
        <h2 className="text-2xl font-bold text-gray-900">Comprovativo de Pagamento</h2>
      </div>

      <div className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg">
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg">MILLENNIUM BIM</h3>
          <p className="text-sm text-gray-600">Pagamento Contactless</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Comerciante:</span>
            <span className="font-medium">{merchantName}</span>
          </div>
          <div className="flex justify-between">
            <span>Valor:</span>
            <span className="font-bold">€ {amount}</span>
          </div>
          <div className="flex justify-between">
            <span>ID Transação:</span>
            <span className="font-mono">{transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span>Data/Hora:</span>
            <span>{paymentTime}</span>
          </div>
          <div className="flex justify-between">
            <span>Método:</span>
            <span>NFC Contactless</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-green-600 font-medium">APROVADO</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-300 mt-4 pt-4 text-center">
          <p className="text-xs text-gray-500">Guarde este comprovativo para seus registos</p>
        </div>
      </div>

      <Button onClick={onClose} className="w-full bg-pink-500 hover:bg-pink-600">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar ao Dashboard
      </Button>
    </div>
  )

  if (!isNfcEnabled) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
          <Wifi className="h-12 w-12 text-gray-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">NFC Desativado</h2>
          <p className="text-gray-600 mt-2">Ative o NFC para realizar pagamentos por aproximação</p>
        </div>
        <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2">
          <Badge className="bg-green-500">
            <Wifi className="h-3 w-3 mr-1" />
            NFC Ativo
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {currentStep === "amount" && renderAmountStep()}
        {currentStep === "proximity" && renderProximityStep()}
        {currentStep === "processing" && renderProcessingStep()}
        {currentStep === "success" && renderSuccessStep()}
        {currentStep === "error" && renderErrorStep()}
        {currentStep === "receipt" && renderReceiptStep()}
      </CardContent>
    </Card>
  )
}
