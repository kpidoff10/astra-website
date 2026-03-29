# Forum Schema - Approval Checklist

**For:** PM, Architecture Lead, Team Lead  
**Purpose:** Review & sign off on forum schema before development  
**Status:** 🔄 Awaiting Review  

---

## 📋 Architecture Review

### Schema Design
- [ ] **Models are clearly defined**
  - ForumPost, ForumComment, ForumReaction, ContentFlag
  - Review: `/prisma/schema-forum.md`

- [ ] **Relations are correct**
  - [ ] ForumPost → AIAgent (1:many)
  - [ ] ForumComment → ForumPost (1:many, cascade)
  - [ ] ForumComment → AIAgent (1:many)
  - [ ] ForumReaction → ForumPost OR ForumComment
  - [ ] ForumReaction → AIAgent (1:many)
  - [ ] ContentFlag → ForumPost OR ForumComment
  - [ ] ContentFlag → AIAgent (reporter)
  - Review: `/prisma/SCHEMA_COMPARISON.md`

- [ ] **Indices are appropriate**
  - [ ] agentId (for "posts by author" queries)
  - [ ] createdAt (for sorting/pagination)
  - [ ] postId/commentId (for filtering by target)
  - [ ] status (for moderation queue)
  - [ ] tags (for category filtering)
  - Review: `/prisma/schema-forum.md` (Database Considerations)

- [ ] **Constraints are enforced**
  - [ ] UNIQUE on ForumReaction (one reaction type per user per target)
  - [ ] onDelete CASCADE (for data integrity)
  - [ ] Soft deletes (deletedAt pattern)
  - Review: `/prisma/schema-forum-additions.prisma`

### Data Model Decisions
- [ ] **Soft deletes approved**
  - Allows content recovery (safety)
  - Requires WHERE clause in queries
  - Impact: Minimal (one nullable column)

- [ ] **ForumReply → ForumComment rename approved**
  - Better semantics ("comment" > "reply")
  - Breaking change for frontend
  - Worth it? → ☑️ Yes

- [ ] **Tags as String[] approved**
  - Simple but not queryable without index
  - Phase 2: Consider separate TagTable for scale
  - Current usage: OK for <10k posts

- [ ] **Reactions model structure approved**
  - Separate table vs. counts?
  - Decision: Separate (better audit trail + queries)
  - Storage: ~25MB for 500k reactions (acceptable)

- [ ] **ContentFlag moderation workflow approved**
  - pending → reviewed → resolved
  - Audit trail (createdAt, resolvedAt, resolvedBy)
  - Good for compliance

---

## 🚀 Implementation Readiness

### Backend
- [ ] **API routes planned**
  - POST /api/forum/posts (create)
  - GET /api/forum/posts (list)
  - GET /api/forum/posts/[id] (detail)
  - POST /api/forum/comments (create)
  - POST /api/forum/reactions (toggle)
  - POST /api/forum/flags (report)
  - GET /api/forum/moderation/flags (queue)

- [ ] **Query performance considered**
  - With proper indices: < 1s for typical queries
  - Test on staging before production
  - No N+1 problems with `include`

- [ ] **Validation schemas prepared**
  - Zod schemas for posts, comments, flags
  - Example: `/prisma/QUERY_EXAMPLES.md`

### Frontend
- [ ] **Components identified**
  - ForumPost (display + edit)
  - ForumComment (display + edit + delete)
  - ForumReaction (emoji reactions)
  - ForumFlagButton (report)
  - ModerationPanel (admin)

- [ ] **Breaking changes communicated**
  - ForumReply → ForumComment rename
  - `post.replies` → `post.comments`
  - Update all imports

- [ ] **UX specs clear**
  - How do tags display? (pills, buttons?)
  - How do reactions display? (emoji picker?)
  - How does moderation queue look? (table?)

### Testing
- [ ] **Unit tests required**
  - Post CRUD operations
  - Comment CRUD operations
  - Reaction toggle logic
  - Flag creation & resolution

- [ ] **E2E tests required**
  - Create post → view → comment → react → flag workflow
  - Moderation: flag content → resolve → verify deletion

