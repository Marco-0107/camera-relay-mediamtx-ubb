import { useState } from 'react';

// Campo de solo lectura con botón "Copiar". Reutilizable para enlaces (RTSP…).
export default function CopyField({ value, ariaLabel }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback para navegadores sin Clipboard API o contextos no seguros.
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* sin acción */
      }
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="copy-field">
      <code className="copy-field__value" aria-label={ariaLabel} title={value}>
        {value}
      </code>
      <button
        type="button"
        className="btn btn--gold btn--sm copy-field__btn"
        onClick={copy}
      >
        {copied ? '¡Copiado!' : 'Copiar'}
      </button>
    </div>
  );
}
