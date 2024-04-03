
use std::{error::Error, fmt::{Display, Formatter, Result}};

#[derive(Debug)]
pub enum ParseError {
  /// 无效的 XML
  Invalid(xml::reader::Error),
  /// 无效的元素
  Unexpected
}

/// 实现解析错误
impl Display for ParseError {
  fn fmt(&self, f: &mut Formatter) -> Result {
    match *self {
      ParseError::Invalid(ref e) => write!(f, "Invalid token. {}", e),
      ParseError::Unexpected => write!(f, "Unexpected token."),
    }
  }
}

/// 实现解析错误
impl Error for ParseError {
  fn description(&self) -> &str {
    match *self {
      ParseError::Invalid(..) => "Invalid token",
      ParseError::Unexpected => "Unexpected token.",
    }
  }

  fn cause(&self) -> Option<&dyn Error> {
    match *self {
      ParseError::Invalid(ref e) => Some(e),
      ParseError::Unexpected => None,
    }
  }
}
