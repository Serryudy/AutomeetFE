{/* Start Time Input */}
                    <div 
                        className="position-relative" 
                        ref={startTimeRef} 
                        style={{ 
                          flex: "1 1 120px", 
                          maxWidth: isMobile ? "100%" : "150px",
                          width: isMobile ? "100%" : "auto"
                        }}
                    >
                        <input
                        type="text"
                        className="form-control bg-white py-2 px-3 rounded"
                        readOnly={!isEditing}
                        style={{ width: "100%", cursor: "pointer" }}
                        placeholder="HH:MM AM/PM"
                        value={startTime}
                        onChange={(e) => handleTimeChange(e.target.value, "start")}
                        onDoubleClick={() => handleDoubleClick("start")}
                        />
                        {showStartTime && (
                        <div
                            className="position-absolute bg-white shadow p-3 rounded mt-1"
                            style={{ 
                            top: "100%", 
                            left: "0", 
                            zIndex: 10, 
                            maxHeight: "150px", 
                            overflowY: "auto",
                            width: "100%" 
                            }}
                        >
                            {generateTimeOptions().map((time, index) => (
                            <div
                                key={index}
                                className="py-2 px-3 hover-bg-light"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleTimeSelect(time, "start")}
                            >
                                {time}
                            </div>
                            ))}
                        </div>
                        )}
                    </div>

                    {/* End Time Input */}
                    <div 
                        className="position-relative" 
                        ref={endTimeRef} 
                        style={{ 
                          flex: "1 1 120px", 
                          maxWidth: isMobile ? "100%" : "150px",
                          width: isMobile ? "100%" : "auto"
                        }}
                    >
                        <input
                        type="text"
                        className="form-control bg-white py-2 px-3 rounded"
                        readOnly={!isEditing}
                        style={{ width: "100%", cursor: "pointer" }}
                        placeholder="HH:MM AM/PM"
                        value={endTime}
                        onChange={(e) => handleTimeChange(e.target.value, "end")}
                        onDoubleClick={() => handleDoubleClick("end")}
                        />
                        {showEndTime && (
                        <div
                            className="position-absolute bg-white shadow p-3 rounded mt-1"
                            style={{ 
                            top: "100%", 
                            left: "0", 
                            zIndex: 10, 
                            maxHeight: "150px", 
                            overflowY: "auto",
                            width: "100%" 
                            }}
                        >
                            {generateTimeOptions().map((time, index) => (
                            <div
                                key={index}
                                className="py-2 px-3 hover-bg-light"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleTimeSelect(time, "end")}
                            >
                                {time}
                            </div>
                            ))}
                        </div>
                        )}
                    </div>

                    {/* Add Button */}
                    <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center justify-content-center"
                        style={{
                        minWidth: "40px",
                        height: "38px",
                        flexShrink: 0,
                        }}
                        onClick={handleAddTimeSlot}
                        disabled={!isEditing}
                    >
                        <FaCheckCircle />
                    </button>