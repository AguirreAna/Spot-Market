// Página de login: estética oscura con glassmorphism y fondo de mapa urbano animado.
import NavbarAuth from '../components/auth/NavbarAuth.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';
import AnimatedCityMap from '../components/map/AnimatedCityMap.jsx';
import LogoCompleto from '../assets/Logo.svg';

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-57px)] flex items-center justify-center bg-[#050a14] overflow-hidden">
      <AnimatedCityMap />
      <NavbarAuth />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-[#0a1222]/80 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#0B1220] border border-white/15 p-1 shadow-xl flex items-center justify-center">
          <img src={LogoCompleto} alt="Spot Market Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center">Bienvenido a <span className="text-amber-400">Spot Market</span></h1>
        <p className="text-gray-400 text-sm mt-1 mb-6 text-center">Ingresá para valorar, comentar y guardar favoritos.</p>
        <LoginForm />
      </div>
    </div>
  );
}
