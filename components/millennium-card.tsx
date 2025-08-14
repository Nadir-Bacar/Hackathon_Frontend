"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MillenniumCardProps {
  isNfcEnabled: boolean
  cardNumber?: string
  expiryDate?: string
  cardholderName?: string
  balance?: string
}

export default function MillenniumCard({
  isNfcEnabled,
  cardNumber = "4787 **** **** 1234",
  expiryDate = "12/28",
  cardholderName = "JOÃO SILVA",
  balance = "€ 1.247,50",
}: MillenniumCardProps) {
  const [showFullNumber, setShowFullNumber] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const fullCardNumber = "4787 1234 5678 1234"
  const displayNumber = showFullNumber ? fullCardNumber : cardNumber

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div
        className={`relative w-full h-56 transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
        style={{ perspective: "1000px" }}
      >
        {/* Front of Card */}
        <Card className={`absolute inset-0 w-full h-full backface-hidden ${isFlipped ? "rotate-y-180" : ""}`}>
          <div className="relative w-full h-full bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 rounded-xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-8 left-8 w-32 h-32 border-2 border-white/30 rounded-full"></div>
              <div className="absolute bottom-8 right-8 w-24 h-24 border-2 border-white/30 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl font-bold text-white/10">
                M
              </div>
            </div>

            {/* NFC Badge */}
            <div className="absolute top-4 right-4">
              <Badge
                variant={isNfcEnabled ? "default" : "secondary"}
                className={`${isNfcEnabled ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"} text-white border-0`}
              >
                <Wifi className="h-3 w-3 mr-1" />
                {isNfcEnabled ? "NFC" : "OFF"}
              </Badge>
            </div>

            {/* Card Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
              {/* Top Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Millennium</h2>
                  <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">bim</span>
                </div>
              </div>

              {/* Middle Section - Card Number */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-mono tracking-wider">{displayNumber}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullNumber(!showFullNumber)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    {showFullNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-80">VÁLIDO ATÉ / VALID THRU</p>
                    <p className="text-sm font-mono">{expiryDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-80">SALDO</p>
                    <p className="text-lg font-bold">{balance}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-80">PORTADOR</p>
                  <p className="text-sm font-medium">{cardholderName}</p>
                </div>
                <div className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-bold">
                  VISA
                  <span className="block text-xs">Electron</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Back of Card */}
        <Card
          className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 ${isFlipped ? "" : "rotate-y-180"}`}
        >
          <div className="relative w-full h-full bg-gradient-to-br from-pink-600 via-pink-700 to-pink-800 rounded-xl overflow-hidden">
            <div className="p-6 h-full flex flex-col justify-between text-white">
              {/* Magnetic Stripe */}
              <div className="w-full h-12 bg-black mt-4 rounded"></div>

              {/* CVV Section */}
              <div className="bg-white text-black p-4 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm">CVV: ***</span>
                  <span className="text-xs">Assinatura do Portador</span>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="text-xs space-y-2">
                <p>Para assistência: +258 21 354 500</p>
                <p>www.millenniumbim.co.mz</p>
                <div className="flex justify-between">
                  <span>Millennium bim</span>
                  <span>VISA Electron</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Flip Button */}
      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-pink-600 border-pink-600 hover:bg-pink-50"
        >
          {isFlipped ? "Ver Frente" : "Ver Verso"}
        </Button>
      </div>
    </div>
  )
}
