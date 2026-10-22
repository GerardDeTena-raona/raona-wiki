import type { Locale } from './utils';

/**
 * Sidebar labels per locale. Keys are the English `navGroup` / doc id from the
 * content frontmatter; anything missing falls back to the English text.
 * A real translated doc (`src/content/docs/<locale>/...`) overrides its title here.
 */
type Labels = Partial<Record<Locale, Record<string, string>>>;

export const groupLabels: Labels = {
  es: {
    Architecture: 'Arquitectura',
    'Core Services': 'Servicios base',
    Backend: 'Backend',
    Features: 'Funcionalidades',
    'Out-of-Scope (OOS)': 'Fuera de alcance (OOS)',
    'Styling & Testing': 'Estilos y pruebas',
  },
  ca: {
    Architecture: 'Arquitectura',
    'Core Services': 'Serveis base',
    Backend: 'Backend',
    Features: 'Funcionalitats',
    'Out-of-Scope (OOS)': "Fora d'abast (OOS)",
    'Styling & Testing': 'Estils i proves',
  },
};

export const docTitles: Labels = {
  es: {
    'architecture/extension-framework': 'Framework de extensiones',
    configuration: 'Configuración',
    'state-and-hoc': 'Estado y HOC',
    shared: 'Código compartido',
    auth: 'Autenticación',
    i18n: 'Internacionalización (i18n)',
    'backend/contracts': 'Contratos',
    'backend/providers': 'Proveedores',
    'backend/mock-backend': 'Backend simulado (mock)',
    'features/home': 'Inicio',
    'features/processes': 'Procesos',
    'features/process-detail': 'Detalle de proceso',
    'features/execution': 'Ejecución',
    'features/admin': 'Administración',
    'oos/overview': 'Visión general',
    'oos/data-and-mock': 'Datos y calendario mock',
    'oos/ui': 'Interfaz de usuario',
    styles: 'Estilos',
    testing: 'Pruebas',
  },
  ca: {
    'architecture/extension-framework': "Framework d'extensions",
    configuration: 'Configuració',
    'state-and-hoc': 'Estat i HOC',
    shared: 'Codi compartit',
    auth: 'Autenticació',
    i18n: 'Internacionalització (i18n)',
    'backend/contracts': 'Contractes',
    'backend/providers': 'Proveïdors',
    'backend/mock-backend': 'Backend simulat (mock)',
    'features/home': 'Inici',
    'features/processes': 'Processos',
    'features/process-detail': 'Detall de procés',
    'features/execution': 'Execució',
    'features/admin': 'Administració',
    'oos/overview': 'Visió general',
    'oos/data-and-mock': 'Dades i calendari mock',
    'oos/ui': "Interfície d'usuari",
    styles: 'Estils',
    testing: 'Proves',
  },
};
