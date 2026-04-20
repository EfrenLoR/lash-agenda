import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { getPrecios } from '../services/api'; 

const paletaColores = ["#FCE6DF", "#E2EFE7", "#F8E3D7"];

export default function Eyebrows() {
  const [listaServicios, setListaServicios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      const datosTotales = await getPrecios();
      
      // LA MAGIA DEL FILTRADO: Solo tomamos los que digan "Pestañas" en la Columna E
      const soloPestanas = datosTotales.filter(item => 
        item.categoria && item.categoria.toLowerCase() === 'cejas'
      );
      
      setListaServicios(soloPestanas);
      setIsLoading(false);
    };
    cargarDatos();
  }, []);

  const serviciosDuplicados = [...listaServicios, ...listaServicios, ...listaServicios];

  if (isLoading) {
    return <div className="py-20 text-center text-gray-400 animate-pulse">Cargando estilos de cejas...</div>;
  }

  return (
    <section id="cejas" className="py-10 overflow-hidden">
      
      <div className="text-center mb-16 px-6">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Nuestros Estilos</p>
        <h2 className="text-4xl font-serif font-bold text-gray-900">Que tus cejas enmarquen tu mirada.</h2>
      </div>

      <div className="w-full relative">
        <Swiper
          modules={[Autoplay, FreeMode]}
          freeMode={true}          
          grabCursor={true}        
          loop={true}              
          slidesPerView="auto"      
          spaceBetween={32}         
          speed={10000}
          autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
          className="px-4 py-15 !overflow-visible carrusel-suave"
        >
          {serviciosDuplicados.map((item, index) => {
            const colorFondo = paletaColores[index % paletaColores.length];

            return (
              <SwiperSlide key={index} className="!w-[320px]">
                <div 
                  className="w-full h-[420px] p-8 my-4 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-xl rounded-bl-xl text-left flex flex-col shadow-sm transform transition hover:-translate-y-2"
                  style={{ backgroundColor: colorFondo }}
                >
                  <div className="flex justify-between items-start mb-4">
                    {/* IMPRIMIMOS LA PROPIEDAD servicio */}
                    <h3 className="font-serif text-2xl font-bold pr-2">{item.servicio}</h3>
                  </div>
                  
                  <div className="h-40 bg-white/40 rounded-2xl mb-4 flex-shrink-0 overflow-hidden">
                    <img 
                      src={item.img} 
                      alt={item.servicio} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "/images/placeholder.jpg"; }}
                    />
                  </div> 
                  
                  {/* IMPRIMIMOS LA PROPIEDAD desc */}
                  <p className="text-sm text-gray-700 flex-grow">{item.desc}</p>
                  
                  <div className="flex justify-end mt-4">
                    <span className="bg-white/80 text-gray-900 text-lg font-bold px-4 py-2 rounded-full shadow-sm whitespace-nowrap">
                      ${item.precio}.00 MXN
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}