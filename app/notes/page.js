'use client';

import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/global.css';
import SidebarMenu from '../../components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaPen, FaRegCheckCircle, FaDownload, FaTrash, FaCheckCircle, FaBars } from 'react-icons/fa';

const Takenote = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('Title');
  const [noteLines, setNoteLines] = useState(['', '', '', '', '', '', '', '', '']);
  const [charCount, setCharCount] = useState(0);
  const inputRefs = useRef([]);
  
  // Maximum characters per line
  const MAX_CHARS_PER_LINE = 40;
  
  // Get current date and time
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const day = now.getDate();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const formattedDate = `${month} ${day} ${time}`;
  
  // Calculate character count whenever noteLines change
  useEffect(() => {
    const totalChars = noteLines.reduce((acc, line) => acc + line.length, 0);
    setCharCount(totalChars);
  }, [noteLines]);
  
  // Handle line change with auto-move to next line
  const handleLineChange = (index, value) => {
    const newLines = [...noteLines];
    
    if (value.length > MAX_CHARS_PER_LINE) {
      const currentLineText = value.substring(0, MAX_CHARS_PER_LINE);
      const nextLineText = value.substring(MAX_CHARS_PER_LINE);
      
      newLines[index] = currentLineText;

      // Always add new line if needed
      if (index < newLines.length - 1) {
        newLines[index + 1] = nextLineText + newLines[index + 1];
      } else {
        newLines.push(nextLineText);
      }

      setNoteLines(newLines);

      // Focus on next line
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
          inputRefs.current[index + 1].selectionStart = 0;
          inputRefs.current[index + 1].selectionEnd = 0;
        }
      }, 0);
    } else {
      newLines[index] = value;
      setNoteLines(newLines);
    }
  };
  
  // Handle key press events
  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (index === noteLines.length - 1) {
        setNoteLines([...noteLines, '']);
      }
      setTimeout(() => {
        inputRefs.current[Math.min(index + 1, noteLines.length)]?.focus();
      }, 0);
    } else if (event.key === 'Backspace') {
      if (noteLines[index] === '' && index > 0) {
        event.preventDefault();
        const newLines = noteLines.filter((_, i) => i !== index);
        setNoteLines(newLines);
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 0);
      }
    }
  };
  
  // Handle save
  const handleSave = () => {
    const noteContent = noteLines.join('\n');
    onSave(title, noteContent);
  };
  
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 1050 }}>
      {/* Overlay background */}
      <div className="position-fixed top-0 start-0 w-100 h-100" 
           style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
           onClick={onClose}></div>
           
      {/* Note component */}
      <div className="position-relative rounded-3 p-3 p-md-4 overflow-auto" 
           style={{ 
             width: '90%',
             maxWidth: '500px', 
             height: '80vh',
             maxHeight: '600px',
             backgroundColor: '#FFEB9C', 
             boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
             zIndex: 1051 
           }}
           onClick={(e) => e.stopPropagation()}>
        {/* Title input */}
        <input 
          type="text" 
          className="border-0 bg-transparent fw-bold fs-2 fs-md-1 w-100 mb-1 text-dark" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          style={{ outline: 'none' }}
        />
        
        {/* Date display */}
        <div className="text-muted mb-3 mb-md-4 small">
          {formattedDate} | {charCount} characters
        </div>
        
        {/* Lines for note content - each is an input field */}
        <div className="mb-4">
          {noteLines.map((line, index) => (
            <div key={index} className="mb-2 mb-md-3 border-bottom border-1 border-dark" style={{ position: 'relative' }}>
              <input
                ref={el => inputRefs.current[index] = el}
                type="text"
                className="w-100 bg-transparent border-0 p-0"
                value={line}
                onChange={(e) => handleLineChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                style={{ 
                  outline: 'none',
                  paddingBottom: '8px'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Save button */}
        <div className="d-flex justify-content-end">
          <button 
            className="btn btn-light fw-bold px-3 px-md-4 py-2 rounded-3 shadow-sm"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Notes() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [showTakeNote, setShowTakeNote] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notes, setNotes] = useState([
    {id: 1, title: 'Sample Note 1', date: '2023-06-01' },
    {id: 2, title: 'Sample Note 2', date: '2023-06-02' },
    {id: 3, title: 'Sample Note 3', date: '2023-06-02' },
    {id: 4, title: 'Sample Note 4', date: '2023-06-02' },
    {id: 5, title: 'Sample Note 5', date: '2023-06-02' },
    {id: 6, title: 'Sample Note 6', date: '2023-06-02' },
    {id: 7, title: 'Sample Note 7', date: '2023-06-02' },
    {id: 8, title: 'Sample Note 8', date: '2023-06-03' },
    {id: 9, title: 'Sample Note 9', date: '2023-06-03' },
  ]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowMobileMenu(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle sidebar state change
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Function to handle document selection
  const handleDocClick = (docId) => {
    if (multiSelectMode) {
      // In multi-select mode, toggle document selection
      if (selectedDocs.includes(docId)) {
        setSelectedDocs(selectedDocs.filter(id => id !== docId));
      } else {
        setSelectedDocs([...selectedDocs, docId]);
      }
    } else {
      // In single-select mode, just set the selected document
      setSelectedDoc(docId === selectedDoc ? null : docId);
    }
  };

  // Function to toggle multi-select mode
  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    // Clear selections when toggling modes
    setSelectedDocs([]);
    setSelectedDoc(null);
  };

  // Function to handle download
  const handleDownload = () => {
    const docsToDownload = multiSelectMode ? selectedDocs : (selectedDoc ? [selectedDoc] : []);
    if (docsToDownload.length === 0) {
      alert("Please select document(s) to download");
      return;
    }
    
    const selectedDocuments = notes.filter(doc => docsToDownload.includes(doc.id));
    alert(`Downloading ${selectedDocuments.length} document(s): ${selectedDocuments.map(doc => doc.title).join(', ')}`);
    // In a real application, you would implement the actual download functionality here
  };

  // Function to handle delete
  const handleDelete = () => {
    const docsToDelete = multiSelectMode ? selectedDocs : (selectedDoc ? [selectedDoc] : []);
    if (docsToDelete.length === 0) {
      alert("Please select document(s) to delete");
      return;
    }
    
    const confirmDelete = window.confirm(`Are you sure you want to delete ${docsToDelete.length} document(s)?`);
    if (confirmDelete) {
      // In a real application, you would implement the actual delete functionality here
      alert(`Deleted ${docsToDelete.length} document(s)`);
      // For demonstration, we'll just clear the selections
      setSelectedDocs([]);
      setSelectedDoc(null);
    }
  };

  // Function to toggle take note modal
  const toggleTakeNote = () => {
    setShowTakeNote(!showTakeNote);
  };

  // Function to handle save note
  const handleSaveNote = (title, content) => {
    const newNote = {
      id: notes.length + 1,
      title: title,
      date: new Date().toISOString().split('T')[0],
      content: content
    };
    
    setNotes([...notes, newNote]);
    alert(`Note "${title}" saved successfully!`);
    setShowTakeNote(false);
  };

  return (
    <div className="d-flex page-background font-inter" style={{ minHeight: '100vh' }}>  
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          className="btn btn-light position-fixed rounded-circle p-2"
          style={{ zIndex: 1001, top: '1rem', left: '1rem' }}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Sidebar Menu */}
      <div 
        style={{ 
          position: 'fixed', 
          left: 10, 
          top: 10, 
          bottom: 0, 
          zIndex: 1000,
          transform: isMobile ? `translateX(${showMobileMenu ? '0' : '-100%'})` : 'none',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <SidebarMenu 
          showmenuicon={true} 
          onToggle={handleSidebarToggle}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 999,
            transition: 'opacity 0.3s'
          }}
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* Main content */}
      <div 
        className="flex-grow-1 p-3 p-md-4"
        style={{
          marginLeft: isMobile ? 0 : (isSidebarCollapsed ? '90px' : '340px'),
          maxWidth: isMobile ? '100%' : (isSidebarCollapsed ? 'calc(100% - 120px)' : 'calc(100% - 360px)'),
          transition: 'margin-left 0.3s ease-in-out, max-width 0.3s ease-in-out'
        }}
      >
        {/* Profile Header */}
        <div className="mb-3 mb-md-4">
          <ProfileHeader />
        </div>

        {/* Content Header */}
        <div className="mb-3 mb-md-4">
          <h1 className="h3 h2-md mb-1 mb-md-2 font-inter fw-bold">Take Notes</h1>
          <p className="text-muted small">
            Take your own notes, reminders of your sessions.
          </p>
        </div>
        
        <div className='w-100 rounded-3 bg-light p-3 p-md-4'>
          <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4 gap-2'>
            <h3 className='h5 h4-md fw-bold mb-0'>Meeting Name</h3>
            <button 
              className='btn btn-primary rounded-pill d-flex align-items-center gap-2 px-3 py-2'
              onClick={toggleTakeNote}
              aria-label="New note"
            >
              <span className="d-none d-md-inline">New</span> <FaPen size={windowWidth < 576 ? 14 : 16} />
            </button>  
          </div>
          
          <div className='bg-white rounded-3 p-2 p-md-3 shadow-sm'>
            <div className='d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center border-bottom pb-2 mb-3'>
              <span className='fs-6 fw-semibold mb-2 mb-sm-0'>Sort by type</span>
              <div className="d-flex gap-2 ms-auto">
                <button 
                  className={`btn ${multiSelectMode ? 'text-primary' : 'text-secondary'} border-0`}
                  onClick={toggleMultiSelectMode}
                  aria-label={multiSelectMode ? "Exit select mode" : "Enter select mode"}
                >
                  {multiSelectMode ? <FaCheckCircle /> : <FaRegCheckCircle />}
                </button>
                <button 
                  className="btn text-secondary border-0" 
                  onClick={handleDownload}
                  aria-label="Download selected"
                >
                  <FaDownload />
                </button>
                <button 
                  className="btn text-secondary border-0" 
                  onClick={handleDelete}
                  aria-label="Delete selected"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {/* note grid - improved for mobile responsiveness */}
            <div className="row g-2 g-md-3">
              {notes.map((doc) => (
                <div key={doc.id} className="col-6 col-sm-4 col-md-4 col-lg-3 col-xl-2">
                  <button 
                    className={`btn btn-light w-100 h-100 d-flex flex-column align-items-center justify-content-center p-2 position-relative rounded-3 ${
                      (multiSelectMode && selectedDocs.includes(doc.id)) || 
                      (!multiSelectMode && selectedDoc === doc.id) 
                        ? "active border-primary shadow-sm" 
                        : ""
                    }`}
                    style={{ 
                      minHeight: windowWidth < 576 ? '90px' : '120px',
                      border: '1px solid #dee2e6'
                    }}
                    onClick={() => handleDocClick(doc.id)}
                    aria-label={`Select ${doc.title}`}
                  >
                    {multiSelectMode && selectedDocs.includes(doc.id) && (
                      <div className="position-absolute top-0 end-0 m-1 text-primary">
                        <FaCheckCircle size={windowWidth < 576 ? 14 : 16} />
                      </div>
                    )}
                    <img 
                      src='/note.png' 
                      alt="Note" 
                      className="img-fluid mb-1" 
                      style={{ 
                        width: windowWidth < 576 ? '32px' : '40px', 
                        height: 'auto' 
                      }}
                    />
                    <span className='fw-light text-truncate w-100 small mt-1' style={{ fontSize: windowWidth < 576 ? '0.75rem' : '0.875rem' }}>
                      {doc.title}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Take Note Modal */}
      {showTakeNote && <Takenote onClose={toggleTakeNote} onSave={handleSaveNote} />}
    </div>
  );
}