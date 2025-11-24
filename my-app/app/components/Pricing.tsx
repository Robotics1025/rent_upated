export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "29",
      period: "month",
      description: "Perfect for small landlords",
      features: [
        "Up to 10 properties",
        "Unlimited tenants",
        "Basic reporting",
        "Tenant portal",
        "Mobile app access",
        "Email support"
      ],
      highlighted: false,
      buttonText: "Start Free Trial"
    },
    {
      name: "Professional",
      price: "79",
      period: "month",
      description: "For growing property managers",
      features: [
        "Up to 50 properties",
        "Unlimited tenants",
        "Advanced analytics",
        "Automated rent collection",
        "Maintenance tracking",
        "Document management",
        "Priority support",
        "Custom branding"
      ],
      highlighted: true,
      buttonText: "Start Free Trial",
      badge: "MOST POPULAR"
    },
    {
      name: "Enterprise",
      price: "199",
      period: "month",
      description: "For large-scale operations",
      features: [
        "Unlimited properties",
        "Unlimited tenants",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced security",
        "Custom workflows",
        "24/7 phone support",
        "Training & onboarding",
        "API access"
      ],
      highlighted: false,
      buttonText: "Contact Sales"
    }
  ];

  return (
    <section id="pricing" className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
            💰 PRICING PLANS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Flexible pricing that grows with your business. All plans include 30-day free trial.
          </p>
          <div className="inline-flex items-center gap-3 bg-gray-100 p-1 rounded-lg">
            <button className="px-6 py-2 bg-white rounded-lg shadow-sm font-semibold text-gray-900">
              Monthly
            </button>
            <button className="px-6 py-2 text-gray-600 font-semibold">
              Yearly <span className="text-green-600 text-sm">(Save 20%)</span>
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl scale-105 border-4 border-blue-400' 
                  : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl'
              } transition-all duration-300`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={`ml-2 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    /{plan.period}
                  </span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg 
                      className={`w-6 h-6 mr-3 flex-shrink-0 ${plan.highlighted ? 'text-blue-200' : 'text-green-500'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.highlighted ? 'text-blue-50' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                  plan.highlighted 
                    ? 'bg-white text-blue-600 hover:bg-gray-100 shadow-lg' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All plans include 30-day money-back guarantee • No credit card required for trial
          </p>
          <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
            Compare all features →
          </a>
        </div>
      </div>
    </section>
  );
}
