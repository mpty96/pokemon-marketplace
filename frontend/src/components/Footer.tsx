'use client';

import { useState } from 'react';
import FooterModal from './FooterModal';

type ModalType = 'policy' | 'terms' | 'data' | 'info' | null;

export default function Footer() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <>
      <footer className="mt-16 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <img
            src="/logo-footer.png"
            alt="PokeMarket Chile"
            className="h-8 w-auto object-contain mx-auto"
          />

          <p className="text-sm text-[var(--muted)] mt-2 leading-6">
            Marketplace dedicado a los coleccionistas de Pokémon en Chile. 
            Compra, vende e interactúa de manera segura y honesta.
          </p>

          <nav className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <FooterLink onClick={() => setActiveModal('policy')}>
              Política y seguridad
            </FooterLink>

            <FooterLink onClick={() => setActiveModal('terms')}>
              Términos y condiciones
            </FooterLink>

            <FooterLink onClick={() => setActiveModal('data')}>
              Datos y cumplimiento
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
        open={activeModal === 'policy'}
        title="Política y seguridad"
        onClose={() => setActiveModal(null)}
      >
        <Section title="Finalidad de seguridad">
          <p>
            PokeMarket recopila y utiliza ciertos datos para permitir el funcionamiento de la plataforma,
            proteger cuentas, prevenir fraudes, moderar reportes, mantener historial de transacciones
            y mejorar la seguridad general del marketplace.
          </p>
          <p>
            Ninguna medida de seguridad garantiza protección absoluta. Por eso, cada usuario sigue siendo
            responsable de verificar la autenticidad, condición, legitimidad y detalles del producto antes
            de concretar cualquier compra o venta.
          </p>
        </Section>

        <Section title="Datos usados para seguridad">
          <p>
            Podemos utilizar datos como email, nombre de usuario, perfil, publicaciones, imágenes,
            mensajes, reportes, calificaciones, transacciones, intentos de inicio de sesión, registros
            técnicos e información necesaria para detectar abuso o actividad sospechosa.
          </p>
        </Section>

        <Section title="Moderación y reportes">
          <p>
            En caso de reportes, sospecha de fraude, amenazas, acoso, suplantación, publicaciones falsas
            o incumplimiento de reglas, PokeMarket podrá revisar información relacionada al caso,
            incluyendo publicaciones, perfiles, historial de transacciones y mensajes vinculados.
          </p>
        </Section>

        <Section title="Responsabilidad del usuario">
          <p>
            El usuario debe proteger su cuenta, usar contraseñas seguras, no compartir códigos de acceso,
            revisar cuidadosamente cada publicación y evitar pagos o acuerdos cuando existan señales de riesgo.
            PokeMarket no solicita claves bancarias, códigos OTP ni contraseñas por chat.
          </p>
        </Section>
      </FooterModal>

      <FooterModal
        open={activeModal === 'terms'}
        title="Términos y condiciones"
        onClose={() => setActiveModal(null)}
      >
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
      </FooterModal>

      <FooterModal
        open={activeModal === 'data'}
        title="Datos y cumplimiento"
        onClose={() => setActiveModal(null)}
      >
        <Section title="Datos que recopilamos">
          <p>
            PokeMarket puede recopilar email, nombre de usuario, contraseña cifrada, estado de verificación,
            información de perfil, avatar, ubicación declarada, teléfono o RUT si el sistema los solicita
            para seguridad, publicaciones, imágenes, mensajes, reportes, calificaciones, transacciones,
            historial de actividad, tokens de sesión y registros técnicos necesarios para operar la plataforma.
          </p>
        </Section>

        <Section title="Para qué usamos los datos">
          <p>
            Usamos estos datos para crear cuentas, iniciar sesión, verificar identidad básica, mostrar perfiles,
            publicar productos, permitir chats, registrar ventas, calcular reputación, prevenir abuso, investigar
            reportes, enviar correos operativos y mantener la seguridad del sistema.
          </p>
        </Section>

        <Section title="Conservación de datos">
          <p>
            Los datos se conservan mientras la cuenta exista o mientras sean necesarios para seguridad,
            funcionamiento, prevención de fraude, respaldo, auditoría interna o cumplimiento de obligaciones.
            Algunos datos relacionados con reportes, sanciones, transacciones o abuso pueden conservarse incluso
            después de cerrar una cuenta, cuando sea razonablemente necesario para proteger a la comunidad.
          </p>
        </Section>

        <Section title="Terceros técnicos">
          <p>
            PokeMarket no vende datos personales. Algunos servicios externos pueden procesar datos solo para
            operar funciones necesarias, por ejemplo almacenamiento de imágenes, envío de correos, hosting,
            base de datos o infraestructura técnica.
          </p>
        </Section>

        <Section title="Derechos y solicitudes">
          <p>
            Los usuarios pueden solicitar revisión, corrección o eliminación de datos cuando corresponda.
            Algunas solicitudes pueden quedar limitadas si existen reportes, transacciones, investigaciones
            de seguridad o registros necesarios para prevenir abuso.
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
            PokeMarket Chile es un marketplace creado para la comunidad coleccionista de Pokémon TCG en Chile.
            La plataforma permite publicar cartas individuales, productos Pokémon, productos sellados o relacionados,
            y lotes coleccionables.
          </p>
        </Section>

        <Section title="Publicaciones">
          <p>
            Los usuarios pueden crear publicaciones con imágenes, nombre de carta o producto, edición, número de set,
            idioma, condición, rareza, descripción, precio y stock cuando corresponda. Cada publicación debe representar
            fielmente el producto ofrecido.
          </p>
        </Section>

        <Section title="Chats entre usuarios">
          <p>
            El contacto entre compradores y vendedores ocurre mediante el chat interno asociado a una publicación activa.
            Este chat permite coordinar dudas, fotografías adicionales, entrega, pago y detalles del proceso.
          </p>
        </Section>

        <Section title="Compra, venta y confirmación">
          <p>
            Para que una venta quede completada dentro de PokeMarket, ambas partes deben confirmar el proceso.
            Esto ayuda a registrar transacciones reales, evitar registros falsos y mantener mayor transparencia
            dentro de la plataforma.
          </p>
        </Section>

        <Section title="Calificaciones y reputación">
          <p>
            Después de una transacción completada, los usuarios pueden calificar la experiencia considerando aspectos
            como comunicación, claridad del proceso y cumplimiento. Estas calificaciones ayudan a construir reputación
            pública dentro de la comunidad.
          </p>
        </Section>

        <Section title="Reportes, strikes y baneos">
          <p>
            PokeMarket cuenta con sistema de reportes para informar conductas sospechosas, intentos de estafa,
            acoso, información falsa o incumplimientos graves. Dependiendo del caso, un usuario puede recibir strikes,
            restricciones, suspensión temporal o baneo permanente.
          </p>
        </Section>

        <Section title="Beta testers">
          <p>
            Los usuarios que participen activamente en la etapa beta pueden recibir un distintivo especial de
            Beta Tester en su perfil. Este reconocimiento identifica a quienes ayudaron a probar, mejorar y fortalecer
            la plataforma en sus primeras etapas.
          </p>
        </Section>

        <Section title="Valorar carta e historial de precios">
          <p>
            PokeMarket incorpora un sistema de <span className="font-medium text-[var(--foreground)]">Valorar carta</span>
            que busca ayudar a los usuarios a tener una referencia aproximada del valor de mercado de una carta
            utilizando información histórica disponible dentro de la plataforma.
          </p>

          <p>
            El sistema puede considerar factores como:
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            {[
              'Ventas completadas',
              'Historial de precios',
              'Edición',
              'Idioma',
              'Rareza',
              'Condición',
              'Tendencias internas',
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
            Algunas publicaciones también pueden mostrar gráficos de precios basados en transacciones
            registradas dentro de PokeMarket para entregar mayor contexto histórico a compradores y vendedores.
          </p>

          <p>
            Estas herramientas son únicamente referenciales y no representan una tasación oficial,
            garantía de valor futuro ni confirmación absoluta del precio real de mercado de una carta o producto.
          </p>
        </Section>

        <Section title="Cartas de mi Interés">
          <p>
            La sección Cartas de mi Interés permite que los usuarios muestren públicamente qué cartas buscan o desean
            conseguir. Esta función es solo informativa: no crea publicaciones, no genera chats automáticos y no permite
            contacto directo entre usuarios.
          </p>
        </Section>

        <Section title="Transacciones públicas">
          <p>
            La sección Transacciones muestra ventas completadas dentro de la plataforma para aportar transparencia.
            Allí se puede visualizar información como producto vendido, precio final, fecha, vendedor y comprador.
          </p>
        </Section>

        <Section title="Niveles de usuario">
          <p>
            PokeMarket puede asignar niveles según la actividad y transacciones completadas de cada usuario.
            Estos niveles funcionan como una referencia adicional de participación dentro de la comunidad,
            pero no reemplazan la revisión personal de cada publicación o perfil.
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