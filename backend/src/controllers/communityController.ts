import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import CommunityPost from '../models/CommunityPost';
import CommunityComment from '../models/CommunityComment';
import Notification from '../models/Notification';
import User from '../models/User';
import { notifyUsers } from '../socket';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Create a new community post / question
// @route   POST /api/community/posts
export const createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content, category, tags, isAnonymous } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  let image = '';
  if (req.file) {
    if (req.file.path && (req.file.path.startsWith('http://') || req.file.path.startsWith('https://'))) {
      image = req.file.path;
    } else if (req.file.filename) {
      const forwardedProto = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      const uploadsBase = process.env.PUBLIC_BASE_URL?.trim() || `${forwardedProto}://${host}/uploads/community`;
      image = `${uploadsBase}/${req.file.filename}`;
    }
  } else if (req.body.image) {
    image = req.body.image;
  }

  let parsedTags: string[] = [];
  if (tags) {
    if (Array.isArray(tags)) parsedTags = tags;
    else if (typeof tags === 'string') {
      parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  const isAnon = isAnonymous === true || isAnonymous === 'true';

  const post = await CommunityPost.create({
    author: req.user._id,
    title,
    content,
    category: category || 'General Discussion',
    tags: parsedTags,
    isAnonymous: isAnon,
    image,
  });

  await post.populate('author', '_id name avatar college');

  // Notify all students in the same campus / college
  try {
    const userCollege = req.user.college;
    let targetUsers: any[] = [];

    if (userCollege && userCollege.trim() !== '') {
      targetUsers = await User.find({
        college: userCollege,
        _id: { $ne: req.user._id },
        isBlocked: { $ne: true },
      }).select('_id');
    } else {
      targetUsers = await User.find({
        _id: { $ne: req.user._id },
        isBlocked: { $ne: true },
      }).select('_id');
    }

    if (targetUsers.length > 0) {
      const posterName = isAnon ? 'A fellow student' : req.user.name;
      const notifTitle = `💡 New Community Discussion (${userCollege || 'Campus'})`;
      const notifMsg = `${posterName} asked/posted: "${title.length > 45 ? title.substring(0, 45) + '...' : title}"`;

      const notificationsToCreate = targetUsers.map((u) => ({
        recipient: u._id,
        sender: req.user!._id,
        type: 'Community' as const,
        title: notifTitle,
        message: notifMsg,
        relatedId: post._id,
        isRead: false,
      }));

      await Notification.insertMany(notificationsToCreate);

      const recipientIds = targetUsers.map((u) => u._id.toString());
      notifyUsers(recipientIds, {
        title: notifTitle,
        message: notifMsg,
        type: 'info',
        relatedId: post._id,
      });
      console.log(`📢 Instant notification sent to ${recipientIds.length} campus users for new Community post.`);
    }
  } catch (notifErr) {
    console.error('⚠️ Failed to send Community post notifications:', notifErr);
  }

  res.status(201).json({ success: true, post });
});

// @desc    Get community posts with search, category filter & sorting
// @route   GET /api/community/posts
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const { category, search, tag, sort } = req.query;

  let query: any = {};

  if (category && category !== 'All') {
    query.category = category;
  }

  if (tag) {
    query.tags = tag;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  let sortOption: any = { createdAt: -1 };
  if (sort === 'popular') {
    sortOption = { likes: -1, answersCount: -1, createdAt: -1 };
  } else if (sort === 'unanswered') {
    query.answersCount = 0;
    sortOption = { createdAt: -1 };
  }

  const posts = await CommunityPost.find(query)
    .sort(sortOption)
    .populate('author', '_id name avatar college');

  res.json({ success: true, posts });
});

// @desc    Get single post details with all comments
// @route   GET /api/community/posts/:id
export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const post = await CommunityPost.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', '_id name avatar college');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comments = await CommunityComment.find({ post: post._id })
    .sort({ isAcceptedAnswer: -1, likes: -1, createdAt: 1 })
    .populate('author', '_id name avatar college');

  res.json({ success: true, post, comments });
});

