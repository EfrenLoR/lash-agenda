import React from 'react';
import ModernScheduler from './components/BookingForm';
import Lashes from './pages/Lashes';
import Eyebrows from './pages/Eyebrows';
import MainLayout from './layouts/MainLayout';


function App() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-[#FFFBF8] font-sans text-gray-800">
        {/* HERO SECTION (La parte de hasta arriba) */}
        <section className="relative pt-10 pb-20 px-6 md:px-20 overflow-hidden flex flex-col md:flex-row items-center">
          {/* Gradiente de fondo al estilo de la foto */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#E2EFE7] via-[#FFFBF8] to-[#FDE4D9] -z-10"></div>

          <div className="w-full md:w-1/2 pr-0 md:pr-10 z-10">
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6 text-gray-900">
              Realza tu <br />Mirada, <br />Descubre tu <br />Belleza.
            </h1>
            <p className="text-gray-500 mb-8 max-w-md leading-relaxed text-sm md:text-base">
              Diseño de pestañas profesional adaptado a la forma de tu ojo. Utilizamos fibras de la más alta calidad para un resultado natural y duradero.
            </p>
            <a href="#reserva" className="inline-block bg-[#F0A891] text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-[#F0A891]/30 hover:-translate-y-1 transition-transform">
              Reserva Ahora
            </a>
          </div>

          {/* Imagen representativa (Placeholder estilo retrato) */}
          <div className="w-full md:w-1/2 mt-12 md:mt-0 relative">
            <div className="aspect-[4/5] bg-white rounded-t-full rounded-b-full overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#F0A891]/20 to-transparent"></div>
              <img src="images/1.png" alt="Lash Extensions" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        <Lashes />
        <Eyebrows />

        {/* SECCIÓN DEL CALENDARIO (El que construiste) */}
        <section id="reserva" className="py-10 px-6 md:px-20 bg-[#FFFBF8]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gray-900">Agenda tu Cita</h2>
            <p className="text-gray-500 mt-4 max-w-md mx-auto text-sm">Selecciona el día y la hora que mejor se adapte a tu rutina. Te enviaremos una confirmación por WhatsApp.</p>
          </div>

          {/* Aquí insertamos el componente que hicimos en el paso anterior */}
          <ModernScheduler />
        </section>

      </div>
    </MainLayout>
  );
}

export default App;