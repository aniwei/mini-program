use std::{collections::HashMap, sync::{Arc, Once}};
use async_trait::async_trait;
use tokio::sync::Mutex;
use anyhow::*;

use crate::Asset;

pub mod css;
pub mod image;
pub mod xml;

// 定义类型别名
type AssetProcessorMap = HashMap<&'static str, Arc<dyn AssetProcess + Send + Sync>>;

static ASSET_PROCESSORS_INIT: Once = Once::new();
static mut ASSET_PROCESSORS_INSTANCE: Option<AssetProcessorsManager> = None;

#[async_trait]
pub trait AssetProcess {
  fn get_extesions(&self) -> &Vec<&'static str>;
  async fn process<T: Asset + ?Sized>(&self, asset: &mut T) -> Result<()>;
}


pub struct AssetProcessorsManager {
    processors: Mutex<AssetProcessorMap>
  }
  
  impl AssetProcessorsManager {
    pub fn new() -> Self {
      Self {
        processors: Mutex::new(HashMap::new())
      }
    }
  
    /// 获取单例
    pub fn shared_instance() -> &'static AssetProcessorsManager {
      unsafe {
        ASSET_PROCESSORS_INIT.call_once(|| {
          let mut instance = Self::new();
  
          // 注册资源处理器
          instance.register(Arc::new(xml::XMLProcessor::new()));
          instance.register(Arc::new(css::CSSProcessor::new()));
          instance.register(Arc::new(image::ImageProcessor::new()));
  
          ASSET_PROCESSORS_INSTANCE = Some(instance);  
        });
  
        ASSET_PROCESSORS_INSTANCE.as_ref().unwrap()
      }
    }
  
    pub async fn register <T> (&mut self, processor: Arc<T>) -> Result<()> where T: AssetProcess + Sync + Send + 'static {
      let mut processors = self.processors.lock().await;
  
      for ext in processor.get_extesions() {
        processors.insert(ext, processor.clone());
      }
  
      Ok(())
    }
  
    pub async fn get_processor(&self, ext: &str) -> Result<Option<Arc<dyn AssetProcess + Send + Sync>>> {
      let processors = self.processors.lock().await;
      let processor = processors.get(ext).map(|processor| processor.clone());
  
      if processor.is_some() {
        return Ok(processor.clone())
      }
  
      Ok(None)
    }
  
    pub async fn process<T: Asset + ?Sized>(&self, ext: &str, asset: &mut T) -> Result<()> {
      let processor = self.get_processor(ext).await?;
  
      if let Some(processor) = processor {
        processor.process(asset).await?;
        Ok(())
      } else {
        Err(Error::msg("Unsupported asset type"))
      }
    }
  }
  
  
  