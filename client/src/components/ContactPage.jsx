import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    _gotcha: '',
  });

  const [feedback, setFeedback] = useState({
    status: null, // 'loading' | 'success' | 'error' | null
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFeedback({
      status: 'loading',
      message: 'Sending your message...',
    });

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('message', formData.message);
      data.append('_gotcha', formData._gotcha);

      const response = await fetch('https://getform.io/f/bjjmgodb', {
        method: 'POST',
        body: data,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        setFeedback({
          status: 'success',
          message: 'We have received your query. We will contact you soon.',
        });
        setFormData({
          name: '',
          email: '',
          message: '',
          _gotcha: '',
        });

        // Hide message after 8 seconds
        setTimeout(() => {
          setFeedback({ status: null, message: '' });
        }, 8000);
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFeedback({
        status: 'error',
        message: 'There was a problem sending your query. Please try again later.',
      });
    }
  };

  return (
    <div className="page active" id="contact">
      <h1 className="section-title">Contact Us</h1>

      <div className="contact-grid">
        <div className="analyze-form">
          <h3 className="form-title">Send Us a Message</h3>
          <p className="form-subtitle">
            Fill out the form below and we'll get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder="Enter your message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Hidden honeypot input to prevent spam */}
            <input
              type="hidden"
              name="_gotcha"
              value={formData._gotcha}
              onChange={handleChange}
              style={{ display: 'none !important' }}
            />

            <button type="submit" className="btn btn-purple">
              Send Message
            </button>

            {feedback.status && (
              <div id="form-feedback" className={`form-feedback ${feedback.status}`}>
                {feedback.status === 'loading' && (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> {feedback.message}
                  </>
                )}
                {feedback.status === 'success' && (
                  <>
                    <i className="fas fa-check-circle"></i> {feedback.message}
                  </>
                )}
                {feedback.status === 'error' && (
                  <>
                    <i className="fas fa-exclamation-circle"></i> {feedback.message}
                  </>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="contact-info">
          <h3 className="contact-info-title">Contact Information</h3>
          <p>Here's how you can reach us directly.</p>

          <div className="contact-detail">
            <h4>Address</h4>
            <p>123 Tech Boulevard</p>
            <p>Innovation District</p>
            <p>San Francisco, CA 94107</p>
          </div>

          <div className="contact-detail">
            <h4>Email</h4>
            <p>contact@neuraglance.ai</p>
          </div>

          <div className="contact-detail">
            <h4>Phone</h4>
            <p>+1 (555) 123-4567</p>
          </div>

          <div className="contact-detail">
            <h4>Hours</h4>
            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p>Saturday - Sunday: Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

