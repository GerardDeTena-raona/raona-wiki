import { defaultLocale, type Locale } from './utils';

const en = {
  'site.name': 'Internal Wiki',
  'site.tag': 'Raona',
  'site.titleSuffix': 'Internal Wiki',
  'site.description': 'Raona Internal Projects Wiki',

  'a11y.skip': 'Skip to content',
  'nav.toggle': 'Toggle navigation',
  'nav.label': 'Documentation',
  'nav.filter': 'Filter docs',
  'nav.filterLabel': 'Filter documentation',
  'nav.empty': 'No docs match your filter.',
  'theme.toggle': 'Toggle light / dark theme',
  'lang.label': 'Language',
  'lang.name': 'English',

  'doc.breadcrumb': 'Breadcrumb',
  'doc.breadcrumbRoot': 'Wiki',
  'doc.toc': 'On this page',
  'doc.pager': 'Previous and next document',
  'doc.prev': '← Previous',
  'doc.next': 'Next →',
  'doc.anchor': 'Link to section',
  'doc.fallback': 'This page is not available in {language} yet. Showing the English version.',

  'code.copy': 'Copy',
  'code.copied': 'Copied',
  'code.copyAria': 'Copy code to clipboard',
  'code.copyFail': 'Press Ctrl+C',

  'home.title': 'Home',
  'home.eyebrow': 'Raona · Internal Projects',
  'home.heading1': 'Engineering docs,',
  'home.heading2': 'built for builders.',
  'home.lede':
    'Architecture, contracts, state, styling and testing conventions for the Raona internal projects, in one searchable place.',
  'home.start': 'Start reading',
  'home.filterHint': 'to filter',
  'home.docs': 'docs',
  'home.sections': 'sections',
  'home.sectionsLabel': 'Sections',
} as const;

export type UiKey = keyof typeof en;
type Dictionary = Record<UiKey, string>;

const es: Dictionary = {
  'site.name': 'Wiki interna',
  'site.tag': 'Raona',
  'site.titleSuffix': 'Wiki interna',
  'site.description': 'Wiki de proyectos internos de Raona',

  'a11y.skip': 'Saltar al contenido',
  'nav.toggle': 'Alternar navegación',
  'nav.label': 'Documentación',
  'nav.filter': 'Filtrar documentos',
  'nav.filterLabel': 'Filtrar la documentación',
  'nav.empty': 'Ningún documento coincide con el filtro.',
  'theme.toggle': 'Cambiar entre tema claro y oscuro',
  'lang.label': 'Idioma',
  'lang.name': 'español',

  'doc.breadcrumb': 'Ruta de navegación',
  'doc.breadcrumbRoot': 'Wiki',
  'doc.toc': 'En esta página',
  'doc.pager': 'Documento anterior y siguiente',
  'doc.prev': '← Anterior',
  'doc.next': 'Siguiente →',
  'doc.anchor': 'Enlace a la sección',
  'doc.fallback': 'Esta página aún no está disponible en {language}. Se muestra la versión en inglés.',

  'code.copy': 'Copiar',
  'code.copied': 'Copiado',
  'code.copyAria': 'Copiar el código al portapapeles',
  'code.copyFail': 'Pulsa Ctrl+C',

  'home.title': 'Inicio',
  'home.eyebrow': 'Raona · Proyectos internos',
  'home.heading1': 'Documentación de ingeniería,',
  'home.heading2': 'hecha para quien construye.',
  'home.lede':
    'Arquitectura, contratos, estado, estilos y convenciones de pruebas de los proyectos internos de Raona, en un solo lugar donde buscar.',
  'home.start': 'Empezar a leer',
  'home.filterHint': 'para filtrar',
  'home.docs': 'documentos',
  'home.sections': 'secciones',
  'home.sectionsLabel': 'Secciones',
};

const ca: Dictionary = {
  'site.name': 'Wiki interna',
  'site.tag': 'Raona',
  'site.titleSuffix': 'Wiki interna',
  'site.description': 'Wiki de projectes interns de Raona',

  'a11y.skip': 'Salta al contingut',
  'nav.toggle': 'Alterna la navegació',
  'nav.label': 'Documentació',
  'nav.filter': 'Filtra documents',
  'nav.filterLabel': 'Filtra la documentació',
  'nav.empty': 'Cap document coincideix amb el filtre.',
  'theme.toggle': 'Canvia entre tema clar i fosc',
  'lang.label': 'Idioma',
  'lang.name': 'català',

  'doc.breadcrumb': 'Ruta de navegació',
  'doc.breadcrumbRoot': 'Wiki',
  'doc.toc': 'En aquesta pàgina',
  'doc.pager': 'Document anterior i següent',
  'doc.prev': '← Anterior',
  'doc.next': 'Següent →',
  'doc.anchor': 'Enllaç a la secció',
  'doc.fallback': 'Aquesta pàgina encara no està disponible en {language}. Es mostra la versió en anglès.',

  'code.copy': 'Copia',
  'code.copied': 'Copiat',
  'code.copyAria': 'Copia el codi al porta-retalls',
  'code.copyFail': 'Prem Ctrl+C',

  'home.title': 'Inici',
  'home.eyebrow': 'Raona · Projectes interns',
  'home.heading1': "Documentació d'enginyeria,",
  'home.heading2': 'feta per a qui construeix.',
  'home.lede':
    "Arquitectura, contractes, estat, estils i convencions de proves dels projectes interns de Raona, en un sol lloc on cercar.",
  'home.start': 'Comença a llegir',
  'home.filterHint': 'per filtrar',
  'home.docs': 'documents',
  'home.sections': 'seccions',
  'home.sectionsLabel': 'Seccions',
};

const dictionaries: Record<Locale, Dictionary> = { en, es, ca };

/** Returns a `t(key, vars?)` function bound to a locale, falling back to the default locale. */
export function useTranslations(locale: Locale) {
  return (key: UiKey, vars?: Record<string, string | number>): string => {
    const text = dictionaries[locale][key] ?? dictionaries[defaultLocale][key];
    return vars
      ? text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`))
      : text;
  };
}
