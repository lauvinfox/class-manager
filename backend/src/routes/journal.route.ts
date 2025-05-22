import { Router } from "express";
import authenticate from "@middleware/authenticate";
import * as JournalController from "@controllers/journal.controller";

const router = Router();

// All journal routes are protected
router.use(authenticate);

// Add new journal
router.post("/", JournalController.createJournal);

// Get all journals
router.get("/", JournalController.getAllJournals);

// Get journal by ID
router.get("/:id", JournalController.getJournalById);

// Update a journal
router.put("/:id", JournalController.updateJournal);

// Delete a journal
router.delete("/:id", JournalController.deleteJournal);

export default router;
