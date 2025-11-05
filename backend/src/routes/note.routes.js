import { Router } from "express";
import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  togglePinNote,
  archiveNote,
  unarchiveNote,
  getUserTags,
  bulkDeleteNotes,
} from "../controllers/notes.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllNotes).post(createNote);

router
  .route("/:id")
  .get(getNoteById)
  .patch(updateNote)
  .delete(deleteNote);

router.patch("/:id/pin", togglePinNote);
router.patch("/:id/archive", archiveNote);
router.patch("/:id/unarchive", unarchiveNote);


router.get("/tags/all", getUserTags);
router.post("/bulk-delete", bulkDeleteNotes);

export default router;