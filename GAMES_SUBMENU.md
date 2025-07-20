# Games Submenu & Filtering Implementation

## Features Added

### 1. Collapsible Games Submenu
- **Toggle functionality**: Click "Games" to expand/collapse submenu
- **Auto-open**: Submenu automatically opens when navigating to games page
- **Visual indicators**: Chevron icon rotates to show open/closed state

### 2. Status-Based Filtering
The submenu includes these filter options:
- **All Games** (no filter) - Shows all games in library
- **Playing** - Shows games with status "playing"  
- **Completed** - Shows games with status "completed"
- **Want to Play** - Shows games with status "want_to_play"
- **Dropped** - Shows games with status "dropped"

### 3. Visual Enhancements
- **Color-coded dots** next to each status for quick visual identification
- **Active state highlighting** for currently selected filter
- **Dynamic page title** that shows current filter (e.g., "Games - Playing")

## Technical Implementation

### URL Structure
Filters are applied via query parameters:
```
/games                    -> Shows all games
/games?status=playing     -> Shows only playing games  
/games?status=completed   -> Shows only completed games
/games?status=want_to_play -> Shows only want to play games
/games?status=dropped     -> Shows only dropped games
```

### Component Updates

#### DashboardLayout.vue
- Added collapsible submenu with status filters
- Added dynamic page title based on current filter
- Auto-opens submenu when on games page

#### GamesView.vue  
- Added computed property to filter games based on route query
- Added route watcher for status changes
- Maintains separate `allUserGames` and filtered `userGames`

### Data Flow
1. User clicks status filter in sidebar
2. Router navigates to `/games?status=<filter>`
3. GamesView detects route change and filters games
4. MediaLibrary displays filtered results
5. Page title updates to reflect current filter

## Status Mapping
Make sure your backend uses these status values:
- `playing` - Currently playing
- `completed` - Finished/completed  
- `want_to_play` - Want to play in future
- `dropped` - Started but stopped playing

## Usage Examples

### Navigation
```javascript
// Navigate to show only playing games
router.push({ name: 'games', query: { status: 'playing' } });

// Navigate to show all games  
router.push({ name: 'games' });
```

### Checking Current Filter
```javascript
// In component
const currentFilter = route.query.status || 'all';
```

The implementation is now complete and ready for testing! The sidebar will show the games submenu with all status filters, and clicking them will filter the games library accordingly.
