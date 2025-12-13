import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 py-12 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-4 text-center" data-testid="text-page-title">Términos y Condiciones</h1>
          <p className="text-muted-foreground text-center mb-8">
            Última actualización: Diciembre 2025
          </p>

          <Card>
            <CardContent className="prose dark:prose-invert max-w-none p-6 space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
                <p className="text-muted-foreground">
                  Al acceder y utilizar esta plataforma, aceptas estos términos y condiciones en su totalidad. 
                  Si no estás de acuerdo con alguna parte, no debes utilizar nuestros servicios.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Uso del Servicio</h2>
                <p className="text-muted-foreground">
                  Debes tener al menos 18 años para usar esta plataforma. Eres responsable de mantener 
                  la confidencialidad de tu cuenta y contraseña.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Reservas y Pagos</h2>
                <p className="text-muted-foreground">
                  Las reservas están sujetas a disponibilidad y confirmación del anfitrión. Los pagos 
                  se procesan de forma segura a través de nuestros proveedores de pago autorizados.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Cancelaciones y Reembolsos</h2>
                <p className="text-muted-foreground">
                  Las políticas de cancelación varían según la propiedad. Revisa la política específica 
                  antes de realizar tu reserva. Los reembolsos se procesan según la política aplicable.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Responsabilidades del Usuario</h2>
                <p className="text-muted-foreground">
                  Los usuarios deben respetar las propiedades, seguir las reglas del anfitrión y 
                  comportarse de manera responsable durante su estancia.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Responsabilidades del Anfitrión</h2>
                <p className="text-muted-foreground">
                  Los anfitriones deben proporcionar información precisa sobre sus propiedades, 
                  mantenerlas en condiciones adecuadas y cumplir con las leyes locales.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Limitación de Responsabilidad</h2>
                <p className="text-muted-foreground">
                  Actuamos como intermediarios entre huéspedes y anfitriones. No somos responsables 
                  de disputas entre usuarios ni del estado de las propiedades.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Modificaciones</h2>
                <p className="text-muted-foreground">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Los cambios serán efectivos al publicarse en la plataforma.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
