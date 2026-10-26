import React, { useState, type FormEvent, useEffect, useRef } from "react";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SocialProofReels } from "@/components/SocialProofReels";
import { ThumbNav } from "@/components/ThumbNav";

import hero from "@/assets/hero.jpg";
import cupcakes from "@/assets/cupcakes.jpg";
import tarts from "@/assets/tarts.jpg";
import occasions from "@/assets/occasions.jpg";

// Reemplazar con el número comercial confirmado (formato internacional sin "+")
const WHATSAPP_NUMBER = "";

const btn =
  "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300";
const btnPrimary = `${btn} bg-primary text-primary-foreground hover:bg-primary/85 hover:-translate-y-0.5`;
const btnGhost = `${btn} border border-primary text-primary hover:bg-primary hover:text-primary-foreground`;

const products = [
  { img: hero, name: "Pasteles", note: "De una a varias capas, decorados a mano." },
  { img: cupcakes, name: "Cupcakes", note: "Por docena o para mesas de postres." },
  { img: tarts, name: "Tartas", note: "Bases crujientes y rellenos de temporada." },
  { img: occasions, name: "Dulces", note: "Detalles pequeños para compartir." },
];

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="placeholder-tag">{children}</span>;
}

function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-6 py-20 md:px-12 md:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-4xl leading-tight md:text-6xl">{title}</h2>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

const orderSchema = z.object({
  nombre: z.string().trim().min(1, "Indica tu nombre").max(100),
  contacto: z.string().trim().min(5, "Indica un teléfono o email").max(255),
  tipo: z.string().min(1, "Elige un tipo"),
  tamano: z.string().trim().max(100).optional(),
  sabor: z.string().trim().max(100).optional(),
  fecha: z.string().min(1, "Elige una fecha"),
  presupuesto: z.string().trim().max(50).optional(),
  notas: z.string().trim().max(1000).optional(),
});

const field =
  "w-full rounded-sm border border-input bg-card px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30";

interface OrderFormProps {
  wa: string | null;
  presetOrder?: { tipo?: string; notas?: string } | null;
}

