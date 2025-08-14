import { RateLimitExceededException } from "./exceptions"

interface SecurityEvent {
  id: string
  timestamp: number
  type: "LOGIN_ATTEMPT" | "PAYMENT_ATTEMPT" | "SUSPICIOUS_ACTIVITY" | "RATE_LIMIT_HIT"
  userId?: string
  deviceInfo: string
  ipAddress?: string
  details: any
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}

interface RateLimit {
  action: string
  count: number
  resetTime: number
}

export class SecurityMonitor {
  private static instance: SecurityMonitor
  private events: SecurityEvent[] = []
  private rateLimits: Map<string, RateLimit> = new Map()

  private constructor() {
    this.loadFromStorage()
  }

  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
    }
    return SecurityMonitor.instance
  }

  private loadFromStorage() {
    try {
      const storedEvents = localStorage.getItem("securityEvents")
      if (storedEvents) {
        this.events = JSON.parse(storedEvents)
      }

      const storedRateLimits = localStorage.getItem("rateLimits")
      if (storedRateLimits) {
        const limits = JSON.parse(storedRateLimits)
        this.rateLimits = new Map(limits)
      }
    } catch (error) {
      console.error("Error loading security data:", error)
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem("securityEvents", JSON.stringify(this.events.slice(-1000))) // Keep last 1000 events
      localStorage.setItem("rateLimits", JSON.stringify(Array.from(this.rateLimits.entries())))
    } catch (error) {
      console.error("Error saving security data:", error)
    }
  }

  public logSecurityEvent(
    type: SecurityEvent["type"],
    details: any,
    userId?: string,
    riskLevel: SecurityEvent["riskLevel"] = "LOW",
  ) {
    const event: SecurityEvent = {
      id: `SEC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      userId,
      deviceInfo: navigator.userAgent,
      ipAddress: "simulated_ip", // In real app, get from server
      details,
      riskLevel,
    }

    this.events.push(event)
    this.saveToStorage()

    // Check for suspicious patterns
    this.analyzeSuspiciousActivity(event)
  }

  private analyzeSuspiciousActivity(event: SecurityEvent) {
    const recentEvents = this.events.filter(
      (e) =>
        Date.now() - e.timestamp < 30 * 60 * 1000 && // Last 30 minutes
        e.userId === event.userId,
    )

    // Multiple failed login attempts
    if (event.type === "LOGIN_ATTEMPT" && !event.details.success) {
      const failedLogins = recentEvents.filter((e) => e.type === "LOGIN_ATTEMPT" && !e.details.success).length

      if (failedLogins >= 3) {
        this.logSecurityEvent(
          "SUSPICIOUS_ACTIVITY",
          {
            pattern: "MULTIPLE_FAILED_LOGINS",
            count: failedLogins,
          },
          event.userId,
          "HIGH",
        )
      }
    }

    // Rapid payment attempts
    if (event.type === "PAYMENT_ATTEMPT") {
      const paymentAttempts = recentEvents.filter((e) => e.type === "PAYMENT_ATTEMPT").length

      if (paymentAttempts > 10) {
        this.logSecurityEvent(
          "SUSPICIOUS_ACTIVITY",
          {
            pattern: "RAPID_PAYMENT_ATTEMPTS",
            count: paymentAttempts,
          },
          event.userId,
          "MEDIUM",
        )
      }
    }

    // Different devices in short time
    const uniqueDevices = new Set(recentEvents.map((e) => e.deviceInfo)).size
    if (uniqueDevices > 3) {
      this.logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        {
          pattern: "MULTIPLE_DEVICES",
          deviceCount: uniqueDevices,
        },
        event.userId,
        "HIGH",
      )
    }
  }

  public checkRateLimit(action: string, userId: string, limit: number, windowMs: number): boolean {
    const key = `${action}_${userId}`
    const now = Date.now()
    const rateLimit = this.rateLimits.get(key)

    if (!rateLimit || now > rateLimit.resetTime) {
      // Reset or create new rate limit
      this.rateLimits.set(key, {
        action,
        count: 1,
        resetTime: now + windowMs,
      })
      this.saveToStorage()
      return true
    }

    if (rateLimit.count >= limit) {
      this.logSecurityEvent(
        "RATE_LIMIT_HIT",
        {
          action,
          limit,
          currentCount: rateLimit.count,
        },
        userId,
        "MEDIUM",
      )

      throw new RateLimitExceededException(action, rateLimit.resetTime)
    }

    rateLimit.count++
    this.rateLimits.set(key, rateLimit)
    this.saveToStorage()
    return true
  }

  public getSecurityEvents(userId?: string, limit = 100): SecurityEvent[] {
    let events = this.events

    if (userId) {
      events = events.filter((e) => e.userId === userId)
    }

    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
  }

  public getSecurityStats() {
    const last24h = Date.now() - 24 * 60 * 60 * 1000
    const recentEvents = this.events.filter((e) => e.timestamp > last24h)

    return {
      totalEvents: recentEvents.length,
      loginAttempts: recentEvents.filter((e) => e.type === "LOGIN_ATTEMPT").length,
      paymentAttempts: recentEvents.filter((e) => e.type === "PAYMENT_ATTEMPT").length,
      suspiciousActivities: recentEvents.filter((e) => e.type === "SUSPICIOUS_ACTIVITY").length,
      rateLimitHits: recentEvents.filter((e) => e.type === "RATE_LIMIT_HIT").length,
      riskLevels: {
        low: recentEvents.filter((e) => e.riskLevel === "LOW").length,
        medium: recentEvents.filter((e) => e.riskLevel === "MEDIUM").length,
        high: recentEvents.filter((e) => e.riskLevel === "HIGH").length,
        critical: recentEvents.filter((e) => e.riskLevel === "CRITICAL").length,
      },
    }
  }
}
