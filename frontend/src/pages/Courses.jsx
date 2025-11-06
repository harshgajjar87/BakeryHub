import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();

  const type = searchParams.get('type') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (type !== 'all') params.append('type', type);
        if (search) params.append('search', search);
        params.append('page', page);

        const response = await axios.get(`/api/courses?${params}`);
        setCourses(response.data.courses);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total
        });
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [type, search, page]);

  const handleTypeChange = (newType) => {
    const params = new URLSearchParams(searchParams);
    if (newType === 'all') {
      params.delete('type');
    } else {
      params.set('type', newType);
    }
    params.delete('page'); // Reset to page 1
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value.trim();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to page 1
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

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
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title bakery-text-brown fw-bold">Course Types</h5>
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${type === 'all' ? 'active' : ''}`}
                  onClick={() => handleTypeChange('all')}
                >
                  All Courses
                </button>
                <button
                  className={`list-group-item list-group-item-action ${type === 'recorded' ? 'active' : ''}`}
                  onClick={() => handleTypeChange('recorded')}
                >
                  Recorded Courses
                </button>
                <button
                  className={`list-group-item list-group-item-action ${type === 'live' ? 'active' : ''}`}
                  onClick={() => handleTypeChange('live')}
                >
                  Live Courses
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          {/* Search Bar */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="d-flex">
              <input
                type="text"
                name="search"
                className="form-control me-2"
                placeholder="Search courses..."
                defaultValue={search}
              />
              <button type="submit" className="btn bakery-btn-primary">
                Search
              </button>
            </form>
          </div>

          {/* Results Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="bakery-text-brown fw-bold mb-0">
              {type === 'all' ? 'All Courses' : `${type.charAt(0).toUpperCase() + type.slice(1)} Courses`}
              {search && ` - "${search}"`}
            </h2>
            <span className="text-muted">{pagination.total} courses found</span>
          </div>

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search fs-1 text-muted mb-3"></i>
              <h4>No courses found</h4>
              <p className="text-muted">Try adjusting your search or type filter</p>
            </div>
          ) : (
            <>
              <div className="row">
                {courses.map((course) => (
                  <div key={course._id} className="col-lg-4 col-md-6 mb-4">
                    <div className="card course-card h-100">
                      <div className="position-relative">
                        <img
                          src={course.thumbnail}
                          className="card-img-top"
                          alt={course.title}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                        <span className={`badge position-absolute top-0 start-0 m-2 ${course.type === 'live' ? 'bg-danger' : 'bg-success'}`}>
                          {course.type === 'live' ? 'Live' : 'Recorded'}
                        </span>
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{course.title}</h5>
                        <p className="card-text text-muted small mb-1">
                          By {course.instructor}
                        </p>
                        <p className="card-text text-muted flex-grow-1">
                          {course.description.substring(0, 100)}...
                        </p>
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="price-text">₹{course.price}</span>
                            <small className="text-muted">
                              {course.content.duration && `${course.content.duration} hours`}
                            </small>
                          </div>
                          <Link
                            to={`/courses/${course._id}`}
                            className="btn bakery-btn-primary btn-sm w-100"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav aria-label="Course pagination" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>

                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${pagination.currentPage === index + 1 ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
