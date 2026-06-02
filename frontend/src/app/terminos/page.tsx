import Link from 'next/link';

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-[var(--foreground)]">
      <Link href="/register" className="text-sm text-[var(--primary)] hover:underline">
        ← Volver al registro
      </Link>

      <div className="mt-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 sm:p-8 space-y-6">
        <h1 className="text-2xl font-bold">
          Términos y condiciones
        </h1>

        <Section title="Naturaleza de la plataforma">
          <p>
            PokeMarket es una plataforma que permite publicar, buscar y contactar usuarios
            interesados en comprar o vender todo lo conlleva al mundo TCG de Pokémon.
            PokeMarket no es parte directa de los acuerdos económicos entre usuarios, no actúa como
            escrow, no custodia pagos, no tiene comisiones y no garantiza el resultado final de cada transacción.
          </p>
        </Section>

        <Section title="Responsabilidad en compras y ventas">
          <p>
            Cada usuario es responsable de la información que publica, de verificar productos antes de comprar,
            de acordar condiciones claras de pago o entrega y de cumplir los acuerdos realizados con otros usuarios.
            PokeMarket no garantiza de forma absoluta la autenticidad, estado, valor comercial o legitimidad
            de los productos publicados.
          </p>
        </Section>

        <Section title="Conductas prohibidas">
          <p>
            Está prohibido publicar información falsa, vender productos falsificados como auténticos,
            ocultar daños relevantes, manipular precios o reputación, acosar usuarios, realizar spam,
            suplantar identidad, evadir sanciones, intentar estafar o usar la plataforma con fines ilegales
            o contrarios a la comunidad.
          </p>
        </Section>

        <Section title="Sanciones y restricciones">
          <p>
            PokeMarket podrá eliminar publicaciones, restringir funciones, aplicar strikes, suspender cuentas
            o bloquear usuarios cuando existan incumplimientos, reportes graves, sospecha razonable de fraude
            o conductas que pongan en riesgo a otros usuarios.
          </p>
        </Section>

        <Section title="Estado beta y cambios">
          <p>
            La plataforma se encuentra en versión beta y puede recibir cambios técnicos, visuales o funcionales.
            El uso de PokeMarket implica aceptar que ciertas funciones pueden ajustarse, limitarse o modificarse
            para mejorar seguridad, estabilidad y experiencia de usuario.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-[var(--foreground)]">
        {title}
      </h2>
      <div className="text-sm leading-7 text-[var(--muted)] space-y-3">
        {children}
      </div>
    </section>
  );
}