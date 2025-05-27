'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaSearch, FaFilter, FaSortAmountDown, FaRegCheckCircle, FaDownload, FaTrash, FaCheckCircle, FaBars } from 'react-icons/fa';
import { useParams } from 'next/navigation';

const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

const downloadZip = async (files) => {
  try {
    // Using JSZip library - make sure to add this to your dependencies
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Download all files and add them to the zip
    await Promise.all(
      files.map(async (file) => {
        const response = await fetch(file.url);
        const blob = await response.blob();
        zip.file(file.name, blob);
      })
    );

    // Generate and download the zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = window.URL.createObjectURL(zipBlob);
    
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = 'meeting_documents.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(zipUrl);
  } catch (error) {
    console.error('Zip download failed:', error);
    throw error;
  }
};

export default function Content() {
  const params = useParams();
  const meetingId = params?.id;

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [documents, setDocuments] = useState([]);

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

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}/content`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }

        const data = await response.json();
        console.log('Fetched content:', data);
        
        // Extract all content items from the nested structure
        let allDocuments = [];
        if (Array.isArray(data)) {
          // Flatten the structure by extracting all content arrays
          data.forEach(item => {
            if (item && Array.isArray(item.content)) {
              // Add the content items with additional metadata
              item.content.forEach(doc => {
                allDocuments.push({
                  ...doc,
                  parentId: item.id,
                  uploaderId: item.uploaderId,
                  username: item.username
                });
              });
            }
          });
        }
        
        setDocuments(allDocuments);
      } catch (error) {
        console.error('Error fetching content:', error);
        setUploadError('Failed to load content');
        setDocuments([]);
      }
    };

    if (meetingId) {
      fetchContent();
    }
  }, [meetingId]);

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

  const handleDownload = async () => {
    try {
      const docsToDownload = multiSelectMode 
        ? selectedDocs.map(index => documents[index]).filter(Boolean)
        : (selectedDoc !== null ? [documents[selectedDoc]].filter(Boolean) : []);

      if (docsToDownload.length === 0) {
        alert("Please select document(s) to download");
        return;
      }

      // Show loading state
      setIsUploading(true); // Reuse the upload loading state for downloads

      if (docsToDownload.length === 1) {
        // Single file download
        await downloadFile(docsToDownload[0].url, docsToDownload[0].name);
      } else {
        // Multiple files - create zip
        await downloadZip(docsToDownload);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    const docsToDelete = multiSelectMode ? selectedDocs : (selectedDoc !== null ? [selectedDoc] : []);
    if (docsToDelete.length === 0) {
      alert("Please select document(s) to delete");
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete ${docsToDelete.length} document(s)?`);
    if (confirmDelete) {
      try {
        // Add your delete API call here
        // After successful deletion:
        setDocuments(prevDocuments => {
          // Ensure prevDocuments is an array before filtering
          if (!Array.isArray(prevDocuments)) {
            return [];
          }
          return prevDocuments.filter((_, index) => !docsToDelete.includes(index));
        });
        setSelectedDocs([]);
        setSelectedDoc(null);
      } catch (error) {
        console.error('Error deleting documents:', error);
        alert('Failed to delete documents');
      }
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Cloudinary configuration
      const cloudName = 'duocpqb1j';
      const uploadPreset = 'content_uploads';
      const uploadedContent = [];

      for (const file of files) {
        // File size validation (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 10MB limit`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        // Upload to Cloudinary
        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const uploadData = await uploadResponse.json();
        
        // Determine content type
        let type_;
        const fileType = file.type.split('/')[0];
        switch (fileType) {
          case 'image':
            type_ = 'image';
            break;
          case 'video':
            type_ = 'video';
            break;
          default:
            type_ = 'document';
        }

        uploadedContent.push({
          url: uploadData.secure_url,
          type_: type_,
          name: file.name,
          uploadedAt: new Date().toISOString()
        });
      }

      // Submit content to your API
      const apiResponse = await fetch(`http://localhost:8080/api/meetings/${meetingId}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: uploadedContent
        })
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to save content metadata');
      }

      const savedContent = await apiResponse.json();
      
      // Update documents list with new uploads
      setDocuments(prevDocuments => {
        const prevArray = Array.isArray(prevDocuments) ? prevDocuments : [];
        return [...prevArray, ...uploadedContent];
      });
      
      setUploadSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function that correctly takes the document name as a parameter
  const getIconForType = (type_, fileName) => {
    if (!type_ || !fileName) return '/document.png';

    switch (type_.toLowerCase()) {
      case 'image':
        return '/image.png';
      case 'video':
        return '/video.png';
      case 'document':
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        switch (fileExtension) {
          case 'pdf':
            return '/pdf.png';
          case 'doc':
          case 'docx':
            return '/word.png';
          case 'xls':
          case 'xlsx':
            return '/excel.png';
          default:
            return '/document.png';
        }
      default:
        return '/document.png';
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
            <div className="d-flex flex-column align-items-end">
              <label className='btn btn-primary rounded-pill d-flex align-items-center gap-2 px-3 py-2'>
                {isUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    Upload
                    <input
                      type="file"
                      multiple
                      className="d-none"
                      onChange={handleFileUpload}
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    />
                  </>
                )}
              </label>
              {uploadError && (
                <small className="text-danger mt-1">{uploadError}</small>
              )}
              {uploadSuccess && (
                <small className="text-success mt-1">Upload successful!</small>
              )}
            </div>
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
                  disabled={isUploading}
                  aria-label="Download selected"
                >
                  {isUploading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  ) : (
                    <FaDownload />
                  )}
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
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <div key={index} className="col-6 col-sm-4 col-md-4 col-lg-3 col-xl-2">
                    <button 
                      className={`btn btn-light w-100 h-100 d-flex flex-column align-items-center justify-content-center p-2 position-relative rounded-3 ${
                        (multiSelectMode && selectedDocs.includes(index)) || 
                        (!multiSelectMode && selectedDoc === index) 
                          ? "active border-primary shadow-sm" 
                          : ""
                      }`}
                      style={{ 
                        minHeight: windowWidth < 576 ? '90px' : '120px',
                        border: '1px solid #dee2e6'
                      }}
                      onClick={() => handleDocClick(index)}
                      aria-label={`Select ${doc.name}`}
                    >
                      {multiSelectMode && selectedDocs.includes(index) && (
                        <div className="position-absolute top-0 end-0 m-1 text-primary">
                          <FaCheckCircle size={windowWidth < 576 ? 14 : 16} />
                        </div>
                      )}
                      <img 
                        src={getIconForType(doc.type_, doc.name)} 
                        alt={doc.type_ || 'document'} 
                        className="img-fluid mb-1" 
                        style={{ 
                          width: windowWidth < 576 ? '32px' : '40px', 
                          height: 'auto' 
                        }}
                      />
                      <span className='fw-light text-truncate w-100 small mt-1' 
                        style={{ fontSize: windowWidth < 576 ? '0.75rem' : '0.875rem' }}>
                        {doc.name || 'Unnamed document'}
                      </span>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'No date'}
                      </small>
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">No documents uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}