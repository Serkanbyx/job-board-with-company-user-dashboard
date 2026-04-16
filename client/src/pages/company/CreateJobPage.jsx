import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import * as jobService from '../../api/jobService';
import JobForm from '../../components/jobs/JobForm';

const CreateJobPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data) => {
    setIsLoading(true);
    try {
      await jobService.createJob(data);
      toast.success('Job posted successfully!');
      navigate('/company/jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-50 p-2.5 dark:bg-primary-950/30">
            <Briefcase className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Post a New Job
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Fill in the details below to create a new job listing.
            </p>
          </div>
        </div>
      </div>

      <JobForm mode="create" onSubmit={handleCreate} isLoading={isLoading} />
    </div>
  );
};

export default CreateJobPage;
