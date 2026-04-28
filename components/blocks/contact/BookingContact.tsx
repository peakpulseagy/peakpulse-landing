/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import "./calendar.css";
import { set } from "sanity";
import { SLOT_DATA } from "./slots";
import {motion} from "motion/react"


interface Props {
  onDateSelect: (value: string) => void;
  onTimeSelect: (value: string) => void;
  emailSent: boolean;
  selectedDate: string;
  one_booking_a_day: boolean
}

export default function AuditCalendarPage({
  onDateSelect,
  onTimeSelect,
  emailSent,
  selectedDate,
  one_booking_a_day
}: Props) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [bookedDays, setBookedDays] = useState<Set<string>>(new Set());

  //  Always derived from currentMonth + currentYear
  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    { month: "long" }
  );

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // array of days with leading nulls for alignment

  const daysArray = Array.from(
    { length: firstDayIndex + daysInMonth },
    (_, i) => (i < firstDayIndex ? null : i - firstDayIndex + 1)
  );

  // month navigation

  const goPrevMonth = () => {
    setSelectedDay(null);
    setSelectedTime(null);
    onDateSelect("");
    onTimeSelect("");

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  // next month handler

  const goNextMonth = () => {
    setSelectedDay(null);
    setSelectedTime(null);
    onDateSelect("");
    onTimeSelect("");

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // date handler
    const handleDateSelect = (day: number) => {
      setSelectedDay(day);
      setSelectedTime(null);

      const month = String(currentMonth + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");

      const dateString = `${currentYear}-${month}-${dayStr}`;

      onDateSelect(dateString);
      onTimeSelect("");
  };
  
  // time handler
  const handleTimeSelect = (slot: { start: string; end: string }) => {
    setSelectedTime(slot);
    onTimeSelect(`${slot.start}-${slot.end}`);
  };

  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [daySlot, setDaySlot] = useState<any>(null);

  // fetch booked slots when selectedDay changes

  // month availability fetch
  useEffect(() => {
    if (!selectedDay) return;

    fetch("/api/google/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: currentYear,
        month: currentMonth,
        day: selectedDay,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setBookedSlots(Array.isArray(data.bookings) ? data.bookings : []);
        setDaySlot(data.dayData);
      })
      .catch(() => setBookedSlots([]));
  }, [currentMonth, currentYear, selectedDay]);

  useEffect(() => {
  fetch("/api/google/availability/month", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      year: currentYear,
      month: currentMonth,
    }),
  })
    .then(res => res.json())
    .then(data => {
      const set = new Set<string>();

      (data.bookings || []).forEach((b: any) => {
        if (!b.start) return;
        const date = b.start.split("T")[0]; // YYYY-MM-DD
        set.add(date);
      });

      setBookedDays(set);
    })
    .catch(() => setBookedDays(new Set()));
}, [currentYear, currentMonth]);


  // slot handler

  const buildSlotDates = (slot: { start: string; end: string }) => {
    const baseDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
      selectedDay
    ).padStart(2, "0")}`;

    const slotStart = new Date(`${baseDate}T${slot.start}:00`);
    const slotEnd = new Date(`${baseDate}T${slot.end}:00`);

    // 🔥 Overnight slot (end is next day)
    if (slotEnd <= slotStart) {
      slotEnd.setDate(slotEnd.getDate() + 1);
    }

    return { slotStart, slotEnd };
  };
  
  const isSlotBooked = (slot: { start: string; end: string }) => {
    if (!Array.isArray(bookedSlots) || !selectedDay) return false;

    const { slotStart, slotEnd } = buildSlotDates(slot);

    return bookedSlots.some(b => {
      if (!b?.start || !b?.end) return false;

      const bookedStart = new Date(b.start);
      const bookedEnd = new Date(b.end);

      return (
        bookedStart.getTime() === slotStart.getTime() &&
        bookedEnd.getTime() === slotEnd.getTime()
      );
    });
  };


  // day handler

  const isDayFullyBooked = () => {
    if (!selectedDate) return false;

    return SLOT_DATA.every(slot => isSlotBooked(slot));
  };

  // const isToday =
  //   selectedDay === today.getDate() &&
  //   currentMonth === today.getMonth() &&
  //   currentYear === today.getFullYear();
  
  // const shouldDisableDay = isToday && isDayFullyBooked();
  // console.log(shouldDisableDay)

  // const isCalendarDayFullyBooked = (day: number) => {
  //   const today = new Date();

  //   const isThatDayToday =
  //     day === today.getDate() &&
  //     currentMonth === today.getMonth() &&
  //     currentYear === today.getFullYear();

  //   return isThatDayToday && isDayFullyBooked();
  // };

  // Disable past dates (if today is 5, then 1,2,3,4 are disabled)
  const isPastDay = (day: number) => {
    const today = new Date();

    // If viewing a past month/year, all days are past
    if (currentYear < today.getFullYear()) return true;
    if (currentYear === today.getFullYear() && currentMonth < today.getMonth()) return true;

    // If viewing current month/year, check if day is before today
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
      return day < today.getDate();
    }

    return false;
  };

  const isSlotInPast = (slot: { start: string; end: string }) => {
    if (!selectedDay) return false;

    const now = new Date();
    const { slotEnd } = buildSlotDates(slot);

    return now >= slotEnd;
  };

  const isDayBooked = (day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookedDays.has(dateKey);
  };

  return (
    <div className="Booking_Wrapper">
      <header className="book-header">{one_booking_a_day ? "Only One Booking Per Day Allowed" : "Executive Call Availability"}</header>

      <div className="layout">
        {/* Calendar */}
        <motion.div
          initial={{y: 40, opacity: 0}}
          whileInView={{y: 0, opacity: 1}}
          transition={{duration: 0.7, delay: 1}}
          viewport={{once: true}}
          className="calendar">
          <div className="calendar-header">
            <button type="button" onClick={goPrevMonth}>
              &lt;
            </button>
            <h2>
              {monthName} {currentYear}
            </h2>
            <button type="button" onClick={goNextMonth}>
              &gt;
            </button>
          </div>

          <div className="weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="grid">
            {daysArray.map((day, index) => (
              <div key={index}>
                {day && (
                  <button
                    disabled={
                      isPastDay(day) ||
                      (one_booking_a_day && isDayBooked(day))
                    }
                    type="button"
                    className={`day
                      ${isPastDay(day) || (one_booking_a_day && isDayBooked(day)) ? "fully-booked-day" : ""}
                      ${selectedDay === day ? "active" : ""}
                    `}
                    onClick={() => handleDateSelect(day)}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Slots */}
        <motion.div
          initial={{y: 40, opacity: 0}}
          whileInView={{y: 0, opacity: 1}}
          transition={{duration: 0.7, delay: 1.5}}
          viewport={{once: true}}
          className="details">
          {selectedDay ? (
            <>
              <h3>
                {one_booking_a_day && isDayBooked(selectedDay!)
                  ? "Only One Booking Per Day Allowed"
                  : SLOT_DATA.length > 1
                    ? "Pick a Time Slot"
                    : "Available Slot"}
              </h3>
              <p>
                {monthName} {selectedDay}, {currentYear}
              </p>

              <div className="slots">
                {SLOT_DATA.map((slot) => (
                  <button
                  key={slot.label}
                  type="button"
                  disabled={isSlotBooked(slot) || isDayFullyBooked() || isSlotInPast(slot)}
                  className={`slot
                    ${isSlotInPast(slot) ? "slot-passed" : ""}
                    ${selectedTime?.start === slot.start ? "active" : ""}
                    ${isSlotBooked(slot) ? "booked" : ""}
                  `}
                  onClick={() => handleTimeSelect(slot)}
                >
                  {slot.label} {isSlotInPast(slot) ? "(Time Passed)" : isSlotBooked(slot) ? "(Booked)" : ""}
                </button>
                ))}
              </div>
            </>
          ) : (
            <p>Select a date to view available slots</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
