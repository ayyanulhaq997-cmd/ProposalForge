import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HelpCircle, MessageSquare } from "lucide-react";

export default function HelpCenter() {
  const faqs = [
    {
      question: "¿Cómo hago una reserva?",
      answer: "Busca una propiedad, selecciona tus fechas y número de huéspedes, y sigue el proceso de pago seguro. Recibirás confirmación por email inmediatamente."
    },
    {
      question: "¿Puedo cancelar mi reserva?",
      answer: "Sí, puedes cancelar tu reserva. Las condiciones de reembolso dependen de la política de cancelación del anfitrión, que puedes ver antes de reservar."
    },
    {
      question: "¿Cómo contacto al anfitrión?",
      answer: "Una vez que hagas una reserva, podrás comunicarte con el anfitrión a través de nuestro sistema de mensajería integrado."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos tarjetas de crédito y débito principales (Visa, Mastercard, American Express) a través de nuestro sistema de pago seguro."
    },
    {
      question: "¿Cómo me convierto en anfitrión?",
      answer: "Regístrate en la plataforma, completa tu perfil y verificación de identidad, y luego podrás publicar tu propiedad desde el panel de anfitrión."
    },
    {
      question: "¿Qué hago si tengo un problema durante mi estancia?",
      answer: "Contacta primero al anfitrión a través de la plataforma. Si no se resuelve, nuestro equipo de soporte está disponible 24/7 para ayudarte."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 py-12 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4" data-testid="text-page-title">Centro de Ayuda</h1>
            <p className="text-muted-foreground">
              Encuentra respuestas a las preguntas más frecuentes
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Preguntas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center text-center p-8">
              <MessageSquare className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">¿No encontraste lo que buscabas?</h3>
              <p className="text-muted-foreground mb-4">
                Nuestro equipo de soporte está listo para ayudarte
              </p>
              <Link href="/contact">
                <Button data-testid="button-contact-support">Contactar Soporte</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
