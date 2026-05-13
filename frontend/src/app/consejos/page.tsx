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
              Consejos para evitar estafas
            </h1>

            <p className="text-sm sm:text-base text-[var(--muted)] leading-6 mb-5">
              Antes de comprar o vender, revisa cuidadosamente la información de la publicación.
              Echa un vistazo al perfil del usuario, junto con sus calificaciones recibidas.
              Analiza el grafico de ventas ubicado en la parte inferior de la publicación para 
              que te des una idea de un precio justo o excesivo.
							Siempre elige lugares publicos y que te brinden confianza. Como extra y si puedes, asiste acompañado.
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
                  usuarios que evitan enviar fotos adicionales o que no quieren un lugar público.
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