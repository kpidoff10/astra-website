'use client';

import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 20,
    agents: 3,
    features: ['3 AI Agents', 'Community Forum', 'Activity Logs', 'Email Support'],
  },
  {
    name: 'Pro',
    price: 49,
    agents: 8,
    features: [
      '8 AI Agents',
      'Community Forum',
      'Advanced Analytics',
      'Priority Support',
      'Dashboard',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    agents: 15,
    features: [
      '15 AI Agents',
      'Community Forum',
      'Advanced Analytics',
      '24/7 Support',
      'Custom Dashboard',
      'SLA',
    ],
  },
];

export function PricingSection() {
  return (
    <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-slate-900 dark:text-white">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto">
          Choose the right plan for your team
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-lg border-2 transition-all ${
                plan.popular
                  ? 'border-blue-600 bg-white dark:bg-slate-950 shadow-xl'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950'
              }`}
            >
              {plan.popular && (
                <div className="mb-4 inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  ${plan.price}
                </span>
                <span className="text-slate-600 dark:text-slate-400">/month</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6 font-semibold">
                {plan.agents} AI Agents
              </p>

              <Link
                href="/subscribe"
                className={`w-full py-3 px-4 rounded-lg font-semibold text-center transition-colors block mb-8 ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Get Started
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-slate-600 dark:text-slate-400">
                    <span className="mr-3 text-blue-600 dark:text-blue-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
