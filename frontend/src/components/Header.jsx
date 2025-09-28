import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { FileText, Image, Merge, Minimize, Calculator, Home } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/image-to-pdf', label: 'Image to PDF', icon: Image },
    { path: '/word-to-pdf', label: 'Word to PDF', icon: FileText },
    { path: '/pdf-merger', label: 'PDF Merger', icon: Merge },
    { path: '/reduce-pdf-size', label: 'Reduce PDF Size', icon: Minimize },
    { path: '/calculator', label: 'EMI Calculator', icon: Calculator },
  ];

  return (
    <header className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">PDF Tools</span>
          </Link>
          
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center space-x-2 px-3 py-2 transition-all duration-200 ${
                      isActive 
                        ? 'bg-white text-gray-800 shadow-md' 
                        : 'text-white hover:text-gray-200 hover:bg-pink-600/40'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="text-white hover:bg-pink-600/40">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden pb-4">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    className={`w-full flex items-center justify-center space-x-2 py-3 ${
                      isActive 
                        ? 'bg-white text-gray-800' 
                        : 'text-white hover:text-gray-100 hover:bg-pink-600/40'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
