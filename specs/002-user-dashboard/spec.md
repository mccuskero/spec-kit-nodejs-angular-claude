# Feature Specification: User Dashboard

**Feature Branch**: `002-user-dashboard`
**Created**: 2025-12-13
**Status**: Draft
**Input**: User description: "Specify the dashboard. the user dashboard, will be broken down into a collapsable navigation menu on the left, and a workspace to the right (which takes up most, 70% of the screen. The navigation menu will have button selections for a Shared Blog, File, Change Logs. There will be a radio button for the file location for Local and Shared Repository. Username, and logout will be on the top left, User can click on their user-icon to get to their user profile. When in the File screen, The user can add a folder, then add files in the folder."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate Dashboard Layout (Priority: P1)

A user successfully logs in and lands on the dashboard, which displays a collapsible navigation menu on the left (30% width) and a main workspace on the right (70% width). The user can see their username and user icon in the top header, access navigation options, and toggle the navigation menu to maximize workspace.

**Why this priority**: This is the foundational layout that all other dashboard functionality depends on. Without the core layout and navigation structure, users cannot access any other features.

**Independent Test**: Can be fully tested by logging in, verifying the two-panel layout (navigation menu and workspace), checking responsive width ratios, collapsing/expanding the navigation menu, and confirming header elements (username, user icon, logout) are visible.

**Acceptance Scenarios**:

1. **Given** a user has successfully logged in, **When** they land on the dashboard, **Then** they see a navigation menu on the left (approximately 30% width) and a workspace on the right (approximately 70% width)
2. **Given** a user is on the dashboard, **When** they click the navigation menu collapse button, **Then** the navigation menu collapses to show only icons and the workspace expands to occupy more screen space
3. **Given** the navigation menu is collapsed, **When** the user clicks the expand button, **Then** the navigation menu expands to show full labels and the workspace adjusts to 70% width
4. **Given** a user is on the dashboard, **When** they view the top header, **Then** they see their username, user icon, and logout button displayed in the top-left area

---

### User Story 2 - Navigation Menu Interaction (Priority: P1)

A user can navigate between different sections of the application (Shared Blog, File, Change Logs) by clicking navigation menu buttons, and can switch the file location context between Local and Shared Repository using a radio button selector.

**Why this priority**: Navigation is critical for accessing all major features. Without functional navigation, users are stuck on one screen and cannot perform their primary tasks.

**Independent Test**: Can be fully tested by clicking each navigation button (Shared Blog, File, Change Logs) and verifying the workspace updates to show the appropriate section, then toggling the repository selector and verifying context changes.

**Acceptance Scenarios**:

1. **Given** a user is on the dashboard, **When** they click the "Shared Blog" button in the navigation menu, **Then** the workspace displays the Shared Blog view
2. **Given** a user is on the dashboard, **When** they click the "Content" button in the navigation menu, **Then** the workspace displays the Content management view
3. **Given** a user is on the dashboard, **When** they click the "Change Logs" button in the navigation menu, **Then** the workspace displays the Change Logs view
4. **Given** a user is viewing any section, **When** they toggle the repository radio button from "Local" to "Shared Repository", **Then** the workspace updates to show content from the selected repository location
5. **Given** a user has selected a navigation option, **When** they view the navigation menu, **Then** the currently active section is visually highlighted

---

### User Story 3 - User Profile Access (Priority: P2)

A user can access their user profile settings by clicking on their user icon in the top header, allowing them to manage personal information, change password, and configure preferences.

**Why this priority**: While important for account management, this is secondary to core navigation and content management. Users need to navigate and work with content before they need to update their profile.

**Independent Test**: Can be fully tested by clicking the user icon in the header and verifying navigation to the user profile screen, then returning to the dashboard.

**Acceptance Scenarios**:

1. **Given** a user is on the dashboard, **When** they click on their user icon in the top header, **Then** they are navigated to the user profile screen
2. **Given** a user is viewing their profile, **When** they navigate back to the dashboard, **Then** they return to the section they were previously viewing
3. **Given** a user hovers over their user icon, **When** they view the icon, **Then** they see a visual indicator that it is clickable (cursor change, hover effect)

---

### User Story 4 - Logout Functionality (Priority: P2)

A user can securely log out of the application by clicking the logout button in the top header, which terminates their session and redirects them to the login screen.

**Why this priority**: Security feature that allows users to end their session, but lower priority than core navigation and content functionality.

**Independent Test**: Can be fully tested by clicking the logout button, verifying session termination, and confirming redirection to the login screen with no cached authentication.

**Acceptance Scenarios**:

1. **Given** a user is logged in to the dashboard, **When** they click the "Logout" button in the top header, **Then** their session is terminated and they are redirected to the login screen
2. **Given** a user has logged out, **When** they attempt to navigate back to the dashboard using browser back button, **Then** they are redirected to the login screen (session is invalid)
3. **Given** a user clicks logout, **When** the logout process completes, **Then** all authentication tokens and session data are cleared

