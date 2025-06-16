import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../services/api.js';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import JobCard from '../components/JobCard.jsx';
import { Plus, Filter, Search, BarChart3, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    accepted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('-appliedDate');
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadJobs();
    loadStats();
  }, [statusFilter, sortBy]);

  const loadJobs = async () => {
    try {
      const data = await jobsAPI.getJobs({ status: statusFilter, sortBy });
      setJobs(data);
    } catch (error) {
      addNotification('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await jobsAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job application?')) {
      return;
    }

    try {
      await jobsAPI.deleteJob(jobId);
      setJobs(jobs.filter((job) => job._id !== jobId));
      loadStats();
      addNotification('Job application deleted successfully', 'success');
    } catch (error) {
      addNotification('Failed to delete job application', 'error');
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statCards = [
    { label: 'Total Applications', value: stats.total, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
    { label: 'Applied', value: stats.applied, icon: Clock, color: 'text-gray-600 bg-gray-50' },
    { label: 'Interviews', value: stats.interview, icon: BarChart3, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Offers', value: stats.offer, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'text-purple-600 bg-purple-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="input-field pl-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className="input-field pl-10 w-full sm:w-48"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>

            {/* Sort */}
            <select
              className="input-field w-full sm:w-48"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="-appliedDate">Newest First</option>
              <option value="appliedDate">Oldest First</option>
              <option value="company">Company A-Z</option>
              <option value="-company">Company Z-A</option>
              <option value="position">Position A-Z</option>
              <option value="-position">Position Z-A</option>
            </select>
          </div>

          <Link to="/jobs/new" className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Job</span>
          </Link>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No job applications found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search criteria or filters.'
              : 'Get started by adding your first job application.'}
          </p>
          <Link to="/jobs/new" className="btn-primary">
            Add Your First Job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
