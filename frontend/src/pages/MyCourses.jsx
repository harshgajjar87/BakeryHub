import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/courses/user/purchased');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching purchased courses:', error);
        toast.error('Failed to load your courses');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPurchasedCourses();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="loading-spinner mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="bakery-text-brown fw-bold mb-4">My Courses</h1>

          {courses.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-book fs-1 text-muted mb-3"></i>
              <h4>No courses purchased yet</h4>
              <p className="text-muted mb-4">Browse our courses and start learning today!</p>
              <Link to="/courses" className="btn bakery-btn-primary">
                Browse Courses
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-muted">You have access to {courses.length} course{courses.length !== 1 ? 's' : ''}</p>
              </div>

              <div className="row">
                {courses.map((purchase) => (
                  <div key={purchase._id} className="col-lg-4 col-md-6 mb-4">
                    <div className="card course-card h-100">
                      <div className="position-relative">
                        <img
                          src={purchase.course.thumbnail}
                          className="card-img-top"
                          alt={purchase.course.title}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                        <span className={`badge position-absolute top-0 start-0 m-2 ${purchase.course.type === 'live' ? 'bg-danger' : 'bg-success'}`}>
                          {purchase.course.type === 'live' ? 'Live' : 'Recorded'}
                        </span>
                        <span className="badge bg-primary position-absolute top-0 end-0 m-2">
                          Purchased
                        </span>
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{purchase.course.title}</h5>
                        <p className="card-text text-muted small mb-1">
                          By {purchase.course.instructor}
                        </p>
                        <p className="card-text text-muted flex-grow-1">
                          {purchase.course.description.substring(0, 100)}...
                        </p>
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="price-text">₹{purchase.course.price}</span>
                            <small className="text-muted">
                              Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}
                            </small>
                          </div>
                          <Link
                            to={`/courses/${purchase.course._id}`}
                            className="btn bakery-btn-primary btn-sm w-100"
                          >
                            Access Course
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
