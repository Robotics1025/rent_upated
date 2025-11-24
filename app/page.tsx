import Image from "next/image";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Stats from "./components/Stats";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <Testimonials />
      <Pricing />
      
      {/* Image Gallery Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Manage Properties with Confidence
            </h2>
            <p className="text-lg text-gray-600">
              Modern tools for modern property management
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format"
                alt="Residential properties"
                className="w-full h-64 object-cover transition group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold">Residential Properties</h3>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <img 
                src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop&auto=format"
                alt="Commercial spaces"
                className="w-full h-64 object-cover transition group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold">Commercial Spaces</h3>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <img 
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&auto=format"
                alt="Apartment complexes"
                className="w-full h-64 object-cover transition group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold">Apartment Complexes</h3>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your property management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-block mb-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Account</h3>
              <p className="text-gray-600">
                Sign up in seconds. No credit card required for the 30-day trial.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-block mb-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Add Properties & Tenants</h3>
              <p className="text-gray-600">
                Import your data or add manually. Invite tenants to their portal.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-block mb-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Managing</h3>
              <p className="text-gray-600">
                Automate rent collection and manage everything from your dashboard.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Start Your Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Property Management?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of property managers who trust RentManager Pro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition font-semibold">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
