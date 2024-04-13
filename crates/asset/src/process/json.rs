use anyhow::*;
use async_trait::async_trait;

use crate::{process::SourceProcess};
use crate::Source;

/// JSONProcessor 处理图片文件
pub struct JSONProcessor {
  extensions: Vec<&'static str>,
}

impl JSONProcessor {
  pub fn new() -> Self {
    Self {
      extensions: vec!["json"],
    }
  }
}

#[async_trait]
impl SourceProcess for JSONProcessor {
  fn get_extesions(&self) -> &Vec<&'static str> {
    &self.extensions
  }

  async fn process(&self, source: &mut Source<&str>) -> Result<()> {
    // 如果已经处理过，则直接返回
    if source.is_processed() || source.is_transformed() {
      return Ok(());
    }

    Ok(())
  }
}
