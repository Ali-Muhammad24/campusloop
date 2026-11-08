// Shown at the bottom of every page (see Layout). Full layout on desktop, two short lines on phones.
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <strong className="footer-title">CampusLoop</strong>
          <span className="footer-tagline">Borrow smarter. Share better.</span>
        </div>
        <div className="footer-credits">
          <span>Developed by Muhammad Ali &amp; Abdullah Azmat</span>
          <span className="footer-copy">© 2026 CampusLoop</span>
        </div>
      </div>

      {/* Compact two-line version for phones (the one above is hidden there, see index.css). */}
      <div className="footer-compact">
        <p>
          <strong>CampusLoop</strong> · Borrow smarter. Share better.
        </p>
        <p className="footer-compact-credits">© 2026 · Developed by Muhammad Ali &amp; Abdullah Azmat</p>
      </div>
    </footer>
  );
}

export default Footer;
