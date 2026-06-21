// Cabecera institucional. Usa la Marca Institucional oficial (escudo + texto
// nominativo "Universidad del Bío-Bío"), descargada del sitio oficial, sobre
// fondo blanco como en los portales UBB.
export default function BrandHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <div className="brand">
          <img
            className="brand__mark"
            src="/brand/escudo-ubb.svg"
            alt="Universidad del Bío-Bío"
            width="84"
            height="54"
          />
          <span className="brand__divider" />
          <div className="brand__text">
            <p className="brand__kicker">Plataforma de video</p>
            <div className="brand__title">Retransmisión de Cámaras</div>
          </div>
        </div>
      </div>
    </header>
  );
}
