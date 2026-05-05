"use client"
import { usePathname, useRouter } from "next/navigation"
import "./navigation.css"

const Footer = () => {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname.includes("/admin")) {
    return null
  }

  // Smooth-scroll on the home page, navigate to home + hash everywhere else
  const goTo = (id: string) => {
    if (pathname === "/") {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    } else {
      router.push(`/#${id}`)
    }
  }

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">

          <div className="footer-col">
            <h3 className="footer-title">PeakPulse Agency</h3>
            <p className="footer-text">
              We believe every business deserves world-class digital solutions.
              Our mission is to amplify your growth through expert web development,
              compelling video content, and intelligent marketing automation.
            </p>
            <p className="footer-location">Puerto Princesa, Philippines</p>
          </div>

          <div className="footer-col">
            <h3 className="footer-title">Services</h3>
            <ul className="footer-list">
              <li><button type="button" onClick={() => goTo("services")}>Web Development</button></li>
              <li><button type="button" onClick={() => goTo("services")}>Social Media Management</button></li>
              <li><button type="button" onClick={() => goTo("services")}>Video Production</button></li>
              <li><button type="button" onClick={() => goTo("services")}>SEO &amp; GEO</button></li>
              <li><button type="button" onClick={() => goTo("services")}>Marketing Automation</button></li>
              <li><button type="button" onClick={() => goTo("services")}>Custom Solutions</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-title">Company</h3>
            <ul className="footer-list">
              <li><button type="button" onClick={() => goTo("portfolio")}>Our Work</button></li>
              <li><button type="button" onClick={() => goTo("testimonials")}>Testimonials</button></li>
              <li><button type="button" onClick={() => goTo("process")}>Process</button></li>
              <li><button type="button" onClick={() => goTo("pricing")}>Pricing</button></li>
              <li><button type="button" onClick={() => goTo("contact")}>Contact</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-title">Connect</h3>
            <ul className="footer-list">
              <li><a href="mailto:fdr.peakpulse@gmail.com">fdr.peakpulse@gmail.com</a></li>
              <li><a href="https://wa.me/639104461026" target="_blank" rel="noopener noreferrer">WhatsApp · +63 910 446 1026</a></li>
              <li><a href="https://calendly.com/fdr-peakpulse/30min" target="_blank" rel="noopener noreferrer">Book a strategy call</a></li>
              <li className="footer-note">4-hour response promise</li>
            </ul>

            <div className="footer-social" aria-label="Follow PeakPulse on social media">
              <a href="https://www.facebook.com/profile.php?id=61586989302904" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9V12h2.54V9.79c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57V12h2.78l-.45 2.97h-2.34V22c4.78-.76 8.45-4.92 8.45-9.94z" /></svg>
              </a>
              <a href="https://www.instagram.com/peakpulse_agy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" /></svg>
              </a>
              <a href="https://www.tiktok.com/@peakpulse_agy" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-6.81 6.86 6.84 6.84 0 0 0 6.84 6.83A6.85 6.85 0 0 0 17.23 16.16V9.49a8.16 8.16 0 0 0 4.77 1.52V7.55a4.83 4.83 0 0 1-2.41-.86z" /></svg>
              </a>
              <a href="https://x.com/peakpulse_agy" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://www.youtube.com/@peakpulse_agy" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" /></svg>
              </a>
              <a href="https://www.linkedin.com/in/peakpulse-agency-57535b3a9/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.04c.48-.91 1.65-1.86 3.4-1.86 3.63 0 4.3 2.39 4.3 5.5v6.25zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z" /></svg>
              </a>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <span>© 2026 PeakPulse Agency. All rights reserved.</span>
          <span>Crafted in Puerto Princesa &nbsp;·&nbsp; Worldwide</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
