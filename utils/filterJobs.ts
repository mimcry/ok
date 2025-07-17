export const filterTodaysJobs = (jobs) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = jobs.filter(job => {
    const status = job.status?.toLowerCase();
    if (status === 'completed' || status === 'overdue') return false;
    if (!job.start_time) return false;

    const startDate = new Date(job.start_time);
    if (isNaN(startDate.getTime())) return false;
    startDate.setHours(0, 0, 0, 0);

    if (job.end_time) {
      const endDate = new Date(job.end_time);
      if (!isNaN(endDate.getTime())) {
        endDate.setHours(0, 0, 0, 0);
        return today >= startDate && today <= endDate;
      }
    }

    return startDate.getTime() === today.getTime();
  });

  const sorted = filtered.sort((a, b) => {
    const aStatus = a.status?.toLowerCase();
    const bStatus = b.status?.toLowerCase();

    if (aStatus === 'in-progress' && bStatus !== 'in-progress') return -1;
    if (bStatus === 'in-progress' && aStatus !== 'in-progress') return 1;

    const aStart = new Date(a.start_time).getTime();
    const bStart = new Date(b.start_time).getTime();
    return aStart - bStart;
  });

  // 🔥 Limit to 3 jobs max
  return sorted.slice(0, 3);
};

 
export const filterUpcomingJobs = (jobs) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingJobs = jobs.filter(job => {
    try {
      if (!job.start_time) return false;

      const jobDate = new Date(job.start_time);
      if (isNaN(jobDate.getTime())) {
        console.warn("Invalid job date:", job.start_time);
        return false;
      }

      jobDate.setHours(0, 0, 0, 0);
      return jobDate.getTime() > today.getTime();
    } catch (error) {
      console.error("Error in filterUpcomingJobs:", error);
      return false;
    }
  });

  // Sort by start_time (soonest first)
  const sortedJobs = upcomingJobs.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  // Return only the first 3
  return sortedJobs.slice(0, 3);
};
