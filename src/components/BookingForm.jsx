import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Sparkles, User, Phone } from 'lucide-react';
import { saveBooking, getBookings, getConfig, getPrecios } from '../services/api';
import { es } from 'date-fns/locale';
import { format, addDays, startOfWeek } from 'date-fns';

// --- CONSTANTES GLOBALES ---
const INITIAL_AVAILABLE_TIMES = [];
const BASE_SERVICE_TAGS = [];

// --- FUNCIONES AUXILIARES ---
const formatAMPM = (time24) => {
  if (!time24) return '';
  
  // Dividimos "14:30" en hora="14" y minuto="30"
  const [hourStr, minute] = time24.trim().split(':');
  let hour = parseInt(hourStr, 10);
  
  // Determinamos si es AM o PM
  const ampm = hour >= 12 ? 'PM' : 'AM';
  
  // Convertimos la hora de 24 a 12
  hour = hour % 12;
  hour = hour ? hour : 12; // Si la hora es 0 (medianoche), la volvemos 12
  
  // Retornamos "2:30 PM"
  return `${hour}:${minute} ${ampm}`;
};

const ModernScheduler = () => {
  // --- ESTADOS (HOOKS) ---
  const [selectedTime, setSelectedTime] = useState(null); 
  const [selectedService, setSelectedService] = useState('')
  const [notes, setNotes] = useState('');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(true);
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const hoy = new Date().getDay(); // 0=Dom, 1=Lun, 2=Mar...
  const indiceInicial = hoy === 0 ? 0 : hoy - 1; // Ajustamos para que Lunes sea 0
  const [selectedDateIndex, setSelectedDateIndex] = useState(indiceInicial);
  const [listaServicios, setListaServicios] = useState([]);

  // --- EFECTOS (Llamadas a la BD) ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingTimes(true);
      try {
        // Agregamos getPrecios() a nuestra llamada en paralelo
        const [slots, conf, preciosDb] = await Promise.all([
          getBookings(), 
          getConfig(), 
          getPrecios() // <--- NUEVO
        ]);
        
        setBookedSlots(slots || []);
        if (conf) setWeeklySchedule(conf);
        
        // NUEVO: Extraemos los nombres de los servicios del Excel de precios
        if (preciosDb && preciosDb.length > 0) {
          // Extraemos solo la propiedad 'servicio' de la base de datos
          const nombres = preciosDb.map(item => item.servicio);
          setListaServicios(nombres);
        }

      } catch (error) {
        console.error("Error al cargar datos", error);
      } finally {
        setIsLoadingTimes(false);
      }
    };
    fetchData();
  }, [currentWeekStart]);

  // --- LÓGICA DERIVADA (Cálculos de Fechas) ---
  const daysToShow = Array.from({ length: 6 }).map((_, i) => addDays(currentWeekStart, i));
  const formatCurrentView = () => format(currentWeekStart, "MMMM yyyy", { locale: es });
  const selectedDateObj = daysToShow[selectedDateIndex];
  const formattedSelectedDate = format(selectedDateObj, 'yyyy-MM-dd');

  // Obtener nombre del día para ubicarlo en la configuración (ej. "lunes", "sábado")
  const selectedDayName = format(selectedDateObj, 'eeee', { locale: es }).toLowerCase(); 
  
  // Normalizador de acentos para una búsqueda segura
  const normalizar = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
  // Si la configuración cargó bien, un día no listado (ej. domingo) devolverá turnos vacíos (citas bloqueadas).
  let currentDayTimes = INITIAL_AVAILABLE_TIMES;
  if (weeklySchedule && weeklySchedule.length > 0) {
    const currentDayConfig = weeklySchedule.find(c => normalizar(c.dia) === normalizar(selectedDayName));
    currentDayTimes = currentDayConfig ? currentDayConfig.turnos : [];
  }

  // // Filtrar disponibilidad real
  // const availableTimes = currentDayTimes.filter(time => {
  //   const isOccupied = bookedSlots.some(booking => {
  //     // Normalizar la fecha por si Google regresa timestamp con la letra T (eg. "2026-04-08T06:00:00.000Z")
  //     const fechaNormalizada = booking.fecha ? booking.fecha.substring(0, 10) : '';
  //     return fechaNormalizada === formattedSelectedDate && booking.hora === time;
  //   });
  //   return !isOccupied;
  // });

  // --- HANDLERS (Manejadores de Eventos) ---
  const changeWeek = (direction) => {
    setCurrentWeekStart(prev => addDays(prev, direction * 7));
    setSelectedDateIndex(0);
    setSelectedTime(null); 
  };

  const handleDaySelect = (index) => {
    setSelectedDateIndex(index);
    setSelectedTime(null); 
  };

  const toggleService = (service) => {
    setActiveServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleBookingSubmit = async () => {
    // 1. Validar que haya un servicio seleccionado
    if (!selectedService) {
      alert("Por favor, selecciona un servicio.");
      return;
    }
    if (!selectedTime) {
      alert("Por favor, selecciona una hora para tu cita.");
      return;
    }
    if (!nombre.trim() || !whatsapp.trim()) {
      alert("Por favor, ingresa tu nombre y número de WhatsApp para poder contactarte.");
      return;
    }
    if (whatsapp.length < 10) {
      alert("Por favor, ingresa un número de WhatsApp válido (10 dígitos).");
      return;
    }

    setIsLoadingTimes(true);
    try {
      const bookingData = {
        nombre: nombre,
        whatsapp: whatsapp,
        fecha: formattedSelectedDate,
        hora: selectedTime,
        servicio: selectedService, 
        notas: notes,
      };
      
      await saveBooking(bookingData);
      setIsFormSubmitted(true);
      
      // Limpiamos los inputs de texto, PERO conservamos la fecha y hora seleccionada
      setNombre('');
      setWhatsapp('');
      setNotes('');
      
      const updatedSlots = await getBookings();
      setBookedSlots(updatedSlots);

    } catch (error) {
      alert('Error al reservar. Intenta de nuevo.');
    } finally {
      setIsLoadingTimes(false);
    }
  };

  // --- RENDERIZADO DE INTERFAZ ---
  return (
    <div className="max-w-2xl mx-auto px-2 pt-10 pb-8 md:px-2 min-h-screen">
      <div className="bg-white px-4 py-6 md:p-6 rounded-[2rem] shadow-sm border border-gray-100">
        
        {/* Inicio del renderizado condicional */}
        {isFormSubmitted ? (

          /* Pantalla de Éxito y Pago */
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#FCE6DF] rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-[#F8E3D7]" size={40} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">¡Cita Confirmada!</h2>
            <p className="text-gray-600 mb-6">Se recibió tu solicitud. Para confirmar tu cita es necesario realizar un depósito de $250 MXN a la siguiente cuenta: </p>
            <div className="bg-[#Fdfcfb] p-6 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Datos de Transferencia (SPEI)</p>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400 font-medium">Banco</span>
                <span className="text-gray-400 font-medium">BBVA</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400 font-medium">Beneficiario</span>
                <span className="text-gray-400 font-medium">Gaby López</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400 font-medium">CLABE</span>
                <span className="text-gray-400 font-medium">014180655050579958</span>
              </div>

              <button
              onClick={() => {
                const msj = `¡Hola! He agendado mi cita para ${formattedSelectedDate} a las ${formatAMPM(selectedTime)}. Te adunto mi comprobante de depósito.`
                window.open(`https://wa.me/4493832267?text=${encodeURIComponent(msj)}`, '_blank');
              }}
              className="w-full bg-[#F8E3D7] text-white py-3 rounded-full font-bold shadow-lg hover:bg-[#f5d4c7] transition-colors hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                Enviar comprobante por WhatsApp
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* SECCIÓN 1: Ventana de Citas */}
        <div className="mb-10">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="text-[#F8E3D7]" />
            Fecha y Hora <span className="text-[#F8E3D7]">*</span>
          </h2>

          {/* Navegación de Mes */}
          <div className="flex items-center justify-between mb-5 border border-gray-100 bg-[#Fdfcfb] p-2 rounded-full">
            <div className="capitalize px-4 py-2 bg-white rounded-full shadow-sm flex items-center gap-2 text-sm font-semibold text-gray-800 border border-gray-50">
              {formatCurrentView()} <span className="text-gray-400 text-xs">▼</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => changeWeek(-1)} className="p-2 bg-white rounded-full hover:bg-[#FCE6DF] border border-gray-100 transition-colors"><ChevronLeft size={16}/></button>
              <button onClick={() => changeWeek(1)} className="p-2 bg-white rounded-full hover:bg-[#FCE6DF] border border-gray-100 transition-colors"><ChevronRight size={16}/></button>
            </div>
          </div>

          {/* Date Picker Horizontal */}
          <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {daysToShow.map((day, index) => {
              const isSelected = index === selectedDateIndex;
              return (
                <button 
                  key={index}
                  onClick={() => handleDaySelect(index)}
                  // Cambiamos tamaños base
                  className={`flex-none w-[60px] h-[65px] md:w-[80px] md:h-[80px] rounded-2xl flex flex-col items-center justify-center border transition-all duration-200 
                    ${isSelected 
                      ? 'bg-[#FCE6DF] text-gray-900 shadow-md border-[#FCE6DF] scale-105' 
                      : 'bg-white text-gray-900 hover:border-[#FCE6DF] border-gray-100'}`}
                >
                  <span className={`text-[10px] md:text-[11px] font-medium uppercase tracking-wider ${isSelected ? 'text-gray-700' : 'text-gray-400'}`}>
                    {format(day, 'eee', { locale: es })}
                  </span>
                  <span className="text-xl md:text-2xl font-bold leading-none mt-1">
                    {format(day, 'dd')}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-sm text-gray-400 mb-6 border-b border-gray-100 pb-4 font-medium">Hora Local <span className="text-gray-300 text-xs">▼</span></p>

          {/* Time Picker Dinámico */}
          {isLoadingTimes ? (
            <div className="flex justify-center items-center py-8 text-gray-400 text-sm font-semibold">
              <span className="animate-pulse">Sincronizando agenda...</span>
            </div>
          ) : currentDayTimes.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {currentDayTimes.map((time) => {
                
                // 1. Calculamos aquí si ESTA hora específica está ocupada (A prueba de balas)
                const isOccupied = bookedSlots.some(booking => {
                  
                  // A. FECHA: Extraer solo "YYYY-MM-DD"
                  const dbFecha = String(booking.fecha || "").trim().substring(0, 10);
                  
                  // B. HORA: Cazador de Expresiones Regulares
                  const dbHoraRaw = String(booking.hora || "");
                  const matchHora = dbHoraRaw.match(/\d{2}:\d{2}/); // Caza el patrón "15:00"
                  let dbHora = matchHora ? matchHora[0] : dbHoraRaw.trim();
                  
                  // C. HORA DEL BOTÓN
                  let botonHora = String(time).trim();
                  
                  // D. IGUALAR CEROS (ej. convierte "9:00" en "09:00")
                  if (dbHora.length === 4) dbHora = "0" + dbHora;
                  if (botonHora.length === 4) botonHora = "0" + botonHora;

                  return dbFecha === formattedSelectedDate && dbHora === botonHora;
                });

                // 2. Revisamos si es la hora que el usuario tiene seleccionada
                const isSelected = time === selectedTime;

                return (
                  <button 
                    key={time}
                    onClick={() => !isOccupied && setSelectedTime(time)}
                    disabled={isOccupied} 
                    // Cambiamos px-4 por px-2, y el texto a text-xs
                    className={`py-3.5 px-2 md:px-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-150 border
                      ${isOccupied 
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through' // <-- ESTILOS INHABILITADA
                        : isSelected 
                          ? 'bg-[#E2EFE7] text-gray-900 border-[#E2EFE7] shadow-sm scale-105' // <-- ESTILO SELECCIONADA
                          : 'bg-white text-gray-700 hover:bg-[#E2EFE7]/30 hover:border-[#E2EFE7] border-gray-100 cursor-pointer' // <-- ESTILO DISPONIBLE
                      }`}
                  >
                    {formatAMPM(time)}
                  </button>
                );
              })}
            </div>
          ) : (
             <div className="text-center py-6 bg-red-50 rounded-xl border border-red-100">
               <p className="text-red-500 font-semibold text-sm">Día no disponible</p>
               <p className="text-xs text-red-400 mt-1">Por favor selecciona otra fecha arriba.</p>
             </div>
          )}
        </div>

        {/* SECCIÓN 2: Detalles del Cliente y Servicio */}
        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="text-[#F8E3D7]" />
            Tus Datos y Servicios <span className="text-[#F8E3D7]">*</span>
          </h2>
          
          <p className="text-sm text-gray-500 mb-5">Ingresa tu información de contacto para confirmar tu espacio.</p>

          {/* INPUTS DE CONTACTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre completo *" 
                className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl bg-gray-50/50 text-sm focus:ring-2 focus:ring-[#FCE6DF] focus:border-[#FCE6DF] outline-none transition-all"
                required
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="tel" 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp (10 dígitos) *" 
                className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl bg-gray-50/50 text-sm focus:ring-2 focus:ring-[#FCE6DF] focus:border-[#FCE6DF] outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Input de Notas */}
          <div className="relative mb-6">
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales (Ej. Tengo diseño anterior)..." 
              className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl bg-gray-50/50 text-sm focus:ring-2 focus:ring-[#FCE6DF] focus:border-[#FCE6DF] outline-none transition-all"
            />
          </div>

          {/* Menú Desplegable de Servicios */}
          <div className="relative mb-8">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full pl-4 pr-10 py-3 border border-gray-100 rounded-xl bg-gray-50/50 text-sm focus:ring-2 focus:ring-[#FCE6DF] focus:border-[#FCE6DF] outline-none transition-all appearance-none cursor-pointer text-gray-700"
              required
            >
              <option value="" disabled>
                {listaServicios.length === 0 ? "Cargando servicios..." : "Selecciona el servicio deseado *"}
              </option>
              
              {/* AQUÍ ESTÁ LA MAGIA: Iteramos sobre la lista de Sheets */}
              {listaServicios.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
              
            </select>
            {/* Flechita personalizada */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              ▼
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-between items-center gap-2 pt-6 border-t border-gray-100 mt-8">
            <button 
              onClick={() => { setNombre(''); setWhatsapp(''); setNotes(''); setSelectedService(''); setSelectedTime(null); }}
              className="px-4 py-3 rounded-full text-sm font-semibold text-gray-500 hover:bg-[#FCE6DF]/50 hover:text-gray-900 transition-colors"
            >
              Limpiar
            </button>
            <button 
              onClick={handleBookingSubmit}
              disabled={isLoadingTimes || !selectedTime || !selectedService}
              className="flex-1 max-w-[200px] px-6 py-3 rounded-full text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all"
            >
              {isLoadingTimes ? 'Guardando...' : 'Agendar Cita'}
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModernScheduler;