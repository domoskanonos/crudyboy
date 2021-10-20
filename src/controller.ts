import express from 'express';
const app = express();
const port = 8080; // default port to listen

// define a route handler for the default home page
app.get("/", (req: any, res: any): any => {
  res.send("Hello world! $s",req);
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
