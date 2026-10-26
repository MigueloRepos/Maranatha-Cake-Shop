import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Bookmark,
} from "lucide-react";

import reelWedding from "@/assets/images/ugc_reel_wedding_slice_1793027329650.jpg";
import reelReveal from "@/assets/images/ugc_reel_cake_reveal_1793027331054.jpg";
import reelBirthday from "@/assets/images/ugc_reel_birthday_cheer_1793027331576.jpg";
import reelUnboxing from "@/assets/images/ugc_reel_pastry_box_1793027331327.jpg";

export interface ReelData {
  id: string;
  category: "Bodas" | "Cumpleaños" | "Texturas" | "Unboxing";
  videoImg: string;
  userHandle: string;
  authorName: string;
  location: string;
  review: string;
  cakeType: string;
  cakeSpecs: string;
  views: string;
  initialLikes: number;
  soundTrack: string;
  durationSeconds: number;
}

const REELS: ReelData[] = [
  {
    id: "boda-sofia-marcos",
    category: "Bodas",
    videoImg: reelWedding,
    userHandle: "@sofia.y.marcos",
    authorName: "Sofía & Marcos",
    location: "Finca El Olivar · Boda campestre",
    review:
      "El corte fue el momento más emocionante de la noche. El bizcocho de tres pisos con flor de saúco y crema de vainilla estaba ultra esponjoso y todos los invitados repitieron.",
    cakeType: "Pastel",
    cakeSpecs: "Tres pisos · Vainilla bourbon & flor de saúco · Cobertura semi-naked con peonías",
    views: "18.4K",
    initialLikes: 942,
    soundTrack: "Sonido original · Maranatha's Acoustic Waltz",
    durationSeconds: 12,
  },
  {
    id: "degustacion-pistacho",
    category: "Texturas",
    videoImg: reelReveal,
    userHandle: "@carlos.foodie",
    authorName: "Carlos Méndez",
    location: "Degustación en obrador",
    review:
      "Ese relleno de crema de pistacho tostado de Bronte y compota de frambuesas silvestres... literalmente una obra de arte. La textura al cortar es perfecta, húmeda y suave.",
    cakeType: "Pastel",
    cakeSpecs: "Bizcocho de pistacho · Crema de vainilla & frambuesas frescas · Crujiente artesanal",
    views: "29.1K",
    initialLikes: 1820,
    soundTrack: "ASMR Bakery Cut · Audio ambiente",
    durationSeconds: 10,
  },
  {
    id: "cumpleanos-sarah",
    category: "Cumpleaños",
    videoImg: reelBirthday,
    userHandle: "@sarah.martinez",
    authorName: "Sarah M.",
    location: "Cena 30 cumpleaños · Sala privada",
    review:
      "La tarta de chocolate drip personalizada fue la estrella absoluta de mis 30. ¡No quedó ni una sola migaja! El aroma al encender las velas fue inolvidable.",
    cakeType: "Pastel",
    cakeSpecs: "Chocolate belga 70% · Drip ganache · Frutas del bosque & pan de oro",
    views: "15.7K",
    initialLikes: 764,
    soundTrack: "Happy Celebration · Maranatha Sounds",
    durationSeconds: 14,
  },
  {
    id: "unboxing-cupcakes-tarts",
    category: "Unboxing",
    videoImg: reelUnboxing,
    userHandle: "@clara.lifestyle",
    authorName: "Clara G.",
    location: "Desayuno brunch especial",
    review:
      "El packaging es una delicia y la caja llegó impecable. Abrir el lazo de raso y ver esos cupcakes artesanos con macarons y tartaletas de fruta fresca es pura felicidad.",
    cakeType: "Cupcakes",
    cakeSpecs: "Caja degustación · 6 Cupcakes gourmet · 2 Tartaletas de cítricos y frutos rojos",
    views: "12.3K",
    initialLikes: 615,
    soundTrack: "Morning Coffee & Pastry · Acoustic Studio",
    durationSeconds: 11,
  },
];

const CATEGORIES = ["Todos", "Bodas", "Cumpleaños", "Texturas", "Unboxing"] as const;

interface SocialProofReelsProps {
  onSelectCakeType?: (cakeType: string, noteText: string) => void;
}

