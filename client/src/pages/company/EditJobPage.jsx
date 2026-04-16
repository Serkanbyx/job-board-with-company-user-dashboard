import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import * as jobService from '../../api/jobService';
import { useAuth } from '../../contexts/AuthContext';
import JobForm from '../../components/jobs/JobForm';
import Spinner from '../../components/common/Spinner';

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        let found = null;
        let page = 1;
        const limit = 50;

        while (!found) {
          const data = await jobService.getMyJobs({ page, limit });
          const jobs = data.jobs || data.data || [];

          found = jobs.find((j) => j._id === id);
          if (found) break;

          const pagination = data.pagination;
          if (!pagination || page >= pagination.totalPages || jobs.length === 0) break;
          page++;
        }

        if (!found) {
          toast.error('Job not found or you do not have permission to edit it');
          navigate('/company/dashboard');
          return;
        }

        setJob(found);
      } catch (error) {
        toast.error(error.message || 'Failed to load job');
        navigate('/company/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate, user]);

  const handleUpdate = async (data) => {
    setIsSubmitting(true);
    try {
      await jobService.updateJob(id, data);
      toast.success('Job updated!');
      navigate('/company/jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update job');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" text="Loading job details..." />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-50 p-2.5 dark:bg-primary-950/30">
            <Pencil className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Edit Job
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update the details for <span className="font-medium text-slate-700 dark:text-slate-300">"{job.title}"</span>
            </p>
          </div>
        </div>
      </div>

      <JobForm
        mode="edit"
        initialData={job}
        onSubmit={handleUpdate}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default EditJobPage;
