
import React, { useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface AnimationContextType {
  isTransitioning: boolean;
  prevPath: string | null;
  currentPath: string;
}

const AnimationContext = React.createContext<AnimationContextType>({
  isTransitioning: false,
  prevPath: null,
  currentPath: window.location.pathname,
});

export const useAnimation = () => useContext(AnimationContext);

export const AnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [prevPath, setPrevPath] = React.useState<string | null>(null);
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      setPrevPath(prevPathRef.current);
      prevPathRef.current = location.pathname;
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // продолжительность анимации
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Инициализация путей при первом рендере
  useEffect(() => {
    prevPathRef.current = location.pathname;
  }, []);

  return (
    <AnimationContext.Provider
      value={{ isTransitioning, prevPath, currentPath: location.pathname }}
    >
      <div className={`page-content ${isTransitioning ? 'fade-in' : ''}`}>
        {children}
      </div>
    </AnimationContext.Provider>
  );
};
