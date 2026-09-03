import { body } from "express-validator";

export const registerValidator = [
  body("email").isEmail().normalizeEmail(),
  body("name").optional().isString().trim().isLength({ min: 1, max: 120 }),
  body("password").isString().isLength({ min: 10, max: 128 })
];

export const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty()
];

export const refreshValidator = [
  body("refreshToken").isString().notEmpty()
];
