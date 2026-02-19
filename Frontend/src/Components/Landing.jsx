
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import './styles/Landing.css';

export default function Landing() {
    const stats = [
        { number: '50K+', label: 'Active Users' },
        { number: '₦5B+', label: 'Transactions' },
        { number: '24/7', label: 'Support' },
        { number: '99.9%', label: 'Uptime' },
    ];

    // Duplicate stats to make loop seamless
    const tickerStats = [...stats, ...stats];

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <div className="nav-logo">
                        <div className="logo-icon">🏦</div>
                        <span className="logo-text">Siege Bank</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link nav-link-primary">Sign Up</Link>
                    </div>
                </div>
            </nav>

            
            {/* <section className="hero">
                <div className="hero-background"></div>
                <div className="hero-content">
                    <h1>Modern Banking for Everyone</h1>
                    <p>Experience secure, fast, and convenient online banking with Siege Bank</p>
                    <div className="hero-buttons">
                        <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
                    </div>
                </div>
            </section> */}

            {/* Hero Section */}
<section className="hero">
  <div className="hero-background"></div>
  <div className="hero-overlay"></div>
  <div className="hero-content">
    <h1>Modern Banking for Everyone</h1>
    <p>Experience secure, fast, and convenient online banking with Siege Bank</p>
    <div className="hero-buttons">
      <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
    </div>
  </div>

  <div className="hero-image">
    <div className="hero-graphic">
      <div className="card-visual">💳</div>
    </div>
  </div>
</section>


            {/* Features Section */}
            <section className="features">
  <h2>Why Choose Siege Bank?</h2>
  <div className="features-grid">
    {[
      { icon: '🔐', title: 'Secure', desc: 'Bank-grade encryption, MFA, and biometric verification to keep your funds safe.' },
      { icon: '⚡', title: 'Fast', desc: 'Instant account setup and near-instant transactions with seamless digital onboarding.' },
      { icon: '📱', title: 'Easy', desc: 'Intuitive interface designed for effortless navigation and full control of your finances.' },
      { icon: '🌍', title: 'Global', desc: 'Access your account anytime, anywhere on desktop, tablet, or mobile.' },
      { icon: '💰', title: 'Low Fees', desc: 'Transparent pricing with competitive rates and zero hidden charges.' },
      { icon: '📊', title: 'Smart Tools', desc: 'Analytics and insights to track spending and optimize your financial decisions.' },
    ].map((feature, idx) => (
      <div key={idx} className="feature-card">
        <div className="feature-icon">{feature.icon}</div>
        <h3>{feature.title}</h3>
        <p>{feature.desc}</p>
      </div>
    ))}
  </div>
</section>


{/* View Section */}
<section className="view">
  <div className="view-content">
    {/* Text Column */}
    <div className="view-text">
      <h2>Feel the excitement of modern banking — Banking That Works For You</h2>
      <p>Manage your money, send transfers, and track your accounts with ease. All in one secure platform.</p>
    </div>

    {/* Cards and Images Column */}
    <div className="view-row">
      {/* ATM Card */}
      <div className="view-card">
        <div className="atm-card">
          <div className="card-top">
            <div className="card-chip" />
            <div className="card-logo">Siege Bank</div>
          </div>
          <div className="card-number">**** **** **** 1234</div>
          <div className="card-bottom">
            <div className="card-holder">Master Card</div>
            <div className="card-exp">12/40</div>
          </div>
        </div>
      </div>

      {/* Bank Images */}
      <div className="view-images" aria-hidden>
        <img src="/assets/seige card.png" className="bank-image img-1" alt="banking illustration 1" />
        <img src="/assets/seige card2.jpg" className="bank-image img-2" alt="banking illustration 2" />
      </div>
    </div>
  </div>
</section>


            {/* Stats Ticker Section */}
            <section className="stats-ticker">
                <Swiper
                    modules={[Autoplay]}
                    slidesPerView={'auto'}
                    spaceBetween={200}
                    loop={true}
                    freeMode={true}
                    speed={2000}
                    autoplay={{
                        delay: 0,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: false,
                    }}
                    className="stats-swiper"
                >
                    {tickerStats.map((stat, index) => (
                        <SwiperSlide key={index} style={{ width: 'auto' }}>
                            <div className="stat-item">
                                <h3>{stat.number}</h3>
                                <p>{stat.label}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <h2>Ready to Get Started?</h2>
                <p>Join thousands of satisfied customers who trust Siege Bank</p>
                <Link to="/register" className="btn btn-primary btn-lg">
                    Open Your Account Today
                </Link>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Siege Bank</h4>
                        <p>Modern banking made simple</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                            <li><a href="#features">Features</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Contact</h4>
                        <ul>
                            <li><a href="mailto:support@siegebank.com">support@siegebank.com</a></li>
                            <li><a href="tel:+2341234567890">+234-123-456-7890</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2012 Siege Bank. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
