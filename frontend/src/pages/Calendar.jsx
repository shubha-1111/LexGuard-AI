import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const urgencyColor = (date) => {
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff <= 2)  return { dot: "bg-red-500",    badge: "bg-red-100 text-red-700 border-red-200",    label: "Today/Tomorrow" };
  if (diff <= 7)  return { dot: "bg-orange-400",  badge: "bg-orange-100 text-orange-700 border-orange-200", label: "This Week" };
  if (diff <= 30) return { dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700 border-blue-200",   label: "This Month" };
  return           { dot: "bg-gray-400",    badge: "bg-gray-100 text-gray-600 border-gray-200",    label: "Upcoming" };
};

export default function Calendar() {
  const [hearings, setHearings]   = useState([]);
  const [past, setPast]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [today]                   = useState(new Date());
  const [current, setCurrent]     = useState({
    month: new Date().getMonth(),
    year:  new Date().getFullYear(),
  });
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView]           = useState("calendar"); // calendar | list

  useEffect(() => {
    fetchHearings();
  }, []);

  const fetchHearings = async () => {
    setLoading(true);
    try {
      const [upRes, pastRes] = await Promise.allSettled([
        API.get("/hearings/upcoming"),
        API.get("/hearings/past"),
      ]);
      if (upRes.status === "fulfilled") {
        const d = upRes.value.data;
        setHearings(Array.isArray(d) ? d : d.hearings || []);
      }
      if (pastRes.status === "fulfilled") {
        const d = pastRes.value.data;
        setPast(Array.isArray(d) ? d : d.hearings || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const allHearings = [...hearings, ...past];

  // Get hearings for a specific date
  const hearingsOnDate = (year, month, day) => {
    return allHearings.filter((h) => {
      const d = new Date(h.hearingDate);
      return d.getFullYear() === year &&
             d.getMonth()    === month &&
             d.getDate()     === day;
    });
  };

  // Build calendar grid
  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => setCurrent((c) => {
    if (c.month === 0) return { month: 11, year: c.year - 1 };
    return { month: c.month - 1, year: c.year };
  });
  const nextMonth = () => setCurrent((c) => {
    if (c.month === 11) return { month: 0, year: c.year + 1 };
    return { month: c.month + 1, year: c.year };
  });

  const isToday = (day) =>
    day === today.getDate() &&
    current.month === today.getMonth() &&
    current.year  === today.getFullYear();

  const selectedHearings = selectedDay
    ? hearingsOnDate(current.year, current.month, selectedDay)
    : [];

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  // Upcoming hearings sorted by urgency
  const sortedUpcoming = [...hearings].sort(
    (a, b) => new Date(a.hearingDate) - new Date(b.hearingDate)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Hearing Calendar
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {hearings.length} upcoming · {past.length} past hearings
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("calendar")}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  view === "calendar"
                    ? "bg-blue-900 text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  view === "list"
                    ? "bg-blue-900 text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
              >
                List View
              </button>
            </div>
          </div>

          {/* Urgent Alerts */}
          {hearings.filter((h) => {
            const diff = Math.ceil(
              (new Date(h.hearingDate) - new Date()) / (1000 * 60 * 60 * 24)
            );
            return diff <= 2;
          }).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 font-semibold text-sm mb-2">
                ⚠ Urgent — Hearings within 48 hours
              </p>
              {hearings
                .filter((h) => {
                  const diff = Math.ceil(
                    (new Date(h.hearingDate) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return diff <= 2;
                })
                .map((h) => (
                  <p key={h._id} className="text-red-600 text-sm">
                    • {h.caseId?.caseTitle || "Hearing"} —{" "}
                    {formatDate(h.hearingDate)} at {formatTime(h.hearingDate)}
                  </p>
                ))}
            </div>
          )}

          {view === "calendar" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Calendar Grid */}
              <div className="lg:col-span-2 bg-white border rounded-lg shadow-sm overflow-hidden">
                {/* Month Navigation */}
                <div className="flex justify-between items-center px-5 py-4 border-b bg-blue-900">
                  <button
                    onClick={prevMonth}
                    className="text-white hover:text-blue-200 text-lg px-2"
                  >
                    ‹
                  </button>
                  <h2 className="text-white font-semibold">
                    {MONTHS[current.month]} {current.year}
                  </h2>
                  <button
                    onClick={nextMonth}
                    className="text-white hover:text-blue-200 text-lg px-2"
                  >
                    ›
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b">
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className="text-center py-2 text-xs font-semibold text-gray-400"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Cells */}
                <div className="grid grid-cols-7">
                  {cells.map((day, i) => {
                    const dayHearings = day
                      ? hearingsOnDate(current.year, current.month, day)
                      : [];
                    const isSelected = selectedDay === day;
                    const isTodayCell = day ? isToday(day) : false;

                    return (
                      <div
                        key={i}
                        onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                        className={`min-h-[72px] p-1.5 border-b border-r cursor-pointer transition-colors ${
                          !day ? "bg-gray-50" : ""
                        } ${isSelected ? "bg-blue-50" : day ? "hover:bg-gray-50" : ""}`}
                      >
                        {day && (
                          <>
                            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1 ${
                              isTodayCell
                                ? "bg-blue-900 text-white font-bold"
                                : "text-gray-700"
                            }`}>
                              {day}
                            </div>
                            <div className="space-y-0.5">
                              {dayHearings.slice(0, 2).map((h, hi) => {
                                const urg = urgencyColor(h.hearingDate);
                                return (
                                  <div
                                    key={hi}
                                    className="flex items-center gap-1"
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${urg.dot}`} />
                                    <span className="text-xs text-gray-600 truncate">
                                      {h.caseId?.caseTitle || "Hearing"}
                                    </span>
                                  </div>
                                );
                              })}
                              {dayHearings.length > 2 && (
                                <p className="text-xs text-blue-600">
                                  +{dayHearings.length - 2} more
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Side Panel */}
              <div className="space-y-4">

                {/* Selected Day Details */}
                {selectedDay && (
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      {selectedDay} {MONTHS[current.month]} {current.year}
                    </h3>
                    {selectedHearings.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No hearings on this day.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedHearings.map((h) => {
                          const urg = urgencyColor(h.hearingDate);
                          return (
                            <div
                              key={h._id}
                              className={`border rounded p-3 ${urg.badge}`}
                            >
                              <p className="font-medium text-sm">
                                {h.caseId?.caseTitle || "Hearing"}
                              </p>
                              <p className="text-xs mt-0.5">
                                {formatTime(h.hearingDate)}
                              </p>
                              {h.stage && (
                                <p className="text-xs mt-0.5">
                                  Stage: {h.stage}
                                </p>
                              )}
                              {h.remarks && (
                                <p className="text-xs mt-1 italic">
                                  {h.remarks}
                                </p>
                              )}
                              {h.caseId?.courtName && (
                                <p className="text-xs mt-0.5">
                                  {h.caseId.courtName}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Next 5 Upcoming */}
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Next Hearings
                  </h3>
                  {loading ? (
                    <p className="text-sm text-gray-400">Loading...</p>
                  ) : sortedUpcoming.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No upcoming hearings.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sortedUpcoming.slice(0, 6).map((h) => {
                        const urg = urgencyColor(h.hearingDate);
                        return (
                          <div
                            key={h._id}
                            className="flex gap-3 items-start py-2 border-b last:border-0"
                          >
                            <div className="text-center min-w-[36px]">
                              <p className="text-lg font-bold text-blue-900 leading-none">
                                {new Date(h.hearingDate).getDate()}
                              </p>
                              <p className="text-xs text-gray-400">
                                {MONTHS[new Date(h.hearingDate).getMonth()].slice(0,3)}
                              </p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {h.caseId?.caseTitle || "Hearing"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTime(h.hearingDate)}
                                {h.stage ? ` · ${h.stage}` : ""}
                              </p>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${urg.badge}`}>
                              {urg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>

          ) : (
            /* List View */
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-700">
                All Upcoming Hearings
              </h2>
              {loading ? (
                <p className="text-gray-400 text-sm">Loading...</p>
              ) : sortedUpcoming.length === 0 ? (
                <div className="bg-white border rounded-lg p-8 text-center">
                  <p className="text-gray-400 text-sm">No upcoming hearings.</p>
                </div>
              ) : (
                sortedUpcoming.map((h) => {
                  const urg = urgencyColor(h.hearingDate);
                  const diff = Math.ceil(
                    (new Date(h.hearingDate) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={h._id}
                      className="bg-white border rounded-lg p-4 flex justify-between items-center"
                    >
                      <div className="flex gap-4 items-center">
                        <div className={`text-center px-3 py-2 rounded-lg min-w-[56px] ${urg.badge}`}>
                          <p className="text-xl font-bold leading-none">
                            {new Date(h.hearingDate).getDate()}
                          </p>
                          <p className="text-xs font-medium">
                            {MONTHS[new Date(h.hearingDate).getMonth()].slice(0,3)}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {h.caseId?.caseTitle || "Hearing"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {h.caseId?.courtName || "Court not specified"}
                            {h.caseId?.caseNumber
                              ? ` · ${h.caseId.caseNumber}`
                              : ""}
                          </p>
                          {h.stage && (
                            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {h.stage}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {formatTime(h.hearingDate)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {diff === 0
                            ? "Today"
                            : diff === 1
                            ? "Tomorrow"
                            : `In ${diff} days`}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}