pub mod server;

use std::path::Path;
use server::WxServer;

pub fn create_wx_application(host: &str, port: u16, root: &Path) -> WxServer {
  let app = WxServer::new(host, port, root);
  app
}

#[cfg(test)]
mod tests {
  use std::path::Path;

use super::*;

  #[test]
  fn test_create_wx_application() {
    // Add your assertions here
    let host = "0.0.0.0";
    let port = 3000;
    let root = Path::new(".");
    let app = create_wx_application(host, port, root);
  }
}