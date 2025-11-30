// Simple i18n implementation for EN/ES
export type Language = 'en' | 'es';

export const translations = {
  en: {
    nav: {
      search: 'Search',
      trips: 'My Trips',
      messages: 'Messages',
      favorites: 'Favorites',
      profile: 'Profile',
      stays: 'Stay History',
      logout: 'Logout',
      login: 'Login',
    },
    home: {
      title: 'Find Your Perfect Vacation Rental',
      subtitle: 'Discover unique properties and create unforgettable memories',
      searchPlaceholder: 'Where are you going?',
      search: 'Search',
    },
    booking: {
      title: 'Complete Your Booking',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      guests: 'Number of Guests',
      specialRequests: 'Special Requests',
      pricePerNight: 'Price per Night',
      nights: 'Nights',
      subtotal: 'Subtotal',
      tax: 'Tax (6.25%)',
      commission: 'Service Fee (15%)',
      total: 'Total',
      confirmBooking: 'Confirm Booking',
      bookingConfirmed: 'Booking Confirmed!',
    },
    reviews: {
      title: 'Reviews',
      rating: 'Rating',
      cleanliness: 'Cleanliness',
      communication: 'Communication',
      accuracy: 'Accuracy',
      location: 'Location',
      value: 'Value',
      comment: 'Comment',
      submit: 'Submit Review',
    },
    profile: {
      title: 'Profile Management',
      bio: 'Bio',
      phone: 'Phone Number',
      emergency: 'Emergency Contact',
      idVerification: 'ID Verification',
      uploadId: 'Upload ID Document',
      save: 'Save Profile',
      verified: 'Verified',
      pending: 'Pending Review',
      rejected: 'Rejected',
    },
    notifications: {
      bookingConfirmed: 'Your booking has been confirmed!',
      bookingCancelled: 'Your booking has been cancelled',
      newMessage: 'You have a new message',
      newInquiry: 'You received a new booking inquiry',
    },
  },
  es: {
    nav: {
      search: 'Buscar',
      trips: 'Mis Viajes',
      messages: 'Mensajes',
      favorites: 'Favoritos',
      profile: 'Perfil',
      stays: 'Historial de Estancias',
      logout: 'Cerrar Sesión',
      login: 'Iniciar Sesión',
    },
    home: {
      title: 'Encuentra Tu Alquiler Vacacional Perfecto',
      subtitle: 'Descubre propiedades únicas y crea recuerdos inolvidables',
      searchPlaceholder: '¿A dónde vas?',
      search: 'Buscar',
    },
    booking: {
      title: 'Completa Tu Reserva',
      checkIn: 'Entrada',
      checkOut: 'Salida',
      guests: 'Número de Huéspedes',
      specialRequests: 'Solicitudes Especiales',
      pricePerNight: 'Precio por Noche',
      nights: 'Noches',
      subtotal: 'Subtotal',
      tax: 'Impuesto (6.25%)',
      commission: 'Tarifa de Servicio (15%)',
      total: 'Total',
      confirmBooking: 'Confirmar Reserva',
      bookingConfirmed: '¡Reserva Confirmada!',
    },
    reviews: {
      title: 'Reseñas',
      rating: 'Calificación',
      cleanliness: 'Limpieza',
      communication: 'Comunicación',
      accuracy: 'Precisión',
      location: 'Ubicación',
      value: 'Valor',
      comment: 'Comentario',
      submit: 'Enviar Reseña',
    },
    profile: {
      title: 'Gestión de Perfil',
      bio: 'Biografía',
      phone: 'Número de Teléfono',
      emergency: 'Contacto de Emergencia',
      idVerification: 'Verificación de Identidad',
      uploadId: 'Cargar Documento de Identidad',
      save: 'Guardar Perfil',
      verified: 'Verificado',
      pending: 'Pendiente de Revisión',
      rejected: 'Rechazado',
    },
    notifications: {
      bookingConfirmed: '¡Tu reserva ha sido confirmada!',
      bookingCancelled: 'Tu reserva ha sido cancelada',
      newMessage: 'Tienes un nuevo mensaje',
      newInquiry: 'Recibiste una nueva solicitud de reserva',
    },
  },
};

export function t(key: string, language: Language = 'en'): string {
  const keys = key.split('.');
  let value: any = translations[language];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}
