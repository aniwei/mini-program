use anyhow::*;
use async_trait::async_trait;

use crate::{process::SourceProcess};
use crate::Source;

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

  async fn process(&self, source: &mut Source<&str>) -> Result<()> {
    // 如果已经处理过，则直接返回
    if source.is_processed() || source.is_transformed() {
      return Ok(());
    }

    self.set_transformed_raw(source.get_raw().unwrap().to_vec());

    Ok(())
  }
}
