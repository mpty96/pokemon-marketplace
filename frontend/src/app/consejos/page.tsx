import Link from 'next/link';

export default function ConsejosPage() {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 sm:py-8 text-[var(--foreground)]">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-center">
          <div className="flex justify-center">
            <img
              src="/chat-safety.png"
              alt="Consejos de seguridad"
              className="w-44 sm:w-56 md:w-64 object-contain"
            />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3">
              Bienvenido a PokeMarket Chile
            </h1>

            <p className="text-sm sm:text-base text-[var(--muted)] leading-6 mb-5">
              PokeMarket nace como un proyecto enfocado exclusivamente en la comunidad de Pokémon TCG Chile. 
              La idea principal es construir un espacio moderno, seguro, transparente y profesional para coleccionistas, vendedores y personas que recién comienzan en el mundo de Pokémon TCG.

              Actualmente nos encontramos en una fase de beta cerrada, donde buscamos personas interesadas en formar parte del crecimiento inicial de la plataforma. 
              El objetivo de esta etapa es probar sistemas, detectar mejoras, optimizar la seguridad y construir una experiencia realmente confiable para toda la comunidad.

              PokeMarket no busca convertirse en una simple página de compra y venta. La idea es fomentar una comunidad responsable, honesta y enfocada en el respeto por el coleccionismo. 
              Muchas de las funciones actuales fueron diseñadas pensando tanto en coleccionistas avanzados como en personas que recién comienzan y necesitan una experiencia más segura y guiada.
            </p>

            <div className="space-y-4 text-sm text-[var(--muted)] leading-6">
              <section>
                <h2 className="font-semibold text-[var(--foreground)] mb-1">
                  Verifica la carta o producto
                </h2>
                <p>
                  Solicita fotos claras o directamente con flash del frente de la carta, 
									su reverso, las cuatro esquinas de ambas caras, bordes, superficie, holograma y/o cualquier daño visible. 
                  Compara que la carta que buscas corresponde con la de la publicación,
                  identificando nombre, edición, número en el set, idioma y condición.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-[var(--foreground)] mb-1">
                  Cuida tu información personal
                </h2>
                <p>
                  No compartas contraseñas, códigos de verificación, claves bancarias ni
                  información sensible. PokeMarket JAMÁS te pedirá este tipo de datos por chat.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-[var(--foreground)] mb-1">
                  Desconfía de señales sospechosas
                </h2>
                <p>
                  Ten cuidado con precios demasiado bajos, presión para pagar rápido,
                  usuarios que evitan enviar fotos adicionales o que no quieren juntarse en un lugar público.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-[var(--foreground)] mb-1">
                  Usa reputación y reportes
                </h2>
                <p>
                  Revisa las calificaciones, strikes recibidos y nivel del usuario.
									Utiliza la sección Transacciones para buscar las compras y ventas realizadas por un usuario.
                  Si detectas actividad sospechosa o las cosas no resultaron seguras para ti,
									inspira poca confianza, o dañaron tu integridad personal, utiliza el sistema de reportes.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-[var(--foreground)] mb-1">
                  Transparencia de la plataforma
                </h2>
                <p>
                  La sección Transacciones permite visualizar ventas completadas públicamente dentro de la plataforma. 
                  Esto ayuda a generar transparencia entre usuarios y demostrar movimiento real dentro del marketplace.
                  Las transacciones visibles muestran:
                  -Vendedor
                  -Comprador
                  -Carta o producto vendido
                  -Precio final
                  -Fecha de venta
                  Sin embargo, las interacciones entre usuarios siguen ocurriendo únicamente mediante publicaciones activas y el botón de Contactar Vendedor.
                </p>
              </section>

              <section>
                <h2 className="font-semibold text-[var(--foreground)] mb-1">
                  Cartas de mi Interés
                </h2>
                <p>
                  La sección Cartas de mi Interés permite que cada usuario pueda mostrar públicamente qué cartas está buscando o cuáles le interesa conseguir en el futuro.
                  Esta función:
                  -NO crea una publicación.
                  -NO genera chats automáticos.
                  -NO permite contacto directo entre usuarios.
                  -NO representa intención inmediata de compra.
                  Su propósito es únicamente visual e informativo para la comunidad.
                  En el futuro, los usuarios que cuenten con una suscripción activa podrán habilitar notificaciones instantáneas por correo electrónico 
                  para recibir avisos automáticos cuando alguien publique una carta que coincida con sus intereses dentro del marketplace.
                </p>
              </section>
            </div>

            <Link
              href="/marketplace"
              className="inline-block mt-6 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]"
            >
              Ir al marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}