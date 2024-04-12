use anyhow::*;
use async_trait::async_trait;

use crate::{process::AssetProcess, Asset};

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
impl AssetProcess for ImageProcessor {
  fn get_extesions(&self) -> &Vec<&'static str> {
    &self.extensions
  }

  async fn process<T: Asset + ?Sized>(&self, asset: &mut T) -> Result<()> {
    Ok(())
  }
}
