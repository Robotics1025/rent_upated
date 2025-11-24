export default function Stats() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="text-white">
            <div className="text-5xl font-bold mb-2">10K+</div>
            <div className="text-blue-100 text-lg">Property Managers</div>
          </div>
          <div className="text-white">
            <div className="text-5xl font-bold mb-2">50K+</div>
            <div className="text-blue-100 text-lg">Properties Managed</div>
          </div>
          <div className="text-white">
            <div className="text-5xl font-bold mb-2">$2B+</div>
            <div className="text-blue-100 text-lg">Rent Collected</div>
          </div>
          <div className="text-white">
            <div className="text-5xl font-bold mb-2">99.8%</div>
            <div className="text-blue-100 text-lg">Uptime Guarantee</div>
          </div>
        </div>
      </div>
    </section>
  );
}