export function SocialProofReels({ onSelectCakeType }: SocialProofReelsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<string>(REELS[0].id);
  const [isMuted, setIsMuted] = useState(true);
  const [likesMap, setLikesMap] = useState<Record<string, { count: number; liked: boolean }>>(() => {
    const initial: Record<string, { count: number; liked: boolean }> = {};
    REELS.forEach((r) => {
      initial[r.id] = { count: r.initialLikes, liked: false };
    });
    return initial;
  });
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Audio Context for realistic ambient sound when unmuted
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorIntervalRef = useRef<number | null>(null);

  // Progress simulation for playing reel
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!playingId) return;

    const currentReel = REELS.find((r) => r.id === playingId);
    const duration = (currentReel?.durationSeconds || 12) * 1000;
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgressMap((prev) => {
        const curr = prev[playingId] || 0;
        if (curr >= 100) {
          return { ...prev, [playingId]: 0 };
        }
        return { ...prev, [playingId]: curr + step };
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [playingId]);

  // Audio synthesize on unmute
  useEffect(() => {
    if (!isMuted && playingId) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }

        const notes = [261.63, 329.63, 392.0, 523.25, 440.0, 349.23];
        let noteIndex = 0;

        const playHarmonic = () => {
          if (!audioCtxRef.current || isMuted) return;
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(notes[noteIndex % notes.length], audioCtxRef.current.currentTime);
          noteIndex++;

          gain.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.04, audioCtxRef.current.currentTime + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 1.2);

          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.start();
          osc.stop(audioCtxRef.current.currentTime + 1.3);
        };

        playHarmonic();
        oscillatorIntervalRef.current = window.setInterval(playHarmonic, 1400);
      } catch {
        // graceful fallback if browser blocks audio
      }
    } else {
      if (oscillatorIntervalRef.current) {
        clearInterval(oscillatorIntervalRef.current);
        oscillatorIntervalRef.current = null;
      }
    }

    return () => {
      if (oscillatorIntervalRef.current) {
        clearInterval(oscillatorIntervalRef.current);
        oscillatorIntervalRef.current = null;
      }
    };
  }, [isMuted, playingId]);

  const filteredReels =
    selectedCategory === "Todos"
      ? REELS
      : REELS.filter((r) => r.category === selectedCategory);

  const handleToggleLike = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLikesMap((prev) => {
      const current = prev[id] || { count: 0, liked: false };
      return {
        ...prev,
        [id]: {
          count: current.liked ? current.count - 1 : current.count + 1,
          liked: !current.liked,
        },
      };
    });
  };

  const handleToggleSave = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleShare = async (reel: ReelData, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Maranatha's Cake Shop — ${reel.authorName}`,
          text: reel.review,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // Ignore clipboard restrictions in cross-origin iframes
    }
    setShareFeedback("Enlace copiado al portapapeles");
    setTimeout(() => setShareFeedback(null), 2500);
  };

  const openFullscreenModal = (index: number) => {
    setActiveReelIndex(index);
    setPlayingId(filteredReels[index].id);
  };

  const closeFullscreenModal = () => {
    setActiveReelIndex(null);
  };

  const nextReel = () => {
    if (activeReelIndex === null) return;
    const nextIdx = (activeReelIndex + 1) % filteredReels.length;
    setActiveReelIndex(nextIdx);
    setPlayingId(filteredReels[nextIdx].id);
  };

  const prevReel = () => {
    if (activeReelIndex === null) return;
    const prevIdx = (activeReelIndex - 1 + filteredReels.length) % filteredReels.length;
    setActiveReelIndex(prevIdx);
    setPlayingId(filteredReels[prevIdx].id);
  };

  // Keyboard navigation for full modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeReelIndex === null) return;
      if (e.key === "Escape") closeFullscreenModal();
      if (e.key === "ArrowRight") nextReel();
      if (e.key === "ArrowLeft") prevReel();
      if (e.key === " ") {
        e.preventDefault();
        setPlayingId((curr) => (curr ? "" : filteredReels[activeReelIndex].id));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeReelIndex, filteredReels]);

  const activeReel = activeReelIndex !== null ? filteredReels[activeReelIndex] : null;

  return (
    <motion.section
      id="reels"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="bg-muted/70 px-6 py-20 md:px-12 md:py-28 relative"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">Social Proof 2.0</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs font-semibold text-secondary-foreground flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#DA914C]" />
                UGC en Directo
              </span>
            </div>
            <h2 className="mt-3 text-4xl leading-tight md:text-6xl font-display">
              Así se viven nuestros pasteles.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground text-sm md:text-base">
              Micro-momentos reales compartidos por nuestros clientes: el primer corte, el
              unboxing con los nervios del primer vistazo y celebraciones que nunca se olvidan.
            </p>
          </div>

          {/* Audio toggle hint */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="self-start md:self-end flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/80 text-xs font-medium text-foreground hover:bg-card transition-colors shadow-xs"
            aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-muted-foreground" />
                <span>Audio silenciado · Tocar para escuchar</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#DA914C] animate-pulse" />
                <span className="text-primary font-semibold">Audio ambiente activo</span>
              </>
            )}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#DD1D4A] text-white shadow-xs"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border/80"
                }`}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>

        {shareFeedback && (
          <div className="mt-4 p-3 rounded bg-primary text-primary-foreground text-xs text-center fade-up">
            {shareFeedback}
          </div>
        )}

        {/* Reels Showcase Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredReels.map((reel, index) => {
            const isPlaying = playingId === reel.id;
            const progress = progressMap[reel.id] || 0;
            const likeData = likesMap[reel.id] || { count: reel.initialLikes, liked: false };
            const isSaved = !!savedMap[reel.id];

            return (
              <motion.div
                key={reel.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                onClick={() => openFullscreenModal(index)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-card border border-border/80 shadow-sm transition-shadow duration-300 hover:shadow-xl flex flex-col"
              >
                {/* 9:16 Vertical Video Frame */}
                <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
                  <img
                    src={reel.videoImg}
                    alt={reel.authorName}
                    loading="lazy"
                    className={`h-full w-full object-cover transition-transform duration-700 ${
                      isPlaying ? "scale-105" : "group-hover:scale-102"
                    }`}
                  />

                  {/* Gradient Scrim for media contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 pointer-events-none" />

                  {/* Top Bar: Category & Views */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between text-white/90 text-xs">
                    <span className="font-semibold tracking-wide text-[11px] uppercase bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      {reel.category}
                    </span>
                    <span className="text-[11px] bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full text-white/80">
                      {reel.views}
                    </span>
                  </div>

                  {/* Top Progress Bar */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-[#DA914C] transition-all duration-100 ease-linear"
                      style={{ width: `${isPlaying ? progress : 0}%` }}
                    />
                  </div>

                  {/* Quick Control Center / Play Pause Trigger */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlayingId(isPlaying ? "" : reel.id);
                      }}
                      className="p-3.5 rounded-full bg-black/60 text-white backdrop-blur-md hover:scale-110 transition-transform cursor-pointer"
                      aria-label={isPlaying ? "Pausar reel" : "Reproducir reel"}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white translate-x-0.5" />}
                    </button>
                  </div>

                  {/* Right Action Rail (like, share, expand) */}
                  <div className="absolute right-2.5 bottom-24 flex flex-col items-center gap-3 z-10">
                    <button
                      onClick={(e) => handleToggleLike(reel.id, e)}
                      className="flex flex-col items-center text-white p-1 hover:scale-115 transition-transform"
                      aria-label="Dar me gusta"
                    >
                      <div
                        className={`p-2 rounded-full backdrop-blur-md ${
                          likeData.liked ? "bg-[#DD1D4A] text-white" : "bg-black/50 text-white"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likeData.liked ? "fill-white" : ""}`} />
                      </div>
                      <span className="text-[10px] font-medium mt-1 text-white shadow-xs">
                        {likeData.count}
                      </span>
                    </button>

                    <button
                      onClick={(e) => handleToggleSave(reel.id, e)}
                      className="flex flex-col items-center text-white p-1 hover:scale-115 transition-transform"
                      aria-label="Guardar reel"
                    >
                      <div
                        className={`p-2 rounded-full backdrop-blur-md ${
                          isSaved ? "bg-[#FBC9D2] text-[#4A2832]" : "bg-black/50 text-white"
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                      </div>
                    </button>

                    <button
                      onClick={(e) => handleShare(reel, e)}
                      className="flex flex-col items-center text-white p-1 hover:scale-115 transition-transform"
                      aria-label="Compartir"
                    >
                      <div className="p-2 rounded-full bg-black/50 text-white backdrop-blur-md">
                        <Share2 className="w-4 h-4" />
                      </div>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFullscreenModal(index);
                      }}
                      className="p-2 rounded-full bg-black/50 text-white backdrop-blur-md hover:scale-110 transition-transform"
                      aria-label="Ver pantalla completa"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Metadata & Review Quote Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-4 text-white z-10 pointer-events-none">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#FBC9D2] flex items-center justify-center text-[10px] font-bold text-[#4A2832]">
                        {reel.authorName.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold">{reel.authorName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#DA914C] fill-[#DA914C]/20" />
                    </div>

                    <p className="text-[11px] text-white/70 line-clamp-1">{reel.location}</p>

                    <p className="mt-2 text-xs italic text-white/95 line-clamp-3 leading-snug font-serif">
                      “{reel.review}”
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#F0C488] font-medium pt-2 border-t border-white/15">
                      <span>{reel.cakeSpecs.split("·")[0]}</span>
                      <span className="underline underline-offset-2 flex items-center gap-0.5">
                        Ver reel <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 rounded-xl border border-border bg-card/60 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="text-sm font-semibold text-foreground">
              ¿Quieres que tu tarta aparezca en nuestros Reels?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Etiquétanos en Instagram con <span className="font-semibold text-[#F24770]">#MaranathasCakes</span> al cortar tu tarta.
            </p>
          </div>
          <a
            href="#pedido"
            className="inline-flex items-center gap-2 text-xs font-semibold bg-[#DD1D4A] hover:bg-[#B8173D] text-white px-5 py-2.5 rounded-full transition-colors"
          >
            Encargar mi diseño ahora
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Fullscreen Reel Viewer Modal with AnimatePresence */}
      <AnimatePresence>
        {activeReel && activeReelIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-6"
            onClick={closeFullscreenModal}
          >
            {/* Close button */}
            <button
              onClick={closeFullscreenModal}
              className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              aria-label="Cerrar reproductor"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev / Next buttons for desktop */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevReel();
              }}
              className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-all"
              aria-label="Reel anterior"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextReel();
              }}
              className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-all"
              aria-label="Reel siguiente"
            >
              <ChevronRight className="w-7 h-7" />
            </button>

            {/* Reel Container (9:16) */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="relative w-full max-w-[420px] aspect-[9/16] max-h-[92vh] rounded-2xl overflow-hidden bg-black shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Top progress bar */}
            <div className="absolute top-2 inset-x-3 z-30 flex gap-1">
              {filteredReels.map((r, i) => (
                <div key={r.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{
                      width:
                        i < activeReelIndex
                          ? "100%"
                          : i === activeReelIndex
                          ? `${progressMap[r.id] || 0}%`
                          : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Top Reel Bar */}
            <div className="relative z-20 flex items-center justify-between p-4 pt-6 text-white text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FBC9D2] text-[#4A2832] flex items-center justify-center font-bold text-xs">
                  {activeReel.authorName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1 font-semibold">
                    <span>{activeReel.authorName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#DA914C]" />
                  </div>
                  <span className="text-[11px] text-white/70">{activeReel.userHandle}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                  aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#DA914C]" />}
                </button>
              </div>
            </div>

            {/* Background Media */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => {
                setPlayingId((curr) => (curr ? "" : activeReel.id));
              }}
            >
              <img
                src={activeReel.videoImg}
                alt={activeReel.authorName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40" />

              {/* Center Play indicator if paused */}
              {playingId !== activeReel.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-md scale-110">
                    <Play className="w-8 h-8 fill-white translate-x-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Right Interactive Sidebar */}
            <div className="absolute right-3 bottom-28 z-30 flex flex-col items-center gap-4">
              <button
                onClick={() => handleToggleLike(activeReel.id)}
                className="flex flex-col items-center text-white"
              >
                <div
                  className={`p-2.5 rounded-full backdrop-blur-md transition-transform ${
                    likesMap[activeReel.id]?.liked ? "bg-[#DD1D4A] text-white scale-110" : "bg-black/50 text-white"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${likesMap[activeReel.id]?.liked ? "fill-white" : ""}`} />
                </div>
                <span className="text-[11px] font-semibold mt-1">
                  {likesMap[activeReel.id]?.count || activeReel.initialLikes}
                </span>
              </button>

              <button
                onClick={() => handleToggleSave(activeReel.id)}
                className="flex flex-col items-center text-white"
              >
                <div
                  className={`p-2.5 rounded-full backdrop-blur-md ${
                    savedMap[activeReel.id] ? "bg-[#FBC9D2] text-[#4A2832]" : "bg-black/50 text-white"
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${savedMap[activeReel.id] ? "fill-current" : ""}`} />
                </div>
                <span className="text-[11px] font-semibold mt-1">Guardar</span>
              </button>

              <button
                onClick={() => handleShare(activeReel)}
                className="flex flex-col items-center text-white"
              >
                <div className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold mt-1">Enviar</span>
              </button>
            </div>

            {/* Bottom Caption & CTA */}
            <div className="relative z-30 p-5 text-white">
              <p className="text-xs text-[#F0C488] font-medium tracking-wide">
                📍 {activeReel.location}
              </p>

              <blockquote className="mt-2 text-sm italic font-serif leading-relaxed text-white/95">
                “{activeReel.review}”
              </blockquote>

              <p className="mt-2.5 text-xs text-white/80 bg-white/10 backdrop-blur-md p-2.5 rounded-lg border border-white/10">
                🍰 <strong className="text-white">Detalles:</strong> {activeReel.cakeSpecs}
              </p>

              {/* Order this design button */}
              <div className="mt-4 flex gap-2">
                <a
                  href="#pedido"
                  onClick={() => {
                    closeFullscreenModal();
                    onSelectCakeType?.(activeReel.cakeType, `Inspirado en el reel de ${activeReel.authorName} (${activeReel.cakeSpecs})`);
                  }}
                  className="flex-1 py-3 px-4 rounded-full bg-[#DD1D4A] text-white hover:bg-[#B8173D] text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F0C488]" />
                  Pedir un diseño como este
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.section>
  );
}
