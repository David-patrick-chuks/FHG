'use client';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle."
  },
  {
    question: "What happens to my data when I upgrade?",
    answer: "All your data, bots, and campaigns are preserved when you upgrade. You'll immediately get access to the new plan's features and limits."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! You can start with our FREE plan and upgrade when you're ready. No credit card required to get started."
  }
];

export function PricingFAQ() {
  return (
    <div className="relative mt-20">
      <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
        Frequently Asked Questions
      </h3>
      <div className="grid md:grid-cols-2 gap-8">
        {faqData.map((faq, index) => (
          <div key={index} className="group relative">
            <div className="absolute inset-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/50 shadow-sm group-hover:shadow-md transition-all duration-300"></div>
            <div className="relative p-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                {faq.question}
              </h4>
              <p className="text-slate-600 dark:text-slate-300">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
