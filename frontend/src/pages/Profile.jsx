import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaCamera, FaSave, FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserCircle } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile, uploadProfileImage } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        state: user.profile?.state || '',
        zipCode: user.profile?.zipCode || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile(formData);

    if (result.success) {
      setIsEditing(false);
    }

    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageLoading(true);

    const result = await uploadProfileImage(file);

    if (!result.success) {
      alert(result.message);
    }

    setImageLoading(false);
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bakery-bg py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="card-header text-white position-relative" style={{
                background: 'linear-gradient(135deg, var(--bakery-brown) 0%, var(--bakery-brown-dark) 100%)',
                borderBottom: 'none',
                padding: '2rem 2rem 3rem'
              }}>
                <div className="text-center">
                  <h2 className="mb-3 fw-bold">
                    <FaUser className="me-3" />
                    My Profile
                  </h2>
                  <p className="mb-0 opacity-75">Manage your account information and preferences</p>
                </div>
              </div>

              <div className="card-body p-5">
                {/* Profile Image Section */}
                <div className="text-center mb-5">
                  <div className="position-relative d-inline-block">
                    {user.profile?.profileImage ? (
                      <img
                        src={user.profile.profileImage}
                        alt="Profile"
                        className="rounded-circle shadow-lg border-4 border-white"
                        style={{
                          width: '140px',
                          height: '140px',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div
                        className="rounded-circle shadow-lg border-4 border-white d-flex align-items-center justify-content-center"
                        style={{
                          width: '140px',
                          height: '140px',
                          background: 'linear-gradient(135deg, var(--bakery-cream) 0%, var(--bakery-light-gray) 100%)',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        <FaUserCircle size={70} className="bakery-text-brown" />
                      </div>
                    )}

                    <label
                      htmlFor="profileImageInput"
                      className="position-absolute bottom-0 end-0 bakery-btn-primary rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                      style={{
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        border: '3px solid white',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      {imageLoading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <FaCamera size={18} />
                      )}
                    </label>

                    <input
                      type="file"
                      id="profileImageInput"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={imageLoading}
                    />
                  </div>
                  <p className="text-muted mt-3 small">Click the camera icon to upload a profile picture</p>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">
                        <FaEnvelope className="me-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={user.email}
                        disabled
                      />
                      <div className="form-text">
                        <small className="text-muted">
                          Email cannot be changed. Contact support if you need to update it.
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">
                        <FaPhone className="me-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="zipCode" className="form-label">
                        <FaMapMarkerAlt className="me-1" />
                        Zip Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter zip code"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">
                      <FaMapMarkerAlt className="me-1" />
                      Address
                    </label>
                    <textarea
                      className="form-control"
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your full address"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="city" className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="state" className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter state"
                      />
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="mt-5 p-4 rounded-3" style={{
                    background: 'linear-gradient(135deg, var(--bakery-cream) 0%, rgba(255,255,255,0.8) 100%)',
                    border: '2px solid var(--bakery-gold)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}>
                    <h5 className="bakery-text-brown fw-bold mb-4 text-center">
                      <FaUser className="me-2" />
                      Account Information
                    </h5>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="text-center">
                          <small className="text-muted d-block mb-1">Role</small>
                          <span className="badge fs-6 px-3 py-2 bakery-btn-primary">{user.role || 'Customer'}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="text-center">
                          <small className="text-muted d-block mb-1">Member Since</small>
                          <p className="mb-0 fw-semibold bakery-text-brown">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="text-center">
                          <small className="text-muted d-block mb-1">Status</small>
                          <span className={`badge fs-6 px-3 py-2 ${user.isVerified ? 'bg-success' : 'bg-warning'}`}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="text-center">
                          <small className="text-muted d-block mb-1">Last Updated</small>
                          <p className="mb-0 fw-semibold bakery-text-brown">
                            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-center gap-3 mt-5">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-lg px-4"
                          onClick={() => setIsEditing(false)}
                          style={{ transition: 'all 0.3s ease' }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          <FaEdit className="me-2" />
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn bakery-btn-primary btn-lg px-4"
                          disabled={loading}
                          style={{ transition: 'all 0.3s ease' }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          {loading ? (
                            <>
                              <span className="loading-spinner me-2"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave className="me-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn bakery-btn-primary btn-lg px-5"
                        onClick={() => setIsEditing(true)}
                        style={{ transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        <FaEdit className="me-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