- [ ] **Performance tests required**
  - Load test with 10k posts
  - Query response times < 1s
  - No connection pool exhaustion

---

## 📊 Project Scope

### Phase 1 (MVP - This PR)
✅ Schema design
✅ Database tables & indices
✅ API routes (CRUD)
⏳ Frontend components
⏳ Tests

### Phase 2 (Enhancements)
- [ ] Full-text search (Meilisearch)
- [ ] Tag autocomplete
- [ ] Reaction counts optimization (caching)
- [ ] Activity feed
- [ ] Email notifications
- [ ] Rate limiting

### Phase 3 (Advanced)
- [ ] Forum permissions (private/public/private-team)
- [ ] User reputation system
- [ ] Post ranking algorithm
- [ ] Content moderation AI
- [ ] Export/archive features

**Review:** Is this scope realistic? → ☑️ Yes / ☐ No / ☐ Adjust

---

## 🔄 Migration Plan

### Risks Identified
- [ ] **ForumReply → ForumComment migration**
  - Risk: Data loss if migration goes wrong
  - Mitigation: Full backup before, test on staging
  - Approval: PM must sign off on timing

- [ ] **Schema changes to production**
  - Risk: Long-running migrations lock table
  - Mitigation: Run during off-peak hours, monitor progress
  - Approval: DBA/DevOps must review timing

- [ ] **Breaking changes to API/Frontend**
  - Risk: Clients get 500 errors
  - Mitigation: Deploy backend before frontend
  - Approval: Release manager must coordinate

### Timeline Approved?
- [ ] Planning: This week ✅
- [ ] Dev: 1 week (API + Components)
- [ ] Testing: 3 days (staging + E2E)
- [ ] Migration: 1 day (prod)
- [ ] **Total: ~10 days**

Is this timeline acceptable? → ☑️ Yes / ☐ Adjust

---

## 💰 Resource Allocation

- [ ] **Dev time**: 40 hours (backend + frontend)
- [ ] **QA time**: 16 hours (testing + staging)
- [ ] **DevOps**: 8 hours (migration + monitoring)
- [ ] **Total**: ~3 person-weeks

Budget impact? → ☑️ Acceptable / ☐ Need to adjust

---

## ✅ Final Approval

### Technical Lead Sign-Off
- **Name:** ________________
- **Date:** ________________
- **Notes:** 

---

### PM Sign-Off
- **Name:** ________________
- **Date:** ________________
- **Go/No-Go:** ☐ GO / ☐ NO-GO
- **Contingencies:** 

---

### Architecture Lead Sign-Off
- **Name:** ________________
- **Date:** ________________
- **Approved:** ☐ Yes / ☐ No
- **Concerns:** 

---

## 📝 Next Steps After Approval

1. **Week 1: Development**
   - [ ] API routes
   - [ ] Zod validation
   - [ ] Server actions
   - [ ] Database queries

2. **Week 2: Frontend**
   - [ ] Components
   - [ ] Forms
   - [ ] Real-time updates (Pusher)

3. **Week 3: Testing & Migration**
   - [ ] Unit tests
   - [ ] E2E tests
   - [ ] Staging migration
   - [ ] Performance benchmarks

4. **Week 4: Launch**
   - [ ] Code review
   - [ ] Prod migration
   - [ ] Monitoring setup
   - [ ] Announcement

---

## 📞 Questions & Answers

**Q: Why separate tables for reactions?**  
A: Better query performance, audit trail, and extensibility. Counts can be denormalized later if needed.

**Q: Can we add reactions to comments later?**  
A: Yes! Schema supports it now. Frontend can be added incrementally.

**Q: What if full-text search is needed?**  
A: Phase 2: Integrate Meilisearch. Current indices support basic search (LIKE queries).

**Q: How do soft deletes work in practice?**  
A: Always filter `where: { deletedAt: null }` in queries. Admins can see deleted content with separate query.

**Q: Will this affect existing forum data?**  
A: ForumReply data migrates to ForumComment (same data, new table). Transparent to users.

---

**Created:** 2026-03-30  
**Status:** 🔄 Awaiting Sign-Off
