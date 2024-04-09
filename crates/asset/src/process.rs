
use std::{collections::HashMap, rc::Rc, sync::{Arc, Once}};
use async_trait::async_trait;
use tokio::sync::Mutex;
use anyhow::*;

// 定义类型别名
type AssetProcessorMap = HashMap<&'static str, Arc<dyn AssetProcess + Send + Sync>>;

static ASSET_PROCESSORS_INIT: Once = Once::new();
static mut ASSET_PROCESSORS_INSTANCE: Option<AssetProcessorsManager> = None;


#[async_trait]
pub trait AssetProcess {
  fn get_extesions(&self) -> &Vec<&'static str>;
  async fn process(&self) -> Result<()>;
}

/// 资源处理器
/// XMLProcessor 处理 wxml 文件
#[derive(Clone)]
pub struct XMLProcessor {
  extensions: Vec<&'static str>
}

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

#[async_trait]
impl AssetProcess for XMLProcessor {
  fn get_extesions(&self) -> &Vec<&'static str> {
    &self.extensions
  }

  async fn process(&self) -> Result<()> {
    Ok(())
  }
}

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

  async fn process(&self) -> Result<()> {
    Ok(())
  }
}

/// ImageProcessor 处理图片文件
pub struct ImageProcessor {
  extensions: Vec<&'static str>
}

impl ImageProcessor {
  pub fn new() -> Self {
    Self {
      extensions: vec![
        "png", 
        "jpg", 
        "jpeg"
      ]
    }
  }
}

#[async_trait]
impl AssetProcess for ImageProcessor {
  fn get_extesions(&self) -> &Vec<&'static str> {
    &self.extensions
  }

  async fn process(&self) -> Result<()> {
    Ok(())
  }
}

/// 资源处理管理器
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
        instance.register(Arc::new(XMLProcessor::new()));
        instance.register(Arc::new(CSSProcessor::new()));
        instance.register(Arc::new(ImageProcessor::new()));

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

  pub async fn process(&self, ext: &str) -> Result<()> {
    let processor = self.get_processor(ext).await?;

    if let Some(processor) = processor {
      processor.process().await?;
      Ok(())
    } else {
      Err(Error::msg("Unsupported asset type"))
    }
  }
}


