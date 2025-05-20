
import React from "react";
import Navbar from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useAnimation } from "../ui/animate-presence";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { isTransitioning } = useAnimation();

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <Navbar />
      <main className={`flex-1 container mx-auto px-4 py-6 ${isTransitioning ? 'animate-fade-in' : ''}`}>
        <div className="animate-slide-up">
          {children}
        </div>
      </main>
      <footer className="bg-anvik-dark text-white py-4 animate-slide-up animate-delay-200">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Анвик-Софт Skills Hub. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
