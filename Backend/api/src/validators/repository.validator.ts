import { body, param, query } from "express-validator";

export const importRepositoryValidator = [
  body("fullName").isString().trim().matches(/^[\w.-]+\/[\w.-]+$/)
];

export const repositoryIdValidator = [
  param("id").isUUID()
];

export const searchRepositoryValidator = [
  ...repositoryIdValidator,
  query("q").isString().trim().isLength({ min: 2, max: 500 })
];

export const chatRepositoryValidator = [
  ...repositoryIdValidator,
  body("question").isString().trim().isLength({ min: 2, max: 2000 }),
  body("chatId").optional().isUUID()
];

export const generateDocumentationValidator = [
  ...repositoryIdValidator,
  body("type").isIn(["README", "API", "ARCHITECTURE", "ONBOARDING"])
];
