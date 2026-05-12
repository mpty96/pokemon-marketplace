'use client';

import { useState } from 'react';
import FooterModal from './FooterModal';

type ModalType = 'security' | 'terms' | 'reputation' | 'info' | null;

export default function Footer() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <>
      <footer className="mt-16 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            PokeMarket Chile
          </p>

          <p className="text-sm text-[var(--muted)] mt-2 leading-6">
            Marketplace para coleccionistas en Chile. Compra, venta y publicación de cartas,
            productos Pokémon y lotes entre usuarios.
          </p>

          <nav className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <FooterLink onClick={() => setActiveModal('security')}>
              Seguridad
            </FooterLink>

            <FooterLink onClick={() => setActiveModal('terms')}>
              Términos y condiciones
            </FooterLink>

            <FooterLink onClick={() => setActiveModal('reputation')}>
              Reputación y reportes
            </FooterLink>

            <FooterLink onClick={() => setActiveModal('info')}>
              Información general
            </FooterLink>
          </nav>

          <p className="text-xs text-[var(--muted-2)] mt-6">
            © 2026 PokeMarket Chile. Plataforma en versión beta.
          </p>
        </div>
      </footer>

      <FooterModal
        open={activeModal === 'security'}
        title="Seguridad y prevención de estafas"
        onClose={() => setActiveModal(null)}
      >
        <Section title="Antes de comprar">
          <p>
            Antes de concretar una compra, revisa cuidadosamente la publicación,
            la descripción, las fotografías disponibles, la reputación del vendedor
            y las calificaciones recibidas. No realices pagos si tienes dudas sobre
            la autenticidad, el estado del producto o la seriedad del usuario.
          </p>

          <p>
            En el caso de cartas individuales, solicita fotografías claras del frente
            y reverso, incluyendo bordes, esquinas, superficie, holograma y cualquier
            zona que pueda presentar rayones, dobleces, desgaste o marcas visibles.
          </p>
        </Section>

        <Section title="Protección de información personal">
          <p>
            No compartas contraseñas, códigos de verificación, claves bancarias,
            documentos innecesarios ni información sensible. PokeMarket no solicita
            claves, códigos OTP ni datos bancarios privados mediante chats entre usuarios.
          </p>
        </Section>

        <Section title="Señales de alerta">
          <p>
            Desconfía de precios excesivamente bajos, usuarios que presionan para pagar
            rápido, vendedores que evitan enviar fotografías adicionales, solicitudes de
            pagos poco claros o cualquier conducta que parezca sospechosa.
          </p>
        </Section>
      </FooterModal>

      <FooterModal
        open={activeModal === 'terms'}
        title="Términos y condiciones"
        onClose={() => setActiveModal(null)}
      >
        <Section title="Uso de la plataforma">
          <p>
            PokeMarket funciona como una plataforma de publicación y contacto entre
            usuarios. Las compras, ventas, acuerdos, pagos, entregas y verificaciones
            finales son responsabilidad directa de las personas involucradas en cada
            transacción.
          </p>
        </Section>

        <Section title="Responsabilidad del usuario">
          <p>
            Cada usuario debe publicar información real, clara y honesta. Las fotografías,
            descripciones, precios, condiciones y detalles del producto deben representar
            fielmente lo ofrecido.
          </p>

          <p>
            Está prohibido intentar engañar a otros usuarios, ocultar daños relevantes,
            publicar productos falsos como auténticos, manipular información o utilizar
            la plataforma con fines fraudulentos.
          </p>
        </Section>

        <Section title="Estado beta">
          <p>
            PokeMarket se encuentra en desarrollo continuo. Algunas funciones pueden
            cambiar, mejorar o ajustarse con el tiempo. El uso de la plataforma implica
            aceptar que pueden existir modificaciones técnicas, visuales o funcionales.
          </p>
        </Section>
      </FooterModal>

      <FooterModal
        open={activeModal === 'reputation'}
        title="Sistema de reputación y reportes"
        onClose={() => setActiveModal(null)}
      >
        <Section title="Reputación">
          <p>
            El sistema de reputación permite reflejar la experiencia de otros usuarios
            al comprar o vender. Las calificaciones ayudan a evaluar comunicación,
            cumplimiento, claridad del proceso y comportamiento general durante una
            transacción.
          </p>
        </Section>

        <Section title="Reportes">
          <p>
            Si un usuario presenta una conducta sospechosa, intenta estafar, entrega
            información falsa, incumple acuerdos importantes, amenaza, acosa o realiza
            acciones contrarias al correcto uso de la plataforma, puede ser reportado
            desde su perfil público.
          </p>
        </Section>

        <Section title="Strikes y sanciones">
          <p>
            Los reportes pueden derivar en advertencias, strikes, restricciones,
            suspensión de funciones o bloqueo permanente de la cuenta. Estas medidas
            buscan proteger a la comunidad y reducir riesgos en las transacciones.
          </p>
        </Section>
      </FooterModal>

      <FooterModal
        open={activeModal === 'info'}
        title="Información general"
        onClose={() => setActiveModal(null)}
      >
        <Section title="Sobre PokeMarket">
          <p>
            PokeMarket Chile es un marketplace orientado a coleccionistas dentro de Chile.
            Permite publicar cartas individuales, productos Pokémon sellados o relacionados,
            y lotes de cartas de menor valor conocidos comúnmente como challas.
          </p>
        </Section>

        <Section title="Transparencia">
          <p>
            La plataforma incorpora perfiles públicos, reputación, historial de ventas,
            publicaciones activas, reportes y calificaciones para entregar mayor contexto
            antes de comprar o vender.
          </p>
        </Section>
      </FooterModal>
    </>
  );
}

function FooterLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer text-[var(--muted)] hover:text-[var(--primary)] hover:underline transition-colors"
    >
      {children}
    </button>
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
      <h3 className="text-base font-semibold text-[var(--foreground)]">
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}