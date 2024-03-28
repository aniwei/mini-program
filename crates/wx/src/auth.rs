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
/// 二维码扫描轮训检查
pub struct ScanChecker {
  
}

impl ScanChecker {
  pub fn run(code: &str) {

  }

  pub fn abort() {

  }
}

///
struct User {

}

/// 微信授权
pub struct Auth {
  code: String
}

impl Auth {
  pub fn get_user(&self, code: &str) -> User {

  }
}