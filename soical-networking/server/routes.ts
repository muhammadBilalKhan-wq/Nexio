import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { z } from "zod";
import { hash, compare } from "bcrypt";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcrypt");
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import("bcrypt");
  return bcrypt.compare(password, hash);
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.headers["x-user-id"] as string;

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      
      let isFollowing = false;
      if (currentUserId && currentUserId !== id) {
        isFollowing = await storage.isFollowing(currentUserId, id);
      }

      res.json({ ...userWithoutPassword, isFollowing });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.get("/api/users/:id/posts", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.headers["x-user-id"] as string;

      const posts = await storage.getPostsByAuthor(id);
      const user = await storage.getUser(id);

      const postsWithAuthor = await Promise.all(
        posts.map(async (post) => {
          const isUpvoted = currentUserId
            ? await storage.hasUpvoted(post.id, currentUserId)
            : false;
          const isSaved = currentUserId
            ? await storage.hasSaved(post.id, currentUserId)
            : false;
          const images = await storage.getPostImages(post.id);

          return {
            ...post,
            author: user ? { ...user, password: undefined } : null,
            isUpvoted,
            isSaved,
            images,
          };
        })
      );

      res.json(postsWithAuthor);
    } catch (error: any) {
      console.error("Get user posts error:", error);
      res.status(500).json({ message: "Failed to get posts" });
    }
  });

  app.get("/api/users/:id/saved", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const posts = await storage.getSavedPosts(id);
      const postsWithAuthor = await Promise.all(
        posts.map(async (post) => {
          const author = await storage.getUser(post.authorId);
          return {
            ...post,
            author: author ? { ...author, password: undefined } : null,
            isUpvoted: await storage.hasUpvoted(post.id, id),
            isSaved: true,
          };
        })
      );

      res.json(postsWithAuthor);
    } catch (error: any) {
      console.error("Get saved posts error:", error);
      res.status(500).json({ message: "Failed to get saved posts" });
    }
  });

  app.post("/api/users/:id/follow", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.headers["x-user-id"] as string;

      if (!currentUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (currentUserId === id) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      await storage.createFollow(currentUserId, id);

      await storage.createNotification({
        userId: id,
        type: "follow",
        title: "New Follower",
        message: "Someone started following you",
        fromUserId: currentUserId,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Follow error:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/users/:id/follow", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.headers["x-user-id"] as string;

      if (!currentUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.deleteFollow(currentUserId, id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Unfollow error:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get("/api/posts", async (req: Request, res: Response) => {
    try {
      const currentUserId = req.headers["x-user-id"] as string;
      const { category } = req.query;

      let posts: any[];
      if (category && typeof category === "string") {
        posts = await storage.getPostsByCategory(category);
      } else {
        posts = await storage.getPosts();
      }

      const postsWithAuthor = await Promise.all(
        posts.map(async (post) => {
          const author = await storage.getUser(post.authorId);
          const isUpvoted = currentUserId
            ? await storage.hasUpvoted(post.id, currentUserId)
            : false;
          const isSaved = currentUserId
            ? await storage.hasSaved(post.id, currentUserId)
            : false;
          const images = await storage.getPostImages(post.id);

          return {
            ...post,
            author: author ? { ...author, password: undefined } : null,
            isUpvoted,
            isSaved,
            images,
          };
        })
      );

      res.json(postsWithAuthor);
    } catch (error: any) {
      console.error("Get posts error:", error);
      res.status(500).json({ message: "Failed to get posts" });
    }
  });

  app.get("/api/posts/trending", async (req: Request, res: Response) => {
    try {
      const currentUserId = req.headers["x-user-id"] as string;
      const posts = await storage.getPosts(20, 0);

      const sortedPosts = [...posts].sort(
        (a, b) => b.upvotesCount - a.upvotesCount
      );

      const postsWithAuthor = await Promise.all(
        sortedPosts.map(async (post) => {
          const author = await storage.getUser(post.authorId);
          const isUpvoted = currentUserId
            ? await storage.hasUpvoted(post.id, currentUserId)
            : false;
          const isSaved = currentUserId
            ? await storage.hasSaved(post.id, currentUserId)
            : false;
          const images = await storage.getPostImages(post.id);

          return {
            ...post,
            author: author ? { ...author, password: undefined } : null,
            isUpvoted,
            isSaved,
            images,
          };
        })
      );

      res.json(postsWithAuthor);
    } catch (error: any) {
      console.error("Get trending posts error:", error);
      res.status(500).json({ message: "Failed to get trending posts" });
    }
  });

  app.get("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.headers["x-user-id"] as string;

      const post = await storage.getPostById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const author = await storage.getUser(post.authorId);
      const isUpvoted = currentUserId
        ? await storage.hasUpvoted(id, currentUserId)
        : false;
      const isSaved = currentUserId
        ? await storage.hasSaved(id, currentUserId)
        : false;
      const images = await storage.getPostImages(id);

      res.json({
        ...post,
        author: author ? { ...author, password: undefined } : null,
        isUpvoted,
        isSaved,
        images,
      });
    } catch (error: any) {
      console.error("Get post error:", error);
      res.status(500).json({ message: "Failed to get post" });
    }
  });

  app.post("/api/posts", async (req: Request, res: Response) => {
    try {
      const { title, content, category, tags, authorId, coverImageUrl, images } = req.body;

      if (!title || !content || !category || !authorId) {
        return res.status(400).json({ message: "Title, content, category, and authorId are required" });
      }

      // Validate images if provided
      if (images && Array.isArray(images)) {
        if (images.length > 5) {
          return res.status(400).json({ message: "Maximum 5 images allowed per post" });
        }
        for (const img of images) {
          if (typeof img !== "string") {
            return res.status(400).json({ message: "Invalid image format" });
          }
          // Check if it's a valid base64 data URL
          if (!img.startsWith("data:image/")) {
            return res.status(400).json({ message: "Invalid image format. Only jpg, png, gif allowed" });
          }
          // Check file type
          const validTypes = ["data:image/jpeg", "data:image/png", "data:image/gif", "data:image/jpg"];
          const hasValidType = validTypes.some(type => img.startsWith(type));
          if (!hasValidType) {
            return res.status(400).json({ message: "Invalid image type. Only jpg, png, gif allowed" });
          }
          // Check size (base64 is ~1.33x larger, so 5MB = ~6.67MB in base64)
          if (img.length > 7 * 1024 * 1024) {
            return res.status(400).json({ message: "Image too large. Maximum 5MB per image" });
          }
        }
      }

      const post = await storage.createPost({
        title,
        content,
        category,
        tags: tags || null,
        authorId,
        coverImageUrl: coverImageUrl || null,
      });

      // Save images if provided
      if (images && Array.isArray(images) && images.length > 0) {
        const imageRecords = images.map((imageUrl: string) => ({
          postId: post.id,
          imageUrl,
        }));
        await storage.createPostImages(imageRecords);
      }

      // Return post with images
      const postImages = await storage.getPostImages(post.id);
      res.json({ ...post, images: postImages });
    } catch (error: any) {
      console.error("Create post error:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post("/api/posts/:id/upvote", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.headers["x-user-id"] as string;

      if (!currentUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const hasUpvoted = await storage.hasUpvoted(id, currentUserId);
      if (hasUpvoted) {
        return res.status(400).json({ message: "Already upvoted" });
      }

      await storage.createUpvote(id, currentUserId);

      const post = await storage.getPostById(id);
      if (post && post.authorId !== currentUserId) {
        await storage.createNotification({
          userId: post.authorId,
          type: "upvote",
          title: "Post Upvoted",
          message: "Someone upvoted your post",
          fromUserId: currentUserId,
          postId: id,
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Upvote error:", error);
      res.status(500).json({ message: "Failed to upvote post" });
    }
  });

  app.delete("/api/posts/:id/upvote", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.headers["x-user-id"] as string;

      if (!currentUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.deleteUpvote(id, currentUserId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Remove upvote error:", error);
      res.status(500).json({ message: "Failed to remove upvote" });
    }
  });

  app.post("/api/posts/:id/save", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.headers["x-user-id"] as string;

      if (!currentUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const hasSaved = await storage.hasSaved(id, currentUserId);
      if (hasSaved) {
        return res.status(400).json({ message: "Already saved" });
      }

      await storage.createSave(id, currentUserId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Save error:", error);
      res.status(500).json({ message: "Failed to save post" });
    }
  });

  app.delete("/api/posts/:id/save", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.headers["x-user-id"] as string;

      if (!currentUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.deleteSave(id, currentUserId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Unsave error:", error);
      res.status(500).json({ message: "Failed to unsave post" });
    }
  });

  app.get("/api/posts/:id/comments", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const comments = await storage.getCommentsByPost(id);

      const commentsWithAuthor = await Promise.all(
        comments.map(async (comment) => {
          const author = await storage.getUser(comment.authorId);
          return {
            ...comment,
            author: author ? { ...author, password: undefined } : null,
          };
        })
      );

      res.json(commentsWithAuthor);
    } catch (error: any) {
      console.error("Get comments error:", error);
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  app.post("/api/posts/:id/comments", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content, authorId } = req.body;

      if (!content || !authorId) {
        return res.status(400).json({ message: "Content and authorId are required" });
      }

      const comment = await storage.createComment({
        content,
        postId: id,
        authorId,
      });

      const post = await storage.getPostById(id);
      if (post && post.authorId !== authorId) {
        await storage.createNotification({
          userId: post.authorId,
          type: "comment",
          title: "New Comment",
          message: "Someone commented on your post",
          fromUserId: authorId,
          postId: id,
        });
      }

      res.json(comment);
    } catch (error: any) {
      console.error("Create comment error:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const currentUserId = req.headers["x-user-id"] as string;

      if (!currentUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const notifications = await storage.getNotifications(currentUserId);

      const notificationsWithUser = await Promise.all(
        notifications.map(async (notification) => {
          let fromUser = null;
          if (notification.fromUserId) {
            const user = await storage.getUser(notification.fromUserId);
            if (user) {
              const { password: _, ...userWithoutPassword } = user;
              fromUser = userWithoutPassword;
            }
          }
          return { ...notification, fromUser };
        })
      );

      res.json(notificationsWithUser);
    } catch (error: any) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.post("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.markNotificationRead(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req: Request, res: Response) => {
    try {
      const currentUserId = req.headers["x-user-id"] as string;

      if (!currentUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.markAllNotificationsRead(currentUserId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Mark all notifications read error:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      const { postId, reporterId, reason } = req.body;

      if (!postId || !reporterId || !reason) {
        return res.status(400).json({ message: "PostId, reporterId, and reason are required" });
      }

      const report = await storage.createReport({
        postId,
        reporterId,
        reason,
      });

      res.json(report);
    } catch (error: any) {
      console.error("Create report error:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      const currentUserId = req.headers["x-user-id"] as string;

      if (!q || typeof q !== "string" || q.length < 2) {
        return res.json({ posts: [], users: [] });
      }

      const [posts, users] = await Promise.all([
        storage.searchPosts(q),
        storage.searchUsers(q),
      ]);

      const postsWithAuthor = await Promise.all(
        posts.map(async (post) => {
          const author = await storage.getUser(post.authorId);
          const isUpvoted = currentUserId
            ? await storage.hasUpvoted(post.id, currentUserId)
            : false;
          const isSaved = currentUserId
            ? await storage.hasSaved(post.id, currentUserId)
            : false;

          return {
            ...post,
            author: author ? { ...author, password: undefined } : null,
            isUpvoted,
            isSaved,
          };
        })
      );

      const usersWithoutPassword = users.map((user) => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json({
        posts: postsWithAuthor,
        users: usersWithoutPassword,
      });
    } catch (error: any) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });
  app.delete(
    "/api/comments/:id",
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const currentUserId = req.headers["x-user-id"] as string;
        const comment = await storage.getCommentById(id);
        if (!comment) {
          return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.authorId !== currentUserId) {
          return res.status(403).json({ message: "Forbidden" });
        }

        await storage.deleteComment(id);
        res.json({ success: true });
      } catch (error: any) {
        console.error("Delete comment error:", error);
        res.status(500).json({ message: "Failed to delete comment" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
