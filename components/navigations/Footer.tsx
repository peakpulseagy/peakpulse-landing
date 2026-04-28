"use client"
import { usePathname } from "next/navigation"
import "./navigation.css"

const Footer = () => {
  const pathname = usePathname()

  if (pathname.includes("/admin")) {
    return null
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
              <li>Web Development</li>
              <li>Video Production</li>
              <li>Marketing Automation</li>
              <li>Custom Solutions</li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-title">Company</h3>
            <ul className="footer-list">
              <li>Our Work</li>
              <li>Testimonials</li>
              <li>Contact</li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-title">Connect</h3>
            <ul className="footer-list">
              <li>hello@peakpulse.agency</li>
              <li>@peakpulseagency</li>
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
