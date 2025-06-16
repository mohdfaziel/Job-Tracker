import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, DollarSign, Edit, Trash2 } from 'lucide-react';

const JobCard = ({ job, onDelete }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'status-applied';
      case 'interview':
        return 'status-interview';
      case 'offer':
        return 'status-offer';
      case 'rejected':
        return 'status-rejected';
      case 'accepted':
        return 'status-accepted';
      default:
        return 'status-applied';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {job.position}
          </h3>
          <p className="text-gray-600 font-medium">{job.company}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/jobs/${job._id}/edit`}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onDelete(job._id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(job.appliedDate), 'MMM dd, yyyy')}</span>
        </div>
        {job.location && (
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className={getStatusClass(job.status)}>
          {job.status}
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View Details →
        </Link>
      </div>

      {job.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">{job.notes}</p>
        </div>
      )}
    </div>
  );
};

export default JobCard;