// @desc    Like / Upvote or Unlike a post
// @route   POST /api/community/posts/:id/like
export const toggleLikePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const userIdStr = req.user._id.toString();
  const alreadyLiked = post.likes.some((id: any) => id.toString() === userIdStr);

  if (alreadyLiked) {
    post.likes = post.likes.filter((id: any) => id.toString() !== userIdStr);
  } else {
    post.likes.push(req.user._id as any);
  }

  await post.save();

  res.json({
    success: true,
    likesCount: post.likes.length,
    isLiked: !alreadyLiked,
  });
});

// @desc    Add comment / answer to a post
// @route   POST /api/community/posts/:id/comments
export const addComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { content, isAnonymous } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  if (!content) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const isCommentAnon = isAnonymous === true || isAnonymous === 'true';

  const comment = await CommunityComment.create({
    post: post._id,
    author: req.user._id,
    content,
    isAnonymous: isCommentAnon,
  });

  // Increment answers count on post
  post.answersCount += 1;
  await post.save();

  await comment.populate('author', '_id name avatar college');

  // Notify post author if not self
  if (post.author.toString() !== req.user._id.toString()) {
    try {
      const commenterName = isCommentAnon ? 'A fellow student' : req.user.name;
      const notifTitle = `💬 New Answer / Comment`;
      const notifMsg = `${commenterName} commented on your question: "${post.title.substring(0, 40)}..."`;

      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'Community',
        title: notifTitle,
        message: notifMsg,
        relatedId: post._id,
      });

      notifyUsers([post.author.toString()], {
        title: notifTitle,
        message: notifMsg,
        type: 'info',
        relatedId: post._id,
      });
    } catch (notifErr) {
      console.error('Failed to create notification for community comment:', notifErr);
    }
  }

  res.status(201).json({ success: true, comment });
});

// @desc    Like / Upvote a comment
// @route   POST /api/community/posts/:id/comments/:commentId/like
export const toggleLikeComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  const comment = await CommunityComment.findById(req.params.commentId);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const userIdStr = req.user._id.toString();
  const alreadyLiked = comment.likes.some((id: any) => id.toString() === userIdStr);

  if (alreadyLiked) {
    comment.likes = comment.likes.filter((id: any) => id.toString() !== userIdStr);
  } else {
    comment.likes.push(req.user._id as any);
  }

  await comment.save();

  res.json({
    success: true,
    likesCount: comment.likes.length,
    isLiked: !alreadyLiked,
  });
});

// @desc    Accept answer (Mark as accepted solution)
// @route   PATCH /api/community/posts/:id/comments/:commentId/accept
export const acceptAnswer = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only the author of the question can accept an answer');
  }

  const comment = await CommunityComment.findById(req.params.commentId);

  if (!comment || comment.post.toString() !== post._id.toString()) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Reset any previously accepted answer for this post
  await CommunityComment.updateMany(
    { post: post._id, _id: { $ne: comment._id } },
    { isAcceptedAnswer: false }
  );

  comment.isAcceptedAnswer = !comment.isAcceptedAnswer;
  await comment.save();

  post.status = comment.isAcceptedAnswer ? 'Solved' : 'Open';
  await post.save();

  res.json({ success: true, isAcceptedAnswer: comment.isAcceptedAnswer, postStatus: post.status });
});

// @desc    Delete post
// @route   DELETE /api/community/posts/:id
export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }

  await CommunityComment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ success: true, message: 'Post deleted successfully' });
});

// @desc    Delete comment
// @route   DELETE /api/community/posts/:id/comments/:commentId
export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  const comment = await CommunityComment.findById(req.params.commentId);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const post = await CommunityPost.findById(comment.post);

  const isCommentOwner = comment.author.toString() === req.user._id.toString();
  const isPostOwner = post && post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isCommentOwner && !isPostOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }

  await comment.deleteOne();

  if (post && post.answersCount > 0) {
    post.answersCount -= 1;
    await post.save();
  }

  res.json({ success: true, message: 'Comment deleted successfully' });
});
