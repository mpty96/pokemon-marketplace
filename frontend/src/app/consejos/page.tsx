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

          <div className="space-y-6">
            <section>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3">
                Bienvenido a PokeMarket
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-3">
                ¿Quiénes somos?
              </h2>
              <div className="text-sm sm:text-base text-[var(--muted)] leading-6 space-y-3">
                <p>
                  PokeMarket es un proyecto independiente hecho en Chile, por y para la comunidad
                  del Pokémon TCG, pensado para la compra y venta de cartas Pokémon de forma más
                  segura y transparente. Está pensado para coleccionistas, vendedores y también
                  para quienes recién comienzan.
                </p>
                <p>
                  Estamos en <span className="font-semibold text-[var(--foreground)]">beta cerrada</span>:
                  una etapa de prueba con un grupo reducido de personas, donde probamos la plataforma
                  y la mejoramos con sus comentarios. Quienes participen activamente reciben el
                  distintivo <span className="font-semibold text-[var(--foreground)]">Beta Tester</span>,
                  que se mantiene en su perfil.
                </p>
                <p>
                  <span className="font-semibold text-[var(--foreground)]">¿Qué es TCG?</span>{' '}
                  Son las siglas de Trading Card Game, es decir, juego de cartas coleccionables.
                  En este caso, son las cartas Pokémon: se coleccionan, se intercambian, se compran
                  y venden, y también se usan para jugar. Algunas valen mucho más que otras según
                  su rareza, su edición y su estado.
                </p>
                <p>
                  <span className="font-semibold text-[var(--foreground)]">¿Qué hacemos?</span>{' '}
                  Creamos un lugar donde las personas pueden publicar sus cartas o productos y
                  contactarse para acordar compras, ventas o intercambios. Cada usuario tiene
                  perfil, calificaciones e historial de ventas visible, para que sepas con quién
                  estás tratando.
                </p>
              </div>
            </section>

            <div className="space-y-4 text-sm text-[var(--muted)] leading-6">
              <section>
                <h2 className="text-[15px] sm:text-base font-bold text-[var(--foreground)] mb-2">
                  Verifica la carta o producto
                </h2>
                <p className="mb-2">Antes de comprar, pide fotos claras (con flash si hace falta) de:</p>
                <ul className="list-disc pl-5 space-y-1 mb-2">
                  <li>el frente y el reverso de la carta,</li>
                  <li>las cuatro esquinas, por ambos lados,</li>
                  <li>los bordes y la superficie,</li>
                  <li>el holograma (la parte brillante), si tiene,</li>
                  <li>cualquier daño visible.</li>
                </ul>
                <p>
                  Luego confirma que coincide con la publicación: nombre, edición (el set o
                  colección a la que pertenece), número de la carta, idioma y condición (qué tan
                  cuidada está).
                </p>
              </section>

              <section>
                <h2 className="text-[15px] sm:text-base font-bold text-[var(--foreground)] mb-2">
                  Cuida tu información personal
                </h2>
                <p>
                  No compartas contraseñas, códigos de verificación ni claves bancarias.
                  PokeMarket <span className="font-semibold text-[var(--foreground)]">nunca</span> te
                  pedirá estos datos por chat.
                </p>
              </section>

              <section>
                <h2 className="text-[15px] sm:text-base font-bold text-[var(--foreground)] mb-2">
                  Desconfía de las señales sospechosas
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Precios demasiado bajos.</li>
                  <li>Presión para pagar rápido.</li>
                  <li>Usuarios que no quieren enviar más fotos.</li>
                  <li>Quien no acepta juntarse en un lugar público.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[15px] sm:text-base font-bold text-[var(--foreground)] mb-2">
                  Usa la reputación y los reportes
                </h2>
                <p>
                  Revisa las calificaciones del usuario, sus strikes (advertencias) y su nivel. En
                  la sección <span className="font-medium text-[var(--foreground)]">Transacciones</span>{' '}
                  puedes ver las compras y ventas de cada persona. Si algo te parece sospechoso o no
                  resultó seguro, usa el sistema de reportes.
                </p>
              </section>

              <section>
                <h2 className="text-[15px] sm:text-base font-bold text-[var(--foreground)] mb-2">
                  Transparencia de la plataforma
                </h2>
                <div className="space-y-3">
                  <p>
                    La sección <span className="font-medium text-[var(--foreground)]">Transacciones</span>{' '}
                    muestra públicamente las ventas completadas, para que veas que hay movimiento
                    real. Cada venta indica:
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      'Vendedor',
                      'Comprador',
                      'Carta o producto',
                      'Precio final',
                      'Fecha de venta',
                    ].map((item) => (
                      <span
                        key={item}
                        className="px-2 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <p>
                    Las conversaciones entre usuarios ocurren solo desde una publicación activa, con
                    el botón <span className="font-medium text-[var(--foreground)]">Contactar Vendedor</span>.
                  </p>
                </div>
              </section>
            </div>

            <Link
              href="/marketplace"
              className="inline-block bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]"
            >
              Ir al marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}