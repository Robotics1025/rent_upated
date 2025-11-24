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
    <section id="pricing" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Flexible pricing that grows with your business. All plans include 30-day free trial.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-lg p-6 ${
                plan.highlighted 
                  ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-600' 
                  : 'bg-white border-2 border-gray-200 hover:border-blue-300'
              } transition`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={`ml-2 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    /{plan.period}
                  </span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <svg 
                      className={`w-5 h-5 mr-2 shrink-0 ${plan.highlighted ? 'text-blue-200' : 'text-green-500'}`} 
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
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.highlighted 
                    ? 'bg-white text-blue-600 hover:bg-gray-100' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            All plans include 30-day money-back guarantee • No credit card required for trial
          </p>
        </div>
      </div>
    </section>
  );
}
