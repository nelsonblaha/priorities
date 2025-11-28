// src/main.rs
mod app;
mod models;
mod routes;
mod utils;

use actix_web::{middleware, HttpServer, App, web};
use actix_files as fs;
use utils::cors::cors_setup;
use env_logger;
use std::env;
use serde::Deserialize;
use std::fs::read_to_string;

#[derive(Deserialize)]
struct Config {
    server: ServerConfig,
    database: DatabaseConfig,
}

#[derive(Deserialize, Clone)]
pub struct ServerConfig {
    allowed_origin: String,
}

#[derive(Deserialize, Clone)]
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub db_name: String,
    pub username: String,
    pub password: String,
}

impl DatabaseConfig {
    pub fn get_url(&self) -> String {
        format!(
            "http://{}:{}@{}:{}/{}",
            self.username, self.password, self.host, self.port, self.db_name
        )
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config_contents = read_to_string("Configuration.toml")
        .expect("Failed to read configuration file");

    let config: Config = toml::from_str(&config_contents)
        .expect("Failed to parse configuration file");

    let db_config = config.database.clone();

    env::set_var("ALLOWED_ORIGIN", config.server.allowed_origin);
    env::set_var("RUST_LOG", "actix_web=debug,actix_server=info");
    env_logger::init();
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(db_config.clone()))
            .wrap(cors_setup())
            .wrap(middleware::Logger::default())
            .configure(app::app_config)
            .service(fs::Files::new("/", "./static").index_file("index.html"))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
