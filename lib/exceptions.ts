export class NoCard2PayException extends Error {
  public readonly code: string
  public readonly timestamp: number
  public readonly details?: any

  constructor(message: string, code: string, details?: any) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.timestamp = Date.now()
    this.details = details
  }
}

export class UserBlockedException extends NoCard2PayException {
  constructor(blockTimeRemaining: number) {
    super(
      `Usuário bloqueado temporariamente. Tente novamente em ${Math.ceil(blockTimeRemaining / 60)} minutos.`,
      "USER_BLOCKED",
      { blockTimeRemaining },
    )
  }
}

export class InvalidCredentialsException extends NoCard2PayException {
  constructor(attemptsRemaining: number) {
    super(`Credenciais inválidas. ${attemptsRemaining} tentativas restantes.`, "INVALID_CREDENTIALS", {
      attemptsRemaining,
    })
  }
}

export class TransactionPrecisionException extends NoCard2PayException {
  constructor(value: string, maxDigits = 16) {
    super(
      `Valor excede a precisão máxima permitida (${maxDigits} dígitos). Valor fornecido: ${value}`,
      "TRANSACTION_PRECISION_ERROR",
      { value, maxDigits },
    )
  }
}

export class UserNotFoundException extends NoCard2PayException {
  constructor(identifier: string) {
    super(`Usuário não encontrado com o identificador: ${identifier}`, "USER_NOT_FOUND", { identifier })
  }
}

export class InsufficientFundsException extends NoCard2PayException {
  constructor(requestedAmount: number, availableBalance: number) {
    super(`Saldo insuficiente. Solicitado: ${requestedAmount}, Disponível: ${availableBalance}`, "INSUFFICIENT_FUNDS", {
      requestedAmount,
      availableBalance,
    })
  }
}

export class SuspiciousActivityException extends NoCard2PayException {
  constructor(activityType: string, details: any) {
    super(`Atividade suspeita detectada: ${activityType}`, "SUSPICIOUS_ACTIVITY", { activityType, ...details })
  }
}

export class RateLimitExceededException extends NoCard2PayException {
  constructor(action: string, resetTime: number) {
    super(
      `Limite de taxa excedido para ${action}. Tente novamente em ${Math.ceil((resetTime - Date.now()) / 1000)} segundos.`,
      "RATE_LIMIT_EXCEEDED",
      { action, resetTime },
    )
  }
}
