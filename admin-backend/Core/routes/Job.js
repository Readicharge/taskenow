const express = require('express');
const router = express.Router();


// Import of the Job Controller
const Job = require("../controllers/Job");

// Creating the Job
router.post("/", Job.createJob);

// Getting all the Job
router.get("/", Job.getJob);

// Getting the Job for the Specific Technician - TODO check this out
router.get("/tech/:id", Job.getTechnicianJobList);

// Getting the Specific Job
router.get("/:id", Job.getSpecificJob);

// Updating the Job 
router.put("/:id", Job.updateJob);

// Deleting the Job 
router.post("/deleteJob", Job.deleteJob);

// Getting the Specific type of Job
router.post("/type", Job.getJobsofType);

module.exports = router;
