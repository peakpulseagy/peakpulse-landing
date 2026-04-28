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
              <li><button type="button" onClick={() => goTo("services")}>Video Production</button></li>
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
              <li><a href="mailto:hello@peakpulse.agency">hello@peakpulse.agency</a></li>
              <li><a href="https://instagram.com/peakpulseagency" target="_blank" rel="noopener noreferrer">@peakpulseagency</a></li>
              <li><button type="button" onClick={() => goTo("contact")}>Book a strategy call</button></li>
              <li className="footer-note">4-hour response promise</li>
            </ul>
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
