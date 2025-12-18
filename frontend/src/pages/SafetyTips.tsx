import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, MessageSquare, AlertTriangle, CheckCircle, Phone } from "lucide-react";

export default function SafetyTips() {
  const tips = [
    {
      icon: Lock,
      title: "Pagos seguros",
      description: "Siempre realiza pagos a través de nuestra plataforma. Nunca envíes dinero fuera del sistema ni por transferencia directa."
    },
    {
      icon: MessageSquare,
      title: "Comunicación en la plataforma",
      description: "Mantén todas las conversaciones dentro de nuestro sistema de mensajería para tu protección y registro."
    },
    {
      icon: Shield,
      title: "Verifica al anfitrión",
      description: "Revisa las reseñas y calificaciones del anfitrión antes de reservar. Los anfitriones verificados tienen una marca especial."
    },
    {
      icon: AlertTriangle,
      title: "Reporta actividad sospechosa",
      description: "Si algo parece demasiado bueno para ser verdad o te piden actuar fuera de la plataforma, repórtalo inmediatamente."
    },
    {
      icon: CheckCircle,
      title: "Lee las políticas de cancelación",
      description: "Antes de reservar, revisa las políticas de cancelación y reembolso para evitar sorpresas."
    },
    {
      icon: Phone,
      title: "Soporte 24/7",
      description: "Nuestro equipo de soporte está disponible las 24 horas para ayudarte con cualquier problema o emergencia."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-4 text-center" data-testid="text-page-title">Consejos de Seguridad</h1>
          <p className="text-muted-foreground text-center mb-12">
            Tu seguridad es nuestra prioridad. Sigue estos consejos para una experiencia segura.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <Card key={index}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <tip.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
