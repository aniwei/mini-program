use actix_web::HttpServer;

#[derive(Debug, Default)]
pub struct WxServer {
  pub httpServer: Option<u16>
}

impl WxServer {
  pub fn new() -> WxServer {
    WxServer {
      httpServer: None,
    }
  }
}

impl WxServer {
  pub fn start(&self) {
    // Start the HTTP server
  }
}