import { useState } from "react";
import "./FAQ.css";

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      question: "How do I upload code files?",
      answer:
        "Click the 'Upload' button on the home page and select your code files. The analyzer supports multiple programming languages including Python, JavaScript, C, and C++.",
    },
    {
      question: "What file formats are supported?",
      answer:
        "We support .py (Python), .js (JavaScript), .c (C), .cpp (C++), and many other common programming languages. You can upload single files or multiple files at once.",
    },
    {
      question: "How does the code visualization work?",
      answer:
        "Our platform provides visual representations of your code structure including control flow diagrams, variable tracking, and function call hierarchies. This helps you understand complex logic step by step.",
    },
    {
      question: "Can I save my analysis?",
      answer:
        "Yes! Once you're logged in, all your analyses are automatically saved to your dashboard. You can access, view, and compare previous analyses anytime.",
    },
    {
      question: "What does the ChatBot feature do?",
      answer:
        "The ChatBot can answer questions about your code, explain specific functions, suggest improvements, and help you understand complex logic through an interactive conversation.",
    },
    {
      question: "Is my code stored securely?",
      answer:
        "Your code and analysis data are securely stored on our servers with encryption. Only you have access to your uploaded files and analysis results.",
    },
  ];

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${expandedIndex === index ? "expanded" : ""}`}
            >
              <div className="faq-question" onClick={() => toggleExpand(index)}>
                <div className="faq-text">
                  <h3>{faq.question}</h3>
                </div>
                <div
                  className={`faq-icon ${expandedIndex === index ? "rotated" : ""}`}
                >
                  +
                </div>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
