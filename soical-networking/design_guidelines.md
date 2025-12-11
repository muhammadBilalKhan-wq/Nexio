# KnowledgeHub Design Guidelines

## Authentication & Navigation

### Auth System
**Required**: Email/password (forgot flow), Google SSO, Phone OTP, Apple Sign-In (iOS)
**Flow**: Splash (2s) → Onboarding (3 screens) → Sign Up/Login → Phone Verification
**Profile**: Avatar, display name, bio (160 char max), expertise category, privacy settings
**Account**: Settings → Account → [Change Password, Delete Account (double confirm), Privacy]

### Tab Bar Navigation (5 tabs)
1. **Home** (Feed) - Main feed
2. **Explore** (Compass) - Trending/categories
3. **Create** (Plus, center) - New post modal
4. **Notifications** (Bell) - Engagement alerts
5. **Profile** (User) - User profile/settings

### Screen Stack
- **Home**: Feed → Post Detail → User Profile → Comments
- **Explore**: Explore → Category View → Post Detail → User Profile
- **Notifications**: List → Post Detail → User Profile
- **Profile**: My Profile → Settings → Edit Profile → Change Password
- **Global Modals**: Search, Admin Panel (admin only)

## Screen Layouts

### Splash
Full-screen logo + "Share Pure Knowledge", auto-transition (2s), no header

### Onboarding (3 screens)
Full-screen cards: illustration + headline + description + dots. Skip (top-right), Next/Get Started button. Swipeable horizontal.

### Login/Signup
Transparent header, back button. Scrollable: logo/tagline → email/password fields → submit → divider "OR" → SSO buttons (Google/Apple) → phone auth link → toggle login/signup. Bottom inset: `insets.bottom + xl`

### Home Feed
**Header**: Transparent, logo (left), search (right). **Content**: FlatList of post cards. **Insets**: Top `headerHeight + xl`, Bottom `tabBarHeight + xl`. Pull-to-refresh enabled.
**Post Card**: Author info, title, snippet, category badge, upvote/save/comment counts

### Explore
**Header**: "Explore", search (right). **Content**: Horizontal category chips (Trending, Science, Tech, Health) → grid/list of filtered posts. Bottom inset: `tabBarHeight + xl`

### Create Post (Modal)
**Header**: Cancel (left), "New Post", Publish (right, disabled until valid). **Form**: Cover image upload (16:9 optional) → title (100 char max) → category selector → rich text content (2000 char max) → tags (comma-separated). Insets: Top `xl`, Bottom `insets.bottom + xl`

### Post Detail
**Header**: Back, share (right), report menu (right). **Content**: Cover image → author row (avatar, name, expertise, follow) → title (large bold) → category/tags → full content → interaction bar (upvote count/button, save, share) → comments section. **Floating**: Comment input bar at `bottom: tabBarHeight + md`, shadow `0,-2,0.10,2`

### User Profile (Others)
**Header**: Back, report menu (right). **Content**: Profile header (avatar, name, expertise badge, bio) → stats row (reputation level badge, posts, followers, following) → Follow/Unfollow button → tabs (Posts, Upvoted) → post list. Insets: Top `xl`, Bottom `tabBarHeight + xl`

### My Profile
Same as User Profile. **Header**: "Profile", settings gear (right). Edit Profile button instead of Follow.

### Settings
**Header**: Back, "Settings". **Sections**: 
- Account (Edit Profile, Change Password, Privacy)
- Preferences (Dark/Light toggle, Language: English/Urdu)
- About (Privacy Policy, Terms)
- Danger Zone (Delete Account nested)
- Admin Panel (admin only)
- Logout (bottom)
Insets: Top `xl`, Bottom `tabBarHeight + xl`

### Notifications
**Header**: "Notifications", filter (right). **Content**: FlatList of notification cards (avatar, action text, timestamp, unread indicator). Types: follower, upvote, comment, mention, level-up. Bottom inset: `tabBarHeight + xl`

### Search (Modal)
**Header**: Transparent, large search bar, cancel (right). **Content**: Tabs (All, Posts, Users, Categories, Tags) → results list. Insets: Top `headerHeight + xl`, Bottom `insets.bottom + xl`. Debounced real-time search.

### Admin Panel (Admin Only)
**Header**: Back, "Admin Panel". **Tabs**: Reported Posts (review/remove), Banned Users (unban), Analytics. Insets: Top `xl`, Bottom `tabBarHeight + xl`

## Design System

### Colors
**Light**: BG `#FFFFFF`, Surface `#F8F9FA`, Primary `#007AFF`, Secondary `#5856D6`, Text `#000000`/`#8E8E93`, Border `#E5E5EA`, Success `#34C759`, Warning `#FF9500`, Error `#FF3B30`
**Dark**: BG `#000000`, Surface `#1C1C1E`, Primary `#0A84FF`, Secondary `#5E5CE6`, Text `#FFFFFF`/`#98989D`, Border `#38383A`, Success `#30D158`, Warning `#FF9F0A`, Error `#FF453A`

### Typography
**Font**: SF Pro Display/Text (iOS), Inter (Android)
**Sizes**: Large Title 34pt Bold, Title1 28pt Bold, Title2 22pt Bold, Title3 20pt Semibold, Body 17pt, Callout 16pt, Subhead 15pt, Footnote 13pt, Caption 12pt

### Spacing
xs:4px, sm:8px, md:16px, lg:24px, xl:32px, xxl:48px

### Components
**Cards**: 12px radius, shadow `0,2,0.10,8`, surface BG
**Buttons**: 
- Primary: Filled primary, white text, 10px radius, 50px height
- Secondary: Outlined primary, primary text, 10px radius
- Tertiary: Text-only
- Press: opacity 0.6

**Inputs**: 1px border, 10px radius, 50px height, primary border on focus
**Icons**: Feather (@expo/vector-icons), 24px default
**Avatars**: Circular - 32px (small), 48px (medium), 80px (large), 120px (profile)
**Reputation Badges**: Shield icon
- Beginner `#8E8E93`, Rising `#007AFF`, Skilled `#5856D6`, Expert `#FF9500`, Master `#FF3B30`

**Category Badges**: Pill, primary color @ 0.1 opacity
**FAB (Create)**: 56px circle, shadow `0,2,0.10,2`, center of tab bar

### Interactions
**Gestures**: Swipe-to-refresh, swipeable onboarding
**Transitions**: Slide right (push/pop), slide bottom (modal), fade (splash)
**Animations**: Spring (tension:300, friction:30) for buttons, smooth opacity for states
**Loading**: Skeleton screens (feeds), spinners (submits)
**Empty States**: Centered icon + headline + description

### Accessibility
- Min touch: 44x44px
- Contrast: 4.5:1 text
- System font scaling support
- VoiceOver/TalkBack labels
- Keyboard navigation
- Alt text for images/icons
- Focus indicators

## Critical Assets
**Logo**: Minimalist knowledge-sharing icon (book + network nodes)
**Onboarding Illustrations (3)**: 1) Person sharing knowledge 2) Reputation/trophy 3) Community connection
**Reputation Badges (5)**: Shield icons per level (colors above)
**Empty State Illustrations**: No posts, followers, notifications, search results
**Default Avatars (6)**: Geometric patterns with book/lightbulb/brain motifs in app colors

**Style**: Apple design language - minimal, clean lines, soft gradients, modern