use std::default;
use std::fs::File;
use std::io::prelude::*;
use std::path::PathBuf;
use std::result::Result::Ok;
use anyhow::*;

use crate::AxStartCommand;

#[derive(Default, Debug)]
pub(crate) struct ProjStartArgs {
  pub(crate) port: u32,
  pub(crate) root: Box<PathBuf>,
}

/// 
impl ProjStartArgs {
  pub fn new() -> Self {
    let mut projArgs = ProjStartArgs::default();

    // 读取环境变量
    if let Ok(port) = std::env::var("PORT").unwrap_or_default().parse::<u32>() {
      projArgs.port = port;
    }

    // 读取当前路径
    if let Ok(root) = std::env::current_dir() {
      projArgs.root = Box::new(root);
    }

    projArgs
  }

  fn getWxProj(root: &str) -> Result<ProjStartArgs> {
    Err(Error::msg("Unimpl."))
  }
}

impl From<AxStartCommand> for ProjStartArgs {
  
  fn from(value: AxStartCommand) -> Self {
    
    let mut projArgs = ProjStartArgs::new();

    // 处理端口
    if let Some(p) = value.port {
      projArgs.port = p.to_owned();
    }

    // 处理项目路径
    if let Some(root) = value.root {
      projArgs.root = Box::new(PathBuf::from(root.to_owned()));
    }

    projArgs
  }
}