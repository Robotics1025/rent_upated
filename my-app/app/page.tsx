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
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
              📋 HOW IT WORKS
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your property management experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300"></div>
            
            <div className="relative text-center group">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Account</h3>
              <p className="text-gray-600 leading-relaxed">
                Sign up in seconds with your email. No credit card required for the 30-day trial period.
              </p>
            </div>
            
            <div className="relative text-center group">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-lg">🏢</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Add Properties & Tenants</h3>
              <p className="text-gray-600 leading-relaxed">
                Import your property data or add them manually. Invite tenants to join their portal.
              </p>
            </div>
            
            <div className="relative text-center group">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-lg">🚀</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Managing</h3>
              <p className="text-gray-600 leading-relaxed">
                Automate rent collection, track payments, and manage everything from your dashboard.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <button className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-xl text-lg font-semibold transform hover:scale-105">
              Start Your Free Trial Now
            </button>
            <p className="mt-4 text-gray-600">
              Join 10,000+ property managers already using RentManager Pro
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Property Management?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10">
            Join thousands of property managers who trust RentManager Pro to streamline their operations and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition shadow-2xl text-lg font-bold transform hover:scale-105">
              Start Free 30-Day Trial
            </button>
            <button className="px-10 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition text-lg font-bold transform hover:scale-105">
              Schedule a Demo
            </button>
          </div>
          <p className="mt-6 text-blue-100">
            ✓ No credit card required  ✓ Cancel anytime  ✓ Full access to all features
          </p>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
