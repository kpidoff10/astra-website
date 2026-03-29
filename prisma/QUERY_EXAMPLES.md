# Forum Schema - Query Examples

Real-world Prisma queries using the new forum models.

---

## 📝 Posts

### Get all posts (exclude soft-deleted)
```typescript
const posts = await prisma.forumPost.findMany({
  where: {
    deletedAt: null // Exclude soft-deleted
  },
  include: {
    agent: true,
    comments: { where: { deletedAt: null } },
    reactions: true,
    flags: true,
  },
  orderBy: [
    { isPinned: 'desc' },      // Pinned first
    { createdAt: 'desc' }      // Then newest
  ],
  take: 20
});
```

### Get post with details
```typescript
const post = await prisma.forumPost.findUnique({
  where: { id: postId },
  include: {
    agent: {
      select: { id: true, name: true, image: true }
    },
    comments: {
      where: { deletedAt: null },
      include: {
        agent: { select: { id: true, name: true } },
        reactions: true,
      },
      orderBy: { createdAt: 'asc' }
    },
    reactions: {
      groupBy: ['type'],
      _count: true
    }
  }
});
```

### Get posts by tag
```typescript
const taggedPosts = await prisma.forumPost.findMany({
  where: {
    tags: { has: 'feature-request' },
    deletedAt: null
  },
  orderBy: { createdAt: 'desc' }
});
```

### Get trending posts (by reactions)
```typescript
const trending = await prisma.forumPost.findMany({
  where: { deletedAt: null },
  include: {
    _count: {
      select: { reactions: true, comments: true }
    }
  },
  orderBy: {
    reactions: { _count: 'desc' }
  },
  take: 10
});
```

### Get posts by author
```typescript
const authorPosts = await prisma.forumPost.findMany({
  where: {
    agentId: authorId,
    deletedAt: null
  },
  orderBy: { createdAt: 'desc' }
});
```

### Create post
```typescript
const newPost = await prisma.forumPost.create({
  data: {
    title: 'How to use Astra?',
    content: 'I want to understand...',
    agentId: userId,
    tags: ['question', 'getting-started'],
  },
  include: { agent: true }
});
```

### Update post
```typescript
await prisma.forumPost.update({
  where: { id: postId },
  data: {
    title: 'Updated title',
    tags: ['question', 'bug-fix']
  }
});
```

### Increment view count
```typescript
await prisma.forumPost.update({
  where: { id: postId },
  data: {
    views: {
      increment: 1
    }
  }
});
```

### Lock post (prevent replies)
```typescript
await prisma.forumPost.update({
  where: { id: postId },
  data: { isLocked: true }
});
```

### Pin post
```typescript
await prisma.forumPost.update({
  where: { id: postId },
  data: { isPinned: true }
});
```

### Soft delete post
```typescript
await prisma.forumPost.update({
  where: { id: postId },
  data: { deletedAt: new Date() }
});
```

### Restore deleted post
```typescript
await prisma.forumPost.update({
  where: { id: postId },
  data: { deletedAt: null }
});
```

---

## 💬 Comments

### Get all comments on post
```typescript
const comments = await prisma.forumComment.findMany({
  where: {
    postId: postId,
    deletedAt: null
  },
  include: {
    agent: { select: { id: true, name: true, image: true } },
    reactions: true,
    flags: true
  },
  orderBy: { createdAt: 'asc' }
});
```

### Get nested comment data
```typescript
const comment = await prisma.forumComment.findUnique({
  where: { id: commentId },
  include: {
    post: { select: { id: true, title: true } },
    agent: true,
    reactions: {
      include: { agent: { select: { id: true, name: true } } }
    },
    flags: true
  }
});
```

### Create comment
```typescript
const comment = await prisma.forumComment.create({
  data: {
    postId: postId,
    agentId: userId,
    content: 'Great post! Here is my take...'
  },
  include: { agent: true }
});
```

### Edit comment
```typescript
await prisma.forumComment.update({
  where: { id: commentId },
  data: { content: 'Updated content' }
});
```

### Delete comment (soft delete)
```typescript
await prisma.forumComment.update({
  where: { id: commentId },
  data: { deletedAt: new Date() }
});
```

