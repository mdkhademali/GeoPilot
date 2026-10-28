# Permissions
| Permission | Why |
|---|---|
| `storage` | Save notes, bookmarks, settings in `chrome.storage.local`. |
| `activeTab` | Read title/URL/selection/meta of the current tab only after the user clicks the toolbar icon. |
| `scripting` | Run the capture function in the active tab. |
| `sidePanel` | Provide the main workspace. |

No host permissions. CSP `connect-src https://api.crossref.org` allows only the DOI lookup. Optional shortcut Alt+G opens the popup (`_execute_action`).
