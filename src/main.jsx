import React, { useEffect, useMemo, useRef, useState } from 'react';
console.log('--- CREATORS GUARDIAN DEBUG ---');
console.log('Iniciando carga de componentes...');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  BadgeCheck,
  BellRing,
  CalendarCheck,
  Check,
  ChevronDown,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileSearch,
  Fingerprint,
  GraduationCap,
  KeyRound,
  Link2,
  LogOut,
  Lock,
  Mail,
  MailCheck,
  MessageCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Trash2,
  UserRoundCheck,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import './styles.css';

const checklistGroups = [
  {
    title: 'Identidad y acceso',
    icon: UserRoundCheck,
    items: [
      '2FA activado con app autenticadora, no solo SMS',
      'Correo unico para cada cuenta importante',
      'Correo de recuperacion privado y sin publicar',
      'Contrasena unica por plataforma',
      'Codigos de respaldo guardados offline',
      'Numero telefonico oculto en perfiles publicos',
    ],
  },
  {
    title: 'Dispositivo limpio',
    icon: ShieldCheck,
    items: [
      'Antivirus o Microsoft Defender activo',
      'Sistema operativo actualizado esta semana',
      'Navegador actualizado y con extensiones revisadas',
      'Bloqueo de pantalla con PIN o biometria',
      'Backups automaticos de archivos importantes',
      'VPN o red confiable al trabajar fuera de casa',
    ],
  },
  {
    title: 'Cuentas UGC',
    icon: BadgeCheck,
    items: [
      'TikTok, Instagram, YouTube y correo con 2FA',
      'Apps conectadas revisadas y permisos eliminados',
      'Metodo de pago protegido y alertas activas',
      'Datos personales retirados de biografias publicas',
      'Contrato o brief validado antes de abrir archivos',
      'Historial de inicios de sesión revisado',
    ],
  },
];

const emergencySteps = [
  'Cambia la contrasena del correo principal desde un dispositivo limpio.',
  'Cierra sesiones abiertas en correo, redes, bancos y plataformas UGC.',
  'Revoca apps conectadas, tokens, integraciones y extensiones sospechosas.',
  'Activa o regenera 2FA y guarda codigos de respaldo nuevos.',
  'Revisa reglas de reenvio, filtros ocultos y correos de recuperacion.',
  'Contacta soporte de la plataforma con capturas, fecha y usuario afectado.',
  'Avisa a marcas/clientes si hubo riesgo de mensajes falsos o links enviados.',
  'Escanea el dispositivo y cambia contraseñas críticas desde otro equipo.',
];

const emergencyWhatsApp =
  'https://wa.me/524561175410?text=Necesito%20ayuda%20urgente%20con%20mi%20cuenta%20de%20creador%20posiblemente%20hackeada.';
const salesWhatsApp =
  'https://wa.me/524561175410?text=Quiero%20activar%20un%20plan%20de%20Creators%20Guardian.';
const explicitContentWhatsApp =
  'https://wa.me/524561175410?text=Necesito%20ayuda%20urgente%20por%20posible%20filtracion%20de%20contenido%20explicito.%20Quiero%20activar%20protocolo%20de%20contencion.';
const explicitContentFormUrl =
  'https://docs.google.com/forms/d/1ojTehM02yI62CVhmOtN0lFp0uhWEztEvnfGe7dAj_jI/viewform';
const rememberedEmailKey = 'creators-guardian-remembered-email';
const selectedPlanKey = 'creators-guardian-selected-plan';
const authFlashKey = 'creators-guardian-auth-flash';
const maxBotMessages = 8;

const landingRiskPoints = [
  {
    icon: AlertTriangle,
    title: 'La mayoría de los hackeos empiezan por errores simples',
    copy: 'Un enlace mal abierto, una app conectada de más o un correo expuesto puede derrumbar una cuenta en minutos.',
  },
  {
    icon: MailCheck,
    title: 'Tu correo puede estar filtrado sin que lo sepas',
    copy: 'Si el correo de recuperación es débil, todas tus redes quedan vulnerables aunque tu perfil se vea estable.',
  },
  {
    icon: ShieldAlert,
    title: 'Muchos creadores pierden cuentas sin recuperación real',
    copy: 'Cuando reaccionan tarde ya hubo cambios de contraseña, sesiones, apps conectadas y mensajes falsos.',
  },
  {
    icon: Fingerprint,
    title: 'No necesitas ser famoso para convertirte en objetivo',
    copy: 'Trabajar con marcas, propuestas, archivos y accesos ya te pone en la lista de riesgo de ataques oportunistas.',
  },
];

const landingSteps = [
  {
    icon: FileSearch,
    title: 'Escaneamos tu presencia digital',
    copy: 'Revisamos accesos, correos, sesiones y puntos débiles reales en todas tus plataformas.',
  },
  {
    icon: ClipboardCheck,
    title: 'Detectamos vulnerabilidades',
    copy: 'Te mostramos qué está crítico, qué está bien y qué debes corregir primero para blindarte.',
  },
  {
    icon: BellRing,
    title: 'Protegemos y alertamos a tiempo',
    copy: 'Te ayudamos a blindar la operación y a reaccionar antes de perder algo importante.',
  },
];

const landingPlans = [
  {
    id: 'starter',
    name: 'Guardián Starter',
    price: '$0 MXN / mes',
    badge: 'Empieza aquí',
    button: 'Empezar gratis',
    summary: 'Para empezar a proteger tu identidad y ordenar tu operación digital.',
    features: [
      'Acceso completo a la plataforma',
      'Score de seguridad inicial',
      'Verificador de seguridad manual',
      'Centro de incidentes con guías',
    ],
  },
  {
    id: 'pro',
    name: 'Guardián Pro',
    price: '$99 MXN / mes',
    badge: 'Plan activo',
    button: 'Activar Guardián Pro',
    summary: 'Protección automatizada con beneficios exclusivos mientras el plan siga activo.',
    features: [
      'Todo lo de Starter',
      'Herramientas avanzadas de diseño',
      'Monitoreo automatizado 24/7',
      'Auditorías mensuales',
      'Historial de actividad detallado',
    ],
  },
  {
    id: 'elite',
    name: 'Guardián Elite',
    price: '$299 MXN / mes',
    badge: 'Más popular',
    featured: true,
    button: 'Elegir Guardián Elite',
    summary: 'Acceso directo a expertos y auditorías avanzadas para figuras públicas.',
    features: [
      'Todo lo de Pro',
      '4 consultas 1 a 1 al mes',
      'Auditorías profundas y personalizadas',
      'Soporte prioritario',
    ],
  },
  {
    id: 'shield',
    name: 'Guardián Shield',
    price: '$899 MXN / mes',
    badge: 'Respuesta total',
    button: 'Activar Guardian Shield',
    summary: 'Respuesta inmediata ante crisis, hackeos y recuperación operativa de alto riesgo.',
    features: [
      'Todo lo de Elite',
      'Asistencia 24/7 por hackeo',
      'Gestión de eliminación de contenido (3/mes)',
    ],
  },
];

const countryOptions = [
  'México',
  'Estados Unidos',
  'Colombia',
  'Argentina',
  'Chile',
  'Perú',
  'España',
  'Guatemala',
  'Ecuador',
  'Otro país',
];

const paymentLinksByPlan = {
  pro: {
    mexico: 'https://www.mercadopago.com.mx/subscriptions/checkout?preapproval_plan_id=1b698b47c969438caf74092d96d75a9e',
    international: 'https://buy.stripe.com/9B65kvgZGdVc0ag4o1c3m03',
  },
  elite: {
    mexico: 'https://www.mercadopago.com.mx/subscriptions/checkout?preapproval_plan_id=d43f41ed790f4aa497f2c368eeda0f2a',
    international: 'https://buy.stripe.com/aFa00bgZG6sK5uA07Lc3m05',
  },
  shield: {
    mexico: 'https://www.mercadopago.com.mx/subscriptions/checkout?preapproval_plan_id=4b7ffef8573745e2bd1844c20c5fe5e2',
    international: 'https://buy.stripe.com/28E28j10I4kCg9e6w9c3m04',
  },
};

const gracePeriodDays = 7;

const paidPlanIds = ['pro', 'elite', 'shield'];
const legacyPlanAliases = {
  free: 'starter',
  basic: 'pro',
  pro: 'elite',
  vip: 'shield',
  agency: 'shield',
  trial_30: 'starter',
  promo_30: 'pro',
  family: 'elite',
};

function normalizePlanId(planId) {
  const clean = String(planId || '').trim().toLowerCase();
  if (!clean) return 'starter';
  if (landingPlans.some((plan) => plan.id === clean)) return clean;
  return legacyPlanAliases[clean] || 'starter';
}

function getPlanConfig(planId) {
  const normalized = normalizePlanId(planId);
  return landingPlans.find((plan) => plan.id === normalized) || landingPlans[0];
}

function normalizeBotText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function trimBotMessages(messages = []) {
  if (!Array.isArray(messages) || messages.length <= maxBotMessages) return messages;
  const introMessage = messages[0];
  const recentMessages = messages.slice(-(maxBotMessages - 1));
  return introMessage?.role === 'assistant' ? [introMessage, ...recentMessages] : recentMessages;
}

function getInstantBotReply(question = '') {
  const text = normalizeBotText(question);
  if (!text) return '';

  if (text.includes('link') && (text.includes('marca') || text.includes('falso') || text.includes('phishing'))) {
    return 'Revisa el dominio completo, evita links acortados, no abras nada con urgencia rara y confirma por mensaje directo con la marca. Si quieres, pega aqui el link exacto y te digo que revisar antes de abrirlo.';
  }

  if ((text.includes('instagram') || text.includes('cuenta')) && (text.includes('perdi acceso') || text.includes('hack') || text.includes('robaron'))) {
    return 'Primero cambia la contraseña del correo principal, cierra sesiones abiertas desde un equipo limpio, revisa apps conectadas y activa 2FA nueva. Si ya no reconoces accesos o hubo robo, usa WhatsApp urgente para escalarlo contigo paso a paso.';
  }

  if (text.includes('2fa') || text.includes('autenticador') || text.includes('doble factor')) {
    return 'Usa una app autenticadora, guarda tus codigos de respaldo fuera del celular y evita depender solo de SMS. Si quieres, te ayudo a activarlo en Instagram, TikTok o correo con pasos simples.';
  }

  if (text.includes('pdf') || text.includes('archivo') || text.includes('brief')) {
    return 'No abras el archivo directo. Primero revisa remitente, dominio, extension real y contexto de la marca. Luego subelo al verificador local y confirma el hash o el link en VirusTotal si algo te da mala espina.';
  }

  if (text.includes('correo') && (text.includes('filtrado') || text.includes('expuesto') || text.includes('comprometido'))) {
    return 'Si tu correo ya estuvo expuesto, cambia la contraseña, revisa filtros o reenvios raros, activa 2FA y no lo publiques en perfiles. Si recupera cuentas clave, conviene mover lo importante a un correo mas privado.';
  }

  return '';
}

const suspiciousTlds = ['.zip', '.mov', '.top', '.xyz', '.click', '.work', '.country', '.gq'];
const riskyWords = ['urgent', 'verify', 'password', 'login', 'bonus', 'payment', 'gift', 'free', 'invoice', 'airdrop', 'soporte', 'premio', 'factura', 'pago'];
const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'rebrand.ly', 'is.gd', 'lnkd.in'];
const defaultAccounts = [
  { platform: 'Instagram', owner: 'Principal', profileType: 'Principal', handle: '', emailLabel: '', status: 'Pendiente', lastReview: 'Hoy' },
  { platform: 'TikTok', owner: 'Principal', profileType: 'Principal', handle: '', emailLabel: '', status: 'Pendiente', lastReview: 'Hoy' },
];

const socialPlatforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'X'];
const profileTypes = ['Principal', 'Alterna 1', 'Alterna 2', 'Marca/Negocio'];
const adminEmails = ['aztekillertech@gmail.com', 'aztekillertry@gmail.com'];
const fileRiskDetails = {
  Alto: 'No lo abras todavia. Verificalo en VirusTotal y confirma que venga de una marca real.',
  Medio: 'Abre con cuidado. Verifica remitente, extension y resultado en VirusTotal antes de descargar o ejecutar.',
  Bajo: 'No hay senales obvias por extension, pero verifica el origen antes de abrirlo.',
};

const accountCheckItems = [
  {
    label: '2FA activo con app autenticadora',
    description: 'Marca esto si ya activaste la verificacion en dos pasos con una app como Google Authenticator, Authy, Microsoft Authenticator o similar.',
  },
  {
    label: 'Correo asociado no publicado',
    description: 'Marca esto si el correo conectado a tu cuenta no aparece en tu biografia, publicaciones, enlaces publicos ni datos faciles de adivinar.',
  },
  {
    label: 'Contrasena unica y reciente',
    description: 'Marca esto si esta cuenta tiene una contrasena nueva, larga y diferente a la que usas en otras redes o correos.',
  },
  {
    label: 'Codigos de respaldo guardados',
    description: 'Marca esto si ya guardaste los codigos de recuperacion en un lugar seguro para entrar si pierdes acceso al telefono o a la app 2FA.',
  },
  {
    label: 'Apps conectadas revisadas',
    description: 'Marca esto si ya revisaste las apps, integraciones y permisos conectados, y eliminaste cualquier acceso que no reconozcas.',
  },
  {
    label: 'Alertas de inicio de sesión activas',
    description: 'Marca esto si ya activaste avisos por correo, app o SMS para enterarte cuando alguien intente iniciar sesion o cambiar datos de la cuenta.',
  },
];

const recommendedAppCategories = [
  {
    id: 'essential',
    label: 'Esenciales',
    apps: ['Microsoft Authenticator', 'Bitwarden', 'Brave Browser'],
  },
  {
    id: 'auth',
    label: 'Autenticadores 2FA',
    apps: ['Microsoft Authenticator', 'Google Authenticator', 'Authy', '2FAS Auth'],
  },
  {
    id: 'passwords',
    label: 'Contraseñas',
    apps: ['Bitwarden', 'Proton Pass', 'NordPass'],
  },
  {
    id: 'privacy',
    label: 'Privacidad',
    apps: ['Proton VPN', 'SimpleLogin', 'Firefox Focus', 'Signal'],
  },
  {
    id: 'extras',
    label: 'Extras',
    apps: ['Malwarebytes', 'Standard Notes'],
  },
];

const recommendedApps = {
  'Microsoft Authenticator': {
    name: 'Microsoft Authenticator',
    category: 'Autenticador 2FA',
    top: true,
    icon: 'https://play-lh.googleusercontent.com/icon?package=com.azure.authenticator&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
    description: 'Respaldo en la nube, login sin contraseña',
    feature: 'Sincroniza entre dispositivos',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=com.azure.authenticator',
      ios: 'https://apps.apple.com/app/microsoft-authenticator/id983156458',
      windows: 'https://www.microsoft.com/store/apps/9NBLGGH08H54',
      macos: 'https://apps.apple.com/app/microsoft-authenticator/id983156458',
    },
  },
  Bitwarden: {
    name: 'Bitwarden',
    category: 'Gestor de contraseñas',
    top: true,
    icon: 'https://play-lh.googleusercontent.com/icon?package=com.x8bit.bitwarden&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=bitwarden.com&sz=128',
    description: '100% gratis, contraseñas y dispositivos ilimitados',
    feature: 'Open source, sin límites',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=com.x8bit.bitwarden',
      ios: 'https://apps.apple.com/app/bitwarden-password-manager/id1137397744',
      windows: 'https://bitwarden.com/download/',
      macos: 'https://bitwarden.com/download/',
    },
  },
  'Brave Browser': {
    name: 'Brave Browser',
    category: 'Navegador privado',
    top: true,
    icon: 'https://play-lh.googleusercontent.com/icon?package=com.brave.browser&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=brave.com&sz=128',
    description: 'Bloquea ads y trackers por defecto',
    feature: 'Tor integrado, muy rápido',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=com.brave.browser',
      ios: 'https://apps.apple.com/app/brave-private-web-browser-vpn/id1052879175',
      windows: 'https://brave.com/download/',
      macos: 'https://brave.com/download/',
    },
  },
  'Google Authenticator': {
    name: 'Google Authenticator',
    category: 'Autenticador 2FA',
    icon: 'https://play-lh.googleusercontent.com/icon?package=com.google.android.apps.authenticator2&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
    description: 'El más conocido y compatible',
    feature: 'Ahora con respaldo en Google',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
      ios: 'https://apps.apple.com/app/google-authenticator/id388497605',
    },
  },
  Authy: {
    name: 'Authy',
    category: 'Autenticador 2FA',
    icon: 'https://play-lh.googleusercontent.com/icon?package=com.authy.authy&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=authy.com&sz=128',
    description: 'Multi-dispositivo con respaldo encriptado',
    feature: 'También disponible en PC',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=com.authy.authy',
      ios: 'https://apps.apple.com/app/authy/id494168017',
      windows: 'https://authy.com/download/',
      macos: 'https://authy.com/download/',
    },
  },
  '2FAS Auth': {
    name: '2FAS Auth',
    category: 'Autenticador 2FA',
    icon: 'https://play-lh.googleusercontent.com/icon?package=com.twofasapp&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=2fas.com&sz=128',
    description: 'Open source, sin rastreadores',
    feature: 'Máxima privacidad',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=com.twofasapp',
      ios: 'https://apps.apple.com/app/2fas-auth/id1217793794',
      windows: 'https://2fas.com/download/',
      macos: 'https://2fas.com/download/',
    },
  },
  'Proton Pass': {
    name: 'Proton Pass',
    category: 'Gestor de contraseñas',
    icon: 'https://play-lh.googleusercontent.com/icon?package=proton.android.pass&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=proton.me&sz=128',
    description: 'De los creadores de ProtonMail',
    feature: 'Alias de email integrados',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=proton.android.pass',
      ios: 'https://apps.apple.com/app/proton-pass-password-manager/id6443490629',
      windows: 'https://proton.me/pass/download',
      macos: 'https://proton.me/pass/download',
    },
  },
  NordPass: {
    name: 'NordPass',
    category: 'Gestor de contraseñas',
    icon: 'https://play-lh.googleusercontent.com/icon?package=com.nordpass.android.app&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=nordpass.com&sz=128',
    description: 'Interfaz muy amigable',
    feature: 'Fácil para principiantes',
    price: 'Freemium',
    priceNote: '1 dispositivo gratis',
    links: {
      android: 'https://play.google.com/store/apps/details?id=com.nordpass.android.app',
      ios: 'https://apps.apple.com/app/nordpass-password-manager/id1465069804',
      windows: 'https://nordpass.com/download/windows/',
      macos: 'https://nordpass.com/download/macos/',
    },
  },
  'Proton VPN': {
    name: 'Proton VPN',
    category: 'Privacidad',
    icon: 'https://play-lh.googleusercontent.com/icon?package=ch.protonvpn.android&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=protonvpn.com&sz=128',
    description: 'Mejor VPN gratis, sin límite de datos',
    feature: 'VPN gratis ilimitado',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=ch.protonvpn.android',
      ios: 'https://apps.apple.com/app/proton-vpn-fast-secure/id1437005085',
      windows: 'https://protonvpn.com/download-windows',
      macos: 'https://protonvpn.com/download-macos',
    },
  },
  SimpleLogin: {
    name: 'SimpleLogin',
    category: 'Email alias',
    icon: 'https://play-lh.googleusercontent.com/icon?package=io.simplelogin.android&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=simplelogin.io&sz=128',
    description: 'Crea emails alias para proteger tu email real',
    feature: '10 alias gratis',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=io.simplelogin.android',
      ios: 'https://apps.apple.com/app/simplelogin/id1494359858',
    },
  },
  'Firefox Focus': {
    name: 'Firefox Focus',
    category: 'Navegador privado',
    icon: 'https://play-lh.googleusercontent.com/icon?package=org.mozilla.focus&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=mozilla.org&sz=128',
    description: 'Navegación privada extrema',
    feature: 'Borra todo al cerrar',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=org.mozilla.focus',
      ios: 'https://apps.apple.com/app/firefox-focus-privacy-browser/id1055677337',
    },
  },
  Signal: {
    name: 'Signal',
    category: 'Mensajería segura',
    icon: 'https://play-lh.googleusercontent.com/icon?package=org.thoughtcrime.securesms&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=signal.org&sz=128',
    description: 'Mensajería más segura que WhatsApp',
    feature: 'End-to-end encryption',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms',
      ios: 'https://apps.apple.com/app/signal-private-messenger/id874139669',
      windows: 'https://signal.org/download/',
      macos: 'https://signal.org/download/',
    },
  },
  Malwarebytes: {
    name: 'Malwarebytes',
    category: 'Antimalware',
    icon: 'https://play-lh.googleusercontent.com/icon?package=org.malwarebytes.antimalware&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=malwarebytes.com&sz=128',
    description: 'Escaneo de malware y adware',
    feature: 'Confiable sin publicidad',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=org.malwarebytes.antimalware',
      ios: 'https://apps.apple.com/app/malwarebytes-mobile-security/id1327105431',
      windows: 'https://www.malwarebytes.com/mwb-download',
      macos: 'https://www.malwarebytes.com/mac-download',
    },
  },
  'Standard Notes': {
    name: 'Standard Notes',
    category: 'Notas seguras',
    icon: 'https://play-lh.googleusercontent.com/icon?package=com.standardnotes&size=128',
    fallback: 'https://www.google.com/s2/favicons?domain=standardnotes.com&sz=128',
    description: 'Notas encriptadas sincronizadas',
    feature: 'Zero-knowledge encryption',
    price: 'GRATIS',
    links: {
      android: 'https://play.google.com/store/apps/details?id=com.standardnotes',
      ios: 'https://apps.apple.com/app/standard-notes/id1285392450',
      windows: 'https://standardnotes.com/download',
      macos: 'https://standardnotes.com/download',
    },
  },
};

const academyVideos = [
  {
    title: 'Primeros pasos de seguridad para Creadores de Contenido',
    level: 'Básico',
    duration: '8 min',
    description: 'Cómo organizar correos, contraseñas, 2FA y perfiles antes de trabajar con marcas.',
  },
  {
    title: 'Cómo detectar briefs, PDFs y links sospechosos',
    level: 'Básico',
    duration: '12 min',
    description: 'Señales claras para no abrir archivos peligrosos ni caer en campañas falsas.',
  },
  {
    title: 'Protección de Instagram, TikTok y YouTube',
    level: 'Intermedio',
    duration: '15 min',
    description: 'Configuración de sesiones, apps conectadas, alertas y recuperación de cuenta.',
  },
  {
    title: 'Qué hacer si te intentan hackear o extorsionar',
    level: 'Urgente',
    duration: '10 min',
    description: 'Pasos de contención, evidencia, comunicación y recuperación sin entrar en pánico.',
  },
];

const platformSecurityLinks = {
  Instagram: 'https://accountscenter.instagram.com/password_and_security/two_factor',
  TikTok: 'https://www.tiktok.com/setting/security',
  YouTube: 'https://myaccount.google.com/security',
  Facebook: 'https://accountscenter.facebook.com/password_and_security/two_factor',
  X: 'https://x.com/settings/security',
};

const platformQuickLinks = {
  Instagram: [
    ['Centro de seguridad', 'https://accountscenter.instagram.com/password_and_security'],
    ['Actividad de inicio', 'https://accountscenter.instagram.com/password_and_security/login_activity'],
    ['Apps conectadas', 'https://www.instagram.com/accounts/manage_access/'],
    ['Verificacion 2FA', 'https://accountscenter.instagram.com/password_and_security/two_factor'],
  ],
  TikTok: [
    ['Seguridad', 'https://www.tiktok.com/setting/account/security'],
    ['Dispositivos', 'https://www.tiktok.com/setting/account/manage-devices'],
    ['Privacidad', 'https://www.tiktok.com/setting/privacy'],
    ['Verificacion 2FA', 'https://www.tiktok.com/setting/account/security'],
  ],
  YouTube: [
    ['Seguridad Google', 'https://myaccount.google.com/security'],
    ['Dispositivos', 'https://myaccount.google.com/device-activity'],
    ['Apps con acceso', 'https://myaccount.google.com/permissions'],
    ['Verificacion 2FA', 'https://myaccount.google.com/signinoptions/two-step-verification'],
  ],
  Facebook: [
    ['Centro de seguridad', 'https://accountscenter.facebook.com/password_and_security'],
    ['Actividad de inicio', 'https://accountscenter.facebook.com/password_and_security/login_activity'],
    ['Apps conectadas', 'https://www.facebook.com/settings?tab=applications'],
    ['Verificacion 2FA', 'https://accountscenter.facebook.com/password_and_security/two_factor'],
  ],
  X: [
    ['Seguridad', 'https://x.com/settings/security'],
    ['Sesiones', 'https://x.com/settings/sessions'],
    ['Apps conectadas', 'https://x.com/settings/connected_apps'],
    ['Verificacion 2FA', 'https://x.com/settings/security'],
  ],
};

const maintenanceTemplates = [
  { key: 'sessions', title: 'Revisar sesiones activas', cadence: 7, weight: 'critica' },
  { key: 'password', title: 'Cambiar contrasena critica si hubo riesgo', cadence: 30, weight: 'alta' },
  { key: 'apps', title: 'Limpiar apps conectadas', cadence: 90, weight: 'media' },
  { key: 'backup', title: 'Revisar codigos de respaldo 2FA', cadence: 180, weight: 'media' },
];

function getScoreLabel(score) {
  if (score <= 20) return { label: 'Crítica', className: 'critical' };
  if (score <= 40) return { label: 'Peligro', className: 'danger' };
  if (score <= 60) return { label: 'Riesgo', className: 'risk' };
  if (score <= 75) return { label: 'Precaucion', className: 'warning' };
  if (score <= 90) return { label: 'Buena', className: 'good' };
  return { label: 'Saludable', className: 'healthy' };
}

function friendlyAuthError(message) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('signups not allowed')) {
    return 'Supabase tiene desactivado el registro de usuarios nuevos. Activa "Allow new users to sign up" en Authentication > Providers > Email.';
  }
  if (lowerMessage.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos. Si aún no existe la cuenta, toca "Crear usuario nuevo".';
  }
  if (lowerMessage.includes('user already registered')) {
    return 'Ese correo ya está registrado. Cambia a "Entrar" e inicia sesión.';
  }
  return message;
}

function getAuthRedirectUrl() {
  const looksMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const isMobilePath = window.location.pathname.toLowerCase().includes('mobile');
  const productionBase = 'https://creatorsguardian.pro';

  if (looksMobile || isMobilePath) {
    return `${productionBase}/mobile.html`;
  }

  return `${productionBase}/`;
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const update = (next) => {
    const nextValue = typeof next === 'function' ? next(value) : next;
    setValue(nextValue);
    localStorage.setItem(key, JSON.stringify(nextValue));
  };

  return [value, update];
}

const TERMINAL_EVENTS = [
  'Sesion verificada · Instagram',
  'Escaneo completado · Email',
  'Sin amenazas detectadas',
  'Acceso seguro · TikTok',
  'Verificacion 2FA · activa',
  'Monitoreo en curso · redes',
  'Score actualizado · 84/100',
  'Conexion cifrada · OK',
  'Auditoria completada · OK',
  'Alerta revisada · ninguna',
  'Acceso seguro · YouTube',
  'Integridad de cuenta · OK',
];

function fmtTime(d) {
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
}

