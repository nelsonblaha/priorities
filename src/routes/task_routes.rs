// routes/task_routes.rs
use actix_web::{web, HttpResponse, Responder, Error};
use crate::models::task::{Task, Completion};
use reqwest::Client;
use std::collections::HashMap;
use serde_json::json;
use chrono::{Utc, Duration};

// Calculate repeat interval in milliseconds
fn calculate_repeat_milliseconds(repeat_number: i32, repeat_unit: &str) -> i64 {
    let duration = match repeat_unit {
        "hours" => Duration::hours(repeat_number as i64),
        "days" => Duration::days(repeat_number as i64),
        "weeks" => Duration::weeks(repeat_number as i64),
        "months" => Duration::days(repeat_number as i64 * 30), // Approximate
        "years" => Duration::days(repeat_number as i64 * 365), // Approximate
        _ => Duration::zero(),
    };
    duration.num_milliseconds()
}

pub async fn create_update_task(task: web::Json<Task>) -> Result<HttpResponse, Error> {
    let client = Client::new();
    let couch_url = "http://admin:zWRQXR7oOWgsYaO3@couchdb-prod:5984/priorities";

    println!("-----Creating/Updating task: {:?}", task);

    // Convert task to serde_json::Value and remove None fields
    let mut task_data = serde_json::to_value(&*task).unwrap_or_else(|_| json!({ "error": "Failed to serialize task JSON" }));
    if let Some(task_object) = task_data.as_object_mut() {
        let keys_to_remove: Vec<String> = task_object.iter()
            .filter(|&(_, value)| value.is_null())
            .map(|(key, _)| key.clone())
            .collect();

        for key in keys_to_remove {
            task_object.remove(&key);
        }
    }

    fn remove_null_fields(task_object: &mut serde_json::Map<String, serde_json::Value>) {
        let keys_to_remove: Vec<String> = task_object.iter()
            .filter(|&(_, value)| value.is_null())
            .map(|(key, _)| key.clone())
            .collect();

        for key in keys_to_remove {
            task_object.remove(&key);
        }
    }

    let response = match &task._id {
        Some(id) => {
            // Fetch the current state of the task from the database
            let doc_url = format!("{}/{}", couch_url, id);

            let current_task_res = client.get(&doc_url)
                .send()
                .await
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Reqwest error: {}", e)))?; // Correctly map the error

            let mut current_task: Task = current_task_res.json().await
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Reqwest error: {}", e)))?; // Correctly map the error

            // If completed is true, add a completion and calculate visible_at
            if task.completed.unwrap_or(false) {
                let completion = Completion {
                    completed_at: Utc::now(),
                };
                current_task.completions.push(completion);

                // If task has repeat settings, calculate when it should become visible again
                if let (Some(repeat_mode), Some(repeat_number), Some(ref repeat_unit)) =
                    (&current_task.repeat_mode, current_task.repeat_number, &current_task.repeat_unit) {
                    if repeat_mode == "after-completion" && repeat_number > 0 {
                        let now_ms = Utc::now().timestamp_millis();
                        let repeat_ms = calculate_repeat_milliseconds(repeat_number, repeat_unit);
                        current_task.visible_at = Some(now_ms + repeat_ms);
                    }
                }
            }

            // Update task with new data (except for _id and _rev)
            current_task.description = task.description.clone();
            current_task.due_date = task.due_date.clone();
            current_task.repeat_mode = task.repeat_mode.clone();
            current_task.repeat_number = task.repeat_number;
            current_task.repeat_unit = task.repeat_unit.clone();
            if task._deleted.is_some() {
                current_task._deleted = task._deleted;
            }

            println!("current task: {:?}", current_task);

            // Convert updated task to serde_json::Value
            let mut task_data = serde_json::to_value(&current_task).unwrap_or_else(|_| json!({ "error": "Failed to serialize task JSON" }));
            if let Some(task_object) = task_data.as_object_mut() {
                remove_null_fields(task_object);
            }

            println!("task data: {:?}", task_data);

            // Make a PUT request to update the document
            client.put(doc_url)
                .json(&task_data)
                .send()
                .await
        },
        None => {
            // Convert task to serde_json::Value and remove fields with null values
            let mut task_data = serde_json::to_value(&*task).unwrap_or_else(|_| json!({ "error": "Failed to serialize task JSON" }));
            if let Some(task_object) = task_data.as_object_mut() {
                remove_null_fields(task_object);
            }

            // Make a POST request to create the document
            client.post(couch_url)
                .json(&task_data)
                .send()
                .await
        }
    };

    match response {
        Ok(res) => {
            if res.status().is_success() {
                // Parse the JSON response from CouchDB
                let cloudant_response = res.json::<serde_json::Value>().await.unwrap_or_else(|_| json!({ "error": "Failed to parse Cloudant response" }));

                // Create a combined JSON object with the task JSON and the Cloudant response
                let mut combined_json = task_data;

                // Set the _id and _rev fields from the Cloudant response
                if let Some(id) = cloudant_response.get("id").and_then(|id| id.as_str()) {
                    combined_json["_id"] = json!(id);
                }
                if let Some(rev) = cloudant_response.get("rev").and_then(|rev| rev.as_str()) {
                    combined_json["_rev"] = json!(rev);
                }

                Ok(HttpResponse::Ok().json(combined_json))
            } else {
                let error_message = res.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                println!("Failed to create/update task: {}", error_message);
                Err(actix_web::error::ErrorInternalServerError(error_message))
            }
        },
        Err(e) => {
            println!("Error creating/updating task: {:?}", e);
            Err(actix_web::error::ErrorInternalServerError(e))
        }
    }
}

