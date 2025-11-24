export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Property Manager",
      company: "Urban Estates LLC",
      image: "SJ",
      content: "RentManager Pro has transformed how we manage our 50+ properties. The automated rent collection feature alone has saved us countless hours. Highly recommended!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Real Estate Investor",
      company: "Chen Properties",
      image: "MC",
      content: "The financial reporting features are incredible. I can track all my properties' performance in real-time. Best investment I've made for my rental business.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Landlord",
      company: "Rodriguez Rentals",
      image: "ER",
      content: "As a small landlord with 10 units, this platform is perfect. The tenant portal has reduced my workload significantly. Tenants love the convenience!",
      rating: 5
    },
    {
      name: "David Thompson",
      role: "Portfolio Manager",
      company: "Prime Living Properties",
      image: "DT",
      content: "We manage over 200 units and RentManager Pro scales perfectly. The maintenance tracking and vendor management features are game-changers.",
      rating: 5
    },
    {
      name: "Lisa Anderson",
      role: "Property Owner",
      company: "Anderson Apartments",
      image: "LA",
      content: "The customer support is amazing and the platform is so intuitive. I was up and running in less than a day. My tenants appreciate the modern approach.",
      rating: 5
    },
    {
      name: "James Wilson",
      role: "Commercial Property Manager",
      company: "Wilson Commercial RE",
      image: "JW",
      content: "Perfect for both residential and commercial properties. The document management and lease tracking features have streamlined our entire operation.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-24 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            ⭐ CUSTOMER REVIEWS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by Property Managers Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied customers who have streamlined their property management
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-xs text-gray-500">{testimonial.company}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-gray-700 leading-relaxed italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xl font-bold">4.9/5</span>
            <span className="text-lg">based on 2,547 reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
