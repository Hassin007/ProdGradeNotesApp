import { Note } from "../models/note.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";

export const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags, isPinned } = req.body;
  const userId = req.user._id;

  if (!title || title.trim() === "") {
    logger.warn("Attempt to create note without title", { userId });
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  const note = await Note.create({
    title,
    content: content || "",
    tags: tags || [],
    user: userId,
    isPinned: isPinned || false,
  });

  logger.info("Note created successfully", { userId, noteId: note._id });

  res.status(201).json({
    success: true,
    message: "Note created successfully",
    data: note,
  });
});

export const getAllNotes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { search, tags, isPinned, isArchived } = req.query;

  const query = { user: userId };
  query.isArchived = isArchived === "true" ? true : false;

  if (isPinned !== undefined) {
    query.isPinned = isPinned === "true";
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  if (tags) {
    const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
    query.tags = { $in: tagArray };
  }

  const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });
  logger.debug("Fetched notes", { userId, count: notes.length });

  res.status(200).json({
    success: true,
    count: notes.length,
    data: notes,
  });
});

export const getNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: id, user: userId });

  if (!note) {
    logger.warn("Note not found", { userId, noteId: id });
    return res.status(404).json({
      success: false,
      message: "Note not found",
    });
  }

  logger.debug("Note retrieved", { userId, noteId: id });

  res.status(200).json({
    success: true,
    data: note,
  });
});

export const updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { title, content, tags, isPinned } = req.body;

  const note = await Note.findOne({ _id: id, user: userId });

  if (!note) {
    logger.warn("Attempt to update non-existent note", { userId, noteId: id });
    return res.status(404).json({
      success: false,
      message: "Note not found",
    });
  }

  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (tags !== undefined) note.tags = tags;
  if (isPinned !== undefined) note.isPinned = isPinned;

  await note.save();
  logger.info("Note updated successfully", { userId, noteId: id });

  res.status(200).json({
    success: true,
    message: "Note updated successfully",
    data: note,
  });
});

export const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const note = await Note.findOneAndDelete({ _id: id, user: userId });

  if (!note) {
    logger.warn("Attempt to delete non-existent note", { userId, noteId: id });
    return res.status(404).json({
      success: false,
      message: "Note not found",
    });
  }

  logger.info("Note deleted", { userId, noteId: id });

  res.status(200).json({
    success: true,
    message: "Note deleted successfully",
  });
});

export const togglePinNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: id, user: userId });

  if (!note) {
    logger.warn("Attempt to pin/unpin non-existent note", { userId, noteId: id });
    return res.status(404).json({
      success: false,
      message: "Note not found",
    });
  }

  note.isPinned = !note.isPinned;
  await note.save();

  logger.info(`Note ${note.isPinned ? "pinned" : "unpinned"}`, { userId, noteId: id });

  res.status(200).json({
    success: true,
    message: `Note ${note.isPinned ? "pinned" : "unpinned"} successfully`,
    data: note,
  });
});

export const archiveNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: id, user: userId });

  if (!note) {
    logger.warn("Attempt to archive non-existent note", { userId, noteId: id });
    return res.status(404).json({
      success: false,
      message: "Note not found",
    });
  }

  note.isArchived = true;
  note.isPinned = false;
  await note.save();

  logger.info("Note archived", { userId, noteId: id });

  res.status(200).json({
    success: true,
    message: "Note archived successfully",
    data: note,
  });
});

export const unarchiveNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: id, user: userId });

  if (!note) {
    logger.warn("Attempt to unarchive non-existent note", { userId, noteId: id });
    return res.status(404).json({
      success: false,
      message: "Note not found",
    });
  }

  note.isArchived = false;
  await note.save();

  logger.info("Note unarchived", { userId, noteId: id });

  res.status(200).json({
    success: true,
    message: "Note unarchived successfully",
    data: note,
  });
});

export const getUserTags = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const tags = await Note.distinct("tags", { user: userId, isArchived: false });

  logger.debug("Fetched user tags", { userId, tagCount: tags.length });

  res.status(200).json({
    success: true,
    count: tags.length,
    data: tags,
  });
});

export const bulkDeleteNotes = asyncHandler(async (req, res) => {
  const { noteIds } = req.body;
  const userId = req.user._id;

  if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
    logger.warn("Invalid bulk delete request", { userId });
    return res.status(400).json({
      success: false,
      message: "Please provide an array of note IDs",
    });
  }

  const result = await Note.deleteMany({
    _id: { $in: noteIds },
    user: userId,
  });

  logger.info("Bulk notes deleted", { userId, deletedCount: result.deletedCount });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} note(s) deleted successfully`,
    deletedCount: result.deletedCount,
  });
});
