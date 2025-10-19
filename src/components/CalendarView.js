import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarView.css";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

// --- add locales و localizer ---
const locales = { "en-US": require("date-fns/locale/en-US") };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function CalendarView({ events, users, userColors }) { // fix: receive users and userColors as props
  const [allUserStatus, setAllUserStatus] = useState({});

  useEffect(() => {
    const unsubscribers = [];

    for (let video of events) {
      // fix: listen to each user's status for this video
      for (let user of users) {
        const docRef = doc(db, "progress", `${user}_${video.title}`);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          setAllUserStatus((prev) => ({
            ...prev,
            [video.title]: {
              ...prev[video.title],
              [user]: docSnap.exists() && docSnap.data().done,
            },
          }));
        });
        unsubscribers.push(unsubscribe);
      }
    }

    return () => unsubscribers.forEach((fn) => fn());
  }, [events, users]); // fix: add dependency on users

  const formattedEvents = events.map((e) => ({
    ...e,
    start: new Date(e.date),
    end: new Date(e.date),
  }));

  const EventComponent = ({ event }) => {
    const statuses = allUserStatus[event.title] || {}; // latest statuses for this event
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <strong>{event.title}</strong>
        <div style={{ display: "flex", marginTop: 2 }}>
          {/* fix: use userColor*/}
          {Object.entries(statuses).map(([userId, done]) => (
            <div
              key={userId}
              title={userId}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                marginRight: 2,
                backgroundColor: done ? userColors[userId] : "lightgray", // fix: use userColors prop
                transition: "background-color 0.3s", // animation
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="my-6">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        components={{ event: EventComponent }}
      />
    </div>
  );
}

export default CalendarView;