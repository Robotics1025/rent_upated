import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-32 px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://media.istockphoto.com/id/542713258/photo/modern-apartment-houses.jpg?s=1024x1024&w=is&k=20&c=FQ5e6fG4GP0GNOHJ86hNIVLOMZ5lDYCuh5Qa0GXe-p4="
          alt="Modern property building"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-6 px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-sm font-medium">
              Your Trusted Property Management Platform ✨
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Simplify Property Management & Booking
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Complete solution for property managers and tenants. Manage properties, collect rent, 
              track payments, and book units seamlessly - all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/contact" className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold shadow-lg hover:shadow-xl text-center">
                Get Started →
              </Link>
              <Link href="/#properties" className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg hover:bg-white/20 transition font-semibold text-center">
                Browse Properties
              </Link>
            </div>
            <div className="flex items-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Free Trial Available</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Easy Setup</span>
              </div>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            {/* Featured Property Image */}
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1692455151728-85b49a956d45?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Featured property"
                className="w-full h-96 object-cover rounded-xl"
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm opacity-80">Featured Property</p>
                  <p className="font-semibold text-lg">Modern 3BR Apartment</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