---

### User Story 5 - Folder Creation and File Management (Priority: P1)

When a user is in the File section, they can create folders to organize their files and add file items within those folders, enabling hierarchical file organization.

**Why this priority**: This is a core file management capability. Without folder creation and file addition, the File section provides no value.

**Independent Test**: Can be fully tested by navigating to the File section, creating a new folder, verifying folder appears in the workspace, clicking the folder to open it, adding files within the folder, and verifying the files are saved and displayed.

**Acceptance Scenarios**:

1. **Given** a user is viewing the File section, **When** they click "+ Folder" button, **Then** they are prompted to enter a folder name and the folder is created in the current location
2. **Given** a folder has been created, **When** the user views the File section, **Then** the folder is displayed in the file list table
3. **Given** a user has opened a folder, **When** they click "+ File" button, **Then** they can create a new file item within that folder
4. **Given** files have been added to a folder, **When** the user opens the folder, **Then** they see all file items contained in that folder
5. **Given** a user is viewing nested folders, **When** they navigate the folder hierarchy, **Then** they can see breadcrumb navigation showing their current location

---

### User Story 6 - File List Table View with Multi-Select (Priority: P1)

A user can view all folders and files in a structured table layout showing metadata (name, author, last updated, type, size, status) and can select multiple items for bulk operations.

**Why this priority**: Table view with metadata is essential for users to understand and manage their files effectively. Multi-select enables efficient bulk operations.

**Independent Test**: Can be fully tested by viewing the file list table, verifying all columns display correct data, selecting individual items via checkboxes, using "select all" checkbox, and observing visual feedback for selected items.

**Acceptance Scenarios**:

1. **Given** a user is viewing files in a folder, **When** they view the file list, **Then** they see a table with columns: Select, Name, Author, Last Updated, Type, Size, Status, Actions
2. **Given** the file list contains items, **When** the user clicks a checkbox next to an item, **Then** that item is selected and highlighted
3. **Given** the file list contains items, **When** the user clicks the "Select All" checkbox in the table header, **Then** all visible items are selected
4. **Given** some items are selected, **When** the user views the selection, **Then** they see a count of selected items displayed
5. **Given** items display status badges, **When** the user views the Status column, **Then** published items show a green "Published" badge and unpublished items show a gray "Draft" badge

---

### User Story 7 - Individual File/Folder Actions via Dropdown (Priority: P1)

A user can perform actions (Edit, Publish, Unpublish, Delete) on individual files or folders using an action dropdown menu accessible from each row.

**Why this priority**: Users need quick access to common operations on individual items without bulk selection.

**Independent Test**: Can be fully tested by clicking the action menu (⋮) button on a file row, verifying dropdown opens with correct options, selecting an action, and confirming it executes properly.

**Acceptance Scenarios**:

1. **Given** a user is viewing the file list, **When** they click the action menu button (⋮) on a row, **Then** a dropdown menu appears with Edit, Publish/Unpublish, and Delete options
2. **Given** a file is in Draft status, **When** the user opens the action menu, **Then** they see "Publish" option
3. **Given** a file is Published, **When** the user opens the action menu, **Then** they see "Unpublish" option
4. **Given** the user clicks "Delete" in action menu, **When** they confirm, **Then** the item is deleted and removed from the list
5. **Given** the user clicks "Edit" in action menu, **When** the dialog opens, **Then** they can modify the item's properties

---

### User Story 8 - Bulk Actions on Selected Items (Priority: P1)

A user can perform bulk operations (Publish, Unpublish, Delete) on multiple selected files/folders simultaneously via a bulk actions toolbar.

**Why this priority**: Bulk operations significantly improve productivity when managing multiple files.

**Independent Test**: Can be fully tested by selecting multiple items via checkboxes, verifying the bulk actions toolbar appears, clicking a bulk action button, and confirming the action applies to all selected items.

**Acceptance Scenarios**:

1. **Given** a user has selected multiple items, **When** they view the interface, **Then** a bulk actions toolbar appears showing the count of selected items
2. **Given** the bulk actions toolbar is visible, **When** the user views it, **Then** they see buttons for Publish, Unpublish, and Delete
3. **Given** the user clicks "Publish" in bulk actions, **When** the operation completes, **Then** all selected items are published and selection is cleared
4. **Given** the user clicks "Unpublish" in bulk actions, **When** the operation completes, **Then** all selected items are unpublished and selection is cleared
5. **Given** the user clicks "Delete" in bulk actions, **When** they confirm, **Then** all selected items are deleted, removed from the list, and selection is cleared

---

### User Story 9 - File CRUD Operations (Priority: P1)

A user can create, read, update, and delete files within folders, with proper validation and error handling.

