import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Cake,
  Film,
  Menu,
  X,
  MessageCircle,
  HelpCircle,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";

interface ThumbNavProps {
  onOpenOrder: () => void;
  whatsappUrl: string;
}

export function ThumbNav({ onOpenOrder, whatsappUrl }: ThumbNavProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("inicio");

  const scrollToSection = (id: string, tabName: string) => {
    setActiveTab(tabName);
    setIsDrawerOpen(false);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Fixed Thumb-First Bottom Bar (Strictly capped under 15% mobile viewport height) */}
      <motion.nav
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border/80 bg-background/95 backdrop-blur-md shadow-lg pb-[env(safe-area-inset-bottom)]"
        aria-label="Navegación móvil inferior"
      >
        <div className="grid grid-cols-5 items-center h-16 px-2">
          {/* 1. Inicio */}
          <button
            onClick={() => scrollToSection("top", "inicio")}
            className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === "inicio" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Inicio</span>
          </button>

          {/* 2. Catálogo / Creaciones */}
          <button
            onClick={() => scrollToSection("productos", "catalogo")}
            className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === "catalogo" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cake className="w-5 h-5" />
            <span>Pasteles</span>
          </button>

          {/* 3. Primary Central Thumb Button: PEDIDO WHATSAPP */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => {
                setActiveTab("pedir");
                onOpenOrder();
              }}
              className="min-h-[48px] min-w-[56px] px-3.5 py-1.5 rounded-full bg-[#DD1D4A] text-white shadow-md hover:bg-[#B8173D] active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer -translate-y-1.5 border border-white/20"
              aria-label="Hacer pedido exclusivamente por WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span className="text-[10px] font-bold tracking-tight">Pedir</span>
            </button>
          </div>

          {/* 4. Reels UGC */}
          <button
            onClick={() => scrollToSection("reels", "reels")}
            className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors cursor-pointer relative ${
              activeTab === "reels" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <Film className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#DA914C] ring-2 ring-background" />
            </div>
            <span>Reels</span>
          </button>

          {/* 5. Menú Thumb Drawer */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
              isDrawerOpen ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Abrir menú de opciones rápidas"
            aria-expanded={isDrawerOpen}
          >
            <Menu className="w-5 h-5" />
            <span>Más</span>
          </button>
        </div>
      </motion.nav>

      {/* Thumb-First Bottom Action Drawer with AnimatePresence */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-end md:hidden bg-black/60 backdrop-blur-xs"
            onClick={() => setIsDrawerOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background border-t border-border p-6 shadow-2xl pb-10 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Grab handle for natural thumb ergonomics */}
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto -mt-2 mb-4" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div>
                  <p className="font-display text-2xl italic">Maranatha's</p>
                  <p className="text-xs text-muted-foreground">Pedidos exclusivamente por WhatsApp</p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Direct WhatsApp Callouts */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[52px] p-3 rounded-xl border border-[#F2D3D3] bg-[#F9E2DF] flex items-center gap-3 active:scale-[0.98] transition-transform"
                >
                  <div className="p-2.5 rounded-full bg-[#DD1D4A] text-white">
                    <MessageCircle className="w-5 h-5 fill-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground">Chat directo</p>
                    <p className="text-[10px] text-[#795762] font-medium">WhatsApp</p>
                  </div>
                </a>

                <button
                  onClick={() => scrollToSection("pedido", "pedir")}
                  className="min-h-[52px] p-3 rounded-xl border border-border bg-card flex items-center gap-3 active:scale-[0.98] transition-transform"
                >
                  <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                    <Cake className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">Configurar</p>
                    <p className="text-[10px] text-muted-foreground">Generar mensaje</p>
                  </div>
                </button>
              </div>

              {/* Navigation Links list */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  Explorar secciones
                </p>

                {[
                  { label: "Catálogo de creaciones", id: "productos", icon: Cake, tab: "catalogo" },
                  { label: "Colecciones & Ocasiones", id: "ocasiones", icon: Cake, tab: "ocasiones" },
                  { label: "Social Proof · Reels en directo", id: "reels", icon: Film, tab: "reels" },
                  { label: "Historia del obrador", id: "historia", icon: Clock, tab: "historia" },
                  { label: "Preguntas frecuentes (FAQ)", id: "faq", icon: HelpCircle, tab: "faq" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id, item.tab)}
                      className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-left hover:bg-muted/60 transition-colors active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>

              {/* Information snippet */}
              <div className="rounded-xl border border-border/80 bg-muted/40 p-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <MapPin className="w-4 h-4 text-[#DA914C]" />
                  <span>Obrador artesanal & Recogida con cita previa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Martes a Sábado: 09:30 – 19:30 | Domingo: 10:00 – 14:00</span>
                </div>
                <div className="flex items-center gap-2 text-[#4A2832] font-semibold">
                  <MessageCircle className="w-4 h-4 text-[#DA914C]" />
                  <span>Canal exclusivo de pedidos: WhatsApp directo</span>
                </div>
              </div>

              {/* Bottom Close Action */}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full min-h-[48px] py-3 rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cerrar menú
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
