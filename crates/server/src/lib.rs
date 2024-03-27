pub mod server;

use std::path::Path;
use server::WxServer;

pub fn create_wx_application(port: u32, root: &Path, watch: bool) -> WxServer {
  let app = WxServer::new();
  app
}

#[cfg(test)]
mod tests {
  use std::path::Path;

use super::*;

  #[test]
  fn test_create_wx_application() {
    let app = create_wx_application(3000, Path::new(""), false);
    // Add your assertions here
  }
}