import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 py-12 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-4 text-center" data-testid="text-page-title">Política de Privacidad</h1>
          <p className="text-muted-foreground text-center mb-8">
            Última actualización: Diciembre 2025
          </p>

          <Card>
            <CardContent className="prose dark:prose-invert max-w-none p-6 space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Información que Recopilamos</h2>
                <p className="text-muted-foreground">
                  Recopilamos información que nos proporcionas directamente, como nombre, email, número de teléfono 
                  y datos de pago cuando creas una cuenta o realizas una reserva. También recopilamos información 
                  automáticamente cuando utilizas nuestra plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Uso de la Información</h2>
                <p className="text-muted-foreground">
                  Utilizamos tu información para procesar reservas, comunicarnos contigo, mejorar nuestros servicios, 
                  personalizar tu experiencia y cumplir con obligaciones legales.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Compartir Información</h2>
                <p className="text-muted-foreground">
                  Compartimos tu información con anfitriones para facilitar las reservas, con proveedores de servicios 
                  que nos ayudan a operar la plataforma, y cuando sea requerido por ley.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Seguridad de Datos</h2>
                <p className="text-muted-foreground">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal 
                  contra acceso no autorizado, pérdida o alteración.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Tus Derechos</h2>
                <p className="text-muted-foreground">
                  Tienes derecho a acceder, corregir o eliminar tu información personal. También puedes oponerte 
                  al procesamiento de tus datos o solicitar su portabilidad.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
                <p className="text-muted-foreground">
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso de la 
                  plataforma y personalizar el contenido.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Contacto</h2>
                <p className="text-muted-foreground">
                  Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a través de 
                  nuestra página de contacto o enviando un email a privacidad@stayhub.com.
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
