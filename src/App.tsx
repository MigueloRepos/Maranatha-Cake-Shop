import React, { useState, type FormEvent, useEffect, useRef } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SocialProofReels } from "@/components/SocialProofReels";
import { ThumbNav } from "@/components/ThumbNav";
import {
  MessageCircle,
  Phone,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  RotateCcw,
  Settings2,
  Check,
} from "lucide-react";

import hero from "@/assets/hero.jpg";
import cupcakes from "@/assets/cupcakes.jpg";
import tarts from "@/assets/tarts.jpg";
import occasions from "@/assets/occasions.jpg";

// Número comercial predeterminado de WhatsApp (formato internacional sin "+")
const DEFAULT_WHATSAPP_NUMBER = "34612345678";

const btn =
  "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300";
const btnPrimary = `${btn} bg-[#DD1D4A] text-white hover:bg-[#B8173D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F24770] focus-visible:ring-offset-2 hover:-translate-y-0.5 shadow-sm hover:shadow-md`;
const btnGhost = `${btn} border border-[#DD1D4A] text-[#DD1D4A] hover:bg-[#DD1D4A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F24770] focus-visible:ring-offset-2`;
const btnWhatsApp = `${btn} bg-[#DD1D4A] text-white hover:bg-[#B8173D] shadow-md hover:shadow-lg hover:-translate-y-0.5`;

const products = [
  { img: hero, name: "Pasteles", categoryVal: "Pastel", note: "De una a varias capas, decorados a mano." },
  { img: cupcakes, name: "Cupcakes", categoryVal: "Cupcakes", note: "Por docena o para mesas de postres." },
  { img: tarts, name: "Tartas", categoryVal: "Tarta", note: "Bases crujientes y rellenos de temporada." },
  { img: occasions, name: "Dulces", categoryVal: "Dulces", note: "Detalles pequeños para compartir." },
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
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`px-6 py-20 md:px-12 md:py-28 ${className}`}
    >
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="eyebrow"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.14 }}
          className="mt-3 max-w-2xl text-4xl leading-tight md:text-6xl font-display"
        >
          {title}
        </motion.h2>
        <div className="mt-12">{children}</div>
      </div>
    </motion.section>
  );
}

const orderSchema = z.object({
  nombre: z.string().trim().min(1, "Indica tu nombre").max(100),
  contacto: z.string().trim().min(5, "Indica un teléfono o email").max(255),
  tipo: z.string().min(1, "Elige un tipo"),
  tamano: z.string().trim().max(100).optional(),
  sabor: z.string().trim().max(100).optional(),
  fecha: z.string().min(1, "Elige la fecha de tu evento"),
  presupuesto: z.string().trim().max(50).optional(),
  notas: z.string().trim().max(1000).optional(),
});

const field =
  "w-full rounded-sm border border-input bg-card px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30";

interface OrderFormProps {
  whatsappNumber: string;
  presetOrder?: { tipo?: string; notas?: string } | null;
  onUpdateWhatsAppNumber: (newNumber: string) => void;
}

