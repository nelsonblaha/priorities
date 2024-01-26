// src/main.rs
mod app;
mod models;
mod routes;
mod utils;

use actix_web::{middleware, HttpServer, App};
use actix_files as fs;
use utils::cors::cors_setup;
use env_logger;
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env::set_var("RUST_LOG", "actix_web=debug,actix_server=info");
    env_logger::init();
    HttpServer::new(move || {
        App::new()
            .wrap(cors_setup())
            .wrap(middleware::Logger::default())
            .configure(app::app_config)
            .service(fs::Files::new("/", "./static").index_file("index.html"))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
