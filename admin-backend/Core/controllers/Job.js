// Job for the TaskeNow business 

const Job = require('../modals/Job');
const Users = require('../modals/Users');


// Creating the Job 
const createJob = async (req,res) => {
    try {
        const data = req.body;
        const lastId = await findMostRecentJob()
        if (lastId === 0) {
            data.taskNow_unique_id = `taske-job-${lastId}`
        }
        else {
            data.sequence_number = lastId + 1;
            data.taskNow_unique_id = `taske-job-${lastId + 1}`;
        }
        const newJob = new Job(data);
        await newJob.save();
        res.status(201).json(newJob);
    }
    catch(error) {
        res.status(400).json({error:error.message});
    }
}

// Getting the list of All the Job 
const getJob = async (req,res) => {
    try {
        const job = await Job.find();
        res.status(200).json(job);
    }
    catch(error) {
        res.status(400).json({error:error.message});
    }
}

// Getting the list of Jobs for the Particular Technician 
const getTechnicianJobList = async(req,res) => {
       try {
        const job = await Job.find({"technician.id": req.params.id});
        res.status(200).json(job);
    }
    catch(error) {
        res.status(400).json({error:error.message});
    }
}


// Getting the Specific Job by Id 
const getSpecificJob = async (req,res) => {
    try {
        const job = await Job.findById(req.params.id);
        res.status(200).json(job);
    }
    catch(error) {
        res.status(400).json({error:error.message});
    }
}


const updateJob = async (req, res) => {
    try {
      const JobId = req.params.id;
      const updateData = req.body;
  
      // Find the Job by ID and update their data
      const updatedJob = await Job.findByIdAndUpdate(
        JobId,
        updateData,
        { new: true } // To return the updated document
      );
  
      if (!updatedJob) {
        return res.status(404).json({ error: 'Job not found' });
      }
  
      // Return the updated Job data
      res.status(200).json(updatedJob);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


// Deleting the Job by Id 
const deleteJob = async (req,res) => {
    try {
        await Job.findByIdAndDelete(req.body.jobId);
        const userWithJob = await Users.findOne({
            email: req.body.customerEmail,
            phone: req.body.customerEmail
        })
        const updatedJobs = userWithJob.booked_jobs.filter(job => job._id.toString() !== req.body.jobId);
        userWithJob.booked_jobs = updatedJobs;
        const updatedUser = await Users.findByIdAndUpdate(userWithJob._id, userWithJob, {new: true})
        res.status(200).json({User: updatedUser._id});
    }
    catch(error) {
        res.status(400).json({error:error.message});
    }
}

const getDateString = (date) => {
    return `${new Date(date).getMonth()+1}/${new Date(date).getDate()}/${new Date(date).getFullYear()}`
}

const getJobsofType = async(req, res) => {
    try {
        const jobs = await Job.find({"job.type": req.body.type});
        const inspectionJob = jobs.map((job) => {
            return {
              jobId: job?.taskNow_unique_id,
              service: job?.job?.service || job?.job?.description,
              date: getDateString(job?.job?.dateOfJob),
              status: job?.job?.status?.assigned,
              details: job?.job?.description,
              customerName: `${job?.customer?.firstName} ${job?.customer?.lastName}`,
              customerAddress: job?.customer?.addressLine1,
              customerPhoneNumber: job?.customer?.phone,
              customerEmail: job?.customer?.email,
              jobDetails: job?.job?.service || job?.job?.description,
              jobAssignedStatus: job?.job?.status?.assigned,
              technicianStatus: job?.job?.status?.assigned,
              customerStatus: job?.job?.status?.customer,
              cost: job?.job?.cost,
              technicianAssigned: job?.technician?.phone != null ? true: false,
              technicianName: job?.technician?.firstName,
              technicianId: job?.technician?.id,
            }
          })
        res.status(200).json(inspectionJob);
    }
    catch(error) {
        res.status(400).json({error:error.message});
    }
}

const findMostRecentJob = async (req, res) => {
    try {
      // Find the most recent admin based on the createdAt field in descending order
      const mostRecentJob = await Job.findOne().sort({ sequence_number: -1 });
      
      if(mostRecentJob===null){
        return 0;
      }
      return mostRecentJob.sequence_number;
    } catch (error) {
       return null;
    }
};

// Exporting all the Categories
module.exports = { 
    createJob,
    getJob,
    getSpecificJob,
    updateJob,
    deleteJob,
    getTechnicianJobList,
    getJobsofType
}
