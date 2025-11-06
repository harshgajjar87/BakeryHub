import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "What are your delivery hours?",
      answer: "We deliver from Monday to Friday between 8AM to 8PM, and on weekends from 9AM to 6PM. Same-day delivery is available if you place your order before 12PM."
    },
    {
      question: "Do you deliver outside Ahmedabad?",
      answer: "Currently, we only deliver within Ahmedabad. However, we are working on expanding our delivery services to other cities soon."
    },
    {
      question: "How far in advance should I place my order?",
      answer: "For standard cakes, we recommend placing your order at least 24 hours in advance. For custom cakes or large orders, please place your order 3-5 days in advance."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept online payments through Razorpay, including credit/debit cards, UPI, and net banking. We also accept cash on delivery for orders within Ahmedabad."
    },
    {
      question: "Can I customize my cake?",
      answer: "Yes! We offer customization options for cakes. You can discuss your requirements through our chat feature after placing your order. Additional charges may apply for customizations."
    },
    {
      question: "Do you offer eggless options?",
      answer: "Yes, we offer eggless options for all our cakes. Please specify your preference when placing your order."
    },
    {
      question: "How do I store my cake?",
      answer: "All our cakes should be refrigerated. Cream cakes can be stored for 2-3 days, while fondant cakes can last up to 5 days when properly refrigerated."
    },
    {
      question: "What is your refund policy?",
      answer: "We offer refunds or replacements only if there's an issue with the quality of our product. Please contact us within 24 hours of delivery if you have any concerns."
    },
    {
      question: "Do you offer baking courses?",
      answer: "Yes, we offer professional baking courses for all skill levels. You can browse and enroll in our courses through the Courses section on our website."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is confirmed, you can track its status through your account dashboard. You'll also receive notifications at each stage of your order."
    }
  ];

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="text-center mb-4 bakery-text-brown">Frequently Asked Questions</h1>
          <p className="text-center mb-5">Find answers to common questions about our products and services.</p>

          <div className="accordion" id="faqAccordion">
            {faqData.map((item, index) => (
              <div className="accordion-item mb-3 border-0 shadow-sm" key={index}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className={`accordion-button ${activeIndex === index ? '' : 'collapsed'}`}
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    style={{ backgroundColor: activeIndex === index ? '#f8f9fa' : '#fff' }}
                  >
                    {item.question}
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className={`accordion-collapse collapse ${activeIndex === index ? 'show' : ''}`}
                  aria-labelledby={`heading${index}`}
                >
                  <div className="accordion-body">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <h4 className="bakery-text-brown mb-3">Still have questions?</h4>
            <p className="mb-4">Can't find the answer you're looking for? Our customer support team is here to help.</p>
            <a href="/contact" className="btn bakery-btn-primary">Contact Us</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
