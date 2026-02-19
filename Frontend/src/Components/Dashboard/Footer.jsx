export default function Footer() {
  return (
    <footer className="bg-dark text-white text-center py-3 mt-4">
      <div className="container">
        <small>
          &copy; {new Date().getFullYear()} SeigeBank. All rights reserved. | Terms & Conditions | Privacy Policy
        </small>
      </div>
    </footer>
  );
}
