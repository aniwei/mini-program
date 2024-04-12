use std::{ops::{BitAnd, BitOr}, path::{Path, PathBuf}};

use anyhow::*;

/// 资源状态
#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum SourceStateKind {
  Created = 1,
  Loaded = 2,
  Transformed = 4,
  Processed = 8,
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
      // Mounted
      8 => SourceStateKind::Mounted,
      // Created | Mounted | Loaded | Processed
      15 => SourceStateKind::Mounted | SourceStateKind::Processed | SourceStateKind::Loaded | SourceStateKind::Created,
      // Error
      16 => SourceStateKind::Error,
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
      // Created | Loaded
      3 => SourceStateKind::Loaded | SourceStateKind::Created,
      // Processed
      4 => SourceStateKind::Processed,
      // Created | Processed
      5 => SourceStateKind::Processed | SourceStateKind::Created,
      // Created | Loaded | Processed
      7 => SourceStateKind::Processed | SourceStateKind::Loaded | SourceStateKind::Created,
      // Mounted
      8 => SourceStateKind::Mounted,
      // Created | Mounted | Loaded | Processed
      15 => SourceStateKind::Mounted | SourceStateKind::Processed | SourceStateKind::Loaded | SourceStateKind::Created,
      // Error
      16 => SourceStateKind::Error,
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
  pub raw: Option<Vec<u8>>,
  // 原始数据
  pub origin_raw: Option<Vec<u8>>,
  // 
  pub data: Option<T>,
  // 索引
  pub index: usize,
  // 状态
  pub state: SourceStateKind
}

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
      base_path: base_path.to_string(),
      relative_path: relative_path.to_string(),
      absolute_path: absolute_path,
      raw: raw,
      origin_raw: raw,
      data: None,
      index,
      state: SourceStateKind::Created
    }
  }

  // 获取原始数据
  pub fn get_raw(&self) -> Option<&Vec<u8>> {
    match self.raw.as_ref() {
      Some(raw) => Some(raw),
      None => None
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

  pub fn is_loaded (&self) -> bool {
    self.get_state() & SourceStateKind::Loaded == SourceStateKind::Loaded
  }

  pub fn is_processed (&self) -> bool {
    let state = self.get_state() & SourceStateKind::Processed;
    state == SourceStateKind::Processed
  }
}
