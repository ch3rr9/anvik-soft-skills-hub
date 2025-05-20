
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Главная', href: '/' },
    { label: 'Личный кабинет', href: '/profile' },
    { label: 'Тесты', href: '/tests' },
    { label: 'График работы', href: '/schedule' },
    { label: 'Чат', href: '/chat' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-anvik-dark text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo и название */}
          <div className="flex items-center space-x-4 animate-slide-right">
            <Link to="/" className="flex items-center transition-all duration-300 hover:scale-105">
              <span className="text-xl font-bold">Анвик-Софт</span>
              <span className="ml-2 text-sm text-anvik-light/80">Skills Hub</span>
            </Link>
          </div>

          {/* Навигация для десктопа */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 animate-slide-down ${
                  index % 2 === 0 ? 'animate-delay-100' : 'animate-delay-200'
                } ${
                  location.pathname === item.href
                    ? "bg-anvik-primary text-white scale-105 shadow-md"
                    : "text-gray-200 hover:bg-anvik-secondary hover:text-white hover:scale-105"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Профиль пользователя */}
          <div className="hidden md:flex items-center animate-slide-left">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full transition-all duration-300 hover:scale-110 hover:bg-anvik-primary/20">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-anvik-primary text-white shadow-md">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                <DropdownMenuLabel>
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer transition-all duration-200 hover:bg-anvik-primary/10 hover:text-anvik-primary">
                    Профиль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive transition-all duration-200 hover:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Гамбургер меню для мобильных */}
          <div className="md:hidden animate-slide-left">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:bg-anvik-secondary transition-all duration-300 hover:scale-110"
            >
              {menuOpen ? <X className="animate-scale-in" /> : <Menu className="animate-scale-in" />}
            </Button>
          </div>
        </div>

        {/* Мобильное меню */}
        {menuOpen && (
          <div className="md:hidden pt-2 pb-4 space-y-1 animate-slide-down">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 animate-slide-down animate-delay-${index * 100} ${
                  location.pathname === item.href
                    ? "bg-anvik-primary text-white"
                    : "text-gray-200 hover:bg-anvik-secondary hover:text-white"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-gray-600 animate-slide-up animate-delay-300">
              <div className="px-3 py-2 text-sm font-medium text-gray-300">
                {user?.name} ({user?.position})
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-200 hover:bg-anvik-secondary hover:text-white transition-all duration-200"
              >
                <LogOut className="inline-block mr-2 h-4 w-4" />
                <span>Выйти</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