function OrderForm({ whatsappNumber, presetOrder, onUpdateWhatsAppNumber }: OrderFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [lastOrder, setLastOrder] = useState<Record<string, string> | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Settings modal for bakery phone number
  const [showPhoneSetting, setShowPhoneSetting] = useState(false);
  const [tempPhone, setTempPhone] = useState(whatsappNumber);

  const [tipoVal, setTipoVal] = useState("");
  const [notasVal, setNotasVal] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (presetOrder) {
      if (presetOrder.tipo) setTipoVal(presetOrder.tipo);
      if (presetOrder.notas) setNotasVal(presetOrder.notas);
    }
  }, [presetOrder]);

  const directWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola Maranatha's Cake Shop! Me gustaría consultar disponibilidad y presupuesto para un encargo personalizado.",
  )}`;

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

    // Build structured, beautiful WhatsApp message
    const msg = [
      `🎂 *NUEVO ENCARGO — MARANATHA'S CAKE SHOP* 🎂`,
      ``,
      `👤 *Cliente:* ${data.nombre}`,
      `📱 *Contacto:* ${data.contacto}`,
      `🍰 *Tipo de dulce:* ${data.tipo}`,
      `👥 *Porciones / Tamaño:* ${data.tamano ? data.tamano : "A consultar con el obrador"}`,
      `🍓 *Sabor preferido:* ${data.sabor ? data.sabor : "Por definir"}`,
      `📅 *Fecha requerida:* ${data.fecha}`,
      `💶 *Presupuesto aprox.:* ${data.presupuesto ? data.presupuesto : "A presupuestar"}`,
      ``,
      `📝 *Notas e inspiración:*`,
      data.notas ? `${data.notas}` : `(Sin notas adicionales)`,
      ``,
      `_Enviado desde el configurador online de Maranatha's Cake Shop_`,
    ].join("\n");

    setGeneratedMessage(msg);
    setSent(true);

    // Open WhatsApp directly in new window/tab
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  const handleCopyMessage = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tempPhone.replace(/[^0-9]/g, "");
    if (clean.length >= 7) {
      onUpdateWhatsAppNumber(clean);
      setShowPhoneSetting(false);
    }
  };

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
    <motion.section
      id="pedido"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card px-6 py-20 md:px-12 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        {/* Banner Indicativo de Pedidos Exclusivos por WhatsApp */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 p-4 sm:p-5 rounded-2xl border border-[#F2D3D3] bg-[#F9E2DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#DD1D4A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Canal exclusivo de pedidos: WhatsApp Oficial
              </p>
              <p className="text-xs text-muted-foreground">
                Todos los pedidos se gestionan y confirman directamente por WhatsApp con el obrador para asegurar diseño y disponibilidad.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPhoneSetting(true)}
            className="self-start sm:self-auto text-xs font-medium text-foreground hover:text-[#DD1D4A] flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg border border-[#F2D3D3] bg-background/80 hover:bg-background cursor-pointer transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#DA914C]" />
            <span>Nº de WhatsApp: +{whatsappNumber}</span>
          </button>
        </motion.div>

        {/* Modal de configuración de número */}
        <AnimatePresence>
          {showPhoneSetting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
              onClick={() => setShowPhoneSetting(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="w-full max-w-md bg-background border border-border rounded-2xl p-6 shadow-2xl space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif font-bold text-foreground">
                  Configurar número de WhatsApp
                </h3>
                <button
                  onClick={() => setShowPhoneSetting(false)}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Indica el número comercial al que se enviarán todos los encargos desde la web (formato internacional con prefijo, sin el símbolo +):
              </p>
              <form onSubmit={handleSavePhone} className="space-y-4">
                <input
                  type="text"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  placeholder="34612345678"
                  className={field}
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">
                  Ejemplo España: <code>34612345678</code> (34 + 9 dígitos)
                </p>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPhoneSetting(false)}
                    className="px-4 py-2 text-xs font-medium rounded-full border border-border text-foreground hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-full bg-[#DD1D4A] text-white hover:bg-[#B8173D] transition-colors cursor-pointer"
                  >
                    Guardar número
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        <div className="grid gap-12 md:grid-cols-[1fr_1.3fr]">
          {/* Left Column: Context & Direct Chat Option */}
          <div>
            <p className="eyebrow">Atelier & Encargos</p>
            <h2 className="mt-3 text-4xl leading-tight md:text-6xl font-display">
              Haz tu pedido exclusivamente por WhatsApp
            </h2>
            <p className="mt-6 text-muted-foreground text-sm md:text-base leading-relaxed">
              En Maranatha's no utilizamos carritos automatizados impersonales. Creemos en el contacto humano, el asesoramiento personalizado y el cuidado de cada detalle estético y gastronómico.
            </p>

            {/* Steps explanation */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Configura los detalles</p>
                  <p className="text-xs text-muted-foreground">Selecciona el tipo de dulce, porciones estimadas, sabor y la fecha de tu evento.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Pulsa «Enviar pedido por WhatsApp»</p>
                  <p className="text-xs text-muted-foreground">Se abrirá tu aplicación de WhatsApp con un mensaje estructurado y listo para enviar al obrador.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Confirmación en el chat</p>
                  <p className="text-xs text-muted-foreground">Te confirmamos la reserva de fecha y el presupuesto final cerrado en menos de 24 horas.</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Box */}
            <div className="mt-10 p-6 rounded-2xl border border-border bg-muted/30">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                ¿Prefieres hablar directamente?
              </p>
              <p className="text-sm text-foreground mb-4">
                Si no tienes claros los detalles o quieres asesoramiento desde cero:
              </p>
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className={`${btnGhost} w-full text-center flex items-center justify-center gap-2`}
              >
                <MessageCircle className="w-4 h-4 text-[#DA914C]" />
                <span>Abrir chat directo en WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Form OR Sent Confirmation Screen */}
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent-confirmation"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col justify-center rounded-2xl border border-[#F2D3D3] bg-background p-8 md:p-12 shadow-sm space-y-6"
              >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F9E2DF] text-[#DD1D4A] flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-display font-semibold">
                    ¡Tu pedido está listo en WhatsApp!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hemos preparado el mensaje estructurado con todos tus datos.
                  </p>
                </div>
              </div>

              {lastOrder && (
                <div className="rounded-xl border border-border/80 bg-muted/20 p-5 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <span className="font-semibold text-foreground text-sm">Resumen para el obrador:</span>
                    <span className="text-[11px] font-mono text-[#DD1D4A] font-semibold bg-[#F9E2DF] px-2 py-0.5 rounded">
                      WhatsApp Oficial
                    </span>
                  </div>
                  <p><strong className="text-foreground">Cliente:</strong> {lastOrder.nombre} ({lastOrder.contacto})</p>
                  <p><strong className="text-foreground">Dulce:</strong> {lastOrder.tipo}</p>
                  {lastOrder.tamano && <p><strong className="text-foreground">Porciones / Tamaño:</strong> {lastOrder.tamano}</p>}
                  {lastOrder.sabor && <p><strong className="text-foreground">Sabor:</strong> {lastOrder.sabor}</p>}
                  <p><strong className="text-foreground">Fecha del evento:</strong> {lastOrder.fecha}</p>
                  {lastOrder.presupuesto && <p><strong className="text-foreground">Presupuesto aproximado:</strong> {lastOrder.presupuesto}</p>}
                  {lastOrder.notas && <p><strong className="text-foreground">Notas:</strong> {lastOrder.notas}</p>}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground">
                  Si tu aplicación de WhatsApp no se abrió automáticamente, pulsa el botón a continuación:
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(generatedMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`${btnPrimary} flex-1 text-center flex items-center justify-center gap-2`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir WhatsApp con mi pedido</span>
                  </a>

                  <button
                    onClick={handleCopyMessage}
                    className="px-5 py-3 rounded-full border border-border text-xs font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-[#DD1D4A]" />
                        <span className="text-[#DD1D4A]">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-muted-foreground" />
                        <span>Copiar mensaje</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60">
                <button
                  onClick={() => {
                    setSent(false);
                    setLastOrder(null);
                    setGeneratedMessage("");
                  }}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Configurar otro pedido</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="order-form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              ref={formRef}
              onSubmit={onSubmit}
              noValidate
              className="grid gap-5 sm:grid-cols-2"
            >
              <L name="nombre" label="Nombre completo">
                <input name="nombre" className={field} maxLength={100} placeholder="Ej. Carmen Navarro" />
              </L>
              <L name="contacto" label="Teléfono (o email)">
                <input name="contacto" className={field} maxLength={255} placeholder="Ej. 612 345 678" />
              </L>
              <L name="tipo" label="Tipo de dulce">
                <select
                  name="tipo"
                  className={field}
                  value={tipoVal}
                  onChange={(e) => setTipoVal(e.target.value)}
                >
                  <option value="" disabled>
                    Selecciona una categoría…
                  </option>
                  <option value="Pastel">Pastel artesanal / Tarta de pisos</option>
                  <option value="Cupcakes">Cupcakes gourmet (por docenas)</option>
                  <option value="Tarta">Tarta clásica de temporada</option>
                  <option value="Dulces">Mesa dulce / Petit fours / Macarons</option>
                  <option value="Otro">Otro encargo personalizado</option>
                </select>
              </L>
              <L name="tamano" label="Tamaño / Nº de personas">
                <input
                  name="tamano"
                  placeholder="Ej. 15-20 personas / 2 pisos"
                  className={field}
                  maxLength={100}
                />
              </L>
              <L name="sabor" label="Sabor o combinación deseada">
                <input
                  name="sabor"
                  placeholder="Ej. Pistacho, chocolate belga, vainilla & frambuesa..."
                  className={field}
                  maxLength={100}
                />
              </L>
              <L name="fecha" label="Fecha del evento">
                <input type="date" name="fecha" className={field} />
              </L>
              <div className="sm:col-span-2">
                <L name="presupuesto" label="Presupuesto orientativo (opcional)">
                  <input name="presupuesto" placeholder="Ej. 70€ - 120€" className={field} maxLength={50} />
                </L>
              </div>
              <div className="sm:col-span-2">
                <L name="notas" label="Notas, temática, flores o referencia a Reels">
                  <textarea
                    name="notas"
                    rows={4}
                    className={field}
                    maxLength={1000}
                    value={notasVal}
                    onChange={(e) => setNotasVal(e.target.value)}
                    placeholder="Cuéntanos detalles de la celebración, estilo visual, flores deseadas, si viste algún Reel que te encantó..."
                  />
                </L>
              </div>

              {/* Botón principal de envío a WhatsApp */}
              <div className="sm:col-span-2 space-y-2 pt-2">
                <button
                  type="submit"
                  className={`${btnPrimary} w-full flex items-center justify-center gap-2 cursor-pointer text-base py-4`}
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Enviar pedido por WhatsApp</span>
                </button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Al pulsar el botón se abrirá WhatsApp con el borrador de tu encargo estructurado.
                </p>
              </div>
            </motion.form>
          )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}

export default function App() {
  const [presetOrder, setPresetOrder] = useState<{ tipo?: string; notas?: string } | null>(null);

  // WhatsApp number configurable, with persistence
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => {
    try {
      return localStorage.getItem("maranathas_wa_number") || DEFAULT_WHATSAPP_NUMBER;
    } catch {
      return DEFAULT_WHATSAPP_NUMBER;
    }
  });

  const handleUpdateWhatsApp = (newNumber: string) => {
    setWhatsappNumber(newNumber);
    try {
      localStorage.setItem("maranathas_wa_number", newNumber);
    } catch {
      // ignore
    }
  };

  const directWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola Maranatha's Cake Shop! Me gustaría consultar disponibilidad para encargar un pastel.",
  )}`;

  const handleSelectCakeFromReel = (cakeType: string, noteText: string) => {
    setPresetOrder({ tipo: cakeType, notas: noteText });
    const el = document.getElementById("pedido");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectProduct = (categoryVal: string) => {
    setPresetOrder({ tipo: categoryVal, notas: `Interesado en encargo de la colección de ${categoryVal}` });
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
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-6 px-6 py-3 md:gap-8 md:px-12">
          <nav className="hidden items-center justify-center gap-8 text-sm md:flex">
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
          <a
            href="#pedido"
            className={`${btnPrimary} px-5 py-2.5 text-xs gap-1.5`}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>Pedido WhatsApp</span>
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
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/95 md:bg-gradient-to-r md:from-background/95 md:via-background/70 md:to-background/40" />
        <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
          <div className="mx-auto w-full max-w-4xl flex flex-col items-center text-center">
            {/* Contenedor del logo con resplandor artesanal sutil */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4 sm:mb-5 relative"
            >
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-[#DA914C]/20 via-[#FBC9D2]/25 to-[#DD1D4A]/10 blur-md" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white/80 backdrop-blur-md border border-white/60 ring-1 ring-[#DA914C]/25 shadow-lg p-2 flex items-center justify-center transition-transform duration-300 hover:scale-105">
                <img
                  src="/assets/aistudio/logo-maranatha_4a455928.svg"
                  alt="Maranatha's Cake Shop - La Pastelería del Cielo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </motion.div>

            {/* Kicker editorial refinado (Anti-AI Slop: sin píldoras genéricas) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-2 mb-3 text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#795762]"
            >
              <span className="text-[#DA914C]">✦</span>
              <span>Obrador Artesanal & Repostería Creativa</span>
              <span className="text-[#DA914C]">✦</span>
            </motion.div>

            {/* Titular de alta presencia estética */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-medium text-[#4A2832] tracking-tight leading-[1.08] max-w-3xl"
              style={{ textWrap: "balance" }}
            >
              Tartas artesanales diseñadas para hacer{" "}
              <span className="italic font-normal text-[#DD1D4A]">inolvidable</span> tu celebración
            </motion.h1>

            {/* Descripción persuasiva y concisa */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base md:text-lg text-[#795762] leading-relaxed font-normal"
              style={{ textWrap: "pretty" }}
            >
              Ingredientes puros, diseño personalizado y horneado artesanal a mano. Cuéntanos tu idea y coordinamos cada detalle directamente por WhatsApp para una atención cercana y sin esperas.
            </motion.p>

            {/* CTAs de Alta Conversión */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md"
            >
              <a
                href="#pedido"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#DD1D4A] hover:bg-[#B8173D] text-white px-7 py-3.5 text-sm sm:text-base font-semibold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F24770] focus-visible:ring-offset-2"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
                <span>Pedir por WhatsApp</span>
              </a>

              <a
                href="#productos"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#4A2832]/25 bg-white/70 backdrop-blur-xs hover:bg-white hover:border-[#DD1D4A] hover:text-[#DD1D4A] text-[#4A2832] px-6 py-3.5 text-sm sm:text-base font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 shadow-xs"
              >
                <span>Explorar creaciones</span>
                <span className="text-xs text-[#DA914C]">→</span>
              </a>
            </motion.div>

            {/* Franja de confianza y garantía artesanal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-6 sm:mt-8 pt-4 border-t border-[#4A2832]/10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#795762]"
            >
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#DA914C]" />
                Diseño 100% exclusivo
              </span>
              <span className="hidden sm:inline text-[#DA914C]/40">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DA914C]" />
                Encargos con 48h-72h de antelación
              </span>
              <span className="hidden sm:inline text-[#DA914C]/40">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DD1D4A]" />
                Atención directa sin intermediarios
              </span>
            </motion.div>
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
          {products.map((p, index) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              onClick={() => handleSelectProduct(p.categoryVal)}
              className="group cursor-pointer"
            >
              <div className="overflow-hidden rounded-sm bg-muted shadow-xs transition-shadow duration-300 group-hover:shadow-md">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  width={1008}
                  height={1200}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-4 text-2xl md:text-3xl font-display">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[#F24770] hover:text-[#DD1D4A] underline-offset-4 group-hover:underline">
                <MessageCircle className="w-3 h-3 text-[#DA914C]" />
                Pedir por WhatsApp →
              </span>
            </motion.div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Precios y sabores disponibles por confirmar según temporada en el chat de WhatsApp.
        </p>
      </Section>

      {/* Ocasiones */}
      <motion.section
        id="ocasiones"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card px-6 py-20 md:px-12 md:py-28"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <img
              src={occasions}
              alt="Pastel de bodas con flores prensadas y pastel de cumpleaños"
              loading="lazy"
              width={1008}
              height={1200}
              className="aspect-[4/5] w-full rounded-sm object-cover shadow-xs"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
          >
            <p className="eyebrow">Colecciones</p>
            <h2 className="mt-3 text-4xl leading-tight md:text-6xl font-display">
              Para cada ocasión especial
            </h2>
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {[
                ["Cumpleaños", "Pasteles con personalidad, para todas las edades."],
                ["Bodas", "Diseños a medida para el día más esperado."],
                ["Bautizos y comuniones", "Detalles delicados y elegantes."],
                ["Eventos y empresas", "Mesas de postres y pedidos por volumen."],
              ].map(([t, d], i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.08 }}
                  className="flex items-baseline justify-between gap-6 py-5 transition-colors hover:bg-muted/30 px-2 rounded-sm"
                >
                  <span className="font-display text-2xl md:text-3xl">{t}</span>
                  <span className="max-w-[14rem] text-right text-sm text-muted-foreground">
                    {d}
                  </span>
                </motion.li>
              ))}
            </ul>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#pedido"
              className={`${btnPrimary} mt-10 inline-flex items-center gap-2`}
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Diseñar y pedir por WhatsApp</span>
            </motion.a>
          </motion.div>
        </div>
      </motion.section>

      {/* Galería */}
      <Section eyebrow="Galería" title="Creaciones personalizadas">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            src={hero}
            alt="Pastel con rosas"
            loading="lazy"
            className="col-span-2 row-span-2 h-full w-full rounded-sm object-cover shadow-xs"
          />
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
            src={cupcakes}
            alt="Cupcakes"
            loading="lazy"
            className="aspect-square w-full rounded-sm object-cover shadow-xs"
          />
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            whileHover={{ scale: 1.03 }}
            src={tarts}
            alt="Tarta de frutos rojos"
            loading="lazy"
            className="aspect-square w-full rounded-sm object-cover shadow-xs"
          />
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            src={occasions}
            alt="Pastel de bodas"
            loading="lazy"
            className="col-span-2 aspect-[2/1] w-full rounded-sm object-cover shadow-xs"
          />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Fotografías de referencia del obrador y encargos recientes. Puedes enviarnos cualquier imagen de referencia en WhatsApp.
        </p>
      </Section>

      {/* Historia */}
      <motion.section
        id="historia"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
              ["Atención cercana por WhatsApp", "Te acompañamos desde el primer mensaje hasta la entrega."],
            ].map(([t, d], i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
                className="border-t border-primary-foreground/25 pt-5"
              >
                <h3 className="text-2xl font-display">{t}</h3>
                <p className="mt-2 text-sm text-primary-foreground/70">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Proceso */}
      <Section eyebrow="Cómo pedir" title="Tu pastel en cuatro pasos vía WhatsApp">
        <ol className="grid gap-10 md:grid-cols-4">
          {[
            ["Cuéntanos tu idea", "Completa el configurador o escríbenos directamente a WhatsApp."],
            ["Diseñamos juntos", "En el chat afinamos sabor, porciones, alergias y decoración con fotos de inspiración."],
            ["Confirmamos", "Te enviamos el presupuesto cerrado y reservamos la fecha."],
            ["A disfrutar", "Recogida en el obrador o entrega climatizada según lo acordado."],
          ].map(([t, d], i) => (
            <motion.li
              key={t}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="p-3 rounded-xl transition-colors hover:bg-card/50"
            >
              <span className="font-display text-6xl italic text-[#DA914C]">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-2xl font-display">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </motion.li>
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
                "¿Por qué los pedidos se realizan solo por WhatsApp?",
                "Porque cada tarta es un proyecto artesanal único. En WhatsApp podemos ver tus fotos de inspiración, aclarar restricciones de alergias, confirmar la disponibilidad exacta en el calendario del obrador y ofrecerte presupuesto exacto sin errores.",
              ],
              [
                "¿Con cuánta anticipación debo hacer mi pedido?",
                "Recomendamos contactarnos por WhatsApp con 7 a 15 días de antelación para pasteles personalizados y con 1 mes para bodas o mesas dulces grandes.",
              ],
              [
                "¿Cómo se confirma y se paga un encargo?",
                "Una vez acordado el diseño y fecha en WhatsApp, se formaliza la reserva mediante Bizum o transferencia del 50%. El 50% restante se abona el día de la recogida o entrega.",
              ],
              [
                "¿Puedo recoger mi pedido o hacéis entregas a domicilio?",
                "Ambas opciones: disponemos de recogida con cita concertada en el obrador y de transporte refrigerado para piezas de boda o eventos.",
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

      {/* Formulario Pedido Exclusivo por WhatsApp */}
      <OrderForm
        whatsappNumber={whatsappNumber}
        presetOrder={presetOrder}
        onUpdateWhatsAppNumber={handleUpdateWhatsApp}
      />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-border px-6 py-14 pb-28 md:px-12 md:pb-14"
      >
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/logo-maranatha_4a455928.svg"
                alt="Maranatha's Cake Shop"
                className="w-12 h-12 rounded-full object-contain border border-[#DA914C]/30 shadow-xs"
              />
              <div>
                <p className="font-display text-2xl italic leading-none">Maranatha's</p>
                <p className="text-xs text-muted-foreground mt-0.5">Artisanal Cake Shop & Atelier</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#4A2832] font-semibold">
              <MessageCircle className="w-4 h-4 text-[#DA914C] fill-current" />
              <span>Pedidos oficiales: +{whatsappNumber}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="eyebrow">Contacto & Obrador</p>
            <p>Calle del Obrador 12, Ciudad</p>
            <p>Atención directa por WhatsApp</p>
            <p>Martes a Sábado: 09:30 – 19:30</p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="eyebrow">Canales</p>
            <p>
              <a href={directWhatsAppUrl} target="_blank" rel="noreferrer" className="text-[#F24770] hover:text-[#DD1D4A] underline">
                Escribir al WhatsApp del obrador
              </a>
            </p>
            <p>@maranathas.cakes en Instagram</p>
            <p>Comparte tus fotos con #MaranathasMoments</p>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} Maranatha's Cake Shop. Todos los pedidos y reservas se formalizan exclusivamente a través de WhatsApp.
        </p>
      </motion.footer>

      {/* Menú Pulgar-First para Dispositivos Móviles */}
      <ThumbNav onOpenOrder={handleOpenOrder} whatsappUrl={directWhatsAppUrl} />
    </div>
  );
}