function CyberTerminal() {
  const [logs, setLogs] = useState(() => {
    const now = Date.now();
    return [0,1,2,3].map((i) => ({
      id: i,
      time: new Date(now - (3 - i) * 52000),
      text: TERMINAL_EVENTS[i],
    }));
  });

  useEffect(() => {
    let idx = 4;
    const iv = setInterval(() => {
      setLogs((prev) => {
        const next = [...prev.slice(-4), {
          id: Date.now(),
          time: new Date(),
          text: TERMINAL_EVENTS[idx % TERMINAL_EVENTS.length],
        }];
        idx++;
        return next;
      });
    }, 3600);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="cyber-terminal">
      <div className="cyber-terminal-bar">
        <span className="ct-dot ct-red" />
        <span className="ct-dot ct-yellow" />
        <span className="ct-dot ct-green" />
        <span className="ct-title">GUARDIAN_LOG v2.1</span>
      </div>
      <div className="cyber-terminal-body">
        {logs.map((log, i) => (
          <div key={log.id} className={`ct-line${i === logs.length - 1 ? ' ct-line-new' : ''}`}>
            <span className="ct-time">[{fmtTime(log.time)}]</span>
            <span className="ct-check">&#10003;</span>
            <span className="ct-text">{log.text}</span>
          </div>
        ))}
        <span className="ct-cursor">&#9608;</span>
      </div>
    </div>
  );
}

function AuthScreen({ onLogin }) {
  const isMobileEdition = window.location.pathname.toLowerCase().includes('mobile');
  const [standaloneRegister, setStandaloneRegister] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'register' && Boolean(params.get('plan'));
  });
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState(() => localStorage.getItem(rememberedEmailKey) || '');
  const [password, setPassword] = useState('');
  const [showAuthPwd, setShowAuthPwd] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('starter');
  const [rememberAccess, setRememberAccess] = useState(() => Boolean(localStorage.getItem(rememberedEmailKey)));
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [brandName, setBrandName] = useState('');
  const [mainHandle, setMainHandle] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [invitePreview, setInvitePreview] = useState(null);
  const [isCheckingInvite, setIsCheckingInvite] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const plansRef = useRef(null);
  const authRef = useRef(null);
  const selectedPlan = useMemo(() => getPlanConfig(selectedPlanId), [selectedPlanId]);
  const isMexico = ['mexico', 'méxico'].includes(country.trim().toLowerCase());
  const selectedPaymentLink = selectedPlanId !== 'starter'
    ? (isMexico ? paymentLinksByPlan[selectedPlanId]?.mexico : paymentLinksByPlan[selectedPlanId]?.international) || ''
    : '';
  const selectedPaymentProvider = selectedPlanId === 'starter' ? '' : isMexico ? 'Mercado Pago' : 'Stripe';
  const paymentWhatsApp = `https://wa.me/524561175410?text=${encodeURIComponent(
    [
      `Hola, quiero activar ${selectedPlan.name}.`,
      `Nombre: ${fullName.trim() || 'Pendiente'}`,
      `Correo: ${email.trim().toLowerCase() || 'Pendiente'}`,
      `Pais: ${country || 'Pendiente'}`,
      `Telefono: ${phone.trim() || 'Pendiente'}`,
      `Marca: ${brandName.trim() || 'Pendiente'}`,
      `Plan elegido: ${selectedPlan.name}`,
      `Metodo de pago esperado: ${selectedPaymentProvider || 'Acceso privado'}`,
      'Ya tengo mi comprobante y necesito mi codigo de acceso.',
    ].join('\n'),
  )}`;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const requestedPlan = searchParams.get('plan');
    const requestedMode = searchParams.get('mode');
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const errorDescription = hashParams.get('error_description');
    const flashMessage = sessionStorage.getItem(authFlashKey);
    let shouldCleanUrl = false;

    if (requestedPlan) {
      setSelectedPlanId(normalizePlanId(requestedPlan));
      shouldCleanUrl = true;
    }

    if (requestedMode === 'register' || requestedMode === 'login') {
      setMode(requestedMode);
      setStandaloneRegister(requestedMode === 'register' && Boolean(requestedPlan));
      setMessage('');
      shouldCleanUrl = true;
      setTimeout(() => {
        authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }

    if (errorDescription) {
      setMessage(decodeURIComponent(errorDescription.replaceAll('+', ' ')));
      shouldCleanUrl = true;
    }

    if (flashMessage) {
      setMessage(flashMessage);
      sessionStorage.removeItem(authFlashKey);
    }

    if (shouldCleanUrl) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem(selectedPlanKey);
  }, []);

  const scrollToRef = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [standaloneRegister]);

  const openPlanFlow = () => {
    setStandaloneRegister(false);
    scrollToRef(plansRef);
  };

  const openRegisterFlow = () => {
    setStandaloneRegister(false);
    setMode('register');
    setMessage('');
    scrollToRef(plansRef);
  };

  const openExistingAccess = () => {
    setStandaloneRegister(false);
    setMode('login');
    setMessage('');
    scrollToRef(authRef);
  };

  const redirectToCleanPage = ({ nextMode = '', flashMessage = '' } = {}) => {
    if (flashMessage) {
      sessionStorage.setItem(authFlashKey, flashMessage);
    }
    const cleanUrl = new URL(window.location.origin + window.location.pathname);
    if (nextMode) {
      cleanUrl.searchParams.set('mode', nextMode);
    }
    window.location.assign(cleanUrl.toString());
  };

  const selectPlan = (planId) => {
    setStandaloneRegister(false);
    setSelectedPlanId(normalizePlanId(planId));
    setMode('register');
    setMessage('');
    setInviteCode('');
    setInvitePreview(null);
    setTimeout(() => scrollToRef(authRef), 80);
  };

  const openPlanRegisterTab = (planId) => {
    const normalizedPlanId = normalizePlanId(planId);
    setSelectedPlanId(normalizedPlanId);
    setStandaloneRegister(true);
    setMode('register');
    setMessage('');
    setInviteCode('');
    setInvitePreview(null);
    setTimeout(() => authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const inviteAttempts = useRef({ count: 0, resetAt: 0 });
  const previewInviteCode = async (rawCode = inviteCode) => {
    const cleanCode = String(rawCode || '').trim().toUpperCase();
    if (!cleanCode) {
      setInvitePreview(null);
      setMessage('Escribe tu codigo de acceso para registrarte.');
      return null;
    }
    if (!supabase) {
      setMessage('Falta la conexión de Supabase para validar códigos.');
      return null;
    }
    const now = Date.now();
    if (now > inviteAttempts.current.resetAt) { inviteAttempts.current = { count: 0, resetAt: now + 60000 }; }
    inviteAttempts.current.count++;
    if (inviteAttempts.current.count > 5) {
      setMessage('Demasiados intentos. Espera un momento antes de intentar de nuevo.');
      return null;
    }

    setIsCheckingInvite(true);
    setMessage('');
    const { data, error } = await supabase.rpc('validate_invite_code', {
      input_code: cleanCode,
    });
    setIsCheckingInvite(false);

    if (error) {
      setInvitePreview({
        valid: false,
        message: `No pude validar el codigo: ${error.message}`,
      });
      return null;
    }

    const result = Array.isArray(data) ? data[0] : data;
    setInviteCode(cleanCode);
    setInvitePreview(result || null);
    return result || null;
  };

  const submit = async (event) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanInviteCode = inviteCode.trim().toUpperCase();
    if (!isSupabaseConfigured) {
      setMessage('Faltan las variables de Supabase para activar el acceso real.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || password.length < 8) {
      setMessage('Usa un correo valido y una contrasena de minimo 8 caracteres.');
      return;
    }

    let inviteResult = null;
    if (mode === 'register') {
      if (!country.trim()) {
        setMessage('Selecciona tu país antes de crear el acceso.');
        return;
      }
      if (selectedPlanId !== 'starter' && !cleanInviteCode) {
        setMessage(
          'Primero realiza el pago de tu plan, envía el comprobante por WhatsApp y luego usa el código privado que te compartiremos.',
        );
        return;
      }
      if (selectedPlanId === 'starter') {
        inviteResult = {
          valid: true,
          plan_kind: 'starter',
          client_label: 'starter-self-serve',
          duration_days: null,
        };
      } else {
        inviteResult = await previewInviteCode(cleanInviteCode);
        if (!inviteResult?.valid) {
          setMessage(inviteResult?.message || 'Ese codigo no está listo para usarse.');
          return;
        }
      }
    }

    setIsSubmitting(true);
    setMessage('');
    if (rememberAccess) {
      localStorage.setItem(rememberedEmailKey, cleanEmail);
    } else {
      localStorage.removeItem(rememberedEmailKey);
    }

    const response = mode === 'register'
      ? await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanEmail.split('@')[0],
              full_name: fullName.trim(),
              phone: phone.trim(),
              country: country.trim(),
              brand_name: brandName.trim(),
              main_handle: mainHandle.trim(),
              invite_code: cleanInviteCode || null,
              invite_plan: inviteResult?.plan_kind || selectedPlanId,
              invite_source: inviteResult?.client_label || (selectedPlanId === 'starter' ? 'starter-self-serve' : null),
            },
            emailRedirectTo: getAuthRedirectUrl(),
          },
        })
      : await supabase.auth.signInWithPassword({ email: cleanEmail, password });

    if (response.error) {
      setMessage(friendlyAuthError(response.error.message));
      setIsSubmitting(false);
      return;
    }

    const resolvedUser = response.data.session?.user || response.data.user || null;

    if (mode === 'register' && resolvedUser && selectedPlanId !== 'starter') {
      const { data: claimedData, error: claimError } = await supabase.rpc('claim_invite_code', {
        input_code: cleanInviteCode,
        signup_email: cleanEmail,
        signup_name: fullName.trim() || cleanEmail.split('@')[0],
        target_user_id: resolvedUser.id,
      });

      const claimed = Array.isArray(claimedData) ? claimedData[0] : claimedData;
      if (claimError || !claimed?.success) {
        setMessage(claimError?.message || claimed?.message || 'No pude ligar tu codigo al registro.');
        setIsSubmitting(false);
        return;
      }
    }

    if (response.data.session?.user) {
      await supabase.from('profiles').upsert({
        id: response.data.session.user.id,
        email: response.data.session.user.email,
        username: response.data.session.user.email?.split('@')[0] || 'creador',
        full_name: fullName.trim() || response.data.session.user.user_metadata?.full_name || null,
        phone: phone.trim() || response.data.session.user.user_metadata?.phone || null,
        brand_name: brandName.trim() || response.data.session.user.user_metadata?.brand_name || null,
        main_handle: mainHandle.trim() || response.data.session.user.user_metadata?.main_handle || null,
        access_code: cleanInviteCode || null,
        access_plan: inviteResult?.plan_kind || selectedPlanId || 'starter',
        access_days: inviteResult?.duration_days || null,
        access_source: inviteResult?.client_label || (selectedPlanId === 'starter' ? 'starter-self-serve' : null),
        subscription_status: 'active',
      });
      onLogin(response.data.session.user);
      setTimeout(() => {
        redirectToCleanPage();
      }, 120);
    } else {
      redirectToCleanPage({
        nextMode: 'login',
        flashMessage:
          selectedPlanId === 'starter'
            ? 'Tu acceso Starter ya quedó registrado. Revisa tu correo para confirmar la cuenta antes de entrar.'
            : 'Código validado. Revisa tu correo, confirma tu cuenta y luego entra desde Acceder.',
      });
      return;
    }
    setIsSubmitting(false);
  };

  const resetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isSupabaseConfigured) {
      setMessage('Faltan las variables de Supabase para recuperar contraseña.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage('Escribe tu correo primero y luego toca "Olvide mi contraseña".');
      return;
    }
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: getAuthRedirectUrl(),
    });
    setMessage(error
      ? friendlyAuthError(error.message)
      : 'Listo. Te enviamos un correo para recuperar tu contraseña.');
  };

  return (
    <main className={`app-shell auth-shell ${isMobileEdition ? 'mobile-edition' : ''}`}>
      <section className="auth-landing">
        {!standaloneRegister && (
          <>
        <div className="auth-topbar">
          <div className="auth-brandline">
            <img src="/aztekiller-logo.png" alt="Creators Guardian" />
            <div>
              <p className="eyebrow">Ciberseguridad premium para Creadores de Contenido</p>
              <strong>Creators Guardian</strong>
            </div>
          </div>
          <div className="auth-topbar-actions">
            <button type="button" className="auth-existing" onClick={openExistingAccess}>
              Acceder
            </button>
            <button type="button" className="auth-register-trigger" onClick={openRegisterFlow}>
              Registrarme
            </button>
          </div>
        </div>

        <section className="landing-hero">
          <div className="landing-copy">
            <span className="landing-badge">Prevencion, diagnostico y respuesta antes del desastre</span>
            <h1>Tus cuentas pueden ser hackeadas en minutos... y ni siquiera te daras cuenta.</h1>
            <p className="landing-subheadline">
              Creators Guardian detecta vulnerabilidades y protege tu identidad digital antes de que
              pierdas cuentas, contratos, archivos o acceso a tus ingresos.
            </p>
            <div className="landing-cta-row">
              <button type="button" className="landing-primary-cta" onClick={openPlanFlow}>
                Escanear mi riesgo gratis
              </button>
              <button type="button" className="landing-secondary-cta" onClick={openPlanFlow}>
                Ver planes
              </button>
            </div>
            <div className="landing-trust-row">
              <span><ShieldCheck size={16} /> Diagnostico por cuenta</span>
              <span><BellRing size={16} /> Alertas y soporte</span>
              <span><MessageCircle size={16} /> Acompanamiento humano real</span>
            </div>
          </div>

          <div className="landing-visual">
            <div className="cyber-frame">
              <div className="cyber-grid-bg" />
              <div className="cyber-scan-line" />
              <img src="/logo-definitivo.png" className="cyber-logo-watermark" alt="" aria-hidden="true" />
              {['01','10','11','00','1','0','10','01','11','1','00','10'].map((bit, i) => (
                <span key={i} className={`cyber-bit cyber-bit-${i % 6}`}>{bit}</span>
              ))}
              <div className="cyber-content">
                <div className="cyber-header-row">
                  <ShieldCheck size={22} className="cyber-icon" />
                  <div>
                    <strong>Creators Guardian</strong>
                    <span>Sistema activo · Proteccion en tiempo real</span>
                  </div>
                  <span className="cyber-status-dot" />
                </div>
                <div className="cyber-score-row">
                  <div className="cyber-score-circle">
                    <svg viewBox="0 0 36 36" className="cyber-donut">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                        strokeDasharray="84 16" strokeDashoffset="25" strokeLinecap="round" />
                    </svg>
                    <span className="cyber-score-num">84</span>
                  </div>
                  <div className="cyber-score-info">
                    <strong>Score de seguridad</strong>
                    <span>Tu cuenta esta bien protegida</span>
                    <div className="cyber-bar-wrap">
                      <div className="cyber-bar" style={{width:'84%'}} />
                    </div>
                  </div>
                </div>
                <div className="cyber-metrics-row">
                  <div className="cyber-metric-item">
                    <Lock size={14} />
                    <span>Sesiones</span>
                    <strong>24/7</strong>
                  </div>
                  <div className="cyber-metric-item">
                    <ShieldCheck size={14} />
                    <span>Amenazas</span>
                    <strong>Ninguna</strong>
                  </div>
                  <div className="cyber-metric-item">
                    <BellRing size={14} />
                    <span>Alertas</span>
                    <strong>Al dia</strong>
                  </div>
                </div>
                <div className="cyber-hex-row">
                  {['0x4A2F','0xB8C1','0x3D7E','0xF0A2','0x91CC'].map((h) => (
                    <span key={h} className="cyber-hex">{h}</span>
                  ))}
                </div>
                <CyberTerminal />
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section problem-section">
          <div className="landing-section-row">
            <div className="section-kicker">Problema</div>
          </div>
          <h2>Tu operacion diaria como creadora ya te expone aunque nunca hayas sido hackeada.</h2>
          <div className="problem-grid hscroll-grid">
            {landingRiskPoints.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="problem-card scroll-reveal">
                <Icon size={20} />
                <strong>{title}</strong>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section solution-section">
          <div className="section-kicker">Solucion</div>
          <h2>Te guiamos paso a paso para detectar, corregir y blindar antes de una perdida real.</h2>
          <div className="solution-grid hscroll-grid">
            {landingSteps.map(({ icon: Icon, title, copy }, index) => (
              <article key={title} className="solution-card scroll-reveal">
                <span className="solution-index">0{index + 1}</span>
                <Icon size={24} />
                <strong>{title}</strong>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section ref={plansRef} className="landing-section pricing-section">
          <div className="section-kicker">Selecciona tu plan</div>
          <div className="pricing-heading">
            <div>
              <h2>Elige tu nivel de proteccion antes de registrarte.</h2>
              <p>Primero eliges el plan. Despues activamos tu acceso privado con codigo.</p>
            </div>
            <a href={salesWhatsApp} target="_blank" rel="noreferrer" className="inline-button">
              Ver por WhatsApp
            </a>
          </div>
          <div className="pricing-grid-auth">
            {landingPlans.map((plan) => (
              <article
                key={plan.id}
                className={`pricing-card-auth ${plan.featured ? 'featured' : ''} ${selectedPlanId === plan.id ? 'selected' : ''}`}
              >
                <div className="pricing-card-top">
                  <span className="plan-tag">{plan.badge}</span>
                  <h3>{plan.name}</h3>
                  <strong>{plan.price}</strong>
                  <p>{plan.summary}</p>
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => openPlanRegisterTab(plan.id)}>
                  {plan.button}
                </button>
              </article>
            ))}
          </div>
        </section>

          </>
        )}
        {(standaloneRegister || mode === 'login') && (
        <section ref={authRef} className="auth-card">
          {standaloneRegister && (
            <button type="button" className="auth-back-btn" onClick={openPlanFlow}>
              <ChevronDown size={15} style={{transform:'rotate(90deg)'}} />
              Ver planes
            </button>
          )}
          <div className="auth-card-head">
            <img src="/aztekiller-logo.png" alt="Aztekiller" />
            <div>
              <p className="eyebrow">Acceso privado</p>
              <h3>{mode === 'register' ? `Registro ${selectedPlan.name}` : 'Entra a tu guardian'}</h3>
            </div>
          </div>
          <p className="auth-card-copy">
            {mode === 'register'
              ? 'Este formulario ya quedó configurado para el plan que elegiste. Completa tus datos y sigue el flujo correcto para activar tu acceso.'
              : 'Cada creador entra con su correo y sus datos quedan separados en la nube: checklist, cuentas, progreso y revisiones.'}
          </p>
          {selectedPlan && mode === 'register' && (
            <div className="selected-plan-banner">
              <span className="eyebrow">Plan seleccionado</span>
              <strong>{selectedPlan.name}</strong>
              <span>{selectedPlan.price} · {selectedPlan.summary}</span>
              <small>
                {selectedPlanId === 'starter'
                  ? 'Registro directo sin código. Entras al momento y luego podrás subir de plan cuando lo necesites.'
                  : `Registro premium con ${selectedPaymentProvider || 'pago guiado'} + comprobante + código de acceso privado.`}
              </small>
            </div>
          )}
          {mode === 'register' && <div className="auth-plan-note">
            <p className="eyebrow">Consulta personalizada</p>
            <strong>Si no sabes que plan elegir, te orientamos antes de crear tu acceso.</strong>
            <span>Si todavía no eliges plan, vuelve a la sección “Selecciona tu plan” y abre el registro correcto.</span>
            <a href={salesWhatsApp} target="_blank" rel="noreferrer">
              Hablar por WhatsApp
            </a>
          </div>}
          <form onSubmit={submit}>
            <label>
              Correo
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="creador@correo.com"
                autoComplete="email"
              />
            </label>
            {mode === 'register' && (
              <>
                <label>
                  Nombre
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Javier, Valeria..."
                    autoComplete="name"
                  />
                </label>
                <label>
                  Telefono
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+52..."
                    autoComplete="tel"
                  />
                </label>
                <label>
                  País
                  <select value={country} onChange={(event) => setCountry(event.target.value)}>
                    <option value="">Selecciona tu país</option>
                    {countryOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Marca o nombre UGC
                  <input
                    value={brandName}
                    onChange={(event) => setBrandName(event.target.value)}
                    placeholder="Aztekiller, Mi marca..."
                  />
                </label>
                <label>
                  Usuario principal
                  <input
                    value={mainHandle}
                    onChange={(event) => setMainHandle(event.target.value)}
                    placeholder="@usuario"
                  />
                </label>
                <div className="payment-guide">
                  <div className="payment-guide-head">
                    <p className="eyebrow">{selectedPlanId === 'starter' ? 'Activación directa' : 'Pago del plan'}</p>
                    <strong>{selectedPlan.name} · {selectedPlan.price}</strong>
                    <span>
                      {selectedPlanId === 'starter'
                        ? 'Este registro no pide código. Completa tus datos, crea tu acceso y entras directo con funciones limitadas del plan gratis.'
                        : country.trim()
                          ? `Como elegiste ${country}, te toca pagar con ${selectedPaymentProvider}. Después envíanos el comprobante por WhatsApp y te damos tu código privado.`
                          : 'Primero selecciona tu país para mostrarte el enlace de pago correcto y cómo pedir tu código.'}
                    </span>
                  </div>
                  <div className="payment-guide-actions">
                    {selectedPlanId !== 'starter' ? (
                      <>
                        <a
                          className={`inline-button ${!selectedPaymentLink ? 'disabled-link' : ''}`}
                          href={selectedPaymentLink || undefined}
                          target="_blank"
                          rel="noreferrer"
                          aria-disabled={!selectedPaymentLink}
                          onClick={(event) => {
                            if (!selectedPaymentLink) event.preventDefault();
                          }}
                        >
                          Abrir pago de {selectedPaymentProvider || 'tu plan'}
                        </a>
                        <a className="secondary-action" href={paymentWhatsApp} target="_blank" rel="noreferrer">
                          Enviar comprobante por WhatsApp
                        </a>
                      </>
                    ) : (
                      <span className="starter-flow-badge">Sin pago y sin código para empezar.</span>
                    )}
                  </div>
                  <ul className="payment-guide-list">
                    {selectedPlanId === 'starter' ? (
                      <>
                        <li>1. Completa tu registro con correo, país y marca.</li>
                        <li>2. Entras con Guardián Starter al momento.</li>
                        <li>3. Si luego quieres Pro, Elite o Shield, te guiamos por WhatsApp.</li>
                      </>
                    ) : (
                      <>
                        <li>1. Elige tu país.</li>
                        <li>2. Abre el pago correcto para tu plan.</li>
                        <li>3. Envíanos el comprobante por WhatsApp.</li>
                        <li>4. Nosotros te compartimos tu código de acceso.</li>
                      </>
                    )}
                  </ul>
                  <div className="plan-access-list">
                    {selectedPlan.features.map((feature) => (
                      <span key={feature}>
                        <Check size={14} />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedPlanId !== 'starter' && (
                  <>
                    <label>
                      Codigo privado de acceso
                      <div className="invite-code-row">
                        <input
                          value={inviteCode}
                          onChange={(event) => {
                            setInviteCode(event.target.value.toUpperCase());
                            setInvitePreview(null);
                          }}
                          placeholder="CREATOR-XXXXXXXX"
                          autoCapitalize="characters"
                          autoCorrect="off"
                        />
                        <button type="button" className="ghost-button" onClick={() => previewInviteCode()} disabled={isCheckingInvite}>
                          {isCheckingInvite ? 'Validando...' : 'Validar'}
                        </button>
                      </div>
                    </label>
                    {invitePreview && (
                      <div className={`invite-preview ${invitePreview.valid ? 'ok' : 'bad'}`}>
                        <strong>{invitePreview.valid ? 'Codigo listo' : 'Codigo no valido'}</strong>
                        <span>{invitePreview.message}</span>
                        {invitePreview.valid && (
                          <small>
                            Plan: {invitePreview.plan_kind ? getPlanConfig(invitePreview.plan_kind).name : 'privado'} · usos restantes: {invitePreview.remaining_uses ?? 0}
                            {invitePreview.client_label ? ` · referencia: ${invitePreview.client_label}` : ''}
                          </small>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            <label>
              Contrasena
              <div className="auth-password-wrap">
                <input
                  type={showAuthPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimo 8 caracteres"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowAuthPwd((v) => !v)}>
                  {showAuthPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            {mode === 'login' && (
              <label className="remember-access">
                <input
                  type="checkbox"
                  checked={rememberAccess}
                  onChange={(event) => setRememberAccess(event.target.checked)}
                />
                <span>Recordar mi correo y mantener mi sesión abierta en este equipo</span>
              </label>
            )}
            {message && <div className="auth-message">{message}</div>}
            <button type="submit" disabled={isSubmitting}>
              <Lock size={18} />
              {isSubmitting ? 'Conectando...' : mode === 'register' ? 'Crear acceso' : 'Entrar'}
            </button>
          </form>
          {mode === 'login' && (
            <button type="button" className="forgot-password" onClick={resetPassword}>
              Olvide mi contraseña
            </button>
          )}
          <button className="auth-switch" onClick={() => {
            if (mode === 'login' && !standaloneRegister) {
              openRegisterFlow();
              return;
            }
            setMode((value) => (value === 'login' ? 'register' : 'login'));
            setMessage('');
            setInvitePreview(null);
            setTimeout(() => scrollToRef(authRef), 40);
          }}>
            {mode === 'login' && !standaloneRegister ? 'Registrarme con un plan' : mode === 'login' ? 'Crear usuario nuevo' : 'Ya tengo usuario'}
          </button>
          <small>
            Acceso protegido por Supabase. Cada creador solo puede ver sus propios datos.
          </small>
        </section>
        )}
      </section>
      {!standaloneRegister && (
        <button type="button" className="auth-cta-sticky" onClick={openPlanFlow}>
          Escanear mi riesgo
        </button>
      )}
    </main>
  );
}

function scorePassword(password) {
  let score = 0;
  if (password.length >= 14) score += 25;
  if (password.length >= 20) score += 15;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  if (!/(.)\1{2,}/.test(password)) score += 10;
  if (!/password|aztek|ugc|admin|1234|qwerty/i.test(password)) score += 5;
  return Math.min(100, score);
}

function generatePassword(length = 16, options = { uppercase: true, lowercase: true, numbers: true, symbols: true }) {
  const ambiguous = '0O1lI';
  const normalizePool = (pool) => (options.noAmbiguous ? pool.split('').filter((char) => !ambiguous.includes(char)).join('') : pool);
  const pools = [
    options.uppercase !== false ? normalizePool('ABCDEFGHJKLMNPQRSTUVWXYZ') : '',
    options.lowercase !== false ? normalizePool('abcdefghijkmnopqrstuvwxyz') : '',
    options.numbers !== false ? normalizePool('23456789') : '',
    options.symbols !== false && !options.easy ? '!@#$%&*?_+-=' : '',
  ].filter(Boolean);
  const chars = pools.join('') || 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  const passwordChars = Array.from(bytes, (n) => chars[n % chars.length]);

  pools.forEach((pool, index) => {
    if (index < passwordChars.length) {
      passwordChars[index] = pool[bytes[index] % pool.length];
    }
  });

  return passwordChars.sort(() => crypto.getRandomValues(new Uint32Array(1))[0] - 2147483648).join('');
}

function getPasswordStrengthLabel(score) {
  if (score >= 90) return { label: 'Muy fuerte', className: 'healthy', crack: 'siglos con fuerza bruta' };
  if (score >= 75) return { label: 'Fuerte', className: 'good', crack: 'anos con fuerza bruta' };
  if (score >= 55) return { label: 'Aceptable', className: 'warning', crack: 'dias o meses si se filtra' };
  if (score >= 35) return { label: 'Debil', className: 'risk', crack: 'horas o dias si se filtra' };
  return { label: 'Muy debil', className: 'critical', crack: 'minutos si se filtra' };
}

async function checkPasswordPwned(password) {
  if (!password || !crypto.subtle) return { status: 'idle', message: 'Genera o escribe una contrasena para revisarla.' };
  const buffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hash = Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  if (!response.ok) return { status: 'error', message: 'No se pudo consultar la base publica de contrasenas filtradas.' };
  const text = await response.text();
  const match = text.split('\n').find((line) => line.split(':')[0] === suffix);
  if (!match) return { status: 'safe', message: 'Esta contrasena no aparece en filtraciones conocidas.' };
  const count = Number(match.split(':')[1] || 0).toLocaleString('es-MX');
  return { status: 'danger', message: `Esta contrasena aparece ${count} veces en filtraciones. No la uses.` };
}

function getEmailSafetyHint(email) {
  const clean = email.trim().toLowerCase();
  if (!clean) return { level: 'Listo', risk: 0, message: 'Agrega un correo asociado para revisar senales basicas.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { level: 'Alto', risk: 78, message: 'El formato no parece un correo valido. Revisa antes de guardar.' };
  }
  const publicProvider = /(gmail|hotmail|outlook|icloud|yahoo)\.com$/.test(clean);
  const exposedName = /(ugc|creator|influencer|contacto|collab|brand|admin)/.test(clean.split('@')[0]);
  const risk = 18 + (publicProvider ? 12 : 0) + (exposedName ? 18 : 0);
  const level = risk >= 45 ? 'Medio' : 'Bajo';
  return {
    level,
    risk,
    message: publicProvider
      ? 'Usa este correo solo si no esta publicado. Para cuentas importantes conviene un alias privado.'
      : 'Buen enfoque si este correo no esta publicado y solo se usa para recuperacion.',
  };
}

function getLocalJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function analyzeInput(type, value) {
  const text = value.trim().toLowerCase();
  const flags = [];
  let risk = 12;

  if (!text) return { risk: 0, level: 'Listo', flags: ['Pega un correo, link o dominio para analizar.'] };

  if (type === 'email') {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    if (!valid) {
      risk += 35;
      flags.push('Formato de correo irregular.');
    }
    if (/(support|security|brand|collab|team)[._-]?\d+@/.test(text)) {
      risk += 12;
      flags.push('Nombre generico usado con frecuencia en phishing.');
    }
    if (/(gmail|outlook|hotmail|icloud)\.com$/.test(text)) {
      risk += 10;
      flags.push('Dominio comun: pide validacion adicional si dice representar a una marca.');
    }
  }

  if (type === 'url') {
    try {
      const url = new URL(text.startsWith('http') ? text : `https://${text}`);
      const host = url.hostname;
      if (url.protocol !== 'https:') {
        risk += 25;
        flags.push('No usa HTTPS.');
      }
      if (shorteners.some((domain) => host.includes(domain))) {
        risk += 28;
        flags.push('Usa acortador de enlaces.');
      }
      if (suspiciousTlds.some((tld) => host.endsWith(tld))) {
        risk += 22;
        flags.push('Dominio con TLD de alto abuso.');
      }
      if (host.split('.').length > 3) {
        risk += 12;
        flags.push('Tiene muchos subdominios; verifica que el dominio real sea correcto.');
      }
      if (/@/.test(text) || /%2f|%40|xn--/.test(text)) {
        risk += 20;
        flags.push('Contiene caracteres usados para ocultar destinos.');
      }
    } catch {
      risk += 35;
      flags.push('No parece una URL valida.');
    }
  }

  riskyWords.forEach((word) => {
    if (text.includes(word)) {
      risk += 4;
    }
  });

  if (!flags.length) flags.push('Sin alertas obvias. Verifica reputacion antes de abrir.');
  const level = risk >= 70 ? 'Alto' : risk >= 38 ? 'Medio' : 'Bajo';
  return { risk: Math.min(100, risk), level, flags };
}

function analyzePhishingMessage(value) {
  const text = value.toLowerCase();
  const flags = [];
  let risk = 10;

  [
    ['urgente', 'Usa urgencia para presionarte.'],
    ['verifica tu cuenta', 'Pide verificar cuenta, senal comun de phishing.'],
    ['password', 'Menciona contraseñas o acceso.'],
    ['contraseña', 'Menciona contraseñas o acceso.'],
    ['pago adelantado', 'Promete pago adelantado; valida identidad de marca.'],
    ['descarga', 'Pide descargar algo. Revisa archivo antes de abrir.'],
    ['zip', 'Menciona archivos comprimidos. Riesgo elevado.'],
    ['bit.ly', 'Usa acortador de links.'],
    ['tinyurl', 'Usa acortador de links.'],
    ['premio', 'Usa incentivo o premio sospechoso.'],
    ['inicia sesión', 'Pide iniciar sesión desde un enlace.'],
  ].forEach(([needle, flag]) => {
    if (text.includes(needle)) {
      risk += 10;
      flags.push(flag);
    }
  });

  if (/https?:\/\/\S+/i.test(value)) {
    risk += 12;
    flags.push('Incluye link. Verifica dominio antes de abrir.');
  }

  if (/@gmail\.com|@hotmail\.com|@outlook\.com/i.test(value)) {
    risk += 8;
    flags.push('Usa correo comun. Si dice ser marca, pide correo corporativo.');
  }

  if (!flags.length && value.trim()) {
    flags.push('No detecté señales obvias. Aún así verifica dominio, correo y archivo.');
  }

  const level = risk >= 70 ? 'Alto' : risk >= 40 ? 'Medio' : value.trim() ? 'Bajo' : 'Listo';
  return {
    risk: Math.min(100, value.trim() ? risk : 0),
    level,
    flags: value.trim() ? flags : ['Pega aqui el mensaje de la marca o colaboracion.'],
  };
}

async function sha256File(file) {
  const buffer = await file.arrayBuffer();
  if (crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return bytesToHex(sha256(new Uint8Array(buffer)));
}

function LockedSection({ requiredPlan, section, description, onGoHome }) {
  const planConfig = getPlanConfig(requiredPlan);
  return (
    <div className="locked-section-wall">
      <div className="locked-wall-icon"><Lock size={44} /></div>
      <h3>{section}</h3>
      <p>{description || `Esta sección requiere el plan ${planConfig.name} o superior.`}</p>
      <div className="locked-wall-plan">
        <span className="locked-plan-badge">{planConfig.name}</span>
        {requiredPlan === 'elite' && <span className="locked-plan-badge">Guardián Shield</span>}
      </div>
      <a
        href={salesWhatsApp}
        target="_blank"
        rel="noreferrer"
        className="locked-upgrade-btn"
      >
        <Sparkles size={16} />
        Ver planes de pago
      </a>
      {onGoHome && (
        <button type="button" className="locked-back-btn" onClick={onGoHome}>
          <ChevronDown size={15} style={{transform:'rotate(90deg)'}} />
          Volver al inicio
        </button>
      )}
    </div>
  );
}

function CalendlyWidget({ url }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const existing = document.getElementById('calendly-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'calendly-script';
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);
  return (
    <div
      ref={ref}
      className="calendly-inline-widget"
      data-url={url}
      style={{ minWidth: '320px', height: '700px' }}
    />
  );
}

function GuardianDashboard({ currentUser, onLogout }) {
  const isMobileEdition = window.location.pathname.toLowerCase().includes('mobile');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos dias' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const [activeView, setActiveView] = useState('home');
  const [activeTool, setActiveTool] = useState('verify');
  const [activeVerifyTool, setActiveVerifyTool] = useState('scanner');
  const [activeAppCategory, setActiveAppCategory] = useState('essential');
  const [botMessages, setBotMessages] = useState([
    {
      role: 'assistant',
      content: 'Hola, soy AztekBot. Puedo ayudarte con dudas de seguridad, links raros, 2FA, contraseñas, recuperación de cuentas y uso de Creators Guardian.',
    },
  ]);
  const [botInput, setBotInput] = useState('');
  const [botStatus, setBotStatus] = useState('');
  const [botLoading, setBotLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('Instagram');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [checks, setChecks] = useState({});
  const [accounts, setAccounts] = useState(defaultAccounts);
  const [syncStatus, setSyncStatus] = useState('Sincronizando...');
  const [passwordLength, setPasswordLength] = useState(16);
  const [passwordOptions, setPasswordOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    noAmbiguous: false,
    easy: false,
  });
  const [password, setPassword] = useState(() => generatePassword(16, {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    noAmbiguous: false,
    easy: false,
  }));
  const [showPassword, setShowPassword] = useState(true);
  const [passwordHistory, setPasswordHistory] = useState(() => getLocalJson('creators-password-history', []));
  const [pwnedPasswordResult, setPwnedPasswordResult] = useState(null);
  const [scanType, setScanType] = useState('url');
  const [scanValue, setScanValue] = useState('');
  const [emailCheckValue, setEmailCheckValue] = useState('');
  const [emailCheckResult, setEmailCheckResult] = useState(null);
  const [emailCheckStatus, setEmailCheckStatus] = useState('idle');
  const [vaultCodesText, setVaultCodesText] = useState('');
  const [openVaultProfileId, setOpenVaultProfileId] = useState('');
  const [backupVault, setBackupVault] = useState(() => getLocalJson('creators-backup-vault', {}));
  const [maintenanceState, setMaintenanceState] = useState(() => getLocalJson('ugc-maintenance-tasks', {}));
  const [phishingText, setPhishingText] = useState('');
  const [incidentText, setIncidentText] = useState('');
  const [incidentAccountId, setIncidentAccountId] = useState('');
  const [incidentType, setIncidentType] = useState('Intento de acceso');
  const [incidentSeverity, setIncidentSeverity] = useState('media');
  const [incidentOccurredAt, setIncidentOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [incidentStatus, setIncidentStatus] = useState('');
  const [fileScan, setFileScan] = useState(null);
  const [fileScanStatus, setFileScanStatus] = useState('');
  const [auditFile, setAuditFile] = useState(null);
  const [auditFileStatus, setAuditFileStatus] = useState('');
  const [auditFileNote, setAuditFileNote] = useState('');
  const [auditFileUrgency, setAuditFileUrgency] = useState('normal');
  const [copied, setCopied] = useState('');
  const [accountNotice, setAccountNotice] = useState('');
  const [appointmentStatus, setAppointmentStatus] = useState('');
  const [adminTab, setAdminTab] = useState('users');
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [adminAppointments, setAdminAppointments] = useState([]);
  const [adminAccountReports, setAdminAccountReports] = useState([]);
  const [adminIncidents, setAdminIncidents] = useState([]);
  const [adminNotes, setAdminNotes] = useState([]);
  const [adminStudioLogs, setAdminStudioLogs] = useState([]);
  const [academyDbVideos, setAcademyDbVideos] = useState([]);
  const [academyLoaded, setAcademyLoaded] = useState(false);
  const [adminAcademyVideos, setAdminAcademyVideos] = useState([]);
  const [adminAcademyForm, setAdminAcademyForm] = useState({ title:'', description:'', level:'Básico', duration:'', youtube_url:'' });
  const [adminNoteUserId, setAdminNoteUserId] = useState('');
  const [adminNoteText, setAdminNoteText] = useState('');
  const [adminInviteCodes, setAdminInviteCodes] = useState([]);
  const [adminCodeLabel, setAdminCodeLabel] = useState('');
  const [adminCodePlan, setAdminCodePlan] = useState('starter');
  const [adminCodeDays, setAdminCodeDays] = useState('30');
  const [adminCodeUses, setAdminCodeUses] = useState('1');
  const [adminCodeNotes, setAdminCodeNotes] = useState('');
  const [adminAssignedName, setAdminAssignedName] = useState('');
  const [adminAssignedEmail, setAdminAssignedEmail] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminPlanFilter, setAdminPlanFilter] = useState('all');
  const [adminStatusFilter, setAdminStatusFilter] = useState('all');
  const [adminCodeGenerating, setAdminCodeGenerating] = useState(false);
  const [adminGeneratedCode, setAdminGeneratedCode] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [pendingEdits, setPendingEdits] = useState({});
  const [editingProfile, setEditingProfile] = useState(false);
  const [studioTab, setStudioTab] = useState('calculator');
  const [studioCountry, setStudioCountry] = useState('México');
  const [studioState, setStudioState] = useState('Ciudad de México');
  const [studioCity, setStudioCity] = useState('');
  const [studioPlatform, setStudioPlatform] = useState('TikTok');
  const [studioContentType, setStudioContentType] = useState('video60');
  const [studioFollowers, setStudioFollowers] = useState('10k-50k');
  const [studioUsageRights, setStudioUsageRights] = useState('Solo orgánico');
  const [studioBrandType, setStudioBrandType] = useState('Nacional');
  const [studioBrandOffer, setStudioBrandOffer] = useState('');
  const [studioExpected, setStudioExpected] = useState('');
  const [studioResult, setStudioResult] = useState(null);
  const [studioContractText, setStudioContractText] = useState('');
  const [studioContractResult, setStudioContractResult] = useState(null);
  const [studioContractLoading, setStudioContractLoading] = useState(false);
  const [deals, setDeals] = useState([]);
  const [dealsLoaded, setDealsLoaded] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [expandedDealId, setExpandedDealId] = useState(null);
  const emptyDeal = { brand_name:'', product_service:'', platform:'TikTok', content_type:'Video 60s', quantity:1, received_date:'', script_due_date:'', delivery_date:'', publish_date:'', usage_rights:'Solo orgánico', hashtags:'', mentions:'', restrictions:'', amount:'', currency:'MXN', payment_status:'pendiente', contact_name:'', contact_whatsapp:'', notes:'', contract_signed:false, brief_received:false, script_approved:false, filmed:false, edited:false, delivered:false, brand_approved:false, published:false, payment_received:false };
  const [newDeal, setNewDeal] = useState(emptyDeal);
  const [onboardStep, setOnboardStep] = useState(() => {
    if (!currentUser?.id) return -1;
    return localStorage.getItem(`creators_onboarded_${currentUser.id}`) ? -1 : 0;
  });
  const [profileEditData, setProfileEditData] = useState({});
  const [profileSaveStatus, setProfileSaveStatus] = useState('');
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState(null);
  const [adminStatus, setAdminStatus] = useState('Listo');
  const [accountActionStatus, setAccountActionStatus] = useState('');
  const [isChangingToStarter, setIsChangingToStarter] = useState(false);
  const selectedEmailReviewRef = useRef(null);
  const botMessagesRef = useRef(null);

  const isAdmin = adminEmails.includes(currentUser.email?.toLowerCase());
  const totalChecks = checklistGroups.flatMap((group) => group.items).length;
  const completedChecks = Object.values(checks).filter(Boolean).length;
  const securityScore = Math.round((completedChecks / totalChecks) * 100);
  const displayUser =
    creatorProfile?.full_name
    || currentUser.user_metadata?.full_name
    || currentUser.email?.split('@')[0]
    || 'creador';
  const brandLabel = creatorProfile?.brand_name || currentUser.user_metadata?.brand_name || 'tu marca personal';
  const visibleBotMessages = useMemo(() => trimBotMessages(botMessages), [botMessages]);
  const rawPlanId = isAdmin ? 'shield' : normalizePlanId(creatorProfile?.access_plan);
  const expiresAtMs = creatorProfile?.access_expires_at ? new Date(creatorProfile.access_expires_at).getTime() : null;
  const graceEndsAtMs = expiresAtMs ? expiresAtMs + (gracePeriodDays * 24 * 60 * 60 * 1000) : null;
  const nowMs = Date.now();
  const isPaidRawPlan = paidPlanIds.includes(rawPlanId);
  const isInGraceWindow = !isAdmin && isPaidRawPlan && expiresAtMs && nowMs > expiresAtMs && nowMs <= graceEndsAtMs;
  const shouldDowngradeToStarter = !isAdmin && isPaidRawPlan && graceEndsAtMs && nowMs > graceEndsAtMs;
  const currentPlanId = isAdmin ? 'shield' : shouldDowngradeToStarter ? 'starter' : rawPlanId;
  const currentPlan = getPlanConfig(currentPlanId);
  const effectiveSubscriptionStatus = shouldDowngradeToStarter
    ? 'active'
    : isInGraceWindow
      ? 'past_due'
      : subscriptionStatus;
  const hasPaidPlan = isAdmin || paidPlanIds.includes(currentPlanId);
  const canAccessCanva = hasPaidPlan;
  const canAccessBot = isAdmin || ['pro', 'elite', 'shield'].includes(currentPlanId);
  const canAccessAcademy = isAdmin || ['pro', 'elite', 'shield'].includes(currentPlanId);
  const canAccessEmergency = isAdmin || ['elite', 'shield'].includes(currentPlanId);
  const canAccessExpertWhatsApp = isAdmin || ['elite', 'shield'].includes(currentPlanId);
  const canAccessAdvancedTools = isAdmin || ['pro', 'elite', 'shield'].includes(currentPlanId);
  const canAccessStudio = isAdmin || ['pro', 'elite', 'shield'].includes(currentPlanId);
  const accountDeletionWhatsApp = `https://wa.me/524561175410?text=${encodeURIComponent(
    `Hola, quiero eliminar mi cuenta de Creators Guardian.\n\nNombre: ${displayUser}\nCorreo: ${currentUser.email || 'Sin correo'}\nPlan actual: ${currentPlan.name}\nMotivo: `,
  )}`;
  const planStatusLabel = effectiveSubscriptionStatus === 'past_due'
    ? `Prórroga activa (${gracePeriodDays} días)`
    : effectiveSubscriptionStatus || 'active';
  const passwordScore = scorePassword(password);
  const scan = useMemo(() => analyzeInput(scanType, scanValue), [scanType, scanValue]);
  const phishingScan = useMemo(() => analyzePhishingMessage(phishingText), [phishingText]);
  const platformAccounts = useMemo(
    () => accounts.filter((account) => account.platform === selectedPlatform),
    [accounts, selectedPlatform],
  );
  const selectedAccount = platformAccounts.find((account) => account.id === selectedAccountId) || platformAccounts[0] || null;
  const selectedAccountIndex = selectedAccount ? accounts.findIndex((account) => account.id === selectedAccount.id) : -1;
  const selectedAccountScore = selectedAccount
    ? Math.round((accountCheckItems.filter((item) => checks[`account-${selectedAccount.id}-${item.label}`]).length / accountCheckItems.length) * 100)
    : 0;
  const selectedAccountLabel = getScoreLabel(selectedAccountScore);
  const passwordStrength = getPasswordStrengthLabel(passwordScore);
  const selectedEmailHint = getEmailSafetyHint(selectedAccount?.emailLabel || '');
  const selectedAccountEmail = (selectedAccount?.emailLabel || '').trim().toLowerCase();
  const selectedEmailReview = emailCheckResult
    && selectedAccountEmail
    && emailCheckResult.email?.trim().toLowerCase() === selectedAccountEmail
      ? emailCheckResult
      : null;
  const selectedVault = selectedAccount?.id ? backupVault[selectedAccount.id] : null;
  const selectedQuickLinks = platformQuickLinks[selectedAccount?.platform || selectedPlatform] || [];
  const pendingMaintenanceTasks = useMemo(() => {
    const now = Date.now();
    return accounts.flatMap((account) => maintenanceTemplates.map((task) => {
      const key = `${account.id || account.platform}-${task.key}`;
      const completedAt = maintenanceState[key]?.completedAt || 0;
      const dueAt = completedAt ? completedAt + task.cadence * 24 * 60 * 60 * 1000 : now;
      const daysLeft = Math.ceil((dueAt - now) / (24 * 60 * 60 * 1000));
      return {
        ...task,
        key,
        account,
        daysLeft,
        urgent: daysLeft <= 0,
      };
    })).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 6);
  }, [accounts, maintenanceState]);
  const auditWhatsAppText = auditFile
    ? `https://wa.me/524561175410?text=${encodeURIComponent(
        `Hola, soy ${displayUser}. Necesito auditoría de archivo para Creators Guardian.\n\nArchivo: ${auditFile.name}\nTamaño: ${(auditFile.size / 1024 / 1024).toFixed(2)} MB\nSHA-256: ${auditFile.hash}\nRiesgo local: ${auditFile.risk}\nUrgencia: ${auditFileUrgency}\nNotas: ${auditFileNote || 'Sin notas'}\n\nSolicito que el equipo de seguridad verifique si es seguro abrirlo antes de continuar.`,
      )}`
    : emergencyWhatsApp;
  const canvaAccessUrl = `https://wa.me/524561175410?text=${encodeURIComponent(
    `Hola, quiero pedir mi acceso a Canva incluido en mi plan ${currentPlan.name}.\n\nNombre: ${displayUser}\nCorreo: ${currentUser.email || 'Sin correo'}\nMarca: ${brandLabel}`,
  )}`;

  useEffect(() => {
    if (platformAccounts.length && !platformAccounts.some((account) => account.id === selectedAccountId)) {
      setSelectedAccountId(platformAccounts[0].id || '');
    }
  }, [platformAccounts, selectedAccountId]);

  useEffect(() => {
    const loadCloudData = async () => {
      if (!supabase || !currentUser?.id) return;
      setSyncStatus('Sincronizando...');

      const [{ data: profileData }, { data: securityData }, { data: accountData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, phone, brand_name, main_handle, subscription_status, access_plan, access_code, access_expires_at')
          .eq('id', currentUser.id)
          .maybeSingle(),
        supabase
          .from('security_state')
          .select('checks')
          .eq('user_id', currentUser.id)
          .maybeSingle(),
        supabase
          .from('accounts')
          .select('id, platform, owner, profile_type, handle, email_label, status, last_review')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: true }),
      ]);

      if (profileData) {
        setCreatorProfile(profileData);
        const resolvedStatus = (
          !isAdmin &&
          !profileData.access_code &&
          normalizePlanId(profileData.access_plan) !== 'starter' &&
          profileData.subscription_status !== 'active'
        )
          ? 'blocked'
          : (profileData.subscription_status || 'active');
        setSubscriptionStatus(resolvedStatus);
      } else {
        const { data: insertedProfile } = await supabase
          .from('profiles')
          .upsert({
            id: currentUser.id,
            email: currentUser.email,
            username: currentUser.email?.split('@')[0] || 'creador',
            full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null,
            subscription_status: 'active',
          })
          .select('full_name, phone, brand_name, main_handle, subscription_status, access_plan, access_code, access_expires_at')
          .maybeSingle();
        if (insertedProfile) {
          setCreatorProfile(insertedProfile);
          const resolvedStatus = (
            !isAdmin &&
            !insertedProfile.access_code &&
            normalizePlanId(insertedProfile.access_plan) !== 'starter' &&
            insertedProfile.subscription_status !== 'active'
          )
            ? 'blocked'
            : (insertedProfile.subscription_status || 'active');
          setSubscriptionStatus(resolvedStatus);
        }
      }

      if (securityData?.checks) {
        setChecks(securityData.checks);
      }

      if (accountData?.length) {
        setAccounts(accountData.map((account) => ({
          id: account.id,
          platform: account.platform,
          owner: account.owner,
          profileType: account.profile_type || account.owner || 'Principal',
          handle: account.handle || '',
          emailLabel: account.email_label || '',
          status: account.status,
          lastReview: account.last_review,
        })));
      } else {
        const seeded = defaultAccounts.map((account) => ({
          ...account,
          user_id: currentUser.id,
          profile_type: account.profileType,
          handle: account.handle,
          email_label: account.emailLabel,
          last_review: account.lastReview,
        }));
        const { data } = await supabase
          .from('accounts')
          .insert(seeded.map((account) => ({
            user_id: account.user_id,
            platform: account.platform,
            owner: account.owner,
            profile_type: account.profileType,
            handle: account.handle,
            email_label: account.emailLabel,
            status: account.status,
            last_review: account.lastReview,
          })))
          .select('id, platform, owner, profile_type, handle, email_label, status, last_review');
        if (data?.length) {
          setAccounts(data.map((account) => ({
            id: account.id,
            platform: account.platform,
            owner: account.owner,
            profileType: account.profile_type || account.owner || 'Principal',
            handle: account.handle || '',
            emailLabel: account.email_label || '',
            status: account.status,
            lastReview: account.last_review,
          })));
        }
      }

      setSyncStatus('Guardado en la nube');
    };

    loadCloudData();
  }, [currentUser]);

  useEffect(() => {
    const downgradeExpiredPlan = async () => {
      if (!supabase || !currentUser?.id || isAdmin || !shouldDowngradeToStarter || rawPlanId === 'starter') return;
      const nextProfile = {
        ...creatorProfile,
        access_plan: 'starter',
        access_code: null,
        access_expires_at: null,
        subscription_status: 'active',
      };
      setCreatorProfile(nextProfile);
      setSubscriptionStatus('active');
      setSyncStatus(`Tu plan venció y pasó a Guardián Starter después de ${gracePeriodDays} días de prórroga.`);
      await supabase.from('profiles').upsert({
        id: currentUser.id,
        email: currentUser.email,
        username: currentUser.email?.split('@')[0] || 'creador',
        full_name: nextProfile?.full_name || currentUser.user_metadata?.full_name || null,
        phone: nextProfile?.phone || currentUser.user_metadata?.phone || null,
        brand_name: nextProfile?.brand_name || currentUser.user_metadata?.brand_name || null,
        main_handle: nextProfile?.main_handle || currentUser.user_metadata?.main_handle || null,
        access_plan: 'starter',
        access_code: null,
        access_days: null,
        access_source: 'downgrade-automatico',
        access_expires_at: null,
        subscription_status: 'active',
      });
    };

    downgradeExpiredPlan();
  }, [
    creatorProfile,
    currentUser?.email,
    currentUser?.id,
    currentUser?.user_metadata?.brand_name,
    currentUser?.user_metadata?.full_name,
    currentUser?.user_metadata?.main_handle,
    currentUser?.user_metadata?.phone,
    isAdmin,
    rawPlanId,
    shouldDowngradeToStarter,
  ]);

  const saveChecks = async (nextChecks) => {
    setChecks(nextChecks);
    if (!supabase || !currentUser?.id) return;
    setSyncStatus('Guardando...');
    const { error } = await supabase.from('security_state').upsert({
      user_id: currentUser.id,
      checks: nextChecks,
      updated_at: new Date().toISOString(),
    });
    setSyncStatus(error ? 'Error al guardar' : 'Guardado en la nube');
  };

  const copyText = async (text, label) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  const addAccount = async (platform = selectedPlatform) => {
    const existingTypes = accounts
      .filter((account) => account.platform === platform)
      .map((account) => account.profileType || account.owner);
    const nextType = profileTypes.find((type) => !existingTypes.includes(type)) || `Alterna ${existingTypes.length}`;
    const nextAccount = {
      platform,
      owner: nextType,
      profileType: nextType,
      handle: '',
      emailLabel: '',
      status: 'Revisar',
      lastReview: new Date().toLocaleDateString('es-MX'),
    };
    setAccounts((prev) => [...prev, nextAccount]);
    setSelectedPlatform(platform);
    if (!supabase || !currentUser?.id) return;
    setSyncStatus('Guardando...');
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: currentUser.id,
        platform: nextAccount.platform,
        owner: nextAccount.owner,
        profile_type: nextAccount.profileType,
        handle: nextAccount.handle,
        email_label: nextAccount.emailLabel,
        status: nextAccount.status,
        last_review: nextAccount.lastReview,
      })
      .select('id, platform, owner, profile_type, handle, email_label, status, last_review')
      .single();
    if (data) {
      setAccounts((prev) => prev.map((account, index) => (
        index === prev.length - 1 ? { ...account, id: data.id } : account
      )));
      setSelectedAccountId(data.id);
    }
    setSyncStatus(error ? 'Error al guardar' : 'Guardado en la nube');
  };

  const updateAccountFields = async (index, fields) => {
    const nextAccounts = accounts.map((account, i) => (i === index ? { ...account, ...fields } : account));
    setAccounts(nextAccounts);
    const account = nextAccounts[index];
    if (!supabase || !currentUser?.id || !account?.id) return;
    setSyncStatus('Guardando...');
    const { error } = await supabase
      .from('accounts')
      .update({
        platform: account.platform,
        owner: account.owner,
        profile_type: account.profileType,
        handle: account.handle,
        email_label: account.emailLabel,
        status: account.status,
        last_review: account.lastReview,
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);
    setSyncStatus(error ? 'Error al guardar' : 'Guardado en la nube');
  };

  const updateAccount = (index, field, value) => updateAccountFields(index, { [field]: value });

  const changeProfileType = (index, nextType) => {
    const account = accounts[index];
    const typeExists = accounts.some((item, itemIndex) => (
      itemIndex !== index
      && item.platform === account.platform
      && (item.profileType || item.owner) === nextType
    ));

    if (typeExists) {
      setAccountNotice(`Ya existe un perfil ${nextType} en ${account.platform}.`);
      setTimeout(() => setAccountNotice(''), 2200);
      return;
    }

    setAccountNotice('');
    updateAccountFields(index, {
      profileType: nextType,
      owner: nextType,
    });
  };

  const removeAccount = async (index) => {
    const account = accounts[index];
    setAccounts((prev) => prev.filter((_, i) => i !== index));
    if (!supabase || !account?.id) return;
    setSyncStatus('Guardando...');
    const { error } = await supabase.from('accounts').delete().eq('id', account.id);
    setSyncStatus(error ? 'Error al guardar' : 'Guardado en la nube');
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileScanStatus('Analizando archivo en tu dispositivo...');
    setFileScan(null);
    try {
      const hash = await sha256File(file);
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const fileRisk = ['exe', 'scr', 'bat', 'cmd', 'js', 'vbs', 'msi'].includes(ext)
        ? 'Alto'
        : ['zip', 'rar', '7z', 'docm', 'xlsm'].includes(ext)
          ? 'Medio'
          : 'Bajo';
      setFileScan({ name: file.name, size: file.size, hash, risk: fileRisk });
      setFileScanStatus('Archivo analizado. Revisa el resultado abajo.');
    } catch {
      setFileScanStatus('No se pudo analizar el archivo. Intenta con otro archivo o revisa permisos del navegador.');
    } finally {
      event.target.value = '';
    }
  };

  const handleAuditFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAuditFileStatus('Preparando archivo para auditoría segura...');
    setAuditFile(null);
    try {
      const hash = await sha256File(file);
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const auditRisk = ['exe', 'scr', 'bat', 'cmd', 'js', 'vbs', 'msi', 'apk', 'dmg'].includes(ext)
        ? 'Alto'
        : ['zip', 'rar', '7z', 'docm', 'xlsm'].includes(ext) || file.size > 25 * 1024 * 1024
          ? 'Medio'
          : 'Bajo';
      setAuditFile({
        name: file.name,
        size: file.size,
        type: file.type || 'desconocido',
        hash,
        risk: auditRisk,
      });
      setAuditFileStatus('Archivo listo para auditoría. No lo abras hasta recibir visto bueno.');
    } catch {
      setAuditFileStatus('No se pudo preparar el archivo. Intenta con otro archivo o revisa permisos del navegador.');
    } finally {
      event.target.value = '';
    }
  };

  const refreshPassword = (length = passwordLength, options = passwordOptions) => {
    setPassword(generatePassword(length, options));
    setPwnedPasswordResult(null);
    setCopied('password-generated');
    setTimeout(() => setCopied(''), 1500);
  };

  const updatePasswordOption = (option, value) => {
    const nextOptions = { ...passwordOptions, [option]: value };
    if (!nextOptions.uppercase && !nextOptions.lowercase && !nextOptions.numbers && !nextOptions.symbols) {
      nextOptions.lowercase = true;
    }
    setPasswordOptions(nextOptions);
    refreshPassword(passwordLength, nextOptions);
  };

  const savePasswordHistory = () => {
    const entry = {
      id: Date.now(),
      password,
      length: password.length,
      score: passwordScore,
      createdAt: new Date().toISOString(),
    };
    const nextHistory = [entry, ...passwordHistory].slice(0, 10);
    setPasswordHistory(nextHistory);
    setLocalJson('creators-password-history', nextHistory);
    setCopied('password-history');
    setTimeout(() => setCopied(''), 1500);
  };

  const clearPasswordHistory = () => {
    setPasswordHistory([]);
    setLocalJson('creators-password-history', []);
  };

  const runPwnedPasswordCheck = async () => {
    setPwnedPasswordResult({ status: 'idle', message: 'Revisando base publica de contrasenas filtradas...' });
    try {
      const result = await checkPasswordPwned(password);
      setPwnedPasswordResult(result);
    } catch {
      setPwnedPasswordResult({ status: 'error', message: 'No se pudo revisar ahora. Intenta otra vez.' });
    }
  };

  const runEmailSecurityCheck = (email = emailCheckValue) => {
    setEmailCheckStatus('loading');
    const cleanEmail = String(email || '').trim();
    if (!cleanEmail) {
      setEmailCheckResult({
        level: 'Alto',
        risk: 82,
        message: 'Primero agrega un correo asociado para poder revisarlo.',
        email: '',
        checkedAt: new Date().toLocaleString('es-MX'),
      });
      setEmailCheckStatus('done');
      setTimeout(() => setEmailCheckStatus('idle'), 1600);
      return;
    }
    const result = getEmailSafetyHint(cleanEmail);
    setEmailCheckValue(cleanEmail);
    setEmailCheckResult({
      ...result,
      email: cleanEmail,
      checkedAt: new Date().toLocaleString('es-MX'),
    });
    setEmailCheckStatus('done');
    setTimeout(() => {
      selectedEmailReviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
    setTimeout(() => setEmailCheckStatus('idle'), 1600);
  };

  const saveVaultCodes = () => {
    if (!selectedAccount?.id) return;
    const codes = vaultCodesText
      .split(/\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (!codes.length) {
      setAccountNotice('Pega al menos un codigo de respaldo.');
      setTimeout(() => setAccountNotice(''), 2200);
      return;
    }
    const nextVault = {
      ...backupVault,
      [selectedAccount.id]: {
        codes,
        profile: `${selectedAccount.platform} ${selectedAccount.profileType || ''}`.trim(),
        savedAt: new Date().toISOString(),
      },
    };
    setBackupVault(nextVault);
    setLocalJson('creators-backup-vault', nextVault);
    setVaultCodesText('');
    setOpenVaultProfileId(selectedAccount.id);
    setAccountNotice('Codigos guardados localmente en este dispositivo.');
    setTimeout(() => setAccountNotice(''), 2200);
  };

  const deleteVaultCodes = (profileId = selectedAccount?.id) => {
    if (!profileId) return;
    const nextVault = { ...backupVault };
    delete nextVault[profileId];
    setBackupVault(nextVault);
    setLocalJson('creators-backup-vault', nextVault);
    setOpenVaultProfileId('');
  };

  const completeMaintenanceTask = (taskKey) => {
    const nextState = {
      ...maintenanceState,
      [taskKey]: { completedAt: Date.now() },
    };
    setMaintenanceState(nextState);
    setLocalJson('ugc-maintenance-tasks', nextState);
  };

  const saveSelectedAccount = () => {
    if (selectedAccountIndex < 0) return;
    updateAccountFields(selectedAccountIndex, { ...selectedAccount, lastReview: selectedAccount.lastReview || new Date().toLocaleDateString('es-MX') });
    setAccountNotice('Datos del perfil guardados y sincronizados.');
    setTimeout(() => setAccountNotice(''), 2200);
  };

  const markSelectedAccount2Fa = () => {
    if (!selectedAccount?.id) {
      setCopied('Elige o crea un perfil primero');
      setTimeout(() => setCopied(''), 1800);
      return;
    }
    const twoFactorCheck = accountCheckItems.find((item) => item.label.startsWith('2FA'))?.label || '2FA activo con app autenticadora';
    saveChecks({
      ...checks,
      [`account-${selectedAccount.id}-${twoFactorCheck}`]: true,
    });
    setCopied('2FA marcado');
    setTimeout(() => setCopied(''), 1800);
  };

  const saveIncident = async () => {
    if (!incidentText.trim()) {
      setIncidentStatus('Escribe una nota del incidente antes de guardar.');
      return;
    }

    const account = accounts.find((item) => item.id === incidentAccountId) || selectedAccount;
    setIncidentStatus('Guardando incidente...');
    if (!supabase || !currentUser?.id) {
      setIncidentStatus('No hay conexión con Supabase para guardar el incidente.');
      return;
    }

    const { error } = await supabase.from('emergency_events').insert({
      user_id: currentUser.id,
      account_id: account?.id || null,
      account_label: account ? `${account.platform} ${account.profileType || account.owner || ''}`.trim() : null,
      event_type: incidentType,
      severity: incidentSeverity,
      occurred_at: incidentOccurredAt ? new Date(incidentOccurredAt).toISOString() : new Date().toISOString(),
      message: incidentText.trim(),
      status: 'open',
    });

    if (error) {
      setIncidentStatus(`No se pudo guardar. Falta ejecutar SQL de incidentes: ${error.message}`);
      return;
    }

    setIncidentStatus('Incidente guardado en la nube.');
    setIncidentText('');
    setIncidentOccurredAt(new Date().toISOString().slice(0, 16));
  };

  const navigateView = (view, targetId) => {
    setActiveView(view);
    if (!isMobileEdition && targetId) {
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  const showHome = activeView === 'home';
  const showAccounts = activeView === 'accounts';
  const showTools = activeView === 'tools';
  const showOffers = activeView === 'offers';
  const showApps = activeView === 'apps';
  const showBot = canAccessBot && activeView === 'bot';
  const showBotLocked = !canAccessBot && activeView === 'bot';
  const showAcademy = canAccessAcademy && activeView === 'academy';
  const showAcademyLocked = !canAccessAcademy && activeView === 'academy';
  const showEmergency = canAccessEmergency && activeView === 'emergency';
  const showEmergencyLocked = !canAccessEmergency && activeView === 'emergency';
  const showAdmin = isAdmin && activeView === 'admin';
  const showCitas = activeView === 'citas';
  const showStudio = canAccessStudio && activeView === 'studio';
  const showStudioLocked = !canAccessStudio && activeView === 'studio';
  const isSubscriptionPaused = ['blocked', 'canceled'].includes(effectiveSubscriptionStatus);


  useEffect(() => {
    if (!showBot) return;
    const node = botMessagesRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [showBot, visibleBotMessages, botStatus]);

  const requestConsultation = async () => {
    setActiveView('citas');
    return;
    const message = [
      'Hola, quiero agendar una consulta personalizada para elegir el mejor plan de Creators Guardian.',
      `Nombre: ${displayUser}`,
      `Correo: ${currentUser.email || 'Sin correo'}`,
      `Marca: ${brandLabel}`,
      creatorProfile?.phone ? `Telefono: ${creatorProfile.phone}` : '',
    ].filter(Boolean).join('\n');
    const whatsappUrl = `https://wa.me/524561175410?text=${encodeURIComponent(message)}`;

    setAppointmentStatus('Enviando solicitud...');
    if (supabase && currentUser?.id) {
      const { error } = await supabase.from('appointment_requests').insert({
        user_id: currentUser.id,
        email: currentUser.email,
        full_name: displayUser,
        phone: creatorProfile?.phone || null,
        brand_name: brandLabel,
        message: 'Consulta personalizada para elegir el mejor plan',
        status: 'requested',
      });
      if (error) {
        setAppointmentStatus(`WhatsApp listo. Falta ejecutar SQL de citas en Supabase: ${error.message}`);
      } else {
        setAppointmentStatus('Solicitud guardada. Te abro WhatsApp para confirmar.');
      }
    } else {
      setAppointmentStatus('Te abro WhatsApp para confirmar tu consulta.');
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const switchToStarterPlan = async () => {
    if (!supabase || !currentUser?.id || isChangingToStarter) return;
    if (currentPlanId === 'starter') {
      setAccountActionStatus('Ya estás usando Guardián Starter.');
      return;
    }
    setIsChangingToStarter(true);
    setAccountActionStatus('Cambiando tu acceso a Guardián Starter...');
    const nextProfile = {
      ...creatorProfile,
      access_plan: 'starter',
      access_code: null,
      access_expires_at: null,
      subscription_status: 'active',
    };
    const { error } = await supabase.from('profiles').upsert({
      id: currentUser.id,
      email: currentUser.email,
      username: currentUser.email?.split('@')[0] || 'creador',
      full_name: nextProfile?.full_name || currentUser.user_metadata?.full_name || null,
      phone: nextProfile?.phone || currentUser.user_metadata?.phone || null,
      brand_name: nextProfile?.brand_name || currentUser.user_metadata?.brand_name || null,
      main_handle: nextProfile?.main_handle || currentUser.user_metadata?.main_handle || null,
      access_plan: 'starter',
      access_code: null,
      access_days: null,
      access_source: 'downgrade-manual',
      access_expires_at: null,
      subscription_status: 'active',
    });
    if (error) {
      setAccountActionStatus(`No pude cambiarte a free: ${error.message}`);
      setIsChangingToStarter(false);
      return;
    }
    setCreatorProfile(nextProfile);
    setSubscriptionStatus('active');
    setAccountActionStatus('Listo. Tu acceso ya quedó en Guardián Starter.');
    setIsChangingToStarter(false);
    setActiveView('home');
  };

  const requestAccountDeletion = () => {
    setAccountActionStatus('Te abrimos WhatsApp para solicitar eliminación manual y segura de tu cuenta.');
    window.open(accountDeletionWhatsApp, '_blank', 'noopener,noreferrer');
  };

  const sendBotMessage = async () => {
    const question = botInput.trim();
    if (!question || botLoading) return;

    const nextMessages = trimBotMessages([...botMessages, { role: 'user', content: question }]);
    setBotMessages(nextMessages);
    setBotInput('');
    setBotLoading(true);
    setBotStatus('AztekBot conectando...');

    const instantReply = getInstantBotReply(question);
    if (instantReply) {
      setBotMessages(trimBotMessages([...nextMessages, { role: 'assistant', content: instantReply }]));
      setBotStatus('Respuesta rápida lista');
      setBotLoading(false);
      return;
    }

    setBotStatus('AztekBot está revisando...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/aztekbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({
          message: question,
          context: {
            user: displayUser,
            brand: brandLabel,
            accountCount: accounts.length,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'No se pudo contactar a AztekBot.');
      }
      setBotMessages(trimBotMessages([...nextMessages, { role: 'assistant', content: result.reply }]));
      setBotStatus('Listo');
    } catch (error) {
      setBotMessages(trimBotMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: `No pude responder ahora. Si es urgente, usa WhatsApp urgente. Detalle: ${error.message}`,
        },
      ]));
      setBotStatus('AztekBot no está disponible ahora.');
    } finally {
      setBotLoading(false);
    }
  };

  const loadAdminProfiles = async () => {
    if (!supabase || !isAdmin) return;
    setAdminStatus('Cargando usuarios...');
    const { data, error } = await supabase.rpc('admin_list_profiles');
    if (error) {
      setAdminStatus(`Falta ejecutar el SQL admin en Supabase: ${error.message}`);
      return;
    }
    setAdminProfiles(data || []);
    setAdminStatus('Usuarios cargados');
  };

  const loadAdminAppointments = async () => {
    if (!supabase || !isAdmin) return;
    setAdminStatus('Cargando citas...');
    const { data, error } = await supabase.rpc('admin_list_appointments');
    if (error) {
      setAdminStatus(`Falta ejecutar el SQL de citas en Supabase: ${error.message}`);
      return;
    }
    setAdminAppointments(data || []);
    setAdminStatus('Citas cargadas');
  };

  const loadAdminAccountReports = async () => {
    if (!supabase || !isAdmin) return;
    setAdminStatus('Cargando reportes de cuentas...');
    const { data, error } = await supabase.rpc('admin_list_account_reports');
    if (error) {
      setAdminStatus(`Falta ejecutar el SQL de reportes en Supabase: ${error.message}`);
      return;
    }
    setAdminAccountReports(data || []);
    setAdminStatus('Reportes cargados');
  };

  const loadAdminIncidents = async () => {
    if (!supabase || !isAdmin) return;
    setAdminStatus('Cargando incidentes...');
    const { data, error } = await supabase.rpc('admin_list_incidents');
    if (error) {
      setAdminStatus(`Falta ejecutar el SQL de incidentes en Supabase: ${error.message}`);
      return;
    }
    setAdminIncidents(data || []);
    setAdminStatus('Incidentes cargados');
  };

  const loadAdminNotes = async () => {
    if (!supabase || !isAdmin) return;
    setAdminStatus('Cargando notas...');
    const { data, error } = await supabase.rpc('admin_list_notes');
    if (error) {
      setAdminStatus(`Falta ejecutar el SQL de notas en Supabase: ${error.message}`);
      return;
    }
    setAdminNotes(data || []);
    setAdminStatus('Notas cargadas');
  };

  const loadAdminInviteCodes = async () => {
    if (!supabase || !isAdmin) return;
    setAdminStatus('Cargando codigos...');
    const { data, error } = await supabase.rpc('admin_list_invite_codes');
    if (error) {
      setAdminStatus(`Falta ejecutar el SQL de codigos en Supabase: ${error.message}`);
      return;
    }
    setAdminInviteCodes(data || []);
    setAdminStatus('Codigos cargados');
  };

  const loadAdminStudioLogs = async () => {
    if (!supabase || !isAdmin) return;
    const { data, error } = await supabase
      .from('studio_rate_logs')
      .select('id, created_at, country, city, platform, content_type, followers, usage_rights, brand_type, brand_offer, expected_amount, calculated_min, calculated_ideal, currency')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error) setAdminStudioLogs(data || []);
  };

  const extractYouTubeId = (url) => {
    const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };

  const loadAcademyVideos = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('academy_videos').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    setAcademyDbVideos(data || []);
    setAcademyLoaded(true);
  };

  const loadAdminAcademyVideos = async () => {
    if (!supabase || !isAdmin) return;
    const { data } = await supabase.from('academy_videos').select('*').order('sort_order', { ascending: true });
    setAdminAcademyVideos(data || []);
  };

  const addAcademyVideo = async () => {
    if (!adminAcademyForm.title.trim() || !adminAcademyForm.youtube_url.trim()) return;
    const ytId = extractYouTubeId(adminAcademyForm.youtube_url);
    if (!ytId) { setAdminStatus('URL inválida. Usa un link de youtube.com o youtu.be'); return; }
    const { data } = await supabase.from('academy_videos').insert({
      ...adminAcademyForm,
      youtube_id: ytId,
      sort_order: adminAcademyVideos.length,
    }).select().single();
    if (data) {
      setAdminAcademyVideos(prev => [...prev, data]);
      setAdminAcademyForm({ title:'', description:'', level:'Básico', duration:'', youtube_url:'' });
      setAdminStatus('Video agregado a la Academia ✓');
      setAcademyLoaded(false);
    }
  };

  const deleteAcademyVideo = async (id) => {
    if (!supabase) return;
    await supabase.from('academy_videos').delete().eq('id', id);
    setAdminAcademyVideos(prev => prev.filter(v => v.id !== id));
    setAcademyLoaded(false);
    setAdminStatus('Video eliminado');
  };

  const saveAdminNote = async () => {
    if (!adminNoteText.trim()) {
      setAdminStatus('Escribe una nota antes de guardar.');
      return;
    }
    if (!supabase || !isAdmin) return;
    setAdminStatus('Guardando nota...');
    const { error } = await supabase.rpc('admin_create_note', {
      target_user_id: adminNoteUserId || null,
      note_body: adminNoteText.trim(),
    });
    if (error) {
      setAdminStatus(`No se pudo guardar la nota: ${error.message}`);
      return;
    }
    setAdminNoteText('');
    await loadAdminNotes();
    setAdminStatus('Nota guardada');
  };

  const generateAdminInviteCode = async () => {
    if (!supabase || !isAdmin || adminCodeGenerating) return;
    setAdminCodeGenerating(true);
    setAdminGeneratedCode('');
    setAdminStatus('Generando codigo...');
    const parsedUses = Math.max(1, Number.parseInt(adminCodeUses || '1', 10) || 1);
    const parsedDays = adminCodeDays.trim()
      ? Math.max(1, Number.parseInt(adminCodeDays || '0', 10) || 30)
      : null;

    const { data, error } = await supabase.rpc('admin_generate_invite_code', {
      client_label: adminCodeLabel.trim() || null,
      plan_kind: adminCodePlan,
      duration_days: parsedDays,
      max_uses: parsedUses,
      notes: adminCodeNotes.trim() || null,
      assigned_name: adminAssignedName.trim() || null,
      assigned_email: adminAssignedEmail.trim().toLowerCase() || null,
      expires_at: null,
    });

    setAdminCodeGenerating(false);

    if (error) {
      setAdminStatus(`No se pudo generar el codigo: ${error.message}`);
      return;
    }

    const created = Array.isArray(data) ? data[0] : data;
    if (created?.code) {
      setAdminGeneratedCode(created.code);
      await navigator.clipboard.writeText(created.code);
      setCopied(`invite-${created.code}`);
      setTimeout(() => setCopied(''), 2000);
    }
    setAdminCodeLabel('');
    setAdminCodeNotes('');
    setAdminAssignedName('');
    setAdminAssignedEmail('');
    await loadAdminInviteCodes();
    setAdminStatus(created?.code ? `Codigo generado: ${created.code}` : 'Codigo generado');
  };

  const updateInviteCodeStatus = async (inviteId, nextStatus) => {
    if (!supabase || !isAdmin) return;
    setAdminStatus('Actualizando codigo...');
    const { error } = await supabase.rpc('admin_update_invite_code', {
      invite_id: inviteId,
      next_status: nextStatus,
      next_notes: null,
      next_max_uses: null,
      next_expires_at: null,
    });
    if (error) {
      setAdminStatus(`No se pudo actualizar el codigo: ${error.message}`);
      return;
    }
    setAdminInviteCodes((current) => current.map((code) => (
      code.id === inviteId ? { ...code, status: nextStatus } : code
    )));
    setAdminStatus('Codigo actualizado');
  };

  const updateSubscription = async (profileId, nextStatus) => {
    if (!supabase || !isAdmin) return;
    setAdminStatus('Actualizando acceso...');
    const { error } = await supabase.rpc('admin_update_subscription', {
      target_user_id: profileId,
      next_status: nextStatus,
    });
    if (error) {
      setAdminStatus(`No se pudo actualizar: ${error.message}`);
      return;
    }
    setAdminProfiles((profiles) => profiles.map((profile) => (
      profile.id === profileId ? { ...profile, subscription_status: nextStatus } : profile
    )));
    setAdminStatus('Acceso actualizado');
  };

  const updateUserPlan = async (profileId, nextPlan) => {
    if (!supabase || !isAdmin) return false;
    const { error } = await supabase.rpc('admin_update_plan', {
      target_user_id: profileId,
      next_plan: nextPlan,
    });
    if (error) return false;
    const extraUpdate = ['pro', 'elite', 'shield'].includes(nextPlan)
      ? { subscription_status: 'active' }
      : {};
    setAdminProfiles((profiles) => profiles.map((profile) => (
      profile.id === profileId ? { ...profile, access_plan: nextPlan, ...extraUpdate } : profile
    )));
    return true;
  };

  const saveUserEdits = async (profileId) => {
    const edits = pendingEdits[profileId];
    if (!edits) return;
    setAdminStatus('Guardando cambios...');
    let ok = true;
    if (edits.plan !== undefined) {
      const result = await updateUserPlan(profileId, edits.plan);
      if (!result) { setAdminStatus('Error al cambiar plan. ¿Ejecutaste el SQL admin_update_plan en Supabase?'); ok = false; }
    }
    if (ok && edits.status !== undefined) {
      const { error } = await supabase.rpc('admin_update_subscription', { target_user_id: profileId, next_status: edits.status });
      if (error) { setAdminStatus(`Error al cambiar estado: ${error.message}`); ok = false; }
      else setAdminProfiles((profiles) => profiles.map((p) => p.id === profileId ? { ...p, subscription_status: edits.status } : p));
    }
    if (ok) {
      setPendingEdits((prev) => { const next = { ...prev }; delete next[profileId]; return next; });
      setAdminStatus('Cambios guardados ✓');
    }
  };

  const studioCountryData = {
    'México': { currency:'MXN', symbol:'$', factor:1.0, roundUnit:50, stateM:{
      'Ciudad de México':1.50,'Nuevo León':1.30,'Jalisco':1.20,'Quintana Roo':1.20,
      'Baja California Sur':1.15,'Querétaro':1.15,'Baja California':1.10,'Estado de México':1.10,
      'Yucatán':1.05,'Coahuila':1.05,'Aguascalientes':1.05,'Puebla':1.00,'Guanajuato':1.00,
      'Sonora':1.00,'Chihuahua':1.00,'Tamaulipas':1.00,'Colima':0.95,'Morelos':0.95,
      'Sinaloa':0.95,'San Luis Potosí':0.95,'Veracruz':0.95,'Tabasco':0.90,'Durango':0.90,
      'Hidalgo':0.90,'Nayarit':0.90,'Campeche':0.90,'Michoacán':0.90,'Tlaxcala':0.85,
      'Zacatecas':0.85,'Guerrero':0.85,'Oaxaca':0.85,'Chiapas':0.80,
    }},
    'España': { currency:'EUR', symbol:'€', factor:0.05, roundUnit:5, stateM:{
      'Madrid':1.50,'Cataluña':1.40,'País Vasco':1.35,'Islas Baleares':1.20,
      'Navarra':1.15,'Valencia':1.10,'Aragón':1.05,'Cantabria':1.05,
      'La Rioja':1.00,'Asturias':1.00,'Canarias':1.00,'Andalucía':1.00,
      'Galicia':0.95,'Castilla y León':0.90,'Murcia':0.90,
      'Castilla-La Mancha':0.85,'Extremadura':0.80,
    }},
    'Colombia': { currency:'COP', symbol:'$', factor:210, roundUnit:5000, stateM:{
      'Bogotá D.C.':1.50,'Antioquia':1.30,'Valle del Cauca':1.20,'Atlántico':1.10,
      'Cundinamarca':1.10,'San Andrés':1.10,'Santander':1.05,'Bolívar':1.00,
      'Risaralda':1.00,'Meta':0.95,'Norte de Santander':0.95,'Caldas':0.95,
      'Quindío':0.95,'Boyacá':0.90,'Tolima':0.90,'Huila':0.90,'Córdoba':0.90,
      'Magdalena':0.90,'Cesar':0.90,'Casanare':0.90,'Nariño':0.85,'Cauca':0.85,
      'Sucre':0.85,'La Guajira':0.85,'Arauca':0.85,'Chocó':0.80,'Putumayo':0.80,
      'Caquetá':0.80,'Amazonas':0.80,'Guainía':0.80,'Vaupés':0.80,'Vichada':0.80,'Guaviare':0.80,
    }},
    'Argentina': { currency:'USD', symbol:'USD$', factor:0.053, roundUnit:5, stateM:{
      'Ciudad Autónoma de Buenos Aires':1.50,'Buenos Aires':1.20,'Córdoba':1.10,'Santa Fe':1.10,
      'Mendoza':1.05,'Neuquén':1.05,'Chubut':1.00,'Santa Cruz':1.00,'Tierra del Fuego':1.00,
      'Entre Ríos':0.95,'Tucumán':0.95,'Río Negro':0.95,'San Juan':0.90,'Jujuy':0.90,
      'Salta':0.90,'Corrientes':0.90,'Misiones':0.90,'La Pampa':0.90,'San Luis':0.90,
      'Chaco':0.85,'Santiago del Estero':0.85,'Catamarca':0.85,'La Rioja':0.85,'Formosa':0.80,
    }},
    'Chile': { currency:'CLP', symbol:'$', factor:47, roundUnit:1000, stateM:{
      'Región Metropolitana':1.50,'Valparaíso':1.10,'Antofagasta':1.10,'Tarapacá':1.05,
      'Biobío':1.05,'Arica y Parinacota':0.95,'Atacama':0.95,'Coquimbo':0.95,
      "O'Higgins":0.95,'Maule':0.90,'La Araucanía':0.90,'Los Lagos':0.90,
      'Los Ríos':0.90,'Ñuble':0.90,'Magallanes':0.90,'Aysén':0.85,
    }},
    'Perú': { currency:'PEN', symbol:'S/', factor:0.20, roundUnit:5, stateM:{
      'Lima':1.50,'Callao':1.30,'Arequipa':1.10,'Cusco':1.10,'La Libertad':1.00,
      'Piura':1.00,'Lambayeque':0.95,'Ica':0.95,'Junín':0.90,'Áncash':0.90,
      'Tacna':0.90,'Tumbes':0.90,'Moquegua':0.90,'Puno':0.85,'San Martín':0.85,
      'Cajamarca':0.85,'Loreto':0.85,'Ucayali':0.85,'Madre de Dios':0.85,
      'Huánuco':0.85,'Apurímac':0.80,'Ayacucho':0.80,'Pasco':0.80,'Amazonas':0.80,'Huancavelica':0.75,
    }},
    'Ecuador': { currency:'USD', symbol:'USD$', factor:0.053, roundUnit:5, stateM:{
      'Pichincha':1.40,'Guayas':1.30,'Galápagos':1.20,'Azuay':1.10,
      'Tungurahua':1.00,'Santo Domingo de los Tsáchilas':1.00,'Manabí':1.00,
      'El Oro':0.95,'Imbabura':0.95,'Cañar':0.90,'Los Ríos':0.90,'Loja':0.90,
      'Chimborazo':0.90,'Cotopaxi':0.90,'Santa Elena':0.90,'Esmeraldas':0.85,
      'Carchi':0.85,'Bolívar':0.85,'Sucumbíos':0.85,'Orellana':0.85,
      'Napo':0.80,'Morona Santiago':0.80,'Pastaza':0.80,'Zamora Chinchipe':0.80,
    }},
    'Venezuela': { currency:'USD', symbol:'USD$', factor:0.053, roundUnit:5, stateM:{
      'Distrito Capital':1.50,'Miranda':1.30,'Carabobo':1.20,'Zulia':1.15,
      'Nueva Esparta':1.10,'La Guaira':1.10,'Aragua':1.10,'Lara':1.05,
      'Anzoátegui':1.05,'Táchira':1.00,'Mérida':1.00,'Bolívar':1.00,
      'Monagas':0.95,'Sucre':0.90,'Portuguesa':0.90,'Barinas':0.90,'Guárico':0.90,
      'Falcón':0.90,'Yaracuy':0.90,'Trujillo':0.85,'Cojedes':0.85,
      'Apure':0.80,'Amazonas':0.80,'Delta Amacuro':0.80,
    }},
    'Uruguay': { currency:'UYU', symbol:'$U', factor:2.1, roundUnit:50, stateM:{
      'Montevideo':1.50,'Maldonado':1.20,'Canelones':1.10,'Colonia':1.05,
      'San José':1.00,'Florida':0.95,'Rocha':0.95,'Lavalleja':0.90,
      'Soriano':0.90,'Río Negro':0.90,'Salto':0.90,'Paysandú':0.90,
      'Rivera':0.90,'Tacuarembó':0.85,'Durazno':0.85,'Cerro Largo':0.85,
      'Treinta y Tres':0.85,'Flores':0.85,'Artigas':0.85,
    }},
    'Paraguay': { currency:'USD', symbol:'USD$', factor:0.053, roundUnit:5, stateM:{
      'Asunción':1.50,'Central':1.20,'Alto Paraná':1.10,'Itapúa':0.95,
      'Amambay':0.90,'Cordillera':0.90,'Guairá':0.90,'Caaguazú':0.90,'Paraguarí':0.90,
      'San Pedro':0.85,'Misiones':0.85,'Ñeembucú':0.85,'Canindeyú':0.85,
      'Presidente Hayes':0.85,'Caazapá':0.80,'Alto Paraguay':0.80,'Boquerón':0.80,
    }},
    'Bolivia':         { currency:'BOB', symbol:'Bs.',  factor:0.37,  roundUnit:10,   cities:['La Paz','Santa Cruz','Cochabamba','Sucre','Oruro','Potosí','Tarija','Otra'], cityM:{'La Paz':1.2,'Santa Cruz':1.25,'Cochabamba':1.1,'Sucre':0.9,'Oruro':0.85,'Potosí':0.8,'Tarija':0.9,'Otra':0.8} },
    'Costa Rica':      { currency:'CRC', symbol:'₡',   factor:28,    roundUnit:500,  cities:['San José','Alajuela','Cartago','Heredia','Liberia','Puntarenas','Limón','Otra'], cityM:{'San José':1.25,'Alajuela':1.05,'Cartago':1.0,'Heredia':1.05,'Liberia':0.9,'Puntarenas':0.85,'Limón':0.85,'Otra':0.85} },
    'Panamá':          { currency:'USD', symbol:'USD$', factor:0.053, roundUnit:5,    cities:['Ciudad de Panamá','Colón','David','La Chorrera','Santiago','Chitré','Otra'], cityM:{'Ciudad de Panamá':1.3,'Colón':0.9,'David':0.9,'La Chorrera':1.0,'Santiago':0.85,'Chitré':0.85,'Otra':0.85} },
    'Guatemala':       { currency:'GTQ', symbol:'Q',    factor:0.41,  roundUnit:10,   cities:['Ciudad de Guatemala','Mixco','Villa Nueva','Quetzaltenango','Escuintla','Antigua','Cobán','Otra'], cityM:{'Ciudad de Guatemala':1.3,'Mixco':1.1,'Villa Nueva':1.0,'Quetzaltenango':0.95,'Escuintla':0.85,'Antigua':1.1,'Cobán':0.85,'Otra':0.85} },
    'Honduras':        { currency:'HNL', symbol:'L',    factor:1.30,  roundUnit:50,   cities:['Tegucigalpa','San Pedro Sula','La Ceiba','Choloma','Choluteca','Comayagua','Otra'], cityM:{'Tegucigalpa':1.2,'San Pedro Sula':1.25,'La Ceiba':1.0,'Choloma':0.95,'Choluteca':0.85,'Comayagua':0.9,'Otra':0.85} },
    'El Salvador':     { currency:'USD', symbol:'USD$', factor:0.053, roundUnit:5,    cities:['San Salvador','Santa Ana','San Miguel','Soyapango','Mejicanos','Nueva San Salvador','Otra'], cityM:{'San Salvador':1.25,'Santa Ana':1.0,'San Miguel':0.95,'Soyapango':1.05,'Mejicanos':0.95,'Nueva San Salvador':1.0,'Otra':0.85} },
    'Nicaragua':       { currency:'NIO', symbol:'C$',   factor:1.94,  roundUnit:50,   cities:['Managua','León','Masaya','Granada','Matagalpa','Estelí','Otra'], cityM:{'Managua':1.25,'León':1.0,'Masaya':0.95,'Granada':1.0,'Matagalpa':0.85,'Estelí':0.85,'Otra':0.85} },
    'Rep. Dominicana': { currency:'DOP', symbol:'RD$',  factor:3.1,   roundUnit:100,  cities:['Santo Domingo','Santiago','San Pedro de Macorís','La Romana','Puerto Plata','San Francisco de Macorís','Otra'], cityM:{'Santo Domingo':1.3,'Santiago':1.1,'San Pedro de Macorís':0.95,'La Romana':1.0,'Puerto Plata':1.0,'San Francisco de Macorís':0.9,'Otra':0.85} },
    'Puerto Rico':     { currency:'USD', symbol:'USD$', factor:0.053, roundUnit:5,    cities:['San Juan','Bayamón','Carolina','Ponce','Guaynabo','Caguas','Otra'], cityM:{'San Juan':1.35,'Bayamón':1.15,'Carolina':1.1,'Ponce':1.0,'Guaynabo':1.2,'Caguas':1.05,'Otra':0.9} },
    'Cuba':            { currency:'USD', symbol:'USD$', factor:0.053, roundUnit:5,    cities:['La Habana','Santiago de Cuba','Holguín','Camagüey','Santa Clara','Otra'], cityM:{'La Habana':1.3,'Santiago de Cuba':1.0,'Holguín':0.9,'Camagüey':0.9,'Santa Clara':0.9,'Otra':0.85} },
    'Estados Unidos':  { currency:'USD', symbol:'USD$', factor:0.053, roundUnit:5,    cities:['Nueva York','Los Ángeles','Miami','Chicago','Houston','Dallas','San Antonio','Phoenix','San Diego','Otra'], cityM:{'Nueva York':1.5,'Los Ángeles':1.4,'Miami':1.3,'Chicago':1.25,'Houston':1.15,'Dallas':1.15,'San Antonio':1.1,'Phoenix':1.1,'San Diego':1.2,'Otra':1.0} },
  };
  const calculateRate = () => {
    const base = {
      'TikTok-video60':[900,3000],'TikTok-video30':[600,1800],'TikTok-live':[1200,3500],
      'Instagram-reels60':[1100,3500],'Instagram-reels30':[700,2200],'Instagram-stories':[450,1400],
      'YouTube-short':[1300,4000],'YouTube-video':[3000,9000],
      'Facebook-reel':[600,1800],'X-video':[500,1500],
    };
    const followM = {'<1k':0.45,'1k-5k':0.65,'5k-10k':0.85,'10k-50k':1.0,'50k-100k':1.35,'100k-500k':1.7,'500k+':2.6};
    const usageM = {'Solo orgánico':1.0,'Orgánico + Paid Ads':1.55,'Exclusividad 30 días':1.85,'Exclusividad 90 días':2.6};
    const brandM = {'Local / pequeña':0.75,'Nacional':1.0,'Internacional':1.45,'Luxury / premium':2.1};
    const country = studioCountryData[studioCountry] || studioCountryData['México'];
    const regionMult = country.stateM?.[studioState] || country.cityM?.[studioCity] || 1.0;
    const key = `${studioPlatform}-${studioContentType}`;
    const [bMin, bMax] = base[key] || [600,2000];
    const mult = regionMult * (followM[studioFollowers]||1) * (usageM[studioUsageRights]||1) * (brandM[studioBrandType]||1);
    const ru = country.roundUnit || 50;
    const round = (v) => Math.round(v * country.factor / ru) * ru;
    const min = round(bMin * mult);
    const ideal = round(bMax * mult);
    const offer = Number(studioBrandOffer) || 0;
    const expected = Number(studioExpected) || 0;
    const getVerdict = (v) => v === 0 ? null : v < min ? 'bajo' : v < ideal ? 'justo' : 'bueno';
    setStudioResult({ min, ideal, offer, expected, verdictOffer: getVerdict(offer), verdictExpected: getVerdict(expected), symbol: country.symbol, currency: country.currency });
    if (isSupabaseConfigured && supabase && user) {
      supabase.from('studio_rate_logs').insert({
        user_id: user.id,
        country: studioCountry,
        city: country.stateM ? studioState : studioCity,
        platform: studioPlatform,
        content_type: studioContentType,
        followers: studioFollowers,
        usage_rights: studioUsageRights,
        brand_type: studioBrandType,
        brand_offer: Number(studioBrandOffer) || null,
        expected_amount: Number(studioExpected) || null,
        calculated_min: min,
        calculated_ideal: ideal,
        currency: country.currency,
      }).then(() => {});
    }
  };

  const analyzeContractRegex = (t) => {
    const red = [
      { r: /derechos.*ilimitad|ilimitad.*derechos/i, label:'Derechos ilimitados', desc:'La marca puede usar tu contenido sin restricciones de tiempo ni territorio.' },
      { r: /perpetu|a perpetuidad/i, label:'Uso perpetuo', desc:'Tu contenido puede usarse para siempre sin pago adicional.' },
      { r: /irrevocable/i, label:'Licencia irrevocable', desc:'No podrás retirar tu contenido una vez entregado.' },
      { r: /exclusivid/i, label:'Cláusula de exclusividad', desc:'No podrás trabajar con marcas similares durante el periodo.' },
      { r: /ceder.*derechos|transferencia.*derechos|cesión/i, label:'Transferencia de derechos', desc:'La marca se queda con la propiedad intelectual de tu contenido.' },
      { r: /sublicenci/i, label:'Sublicencia', desc:'La marca puede vender o transferir tu contenido a terceros.' },
      { r: /modificar.*sin.*consentimiento|alterar.*sin.*permiso/i, label:'Modificación sin consentimiento', desc:'Pueden editar tu contenido sin tu aprobación.' },
    ].filter(f => f.r.test(t)).map(({label,desc}) => ({label,desc}));
    const yellow = [
      { r: /renovaci.*autom/i, label:'Renovación automática', desc:'El contrato se renueva solo si no cancelas a tiempo.' },
      { r: /confidencialidad/i, label:'Confidencialidad', desc:'No podrás hablar de los términos con otros creadores.' },
      { r: /penalizaci|penalidad/i, label:'Penalización por incumplimiento', desc:'Revisa bien las consecuencias si no entregas a tiempo.' },
      { r: /indemnizar|indemnización/i, label:'Indemnización', desc:'Podrías ser responsable de costos legales ante problemas.' },
      { r: /90 días|noventa días|180 días|ciento ochenta/i, label:'Periodo largo', desc:'Verifica cuánto tiempo te restringe trabajar con la competencia.' },
    ].filter(f => f.r.test(t)).map(({label,desc}) => ({label,desc}));
    const green = [
      { r: /pago.*\d+.*d[íi]as|\d+.*d[íi]as.*pago/i, label:'Plazo de pago definido', desc:'Hay un tiempo claro para recibir tu pago.' },
      { r: /\d+.*revisiones?|revisiones?.*incluidas?/i, label:'Revisiones incluidas', desc:'El número de cambios está definido.' },
      { r: /propiedad.*intelectual.*creador|derechos.*autor.*creador/i, label:'Derechos del creador protegidos', desc:'El contrato reconoce tus derechos de autor.' },
      { r: /fecha.*entrega|entrega.*fecha|\d+.*d[íi]as.*entrega/i, label:'Fecha de entrega definida', desc:'Los tiempos de entrega están establecidos.' },
    ].filter(f => f.r.test(t)).map(({label,desc}) => ({label,desc}));
    return { red, yellow, green, aiPowered: false };
  };

  const analyzeContract = async () => {
    if (!studioContractText.trim()) return;
    if (studioContractText.length > 50000) { alert('El texto del contrato es demasiado largo (máx 50,000 caracteres).'); return; }
    setStudioContractLoading(true);
    setStudioContractResult(null);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch('/api/analyze-contract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({ text: studioContractText }),
        });
        if (response.ok) {
          const data = await response.json();
          setStudioContractResult(data);
          setStudioContractLoading(false);
          return;
        }
      } catch {
        // fall through to regex fallback
      }
    }
    setStudioContractResult(analyzeContractRegex(studioContractText));
    setStudioContractLoading(false);
  };

  const loadDeals = async () => {
    if (!supabase || !user) return;
    const { data } = await supabase.from('ugc_deals').select('*').eq('user_id', user.id).order('delivery_date', { ascending: true, nullsFirst: false });
    setDeals(data || []);
    setDealsLoaded(true);
  };

  const addDeal = async () => {
    if (!newDeal.brand_name.trim() || !newDeal.delivery_date) return;
    if (!supabase || !user) return;
    const { data } = await supabase.from('ugc_deals').insert({
      user_id: user.id, ...newDeal,
      quantity: parseInt(newDeal.quantity) || 1,
      amount: parseFloat(newDeal.amount) || null,
    }).select().single();
    if (data) {
      setDeals(prev => [...prev, data].sort((a, b) => (a.delivery_date || '9999') > (b.delivery_date || '9999') ? 1 : -1));
      setShowDealForm(false);
      setNewDeal(emptyDeal);
    }
  };

  const updateDeal = async (id, field, value) => {
    if (!supabase) return;
    await supabase.from('ugc_deals').update({ [field]: value }).eq('id', id);
    setDeals(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const deleteDeal = async (id) => {
    if (!supabase) return;
    await supabase.from('ugc_deals').delete().eq('id', id);
    setDeals(prev => prev.filter(d => d.id !== id));
    if (expandedDealId === id) setExpandedDealId(null);
  };

  const exportAccountsCSV = () => {
    const headers = ['Plataforma', 'Tipo', 'Handle', 'Correo asociado', 'Ultima revision', 'Score'];
    const rows = accounts.map((a) => {
      const score = accountCheckItems.reduce((sum, item) => {
        return sum + (checks[`account-${a.id}-${item.label}`] ? Math.round(100 / accountCheckItems.length) : 0);
      }, 0);
      return [a.platform, a.profileType || a.owner || 'Principal', a.handle || '', a.emailLabel || '', a.lastReview || '', score];
    });
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `creatorsguardian-redes-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const startEditingProfile = () => {
    setProfileEditData({
      full_name: creatorProfile?.full_name || currentUser.user_metadata?.full_name || '',
      phone: creatorProfile?.phone || currentUser.user_metadata?.phone || '',
      brand_name: creatorProfile?.brand_name || currentUser.user_metadata?.brand_name || '',
      main_handle: creatorProfile?.main_handle || currentUser.user_metadata?.main_handle || '',
    });
    setProfileSaveStatus('');
    setEditingProfile(true);
  };

  const saveProfileEdit = async () => {
    if (!supabase || !currentUser?.id) return;
    setProfileSaveStatus('Guardando...');
    const { error } = await supabase.from('profiles').update({
      full_name: profileEditData.full_name?.trim() || null,
      phone: profileEditData.phone?.trim() || null,
      brand_name: profileEditData.brand_name?.trim() || null,
      main_handle: profileEditData.main_handle?.trim() || null,
    }).eq('id', currentUser.id);
    if (error) { setProfileSaveStatus('Error: ' + error.message); return; }
    setCreatorProfile((prev) => ({ ...prev, ...profileEditData }));
    setEditingProfile(false);
    setProfileSaveStatus('');
  };

  const setPendingEdit = (profileId, field, value) => {
    setPendingEdits((prev) => ({
      ...prev,
      [profileId]: { ...prev[profileId], [field]: value },
    }));
  };

  const updateAppointmentStatus = async (appointmentId, nextStatus) => {
    if (!supabase || !isAdmin) return;
    setAdminStatus('Actualizando cita...');
    const { error } = await supabase.rpc('admin_update_appointment', {
      appointment_id: appointmentId,
      next_status: nextStatus,
    });
    if (error) {
      setAdminStatus(`No se pudo actualizar la cita: ${error.message}`);
      return;
    }
    setAdminAppointments((appointments) => appointments.map((appointment) => (
      appointment.id === appointmentId ? { ...appointment, status: nextStatus } : appointment
    )));
    setAdminStatus('Cita actualizada');
  };

  const updateIncidentStatus = async (incidentId, nextStatus) => {
    if (!supabase || !isAdmin) return;
    setAdminStatus('Actualizando incidente...');
    const { error } = await supabase.rpc('admin_update_incident', {
      incident_id: incidentId,
      next_status: nextStatus,
    });
    if (error) {
      setAdminStatus(`No se pudo actualizar el incidente: ${error.message}`);
      return;
    }
    setAdminIncidents((incidents) => incidents.map((incident) => (
      incident.id === incidentId ? { ...incident, status: nextStatus } : incident
    )));
    setAdminStatus('Incidente actualizado');
  };

  useEffect(() => {
    if (showAdmin) {
      loadAdminProfiles();
      loadAdminAppointments();
      loadAdminAccountReports();
      loadAdminIncidents();
      loadAdminNotes();
      loadAdminInviteCodes();
      loadAdminStudioLogs();
    }
  }, [showAdmin]);

  useEffect(() => {
    if (studioTab === 'deliveries' && !dealsLoaded) loadDeals();
  }, [studioTab]);

  useEffect(() => {
    if (showAcademy && !academyLoaded) loadAcademyVideos();
  }, [showAcademy]);

  useEffect(() => {
    if (adminTab === 'academy') loadAdminAcademyVideos();
  }, [adminTab]);

  if (isSubscriptionPaused) {
    const statusCopy = {
      blocked: 'Tu acceso esta pausado.',
      canceled: 'Tu suscripcion esta cancelada.',
    };

    return (
      <main className={`app-shell auth-shell ${isMobileEdition ? 'mobile-edition' : ''}`}>
        <section className="auth-card paused-card">
          <img src="/aztekiller-logo.png" alt="Aztekiller" />
          <p className="eyebrow">Acceso protegido</p>
          <h1>{statusCopy[subscriptionStatus]}</h1>
          <p>
            Tus datos siguen guardados de forma segura. Para reactivar Aztekiller Creators Guardian,
            contactanos por WhatsApp y revisamos tu acceso.
          </p>
          <a className="inline-button emergency-whatsapp" href={emergencyWhatsApp} target="_blank" rel="noreferrer">
            <BellRing size={18} />
            Reactivar por WhatsApp
          </a>
          <button type="button" className="auth-switch" onClick={onLogout}>
            <LogOut size={16} />
            Cerrar sesion
          </button>
        </section>
      </main>
    );
  }

  const onboardSteps = [
    {
      icon: '🛡️',
      title: 'Elige tu tipo de perfil',
      desc: 'Creators Guardian se adapta a tu trabajo. ¿Qué contenido creas principalmente?',
      component: (
        <div className="creator-type-selector">
          {creatorTypes.map((t) => (
            <button
              key={t.id}
              className={`type-btn ${creatorType === t.id ? 'active' : ''}`}
              onClick={() => setCreatorType(t.id)}
            >
              <t.icon size={20} color={t.color} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: '👤',
      title: 'Completa tu perfil',
      desc: 'Agrega tu nombre y marca para que podamos darte soporte más rápido.',
      action: () => { dismissOnboarding(); startEditingProfile(); },
      actionLabel: 'Completar ahora',
    },
    {
      icon: '📱',
      title: 'Protege tu primera red',
      desc: 'Agrega Instagram, TikTok o YouTube para empezar el blindaje.',
      action: () => { dismissOnboarding(); setActiveView('accounts'); },
      actionLabel: 'Agregar red',
    },
  ];
  const dismissOnboarding = () => {
    if (currentUser?.id) localStorage.setItem(`creators_onboarded_${currentUser.id}`, '1');
    setOnboardStep(-1);
  };

  return (
    <main className={`app-shell ${isMobileEdition ? 'mobile-edition' : ''}`}>
      {onboardStep >= 0 && (
        <div className="onboard-overlay" onClick={dismissOnboarding}>
          <div className="onboard-modal" onClick={(e) => e.stopPropagation()}>
            <div className="onboard-dots">
              {onboardSteps.map((_, i) => (
                <span key={i} className={`onboard-dot${i === onboardStep ? ' active' : ''}`} />
              ))}
            </div>
            <div className="onboard-icon">{onboardSteps[onboardStep].icon}</div>
            <h2>{onboardSteps[onboardStep].title}</h2>
            <p>{onboardSteps[onboardStep].desc}</p>
            <div className="onboard-actions">
              {onboardStep < onboardSteps.length - 1 ? (
                <>
                  {onboardSteps[onboardStep].action && (
                    <button type="button" className="onboard-btn-primary" onClick={onboardSteps[onboardStep].action}>
                      {onboardSteps[onboardStep].actionLabel}
                    </button>
                  )}
                  <button type="button" className="onboard-btn-secondary" onClick={() => setOnboardStep((s) => s + 1)}>
                    {onboardStep === 0 ? 'Comenzar' : 'Siguiente'}
                  </button>
                </>
              ) : (
                <button type="button" className="onboard-btn-primary" onClick={onboardSteps[onboardStep].action || dismissOnboarding}>
                  {onboardSteps[onboardStep].actionLabel || '¡Listo!'}
                </button>
              )}
              <button type="button" className="onboard-btn-skip" onClick={dismissOnboarding}>
                No volver a mostrar este mensaje
              </button>
            </div>
          </div>
        </div>
      )}
      {!isMobileEdition && (
        <section className="desktop-control-panel">
          <div className="desktop-user-row">
            <div>
              <span>{greeting}</span>
              <strong>{displayUser}</strong>
            </div>
            <button type="button" className="logout-pill" onClick={onLogout}>
              <LogOut size={17} />
              Cerrar sesión
            </button>
          </div>
          <nav className="desktop-nav" aria-label="Navegacion de escritorio">
            {[
              ['home', ClipboardCheck, 'Inicio', true],
              ['accounts', UserRoundCheck, 'Redes', true],
              ['tools', KeyRound, 'Tools', true],
              ['citas', CalendarCheck, 'Citas', true],
              ['offers', Sparkles, 'Ofertas', true],
              ['apps', Shield, 'Apps', true],
              ['studio', Sparkles, 'Studio', canAccessStudio],
              ['bot', MessageCircle, 'AztekBot', canAccessBot],
              ['academy', GraduationCap, 'Academia', canAccessAcademy],
              ['emergency', ShieldAlert, 'SOS', canAccessEmergency],
              ...(isAdmin ? [['admin', Fingerprint, 'Admin', true]] : []),
            ].map(([view, Icon, label, canAccess]) => (
              <button
                type="button"
                key={view}
                className={`${activeView === view ? 'active' : ''}${!canAccess ? ' nav-locked' : ''}`}
                onClick={() => setActiveView(view)}
              >
                <Icon size={17} />
                {label}
                {!canAccess && <Lock size={9} className="nav-lock-icon" />}
              </button>
            ))}
          </nav>
        </section>
      )}
      <section className="emergency-strip">
        <div>
          <ShieldAlert size={20} />
          <strong>Modo emergencia activo</strong>
          <span>
            {canAccessExpertWhatsApp
              ? 'Si sospechas hackeo, robo de cuenta, link falso o acceso raro, contacta soporte inmediato.'
              : 'La respuesta directa por WhatsApp urgente está disponible en los planes de pago.'}
          </span>
        </div>
        {canAccessExpertWhatsApp ? (
          <a href={emergencyWhatsApp} target="_blank" rel="noreferrer">
            <BellRing size={18} />
            WhatsApp urgente
          </a>
        ) : (
          <a href={salesWhatsApp} target="_blank" rel="noreferrer">
            <Sparkles size={18} />
            Subir a plan de pago
          </a>
        )}
      </section>

      {isInGraceWindow && (
        <section className="grace-banner">
          <AlertTriangle size={20} />
          <div>
            <strong>Tu plan está en prórroga de pago</strong>
            <span>
              Conservas tu acceso premium por {gracePeriodDays} días después del vencimiento.
              Si no regularizas el pago, tu cuenta pasará automáticamente a Guardián Starter.
            </span>
          </div>
          <a href={salesWhatsApp} target="_blank" rel="noreferrer">
            Regularizar plan
          </a>
        </section>
      )}

      {isMobileEdition && (
        <>
          <header className={`mobile-app-header${activeView !== 'home' ? ' in-section' : ''}`}>
            {activeView === 'home' ? (
              <>
                <div className="mobile-header-left">
                  <img src="/aztekiller-logo.png" alt="Logo" className="mobile-header-logo" />
                  <div>
                    <span className="mobile-header-greeting">{greeting}</span>
                    <strong className="mobile-header-name">{displayUser}</strong>
                  </div>
                </div>
                <div className="mobile-header-right">
                  <span className="mobile-plan-chip">{currentPlan.name}</span>
                  <button type="button" className="mobile-logout-btn" onClick={onLogout} title="Cerrar sesión">
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="mobile-back-btn"
                  onClick={() => { setActiveView('home'); setActiveTool(null); setMobileMoreOpen(false); }}
                >
                  <ChevronDown size={18} style={{transform:'rotate(90deg)'}} />
                  Inicio
                </button>
                <strong className="mobile-section-name">
                  {{
                    accounts: 'Mis Redes',
                    tools: 'Herramientas',
                    emergency: '🆘 SOS',
                    offers: 'Ofertas',
                    apps: 'Apps',
                    bot: 'AztekBot',
                    academy: 'Academia',
                    studio: '✦ Studio',
                    admin: 'Admin',
                    citas: 'Agendar cita',
                  }[activeView] || activeView}
                </strong>
                <button type="button" className="mobile-logout-btn" onClick={onLogout} title="Cerrar sesión">
                  <LogOut size={16} />
                </button>
              </>
            )}
          </header>

          <nav className="mobile-bottom-nav" aria-label="Navegacion">
            {mobileMoreOpen && (
              <div className="mobile-more-drawer">
                {[
                  ['studio', Sparkles, 'Studio', canAccessStudio],
                  ['citas', CalendarCheck, 'Citas', true],
                  ['offers', Zap, 'Ofertas', true],
                  ['apps', Shield, 'Apps', true],
                  ['bot', MessageCircle, 'Bot', canAccessBot],
                  ['academy', GraduationCap, 'Academia', canAccessAcademy],
                  ...(isAdmin ? [['admin', Fingerprint, 'Admin', true]] : []),
                ].map(([view, Icon, label, canAccess]) => (
                  <button
                    type="button"
                    key={view}
                    className={`${activeView === view ? 'active' : ''}${!canAccess ? ' nav-locked' : ''}`}
                    onClick={() => { setActiveView(view); setMobileMoreOpen(false); }}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                    {!canAccess && <Lock size={10} className="nav-lock-icon" />}
                  </button>
                ))}
              </div>
            )}
            <div className="mobile-bottom-bar">
              <button
                type="button"
                className={activeView === 'home' ? 'active' : ''}
                onClick={() => { setActiveView('home'); setMobileMoreOpen(false); }}
              >
                <ClipboardCheck size={22} /><span>Inicio</span>
              </button>
              <button
                type="button"
                className={activeView === 'accounts' ? 'active' : ''}
                onClick={() => { setActiveView('accounts'); setMobileMoreOpen(false); }}
              >
                <UserRoundCheck size={22} /><span>Redes</span>
              </button>
              <button
                type="button"
                className={`nav-sos-btn${activeView === 'emergency' ? ' active' : ''}`}
                onClick={() => { setActiveView('emergency'); setMobileMoreOpen(false); }}
              >
                <ShieldAlert size={26} /><span>SOS</span>
              </button>
              <button
                type="button"
                className={activeView === 'tools' ? 'active' : ''}
                onClick={() => { setActiveView('tools'); setMobileMoreOpen(false); }}
              >
                <KeyRound size={22} /><span>Tools</span>
              </button>
              <button
                type="button"
                className={mobileMoreOpen ? 'active' : ''}
                onClick={() => setMobileMoreOpen((v) => !v)}
              >
                <Plus size={22} /><span>Más</span>
              </button>
            </div>
          </nav>
        </>
      )}

      {showHome && isMobileEdition && (
      <div className="tab-view mobile-home-view" key="mobile-home">

        {/* Score hero */}
        <section className="mobile-score-hero">
          <div className="mobile-score-ring-wrap">
            <svg viewBox="0 0 120 120" className="mobile-score-svg">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#10b981" strokeWidth="8"
                strokeDasharray={`${(securityScore / 100) * 326.7} 326.7`}
                strokeDashoffset="81.7" strokeLinecap="round"
                style={{transition: 'stroke-dasharray .8s ease'}}
              />
            </svg>
            <div className="mobile-score-center">
              <strong>{securityScore}</strong>
              <span>/ 100</span>
            </div>
          </div>
          <div className="mobile-score-info">
            <p className="mobile-score-greeting">{greeting}, {displayUser}</p>
            <h2>{securityScore >= 80 ? 'Bien protegida' : securityScore >= 50 ? 'Hay mejoras' : 'Atención requerida'}</h2>
            <span className={`mobile-score-status ${securityScore >= 80 ? 'good' : securityScore >= 50 ? 'mid' : 'bad'}`}>
              {securityScore >= 80 ? '🛡️ Saludable' : securityScore >= 50 ? '⚠️ En revisión' : '🔴 Crítico'}
            </span>
          </div>
        </section>

        {/* Shortcuts - Amazon pills */}
        <div className="mobile-shortcuts-row">
          <button type="button" onClick={() => setActiveView('accounts')}><UserRoundCheck size={15}/><span>Mis redes</span></button>
          <button type="button" onClick={() => setActiveView('tools')}><KeyRound size={15}/><span>Tools</span></button>
          <button type="button" onClick={() => setActiveView('emergency')}><ShieldAlert size={15}/><span>SOS</span></button>
          <button type="button" onClick={requestConsultation}><CalendarCheck size={15}/><span>Cita</span></button>
          {canAccessExpertWhatsApp && (
            <a href={emergencyWhatsApp} target="_blank" rel="noreferrer"><BellRing size={15}/><span>WhatsApp</span></a>
          )}
          {!hasPaidPlan && (
            <a href={salesWhatsApp} target="_blank" rel="noreferrer"><Sparkles size={15}/><span>Planes</span></a>
          )}
        </div>

        {/* Accordion */}
        <div className="mobile-accordion">

          {/* Mis redes */}
          <div className="mac-item">
            <button
              type="button"
              className={`mac-header${mobileAccordionOpen === 'redes' ? ' open' : ''}`}
              onClick={() => setMobileAccordionOpen(mobileAccordionOpen === 'redes' ? null : 'redes')}
            >
              <div className="mac-icon purple"><UserRoundCheck size={19}/></div>
              <div className="mac-title">
                <strong>Mis redes registradas</strong>
                <span>{accounts.length} {accounts.length === 1 ? 'cuenta' : 'cuentas'}</span>
              </div>
              <ChevronDown size={17} className={`mac-chevron${mobileAccordionOpen === 'redes' ? ' open' : ''}`}/>
            </button>
            {mobileAccordionOpen === 'redes' && (
              <div className="mac-body">
                {accounts.length === 0 ? (
                  <p className="mac-empty">Aún no tienes redes registradas. Ve a "Redes" para agregar tu primera cuenta.</p>
                ) : (
                  accounts.slice(0, 4).map((account) => {
                    const done = accountCheckItems.filter((item) => checks[`account-${account.id}-${item.label}`]).length;
                    const sc = Math.round((done / accountCheckItems.length) * 100);
                    return (
                      <div className="mac-account-row" key={account.id || account.handle}>
                        <div className="mac-account-letter">{(account.platform || '?').charAt(0).toUpperCase()}</div>
                        <div className="mac-account-info">
                          <strong>{account.handle || account.owner || 'Sin usuario'}</strong>
                          <span>{account.platform}</span>
                        </div>
                        <span className={`mac-score-badge ${sc >= 80 ? 'good' : sc >= 50 ? 'mid' : 'bad'}`}>{sc}%</span>
                      </div>
                    );
                  })
                )}
                <button type="button" className="mac-see-all" onClick={() => setActiveView('accounts')}>
                  Ver todas mis redes →
                </button>
              </div>
            )}
          </div>

          {/* Herramientas */}
          <div className="mac-item">
            <button
              type="button"
              className={`mac-header${mobileAccordionOpen === 'tools' ? ' open' : ''}`}
              onClick={() => setMobileAccordionOpen(mobileAccordionOpen === 'tools' ? null : 'tools')}
            >
              <div className="mac-icon blue"><KeyRound size={19}/></div>
              <div className="mac-title">
                <strong>Herramientas de seguridad</strong>
                <span>7 herramientas disponibles</span>
              </div>
              <ChevronDown size={17} className={`mac-chevron${mobileAccordionOpen === 'tools' ? ' open' : ''}`}/>
            </button>
            {mobileAccordionOpen === 'tools' && (
              <div className="mac-body">
                <div className="mac-tools-grid">
                  {[
                    ['verify', FileSearch, 'Verificar', '#10b981'],
                    ['2fa', Lock, '2FA', '#2563eb'],
                    ['passwords', KeyRound, 'Contraseñas', '#16a34a'],
                    ['phishing', ShieldAlert, 'Phishing', '#d97706'],
                    ['templates', Copy, 'Plantillas', '#10b981'],
                    ['incident', AlertTriangle, 'Incidente', '#dc2626'],
                    ['auditFiles', FileSearch, 'Auditoría', '#6b7280'],
                  ].map(([tool, Icon, label, color]) => (
                    <button
                      key={tool}
                      type="button"
                      className="mac-tool-card"
                      style={{'--tc': color}}
                      onClick={() => { setActiveView('tools'); setActiveTool(tool); }}
                    >
                      <Icon size={22}/>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="mac-item">
            <button
              type="button"
              className={`mac-header${mobileAccordionOpen === 'checklist' ? ' open' : ''}`}
              onClick={() => setMobileAccordionOpen(mobileAccordionOpen === 'checklist' ? null : 'checklist')}
            >
              <div className="mac-icon green"><ClipboardCheck size={19}/></div>
              <div className="mac-title">
                <strong>Checklist de seguridad</strong>
                <span>{completedChecks} de {totalChecks} completados</span>
              </div>
              <ChevronDown size={17} className={`mac-chevron${mobileAccordionOpen === 'checklist' ? ' open' : ''}`}/>
            </button>
            {mobileAccordionOpen === 'checklist' && (
              <div className="mac-body">
                <div className="mac-progress-wrap">
                  <div className="mac-progress-bar"><div className="mac-progress-fill" style={{width:`${securityScore}%`}}/></div>
                  <span className="mac-progress-pct">{securityScore}%</span>
                </div>
                <p className="mac-hint">
                  {completedChecks === 0
                    ? 'Empieza agregando tus redes y completando el checklist.'
                    : totalChecks - completedChecks === 0
                    ? '¡Todas las verificaciones completas!'
                    : `${totalChecks - completedChecks} verificaciones pendientes para mejorar tu score.`}
                </p>
                <button type="button" className="mac-see-all" onClick={() => setActiveView('accounts')}>
                  Ir al checklist →
                </button>
              </div>
            )}
          </div>

          {/* Consulta */}
          <div className="mac-item">
            <button
              type="button"
              className={`mac-header${mobileAccordionOpen === 'consulta' ? ' open' : ''}`}
              onClick={() => setMobileAccordionOpen(mobileAccordionOpen === 'consulta' ? null : 'consulta')}
            >
              <div className="mac-icon orange"><CalendarCheck size={19}/></div>
              <div className="mac-title">
                <strong>Consulta con especialista</strong>
                <span>Agenda una sesión personalizada</span>
              </div>
              <ChevronDown size={17} className={`mac-chevron${mobileAccordionOpen === 'consulta' ? ' open' : ''}`}/>
            </button>
            {mobileAccordionOpen === 'consulta' && (
              <div className="mac-body">
                <p className="mac-hint">Agenda una cita para revisar tu caso con calma. Tu especialista te guiará paso a paso.</p>
                {appointmentStatus && <p className="mac-status-msg">{appointmentStatus}</p>}
                <div className="mac-action-row">
                  <button type="button" className="mac-btn primary" onClick={requestConsultation}>
                    <CalendarCheck size={15}/> Agendar cita
                  </button>
                  {canAccessExpertWhatsApp ? (
                    <a className="mac-btn secondary" href={emergencyWhatsApp} target="_blank" rel="noreferrer">
                      <BellRing size={15}/> WhatsApp
                    </a>
                  ) : (
                    <a className="mac-btn secondary" href={salesWhatsApp} target="_blank" rel="noreferrer">
                      <Sparkles size={15}/> Planes
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Plan upgrade */}
          {!hasPaidPlan && (
            <div className="mac-item mac-upgrade-item">
              <button
                type="button"
                className={`mac-header${mobileAccordionOpen === 'plan' ? ' open' : ''}`}
                onClick={() => setMobileAccordionOpen(mobileAccordionOpen === 'plan' ? null : 'plan')}
              >
                <div className="mac-icon purple"><Sparkles size={19}/></div>
                <div className="mac-title">
                  <strong>Tu plan: {isAdmin ? 'Admin' : currentPlan.name}</strong>
                  <span>Desbloquea SOS, Bot y Academia</span>
                </div>
                <ChevronDown size={17} className={`mac-chevron${mobileAccordionOpen === 'plan' ? ' open' : ''}`}/>
              </button>
              {mobileAccordionOpen === 'plan' && (
                <div className="mac-body">
                  <p className="mac-hint">Activa un plan de pago para acceder a respuesta urgente, AztekBot y Academia.</p>
                  <a className="mac-btn primary" href={salesWhatsApp} target="_blank" rel="noreferrer">
                    <Sparkles size={15}/> Ver planes de pago
                  </a>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      )}

      {showHome && !isMobileEdition && (
      <div className="tab-view" key="home">
      <section className="consultation-banner">
        <div>
          <p className="eyebrow">Agenda tu Consulta Personalizada</p>
          <h2>¿Tienes algún problema especial que requiera atención de tu especialista en seguridad?</h2>
          <p>
            {canAccessExpertWhatsApp
              ? 'Agenda una cita aquí para revisar tu caso con calma. Si es urgente, presiona el botón de WhatsApp urgente y te atiendo lo antes posible.'
              : 'Agenda una cita para revisar tu caso y, si necesitas atención prioritaria, activa un plan de pago para obtener respuesta directa por WhatsApp.'}
          </p>
          {appointmentStatus && <span>{appointmentStatus}</span>}
        </div>
        <div className="consultation-actions">
          <button type="button" className="primary-action" onClick={requestConsultation}>
            <CalendarCheck size={18} />
            Agendar cita
          </button>
          {canAccessExpertWhatsApp ? (
            <a className="secondary-action" href={emergencyWhatsApp} target="_blank" rel="noreferrer">
              <BellRing size={18} />
              WhatsApp urgente
            </a>
          ) : (
            <a className="secondary-action" href={salesWhatsApp} target="_blank" rel="noreferrer">
              <Sparkles size={18} />
              Subir a plan de pago
            </a>
          )}
        </div>
      </section>

      <section className="hero">
        <div className="hero-top">
          <div className="brand-lockup">
            <img src="/aztekiller-logo.png" alt="Aztekiller" />
          <div>
            <span>Aztekiller</span>
            <strong>Creators Guardian</strong>
          </div>
        </div>
          <div className="hero-tools">
            <div className="status-pill">
              <ShieldCheck size={18} />
              Centro de seguridad para creadores
            </div>
            <div className="status-pill">
              <Sparkles size={18} />
              Plan activo: {isAdmin ? 'Admin' : currentPlan.name}
            </div>
            <button type="button" className="profile-pill" onClick={onLogout} title="Cerrar sesión">
              <UserRoundCheck size={17} />
              {displayUser}
            </button>
            <button type="button" className="logout-pill" onClick={onLogout}>
              <LogOut size={17} />
              Cerrar sesión
            </button>
          </div>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="welcome-line">{greeting}, {displayUser}. Cuidemos {brandLabel}.</p>
            <h1>
              <span>Seguridad UGC</span>
              <span>para abrir,</span>
              <span>firmar y publicar</span>
              <span>con confianza.</span>
            </h1>
            <p>
              Esta aplicación está hecha para que manejes todas tus cuentas con orden, calidad y confianza.
              Revisa cada perfil, fortalece tus accesos y toma decisiones seguras antes de abrir archivos,
              firmar colaboraciones o publicar contenido.
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-action" onClick={() => navigateView('accounts', 'accounts')}>
                <ClipboardCheck size={18} />
                Revisar mis redes
              </button>
              <button type="button" className="secondary-action" onClick={() => navigateView('tools', 'tools')}>
                <KeyRound size={18} />
                Herramientas
              </button>
              {canAccessCanva && (
                <a className="secondary-action" href={canvaAccessUrl} target="_blank" rel="noreferrer">
                  <Sparkles size={18} />
                  Pide tu acceso a Canva
                </a>
              )}
              {canAccessEmergency ? (
                <button type="button" className="secondary-action" onClick={() => navigateView('emergency', 'emergency')}>
                  <BellRing size={18} />
                  Modo emergencia
                </button>
              ) : (
                <a className="secondary-action" href={salesWhatsApp} target="_blank" rel="noreferrer">
                  <ShieldAlert size={18} />
                  Desbloquear SOS
                </a>
              )}
            </div>
          </div>
          <div className="score-panel">
            <div className="score-ring-wrap">
              <svg viewBox="0 0 120 120" className="score-ring-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(138,43,226,.15)" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke={securityScore >= 70 ? '#22c55e' : securityScore >= 40 ? '#f59e0b' : '#ef4444'} strokeWidth="10"
                  strokeDasharray={`${(securityScore / 100) * 314} 314`}
                  strokeLinecap="round" strokeDashoffset="78.5" style={{transition:'stroke-dasharray .8s ease'}}/>
              </svg>
              <div className="score-ring-center">
                <strong>{securityScore}</strong>
                <span>/ 100</span>
              </div>
            </div>
            <p className="score-label">{securityScore >= 70 ? 'Buena seguridad' : securityScore >= 40 ? 'Seguridad media' : 'Requiere atención'}</p>
            <span className="score-sub">{completedChecks} de {totalChecks} controles activos</span>
          </div>
        </div>
      </section>

      <section className="next-steps">
        <article>
          <span>1</span>
          <strong>Registra tus redes</strong>
          <p>Agrega Instagram, TikTok, YouTube o la cuenta que uses para colaboraciones.</p>
        </article>
        <article>
          <span>2</span>
          <strong>Completa el checklist</strong>
          <p>La app calcula un score para saber si cada perfil está crítico, en riesgo o saludable.</p>
        </article>
        <article>
          <span>3</span>
          <strong>Verifica antes de abrir</strong>
          <p>Revisa links, correos y archivos sospechosos antes de responder a una marca.</p>
        </article>
      </section>

      <section className="creator-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Panel del creador</p>
            <h2>Tu información de acceso y servicio</h2>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            {!editingProfile && (
              <button type="button" className="inline-button" onClick={startEditingProfile}>
                <Save size={15} />
                Editar perfil
              </button>
            )}
            <button type="button" className="inline-button" onClick={() => navigateView('accounts', 'accounts')}>
              <UserRoundCheck size={16} />
              Ver redes
            </button>
          </div>
        </div>

        {editingProfile ? (
          <div className="profile-edit-form">
            {[
              ['Nombre completo', 'full_name', 'text', 'Ej. María López'],
              ['Teléfono', 'phone', 'tel', 'Ej. +52 55 1234 5678'],
              ['Marca / nombre UGC', 'brand_name', 'text', 'Ej. MariUGC'],
              ['Handle principal', 'main_handle', 'text', 'Ej. @mariugc'],
            ].map(([label, field, type, placeholder]) => (
              <label key={field} className="profile-edit-field">
                <span>{label}</span>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={profileEditData[field] || ''}
                  onChange={(e) => setProfileEditData((prev) => ({ ...prev, [field]: e.target.value }))}
                />
              </label>
            ))}
            {profileSaveStatus && <p className="profile-save-status">{profileSaveStatus}</p>}
            <div className="profile-edit-actions">
              <button type="button" className="primary-action" onClick={saveProfileEdit}>
                <Save size={15} />
                Guardar cambios
              </button>
              <button type="button" className="secondary-action" onClick={() => setEditingProfile(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="creator-info-grid">
            {[
              ['Nombre', displayUser],
              ['Usuario principal', creatorProfile?.main_handle || currentUser.user_metadata?.main_handle || 'Pendiente'],
              ['Correo de registro', currentUser.email || 'Sin correo'],
              ['Teléfono', creatorProfile?.phone || currentUser.user_metadata?.phone || 'Pendiente'],
              ['Marca / nombre UGC', brandLabel],
              ['Plan / estado', `${isAdmin ? 'Admin' : currentPlan.name} · ${planStatusLabel}`],
              ['Score general', `${securityScore}/100`],
              ['Perfiles registrados', `${accounts.length}`],
            ].map(([label, value]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
        )}
        <p className="microcopy">
          Esta información nos ayuda a ubicar tu cuenta, revisar tu avance y darte soporte más rápido sin pedirte datos sensibles.
          Recuerda: no guardamos contraseñas.
        </p>
        <div className="creator-account-actions">
          <div className="creator-account-actions-copy">
            <p className="eyebrow">Gestión de cuenta</p>
            <strong>¿Quieres cambiar tu acceso o cerrar tu etapa con nosotros?</strong>
            <span>
              Si ya no quieres seguir en un plan de pago, puedes bajarte a free.
              Si quieres eliminar tu cuenta por completo, te abrimos el canal seguro para hacerlo contigo.
            </span>
            {accountActionStatus && <small>{accountActionStatus}</small>}
          </div>
          <div className="creator-account-actions-buttons">
            <button
              type="button"
              className="secondary-action"
              onClick={switchToStarterPlan}
              disabled={isChangingToStarter}
            >
              <Shield size={16} />
              {isChangingToStarter ? 'Cambiando...' : 'Cambiarme a free'}
            </button>
            <button type="button" className="danger-action" onClick={requestAccountDeletion}>
              <Trash2 size={16} />
              Quiero eliminar mi cuenta
            </button>
          </div>
        </div>
      </section>

      <section className="metrics compact-metrics">
        {[
          ['2FA', 'Prioridad crítica', Lock],
          ['Correos privados', 'Menos suplantacion', MailCheck],
          ['Archivos verificados', 'Antes de abrir PDFs', FileSearch],
          ['Respuesta rápida', 'Plan ante hackeo', Zap],
        ].map(([title, text, Icon]) => (
          <article key={title}>
            <Icon size={22} />
            <strong>{title}</strong>
            <span>{text}</span>
          </article>
        ))}
      </section>

      {!hasPaidPlan && (
      <>
      <section className="section-head pricing-head">
        <div>
          <p className="eyebrow">Planes</p>
          <h2>Protección para cada etapa</h2>
        </div>
        <a className="inline-button" href={salesWhatsApp} target="_blank" rel="noreferrer">
          <BellRing size={16} />
          Activar por WhatsApp
        </a>
      </section>

      <section className="pricing-grid">
        {landingPlans.map((plan) => (
          <article className={`pricing-card ${plan.featured ? 'featured' : ''}`} key={plan.id}>
            <span>{plan.badge}</span>
            <h3>{plan.name}</h3>
            <div className="price-line">
              <strong>{plan.price.split(' /')[0]}</strong>
              <small>/mes</small>
            </div>
            <p>{plan.summary}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check size={14} />
                  {feature}
                </li>
              ))}
            </ul>
            <a href={`${salesWhatsApp}%20Plan:%20${encodeURIComponent(plan.name)}`} target="_blank" rel="noreferrer">
              {plan.id === 'starter' ? 'Empezar gratis' : 'Elegir plan'}
            </a>
          </article>
        ))}
      </section>
      </>
      )}

      </div>
      )}

      {showTools && (
      <div className="tab-view" key="tools">

      {isMobileEdition && (
        <div className="mobile-tools-header">
          {activeTool && (
            <button type="button" className="mobile-tool-back" onClick={() => setActiveTool(null)}>
              <ChevronDown size={16} style={{transform:'rotate(90deg)'}}/> Herramientas
            </button>
          )}
          {!activeTool && <p className="mobile-section-title">Selecciona una herramienta</p>}
        </div>
      )}

      {isMobileEdition && !activeTool && (
        <div className="mobile-tools-grid-view">
          {[
            creatorType === 'streamer' ? ['streamer-shield', Wifi, 'Streamer Shield', 'Blindaje de red y OBS', '#9146ff'] : null,
            creatorType === 'adult' ? ['privacy-shield', Lock, 'Privacy Shield', 'Anonimato y piratería', '#ef4444'] : null,
            ['verify', FileSearch, 'Verificar links', 'URLs, correos y archivos', '#10b981'],
            ['2fa', Lock, '2FA', 'Doble autenticación', '#2563eb'],
            ['passwords', KeyRound, 'Contraseñas', 'Genera y evalúa', '#16a34a'],
            ['phishing', ShieldAlert, 'Anti-Phishing', 'Detecta engaños', '#d97706'],
            ['templates', Copy, 'Plantillas', 'Textos de respuesta', '#10b981'],
            ['incident', AlertTriangle, 'Incidente', 'Reportar y actuar', '#dc2626'],
            ['auditFiles', FileSearch, 'Auditoría', 'Archivos sospechosos', '#6b7280'],
          ].filter(Boolean).map(([tool, Icon, label, desc, color]) => (
            <button
              key={tool}
              type="button"
              className="mtg-card"
              style={{'--tc': color}}
              onClick={() => setActiveTool(tool)}
            >
              <div className="mtg-icon"><Icon size={26}/></div>
              <strong>{label}</strong>
              <span>{desc}</span>
            </button>
          ))}
        </div>
      )}

      <section className="tool-tabs" style={isMobileEdition ? {display:'none'} : undefined}>
        {[
          ['verify', FileSearch, 'Verificar'],
          ['2fa', Lock, '2FA'],
          ['passwords', KeyRound, 'Contraseñas'],
          ['phishing', ShieldAlert, 'Phishing'],
          ['templates', Copy, 'Plantillas'],
          ['incident', AlertTriangle, 'Incidente'],
          ['auditFiles', FileSearch, 'Archivos para auditoría'],
        ].map(([tool, Icon, label]) => (
          <button
            type="button"
            key={tool}
            className={activeTool === tool ? 'active' : ''}
            onClick={() => setActiveTool(tool)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </section>

      <section id="tools" className="workbench">
        {activeTool === 'verify' && (
        <article className="tool-card scanner-card">
          <div className="card-title">
            <FileSearch size={22} />
            <h3>Verificador de seguridad</h3>
          </div>
          <p className="tool-description">
            Herramientas para detectar amenazas antes de que te afecten.
            <strong> Links y correos</strong>: analiza URLs y correos en busca de señales de phishing, acortadores sospechosos y dominios peligrosos.
            <strong> Correo expuesto</strong>: revisa si tu correo aparece en filtraciones de datos conocidas.
            <strong> Archivo local</strong>: genera el hash SHA-256 de cualquier archivo para verificar que no fue alterado.
          </p>
          <div className="security-subtabs">
            {[
              ['scanner', ShieldAlert, 'Links y correos', true],
              ['breach', MailCheck, 'Correo expuesto', canAccessAdvancedTools],
              ['file', FileSearch, 'Archivo local', canAccessAdvancedTools],
            ].map(([tool, Icon, label, canAccess]) => (
              <button
                type="button"
                key={tool}
                className={`${activeVerifyTool === tool ? 'active' : ''}${!canAccess ? ' nav-locked' : ''}`}
                onClick={() => canAccess && setActiveVerifyTool(tool)}
              >
                <Icon size={15} />
                {label}
                {!canAccess && <Lock size={9} className="nav-lock-icon" />}
              </button>
            ))}
          </div>

          {activeVerifyTool === 'scanner' && (
          <>
          <div className="segmented">
            {[
              ['url', Link2, 'Link'],
              ['email', MailCheck, 'Correo'],
            ].map(([value, Icon, label]) => (
              <button
                type="button"
                key={value}
                className={scanType === value ? 'active' : ''}
                onClick={() => setScanType(value)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
          <input
            className="scan-input"
            value={scanValue}
            onChange={(event) => setScanValue(event.target.value)}
            placeholder={scanType === 'url' ? 'https://marca.com/brief.pdf' : 'colaboraciones@marca.com'}
          />
          <div className={`risk-box risk-${scan.level.toLowerCase()}`}>
            <strong>Riesgo {scan.level}: {scan.risk}%</strong>
            <ul>
              {scan.flags.map((flag) => <li key={flag}>{flag}</li>)}
            </ul>
          </div>
          <div className="button-row">
            <a
              className="inline-button"
              href={scanValue ? `https://www.virustotal.com/gui/search/${encodeURIComponent(scanValue)}` : 'https://www.virustotal.com/gui/home/search'}
              target="_blank"
              rel="noreferrer"
            >
              <ShieldAlert size={16} />
              Abrir en VirusTotal
            </a>
          </div>
          </>
          )}

          {activeVerifyTool === 'breach' && (
            <div className="breach-checker">
              <p className="microcopy">
                Revisa senales basicas del correo asociado y abre una consulta publica para confirmar si aparece en filtraciones.
              </p>
              <div className="breach-input-row">
                <input
                  className="scan-input"
                  value={emailCheckValue}
                  onChange={(event) => setEmailCheckValue(event.target.value)}
                  placeholder="correo privado o alias@dominio.com"
                />
                <button type="button" onClick={() => runEmailSecurityCheck()}>
                  <MailCheck size={16} />
                  Revisar
                </button>
              </div>
              {emailCheckResult && (
                <div className={`risk-box risk-${emailCheckResult.level.toLowerCase()}`}>
                  <strong>Riesgo local {emailCheckResult.level}: {emailCheckResult.risk}%</strong>
                  <ul>
                    <li>{emailCheckResult.message}</li>
                    <li>Ultima revision: {emailCheckResult.checkedAt}</li>
                    <li>Si este correo aparece publicado, usa un alias privado para recuperacion.</li>
                  </ul>
                  <a
                    className="inline-button"
                    href={`https://haveibeenpwned.com/account/${encodeURIComponent(emailCheckResult.email)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                    Confirmar en Have I Been Pwned
                  </a>
                </div>
              )}
            </div>
          )}

          {activeVerifyTool === 'file' && (
          <>
          <label className="file-drop">
            <Download size={18} />
            <span>Sube tu archivo para revisarlo antes de abrirlo</span>
            <input type="file" onChange={handleFile} />
          </label>
          {fileScanStatus && (
            <div className={`file-status ${fileScan ? 'ready' : ''}`}>
              {fileScanStatus}
            </div>
          )}
          {fileScan && (
            <div className="file-result">
              <strong>{fileScan.name}</strong>
              <span>{(fileScan.size / 1024 / 1024).toFixed(2)} MB</span>
              <div className={`open-risk risk-${fileScan.risk.toLowerCase()}`}>
                <b>Nivel de riesgo al abrirlo: {fileScan.risk}</b>
                <span>{fileRiskDetails[fileScan.risk]}</span>
              </div>
              <span>Hash SHA-256 calculado en tu dispositivo. Puedes copiarlo o abrirlo en VirusTotal.</span>
              <button type="button" onClick={() => copyText(fileScan.hash, 'hash')}>
                <Fingerprint size={15} />
                {copied === 'hash' ? 'Hash copiado' : 'Copiar hash'}
              </button>
              <a href={`https://www.virustotal.com/gui/file/${fileScan.hash}`} target="_blank" rel="noreferrer">
                Ver hash en VirusTotal
              </a>
            </div>
          )}
          </>
          )}
        </article>
        )}

        {activeTool === '2fa' && (
          <article className="tool-card twofa-card">
            <div className="card-title">
              <Lock size={22} />
              <h3>Activador guiado de 2FA</h3>
            </div>
            <p className="microcopy">
              El objetivo es que cada perfil tenga 2FA con app autenticadora. Evita depender solo de SMS cuando sea posible.
            </p>
            <div className="twofa-target">
              <label>
                Perfil que estás protegiendo
                <select
                  value={selectedAccount?.id || ''}
                  onChange={(event) => {
                    const account = accounts.find((item) => item.id === event.target.value);
                    if (account) {
                      setSelectedPlatform(account.platform);
                      setSelectedAccountId(account.id);
                    }
                  }}
                >
                  {accounts.map((account) => (
                    <option key={account.id || `${account.platform}-${account.profileType}`} value={account.id || ''}>
                      {account.platform} · {account.profileType || account.owner || 'Perfil'} {account.handle ? `· ${account.handle}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <a
                className="inline-button"
                href={platformSecurityLinks[selectedAccount?.platform || selectedPlatform] || 'https://www.google.com/search?q=activar+2fa'}
                target="_blank"
                rel="noreferrer"
              >
                <ShieldCheck size={16} />
                Abrir seguridad de {selectedAccount?.platform || selectedPlatform}
              </a>
            </div>
            <div className="twofa-steps">
              {[
                'Abre la configuración de seguridad de la plataforma.',
                'Elige app autenticadora como método principal.',
                'Escanea el QR con Google Authenticator, Microsoft Authenticator, 1Password o Bitwarden.',
                'Guarda códigos de respaldo fuera del teléfono principal.',
                'Regresa aquí y marca 2FA activo para actualizar el score.',
              ].map((step, index) => (
                <div key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
            <div className="button-row">
              <button type="button" onClick={markSelectedAccount2Fa}>
                <Check size={16} />
                Marcar 2FA activo
              </button>
              <a className="inline-button" href={`${salesWhatsApp}%20Necesito%20ayuda%20para%20configurar%202FA.`} target="_blank" rel="noreferrer">
                <BellRing size={16} />
                Pedir ayuda
              </a>
            </div>
            {copied === '2FA marcado' && <p className="microcopy">2FA marcado y score actualizado.</p>}
          </article>
        )}

        {activeTool === 'passwords' && (
        <article className="tool-card password-card">
          <div className="card-title">
            <KeyRound size={22} />
            <h3>Generador de contraseñas</h3>
          </div>
          <div className="password-box">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-label="Contrasena generada"
            />
            <button type="button" title="Mostrar u ocultar" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="strength-track">
            <span style={{ width: `${passwordScore}%` }} />
          </div>
          <div className={`password-strength-summary ${passwordStrength.className}`}>
            <strong>{passwordStrength.label} · {passwordScore}/100</strong>
            <span>Tiempo estimado si se intenta descifrar: {passwordStrength.crack}.</span>
          </div>
          <div className="password-controls">
            <label>
              Longitud: {passwordLength} digitos
              <input
                type="range"
                min="8"
                max="16"
                value={passwordLength}
                onChange={(event) => {
                  const nextLength = Number(event.target.value);
                  setPasswordLength(nextLength);
                  refreshPassword(nextLength, passwordOptions);
                }}
              />
            </label>
            <div className="password-toggles">
              <label>
                <input
                  type="checkbox"
                  checked={passwordOptions.uppercase}
                  onChange={(event) => updatePasswordOption('uppercase', event.target.checked)}
                />
                Mayusculas
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={passwordOptions.lowercase}
                  onChange={(event) => updatePasswordOption('lowercase', event.target.checked)}
                />
                Minusculas
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={passwordOptions.numbers}
                  onChange={(event) => updatePasswordOption('numbers', event.target.checked)}
                />
                Numeros
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={passwordOptions.symbols}
                  onChange={(event) => updatePasswordOption('symbols', event.target.checked)}
                />
                Caracteres
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={passwordOptions.noAmbiguous}
                  onChange={(event) => updatePasswordOption('noAmbiguous', event.target.checked)}
                />
                Evitar 0/O y 1/l
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={passwordOptions.easy}
                  onChange={(event) => updatePasswordOption('easy', event.target.checked)}
                />
                Mas facil de dictar
              </label>
            </div>
          </div>
          <div className="button-row">
            <button type="button" onClick={() => refreshPassword()}>
              <RefreshCw size={16} />
              Generar
            </button>
            <button type="button" onClick={() => copyText(password, 'password')}>
              <Copy size={16} />
              {copied === 'password' ? 'Copiada' : 'Copiar'}
            </button>
            <button type="button" onClick={savePasswordHistory}>
              <Save size={16} />
              {copied === 'password-history' ? 'Guardada' : 'Historial local'}
            </button>
            <button type="button" onClick={runPwnedPasswordCheck}>
              <ShieldAlert size={16} />
              Filtraciones
            </button>
          </div>
          {pwnedPasswordResult && (
            <div className={`password-check-result ${pwnedPasswordResult.status}`}>
              {pwnedPasswordResult.message}
            </div>
          )}
          <div className="password-history">
            <div className="password-history-head">
              <strong>Historial local</strong>
              <button type="button" onClick={clearPasswordHistory}>Limpiar</button>
            </div>
            {passwordHistory.length ? (
              <div className="password-history-list">
                {passwordHistory.slice(0, 5).map((entry) => (
                  <div className="password-history-item" key={entry.id}>
                    <span>{new Date(entry.createdAt).toLocaleString('es-MX')} · {entry.length} chars · {entry.score}/100</span>
                    <button type="button" onClick={() => copyText(entry.password, `history-${entry.id}`)}>
                      <Copy size={14} />
                      {copied === `history-${entry.id}` ? 'Copiada' : 'Copiar'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="microcopy">Aun no hay contrasenas guardadas en este dispositivo.</p>
            )}
          </div>
          <div className="security-note">
            <ShieldCheck size={17} />
            <p>
              Nosotros no guardamos tus contraseñas. Cópiala y guárdala en un lugar seguro como
              Bitwarden, 1Password, iCloud Keychain, Google Password Manager o Samsung Pass.
            </p>
          </div>
        </article>
        )}

        {activeTool === 'phishing' && (
          <article className="tool-card">
            <div className="card-title">
              <ShieldAlert size={22} />
              <h3>Detector de phishing</h3>
            </div>
            <textarea
              className="tool-textarea"
              value={phishingText}
              onChange={(event) => setPhishingText(event.target.value)}
              placeholder="Pega aqui el mensaje, DM o correo de la marca..."
            />
            <div className={`risk-box risk-${phishingScan.level.toLowerCase()}`}>
              <strong>Riesgo {phishingScan.level}: {phishingScan.risk}%</strong>
              <ul>
                {phishingScan.flags.map((flag) => <li key={flag}>{flag}</li>)}
              </ul>
            </div>
          </article>
        )}

        {activeTool === 'templates' && (
          <article className="tool-card">
            <div className="card-title">
              <Copy size={22} />
              <h3>Plantillas seguras</h3>
            </div>
            {[
              ['Pedir correo oficial', 'Gracias por contactarme. Por seguridad, podrian enviarme el brief desde un correo corporativo de la marca o un enlace oficial del dominio de la empresa?'],
              ['Pedir archivo seguro', 'Para proteger mis cuentas y dispositivos, no abro archivos comprimidos. Pueden enviarme el brief en PDF o en un enlace oficial verificable?'],
              ['Aviso por posible hackeo', 'Hola, estoy revisando un posible acceso no autorizado a mis cuentas. Si recibiste links o mensajes raros desde mi perfil, por favor no los abras hasta nuevo aviso.'],
              ['Solicitar revisión segura completa', `Hola, soy ${displayUser}. Antes de abrir, firmar o publicar cualquier material, necesito confirmar que todo sea seguro.\n\nPor favor envíame el brief, enlaces, contratos, PDFs, archivos o accesos necesarios por este medio oficial. Mi usuario/marca es ${creatorProfile?.main_handle || brandLabel || 'mi perfil UGC'}.\n\nPor protocolo de seguridad, mi equipo técnico revisará los enlaces y archivos recibidos. Te responderé cuando el equipo de seguridad me dé el visto bueno para abrirlos, firmarlos o continuar con la colaboración.\n\nGracias por entenderlo; cuidamos tanto mis cuentas como la seguridad de la marca.`],
            ].map(([title, text]) => (
              <div className="template-card" key={title}>
                <strong>{title}</strong>
                <p>{text}</p>
                <button type="button" onClick={() => copyText(text, title)}>
                  <Copy size={15} />
                  {copied === title ? 'Copiada' : 'Copiar'}
                </button>
              </div>
            ))}
          </article>
        )}

        {activeTool === 'incident' && (
          <article className="tool-card">
            <div className="card-title">
              <AlertTriangle size={22} />
              <h3>Bitácora de incidente</h3>
            </div>
            <div className="incident-grid">
              <label>
                Fecha y hora
                <input
                  type="datetime-local"
                  value={incidentOccurredAt}
                  onChange={(event) => setIncidentOccurredAt(event.target.value)}
                />
              </label>
              <label>
                Cuenta afectada
                <select
                  value={incidentAccountId || selectedAccount?.id || ''}
                  onChange={(event) => setIncidentAccountId(event.target.value)}
                >
                  <option value="">General / no sé</option>
                  {accounts.map((account) => (
                    <option key={account.id || `${account.platform}-${account.profileType}`} value={account.id || ''}>
                      {account.platform} · {account.profileType || account.owner || 'Perfil'} {account.handle ? `· ${account.handle}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tipo
                <select value={incidentType} onChange={(event) => setIncidentType(event.target.value)}>
                  <option>Intento de acceso</option>
                  <option>Link sospechoso</option>
                  <option>Correo falso</option>
                  <option>Archivo sospechoso</option>
                  <option>Cuenta comprometida</option>
                  <option>Otro</option>
                </select>
              </label>
              <label>
                Severidad
                <select value={incidentSeverity} onChange={(event) => setIncidentSeverity(event.target.value)}>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </label>
            </div>
            <textarea
              className="tool-textarea"
              value={incidentText}
              onChange={(event) => setIncidentText(event.target.value)}
              placeholder="Ejemplo: El 5 de mayo a las 8:30 pm recibí alerta de intento de acceso en mi Instagram principal. No fui yo. Cambié contraseña y cerré sesiones..."
            />
            {incidentStatus && <div className="file-status ready">{incidentStatus}</div>}
            <div className="button-row">
              <button type="button" onClick={saveIncident}>
                <ClipboardCheck size={16} />
                Guardar incidente
              </button>
              <button type="button" onClick={() => copyText(incidentText, 'incident')}>
                <Copy size={16} />
                {copied === 'incident' ? 'Copiado' : 'Copiar reporte'}
              </button>
              <a className="inline-button" href={emergencyWhatsApp} target="_blank" rel="noreferrer">
                <BellRing size={16} />
                Enviar SOS
              </a>
            </div>
            <p className="microcopy">Guarda fecha, cuenta afectada, evidencia y acciones tomadas. Esto ayuda al soporte de la plataforma.</p>
          </article>
        )}

        {activeTool === 'auditFiles' && !canAccessAdvancedTools && (
          <article className="tool-card">
            <LockedSection
              requiredPlan="pro"
              section="Auditoría de archivos"
              description="La auditoría avanzada de archivos está disponible en el plan Guardián Pro o superior."
            />
          </article>
        )}

        {activeTool === 'auditFiles' && canAccessAdvancedTools && (
          <article className="tool-card scanner-card">
            <div className="card-title">
              <FileSearch size={22} />
              <h3>Archivos para auditoría</h3>
            </div>
            <p className="microcopy">
              Usa esta pestaña cuando una marca te mande contratos, PDFs, briefs, archivos comprimidos o enlaces raros.
              El archivo se revisa localmente para calcular su hash; no lo abras hasta que tengas visto bueno.
            </p>
            <label className="file-drop">
              <Download size={18} />
              <span>Sube el archivo que quieres mandar a auditoría</span>
              <input type="file" onChange={handleAuditFile} />
            </label>
            <div className="incident-grid">
              <label>
                Urgencia
                <select value={auditFileUrgency} onChange={(event) => setAuditFileUrgency(event.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </label>
              <label>
                Contexto
                <input
                  value={auditFileNote}
                  onChange={(event) => setAuditFileNote(event.target.value)}
                  placeholder="Ej. Me lo mandó una marca por Instagram para firmar hoy"
                />
              </label>
            </div>
            {auditFileStatus && <div className={`file-status ${auditFile ? 'ready' : ''}`}>{auditFileStatus}</div>}
            {auditFile && (
              <div className="file-result">
                <strong>{auditFile.name}</strong>
                <span>{(auditFile.size / 1024 / 1024).toFixed(2)} MB · {auditFile.type}</span>
                <div className={`open-risk risk-${auditFile.risk.toLowerCase()}`}>
                  <b>Nivel de riesgo para auditoría: {auditFile.risk}</b>
                  <span>{fileRiskDetails[auditFile.risk]}</span>
                </div>
                <span>Hash SHA-256: {auditFile.hash}</span>
                <div className="button-row">
                  <button type="button" onClick={() => copyText(auditFile.hash, 'audit-hash')}>
                    <Fingerprint size={15} />
                    {copied === 'audit-hash' ? 'Hash copiado' : 'Copiar hash'}
                  </button>
                  <a href={`https://www.virustotal.com/gui/file/${auditFile.hash}`} target="_blank" rel="noreferrer">
                    Ver en VirusTotal
                  </a>
                  <a className="inline-button" href={auditWhatsAppText} target="_blank" rel="noreferrer">
                    <BellRing size={16} />
                    Mandar a soporte
                  </a>
                </div>
              </div>
            )}
            <div className="security-note">
              <ShieldCheck size={17} />
              <p>
                El equipo de seguridad verificará enlaces, archivos y contexto. Se te responderá cuando el equipo técnico
                dé visto bueno para abrir, firmar o continuar.
              </p>
            </div>
          </article>
        )}
      </section>
      </div>
      )}

      {showAccounts && (
      <div className="tab-view" key="accounts">
      <section id="accounts" className="section-head network-head">
        <div>
          <p className="eyebrow">Redes sociales</p>
          <h2>Perfiles protegidos</h2>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <button type="button" className="ghost-button" onClick={exportAccountsCSV} title="Exportar CSV">
            <Download size={15} />
            Exportar
          </button>
          <button type="button" className="ghost-button" onClick={() => addAccount(selectedPlatform)}>
            <Plus size={16} />
            Agregar perfil
          </button>
        </div>
      </section>

      <section className="network-workspace">
        <div className="accounts-left-col">
          <div className="platform-tabs">
            {socialPlatforms.map((platform) => (
              <button
                type="button"
                key={platform}
                className={selectedPlatform === platform ? 'active' : ''}
                onClick={() => setSelectedPlatform(platform)}
              >
                {platform}
              </button>
            ))}
          </div>

          <div className="profile-tabs">
            {platformAccounts.map((account) => (
              <button
                type="button"
                key={account.id || account.profileType}
                className={(selectedAccount?.id || selectedAccount?.profileType) === (account.id || account.profileType) ? 'active' : ''}
                onClick={() => setSelectedAccountId(account.id || '')}
              >
                {account.profileType || account.owner || 'Principal'}
              </button>
            ))}
            {!platformAccounts.length && (
              <button type="button" className="active" onClick={() => addAccount(selectedPlatform)}>Crear perfil</button>
            )}
          </div>

          <div className="accounts-summary-list">
            {accounts.map((a) => {
              const score = accountCheckItems.reduce((s, item) => s + (checks[`account-${a.id}-${item.label}`] ? Math.round(100 / accountCheckItems.length) : 0), 0);
              const isSelected = (selectedAccount?.id || selectedAccount?.profileType) === (a.id || a.profileType);
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`accounts-summary-item${isSelected ? ' active' : ''}`}
                  onClick={() => { setSelectedPlatform(a.platform); setSelectedAccountId(a.id || ''); }}
                >
                  <span className="asm-platform">{a.platform}</span>
                  <span className="asm-handle">{a.handle || a.profileType || 'Sin handle'}</span>
                  <span className={`asm-score ${score >= 70 ? 'ok' : score >= 40 ? 'warn' : 'risk'}`}>{score}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="accounts-right-col">
        {accountNotice && <div className="account-notice">{accountNotice}</div>}

        {!platformAccounts.length && (
          <article className="empty-state">
            <ShieldCheck size={28} />
            <strong>Aún no tienes perfiles de {selectedPlatform}</strong>
            <p>
              Crea tu primer perfil para guardar el usuario, correo asociado y checklist de seguridad
              de esta red.
            </p>
            <button type="button" onClick={() => addAccount(selectedPlatform)}>
              <Plus size={16} />
              Crear perfil principal
            </button>
          </article>
        )}

        {selectedAccount && selectedAccountIndex >= 0 && (
          <article className="profile-card">
            <div className="profile-card-top">
              <div>
                <span>{selectedPlatform}</span>
                <strong>{selectedAccount.profileType || 'Perfil principal'}</strong>
              </div>
              <div className={`score-badge ${selectedAccountLabel.className}`}>
                <b>{selectedAccountScore}</b>
                <small>{selectedAccountLabel.label}</small>
              </div>
            </div>

            <div className="profile-score-panel">
              <div className={`profile-score-ring ${selectedAccountLabel.className}`}>
                <strong>{selectedAccountScore}</strong>
                <span>/100</span>
              </div>
              <div>
                <p className="eyebrow">Score de seguridad</p>
                <h3>{selectedAccountLabel.label}</h3>
                <p>
                  Este porcentaje se calcula con el checklist de esta cuenta. Si falta algo, aparecerá
                  en tu reporte admin para saber exactamente como ayudarte.
                </p>
              </div>
            </div>

            <div className="account-fields refined">
              <label>
                Tipo de perfil
                <select
                  value={selectedAccount.profileType || 'Principal'}
                  onChange={(event) => changeProfileType(selectedAccountIndex, event.target.value)}
                >
                  {profileTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label>
                Usuario del perfil
                <input
                  value={selectedAccount.handle || ''}
                  placeholder="@usuario"
                  onChange={(event) => updateAccount(selectedAccountIndex, 'handle', event.target.value)}
                />
              </label>
              <label>
                Correo asociado
                <input
                  value={selectedAccount.emailLabel || ''}
                  placeholder="correo privado o alias"
                  onChange={(event) => updateAccount(selectedAccountIndex, 'emailLabel', event.target.value)}
                />
              </label>
              <label>
                Última revisión
                <input
                  value={selectedAccount.lastReview}
                  placeholder="Hoy"
                  onChange={(event) => updateAccount(selectedAccountIndex, 'lastReview', event.target.value)}
                />
              </label>
            </div>

            <div className={`email-security-card risk-${selectedEmailHint.level.toLowerCase()}`}>
              <MailCheck size={18} />
              <div>
                <strong>Revision del correo asociado</strong>
                <span>{selectedEmailHint.message}</span>
              </div>
              <button
                type="button"
                className={emailCheckStatus === 'done' ? 'is-success' : ''}
                onClick={() => runEmailSecurityCheck(selectedAccount.emailLabel || '')}
              >
                {emailCheckStatus === 'loading' ? 'Revisando...' : emailCheckStatus === 'done' ? 'Listo' : 'Revisar'}
              </button>
            </div>
            {selectedEmailReview && (
              <div ref={selectedEmailReviewRef} className={`risk-box risk-${selectedEmailReview.level.toLowerCase()}`}>
                <strong>Revision del correo {selectedEmailReview.level}: {selectedEmailReview.risk}%</strong>
                <ul>
                  <li>{selectedEmailReview.message}</li>
                  <li>Ultima revision: {selectedEmailReview.checkedAt}</li>
                  <li>Si este correo recupera cuentas importantes, evita publicarlo y usa un alias privado.</li>
                </ul>
                {selectedEmailReview.email && (
                  <a
                    className="inline-button"
                    href={`https://haveibeenpwned.com/account/${encodeURIComponent(selectedEmailReview.email)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                    Confirmar en Have I Been Pwned
                  </a>
                )}
              </div>
            )}

            <div className="password-mini">
              <div className="password-mini-copy">
                <span className="mini-eyebrow">
                  <KeyRound size={13} />
                  Contrasena segura
                </span>
                <strong>Genera una contrasena fuerte para este perfil</strong>
                <span>
                  En este apartado puedes crear una contrasena larga, unica y compleja para tus redes.
                  Copiala y guardala en un gestor seguro como Bitwarden, 1Password, iCloud Keychain,
                  Google Password Manager o Samsung Pass. Nosotros no guardamos tus contrasenas.
                </span>
              </div>
              <div className="password-mini-preview">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  readOnly
                  aria-label="Contrasena segura para este perfil"
                />
                <button type="button" title="Mostrar u ocultar" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="button-row">
                <button type="button" onClick={() => refreshPassword()}>
                  <RefreshCw size={15} />
                  Generar segura
                </button>
                <button type="button" onClick={() => copyText(password, 'profile-password')}>
                  <Copy size={15} />
                  {copied === 'profile-password' ? 'Copiada' : 'Copiar'}
                </button>
              </div>
              {copied === 'password-generated' && (
                <p className="microcopy">Nueva contrasena generada para este perfil.</p>
              )}
            </div>

            <div className="account-guidance">
              <ClipboardCheck size={18} />
              <div>
                <strong>Checklist de seguridad de esta cuenta</strong>
                <span>
                  Selecciona solo lo que ya hiciste con este perfil. Con estas respuestas calculamos el
                  score de seguridad y el reporte que ayuda a saber que falta reforzar.
                </span>
              </div>
              <small>{selectedAccountScore}/100</small>
            </div>

            <div className="mini-checks">
              {accountCheckItems.map((item) => {
                const id = `account-${selectedAccount.id}-${item.label}`;
                return (
                  <label key={item.label}>
                    <input
                      type="checkbox"
                      checked={Boolean(checks[id])}
                      onChange={(event) => saveChecks({ ...checks, [id]: event.target.checked })}
                    />
                    <span><Check size={13} /></span>
                    <div className="check-copy">
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="vault-panel">
              <div className="vault-head">
                <Lock size={18} />
                <div>
                  <strong>Vault local de codigos 2FA</strong>
                  <span>Guarda codigos de respaldo en este dispositivo. No se suben a Supabase.</span>
                </div>
              </div>
              {selectedVault && (
                <div className="vault-summary">
                  <span>{selectedVault.codes?.length || 0} codigos guardados · {new Date(selectedVault.savedAt).toLocaleDateString('es-MX')}</span>
                  <div className="button-row">
                    <button type="button" onClick={() => setOpenVaultProfileId(openVaultProfileId === selectedAccount.id ? '' : selectedAccount.id)}>
                      <Eye size={15} />
                      {openVaultProfileId === selectedAccount.id ? 'Ocultar' : 'Ver'}
                    </button>
                    <button type="button" onClick={() => deleteVaultCodes()}>
                      <Trash2 size={15} />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
              {openVaultProfileId === selectedAccount.id && selectedVault?.codes?.length && (
                <div className="vault-code-list">
                  {selectedVault.codes.map((code, index) => (
                    <div key={`${code}-${index}`}>
                      <code>{index + 1}. {code}</code>
                      <button type="button" onClick={() => copyText(code, `vault-${index}`)}>
                        <Copy size={13} />
                        {copied === `vault-${index}` ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <textarea
                value={vaultCodesText}
                onChange={(event) => setVaultCodesText(event.target.value)}
                placeholder="Pega aqui tus codigos de respaldo, uno por linea."
              />
              <button type="button" className="inline-button" onClick={saveVaultCodes}>
                <Save size={16} />
                Guardar codigos localmente
              </button>
            </div>

            <div className="quick-security-links">
              <div>
                <strong>Acceso rapido a seguridad de {selectedAccount.platform}</strong>
                <span>Abre la configuracion oficial para terminar pasos pendientes.</span>
              </div>
              <div>
                {selectedQuickLinks.map(([label, href]) => (
                  <a href={href} target="_blank" rel="noreferrer" key={label}>
                    <ExternalLink size={14} />
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <button type="button" className="save-profile-button" onClick={saveSelectedAccount}>
              <Save size={16} />
              Guardar datos del perfil
            </button>

            <button type="button" className="delete-profile" onClick={() => removeAccount(selectedAccountIndex)}>
              <Trash2 size={16} />
              Eliminar perfil
            </button>
          </article>
        )}
        </div>
      </section>

      <section className="maintenance-calendar-widget">
        <div className="maintenance-head">
          <CalendarCheck size={20} />
          <div>
            <strong>Calendario de mantenimiento de seguridad</strong>
            <span>Pequenas revisiones programadas para que ninguna cuenta se quede olvidada.</span>
          </div>
        </div>
        <div className="maintenance-list">
          {pendingMaintenanceTasks.map((task) => (
            <div className={`maintenance-task ${task.urgent ? 'urgent' : ''}`} key={task.key}>
              <div>
                <strong>{task.title}</strong>
                <span>{task.account.platform} · {task.account.profileType || task.account.owner || 'Perfil'} · {task.urgent ? 'Vence hoy' : `vence en ${task.daysLeft} dias`}</span>
              </div>
              <button type="button" onClick={() => completeMaintenanceTask(task.key)}>
                <Check size={14} />
                Hecho
              </button>
            </div>
          ))}
        </div>
      </section>
      </div>
      )}

      {showEmergencyLocked && (
        <section className="tab-view locked-tab-view">
          <LockedSection
            requiredPlan="elite"
            section="SOS — Respuesta de emergencia"
            description="El protocolo SOS está disponible en el plan Guardián Elite o superior. Respuesta inmediata ante hackeos, robo de cuentas y crisis digitales."
            onGoHome={() => setActiveView('home')}
          />
        </section>
      )}

      {showEmergency && (
      <div className="tab-view" key="emergency">
      <section id="emergency" className="emergency">
        <div className="emergency-copy">
          <p className="eyebrow">Protocolo</p>
          <h2>Respuesta rápida ante hackeo</h2>
          <p>
            Sigue esta lista en orden. Lo más importante es recuperar el correo principal,
            cerrar sesiones y bloquear accesos conectados antes de comunicar públicamente.
          </p>
          <a className="emergency-whatsapp" href={emergencyWhatsApp} target="_blank" rel="noreferrer">
            <BellRing size={18} />
            Contactar por WhatsApp ahora
          </a>
        </div>
        <div className="timeline">
          {emergencySteps.map((step, index) => (
            <div className="timeline-item" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="recommendations">
        {[
          ['Regla de oro', 'Nunca abras briefs comprimidos o ejecutables. Pide PDF o enlace oficial de la marca.', Sparkles],
          ['Separacion', 'Usa un correo publico para colaboraciones y otro privado solo para recuperacion.', MailCheck],
          ['Alertas', 'Activa notificaciones de inicio de sesión y cambios de contraseña en cada plataforma.', BellRing],
          ['Red segura', 'Evita Wi-Fi publico para bancos, pagos, correos y cuentas de marca.', Wifi],
        ].map(([title, text, Icon]) => (
          <article key={title}>
            <Icon size={20} />
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="explicit-response-card">
        <div className="card-title">
          <ShieldAlert size={22} />
          <h3>Filtración de contenido explícito</h3>
        </div>
        <p>
          Si sospechas que se filtró contenido íntimo, explícito, privado o material usado para extorsión,
          guarda la calma y comunícate con nosotros inmediatamente. Este tipo de caso se maneja con prioridad,
          discreción y enfoque de contención.
        </p>
        <div className="explicit-process">
          {[
            ['1', 'No respondas amenazas ni pagues extorsiones sin orientación.'],
            ['2', 'Guarda evidencia: perfiles, enlaces, capturas, usuario, fecha y hora.'],
            ['3', 'No borres mensajes originales; pueden servir para reportes y soporte.'],
            ['4', 'Llena el formulario para ordenar el caso y abrir seguimiento.'],
            ['5', 'Nuestro equipo revisará enlaces, perfiles y prioridad del caso para darte el siguiente paso.'],
          ].map(([number, text]) => (
            <div key={number}>
              <span>{number}</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="button-row">
          <a className="emergency-whatsapp" href={explicitContentWhatsApp} target="_blank" rel="noreferrer">
            <BellRing size={18} />
            WhatsApp inmediato
          </a>
          <a className="inline-button" href={explicitContentFormUrl} target="_blank" rel="noreferrer">
            <ClipboardCheck size={16} />
            Abrir formulario seguro
          </a>
        </div>
        <div className="security-note">
          <ShieldCheck size={17} />
          <p>
            No estás solo/a. Podemos ayudarte a ordenar evidencia, priorizar reportes, revisar enlaces y definir
            qué hacer antes de publicar algo o contactar plataformas.
          </p>
        </div>
      </section>
      </div>
      )}

      {showAdmin && (
        <section className="admin-panel tab-view">
          <div className="cmd-header">
            <div className="cmd-header-left">
              <p className="eyebrow">⚡ Command Center</p>
              <h2>Panel de control</h2>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                loadAdminProfiles();
                loadAdminAppointments();
                loadAdminAccountReports();
                loadAdminIncidents();
                loadAdminNotes();
                loadAdminInviteCodes();
              }}
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>

          <div className="cmd-kpis">
            <div className="cmd-kpi cmd-kpi-purple">
              <Users size={22} />
              <div><strong>{adminProfiles.length}</strong><span>Usuarios</span></div>
            </div>
            <div className="cmd-kpi cmd-kpi-green">
              <ShieldCheck size={22} />
              <div>
                <strong>{adminProfiles.filter((p) => (p.subscription_status || 'active') === 'active').length}</strong>
                <span>Activos</span>
              </div>
            </div>
            <div className="cmd-kpi cmd-kpi-red">
              <ShieldOff size={22} />
              <div>
                <strong>{adminProfiles.filter((p) => ['blocked', 'canceled', 'past_due'].includes(p.subscription_status)).length}</strong>
                <span>Bloqueados</span>
              </div>
            </div>
            <div className="cmd-kpi cmd-kpi-orange">
              <CalendarCheck size={22} />
              <div>
                <strong>{adminAppointments.filter((a) => a.status === 'requested').length}</strong>
                <span>Citas nuevas</span>
              </div>
            </div>
            <div className="cmd-kpi cmd-kpi-blue">
              <Sparkles size={22} />
              <div>
                <strong>{adminInviteCodes.filter((c) => c.status === 'active').length}</strong>
                <span>Códigos activos</span>
              </div>
            </div>
            <div className="cmd-kpi">
              <Copy size={22} />
              <div>
                <strong>{adminInviteCodes.reduce((t, c) => t + (c.used_count || 0), 0)}</strong>
                <span>Usos totales</span>
              </div>
            </div>
          </div>

          {adminProfiles.length > 0 && (
            <div className="admin-plan-breakdown">
              {[['Starter', 'starter', '#6b6b90'], ['Pro', 'pro', '#8a2be2'], ['Elite', 'elite', '#f59e0b'], ['Shield', 'shield', '#22c55e']].map(([label, id, color]) => {
                const count = adminProfiles.filter((p) => normalizePlanId(p.access_plan) === id).length;
                const pct = adminProfiles.length ? Math.round((count / adminProfiles.length) * 100) : 0;
                return (
                  <div key={id} className="admin-plan-bar-row">
                    <span>{label}</span>
                    <div className="admin-plan-bar-track">
                      <div className="admin-plan-bar-fill" style={{width: `${pct}%`, background: color}} />
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          )}

          <div className="admin-tabs">
            <button type="button" className={adminTab === 'users' ? 'active' : ''} onClick={() => setAdminTab('users')}>
              <Users size={14} />Usuarios
            </button>
            <button type="button" className={adminTab === 'codes' ? 'active' : ''} onClick={() => setAdminTab('codes')}>
              <Sparkles size={14} />Códigos
            </button>
            <button type="button" className={adminTab === 'reports' ? 'active' : ''} onClick={() => setAdminTab('reports')}>
              <ClipboardCheck size={14} />Reportes
            </button>
            <button type="button" className={adminTab === 'incidents' ? 'active' : ''} onClick={() => setAdminTab('incidents')}>
              <AlertTriangle size={14} />Incidentes
            </button>
            <button type="button" className={adminTab === 'studio_logs' ? 'active' : ''} onClick={() => { setAdminTab('studio_logs'); loadAdminStudioLogs(); }}>
              <Sparkles size={14} />Logs Studio
            </button>
            <button type="button" className={adminTab === 'academy' ? 'active' : ''} onClick={() => setAdminTab('academy')}>
              <GraduationCap size={14} />Academia
            </button>
            <button type="button" className={adminTab === 'notes' ? 'active' : ''} onClick={() => setAdminTab('notes')}>
              <Save size={14} />Notas
            </button>
            <button type="button" className={adminTab === 'links' ? 'active' : ''} onClick={() => setAdminTab('links')}>
              <Link2 size={14} />Links
            </button>
            <button type="button" className={adminTab === 'appointments' ? 'active' : ''} onClick={() => setAdminTab('appointments')}>
              <CalendarCheck size={14} />Citas
            </button>
          </div>

          <p className="admin-status">{adminStatus}</p>

          {adminTab === 'users' && (
          <div className="admin-list">
            <div className="cmd-search-row">
              <div className="cmd-search-wrap">
                <Search size={15} className="cmd-search-icon" />
                <input
                  className="cmd-search-input"
                  placeholder="Buscar por nombre, correo, usuario, marca o código..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
                {adminSearch && (
                  <button className="cmd-search-clear" onClick={() => setAdminSearch('')}>✕</button>
                )}
              </div>
            </div>
            <div className="cmd-filter-row">
              {['all', 'starter', 'pro', 'elite', 'shield'].map((plan) => (
                <button
                  key={plan}
                  type="button"
                  className={`cmd-pill${adminPlanFilter === plan ? ' active' : ''}`}
                  onClick={() => setAdminPlanFilter(plan)}
                >
                  {plan === 'all' ? 'Todos los planes' : getPlanConfig(plan).name}
                </button>
              ))}
              <div className="cmd-pill-sep" />
              {[['all', 'Todos'], ['active', 'Activos'], ['blocked', 'Bloqueados']].map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  className={`cmd-pill${adminStatusFilter === v ? ' active' : ''}`}
                  onClick={() => setAdminStatusFilter(v)}
                >
                  {l}
                </button>
              ))}
            </div>

            {adminProfiles
              .filter((profile) => {
                const q = adminSearch.toLowerCase();
                const matchSearch = !q
                  || (profile.full_name || '').toLowerCase().includes(q)
                  || (profile.email || '').toLowerCase().includes(q)
                  || (profile.username || '').toLowerCase().includes(q)
                  || (profile.brand_name || '').toLowerCase().includes(q)
                  || (profile.main_handle || '').toLowerCase().includes(q)
                  || (profile.access_code || '').toLowerCase().includes(q);
                const matchPlan = adminPlanFilter === 'all' || profile.access_plan === adminPlanFilter;
                const st = profile.subscription_status || 'active';
                const matchStatus = adminStatusFilter === 'all'
                  || (adminStatusFilter === 'active' && st === 'active')
                  || (adminStatusFilter === 'blocked' && ['blocked', 'canceled', 'past_due'].includes(st));
                return matchSearch && matchPlan && matchStatus;
              })
              .map((profile) => {
                const status = profile.subscription_status || 'active';
                const isActive = status === 'active';
                const isBlocked = ['blocked', 'canceled'].includes(status);
                const isExpanded = expandedUserId === profile.id;
                const edits = pendingEdits[profile.id] || {};
                const localPlan = edits.plan ?? normalizePlanId(profile.access_plan);
                const localStatus = edits.status ?? status;
                const hasPendingEdits = edits.plan !== undefined || edits.status !== undefined;
                return (
                  <article className={`cmd-user-card${isExpanded ? ' expanded' : ''}`} key={profile.id}>
                    <div
                      className="cmd-user-main"
                      onClick={() => setExpandedUserId(isExpanded ? null : profile.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setExpandedUserId(isExpanded ? null : profile.id)}
                    >
                      <div className={`cmd-status-dot ${isActive ? 'green' : isBlocked ? 'red' : 'orange'}`} />
                      <div className="cmd-user-info">
                        <strong>{profile.full_name || profile.username || profile.email}</strong>
                        <p>{profile.email}</p>
                        <small>{profile.brand_name || 'Sin marca'} · {getPlanConfig(profile.access_plan).name}</small>
                      </div>
                      <div className="cmd-user-meta">
                        <span className={`cmd-badge ${isActive ? 'green' : isBlocked ? 'red' : 'orange'}`}>{status}</span>
                        {profile.access_expires_at && (
                          <small>Vence {new Date(profile.access_expires_at).toLocaleDateString('es-MX')}</small>
                        )}
                      </div>
                      <ChevronDown size={16} className={`cmd-chevron${isExpanded ? ' rotated' : ''}`} />
                    </div>
                    {isExpanded && (
                      <div className="cmd-user-expanded">
                        <div className="cmd-user-detail-grid">
                          <div className="cmd-detail-item">
                            <span>ID</span>
                            <strong className="cmd-detail-id">{profile.id}</strong>
                          </div>
                          <div className="cmd-detail-item">
                            <span>Handle principal</span>
                            <strong>{profile.main_handle || '—'}</strong>
                          </div>
                          <div className="cmd-detail-item">
                            <span>Marca</span>
                            <strong>{profile.brand_name || '—'}</strong>
                          </div>
                          <div className="cmd-detail-item">
                            <span>Código de acceso</span>
                            <strong>{profile.access_code || '—'}</strong>
                          </div>
                          <div className="cmd-detail-item">
                            <span>Plan</span>
                            <strong>{getPlanConfig(profile.access_plan).name}</strong>
                          </div>
                          <div className="cmd-detail-item">
                            <span>Expira</span>
                            <strong>{profile.access_expires_at ? new Date(profile.access_expires_at).toLocaleDateString('es-MX') : 'Permanente'}</strong>
                          </div>
                        </div>
                        <div className="cmd-admin-controls">
                          <div className="cmd-detail-item">
                            <span>Plan</span>
                            <select
                              className={`cmd-status-select cmd-plan-select${edits.plan !== undefined ? ' pending' : ''}`}
                              value={localPlan}
                              onChange={(event) => setPendingEdit(profile.id, 'plan', event.target.value)}
                            >
                              <option value="starter">Guardián Starter (gratis)</option>
                              <option value="pro">Guardián Pro</option>
                              <option value="elite">Guardián Elite</option>
                              <option value="shield">Guardián Shield</option>
                            </select>
                          </div>
                          <div className="cmd-detail-item">
                            <span>Estado</span>
                            <select
                              className={`cmd-status-select${edits.status !== undefined ? ' pending' : ''}`}
                              value={localStatus}
                              onChange={(event) => setPendingEdit(profile.id, 'status', event.target.value)}
                            >
                              <option value="active">Activo</option>
                              <option value="past_due">Prórroga</option>
                              <option value="blocked">Bloqueado</option>
                              <option value="canceled">Cancelado</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            className={`cmd-save-btn${hasPendingEdits ? ' has-changes' : ''}`}
                            disabled={!hasPendingEdits}
                            onClick={() => saveUserEdits(profile.id)}
                          >
                            <ShieldCheck size={14} />
                            Guardar cambios
                          </button>
                        </div>
                        <div className="cmd-user-actions">
                          <button
                            type="button"
                            className={`cmd-action-btn ${isActive ? 'danger' : 'success'}`}
                            onClick={() => updateSubscription(profile.id, isActive ? 'blocked' : 'active')}
                          >
                            {isActive ? <><ShieldOff size={14} />Bloquear</> : <><ShieldCheck size={14} />Activar</>}
                          </button>
                          <a className="cmd-action-btn" href={`mailto:${profile.email}`}>
                            <Mail size={14} />Email
                          </a>
                          <button
                            type="button"
                            className="cmd-action-btn"
                            onClick={() => { setAdminTab('notes'); setAdminNoteUserId(profile.id); }}
                          >
                            <ClipboardCheck size={14} />Nota
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            {!adminProfiles.length && (
              <article className="empty-state">
                <Fingerprint size={28} />
                <strong>Aún no puedo listar usuarios</strong>
                <p>Ejecuta el archivo SQL de permisos admin en Supabase y vuelve a tocar Actualizar.</p>
              </article>
            )}
          </div>
          )}

          {adminTab === 'codes' && (
          <div className="admin-list">
            <article className="admin-code-builder">
              <div className="admin-code-grid">
                <label>
                  Cliente o referencia
                  <input
                    value={adminCodeLabel}
                    onChange={(event) => setAdminCodeLabel(event.target.value)}
                    placeholder="Ej. Campaña mayo · Valeria UGC"
                  />
                </label>
                <label>
                  Plan del codigo
                  <select value={adminCodePlan} onChange={(event) => setAdminCodePlan(event.target.value)}>
                    <option value="starter">Guardian Starter</option>
                    <option value="pro">Guardian Pro</option>
                    <option value="elite">Guardian Elite</option>
                    <option value="shield">Guardian Shield</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </label>
                <label>
                  Dias de acceso
                  <input
                    value={adminCodeDays}
                    onChange={(event) => setAdminCodeDays(event.target.value)}
                    placeholder="30"
                  />
                </label>
                <label>
                  Limite de usos
                  <input
                    value={adminCodeUses}
                    onChange={(event) => setAdminCodeUses(event.target.value)}
                    placeholder="1"
                  />
                </label>
                <label>
                  Nombre de destino
                  <input
                    value={adminAssignedName}
                    onChange={(event) => setAdminAssignedName(event.target.value)}
                    placeholder="Nombre del creador"
                  />
                </label>
                <label>
                  Correo de destino
                  <input
                    value={adminAssignedEmail}
                    onChange={(event) => setAdminAssignedEmail(event.target.value)}
                    placeholder="creador@correo.com"
                  />
                </label>
              </div>
              <label>
                Nota interna
                <textarea
                  value={adminCodeNotes}
                  onChange={(event) => setAdminCodeNotes(event.target.value)}
                  placeholder="Ej. trueque por 3 historias + 1 reel"
                  rows={3}
                />
              </label>
              {adminGeneratedCode && (
                <div className="cmd-code-result">
                  <span className="cmd-code-label">✅ Código generado y copiado:</span>
                  <div className="cmd-code-display">
                    <strong>{adminGeneratedCode}</strong>
                    <button
                      type="button"
                      className="cmd-copy-btn"
                      onClick={() => { navigator.clipboard.writeText(adminGeneratedCode); setCopied('last-gen'); setTimeout(() => setCopied(''), 1500); }}
                    >
                      {copied === 'last-gen' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}
              <div className="button-row">
                <button
                  type="button"
                  className={`primary-action${adminCodeGenerating ? ' btn-loading' : ''}`}
                  onClick={generateAdminInviteCode}
                  disabled={adminCodeGenerating}
                >
                  {adminCodeGenerating ? (
                    <span className="btn-spinner" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {adminCodeGenerating ? 'Generando...' : 'Generar código'}
                </button>
              </div>
            </article>

            {adminInviteCodes.map((code) => (
              <article className="admin-code-card" key={code.id}>
                <div className="admin-code-head">
                  <div>
                    <span>{code.status}</span>
                    <strong>{code.code}</strong>
                    <p>{code.client_label || code.assigned_name || 'Sin referencia'}</p>
                    <small>
                      {code.plan_kind === 'custom' ? 'Personalizado' : getPlanConfig(code.plan_kind).name} · {code.duration_days ? `${code.duration_days} dias` : 'permanente'} ·
                      {` ${code.used_count || 0}/${code.max_uses || 1} usos`}
                    </small>
                  </div>
                  <div className="admin-actions">
                    <button type="button" onClick={() => copyText(code.code, `code-${code.id}`)}>
                      <Copy size={15} />
                      {copied === `code-${code.id}` ? 'Copiado' : 'Copiar'}
                    </button>
                    <select value={code.status} onChange={(event) => updateInviteCodeStatus(code.id, event.target.value)}>
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="used">used</option>
                      <option value="revoked">revoked</option>
                    </select>
                  </div>
                </div>
                <div className="admin-code-meta">
                  <small>{code.assigned_email || 'Sin correo destino'} · {code.assigned_name || 'Sin nombre destino'}</small>
                  <small>{code.notes || 'Sin nota interna'}</small>
                  <small>{code.redeemed_emails || 'Aun sin redenciones'}</small>
                </div>
              </article>
            ))}

            {!adminInviteCodes.length && (
              <article className="empty-state">
                <Sparkles size={28} />
                <strong>Aún no hay codigos</strong>
                <p>Genera el primer codigo y desde aqui mismo veras cuantas veces se usa y por quien entró.</p>
              </article>
            )}
          </div>
          )}

          {adminTab === 'reports' && (
          <div className="admin-list">
            {Object.values(adminAccountReports.reduce((groups, report) => {
              const key = report.user_id || report.email || 'sin-usuario';
              if (!groups[key]) {
                groups[key] = {
                  userId: report.user_id,
                  name: report.full_name || report.username || report.email || 'Creador',
                  email: report.email || 'Sin correo',
                  brand: report.brand_name || 'Sin marca',
                  accounts: [],
                };
              }
              groups[key].accounts.push(report);
              return groups;
            }, {})).map((creator) => (
              <article className="admin-report-card" key={creator.userId || creator.email}>
                <div className="admin-report-head">
                  <div>
                    <span>Reporte de cuentas</span>
                    <strong>{creator.name}</strong>
                    <p>{creator.email} · {creator.brand}</p>
                  </div>
                  <a href={`mailto:${creator.email}`}>Email</a>
                </div>
                <div className="account-report-list">
                  {creator.accounts.map((account) => {
                    const accountChecks = account.checks || {};
                    const completed = accountCheckItems.filter((item) => (
                      accountChecks[`account-${account.account_id}-${item.label}`]
                    ));
                    const missing = accountCheckItems.filter((item) => !completed.includes(item));
                    const score = Math.round((completed.length / accountCheckItems.length) * 100);
                    const label = getScoreLabel(score);
                    return (
                      <div className="account-report-row" key={account.account_id}>
                        <div>
                          <span>{account.platform}</span>
                          <strong>{account.profile_type || account.owner || 'Perfil'}</strong>
                          <p>{account.handle || 'Sin usuario'} · {account.email_label || 'Sin correo asociado'}</p>
                        </div>
                        <div className={`score-badge ${label.className}`}>
                          <b>{score}</b>
                          <small>{label.label}</small>
                        </div>
                        <div className="missing-actions">
                          <strong>Debe hacer:</strong>
                          <p>{missing.length ? missing.slice(0, 3).map((item) => item.label).join(' · ') : 'Cuenta en buen estado. Mantener revisiones periódicas.'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
            {!adminAccountReports.length && (
              <article className="empty-state">
                <ClipboardCheck size={28} />
                <strong>Aún no hay reportes</strong>
                <p>Cuando los creadores agreguen redes y completen checks, aquí verás el score de cada cuenta.</p>
              </article>
            )}
          </div>
          )}

          {adminTab === 'incidents' && (
          <div className="admin-list">
            {adminIncidents.map((incident) => {
              const incidentDate = incident.occurred_at
                ? new Date(incident.occurred_at).toLocaleString('es-MX')
                : new Date(incident.created_at).toLocaleString('es-MX');
              return (
                <article className="admin-user-card incident-admin-card" key={incident.id}>
                  <div>
                    <span>{incident.severity || 'media'} · {incident.status || 'open'}</span>
                    <strong>{incident.event_type || 'Incidente'} · {incident.account_label || 'Cuenta general'}</strong>
                    <p>{incident.full_name || incident.username || incident.email} · {incidentDate}</p>
                    <small>{incident.message || 'Sin notas'}</small>
                  </div>
                  <div className="admin-actions">
                    <select
                      value={incident.status || 'open'}
                      onChange={(event) => updateIncidentStatus(incident.id, event.target.value)}
                    >
                      <option value="open">open</option>
                      <option value="reviewing">reviewing</option>
                      <option value="resolved">resolved</option>
                      <option value="ignored">ignored</option>
                    </select>
                    <a href={`mailto:${incident.email || ''}`}>Email</a>
                  </div>
                </article>
              );
            })}
            {!adminIncidents.length && (
              <article className="empty-state">
                <AlertTriangle size={28} />
                <strong>Aún no hay incidentes</strong>
                <p>Cuando un creador registre intentos de acceso, links falsos o actividad rara, aparecerá aquí.</p>
              </article>
            )}
          </div>
          )}

          {adminTab === 'studio_logs' && (
          <div className="admin-list">
            <article className="admin-user-card" style={{background:'rgba(138,43,226,0.08)',borderColor:'rgba(138,43,226,0.25)'}}>
              <div style={{width:'100%'}}>
                <span>Analytics · Studio</span>
                <strong>Logs del calculador de tarifas</strong>
                <p style={{marginTop:'0.5rem',color:'var(--text-muted,#aaa)',fontSize:'0.82rem'}}>
                  {adminStudioLogs.length} cálculo{adminStudioLogs.length !== 1 ? 's' : ''} registrado{adminStudioLogs.length !== 1 ? 's' : ''}
                  {adminStudioLogs.length > 0 && (() => {
                    const withOffer = adminStudioLogs.filter(l => l.brand_offer > 0).length;
                    const countries = [...new Set(adminStudioLogs.map(l => l.country))];
                    return ` · ${withOffer} con oferta de marca · Países: ${countries.join(', ')}`;
                  })()}
                </p>
              </div>
            </article>
            <div style={{overflowX:'auto',width:'100%'}}>
              <table className="studio-log-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>País</th><th>Ciudad</th><th>Plataforma</th><th>Seguidores</th><th>Uso</th><th>Marca</th><th>Mín calc.</th><th>Ideal calc.</th><th>Oferta</th><th>Expectativa</th>
                  </tr>
                </thead>
                <tbody>
                  {adminStudioLogs.map(log => (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at).toLocaleDateString('es-MX')}</td>
                      <td>{log.country}</td>
                      <td>{log.city}</td>
                      <td>{log.platform} · {log.content_type}</td>
                      <td>{log.followers}</td>
                      <td style={{fontSize:'0.75rem'}}>{log.usage_rights}</td>
                      <td>{log.brand_type}</td>
                      <td style={{color:'#a78bfa'}}>{log.calculated_min?.toLocaleString('es-MX')} {log.currency}</td>
                      <td style={{color:'#34d399'}}>{log.calculated_ideal?.toLocaleString('es-MX')} {log.currency}</td>
                      <td style={{color: log.brand_offer > 0 ? '#f9a8d4' : '#555'}}>{log.brand_offer > 0 ? `${log.brand_offer?.toLocaleString('es-MX')} ${log.currency}` : '—'}</td>
                      <td style={{color: log.expected_amount > 0 ? '#fcd34d' : '#555'}}>{log.expected_amount > 0 ? `${log.expected_amount?.toLocaleString('es-MX')} ${log.currency}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!adminStudioLogs.length && (
              <article className="empty-state">
                <Sparkles size={28} />
                <strong>Aún no hay cálculos registrados</strong>
                <p>Cada vez que un creador use la calculadora del Studio, el resultado aparecerá aquí.</p>
              </article>
            )}
          </div>
          )}

          {adminTab === 'academy' && (
          <div className="admin-list">
            <div className="studio-card" style={{margin:'0 0 16px'}}>
              <h2 className="studio-card-title" style={{color:'#1e0a30'}}>Agregar video a la Academia</h2>
              <div className="studio-form-grid">
                <label className="studio-field studio-field-full"><span>Link de YouTube *</span>
                  <input type="url" placeholder="https://youtube.com/watch?v=... o https://youtu.be/..." value={adminAcademyForm.youtube_url} onChange={e=>setAdminAcademyForm(p=>({...p,youtube_url:e.target.value}))} />
                </label>
                <label className="studio-field studio-field-full"><span>Título *</span>
                  <input type="text" placeholder="Ej. Cómo proteger tu TikTok paso a paso" value={adminAcademyForm.title} onChange={e=>setAdminAcademyForm(p=>({...p,title:e.target.value}))} />
                </label>
                <label className="studio-field studio-field-full"><span>Descripción</span>
                  <input type="text" placeholder="De qué trata el video" value={adminAcademyForm.description} onChange={e=>setAdminAcademyForm(p=>({...p,description:e.target.value}))} />
                </label>
                <label className="studio-field"><span>Nivel</span>
                  <select value={adminAcademyForm.level} onChange={e=>setAdminAcademyForm(p=>({...p,level:e.target.value}))}>
                    {['Básico','Intermedio','Avanzado','Urgente'].map(l=><option key={l}>{l}</option>)}
                  </select>
                </label>
                <label className="studio-field"><span>Duración</span>
                  <input type="text" placeholder="Ej. 12 min" value={adminAcademyForm.duration} onChange={e=>setAdminAcademyForm(p=>({...p,duration:e.target.value}))} />
                </label>
              </div>
              <button type="button" className="studio-calc-btn" onClick={addAcademyVideo} disabled={!adminAcademyForm.title.trim()||!adminAcademyForm.youtube_url.trim()}>
                ✦ Publicar en Academia
              </button>
            </div>
            {adminAcademyVideos.map((video, i) => (
              <article className="admin-user-card" key={video.id} style={{gap:'12px'}}>
                {video.youtube_id && (
                  <img src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} alt={video.title} style={{width:'120px',height:'68px',borderRadius:'8px',objectFit:'cover',flexShrink:0}} />
                )}
                <div style={{flex:1}}>
                  <span>{video.level}{video.duration ? ` · ${video.duration}` : ''}</span>
                  <strong>{video.title}</strong>
                  {video.description && <p>{video.description}</p>}
                </div>
                <button type="button" className="deal-delete-btn" onClick={()=>{ if(window.confirm('¿Eliminar este video?')) deleteAcademyVideo(video.id); }}>
                  <Trash2 size={14}/>
                </button>
              </article>
            ))}
            {!adminAcademyVideos.length && (
              <article className="empty-state">
                <GraduationCap size={28}/>
                <strong>Sin videos aún</strong>
                <p>Agrega el primer video con el formulario de arriba.</p>
              </article>
            )}
          </div>
          )}

          {adminTab === 'notes' && (
          <div className="admin-notes-layout">
            <article className="admin-note-composer">
              <div>
                <span>Nota interna</span>
                <strong>Seguimiento privado por usuario</strong>
                <p>Usa esto para apuntar acuerdos, riesgos, pendientes o contexto antes de responderle a un creador.</p>
              </div>
              <label>
                Usuario
                <select value={adminNoteUserId} onChange={(event) => setAdminNoteUserId(event.target.value)}>
                  <option value="">Nota general</option>
                  {adminProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name || profile.username || profile.email} · {profile.email}
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                className="tool-textarea"
                value={adminNoteText}
                onChange={(event) => setAdminNoteText(event.target.value)}
                placeholder="Ejemplo: Instagram en 65%. Recomendar activar alertas, revisar apps conectadas y configurar 2FA con app."
              />
              <button type="button" className="primary-action" onClick={saveAdminNote}>
                <ClipboardCheck size={16} />
                Guardar nota
              </button>
            </article>

            <div className="admin-list">
              {adminNotes.map((note) => (
                <article className="admin-user-card note-card" key={note.id}>
                  <div>
                    <span>{note.target_user_id ? 'Usuario' : 'General'}</span>
                    <strong>{note.full_name || note.username || note.email || 'Nota general'}</strong>
                    <p>{note.email || 'Sin correo'} · {new Date(note.created_at).toLocaleString('es-MX')}</p>
                    <small>{note.body}</small>
                  </div>
                  <div className="admin-actions">
                    {note.email ? <a href={`mailto:${note.email}`}>Email</a> : <a href="#admin-notes">General</a>}
                  </div>
                </article>
              ))}
              {!adminNotes.length && (
                <article className="empty-state">
                  <ClipboardCheck size={28} />
                  <strong>Aún no hay notas</strong>
                  <p>Cuando guardes notas de seguimiento, aparecerán aquí ordenadas por fecha.</p>
                </article>
              )}
            </div>
          </div>
          )}

          {adminTab === 'links' && (
          <div className="admin-links-grid">
            {[
              ['Supabase', 'Base de datos, usuarios, SQL y tablas.', 'https://supabase.com/dashboard/project/vnblnuknwnnirqbnvmsh'],
              ['Cloudflare Pages', 'Deploy, dominio, DNS y estado de la app.', 'https://dash.cloudflare.com/'],
              ['GitHub repo', 'Código fuente y cambios publicados.', 'https://github.com/creators-guardian/creators-guardian-app'],
              ['Netlify', 'Panel de Netlify por si se usa para pruebas o herramientas externas.', 'https://app.netlify.com/'],
              ['VirusTotal', 'Revisar links, hashes y archivos sospechosos.', 'https://www.virustotal.com/gui/home/search'],
              ['Have I Been Pwned', 'Revisar si un correo apareció en filtraciones.', 'https://haveibeenpwned.com/'],
              ['Google Security', 'Revisión de seguridad para cuentas Google/YouTube.', 'https://myaccount.google.com/security-checkup'],
              ['Meta Accounts Center', 'Seguridad de Instagram y Facebook.', 'https://accountscenter.facebook.com/password_and_security'],
            ].map(([title, text, href]) => (
              <a className="admin-link-card" href={href} target="_blank" rel="noreferrer" key={title}>
                <Link2 size={20} />
                <strong>{title}</strong>
                <span>{text}</span>
              </a>
            ))}
          </div>
          )}

          {adminTab === 'appointments' && (
          <div className="admin-list">
            {adminAppointments.map((appointment) => {
              const appointmentDate = appointment.created_at
                ? new Date(appointment.created_at).toLocaleString('es-MX')
                : 'Sin fecha';
              const cleanPhone = (appointment.phone || '').replace(/\D/g, '');
              const whatsappText = encodeURIComponent(
                `Hola ${appointment.full_name || appointment.email || ''}, vi tu solicitud de consulta para Creators Guardian. Te comparto horarios disponibles para agendar.`,
              );
              return (
                <article className="admin-user-card appointment-card" key={appointment.id}>
                  <div>
                    <span>{appointment.status || 'requested'}</span>
                    <strong>{appointment.full_name || appointment.email || 'Creador sin nombre'}</strong>
                    <p>{appointment.email || 'Sin correo'} · {appointmentDate}</p>
                    <small>{appointment.brand_name || 'Sin marca'} · {appointment.message || 'Consulta personalizada'}</small>
                  </div>
                  <div className="admin-actions">
                    <select
                      value={appointment.status || 'requested'}
                      onChange={(event) => updateAppointmentStatus(appointment.id, event.target.value)}
                    >
                      <option value="requested">requested</option>
                      <option value="contacted">contacted</option>
                      <option value="scheduled">scheduled</option>
                      <option value="done">done</option>
                      <option value="canceled">canceled</option>
                    </select>
                    {cleanPhone ? (
                      <a href={`https://wa.me/${cleanPhone}?text=${whatsappText}`} target="_blank" rel="noreferrer">WhatsApp</a>
                    ) : (
                      <a href={`mailto:${appointment.email || ''}`}>Email</a>
                    )}
                  </div>
                </article>
              );
            })}
            {!adminAppointments.length && (
              <article className="empty-state">
                <CalendarCheck size={28} />
                <strong>Aún no hay citas</strong>
                <p>Cuando alguien toque “Agendar consulta”, aparecerá aquí para darle seguimiento.</p>
              </article>
            )}
          </div>
          )}
        </section>
      )}

      {showOffers && (
        <section className="offers-section tab-view">
          <div className="section-head offers-head">
            <div>
              <p className="eyebrow">Ofertas</p>
              <h2>Extras para blindar tu trabajo</h2>
            </div>
          </div>
          <div className="offers-grid">
            <article className="offer-card">
              <div className="offer-logo antivirus-logo">
                <ShieldCheck size={28} />
              </div>
              <div>
                <strong>Antivirus para tus dispositivos</strong>
                <p>Protección esencial para trabajar con briefs, archivos y links de marcas.</p>
                <span>Desde $150 MXN al año</span>
              </div>
              <a
                href="https://wa.me/524561175410?text=Hola%2C%20quiero%20informacion%20sobre%20la%20oferta%20de%20antivirus%20para%20mis%20dispositivos."
                target="_blank"
                rel="noreferrer"
              >
                Preguntar
              </a>
            </article>

            <article className="offer-card">
              <div className="offer-logo canva-logo">
                <span>Canva</span>
              </div>
              <div>
                <strong>Canva</strong>
                <p>Herramienta creativa para piezas UGC, presentaciones, portafolios y contenido de marca.</p>
                <span>$150 MXN al año</span>
              </div>
              <a
                href="https://wa.me/524561175410?text=Hola%2C%20quiero%20informacion%20sobre%20la%20oferta%20de%20Canva%20por%20150%20pesos%20al%20ano."
                target="_blank"
                rel="noreferrer"
              >
                Preguntar
              </a>
            </article>
          </div>
        </section>
      )}

      {showApps && (
        <section className="recommended-apps-section tab-view">
          <div className="section-head recommended-apps-head">
            <div>
              <p className="eyebrow">Apps recomendadas</p>
              <h2>Kit seguro para creadores UGC</h2>
              <p>
                Estas herramientas ayudan a proteger tus accesos, contraseñas, navegación,
                privacidad y archivos antes de trabajar con marcas.
              </p>
            </div>
          </div>

          <div className="recommended-app-tabs">
            {recommendedAppCategories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={activeAppCategory === category.id ? 'active' : ''}
                onClick={() => setActiveAppCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="recommended-apps-grid">
            {recommendedAppCategories
              .find((category) => category.id === activeAppCategory)
              ?.apps.map((appName) => {
                const app = recommendedApps[appName];
                return (
                  <article className="recommended-app-card" key={`${activeAppCategory}-${app.name}`}>
                    <div className="recommended-app-top">
                      <img
                        className="recommended-app-icon"
                        src={app.icon}
                        alt={app.name}
                        onError={(event) => {
                          event.currentTarget.src = app.fallback;
                        }}
                      />
                      <div>
                        <div className="recommended-app-title">
                          <h3>{app.name}</h3>
                          {app.top && <span className="top-badge">TOP</span>}
                        </div>
                        <p>{app.category}</p>
                      </div>
                    </div>

                    <p className="recommended-app-description">"{app.description}"</p>
                    <p className="recommended-app-feature">✨ {app.feature}</p>

                    <div className="download-section">
                      <h4>📱 Móvil:</h4>
                      <div className="download-buttons">
                        {app.links.android ? (
                          <a className="download-button android" href={app.links.android} target="_blank" rel="noopener noreferrer">
                            Android
                          </a>
                        ) : (
                          <span className="download-button disabled">Android no disponible</span>
                        )}
                        {app.links.ios ? (
                          <a className="download-button ios" href={app.links.ios} target="_blank" rel="noopener noreferrer">
                            iOS
                          </a>
                        ) : (
                          <span className="download-button disabled">iOS no disponible</span>
                        )}
                      </div>
                    </div>

                    <div className="download-section">
                      <h4>💻 Escritorio:</h4>
                      <div className="download-buttons">
                        {app.links.windows ? (
                          <a className="download-button windows" href={app.links.windows} target="_blank" rel="noopener noreferrer">
                            Windows
                          </a>
                        ) : (
                          <span className="download-button disabled">Windows no disponible</span>
                        )}
                        {app.links.macos ? (
                          <a className="download-button macos" href={app.links.macos} target="_blank" rel="noopener noreferrer">
                            macOS
                          </a>
                        ) : (
                          <span className="download-button disabled">macOS no disponible</span>
                        )}
                      </div>
                    </div>

                    <span className={`app-price-badge ${app.price === 'GRATIS' ? 'free' : 'freemium'}`}>
                      🏷️ {app.price}{app.priceNote ? ` · ${app.priceNote}` : ''}
                    </span>
                  </article>
                );
              })}
          </div>
        </section>
      )}

      {showBotLocked && (
        <section className="tab-view locked-tab-view">
          <LockedSection
            requiredPlan="pro"
            section="AztekBot"
            description="AztekBot está disponible en el plan Guardián Pro o superior. Obtén respuestas inteligentes de seguridad en tiempo real."
            onGoHome={() => setActiveView('home')}
          />
        </section>
      )}

      {showBot && (
        <section className="aztekbot-section tab-view">
          <div className="section-head aztekbot-head">
            <div>
              <p className="eyebrow">Asistente virtual</p>
              <h2>AztekBot</h2>
              <p>
                Soporte 24/7 para dudas rápidas de seguridad. Úsalo para entender riesgos, preparar
                respuestas y saber cuándo escalar con WhatsApp urgente.
              </p>
            </div>
          </div>

          <article className="aztekbot-card">
            <div className="aztekbot-hero">
              <img src="/aztekbot.png" alt="AztekBot" />
              <div>
                <span>Tu asistente 24/7</span>
                <strong>AztekBot vigila contigo</strong>
                <p>
                  Preguntale sobre links raros, PDFs, 2FA, contrasenas, recuperacion de cuentas y
                  senales de alerta antes de abrir, firmar o publicar.
                </p>
              </div>
            </div>

            <div ref={botMessagesRef} className="aztekbot-messages">
              {visibleBotMessages.map((message, index) => (
                <div className={`bot-message ${message.role}`} key={`${message.role}-${index}`}>
                  {message.role === 'assistant' && (
                    <img className="bot-avatar" src="/aztekbot.png" alt="" aria-hidden="true" />
                  )}
                  <div>
                    <strong>{message.role === 'assistant' ? 'AztekBot' : displayUser}</strong>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="aztekbot-prompts">
                {[
                  '¿Cómo sé si un link de marca es falso?',
                  '¿Qué hago si perdí acceso a Instagram?',
                  'Ayúdame a activar 2FA de forma segura',
                ].map((prompt) => (
                  <button type="button" key={prompt} disabled={botLoading} onClick={() => setBotInput(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>

            <form
              className="aztekbot-input"
              onSubmit={(event) => {
                event.preventDefault();
                sendBotMessage();
              }}
              >
                <textarea
                  value={botInput}
                  onChange={(event) => setBotInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      sendBotMessage();
                    }
                  }}
                  disabled={botLoading}
                  maxLength={900}
                  placeholder="Escribe tu duda. Ejemplo: una marca me mandó un PDF y un link raro, ¿qué reviso antes de abrirlo?"
                />
                <button type="submit" disabled={botLoading || !botInput.trim()}>
                  <MessageCircle size={17} />
                  {botLoading ? 'Pensando...' : 'Enviar'}
                </button>
              </form>

            <div className="security-note">
              <ShieldCheck size={17} />
              <p>
                AztekBot orienta, pero no reemplaza soporte humano. Si hay robo de cuenta, filtración,
                extorsión o acceso raro, usa WhatsApp urgente.
              </p>
            </div>
            {botStatus && <span className="bot-status">{botStatus}</span>}
          </article>
        </section>
      )}

      {showAcademyLocked && (
        <section className="tab-view locked-tab-view">
          <LockedSection
            requiredPlan="pro"
            section="Academia"
            description="La Academia está disponible en el plan Guardián Pro o superior. Accede a videos, guías y entrenamientos de ciberseguridad."
            onGoHome={() => setActiveView('home')}
          />
        </section>
      )}

      {showStudioLocked && (
        <section className="tab-view locked-tab-view">
          <LockedSection
            requiredPlan="pro"
            section="Studio"
            description="Studio está disponible en el plan Guardián Pro o superior. Calcula tu tarifa ideal y analiza contratos UGC en segundos."
            onGoHome={() => setActiveView('home')}
          />
        </section>
      )}

      {showStudio && (
      <div className="tab-view studio-view" key="studio">
        <div className="studio-hero">
          <div className="studio-hero-deco" aria-hidden="true">
            <span>✦</span><span>✦</span><span>✦</span>
          </div>
          <p className="studio-eyebrow">✦ Exclusivo Pro</p>
          <h1 className="studio-title">Tu Creators Studio</h1>
          <p className="studio-subtitle">Calcula lo que vales. Protégete antes de firmar.</p>
          <div className="studio-tabs">
            <button type="button" className={studioTab === 'calculator' ? 'active' : ''} onClick={() => setStudioTab('calculator')}>
              💰 Calculadora de tarifa
            </button>
            <button type="button" className={studioTab === 'contracts' ? 'active' : ''} onClick={() => setStudioTab('contracts')}>
              📄 Analizador de contratos
            </button>
            <button type="button" className={studioTab === 'deliveries' ? 'active' : ''} onClick={() => setStudioTab('deliveries')}>
              📅 Mis Deals
            </button>
          </div>
        </div>

        {studioTab === 'calculator' && (
          <div className="studio-content">
            <div className="studio-card">
              <h2 className="studio-card-title">¿Cuánto cobrar por tu contenido?</h2>
              <p className="studio-card-sub">Llena los campos y te decimos tu tarifa mínima, tu tarifa ideal y qué tan justa es la oferta de la marca.</p>
              <div className="studio-form-grid">
                <label className="studio-field">
                  <span>País</span>
                  <select value={studioCountry} onChange={(e) => {
                    const c = e.target.value;
                    setStudioCountry(c);
                    const cd = studioCountryData[c];
                    if (cd?.stateM) {
                      setStudioState(Object.keys(cd.stateM)[0] || '');
                      setStudioCity('');
                    } else {
                      setStudioCity(cd?.cities?.[0] || '');
                      setStudioState('');
                    }
                  }}>
                    {Object.keys(studioCountryData).map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
                {studioCountryData[studioCountry]?.stateM ? (
                  <label className="studio-field">
                    <span>Estado / Región</span>
                    <select value={studioState} onChange={(e) => setStudioState(e.target.value)}>
                      {Object.keys(studioCountryData[studioCountry].stateM).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                ) : (
                  <label className="studio-field">
                    <span>Ciudad</span>
                    <select value={studioCity} onChange={(e) => setStudioCity(e.target.value)}>
                      {(studioCountryData[studioCountry]?.cities || []).map(c => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                )}
                <label className="studio-field">
                  <span>Plataforma</span>
                  <select value={studioPlatform} onChange={(e) => setStudioPlatform(e.target.value)}>
                    {['TikTok','Instagram','YouTube','Facebook','X'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </label>
                <label className="studio-field">
                  <span>Tipo de contenido</span>
                  <select value={studioContentType} onChange={(e) => setStudioContentType(e.target.value)}>
                    <option value="video60">Video 60 seg</option>
                    <option value="video30">Video 30 seg</option>
                    <option value="reels60">Reels 60 seg</option>
                    <option value="reels30">Reels 30 seg</option>
                    <option value="stories">Pack Stories (x3)</option>
                    <option value="short">Short / Corto</option>
                    <option value="video">Video largo</option>
                    <option value="live">Live / Directo</option>
                  </select>
                </label>
                <label className="studio-field">
                  <span>Seguidores</span>
                  <select value={studioFollowers} onChange={(e) => setStudioFollowers(e.target.value)}>
                    {['<1k','1k-5k','5k-10k','10k-50k','50k-100k','100k-500k','500k+'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </label>
                <label className="studio-field">
                  <span>Uso de derechos</span>
                  <select value={studioUsageRights} onChange={(e) => setStudioUsageRights(e.target.value)}>
                    {['Solo orgánico','Orgánico + Paid Ads','Exclusividad 30 días','Exclusividad 90 días'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </label>
                <label className="studio-field">
                  <span>Tipo de marca</span>
                  <select value={studioBrandType} onChange={(e) => setStudioBrandType(e.target.value)}>
                    {['Local / pequeña','Nacional','Internacional','Luxury / premium'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </label>
                <label className="studio-field">
                  <span>¿Cuánto te ofrece la marca? ({studioCountryData[studioCountry]?.currency || 'MXN'}, opcional)</span>
                  <input type="number" placeholder="Ej. 1500" value={studioBrandOffer} onChange={(e) => setStudioBrandOffer(e.target.value)} min="0" />
                </label>
                <label className="studio-field">
                  <span>¿Cuánto esperas recibir? ({studioCountryData[studioCountry]?.currency || 'MXN'}, opcional)</span>
                  <input type="number" placeholder="Ej. 2000" value={studioExpected} onChange={(e) => setStudioExpected(e.target.value)} min="0" />
                </label>
              </div>
              <button type="button" className="studio-calc-btn" onClick={calculateRate}>
                ✦ Calcular mi tarifa
              </button>
            </div>

            {studioResult && (
              <div className="studio-result-card">
                <div className="studio-result-header">
                  <span>✦</span>
                  <h3>Tu tarifa estimada</h3>
                </div>
                <div className="studio-rate-grid">
                  <div className="studio-rate-box min">
                    <span>Mínimo aceptable</span>
                    <strong>{studioResult.symbol}{studioResult.min.toLocaleString('es-MX')} {studioResult.currency}</strong>
                    <small>No bajes de aquí</small>
                  </div>
                  <div className="studio-rate-box ideal">
                    <span>Tarifa ideal</span>
                    <strong>{studioResult.symbol}{studioResult.ideal.toLocaleString('es-MX')} {studioResult.currency}</strong>
                    <small>Lo que mereces pedir</small>
                  </div>
                </div>
                {studioResult.verdictOffer && (
                  <div className={`studio-offer-verdict ${studioResult.verdictOffer}`}>
                    {studioResult.verdictOffer === 'bajo' && <>❌ <strong>Oferta de la marca: baja.</strong> Ofrece {studioResult.symbol}{studioResult.offer.toLocaleString('es-MX')} {studioResult.currency} — por debajo de tu mínimo. Negocia o declina.</>}
                    {studioResult.verdictOffer === 'justo' && <>⚠️ <strong>Oferta de la marca: aceptable.</strong> {studioResult.symbol}{studioResult.offer.toLocaleString('es-MX')} {studioResult.currency} entra en rango, pero puedes pedir más.</>}
                    {studioResult.verdictOffer === 'bueno' && <>✅ <strong>Oferta de la marca: buena.</strong> {studioResult.symbol}{studioResult.offer.toLocaleString('es-MX')} {studioResult.currency} está igual o por encima de tu tarifa ideal.</>}
                  </div>
                )}
                {studioResult.verdictExpected && (
                  <div className={`studio-offer-verdict ${studioResult.verdictExpected}`} style={{marginTop: studioResult.verdictOffer ? '0.5rem' : '0'}}>
                    {studioResult.verdictExpected === 'bajo' && <>❌ <strong>Tu expectativa: conservadora.</strong> Esperas {studioResult.symbol}{studioResult.expected.toLocaleString('es-MX')} {studioResult.currency} — puedes pedir más, estás por debajo de tu valor real.</>}
                    {studioResult.verdictExpected === 'justo' && <>✦ <strong>Tu expectativa: realista.</strong> {studioResult.symbol}{studioResult.expected.toLocaleString('es-MX')} {studioResult.currency} entra bien en tu rango de mercado.</>}
                    {studioResult.verdictExpected === 'bueno' && <>💜 <strong>Tu expectativa: premium.</strong> {studioResult.symbol}{studioResult.expected.toLocaleString('es-MX')} {studioResult.currency} está en el tope del rango — apunta alto y sostén ese precio.</>}
                  </div>
                )}
                <p className="studio-result-note">
                  Estimación basada en mercado de {studioCountry} {new Date().getFullYear()}. Ajusta según tu portafolio, métricas de engagement y negociación con la marca.
                </p>
              </div>
            )}
          </div>
        )}

        {studioTab === 'contracts' && (
          <div className="studio-content">
            <div className="studio-card">
              <h2 className="studio-card-title">¿El contrato es seguro?</h2>
              <p className="studio-card-sub">Pega el texto del brief o contrato y te decimos qué cláusulas debes revisar antes de firmar.</p>
              <textarea
                className="studio-contract-input"
                placeholder="Pega aquí el texto del contrato, brief o propuesta de la marca..."
                value={studioContractText}
                onChange={(e) => setStudioContractText(e.target.value)}
                rows={8}
              />
              <button type="button" className="studio-calc-btn" onClick={analyzeContract} disabled={!studioContractText.trim() || studioContractLoading}>
                {studioContractLoading ? '⏳ Analizando con IA...' : '✦ Analizar contrato'}
              </button>
            </div>

            {studioContractResult && (
              <div className="studio-contract-results">
                {studioContractResult.aiPowered && (
                  <div className="contract-ai-badge">
                    <Sparkles size={13}/> Analizado por Claude IA
                  </div>
                )}
                {studioContractResult.summary && (
                  <div className="contract-summary">{studioContractResult.summary}</div>
                )}
                {studioContractResult.red.length === 0 && studioContractResult.yellow.length === 0 && studioContractResult.green.length === 0 && (
                  <div className="studio-contract-empty">
                    <span>🔍</span>
                    <p>No detectamos cláusulas conocidas. Esto puede significar que el contrato es simple, o que está escrito de forma muy diferente. Te recomendamos leerlo con un especialista si hay dudas.</p>
                  </div>
                )}
                {studioContractResult.red.length > 0 && (
                  <div className="studio-flag-group red">
                    <div className="studio-flag-header">❌ Cláusulas de alto riesgo ({studioContractResult.red.length})</div>
                    {studioContractResult.red.map((f) => (
                      <div key={f.label} className="studio-flag-item">
                        <strong>{f.label}</strong>
                        <span>{f.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
                {studioContractResult.yellow.length > 0 && (
                  <div className="studio-flag-group yellow">
                    <div className="studio-flag-header">⚠️ Cláusulas a revisar ({studioContractResult.yellow.length})</div>
                    {studioContractResult.yellow.map((f) => (
                      <div key={f.label} className="studio-flag-item">
                        <strong>{f.label}</strong>
                        <span>{f.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
                {studioContractResult.green.length > 0 && (
                  <div className="studio-flag-group green">
                    <div className="studio-flag-header">✅ Señales positivas ({studioContractResult.green.length})</div>
                    {studioContractResult.green.map((f) => (
                      <div key={f.label} className="studio-flag-item">
                        <strong>{f.label}</strong>
                        <span>{f.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="studio-result-note">Este análisis es orientativo. No reemplaza asesoría legal. Ante dudas, consulta con un especialista antes de firmar.</p>
              </div>
            )}
          </div>
        )}

        {studioTab === 'deliveries' && (
          <div className="studio-content">
            {(() => {
              const today = new Date(); today.setHours(0,0,0,0);
              const inWeek = new Date(today.getTime() + 7*24*60*60*1000);
              const active = deals.filter(d => !d.payment_received);
              const urgent = active.filter(d => d.delivery_date && new Date(d.delivery_date+'T00:00:00') <= inWeek);
              const pending$ = active.reduce((s,d) => s + (d.amount||0), 0);
              const published = deals.filter(d => d.published).length;
              return (
                <div className="deals-stats">
                  <div className="deals-stat"><strong>{active.length}</strong><small>Deals activos</small></div>
                  <div className={`deals-stat ${urgent.length>0?'warn':''}`}><strong>{urgent.length}</strong><small>Vencen esta semana</small></div>
                  <div className="deals-stat money"><strong>{pending$>0?`$${pending$.toLocaleString('es-MX')}`:'$0'}</strong><small>Por cobrar</small></div>
                  <div className="deals-stat ok"><strong>{published}</strong><small>Publicados</small></div>
                </div>
              );
            })()}

            <button type="button" className="deals-add-btn" onClick={() => setShowDealForm(v => !v)}>
              {showDealForm ? '✕ Cancelar' : '✦ Nuevo deal'}
            </button>

            {showDealForm && (
              <div className="studio-card">
                <h2 className="studio-card-title">Registrar nuevo deal</h2>
                <div className="studio-form-grid">
                  <label className="studio-field"><span>Marca *</span><input type="text" placeholder="Ej. Nike México" value={newDeal.brand_name} onChange={e=>setNewDeal(p=>({...p,brand_name:e.target.value}))} /></label>
                  <label className="studio-field"><span>Producto / Servicio</span><input type="text" placeholder="Ej. Tenis Air Max 2025" value={newDeal.product_service} onChange={e=>setNewDeal(p=>({...p,product_service:e.target.value}))} /></label>
                  <label className="studio-field"><span>Plataforma</span><select value={newDeal.platform} onChange={e=>setNewDeal(p=>({...p,platform:e.target.value}))}>
                    {['TikTok','Instagram Reels','Instagram Stories','YouTube Shorts','YouTube','Facebook','X'].map(pl=><option key={pl}>{pl}</option>)}
                  </select></label>
                  <label className="studio-field"><span>Tipo de contenido</span><select value={newDeal.content_type} onChange={e=>setNewDeal(p=>({...p,content_type:e.target.value}))}>
                    {['Video 60s','Video 30s','Video 15s','Reel','Story','Short','Live','Foto','Carrusel','Otro'].map(ct=><option key={ct}>{ct}</option>)}
                  </select></label>
                  <label className="studio-field"><span>Cantidad de piezas</span><input type="number" min="1" value={newDeal.quantity} onChange={e=>setNewDeal(p=>({...p,quantity:e.target.value}))} /></label>
                  <label className="studio-field"><span>Derechos de uso</span><select value={newDeal.usage_rights} onChange={e=>setNewDeal(p=>({...p,usage_rights:e.target.value}))}>
                    {['Solo orgánico','Orgánico + Paid Ads','Exclusividad 30 días','Exclusividad 90 días'].map(u=><option key={u}>{u}</option>)}
                  </select></label>
                  <label className="studio-field"><span>Fecha recepción campaña</span><input type="date" value={newDeal.received_date} onChange={e=>setNewDeal(p=>({...p,received_date:e.target.value}))} /></label>
                  <label className="studio-field"><span>Fecha límite guión</span><input type="date" value={newDeal.script_due_date} onChange={e=>setNewDeal(p=>({...p,script_due_date:e.target.value}))} /></label>
                  <label className="studio-field"><span>Fecha entrega a marca *</span><input type="date" value={newDeal.delivery_date} onChange={e=>setNewDeal(p=>({...p,delivery_date:e.target.value}))} /></label>
                  <label className="studio-field"><span>Fecha de publicación</span><input type="date" value={newDeal.publish_date} onChange={e=>setNewDeal(p=>({...p,publish_date:e.target.value}))} /></label>
                  <label className="studio-field"><span>Monto acordado</span><input type="number" placeholder="Ej. 3500" value={newDeal.amount} onChange={e=>setNewDeal(p=>({...p,amount:e.target.value}))} /></label>
                  <label className="studio-field"><span>Moneda</span><select value={newDeal.currency} onChange={e=>setNewDeal(p=>({...p,currency:e.target.value}))}>
                    {['MXN','USD','EUR','COP','CLP','PEN','ARS'].map(c=><option key={c}>{c}</option>)}
                  </select></label>
                  <label className="studio-field"><span>Estado de pago</span><select value={newDeal.payment_status} onChange={e=>setNewDeal(p=>({...p,payment_status:e.target.value}))}>
                    <option value="pendiente">Pendiente</option>
                    <option value="anticipo">50% anticipo recibido</option>
                    <option value="pagado">Pagado completo</option>
                  </select></label>
                  <label className="studio-field"><span>Nombre del contacto</span><input type="text" placeholder="Ej. Ana García" value={newDeal.contact_name} onChange={e=>setNewDeal(p=>({...p,contact_name:e.target.value}))} /></label>
                  <label className="studio-field"><span>WhatsApp / Email contacto</span><input type="text" placeholder="Ej. +52 55 1234 5678" value={newDeal.contact_whatsapp} onChange={e=>setNewDeal(p=>({...p,contact_whatsapp:e.target.value}))} /></label>
                  <label className="studio-field studio-field-full"><span>Hashtags requeridos</span><input type="text" placeholder="Ej. #NikePartner #JustDoIt" value={newDeal.hashtags} onChange={e=>setNewDeal(p=>({...p,hashtags:e.target.value}))} /></label>
                  <label className="studio-field studio-field-full"><span>Menciones requeridas</span><input type="text" placeholder="Ej. @nikemexico" value={newDeal.mentions} onChange={e=>setNewDeal(p=>({...p,mentions:e.target.value}))} /></label>
                  <label className="studio-field studio-field-full"><span>Restricciones / Do's &amp; Don'ts</span><input type="text" placeholder="Ej. No mencionar competencia, no mostrar precio" value={newDeal.restrictions} onChange={e=>setNewDeal(p=>({...p,restrictions:e.target.value}))} /></label>
                  <label className="studio-field studio-field-full"><span>Notas internas</span><input type="text" placeholder="Acuerdos verbales, contexto, recordatorios..." value={newDeal.notes} onChange={e=>setNewDeal(p=>({...p,notes:e.target.value}))} /></label>
                  <label className="studio-field studio-field-full deal-check-row">
                    <input type="checkbox" checked={newDeal.contract_signed} onChange={e=>setNewDeal(p=>({...p,contract_signed:e.target.checked}))} />
                    <span>Contrato firmado</span>
                  </label>
                </div>
                <button type="button" className="studio-calc-btn" onClick={addDeal} disabled={!newDeal.brand_name.trim()||!newDeal.delivery_date}>
                  ✦ Guardar deal
                </button>
              </div>
            )}

            <div className="deals-list">
              {deals.length === 0 && !showDealForm && (
                <article className="empty-state">
                  <Sparkles size={28} />
                  <strong>Aún no tienes deals registrados</strong>
                  <p>Agrega tu primera colaboración con el botón de arriba.</p>
                </article>
              )}
              {deals.map(deal => {
                const today = new Date(); today.setHours(0,0,0,0);
                const due = deal.delivery_date ? new Date(deal.delivery_date+'T00:00:00') : null;
                const isOverdue = due && due < today && !deal.delivered;
                const isUrgent = due && due <= new Date(today.getTime()+3*24*60*60*1000) && !deal.delivered && !isOverdue;
                const isExpanded = expandedDealId === deal.id;
                const pipeline = [
                  {key:'brief_received',label:'Brief'},{key:'script_approved',label:'Guión'},
                  {key:'filmed',label:'Grabado'},{key:'edited',label:'Editado'},
                  {key:'delivered',label:'Entregado'},{key:'brand_approved',label:'Aprobado'},
                  {key:'published',label:'Publicado'},{key:'payment_received',label:'Cobrado'},
                ];
                const doneCount = pipeline.filter(s=>deal[s.key]).length;
                const fmt = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'short'}) : null;
                return (
                  <article key={deal.id} className={`deal-card${isOverdue?' overdue':''}${isUrgent?' urgent':''}${deal.payment_received?' done':''}`}>
                    <div className="deal-card-header" onClick={()=>setExpandedDealId(isExpanded?null:deal.id)}>
                      <div className="deal-card-main">
                        <div className="deal-card-title-row">
                          <strong>{deal.brand_name}</strong>
                          {deal.product_service && <span className="deal-product">{deal.product_service}</span>}
                          {!deal.contract_signed && <span className="deal-warn-badge">Sin contrato</span>}
                        </div>
                        <div className="deal-card-meta">
                          <span>{deal.platform}</span><span>·</span><span>{deal.content_type}</span>
                          {deal.quantity > 1 && <><span>·</span><span>{deal.quantity} piezas</span></>}
                          {deal.amount > 0 && <><span>·</span><span className={`deal-amount${deal.payment_received?' paid':''}`}>${deal.amount?.toLocaleString('es-MX')} {deal.currency}</span></>}
                        </div>
                        <div className="deal-card-dates">
                          {fmt(deal.delivery_date) && <span className={`deal-date-badge${isOverdue?' red':isUrgent?' orange':''}`}>Entrega: {fmt(deal.delivery_date)}</span>}
                          {fmt(deal.publish_date) && <span className="deal-date-badge">Publicación: {fmt(deal.publish_date)}</span>}
                        </div>
                      </div>
                      <div className="deal-card-side">
                        <span className="deal-progress">{doneCount}/8</span>
                        <ChevronDown size={16} className={`deal-chevron${isExpanded?' open':''}`} />
                      </div>
                    </div>
                    <div className="deal-pipeline">
                      {pipeline.map(step => (
                        <button key={step.key} type="button"
                          className={`deal-step${deal[step.key]?' done':''}`}
                          onClick={e=>{e.stopPropagation();updateDeal(deal.id,step.key,!deal[step.key]);}}>
                          {deal[step.key]?'✓':''} {step.label}
                        </button>
                      ))}
                    </div>
                    {isExpanded && (
                      <div className="deal-detail">
                        <div className="deal-detail-grid">
                          {fmt(deal.received_date) && <div><small>Recepción campaña</small><span>{fmt(deal.received_date)}</span></div>}
                          {fmt(deal.script_due_date) && <div><small>Límite guión</small><span>{fmt(deal.script_due_date)}</span></div>}
                          {deal.usage_rights && <div><small>Derechos de uso</small><span>{deal.usage_rights}</span></div>}
                          <div><small>Estado de pago</small>
                            <span className={`deal-pay-label ${deal.payment_status}`}>
                              {deal.payment_status==='pendiente'?'⏳ Pendiente':deal.payment_status==='anticipo'?'💛 50% anticipo':'✅ Pagado'}
                            </span>
                          </div>
                          {deal.contact_name && <div><small>Contacto</small><span>{deal.contact_name}</span></div>}
                          {deal.contact_whatsapp && <div><small>WhatsApp / Email</small><span>{deal.contact_whatsapp}</span></div>}
                          {deal.hashtags && <div className="deal-detail-full"><small>Hashtags</small><span>{deal.hashtags}</span></div>}
                          {deal.mentions && <div className="deal-detail-full"><small>Menciones</small><span>{deal.mentions}</span></div>}
                          {deal.restrictions && <div className="deal-detail-full"><small>Restricciones</small><span style={{color:'#f9a8d4'}}>{deal.restrictions}</span></div>}
                          {deal.notes && <div className="deal-detail-full"><small>Notas</small><span>{deal.notes}</span></div>}
                          <div><small>Contrato</small><span>{deal.contract_signed?'✅ Firmado':'⚠️ No firmado'}</span></div>
                        </div>
                        <div className="deal-detail-actions">
                          <select value={deal.payment_status} onChange={e=>updateDeal(deal.id,'payment_status',e.target.value)} className="deal-select">
                            <option value="pendiente">Pago: Pendiente</option>
                            <option value="anticipo">Pago: 50% anticipo</option>
                            <option value="pagado">Pago: Pagado completo</option>
                          </select>
                          <button type="button" className="deal-delete-btn" onClick={()=>{if(window.confirm('¿Eliminar este deal?'))deleteDeal(deal.id);}}>
                            <Trash2 size={14}/> Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}

      {showAcademy && (
        <section className="academy-section tab-view">
          <div className="section-head academy-head">
            <div>
              <p className="eyebrow">Academia</p>
              <h2>Aprende ciberseguridad para creadores</h2>
              <p>
                Aquí podrás subir videos, guías y entrenamientos para que tus creadores aprendan
                a proteger cuentas, correos, dispositivos y colaboraciones.
              </p>
            </div>
          </div>

          <div className="academy-grid">
            {academyDbVideos.length === 0 && (
              <article className="empty-state" style={{gridColumn:'1/-1'}}>
                <GraduationCap size={32} />
                <strong>Próximamente</strong>
                <p>Los videos de formación aparecerán aquí en cuanto Javier los publique.</p>
              </article>
            )}
            {academyDbVideos.map((video, index) => (
              <article className="academy-card" key={video.id}>
                {video.youtube_id ? (
                  <div className="academy-video-embed">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtube_id}?rel=0&modestbranding=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="academy-video-placeholder">
                    <GraduationCap size={30} />
                    <span>Módulo {index + 1}</span>
                  </div>
                )}
                <div>
                  <span>{video.level}{video.duration ? ` · ${video.duration}` : ''}</span>
                  <strong>{video.title}</strong>
                  {video.description && <p>{video.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {showCitas && (
        <section className="citas-section tab-view">
          <div className="section-head">
            <div>
              <p className="eyebrow">Consultoría personalizada</p>
              <h2>Agendar cita</h2>
              <p>Elige el horario que mejor te acomode. La reunión se confirma directo en tu calendario.</p>
            </div>
          </div>
          <CalendlyWidget url="https://calendly.com/aztekillertech" />
        </section>
      )}

      <footer>
        <img src="/aztekiller-logo.png" alt="Aztekiller" />
        <span>Aztekiller Creators Guardian</span>
        <p>Herramienta lista para Cloudflare Pages. Archivos y hashes se revisan localmente; cuentas y checklist se guardan en Supabase.</p>
        <div className="trust-footer">
          <strong>Privacidad primero.</strong>
          No guardamos contraseñas. Tus datos de seguridad se separan por usuario y se usan solo para operar tu guardián UGC.
        </div>
      </footer>
    </main>
  );
}

function PasswordResetScreen({ onDone }) {
  const isMobileEdition = window.location.pathname.toLowerCase().includes('mobile');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsSubmitting(false);
    if (error) {
      setMessage(friendlyAuthError(error.message));
    } else {
      setMessage('¡Contraseña actualizada! Entrando a tu guardián...');
      setTimeout(onDone, 1500);
    }
  };

  return (
    <main className={`app-shell auth-shell${isMobileEdition ? ' mobile-edition' : ''}`}>
      <section className="auth-card password-reset-card">
        <div className="auth-card-head">
          <img src="/aztekiller-logo.png" alt="Aztekiller" />
          <div>
            <p className="eyebrow">Recuperar acceso</p>
            <h3>Nueva contraseña</h3>
          </div>
        </div>
        <p className="auth-card-copy">Elige una contraseña nueva y segura para tu guardián UGC.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Nueva contraseña
            <div className="auth-password-wrap">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                autoFocus
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <label>
            Confirmar contraseña
            <div className="auth-password-wrap">
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                autoComplete="new-password"
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          {message && <div className="auth-message">{message}</div>}
          <button type="submit" disabled={isSubmitting}>
            <Lock size={18} />
            {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [creatorType, setCreatorType] = useState('general');

  const creatorTypes = [
    { id: 'general', label: 'General', icon: Shield, color: '#10b981' },
    { id: 'streamer', label: 'Streamer', icon: Tv, color: '#9146ff' },
    { id: 'ugc', label: 'UGC', icon: Camera, color: '#ec4899' },
    { id: 'adult', label: 'Contenido Adultos', icon: Lock, color: '#ef4444' },
    { id: 'youtuber', label: 'YouTuber', icon: Youtube, color: '#ff0000' },
  ];
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  useEffect(() => {
    if (isStandalone || localStorage.getItem('creators-install-dismissed')) return;
    const handler = (e) => { e.preventDefault(); setInstallPromptEvent(e); setShowInstallBanner(true); };
    window.addEventListener('beforeinstallprompt', handler);
    if (isIOS) setTimeout(() => { if (!localStorage.getItem('creators-install-dismissed')) setShowInstallBanner(true); }, 4000);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setShowInstallBanner(false);
    setInstallPromptEvent(null);
    localStorage.setItem('creators-install-dismissed', '1');
  };

  const dismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem('creators-install-dismissed', '1');
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoadingSession(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setCurrentUser(data.session?.user || null);
      setIsLoadingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentUser(session?.user || null);
        setIsRecoverySession(true);
      } else {
        setCurrentUser(session?.user || null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  if (isLoadingSession) {
    return (
      <main className="app-shell auth-shell">
        <section className="auth-card">
          <img src="/aztekiller-logo.png" alt="Aztekiller" />
          <h1>Cargando guardian...</h1>
        </section>
      </main>
    );
  }

  if (currentUser && isRecoverySession) {
    return <PasswordResetScreen onDone={() => setIsRecoverySession(false)} />;
  }

  if (!currentUser) {
    return <AuthScreen onLogin={setCurrentUser} />;
  }

  return (
    <>
      {showInstallBanner && !isStandalone && (
        <div className="install-banner">
          <div className="install-banner-icon">📲</div>
          <div className="install-banner-content">
            <strong>Instala Creators Guardian</strong>
            {isIOS ? (
              <span>Toca <Share2 size={13} style={{verticalAlign:'middle'}}/> compartir → "Añadir a inicio"</span>
            ) : (
              <span>Tenla siempre lista en tu teléfono o escritorio</span>
            )}
          </div>
          <div className="install-banner-actions">
            {!isIOS && installPromptEvent && (
              <button className="install-btn-do" onClick={handleInstall}>Instalar</button>
            )}
            <button className="install-btn-dismiss" onClick={dismissInstall}>✕</button>
          </div>
        </div>
      )}
      <GuardianDashboard currentUser={currentUser} onLogout={logout} />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
