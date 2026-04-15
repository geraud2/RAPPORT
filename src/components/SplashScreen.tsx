import { useState, useEffect, useRef } from "react";
import { ShoppingBag, TrendingUp, Package, Sparkles, Zap, Star, ArrowRight, Gem, Leaf } from "lucide-react";

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [currentIcon, setCurrentIcon] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const icons = [ShoppingBag, TrendingUp, Package, Sparkles, Zap, Star, Gem, Leaf];
  const IconComponent = icons[currentIcon % icons.length];

  // Progression
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(onDone, 800);
          return 100;
        }
        return prev + 1.5;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [onDone]);

  // Rotation des icônes
  useEffect(() => {
    const iconInterval = setInterval(() => {
      setCurrentIcon(prev => prev + 1);
    }, 300);
    return () => clearInterval(iconInterval);
  }, []);

  // Effet de particules avec Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; size: number; speedX: number; speedY: number; color: string }[] = [];
    
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: `rgba(255, 255, 255, ${Math.random() * 0.3})`,
      });
    }

    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Effet de suivi de souris
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(ellipse at 50% 50%, #0f0c29, #302b63, #24243e)",
      }}
    >
      {/* Canvas pour les particules */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Effet de suivi de souris */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none transition-transform duration-300"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0) 70%)",
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
        }}
      />

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo avec effets */}
        <div className="relative mb-8 group">
          {/* Effet de halo */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Cercles concentriques */}
          <div className="absolute inset-0 rounded-full border border-white/20 animate-ping-slow" />
          <div className="absolute inset-4 rounded-full border border-white/10 animate-spin-slow" />
          
          {/* Logo principal */}
          <div className="relative w-28 h-28 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
            <IconComponent className="w-14 h-14 text-white animate-float" />
          </div>
        </div>

        {/* Titre avec effet de brillance */}
        <div className="text-center mb-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
              Daily Sales
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-blue-200/80">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-light tracking-wider">GESTION INTELLIGENTE</span>
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Description avec effet de frappe */}
        <p className="text-blue-100/70 text-center mb-10 max-w-md text-lg font-light">
          La solution complète pour vos rapports de ventes quotidiens
        </p>

        {/* Barre de progression stylisée */}
        <div className="w-72 md:w-96 relative mb-6">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-200 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer" />
            </div>
          </div>
          
          {/* Pourcentage avec animation */}
          <div className="absolute -top-6 right-0 text-xs font-mono text-white/50">
            {Math.floor(progress)}%
          </div>
        </div>

        {/* Points de chargement */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/40 transition-all duration-300"
              style={{
                opacity: progress > 30 + i * 30 ? 1 : 0.3,
                transform: progress > 30 + i * 30 ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Badge de version */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="bg-white/5 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Gem className="w-3 h-3" />
              <span>Version 3.0.0</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Icônes flottantes décoratives */}
        <div className="absolute top-1/4 left-[10%] animate-float-delay-1 opacity-30">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div className="absolute bottom-1/3 right-[15%] animate-float-delay-2 opacity-30">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="absolute top-2/3 left-[20%] animate-float-delay-3 opacity-20">
          <Star className="w-4 h-4 text-white" />
        </div>
        <div className="absolute top-1/2 right-[10%] animate-float-delay-4 opacity-25">
          <Zap className="w-5 h-5 text-white" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes float-delay-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float-delay-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        
        @keyframes float-delay-3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        
        @keyframes float-delay-4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(0.9); opacity: 0.8; }
          75%, 100% { transform: scale(1.4); opacity: 0; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        
        .animate-float-delay-1 {
          animation: float-delay-1 4s ease-in-out infinite;
        }
        
        .animate-float-delay-2 {
          animation: float-delay-2 3.5s ease-in-out infinite;
        }
        
        .animate-float-delay-3 {
          animation: float-delay-3 2.8s ease-in-out infinite;
        }
        
        .animate-float-delay-4 {
          animation: float-delay-4 3.2s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}