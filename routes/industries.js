const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`
      SELECT i.code, i.industry, array_agg(ci.company_code) AS company_codes
      FROM industries i
      LEFT JOIN company_industries ci ON i.code = ci.industry_code
      GROUP BY i.code, i.industry
      ORDER BY i.code
    `);
    return res.json({ industries: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const results = await db.query(`SELECT * FROM industries WHERE code=$1`, [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find industry with code of ${code}`, 404);
    }
    return res.json({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let { code, industry } = req.body;
    code = slugify(code, { lower: true, remove: /[*+~.()'"!:@]/g });
    const results = await db.query(
      `INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *`,
      [code, industry]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/:company_code/:industry_code", async (req, res, next) => {
  try {
    const { company_code, industry_code } = req.params;
    const results = await db.query(
      `INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2) RETURNING *`,
      [company_code, industry_code]
    );
    return res.status(201).json({ company_industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
