'use client';

import { useState } from 'react';
import FooterModal from './FooterModal';

type ModalType = 'security' | 'terms' | 'reputation' | 'info' | null;

export default function Footer() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <>
      <footer className="mt-16 border-t border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-lg font-bold text-[var(--primary)]">
                🎴 PokeMarket Chile
              </p>
              <p className="text-sm text-[var(--muted)] mt-1 max-w-xl">
                Marketplace para coleccionistas en Chile. Compra, vende y conversa
                con otros usuarios de forma más informada, transparente y segura.
              </p>
              <p className="text-xs text-[var(--muted-2)] mt-2">
                © 2026 PokeMarket Chile · Versión Beta
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex gap-2">
              <FooterButton onClick={() => setActiveModal('security')}>
                🛡 Seguridad
              </FooterButton>

              <FooterButton onClick={() => setActiveModal('terms')}>
                📜 Términos
              </FooterButton>

              <FooterButton onClick={() => setActiveModal('reputation')}>
                ⭐ Reputación
              </FooterButton>

              <FooterButton onClick={() => setActiveModal('info')}>
                ℹ Información
              </FooterButton>
            </div>
          </div>
        </div>
      </footer>

      <FooterModal
        open={activeModal === 'security'}
        title="Seguridad y prevención de estafas"
        icon="🛡"
        onClose={() => setActiveModal(null)}
      >
        <Section title="Antes de comprar">
          <p>
            Antes de concretar cualquier compra, revisa cuidadosamente la publicación,
            las fotografías, la descripción, la reputación del vendedor y las
            calificaciones recibidas. No te apresures si el precio parece demasiado
            bajo o si el vendedor evita responder preguntas importantes.
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Solicita fotografías claras del frente y reverso de la carta.</li>
            <li>Pide fotos de esquinas, bordes, superficie y zonas holográficas.</li>
            <li>Solicita imágenes con buena iluminación y sin filtros.</li>
            <li>Pregunta por rayones, dobleces, marcas, humedad o desgaste.</li>
            <li>Compara la carta con referencias confiables antes de pagar.</li>
          </ul>
        </Section>

        <Section title="Protección personal">
          <p>
            No compartas contraseñas, códigos de verificación, claves bancarias,
            documentos innecesarios ni información sensible. Si acuerdas una entrega
            presencial, prefiere lugares públicos, iluminados y concurridos.
          </p>
        </Section>

        <Section title="Señales de alerta">
          <ul className="list-disc ml-5 space-y-1">
            <li>Presión para pagar rápido.</li>
            <li>Negativa a enviar más fotos o videos.</li>
            <li>Precios extremadamente bajos sin explicación.</li>
            <li>Usuarios con mala reputación o reportes previos.</li>
            <li>Solicitud de pagos extraños o fuera del acuerdo.</li>
          </ul>
        </Section>
      </FooterModal>

      <FooterModal
        open={activeModal === 'terms'}
        title="Términos y condiciones de uso"
        icon="📜"
        onClose={() => setActiveModal(null)}
      >
        <Section title="Uso general de PokeMarket">
          <p>
            PokeMarket es una plataforma de publicación y contacto entre usuarios.
            Las compras, ventas, acuerdos, pagos, entregas y verificaciones finales
            son responsabilidad directa de las partes involucradas.
          </p>
        </Section>

        <Section title="Responsabilidad del usuario">
          <p>
            Cada usuario debe publicar información real, clara y honesta. Las imágenes,
            descripciones, precios y condiciones del producto deben representar
            fielmente lo ofrecido.
          </p>
          <p>
            Está prohibido publicar productos falsos como auténticos, manipular
            información, ocultar daños relevantes o intentar engañar a otros usuarios.
          </p>
        </Section>

        <Section title="Estado Beta">
          <p>
            PokeMarket se encuentra en desarrollo continuo. Algunas funciones pueden
            cambiar, mejorar o ajustarse con el tiempo. El uso de la plataforma implica
            aceptar que todavía pueden existir ajustes técnicos, visuales o funcionales.
          </p>
        </Section>
      </FooterModal>

      <FooterModal
        open={activeModal === 'reputation'}
        title="Sistema de reputación, reportes y strikes"
        icon="⭐"
        onClose={() => setActiveModal(null)}
      >
        <Section title="Reputación">
          <p>
            La reputación ayuda a medir la experiencia de otros usuarios al comprar o
            vender. Las calificaciones pueden considerar comunicación, precio, proceso
            de venta y cumplimiento del acuerdo.
          </p>
        </Section>

        <Section title="Reportes">
          <p>
            Si un usuario tiene una conducta sospechosa, intenta estafar, amenaza,
            acosa, publica información falsa o incumple acuerdos importantes, puede ser
            reportado desde su perfil público.
          </p>
        </Section>

        <Section title="Strikes y sanciones">
          <p>
            Los reportes pueden derivar en advertencias o strikes. Si un usuario acumula
            conductas graves o reiteradas, PokeMarket podrá restringir funciones,
            suspender la cuenta o prohibir el acceso a la plataforma.
          </p>
          <p>
            El sistema de strikes busca proteger a la comunidad y reducir riesgos en
            las transacciones entre usuarios.
          </p>
        </Section>
      </FooterModal>

      <FooterModal
        open={activeModal === 'info'}
        title="Información sobre PokeMarket"
        icon="ℹ"
        onClose={() => setActiveModal(null)}
      >
        <Section title="Qué es PokeMarket">
          <p>
            PokeMarket Chile es un marketplace pensado para coleccionistas de cartas,
            productos Pokémon y lotes/challas dentro de Chile.
          </p>
        </Section>

        <Section title="Qué puedes publicar">
          <ul className="list-disc ml-5 space-y-1">
            <li>Cartas individuales.</li>
            <li>Productos Pokémon como ETBs, booster packs, sobres y similares.</li>
            <li>Challas o lotes de cartas de menor valor.</li>
          </ul>
        </Section>

        <Section title="Transparencia">
          <p>
            La plataforma muestra historial de transacciones, reputación, publicaciones
            activas y datos relevantes para que los usuarios puedan tomar mejores
            decisiones antes de comprar o vender.
          </p>
        </Section>
      </FooterModal>
    </>
  );
}

function FooterButton({
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
      className="text-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] px-3 py-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
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
      <h3 className="text-base font-bold text-[var(--foreground)]">
        {title}
      </h3>
      {children}
    </section>
  );
}