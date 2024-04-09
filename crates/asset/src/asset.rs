use async_trait::async_trait;
use anyhow::*;
use std::result::Result::Ok;

use crate::{process::AssetProcessorsManager, source::{Source, SourceStateKind}};

#[async_trait]
pub trait Asset {
  // 获取索引
  fn get_index(&self) -> usize {
    self.get_source().index
  }
  // 获取名称
  fn get_name(&self) -> &str {
    self.get_source().relative_path.as_str()
  }
  fn get_extesions<'a>(&'a self) -> Result<&'a str> {
    self.get_source().get_extesions()
  }
  // 获取状态
  fn get_state(&self) -> &SourceStateKind {
    self.get_source().get_state()
  }
  // 获取资源对象
  fn get_source(&self) -> &Source;

  // 获取原始数据
  fn get_raw(&self) -> Option<&Vec<u8>> {
    self.get_source().get_raw()
  }
  // 加载资源
  async fn load(&mut self) -> Result<()> {
    Ok(())
  }
  // 处理资源
  async fn process(&self) -> Result<()> {
    if let Ok(ext) = self.get_extesions() {
      AssetProcessorsManager::shared_instance().process(ext).await;
      return Ok(())
    } else {
      return Err(anyhow!("The resource must specify an extension."))
    }
  }
  // 挂载资源
  async fn mount(&self) -> Result<()> {
    Ok(())
  }
}

/// 图片资源
pub struct Image {
  source: Source
}

impl Image {
  pub fn new(
    relative_path: &str,
    base_path: &str,
    index: usize,
  ) -> Self {
    let source = Source::new(
      relative_path, 
      base_path, 
      None, 
      index
    );

    Self {
      source
    }
  }
}

#[async_trait]
impl Asset for Image {
  // 获取资源对象
  fn get_source(&self) -> &Source {
    &self.source
  }
}

/// XML 资源
pub struct XML {
  source: Source
}

impl XML {
  pub fn new(
    relative_path: &str,
    base_path: &str,
    index: usize,
  ) -> Self {
    let source = Source::new(
      relative_path, 
      base_path, 
      None, 
      index
    );

    Self {
      source
    }
  }
}

#[async_trait]
impl Asset for XML {
  // 获取资源对象
  fn get_source(&self) -> &Source {
    &self.source
  }
}

/// CSS 资源
pub struct CSS {
  source: Source
}

impl CSS {
  pub fn new(
    relative_path: &str,
    base_path: &str,
    index: usize,
  ) -> Self {
    let source = Source::new(
      relative_path, 
      base_path, 
      None, 
      index
    );

    Self {
      source
    }
  }
}

#[async_trait]
impl Asset for CSS {
  // 获取资源对象
  fn get_source(&self) -> &Source {
    &self.source
  }
}

pub enum Assets {
  Image(Image),
  XML(XML),
  CSS(CSS)
}