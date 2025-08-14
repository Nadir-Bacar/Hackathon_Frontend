"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, History, Smartphone, Shield, Zap, AlertTriangle } from "lucide-react"
import { ContactlessPayment } from "@/components/contactless-payment"
import { SecurityMonitor } from "@/lib/security-monitor"
import Link from "next/link"

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("")
  const [authMethod, setAuthMethod] = useState("")
  const [isNfcEnabled, setIsNfcEnabled] = useState(false)
  const [userName, setUserName] = useState("JOÃO SILVA")
  const [showPaymentInterface, setShowPaymentInterface] = useState(false)
  const [userBalance] = useState(1247.5)
  const [dailyLimit] = useState(500.0)
  const [todaySpent, setTodaySpent] = useState(0)
  const [securityAlerts, setSecurityAlerts] = useState(0)

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated")
    const email = localStorage.getItem("userEmail")
    const method = localStorage.getItem("authMethod")

    if (!isAuth) {
      window.location.href = "/"
      return
    }

    if (email) {
      setUserEmail(email)
      // Extract name from email for demo purposes
      const name = email.split("@")[0].toUpperCase().replace(".", " ")
      setUserName(name)
    }

    if (method) {
      setAuthMethod(method)
    }

    // Load today's spending from transactions
    const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
    const today = new Date().toISOString().split("T")[0]
    const todayTransactions = transactions.filter(
      (t: any) => t.timestamp && new Date(t.timestamp).toISOString().split("T")[0] === today && t.status === "SUCCESS",
    )
    const spent = todayTransactions.reduce((total: number, t: any) => total + t.amount, 0)
    setTodaySpent(spent)

    // Check security alerts
    const securityMonitor = SecurityMonitor.getInstance()
    const recentEvents = securityMonitor.getSecurityEvents(email, 10)
    const alerts = recentEvents.filter((e) => e.riskLevel === "HIGH" || e.riskLevel === "CRITICAL").length
    setSecurityAlerts(alerts)
  }, [])

  const handleLogout = () => {
    const securityMonitor = SecurityMonitor.getInstance()
    securityMonitor.logSecurityEvent("LOGIN_ATTEMPT", { action: "LOGOUT", success: true }, userEmail)

    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("authMethod")
    window.location.href = "/"
  }

  const toggleNfc = () => {
    const newState = !isNfcEnabled
    setIsNfcEnabled(newState)

    const securityMonitor = SecurityMonitor.getInstance()
    securityMonitor.logSecurityEvent(
      "SUSPICIOUS_ACTIVITY",
      { action: "NFC_TOGGLE", enabled: newState },
      userEmail,
      "LOW",
    )
  }

  const handlePayNow = () => {
    if (isNfcEnabled) {
      setShowPaymentInterface(true)
    }
  }

  const getAuthMethodBadge = () => {
    const variants = {
      password: { label: "Senha", color: "bg-blue-100 text-blue-800" },
      pin: { label: "PIN", color: "bg-green-100 text-green-800" },
      biometric: { label: "Biometria", color: "bg-purple-100 text-purple-800" },
    }

    const method = variants[authMethod as keyof typeof variants] || variants.password
    return <Badge className={method.color}>{method.label}</Badge>
  }

  if (showPaymentInterface) {
    return <ContactlessPayment onBack={() => setShowPaymentInterface(false)} userBalance={userBalance} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">IziPay</h1>
              <p className="text-sm text-pink-100">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getAuthMethodBadge()}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/20">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Security Alert */}
        {securityAlerts > 0 && (
          <Card className="border-l-4 border-l-red-500 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">Alertas de Segurança</p>
                  <p className="text-sm text-red-600">
                    {securityAlerts} evento{securityAlerts > 1 ? "s" : ""} de alta prioridade detectado
                    {securityAlerts > 1 ? "s" : ""}
                  </p>
                </div>
                <Link href="/security">
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    Ver Detalhes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Virtual Card Display */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Seu Cartão Virtual</h2>
          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-pink-100 text-sm">IziPay</p>
                  <p className="text-xs text-pink-200">Pagamento Contactless Seguro</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Virtual
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-pink-100 text-xs">NÚMERO DO CARTÃO</p>
                  <p className="font-mono text-lg tracking-wider">**** **** **** 2847</p>
                </div>

                <div className="flex justify-between">
                  <div>
                    <p className="text-pink-100 text-xs">VÁLIDO ATÉ</p>
                    <p className="font-mono">12/28</p>
                  </div>
                  <div className="text-right">
                    <p className="text-pink-100 text-xs">PORTADOR</p>
                    <p className="font-medium">{userName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NFC Payment Section */}
        <Card className="border-l-4 border-l-pink-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-pink-500" />
              <span>Pagamento Contactless</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">NFC Payment</p>
                <p className="text-sm text-gray-600">
                  {isNfcEnabled ? "Pronto para pagamentos contactless" : "Ative para usar pagamentos contactless"}
                </p>
                {isNfcEnabled && (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <Shield className="h-3 w-3" />
                    <span>Protegido por autenticação segura</span>
                  </div>
                )}
              </div>
              <Button
                onClick={toggleNfc}
                variant={isNfcEnabled ? "default" : "outline"}
                className={
                  isNfcEnabled ? "bg-pink-500 hover:bg-pink-600" : "border-pink-500 text-pink-500 hover:bg-pink-50"
                }
              >
                {isNfcEnabled ? "Desativar" : "Ativar NFC"}
              </Button>
            </div>

            {isNfcEnabled && (
              <Button
                onClick={handlePayNow}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold h-12"
              >
                <Zap className="h-5 w-5 mr-2" />
                Pagar Agora
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/transactions">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
              <CardContent className="p-4 text-center">
                <History className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="font-medium">Histórico</p>
                <p className="text-xs text-gray-600">Ver transações</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/security">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="font-medium">Segurança</p>
                <p className="text-xs text-gray-600">Centro de segurança</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Balance Info */}
        <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200">
          <CardHeader>
            <CardTitle className="text-lg text-pink-800">Saldo e Limites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold text-pink-600">MZN {userBalance.toFixed(2)}</p>
              <p className="text-sm text-pink-700">Saldo disponível</p>
              <div className="flex justify-center space-x-4 text-xs text-pink-600 mt-4">
                <div className="text-center">
                  <p className="font-medium">Limite Diário</p>
                  <p>MZN {dailyLimit.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">Usado Hoje</p>
                  <p>MZN {todaySpent.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">Disponível</p>
                  <p>MZN {(dailyLimit - todaySpent).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
