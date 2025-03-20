import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/";
  const isAdmin = location.startsWith("/admin");

  useEffect(() => {
    if (isHome) {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > window.innerHeight - 100);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [isHome]);

  return (
    <header
      className={`${isHome ? 'fixed' : 'relative'} top-0 py-5 left-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? "bg-slate-50 shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Left side empty space */}
        <div className="w-1/3"></div>

        {/* Centered logo */}
        <div className="flex justify-center">
          <Link href={isAdmin ? "/admin" : "/"}>
            <a>
              <img
                src={
                  isScrolled
                    ? "/img/corporativa/logo-negro.png"
                    : "/img/corporativa/logo-blanco.png"
                }
                alt="Asador La Morenica"
                className="h-20 transition-opacity duration-300 pt-2"
              />
            </a>
          </Link>
        </div>

        {/* Right side empty space */}
        <div className="w-1/3"></div>
      </div>
    </header>
  );
}