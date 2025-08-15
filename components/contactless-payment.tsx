"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "./ui/toaster"
import { ArrowLeft, QrCode, Wifi, CheckCircle, XCircle, AlertTriangle, Zap, CreditCard, MapPin, Smartphone, Settings } from "lucide-react"
import { toast } from "sonner"

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

// Type definitions for Web NFC API
declare global {
  interface Navigator {
    nfc?: {
      scan: (options?: { signal?: AbortSignal }) => Promise<void>
      write: (message: any, options?: { target?: string; signal?: AbortSignal }) => Promise<void>
    }
  }

  interface Window {
    NDEFReader?: new () => {
      scan: (options?: { signal?: AbortSignal }) => Promise<void>
      write: (message: any, options?: { target?: string; signal?: AbortSignal }) => Promise<void>
      addEventListener: (type: string, callback: (event: any) => void) => void
      removeEventListener: (type: string, callback: (event: any) => void) => void
    }
  }
}

export function ContactlessPayment({ onBack, userBalance }: ContactlessPaymentProps) {
  const [step, setStep] = useState<"method" | "nfc-config" | "nfc-scan" | "processing" | "proximity" | "success" | "failed">("method")
  const [amount, setAmount] = useState("50.00") // Valor padrão para demonstração
  const [paymentMethod, setPaymentMethod] = useState<"NFC" | "QR_CODE">("NFC")
  const [error, setError] = useState("")
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [proximityDetected, setProximityDetected] = useState(false)
  const [nfcSupported, setNfcSupported] = useState(false)
  const [nfcEnabled, setNfcEnabled] = useState(false)
  const [nfcReaderMode, setNfcReaderMode] = useState<"read" | "write">("read")
  const [nfcData, setNfcData] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    checkNFCSupport()
  }, [])

  const checkNFCSupport = async () => {
    try {
      // Verificar se o navegador suporta Web NFC API
      if ('NDEFReader' in window) {
        setNfcSupported(true)
        console.log('NFC é suportado neste dispositivo')
      } else if (navigator.nfc) {
        setNfcSupported(true)
        console.log('NFC é suportado neste dispositivo (navigator.nfc)')
      } else {
        setNfcSupported(false)
        console.log('NFC não é suportado neste dispositivo')
      }
    } catch (error) {
      console.error('Erro ao verificar suporte NFC:', error)
      setNfcSupported(false)
    }
  }

  const handleMethodSelect = (method: "NFC" | "QR_CODE") => {
    setPaymentMethod(method)
    if (method === "NFC") {
      if (nfcSupported) {
        setStep("nfc-config")
      } else {
        setError("NFC não é suportado neste dispositivo ou navegador")
        // Simular processo sem NFC real
        simulateNFCProcess()
      }
    } else {
      setStep("processing")
      setTimeout(() => processPayment(), 2000)
    }
  }

  const simulateNFCProcess = () => {
    setStep("proximity")
    setTimeout(() => {
      setProximityDetected(true)
      setTimeout(() => processPayment(), 2000)
    }, 3000)
  }

  const startNFCOperation = async () => {
    if (!nfcSupported) {
      setError("NFC não é suportado neste dispositivo")
      return
    }

    try {
      setIsScanning(true)
      setError("")

      if (nfcReaderMode === "read") {
        await startNFCReading()
      } else {
        await startNFCWriting()
      }
    } catch (error) {
      console.error('Erro na operação NFC:', error)
      toast.error("Operação falhou");
      // setError(`Erro NFC: ${error.message || 'Operação falhou'}`)
      setIsScanning(false)
    }
  }

  const startNFCReading = async () => {
    setStep("nfc-scan")
    
    try {
      if (window.NDEFReader) {
        const ndef = new window.NDEFReader()
        
        const handleReading = (event: any) => {
          console.log('NFC tag lida:', event)
          setProximityDetected(true)
          
          // Processar dados do NFC
          for (const record of event.message.records) {
            const textDecoder = new TextDecoder(record.encoding || 'utf-8')
            const data = textDecoder.decode(record.data)
            setNfcData(data)
            console.log('Dados NFC:', data)
          }
          
          setIsScanning(false)
          setTimeout(() => processPayment(), 1000)
        }

        const handleError = (event: any) => {
          console.error('Erro na leitura NFC:', event)
          setError('Erro ao ler tag NFC')
          setIsScanning(false)
        }

        ndef.addEventListener('reading', handleReading)
        ndef.addEventListener('readingerror', handleError)
        
        await ndef.scan()
        console.log('Escaneamento NFC iniciado')
        
      } else {
        // Fallback para simulação
        setTimeout(() => {
          setProximityDetected(true)
          setNfcData("Simulação de dados NFC")
          setIsScanning(false)
          setTimeout(() => processPayment(), 1000)
        }, 3000)
      }
    } catch (error) {
      console.error('Erro ao iniciar leitura NFC:', error)
      // setError(`Erro ao ler NFC: ${error.message}`)
      toast.error("Erro ao ler NFC");

      setIsScanning(false)
    }
  }

  const startNFCWriting = async () => {
    try {
      const paymentData = {
        amount: Number.parseFloat(amount),
        merchant: "IziPay Terminal",
        timestamp: Date.now(),
        currency: "MZN"
      }

      if (window.NDEFReader) {
        const ndef = new window.NDEFReader()
        
        await ndef.write({
          records: [{
            recordType: "text",
            data: JSON.stringify(paymentData)
          }]
        })
        
        console.log('Dados escritos na tag NFC:', paymentData)
        setNfcData(JSON.stringify(paymentData))
        
      } else {
        // Simulação
        console.log('Simulando escrita NFC:', paymentData)
        setNfcData(JSON.stringify(paymentData))
      }
      
      setProximityDetected(true)
      setIsScanning(false)
      setTimeout(() => processPayment(), 1000)
      
    } catch (error) {
      console.error('Erro ao escrever NFC:', error)
      setError(`Erro ao escrever NFC`)
      setIsScanning(false)
    }
  }

  const processPayment = () => {
    setStep("processing")

    setTimeout(() => {
      const success = Math.random() > 0.1 // 90% success rate

      const newTransaction: Transaction = {
        id: `TXN${Date.now()}`,
        amount: Number.parseFloat(amount),
        merchant: "Terminal NFC",
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

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
                  <p className="text-sm opacity-90">
                    {nfcSupported ? "Pronto para usar" : "Modo simulação"}
                  </p>
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

        {/* NFC Configuration */}
        {step === "nfc-config" && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuração NFC
              </CardTitle>
              <CardDescription>
                Como deseja usar o NFC para o pagamento?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-lg font-semibold">Valor: {formatCurrency(Number.parseFloat(amount))}</p>
                <Badge variant={nfcSupported ? "default" : "secondary"} className="mt-2">
                  {nfcSupported ? "NFC Disponível" : "Modo Simulação"}
                </Badge>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Modo de Operação:</Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={nfcReaderMode === "read" ? "default" : "outline"}
                    onClick={() => setNfcReaderMode("read")}
                    className="h-16 flex flex-col items-center justify-center"
                  >
                    <Smartphone className="w-6 h-6 mb-1" />
                    <span className="text-sm">Ler Tag</span>
                  </Button>
                  
                  <Button
                    variant={nfcReaderMode === "write" ? "default" : "outline"}
                    onClick={() => setNfcReaderMode("write")}
                    className="h-16 flex flex-col items-center justify-center"
                  >
                    <CreditCard className="w-6 h-6 mb-1" />
                    <span className="text-sm">Escrever Tag</span>
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{nfcReaderMode === "read" ? "Ler Tag:" : "Escrever Tag:"}</strong>
                  {nfcReaderMode === "read" 
                    ? " Aproxime uma tag NFC para ler os dados de pagamento."
                    : " Aproxime uma tag NFC para escrever os dados de pagamento."
                  }
                </p>
              </div>

              <Button
                onClick={startNFCOperation}
                disabled={isScanning}
                className="w-full h-12 bg-pink-500 hover:bg-pink-600"
              >
                {isScanning ? "Iniciando..." : "Começar a Usar NFC"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* NFC Scanning */}
        {step === "nfc-scan" && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Wifi
                  className={`w-8 h-8 ${proximityDetected ? "text-green-500" : "text-blue-500"} ${isScanning ? "animate-pulse" : ""}`}
                />
              </div>
              <CardTitle>
                {proximityDetected ? "Tag NFC Detectada!" : "Aproxime a Tag NFC"}
              </CardTitle>
              <CardDescription>
                {proximityDetected
                  ? "Processando dados..."
                  : `${nfcReaderMode === "read" ? "Lendo" : "Escrevendo"} dados via NFC`}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-2xl font-bold text-pink-600">{formatCurrency(Number.parseFloat(amount))}</div>
              
              <Badge variant={proximityDetected ? "default" : "secondary"} className="text-sm">
                {proximityDetected ? "Conectado" : isScanning ? "Escaneando..." : "Aguardando"}
              </Badge>

              {nfcData && (
                <div className="bg-gray-50 p-3 rounded-lg mt-4">
                  <p className="text-xs text-gray-600">Dados NFC:</p>
                  <p className="text-sm font-mono break-all">{nfcData}</p>
                </div>
              )}

              {isScanning && (
                <Button
                  onClick={() => {
                    setIsScanning(false)
                    setStep("nfc-config")
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              )}
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
              <p className="text-sm text-gray-600">
                Método: <Badge variant="outline">{paymentMethod}</Badge>
              </p>
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
                {nfcData && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dados NFC:</span>
                    <span className="text-xs font-mono break-all max-w-32">{nfcData.substring(0, 20)}...</span>
                  </div>
                )}
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
                <Button onClick={() => setStep("method")} variant="outline" className="flex-1">
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