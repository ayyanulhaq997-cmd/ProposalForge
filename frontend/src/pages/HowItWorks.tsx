import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, CreditCard, Home } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "1. Busca tu destino",
      description: "Explora nuestra amplia selección de propiedades vacacionales. Filtra por ubicación, precio, comodidades y más para encontrar el alojamiento perfecto."
    },
    {
      icon: Calendar,
      title: "2. Selecciona tus fechas",
      description: "Elige las fechas de tu estancia y revisa la disponibilidad en tiempo real. Consulta los precios y cualquier tarifa adicional."
    },
    {
      icon: CreditCard,
      title: "3. Reserva de forma segura",
      description: "Completa tu reserva con nuestro sistema de pago seguro. Recibirás confirmación instantánea y todos los detalles de tu reserva."
    },
    {
      icon: Home,
      title: "4. Disfruta tu estancia",
      description: "Llega a tu destino y disfruta de tu alojamiento. Nuestro equipo de soporte está disponible 24/7 para cualquier consulta."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-4 text-center" data-testid="text-page-title">Cómo Funciona</h1>
          <p className="text-muted-foreground text-center mb-12">
            Reservar tu alojamiento vacacional es fácil y seguro
          </p>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <Card key={index}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
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
