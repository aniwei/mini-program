use async_trait::async_trait;
use std::result::Result::Ok;
use anyhow::*;

use crate::{Source, SourceStateKind};
use crate::SourceProcessorsManager;

pub mod css;
pub mod image;
pub mod xml;

#[async_trait]
pub trait Asset: Send + Sync {
  // 获取索引
  fn get_index(&self) -> usize {
    self.get_source().index
  }
  // 获取名称
  fn get_name(&self) -> &str {
    self.get_source().relative_path.as_str()
  }
  // 获取扩展名
  fn get_extesions(&self) -> Result<&str> {
    self.get_source().get_extesions()
  }
  // 获取状态
  fn get_state(&self) -> &SourceStateKind {
    self.get_source().get_state()
  }
  // 获取资源对象
  fn get_source<T>(&self) -> &Source<T>;

  // 获取资源对象
  fn get_mut_source<T>(&mut self) -> &mut Source<T>;

  // 获取原始数据
  fn get_raw(&self) -> Option<&Vec<u8>> {
    self.get_source().get_raw()
  }

  // 设置原始数据，同时设置状态为已加载
  fn set_raw(&mut self, raw: Vec<u8>) {
    let mut source = self.get_mut_source();

    source.raw = Some(raw);
    source.state = source.state | SourceStateKind::Loaded;
  }

  // 加载资源
  async fn load(&mut self) -> Result<()> {
    Ok(())
  }

  async fn process(&mut self) -> Result<()> {
    let ext = match self.get_extesions() {
      Ok(ext) => ext.to_string(), // 将结果转换为 String 来结束生命周期依赖
      Err(_) => return Err(anyhow!("The resource must specify an extension.")),
    };

    let source = self.get_mut_source();
    // 执行异步处理，现在 source 的借用仅在这个作用域中
    SourceProcessorsManager::shared_instance().process(&ext, source).await;
    // 更新状态
    source.state = source.state | SourceStateKind::Processed;
  

    Ok(())
  }

  // 挂载资源
  async fn mount(&self) -> Result<()> {
    Ok(())
  }
}


// 内存资源
pub trait MemoryAsset {
  fn load(&mut self) -> Result<()>;
}
  
// 文件资源
pub trait FileAsset {
  fn load(&mut self) -> Result<()>;
}


pub enum Assets {
  Image(image::Image),
  XML(xml::XML),
  CSS(css::CSS)
}