"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, MapPin, Calendar, Download, Filter } from "lucide-react"
import Link from "next/link"

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "SUCCESS" | "FAILED">("all")
  const [filterMethod, setFilterMethod] = useState<"all" | "NFC" | "QR_CODE">("all")
  const [filterDate, setFilterDate] = useState<"all" | "today" | "week" | "month">("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    // Load transactions from localStorage
    const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]")
    setTransactions(storedTransactions)
    setFilteredTransactions(storedTransactions)
  }, [])

  useEffect(() => {
    let filtered = transactions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus)
    }

    // Filter by method
    if (filterMethod !== "all") {
      filtered = filtered.filter((t) => t.method === filterMethod)
    }

    // Filter by date
    if (filterDate !== "all") {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000

      filtered = filtered.filter((t) => {
        switch (filterDate) {
          case "today":
            return now - t.timestamp < dayMs
          case "week":
            return now - t.timestamp < 7 * dayMs
          case "month":
            return now - t.timestamp < 30 * dayMs
          default:
            return true
        }
      })
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, filterStatus, filterMethod, filterDate])

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants = {
      SUCCESS: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
    }

    const labels = {
      SUCCESS: "Sucesso",
      FAILED: "Falhou",
    }

    return <Badge className={variants[status]}>{labels[status]}</Badge>
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
    }).format(value)
  }

  const getTotalSpent = () => {
    return filteredTransactions.filter((t) => t.status === "SUCCESS").reduce((total, t) => total + t.amount, 0)
  }

  const exportTransactions = () => {
    const csvContent = [
      ["ID", "Data/Hora", "Comerciante", "Valor", "Status", "Método", "Localização"].join(","),
      ...filteredTransactions.map((t) =>
        [t.id, formatDateTime(t.timestamp), t.merchant, t.amount.toFixed(2), t.status, t.method, t.location].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transacoes-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (selectedTransaction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTransaction(null)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Detalhes da Transação</h1>
          </div>
        </header>

        <div className="p-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{selectedTransaction.merchant}</CardTitle>
                {getStatusBadge(selectedTransaction.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount */}
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-pink-600">{formatCurrency(selectedTransaction.amount)}</p>
                <p className="text-sm text-gray-600 mt-1">Valor da transação</p>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">ID da Transação</span>
                  <span className="font-mono text-sm">{selectedTransaction.id}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">Data/Hora</span>
                  <span className="font-medium">{formatDateTime(selectedTransaction.timestamp)}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">Método</span>
                  <Badge variant="outline">{selectedTransaction.method}</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">Localização</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{selectedTransaction.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">Comprovante</span>
                  <span className="font-mono text-sm">{selectedTransaction.receipt}</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Status</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="font-medium">
                      {selectedTransaction.status === "SUCCESS" ? "Transação Aprovada" : "Transação Rejeitada"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4">
                <Button onClick={() => setSelectedTransaction(null)} className="w-full bg-pink-500 hover:bg-pink-600">
                  Voltar ao Histórico
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
      <header className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Histórico de Transações</h1>
          </div>
          <Button onClick={exportTransactions} variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalSpent())}</p>
              <p className="text-sm text-gray-600">Total Gasto</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{filteredTransactions.length}</p>
              <p className="text-sm text-gray-600">Transações</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {filteredTransactions.filter((t) => t.status === "SUCCESS").length}
              </p>
              <p className="text-sm text-gray-600">Aprovadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por comerciante, localização ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="SUCCESS">Sucesso</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterMethod} onValueChange={(value: any) => setFilterMethod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Métodos</SelectItem>
                  <SelectItem value="NFC">NFC</SelectItem>
                  <SelectItem value="QR_CODE">QR Code</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDate} onValueChange={(value: any) => setFilterDate(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo Período</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterStatus("all")
                  setFilterMethod("all")
                  setFilterDate("all")
                }}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Nenhuma transação encontrada</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm || filterStatus !== "all" || filterMethod !== "all" || filterDate !== "all"
                    ? "Tente ajustar os filtros de pesquisa"
                    : "Suas transações aparecerão aqui"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p className="font-medium">{transaction.merchant}</p>
                        <p className="text-sm text-gray-600">{formatDateTime(transaction.timestamp)}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {transaction.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${transaction.status === "SUCCESS" ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {transaction.method}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
