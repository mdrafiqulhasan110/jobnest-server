const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bzloljf.mongodb.net/?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("jobnest110");
    const jobs = database.collection("jobs");
    const appliedJobs = database.collection("appliedJobs");

    app.get("/", (req, res) => {
      res.send("Jobnest Server Running");
    });

    app.post("/addjob", async (req, res) => {
      const newJob = req.body;
      const result = await jobs.insertOne(newJob);
      res.send(result);
    });

    app.post("/addappliedjob", async (req, res) => {
      const newAppliedJobs = req.body;
      const result = await appliedJobs.insertOne(newAppliedJobs);
      res.send(result);
    });

    app.get("/jobs", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { postedEmail: req.query.email };
      }
      const cursor = jobs.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/appliedjobs", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = appliedJobs.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobs.findOne(query);
      res.send(result);
    });

    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upset: true };
      const updatedJob = req.body;
      const job = {
        $set: { jobBannerURL: updatedJob.jobBannerURL, jobTitle: updatedJob.jobTitle, companyLogo: updatedJob.companyLogo, postedBy: updatedJob.postedBy, postedEmail: updatedJob.postedEmail, jobCategory: updatedJob.jobCategory, salaryRange: updatedJob.salaryRange, jobDescription: updatedJob.jobDescription, postingDate: updatedJob.postingDate, applicationDeadline: updatedJob.applicationDeadline, jobApplicantsNumber: updatedJob.jobApplicantsNumber },
      };

      const result = await jobs.updateOne(query, job, options);
      res.send(result);
    });

    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobs.deleteOne(query);
      res.send(result);
    });

    app.put("/jobs/increment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobs.updateOne(query, { $inc: { jobApplicantsNumber: 1 } });
      res.send(result);
    });

    // await client.connect();
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
