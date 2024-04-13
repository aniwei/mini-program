use std::{collections::HashMap, sync::{Arc, Once}};
use anyhow::*;
use std::result::Result::Ok;

use crate::SourceProcess;
use crate::process::{xml, css, image, json};
use crate::source::Source;


static SOURCE_PROCESSORS_INIT: Once = Once::new();
static mut SOURCE_PROCESSORS_INSTANCE: Option<SourceProcessorsManager> = None;

// 定义类型别名
type SourceProcessorMap = HashMap<&'static str, Arc<dyn SourceProcess + Send + Sync>>;


/// 资源处理器管理器
pub struct SourceProcessorsManager {
  processors: SourceProcessorMap
}
  
impl SourceProcessorsManager {
  pub fn new() -> Self {
    Self {
      processors: HashMap::new()
    }
  }

  // 获取单例
  // pub fn shared_instance() -> &'static SourceProcessorsManager {
  //   unsafe {
  //     SOURCE_PROCESSORS_INIT.call_once(|| {
  //       let mut instance = Self::new();

  //       // 注册资源处理器
  //       instance.register(Arc::new(xml::XMLProcessor::new()));
  //       instance.register(Arc::new(css::CSSProcessor::new()));
  //       instance.register(Arc::new(image::ImageProcessor::new()));
  //       instance.register(Arc::new(json::JSONProcessor::new()));

  //       SOURCE_PROCESSORS_INSTANCE = Some(instance);  
  //     });

  //     SOURCE_PROCESSORS_INSTANCE.as_ref().unwrap()
  //   }
  // }

  // // 注册资源处理器
  // pub fn register <T> (&mut self, processor: Arc<T>) -> () where T: SourceProcess + Sync + Send + 'static {
  //   let processors = &mut self.processors;

  //   for ext in processor.get_extesions() {
  //     processors.insert(ext, processor.clone());
  //   }
  // }

  // // 获取资源处理器
  // pub async fn get_processor(&self, ext: &str) -> Result<Option<Arc<dyn SourceProcess + Send + Sync>>> {
  //   let processors = &self.processors;
  //   let processor = processors.get(ext).map(|processor| processor.clone());

  //   if processor.is_some() {
  //     return Ok(processor.clone())
  //   }

  //   Ok(None)
  // }

  // // // 处理资源
  // pub async fn process<T>(
  //   &self, 
  //   ext: &str, 
  //   asset: &mut Source<T>
  // ) -> Result<()> {
  //   // 获取处理器
  //   let processor = self.get_processor(ext).await?;

  //   if let Some(processor) = processor {
  //     processor.process(asset).await?;
  //     return Ok(())
  //   } else {
  //     Err(Error::msg("Unsupported source type."))
  //   }
  // }
}
