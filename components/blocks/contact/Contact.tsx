/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import "./contact-cta.css";
import emailjs from '@emailjs/browser';
import AuditCalendarPage from "./BookingContact";

export default function ContactCTA({one_booking_a_day}: {one_booking_a_day: boolean}) {
  const form = useRef<any>(null);
    const [emailSent, setEmailSent] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  console.log(selectedDate, selectedTime)

  const sendEmail = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true)
  
  try {
    // 1️⃣ Send email
    // const result = await emailjs.sendForm(
    //   "service_7zdxvd1",
    //   "template_yqye2qm",
    //   form.current!,
    //   "Irih0kFMOFDhpXxXI"
    // );

    // console.log("Email sent:", result.text);

    await fetch("/api/google/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: form.current.business_name.value,
        email: form.current.user_email.value,
        date: selectedDate,
        startTime: selectedTime?.split("-")[0],
        endTime: selectedTime?.split("-")[1],
      }),
    });
    console.log("Calendar event created");
    // 3️⃣ UI cleanup
    setEmailSent(true);
    setHasError(false);
    form.current.reset();
    setLoading(false)
    setTimeout(() => {
      window.location.reload();
    }, 5000);

  } catch (error) {
    console.error("Error:", error);
    setEmailSent(false);
    setHasError(true);
  }
  };
  
  console.log(one_booking_a_day)

  return (
    <section id="contact" className="contact-cta">
      <div className="contact-cta__container">
        {/* Heading */}
        <h2 className="contact-cta__title">
          Ready to Amplify Your <br /> Growth?
        </h2>

        <p className="contact-cta__subtitle">
          Let&apos;s discuss how we can help you achieve your digital goals.
        </p>

        {/* Form Card */}
        <div className="contact-card">
          <form
            ref={form}
            onSubmit={sendEmail}
            className="contact-form">
            <div className="form-group">
              <label>Business Name</label>
              <input
                required
                name="business_name"
                id="business_name"
                type="text"
                placeholder="Your company name"
                defaultValue={emailSent ? "" : ""}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="user_email"
                required
                id="user_email"
                type="email"
                placeholder="you@company.com"
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                required
                id="message"
                placeholder="Tell us about your project..."
                rows={4}
              />
            </div>
            <input type="hidden" name="audit_date" value={selectedDate} />
            <input type="hidden" name="audit_time" value={selectedTime || ""} />
            <AuditCalendarPage
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
              emailSent={emailSent}
              selectedDate={selectedDate}
              one_booking_a_day={one_booking_a_day}
            />

            <button type="submit" className="submit-btn">
              {loading ? "Loading..." : emailSent ? "Email has been sent to the admin and to your email address!" : "Book Now"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
