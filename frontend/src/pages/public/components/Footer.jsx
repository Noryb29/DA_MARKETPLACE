import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-green-900 text-white py-12 px-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="footer-section">
            <h4 className="text-lg font-semibold mb-4 text-green-300">About Us</h4>
            <p className="text-gray-300">Connecting farmers directly with customers for fresh, organic produce.</p>
          </div>
          <div className="footer-section">
            <h4 className="text-lg font-semibold mb-4 text-green-300">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-300 hover:text-green-300 transition-colors">Home</a></li>
              <li><a href="#products" className="text-gray-300 hover:text-green-300 transition-colors">Products</a></li>
              <li><a href="#farmers" className="text-gray-300 hover:text-green-300 transition-colors">Farmers</a></li>
              <li><a href="#contact" className="text-gray-300 hover:text-green-300 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="text-lg font-semibold mb-4 text-green-300">Contact</h4>
            <p className="text-gray-300 mb-2">Email: info@farmersmarket.com</p>
            <p className="text-gray-300">Phone: (555) 123-4567</p>
          </div>
          <div className="footer-section">
            <h4 className="text-lg font-semibold mb-4 text-green-300">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#facebook" className="text-gray-300 hover:text-green-300 transition-colors">Facebook</a>
              <a href="#instagram" className="text-gray-300 hover:text-green-300 transition-colors">Instagram</a>
              <a href="#twitter" className="text-gray-300 hover:text-green-300 transition-colors">Twitter</a>
            </div>
          </div>
        </div>
        <div className="border-t border-green-700 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Farmer's Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
