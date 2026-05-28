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

          <div className="text-sm sm:text-base text-[var(--muted)] leading-6 mb-5 space-y-4">
            <p>
              PokeMarket nace como un proyecto enfocado exclusivamente en la comunidad de Pokémon TCG Chile.
              La idea es construir un espacio moderno, seguro y transparente para coleccionistas,
              vendedores y personas que recién comienzan en este mundo.
            </p>

            <p>
              Actualmente nos encontramos en una fase de beta cerrada donde buscamos personas interesadas
              en apoyar el crecimiento inicial de la plataforma, probar sistemas y contribuir a crear
              una experiencia realmente confiable para toda la comunidad.
            </p>

            <p>
              Todas las personas que participen activamente durante esta etapa serán reconocidas con
              un distintivo especial de <span className="font-semibold text-[var(--foreground)]">Beta Tester</span>,
              el cual permanecerá ligado a su perfil dentro de PokeMarket.
            </p>
          </div>

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
                <h2 className="font-semibold text-[var(--foreground)] mb-2">
                  Transparencia de la plataforma
                </h2>

                <div className="space-y-3">
                  <p>
                    La sección <span className="font-medium text-[var(--foreground)]">Transacciones</span>
                    permite visualizar ventas completadas públicamente dentro de la plataforma.
                    Esto ayuda a generar transparencia entre usuarios y demostrar movimiento real dentro del marketplace.
                  </p>

                  <p>
                    Las transacciones visibles muestran:
                  </p>

                  <ul className="list-disc pl-5 space-y-1">
                    <li>Vendedor</li>
                    <li>Comprador</li>
                    <li>Carta o producto vendido</li>
                    <li>Precio final</li>
                    <li>Fecha de venta</li>
                  </ul>

                  <p>
                    Las interacciones entre usuarios siguen ocurriendo únicamente mediante publicaciones activas
                    y el botón <span className="font-medium text-[var(--foreground)]">Contactar Vendedor</span>.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="font-semibold text-[var(--foreground)] mb-2">
                  Cartas de mi Interés
                </h2>

                <div className="space-y-3">
                  <p>
                    La sección <span className="font-medium text-[var(--foreground)]">Cartas de mi Interés</span>
                    permite que cada usuario pueda mostrar públicamente qué cartas está buscando
                    o cuáles le interesa conseguir en el futuro.
                  </p>

                  <p>
                    Esta función:
                  </p>

                  <ul className="list-disc pl-5 space-y-1">
                    <li>No crea publicaciones</li>
                    <li>No genera chats automáticos</li>
                    <li>No permite contacto directo entre usuarios</li>
                    <li>No representa intención inmediata de compra</li>
                  </ul>

                  <p>
                    Su propósito es únicamente visual e informativo para la comunidad.
                  </p>

                  <p>
                    En el futuro, los usuarios con una suscripción activa podrán habilitar
                    notificaciones instantáneas por correo electrónico cuando alguien publique
                    una carta que coincida con sus intereses dentro del marketplace.
                  </p>
                </div>
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