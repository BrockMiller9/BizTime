const express = require("express");
const app = express();
const ExpressError = require("./expressError");

app.use(express.json());

const companyRoutes = require("./routes/companies");
app.use("/companies", companyRoutes);

const invoiceRoutes = require("./routes/invoices");
app.use("/invoices", invoiceRoutes);

const industryRoutes = require("./routes/industries");
app.use("/industries", industryRoutes);

// 404 handler
app.use((req, res, next) => {
  const e = new ExpressError("Page Not Found", 404);
  next(e);
});

// general error handler
app.use((error, req, res, next) => {
  let status = error.status || 500;
  let message = error.message;
  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