function OrderForm({ wa, presetOrder }: OrderFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [lastOrder, setLastOrder] = useState<Record<string, string> | null>(null);

  const [tipoVal, setTipoVal] = useState("");
  const [notasVal, setNotasVal] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (presetOrder) {
      if (presetOrder.tipo) setTipoVal(presetOrder.tipo);
      if (presetOrder.notas) setNotasVal(presetOrder.notas);
    }
  }, [presetOrder]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData) as Record<string, string>;
    const r = orderSchema.safeParse(data);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setLastOrder(data);
    setSent(true);
  }

  const L = ({
    name,
    label,
    children,
  }: {
    name: string;
    label: string;
    children: React.ReactNode;
  }) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
      {errors[name] && (
        <span className="mt-1 block text-xs text-destructive">{errors[name]}</span>
      )}
    </label>
  );

  return (
    <section id="pedido" className="bg-card px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="eyebrow">Pedido personalizado</p>
          <h2 className="mt-3 text-4xl leading-tight md:text-6xl font-display">
            Hagamos tu pastel realidad
          </h2>
          <p className="mt-6 text-muted-foreground">
            Cuéntanos qué imaginas y te responderemos con una propuesta artística y presupuesto sin compromiso.
          </p>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className={`${btnGhost} mt-8`}
            >
              Escribir por WhatsApp
            </a>
          ) : (
            <p className="mt-8">
              <Placeholder>WhatsApp disponible cuando se confirme el número</Placeholder>
            </p>
          )}

          <div className="mt-12 rounded-xl border border-border/80 bg-muted/30 p-5 space-y-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground text-sm">Garantías de nuestro obrador:</p>
            <p>✓ Elaboración fresca el mismo día de la entrega o recogida.</p>
            <p>✓ Adaptamos recetas para alergias e intolerancias (consultar disponibilidad previa).</p>
            <p>✓ Coordinación personalizada vía WhatsApp y llamada para cada detalle estético.</p>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-background p-8 md:p-12 fade-up">
            <h3 className="text-4xl font-display">¡Gracias!</h3>
            <p className="mt-3 text-muted-foreground text-sm">
              Hemos recibido tu solicitud{lastOrder?.nombre ? `, ${lastOrder.nombre}` : ""}. Revisaremos tu propuesta en el obrador y nos pondremos en contacto contigo en un plazo máximo de 24 horas.
            </p>
            {lastOrder && (
              <div className="mt-6 rounded-xl border border-border/70 bg-card p-5 text-xs text-muted-foreground space-y-1.5">
                <p className="font-semibold text-foreground text-sm mb-2">Detalles del pedido enviado:</p>
                <p><strong className="text-foreground">Tipo de dulce:</strong> {lastOrder.tipo}</p>
                {lastOrder.tamano && <p><strong className="text-foreground">Tamaño / Porciones:</strong> {lastOrder.tamano}</p>}
                {lastOrder.sabor && <p><strong className="text-foreground">Sabor preferido:</strong> {lastOrder.sabor}</p>}
                <p><strong className="text-foreground">Fecha requerida:</strong> {lastOrder.fecha}</p>
                <p><strong className="text-foreground">Contacto:</strong> {lastOrder.contacto}</p>
                {lastOrder.notas && <p><strong className="text-foreground">Notas:</strong> {lastOrder.notas}</p>}
              </div>
            )}
            <button
              onClick={() => {
                setSent(false);
                setLastOrder(null);
              }}
              className={`${btnGhost} mt-8 self-start cursor-pointer`}
            >
              Enviar otra solicitud
            </button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
            <L name="nombre" label="Nombre">
              <input name="nombre" className={field} maxLength={100} placeholder="Tu nombre" />
            </L>
            <L name="contacto" label="Teléfono o email">
              <input name="contacto" className={field} maxLength={255} placeholder="hola@ejemplo.com / 612 345 678" />
            </L>
            <L name="tipo" label="Tipo de pastel">
              <select
                name="tipo"
                className={field}
                value={tipoVal}
                onChange={(e) => setTipoVal(e.target.value)}
              >
                <option value="" disabled>
                  Selecciona…
                </option>
                <option value="Pastel">Pastel artesanal</option>
                <option value="Cupcakes">Cupcakes gourmet</option>
                <option value="Tarta">Tarta de temporada</option>
                <option value="Dulces">Mesa de dulces / Petit fours</option>
                <option value="Otro">Otro encargo especial</option>
              </select>
            </L>
            <L name="tamano" label="Tamaño / porciones">
              <input
                name="tamano"
                placeholder="Ej. 15-20 personas"
                className={field}
                maxLength={100}
              />
            </L>
            <L name="sabor" label="Sabor deseado">
              <input
                name="sabor"
                placeholder="Ej. Pistacho, chocolate belga, vainilla bourbon..."
                className={field}
                maxLength={100}
              />
            </L>
            <L name="fecha" label="Fecha deseada">
              <input type="date" name="fecha" className={field} />
            </L>
            <div className="sm:col-span-2">
              <L name="presupuesto" label="Presupuesto aproximado (opcional)">
                <input name="presupuesto" placeholder="Ej. 60€ - 120€" className={field} maxLength={50} />
              </L>
            </div>
            <div className="sm:col-span-2">
              <L name="notas" label="Notas, inspiración o referencia a Reels">
                <textarea
                  name="notas"
                  rows={4}
                  className={field}
                  maxLength={1000}
                  value={notasVal}
                  onChange={(e) => setNotasVal(e.target.value)}
                  placeholder="Cuéntanos detalles de la decoración, estilo, flores o referencias visuales..."
                />
              </L>
            </div>
            <button type="submit" className={`${btnPrimary} sm:col-span-2 cursor-pointer`}>
              Enviar solicitud
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [presetOrder, setPresetOrder] = useState<{ tipo?: string; notas?: string } | null>(null);

  const wa = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Hola, quiero hacer un pedido personalizado en Maranatha's Cake Shop",
      )}`
    : null;

  const handleSelectCakeFromReel = (cakeType: string, noteText: string) => {
    setPresetOrder({ tipo: cakeType, notas: noteText });
    const el = document.getElementById("pedido");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenOrder = () => {
    const el = document.getElementById("pedido");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="font-sans antialiased selection:bg-secondary/40 pb-20 md:pb-0">
      {/* Top Bar Navigation (Desktop & Tablet) */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-12">
          <a href="#" className="font-display text-2xl italic tracking-wide">
            Maranatha's
          </a>
          <nav className="hidden gap-8 text-sm md:flex">
            <a href="#productos" className="transition-colors hover:text-muted-foreground">
              Productos
            </a>
            <a href="#ocasiones" className="transition-colors hover:text-muted-foreground">
              Ocasiones
            </a>
            <a href="#reels" className="transition-colors hover:text-muted-foreground font-medium text-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Reels UGC
            </a>
            <a href="#historia" className="transition-colors hover:text-muted-foreground">
              Historia
            </a>
            <a href="#faq" className="transition-colors hover:text-muted-foreground">
              Preguntas
            </a>
          </nav>
          <a href="#pedido" className={`${btnPrimary} px-5 py-2.5 text-xs`}>
            Haz tu pedido
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={hero}
          alt="Pastel de tres pisos decorado con rosas empolvadas"
          width={1600}
          height={1104}
          className="h-[78vh] min-h-[520px] w-full object-cover object-[70%_center] md:h-[88vh]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent md:via-background/40" />
        <div className="absolute inset-0 flex items-end px-6 pb-16 md:items-center md:px-12 md:pb-0">
          <div className="mx-auto w-full max-w-6xl fade-up">
            <p className="eyebrow">Pastelería artesanal</p>
            <h1 className="mt-4 max-w-xl text-5xl leading-[1.02] md:text-8xl">
              Dulces que se <em>recuerdan</em>.
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
              Pasteles hechos a mano para celebrar lo que más importa, desde el
              primer boceto hasta el último bocado.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#pedido" className={btnPrimary}>
                Haz tu pedido
              </a>
              <a href="#reels" className={btnGhost}>
                Ver Reels reales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Productos */}
      <Section
        id="productos"
        eyebrow="Destacados"
        title="Hecho a mano, pensado para compartir"
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.map((p) => (
            <a key={p.name} href="#pedido" className="group">
              <div className="overflow-hidden rounded-sm bg-muted">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  width={1008}
                  height={1200}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-4 text-2xl md:text-3xl">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>
              <span className="mt-2 inline-block text-xs font-semibold uppercase tracking-widest underline-offset-4 group-hover:underline">
                Pedir →
              </span>
            </a>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          <Placeholder>Pendiente</Placeholder> Precios y sabores disponibles por
          confirmar según temporada.
        </p>
      </Section>

      {/* Ocasiones */}
      <section id="ocasiones" className="bg-card px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <img
            src={occasions}
            alt="Pastel de bodas con flores prensadas y pastel de cumpleaños"
            loading="lazy"
            width={1008}
            height={1200}
            className="aspect-[4/5] w-full rounded-sm object-cover"
          />
          <div>
            <p className="eyebrow">Colecciones</p>
            <h2 className="mt-3 text-4xl leading-tight md:text-6xl">
              Para cada ocasión especial
            </h2>
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {[
                ["Cumpleaños", "Pasteles con personalidad, para todas las edades."],
                ["Bodas", "Diseños a medida para el día más esperado."],
                ["Bautizos y comuniones", "Detalles delicados y elegantes."],
                ["Eventos y empresas", "Mesas de postres y pedidos por volumen."],
              ].map(([t, d]) => (
                <li
                  key={t}
                  className="flex items-baseline justify-between gap-6 py-5"
                >
                  <span className="font-display text-2xl md:text-3xl">{t}</span>
                  <span className="max-w-[14rem] text-right text-sm text-muted-foreground">
                    {d}
                  </span>
                </li>
              ))}
            </ul>
            <a href="#pedido" className={`${btnPrimary} mt-10`}>
              Diseñar mi pastel
            </a>
          </div>
        </div>
      </section>

      {/* Galería */}
      <Section eyebrow="Galería" title="Creaciones personalizadas">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          <img
            src={hero}
            alt="Pastel con rosas"
            loading="lazy"
            className="col-span-2 row-span-2 h-full w-full rounded-sm object-cover"
          />
          <img
            src={cupcakes}
            alt="Cupcakes"
            loading="lazy"
            className="aspect-square w-full rounded-sm object-cover"
          />
          <img
            src={tarts}
            alt="Tarta de frutos rojos"
            loading="lazy"
            className="aspect-square w-full rounded-sm object-cover"
          />
          <img
            src={occasions}
            alt="Pastel de bodas"
            loading="lazy"
            className="col-span-2 aspect-[2/1] w-full rounded-sm object-cover"
          />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          <Placeholder>Provisional</Placeholder> Fotografías de referencia del obrador y encargos recientes.
        </p>
      </Section>

      {/* Historia */}
      <section
        id="historia"
        className="bg-primary px-6 py-20 text-primary-foreground md:px-12 md:py-28"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow text-secondary">Nuestra historia</p>
          <h2 className="mt-4 text-4xl leading-tight md:text-6xl font-display">
            <em>Maranatha's</em> nace del gusto por celebrar juntos.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-primary-foreground/80 text-sm md:text-base leading-relaxed">
            Cada tarta empieza con una conversación sobre tus sabores favoritos y la ocasión que vas a compartir. Horneamos despacio, seleccionando ingredientes puros: mantequilla fresca, chocolate noble y frutas recolectadas en su sazón óptima.
          </p>
          <div className="mt-14 grid gap-10 text-left md:grid-cols-3">
            {[
              ["Hecho a mano", "Cada pieza se prepara individualmente por encargo."],
              ["Diseño a medida", "Tu idea, convertida en una creación artística única."],
              ["Atención cercana", "Te acompañamos desde el boceto hasta la entrega."],
            ].map(([t, d]) => (
              <div key={t} className="border-t border-primary-foreground/25 pt-5">
                <h3 className="text-2xl font-display">{t}</h3>
                <p className="mt-2 text-sm text-primary-foreground/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proceso */}
      <Section eyebrow="Cómo pedir" title="Tu pastel en cuatro pasos">
        <ol className="grid gap-10 md:grid-cols-4">
          {[
            ["Cuéntanos tu idea", "Completa el formulario o escríbenos."],
            ["Diseñamos juntos", "Afinamos sabor, tamaño y decoración."],
            ["Confirmamos", "Te enviamos el presupuesto y la fecha."],
            ["A disfrutar", "Recogida o entrega según lo acordado."],
          ].map(([t, d], i) => (
            <li key={t}>
              <span className="font-display text-6xl italic text-secondary">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-2xl font-display">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* SOCIAL PROOF 2.0: UGC Micro-Videos / Reels Integrados Orgánicamente */}
      <SocialProofReels onSelectCakeType={handleSelectCakeFromReel} />

      {/* FAQ */}
      <Section id="faq" eyebrow="Preguntas frecuentes" title="Antes de pedir">
        <Accordion type="single" collapsible className="max-w-3xl">
          {(
            [
              [
                "¿Con cuánta anticipación debo hacer mi pedido?",
                "Recomendamos reservar con 7 a 15 días de antelación para pasteles personalizados y con 1 mes para bodas o eventos grandes.",
              ],
              [
                "¿Puedo recoger mi pedido en el obrador?",
                "Sí, disponemos de franjas horarias de recogida concertada para garantizar que tu pedido esté recién terminado.",
              ],
              [
                "¿Hacen entregas a domicilio?",
                "Realizamos transporte refrigerado y climatizado para tartas nupciales y piezas de varios pisos en la zona metropolitana.",
              ],
              [
                "¿Cómo se confirma y se paga un pedido?",
                "Una vez cerrado el diseño y presupuesto, se realiza una reserva del 50% vía Bizum o transferencia, y el resto a la entrega.",
              ],
            ] as [string, string][]
          ).map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="font-display text-xl md:text-2xl">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* Formulario Pedido */}
      <OrderForm wa={wa} presetOrder={presetOrder} />

      {/* Footer */}
      <footer className="border-t border-border px-6 py-14 pb-28 md:px-12 md:pb-14">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl italic">Maranatha's</p>
            <p className="mt-2 text-sm text-muted-foreground">Artisanal Cake Shop & Atelier</p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="eyebrow">Contacto & Obrador</p>
            <p>Calle del Obrador 12, Ciudad</p>
            <p>pedidos@maranathascakes.com</p>
            <p>Martes a Sábado: 09:30 – 19:30</p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="eyebrow">Síguenos en Redes</p>
            <p>@maranathas.cakes en Instagram</p>
            <p>Comparte tus fotos con #MaranathasMoments</p>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} Maranatha's Cake Shop. Todos los derechos reservados.
        </p>
      </footer>

      {/* Menú Pulgar-First para Dispositivos Móviles */}
      <ThumbNav onOpenOrder={handleOpenOrder} whatsappUrl={wa} />
    </div>
  );
}
