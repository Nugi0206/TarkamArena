# Security Specification - Tarkam Arena

## Data Invariants
1. A user profile MUST have a valid role (`PLAYER`, `CLUB_ADMIN`, `EO`, `ADMIN`, `VIEWER`).
2. A player profile MUST be linked to an existing user with the `PLAYER` role.
3. A player's `userId` must match their document ID and the authenticated user's ID.
4. Only the owner can update their own profile and player profile.
5. Tournaments can be created by any signed-in user (EOs), but only the organizer can update its core details.
6. Match updates are restricted to the EO of the parent tournament.
7. Timestamps (`createdAt`, `updatedAt`) must be server-generated.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to create a user profile with a `uid` different from `request.auth.uid`.
2. **Role Escalation**: Attempt to update own `role` from `VIEWER` to `ADMIN` without authorization.
3. **Ghost Field Injection**: Attempt to add `isAdmin: true` to a user profile.
4. **Orphaned Player**: Attempt to create a player profile for a user that doesn't exist or isn't a `PLAYER`.
5. **Score Tampering**: Attempt to update match scores by a user who is not the EO of the tournament.
6. **ID Poisoning**: Attempt to use a 2MB string as a document ID for a new tournament.
7. **Timestamp Fraud**: Attempt to set `createdAt` to a past date instead of `request.time`.
8. **Unauthorized Join**: Attempt to add a team to a tournament by someone other than the team admin or EO (depending on app logic).
9. **PII Leak**: Attempt to read another user's private email/data if (split collection strategy applied).
10. **Terminal State Bypass**: Attempt to update a match that is already marked as `FINISHED`.
11. **Relational Sync Break**: Attempt to create a match for a non-existent tournament.
12. **Query Scraping**: Attempt to list all users globally without region filtering (if enforced).

## Test Runner (Logic Overview)
The testing strategy will focus on enforcing:
- `isOwner(userId)`
- `isValidUser(incoming())`
- `isValidPlayer(incoming())`
- `isEO(tournamentId)`
- `isValidId(id)`
