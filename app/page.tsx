import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Spaces from "../components/Spaces";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Spaces />
      
      {/* About Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&h=800&fit=crop&auto=format&q=80"
                alt="Property management excellence"
                className="rounded-3xl shadow-2xl w-full object-cover"
              />
              <div className="absolute -bottom-8 -right-8 bg-emerald-600 text-white px-8 py-6 rounded-2xl shadow-2xl max-w-xs">
                <p className="text-5xl font-bold mb-1">7+</p>
                <p className="text-sm font-medium">Years of Trusted Rental Management Excellence</p>
              </div>
            </div>
            
            <div>
              <p className="text-emerald-600 font-semibold mb-2 text-sm uppercase tracking-wider">About Us</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Over 7 Years of Trusted Rental Management Excellence
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                At EazyRent, we bring over 7 years of experience in simplifying property management 
                for both tenants and property managers. Our platform streamlines the entire rental process, 
                from property listings to secure payments, making it effortless for everyone.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                From finding your perfect rental to managing your property portfolio, we provide the tools 
                and support you need. Let us help you experience hassle-free rent management today.
              </p>
              <Link href="/#properties" className="px-8 py-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold shadow-lg hover:shadow-xl inline-flex items-center gap-2">
                Browse Properties
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
      
      {/* Property Categories - 6 Grid Layout */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-600 font-semibold mb-2 text-sm uppercase tracking-wider">Categories</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Property Categories
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                title: "Apartments",
                image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=400&fit=crop&auto=format&q=80"
              },
              { 
                title: "Houses",
                image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=400&fit=crop&auto=format&q=80"
              },
              { 
                title: "Condos",
                image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=400&fit=crop&auto=format&q=80"
              },
              { 
                title: "Studios",
                image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=400&fit=crop&auto=format&q=80"
              },
              { 
                title: "Townhouses",
                image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&h=400&fit=crop&auto=format&q=80"
              },
              { 
                title: "Commercial",
                image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&h=400&fit=crop&auto=format&q=80"
              }
            ].map((category, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl h-72 shadow-md hover:shadow-xl transition cursor-pointer">
                <img 
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-2xl font-bold">{category.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-linear-to-br from-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect Rental<br />Today
          </h2>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
            Ready to find your next home or list your property? Join thousands of satisfied tenants 
            and property managers who trust EazyRent for seamless rental management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/#properties" className="px-8 py-4 bg-white text-emerald-600 rounded-xl hover:bg-gray-50 transition font-bold shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-2">
              Browse Properties
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-emerald-600 transition font-semibold">
              List Your Property
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-white">
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-1">850+</p>
              <p className="text-white/80 text-sm">Active Properties</p>
            </div>
            <div className="hidden sm:block w-px h-16 bg-white/30"></div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-1">1200+</p>
              <p className="text-white/80 text-sm">Happy Tenants</p>
            </div>
            <div className="hidden sm:block w-px h-16 bg-white/30"></div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-1">7+</p>
              <p className="text-white/80 text-sm">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
