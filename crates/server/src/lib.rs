use wx::WxApp;

mod wx;

pub fn create_wx_application() -> WxApp {
  let app = WxApp::new();
  app
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_create_wx_application() {
    let app = create_wx_application();
    // Add your assertions here
  }
}