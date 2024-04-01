use std::path::{Path, PathBuf};

use actix_web::{web, App, HttpServer, Responder};
use anyhow::*;
use core::result::Result::Ok;

#[derive(Debug)]
pub struct WxServer {
  pub(crate) host: String,
  pub(crate) port: u16,
  pub(crate) root: PathBuf
}

async fn index() -> impl Responder {
  "hello world"
}

/// 
impl WxServer {
  pub fn new(
    host: &str, 
    port: u16, 
    root: &Path
  ) -> WxServer {
    WxServer {
      host: host.to_string(),
      port,
      root: PathBuf::from(root)
    }
  }

  /// 启动服务
  /// 
  pub async fn start(
    &mut self, 
    callback: Option<Box<dyn Fn() -> Result<()>>>
  ) -> Result<()> {
    let server = HttpServer::new(|| {
      let http_server = App::new().service(
        web::scope("/app")
          .route("/", web::get().to(index)),
      );

      http_server
    }).bind((self.host.as_str(), self.port))?;

    if let Some(callback) = callback {
      callback()?;   
    }    
    
    server.run().await?;

    Ok(())
  }
}