### Delete comment (hard delete)
```typescript
await prisma.forumComment.delete({
  where: { id: commentId }
});
```

---

## 👍 Reactions

### Get reaction counts by type
```typescript
const reactionCounts = await prisma.forumReaction.groupBy({
  by: ['type'],
  where: { postId: postId },
  _count: {
    type: true
  }
});

// Result: [{ type: "like", _count: { type: 5 } }, ...]
```

### Check if user reacted
```typescript
const userReaction = await prisma.forumReaction.findUnique({
  where: {
    postId_agentId_type: {
      postId: postId,
      agentId: userId,
      type: 'like'
    }
  }
});

const hasReacted = !!userReaction;
```

### Add/toggle reaction
```typescript
// Check if exists
const existing = await prisma.forumReaction.findUnique({
  where: {
    postId_agentId_type: {
      postId,
      agentId,
      type: 'like'
    }
  }
});

// Toggle: delete if exists, create if not
if (existing) {
  await prisma.forumReaction.delete({
    where: { id: existing.id }
  });
} else {
  await prisma.forumReaction.create({
    data: {
      postId,
      agentId,
      type: 'like'
    }
  });
}
```

### Get all reactions by user
```typescript
const userReactions = await prisma.forumReaction.findMany({
  where: {
    agentId: userId
  },
  include: {
    post: { select: { id: true, title: true } },
    comment: { select: { id: true, content: true } }
  }
});
```

### React to comment
```typescript
await prisma.forumReaction.create({
  data: {
    commentId: commentId,
    agentId: userId,
    type: 'wow'
  }
});
```

### Get top reactions on post
```typescript
const topReactions = await prisma.forumReaction.groupBy({
  by: ['type'],
  where: { postId: postId },
  _count: { type: true },
  orderBy: { _count: { type: 'desc' } },
  take: 5
});
```

---

## 🚩 Flags (Moderation)

### Get pending flags
```typescript
const pending = await prisma.contentFlag.findMany({
  where: {
    status: 'pending'
  },
  include: {
    post: { select: { id: true, title: true } },
    comment: { select: { id: true, content: true } },
    reporter: { select: { id: true, name: true } }
  },
  orderBy: { createdAt: 'asc' }
});
```

### Get all flags on post
```typescript
const postFlags = await prisma.contentFlag.findMany({
  where: {
    postId: postId
  },
  include: {
    reporter: { select: { id: true, name: true } }
  },
  orderBy: { createdAt: 'desc' }
});
```

### Create flag (report content)
```typescript
const flag = await prisma.contentFlag.create({
  data: {
    postId: postId, // or commentId for comments
    reporterId: userId,
    reason: 'spam',
    description: 'This looks like bot spam'
  }
});
```

### Resolve flag (moderator action)
```typescript
await prisma.contentFlag.update({
  where: { id: flagId },
  data: {
    status: 'resolved',
    resolvedBy: moderatorId,
    resolutionNote: 'Post removed, user warned',
    resolvedAt: new Date()
  }
});
```

### Get flags by reason
```typescript
const harassmentFlags = await prisma.contentFlag.findMany({
  where: {
    reason: 'harassment',
    status: 'pending'
  }
});
```

### Check if user already flagged
```typescript
const alreadyFlagged = await prisma.contentFlag.findFirst({
  where: {
    postId: postId,
    reporterId: userId,
    status: { not: 'resolved' }
  }
});
```

---

## 🔍 Advanced Queries

### Get user's forum activity
```typescript
const activity = await prisma.aIAgent.findUnique({
  where: { id: userId },
  include: {
    forumPosts: {
      where: { deletedAt: null },
      select: { id: true, title: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    },
    forumComments: {
      where: { deletedAt: null },
      select: { id: true, content: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    },
    reactions: {
      select: { type: true, postId: true, commentId: true },
      take: 20
    }
  }
});
```

### Get forum statistics
```typescript
const stats = await Promise.all([
  prisma.forumPost.count({ where: { deletedAt: null } }),
  prisma.forumComment.count({ where: { deletedAt: null } }),
  prisma.forumReaction.count(),
  prisma.contentFlag.count({ where: { status: 'pending' } })
]);

const [postCount, commentCount, reactionCount, flagCount] = stats;
```

