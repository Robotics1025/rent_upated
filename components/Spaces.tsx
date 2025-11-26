export default function Spaces() {
  const spaces = [
    {
      title: "Studio Apartments",
      description: "Perfect for individuals or couples. Compact, efficient, and modern living spaces.",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=500&fit=crop&auto=format&q=80",
      category: "Studio"
    },
    {
      title: "1-2 Bedroom Units",
      description: "Ideal for small families. Comfortable spaces with modern amenities and great locations.",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=500&fit=crop&auto=format&q=80",
      category: "Apartments"
    },
    {
      title: "3+ Bedroom Homes",
      description: "Spacious family homes with multiple bedrooms, perfect for growing families.",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=500&fit=crop&auto=format&q=80",
      category: "Houses"
    },
    {
      title: "Commercial Spaces",
      description: "Office spaces and commercial properties for businesses of all sizes.",
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=500&fit=crop&auto=format&q=80",
      category: "Commercial"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-emerald-600 font-semibold mb-2 text-sm uppercase tracking-wider">Available Properties</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Space
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaces.map((space, index) => (
            <div 
              key={index}
              className="group"
            >
              <div className="relative h-96 rounded-2xl overflow-hidden mb-4 shadow-md hover:shadow-xl transition">
                <img 
                  src={space.image}
                  alt={space.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{space.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{space.description}</p>
              <button className="text-emerald-600 font-medium text-sm hover:text-emerald-700 inline-flex items-center gap-1 group/btn">
                Learn More
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
