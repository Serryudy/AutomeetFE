'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/global.css';
import SidebarMenu from '../../components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaSearch, FaFilter, FaSortAmountDown, FaRegCheckCircle, FaDownload, FaTrash, FaCheckCircle, FaBars } from 'react-icons/fa';

export default function Content() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const docs = [
    {id: 1, title: 'Sample Document 1', type: 'word', date: '2023-06-01' },
    {id: 2, title: 'Sample Document 2', type: 'pdf', date: '2023-06-02' },
    {id: 3, title: 'Sample Document 3', type: 'pdf', date: '2023-06-02' },
    {id: 4, title: 'Sample Document 4', type: 'image', date: '2023-06-02' },
    {id: 5, title: 'Sample Document 5', type: 'excel', date: '2023-06-02' },
    {id: 6, title: 'Sample Document 6', type: 'image', date: '2023-06-02' },
    {id: 7, title: 'Sample Document 7', type: 'image', date: '2023-06-02' },
    {id: 8, title: 'Sample Document 8', type: 'pdf', date: '2023-06-03' },
    {id: 9, title: 'Sample Document 9', type: 'word', date: '2023-06-03' },
  ];

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleDocClick = (docId) => {
    if (multiSelectMode) {
      if (selectedDocs.includes(docId)) {
        setSelectedDocs(selectedDocs.filter(id => id !== docId));
      } else {
        setSelectedDocs([...selectedDocs, docId]);
      }
    } else {
      setSelectedDoc(docId === selectedDoc ? null : docId);
    }
  };

  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    setSelectedDocs([]);
    setSelectedDoc(null);
  };

  const handleDownload = () => {
    const docsToDownload = multiSelectMode ? selectedDocs : (selectedDoc ? [selectedDoc] : []);
    if (docsToDownload.length === 0) {
      alert("Please select document(s) to download");
      return;
    }
    const selectedDocuments = docs.filter(doc => docsToDownload.includes(doc.id));
    alert(`Downloading ${selectedDocuments.length} document(s): ${selectedDocuments.map(doc => doc.title).join(', ')}`);
  };

  const handleDelete = () => {
    const docsToDelete = multiSelectMode ? selectedDocs : (selectedDoc ? [selectedDoc] : []);
    if (docsToDelete.length === 0) {
      alert("Please select document(s) to delete");
      return;
    }
    const confirmDelete = window.confirm(`Are you sure you want to delete ${docsToDelete.length} document(s)?`);
    if (confirmDelete) {
      alert(`Deleted ${docsToDelete.length} document(s)`);
      setSelectedDocs([]);
      setSelectedDoc(null);
    }
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
          <h1 className="h3 h2-md mb-1 mb-md-2 font-inter fw-bold">Content Upload</h1>
          <p className="text-muted small">
            Keep things related to your session in one place.
          </p>
        </div>
        
        <div className='w-100 rounded-3 bg-light p-3 p-md-4'>
          <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4 gap-2'>
            <h3 className='h5 h4-md fw-bold mb-0'>Meeting Name</h3>
            <button className='btn btn-primary rounded-pill d-flex align-items-center gap-2 px-3 py-2'>
              Upload 
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

            {/* Responsive Document Grid */}
            <div className="row g-2 g-md-3">
              {docs.map((doc) => (
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
                      src={`/${doc.type}.png`} 
                      alt={doc.type} 
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
    </div>
  );
}