pub async fn get_tasks(query: web::Query<HashMap<String, String>>) -> impl Responder {
    let client = Client::new();
    let couch_url = "http://admin:zWRQXR7oOWgsYaO3@couchdb-prod:5984/priorities";
    let find_url = format!("{}/_find", couch_url);
    let now = Utc::now().timestamp() * 1000; // Current time in milliseconds
    println!("-----Fetching tasks: {:?}", now);

    // Build Mango query based on search term or visible_at filter
    let mango_query = if let Some(search_term) = query.get("search_term") {
        println!("-----Searching for tasks with description: {}", search_term);
        json!({
            "selector": {
                "description": { "$regex": format!("(?i){}", search_term) },
                "$or": [
                    { "_deleted": { "$exists": false } },
                    { "_deleted": false }
                ]
            },
            "limit": 200
        })
    } else {
        println!("-----Fetching all visible tasks");
        // Return all tasks that are not deleted and are visible (visible_at <= now or not set)
        json!({
            "selector": {
                "description": { "$exists": true },
                "$and": [
                    {
                        "$or": [
                            { "_deleted": { "$exists": false } },
                            { "_deleted": false }
                        ]
                    },
                    {
                        "$or": [
                            { "visible_at": { "$exists": false } },
                            { "visible_at": { "$lte": now } }
                        ]
                    }
                ]
            },
            "limit": 200
        })
    };

    println!("------Mango Query: {:?}", mango_query);

    let res = client.post(&find_url)
        .json(&mango_query)
        .send()
        .await;

    // Handle the response and convert to expected format
    match res {
        Ok(response) => {
            println!("-----Response: {:?}", response);
            if response.status().is_success() {
                let body: serde_json::Value = response.json().await.unwrap_or_else(|_| json!({}));
                // Convert Mango response format to match what frontend expects
                let docs = body.get("docs").cloned().unwrap_or(json!([]));
                let rows: Vec<serde_json::Value> = docs.as_array()
                    .unwrap_or(&vec![])
                    .iter()
                    .map(|doc| json!({"doc": doc}))
                    .collect();
                let result = json!({
                    "rows": rows,
                    "total_rows": rows.len()
                });
                HttpResponse::Ok().json(result)
            } else {
                let error_body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                println!("-----Error: {:?}", error_body);
                HttpResponse::InternalServerError().json("Failed to retrieve tasks")
            }
        },
        Err(e) => {
            println!("Error fetching tasks: {:?}", e);
            HttpResponse::InternalServerError().json("Error fetching tasks")
        }
    }
}







