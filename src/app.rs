use crate::routes::task_routes::{create_update_task, get_tasks};
use actix_web::web;

pub fn app_config(cfg: &mut web::ServiceConfig) {
    cfg
        .service(web::scope("/api")
            .route("/task", web::post().to(create_update_task))
            .route("/tasks", web::get().to(get_tasks))
        );
}