**Why this priority**: Core file management operations that users perform regularly.

**Independent Test**: Can be fully tested by creating a new file, viewing its properties, editing the file, and deleting it.

**Acceptance Scenarios**:

1. **Given** a user is inside a folder, **When** they click "+ File" button, **Then** a dialog opens to create a new file
2. **Given** the user fills in file details, **When** they submit, **Then** the file is created and appears in the file list
3. **Given** a user selects "Edit" on a file, **When** they modify properties and save, **Then** the file is updated with new values
4. **Given** a user deletes a file, **When** the operation completes, **Then** the file is permanently removed from the system
5. **Given** a user creates/edits a file, **When** validation fails, **Then** clear error messages are displayed

---

### Edge Cases

- What happens when a user resizes their browser window below minimum width thresholds?
- How does the dashboard behave on mobile devices where 30/70 split may not be appropriate?
- What happens when a user tries to create a folder with an empty name or invalid characters?
- How does the system handle switching repository context (Local/Shared) while user has unsaved changes?
- What happens if the user icon image fails to load?
- How does the navigation menu handle very long section names or many navigation items?
- What happens when a user is viewing a deep folder hierarchy and the navigation breadcrumb becomes too long?
- How does the system prevent users from navigating away with unsaved content?
- What happens when repository data is unavailable (network error, service down)?
- How does the dashboard handle a user who doesn't have permission to access certain sections (e.g., Change Logs)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a dashboard with a two-panel layout: navigation menu (left) and workspace (right)
- **FR-002**: System MUST allocate approximately 30% of screen width to navigation menu and 70% to workspace by default
- **FR-003**: System MUST provide a collapsible navigation menu that can be toggled between expanded and collapsed states
- **FR-004**: System MUST display username and user icon in the top header area
- **FR-005**: System MUST display a logout button in the top header area
- **FR-006**: System MUST make the user icon clickable and navigate to user profile when clicked
- **FR-007**: Navigation menu MUST include buttons for: Shared Blog, File, and Change Logs
- **FR-008**: Navigation menu MUST include a radio button selector for repository location: Local and Shared Repository
- **FR-009**: System MUST update the workspace content when a navigation button is clicked
- **FR-010**: System MUST visually highlight the currently active navigation section
- **FR-011**: System MUST maintain the selected repository location (Local/Shared) when switching between navigation sections
- **FR-012**: In the File section, system MUST provide a "+ Folder" button to create new folders
- **FR-013**: In the File section, system MUST provide a "+ File" button (visible when inside a folder) to create new files
- **FR-014**: System MUST display folders and files in a hierarchical structure
- **FR-015**: System MUST provide breadcrumb navigation to show current folder location
- **FR-016**: System MUST allow users to open folders to view their contents
- **FR-017**: System MUST display file list in a table with columns: Select, Name, Author, Last Updated, Type, Size, Status, Actions
- **FR-018**: File list table MUST display file metadata including author, modification date/time, file type, and file size
- **FR-019**: File list table MUST show publication status with visual badges (Published = green, Draft = gray)
- **FR-020**: System MUST provide checkboxes for multi-select on each file/folder row
- **FR-021**: System MUST provide "Select All" checkbox in table header to select/deselect all items
- **FR-022**: System MUST visually highlight selected rows (e.g., blue background)
- **FR-023**: System MUST display bulk actions toolbar when items are selected, showing: selection count, Publish, Unpublish, Delete buttons
- **FR-024**: System MUST provide action dropdown menu (⋮) on each row with Edit, Publish/Unpublish, Delete options
- **FR-025**: Action dropdown MUST show "Publish" for unpublished items and "Unpublish" for published items
- **FR-026**: System MUST support Create, Read, Update, Delete operations for files
- **FR-027**: System MUST support Publish and Unpublish operations for both files and folders
- **FR-028**: System MUST execute bulk actions on all selected items simultaneously
- **FR-029**: System MUST clear selection after bulk action completion
- **FR-030**: System MUST use GraphQL `folder` query to retrieve folder list from Orchard Core
- **FR-031**: System MUST use REST API (`POST /api/content`) to create folders and files
- **FR-032**: System MUST use REST API (`PUT /api/content/{id}`) to update files and folders
- **FR-033**: System MUST use REST API (`DELETE /api/content/{id}`) to delete files and folders
- **FR-034**: Logout button MUST terminate the user session and redirect to login screen
- **FR-035**: System MUST persist the user's navigation state (current section, repository selection) across page refreshes
- **FR-036**: System MUST validate folder/file names before creation (non-empty, valid characters)
- **FR-037**: System MUST prevent navigation menu from being permanently hidden (always accessible via toggle)
- **FR-038**: System MUST format file sizes in human-readable format (B, KB, MB, GB, TB)
- **FR-039**: System MUST detect and display file types based on MIME type or file extension
- **FR-040**: System MUST support responsive design, hiding less critical columns (Author, Type, Size) on smaller screens

