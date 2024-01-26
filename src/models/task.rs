use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};  // Assuming you're using the chrono crate for date and time

#[derive(Serialize, Deserialize, Debug)]
pub struct Completion {
    pub completed_at: DateTime<Utc>,  // Using DateTime<Utc> to represent an instant
    // Include any other fields relevant to a task completion here
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Task {
    pub _id: Option<String>,
    pub _rev: Option<String>,
    pub description: String,
    pub due_date: Option<String>,
    pub _deleted: Option<bool>,
    pub repeat_mode: Option<String>,
    pub repeat_number: Option<i32>,
    pub repeat_unit: Option<String>,
    pub completions: Vec<Completion>,
    pub completed: Option<bool>
}
