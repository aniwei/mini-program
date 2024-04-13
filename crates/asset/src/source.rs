use std::{borrow::Borrow, ops::{BitAnd, BitOr}, path::{Path, PathBuf}, sync::Arc};
use anyhow::*;

/// 资源状态
#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum SourceStateKind {
  Created = 1,
  Loaded = 2,
  Processed = 4,
  Transformed = 8,
  Mounted = 16,
  Error = 32
}

// 重载位运算符
impl BitOr for SourceStateKind {
  type Output = Self;

  fn bitor(self, rhs: Self) -> Self {
    let mut state = self as u8 | rhs as u8;
    state = state as u8;

    match state {
      // Created
      1 => SourceStateKind::Created,
      // Loaded
      2 => SourceStateKind::Loaded,
      // Created | Loaded
      3 => SourceStateKind::Loaded | SourceStateKind::Created,
      // Processed
      4 => SourceStateKind::Processed,
      // Created | Processed
      5 => SourceStateKind::Processed | SourceStateKind::Created,
      // Created | Loaded | Processed 
      7 => SourceStateKind::Processed | SourceStateKind::Loaded | SourceStateKind::Created,
      // Transformed
      8 => SourceStateKind::Transformed,
      // Created | Loaded | Processed | Transformed
      15 => SourceStateKind::Transformed | SourceStateKind::Processed | SourceStateKind::Loaded | SourceStateKind::Created,
      // Mounted
      16 => SourceStateKind::Mounted,
      // Mounted | Created | Loaded | Processed | Transformed
      31 => SourceStateKind::Mounted | SourceStateKind::Transformed | SourceStateKind::Processed | SourceStateKind::Loaded | SourceStateKind::Created,
      // Error
      32 => SourceStateKind::Error,
      _ => SourceStateKind::Error
    }
  }
}

// 位与
impl BitAnd for SourceStateKind {
  type Output = Self;

  fn bitand(self, rhs: Self) -> Self {
    let mut state = self as u8 & rhs as u8;
    state = state as u8;

    match state {
      // Created
      1 => SourceStateKind::Created,
      // Loaded
      2 => SourceStateKind::Loaded,
      // Processed
      4 => SourceStateKind::Processed,
      // Mounted
      8 => SourceStateKind::Transformed,
      // Mounted
      16 => SourceStateKind::Mounted,
      // Error
      32 => SourceStateKind::Error,
      _ => SourceStateKind::Error
    }
  }
}

/// 资源结构
pub struct Source<T> {
  // 基础路径
  pub base_path: String,

  // 相对路径
  pub relative_path: String,
  
  // 绝对路径
  pub absolute_path: PathBuf,
  
  // 原始数据
  pub raw: Option<Arc<Vec<u8>>>,
  
  // 转换数据
  pub transformed_raw: Option<Arc<Vec<u8>>>,

  // 转换数据
  pub obj: Option<Arc<T>>,
  
  // 索引
  pub index: usize,
  
  // 状态
  pub state: SourceStateKind
}

// 实现资源结构
impl <T> Source<T> {
  // 创建资源
  pub fn new(
    relative_path: &str,
    base_path: &str,
    raw: Option<Vec<u8>>,
    index: usize,
  ) -> Self {
    let absolute_path = Path::new(base_path).join(relative_path);

    Self {
      index,
      base_path: base_path.to_string(),
      relative_path: relative_path.to_string(),
      absolute_path: absolute_path,
      raw: raw,
      transformed_raw: None,
      obj: None,
      state: SourceStateKind::Created
    }
  }

  // 设置原始数据
  pub fn set_raw(&mut self, raw: Vec<u8>) {
    // 如果原始数据不为空
    if let Some(origin_raw) = self.raw {
      // 如果原始数据不等于新数据
      if origin_raw.borrow() != raw {
        self.state = SourceStateKind::Created;
        // 重置数据
        self.obj = None;
        self.transformed_raw = None;
      }
    }

    // 设置原始数据
    self.raw = Arc::new(Some(raw));

    // 设置原始数据
    self.state = self.state | SourceStateKind::Loaded;
  }

  // 设置转换数据
  pub fn set_transformed_raw(&mut self, transformed: Vec<u8>) {
    self.transformed_raw = Arc::new(Some(transformed));
    self.state = self.state | SourceStateKind::Transformed;
  }

  // 设置资源对象
  pub fn set_obj(&mut self, obj: T) {
    self.obj = Arc::new(Some(obj));
    self.state = self.state | SourceStateKind::Processed;
  }

  // 加载资源
  pub fn mount(&mut self) -> Result<()> {
    if self.state >= SourceStateKind::Processed {
      self.state = self.state | SourceStateKind::Mounted;
      return Ok(())
    } else {
      return Err(anyhow!("The resource must be transformed before it can be mounted."))
    }
  }

  //
  pub fn get_obj(&self) -> Option<&T> {
    match self.obj.as_ref() {
      Some(obj) => Some(obj.borrow()),
      None => None
    }
  }

  // 获取原始数据
  pub fn get_raw(&self) -> Option<&Vec<u8>> {
    match self.raw.as_ref() {
      Some(raw) => Some(raw.borrow()),
      None => None
    }
  }

   // 获取资源对象
   pub fn get_transformed_raw(&self) -> Option<&Vec<u8>> where T: AsRef<[u8]>{
    if self.is_mouted() {
      match self.transformed_raw.as_ref() {
        Some(raw) => Some(raw.borrow()),
        None => None
      }
    } else {
      None
    }
  }

  // 设置原始数据
  pub fn get_state(&self) -> &SourceStateKind {
    &self.state
  }

  // 获取索引
  pub fn get_index(&self) -> usize {
    self.index
  }

  // 获取扩展名
  pub fn get_extesions(&self) -> Result<&str> {
    if let Some(ext) = self.absolute_path.extension() {
      if let Some(ext) = ext.to_str() {
        return Ok(ext)
      }
    }

    Err(anyhow!("The resource must specify an extension."))
  }

  // 获取名称
  pub fn get_name(&self) -> Result<&str> {
    if let Some(file_name) = self.absolute_path.file_name() {
      if let Some(file_name) = file_name.to_str() {
        return Ok(file_name)
      }
    }

    Err(anyhow!("The resource must specify a filename."))
  }

  // 判断资源是否已加载
  pub fn is_loaded (&self) -> bool {
    self.get_state() & SourceStateKind::Loaded == SourceStateKind::Loaded
  }

  // 判断资源是否已处理
  pub fn is_processed (&self) -> bool {
    let state = self.get_state() & SourceStateKind::Processed;
    state == SourceStateKind::Processed
  }

  // 判断资源是否已转换
  pub fn is_transformed (&self) -> bool {
    let state = self.get_state() & SourceStateKind::Transformed;
    state == SourceStateKind::Transformed
  }

  // 判断资源是否已挂载
  pub fn is_mouted (&self) -> bool {
    let state = self.get_state() & SourceStateKind::Mounted;
    state == SourceStateKind::Mounted
  }
}
