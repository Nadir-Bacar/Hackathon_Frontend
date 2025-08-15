import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, CreditCard } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700">
      {/* Header */}
      {/* <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">NoCard</h1>
              <p className="text-pink-100 text-sm">2Pay</p>
            </div>
          </div>
          <Link href="/login">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Entrar
            </Button>
          </Link>
        </div>
      </header> */}

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center space-y-12 max-w-4xl mx-auto">
          <div className="space-y-6">
<h2 className="text-6xl font-black italic font-dmserif text-white leading-tight mt-15">
  Quick Quick
  <br />
  {/* <span className="text-pink-200">Millenium Bim</span> */}
</h2>

            {/* <p className="text-xl text-pink-100 max-w-2xl mx-auto leading-relaxed">
              A nova era dos pagamentos digitais chegou. Pague com segurança usando NFC, QR Code ou aproximação, com a
              confiança do Millennium BIM.
            </p> */}
          </div>
                    <div className="mt-30 space-y-8">
            {/* <h3 className="text-3xl font-bold text-white">Seu Cartão Virtual</h3> */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cartao-debito-frente-fQHtwAiGg6UxNYiEOhPwgxigY0lw28.png"
                  alt="Millennium BIM Card"
                  className="w-80 h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>
            </div>
            {/* <p className="text-pink-100 max-w-2xl mx-auto text-lg">
              Tenha acesso ao seu cartão Millennium BIM de forma digital e segura. Realize pagamentos sem precisar do
              cartão físico.
            </p> */}
          </div>

          {/* CTA Button */}
          <div className="space-y-4 py-20">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-pink-50 font-semibold px-8 py-4 text-lg h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CreditCard className="w-6 h-6 mr-3" />
                Acessar Minha Conta
              </Button>
            </Link>
            <p className="text-pink-200 text-sm py-3">
              Cartão virtual powered by <strong>Millennium BIM</strong>
            </p>
          </div>

          {/* Virtual Card Preview */}


          {/* Simple Features Text */}
          {/* <div className="mt-16 space-y-6">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Pagamento NFC</h4>
                <p className="text-pink-100">Aproxime e pague instantaneamente</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Segurança Avançada</h4>
                <p className="text-pink-100">Proteção máxima em cada transação</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Transações Rápidas</h4>
                <p className="text-pink-100">Processamento instantâneo e seguro</p>
              </div>
            </div>
          </div> */}
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center space-y-4">
          <p className="text-pink-200 text-sm">
            © 2024 NoCard 2Pay. Powered by Millennium BIM. Todos os direitos reservados.
          </p>
        </div>
      </footer> */}
    </div>
  )
}
