import React, { useState } from 'react'
import { ChevronDown, Leaf, Target, Eye, Users, Award, MapPin, Phone, Mail } from 'lucide-react'
import Header from './components/Header'
import { Link } from 'react-router-dom'

const AboutPage = () => {
  const [expandedTeam, setExpandedTeam] = useState(null)

  return (
    <div className='min-h-screen bg-white'>
        <Header/>
      {/* Hero Banner */}
      <section className='relative bg-gradient-to-r from-green-700 to-emerald-600 text-white px-6 py-20'>
        <div className='max-w-6xl mx-auto text-center'>
          <h1 className='text-5xl md:text-6xl font-bold mb-4'>About Us</h1>
          <p className='text-xl md:text-2xl opacity-90'>
            Connecting local farmers with consumers through sustainable agricultural practices
          </p>
        </div>
      </section>

      {/* Organization Overview */}
      <section className='px-6 py-16 bg-gray-50'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-4xl font-bold text-gray-900 mb-6'>Who We Are</h2>
              <p className='text-lg text-gray-700 mb-4 leading-relaxed'>
                This Platform is a dedicated platform designed to bridge the gap between local farmers and consumers in Cagayan de Oro and Northern Mindanao. We are committed to promoting sustainable agriculture, supporting rural communities, and ensuring access to fresh, high-quality produce.
              </p>
              <p className='text-lg text-gray-700 leading-relaxed'>
                Our mission is to empower local farmers through modern technology while providing consumers with direct access to fresh, farm-grown products. We believe in transparency, sustainability, and fair trade practices.
              </p>
            </div>
            <div className='bg-green-100 rounded-lg h-96 flex items-center justify-center'>
              <Leaf size={120} className='text-green-600 opacity-60' />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className='px-6 py-16'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-4xl font-bold text-gray-900 text-center mb-12'>Our Commitment</h2>
          
          <div className='grid md:grid-cols-3 gap-8'>
            {/* Mission */}
            <div className='bg-white border-2 border-green-700 rounded-lg p-8'>
              <div className='flex items-center gap-3 mb-4'>
                <Target size={32} className='text-green-700' />
                <h3 className='text-2xl font-bold text-gray-900'>Mission</h3>
              </div>
              <p className='text-gray-700 leading-relaxed'>
                To provide a sustainable and efficient marketplace that empowers local farmers, supports agricultural development, and delivers fresh, quality produce directly to consumers while promoting rural economic growth.
              </p>
            </div>

            {/* Vision */}
            <div className='bg-white border-2 border-emerald-600 rounded-lg p-8'>
              <div className='flex items-center gap-3 mb-4'>
                <Eye size={32} className='text-emerald-600' />
                <h3 className='text-2xl font-bold text-gray-900'>Vision</h3>
              </div>
              <p className='text-gray-700 leading-relaxed'>
                To be the leading agricultural marketplace in Northern Mindanao, fostering sustainable farming practices, creating economic opportunities for farmers, and ensuring food security for our communities.
              </p>
            </div>

            {/* Core Values */}
            <div className='bg-white border-2 border-lime-600 rounded-lg p-8'>
              <div className='flex items-center gap-3 mb-4'>
                <Award size={32} className='text-lime-600' />
                <h3 className='text-2xl font-bold text-gray-900'>Core Values</h3>
              </div>
              <ul className='text-gray-700 space-y-2'>
                <li className='flex items-start gap-2'>
                  <span className='text-lime-600 font-bold mt-1'>•</span>
                  <span><strong>Integrity:</strong> Honest dealings with all stakeholders</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-lime-600 font-bold mt-1'>•</span>
                  <span><strong>Sustainability:</strong> Environmentally responsible practices</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-lime-600 font-bold mt-1'>•</span>
                  <span><strong>Quality:</strong> Excellence in all products and services</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features/Objectives */}
      <section className='px-6 py-16 bg-gray-50'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-4xl font-bold text-gray-900 text-center mb-12'>Our Objectives</h2>
          
          <div className='grid md:grid-cols-2 gap-8'>
            {[
              {
                title: 'Support Local Farmers',
                desc: 'Provide farmers with a direct marketplace to sell their produce without intermediaries, ensuring better profit margins and economic stability.'
              },
              {
                title: 'Ensure Food Security',
                desc: 'Make fresh, locally-grown produce accessible and affordable to all members of our communities.'
              },
              {
                title: 'Promote Sustainable Agriculture',
                desc: 'Encourage farming practices that are environmentally friendly and sustainable for future generations.'
              },
              {
                title: 'Foster Rural Development',
                desc: 'Support agricultural communities through technology, training, and market access opportunities.'
              },
              {
                title: 'Quality Assurance',
                desc: 'Maintain strict quality standards to ensure consumers receive only the freshest and highest quality produce.'
              },
              {
                title: 'Community Engagement',
                desc: 'Build strong relationships between farmers and consumers through transparency and direct communication.'
              }
            ].map((objective, idx) => (
              <div key={idx} className='bg-white rounded-lg p-6 border-l-4 border-green-600'>
                <h3 className='text-xl font-bold text-gray-900 mb-3'>{objective.title}</h3>
                <p className='text-gray-700'>{objective.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

  

      {/* Service Area & Coverage */}
      <section className='px-6 py-16 bg-gray-50'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-4xl font-bold text-gray-900 text-center mb-12'>Service Area</h2>
          
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div>
              <div className='bg-blue-100 rounded-lg h-80 flex items-center justify-center'>
                <MapPin size={100} className='text-blue-600 opacity-60' />
              </div>
            </div>
            <div>
              <p className='text-lg text-gray-700 mb-6 leading-relaxed'>
                Our System primarily operates in Cagayan de Oro and Northern Mindanao, serving as a marketplace for local farmers and consumers in the region.
              </p>
              
              <div className='space-y-4'>
                <div>
                  <h4 className='text-xl font-bold text-gray-900 mb-2'>Primary Coverage Area</h4>
                  <p className='text-gray-700'>
                    Cagayan de Oro City and its surrounding municipalities in Misamis Oriental Province
                  </p>
                </div>
                
                <div>
                  <h4 className='text-xl font-bold text-gray-900 mb-2'>Expansion Plans</h4>
                  <p className='text-gray-700'>
                    We are committed to expanding our services to other provinces in Northern Mindanao to maximize our positive impact on rural communities and food security.
                  </p>
                </div>

                <div>
                  <h4 className='text-xl font-bold text-gray-900 mb-2'>Network of Partners</h4>
                  <ul className='text-gray-700 space-y-2'>
                    <li>✓ Local farming cooperatives</li>
                    <li>✓ Municipal and provincial government units</li>
                    <li>✓ Agricultural extension services</li>
                    <li>✓ Transportation and logistics providers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className='px-6 py-16'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-4xl font-bold text-gray-900 text-center mb-12'>Get In Touch</h2>
          
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8 border border-green-200'>
              <div className='flex items-center gap-3 mb-4'>
                <Phone size={24} className='text-green-600' />
                <h3 className='text-xl font-bold text-gray-900'>Phone</h3>
              </div>
              <p className='text-gray-700'>
                <span className='block font-semibold'>Main Office:</span>
                088-8562753-55
              </p>
              {/* <p className='text-gray-700 mt-3'>
                <span className='block font-semibold'>Farmer Hotline:</span>
                +63 (88) 721-3457
              </p> */}
            </div>

            <div className='bg-gradient-to-br from-emerald-50 to-lime-50 rounded-lg p-8 border border-emerald-200'>
              <div className='flex items-center gap-3 mb-4'>
                <Mail size={24} className='text-emerald-600' />
                <h3 className='text-xl font-bold text-gray-900'>Email</h3>
              </div>
              <p className='text-gray-700'>
                <span className='block font-semibold'>General Inquiries:</span>
                <a href='mailto:agri10cdo@gmail.com' className='text-green-600 hover:text-green-700'>
                  agri10cdo@gmail.com
                </a>
              </p>
              {/* <p className='text-gray-700 mt-3'>
                <span className='block font-semibold'>Farmer Support:</span>
                <a href='mailto:farmers@farmhub.ph' className='text-green-600 hover:text-green-700'>
                  farmers@farmhub.ph
                </a>
              </p> */}
            </div>

            <div className='bg-gradient-to-br from-lime-50 to-green-50 rounded-lg p-8 border border-lime-200'>
              <div className='flex items-center gap-3 mb-4'>
                <MapPin size={24} className='text-lime-600' />
                <h3 className='text-xl font-bold text-gray-900'>Address</h3>
              </div>
              <p className='text-gray-700'>
                Antonio Luna Street, Cagayan de Oro City, Misamis Oriental, 9000, Philippines<br/>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className='bg-gradient-to-r from-green-700 to-emerald-600 text-white px-6 py-16'>
        <div className='max-w-6xl mx-auto text-center'>
          <h2 className='text-4xl font-bold mb-6'>Join Our Agricultural Community</h2>
          <p className='text-xl mb-8 opacity-90'>
            Whether you're a farmer looking to expand your market or a consumer seeking fresh produce, Department of Agriculture welcomes you!
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to={'/register'} className='px-8 py-3 bg-white text-green-700 hover:bg-gray-100 rounded-lg font-bold transition-colors'>
              Register
            </Link>
            <Link to={'/login'} className='px-8 py-3 border-2 border-white text-white hover:bg-white/10 rounded-lg font-bold transition-colors'>
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white px-6 py-12'>
        <div className='max-w-6xl mx-auto text-center'>
          <p className='mb-2'>&copy; 2024 Department of Agriculture. All rights reserved.</p>
          <p className='text-gray-400 text-sm'>
            Supporting agriculture and connecting communities across Northern Mindanao
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AboutPage