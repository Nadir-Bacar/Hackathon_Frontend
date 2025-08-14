"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  LogOut,
  Users,
  AlertTriangle,
  Search,
  Download,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Activity,
  Shield,
} from "lucide-react"
import { type Transaction, TransactionStorage } from "@/lib/transaction-storage"

interface UserStats {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
}

interface SystemStats {
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  totalVolume: number
  todayVolume: number
  averageTransaction: number
}

export default function AdminDashboardPage() {
  const [adminUsername, setAdminUsername] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "success" | "failed" | "pending">("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [userStats] = useState<UserStats>({
    totalUsers: 1247,
    activeUsers: 1198,
    blockedUsers: 49,
  })
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    totalVolume: 0,
    todayVolume: 0,
    averageTransaction: 0,
  })

  useEffect(() => {
    const isAuth = localStorage.getItem("isAdminAuthenticated")
    const username = localStorage.getItem("adminUsername")

    if (!isAuth) {
      window.location.href = "/admin"
      return
    }

    if (username) {
      setAdminUsername(username)
    }

    // Load transactions and calculate stats
    TransactionStorage.initializeSampleData()
    const allTransactions = TransactionStorage.getTransactions()
    setTransactions(allTransactions)
    setFilteredTransactions(allTransactions)

    // Calculate system stats
    const successful = allTransactions.filter((t) => t.status === "success")
    const failed = allTransactions.filter((t) => t.status === "failed")
    const totalVolume = successful.reduce((sum, t) => sum + t.amount, 0)
    const todayVolume = TransactionStorage.getTotalSpent("today")
    const averageTransaction = successful.length > 0 ? totalVolume / successful.length : 0

    setSystemStats({
      totalTransactions: allTransactions.length,
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      totalVolume,
      todayVolume,
      averageTransaction,
    })
  }, [])

  useEffect(() => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, filterStatus])

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated")
    localStorage.removeItem("adminUsername")
    window.location.href = "/admin"
  }

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants = {
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    }

    const labels = {
      success: "Aprovado",
      failed: "Rejeitado",
      pending: "Pendente",
    }

    return <Badge className={variants[status]}>{labels[status]}</Badge>
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const exportTransactions = () => {
    const csvContent = [
      ["ID", "Comerciante", "Valor", "Data", "Hora", "Status", "Tipo", "Localização"].join(","),
      ...filteredTransactions.map((t) =>
        [t.id, t.merchantName, t.amount.toFixed(2), t.date, t.time, t.status, t.type, t.location || ""].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (selectedTransaction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTransaction(null)}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 rotate-180" />
            </Button>
            <h1 className="text-lg font-semibold">Detalhes da Transação</h1>
          </div>
        </header>

        <div className="p-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{selectedTransaction.merchantName}</CardTitle>
                {getStatusBadge(selectedTransaction.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-800">€ {selectedTransaction.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">Valor da transação</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">ID da Transação</span>
                    <span className="font-mono text-sm">{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Data/Hora</span>
                    <div className="text-right">
                      <p className="font-medium">{formatDate(selectedTransaction.date)}</p>
                      <p className="text-sm text-gray-500">{selectedTransaction.time}</p>
                    </div>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Método</span>
                    <span className="font-medium">
                      {selectedTransaction.type === "nfc" ? "NFC Contactless" : selectedTransaction.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedTransaction.location && (
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">Localização</span>
                      <span className="font-medium">{selectedTransaction.location}</span>
                    </div>
                  )}
                  {selectedTransaction.description && (
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">Descrição</span>
                      <span className="font-medium text-right max-w-48">{selectedTransaction.description}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3">
                    <span className="text-gray-600">Status</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedTransaction.status)}
                      <span className="font-medium">
                        {selectedTransaction.status === "success"
                          ? "Transação Aprovada"
                          : selectedTransaction.status === "failed"
                            ? "Transação Rejeitada"
                            : "Transação Pendente"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Ban className="h-4 w-4 mr-2" />
                  Bloquear Usuário
                </Button>
                <Button onClick={() => setSelectedTransaction(null)} className="flex-1 bg-gray-700 hover:bg-gray-800">
                  Voltar à Lista
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-gray-300">Bem-vindo, {adminUsername}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/20">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{userStats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{systemStats.successfulTransactions}</p>
                  <p className="text-sm text-gray-600">Transações Aprovadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">€ {systemStats.totalVolume.toFixed(0)}</p>
                  <p className="text-sm text-gray-600">Volume Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{systemStats.failedTransactions}</p>
                  <p className="text-sm text-gray-600">Transações Rejeitadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Volume Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">€ {systemStats.todayVolume.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Processado hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transação Média</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">€ {systemStats.averageTransaction.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Valor médio por transação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">
                {systemStats.totalTransactions > 0
                  ? ((systemStats.successfulTransactions / systemStats.totalTransactions) * 100).toFixed(1)
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-600 mt-1">Transações aprovadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Gestão de Transações</CardTitle>
              <Button onClick={exportTransactions} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por comerciante, ID ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className={filterStatus === "all" ? "bg-gray-700 hover:bg-gray-800" : ""}
                >
                  Todas
                </Button>
                <Button
                  variant={filterStatus === "success" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("success")}
                  className={filterStatus === "success" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Aprovadas
                </Button>
                <Button
                  variant={filterStatus === "failed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("failed")}
                  className={filterStatus === "failed" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Rejeitadas
                </Button>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Nenhuma transação encontrada</p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p className="font-medium">{transaction.merchantName}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.id} • {formatDate(transaction.date)} {transaction.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            transaction.status === "success"
                              ? "text-green-600"
                              : transaction.status === "failed"
                                ? "text-red-600"
                                : "text-yellow-600"
                          }`}
                        >
                          € {transaction.amount.toFixed(2)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
