/// 错误码
pub enum ErrorCodeKind {
  Timeout = 402,
  Canceled = 403,
  Scanned = 404,
  Success = 405,
  KeepAlive = 408,
  Error = 500
}

/// checker
pub struct ScanChecker {
  
}

impl ScanChecker {
  pub fn run(code: &str) {

  }

  pub fn abort() {

  }
}

/// 微信授权
pub struct Auth {
  code: String
}

impl Auth {
  pub fn get_user(code: &str) {

  }
}