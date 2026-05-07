"use client";

import Link from "next/link";
import Image from "next/image";
import { HeaderValues } from "@/types/header";
import "./navigation.css"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Header = ({ navigation }: { navigation: HeaderValues }) => {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState<boolean | null>(false);


  useEffect(() => {
    let lastScroll = 0;
    let ticking = false;

    const header = document.querySelector(".site-header");

    const update = () => {
      const currentScroll = window.scrollY;
      const goingDown = currentScroll > lastScroll;
      const delta = Math.abs(currentScroll - lastScroll);

      // Solid backdrop after a small scroll
      if (currentScroll > 80) {
        header?.classList.add("active");
        setScrolled(true);
      } else {
        header?.classList.remove("active");
        setScrolled(false);
      }

      // Smart hide: scroll down past 200px hides; scroll up reveals.
      // Ignore tiny jitter (delta < 6) so the bar doesn't flicker.
      if (delta > 6) {
        if (goingDown && currentScroll > 200) {
          header?.classList.add("hidden");
        } else {
          header?.classList.remove("hidden");
        }
      }

      lastScroll = currentScroll <= 0 ? 0 : currentScroll;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    console.log(id)
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  
  
  if (pathname.includes("/admin")) {
    return null
  }

  return (
    <header className={`site-header ${menuOpen ? "menu-openned" :  ""}`}>
      <nav className="nav container">
        {/* Logo */}
        <Link href="/" className="logo">
          {navigation.header_logo ? (
            <Image
              src={navigation.header_logo}
              alt={navigation.title || "Logo"}
              width={140}
              height={140}
              priority
              className="logo-mark"
            />
          ) : (
            navigation.title
          )}
        </Link>

        {/* Navigation */}
        <ul className="nav-links">
          {navigation.header_menu?.map((item, index) => {
            // 1️⃣ Section scroll
            if (item.linkId && !item.page) {
              return (
                <li key={index}>
                  <button
                    className="nav-link"
                    onClick={() => handleScroll(item.linkId)}
                  >
                    {item.title}
                  </button>
                </li>
              );
            }

            // 2️⃣ Internal page
              const slugObj = item.page?.slug as Record<string, unknown> | undefined;
              const pageSlug =
                (typeof slugObj?.current === "string" && slugObj.current) ||
                (typeof slugObj?.slug === "string" && slugObj.slug);
              if (pageSlug) {
                return (
                  <li key={index}>
                    <Link
                      href={`/${pageSlug}`}
                      className="nav-link"
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              }

            // 3️⃣ External/custom link
            // if (item.link) {
            //   return (
            //     <li key={index}>
            //       <Link
            //         href={item.link}
            //         className="nav-link"
            //         target="_blank"
            //         rel="noopener noreferrer"
            //       >
            //         {item.title}
            //       </Link>
            //     </li>
            //   );
            // }

            return null;
          })}
        </ul>

        {/* CTA → Calendly booking */}
        <a
          href="https://calendly.com/fdr-peakpulse/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button"
        >
          Book Call
        </a>
        <button
          className="menu-button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
      </nav>
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>

          <ul className="mobile-nav">
            {navigation.header_menu?.map((item, index) => {
              if (item.linkId) {
                return (
                  <li key={index}>
                    <button
                      onClick={() => {
                        handleScroll(item.linkId);
                        setMenuOpen(false);
                      }}
                    >
                      {item.title}
                    </button>
                  </li>
                );
              }

      const mobileSlugObj = item.page?.slug as Record<string, unknown> | undefined;
                const mobilePageSlug =
                  (typeof mobileSlugObj?.current === "string" && mobileSlugObj.current) ||
                  (typeof mobileSlugObj?.slug === "string" && mobileSlugObj.slug);
                if (mobilePageSlug) {
                  return (
                    <li key={index}>
                      <Link
                        href={`/${mobilePageSlug}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                }
              return null;
            })}
          </ul>

          <a
            className="mobile-cta"
            href="https://calendly.com/fdr-peakpulse/30min"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            Book Call
          </a>
        </div>
    </header>
  );
};

export default Header;
