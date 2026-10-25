"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Building,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Mic,
  Wrench,
  Send,
  Loader2,
  Database,
  Plus,
  Trash2,
  X,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  RotateCcw,
} from "lucide-react";

const CATEGORIES = [
  {
    id: "planner",
    title: "Event Planner",
    desc: "Full-service planners, month-of coordinators, and creative designers",
    icon: Sparkles,
  },
  {
    id: "performer",
    title: "Performer / Artist",
    desc: "Live bands, DJs, solo musicians, comedians, anchors, and dancers",
    icon: Mic,
  },
  {
    id: "crew",
    title: "Event Crew & Staff",
    desc: "AV technicians, stagehands, lighting operators, and runners",
    icon: Wrench,
  },
];

const INITIAL_FORM = {
  eventName: "",
  eventType: "Corporate Event",
  dateType: "single",
  startDate: "",
  endDate: "",
  location: "",
  venue: "",
  category: "planner",
  categoryDetails: {
    // Planner
    planningScope: "Full Planning",
    estimatedGuestCount: 200,
    budgetBracket: "₹2,00,000 - ₹5,00,000",
    themeOrVision: "",
    vendorServicesNeeded: ["Catering", "Decor & Florals", "Audio & Visual"],
    keyDeliverables: ["Master Timeline", "Day-of Coordination"],

    // Performer
    performanceCategory: "Live Music Band",
    genreOrStyle: "Fusion / Pop",
    durationMinutes: 90,
    numberOfSets: 2,
    stageProvided: true,
    soundSystemProvided: true,
    performanceBudget: 45000,
    technicalRiderRequirements: [
      "Wireless Microphones (2+)",
      "PA Sound System",
    ],

    // Crew
    rolesNeeded: [
      { roleTitle: "Sound Engineer", headcount: 2, experienceLevel: "Skilled" },
      { roleTitle: "Stagehand", headcount: 4, experienceLevel: "Entry Level" },
    ],
    shiftDurationHours: 8,
    callTime: "08:00 AM",
    equipmentProvided: true,
    dressCode: "All Black / Production Attire",
    compensationType: "Fixed Day Rate",
    budgetPerCrewMember: 3000,
  },
  contact: {
    name: "",
    email: "",
    phone: "",
    organization: "",
  },
};

