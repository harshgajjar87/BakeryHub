import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'sonner';
import { FaArrowLeft, FaShoppingCart, FaHeart, FaPlay, FaLink, FaBook, FaClock, FaUser, FaVideo } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import CoursePurchaseForm from '../components/CoursePurchaseForm';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course details');
      // Redirect to courses page if course not found
      if (error.response?.status === 404) {
        navigate('/courses');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id, navigate]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add courses to wishlist');
      navigate('/login');
      return;
    }

    if (isInWishlist(course._id)) {
      await removeFromWishlist(course._id);
    } else {
      await addToWishlist(course._id, 'course');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-3">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-5 text-center">
        <h3>Course not found</h3>
        <Link to="/courses" className="btn bakery-btn-primary mt-3">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Link to="/courses" className="btn btn-outline-secondary mb-4 d-inline-flex align-items-center">
        <FaArrowLeft className="me-2" /> Back to Courses
      </Link>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <img
              src={course.thumbnail}
              className="card-img-top"
              alt={course.title}
              style={{ height: '300px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
              }}
            />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="card-title bakery-text-brown fw-bold mb-3">{course.title}</h2>

              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  <span className="h4 price-text mb-0 d-block">₹{course.price}</span>
                </div>
                <div className="me-3">
                  <span className={`badge ${course.type === 'recorded' ? 'bg-primary' : 'bg-success'}`}>
                    {course.type === 'recorded' ? 'Recorded Course' : 'Live Course'}
                  </span>
                </div>
                <div>
                  <small className="text-muted">
                    <FaClock className="me-1" />
                    {course.content.duration}
                  </small>
                </div>
              </div>

              <div className="mb-3">
                <span className="text-muted me-2">
                  <FaUser className="me-1" />
                  Instructor: {course.instructor}
                </span>
                {isAuthenticated && (
                  <button
                    className={`btn btn-sm ms-2 ${isInWishlist(course._id) ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    title={isInWishlist(course._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <FaHeart className={isInWishlist(course._id) ? 'text-white' : ''} />
                  </button>
                )}
              </div>

              <div className="mb-4">
                <h5>Description</h5>
                <p className="text-muted">{course.description}</p>
              </div>

              {!course.hasAccess && (
                <div className="mb-4">
                  <button
                    className="btn bakery-btn-primary w-100 py-2"
                    onClick={() => setShowPurchaseForm(true)}
                  >
                    <FaShoppingCart className="me-2" />
                    Purchase Course
                  </button>
                </div>
              )}

              <div className="mt-4 pt-3 border-top">
                <small className="text-muted d-block mb-2">
                  Course ID: {course._id}
                </small>
                <small className="text-muted d-block">
                  Created on: {new Date(course.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      {course.hasAccess && (
        <div className="row mt-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  <FaVideo className="me-2" />
                  Course Content
                </h4>
              </div>
              <div className="card-body p-4">
                {course.type === 'recorded' && course.content.videoUrl && (
                  <div className="mb-4">
                    <h5>Course Video</h5>
                    <div className="ratio ratio-16x9">
                      <iframe
                        src={course.content.videoUrl}
                        title={course.title}
                        allowFullScreen
                        className="rounded"
                      ></iframe>
                    </div>
                  </div>
                )}

                {course.type === 'live' && course.content.meetLink && (
                  <div className="mb-4">
                    <h5>Live Session</h5>
                    <a
                      href={course.content.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success"
                    >
                      <FaLink className="me-2" />
                      Join Live Session
                    </a>
                    {course.content.schedule && (
                      <p className="mt-2 text-muted">
                        <FaClock className="me-1" />
                        Schedule: {course.content.schedule}
                      </p>
                    )}
                  </div>
                )}

                {course.modules && course.modules.length > 0 && (
                  <div className="mb-4">
                    <h5>Course Modules</h5>
                    <div className="list-group">
                      {course.modules.map((module, index) => (
                        <div key={index} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{module.title}</h6>
                              {module.duration && (
                                <small className="text-muted">
                                  <FaClock className="me-1" />
                                  {module.duration}
                                </small>
                              )}
                            </div>
                            {module.link && (
                              <a
                                href={module.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                <FaBook className="me-1" />
                                Access
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {course.materials && (
                  <div className="mb-4">
                    <h5>Course Materials</h5>
                    <a
                      href={course.materials}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary"
                    >
                      <FaBook className="me-2" />
                      Download Materials
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Details Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h4 className="bakery-text-brown fw-bold mb-3">Course Details</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h6>Instructor</h6>
                  <p>{course.instructor}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h6>Course Type</h6>
                  <p className="text-capitalize">{course.type}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h6>Duration</h6>
                  <p>{course.content.duration}</p>
                </div>
                {course.type === 'live' && course.content.schedule && (
                  <div className="col-md-6 mb-3">
                    <h6>Schedule</h6>
                    <p>{course.content.schedule}</p>
                  </div>
                )}
                <div className="col-md-6 mb-3">
                  <h6>Enrolled Students</h6>
                  <p>{course.enrolledCount}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h6>Status</h6>
                  <p>{course.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                {course.modules && course.modules.length > 0 && (
                  <div className="col-12 mb-3">
                    <h6>Course Modules</h6>
                    <ul className="list-unstyled">
                      {course.modules.map((module, index) => (
                        <li key={index} className="mb-2">
                          <strong>{module.title}</strong>
                          {module.duration && (
                            <span className="text-muted ms-2">
                              ({module.duration})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Purchase Form Modal */}
      {showPurchaseForm && (
        <CoursePurchaseForm
          course={course}
          onClose={() => setShowPurchaseForm(false)}
          onSuccess={(order) => {
            toast.success('Course purchase request submitted successfully!');
            fetchCourse(); // Refresh course data to update enrolled count
            navigate(`/orders/${order._id}`);
          }}
        />
      )}
    </div>
  );
};

export default CourseDetail;
