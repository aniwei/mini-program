use actix_web::HttpServer;
use std::Default

#[derive(Debug, Default)]
pub struct WxApp {
  pub httpServer: Option<HttpServer>,
}

impl WxApp {
  pub fn new() -> WxApp {
    WxApp {
      httpServer: None,
    }
  }
}

impl WxApp {
  pub fn start(&self) {
    // Start the HTTP server
  }
}