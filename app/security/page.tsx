"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Shield, AlertTriangle, Activity, Eye, Download } from "lucide-react"
import Link from "next/link"
import { SecurityMonitor } from "@/lib/security-monitor"

export default function SecurityPage() {
  const [securityStats, setSecurityStats] = useState<any>(null)
  const [securityEvents, setSecurityEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSecurityData = () => {
      const monitor = SecurityMonitor.getInstance()
      setSecurityStats(monitor.getSecurityStats())
      setSecurityEvents(monitor.getSecurityEvents(undefined, 50))
      setIsLoading(false)
    }

    loadSecurityData()
    const interval = setInterval(loadSecurityData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const formatDateTime = (timestamp: number) => {
    return new Intl.DateTimeFormat("pt-MZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(timestamp))
  }

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "secondary"
      case "MEDIUM":
        return "default"
      case "HIGH":
        return "destructive"
      case "CRITICAL":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const exportSecurityReport = () => {
    const csvContent = [
      ["ID", "Timestamp", "Type", "User ID", "Risk Level", "Details"].join(","),
      ...securityEvents.map((event) =>
        [
          event.id,
          formatDateTime(event.timestamp),
          event.type,
          event.userId || "N/A",
          event.riskLevel,
          JSON.stringify(event.details).replace(/,/g, ";"),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `security-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 text-white">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Centro de Segurança</h1>
            <p className="text-pink-100">Monitoramento e análise de segurança</p>
          </div>
        </div>

        {/* Security Stats */}
        {securityStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Eventos (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityStats.totalEvents}</div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Tentativas Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityStats.loginAttempts}</div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Atividades Suspeitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{securityStats.suspiciousActivities}</div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Limite de Taxa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityStats.rateLimitHits}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Risk Level Distribution */}
        {securityStats && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Distribuição de Níveis de Risco</CardTitle>
              <CardDescription>Eventos categorizados por nível de risco nas últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Baixo</Badge>
                  <span className="text-sm">{securityStats.riskLevels.low}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Médio</Badge>
                  <span className="text-sm">{securityStats.riskLevels.medium}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Alto</Badge>
                  <span className="text-sm">{securityStats.riskLevels.high}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Crítico</Badge>
                  <span className="text-sm">{securityStats.riskLevels.critical}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Security Events */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Eventos de Segurança Recentes</CardTitle>
              <CardDescription>Últimos 50 eventos de segurança registrados</CardDescription>
            </div>
            <Button onClick={exportSecurityReport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {securityEvents.length === 0 ? (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>Nenhum evento de segurança registrado.</AlertDescription>
                </Alert>
              ) : (
                securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getRiskBadgeVariant(event.riskLevel)} className="text-xs">
                          {event.riskLevel}
                        </Badge>
                        <span className="font-medium text-sm">{event.type.replace(/_/g, " ")}</span>
                      </div>
                      <p className="text-xs text-gray-600">{formatDateTime(event.timestamp)}</p>
                      {event.userId && <p className="text-xs text-gray-500">Usuário: {event.userId}</p>}
                      {event.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {typeof event.details === "object"
                            ? Object.entries(event.details)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")
                            : event.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
