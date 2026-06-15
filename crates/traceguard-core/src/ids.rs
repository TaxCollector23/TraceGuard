//! Identifier generation. Random UUID v4 strings keep IDs URL-safe and unique
//! across machines without a central allocator.

use uuid::Uuid;

/// Generate a new lowercase hyphenated UUID string.
pub fn new_id() -> String {
    Uuid::new_v4().to_string()
}