export default function GoPratlePostingFlow() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDbModal, setShowDbModal] = useState(false);
  const [savedRecords, setSavedRecords] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Input helpers
  const updateForm = (fields) =>
    setFormData((prev) => ({ ...prev, ...fields }));
  const updateDetails = (fields) =>
    setFormData((prev) => ({
      ...prev,
      categoryDetails: { ...prev.categoryDetails, ...fields },
    }));
  const updateContact = (fields) =>
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...fields },
    }));

  // Crew roles builder helpers
  const [crewRoleInput, setCrewRoleInput] = useState({
    roleTitle: "",
    headcount: 1,
    experienceLevel: "Skilled",
  });

  const addCrewRole = () => {
    if (!crewRoleInput.roleTitle.trim()) return;
    const current = formData.categoryDetails.rolesNeeded || [];
    updateDetails({
      rolesNeeded: [
        ...current,
        { ...crewRoleInput, headcount: Number(crewRoleInput.headcount) || 1 },
      ],
    });
    setCrewRoleInput({
      roleTitle: "",
      headcount: 1,
      experienceLevel: "Skilled",
    });
  };

  const removeCrewRole = (idx) => {
    const current = formData.categoryDetails.rolesNeeded || [];
    updateDetails({ rolesNeeded: current.filter((_, i) => i !== idx) });
  };

  // Toggle checkbox in array
  const toggleArrayItem = (key, item) => {
    const list = formData.categoryDetails[key] || [];
    if (list.includes(item)) {
      updateDetails({ [key]: list.filter((i) => i !== item) });
    } else {
      updateDetails({ [key]: [...list, item] });
    }
  };

  // Step validation
  const validateCurrentStep = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!formData.eventName.trim()) {
        setErrorMsg("Please enter the event name.");
        return false;
      }
      if (!formData.startDate) {
        setErrorMsg("Please select an event date.");
        return false;
      }
      if (!formData.location.trim()) {
        setErrorMsg("Please enter the event location.");
        return false;
      }
      if (!formData.category) {
        setErrorMsg("Please choose a category.");
        return false;
      }
    }
    if (step === 2) {
      if (
        formData.category === "crew" &&
        (!formData.categoryDetails.rolesNeeded ||
          formData.categoryDetails.rolesNeeded.length === 0)
      ) {
        setErrorMsg("Please add at least one crew position.");
        return false;
      }
    }
    if (step === 3) {
      if (
        !formData.contact.name.trim() ||
        !formData.contact.email.trim() ||
        !formData.contact.phone.trim()
      ) {
        setErrorMsg("Please provide your name, email, and phone number.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep((s) => Math.min(4, s + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setErrorMsg("");
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit requirement");
      }

      setSubmittedData(data.data);
    } catch (err) {
      setErrorMsg(err.message || "Error connecting to backend server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch Database Records
  const fetchRecords = async (filter = "all") => {
    try {
      const url =
        filter === "all"
          ? "/api/requirements"
          : `/api/requirements?category=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSavedRecords(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openDbViewer = () => {
    fetchRecords(selectedFilter);
    setShowDbModal(true);
  };

  // Quick 1-click autofill for testing
  // const autofillDemo = (cat) => {
  //   if (cat === "planner") {
  //     setFormData({
  //       ...INITIAL_FORM,
  //       eventName: "GoPratle Tech Leadership Conclave 2026",
  //       eventType: "Corporate Event",
  //       startDate: "2026-11-15",
  //       location: "New Delhi, India",
  //       venue: "The Leela Palace Ballroom",
  //       category: "planner",
  //       categoryDetails: {
  //         planningScope: "Full Planning",
  //         estimatedGuestCount: 350,
  //         budgetBracket: "₹5,00,000 - ₹10,00,000",
  //         themeOrVision:
  //           "Clean executive summit with modern stage design & networking lounge.",
  //         vendorServicesNeeded: [
  //           "Catering",
  //           "Decor & Florals",
  //           "Audio & Visual",
  //           "Photography / Video",
  //         ],
  //         keyDeliverables: [
  //           "Master Timeline",
  //           "Day-of Coordination",
  //           "Vendor Management",
  //         ],
  //       },
  //       contact: {
  //         name: "Rohit Verma",
  //         email: "rohit.v@conclave.org",
  //         phone: "+91 98765 43210",
  //         organization: "Apex Media Ventures",
  //       },
  //     });
  //   } else if (cat === "performer") {
  //     setFormData({
  //       ...INITIAL_FORM,
  //       eventName: "GoPratle Indie Sundowner Festival",
  //       eventType: "Music Concert",
  //       startDate: "2026-12-05",
  //       location: "Goa, India",
  //       venue: "Hilltop Vagator Open Air",
  //       category: "performer",
  //       categoryDetails: {
  //         performanceCategory: "Live Music Band",
  //         genreOrStyle: "Indie Fusion & Bollywood Rock",
  //         durationMinutes: 90,
  //         numberOfSets: 2,
  //         stageProvided: true,
  //         soundSystemProvided: true,
  //         performanceBudget: 75000,
  //         technicalRiderRequirements: [
  //           "Wireless Microphones (2+)",
  //           "PA Sound System",
  //           "In-Ear Monitors (IEMs)",
  //         ],
  //       },
  //       contact: {
  //         name: "Ananya Sharma",
  //         email: "ananya@indiesundowner.in",
  //         phone: "+91 98111 22334",
  //         organization: "Sundowner Events",
  //       },
  //     });
  //   } else if (cat === "crew") {
  //     setFormData({
  //       ...INITIAL_FORM,
  //       eventName: "GoPratle Global Arena Fest",
  //       eventType: "Exhibition & Show",
  //       startDate: "2026-11-28",
  //       location: "Mumbai, India",
  //       venue: "Jio World Convention Centre",
  //       category: "crew",
  //       categoryDetails: {
  //         rolesNeeded: [
  //           {
  //             roleTitle: "FOH Sound Engineer",
  //             headcount: 2,
  //             experienceLevel: "Lead",
  //           },
  //           {
  //             roleTitle: "Stagehand & Rigging Tech",
  //             headcount: 6,
  //             experienceLevel: "Skilled",
  //           },
  //           {
  //             roleTitle: "Video / Camera Operator",
  //             headcount: 3,
  //             experienceLevel: "Skilled",
  //           },
  //         ],
  //         shiftDurationHours: 10,
  //         callTime: "07:30 AM",
  //         equipmentProvided: true,
  //         dressCode: "All Black / Production Attire",
  //         compensationType: "Fixed Day Rate",
  //         budgetPerCrewMember: 3500,
  //       },
  //       contact: {
  //         name: "Vikram Malhotra",
  //         email: "vikram@arenashow.com",
  //         phone: "+91 99222 33445",
  //         organization: "ProStage India",
  //       },
  //     });
  //   }
  //   setErrorMsg("");
  // };

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white shadow-md shadow-[#F4F4F4] border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <span className="text-xl font-extrabold tracking-tight text-black">
                Go<span className="text-[#FF4C18]">Pratle</span>
              </span>
            </div>
          </div>

          {/* Stored Data Fetching */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1-click Demo Fillers */}
            {/* <div className="hidden md:flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg text-xs">
              <span className="text-gray-400 font-semibold text-[11px]">
                Auto Fill:
              </span>
              <button
                type="button"
                onClick={() => autofillDemo("planner")}
                className="hover:text-[#FF4C18] font-medium transition-colors"
              >
                Planner
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => autofillDemo("performer")}
                className="hover:text-[#FF4C18] font-medium transition-colors"
              >
                Performer
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => autofillDemo("crew")}
                className="hover:text-[#FF4C18] font-medium transition-colors"
              >
                Crew
              </button>
            </div> */}

            {/* View Database Button */}
            <button
              type="button"
              onClick={openDbViewer}
              className="inline-flex items-center gap-1.5 text-gray-700 hover:text-[#FF4C18] border border-gray-300 hover:border-[#FF4C18] text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>View Stored Data</span>
            </button>

            {/* GoPratle Action Buttons */}
            <button
              type="button"
              onClick={() => {
                setSubmittedData(null);
                setStep(1);
                setFormData(INITIAL_FORM);
              }}
              className="bg-[#FF4C18] text-white text-[12px] font-medium border border-[#FF4C18] hover:bg-white hover:text-[#FF4C18] px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shadow-xs"
            >
              Post Requirement
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {/* SUCCESS CONFIRMATION */}
        {submittedData ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#FFF7ED] text-[#FF4C18] flex items-center justify-center mx-auto mb-4 border border-[#FFEDD5]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Requirement Posted Successfully!
            </h2>
            <p className="text-gray-600 text-sm mt-1 max-w-md mx-auto">
              Saved directly to MongoDB and categorized under{" "}
              <strong className="text-[#FF4C18] capitalize font-bold">
                {submittedData.category}
              </strong>
              .
            </p>

            <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-left max-w-md mx-auto text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">
                  Reference Code:
                </span>
                <span className="font-mono font-bold text-[#FF4C18] bg-white px-2 py-0.5 rounded border border-[#FFEDD5]">
                  {submittedData.referenceId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Event:</span>
                <span className="font-semibold text-gray-900">
                  {submittedData.eventName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-semibold uppercase text-[#FF4C18]">
                  {submittedData.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="text-gray-800">{submittedData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact:</span>
                <span className="text-gray-800">
                  {submittedData.contact?.name}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={openDbViewer}
                className="px-5 py-2.5 rounded-lg bg-[#FF4C18] text-white text-xs font-semibold hover:bg-[#E03E0E] transition-colors shadow-xs"
              >
                View in MongoDB Repository
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  setStep(1);
                  setFormData(INITIAL_FORM);
                }}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Post Another Requirement
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step Wizard Indicator */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between">
                {[
                  { num: 1, label: "Event Basics" },
                  {
                    num: 2,
                    label:
                      formData.category === "planner"
                        ? "Planning Scope"
                        : formData.category === "performer"
                          ? "Act & Style"
                          : "Crew Roles",
                  },
                  {
                    num: 3,
                    label:
                      formData.category === "planner"
                        ? "Deliverables"
                        : formData.category === "performer"
                          ? "Rider & Budget"
                          : "Logistics",
                  },
                  { num: 4, label: "Review & Post" },
                ].map((s) => {
                  const isActive = step === s.num;
                  const isDone = step > s.num;

                  return (
                    <div
                      key={s.num}
                      onClick={() => (s.num < step ? setStep(s.num) : null)}
                      className={`flex items-center gap-2 cursor-pointer ${
                        s.num < step ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isActive
                            ? "bg-[#FF4C18] text-white"
                            : isDone
                              ? "bg-[#FFF7ED] text-[#FF4C18] border border-[#FF4C18]"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isDone ? "Ok" : s.num}
                      </div>
                      <span
                        className={`hidden sm:inline text-xs font-semibold ${
                          isActive
                            ? "text-[#FF4C18]"
                            : isDone
                              ? "text-gray-800"
                              : "text-gray-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 h-1 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-[#FF4C18] h-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Error message banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* FORM CONTAINER */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200 shadow-xs">
              {/* STEP 1: EVENT & CATEGORY */}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Step 1: Event Basics
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Enter the key event details and select the requirement
                      category.
                    </p>
                  </div>

                  {/* Category Selector (GoPratle Orange Theme) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Requirement Category{" "}
                      <span className="text-[#FF4C18]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {CATEGORIES.map((cat) => {
                        const isSelected = formData.category === cat.id;
                        const Icon = cat.icon;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => updateForm({ category: cat.id })}
                            className={`p-4 rounded-xl border text-left transition-all relative ${
                              isSelected
                                ? "border-[#FF4C18] bg-[#FFF7ED] ring-1 ring-[#FF4C18]"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className={`p-2 rounded-lg ${
                                  isSelected
                                    ? "bg-[#FF4C18] text-white"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-[#FF4C18]" />
                              )}
                            </div>
                            <h3 className="font-bold text-sm text-gray-900">
                              {cat.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {cat.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Event Title / Name{" "}
                        <span className="text-[#FF4C18]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.eventName}
                        onChange={(e) =>
                          updateForm({ eventName: e.target.value })
                        }
                        placeholder="e.g. Annual Design Summit, College Fest, Wedding Reception"
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18] focus:ring-1 focus:ring-[#FF4C18]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Event Type <span className="text-[#FF4C18]">*</span>
                      </label>
                      <select
                        value={formData.eventType}
                        onChange={(e) =>
                          updateForm({ eventType: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18] focus:ring-1 focus:ring-[#FF4C18]"
                      >
                        <option>Corporate Event</option>
                        <option>Wedding & Reception</option>
                        <option>Music Concert</option>
                        <option>Birthday & Milestone</option>
                        <option>Exhibition & Show</option>
                        <option>College Fest</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Date Type
                      </label>
                      <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => updateForm({ dateType: "single" })}
                          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                            formData.dateType === "single"
                              ? "bg-white text-[#FF4C18] shadow-xs"
                              : "text-gray-500"
                          }`}
                        >
                          Single Day
                        </button>
                        <button
                          type="button"
                          onClick={() => updateForm({ dateType: "range" })}
                          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                            formData.dateType === "range"
                              ? "bg-white text-[#FF4C18] shadow-xs"
                              : "text-gray-500"
                          }`}
                        >
                          Date Range
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Start / Event Date{" "}
                        <span className="text-[#FF4C18]">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          updateForm({ startDate: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18] focus:ring-1 focus:ring-[#FF4C18]"
                      />
                    </div>

                    {formData.dateType === "range" ? (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          min={formData.startDate}
                          onChange={(e) =>
                            updateForm({ endDate: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18] focus:ring-1 focus:ring-[#FF4C18]"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Venue (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.venue}
                          onChange={(e) =>
                            updateForm({ venue: e.target.value })
                          }
                          placeholder="e.g. JW Marriott Ballroom"
                          className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18] focus:ring-1 focus:ring-[#FF4C18]"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Location (City / Region){" "}
                        <span className="text-[#FF4C18]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          updateForm({ location: e.target.value })
                        }
                        placeholder="e.g. New Delhi, Mumbai, Bengaluru, Goa"
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18] focus:ring-1 focus:ring-[#FF4C18]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 2: CATEGORY-SPECIFIC DETAILS (ADAPTIVE)                   */}
              {/* ============================================================== */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[11px] font-bold text-[#FF4C18] uppercase tracking-wider">
                      Category: {formData.category}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                      Step 2:{" "}
                      {formData.category === "planner"
                        ? "Event Planner Scope & Vision"
                        : formData.category === "performer"
                          ? "Performer & Act Specifics"
                          : "Crew Positions & Headcount"}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Specific requirements tailored for {formData.category}{" "}
                      hiring.
                    </p>
                  </div>

                  {/* 1. PLANNER SPECIFICS */}
                  {formData.category === "planner" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Planning Scope{" "}
                          <span className="text-[#FF4C18]">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {[
                            "Full Planning",
                            "Partial Planning",
                            "Day-of Coordination",
                          ].map((sc) => (
                            <button
                              key={sc}
                              type="button"
                              onClick={() =>
                                updateDetails({ planningScope: sc })
                              }
                              className={`p-3 rounded-lg border text-xs font-medium text-left transition-all ${
                                formData.categoryDetails.planningScope === sc
                                  ? "border-[#FF4C18] bg-[#FFF7ED] text-[#FF4C18] font-bold"
                                  : "border-gray-200 bg-white text-gray-700"
                              }`}
                            >
                              {sc}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Estimated Guest Count
                          </label>
                          <input
                            type="number"
                            value={
                              formData.categoryDetails.estimatedGuestCount || ""
                            }
                            onChange={(e) =>
                              updateDetails({
                                estimatedGuestCount: Number(e.target.value),
                              })
                            }
                            placeholder="e.g. 200"
                            className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Overall Budget Bracket
                          </label>
                          <select
                            value={formData.categoryDetails.budgetBracket || ""}
                            onChange={(e) =>
                              updateDetails({ budgetBracket: e.target.value })
                            }
                            className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18]"
                          >
                            <option>₹50,000 - ₹2,00,000</option>
                            <option>₹2,00,000 - ₹5,00,000</option>
                            <option>₹5,00,000 - ₹10,00,000</option>
                            <option>₹10,00,000+</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Theme / Creative Vision
                        </label>
                        <textarea
                          rows={2}
                          value={formData.categoryDetails.themeOrVision || ""}
                          onChange={(e) =>
                            updateDetails({ themeOrVision: e.target.value })
                          }
                          placeholder="Describe the aesthetic, theme, or special elements..."
                          className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18]"
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. PERFORMER SPECIFICS */}
                  {formData.category === "performer" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Act Type <span className="text-[#FF4C18]">*</span>
                        </label>
                        <select
                          value={
                            formData.categoryDetails.performanceCategory ||
                            "Live Music Band"
                          }
                          onChange={(e) =>
                            updateDetails({
                              performanceCategory: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18]"
                        >
                          <option>Live Music Band</option>
                          <option>Solo Vocalist / Musician</option>
                          <option>DJ / Producer</option>
                          <option>Stand-up Comedian</option>
                          <option>Anchor</option>
                          <option>Dance Troupe</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Musical Genre / Style
                          </label>
                          <input
                            type="text"
                            value={formData.categoryDetails.genreOrStyle || ""}
                            onChange={(e) =>
                              updateDetails({ genreOrStyle: e.target.value })
                            }
                            placeholder="e.g. Bollywood Fusion, Pop Rock, Commercial EDM"
                            className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Duration & Sets
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={
                                formData.categoryDetails.durationMinutes || ""
                              }
                              onChange={(e) =>
                                updateDetails({
                                  durationMinutes: Number(e.target.value),
                                })
                              }
                              placeholder="Mins (e.g. 90)"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18]"
                            />
                            <input
                              type="number"
                              value={formData.categoryDetails.numberOfSets || 1}
                              onChange={(e) =>
                                updateDetails({
                                  numberOfSets: Number(e.target.value),
                                })
                              }
                              placeholder="Sets (e.g. 2)"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. CREW SPECIFICS */}
                  {formData.category === "crew" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Crew Roles Required{" "}
                          <span className="text-[#FF4C18]">*</span>
                        </label>

                        {/* Existing Roles List */}
                        <div className="space-y-2 mb-3">
                          {(formData.categoryDetails.rolesNeeded || []).map(
                            (r, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">
                                    {r.roleTitle}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-600">
                                    Qty: {r.headcount}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-[#FF4C18] font-medium">
                                    {r.experienceLevel}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeCrewRole(i)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Add Role Mini-Form */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                          <span className="text-[11px] font-bold text-gray-600 uppercase">
                            + Add Role
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                            <input
                              type="text"
                              value={crewRoleInput.roleTitle}
                              onChange={(e) =>
                                setCrewRoleInput({
                                  ...crewRoleInput,
                                  roleTitle: e.target.value,
                                })
                              }
                              placeholder="Role (e.g. Sound Engineer, Rigging)"
                              className="sm:col-span-3 px-3 py-1.5 text-xs rounded border border-gray-300 bg-white"
                            />
                            <input
                              type="number"
                              min="1"
                              value={crewRoleInput.headcount}
                              onChange={(e) =>
                                setCrewRoleInput({
                                  ...crewRoleInput,
                                  headcount: Math.max(
                                    1,
                                    Number(e.target.value),
                                  ),
                                })
                              }
                              placeholder="Qty"
                              className="sm:col-span-1 px-3 py-1.5 text-xs rounded border border-gray-300 bg-white"
                            />
                            <select
                              value={crewRoleInput.experienceLevel}
                              onChange={(e) =>
                                setCrewRoleInput({
                                  ...crewRoleInput,
                                  experienceLevel: e.target.value,
                                })
                              }
                              className="sm:col-span-2 px-2 py-1.5 text-xs rounded border border-gray-300 bg-white"
                            >
                              <option>Entry Level</option>
                              <option>Skilled</option>
                              <option>Lead</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={addCrewRole}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 bg-[#FF4C18] text-white rounded hover:bg-[#E03E0E]"
                          >
                            <Plus className="w-3 h-3" /> Add to List
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Shift Duration (Hours)
                          </label>
                          <input
                            type="number"
                            value={
                              formData.categoryDetails.shiftDurationHours || 8
                            }
                            onChange={(e) =>
                              updateDetails({
                                shiftDurationHours: Number(e.target.value),
                              })
                            }
                            className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Call Time
                          </label>
                          <input
                            type="text"
                            value={formData.categoryDetails.callTime || ""}
                            onChange={(e) =>
                              updateDetails({ callTime: e.target.value })
                            }
                            placeholder="e.g. 08:00 AM"
                            className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: LOGISTICS, PROVISIONS & CONTACT */}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[11px] font-bold text-[#FF4C18] uppercase tracking-wider">
                      Category: {formData.category}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                      Step 3: Logistics & Point of Contact
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Technical provisions, deliverables, and organizer contact
                      details.
                    </p>
                  </div>

                  {/* 1. PLANNER DELIVERABLES */}
                  {formData.category === "planner" && (
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-gray-700">
                        Vendor Services Needed
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          "Catering",
                          "Decor & Florals",
                          "Audio & Visual",
                          "Photography / Video",
                          "Permits & Licensing",
                        ].map((item) => {
                          const checked = (
                            formData.categoryDetails.vendorServicesNeeded || []
                          ).includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() =>
                                toggleArrayItem("vendorServicesNeeded", item)
                              }
                              className={`p-2 rounded border text-left flex items-center justify-between ${
                                checked
                                  ? "border-[#FF4C18] bg-[#FFF7ED] text-[#FF4C18] font-bold"
                                  : "border-gray-200 text-gray-700"
                              }`}
                            >
                              <span>{item}</span>
                              {checked && <span>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. PERFORMER RIDER & BUDGET */}
                  {formData.category === "performer" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateDetails({
                              stageProvided:
                                !formData.categoryDetails.stageProvided,
                            })
                          }
                          className={`p-3 rounded-lg border text-xs font-medium text-left flex justify-between ${
                            formData.categoryDetails.stageProvided
                              ? "border-[#FF4C18] bg-[#FFF7ED] text-[#FF4C18]"
                              : "border-gray-200"
                          }`}
                        >
                          <span>Stage / Platform Provided</span>
                          <span>
                            {formData.categoryDetails.stageProvided
                              ? "YES"
                              : "NO"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateDetails({
                              soundSystemProvided:
                                !formData.categoryDetails.soundSystemProvided,
                            })
                          }
                          className={`p-3 rounded-lg border text-xs font-medium text-left flex justify-between ${
                            formData.categoryDetails.soundSystemProvided
                              ? "border-[#FF4C18] bg-[#FFF7ED] text-[#FF4C18]"
                              : "border-gray-200"
                          }`}
                        >
                          <span>PA / Sound System Provided</span>
                          <span>
                            {formData.categoryDetails.soundSystemProvided
                              ? "YES"
                              : "NO"}
                          </span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Offered Performance Budget (₹)
                        </label>
                        <input
                          type="number"
                          value={
                            formData.categoryDetails.performanceBudget || ""
                          }
                          onChange={(e) =>
                            updateDetails({
                              performanceBudget: Number(e.target.value),
                            })
                          }
                          placeholder="e.g. 45000"
                          className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-[#FF4C18]"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. CREW LOGISTICS */}
                  {formData.category === "crew" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Dress Code
                          </label>
                          <select
                            value={
                              formData.categoryDetails.dressCode ||
                              "All Black / Production Attire"
                            }
                            onChange={(e) =>
                              updateDetails({ dressCode: e.target.value })
                            }
                            className="w-full px-3 py-2 text-xs rounded border border-gray-300"
                          >
                            <option>All Black / Production Attire</option>
                            <option>Smart Casual</option>
                            <option>Hi-Vis Safety Gear</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Pay Rate Per Member (₹)
                          </label>
                          <input
                            type="number"
                            value={
                              formData.categoryDetails.budgetPerCrewMember || ""
                            }
                            onChange={(e) =>
                              updateDetails({
                                budgetPerCrewMember: Number(e.target.value),
                              })
                            }
                            placeholder="e.g. 3000 / day"
                            className="w-full px-3 py-2 text-xs rounded border border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ORGANIZER CONTACT INFO */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Organizer Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={formData.contact.name}
                          onChange={(e) =>
                            updateContact({ name: e.target.value })
                          }
                          placeholder="Your Name"
                          className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:border-[#FF4C18]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.contact.email}
                          onChange={(e) =>
                            updateContact({ email: e.target.value })
                          }
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:border-[#FF4C18]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={formData.contact.phone}
                          onChange={(e) =>
                            updateContact({ phone: e.target.value })
                          }
                          placeholder="+91..."
                          className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:border-[#FF4C18]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW AND SUBMISSION   */}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Step 4: Review & Submit
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Verify all information before publishing to the backend.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-4 text-xs">
                    {/* Basic details */}
                    <div className="pb-3 border-b border-gray-200 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#FF4C18] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FFEDD5]">
                          {formData.category} Requirement
                        </span>
                        <h3 className="font-bold text-sm text-gray-900 mt-1">
                          {formData.eventName}
                        </h3>
                        <p className="text-gray-500 mt-0.5">
                          {formData.eventType} • {formData.startDate}
                          {formData.dateType === "range" &&
                            ` to ${formData.endDate}`}{" "}
                          • {formData.location}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[11px] text-[#FF4C18] font-semibold hover:underline"
                      >
                        Edit Step 1
                      </button>
                    </div>

                    {/* Category details */}
                    <div className="pb-3 border-b border-gray-200 flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1 capitalize">
                          {formData.category} Details:
                        </h4>
                        {formData.category === "planner" && (
                          <p className="text-gray-600">
                            Scope:{" "}
                            <strong>
                              {formData.categoryDetails.planningScope}
                            </strong>{" "}
                            • Guests:{" "}
                            {formData.categoryDetails.estimatedGuestCount} •
                            Budget: {formData.categoryDetails.budgetBracket}
                          </p>
                        )}
                        {formData.category === "performer" && (
                          <p className="text-gray-600">
                            Act:{" "}
                            <strong>
                              {formData.categoryDetails.performanceCategory}
                            </strong>{" "}
                            ({formData.categoryDetails.genreOrStyle}) •
                            Duration: {formData.categoryDetails.durationMinutes}{" "}
                            mins • Budget: ₹
                            {formData.categoryDetails.performanceBudget}
                          </p>
                        )}
                        {formData.category === "crew" && (
                          <p className="text-gray-600">
                            Roles:{" "}
                            {(formData.categoryDetails.rolesNeeded || [])
                              .map((r) => `${r.roleTitle} (${r.headcount})`)
                              .join(", ")}{" "}
                            • Pay: ₹
                            {formData.categoryDetails.budgetPerCrewMember}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-[11px] text-[#FF4C18] font-semibold hover:underline"
                      >
                        Edit Step 2
                      </button>
                    </div>

                    {/* Contact details */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-800 mb-0.5">
                          Contact Person:
                        </h4>
                        <p className="text-gray-600">
                          {formData.contact.name} ({formData.contact.email} •{" "}
                          {formData.contact.phone})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="text-[11px] text-[#FF4C18] font-semibold hover:underline"
                      >
                        Edit Step 3
                      </button>
                    </div>
                  </div>

                  {/* Submission Action */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FF4C18] hover:bg-[#E03E0E] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving to MongoDB...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit & Post to GoPratle
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Footer (Steps 1, 2, 3) */}
              {step < 4 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={step === 1}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#FF4C18] hover:bg-[#E03E0E] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Continue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#FF4C18]" />
                <h3 className="font-bold text-sm text-gray-900">
                  MongoDB Saved Requirements ({savedRecords.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDbModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter pills */}
            <div className="p-3 border-b border-gray-100 flex gap-2 overflow-x-auto text-xs">
              {["all", "planner", "performer", "crew"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setSelectedFilter(f);
                    fetchRecords(f);
                  }}
                  className={`px-3 py-1 rounded-full capitalize font-medium transition-colors ${
                    selectedFilter === f
                      ? "bg-[#FF4C18] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {savedRecords.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  No records found.
                </p>
              ) : (
                savedRecords.map((item) => (
                  <div
                    key={item._id}
                    className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-[#FF4C18] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-gray-900 text-sm">
                        {item.eventName}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FFF7ED] text-[#FF4C18] border border-[#FFEDD5]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-gray-500">
                      {item.eventType} • {item.location} • {item.startDate}
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-600 flex justify-between">
                      <span>
                        Ref:{" "}
                        <strong className="font-mono">
                          {item.referenceId || item._id}
                        </strong>
                      </span>
                      <span>By: {item.contact?.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
