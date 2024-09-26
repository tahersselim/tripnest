import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 py-2">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
        <div className="flex justify-center items-center my-2">
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12.072c0 5.522-4.478 10-10 10S2 17.594 2 12.072 6.478 2.072 12 2.072 22 6.55 22 12.072zm-4.327-1.444h-1.37c-1.08 0-1.657.838-1.657 1.621v1.866h3.066l-.397 2.66h-2.669v6.745H12.13v-6.746H10.248v-2.661h1.883V11.24c0-1.861 1.075-2.881 2.65-2.881 1.072 0 1.962.796 1.962 1.844v2.261zm-6.025 5.114v-2.66h-2.746v2.66h2.746zm-2.692-3.978h1.745v1.221h-1.745v-1.221zm-.88-1.888v1.732H8.184v-1.732H7.11zm6.919 2.469v2.665h-2.833v-2.665h2.833zM12 4.414a7.558 7.558 0 0 0-7.569 7.658c0 4.218 3.443 7.66 7.569 7.66 4.175 0 7.569-3.441 7.569-7.66a7.558 7.558 0 0 0-7.569-7.658zm0 13.788c-3.462 0-6.586-2.835-6.586-6.592 0-3.75 3.124-6.596 6.586-6.596 3.497 0 6.631 2.846 6.631 6.596 0 3.758-3.133 6.592-6.631 6.592z"></path>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.7 10.7 0 0 1-3.03.83A5.22 5.22 0 0 0 22.4 2a10.66 10.66 0 0 1-3.45 1.31A5.32 5.32 0 0 0 11.7 8a15.01 15.01 0 0 1-10.9-5.5A5.31 5.31 0 0 0 2 6.4a5.28 5.28 0 0 0 2.36-.68A5.29 5.29 0 0 1 2 6.5v.07a5.29 5.29 0 0 0 4.25 5.18 5.27 5.27 0 0 1-2.39.1A5.3 5.3 0 0 0 6 13.2a10.68 10.68 0 0 1-6.6 2.28A10.5 10.5 0 0 1 0 15.53a15 15 0 0 0 8.15 2.43c9.76 0 15.12-8.06 15.12-15v-.68A10.63 10.63 0 0 0 23 3z"></path>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.76 9.76 0 0 0 12 2.25zM12 18a6 6 0 1 1 6-6 6.006 6.006 0 0 1-6 6zM16.5 8.25a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5zM21 7.5a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 1 1-1.5 1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1 1.5-1.5zM12 16a4 4 0 1 1 4-4 4.005 4.005 0 0 1-4 4z"></path>
              </svg>
            </a>
          </div>
        </div>
          <p className="text-sm text-gray-700">&copy; {new Date().getFullYear()} TripNest. All rights reserved </p>         
        </div>
      </div>
    </footer>
  );
};

export default Footer;
