use std::path::{PathBuf};
use std::result::Result::Ok;

use crate::AxStartCommand;

#[derive(Default, Debug)]
pub(crate) struct ProjStartArgs {
  pub(crate) port: u32,
  pub(crate) host: String,
  pub(crate) root: Box<PathBuf>,
}

/// 启动参数
impl ProjStartArgs {
  pub fn new() -> Self {
    let mut proj_args = ProjStartArgs::default();

    // 读取环境变量
    if let Ok(port) = std::env::var("PORT").unwrap_or_default().parse::<u32>() {
      proj_args.port = port;
    }

    // 读取当前路径
    if let Ok(root) = std::env::current_dir() {
      proj_args.root = Box::new(root);
    }

    proj_args
  }
}

impl From<AxStartCommand> for ProjStartArgs {
  
  fn from(value: AxStartCommand) -> Self {
    
    let mut proj_args = ProjStartArgs::new();

    /// 处理 host
    if let Some(host) = value.host {
      proj_args.host = host.to_owned();
    }

    /// 处理是否监控文件变化
    if let Some(watch) = value.watch {
      proj_args.root = Box::new(std::env::current_dir().unwrap());
    }

    /// 处理端口
    if let Some(p) = value.port {
      proj_args.port = p.to_owned();
    }

    /// 处理项目路径
    if let Some(root) = value.root {
      proj_args.root = Box::new(PathBuf::from(root.to_owned()));
    }

    proj_args
  }
}