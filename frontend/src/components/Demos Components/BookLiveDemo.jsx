import { useState, useEffect } from "react";
import "./BookLiveDemo.css";
import Button from "../Shared/Button";

export default function BookLiveDemo() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    selectedSlot: null,
    message: "",
  });

  const [demoSlots, setDemoSlots] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch available slots on component mount
  useEffect(() => {
    fetchSlots();
  }, []);

  // Fetch user bookings when email changes
  useEffect(() => {
    if (formData.email) {
      fetchUserBookings(formData.email);
    }
  }, [formData.email]);

  const fetchSlots = async () => {
    try {
      const response = await fetch("http://localhost:8000/bookings/slots");
      if (response.ok) {
        const slots = await response.json();
        setDemoSlots(slots);
      } else {
        console.error("Failed to fetch slots");
        // Fallback to static slots if API fails
        setDemoSlots([
          { id: 1, date: "2026-04-05", time: "10:00 AM", available: false },
          { id: 2, date: "2026-04-05", time: "11:00 AM", available: true },
          { id: 3, date: "2026-04-05", time: "02:00 PM", available: false },
          { id: 4, date: "2026-04-05", time: "03:00 PM", available: true },
          { id: 5, date: "2026-04-06", time: "10:00 AM", available: true },
          { id: 6, date: "2026-04-06", time: "11:00 AM", available: false },
          { id: 7, date: "2026-04-06", time: "02:00 PM", available: true },
          { id: 8, date: "2026-04-06", time: "03:00 PM", available: true },
          { id: 9, date: "2026-04-07", time: "10:00 AM", available: false },
          { id: 10, date: "2026-04-07", time: "11:00 AM", available: true },
          { id: 11, date: "2026-04-07", time: "02:00 PM", available: true },
          { id: 12, date: "2026-04-07", time: "03:00 PM", available: false },
        ]);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      // Fallback to static slots
      setDemoSlots([
        { id: 1, date: "2026-04-05", time: "10:00 AM", available: false },
        { id: 2, date: "2026-04-05", time: "11:00 AM", available: true },
        { id: 3, date: "2026-04-05", time: "02:00 PM", available: false },
        { id: 4, date: "2026-04-05", time: "03:00 PM", available: true },
        { id: 5, date: "2026-04-06", time: "10:00 AM", available: true },
        { id: 6, date: "2026-04-06", time: "11:00 AM", available: false },
        { id: 7, date: "2026-04-06", time: "02:00 PM", available: true },
        { id: 8, date: "2026-04-06", time: "03:00 PM", available: true },
        { id: 9, date: "2026-04-07", time: "10:00 AM", available: false },
        { id: 10, date: "2026-04-07", time: "11:00 AM", available: true },
        { id: 11, date: "2026-04-07", time: "02:00 PM", available: true },
        { id: 12, date: "2026-04-07", time: "03:00 PM", available: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async (email) => {
    try {
      const response = await fetch(
        `http://localhost:8000/bookings/user/${email}`,
      );
      if (response.ok) {
        const bookings = await response.json();
        setUserBookings(bookings);
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSlotSelect = (slot) => {
    if (slot.available) {
      setFormData((prev) => ({
        ...prev,
        selectedSlot: slot,
      }));
      setError("");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.selectedSlot) {
      setError("Please fill in all required fields and select a demo slot");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const bookingData = {
        full_name: formData.fullName,
        email: formData.email,
        company: formData.company,
        slot_id: formData.selectedSlot.id,
        slot_date: formData.selectedSlot.date,
        slot_time: formData.selectedSlot.time,
        message: formData.message,
      };

      const response = await fetch("http://localhost:8000/bookings/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const booking = await response.json();
        setSubmitted(true);

        // Refresh slots and user bookings
        fetchSlots();
        fetchUserBookings(formData.email);

        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            fullName: "",
            email: "",
            company: "",
            selectedSlot: null,
            message: "",
          });
          setSubmitted(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to book demo");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      setError("Failed to book demo. Please try again.");
    }
  };

  // Group slots by date
  const groupedSlots = demoSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

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

            <div className="slots-section">
              <label className="slots-label">Preferred Date & Time *</label>
              {loading ? (
                <div className="loading-slots">Loading available slots...</div>
              ) : (
                <div className="slots-grid">
                  {Object.entries(groupedSlots).map(([date, slots]) => (
                    <div key={date} className="date-group">
                      <h4 className="date-header">{formatDate(date)}</h4>
                      <div className="time-slots">
                        {slots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            className={`time-slot ${
                              slot.available ? "available" : "booked"
                            } ${
                              formData.selectedSlot?.id === slot.id
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => handleSlotSelect(slot)}
                            disabled={!slot.available}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {formData.selectedSlot && (
                <div className="selected-slot-info">
                  <p>
                    Selected: {formatDate(formData.selectedSlot.date)} at{" "}
                    {formData.selectedSlot.time}
                  </p>
                </div>
              )}
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

        {/* User Bookings Section */}
        {userBookings.length > 0 && (
          <div className="user-bookings-section">
            <h3>Your Bookings</h3>
            <div className="bookings-list">
              {userBookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-info">
                    <strong>
                      {formatDate(booking.slot_date)} at {booking.slot_time}
                    </strong>
                    <p>
                      Status:{" "}
                      <span className={`status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </p>
                    {booking.message && <p>Message: {booking.message}</p>}
                  </div>
                  {booking.status === "confirmed" && (
                    <button
                      className="cancel-btn"
                      onClick={async () => {
                        try {
                          await fetch(
                            `http://localhost:8000/bookings/${booking.id}`,
                            {
                              method: "DELETE",
                            },
                          );
                          fetchSlots();
                          fetchUserBookings(formData.email);
                        } catch (error) {
                          console.error("Error cancelling booking:", error);
                        }
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
