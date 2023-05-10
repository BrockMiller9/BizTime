const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
    }
    return res.json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const { amt } = req.body;
    const results = await db.query(
      `UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`,
      [amt, id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
    }
    return res.json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const results = await db.query(
      `DELETE FROM invoices WHERE id=$1 RETURNING *`,
      [id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
    }
    return res.json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

router.get("/companies/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const results = await db.query(
      `SELECT * FROM invoices WHERE comp_code=$1`,
      [code]
    );
    const company_res = await db.query(
      `SELECT * FROM companies WHERE code=$1`,
      [code]
    );
    if (company_res.rows.length === 0 || results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    const company = company_res.rows[0];
    const invoices = results.rows;
    return res.json({ company: { ...company, invoices } });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
