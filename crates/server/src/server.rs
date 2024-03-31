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

  pub fn start(&mut self) -> Result<()> {
    self.hpptServer = HttpServer::new(|| {
      actix_web::App::new()
    })
    .bind("127.0.0.1");
}
