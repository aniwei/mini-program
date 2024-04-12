use async_trait::async_trait;
use anyhow::*;

use crate::{process::AssetProcess, Asset};

pub struct CSSProcessor {
    pub extensions: Vec<&'static str>
  }
  
  impl CSSProcessor {
    pub fn new() -> Self {
      Self {
        extensions: vec![
          "css",
          "scss",
          "sass",
          "less",
        ]
      }
    }
  }
  
  #[async_trait]
  impl AssetProcess for CSSProcessor {
    fn get_extesions(&self) -> &Vec<&'static str> {
      &self.extensions
    }
  
    async fn process<T: Asset + ?Sized>(&self, asset: &mut T) -> Result<()> {
      Ok(())
    }
  }
  