### Key Entities

- **Navigation Menu**: Collapsible panel containing navigation buttons and repository selector
- **Workspace**: Main content area that displays different views based on navigation selection
- **Navigation Section**: Distinct areas of the application (Shared Blog, File, Change Logs)
- **Repository Location**: Context selector indicating whether files are from Local or Shared Repository
- **Folder**: Container for organizing files in a hierarchical structure (Orchard Core Folder content type)
- **File**: Individual file item stored within folders (Orchard Core File content type)
- **File List Table**: Table view displaying folders and files with metadata columns
- **Selection State**: Currently selected files/folders for bulk operations
- **Bulk Actions Toolbar**: UI component appearing when items are selected, providing bulk operation buttons
- **Action Dropdown**: Per-row menu providing Edit, Publish/Unpublish, Delete actions
- **Publication Status**: State indicating if a file/folder is Published or Draft
- **User Profile**: User account settings and preferences accessible via user icon
- **Dashboard State**: Current navigation section, repository location, folder path, and selection state
- **Breadcrumb Trail**: Navigation path showing current location in folder hierarchy (max 10 levels)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate between all three sections (Shared Blog, File, Change Logs) in under 2 seconds per transition
- **SC-002**: The navigation menu collapse/expand animation completes in under 300ms for smooth user experience
- **SC-003**: 90% of users can successfully create a folder and add files within their first 5 minutes of using the File section
- **SC-004**: The dashboard layout remains functional and usable on screen widths from 1024px to 4K resolution
- **SC-005**: Repository location toggle (Local/Shared) updates the workspace content in under 2 seconds
- **SC-006**: Users can access their profile by clicking the user icon with 100% success rate
- **SC-007**: Logout completes and redirects to login screen in under 3 seconds
- **SC-008**: The dashboard loads completely (all UI elements rendered) within 3 seconds of successful login
- **SC-009**: Users can navigate up to 10 levels deep in folder hierarchy without performance degradation
- **SC-010**: 95% of users can locate and use the repository selector without assistance

## Assumptions

- User has already successfully authenticated via the login screen (001-login-screen)
- The dashboard is the default landing page after successful login
- User profile screen exists and is accessible via routing (will be specified in future feature: user-profile)
- Shared Blog, File, and Change Logs sections are distinct functional areas that will be detailed in separate specifications
- Repository data (Local and Shared Repository) is accessible via Orchard Core content management APIs
- Folder and content operations integrate with Orchard Core content management services
- Content items can be of various types (documents, media, structured content) - specific content types will be defined in content management feature spec
- The navigation state (current section, repository location, folder path) should persist in browser session storage
- User permissions and access control are managed by Orchard Core authentication
- The layout should be responsive but primary target is desktop/laptop screens (mobile optimization is a future enhancement)
- Navigation menu can be collapsed to icon-only mode to maximize workspace (approximately 5% width when collapsed)
- Breadcrumb navigation or similar mechanism will show current folder path
- "Add Folder" and "Add Content" buttons are contextual and appear in the Content section workspace

## Layout and Interaction Patterns

### Dashboard Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: [User Icon] [Username]              [Logout]           │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                   │
│  Navigation  │  Workspace (70%)                                 │
│  Menu (30%)  │                                                   │
│              │  [Content varies based on selected section]      │
│  [Toggle]    │                                                   │
│              │                                                   │
│  • Shared    │                                                   │
│    Blog      │                                                   │
│  • Content   │                                                   │
│  • Change    │                                                   │
│    Logs      │                                                   │
│              │                                                   │
│  ○ Local     │                                                   │
│  ○ Shared    │                                                   │
│    Repo      │                                                   │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

### Navigation Menu States

- **Expanded**: Shows full text labels for all buttons, radio button labels visible, approximately 30% width
- **Collapsed**: Shows only icons for navigation buttons, radio buttons remain accessible, approximately 5% width

### Content Section Workspace

When Content section is active, the workspace displays:
- List of folders and content items in current location
- "Add Folder" button
- "Add Content" button (when inside a folder)
- Breadcrumb navigation showing current path
- Folder icons indicating containers
- Content items with type indicators

### Repository Selector Behavior

- Radio button selection persists across navigation section changes
- Changing repository location reloads workspace content from the selected repository
- Visual indication of which repository is currently selected
- Repository selection state saved in session storage

## Constraints and Limitations

- Initial implementation focuses on desktop/laptop screen sizes (1024px width minimum)
- Folder depth limited to reasonable hierarchy (recommend max 10 levels for UX)
- Navigation menu always accessible (cannot be permanently hidden)
- Repository toggle affects all sections (global context switch)
- Folder and content names must follow Orchard Core content naming conventions
