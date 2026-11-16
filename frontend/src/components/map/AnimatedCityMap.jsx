// Fondo animado tipo mapa urbano con grilla en paneo, radar central y pines de productos.
import ProductPin from './ProductPin.jsx';
import '../../styles/map-animations.css';

export default function AnimatedCityMap() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050a14]">
      <div className="city-grid absolute inset-[-60px]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="radar-pulse absolute inset-0 m-auto h-24 w-24 rounded-full border border-amber-400/40" />
        <span className="radar-pulse absolute inset-0 m-auto h-24 w-24 rounded-full border border-amber-400/30" style={{ animationDelay: '1.2s' }} />
        <span className="relative block h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
      </div>
      <ProductPin label="Pan" className="left-[12%] top-[22%]" delay={0} />
      <ProductPin label="Leche" className="right-[14%] top-[30%]" delay={0.4} />
      <ProductPin label="Huevos" className="left-[20%] bottom-[28%]" delay={0.8} />
      <ProductPin label="Carne" className="right-[18%] bottom-[22%]" delay={1.1} />
    </div>
  );
}
