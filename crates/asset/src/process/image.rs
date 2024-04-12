use anyhow::*;
use async_trait::async_trait;

use crate::{process::SourceProcess};
use crate::source::Source;

/// ImageProcessor 处理图片文件
pub struct ImageProcessor {
  extensions: Vec<&'static str>,
}

impl ImageProcessor {
  pub fn new() -> Self {
    Self {
      extensions: vec!["png", "jpg", "jpeg"],
    }
  }
}

#[async_trait]
impl SourceProcess for ImageProcessor {
  fn get_extesions(&self) -> &Vec<&'static str> {
    &self.extensions
  }

  async fn process(&self, source: &mut Source) -> Result<()> {
    Ok(())
  }
}
