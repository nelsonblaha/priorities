// utils/cors.rs
use actix_cors::Cors;
use actix_web::http;

pub fn cors_setup() -> Cors {
    Cors::default()
        .allowed_origin_fn(|origin, _req_head| {
            if let Ok(allowed_origin) = std::env::var("ALLOWED_ORIGIN") {
                origin.as_bytes().starts_with(allowed_origin.as_bytes())
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
