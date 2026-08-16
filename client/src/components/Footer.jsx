import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} <span className="footer-brand">Schedura</span>. All rights reserved.</p>
      </div>
    </footer>
  );
}
