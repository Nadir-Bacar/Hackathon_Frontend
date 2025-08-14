export interface Transaction {
  id: string
  amount: number
  merchantName: string
  date: string
  time: string
  status: "success" | "failed" | "pending"
  type: "nfc" | "online" | "atm"
  description?: string
  location?: string
}

export class TransactionStorage {
  private static readonly STORAGE_KEY = "millennium_transactions"

  static getTransactions(): Transaction[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static addTransaction(transaction: Omit<Transaction, "id">): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    }

    const transactions = this.getTransactions()
    transactions.unshift(newTransaction) // Add to beginning for newest first

    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions))
    }

    return newTransaction
  }

  static getTransactionById(id: string): Transaction | null {
    const transactions = this.getTransactions()
    return transactions.find((t) => t.id === id) || null
  }

  static getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
    const transactions = this.getTransactions()
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  static getTotalSpent(period: "today" | "week" | "month"): number {
    const transactions = this.getTransactions()
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    return transactions
      .filter((t) => t.status === "success" && new Date(t.date) >= startDate)
      .reduce((total, t) => total + t.amount, 0)
  }

  // Initialize with some sample data if empty
  static initializeSampleData(): void {
    const existing = this.getTransactions()
    if (existing.length === 0) {
      const sampleTransactions: Omit<Transaction, "id">[] = [
        {
          amount: 25.5,
          merchantName: "Café Central",
          date: new Date().toISOString().split("T")[0],
          time: "14:30",
          status: "success",
          type: "nfc",
          description: "Pagamento contactless",
          location: "Maputo Centro",
        },
        {
          amount: 120.0,
          merchantName: "Supermercado Shoprite",
          date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday
          time: "18:45",
          status: "success",
          type: "nfc",
          description: "Compras alimentares",
          location: "Maputo Shopping",
        },
        {
          amount: 15.75,
          merchantName: "Farmácia Moderna",
          date: new Date(Date.now() - 172800000).toISOString().split("T")[0], // 2 days ago
          time: "10:15",
          status: "success",
          type: "nfc",
          description: "Medicamentos",
          location: "Av. Julius Nyerere",
        },
        {
          amount: 50.0,
          merchantName: "Posto Galp",
          date: new Date(Date.now() - 259200000).toISOString().split("T")[0], // 3 days ago
          time: "08:20",
          status: "failed",
          type: "nfc",
          description: "Tentativa de pagamento - Saldo insuficiente",
          location: "Av. Marginal",
        },
      ]

      sampleTransactions.forEach((transaction) => {
        this.addTransaction(transaction)
      })
    }
  }
}
