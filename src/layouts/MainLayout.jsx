import React from 'react';

export default function MainLayout({children}) {
    return (
        <>
        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 w-full bg-white/50 backdrop-blur-sm px-6 py-4 border-b border-gray-100 shadow-sm flex justify-between items-center">
        
            {/* 1. Logo / Nombre */}
            <div className="text-xl font-bold font-serif flex items-center gap-2">
                Gaby López <span className="text-sm font-sans text-gray-500 font-normal hidden sm:inline">- Artista de Pestañas</span>
            </div>

            {/* 2. Enlaces Centrales (Ocultos en móvil) */}
            <div className="hidden md:flex gap-8 text-sm font-medium">
                <a href="#" className="hover:text-[#F0A891] transition-colors">Inicio</a>
                <a href="#pestañas" className="hover:text-[#F0A891] transition-colors">Pestañas</a>
                <a href="#cejas" className="hover:text-[#F0A891] transition-colors">Cejas</a>
            </div>

            {/* 3. Botón de Agendar */}
            <a href="#reserva" className="bg-[#F0A891] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-[#e09881] transition-colors">
                Agendar
            </a>
        </nav>

        {/* CONTENIDO PRINCIPAL */}
        <main className="max-w-6xl mx-auto p-6">
            {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-gray-900 text-white py-12 text-center">
            <p className="font-serif text-2xl mb-4">Gaby López - Artista de Pestañas</p>
            <p className="text-gray-400 text-sm">© 2026 Todos los derechos reservados. Desarrollado por Efrén LR.</p>
        </footer>
        </>
    );
}