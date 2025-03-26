// File: src/utils/accessibility.js
/**
 * Utility per migliorare l'accessibilità dell'applicazione CleanAI
 * Implementa funzioni per garantire che l'app sia accessibile a tutti gli utenti
 */

// Funzione per aggiungere attributi ARIA ai componenti
export const addAriaAttributes = (element, attributes) => {
  if (!element) return;
  
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(`aria-${key}`, value);
  });
};

// Funzione per gestire la navigazione da tastiera
export const handleKeyboardNavigation = (event, actions) => {
  const { key, target } = event;
  
  if (actions[key]) {
    event.preventDefault();
    actions[key](target);
  }
};

// Funzione per migliorare il contrasto dei colori
export const enhanceColorContrast = (baseColor, contrastRatio = 4.5) => {
  // Implementazione semplificata per la dimostrazione
  // In un'implementazione reale, questa funzione calcolerebbe
  // il colore con il contrasto appropriato rispetto allo sfondo
  return baseColor;
};

// Funzione per verificare l'accessibilità di un componente
export const checkAccessibility = (component) => {
  const issues = [];
  
  // Verifica la presenza di attributi alt nelle immagini
  const images = component.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt) {
      issues.push('Immagine senza attributo alt');
    }
  });
  
  // Verifica la presenza di label nei campi di input
  const inputs = component.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const id = input.id;
    if (id) {
      const label = component.querySelector(`label[for="${id}"]`);
      if (!label) {
        issues.push(`Input con id ${id} senza label associata`);
      }
    } else {
      issues.push('Input senza id');
    }
  });
  
  // Verifica la presenza di attributi ARIA nei componenti interattivi
  const interactiveElements = component.querySelectorAll('button, a, [role="button"]');
  interactiveElements.forEach(el => {
    if (!el.getAttribute('aria-label') && !el.textContent.trim()) {
      issues.push('Elemento interattivo senza testo o aria-label');
    }
  });
  
  return issues;
};

// Funzione per aggiungere supporto per screen reader
export const addScreenReaderSupport = (element, text) => {
  const srOnly = document.createElement('span');
  srOnly.className = 'sr-only';
  srOnly.textContent = text;
  element.appendChild(srOnly);
};

// Funzione per migliorare la navigazione da tastiera
export const improveKeyboardNavigation = () => {
  // Aggiunge un outline visibile quando gli elementi sono focalizzati da tastiera
  const style = document.createElement('style');
  style.textContent = `
    :focus-visible {
      outline: 2px solid #4f46e5 !important;
      outline-offset: 2px !important;
    }
  `;
  document.head.appendChild(style);
};

// Funzione per implementare skip links
export const addSkipLinks = () => {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-primary-600 focus:outline focus:outline-2 focus:outline-primary-600';
  skipLink.textContent = 'Vai al contenuto principale';
  document.body.insertBefore(skipLink, document.body.firstChild);
};

// Funzione per verificare il contrasto dei colori
export const checkColorContrast = (foreground, background) => {
  // Implementazione semplificata per la dimostrazione
  // In un'implementazione reale, questa funzione calcolerebbe
  // il rapporto di contrasto tra i due colori
  return true;
};

// Inizializza le funzionalità di accessibilità
export const initAccessibility = () => {
  improveKeyboardNavigation();
  addSkipLinks();
  
  // Aggiungi attributo lang all'html
  document.documentElement.lang = 'it';
  
  console.log('Funzionalità di accessibilità inizializzate');
};

export default {
  addAriaAttributes,
  handleKeyboardNavigation,
  enhanceColorContrast,
  checkAccessibility,
  addScreenReaderSupport,
  improveKeyboardNavigation,
  addSkipLinks,
  checkColorContrast,
  initAccessibility
};
