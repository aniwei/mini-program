use async_trait::async_trait;
use anyhow::*;

use crate::{process::SourceProcess, Source};

/// 资源处理器
/// XMLProcessor 处理 wxml 文件
#[derive(Clone)]
pub struct XMLProcessor {
  extensions: Vec<&'static str>
}

// 
impl XMLProcessor {
  pub fn new() -> Self {
    Self {
      extensions: vec![
        "wxml",
        "wxs"
      ]
    }
  }
}

// 
#[async_trait]
impl SourceProcess for XMLProcessor {
  fn get_extesions(&self) -> &Vec<&'static str> {
    &self.extensions
  }

  async fn process(&self, source: &mut Source) -> Result<()> {
    Ok(())
  }
}
