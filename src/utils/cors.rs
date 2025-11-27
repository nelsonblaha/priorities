// utils/cors.rs
use actix_cors::Cors;
use actix_web::http;

pub fn cors_setup() -> Cors {
    Cors::default()
        .allowed_origin_fn(|origin, _req_head| {
            let origin_str = origin.to_str().unwrap_or("");
            // Allow localhost for testing
            if origin_str.starts_with("http://localhost") {
                return true;
            }
            // Allow configured origin
            if let Ok(allowed_origin) = std::env::var("ALLOWED_ORIGIN") {
                origin_str.starts_with(&allowed_origin)
            } else {
                false
            }
        })
        .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
        .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT, http::header::CONTENT_TYPE])
        .allowed_header(http::header::CONTENT_TYPE)
        .supports_credentials()
        .max_age(3600)
}
