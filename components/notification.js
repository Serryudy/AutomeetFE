import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const NotificationsComponent = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Mark Your Availability!',
      message: 'Select best time for your upcoming meeting',
      read: false
    },
    {
      id: 2,
      title: 'Meeting Confirmed',
      message: 'The meeting has been finalized. Please prepare.',
      read: false
    },
    {
      id: 3,
      title: 'Meeting Confirmed',
      message: 'Select best time for your upcoming meeting',
      read: false
    },
    {
      id: 4,
      title: 'Meeting Cancellation',
      message: 'The meeting titled [Meeting Title] scheduled for [Meeting Date and Time] has been canceled.',
      read: true
    },
    {
      id: 5,
      title: 'Meeting Cancellation',
      message: 'The meeting titled [Meeting Title] scheduled for [Meeting Date and Time] has been canceled.',
      read: true
    }
  ]);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="notifications-container" style={{ maxWidth: '550px', borderRadius: '15px', width: '370px' }}>
      <div className="card shadow">
        {/* Header */}
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0 fw-bold">Notifications</h5>
          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-primary text-decoration-none me-2"
              onClick={handleMarkAllAsRead}
              style={{ fontSize: '14px' }}
            >
              Mark all as read
            </button>
            <button className="btn-close" aria-label="Close" onClick={handleClose} style={{ fontSize: '12px' }} ></button>
          </div>
        </div>

        {/* Body with sticky tabs */}
        <div className="card-body p-0" style={{ height: '350px', overflowY: 'auto' }}>
          {/* Tabs */}
          <ul
            className="nav nav-tabs border-0"
            style={{
              position: 'sticky',
              top: 0,
              backgroundColor: '#fff',
              zIndex: 1
            }}
          >
            <li className="nav-item flex-grow-1 text-center">
              <button
                className={`nav-link border-0 rounded-0 w-100 ${activeTab === 'all' ? 'active border-bottom border-primary border-3' : ''
                  }`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
            </li>
            <li className="nav-item flex-grow-1 text-center">
              <button
                className={`nav-link border-0 rounded-0 w-100 ${activeTab === 'unread' ? 'active border-bottom border-primary border-3' : ''
                  }`}
                onClick={() => setActiveTab('unread')}
              >
                Unread {unreadCount > 0 && <span className="badge bg-primary rounded-pill ms-1">{unreadCount}</span>}
              </button>
            </li>
            <li className="nav-item flex-grow-1 text-center">
              <button
                className={`nav-link border-0 rounded-0 w-100 ${activeTab === 'read' ? 'active border-bottom border-primary border-3' : ''
                  }`}
                onClick={() => setActiveTab('read')}
              >
                Read
              </button>
            </li>
          </ul>

          {/* Notification List */}
          <div className="list-group list-group-flush">
            {filteredNotifications.length === 0 ? (
              <div className="list-group-item text-center py-4 text-muted">
                {activeTab === 'unread' && 'No unread notifications.'}
                {activeTab === 'read' && 'No read notifications.'}
                {activeTab === 'all' && 'No notifications available.'}
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`list-group-item list-group-item-action ${!notification.read ? 'bg-light' : ''}`}
                >
                  <div className="d-flex w-100 align-items-center">
                    <div className="flex-grow-1">

                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>
                          <h6 className="mb-1 fw-bold" style={{ fontSize: "15px" }}>{notification.title}</h6>
                        </div>
                        {!notification.read && (
                          <div className="me-2" style={{ width: '20px', height: '20px' }}>
                            <div
                              className="bg-primary rounded-circle"
                              style={{ width: '10px', height: '10px', margin: '2px 0 0 10px' }}
                            ></div>
                          </div>
                        )}
                      </div>
                      <p className="mb-1" style={{ fontSize: "14px" }}>{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white text-center py-2">
          <button className="btn btn-link text-primary text-decoration-none">View all ...</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsComponent;
