import { useState } from "react";
import "./BookLiveDemo.css";
import Button from "../Shared/Button";

export default function BookLiveDemo() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.preferredDate) {
      setError("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // TODO: Send form data to backend
    console.log("Form submitted:", formData);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        fullName: "",
        email: "",
        company: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="book-demo-container">
      <div className="book-demo-card">
        <div className="book-demo-header">
          <h2>
            <span>Book Your</span> Live Demo
          </h2>
          <p>
            Schedule a personalized walkthrough with our team. Get hands-on
            experience with our code analysis platform.
          </p>
        </div>

        {submitted ? (
          <div className="success-message">
            <h3>Thank You!</h3>
            <p>We'll contact you soon to confirm your demo session.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="book-demo-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company (Optional)</label>
              <input
                type="text"
                id="company"
                name="company"
                placeholder="Your company name"
                value={formData.company}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferredDate">Preferred Date *</label>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="preferredTime">Preferred Time</label>
                <input
                  type="time"
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message (Optional)</label>
              <textarea
                id="message"
                name="message"
                placeholder="Tell us about your project or any specific features you'd like to see..."
                value={formData.message}
                onChange={handleChange}
                className="form-textarea"
                rows="4"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Book Demo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
