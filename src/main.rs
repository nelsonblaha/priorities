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
use serde::Deserialize;
use std::fs::read_to_string;

#[derive(Deserialize)]
struct Config {
    server: ServerConfig,
}

#[derive(Deserialize)]
struct ServerConfig {
    allowed_origin: String,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config_contents = read_to_string("Configuration.toml")
        .expect("Failed to read configuration file");

    let config: Config = toml::from_str(&config_contents)
        .expect("Failed to parse configuration file");

    env::set_var("ALLOWED_ORIGIN", config.server.allowed_origin);
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
