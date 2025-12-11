import {
  users,
  posts,
  comments,
  upvotes,
  saves,
  followers,
  notifications,
  reports,
  postImages,
  type User,
  type InsertUser,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type Notification,
  type InsertNotification,
  type Report,
  type InsertReport,
  type Upvote,
  type Save,
  type Follower,
  type PostImage,
  type InsertPostImage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  getPostsByAuthor(authorId: string): Promise<Post[]>;
  getPostsByCategory(category: string): Promise<Post[]>;
  searchPosts(query: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, data: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<void>;

  getCommentsByPost(postId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<void>;

  hasUpvoted(postId: string, userId: string): Promise<boolean>;
  createUpvote(postId: string, userId: string): Promise<Upvote>;
  deleteUpvote(postId: string, userId: string): Promise<void>;

  hasSaved(postId: string, userId: string): Promise<boolean>;
  createSave(postId: string, userId: string): Promise<Save>;
  deleteSave(postId: string, userId: string): Promise<void>;
  getSavedPosts(userId: string): Promise<Post[]>;

  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  createFollow(followerId: string, followingId: string): Promise<Follower>;
  deleteFollow(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;

  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;

  getReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReportStatus(id: string, status: string): Promise<void>;

  searchUsers(query: string): Promise<User[]>;
  getCommentById(id: string): Promise<Comment | undefined>;

  getPostImages(postId: string): Promise<PostImage[]>;
  createPostImages(images: InsertPostImage[]): Promise<PostImage[]>;
  deletePostImages(postId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getPosts(limit = 50, offset = 0): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt));
  }

  async getPostsByCategory(category: string): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.category, category))
      .orderBy(desc(posts.createdAt));
  }

  async searchPosts(query: string): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(
        or(
          ilike(posts.title, `%${query}%`),
          ilike(posts.content, `%${query}%`),
          ilike(posts.tags, `%${query}%`)
        )
      )
      .orderBy(desc(posts.createdAt));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    await db
      .update(users)
      .set({ postsCount: sql`${users.postsCount} + 1` })
      .where(eq(users.id, insertPost.authorId));
    return post;
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set(data)
      .where(eq(posts.id, id))
      .returning();
    return post || undefined;
  }

  async deletePost(id: string): Promise<void> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (post) {
      await db.delete(comments).where(eq(comments.postId, id));
      await db.delete(upvotes).where(eq(upvotes.postId, id));
      await db.delete(saves).where(eq(saves.postId, id));
      await db.delete(posts).where(eq(posts.id, id));
      await db
        .update(users)
        .set({ postsCount: sql`GREATEST(${users.postsCount} - 1, 0)` })
        .where(eq(users.id, post.authorId));
    }
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }
  async getCommentById(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, insertComment.postId));
    return comment;
  }

  async deleteComment(id: string): Promise<void> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    if (comment) {
      await db.delete(comments).where(eq(comments.id, id));
      await db
        .update(posts)
        .set({ commentsCount: sql`GREATEST(${posts.commentsCount} - 1, 0)` })
        .where(eq(posts.id, comment.postId));
    }
  }

  async hasUpvoted(postId: string, userId: string): Promise<boolean> {
    const [upvote] = await db
      .select()
      .from(upvotes)
      .where(and(eq(upvotes.postId, postId), eq(upvotes.userId, userId)));
    return !!upvote;
  }

  async createUpvote(postId: string, userId: string): Promise<Upvote> {
    const [upvote] = await db
      .insert(upvotes)
      .values({ postId, userId })
      .returning();
    await db
      .update(posts)
      .set({ upvotesCount: sql`${posts.upvotesCount} + 1` })
      .where(eq(posts.id, postId));
    
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (post) {
      await db
        .update(users)
        .set({ reputationScore: sql`${users.reputationScore} + 1` })
        .where(eq(users.id, post.authorId));
    }
    return upvote;
  }

  async deleteUpvote(postId: string, userId: string): Promise<void> {
    await db
      .delete(upvotes)
      .where(and(eq(upvotes.postId, postId), eq(upvotes.userId, userId)));
    await db
      .update(posts)
      .set({ upvotesCount: sql`GREATEST(${posts.upvotesCount} - 1, 0)` })
      .where(eq(posts.id, postId));
    
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (post) {
      await db
        .update(users)
        .set({ reputationScore: sql`GREATEST(${users.reputationScore} - 1, 0)` })
        .where(eq(users.id, post.authorId));
    }
  }

  async hasSaved(postId: string, userId: string): Promise<boolean> {
    const [save] = await db
      .select()
      .from(saves)
      .where(and(eq(saves.postId, postId), eq(saves.userId, userId)));
    return !!save;
  }

  async createSave(postId: string, userId: string): Promise<Save> {
    const [save] = await db.insert(saves).values({ postId, userId }).returning();
    await db
      .update(posts)
      .set({ savesCount: sql`${posts.savesCount} + 1` })
      .where(eq(posts.id, postId));
    return save;
  }

  async deleteSave(postId: string, userId: string): Promise<void> {
    await db
      .delete(saves)
      .where(and(eq(saves.postId, postId), eq(saves.userId, userId)));
    await db
      .update(posts)
      .set({ savesCount: sql`GREATEST(${posts.savesCount} - 1, 0)` })
      .where(eq(posts.id, postId));
  }

  async getSavedPosts(userId: string): Promise<Post[]> {
    const savedItems = await db
      .select()
      .from(saves)
      .where(eq(saves.userId, userId));
    
    if (savedItems.length === 0) return [];
    
    const postIds = savedItems.map((s) => s.postId);
    return db
      .select()
      .from(posts)
      .where(sql`${posts.id} = ANY(${postIds})`)
      .orderBy(desc(posts.createdAt));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, followingId)
        )
      );
    return !!follow;
  }

  async createFollow(followerId: string, followingId: string): Promise<Follower> {
    const [follow] = await db
      .insert(followers)
      .values({ followerId, followingId })
      .returning();
    
    await db
      .update(users)
      .set({ followingCount: sql`${users.followingCount} + 1` })
      .where(eq(users.id, followerId));
    
    await db
      .update(users)
      .set({ followersCount: sql`${users.followersCount} + 1` })
      .where(eq(users.id, followingId));
    
    return follow;
  }

  async deleteFollow(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, followingId)
        )
      );
    
    await db
      .update(users)
      .set({ followingCount: sql`GREATEST(${users.followingCount} - 1, 0)` })
      .where(eq(users.id, followerId));
    
    await db
      .update(users)
      .set({ followersCount: sql`GREATEST(${users.followersCount} - 1, 0)` })
      .where(eq(users.id, followingId));
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followerList = await db
      .select()
      .from(followers)
      .where(eq(followers.followingId, userId));
    
    if (followerList.length === 0) return [];
    
    const followerIds = followerList.map((f) => f.followerId);
    return db
      .select()
      .from(users)
      .where(sql`${users.id} = ANY(${followerIds})`);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const followingList = await db
      .select()
      .from(followers)
      .where(eq(followers.followerId, userId));
    
    if (followingList.length === 0) return [];
    
    const followingIds = followingList.map((f) => f.followingId);
    return db
      .select()
      .from(users)
      .where(sql`${users.id} = ANY(${followingIds})`);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async getReports(): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  async updateReportStatus(id: string, status: string): Promise<void> {
    await db.update(reports).set({ status }).where(eq(reports.id, id));
  }

  async searchUsers(query: string): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(
        or(ilike(users.name, `%${query}%`), ilike(users.email, `%${query}%`))
      )
      .limit(20);
  }

  async getPostImages(postId: string): Promise<PostImage[]> {
    return db
      .select()
      .from(postImages)
      .where(eq(postImages.postId, postId))
      .orderBy(postImages.createdAt);
  }

  async createPostImages(images: InsertPostImage[]): Promise<PostImage[]> {
    if (images.length === 0) return [];
    const createdImages = await db.insert(postImages).values(images).returning();
    return createdImages;
  }

  async deletePostImages(postId: string): Promise<void> {
    await db.delete(postImages).where(eq(postImages.postId, postId));
  }
}

export const storage = new DatabaseStorage();