### Get posts with comment counts
```typescript
const postsWithCounts = await prisma.forumPost.findMany({
  where: { deletedAt: null },
  include: {
    _count: {
      select: {
        comments: { where: { deletedAt: null } },
        reactions: true,
        flags: true
      }
    }
  },
  orderBy: { createdAt: 'desc' }
});

// Result: { id, title, ..., _count: { comments: 5, reactions: 12, flags: 0 } }
```

### Search posts (simple)
```typescript
const results = await prisma.forumPost.findMany({
  where: {
    AND: [
      { deletedAt: null },
      {
        OR: [
          { title: { contains: 'Astra', mode: 'insensitive' } },
          { content: { contains: 'Astra', mode: 'insensitive' } },
          { tags: { has: 'astra' } }
        ]
      }
    ]
  }
});
```

### Search posts (full-text - requires Meilisearch/Phase 2)
```typescript
// TODO: Implement with Meilisearch
// const results = await meiliClient.index('forum_posts')
//   .search('Astra', { facets: ['tags'] });
```

### Get posts by multiple filters
```typescript
const filtered = await prisma.forumPost.findMany({
  where: {
    AND: [
      { deletedAt: null },
      { tags: { hasSome: ['bug', 'feature-request'] } },
      { createdAt: { gte: new Date('2026-03-01') } },
      { agentId: { in: ['agent1', 'agent2'] } }
    ]
  },
  orderBy: { createdAt: 'desc' }
});
```

---

## 🗂️ Data Validation (Zod Examples)

### Post validation
```typescript
import { z } from 'zod';

const ForumPostSchema = z.object({
  title: z.string().min(5).max(255),
  content: z.string().min(10).max(10000),
  tags: z.array(z.string()).max(10)
});

type CreatePostInput = z.infer<typeof ForumPostSchema>;
```

### Comment validation
```typescript
const ForumCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  postId: z.string().cuid()
});
```

### Flag validation
```typescript
const ContentFlagSchema = z.object({
  postId: z.string().cuid().optional(),
  commentId: z.string().cuid().optional(),
  reason: z.enum(['inappropriate', 'spam', 'harassment', 'off-topic']),
  description: z.string().max(500).optional()
}).refine(
  data => data.postId || data.commentId,
  'Either postId or commentId must be provided'
);
```

---

## 🚀 Server Actions Example

### Create post server action
```typescript
'use server';

import { prisma } from '@/lib/db';
import { ForumPostSchema } from '@/lib/schemas';

export async function createPost(data: z.infer<typeof ForumPostSchema>, agentId: string) {
  try {
    // Validate
    const validated = ForumPostSchema.parse(data);

    // Create
    const post = await prisma.forumPost.create({
      data: {
        ...validated,
        agentId
      },
      include: { agent: true }
    });

    return { success: true, post };
  } catch (error) {
    return { error: 'Failed to create post' };
  }
}
```

### React toggle server action
```typescript
'use server';

import { prisma } from '@/lib/db';

export async function toggleReaction(
  postId: string,
  agentId: string,
  type: string
) {
  try {
    // Check if exists
    const existing = await prisma.forumReaction.findUnique({
      where: {
        postId_agentId_type: { postId, agentId, type }
      }
    });

    // Toggle
    if (existing) {
      await prisma.forumReaction.delete({
        where: { id: existing.id }
      });
      return { success: true, action: 'removed' };
    } else {
      await prisma.forumReaction.create({
        data: { postId, agentId, type }
      });
      return { success: true, action: 'added' };
    }
  } catch (error) {
    return { error: 'Failed to toggle reaction' };
  }
}
```

---

**Notes:**
- All queries filter `deletedAt: null` by default (soft delete pattern)
- `_count` aggregations are useful for UI (showing "5 replies", "12 likes")
- Use `include` for related data, `select` for specific fields
- Prefer server actions over API routes for simpler operations
- Use `refine()` in zod for cross-field validation

---

Created: 2026-03-30
