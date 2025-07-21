/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Calendar from "./calendar";
import { FaCog, FaUser, FaBell, FaGlobe, FaCalendarAlt, FaVideo } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname

const SidebarMenu = ({ showmenuicon = true, onToggle, onDateSelect , uid, mid}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const pathname = usePathname();

  // Determine the current view based on the URL
  const isSettingsView = pathname.includes("/settings");

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);

    if (onToggle && typeof onToggle === "function") {
      onToggle(newCollapsedState);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (onDateSelect && typeof onDateSelect === "function") {
      onDateSelect(date);
    }
  };

  useEffect(() => {
    if (onToggle && typeof onToggle === "function") {
      onToggle(isCollapsed);
    }
  }, [isCollapsed, onToggle]);

  const menuItems = [
    { icon: <img src="/icons/calendar.png" alt="Calendar" style={{ width: "22px" }} />, label: "Calendar", path: uid && mid ? `/exavailability/${uid}/${mid}` : '#' },
    { icon: <img src="/icons/meeting.png" alt="meetingdetails" style={{ width: "22px" }} />, label: "Meeting Details", path: mid ? `/exmeetingdetails/${mid}` : '#' },
    { icon: <img src="/icons/content.png" alt="content" style={{ width: "22px" }} />, label: "Content", path: mid ? `/excontent/${mid}` : '#' },
    { icon: <img src="/icons/notes.png" alt="notes" style={{ width: "22px" }} />, label: "Notes", path: mid ? `/exnotes/${mid}` : '#' },
  ];

  const settingsItems = [
    { icon: <FaUser size={20} />, label: "Profile", path: "/settings/profile" },
    { icon: <FaCog size={20} />, label: "Settings", path: "/settings" },
    { icon: <FaBell size={20} />, label: "Notifications", path: "/settings/notifications" },
    { icon: <FaCalendarAlt size={20} />, label: "Calendar sync", path: "/settings/calendarSync" },
    { icon: <FaVideo size={20} />, label: "Integration", path: "/settings/integration" },
  ];

  // Render the settings view
  const renderSettingsView = () => {
    return (
      <div className="settings-view w-100 h-100 d-flex flex-column px-3">
        {!isCollapsed && (
            <img
              src="\logo.png"  // <-- Change this to your actual logo path
              alt="AutoMeet Logo"
              style={{ height: "60px", objectFit: "contain" }}
            />
          )}
        {/* Back button */}
        <Link
          href="/"
          className="btn btn-link text-primary ps-0 d-flex align-items-center"
          style={{ textDecoration: "none", fontSize: "18px" }}
        >
          <span style={{ fontSize: "15px" }}>&lt;</span>
          <span className="ms-2 fs-10">Back to home</span>
        </Link>

        {/* Settings header */}
        <span className="mb-4 fw-bold fs-5">Account settings</span>

        {/* Settings menu items */}
        <div className="list-group list-group-flush">
          {settingsItems.map(({ icon, label, path }, index) => (
            <Link
              key={index}
              href={path}
              className="list-group-item fw-semibold list-group-item-action border-0 d-flex align-items-center px-0"
              style={{
                color: "#000",
                fontSize: "18px",
              }}
            >
              <span className="me-3">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  // Render the main sidebar or settings view based on the URL
  if (isSettingsView) {
    return (
      <div
        className={`sidebar bg-white align-items-start shadow-sm d-flex flex-column`}
        style={{
          width: "320px",
          height: "97vh",
          borderRadius: "15px",
          padding: "20px",
        }}
      >
        {renderSettingsView()}
      </div>
    );
  }

  // Render the main sidebar
  return (
    <div
      className={`sidebar bg-white align-items-start shadow-sm d-flex flex-column`}
      style={{
        width: isCollapsed ? "80px" : "320px",
        height: "97vh",
        borderRadius: "15px",
        transition: "width 0.3s ease-in-out",
        padding: "20px",
      }}
    >
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 w-100">
        <div className={`d-flex align-items-center ${isCollapsed ? "justify-content-center" : "justify-content-between"} w-100 mb-4`}>
          {!isCollapsed && (
            <img
              src="\logo.png"  // <-- Change this to your actual logo path
              alt="AutoMeet Logo"
              style={{ height: "60px", objectFit: "contain" }}
            />
          )}
          {showmenuicon && (
            <img
              src="/collapse.png"
              alt="Toggle Sidebar"
              className="cursor-pointer"
              style={{
                width: "20px",
                height: "20px",
                transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease-in-out",
              }}
              onClick={toggleSidebar}
            />
          )}
        </div>

        {/* Create Button */}
       <div className="d-flex mb-3 w-100" style={{ justifyContent: isCollapsed ? "center" : "flex-start" }}>
         <Link href="/create" className="text-decoration-none">
            <button
             className="btn d-flex align-items-center justify-content-center"
             style={{
             width: isCollapsed ? "45px" : "120px",
             height: "45px",
             backgroundColor: "#DDE5F9",
             border: "none",
             color: "#000",
             borderRadius: isCollapsed ? "50%" : "30px",
            transition: "all 0.3s ease-in-out",
              }}
           >
         <img 
             src="/icons/add.png" 
             alt="Create" 
             style={{ width: "20px" }} 
             className={!isCollapsed ? "me-2" : ""} // Only apply margin when not collapsed
         />
            {!isCollapsed && <span className="ms-2 fw-semibold">Create</span>}
          </button>
         </Link>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow-1 overflow-y-auto w-100" style={{ minHeight: 0 }}>
        <div className="menu-items w-100 h-100">
          <div className="list-group list-group-flush">
            {menuItems.map(({ icon, label, path }, index) => (
              <Link
                key={index}
                href={path}
                className=" fw-semibold  border-0 d-flex align-items-center p-2"
                style={{
                  color: "#000",
                  fontSize: "16px",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  paddingLeft: isCollapsed ? "0" : "16px",
                  transition: "all 0.3s ease-in-out",
                  textDecoration: "none"
                
                }}
              onMouseEnter={(e) => {
                if (!isCollapsed) {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isCollapsed) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
                
              >
                {icon}
                {!isCollapsed && <span className="ms-3">{label}</span>}
              </Link>
            ))}
          </div>

          {/* Calendar Component */}
          {!isCollapsed && (
            <>
              <hr className="w-100 my-2" />
              <div className="calendar-wrapper w-100 my-3">
                <Calendar onDateSelect={handleDateSelect} />
              </div>
              <hr className="w-100 my-2" />
            </>
          )}
        </div>
      </div>

      {/* Fixed Footer Section */}
      <div className="flex-shrink-0 mt-auto">
        <Link 
        href={"/settings"}
        className="list-group-item fw-semibold list-group-item-action border-0 d-flex align-items-center p-2"
        style={{
          color: "#000",
          fontSize: "16px",
          justifyContent: isCollapsed ? "center" : "flex-start",
          paddingLeft: isCollapsed ? "0" : "16px",
          transition: "all 0.3s ease-in-out",
        }}>
          <button
            onClick={() => setCurrentView("settings")}
            className="list-group-item fw-semibold list-group-item-action border-0 d-flex align-items-center p-2"
            style={{
              color: "#000",
              background: "none",
              width: "100%",
              textAlign: "left",
              justifyContent: isCollapsed ? "center" : "flex-start",
              paddingLeft: isCollapsed ? "0" : "16px",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <FaCog size={20} />
            {!isCollapsed && <span className="ms-3">Settings</span>}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SidebarMenu;