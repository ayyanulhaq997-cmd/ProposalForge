export const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.messages': 'Messages',
    'nav.trips': 'Trips',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.admin': 'Admin',
    'nav.host': 'Host Dashboard',
    
    // Booking
    'booking.selectDate': 'Select Dates',
    'booking.payment': 'Payment',
    'booking.confirmation': 'Confirmation',
    'booking.checkIn': 'Check In',
    'booking.checkOut': 'Check Out',
    'booking.guests': 'Guests',
    'booking.specialRequests': 'Special Requests',
    'booking.reserve': 'Reserve',
    'booking.total': 'Total',
    'booking.nights': 'nights',
    'booking.cleaningFee': 'Cleaning Fee',
    'booking.serviceFee': 'Service Fee',
    'booking.tax': 'Tax',
    
    // Calendar/Availability
    'calendar.blockDates': 'Block Dates',
    'calendar.setSeasonalPrice': 'Set Seasonal Price',
    'calendar.blocked': 'Blocked',
    'calendar.available': 'Available',
    'calendar.booked': 'Booked',
    'calendar.pending': 'Pending',
    'calendar.startDate': 'Start Date',
    'calendar.endDate': 'End Date',
    'calendar.price': 'Price',
    'calendar.save': 'Save',
    
    // Notifications
    'notify.newBooking': 'New Booking Request',
    'notify.bookingApproved': 'Booking Approved',
    'notify.bookingCancelled': 'Booking Cancelled',
    'notify.message': 'New Message',
    'notify.enabled': 'Notifications Enabled',
    'notify.disabled': 'Notifications Disabled',
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.approveBooking': 'Approve Booking',
    'admin.rejectBooking': 'Reject Booking',
    'admin.bookings': 'Bookings',
    'admin.properties': 'Properties',
    'admin.users': 'Users',
    'admin.auditLogs': 'Audit Logs',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.search': 'Buscar',
    'nav.messages': 'Mensajes',
    'nav.trips': 'Viajes',
    'nav.login': 'Iniciar Sesión',
    'nav.logout': 'Cerrar Sesión',
    'nav.admin': 'Administración',
    'nav.host': 'Panel de Host',
    
    // Booking
    'booking.selectDate': 'Seleccionar Fechas',
    'booking.payment': 'Pago',
    'booking.confirmation': 'Confirmación',
    'booking.checkIn': 'Entrada',
    'booking.checkOut': 'Salida',
    'booking.guests': 'Huéspedes',
    'booking.specialRequests': 'Solicitudes Especiales',
    'booking.reserve': 'Reservar',
    'booking.total': 'Total',
    'booking.nights': 'noches',
    'booking.cleaningFee': 'Tarifa de Limpieza',
    'booking.serviceFee': 'Tarifa de Servicio',
    'booking.tax': 'Impuesto',
    
    // Calendar/Availability
    'calendar.blockDates': 'Bloquear Fechas',
    'calendar.setSeasonalPrice': 'Establecer Precio Estacional',
    'calendar.blocked': 'Bloqueado',
    'calendar.available': 'Disponible',
    'calendar.booked': 'Reservado',
    'calendar.pending': 'Pendiente',
    'calendar.startDate': 'Fecha de Inicio',
    'calendar.endDate': 'Fecha de Fin',
    'calendar.price': 'Precio',
    'calendar.save': 'Guardar',
    
    // Notifications
    'notify.newBooking': 'Nueva Solicitud de Reserva',
    'notify.bookingApproved': 'Reserva Aprobada',
    'notify.bookingCancelled': 'Reserva Cancelada',
    'notify.message': 'Nuevo Mensaje',
    'notify.enabled': 'Notificaciones Habilitadas',
    'notify.disabled': 'Notificaciones Deshabilitadas',
    
    // Admin
    'admin.dashboard': 'Panel',
    'admin.approveBooking': 'Aprobar Reserva',
    'admin.rejectBooking': 'Rechazar Reserva',
    'admin.bookings': 'Reservas',
    'admin.properties': 'Propiedades',
    'admin.users': 'Usuarios',
    'admin.auditLogs': 'Registros de Auditoría',
  }
};

export type Language = 'en' | 'es';

export function t(key: string, language: Language = 'en'): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}
