const Bookmark = require('../models/Bookmark');
const UserNote = require('../models/UserNote');
const VisitorFavorites = require('../models/VisitorFavorites');
const { validationResult } = require('express-validator');

class CollectionController {
  // Bookmarks
  async getBookmarks(req, res) {
    try {
      const {
        folder,
        resourceType,
        priority,
        page = 1,
        limit = 20,
        sort = 'createdAt'
      } = req.query;

      const query = { user: req.user.id };
      
      if (folder) query.folder = folder;
      if (resourceType) query.resourceType = resourceType;
      if (priority) query.priority = priority;

      const bookmarks = await Bookmark.find(query)
        .sort({ [sort]: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Bookmark.countDocuments(query);

      // Get folder statistics
      const folderStats = await Bookmark.aggregate([
        { $match: { user: req.user.id } },
        { $group: { _id: '$folder', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: bookmarks,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        folders: folderStats
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createBookmark(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        resourceType,
        resourceId,
        title,
        description,
        imageUrl,
        url,
        category,
        tags,
        notes,
        folder = 'General',
        priority = 3
      } = req.body;

      // Check if bookmark already exists
      const existingBookmark = await Bookmark.findOne({
        user: req.user.id,
        resourceType,
        resourceId
      });

      if (existingBookmark) {
        return res.status(400).json({
          success: false,
          message: 'Already bookmarked'
        });
      }

      const bookmark = new Bookmark({
        user: req.user.id,
        resourceType,
        resourceId,
        title,
        description,
        imageUrl,
        url,
        category,
        tags,
        notes,
        folder,
        priority
      });

      await bookmark.save();

      res.status(201).json({
        success: true,
        data: bookmark,
        message: 'Bookmark created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateBookmark(req, res) {
    try {
      const { notes, folder, priority, tags } = req.body;
      
      const bookmark = await Bookmark.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!bookmark) {
        return res.status(404).json({ success: false, message: 'Bookmark not found' });
      }

      if (notes !== undefined) bookmark.notes = notes;
      if (folder !== undefined) bookmark.folder = folder;
      if (priority !== undefined) bookmark.priority = priority;
      if (tags !== undefined) bookmark.tags = tags;

      await bookmark.save();

      res.json({
        success: true,
        data: bookmark,
        message: 'Bookmark updated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteBookmark(req, res) {
    try {
      const bookmark = await Bookmark.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
      });

      if (!bookmark) {
        return res.status(404).json({ success: false, message: 'Bookmark not found' });
      }

      res.json({
        success: true,
        message: 'Bookmark deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async accessBookmark(req, res) {
    try {
      const bookmark = await Bookmark.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!bookmark) {
        return res.status(404).json({ success: false, message: 'Bookmark not found' });
      }

      await bookmark.updateAccess();

      res.json({
        success: true,
        data: {
          url: bookmark.url,
          resourceId: bookmark.resourceId,
          resourceType: bookmark.resourceType
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // User Notes
  async getNotes(req, res) {
    try {
      const {
        category,
        folder,
        tags,
        page = 1,
        limit = 20,
        sort = 'createdAt',
        search
      } = req.query;

      const query = { user: req.user.id };
      
      if (category) query.category = category;
      if (folder) query.folder = folder;
      if (tags) query.tags = { $in: tags.split(',') };
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' }},
          { content: { $regex: search, $options: 'i' }}
        ];
      }

      const sortOrder = sort.startsWith('-') ? -1 : 1;
      const sortField = sort.replace('-', '');

      const notes = await UserNote.find(query)
        .sort({ isPinned: -1, [sortField]: sortOrder })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await UserNote.countDocuments(query);

      // Get folder and category statistics
      const folderStats = await UserNote.aggregate([
        { $match: { user: req.user.id } },
        { $group: { _id: '$folder', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const categoryStats = await UserNote.aggregate([
        { $match: { user: req.user.id } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: notes,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        folders: folderStats,
        categories: categoryStats
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createNote(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        title,
        content,
        category = 'general',
        tags = [],
        relatedResource,
        folder = 'My Notes',
        priority = 3,
        reminderDate,
        attachments = []
      } = req.body;

      const note = new UserNote({
        user: req.user.id,
        title,
        content,
        category,
        tags,
        relatedResource,
        folder,
        priority,
        reminderDate,
        attachments
      });

      await note.save();

      res.status(201).json({
        success: true,
        data: note,
        message: 'Note created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getNote(req, res) {
    try {
      const note = await UserNote.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      res.json({
        success: true,
        data: note
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateNote(req, res) {
    try {
      const {
        title,
        content,
        category,
        tags,
        folder,
        priority,
        isPinned,
        reminderDate,
        attachments
      } = req.body;

      const note = await UserNote.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      if (title !== undefined) note.title = title;
      if (content !== undefined) note.content = content;
      if (category !== undefined) note.category = category;
      if (tags !== undefined) note.tags = tags;
      if (folder !== undefined) note.folder = folder;
      if (priority !== undefined) note.priority = priority;
      if (isPinned !== undefined) note.isPinned = isPinned;
      if (reminderDate !== undefined) note.reminderDate = reminderDate;
      if (attachments !== undefined) note.attachments = attachments;

      await note.save();

      res.json({
        success: true,
        data: note,
        message: 'Note updated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteNote(req, res) {
    try {
      const note = await UserNote.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
      });

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      res.json({
        success: true,
        message: 'Note deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async togglePinNote(req, res) {
    try {
      const note = await UserNote.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      note.isPinned = !note.isPinned;
      await note.save();

      res.json({
        success: true,
        data: note,
        message: note.isPinned ? 'Note pinned' : 'Note unpinned'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Favorites
  async getFavorites(req, res) {
    try {
      const { type, page = 1, limit = 20 } = req.query;

      const favorites = await VisitorFavorites.findOne({ visitor: req.user.id })
        .populate('museums.museum', 'name description images location')
        .populate('artifacts.artifact', 'name description images period')
        .populate('courses.course', 'title description difficulty instructor')
        .populate('events.event', 'title description date location')
        .populate('tours.tour', 'title description duration price');

      if (!favorites) {
        return res.json({
          success: true,
          data: {
            museums: [],
            artifacts: [],
            courses: [],
            events: [],
            tours: []
          }
        });
      }

      let data = favorites.toObject();

      if (type) {
        data = { [type]: data[type] || [] };
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async addToFavorites(req, res) {
    try {
      const { type, itemId, notes } = req.body;
      
      if (!['museums', 'artifacts', 'courses', 'events', 'tours'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid favorite type'
        });
      }

      let favorites = await VisitorFavorites.findOne({ visitor: req.user.id });
      
      if (!favorites) {
        favorites = new VisitorFavorites({
          visitor: req.user.id,
          museums: [],
          artifacts: [],
          courses: [],
          events: [],
          tours: []
        });
      }

      // Check if already in favorites
      const typeField = type;
      const itemField = type.slice(0, -1); // Remove 's' to get singular
      
      const existingItem = favorites[typeField].find(item => 
        item[itemField].toString() === itemId
      );

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Already in favorites'
        });
      }

      // Add to favorites
      favorites[typeField].push({
        [itemField]: itemId,
        notes: notes || ''
      });

      await favorites.save();

      res.status(201).json({
        success: true,
        message: 'Added to favorites'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async removeFromFavorites(req, res) {
    try {
      const { type, itemId } = req.body;

      const favorites = await VisitorFavorites.findOne({ visitor: req.user.id });
      
      if (!favorites) {
        return res.status(404).json({ success: false, message: 'No favorites found' });
      }

      const typeField = type;
      const itemField = type.slice(0, -1);
      
      favorites[typeField] = favorites[typeField].filter(item => 
        item[itemField].toString() !== itemId
      );

      await favorites.save();

      res.json({
        success: true,
        message: 'Removed from favorites'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Recently Viewed
  async getRecentlyViewed(req, res) {
    try {
      const { limit = 20 } = req.query;

      const recentItems = await VisitorActivity.find({
        visitor: req.user.id,
        type: { $in: ['view', 'visit'] }
      })
      .populate('relatedResource.museum', 'name images')
      .populate('relatedResource.artifact', 'name images')
      .populate('relatedResource.course', 'title thumbnail')
      .populate('relatedResource.event', 'title images')
      .sort({ timestamp: -1 })
      .limit(limit * 1);

      res.json({
        success: true,
        data: recentItems
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Collection Statistics
  async getCollectionStats(req, res) {
    try {
      const [bookmarkCount, noteCount] = await Promise.all([
        Bookmark.countDocuments({ user: req.user.id }),
        UserNote.countDocuments({ user: req.user.id })
      ]);

      const favorites = await VisitorFavorites.findOne({ visitor: req.user.id });
      const favoriteCount = favorites ? 
        (favorites.museums.length + favorites.artifacts.length + 
         favorites.courses.length + favorites.events.length + 
         favorites.tours.length) : 0;

      res.json({
        success: true,
        data: {
          bookmarks: bookmarkCount,
          notes: noteCount,
          favorites: favoriteCount,
          totalItems: bookmarkCount + noteCount + favoriteCount
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CollectionController();
