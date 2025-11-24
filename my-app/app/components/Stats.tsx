export default function Stats() {
  return (
    <section className="py-16 px-4 bg-blue-600">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="text-white">
            <div className="text-4xl font-bold mb-2">10K+</div>
            <div className="text-blue-100">Property Managers</div>
          </div>
          <div className="text-white">
            <div className="text-4xl font-bold mb-2">50K+</div>
            <div className="text-blue-100">Properties Managed</div>
          </div>
          <div className="text-white">
            <div className="text-4xl font-bold mb-2">$2B+</div>
            <div className="text-blue-100">Rent Collected</div>
          </div>
          <div className="text-white">
            <div className="text-4xl font-bold mb-2">99.8%</div>
            <div className="text-blue-100">Uptime Guarantee</div>
          </div>
        </div>
      </div>
    </section>
  );
}
